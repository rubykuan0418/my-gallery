'use strict';
/* AI：每個人用自己的金鑰，直接從手機呼叫，金鑰只存在這支手機裡。 */
const AI = (() => {
  const PROVIDERS = {
    gemini: { name: 'Gemini', model: 'gemini-2.5-flash', keyHint: 'AQ. 或 AIza 開頭', audio: true },
    claude: { name: 'Claude', model: 'claude-sonnet-4-5', keyHint: 'sk-ant- 開頭', audio: false },
    openai: { name: 'ChatGPT', model: 'gpt-4o-mini', keyHint: 'sk- 開頭', audio: false }
  };

  const GEMINI_FALLBACK = ['gemini-flash-latest', 'gemini-2.5-flash-lite', 'gemini-flash-lite-latest'];

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
    if (/ACCESS_TOKEN_TYPE_UNSUPPORTED/i.test(JSON.stringify(body || {}))) return 'Google 暫時不接受這種新格式的金鑰。請到 AI Studio 再建立一把新的金鑰試試看。';
    if (status === 401 || status === 403) return '金鑰無法使用（可能貼錯，或還沒開通）。請到設定檢查。';
    if (status === 404) return '找不到這個 AI 模型，可以到設定的「進階」換一個模型名稱。';
    if (status === 429) return 'AI 使用次數暫時用完了（免費額度有上限），稍後會再自動試一次。';
    if (status >= 500) return 'AI 服務暫時忙碌，稍後會再自動試一次。';
    return 'AI 暫時無法回覆' + (msg ? '：' + msg : '');
  }
  function withCode(status, body) {
    const msg = (body && body.error && (body.error.status || body.error.message)) || '';
    return friendlyError(status, body) + `（代碼 ${status}${msg ? '・' + String(msg).slice(0, 80) : ''}）`;
  }

  // 每次呼叫最多等 45 秒，超過就先跳過，之後再試
  async function tFetch(url, opts, ms = 45000) {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), ms);
    try { return await fetch(url, { ...opts, signal: ctl.signal }); }
    catch (e) { if (e.name === 'AbortError') { const err = new Error('AI 回應太久，先跳過這張，稍後會再自動試一次。'); err.code = 'timeout'; throw err; } throw e; }
    finally { clearTimeout(t); }
  }
  async function netFetch(url, opts) {
    try { return await tFetch(url, opts); }
    catch (e) { if (e.code === 'timeout') throw e; const err = new Error('連不上 AI 服務（Load failed）。請確認網路正常；如果一直出現，可以到設定改用其他 AI。'); err.code = 'network'; throw err; }
  }

  /* 主要的 AI 卡住（忙碌、太慢、連不上、額度用完）時，自動改用另一把已設定的金鑰 */
  const state = { lastProvider: null };
  async function call(settings, opts) {
    const main = settings.provider || 'gemini';
    const keys = settings.keys || {};
    let order = [main, ...Object.keys(PROVIDERS).filter(k => k !== main && keys[k])];
    if (opts.audioB64) order = order.filter(k => PROVIDERS[k].audio && keys[k]);
    if (opts.noFallback) order = [main];
    if (!order.length) { const e = new Error(opts.audioB64 ? '語音轉文字需要 Gemini 金鑰' : '還沒有設定 AI 金鑰'); e.code = 'nokey'; throw e; }
    if (settings.lang === 'en') {
      opts = { ...opts, system: opts.system === SYS ? SYS_EN : opts.system,
        text: opts.text + (opts.audioB64 ? '\n\nTranscribe exactly what is said, in the language spoken.' : '\n\nLANGUAGE RULE: The user reads English. Write every free-text value (titles, names, museum, city, medium, descriptions, notes, tips, labels, DNA words) in natural, warm English. Use English names for titles, artists, museums and cities, and put original-language names in the *Original fields. Keep JSON keys unchanged, and keep enum values (photoType, subjects, aspect, confidence) EXACTLY as the listed Chinese options.') };
    }
    let lastErr;
    for (let i = 0; i < order.length; i++) {
      try { const r = await callOne(settings, order[i], { ...opts, hasBackup: i < order.length - 1 }); state.lastProvider = order[i]; return ZH.deep(r); }
      catch (e) {
        lastErr = e;
        const switchable = e.code === 'timeout' || e.code === 'network' || e.status === 429 || e.status >= 500 || e.status === 401 || e.status === 403;
        if (!switchable || e.code === 'offline') throw e;
      }
    }
    throw lastErr;
  }

  async function callOne(settings, p, { system, text, imageB64, audioB64, audioMime, json = true, maxTokens = 1800, hasBackup = false }) {
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
      const payload = JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts }], generationConfig: { temperature: 0.4, maxOutputTokens: Math.max(maxTokens * 3, 4096), ...(json ? { responseMimeType: 'application/json' } : {}) } });
      // 模型忙碌（503/500/429）時，稍等再試，並自動換備用模型
      const models = [...new Set([model, ...GEMINI_FALLBACK])].slice(0, hasBackup ? 2 : 4); // 有備用 AI 時，少試幾次就換過去
      for (let i = 0; i < models.length; i++) {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(models[i])}:generateContent`;
        // 先用「簡單請求」（不帶自訂標頭，Safari 比較不會擋），失敗再改用標頭帶金鑰
        try { res = await tFetch(url + '?key=' + encodeURIComponent(key), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: payload }); }
        catch (e1) {
          if (e1.code === 'timeout') { if (i === models.length - 1) throw e1; continue; }
          res = await netFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key }, body: payload });
        }
        body = await res.json().catch(() => ({}));
        if (res.ok) break;
        const busy = res.status >= 500 || res.status === 429 || res.status === 404;
        if (!busy || i === models.length - 1) break;
        await new Promise(r => setTimeout(r, 1200));
      }
      if (!res.ok) { const e = new Error(withCode(res.status, body)); e.status = res.status; throw e; }
      const out = (((body.candidates || [])[0] || {}).content || {}).parts || [];
      const t = out.map(x => x.text || '').join('');
      return json ? parseJSON(t) : t;
    }
    if (p === 'claude') {
      const content = [];
      if (imageB64) content.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: imageB64 } });
      content.push({ type: 'text', text: text + (json ? '\n\n只回傳 JSON，不要其他文字。' : '') });
      res = await netFetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: 'user', content }] })
      });
      body = await res.json().catch(() => ({}));
      if (!res.ok) { const e = new Error(withCode(res.status, body)); e.status = res.status; throw e; }
      const t = (body.content || []).map(x => x.text || '').join('');
      return json ? parseJSON(t) : t;
    }
    // openai
    const content = [{ type: 'text', text }];
    if (imageB64) content.push({ type: 'image_url', image_url: { url: 'data:image/jpeg;base64,' + imageB64 } });
    res = await netFetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
      body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'system', content: system }, { role: 'user', content }], ...(json ? { response_format: { type: 'json_object' } } : {}) })
    });
    body = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(withCode(res.status, body)); e.status = res.status; throw e; }
    const t = ((body.choices || [])[0] || {}).message?.content || '';
    return json ? parseJSON(t) : t;
  }

  const SYS_EN = 'You are a warm, knowledgeable museum guide and art historian. Answer in clear, natural English, gently and without lecturing. Never make things up when unsure.';
  const SYS = '你是一位溫暖、知識豐富的美術館導覽員與藝術史研究者。一律使用台灣繁體中文與台灣慣用譯名回答（例如：佛羅倫斯、達文西、波提且利、梵谷、林布蘭、維梅爾、杜勒、德勒斯登、義大利、美術館），絕對不要使用簡體字或中國大陸的譯名與用語。中文譯名要完整翻成中文，不要中英混雜（例如 Hampstead 寫「漢普斯特德」）；人名只寫姓氏或常用譯名（例如「透納」，不要寫「J・M・W・透納」），美術館用台灣常用名稱（例如 Tate Britain 是「泰特不列顛美術館」）。語氣溫和、不說教。不確定的事情絕對不要編造。';

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
 "museumOriginal": 美術館的原文名稱（例如 Galleria degli Uffizi、Alte Pinakothek）或 null,
 "city": 城市的繁體中文名稱或 null,
 "title": 作品繁體中文名稱。認不出名作時，用描述性的名稱，例如「街角的藍色彩繪磁磚」,
 "titleOriginal": 作品的原文名稱（例如義大利文、德文、法文原名；不確定原文時用通用的英文名稱）。描述性名稱的街頭物件填 null,
 "artist": 藝術家繁體中文譯名，不知道填 null,
 "artistOriginal": 藝術家的原文全名（例如 Sandro Botticelli、Albrecht Dürer）；不知道作者填 null,
 "year": 年代（例如「約 1470」），不知道填 null,
 "medium": 媒材，不知道填 null,
 "confidence": "high" | "medium" | "low"（對作品身分的把握）,
 "isCopy": 只有當它是複製品、印刷品、老照片時填 true（藝術家親手做的仿古作品不算）,
 "short": ${len}的解說，說這件作品在畫什麼、為什麼值得看。街頭的東西就描述它的風格、材質和可能的年代,
 "long": 4 到 6 句、更完整的解說,
 "lookFor": 站在作品前「可以留心觀賞的重點」，${settings.length === 'deep' ? '3 到 4' : '2 到 3'} 點，每點是 {"aspect": 從 ["用色","線條","構圖","光線","筆觸","細節","材質","象徵","歷史背景","畫家心境"] 選一個, "text": 一到兩句具體的觀看提示，告訴她眼睛要看哪裡、會發現什麼}。要具體到這件作品（例如「看維納斯腳下的貝殼邊緣…」），不要空泛。街頭物件就提示它的材質、做工或所在環境,
 "labelText": 如果是說明牌，用繁體中文摘要上面的重點，否則 null,
 "dims": {"brightness":1到5(1很明亮,5很沉穩),"warmth":1到5(1很冷,5很暖),"line":1到5(1流動有機,5幾何結構),"form":1到5(1寫實,5抽象平面),"mood":1到5(1寧靜,5熱烈),"ornament":1到5(1簡約,5繁複)},
 "subjects": 從 ["人物","自然","神話與宗教","日常生活","城市","建築","裝飾與工藝","動物"] 選 1 到 3 個
}
規則：說明牌上的文字比畫面猜測更可信；如果是說明牌，title 等欄位依說明牌填寫。認不出時 confidence 用 low，不要硬猜名作。`;
    return call(settings, { system: SYS, text, imageB64 });
  }

  function lookFor(settings, { title, titleOriginal, artist, artistOriginal, year, medium, isStreet, short }) {
    const n = settings.length === 'deep' ? '3 到 4' : '2 到 3';
    const text = `作品：${title}${titleOriginal ? '（' + titleOriginal + '）' : ''}
藝術家：${artist || '不明'}${artistOriginal ? '（' + artistOriginal + '）' : ''}　年代：${year || '不明'}　媒材：${medium || '不明'}
${short ? '簡介：' + short : ''}
請寫出站在${isStreet ? '它' : '這件作品'}前「可以留心觀賞的重點」，${n} 點。
回傳 JSON：{"lookFor":[{"aspect": 從 ["用色","線條","構圖","光線","筆觸","細節","材質","象徵","歷史背景","畫家心境"] 選一個, "text": 一到兩句具體的觀看提示，告訴她眼睛要看哪裡、會發現什麼}]}
要具體到這件作品，不要空泛；不確定的事情不要編造。`;
    return call(settings, { system: SYS, text, maxTokens: 700 });
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
"closest":[{"artist":"她收藏裡最像她的藝術家(繁中)","artistOriginal":"原文名字","why":"一句話"} 最多3位],
"recs":[{"artist":"她還沒收藏、可能會喜歡的藝術家(繁中)","artistOriginal":"原文","why":"一句話為什麼推薦","where":"在哪個美術館看得到"} 3位],
"surprise":{"title":"收藏裡最不像她的一件作品名稱","text":"一句溫暖的話"}}`;
    return call(settings, { system: SYS, text, maxTokens: 1500 });
  }

  async function testKey(settings) {
    const r = await call(settings, { system: '你是測試助手。', text: '請回傳 JSON：{"ok":true}', maxTokens: 50, noFallback: true });
    return !!r;
  }

  return { PROVIDERS, state, lookFor, analyzePhoto, transcribe, artistDna, aestheticDna, testKey };
})();
