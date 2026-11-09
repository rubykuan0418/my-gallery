'use strict';
/* ============ My Gallery ============ */
const APP_VERSION = '2026.11.09-21';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, '0');
const ymd = t => { const d = new Date(t); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
const fmtDate = s => { const [y, m, d] = s.split('-').map(Number); const dt = new Date(y, m - 1, d); return `${y}.${pad(m)}.${pad(d)}（${WEEK[dt.getDay()]}）`; };
const fmtTime = t => { const d = new Date(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const norm = s => String(s || '').toLowerCase().replace(/[\s·・'’".,\-()（）]/g, '');
const dist = (a, b) => { if (!a || !b || a.lat == null || b.lat == null) return null; const R = 6371, dLat = (b.lat - a.lat) * Math.PI / 180, dLng = (b.lng - a.lng) * Math.PI / 180; const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); };

const I = {
  back: '<svg class="ic" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg class="ic" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>',
  cam: '<svg class="ic" viewBox="0 0 24 24"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  grid: '<svg class="ic" viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="9" rx="1.5"/><rect x="13" y="4" width="7" height="6" rx="1.5"/><rect x="4" y="15" width="7" height="5" rx="1.5"/><rect x="13" y="12" width="7" height="8" rx="1.5"/></svg>',
  map: '<svg class="ic" viewBox="0 0 24 24"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14"/></svg>',
  set: '<svg class="ic" viewBox="0 0 24 24"><path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h11M19 17h1"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
  pen: '<svg class="ic s" viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>',
  heart: '<svg class="ic" viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  mic: '<svg class="ic" viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>',
  img: '<svg class="ic" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="M21 16l-5-5-8 8"/></svg>',
  pin: '<svg class="ic s" viewBox="0 0 24 24"><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
  sort: '<svg class="ic s" viewBox="0 0 24 24"><path d="M4 7h16M4 12h10M4 17h6M17 14l3 3-3 3"/></svg>',
  dl: '<svg class="ic" viewBox="0 0 24 24"><path d="M12 4v11M7 10l5 5 5-5M5 20h14"/></svg>',
  refresh: '<svg class="ic s" viewBox="0 0 24 24"><path d="M4 12a8 8 0 0 1 14-5l2 2M20 12a8 8 0 0 1-14 5l-2-2M20 4v5h-5M4 20v-5h5"/></svg>',
  share: '<svg class="ic" viewBox="0 0 24 24"><path d="M12 15V4M8 8l4-4 4 4M6 12v7h12v-7"/></svg>',
  zoom: '<svg class="ic" viewBox="0 0 24 24"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 20 20M10.5 7.5v6M7.5 10.5h6"/></svg>',
  trash: '<svg class="ic s" viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>',
  eye: '<svg class="ic s" viewBox="0 0 24 24"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>',
  x: '<svg class="ic" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  star: (c = '#EBD49A', s = 26) => `<svg width="${s}" height="${s}" viewBox="0 0 80 80" aria-hidden="true"><path d="M40 2l9 26 28-3-22 17 12 27-26-15-21 20 5-28L2 34l29-6z" fill="${c}"/></svg>`,
  leaf: (c = '#EBCDC2', w = 90) => `<svg width="${w}" height="${w * 1.45}" viewBox="0 0 100 150" aria-hidden="true"><path d="M50 2c8 10-4 16 6 24 12-6 18 4 10 10-8 4-14 2-14 10 10-2 18 8 8 14-8 4-12-2-16 6 8 2 12 12 2 14-6 0-8-6-12-2 2 10-4 18-10 18-4-10 2-16-6-22-8 4-16-4-8-10 6-4 10 0 12-8-8 0-14-8-6-14 6-4 10 2 12-6-6-4-6-14 2-14 4 0 6 4 8 0-2-8 4-14 12-20z" fill="${c}"/></svg>`,
  blob: (c, s = 26) => `<svg width="${s}" height="${s}" viewBox="0 0 100 100" aria-hidden="true"><path d="M48 6c18 2 34 16 30 36-3 16 10 30-6 40-14 9-26-6-42 0C14 88 2 72 8 56c5-12-6-26 4-38C20 8 34 4 48 6z" fill="${c}"/></svg>`,
  flourish: '<svg class="flourish" width="132" height="14" viewBox="0 0 132 14" aria-hidden="true"><path d="M2 7c18-7 34 7 52 0s22-5 12 0c-10 5 10 5 12 0 4-8 26 6 52 0" fill="none" stroke="#C2A878"/><circle cx="66" cy="7" r="2" fill="none" stroke="#C2A878"/></svg>'
};
const PASTEL = ['#F4E3DD', '#E3EADD', '#F7EDCF', '#E1E8F0', '#F7DFD3'];
const RAD = ['40px 18px 46px 22px', '22px 44px 20px 40px', '46px 24px 30px 50px', '26px 40px 50px 20px', '36px 20px 44px 28px'];
const TYPES = ['作品', '細節', '我與作品', '說明牌', '館外照', '複製品'];
const DIMS = [['brightness', '色彩明度', '明亮', '沉穩'], ['warmth', '色彩溫度', '冷', '暖'], ['line', '線條', '流動', '幾何'], ['form', '形體', '寫實', '抽象'], ['mood', '情緒', '寧靜', '熱烈'], ['ornament', '裝飾性', '簡約', '繁複']];

const DEFAULTS = { lang: 'en', provider: 'gemini', keys: {}, models: {}, length: 'short', name: '', onboarded: false, feedback: '' };
const S = {
  settings: { ...DEFAULTS }, works: [], places: [], photos: [], route: { name: 'home', p: {} }, stack: [],
  ui: { homeView: 'place', favOnly: false, editName: false, photoIdx: 0, sheet: null, showLong: false, editInfo: false, writing: false, ob: 0, obMsg: '', busy: {}, pick: false },
  session: null, queue: [], last: null, toast: '', dna: null, artist: {}, avatarUrl: null, rec: null
};
const URLS = new Map();
function purl(p, kind = 'thumb') {
  if (!p) return '';
  if (p.broken) return BROKEN_IMG;
  const k = p.id + kind;
  if (!URLS.has(k)) { const b = kind === 'thumb' ? (p.thumb || p.blob) : (p.blob || p.thumb); if (!b) return ''; URLS.set(k, URL.createObjectURL(b)); }
  return URLS.get(k);
}

/* ---------- 資料存取 ---------- */
const saveSettings = () => DB.setKV('settings', S.settings);
async function toBuf(b) { return b ? await b.arrayBuffer() : null; }
async function savePhoto(p) {
  if (p.broken) return DB.put('photos', { ...p, blob: null, thumb: null });
  const { blob, thumb, ...rest } = p;
  return DB.put('photos', { ...rest, blobBuf: await toBuf(blob), thumbBuf: await toBuf(thumb), v: 2 });
}
async function saveWork(w) {
  const thoughts = await Promise.all((w.thoughts || []).map(async t => {
    if (!(t.audio instanceof Blob)) return t;
    try { const { audio, ...r } = t; return { ...r, audioBuf: await audio.arrayBuffer(), audioType: audio.type }; } catch (e) { const { audio, ...r } = t; return r; }
  }));
  return DB.put('works', { ...w, thoughts });
}
function revivePhoto(r) {
  if (r.v === 2) { const { blobBuf, thumbBuf, ...p } = r; return { ...p, blob: blobBuf ? new Blob([blobBuf], { type: 'image/jpeg' }) : null, thumb: thumbBuf ? new Blob([thumbBuf], { type: 'image/jpeg' }) : null }; }
  return r;
}
function reviveWork(w) { return { ...w, thoughts: (w.thoughts || []).map(t => t.audioBuf ? (({ audioBuf, ...r }) => ({ ...r, audio: new Blob([audioBuf], { type: t.audioType || 'audio/mp4' }) }))(t) : t) }; }
const BROKEN_IMG = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#EFE8DC"/><text x="100" y="96" font-size="20" text-anchor="middle" fill="#6B5D55" font-family="sans-serif">照片檔案遺失</text><text x="100" y="124" font-size="15" text-anchor="middle" fill="#6B5D55" font-family="sans-serif">可從相簿重新補上</text></svg>');
const savePlace = p => DB.put('places', p);
function photosOf(workId) { return S.photos.filter(p => p.workId === workId).sort((a, b) => a.takenAt - b.takenAt); }
const TYPE_RANK = { '作品': 0, '我與作品': 1, '細節': 2, '館外照': 3, '複製品': 3, '說明牌': 5 };
function orderedPhotos(w) {
  return photosOf(w.id).sort((a, b) => (b.id === w.coverId) - (a.id === w.coverId) || (!!a.broken - !!b.broken) || (TYPE_RANK[a.type] ?? 4) - (TYPE_RANK[b.type] ?? 4) || a.takenAt - b.takenAt);
}
function mainPhoto(w) { const c = w.coverId && S.photos.find(p => p.id === w.coverId && p.workId === w.id && !p.broken); if (c) return c;
  return mainPhotoAuto(w); }
function mainPhotoAuto(w) { const all = photosOf(w.id); const ps = all.filter(p => !p.broken).length ? all.filter(p => !p.broken) : all; return ps.find(p => p.type === '作品') || ps.find(p => p.type === '我與作品') || ps.find(p => p.type === '細節') || ps[0]; }
const placeOf = id => S.places.find(p => p.id === id);
const workOf = id => S.works.find(w => w.id === id);
const worksAt = placeId => S.works.filter(w => w.placeId === placeId);
function lastAt(w) { const ps = photosOf(w.id); return ps.length ? Math.max(...ps.map(p => p.takenAt || 0)) : (w.createdAt || 0); }
function seenDates(w) { return [...new Set(photosOf(w.id).map(p => ymd(p.takenAt)))].sort(); }
function placeLast(pl) {
  // 依照片實際拍攝時間排序（不是匯入的時間）
  let m = 0; worksAt(pl.id).forEach(w => { photosOf(w.id).forEach(p => { m = Math.max(m, p.takenAt || 0); }); });
  S.photos.forEach(p => { if (p.placeId === pl.id) m = Math.max(m, p.takenAt || 0); });
  return m || pl.createdAt || 0;
}
function placeCover(pl) { const c = pl.coverPhotoId && S.photos.find(p => p.id === pl.coverPhotoId && !p.broken); if (c) return c; const ws = worksAt(pl.id).sort((a, b) => lastAt(b) - lastAt(a)); for (const w of ws) { const m = mainPhoto(w); if (m) return m; } return null; }
function visitsOf(placeId) {
  const map = new Map();
  S.photos.forEach(p => {
    const w = p.workId && workOf(p.workId);
    const pid = w ? w.placeId : p.placeId;
    if (pid !== placeId) return;
    const d = ymd(p.takenAt);
    if (!map.has(d)) map.set(d, { date: d, works: new Set(), photos: 0, first: p.takenAt, last: p.takenAt });
    const v = map.get(d); if (w) v.works.add(w.id); v.photos++; v.first = Math.min(v.first, p.takenAt); v.last = Math.max(v.last, p.takenAt);
  });
  return [...map.values()].sort((a, b) => b.last - a.last).map(v => ({ ...v, works: [...v.works].map(workOf).filter(Boolean).sort((a, b) => lastAt(b) - lastAt(a)) }));
}
function allVisits() { return S.places.flatMap(pl => visitsOf(pl.id).map(v => ({ ...v, place: pl }))).sort((a, b) => b.last - a.last); }
function workWeight(w) { const ps = photosOf(w.id); return 1 + (w.fav ? 2 : 0) + ((w.thoughts || []).length ? 1 : 0) + (ps.some(p => p.type === '我與作品') ? 0.8 : 0) + (ps.length >= 3 ? 0.4 : 0) + (seenDates(w).length > 1 ? 1 : 0); }
const origOf = (zh, o) => (o && norm(o) !== norm(zh) ? o : '');
const titleSub = w => { const o = origOf(w.title, w.titleOriginal); return o ? `<span class="orig">${esc(o)}</span>` : ''; };
const LATIN = /^[\x00-\u024f\u1e00-\u1eff\s.,'’·-]+$/;
const artistHtml = (w, empty = '作者不明') => { if (w.status === 'pending' && !hasAI() && !w.artist) return ''; let o = origOf(w.artist, w.artistOriginal); if (o && I18N.lang === 'en' && LATIN.test(o) && LATIN.test(w.artist || '')) o = ''; return esc(w.artist || (o ? '' : empty)) + (o ? `${w.artist ? ' ' : ''}<span class="orig-i">${esc(o)}</span>` : ''); };
const hasAI = () => Object.values(S.settings.keys || {}).some(Boolean);
const untitled = () => tt('Untitled', '未命名作品');
const eligible = () => S.works.filter(w => w.status === 'ready' && !w.isCopy && w.dims);

/* ---------- 導覽 ---------- */
function go(name, p = {}) { S.stack.push(S.route); S.route = { name, p }; resetUi(); render(); scrollTo(0, 0); }
function tab(name) { S.stack = []; S.route = { name, p: {} }; resetUi(); render(); scrollTo(0, 0); }
function back() { S.route = S.stack.pop() || { name: 'home', p: {} }; resetUi(); render(); scrollTo(0, 0); }
function resetUi() { Object.assign(S.ui, { editThought: null, sheet: null, showLong: false, editInfo: false, writing: false, photoIdx: 0, editName: false, pick: false, renamePlace: false }); }
function ask(msg, okText = '確定', danger = true) {
  return new Promise(res => {
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="scrim" style="z-index:60"></div><div class="dialog" role="alertdialog" aria-modal="true"><p style="margin:0 0 16px;line-height:1.7">${esc(I18N.tr(msg))}</p><div class="row"><button class="btn grow" data-r="0">取消</button><button class="btn solid grow" data-r="1" style="${danger ? 'background:var(--accent)' : ''}">${esc(L(okText))}</button></div></div>`;
    document.body.appendChild(wrap);
    wrap.addEventListener('click', e => { const b = e.target.closest('[data-r]'); if (!b && !e.target.classList.contains('scrim')) return; e.stopPropagation(); wrap.remove(); res(!!(b && b.dataset.r === '1')); });
  });
}
let toastTimer;
function toast(msg, ms = 3200) { S.toast = msg; renderToast(); clearTimeout(toastTimer); toastTimer = setTimeout(() => { S.toast = ''; renderToast(); }, ms); }
function renderToast() { let el = $('#toast'); if (!S.toast) { if (el) el.remove(); return; } if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); el.onclick = () => { S.toast = ''; renderToast(); }; document.body.appendChild(el); } el.textContent = I18N.tr(S.toast); }

/* ---------- 畫面 ---------- */
function nav(active) {
  return `<nav class="nav" aria-label="主要導覽"><div class="nav-in">
  <button class="${active === 'home' ? 'on' : ''}" data-act="tab" data-to="home" ${active === 'home' ? 'aria-current="page"' : ''}>${I.grid}畫廊</button>
  <button class="shoot" data-act="openCamera" aria-label="拍照">${I.cam}</button>
  <button class="${active === 'dna' ? 'on' : ''}" data-act="tab" data-to="dna" ${active === 'dna' ? 'aria-current="page"' : ''}><span class="navav">${avatarHtml(30)}</span>我的美感</button>
  </div></nav>`;
}
function avatarHtml(size) {
  const ring = 'conic-gradient(' + ((S.dna && S.dna.palette && S.dna.palette.length === 5) ? S.dna.palette : ['#282221', '#DAD4C8', '#7A7062', '#6A4138', '#B77664']).map((c, i) => `${c} ${i * 20}% ${(i + 1) * 20}%`).join(',') + ')';
  const inner = size - 8;
  const face = S.avatarUrl ? `<img class="avatar" src="${S.avatarUrl}" alt="" style="width:${inner}px;height:${inner}px">` : `<span class="serif ring" style="width:${inner}px;height:${inner}px;background:var(--pink);font-size:${Math.round(size * 0.4)}px">${esc((S.settings.name || '我').slice(0, 1).toUpperCase())}</span>`;
  return `<span class="ring" style="width:${size}px;height:${size}px;background:${ring}">${face}</span>`;
}
function galleryTitle() { return S.settings.name ? `${S.settings.name} 的畫廊` : '我的畫廊'; }

function viewHome() {
  const n = S.works.length, np = S.places.length;
  const pending = S.works.filter(w => w.status === 'pending').length;
  const todayVisit = S.session && ymd(S.session.lastAt) === ymd(Date.now()) ? placeOf(S.session.placeId) : null;
  let h = `<main class="screen"><div style="position:absolute;right:46px;top:0;opacity:.75;pointer-events:none">${I.leaf()}</div>
  <div class="row" style="justify-content:space-between;align-items:flex-start;position:relative">
  <div class="grow">`;
  if (S.ui.editName) {
    h += `<label class="lab" for="nameIn">你的名字</label><div class="row"><input id="nameIn" class="field" style="max-width:170px" maxlength="12" value="${esc(S.settings.name)}" placeholder="例如：Ruby"><button class="btn solid" data-act="saveName">好了</button></div><p class="muted tiny" style="margin:4px 0 0">會顯示成「名字的畫廊」</p>`;
  } else {
    h += `<h1 style="margin:0"><button class="hit row" data-act="editName" aria-label="修改名字" style="width:auto;min-height:44px;gap:6px"><span class="serif" style="font-size:32px;line-height:1.2">${esc(galleryTitle())}</span><span class="muted">${I.pen}</span></button></h1>`;
  }
  h += `${I.flourish}<p class="muted small" style="margin:0">${n} 件作品・${np} 個地點</p></div>
  <button class="hit" data-act="tab" data-to="dna" aria-label="我的美感 DNA" style="width:auto;display:flex;flex-direction:column;align-items:center;gap:2px">${avatarHtml(54)}<span class="tiny" style="color:var(--primary);font-weight:700">我的美感</span></button></div>`;
  if (todayVisit) h += `<button class="hit row" data-act="openCamera" style="margin-top:18px;background:var(--sage);border-radius:26px 14px 30px 12px;padding:14px 16px;gap:12px">${I.star('#4F6652', 22)}<span class="grow" style="line-height:1.5"><strong>今天在${esc(todayVisit.name)}</strong><br><span class="muted small">回到相機，繼續記錄</span></span>${I.next}</button>`;
  const nBroken = S.photos.filter(p => p.broken).length;
  if (nBroken) h += `<div class="card" style="margin-top:12px;background:var(--pink)"><p class="small" style="margin:0 0 10px;line-height:1.6"><strong>有 ${nBroken} 張照片的檔案遺失了</strong><br>這是舊版在 iPhone 上存檔的問題，新版已經修好。手機相簿裡的原圖都還在，可以重新匯入。</p><button class="btn white" data-act="cleanBroken">清除遺失的照片</button></div>`;
  if (!hasAI() && n) h += `<div class="card" style="margin-top:12px;background:var(--butter);border-radius:26px 14px 30px 12px"><p class="small" style="margin:0 0 10px;line-height:1.6"><strong>${tt('Basic mode', '基本模式')}</strong><br>${tt('Your photos are sorted by place and date. Add an AI key to recognize artworks and get notes, tips and your Taste DNA.', '照片已依地點和日期整理好。加上 AI 金鑰，就能自動認出作品，還有解說、觀賞重點和美感 DNA。')}</p><button class="btn solid" data-act="goAI" style="min-height:44px;font-size:14px">${I.star('#EBCF8A', 18)}${tt('Turn on AI', '開啟 AI')}</button></div>`;
  else if (QRUN || S.queue.length) h += `<div class="card row" role="status" style="margin-top:12px;background:var(--sky)"><span class="spin" style="flex:none"></span><span class="grow small" style="line-height:1.5"><strong>正在辨識照片・還有 ${pending + S.queue.length} 張</strong><br>可以先去看別的；關掉 app 也不會遺失，下次打開會接著辨識。</span></div>`;
  else if (pending) { const ew = S.works.find(w => w.status === 'pending' && w.error); h += `<div class="card row" style="margin-top:12px;background:var(--butter)"><span class="grow small" style="line-height:1.5">有 ${pending} 張照片還沒辨識，照片都已經存好了。${ew ? '<br><span class="muted">' + esc(ew.error) + '</span>' : ''}</span><button class="btn white" data-act="retryAll">${S.ui.busy.retry ? '<span class="spin"></span>' : '再試一次'}</button></div>`; }
  if (!n && !np) {
    h += `<div class="empty">${I.blob('#F4E3DD', 120)}<h2 class="serif" style="font-size:26px;margin:8px 0">你的畫廊還是空的</h2><p class="muted">在美術館、或在路上看到喜歡的東西，打開相機拍下來就好。今天的畫廊會自己慢慢長出來。</p>
    <div class="row wrap" style="margin-top:16px"><button class="btn solid" data-act="openCamera">${I.cam}打開相機</button><button class="btn" data-act="pickLib">${I.img}匯入以前的照片</button></div></div></main>${nav('home')}`;
    return h;
  }
  h += `<div class="tabs" role="tablist" style="margin-top:22px">${[['place', '地點'], ['works', '作品'], ['time', '時間軸'], ['map', '足跡']].map(([k, l]) => `<button class="tab ${S.ui.homeView === k ? 'on' : ''}" role="tab" aria-selected="${S.ui.homeView === k}" data-act="homeView" data-v="${k}">${l}</button>`).join('')}</div>`;
  if (S.ui.homeView === 'place') {
    const pls = [...S.places].sort((a, b) => placeLast(b) - placeLast(a));
    h += `<div style="display:flex;flex-direction:column;gap:34px;margin-top:30px">`;
    pls.forEach((pl, i) => {
      const c = placeCover(pl), cnt = worksAt(pl.id).length, vs = visitsOf(pl.id);
      const years = [...new Set(vs.map(v => v.date.slice(0, 4)))].sort();
      const big = i === 0;
      h += `<button class="hit" data-act="go" data-to="place" data-id="${pl.id}" style="position:relative;${i % 2 ? 'padding-left:40px' : 'padding-right:24px'}">
      <span aria-hidden="true" style="position:absolute;${i % 2 ? 'left:10px;right:24px' : 'left:34px;right:0'};top:-12px;height:${big ? 240 : 180}px;background:${PASTEL[i % 5]};border-radius:${RAD[i % 5]}"></span>
      <span class="frame" style="position:relative">${c ? `<img src="${purl(c)}" alt="${esc(pl.name)}" style="height:${big ? 220 : 160}px">` : `<span style="display:block;height:${big ? 220 : 160}px;background:var(--sand)"></span>`}</span>
      <span style="display:block;padding:12px 2px 0;position:relative"><span class="chip" style="background:${pl.kind === 'walk' ? 'var(--sage)' : 'var(--sky)'}">${pl.kind === 'walk' ? '城市散步' : '美術館'}</span>
      <span class="serif" style="display:block;font-size:${big ? 24 : 21}px;line-height:1.3;margin-top:4px">${esc(pl.name)}</span>
      <span class="muted small">${esc(pl.city || '')}${pl.city ? '・' : ''}去過 ${vs.length} 次${years.length ? '・' + years[0] + (years.length > 1 ? '–' + years[years.length - 1] : '') : ''}・${cnt} 件</span></span></button>`;
    });
    h += `</div>`;
  } else if (S.ui.homeView === 'works') {
    let ws = [...S.works].sort((a, b) => lastAt(b) - lastAt(a));
    if (S.ui.favOnly) ws = ws.filter(w => w.fav);
    h += `<div class="row" style="justify-content:space-between;margin:18px 0 14px"><span class="muted small">${S.ui.favOnly ? '最喜歡的作品' : `全部 ${S.works.length} 件・最近的在上面`}</span><button class="opt ${S.ui.favOnly ? 'on' : ''}" aria-pressed="${S.ui.favOnly}" data-act="favOnly">只看最喜歡</button></div><div class="grid2">`;
    ws.forEach((w, i) => { const m = mainPhoto(w); h += `<button class="hit thumbwork" data-act="go" data-to="work" data-id="${w.id}"><span class="bk" style="background:${PASTEL[i % 5]};border-radius:${RAD[i % 5]}"></span><span class="frame">${m ? `<img src="${purl(m)}" alt="${esc(w.title)}">` : ''}</span>${w.status === 'pending' && hasAI() ? `<span class="badge">${S.working === w.id ? '辨識中…' : '待辨識'}</span>` : w.isCopy ? '<span class="badge">複製品</span>' : w.confidence === 'low' ? '<span class="badge">AI 推測</span>' : ''}<strong style="display:block;font-size:15px;margin-top:8px;line-height:1.5;position:relative">${esc(w.title)}${titleSub(w)}</strong><span class="muted small" style="position:relative">${[artistHtml(w), photosOf(w.id).length + ' 張'].filter(Boolean).join('・')}${w.fav ? '・最喜歡' : ''}</span></button>`; });
    h += `</div>`;
  } else if (S.ui.homeView === 'map') {
    h += footprintHtml();
  } else {
    h += `<div style="border-left:1px solid var(--gold);margin:26px 0 0 8px">`;
    allVisits().forEach((v, i) => {
      h += `<button class="hit" data-act="go" data-to="place" data-id="${v.place.id}" style="position:relative;padding:0 0 24px 22px"><span style="position:absolute;left:-8px;top:6px">${I.blob(['#E8BFB3', '#B9CBB0', '#EBCF8A', '#B8CBE0'][i % 4], 16)}</span><span class="muted small" style="display:block">${fmtDate(v.date)}・${fmtTime(v.first)}–${fmtTime(v.last)}</span><strong style="display:block">${esc(v.place.name)}</strong><span class="row wrap" style="margin-top:6px">${v.works.slice(0, 5).map(w => { const m = mainPhoto(w); return m ? `<img src="${purl(m)}" alt="" style="width:52px;height:52px;object-fit:cover;border:4px solid var(--card);outline:1px solid var(--gold)">` : ''; }).join('')}<span class="muted small">${v.works.length} 件・${v.photos} 張</span></span></button>`;
    });
    h += `</div>`;
  }
  return h + `</main>${nav('home')}`;
}

function viewPlace() {
  const pl = placeOf(S.route.p.id); if (!pl) return viewHome();
  const c = placeCover(pl), vs = visitsOf(pl.id), ws = worksAt(pl.id);
  const nPhotos = S.photos.filter(p => (p.workId && ws.some(w => w.id === p.workId)) || p.placeId === pl.id).length;
  let h = `<main class="screen"><div class="topbar"><button class="back" data-act="back">${I.back}我的畫廊</button></div>
  <div class="row" style="gap:18px;align-items:flex-end;margin-top:10px"><div class="grow"><span class="chip" style="background:${pl.kind === 'walk' ? 'var(--sage)' : 'var(--sky)'}">${pl.kind === 'walk' ? '城市散步' : '美術館'}</span>`;
  if (S.ui.renamePlace) h += `<label class="lab" for="plName" style="margin-top:8px">地點名稱</label><input id="plName" class="field" value="${esc(pl.name)}"><div class="row" style="margin-top:8px"><button class="btn" data-act="renamePlace">取消</button><button class="btn solid" data-act="savePlaceName" data-id="${pl.id}">存下來</button></div>`;
  else h += `<h1 class="serif" style="margin:4px 0 0;font-size:30px;line-height:1.25">${esc(pl.name)}</h1>${pl.nameOriginal ? `<p class="serif muted" style="margin:0;font-size:18px">${esc(pl.nameOriginal)}</p>` : ''}<p class="muted small" style="margin:2px 0 0">${esc(pl.city || '')}</p><button class="linkbtn" data-act="renamePlace">名稱不對？修改</button>`;
  h += `</div>${c ? `<div style="width:118px;flex:none;padding:7px;background:var(--card);border:1px solid var(--gold);border-radius:60px 60px 4px 4px"><img src="${purl(c)}" alt="" style="display:block;width:100%;height:150px;object-fit:cover;border-radius:54px 54px 2px 2px"></div>` : ''}</div>
  <div class="row" style="margin-top:22px">${[[vs.length, '次'], [ws.length, '件作品'], [nPhotos, '張照片']].map(([a, b], i) => `<div class="grow" style="background:${PASTEL[i]};border-radius:${RAD[i]};padding:10px 14px"><span class="serif" style="display:block;font-size:28px;line-height:1.1">${a}</span><span class="small">${b}</span></div>`).join('')}</div>
  <p class="sec" style="margin-top:28px">紀錄・最近的在上面</p><p class="muted small" style="margin:-4px 0 12px">這些是 AI 自動整理的。覺得哪張放錯了，點進作品，按「這張放錯了？」就能調整。</p>`;
  vs.forEach(v => {
    h += `<p style="margin:16px 0 0"><strong>${fmtDate(v.date)}</strong> <span class="muted small">${fmtTime(v.first)}–${fmtTime(v.last)}・${v.works.length} 件・${v.photos} 張</span></p><div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">`;
    v.works.forEach(w => { const m = mainPhoto(w); h += `<button class="hit listrow" data-act="go" data-to="work" data-id="${w.id}">${m ? `<img src="${purl(m)}" alt="">` : '<span style="width:58px;height:58px"></span>'}<span class="grow" style="line-height:1.5"><strong style="font-size:15px">${esc(w.title)}</strong>${titleSub(w)}<span style="display:block" class="muted small">${[artistHtml(w, w.status === 'pending' ? (hasAI() ? '待辨識' : '') : '作者不明'), photosOf(w.id).length + ' 張'].filter(Boolean).join('・')}</span></span>${I.next}</button>`; });
    h += `</div>`;
  });
  return h + `</main>${nav('home')}`;
}

function viewWork() {
  const w = workOf(S.route.p.id); if (!w) return viewHome();
  const ps = orderedPhotos(w); const idx = Math.min(S.ui.photoIdx, Math.max(0, ps.length - 1)); const p = ps[idx];
  const pl = placeOf(w.placeId); const dates = seenDates(w);
  const prov = AI.PROVIDERS[w.aiProvider || S.settings.provider] || AI.PROVIDERS.gemini;
  let h = `<main class="screen"><div class="topbar row" style="justify-content:space-between"><button class="back" data-act="back">${I.back}${esc(pl ? pl.name : '返回')}</button>
  <span class="row" style="gap:6px"><button class="ibtn" data-act="shareWork" aria-label="分享這件作品">${I.share}</button><button class="ibtn heart ${w.fav ? 'on' : ''}" data-act="fav" aria-pressed="${!!w.fav}" aria-label="${w.fav ? '已加入最喜歡，點一下取消' : '加入最喜歡'}" style="${w.fav ? 'background:var(--pink)' : ''}">${I.heart}</button></span></div>
  <div style="position:relative;margin-top:8px"><div class="frame" style="padding:8px">${p ? `<button class="hit" data-act="zoom" aria-label="放大看照片" style="display:block;width:100%"><img src="${purl(p, 'full')}" alt="${esc(w.title)}, ${esc(L('type:' + p.type))}" style="${p.w && p.h ? `aspect-ratio:${p.w}/${p.h};` : ''}width:100%;height:auto;max-height:68vh;object-fit:contain;background:#EFE8DC"></button>` : ''}</div>
  ${p ? `<button class="ibtn" data-act="zoom" aria-label="放大看照片" style="position:absolute;right:16px;bottom:16px;background:rgba(255,253,248,.95)">${I.zoom}</button>` : ''}
  ${p ? `<span class="chip" style="position:absolute;left:18px;bottom:18px;background:rgba(255,253,248,.95)"><strong>${esc(L('type:' + p.type))}</strong>・${idx + 1} / ${ps.length} 張</span>` : ''}</div>
  <div class="row" style="margin-top:10px;overflow-x:auto;padding-bottom:2px">${ps.map((x, i) => `<button class="hit" style="width:auto;flex:none" data-act="photoIdx" data-i="${i}" aria-label="看第 ${i + 1} 張：${esc(L('type:' + x.type))}"><img src="${purl(x)}" alt="" style="width:50px;height:50px;object-fit:cover;display:block;border:3px solid ${i === idx ? 'var(--accent)' : 'var(--card)'};border-radius:12px 8px 14px 6px"></button>`).join('')}</div>
  <div class="row wrap" style="margin-top:8px"><button class="btn white" data-act="sheet" data-v="menu" style="font-size:14px">${I.sort}整理這張照片</button><button class="btn white" data-act="removePhoto" style="font-size:14px">${I.trash}刪除這張</button></div>`;
  if (w.status === 'pending' && !hasAI()) h += `<div class="card" style="margin-top:18px;background:var(--butter)"><strong>${tt('Basic mode', '基本模式')}</strong><p class="small" style="margin:4px 0 10px">${tt('Give it a name, or turn on AI to recognize it and get notes and what to look for.', '可以自己替它取個名字；或開啟 AI，自動認出作品、寫解說和觀賞重點。')}</p><div class="row wrap"><button class="btn white" data-act="editInfo">${I.pen}${tt('Name it', '替它取名')}</button><button class="btn solid" data-act="goAI">${tt('Turn on AI', '開啟 AI')}</button></div></div>`;
  else if (w.status === 'pending') h += `<div class="card" style="margin-top:18px;background:var(--butter)"><strong>${S.working === w.id ? '正在辨識…' : '這張還沒辨識'}</strong><p style="margin:4px 0 10px" class="small">${esc(S.working === w.id ? '馬上就好。' : (w.error || '照片已經存好，正在排隊等待辨識。'))}</p><button class="btn white" data-act="reanalyze">${S.ui.busy[w.id] ? '<span class="spin"></span> 辨識中' : '現在辨識'}</button></div>`;
  h += `<div style="margin-top:20px">${w.isCopy ? '<span class="chip">複製品・不算進美感 DNA</span> ' : ''}${w.kind === 'street' ? '<span class="chip" style="background:var(--sage)">路上的小美好</span>' : ''}`;
  if (S.ui.editInfo) {
    h += `<div class="card" style="margin-top:10px">${[['eiT', '作品名稱（中文）', w.title], ['eiTo', '作品原文或英文名稱', w.titleOriginal], ['eiA', '藝術家（中文）', w.artist], ['eiAo', '藝術家原文或英文名字', w.artistOriginal], ['eiY', '年代', w.year], ['eiM', '媒材', w.medium]].map(([id, l, v]) => `<label class="lab" for="${id}">${l}</label><input id="${id}" class="field" value="${esc(v || '')}" style="margin-bottom:10px">`).join('')}<p class="muted tiny" style="margin:0 0 10px">存下來後，可以按「依新資料重寫解說」讓 AI 重新整理。</p><div class="row"><button class="btn grow" data-act="editInfo">取消</button><button class="btn solid grow" data-act="saveInfo">存下來</button></div></div>`;
  } else {
    h += `<h1 class="serif usr" style="margin:6px 0 0;font-size:30px;line-height:1.25">${esc(w.title)}</h1>${origOf(w.title, w.titleOriginal) ? `<p class="serif" style="margin:2px 0 0;font-size:19px;color:var(--ink2);font-style:italic">${esc(w.titleOriginal)}</p>` : ''}
    <p style="margin:8px 0 0;font-size:17px">${artistHtml(w)}</p>
    <button class="linkbtn" data-act="editInfo">作品名稱或藝術家不對？修改</button>`;
  }
  h += `<div class="metagrid">${[['年代', w.year], ['媒材', w.medium], ['地點', pl && pl.name], ['見過 ' + dates.length + ' 次', dates.map(d => d.replace(/-/g, '.')).join('、')]].map(([a, b]) => `<div><span class="muted tiny">${a}</span><br>${esc(b || '—')}</div>`).join('')}</div></div>`;
  if (w.confidence === 'low' && w.status === 'ready') h += `<div class="card" style="margin-top:18px;background:var(--sky)"><strong>這件是 AI 的推測</strong><p class="small" style="margin:4px 0 0">AI 不太確定作品身分。補拍一張說明牌，或直接修改名稱都可以。</p></div>`;
  h += `<div style="margin-top:26px"><div class="row" style="justify-content:space-between"><h2 class="serif" style="margin:0;font-size:24px">我的感想</h2><span class="muted small">${(w.thoughts || []).length ? w.thoughts.length + ' 筆' : ''}</span></div>`;
  if (!(w.thoughts || []).length) h += `<div class="card row" style="margin-top:12px;background:var(--sand);align-items:flex-start">${I.star()}<p style="margin:0">還沒有留下感想。想起什麼的時候，寫一句或錄一段都好。</p></div>`;
  (w.thoughts || []).forEach((t, i) => {
    const editing = S.ui.editThought === t.id;
    h += `<div class="card" style="margin-top:12px;background:${['#F4E3DD', '#E3EADD', '#F7EDCF'][i % 3]}"><p class="muted small" style="margin:0">${fmtDate(ymd(t.at))}・${t.kind === 'voice' ? '語音感想' : '文字感想'}${t.edited ? '・已修改' : ''}</p>${t.kind === 'voice' && t.audio ? `<audio controls preload="none" src="${thoughtUrl(t)}" style="width:100%;margin:6px 0"></audio>` : ''}`;
    if (editing) h += `<label class="lab" for="thIn" style="margin-top:6px">修改感想</label><textarea id="thIn" class="field" rows="3">${esc(t.text || '')}</textarea><div class="row" style="margin-top:8px"><button class="btn white grow" data-act="editThought" data-id="">取消</button><button class="btn solid grow" data-act="saveThought" data-id="${t.id}">存下來</button></div>`;
    else h += `<p class="usr" style="margin:0">${esc(t.text || '')}</p><div class="row" style="margin-top:6px;gap:4px"><button class="linkbtn" data-act="editThought" data-id="${t.id}">修改</button><button class="linkbtn" data-act="deleteThought" data-id="${t.id}" style="color:var(--ink2)">刪除</button></div>`;
    h += `</div>`;
  });
  if (S.ui.writing) h += `<div style="margin-top:14px"><label class="lab" for="noteIn">想留下什麼？</label><textarea id="noteIn" class="field" rows="3" placeholder="寫一句就好"></textarea><div class="row" style="margin-top:10px"><button class="btn grow" data-act="write">取消</button><button class="btn solid grow" data-act="saveNote">存下來</button></div></div>`;
  else if (S.rec && S.rec.workId === w.id) h += `<div class="card row" role="status" style="margin-top:14px">${I.blob('#9C5B55', 18).replace('<svg', '<svg class="pulse"')}<strong class="grow">錄音中…</strong><button class="btn solid" data-act="stopRec">結束</button></div>`;
  else h += `<div class="row" style="margin-top:16px"><button class="btn grow" data-act="addPhotos">${I.img}補照片</button><button class="btn grow" data-act="write">${I.pen}寫感想</button><button class="btn grow" data-act="startRec">${I.mic}錄音</button></div>`;
  h += `<button class="btn solid block" data-act="shareWork" style="margin-top:12px">${I.share}分享這件作品</button></div>`;
  if (w.short) h += `<svg width="100%" height="16" viewBox="0 0 342 16" preserveAspectRatio="none" aria-hidden="true" style="display:block;margin:24px 0"><path d="M0 8h146M196 8h146" stroke="#C2A878"/><path d="M152 8c6-8 14-8 19 0 5 8 13 8 19 0" fill="none" stroke="#C2A878"/></svg>
  <p class="sec">${w.kind === 'street' ? '關於它' : '作品解說'}</p><p class="usr" style="margin:0">${esc(S.ui.showLong && w.long ? w.long : w.short)}</p>
  <div class="row wrap">${w.long ? `<button class="linkbtn" data-act="showLong">${S.ui.showLong ? '收起' : '看完整解說'}</button>` : ''}<button class="linkbtn" data-act="reanalyze">${S.ui.busy[w.id] ? '整理中…' : '依新資料重寫解說'}</button></div>
  <p class="muted tiny" style="margin:2px 0 0">AI 解說・${esc(prov.name)}${w.labelUsed ? '・已用你拍的說明牌校正' : ''}</p>`;
  if (w.status === 'ready') {
    if ((w.lookFor || []).length) h += lookForHtml(w.lookFor);
    else h += `<button class="btn" data-act="makeLookFor" style="margin-top:18px">${S.ui.busy.look ? '<span class="spin"></span> 整理中…' : I.eye + '看看觀賞重點'}</button>`;
  }
  if (w.artist && w.status === 'ready' && w.kind !== 'street') {
    const ad = S.artist[norm(w.artistOriginal || w.artist)];
    if (ad) h += artistCard(ad, w);
    else h += `<button class="btn" data-act="artistDna" style="margin-top:22px">${S.ui.busy.artist ? '<span class="spin"></span> 整理中' : '看' + esc(w.artist) + '的藝術家視覺 DNA'}</button>`;
  }
  h += `<div style="margin-top:28px"><p class="muted small" style="margin:0">點右上角的愛心標成「最喜歡」，你的美感 DNA 會更準。</p><button class="linkbtn" data-act="deleteWork" style="color:var(--accent)">刪除這件作品</button></div></main>${nav('home')}`;
  if (S.ui.sheet) h += sheetHtml(w, p, ps);
  return h;
}
const ASPECT_BG = { '用色': 'var(--pink)', '線條': 'var(--sky)', '構圖': 'var(--butter)', '光線': 'var(--butter)', '筆觸': 'var(--sage)', '細節': 'var(--sky)', '材質': 'var(--sage)', '象徵': 'var(--pink)', '歷史背景': 'var(--sand)', '畫家心境': 'var(--pink)' };
function lookForHtml(list, compact) {
  const items = compact ? list.slice(0, 2) : list;
  return `<div style="margin-top:${compact ? 12 : 22}px;${compact ? '' : 'background:var(--card);border-radius:30px 16px 34px 14px;padding:16px 18px 6px'}"><p class="sec" style="margin:0 0 10px">${I.eye} 留心看這裡</p>${items.map(x => `<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:12px"><span class="chip" style="flex:none;min-width:68px;justify-content:center;text-align:center;background:${ASPECT_BG[x.aspect] || 'var(--sand)'};margin-top:1px">${esc(x.aspect || '細節')}</span><span class="usr" style="line-height:1.65">${esc(x.text)}</span></div>`).join('')}</div>`;
}
function artistCard(ad, w) {
  return `<div style="margin-top:28px;background:var(--card);border-radius:36px 18px 40px 16px;overflow:hidden"><div style="background:var(--butter);padding:18px 20px 14px;position:relative;overflow:hidden"><div style="position:absolute;right:-8px;top:-12px">${I.blob('#EFD9A0', 76)}</div>
  <p class="sec" style="margin:0;position:relative">藝術家視覺 DNA</p><h2 class="serif" style="margin:2px 0 0;font-size:26px;letter-spacing:.06em;position:relative">${esc(ad.name || w.artist)}</h2><p class="serif muted" style="margin:0;font-size:20px;position:relative">${esc(ad.title || '')}</p>
  <div class="row" style="margin-top:8px;position:relative">${(ad.tags || []).slice(0, 2).map((t, i) => `<span class="chip" style="background:${i ? 'var(--pink)' : 'var(--sky)'}">${esc(t)}</span>`).join('')}</div></div>
  <div style="padding:16px 20px 18px"><p style="margin:0 0 10px"><strong>核心</strong>　${esc(ad.core || '')}</p><p style="margin:0 0 6px"><strong>色彩</strong></p>
  <div class="grid3" style="grid-template-columns:repeat(4,minmax(0,1fr));margin-bottom:12px">${(ad.colors || []).slice(0, 4).map(c => `<div>${I.blob(esc(c.hex), 44)}<span class="tiny" style="display:block;line-height:1.4">${esc(c.name)}</span></div>`).join('')}</div>
  <p style="margin:0"><strong>特徵</strong></p><ul style="margin:2px 0 0;padding-left:20px">${(ad.traits || []).slice(0, 3).map(t => `<li>${esc(t)}</li>`).join('')}</ul>
  <p class="muted tiny" style="margin:10px 0 0">AI 歸納・同一位藝術家只產生一次</p></div></div>`;
}
const AUDIO_URLS = new Map();
function thoughtUrl(t) { if (!AUDIO_URLS.has(t.id)) AUDIO_URLS.set(t.id, URL.createObjectURL(t.audio)); return AUDIO_URLS.get(t.id); }
function sheetHtml(w, p, ps) {
  let h = `<button class="scrim" data-act="sheet" data-v="" aria-label="關閉"></button><div class="sheet" role="dialog" aria-label="整理這張照片">
  <div class="row" style="margin-bottom:14px">${p ? `<img src="${purl(p)}" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:14px 8px 16px 6px">` : ''}<div style="line-height:1.5"><strong>整理這張照片</strong><br><span class="muted small">目前在《${esc(w.title)}》・${esc(p ? L('type:' + p.type) : '')}</span></div></div>`;
  if (S.ui.sheet === 'menu') {
    h += `<div style="display:flex;flex-direction:column;gap:8px">${[['sheet', 'move', '移到另一件作品（拍到別的作品了）'], ['sheet', 'type', '改照片類型（作品、細節、說明牌⋯）'], ['split', '', '獨立成新的一件作品'], ['makeFirst', '', '設成這件作品的第一張（代表照片）'], ['makeCover', '', '設成這個地點的封面'], ['removePhoto', '', '刪除這張照片']].map(([a, v, l]) => `<button class="btn" data-act="${a}" data-v="${v}" style="justify-content:flex-start">${l}</button>`).join('')}<button class="btn ghost" data-act="sheet" data-v="">取消</button></div>`;
  } else if (S.ui.sheet === 'type') {
    h += `<p style="margin:0 0 8px">這張照片是：</p><div class="row wrap">${TYPES.map(t => `<button class="opt ${p && p.type === t ? 'on' : ''}" data-act="setType" data-v="${t}">${L('type:' + t)}</button>`).join('')}</div><button class="btn ghost block" data-act="sheet" data-v="menu" style="margin-top:14px">返回</button>`;
  } else if (S.ui.sheet === 'move') {
    const targets = worksAt(w.placeId).filter(x => x.id !== w.id).sort((a, b) => lastAt(b) - lastAt(a));
    h += `<p style="margin:0 0 8px">要移到哪一件作品？<span class="muted small">（同一個地點）</span></p><div style="display:flex;flex-direction:column;gap:8px">`;
    if (!targets.length) h += `<p class="muted small">這個地點沒有其他作品。可以改用「獨立成新的一件作品」。</p>`;
    targets.forEach(x => { const m = mainPhoto(x); h += `<button class="hit listrow" data-act="movePhoto" data-id="${x.id}">${m ? `<img src="${purl(m)}" alt="">` : ''}<span class="grow" style="line-height:1.4"><strong style="font-size:15px">${esc(x.title)}</strong>${titleSub(x)}<span style="display:block" class="muted tiny">${artistHtml(x, '')}・${photosOf(x.id).length} 張</span></span></button>`; });
    h += `</div><button class="btn ghost block" data-act="sheet" data-v="menu" style="margin-top:14px">返回</button>`;
  }
  return h + `</div>`;
}

function viewCamera() {
  const s = S.session && ymd(S.session.lastAt) === ymd(Date.now()) ? S.session : null;
  const pl = s && placeOf(s.placeId);
  const todays = pl ? visitsOf(pl.id).find(v => v.date === ymd(Date.now())) : null;
  let h = `<main class="cam"><div class="row" style="justify-content:space-between;align-items:flex-start"><span class="pill">${pl ? `你在<strong>${esc(pl.name)}</strong><br><span class="muted tiny">今天的畫廊已開始・${todays ? todays.works.length : 0} 件</span>` : '拍下第一張，<br><span class="muted tiny">AI 會判斷你在哪裡</span>'}</span>
  <button class="btn white" data-act="endVisit" style="font-weight:700;color:var(--ink)">結束</button></div><div style="flex:1;display:flex;flex-direction:column;justify-content:center;gap:12px;padding:16px 0">`;
  const nq = queuedWorks().length + S.queue.length; const cw = S.working && workOf(S.working); const cp = cw && mainPhoto(cw);
  if (nq) h += `<div class="pill row" role="status">${cp ? `<img src="${purl(cp)}" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:10px">` : ''}<span class="spin"></span><span class="grow" style="line-height:1.4">${QRUN ? '辨識中' : '已存好，等待辨識'}・還有 ${nq} 張<br><span class="muted tiny">照片已經存好，可以繼續拍或關閉相機</span></span></div>`;
  const L = S.last; const lw = L && workOf(L.workId);
  if (L && L.facade) h += `<div class="pill">已存成這個地點的封面照片。</div>`;
  else if (lw && L.grouped) h += `<div class="pill" role="status" style="background:var(--sage)">已收在一起（${photosOf(lw.id).length} 張）・《${esc(lw.title)}》</div>`;
  else if (lw) {
    const m = mainPhoto(lw);
    h += `<div class="result"><div class="hd"><div class="grow"><span class="chip" style="background:var(--card)">${lw.status === 'pending' ? (hasAI() ? '待辨識' : tt('Saved', '已存好')) : seenDates(lw).length > 1 ? '第 ' + seenDates(lw).length + ' 次見到' : lw.kind === 'street' ? '路上的小美好' : '第一次見到'}</span><h2 class="serif" style="margin:6px 0 0;font-size:24px;line-height:1.3">${esc(lw.title)}</h2>${titleSub(lw)}<p class="muted small" style="margin:2px 0 0">${artistHtml(lw, '')}${lw.year ? '・' + esc(lw.year) : ''}</p></div>${m ? `<img src="${purl(m)}" alt="">` : ''}</div>
    <div style="padding:14px 16px 16px"><p style="margin:0 0 12px">${esc(lw.status === 'pending' ? (hasAI() ? (lw.error || '有網路後會自動辨識。') : tt('Basic mode: you can name it in your gallery. Turn on AI in Settings to recognize artworks automatically.', '基本模式：可以回畫廊替它取名。到設定開啟 AI，就能自動認出作品。')) : lw.short || '')}</p>${(lw.lookFor || []).length ? lookForHtml(lw.lookFor, true) : ''}<div class="grid2" style="gap:8px"><button class="btn" data-act="go" data-to="work" data-id="${lw.id}">完整解說</button><button class="btn" data-act="startRec" data-id="${lw.id}">${I.mic}說感想</button><button class="btn" data-act="fixLast" data-id="${lw.id}">這不對</button><button class="btn solid" data-act="dismissLast">繼續看展</button></div></div></div>`;
  }
  if (S.rec) h += `<div class="pill row" role="status">${I.blob('#9C5B55', 18).replace('<svg', '<svg class="pulse"')}<span class="grow"><strong>錄音中</strong><br><span class="muted tiny">再按一次麥克風就結束</span></span></div>`;
  h += `</div>`;
  if (todays && todays.works.length) h += `<div class="strip" aria-label="今天的作品">${todays.works.map(w => { const m = mainPhoto(w); return m ? `<button class="hit t" data-act="go" data-to="work" data-id="${w.id}" aria-label="${esc(w.title)}"><img src="${purl(m)}" alt=""><span class="n">${photosOf(w.id).length}</span></button>` : ''; }).join('')}</div>`;
  h += `<div class="row" style="justify-content:space-around;margin-top:12px"><button class="round" data-act="pickLib" aria-label="從相簿選">${I.img}</button>
  ${CAM.live ? `<button class="shutter" data-act="snap" aria-label="拍照"><span>${I.star('#EBCF8A', 30)}</span></button>` : `<label for="camInput" class="shutter" role="button" aria-label="拍照"><span>${I.star('#EBCF8A', 30)}</span></label>`}
  <button class="round" data-act="${S.rec ? 'stopRec' : 'startRec'}" aria-label="${S.rec ? '結束錄音' : '錄下感想'}" style="${S.rec ? 'background:var(--pink);color:var(--accent)' : ''}">${I.mic}</button></div>
  ${CAM.error ? `<p class="tiny" style="text-align:center;margin:10px 0 0;background:rgba(255,253,248,.14);border-radius:14px;padding:8px 10px">${esc(CAM.error)}</p>` : ''}
  ${CAM.live ? `<button class="linkbtn" data-act="nativeCam" style="color:#FBF7EF;display:block;margin:6px auto 0;font-size:13px">改用 iPhone 內建相機拍（畫質較高）</button>` : ''}
  <p class="tiny" style="text-align:center;margin:10px 0 0;opacity:.85">拍照後會自動辨識、自動收進今天的畫廊${S.last && S.last.workId ? '；麥克風會把感想存到最新的作品' : ''}</p>
  <button class="btn ghost" data-act="tab" data-to="home" style="color:#FBF7EF;margin:6px auto 0">${I.x}關閉相機${nq ? '（辨識會在背景繼續）' : ''}</button></main>`;
  return h;
}

function viewSummary() {
  const d = ymd(Date.now());
  const pl = S.session && placeOf(S.session.placeId);
  const v = pl ? visitsOf(pl.id).find(x => x.date === d) : null;
  let h = `<main class="screen nonav"><div style="position:absolute;right:-20px;top:20px;transform:rotate(12deg)">${I.leaf('#D5E0CE', 110)}</div><p class="muted small" style="margin:0">${fmtDate(d)}</p><h1 class="serif" style="margin:4px 0 0;font-size:32px;line-height:1.25">${pl ? '今天在<br>' + esc(pl.name) : '今天'}</h1>${I.flourish}`;
  if (v) {
    const mins = Math.max(1, Math.round((v.last - v.first) / 60000));
    const nThoughts = v.works.reduce((a, w) => a + (w.thoughts || []).filter(t => ymd(t.at) === d).length, 0);
    h += `<div class="row" style="margin-top:16px">${[[v.works.length, '件作品'], [v.photos, '張照片'], nThoughts ? [nThoughts, '段感想'] : [mins, '分鐘']].map(([a, b], i) => `<div class="grow" style="background:${PASTEL[i]};border-radius:${RAD[i]};padding:12px 14px"><span class="serif" style="display:block;font-size:36px;line-height:1.1">${a}</span><span class="small">${b}</span></div>`).join('')}</div><div style="display:flex;flex-direction:column;gap:12px;margin-top:22px">${v.works.map(w => { const m = mainPhoto(w); return `<button class="hit row" data-act="go" data-to="work" data-id="${w.id}">${m ? `<img src="${purl(m)}" alt="" style="width:58px;height:58px;object-fit:cover;padding:3px;border:1px solid var(--gold);background:var(--card)">` : ''}<span class="grow" style="line-height:1.5"><strong>${esc(w.title)}</strong>${titleSub(w)}<span style="display:block" class="muted small">${artistHtml(w, '')}${w.artist || w.artistOriginal ? '・' : ''}${photosOf(w.id).filter(p => ymd(p.takenAt) === d).length} 張</span></span></button>`; }).join('')}</div>`;
  } else h += `<p class="muted">今天還沒有拍照。</p>`;
  return h + `<p class="card" style="margin-top:22px;background:var(--sky)">回家想補可以補，不補也沒關係，今天的畫廊已經在這裡了。</p><button class="btn solid block" data-act="tab" data-to="home" style="margin-top:12px">回到畫廊</button></main>`;
}

function footprintHtml() {
  const pls = [...S.places].sort((a, b) => placeLast(b) - placeLast(a));
  const cities = new Set(pls.map(p => p.city).filter(Boolean));
  let h = `<p class="muted small" style="margin:18px 0 12px">${cities.size} 座城市・${pls.length} 個地點</p>`;
  h += pls.some(p => p.lat != null) ? `<div id="map" role="region" aria-label="足跡地圖"></div><p class="muted tiny" style="margin:6px 0 16px">地圖資料 © OpenStreetMap 貢獻者</p>` : `<div class="card" style="background:var(--sky)">拍照時允許「使用位置」，去過的地方就會出現在地圖上。</div>`;
  h += `<div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">${pls.map(pl => { const c = placeCover(pl); return `<button class="hit listrow" data-act="go" data-to="place" data-id="${pl.id}">${c ? `<img src="${purl(c)}" alt="">` : ''}<span class="grow" style="line-height:1.5"><strong>${esc(pl.name)}</strong><br><span class="muted small">${esc(pl.city || '')}・${worksAt(pl.id).length} 件</span></span>${I.next}</button>`; }).join('')}</div>`;
  return h;
}
function viewMap() { S.route = { name: 'home', p: {} }; S.ui.homeView = 'map'; return viewHome(); }
let LEAFLET = null;
function loadLeaflet() {
  if (LEAFLET) return LEAFLET;
  LEAFLET = new Promise((res, rej) => {
    const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'; document.head.appendChild(css);
    const s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'; s.onload = () => res(window.L); s.onerror = () => { LEAFLET = null; rej(new Error('地圖載入失敗')); }; document.head.appendChild(s);
  });
  return LEAFLET;
}
async function initMap() {
  const el = $('#map'); if (!el) return;
  try {
    const L = await loadLeaflet(); if (!$('#map')) return;
    const pts = S.places.filter(p => p.lat != null);
    const m = L.map('map', { zoomControl: false, attributionControl: false });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18 }).addTo(m);
    const icon = L.divIcon({ className: '', html: I.blob('#9C5B55', 28), iconSize: [28, 28], iconAnchor: [14, 26] });
    const bounds = [];
    pts.forEach(p => { const mk = L.marker([p.lat, p.lng], { icon }).addTo(m); mk.bindTooltip(`${p.name}・${worksAt(p.id).length} 件`); mk.on('click', () => go('place', { id: p.id })); bounds.push([p.lat, p.lng]); });
    if (bounds.length === 1) m.setView(bounds[0], 13); else m.fitBounds(bounds, { padding: [30, 30] });
  } catch (e) { el.innerHTML = '<p style="padding:20px">地圖需要網路才能顯示。</p>'; }
}

function viewDna() {
  const el = eligible(); const n = el.length; const D = S.dna;
  const meShots = S.photos.filter(p => p.type === '我與作品').slice(-6);
  let h = `<main class="screen"><div class="topbar row" style="justify-content:flex-end"><button class="ibtn" data-act="go" data-to="settings" aria-label="設定">${I.set}</button></div>
  <div class="row" style="gap:16px;margin-top:6px">${avatarHtml(96)}<div class="grow"><p class="serif" style="margin:0;font-size:24px;line-height:1.3">${esc(S.settings.name || '我')}</p><p class="muted small" style="margin:0">${S.works.length} 件作品・${S.places.length} 個地點</p>
  <div class="row wrap" style="margin-top:8px"><button class="btn" data-act="pickAvatar" style="min-height:44px;font-size:14px">上傳照片</button>${meShots.length ? `<button class="btn" data-act="togglePick" style="min-height:44px;font-size:14px">從收藏挑</button>` : ''}</div></div></div>`;
  if (S.ui.pick) h += `<div class="card" style="margin-top:12px"><p style="margin:0 0 8px">選一張「我與作品」當大頭照</p><div class="row wrap">${meShots.map(p => `<button class="hit" style="width:auto" data-act="avatarFrom" data-id="${p.id}"><img class="avatar" src="${purl(p)}" alt="" style="width:72px;height:72px"></button>`).join('')}</div><p class="muted tiny" style="margin:8px 0 0">照片只存在你的手機裡。</p></div>`;
  h += `<h1 class="serif" style="margin:26px 0 0;font-size:30px">我的美感 DNA</h1>`;
  if (!hasAI()) {
    if (!S.basicPalette && S.photos.length) { S.basicPalette = []; paletteFromBlobs(S.photos.filter(p => !p.broken && p.type !== '說明牌').slice(-40).map(p => p.thumb)).then(c => { S.basicPalette = c; bgRender(); }); }
    const pal = S.basicPalette || [];
    return h + `${pal.length ? `<p class="sec" style="margin-top:22px">${tt('My colors · from your photos', '我的色彩・從你拍的照片計算')}</p><div class="grid3" style="grid-template-columns:repeat(${pal.length},minmax(0,1fr));align-items:end">${pal.map((c, i) => `<div style="transform:rotate(${[-6, 4, -2, 8, -4][i]}deg)">${I.blob(c, 60)}</div>`).join('')}</div>` : ''}
    <div class="card" style="margin-top:22px;background:var(--pink)"><h2 class="serif" style="margin:0;font-size:22px;line-height:1.35">${tt('Your Taste DNA needs AI', '美感 DNA 需要 AI')}</h2><p style="margin:6px 0 12px">${tt('Once AI is on, your personal curator reads your collection and tells you what you are drawn to, with artists you may love.', '開啟 AI 後，你的私人策展人會讀你的收藏，告訴你被什麼吸引，還會推薦你可能喜歡的藝術家。')}</p><button class="btn solid" data-act="goAI">${I.star('#EBCF8A', 18)}${tt('Turn on AI', '開啟 AI')}</button></div></main>${nav('dna')}`;
  }
  if (n < 5) {
    return h + `<div class="card" style="margin-top:16px;background:var(--pink)"><h2 class="serif" style="margin:0;font-size:22px;line-height:1.35">再收藏 ${5 - n} 件作品，就能看到你的美感 DNA</h2><p class="muted" style="margin:6px 0 0">目前有 ${n} 件可以分析的作品。多拍幾件喜歡的作品，這一頁會慢慢長出你自己的樣子。</p></div></main>${nav('dna')}`;
  }
  h += `<p class="muted small" style="margin:4px 0 0">AI 歸納・依 ${D ? D.basis : n} 件作品・會隨你的收藏慢慢改變</p>`;
  if (!D) return h + `<button class="btn solid block" data-act="makeDna" style="margin-top:18px">${S.ui.busy.dna ? '<span class="spin"></span> 策展人正在看你的收藏…' : '請策展人整理我的美感'}</button></main>${nav('dna')}`;
  const d = D.data;
  if (D.basis !== n) h += `<button class="btn white block" data-act="makeDna" style="margin-top:12px">${S.ui.busy.dna ? '<span class="spin"></span> 整理中…' : `收藏增加了（現在 ${n} 件），重新整理`}</button>`;
  h += `<div style="margin-top:18px;padding:24px 22px 22px;background:var(--pink);border-radius:46px 22px 52px 20px;position:relative;overflow:hidden"><div style="position:absolute;right:-30px;top:-16px;transform:rotate(18deg)">${I.leaf('#EBCDC2', 110)}</div>
  <p class="sec" style="margin:0 0 2px;position:relative">我的美感</p><h2 class="serif" style="margin:0;font-size:30px;line-height:1.3;position:relative;max-width:270px">${esc(d.name)}</h2>
  <div class="row wrap" style="margin:10px 0 12px;position:relative">${(d.tags || []).map(t => `<span class="chip" style="background:var(--card)">${esc(t)}</span>`).join('')}</div><p style="margin:0;position:relative">${esc(d.oneLiner)}</p>
  <button class="btn white" data-act="makeDna" data-v="reword" style="margin-top:14px;position:relative;min-height:44px">${I.refresh}換一個說法</button></div>`;
  if (D.palette && D.palette.length) h += `<p class="sec" style="margin-top:28px">我的色彩・從你拍的照片計算</p><div class="grid3" style="grid-template-columns:repeat(${D.palette.length},minmax(0,1fr));align-items:end">${D.palette.map((c, i) => `<div style="transform:rotate(${[-6, 4, -2, 8, -4][i]}deg)">${I.blob(c, 60)}</div>`).join('')}</div>`;
  h += `<div class="card" style="margin-top:28px;border-radius:18px 36px 16px 40px;position:relative"><div style="position:absolute;left:-10px;top:-12px">${I.star()}</div><p class="sec" style="margin:0 0 6px">策展人筆記</p><p class="serif" style="margin:0 0 8px;font-size:21px;line-height:1.45">${esc(d.curatorTitle)}</p><p style="margin:0">${esc(d.curatorNote)}</p></div>`;
  h += `<p class="sec" style="margin-top:28px">你的美感輪廓</p><div class="grid3">${DIMS.map(([k, l], i) => `<div style="background:${PASTEL[i % 5]};border-radius:${RAD[i % 5]};padding:10px 12px;line-height:1.4"><span class="muted tiny">${l}</span><br><strong>${esc((d.dims || {})[k] || dimWord(k, D.avg[k]))}</strong></div>`).join('')}</div>`;
  if (S.ui.fb) h += `<div style="margin-top:12px"><label class="lab" for="fbIn">用一句話說說看哪裡不像你</label><textarea id="fbIn" class="field" rows="2" placeholder="例如：我其實也很喜歡明亮的畫">${esc(S.settings.feedback || '')}</textarea><div class="row" style="margin-top:8px"><button class="btn grow" data-act="fb">取消</button><button class="btn solid grow" data-act="saveFb">送出</button></div></div>`;
  else h += `<button class="linkbtn" data-act="fb">覺得哪裡不太像你？告訴策展人</button>`;
  h += `<p style="margin:14px 0 6px"><strong>你常收藏的題材</strong></p><div class="row wrap">${D.subjects.map(s => `<span class="chip" style="background:var(--sage);font-size:15px;padding:2px 14px">${esc(s)}</span>`).join('')}</div>`;
  if ((d.closest || []).length) h += `<p class="sec" style="margin-top:28px">你收藏裡最像你的藝術家</p><div style="display:flex;flex-direction:column;gap:10px">${d.closest.map((a, i) => `<div class="card row" style="border-radius:${RAD[i]}"><span class="serif ring" style="width:42px;height:42px;background:${PASTEL[i]};font-size:20px;flex:none;border-radius:24px 16px 26px 14px">${i + 1}</span><span class="grow" style="line-height:1.5"><strong>${esc(a.artist)}</strong>${a.artistOriginal ? ` <span class="orig-i">${esc(a.artistOriginal)}</span>` : ''}<br><span class="muted small">${esc(a.why)}</span></span></div>`).join('')}</div>`;
  if ((d.recs || []).length) h += `<div style="margin:30px -22px 0;padding:26px 22px 28px;background:var(--sky);border-radius:48px 48px 0 0"><p class="sec" style="margin:0 0 4px">策展人推薦</p><h2 class="serif" style="margin:0 0 14px;font-size:24px;line-height:1.35">你可能也會喜歡，<br>但還沒認識的藝術家</h2><div style="display:flex;flex-direction:column;gap:12px">${d.recs.map((r, i) => `<div class="card" style="border-radius:${RAD[i]}"><strong style="font-size:18px">${esc(r.artist)}</strong> <span class="serif muted">${esc(r.artistOriginal || '')}</span><p style="margin:6px 0 0"><span class="muted">為什麼推薦：</span>${esc(r.why)}</p><p class="small row" style="margin:6px 0 0;align-items:flex-start;gap:6px">${I.pin}<span>${esc(r.where || '')}</span></p></div>`).join('')}</div></div>`;
  if (d.surprise && d.surprise.title) h += `<div class="card" style="margin-top:22px;background:var(--pink)"><p class="sec" style="margin:0">讓你意外的收藏</p><strong>${esc(d.surprise.title)}</strong><p style="margin:2px 0 0">${esc(d.surprise.text)}</p></div>`;
  h += `<p class="muted small" style="margin-top:16px">在作品頁點「最喜歡」，策展人會更了解你。</p><button class="btn solid block" data-act="shareDna" style="margin-top:12px">${I.dl}存成 3 張圖片分享</button></main>${nav('dna')}`;
  return h;
}
const DIM_EN = { brightness: ['bright', 'deep'], warmth: ['cool', 'warm'], line: ['flowing', 'geometric'], form: ['realistic', 'abstract'], mood: ['calm', 'intense'], ornament: ['simple', 'ornate'] };
function dimWord(k, v) {
  if (I18N.lang === 'en') { const e = DIM_EN[k]; if (!e || v == null) return '—'; if (v < 1.8) return 'Very ' + e[0]; if (v < 2.7) return 'Leaning ' + e[0]; if (v <= 3.3) return 'Balanced'; if (v <= 4.2) return 'Leaning ' + e[1]; return 'Very ' + e[1]; } const d = DIMS.find(x => x[0] === k); if (!d || v == null) return '—'; if (v < 1.8) return '很' + d[2]; if (v < 2.7) return '偏' + d[2]; if (v <= 3.3) return '介於兩者之間'; if (v <= 4.2) return '偏' + d[3]; return '很' + d[3]; }

function keyGuide(p) {
  const G = {
    gemini: { url: 'https://aistudio.google.com/apikey', site: 'Google AI Studio',
      steps: [tt('Sign in with your Google account and accept the terms', '用你的 Google 帳號登入，同意服務條款'), tt('Tap "Create API key" and choose or create a project', '按「Create API key」，選一個專案或建立新專案'), tt('Copy the key (it starts with "AQ.", older keys with "AIza") and paste it below', '複製金鑰（通常是「AQ.」開頭，舊的是「AIza」開頭），回來貼在下面')],
      note: tt('Free to start, no credit card needed. On the free tier, Google may use your data to improve its services. A Gemini app subscription is separate from the API.', '不用綁信用卡就能先用。免費額度的資料可能被 Google 用來改善服務。Gemini app 的訂閱和 API 是分開的。') },
    claude: { url: 'https://console.anthropic.com/settings/keys', site: 'Claude Console',
      steps: [tt('Sign in and add a little credit under Billing (separate from a Claude subscription)', '登入後在 Billing 加一點額度（和 Claude 訂閱分開計費）'), tt('Go to API Keys and tap "Create Key"', '到 API Keys 按「Create Key」'), tt('Copy the key (it starts with "sk-ant-") and paste it below', '複製金鑰（「sk-ant-」開頭），回來貼在下面')],
      note: tt('Pay as you go. Voice notes can only be turned into text with a Gemini key.', '用多少付多少。語音感想要有 Gemini 金鑰才能轉成文字。') },
    openai: { url: 'https://platform.openai.com/api-keys', site: 'OpenAI Platform',
      steps: [tt('Sign in and set up payment under Billing (separate from ChatGPT Plus)', '登入後在 Billing 設定付款（和 ChatGPT 訂閱分開計費）'), tt('Go to API keys and tap "Create new secret key"', '到 API keys 按「Create new secret key」'), tt('Copy the key (it starts with "sk-") and paste it below', '複製金鑰（「sk-」開頭），回來貼在下面')],
      note: tt('Pay as you go. Voice notes can only be turned into text with a Gemini key.', '用多少付多少。語音感想要有 Gemini 金鑰才能轉成文字。') }
  }[p];
  return `<ol class="steps" style="margin-top:14px"><li>${tt('Open', '打開')} <a href="${G.url}" target="_blank" rel="noopener">${G.site}</a></li>${G.steps.map(x => `<li>${x}</li>`).join('')}</ol><p class="note">${G.note}<br>${tt('Your key stays on this phone and is only sent directly to the AI you choose.', '金鑰只存在這支手機裡，只會直接送到你選的 AI。')}</p>`;
}
function aiSetupHtml(context) {
  const p = S.settings.provider;
  return `<div class="row wrap" role="radiogroup" aria-label="選擇 AI">${Object.entries(AI.PROVIDERS).map(([k, v]) => `<button class="opt ${p === k ? 'on' : ''}" role="radio" aria-checked="${p === k}" data-act="provider" data-v="${k}">${v.name}${k === 'gemini' ? '（推薦）' : ''}</button>`).join('')}</div>
  ${keyGuide(p)}<label class="lab" for="keyIn" style="margin-top:12px">${AI.PROVIDERS[p].name} ${tt('key', '金鑰')}</label><input id="keyIn" class="field" type="password" autocomplete="off" value="${esc((S.settings.keys || {})[p] || '')}" placeholder="貼上你的金鑰">
  <button class="btn solid block" data-act="testKey" data-ctx="${context}" style="margin-top:10px">${S.ui.busy.key ? '<span class="spin"></span> 測試中…' : '測試並儲存'}</button>${S.ui.obMsg ? `<p class="small" role="status" style="margin:8px 0 0">${esc(S.ui.obMsg)}</p>` : ''}`;
}

function viewSettings() {
  const p = S.settings.provider;
  return `<main class="screen"><div class="topbar"><button class="back" data-act="back">${I.back}返回</button></div><h1 class="serif" style="margin:6px 0 18px;font-size:32px">設定</h1>
  <p class="sec">${tt('Language', '語言')}</p>${langSwitch()}<p class="muted tiny" style="margin:6px 0 18px">${tt('New notes from the AI will be written in this language.', 'AI 之後寫的解說會用這個語言。')}</p>
  <p class="sec" id="aiSec">解說用的 AI</p><p class="small" style="margin:-4px 0 10px">${hasAI() ? `<span class="chip" style="background:var(--sage)">${tt('AI mode is on', 'AI 模式已開啟')}</span>` : `<span class="chip" style="background:var(--butter)">${tt('Basic mode', '基本模式')}</span> ${tt('Add a key below to turn on AI.', '在下面貼上金鑰，就會開啟 AI。')}`}</p>${aiSetupHtml('settings')}
  <div class="card" style="margin-top:14px;background:var(--sage)"><strong>自動備援</strong><p class="small" style="margin:4px 0 8px">兩把以上的金鑰都設定好，主要的 AI 忙碌、太慢或連不上時，會自動改用另一個，不用自己切換。</p>
  <div class="row wrap">${Object.entries(AI.PROVIDERS).map(([k, v]) => `<span class="chip" style="background:var(--card)">${v.name}：${(S.settings.keys || {})[k] ? (k === S.settings.provider ? '主要' : '備用') : '未設定'}</span>`).join('')}</div>
  <p class="muted tiny" style="margin:8px 0 0">想加備用的 AI：點上面的名稱切換過去，貼上金鑰測試後，再點回你想當主要的那個。</p></div>
  <details style="margin-top:12px"><summary class="small" style="min-height:44px;display:flex;align-items:center;cursor:pointer">進階：模型名稱</summary><label class="lab" for="modelIn">${AI.PROVIDERS[p].name} 模型（看不懂可以不用改）</label><div class="row"><input id="modelIn" class="field" value="${esc((S.settings.models || {})[p] || AI.PROVIDERS[p].model)}"><button class="btn" data-act="saveModel">存</button></div></details>
  <p class="sec" style="margin-top:26px">解說長度</p><div class="row">${[['short', '簡短'], ['deep', '深入']].map(([k, l]) => `<button class="opt ${S.settings.length === k ? 'on' : ''}" data-act="length" data-v="${k}">${l}</button>`).join('')}</div>
  <p class="sec" style="margin-top:26px">備份</p><p class="small" style="margin:0 0 10px">照片和資料只存在這支手機的瀏覽器裡。換手機或清除 Safari 資料前，記得先匯出備份。建議每天看完展匯出一次。</p>
  <div class="row wrap"><button class="btn solid" data-act="exportData">${S.ui.busy.export ? '<span class="spin"></span> 匯出中…' : '匯出備份'}</button><button class="btn" data-act="importData">匯入備份</button></div><p class="muted tiny" id="storageInfo" style="margin:8px 0 0"></p>
  <p class="sec" style="margin-top:26px">加到主畫面</p><p class="small" style="margin:0">iPhone：用 Safari 打開，按下方的「分享」，選「加入主畫面」。Android：Chrome 選單裡選「安裝應用程式」。</p>
  <p class="sec" style="margin-top:26px">隱私</p><div class="card" style="background:var(--sage)">照片和資料都存在你的手機裡，這個 app 沒有伺服器。只有在辨識照片、轉錄語音、整理美感 DNA 時，才會把需要的內容直接送給你選的 AI。地點名稱會向 OpenStreetMap 查詢。${GC_CODE ? tt(' We count anonymous visits (for example, how many people opened the app or shared a work) to improve it. No photos, text or keys are ever included.', '另外會匿名統計使用次數（例如有多少人打開、分享），用來改善 app，不包含任何照片、文字或金鑰。') : ''}</div>
  <p class="sec" style="margin-top:26px">版本</p><div class="row wrap"><span class="small">目前版本 ${APP_VERSION}</span><button class="btn white" data-act="checkUpdate" style="min-height:44px;font-size:14px">${I.refresh}檢查更新</button></div>
  ${GC_CODE ? `<label class="row" style="margin-top:12px;min-height:44px;gap:10px;cursor:pointer"><input type="checkbox" data-act="toggleTrack" ${S.settings.noTrack ? 'checked' : ''} style="width:22px;height:22px;accent-color:var(--primary)"><span class="small">${tt('Do not count visits from this phone (for the app owner)', '不要統計這支手機的使用（給 app 擁有者自己用）')}</span></label>` : ''}
  <button class="linkbtn" data-act="resetAll" style="color:var(--accent);margin-top:20px">清除這支手機上的所有資料</button></main>${nav('home')}`;
}

const WALL_ART = `<svg role="img" aria-label="${'%ART%'}" width="100%" height="260" viewBox="0 0 342 300" style="display:block;margin:0 auto;max-width:342px">
<line x1="0" y1="286" x2="342" y2="286" stroke="#C2A878"/>
<g class="hang"><path d="M120 270V112a66 66 0 0 1 132 0v158z" fill="#FFFDF8" stroke="#C2A878" stroke-width="1.5"/><path d="M130 262V114a56 56 0 0 1 112 0v148z" fill="#F7EDCF"/><path d="M136 262c10-40 46-52 64-30 14 18 30 6 36-14v44z" fill="#B9CBB0"/><circle cx="200" cy="120" r="24" fill="#E8BFB3"/><path d="M150 150c12-26 10-50 30-62-6 24 8 34-2 58-6 14-20 16-28 4z" fill="#4F6652" opacity=".85"/><path d="M214 196l6 16 17-1-13 10 6 16-16-9-13 11 3-17-14-10 17-1z" fill="#C9A85A"/></g>
<g class="hang2"><rect x="18" y="128" width="84" height="104" fill="#FFFDF8" stroke="#C2A878" stroke-width="1.5"/><rect x="26" y="136" width="68" height="88" fill="#E1E8F0"/><path d="M60 146c6 8-3 12 4 18 9-4 13 3 8 8-6 3-10 1-10 8 7-1 13 6 6 10-6 3-9-1-12 4 6 2 8 9 1 10-4 0-6-4-9-1 1 8-3 13-7 13-3-7 1-12-4-16-6 3-12-3-6-7 4-3 7 0 9-6-6 0-10-6-4-10 4-3 7 1 9-4-4-3-4-10 1-10 3 0 4 3 6 0-1-6 3-10 8-14z" fill="#9C5B55" opacity=".8"/></g>
<g class="hang3"><ellipse cx="292" cy="170" rx="34" ry="44" fill="#FFFDF8" stroke="#C2A878" stroke-width="1.5"/><ellipse cx="292" cy="170" rx="26" ry="35" fill="#F4E3DD"/><path d="M280 158c10-6 22 0 22 12s-10 20-20 16c8-2 12-8 10-14s-8-10-12-14z" fill="#3E5A7A" opacity=".85"/></g>
<path d="M30 268c10-18 30-18 40 0" fill="none" stroke="#C2A878"/><circle cx="316" cy="96" r="5" fill="#EBCF8A"/><circle cx="40" cy="96" r="3" fill="#E8BFB3"/></svg>`;
function langSwitch() {
  const en = I18N.lang === 'en';
  return `<div role="radiogroup" aria-label="Language / 語言" class="langsw"><button class="lang ${en ? 'on' : ''}" role="radio" aria-checked="${en}" data-act="setLang" data-v="en">EN</button><button class="lang ${en ? '' : 'on'}" role="radio" aria-checked="${!en}" data-act="setLang" data-v="zh">中文</button></div>`;
}
function viewOnboarding() {
  const st = S.ui.ob;
  const dots = [0, 1, 2].map(i => `<span class="dot ${i <= Math.min(st, 2) ? 'on' : ''}"></span>`).join('');
  let h = `<main class="screen nonav" style="padding-top:calc(10px + var(--safe-t))"><div class="row" style="justify-content:space-between;align-items:center"><div class="row" style="gap:6px" aria-label="${tt('Setup progress', '設定進度')}">${dots}</div>${langSwitch()}</div>`;
  if (st === 0) {
    const nm = (S.ui.obNameDraft ?? S.settings.name ?? '').trim();
    h += `<div class="usr" style="margin-top:6px">${WALL_ART.replace('%ART%', tt('Three framed artworks on a gallery wall', '牆上掛著三幅裱框的畫'))}</div>
    <div class="row" style="justify-content:center;gap:10px;margin-top:8px"><h1 class="serif" style="margin:0;font-size:44px;line-height:1.1">My Gallery</h1><span class="beta">BETA</span></div>
    <div style="text-align:center">${I.flourish}</div>
    <p class="serif" style="margin:0 auto;max-width:300px;text-align:center;font-size:22px;line-height:1.45">${tt('The art you love, gathered into a gallery of your own.', '把你遇見的美，收進自己的畫廊。')}</p>
    <label class="lab" for="obName" style="margin-top:24px">${tt('What should we call you?', '怎麼稱呼你？')}</label>
    <input id="obName" class="field" maxlength="16" value="${esc(nm)}" placeholder="${tt('e.g. Ruby', '例如：Ruby')}" data-input="obName">
    <p class="muted small" style="margin:6px 0 0">${tt('Your gallery: ', '你的畫廊：')}<strong style="color:var(--ink)" id="obPreview">${esc(nm ? (I18N.lang === 'en' ? nm + "'s Gallery" : nm + ' 的畫廊') : tt('My Gallery', '我的畫廊'))}</strong></p>
    <button class="btn solid block" data-act="obName" style="margin-top:18px">${tt('Open my gallery', '打開我的畫廊')}</button>
    <p class="muted tiny" style="text-align:center;margin:12px 0 0">${tt('Beta · Your photos stay on your phone.', '測試版・照片只存在你的手機裡')}</p>`;
  }
  if (st === 1) h += `<p class="sec" style="margin-top:22px">${tt('Step', '步驟')} 1 / 2</p><h1 class="serif" style="font-size:30px;margin:0 0 6px">${tt('Set up your AI', '設定你的 AI')} <span class="beta" style="vertical-align:middle;background:var(--sage)">${tt('Recommended', '建議')}</span></h1><p style="margin:0 0 12px">${tt('We recommend it: AI recognizes each artwork and writes short notes for you. You can also start without it and add a key any time in Settings.', '建議設定：AI 會幫你認出每件作品、寫簡短解說。也可以先不設定，之後隨時在設定裡加上。')}</p>
    <div class="grid2" style="gap:8px;margin-bottom:14px"><div class="note" style="background:var(--sage);margin:0"><strong>${tt('Without a key', '沒有金鑰也能')}</strong><ul style="margin:4px 0 0;padding-left:18px">${[tt('Photos sorted by place and date', '照片依地點和日期整理'), tt('Name works yourself', '自己替作品命名'), tt('Notes, voice notes, favorites', '寫感想、錄音、標最喜歡'), tt('Footprints map', '足跡地圖'), tt('Your colors', '我的色彩')].map(x => `<li>${x}</li>`).join('')}</ul></div><div class="note" style="background:var(--butter);margin:0"><strong>${tt('With a key', '有金鑰還會')}</strong><ul style="margin:4px 0 0;padding-left:18px">${[tt('Recognizes the artwork', '自動認出作品'), tt('Notes and what to look for', '解說和觀賞重點'), tt('Groups photos of a work', '同一件作品收在一起'), tt('Taste DNA and picks', '美感 DNA 和推薦'), tt('Voice notes to text', '語音轉成文字')].map(x => `<li>${x}</li>`).join('')}</ul></div></div>
    ${aiSetupHtml('ob')}
    <div class="note" style="margin-top:14px"><strong>${tt('Tip: add a backup AI', '小提醒：可以加一個備用 AI')}</strong><br>${tt('If you add a key for another AI later in Settings, My Gallery switches to it automatically when the first one is busy.', '之後在設定裡再加一把其他 AI 的金鑰，主要的 AI 忙碌時，會自動改用另一個。')}</div>
    <div style="display:flex;flex-direction:column;gap:6px;margin-top:16px">${(S.settings.keys || {})[S.settings.provider] ? `<button class="btn solid block" data-act="ob" data-v="2">${tt('Next', '下一步')}</button>` : ''}<button class="btn ghost block" data-act="ob" data-v="2">${tt('Start in basic mode for now', '先用基本模式開始')}</button><button class="btn ghost block" data-act="ob" data-v="0">${tt('Back', '上一步')}</button></div>`;
  if (st === 2) h += `<p class="sec" style="margin-top:22px">${tt('Step', '步驟')} 2 / 2</p><h1 class="serif" style="font-size:30px;margin:0 0 10px">${tt('Add it to your Home Screen', '放到手機主畫面')}</h1><p>${tt('It will open like a regular app, and your photos are less likely to be cleared.', '這樣打開就像一般的 app，照片也比較不會被系統清掉。')}</p>
    <ol class="steps"><li>${tt('Open this page in Safari', '用 Safari 打開這個網頁')}</li><li>${tt('Tap the Share button at the bottom', '按下方中間的「分享」按鈕')}</li><li>${tt('Choose "Add to Home Screen", then tap Add', '選「加入主畫面」，再按「新增」')}</li></ol>
    <p class="muted small">${tt('Android: in the Chrome menu, choose "Install app".', 'Android：在 Chrome 選單裡選「安裝應用程式」。')}</p>
    <div class="note" style="margin-top:8px">${tt('When you take photos, please allow Camera and Location so the AI can tell where you are.', '拍照時請允許使用相機和位置，AI 才能判斷你在哪裡。')}</div>
    <div class="note" style="margin-top:8px;background:var(--pink)">${tt('Your gallery lives only on this phone. Export a backup in Settings now and then.', '你的畫廊只存在這支手機裡，記得偶爾到設定匯出備份。')}</div>
    <button class="btn solid block" data-act="obDone" style="margin-top:16px">${tt('Done', '完成')}</button><button class="btn ghost block" data-act="ob" data-v="1">${tt('Back', '上一步')}</button>`;
  return h + `</main>`;
}

/* 正在輸入文字時，背景工作（辨識、轉文字）先不重畫畫面，免得鍵盤被收掉、字不見 */
let RENDER_WAIT = false;
const typing = () => { const a = document.activeElement; return !!(a && a.closest && a.closest('#app') && (a.tagName === 'TEXTAREA' || (a.tagName === 'INPUT' && a.type !== 'file'))); };
function bgRender() { if (typing()) { RENDER_WAIT = true; return; } render(); }
document.addEventListener('focusout', () => { setTimeout(() => { if (RENDER_WAIT && !typing()) { RENDER_WAIT = false; render(); } }, 400); });
const VIEWS = { home: viewHome, place: viewPlace, work: viewWork, camera: viewCamera, summary: viewSummary, map: viewMap, dna: viewDna, settings: viewSettings };
/* 相機：在 app 裡直接顯示鏡頭畫面 */
const CAM = { stream: null, live: false, error: '', starting: false };
async function startCam() {
  if (CAM.stream || CAM.starting) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { CAM.failed = true; CAM.error = '這個瀏覽器無法在 app 裡開鏡頭，按中間的按鈕會改用 iPhone 相機。'; render(); return; }
  CAM.starting = true;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 3840 }, height: { ideal: 2160 } }, audio: false });
    if (S.route.name !== 'camera') { stream.getTracks().forEach(t => t.stop()); return; }
    let v = $('#camVideo');
    if (!v) { v = document.createElement('video'); v.id = 'camVideo'; v.setAttribute('playsinline', ''); v.muted = true; v.autoplay = true; document.body.prepend(v); }
    v.srcObject = stream; await v.play().catch(() => {});
    CAM.stream = stream; CAM.live = true; CAM.error = ''; document.body.classList.add('camlive');
  } catch (e) {
    CAM.live = false; CAM.failed = true;
    CAM.error = e.name === 'NotAllowedError' ? '沒有相機權限。可以到 iPhone「設定 › Safari › 相機」改成「允許」；或直接按中間的按鈕，用 iPhone 相機拍。' : '鏡頭暫時打不開，按中間的按鈕會改用 iPhone 相機拍。';
  }
  CAM.starting = false; render();
}
function stopCam() {
  if (CAM.stream) CAM.stream.getTracks().forEach(t => t.stop());
  CAM.stream = null; CAM.live = false; const v = $('#camVideo'); if (v) v.remove(); document.body.classList.remove('camlive');
}
async function snap() {
  const v = $('#camVideo'); if (!v || !v.videoWidth) return;
  const c = document.createElement('canvas'); c.width = v.videoWidth; c.height = v.videoHeight; c.getContext('2d').drawImage(v, 0, 0);
  const fl = document.createElement('div'); fl.className = 'flash'; document.body.appendChild(fl); setTimeout(() => fl.remove(), 350);
  if (navigator.vibrate) navigator.vibrate(20);
  const blob = await new Promise(r => c.toBlob(r, 'image/jpeg', 0.92));
  handleFiles([new File([blob], `photo-${Date.now()}.jpg`, { type: 'image/jpeg', lastModified: Date.now() })], true);
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') stopCam(); else if (S.route.name === 'camera') startCam(); });
function render() {
  const app = $('#app');
  if (S.route.name === 'camera' && S.settings.onboarded) { if (!CAM.failed) setTimeout(startCam, 0); } else { CAM.failed = false; CAM.error = ''; if (CAM.stream || $('#camVideo')) stopCam(); }
  app.innerHTML = !S.settings.onboarded ? viewOnboarding() : (VIEWS[S.route.name] || viewHome)();
  I18N.dom(app);
  const rk = S.settings.onboarded ? S.route.name + (S.route.p.id || '') : 'ob' + S.ui.ob;
  if (rk !== render.last) { const sc = app.querySelector('.screen,.cam'); if (sc) sc.classList.add('enter'); render.last = rk; }
  if (S.route.name === 'home' && S.ui.homeView === 'map' && S.settings.onboarded) initMap();
  if (S.route.name === 'settings') showStorage();
}
async function showStorage() {
  const el = $('#storageInfo'); if (!el || !navigator.storage || !navigator.storage.estimate) return;
  const e = await navigator.storage.estimate(); const persisted = navigator.storage.persisted ? await navigator.storage.persisted() : false;
  if ($('#storageInfo')) $('#storageInfo').textContent = `目前用了約 ${(e.usage / 1048576).toFixed(0)} MB・${persisted ? '已設為不會被自動清除' : '建議加到主畫面，比較不會被系統清除'}`;
}

/* ---------- 照片處理 ---------- */
function getLocation() {
  return new Promise(res => {
    if (!navigator.geolocation) return res(null);
    navigator.geolocation.getCurrentPosition(p => res({ lat: p.coords.latitude, lng: p.coords.longitude }), () => res(null), { enableHighAccuracy: false, timeout: 7000, maximumAge: 120000 });
  });
}
const GEO = new Map();
async function reverseCity(loc) {
  if (!loc || !navigator.onLine) return null;
  const k = loc.lat.toFixed(2) + ',' + loc.lng.toFixed(2);
  if (GEO.has(k)) return GEO.get(k);
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 6000);
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=14&accept-language=zh-Hant-TW,zh-TW;q=0.9,en;q=0.6&lat=${loc.lat}&lon=${loc.lng}`, { signal: ctl.signal });
    clearTimeout(t); const j = await r.json(); const a = j.address || {};
    const out = { city: ZH.tw(a.city || a.town || a.village || a.municipality || a.county || a.state || null), country: ZH.tw(a.country || null) };
    GEO.set(k, out); return out;
  } catch (e) { return null; }
}
function currentSession(takenAt, loc) {
  const s = S.session; if (!s) return null;
  if (ymd(s.lastAt) !== ymd(takenAt)) return null;
  if (Math.abs(takenAt - s.lastAt) > 3 * 3600e3) return null;
  const d = dist(loc, s); if (d != null && d > 1.2) return null;
  return placeOf(s.placeId) ? s : null;
}
function setSession(placeId, loc, takenAt) { S.session = { placeId, lastAt: takenAt, lat: loc ? loc.lat : (S.session && S.session.placeId === placeId ? S.session.lat : null), lng: loc ? loc.lng : (S.session && S.session.placeId === placeId ? S.session.lng : null) }; DB.setKV('session', S.session); }
async function newPlace(fields) { const pl = { id: uid(), createdAt: Date.now(), ...fields }; S.places.push(pl); await savePlace(pl); return pl; }
async function walkPlace(city, loc) {
  const name = I18N.lang === 'en' ? `${city || 'Street'} Streets` : (city || '路上') + '街頭';
  const f = S.places.find(p => p.kind === 'walk' && norm(p.city || '') === norm(city || '') && (city || (dist(loc, p) != null && dist(loc, p) < 3)));
  return f || newPlace({ kind: 'walk', name, city: city || '', lat: loc ? loc.lat : null, lng: loc ? loc.lng : null });
}
async function mergeDuplicatePlaces() {
  const groups = new Map();
  for (const p of S.places) { const k = norm(p.name); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(p); }
  for (const list of groups.values()) {
    if (list.length < 2) continue;
    list.sort((a, b) => (b.kind === 'museum') - (a.kind === 'museum') || worksAt(b.id).length - worksAt(a.id).length);
    const keep = list[0];
    for (const dup of list.slice(1)) {
      for (const w of S.works.filter(w => w.placeId === dup.id)) { w.placeId = keep.id; await saveWork(w); }
      for (const ph of S.photos.filter(ph => ph.placeId === dup.id)) { ph.placeId = keep.id; await savePhoto(ph); }
      if (!keep.coverPhotoId && dup.coverPhotoId) keep.coverPhotoId = dup.coverPhotoId;
      if (keep.lat == null && dup.lat != null) { keep.lat = dup.lat; keep.lng = dup.lng; }
      if (!keep.nameOriginal && dup.nameOriginal) keep.nameOriginal = dup.nameOriginal;
      if (S.session && S.session.placeId === dup.id) S.session.placeId = keep.id;
      S.places = S.places.filter(p => p.id !== dup.id); await DB.del('places', dup.id);
    }
    if (keep.kind !== 'museum' && list.some(p => p.kind === 'museum')) keep.kind = 'museum';
    await savePlace(keep);
  }
}
async function basicPlace(city, loc) {
  const f = S.places.find(p => (city && norm(p.city || '') === norm(city)) || (dist(loc, p) != null && dist(loc, p) < 1));
  return f || newPlace({ kind: 'walk', name: city || tt('Somewhere', '某個地方'), city: city || '', lat: loc ? loc.lat : null, lng: loc ? loc.lng : null });
}
async function museumPlace(r, loc, city) {
  const f = S.places.find(p => (norm(p.name) === norm(r.museum) || (r.museumOriginal && norm(p.nameOriginal) === norm(r.museumOriginal)) || (p.kind === 'museum' && dist(loc, p) != null && dist(loc, p) < 0.3)));
  return f || newPlace({ kind: 'museum', name: r.museum, nameOriginal: r.museumOriginal || '', city: r.city || city || '', lat: loc ? loc.lat : null, lng: loc ? loc.lng : null });
}
function applyAI(w, r, opts = {}) {
  const keep = (a, b) => (b != null && b !== '' ? b : a);
  Object.assign(w, {
    title: keep(w.title, r.title), titleOriginal: keep(w.titleOriginal, r.titleOriginal), artist: keep(w.artist, r.artist), artistOriginal: keep(w.artistOriginal, r.artistOriginal),
    year: keep(w.year, r.year), medium: keep(w.medium, r.medium), short: keep(w.short, r.short), lookFor: (r.lookFor && r.lookFor.length) ? r.lookFor : (w.lookFor || []), long: keep(w.long, r.long), labelText: keep(w.labelText, r.labelText),
    confidence: r.confidence || w.confidence || 'medium', isCopy: !!r.isCopy, dims: r.dims || w.dims, subjects: (r.subjects && r.subjects.length) ? r.subjects : (w.subjects || []),
    kind: r.isStreet ? 'street' : 'artwork', aiProvider: AI.state.lastProvider || S.settings.provider, status: 'ready', error: ''
  });
  if (opts.fromLabel) { w.labelUsed = true; if (w.confidence === 'low') w.confidence = 'high'; }
}
function candidatesFor(placeId) { return placeId ? worksAt(placeId).filter(w => w.status === 'ready').sort((a, b) => lastAt(b) - lastAt(a)).slice(0, 40).map(w => ({ id: w.id, title: w.title + (w.titleOriginal ? ' / ' + w.titleOriginal : ''), artist: w.artist })) : []; }

/* 照片先存起來（很快），辨識交給背景佇列：離開相機、關掉 app 都不會遺失 */
async function processFile(file, fromCamera) {
  const q = { id: uid(), status: 'prep', thumb: null }; S.queue.push(q); bgRender();
  try {
    const exif = await readExif(file);
    const prep = await prepareImage(file);
    const takenAt = exif.time || (fromCamera ? Date.now() : (file.lastModified || Date.now()));
    const loc = exif.lat != null ? { lat: exif.lat, lng: exif.lng } : (fromCamera ? await getLocation() : null);
    const photo = { id: uid(), workId: null, placeId: null, type: '作品', blob: prep.full, thumb: prep.thumb, w: prep.w, h: prep.h, takenAt, lat: loc ? loc.lat : null, lng: loc ? loc.lng : null, createdAt: Date.now(), fromCamera: !!fromCamera };
    const sess = currentSession(takenAt, loc);
    let placeId = sess ? sess.placeId : null;
    if (!hasAI()) {
      // 基本模式：沒有 AI，也先依地點和日期整理
      if (!placeId) { const geo = await reverseCity(loc); const pl = await basicPlace(geo && geo.city, loc); placeId = pl.id; }
      setSession(placeId, loc, takenAt);
      // 45 秒內連拍的照片，通常是同一件作品（作品、細節、說明牌）
      const near = S.photos.filter(x => x.workId && Math.abs(x.takenAt - takenAt) < 45000).sort((a, b) => b.takenAt - a.takenAt)[0];
      const nw = near && workOf(near.workId);
      if (nw && nw.placeId === placeId && nw.queued && nw.status === 'pending') {
        photo.workId = nw.id; S.photos.push(photo); await savePhoto(photo); S.last = fromCamera ? { workId: nw.id, grouped: true } : S.last;
        throw { grouped: true };
      }
    }
    const w = { id: uid(), placeId, title: hasAI() ? '辨識中的作品' : untitled(), status: 'pending', queued: true, thoughts: [], fav: false, createdAt: Date.now() };
    S.works.push(w); await saveWork(w);
    photo.workId = w.id; S.photos.push(photo); await savePhoto(photo);
    if (fromCamera && !hasAI()) S.last = { workId: w.id };
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  } catch (e) { if (!e || !e.grouped) toast('這張照片打不開：' + (e && e.message)); }
  S.queue = S.queue.filter(x => x !== q);
  bgRender();
}
let QRUN = false, QTIMER = null;
const queuedWorks = () => S.works.filter(w => w.status === 'pending' && w.queued);
async function runQueue() {
  if (QRUN || !hasAI()) return; QRUN = true; clearTimeout(QTIMER);
  try {
    while (true) {
      const list = queuedWorks().filter(w => !w.hold).map(w => ({ w, p: photosOf(w.id)[0] })).filter(x => x.p && !x.p.broken).sort((a, b) => a.p.takenAt - b.p.takenAt);
      if (!list.length) break;
      const { w, p } = list[0]; S.working = w.id; bgRender();
      const loc = p.lat != null ? { lat: p.lat, lng: p.lng } : null;
      const sess = currentSession(p.takenAt, loc);
      const geo = await reverseCity(loc);
      let r = null, err = null;
      try { const prep = await prepareImage(p.blob); r = await AI.analyzePhoto(S.settings, { imageB64: prep.aiData, takenAt: p.takenAt, placeHint: sess ? placeOf(sess.placeId).name : null, cityHint: geo && geo.city, candidates: candidatesFor(sess && sess.placeId) }); }
      catch (e) { err = e; }
      if (!r) {
        w.error = err.message; w.attempts = (w.attempts || 0) + 1; await saveWork(w);
        const stopAll = ['nokey', 'offline', 'network'].includes(err.code);
        const later = err.code === 'timeout' || err.status === 429 || err.status >= 500;
        if (stopAll) { if (err.code === 'nokey') toast('還沒設定 AI 金鑰，照片都先存起來了。到設定貼上金鑰就會開始辨識。', 5000); break; }
        w.hold = true; // 先跳過這張，繼續下一張
        if (later) { clearTimeout(QTIMER); QTIMER = setTimeout(() => { queuedWorks().forEach(x => { x.hold = false; }); runQueue(); }, 60000); }
        continue;
      }
      // 辨識成功：拿掉暫時的作品，照片依 AI 結果收進正確的地點和作品
      const prevLast = S.last;
      const others = photosOf(w.id).filter(x => x.id !== p.id);
      S.works = S.works.filter(x => x.id !== w.id); await DB.del('works', w.id);
      S.photos = S.photos.filter(x => x.id !== p.id); p.workId = null;
      await integrate(p, r, { sess, loc, geo, takenAt: p.takenAt });
      if (others.length) {
        let target = p.workId && workOf(p.workId);
        if (!target) { target = { ...w, title: hasAI() ? '辨識中的作品' : w.title }; S.works.push(target); await saveWork(target); }
        for (const o of others) { o.workId = target.id; await savePhoto(o); }
      }
      if (w.userEdited && p.workId) { const t = workOf(p.workId); if (t) { Object.assign(t, { title: w.title, titleOriginal: w.titleOriginal || t.titleOriginal, artist: w.artist || t.artist, artistOriginal: w.artistOriginal || t.artistOriginal, userEdited: true }); await saveWork(t); } }
      // 等待辨識時留下的感想、愛心，跟著照片搬到正式的作品
      const nw = p.workId && workOf(p.workId);
      if (nw && ((w.thoughts || []).length || w.fav)) { nw.thoughts = [...(w.thoughts || []), ...(nw.thoughts || [])]; nw.fav = nw.fav || w.fav; await saveWork(nw); }
      if (!p.fromCamera) S.last = prevLast;
      if (S.route.name === 'work' && S.route.p.id === w.id && p.workId) { S.route = { name: 'work', p: { id: p.workId } }; }
    }
  } finally {
    QRUN = false; S.working = null;
    for (const pl of [...S.places]) if (!worksAt(pl.id).length && !S.photos.some(p => p.placeId === pl.id)) { S.places = S.places.filter(x => x.id !== pl.id); await DB.del('places', pl.id); if (S.session && S.session.placeId === pl.id) S.session = null; }
    bgRender();
  }
}
async function integrate(photo, r, ctx) {
  const { sess, loc, geo, takenAt, err } = ctx;
  const sessPlace = sess && placeOf(sess.placeId);
  const city = (r && r.city) || (geo && geo.city) || '';
  let place;
  if (!r) {
    place = sessPlace || await walkPlace(city, loc);
    const w = { id: uid(), placeId: place.id, title: '待辨識的作品', status: 'pending', error: err ? err.message : '', thoughts: [], createdAt: Date.now(), fav: false };
    S.works.push(w); await saveWork(w);
    photo.workId = w.id; S.photos.push(photo); await savePhoto(photo);
    setSession(place.id, loc, takenAt); S.last = { workId: w.id };
    if (err && err.code === 'nokey') toast('還沒設定 AI 金鑰，照片先存起來了。到設定裡貼上金鑰就能辨識。', 5000);
    else if (err) toast(err.message + '照片先存起來了。', 4500);
    return;
  }
  photo.type = TYPES.includes(r.photoType) ? r.photoType : '作品';
  if (sessPlace && sessPlace.kind === 'museum' && !(r.isStreet && photo.type !== '館外照')) place = sessPlace;
  else if (r.museum && (!r.isStreet || photo.type === '館外照')) place = await museumPlace(r, loc, city);
  else if (r.isStreet) place = (sessPlace && sessPlace.kind === 'walk') ? sessPlace : await walkPlace(city, loc);
  else place = sessPlace || await walkPlace(city, loc);
  if (place.lat == null && loc) { place.lat = loc.lat; place.lng = loc.lng; await savePlace(place); }
  setSession(place.id, loc, takenAt);
  if (photo.type === '館外照') {
    photo.placeId = place.id; S.photos.push(photo); await savePhoto(photo);
    if (!place.coverPhotoId) { place.coverPhotoId = photo.id; await savePlace(place); }
    S.last = { facade: true }; return;
  }
  let w = r.sameWorkId && S.works.find(x => x.id === r.sameWorkId && x.placeId === place.id);
  if (!w && photo.type === '說明牌' && r.title) w = worksAt(place.id).find(x => norm(x.title) === norm(r.title) || (r.titleOriginal && norm(x.titleOriginal) === norm(r.titleOriginal)));
  if (w) {
    if (photo.type === '說明牌' || (w.confidence === 'low' && r.confidence === 'high')) applyAI(w, r, { fromLabel: photo.type === '說明牌' });
    photo.workId = w.id; S.photos.push(photo); await savePhoto(photo); await saveWork(w);
    S.last = { workId: w.id, grouped: true }; return;
  }
  w = { id: uid(), placeId: place.id, thoughts: [], fav: false, createdAt: Date.now() };
  applyAI(w, r, { fromLabel: photo.type === '說明牌' });
  S.works.push(w); await saveWork(w);
  photo.workId = w.id; S.photos.push(photo); await savePhoto(photo);
  S.last = { workId: w.id };
}
async function handleFiles(files, fromCamera) {
  const arr = [...files]; if (!arr.length) return;
  track(fromCamera ? 'photo-camera' : 'photo-import');
  if (!fromCamera) toast(!hasAI() ? tt(`Got ${arr.length} photo(s). Sorting them by place and date.`, `收到 ${arr.length} 張照片，正在依地點和日期整理。`) : arr.length > 1 ? `收到 ${arr.length} 張照片，正在背景辨識。可以先去看別的，關掉 app 也不會遺失。` : '收到照片，正在背景辨識。', 4500);
  for (const f of arr) await processFile(f, fromCamera);
  runQueue();
}
async function reanalyze(w, useCandidates = false) {
  const ps = photosOf(w.id); if (!ps.length) return;
  S.ui.busy[w.id] = true; bgRender();
  try {
    const label = ps.find(p => p.type === '說明牌'); const main = mainPhoto(w);
    const pl = placeOf(w.placeId);
    let r = null;
    for (const p of [main, label].filter((x, i, a) => x && a.indexOf(x) === i)) {
      const prep = await prepareImage(p.blob);
      const rr = await AI.analyzePhoto(S.settings, { imageB64: prep.aiData, takenAt: p.takenAt, placeHint: pl && pl.name, cityHint: pl && pl.city, candidates: useCandidates ? candidatesFor(w.placeId).filter(c => c.id !== w.id) : [] });
      if (!r || p === label) { r = r ? { ...r, ...Object.fromEntries(Object.entries(rr).filter(([k, v]) => v != null && v !== '' && !['photoType', 'sameWorkId', 'short', 'long'].includes(k))) } : rr; }
      if (p === main) p.type = TYPES.includes(rr.photoType) && rr.photoType !== '說明牌' ? rr.photoType : p.type;
    }
    if (w.title && w.title !== '待辨識的作品' && w.userEdited) { r.title = w.title; r.artist = w.artist || r.artist; }
    applyAI(w, r, { fromLabel: !!label });
    if (pl && pl.kind === 'walk' && r.museum && !r.isStreet) { const mp = await museumPlace(r, { lat: pl.lat, lng: pl.lng }, pl.city); if (mp.id !== pl.id) w.placeId = mp.id; }
    await saveWork(w); toast('整理好了。');
  } catch (e) { w.error = e.message; await saveWork(w); toast(e.message); }
  delete S.ui.busy[w.id]; bgRender();
}
async function retryPending() {
  if (S.ui.busy.retry || !navigator.onLine || !(S.settings.keys || {})[S.settings.provider]) return;
  queuedWorks().forEach(w => { w.hold = false; });
  runQueue();
  const old = S.works.filter(w => w.status === 'pending' && !w.queued); if (!old.length) return;
  S.ui.busy.retry = true; bgRender();
  for (const w of old) await reanalyze(w, true);
  delete S.ui.busy.retry; bgRender();
}

/* ---------- 錄音 ---------- */
const canTranscribe = () => !!(S.settings.keys || {}).gemini;
async function startRec(workId) {
  if (!workId) { toast('先拍一件作品，感想會存到那件作品裡。'); return; }
  if (!navigator.mediaDevices || !window.MediaRecorder) { toast('這個瀏覽器不支援錄音，可以改用寫的。'); return; }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mime = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '');
    const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined); const chunks = [];
    rec.ondataavailable = e => e.data.size && chunks.push(e.data);
    rec.onstop = () => finishRec(workId, new Blob(chunks, { type: rec.mimeType || mime || 'audio/mp4' }), stream);
    rec.start(); S.rec = { workId, rec, start: Date.now() }; render();
  } catch (e) { toast('需要允許使用麥克風才能錄音。'); }
}
function stopRec() { if (S.rec) { S.rec.rec.stop(); } }
async function finishRec(workId, blob, stream) {
  stream.getTracks().forEach(t => t.stop());
  const dur = Math.round((Date.now() - S.rec.start) / 1000); S.rec = null;
  const w = workOf(workId); if (!w) return bgRender();
  const t = { id: uid(), at: Date.now(), kind: 'voice', audio: blob, dur, text: canTranscribe() ? '轉成文字中…' : `（語音 ${dur} 秒）` };
  w.thoughts = [t, ...(w.thoughts || [])]; await saveWork(w); bgRender();
  if (canTranscribe()) {
    try { const text = await AI.transcribe(S.settings, { audioB64: await blobToBase64(blob), audioMime: blob.type.split(';')[0], workTitle: w.title }); t.text = String(text).trim(); toast(`感想已存到《${w.title}》`); }
    catch (e) { t.text = `（語音 ${dur} 秒，之後可以重新轉文字）`; toast(e.message); }
    await saveWork(w); bgRender();
  } else toast(`感想已存到《${w.title}》`);
}

/* ---------- 美感 DNA ---------- */
async function makeDna(reword) {
  const el = eligible(); if (el.length < 5) return;
  S.ui.busy.dna = true; bgRender();
  try {
    const ws = el.map(w => ({ w, wt: workWeight(w) })).sort((a, b) => b.wt - a.wt);
    const tot = ws.reduce((a, x) => a + x.wt, 0);
    const avg = {}; DIMS.forEach(([k]) => { avg[k] = +(ws.reduce((a, x) => a + (Number(x.w.dims[k]) || 3) * x.wt, 0) / tot).toFixed(2); });
    const sc = {}; ws.forEach(x => (x.w.subjects || []).forEach(s => { sc[s] = (sc[s] || 0) + x.wt; }));
    const subjects = Object.entries(sc).sort((a, b) => b[1] - a[1]).slice(0, 4).map(x => x[0]);
    const summary = ws.slice(0, 40).map(x => `- ${x.w.title}／${x.w.artist || '作者不明'}／${x.w.year || ''}／${(x.w.subjects || []).join('、')}${x.w.fav ? '／最喜歡' : ''}`).join('\n');
    const data = await AI.aestheticDna(S.settings, { summary, avgDims: avg, subjects, feedback: S.settings.feedback, prevNames: reword && S.dna ? [S.dna.data.name] : [] });
    let palette = (S.dna && S.dna.basis === el.length && S.dna.palette) || [];
    if (!palette.length) palette = await paletteFromBlobs(ws.map(x => { const ps = photosOf(x.w.id); const m = ps.find(p => p.type === '作品') || ps.find(p => p.type === '細節'); return m && m.thumb; }).filter(Boolean));
    track('dna-made');
    S.dna = { basis: el.length, data, palette, avg, subjects, at: Date.now() }; await DB.setKV('dna', S.dna);
  } catch (e) { toast(e.message); }
  delete S.ui.busy.dna; bgRender();
}
const APP_URL = 'rubykuan0418.github.io/my-gallery';
/* 使用人數統計（GoatCounter）：只記錄「有人打開、做了哪一類動作」，不含照片、文字、金鑰或任何個人資料 */
const GC_CODE = 'rubykuan'; // GoatCounter：https://rubykuan.goatcounter.com
function track(name, isEvent = true) {
  if (!GC_CODE || !navigator.onLine || S.settings.noTrack) return;
  try {
    const q = new URLSearchParams({ p: name, t: isEvent ? name : 'My Gallery', e: isEvent ? 'true' : 'false', b: '0', s: `${screen.width},${screen.height},${devicePixelRatio || 1}`, rnd: Math.random().toString(36).slice(2) });
    if (!isEvent && document.referrer) q.set('r', document.referrer);
    const u = `https://${GC_CODE}.goatcounter.com/count?${q}`;
    const img = new Image(); img.referrerPolicy = 'no-referrer-when-downgrade'; img.src = u;
  } catch (e) { /* ignore */ }
}
/* 美感 DNA 分享圖：三張卡片（我的美感／色彩與策展人筆記／美感輪廓與題材），每張都帶 app 網址 */
function blobPath(g, cx, cy, r, color) {
  const pts = [[48, 6], [78, 42], [72, 82], [30, 82], [8, 56], [12, 18]];
  g.fillStyle = color; g.beginPath();
  g.moveTo(cx + (48 - 50) * r / 45, cy + (6 - 50) * r / 45);
  g.bezierCurveTo(cx + (66 - 50) * r / 45, cy + (8 - 50) * r / 45, cx + (82 - 50) * r / 45, cy + (22 - 50) * r / 45, cx + (78 - 50) * r / 45, cy + (42 - 50) * r / 45);
  g.bezierCurveTo(cx + (75 - 50) * r / 45, cy + (58 - 50) * r / 45, cx + (88 - 50) * r / 45, cy + (72 - 50) * r / 45, cx + (72 - 50) * r / 45, cy + (82 - 50) * r / 45);
  g.bezierCurveTo(cx + (58 - 50) * r / 45, cy + (91 - 50) * r / 45, cx + (46 - 50) * r / 45, cy + (76 - 50) * r / 45, cx + (30 - 50) * r / 45, cy + (82 - 50) * r / 45);
  g.bezierCurveTo(cx + (14 - 50) * r / 45, cy + (88 - 50) * r / 45, cx + (2 - 50) * r / 45, cy + (72 - 50) * r / 45, cx + (8 - 50) * r / 45, cy + (56 - 50) * r / 45);
  g.bezierCurveTo(cx + (13 - 50) * r / 45, cy + (44 - 50) * r / 45, cx + (2 - 50) * r / 45, cy + (30 - 50) * r / 45, cx + (12 - 50) * r / 45, cy + (18 - 50) * r / 45);
  g.bezierCurveTo(cx + (20 - 50) * r / 45, cy + (8 - 50) * r / 45, cx + (34 - 50) * r / 45, cy + (4 - 50) * r / 45, cx + (48 - 50) * r / 45, cy + (6 - 50) * r / 45);
  g.fill(); return pts;
}
function cardBase(title, idx) {
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const g = c.getContext('2d');
  g.fillStyle = '#FBF7EF'; g.fillRect(0, 0, 1080, 1350);
  g.fillStyle = '#6B5D55'; g.font = '30px "Noto Sans TC", sans-serif'; g.fillText(`${S.settings.name || '我'}的美感 DNA`, 90, 120);
  g.textAlign = 'right'; g.fillText(`${idx} / 3`, 990, 120); g.textAlign = 'left';
  g.strokeStyle = '#C2A878'; g.lineWidth = 2; g.beginPath(); g.moveTo(90, 150); g.lineTo(990, 150); g.stroke();
  g.fillStyle = '#3A2F2A'; g.font = '600 46px "Noto Serif TC", serif'; g.fillText(title, 90, 230);
  // footer with app url
  g.fillStyle = '#F4EDE2'; g.fillRect(0, 1210, 1080, 140);
  g.fillStyle = '#3A2F2A'; g.font = '600 38px "Cormorant Garamond", "Noto Serif TC", serif'; g.fillText('My Gallery', 90, 1275);
  g.fillStyle = '#6B5D55'; g.font = '26px "Noto Sans TC", sans-serif'; g.fillText('把看展收藏，整理成你自己的畫廊', 90, 1315);
  g.textAlign = 'right'; g.fillStyle = '#4F6652'; g.font = '700 28px "Noto Sans TC", sans-serif'; g.fillText(APP_URL, 990, 1295); g.textAlign = 'left';
  return { c, g };
}
async function dnaCards() {
  try { await document.fonts.ready; } catch (e) { /* ignore */ }
  const D = S.dna, d = D.data; const out = [];
  // 1. 我的美感
  { const { c, g } = cardBase('我的美感', 1);
    g.fillStyle = '#F4E3DD'; g.beginPath(); g.roundRect(70, 290, 940, 860, [110, 50, 130, 40]); g.fill();
    g.fillStyle = '#3A2F2A'; g.font = '700 76px "Noto Serif TC", serif'; let y = wrap(g, d.name || '', 140, 430, 800, 98);
    g.fillStyle = '#6B5D55'; g.font = '32px "Noto Sans TC", sans-serif'; g.fillText((d.tags || []).join('  ·  '), 140, y + 90);
    g.fillStyle = '#3A2F2A'; g.font = '40px "Noto Sans TC", sans-serif'; wrap(g, d.oneLiner || '', 140, y + 190, 800, 64);
    g.fillStyle = '#6B5D55'; g.font = '28px "Noto Sans TC", sans-serif'; g.fillText(`依 ${D.basis} 件作品整理`, 140, 1100);
    out.push(c); }
  // 2. 我的色彩與策展人筆記
  { const { c, g } = cardBase('我的色彩・策展人筆記', 2);
    (D.palette || []).forEach((col, i) => blobPath(g, 170 + i * 185, 380, 72, col));
    g.fillStyle = '#6B5D55'; g.font = '26px "Noto Sans TC", sans-serif'; g.fillText('從我拍的作品照片計算', 90, 500);
    g.fillStyle = '#FFFDF8'; g.beginPath(); g.roundRect(70, 550, 940, 600, [40, 90, 40, 100]); g.fill();
    g.fillStyle = '#6B5D55'; g.font = '26px "Noto Sans TC", sans-serif'; g.fillText('策展人筆記', 130, 630);
    g.fillStyle = '#3A2F2A'; g.font = '600 44px "Noto Serif TC", serif'; let y = wrap(g, d.curatorTitle || '', 130, 710, 820, 62);
    g.font = '34px "Noto Sans TC", sans-serif'; wrap(g, d.curatorNote || '', 130, y + 80, 820, 56, 1130);
    out.push(c); }
  // 3. 美感輪廓與題材
  { const { c, g } = cardBase('我的美感輪廓・常收藏的題材', 3);
    const bgs = ['#F4E3DD', '#E3EADD', '#F7EDCF', '#E1E8F0', '#F7DFD3', '#F4E3DD'];
    DIMS.forEach(([k, l], i) => { const x = 70 + (i % 3) * 315, y = 290 + Math.floor(i / 3) * 210;
      g.fillStyle = bgs[i]; g.beginPath(); g.roundRect(x, y, 290, 180, [50, 24, 56, 20]); g.fill();
      g.fillStyle = '#6B5D55'; g.font = '26px "Noto Sans TC", sans-serif'; g.fillText(l, x + 30, y + 60);
      g.fillStyle = '#3A2F2A'; g.font = '700 40px "Noto Sans TC", sans-serif'; g.fillText(((d.dims || {})[k] || dimWord(k, D.avg[k])).slice(0, 7), x + 30, y + 125); });
    g.fillStyle = '#6B5D55'; g.font = '26px "Noto Sans TC", sans-serif'; g.fillText('常收藏的題材', 90, 790);
    let x = 90; (D.subjects || []).forEach(t => { g.font = '34px "Noto Sans TC", sans-serif'; const w = g.measureText(t).width + 60; if (x + w > 990) return;
      g.fillStyle = '#E3EADD'; g.beginPath(); g.roundRect(x, 815, w, 72, 30); g.fill(); g.fillStyle = '#3A2F2A'; g.fillText(t, x + 30, 863); x += w + 20; });
    const recs = (d.recs || []).slice(0, 2);
    if (recs.length) { g.fillStyle = '#6B5D55'; g.font = '26px "Noto Sans TC", sans-serif'; g.fillText('策展人推薦我認識', 90, 960);
      recs.forEach((r, i) => { g.fillStyle = '#3A2F2A'; g.font = '600 36px "Noto Serif TC", serif'; g.fillText(r.artist + (r.artistOriginal ? '  ' : ''), 90, 1020 + i * 70);
        if (r.artistOriginal) { const w = g.measureText(r.artist + '  ').width; g.fillStyle = '#6B5D55'; g.font = 'italic 32px "Cormorant Garamond", serif'; g.fillText(r.artistOriginal, 90 + w, 1020 + i * 70); } }); }
    out.push(c); }
  return Promise.all(out.map((c, i) => new Promise(r => c.toBlob(b => r(new File([b], `my-aesthetic-dna-${i + 1}.png`, { type: 'image/png' })), 'image/png'))));
}
/* 分享單一作品：照片＋我的感想（在上）＋作品介紹，一張 1080×1350 */
function linesOf(g, text, maxW) { let n = 0; for (const para of String(text).split('\n')) { let line = ''; n++; for (const ch of para) { if (g.measureText(line + ch).width > maxW) { n++; line = ch; } else line += ch; } } return n; }
async function workCard(w) {
  try { await document.fonts.ready; } catch (e) { /* ignore */ }
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const g = c.getContext('2d');
  g.fillStyle = '#FBF7EF'; g.fillRect(0, 0, 1080, 1350);
  const footY = 1210;
  const notes = (w.thoughts || []).filter(t => t.text && !/^（語音|^\(voice/.test(t.text));
  const noteText = notes.slice(0, 2).map(t => t.text).join('\n');
  g.font = '34px "Noto Sans TC", sans-serif';
  const noteLines = noteText ? Math.min(6, linesOf(g, noteText, 860)) : 0;
  const noteH = noteText ? 120 + noteLines * 52 : 0;
  g.font = '28px "Noto Sans TC", sans-serif';
  const aboutLines = w.short ? Math.min(3, linesOf(g, w.short, 900)) : 0;
  const aboutH = w.short ? 70 + aboutLines * 44 : 0;
  const o = origOf(w.title, w.titleOriginal);
  const headH = 62 + (o ? 46 : 0) + 40;
  const maxH = Math.max(300, Math.min(600, footY - 60 - 36 - 50 - headH - (noteH ? noteH + 30 : 0) - aboutH - 40));
  const m = mainPhoto(w); let top = 60;
  if (m && !m.broken) {
    const img = await loadImage(m.blob); const r = Math.min(900 / img.naturalWidth, maxH / img.naturalHeight);
    const iw = Math.round(img.naturalWidth * r), ih = Math.round(img.naturalHeight * r), ix = (1080 - iw) / 2;
    g.fillStyle = '#FFFDF8'; g.fillRect(ix - 18, top, iw + 36, ih + 36); g.strokeStyle = '#C2A878'; g.lineWidth = 2; g.strokeRect(ix - 18, top, iw + 36, ih + 36);
    g.drawImage(img, ix, top + 18, iw, ih); top += ih + 36;
  }
  let y = top + 70;
  g.fillStyle = '#3A2F2A'; g.font = '600 50px "Noto Serif TC", "Cormorant Garamond", serif'; y = wrap(g, w.title || '', 90, y, 900, 62, y) + 46;
  if (o) { g.fillStyle = '#6B5D55'; g.font = 'italic 34px "Cormorant Garamond", serif'; g.fillText(o.length > 48 ? o.slice(0, 47) + '…' : o, 90, y); y += 44; }
  const pl = placeOf(w.placeId);
  g.fillStyle = '#6B5D55'; g.font = '28px "Noto Sans TC", sans-serif'; g.fillText([w.artist || w.artistOriginal, w.year, pl && pl.name].filter(Boolean).join(' · ').slice(0, 60), 90, y); y += 30;
  if (noteText) {
    const boxTop = y + 24; const bottom = Math.min(boxTop + noteH, footY - aboutH - 20);
    g.fillStyle = '#F4E3DD'; g.beginPath(); g.roundRect(70, boxTop, 940, bottom - boxTop, [50, 22, 56, 18]); g.fill();
    g.fillStyle = '#9C5B55'; g.font = '700 26px "Noto Sans TC", sans-serif'; g.fillText(tt('My thoughts', '我的感想'), 110, boxTop + 54);
    g.fillStyle = '#3A2F2A'; g.font = '34px "Noto Sans TC", sans-serif'; let ty = boxTop + 110;
    for (const para of noteText.split('\n')) { if (ty > bottom - 30) break; ty = wrap(g, para, 110, ty, 860, 52, bottom - 30) + 52; }
    y = bottom + 10;
  }
  if (w.short && y < footY - 110) {
    g.fillStyle = '#6B5D55'; g.font = '700 24px "Noto Sans TC", sans-serif'; g.fillText(tt('About this work', '作品介紹'), 90, y + 44);
    g.fillStyle = '#3A2F2A'; g.font = '28px "Noto Sans TC", sans-serif'; wrap(g, w.short, 90, y + 90, 900, 44, footY - 36);
  }
  g.fillStyle = '#F4EDE2'; g.fillRect(0, footY, 1080, 140);
  const gname = S.settings.name ? (I18N.lang === 'en' ? `${S.settings.name}'s Gallery` : `${S.settings.name} 的畫廊`) : 'My Gallery';
  g.fillStyle = '#3A2F2A'; g.font = '600 38px "Cormorant Garamond", "Noto Serif TC", serif'; g.fillText(gname, 90, footY + 65);
  g.fillStyle = '#6B5D55'; g.font = '26px "Noto Sans TC", sans-serif'; g.fillText(tt('Made with My Gallery', '用 My Gallery 整理看展收藏'), 90, footY + 105);
  g.textAlign = 'right'; g.fillStyle = '#4F6652'; g.font = '700 28px "Noto Sans TC", sans-serif'; g.fillText(APP_URL, 990, footY + 85); g.textAlign = 'left';
  return new Promise(r => c.toBlob(b => r(new File([b], `my-gallery-${(w.titleOriginal || w.title || 'work').replace(/[^\w一-鿿]+/g, '-').slice(0, 40)}.png`, { type: 'image/png' })), 'image/png'));
}
async function shareWork(w) {
  track('share-work');
  toast(tt('Making your image…', '正在做分享圖…'));
  const f = await workCard(w);
  const text = `${w.title}${w.artist ? ' · ' + w.artist : ''}\n${tt('From my gallery · My Gallery', '來自我的畫廊・My Gallery')} https://${APP_URL}/`;
  if (navigator.canShare && navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], title: w.title, text }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  downloadBlob(f, f.name);
}
async function shareDna() {
  if (!S.dna || !S.dna.data) return;
  track('share-dna');
  toast('正在做分享圖…');
  const files = await dnaCards();
  if (navigator.canShare && navigator.canShare({ files })) { try { await navigator.share({ files, title: '我的美感 DNA', text: `我的美感 DNA・用 My Gallery 整理看展收藏：https://${APP_URL}/` }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  files.forEach((f, i) => setTimeout(() => downloadBlob(f, f.name), i * 400));
}
function wrap(g, text, x, y, maxW, lh, maxY = 99999) { let line = ''; for (const ch of String(text)) { if (g.measureText(line + ch).width > maxW) { if (y + lh > maxY) { g.fillText(line.slice(0, -1) + '…', x, y); return y; } g.fillText(line, x, y); line = ch; y += lh; } else line += ch; } if (line) g.fillText(line, x, y); return y; }
function downloadBlob(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000); }

/* ---------- 備份 ---------- */
async function exportData() {
  S.ui.busy.export = true; render();
  try {
    const photos = [];
    for (const p of S.photos) { if (p.broken) continue; photos.push({ ...p, blob: await blobToBase64(p.blob), thumb: await blobToBase64(p.thumb) }); }
    const works = [];
    for (const w of S.works) works.push({ ...w, thoughts: await Promise.all((w.thoughts || []).map(async t => t.audio ? { ...t, audio: await blobToBase64(t.audio), audioType: t.audio.type } : t)) });
    const settings = { ...S.settings, keys: {} };
    const avatar = await DB.getKV('avatar', null);
    const data = { app: 'my-gallery', version: 1, exportedAt: Date.now(), settings, places: S.places, works, photos, dna: S.dna, artist: S.artist, avatar: avatar ? await blobToBase64(avatar instanceof ArrayBuffer ? new Blob([avatar]) : avatar) : null };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const name = `my-gallery-backup-${ymd(Date.now())}.json`; const file = new File([blob], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: 'My Gallery 備份' }); } catch (e) { if (e.name !== 'AbortError') downloadBlob(blob, name); } }
    else downloadBlob(blob, name);
    toast('備份檔已產生。建議存到「檔案」或雲端硬碟。（金鑰不會包含在備份裡）', 5000);
  } catch (e) { toast('匯出失敗：' + e.message); }
  delete S.ui.busy.export; render();
}
async function importData(file) {
  try {
    const data = JSON.parse(await file.text());
    if (data.app !== 'my-gallery') throw new Error('這不是 My Gallery 的備份檔');
    if (!await ask(`要匯入 ${data.works.length} 件作品、${data.photos.length} 張照片嗎？相同的資料會被覆蓋，其他資料會保留。`)) return;
    for (const p of data.places) { await savePlace(p); }
    for (const p of data.photos) { await savePhoto({ ...p, blob: base64ToBlob(p.blob, 'image/jpeg'), thumb: base64ToBlob(p.thumb, 'image/jpeg') }); }
    for (const w of data.works) { await saveWork({ ...w, thoughts: (w.thoughts || []).map(t => t.audio ? { ...t, audio: base64ToBlob(t.audio, t.audioType || 'audio/mp4') } : t) }); }
    if (data.dna) await DB.setKV('dna', data.dna);
    if (data.artist) await DB.setKV('artist', data.artist);
    if (data.avatar) await DB.setKV('avatar', await base64ToBlob(data.avatar, 'image/jpeg').arrayBuffer());
    if (data.settings && data.settings.name && !S.settings.name) { S.settings.name = data.settings.name; await saveSettings(); }
    await loadAll(); toast('匯入完成。'); render();
  } catch (e) { toast('匯入失敗：' + e.message, 5000); }
}

/* ---------- 動作 ---------- */
/* 全螢幕看照片：兩指縮放、雙擊放大、左右切換 */
function openViewer(ps, start) {
  let i = start, scale = 1, tx = 0, ty = 0;
  const v = document.createElement('div'); v.className = 'viewer'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-label', '放大看照片');
  v.innerHTML = `<img alt=""><div class="vbar"><span class="vcount"></span><button class="ibtn vclose" aria-label="關閉">${I.x}</button></div><button class="ibtn vprev" aria-label="上一張">${I.back}</button><button class="ibtn vnext" aria-label="下一張">${I.next}</button>`;
  document.body.appendChild(v);
  const img = v.querySelector('img');
  const apply = () => { img.style.transform = `translate(${tx}px,${ty}px) scale(${scale})`; };
  const show = () => { img.src = purl(ps[i], 'full'); scale = 1; tx = ty = 0; apply(); v.querySelector('.vcount').textContent = `${L('type:' + ps[i].type)} · ${i + 1} / ${ps.length}`; v.querySelector('.vprev').style.visibility = i > 0 ? 'visible' : 'hidden'; v.querySelector('.vnext').style.visibility = i < ps.length - 1 ? 'visible' : 'hidden'; };
  const close = () => { v.remove(); if (S.route.name === 'work') { S.ui.photoIdx = i; render(); } };
  v.querySelector('.vclose').onclick = close;
  v.querySelector('.vprev').onclick = () => { if (i > 0) { i--; show(); } };
  v.querySelector('.vnext').onclick = () => { if (i < ps.length - 1) { i++; show(); } };
  const pts = new Map(); let base = null, lastTap = 0, swipeX = null;
  img.addEventListener('pointerdown', e => {
    img.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) { const now = Date.now(); if (now - lastTap < 300) { if (scale > 1) { scale = 1; tx = ty = 0; } else scale = 2.5; apply(); } lastTap = now; swipeX = e.clientX; }
    const a = [...pts.values()]; base = { scale, tx, ty, d: a.length > 1 ? Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) : 0, x: a[0].x, y: a[0].y };
  });
  img.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); const a = [...pts.values()];
    if (a.length > 1 && base.d) { scale = Math.min(6, Math.max(1, base.scale * Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) / base.d)); if (scale === 1) { tx = ty = 0; } apply(); }
    else if (scale > 1) { tx = base.tx + (a[0].x - base.x); ty = base.ty + (a[0].y - base.y); apply(); }
  });
  const up = e => {
    if (pts.size === 1 && scale === 1 && swipeX != null) { const dx = e.clientX - swipeX; if (dx < -60 && i < ps.length - 1) { i++; show(); } else if (dx > 60 && i > 0) { i--; show(); } }
    pts.delete(e.pointerId); const a = [...pts.values()]; base = a.length ? { scale, tx, ty, d: 0, x: a[0].x, y: a[0].y } : null; if (!a.length) swipeX = null;
  };
  img.addEventListener('pointerup', up); img.addEventListener('pointercancel', up);
  show();
}
const ACT = {
  shareWork: () => { const w = workOf(S.route.p.id); if (w) shareWork(w); },
  goAI: () => { go('settings'); setTimeout(() => { const e = $('#aiSec'); if (e) e.scrollIntoView({ behavior: 'smooth' }); }, 80); },
  toggleTrack: async (d, el) => { S.settings.noTrack = !S.settings.noTrack; await saveSettings(); toast(S.settings.noTrack ? tt('This phone will not be counted.', '這支手機的使用不會被統計。') : tt('Counting turned back on.', '已恢復統計。')); render(); },
  snap: () => snap(),
  checkUpdate: async () => {
    if (!navigator.onLine) { toast('目前沒有網路，連上網路後再檢查更新。'); return; } toast('正在檢查更新…');
    try { const r = await navigator.serviceWorker.getRegistration(); if (r) await r.update(); const caches_ = await caches.keys(); await Promise.all(caches_.map(k => caches.delete(k))); } catch (e) { /* ignore */ }
    setTimeout(() => location.reload(), 600);
  },
  nativeCam: () => $('#camInput').click(),
  zoom: () => { const w = workOf(S.route.p.id); const ps = orderedPhotos(w); if (ps.length) openViewer(ps, Math.min(S.ui.photoIdx, ps.length - 1)); },
  tab: d => tab(d.to), go: d => go(d.to, { id: d.id }), back: () => back(),
  openCamera: () => { tab('camera'); },
  pickLib: () => $('#libInput').click(),
  addPhotos: () => $('#addInput').click(),
  homeView: d => { S.ui.homeView = d.v; render(); },
  favOnly: () => { S.ui.favOnly = !S.ui.favOnly; render(); },
  editName: () => { S.ui.editName = true; render(); setTimeout(() => $('#nameIn') && $('#nameIn').focus(), 50); },
  saveName: async () => { S.settings.name = $('#nameIn').value.trim(); S.ui.editName = false; await saveSettings(); render(); },
  renamePlace: () => { S.ui.renamePlace = !S.ui.renamePlace; render(); },
  savePlaceName: async d => { const pl = placeOf(d.id); const v = $('#plName').value.trim(); if (pl && v) { pl.name = v; await savePlace(pl); } S.ui.renamePlace = false; render(); },
  photoIdx: d => { S.ui.photoIdx = +d.i; render(); },
  fav: async () => { const w = workOf(S.route.p.id); w.fav = !w.fav; await saveWork(w); render(); },
  showLong: () => { S.ui.showLong = !S.ui.showLong; render(); },
  editInfo: () => { S.ui.editInfo = !S.ui.editInfo; render(); },
  saveInfo: async () => { const w = workOf(S.route.p.id); Object.assign(w, { title: $('#eiT').value.trim() || w.title, titleOriginal: $('#eiTo').value.trim(), artist: $('#eiA').value.trim(), artistOriginal: $('#eiAo').value.trim(), year: $('#eiY').value.trim(), medium: $('#eiM').value.trim(), userEdited: true, confidence: 'high' }); S.ui.editInfo = false; await saveWork(w); toast('已更新。'); render(); },
  reanalyze: () => { const w = workOf(S.route.p.id); if (!w) return; if (w.queued && w.status === 'pending') { w.hold = false; toast('排進辨識佇列了。'); runQueue(); return; } if (!S.ui.busy[w.id]) reanalyze(w, w.status === 'pending'); },
  retryAll: () => retryPending(),
  cleanBroken: async () => {
    const bs = S.photos.filter(p => p.broken); if (!await ask(`要清除 ${bs.length} 張遺失檔案的照片嗎？只剩這些照片的作品也會一起移除。手機相簿裡的原圖不受影響。`)) return;
    for (const p of bs) { await DB.del('photos', p.id); } S.photos = S.photos.filter(p => !p.broken);
    for (const w of [...S.works]) if (!photosOf(w.id).length) { S.works = S.works.filter(x => x.id !== w.id); await DB.del('works', w.id); }
    for (const pl of S.places) if (pl.coverPhotoId && !S.photos.some(p => p.id === pl.coverPhotoId)) { pl.coverPhotoId = null; await savePlace(pl); }
    toast('清除好了。'); render();
  },
  artistDna: async () => {
    const w = workOf(S.route.p.id); if (S.ui.busy.artist) return; S.ui.busy.artist = true; render();
    try { const k = norm(w.artistOriginal || w.artist); const works = S.works.filter(x => norm(x.artistOriginal || x.artist) === k).map(x => x.title); S.artist[k] = await AI.artistDna(S.settings, { artist: w.artist, artistOriginal: w.artistOriginal, works }); await DB.setKV('artist', S.artist); }
    catch (e) { toast(e.message); }
    delete S.ui.busy.artist; bgRender();
  },
  editThought: d => { S.ui.editThought = d.id || null; render(); if (d.id) setTimeout(() => { const el = $('#thIn'); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }, 50); },
  saveThought: async d => { const w = workOf(S.route.p.id); const t = (w.thoughts || []).find(x => x.id === d.id); const v = $('#thIn').value.trim(); if (t && v && v !== t.text) { t.text = v; t.edited = Date.now(); await saveWork(w); toast('感想已更新。'); } S.ui.editThought = null; render(); },
  deleteThought: async d => { const w = workOf(S.route.p.id); const t = (w.thoughts || []).find(x => x.id === d.id); if (!t) return; if (!await ask(t.kind === 'voice' ? '要刪除這段語音感想嗎？錄音和文字都會一起刪除。' : '要刪除這則感想嗎？', '刪除')) return; w.thoughts = w.thoughts.filter(x => x.id !== d.id); await saveWork(w); toast('已刪除。'); render(); },
  makeLookFor: async () => {
    const w = workOf(S.route.p.id); if (!w || S.ui.busy.look) return; S.ui.busy.look = true; render();
    try { const r = await AI.lookFor(S.settings, { title: w.title, titleOriginal: w.titleOriginal, artist: w.artist, artistOriginal: w.artistOriginal, year: w.year, medium: w.medium, isStreet: w.kind === 'street', short: w.short }); w.lookFor = (r && r.lookFor) || []; await saveWork(w); }
    catch (e) { toast(e.message); }
    delete S.ui.busy.look; bgRender();
  },
  write: () => { S.ui.writing = !S.ui.writing; render(); if (S.ui.writing) setTimeout(() => $('#noteIn') && $('#noteIn').focus(), 50); },
  saveNote: async () => { const w = workOf(S.route.p.id); const t = $('#noteIn').value.trim(); if (t) { w.thoughts = [{ id: uid(), at: Date.now(), kind: 'text', text: t }, ...(w.thoughts || [])]; await saveWork(w); toast('感想已存下來。'); } S.ui.writing = false; render(); },
  startRec: d => startRec(d.id || (S.route.name === 'work' ? S.route.p.id : (S.last && S.last.workId))),
  stopRec: () => stopRec(),
  sheet: d => { S.ui.sheet = d.v || null; render(); },
  setType: async d => { const w = workOf(S.route.p.id); const p = orderedPhotos(w)[S.ui.photoIdx]; p.type = d.v; await savePhoto(p); S.ui.sheet = null; toast(`已改成「${d.v}」。`); render(); },
  movePhoto: async d => {
    const w = workOf(S.route.p.id); const ps = orderedPhotos(w); const p = ps[S.ui.photoIdx]; const t = workOf(d.id);
    p.workId = t.id; await savePhoto(p); S.ui.sheet = null; S.ui.photoIdx = 0;
    if (ps.length <= 1) { S.works = S.works.filter(x => x.id !== w.id); await DB.del('works', w.id); toast(`已移到《${t.title}》。原本那件沒有照片了，已自動移除。`); go('work', { id: t.id }); S.stack.pop(); return; }
    toast(`已移到《${t.title}》。`); render();
  },
  split: async () => {
    const w = workOf(S.route.p.id); const ps = orderedPhotos(w); const p = ps[S.ui.photoIdx];
    if (ps.length <= 1) { S.ui.sheet = null; toast('這件作品只有這一張照片了。'); render(); return; }
    const nw = { id: uid(), placeId: w.placeId, title: '新的作品', status: 'pending', thoughts: [], fav: false, createdAt: Date.now() };
    S.works.push(nw); await saveWork(nw); p.workId = nw.id; await savePhoto(p); S.ui.sheet = null;
    go('work', { id: nw.id }); reanalyze(nw, false);
  },
  makeFirst: async () => { const w = workOf(S.route.p.id); const p = orderedPhotos(w)[S.ui.photoIdx]; if (!p) return; w.coverId = p.id; await saveWork(w); S.ui.sheet = null; S.ui.photoIdx = 0; toast('已設成第一張，列表上也會用這張當代表。'); render(); },
  makeCover: async () => { const w = workOf(S.route.p.id); const p = orderedPhotos(w)[S.ui.photoIdx]; const pl = placeOf(w.placeId); pl.coverPhotoId = p.id; await savePlace(pl); S.ui.sheet = null; toast('已設成封面。'); render(); },
  removePhoto: async () => {
    const w = workOf(S.route.p.id); const ps = orderedPhotos(w); const p = ps[S.ui.photoIdx];
    if (!p) return;
    if (!await ask(ps.length <= 1 ? '這是這件作品唯一的照片，刪除後整件作品也會移除。手機相簿裡的原圖不受影響。' : '要刪除這張照片嗎？手機相簿裡的原圖不受影響。', '刪除')) return;
    S.photos = S.photos.filter(x => x.id !== p.id); await DB.del('photos', p.id); S.ui.sheet = null; S.ui.photoIdx = 0;
    if (ps.length <= 1) { S.works = S.works.filter(x => x.id !== w.id); await DB.del('works', w.id); back(); return; }
    render();
  },
  deleteWork: async () => {
    const w = workOf(S.route.p.id); if (!await ask(`確定刪除《${w.title}》和它的 ${photosOf(w.id).length} 張照片嗎？（手機相簿裡的原圖不受影響）`)) return;
    for (const p of photosOf(w.id)) { await DB.del('photos', p.id); } S.photos = S.photos.filter(p => p.workId !== w.id);
    S.works = S.works.filter(x => x.id !== w.id); await DB.del('works', w.id); back();
  },
  fixLast: d => { go('work', { id: d.id }); S.ui.sheet = 'menu'; render(); },
  dismissLast: () => { S.last = null; render(); },
  endVisit: () => { if (S.rec) stopRec(); S.last = null; tab('summary'); },
  pickAvatar: () => $('#avatarInput').click(),
  togglePick: () => { S.ui.pick = !S.ui.pick; render(); },
  avatarFrom: async d => { const p = S.photos.find(x => x.id === d.id); await setAvatar(p.thumb); S.ui.pick = false; render(); },
  makeDna: d => { if (!S.ui.busy.dna) makeDna(d.v === 'reword'); },
  fb: () => { S.ui.fb = !S.ui.fb; render(); },
  saveFb: async () => { S.settings.feedback = $('#fbIn').value.trim(); await saveSettings(); S.ui.fb = false; toast('謝謝你，策展人下次整理時會參考這段話。'); render(); },
  shareDna: () => shareDna(),
  provider: async d => { const k = $('#keyIn'); if (k) { S.settings.keys[S.settings.provider] = k.value.trim(); } S.settings.provider = d.v; S.ui.obMsg = ''; await saveSettings(); render(); },
  testKey: async () => {
    const v = $('#keyIn').value.trim(); if (!v) { S.ui.obMsg = '請先貼上金鑰。'; render(); return; }
    S.settings.keys = { ...S.settings.keys, [S.settings.provider]: v }; await saveSettings();
    S.ui.busy.key = true; S.ui.obMsg = ''; render();
    try { await AI.testKey(S.settings); S.ui.obMsg = '成功！金鑰可以使用，已經存好了。'; track('ai-key-added-' + S.settings.provider); queuedWorks().forEach(w => { w.hold = false; }); const nq = queuedWorks().length; if (nq && S.settings.onboarded) toast(tt(`AI is on. Organizing your ${nq} photos now.`, `AI 已開啟，正在整理你的 ${nq} 張照片。`), 4500); retryPending(); }
    catch (e) { S.ui.obMsg = e.message; }
    delete S.ui.busy.key; render();
  },
  saveModel: async () => { S.settings.models = { ...S.settings.models, [S.settings.provider]: $('#modelIn').value.trim() }; await saveSettings(); toast('已儲存。'); },
  length: async d => { S.settings.length = d.v; await saveSettings(); render(); },
  exportData: () => { if (!S.ui.busy.export) exportData(); },
  importData: () => $('#importInput').click(),
  resetAll: async () => { if (!await ask('確定要清除這支手機上的所有作品、照片和設定嗎？這個動作無法復原，建議先匯出備份。')) return; for (const s of ['photos', 'works', 'places', 'kv']) await DB.clear(s); location.reload(); },
  ob: d => { const k = $('#keyIn'); if (k && k.value.trim()) S.settings.keys[S.settings.provider] = k.value.trim(); saveSettings(); S.ui.ob = +d.v; S.ui.obMsg = ''; render(); scrollTo(0, 0); },
  obName: async () => { S.settings.name = $('#obName').value.trim(); S.ui.obNameDraft = null; await saveSettings(); S.ui.ob = 1; render(); scrollTo(0, 0); },
  setLang: async d => { const nm = $('#obName'); if (nm) { S.ui.obNameDraft = nm.value; S.settings.name = nm.value.trim(); } S.settings.lang = d.v; I18N.set(d.v); await saveSettings(); if (d.v === 'zh') location.reload(); else { I18N.dom(document.body); render(); } },
  obDone: async () => { S.settings.onboarded = true; await saveSettings(); track(`onboarded-${S.settings.lang}-${hasAI() ? 'ai' : 'basic'}`); tab('home'); }
};
async function setAvatar(blob) { await DB.setKV('avatar', await blob.arrayBuffer()); if (S.avatarUrl) URL.revokeObjectURL(S.avatarUrl); S.avatarUrl = URL.createObjectURL(blob); }

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = ACT[el.dataset.act]; if (!fn) return;
  e.preventDefault(); fn(el.dataset, el, e);
});
document.addEventListener('input', e => { if (e.target.id === 'obName') { const v = e.target.value.trim(); const pv = $('#obPreview'); if (pv) pv.textContent = v ? (I18N.lang === 'en' ? v + "'s Gallery" : v + ' 的畫廊') : tt('My Gallery', '我的畫廊'); } });
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'nameIn') ACT.saveName(); });
$('#camInput').addEventListener('change', e => { const f = [...e.target.files]; e.target.value = ''; if (S.route.name !== 'camera') tab('camera'); handleFiles(f, true); });
$('#libInput').addEventListener('change', e => { const f = [...e.target.files]; e.target.value = ''; if (S.route.name === 'camera' || S.route.name !== 'home') tab('home'); S.ui.homeView = 'works'; handleFiles(f, false); });
$('#addInput').addEventListener('change', async e => {
  const w = workOf(S.route.p.id); if (!w) return;
  for (const f of e.target.files) { const exif = await readExif(f); const prep = await prepareImage(f); const p = { id: uid(), workId: w.id, type: '細節', blob: prep.full, thumb: prep.thumb, w: prep.w, h: prep.h, takenAt: exif.time || f.lastModified || Date.now(), lat: exif.lat ?? null, lng: exif.lng ?? null, createdAt: Date.now() }; S.photos.push(p); await savePhoto(p); }
  e.target.value = ''; toast('照片已補進這件作品，類型可以在「整理這張照片」裡修改。'); render();
});
$('#avatarInput').addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; const prep = await prepareImage(f); await setAvatar(prep.thumb); e.target.value = ''; render(); });
$('#importInput').addEventListener('change', e => { const f = e.target.files[0]; if (f) importData(f); e.target.value = ''; });
window.addEventListener('online', () => { setTimeout(retryPending, 1500); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') setTimeout(runQueue, 800); });

async function loadAll() {
  const saved = await DB.getKV('settings', {});
  S.settings = { ...DEFAULTS, ...saved };
  if (!saved.lang && saved.onboarded) S.settings.lang = 'zh'; // 舊使用者維持中文
  I18N.set(S.settings.lang);
  S.settings.keys = S.settings.keys || {}; S.settings.models = S.settings.models || {};
  [S.works, S.places, S.photos] = await Promise.all([DB.all('works'), DB.all('places'), DB.all('photos')]);
  S.works = S.works.map(reviveWork); S.photos = S.photos.map(revivePhoto);
  // 舊版存的照片：讀得到就轉成新格式，讀不到就標示「檔案遺失」
  for (const p of S.photos) {
    if (p.v === 2 || p.broken) { if (!p.thumb && !p.blob) p.broken = true; continue; }
    try { await p.thumb.slice(0, 16).arrayBuffer(); await p.blob.slice(0, 16).arrayBuffer(); await savePhoto(p); p.v = 2; }
    catch (e) { p.broken = true; p.blob = null; p.thumb = null; await DB.put('photos', { ...p }); }
  }
  for (const w of S.works) if ((w.thoughts || []).some(t => t.audio && !t.audioBuf)) { try { await saveWork(w); } catch (e) { /* skip */ } }

  // 把舊資料裡的簡體字、中國大陸譯名改成台灣用法
  for (const [store, arr] of [['places', S.places], ['works', S.works]]) {
    for (let i = 0; i < arr.length; i++) {
      const { thoughts, ...rest } = arr[i]; const fixed = { ...ZH.deep(rest), thoughts };
      if (JSON.stringify(rest) !== JSON.stringify(ZH.deep(rest))) { arr[i] = fixed; await (store === 'works' ? saveWork(fixed) : savePlace(fixed)); }
    }
  }
  S.session = await DB.getKV('session', null);
  if (!Object.values(S.settings.keys || {}).some(Boolean)) S.works.forEach(w => { if (w.queued && w.status === 'pending' && (w.title === '辨識中的作品' || w.title === '待辨識的作品')) w.title = untitled(); });
  await mergeDuplicatePlaces(); if (S.session) await DB.setKV('session', S.session); S.dna = await DB.getKV('dna', null); S.artist = await DB.getKV('artist', {}) || {};
  let av = await DB.getKV('avatar', null); if (av instanceof ArrayBuffer) av = new Blob([av], { type: 'image/jpeg' }); else if (av) { try { await av.slice(0, 8).arrayBuffer(); } catch (e) { av = null; } } if (av) { if (S.avatarUrl) URL.revokeObjectURL(S.avatarUrl); S.avatarUrl = URL.createObjectURL(av); }
  URLS.forEach(u => URL.revokeObjectURL(u)); URLS.clear();
}
(async function start() {
  try { await loadAll(); } catch (e) { $('#app').innerHTML = '<p style="padding:30px">這個瀏覽器無法儲存資料（可能是無痕模式）。請用一般模式的 Safari 或 Chrome 打開。</p>'; return; }
  S.route = { name: 'home', p: {} }; I18N.watch(); I18N.dom(document.body); render();
  track('/' + (S.settings.lang || 'en'), false);
  if (window.matchMedia && matchMedia('(display-mode: standalone)').matches || navigator.standalone) track('open-from-home-screen');
  if (S.settings.onboarded) track(hasAI() ? 'active-ai' : 'active-basic');
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(r => r.update().catch(() => {})).catch(() => {});
    // 有新版時自動換上（只重新整理一次）
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (reloaded || typing()) return; reloaded = true; location.reload(); });
  }
  setTimeout(() => { runQueue(); retryPending(); }, 1500);
})();
