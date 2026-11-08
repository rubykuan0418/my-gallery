'use strict';
/* AI：每個人用自己的金鑰，直接從手機呼叫，金鑰只存在這支手機裡。 */
const AI = (() => {
  const PROVIDERS = {
    gemini: { name: 'Gemini', model: 'gemini-flash-latest', keyHint: 'AIza 開頭', audio: true },
    claude: { name: 'Claude', model: 'claude-sonnet-4-5', keyHint: 'sk-ant- 開頭', audio: false },
    openai: { name: 'ChatGPT', model: 'gpt-4o-mini', keyHint: 'sk- 開頭', audio: false }
  };

  function parseJSON(text) {
    if (!text) throw new Error('AI 沒有回覆內容');
    const t = text.replace(/```json|```/g, '').trim();
    try { return JSON.parse(t); } catch (e) { /* fallthrough */ }
    const a = t.indexOf('{'), b = t.lastIndexOf('}');
    if (a >= 0 && b > a) return JSON.parse(t.slice(a, b + 1));
    throw new Error('AI 回覆的格式看不懂');
  }

  function friendlyError(status, body) {
    const msg = (body && (body.error && (body.error.message || body.error.type))) || '';
    if (status === 400 && /API key|api_key|API_KEY/i.test(msg)) return '金鑰好像不正確，請到設定重新貼一次。';
    if (status === 401 || status === 403) return '金鑰無法使用（可能貼錯，或還沒開通）。請到設定檢查。';
    if (status === 404) return '找不到這個 AI 模型，可以到設定的「進階」換一個模型名稱。';
    if (status === 429) return 'AI 使用次數暫時用完了（免費額度有上限），稍後會再自動試一次。';
    if (status >= 500) return 'AI 服務暫時忙碌，稍後會再自動試一次。';
    return 'AI 暫時無法回覆' + (msg ? '：' + msg : '');
  }

  async function call(settings, { system, text, imageB64, audioB64, audioMime, json = true, maxTokens = 1800 }) {
    const p = settings.provider || 'gemini';
    const key = (settings.keys || {})[p];
    if (!key) { const e = new Error('還沒有設定 AI 金鑰'); e.code = 'nokey'; throw e; }
    if (!navigator.onLine) { const e = new Error('目前沒有網路'); e.code = 'offline'; throw e; }
    const model = (settings.models || {})[p] || PROVIDERS[p].model;
    let res, body;
    if (p === 'gemini') {
      const parts = [];
      if (imageB64) parts.push({ inline_data: { mime_type: 'image/jpeg', data: imageB64 } });
      if (audioB64) parts.push({ inline_data: { mime_type: audioMime || 'audio/mp4', data: audioB64 } });
      parts.push({ text });
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts }], generationConfig: { temperature: 0.4, maxOutputTokens: Math.max(maxTokens * 3, 4096), ...(json ? { responseMimeType: 'application/json' } : {}) } })
      });
      body = await res.json().catch(() => ({}));
      if (!res.ok) { const e = new Error(friendlyError(res.status, body)); e.status = res.status; throw e; }
      const out = (((body.candidates || [])[0] || {}).content || {}).parts || [];
      const t = out.map(x => x.text || '').join('');
      return json ? parseJSON(t) : t;
    }
    if (p === 'claude') {
      const content = [];
      if (imageB64) content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageB64 } });
      content.push({ type: 'text', text: text + (json ? '\n\n只回傳 JSON，不要其他文字。' : '') });
      res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: 'user', content }] })
      });
      body = await res.json().catch(() => ({}));
      if (!res.ok) { const e = new Error(friendlyError(res.status, body)); e.status = res.status; throw e; }
      const t = (body.content || []).map(x => x.text || '').join('');
      return json ? parseJSON(t) : t;
    }
    // openai
    const content = [{ type: 'text', text }];
    if (imageB64) content.push({ type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + imageB64 } });
    res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'system', content: system }, { role: 'user', content }], ...(json ? { response_format: { type: 'json_object' } } : {}) })
    });
    body = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(friendlyError(res.status, body)); e.status = res.status; throw e; }
    const t = ((body.choices || [])[0] || {}).message?.content || '';
    return json ? parseJSON(t) : t;
  }

  const SYS = '你是一位溫暖、知識豐富的美術館導覽員與藝術史研究者。一律使用台灣繁體中文回答，語氣溫和、不說教。不確定的事情絕對不要編造。';

  function analyzePhoto(settings, { imageB64, takenAt, placeHint, cityHint, candidates }) {
    const len = settings.length === 'deep' ? '5 到 7 句' : '2 到 3 句';
    const list = candidates.length ? candidates.map(c => `- id=${c.id}｜${c.title}｜${c.artist || '作者不明'}`).join('\n') : '（還沒有）';
    const text = `請分析這張使用者在旅途中拍的照片。
拍攝時間：${new Date(takenAt).toLocaleString('zh-TW')}
可能的地點：${placeHint || '未知'}${cityHint ? '（城市：' + cityHint + '）' : ''}
今天在這個地點已經收藏的作品：
${list}

請回傳 JSON，欄位如下：
{
 "photoType": "作品" | "細節" | "我與作品" | "說明牌" | "館外照" | "複製品" | "其他",
 "sameWorkId": 如果這張拍的是上面清單裡的某一件（包含它的細節、說明牌、或人和它的合照），填那件的 id；否則 null,
 "isStreet": 如果是街頭、戶外、建築、店家或不在美術館展出的東西，填 true,
 "museum": 照片所在美術館或博物館的繁體中文名稱，不確定填 null,
 "museumOriginal": 美術館原文名稱或 null,
 "city": 城市的繁體中文名稱或 null,
 "title": 作品繁體中文名稱。認不出名作時，用描述性的名稱，例如「街角的藍色彩繪磁磚」,
 "titleOriginal": 原文名稱或 null,
 "artist": 藝術家繁體中文譯名，不知道填 null,
 "artistOriginal": 藝術家原文名或 null,
 "year": 年代（例如「約 1470」），不知道填 null,
 "medium": 媒材，不知道填 null,
 "confidence": "high" | "medium" | "low"（對作品身分的把握）,
 "isCopy": 只有當它是複製品、印刷品、老照片時填 true（藝術家親手做的仿古作品不算）,
 "short": ${len}的解說，說這件作品在畫什麼、為什麼值得看。街頭的東西就描述它的風格、材質和可能的年代,
 "long": 4 到 6 句、更完整的解說,
 "labelText": 如果是說明牌，用繁體中文摘要上面的重點，否則 null,
 "dims": {"brightness":1到5(1很明亮,5很沉穩),"warmth":1到5(1很冷,5很暖),"line":1到5(1流動有機,5幾何結構),"form":1到5(1寫實,5抽象平面),"mood":1到5(1寧靜,5熱烈),"ornament":1到5(1簡約,5繁複)},
 "subjects": 從 ["人物","自然","神話與宗教","日常生活","城市","建築","裝飾與工藝","動物"] 選 1 到 3 個
}
規則：說明牌上的文字比畫面猜測更可信；如果是說明牌，title 等欄位依說明牌填寫。認不出時 confidence 用 low，不要硬猜名作。`;
    return call(settings, { system: SYS, text, imageB64 });
  }

  function transcribe(settings, { audioB64, audioMime, workTitle }) {
    return call(settings, { system: SYS, json: false, maxTokens: 600, audioB64, audioMime, text: `這是使用者在看《${workTitle}》時錄下的語音感想。請逐字轉成繁體中文文字，只輸出轉好的文字，不要加任何說明。聽不清楚的地方用「⋯」。` });
  }

  function artistDna(settings, { artist, artistOriginal, works }) {
    const text = `請為藝術家「${artist}${artistOriginal ? '（' + artistOriginal + '）' : ''}」寫一張精簡的「視覺 DNA 卡」，只談藝術風格，不談生平。使用者收藏了他的：${works.join('、')}。
回傳 JSON：{"name":"藝術家英文姓氏大寫，例如 BOTTICELLI","title":"英文短標題，The 開頭，例如 The Graceful Line","tags":["兩個英文風格標籤"],"core":"一句話：核心特色","colors":[{"name":"色名(繁中)","hex":"#RRGGBB"} 共4個],"traits":["最多三點特徵，每點一行"]}`;
    return call(settings, { system: SYS, text, maxTokens: 800 });
  }

  function aestheticDna(settings, { summary, avgDims, subjects, feedback, prevNames }) {
    const text = `以下是使用者收藏的作品（已依喜歡程度排序，越前面越喜歡）：
${summary}
平均維度（1到5）：${JSON.stringify(avgDims)}
常見題材：${subjects.join('、')}
${feedback ? '使用者說過：「' + feedback + '」，請參考。' : ''}
${prevNames && prevNames.length ? '請不要再用這些名稱：' + prevNames.join('、') : ''}
請你扮演這個人的私人策展人兼側寫師，像一位懂她的朋友一樣，溫暖地告訴她她的美感。文字要短、像卡片，不要長篇大論，不要用百分比。
回傳 JSON：
{"name":"8 到 12 個字的美感名稱","tags":["三個英文標籤"],"oneLiner":"一句話說明她被什麼吸引",
"curatorTitle":"策展人筆記的標題，一句話","curatorNote":"2 到 3 句，引用她收藏裡的具體作品當例子",
"dims":{"brightness":"例如 偏沉穩","warmth":"","line":"","form":"","mood":"","ornament":""},
"closest":[{"artist":"她收藏裡最像她的藝術家","why":"一句話"} 最多3位],
"recs":[{"artist":"她還沒收藏、可能會喜歡的藝術家(繁中)","artistOriginal":"原文","why":"一句話為什麼推薦","where":"在哪個美術館看得到"} 3位],
"surprise":{"title":"收藏裡最不像她的一件作品名稱","text":"一句溫暖的話"}}`;
    return call(settings, { system: SYS, text, maxTokens: 1500 });
  }

  async function testKey(settings) {
    const r = await call(settings, { system: '你是測試助手。', text: '請回傳 JSON：{"ok":true}', maxTokens: 50 });
    return !!r;
  }

  return { PROVIDERS, analyzePhoto, transcribe, artistDna, aestheticDna, testKey };
})();
