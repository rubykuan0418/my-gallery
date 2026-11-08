'use strict';
/* ============ 我的美術館 ============ */
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

const DEFAULTS = { provider: 'gemini', keys: {}, models: {}, length: 'short', name: '', onboarded: false, feedback: '' };
const S = {
  settings: { ...DEFAULTS }, works: [], places: [], photos: [], route: { name: 'home', p: {} }, stack: [],
  ui: { homeView: 'place', favOnly: false, editName: false, photoIdx: 0, sheet: null, showLong: false, editInfo: false, writing: false, ob: 0, obMsg: '', busy: {}, pick: false },
  session: null, queue: [], last: null, toast: '', dna: null, artist: {}, avatarUrl: null, rec: null
};
const URLS = new Map();
function purl(p, kind = 'thumb') {
  if (!p) return '';
  const k = p.id + kind;
  if (!URLS.has(k)) { const b = kind === 'thumb' ? (p.thumb || p.blob) : (p.blob || p.thumb); if (!b) return ''; URLS.set(k, URL.createObjectURL(b)); }
  return URLS.get(k);
}

/* ---------- 資料存取 ---------- */
const saveSettings = () => DB.setKV('settings', S.settings);
const savePhoto = p => DB.put('photos', p);
const saveWork = w => DB.put('works', w);
const savePlace = p => DB.put('places', p);
function photosOf(workId) { return S.photos.filter(p => p.workId === workId).sort((a, b) => a.takenAt - b.takenAt); }
function mainPhoto(w) { const ps = photosOf(w.id); return ps.find(p => p.type === '作品') || ps.find(p => p.type === '我與作品') || ps.find(p => p.type === '細節') || ps[0]; }
const placeOf = id => S.places.find(p => p.id === id);
const workOf = id => S.works.find(w => w.id === id);
const worksAt = placeId => S.works.filter(w => w.placeId === placeId);
function lastAt(w) { const ps = photosOf(w.id); return ps.length ? ps[ps.length - 1].takenAt : (w.createdAt || 0); }
function seenDates(w) { return [...new Set(photosOf(w.id).map(p => ymd(p.takenAt)))].sort(); }
function placeLast(pl) { let m = pl.createdAt || 0; worksAt(pl.id).forEach(w => { m = Math.max(m, lastAt(w)); }); return m; }
function placeCover(pl) { const c = pl.coverPhotoId && S.photos.find(p => p.id === pl.coverPhotoId); if (c) return c; const ws = worksAt(pl.id).sort((a, b) => lastAt(b) - lastAt(a)); for (const w of ws) { const m = mainPhoto(w); if (m) return m; } return null; }
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
const eligible = () => S.works.filter(w => w.status === 'ready' && !w.isCopy && w.dims);

/* ---------- 導覽 ---------- */
function go(name, p = {}) { S.stack.push(S.route); S.route = { name, p }; resetUi(); render(); scrollTo(0, 0); }
function tab(name) { S.stack = []; S.route = { name, p: {} }; resetUi(); render(); scrollTo(0, 0); }
function back() { S.route = S.stack.pop() || { name: 'home', p: {} }; resetUi(); render(); scrollTo(0, 0); }
function resetUi() { Object.assign(S.ui, { sheet: null, showLong: false, editInfo: false, writing: false, photoIdx: 0, editName: false, pick: false, renamePlace: false }); }
let toastTimer;
function toast(msg, ms = 3200) { S.toast = msg; renderToast(); clearTimeout(toastTimer); toastTimer = setTimeout(() => { S.toast = ''; renderToast(); }, ms); }
function renderToast() { let el = $('#toast'); if (!S.toast) { if (el) el.remove(); return; } if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); el.onclick = () => { S.toast = ''; renderToast(); }; document.body.appendChild(el); } el.textContent = S.toast; }

/* ---------- 畫面 ---------- */
function nav(active) {
  return `<nav class="nav" aria-label="主要導覽"><div class="nav-in">
  <button class="${active === 'home' ? 'on' : ''}" data-act="tab" data-to="home" ${active === 'home' ? 'aria-current="page"' : ''}>${I.grid}畫廊</button>
  <button class="shoot" data-act="openCamera" aria-label="拍照">${I.cam}</button>
  <button class="${active === 'map' ? 'on' : ''}" data-act="tab" data-to="map" ${active === 'map' ? 'aria-current="page"' : ''}>${I.map}地圖</button>
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
  <button class="hit" data-act="go" data-to="dna" aria-label="我的美感 DNA" style="width:auto;display:flex;flex-direction:column;align-items:center;gap:2px">${avatarHtml(54)}<span class="tiny" style="color:var(--primary);font-weight:700">我的美感</span></button></div>`;
  if (todayVisit) h += `<button class="hit row" data-act="openCamera" style="margin-top:18px;background:var(--sage);border-radius:26px 14px 30px 12px;padding:14px 16px;gap:12px">${I.star('#4F6652', 22)}<span class="grow" style="line-height:1.5"><strong>今天在${esc(todayVisit.name)}</strong><br><span class="muted small">回到相機，繼續記錄</span></span>${I.next}</button>`;
  if (pending) h += `<div class="card row" style="margin-top:12px;background:var(--butter)"><span class="grow small">有 ${pending} 件作品還沒辨識（可能是沒網路或沒設定金鑰）。</span><button class="btn white" data-act="retryAll">${S.ui.busy.retry ? '<span class="spin"></span>' : '再試一次'}</button></div>`;
  if (!n && !np) {
    h += `<div class="empty">${I.blob('#F4E3DD', 120)}<h2 class="serif" style="font-size:26px;margin:8px 0">你的畫廊還是空的</h2><p class="muted">在美術館、或在路上看到喜歡的東西，打開相機拍下來就好。今天的畫廊會自己慢慢長出來。</p>
    <div class="row wrap" style="margin-top:16px"><button class="btn solid" data-act="openCamera">${I.cam}打開相機</button><button class="btn" data-act="pickLib">${I.img}匯入以前的照片</button></div></div></main>${nav('home')}`;
    return h;
  }
  h += `<div class="tabs" role="tablist" style="margin-top:22px">${[['place', '地點'], ['works', '作品'], ['time', '時間軸']].map(([k, l]) => `<button class="tab ${S.ui.homeView === k ? 'on' : ''}" role="tab" aria-selected="${S.ui.homeView === k}" data-act="homeView" data-v="${k}">${l}</button>`).join('')}</div>`;
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
    ws.forEach((w, i) => { const m = mainPhoto(w); h += `<button class="hit thumbwork" data-act="go" data-to="work" data-id="${w.id}"><span class="bk" style="background:${PASTEL[i % 5]};border-radius:${RAD[i % 5]}"></span><span class="frame">${m ? `<img src="${purl(m)}" alt="${esc(w.title)}">` : ''}</span>${w.status === 'pending' ? '<span class="badge">待辨識</span>' : w.isCopy ? '<span class="badge">複製品</span>' : w.confidence === 'low' ? '<span class="badge">AI 推測</span>' : ''}<strong style="display:block;font-size:15px;margin-top:8px;line-height:1.5;position:relative">${esc(w.title)}</strong><span class="muted small" style="position:relative">${esc(w.artist || '作者不明')}・${photosOf(w.id).length} 張${w.fav ? '・最喜歡' : ''}</span></button>`; });
    h += `</div>`;
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
  let h = `<main class="screen"><button class="back" data-act="back">${I.back}我的畫廊</button>
  <div class="row" style="gap:18px;align-items:flex-end;margin-top:10px"><div class="grow"><span class="chip" style="background:${pl.kind === 'walk' ? 'var(--sage)' : 'var(--sky)'}">${pl.kind === 'walk' ? '城市散步' : '美術館'}</span>`;
  if (S.ui.renamePlace) h += `<label class="lab" for="plName" style="margin-top:8px">地點名稱</label><input id="plName" class="field" value="${esc(pl.name)}"><div class="row" style="margin-top:8px"><button class="btn" data-act="renamePlace">取消</button><button class="btn solid" data-act="savePlaceName" data-id="${pl.id}">存下來</button></div>`;
  else h += `<h1 class="serif" style="margin:4px 0 0;font-size:30px;line-height:1.25">${esc(pl.name)}</h1>${pl.nameOriginal ? `<p class="serif muted" style="margin:0;font-size:18px">${esc(pl.nameOriginal)}</p>` : ''}<p class="muted small" style="margin:2px 0 0">${esc(pl.city || '')}</p><button class="linkbtn" data-act="renamePlace">名稱不對？修改</button>`;
  h += `</div>${c ? `<div style="width:118px;flex:none;padding:7px;background:var(--card);border:1px solid var(--gold);border-radius:60px 60px 4px 4px"><img src="${purl(c)}" alt="" style="display:block;width:100%;height:150px;object-fit:cover;border-radius:54px 54px 2px 2px"></div>` : ''}</div>
  <div class="row" style="margin-top:22px">${[[vs.length, '次'], [ws.length, '件作品'], [nPhotos, '張照片']].map(([a, b], i) => `<div class="grow" style="background:${PASTEL[i]};border-radius:${RAD[i]};padding:10px 14px"><span class="serif" style="display:block;font-size:28px;line-height:1.1">${a}</span><span class="small">${b}</span></div>`).join('')}</div>
  <p class="sec" style="margin-top:28px">紀錄・最近的在上面</p><p class="muted small" style="margin:-4px 0 12px">這些是 AI 自動整理的。覺得哪張放錯了，點進作品，按「這張放錯了？」就能調整。</p>`;
  vs.forEach(v => {
    h += `<p style="margin:16px 0 0"><strong>${fmtDate(v.date)}</strong> <span class="muted small">${fmtTime(v.first)}–${fmtTime(v.last)}・${v.works.length} 件・${v.photos} 張</span></p><div style="display:flex;flex-direction:column;gap:10px;margin-top:10px">`;
    v.works.forEach(w => { const m = mainPhoto(w); h += `<button class="hit listrow" data-act="go" data-to="work" data-id="${w.id}">${m ? `<img src="${purl(m)}" alt="">` : '<span style="width:58px;height:58px"></span>'}<span class="grow" style="line-height:1.5"><strong style="font-size:15px">${esc(w.title)}</strong><br><span class="muted small">${esc(w.artist || (w.status === 'pending' ? '待辨識' : '作者不明'))}・${photosOf(w.id).length} 張</span></span>${I.next}</button>`; });
    h += `</div>`;
  });
  return h + `</main>${nav('home')}`;
}

function viewWork() {
  const w = workOf(S.route.p.id); if (!w) return viewHome();
  const ps = photosOf(w.id); const idx = Math.min(S.ui.photoIdx, Math.max(0, ps.length - 1)); const p = ps[idx];
  const pl = placeOf(w.placeId); const dates = seenDates(w);
  const prov = AI.PROVIDERS[w.aiProvider || S.settings.provider] || AI.PROVIDERS.gemini;
  let h = `<main class="screen"><div class="row" style="justify-content:space-between"><button class="back" data-act="back">${I.back}${esc(pl ? pl.name : '返回')}</button>
  <button class="ibtn heart ${w.fav ? 'on' : ''}" data-act="fav" aria-pressed="${!!w.fav}" aria-label="${w.fav ? '已加入最喜歡，點一下取消' : '加入最喜歡'}" style="${w.fav ? 'background:var(--pink)' : ''}">${I.heart}</button></div>
  <div style="position:relative;margin-top:8px"><div class="frame" style="padding:8px">${p ? `<img src="${purl(p, 'full')}" alt="${esc(w.title)}，${esc(p.type)}" style="height:min(60vh,430px);object-fit:contain;background:#EFE8DC">` : ''}</div>
  ${p ? `<span class="chip" style="position:absolute;left:18px;bottom:18px;background:rgba(255,253,248,.95)"><strong>${esc(p.type)}</strong>・${idx + 1} / ${ps.length} 張</span>` : ''}</div>
  <div class="row" style="margin-top:10px;overflow-x:auto;padding-bottom:2px">${ps.map((x, i) => `<button class="hit" style="width:auto;flex:none" data-act="photoIdx" data-i="${i}" aria-label="看第 ${i + 1} 張：${esc(x.type)}"><img src="${purl(x)}" alt="" style="width:50px;height:50px;object-fit:cover;display:block;border:3px solid ${i === idx ? 'var(--accent)' : 'var(--card)'};border-radius:12px 8px 14px 6px"></button>`).join('')}</div>
  <button class="btn white" data-act="sheet" data-v="menu" style="margin-top:8px;font-size:14px">${I.sort}這張放錯了？整理這張照片</button>`;
  if (w.status === 'pending') h += `<div class="card" style="margin-top:18px;background:var(--butter)"><strong>這件還沒辨識</strong><p style="margin:4px 0 10px" class="small">${esc(w.error || '有網路、設定好金鑰後就能辨識。')}</p><button class="btn white" data-act="reanalyze">${S.ui.busy[w.id] ? '<span class="spin"></span> 辨識中' : '現在辨識'}</button></div>`;
  h += `<div style="margin-top:20px">${w.isCopy ? '<span class="chip">複製品・不算進美感 DNA</span> ' : ''}${w.kind === 'street' ? '<span class="chip" style="background:var(--sage)">路上的小美好</span>' : ''}`;
  if (S.ui.editInfo) {
    h += `<div class="card" style="margin-top:10px">${[['eiT', '作品名稱', w.title], ['eiA', '藝術家', w.artist], ['eiY', '年代', w.year], ['eiM', '媒材', w.medium]].map(([id, l, v]) => `<label class="lab" for="${id}">${l}</label><input id="${id}" class="field" value="${esc(v || '')}" style="margin-bottom:10px">`).join('')}<p class="muted tiny" style="margin:0 0 10px">存下來後，可以按「依新資料重寫解說」讓 AI 重新整理。</p><div class="row"><button class="btn grow" data-act="editInfo">取消</button><button class="btn solid grow" data-act="saveInfo">存下來</button></div></div>`;
  } else {
    h += `<h1 class="serif" style="margin:6px 0 0;font-size:30px;line-height:1.25">${esc(w.title)}</h1>${w.titleOriginal && w.titleOriginal !== w.title ? `<p class="serif muted" style="margin:0;font-size:19px">${esc(w.titleOriginal)}</p>` : ''}
    <p style="margin:6px 0 0;font-size:17px">${esc(w.artist || '作者不明')} <span class="muted">${esc(w.artistOriginal && w.artistOriginal !== w.artist ? w.artistOriginal : '')}</span></p>
    <button class="linkbtn" data-act="editInfo">作品名稱或藝術家不對？修改</button>`;
  }
  h += `<div class="metagrid">${[['年代', w.year], ['媒材', w.medium], ['地點', pl && pl.name], ['見過 ' + dates.length + ' 次', dates.map(d => d.replace(/-/g, '.')).join('、')]].map(([a, b]) => `<div><span class="muted tiny">${a}</span><br>${esc(b || '—')}</div>`).join('')}</div></div>`;
  if (w.confidence === 'low' && w.status === 'ready') h += `<div class="card" style="margin-top:18px;background:var(--sky)"><strong>這件是 AI 的推測</strong><p class="small" style="margin:4px 0 0">AI 不太確定作品身分。補拍一張說明牌，或直接修改名稱都可以。</p></div>`;
  if (w.short) h += `<svg width="100%" height="16" viewBox="0 0 342 16" preserveAspectRatio="none" aria-hidden="true" style="display:block;margin:24px 0"><path d="M0 8h146M196 8h146" stroke="#C2A878"/><path d="M152 8c6-8 14-8 19 0 5 8 13 8 19 0" fill="none" stroke="#C2A878"/></svg>
  <p class="sec">${w.kind === 'street' ? '關於它' : '作品解說'}</p><p style="margin:0">${esc(S.ui.showLong && w.long ? w.long : w.short)}</p>
  <div class="row wrap">${w.long ? `<button class="linkbtn" data-act="showLong">${S.ui.showLong ? '收起' : '看完整解說'}</button>` : ''}<button class="linkbtn" data-act="reanalyze">${S.ui.busy[w.id] ? '整理中…' : '依新資料重寫解說'}</button></div>
  <p class="muted tiny" style="margin:2px 0 0">AI 解說・${esc(prov.name)}${w.labelUsed ? '・已用你拍的說明牌校正' : ''}</p>`;
  if (w.artist && w.status === 'ready' && w.kind !== 'street') {
    const ad = S.artist[norm(w.artistOriginal || w.artist)];
    if (ad) h += artistCard(ad, w);
    else h += `<button class="btn" data-act="artistDna" style="margin-top:22px">${S.ui.busy.artist ? '<span class="spin"></span> 整理中' : '看' + esc(w.artist) + '的藝術家視覺 DNA'}</button>`;
  }
  h += `<div style="margin-top:32px"><div class="row" style="justify-content:space-between"><h2 class="serif" style="margin:0;font-size:24px">我的感想</h2><span class="muted small">${(w.thoughts || []).length ? w.thoughts.length + ' 筆' : ''}</span></div>`;
  if (!(w.thoughts || []).length) h += `<div class="card row" style="margin-top:12px;background:var(--sand);align-items:flex-start">${I.star()}<p style="margin:0">還沒有留下感想。想起什麼的時候，寫一句或錄一段都好。</p></div>`;
  (w.thoughts || []).forEach((t, i) => { h += `<div class="card" style="margin-top:12px;background:${['#F4E3DD', '#E3EADD', '#F7EDCF'][i % 3]}"><p class="muted small" style="margin:0">${fmtDate(ymd(t.at))}・${t.kind === 'voice' ? '語音感想' : '文字感想'}</p>${t.kind === 'voice' && t.audio ? `<audio controls preload="none" src="${thoughtUrl(t)}" style="width:100%;margin:6px 0"></audio>` : ''}<p style="margin:0">${esc(t.text || '')}</p></div>`; });
  if (S.ui.writing) h += `<div style="margin-top:14px"><label class="lab" for="noteIn">想留下什麼？</label><textarea id="noteIn" class="field" rows="3" placeholder="寫一句就好"></textarea><div class="row" style="margin-top:10px"><button class="btn grow" data-act="write">取消</button><button class="btn solid grow" data-act="saveNote">存下來</button></div></div>`;
  else if (S.rec && S.rec.workId === w.id) h += `<div class="card row" role="status" style="margin-top:14px">${I.blob('#9C5B55', 18).replace('<svg', '<svg class="pulse"')}<strong class="grow">錄音中…</strong><button class="btn solid" data-act="stopRec">結束</button></div>`;
  else h += `<div class="row" style="margin-top:16px"><button class="btn grow" data-act="addPhotos">${I.img}補照片</button><button class="btn grow" data-act="write">${I.pen}寫感想</button><button class="btn grow" data-act="startRec">${I.mic}錄音</button></div>`;
  h += `<p class="muted small" style="margin-top:22px">點右上角的愛心標成「最喜歡」，你的美感 DNA 會更準。</p><button class="linkbtn" data-act="deleteWork" style="color:var(--accent)">刪除這件作品</button></div></main>${nav('home')}`;
  if (S.ui.sheet) h += sheetHtml(w, p, ps);
  return h;
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
  <div class="row" style="margin-bottom:14px">${p ? `<img src="${purl(p)}" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:14px 8px 16px 6px">` : ''}<div style="line-height:1.5"><strong>整理這張照片</strong><br><span class="muted small">目前在《${esc(w.title)}》・${esc(p ? p.type : '')}</span></div></div>`;
  if (S.ui.sheet === 'menu') {
    h += `<div style="display:flex;flex-direction:column;gap:8px">${[['sheet', 'move', '移到另一件作品'], ['sheet', 'type', '改照片類型（作品、細節、說明牌⋯）'], ['split', '', '獨立成新的一件作品'], ['makeCover', '', '設成這個地點的封面'], ['removePhoto', '', '刪除這張照片']].map(([a, v, l]) => `<button class="btn" data-act="${a}" data-v="${v}" style="justify-content:flex-start">${l}</button>`).join('')}<button class="btn ghost" data-act="sheet" data-v="">取消</button></div>`;
  } else if (S.ui.sheet === 'type') {
    h += `<p style="margin:0 0 8px">這張照片是：</p><div class="row wrap">${TYPES.map(t => `<button class="opt ${p && p.type === t ? 'on' : ''}" data-act="setType" data-v="${t}">${t}</button>`).join('')}</div><button class="btn ghost block" data-act="sheet" data-v="menu" style="margin-top:14px">返回</button>`;
  } else if (S.ui.sheet === 'move') {
    const targets = worksAt(w.placeId).filter(x => x.id !== w.id).sort((a, b) => lastAt(b) - lastAt(a));
    h += `<p style="margin:0 0 8px">要移到哪一件作品？<span class="muted small">（同一個地點）</span></p><div style="display:flex;flex-direction:column;gap:8px">`;
    if (!targets.length) h += `<p class="muted small">這個地點沒有其他作品。可以改用「獨立成新的一件作品」。</p>`;
    targets.forEach(x => { const m = mainPhoto(x); h += `<button class="hit listrow" data-act="movePhoto" data-id="${x.id}">${m ? `<img src="${purl(m)}" alt="">` : ''}<span class="grow" style="line-height:1.4"><strong style="font-size:15px">${esc(x.title)}</strong><br><span class="muted tiny">${esc(x.artist || '')}・${photosOf(x.id).length} 張</span></span></button>`; });
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
  S.queue.forEach(q => { h += `<div class="pill row" role="status">${q.thumb ? `<img src="${q.thumb}" alt="" style="width:44px;height:44px;object-fit:cover;border-radius:10px">` : ''}<span class="spin"></span><span>${q.status === 'ai' ? '辨識中…' : '處理照片中…'}</span></div>`; });
  const L = S.last; const lw = L && workOf(L.workId);
  if (L && L.facade) h += `<div class="pill">已存成這個地點的封面照片。</div>`;
  else if (lw && L.grouped) h += `<div class="pill" role="status" style="background:var(--sage)">已收在一起（${photosOf(lw.id).length} 張）・《${esc(lw.title)}》</div>`;
  else if (lw) {
    const m = mainPhoto(lw);
    h += `<div class="result"><div class="hd"><div class="grow"><span class="chip" style="background:var(--card)">${lw.status === 'pending' ? '待辨識' : seenDates(lw).length > 1 ? '第 ' + seenDates(lw).length + ' 次見到' : lw.kind === 'street' ? '路上的小美好' : '第一次見到'}</span><h2 class="serif" style="margin:6px 0 0;font-size:24px;line-height:1.3">${esc(lw.title)}</h2><p class="muted small" style="margin:0">${esc([lw.artist, lw.year].filter(Boolean).join('・'))}</p></div>${m ? `<img src="${purl(m)}" alt="">` : ''}</div>
    <div style="padding:14px 16px 16px"><p style="margin:0 0 12px">${esc(lw.status === 'pending' ? (lw.error || '有網路後會自動辨識。') : lw.short || '')}</p><div class="grid2" style="gap:8px"><button class="btn" data-act="go" data-to="work" data-id="${lw.id}">完整解說</button><button class="btn" data-act="startRec" data-id="${lw.id}">${I.mic}說感想</button><button class="btn" data-act="fixLast" data-id="${lw.id}">這不對</button><button class="btn solid" data-act="dismissLast">繼續看展</button></div></div></div>`;
  }
  if (S.rec) h += `<div class="pill row" role="status">${I.blob('#9C5B55', 18).replace('<svg', '<svg class="pulse"')}<span class="grow"><strong>錄音中</strong><br><span class="muted tiny">再按一次麥克風就結束</span></span></div>`;
  h += `</div>`;
  if (todays && todays.works.length) h += `<div class="strip" aria-label="今天的作品">${todays.works.map(w => { const m = mainPhoto(w); return m ? `<button class="hit t" data-act="go" data-to="work" data-id="${w.id}" aria-label="${esc(w.title)}"><img src="${purl(m)}" alt=""><span class="n">${photosOf(w.id).length}</span></button>` : ''; }).join('')}</div>`;
  h += `<div class="row" style="justify-content:space-around;margin-top:12px"><button class="round" data-act="pickLib" aria-label="從相簿選">${I.img}</button>
  <label for="camInput" class="shutter" role="button" aria-label="拍照"><span>${I.star('#EBCF8A', 30)}</span></label>
  <button class="round" data-act="${S.rec ? 'stopRec' : 'startRec'}" aria-label="${S.rec ? '結束錄音' : '錄下感想'}" style="${S.rec ? 'background:var(--pink);color:var(--accent)' : ''}">${I.mic}</button></div>
  <p class="tiny" style="text-align:center;margin:10px 0 0;opacity:.85">拍照後會自動辨識、自動收進今天的畫廊${S.last && S.last.workId ? '；麥克風會把感想存到最新的作品' : ''}</p>
  <button class="btn ghost" data-act="tab" data-to="home" style="color:#FBF7EF;margin:6px auto 0">${I.x}關閉相機</button></main>`;
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
    h += `<div class="row" style="margin-top:16px">${[[v.works.length, '件作品'], [v.photos, '張照片'], nThoughts ? [nThoughts, '段感想'] : [mins, '分鐘']].map(([a, b], i) => `<div class="grow" style="background:${PASTEL[i]};border-radius:${RAD[i]};padding:12px 14px"><span class="serif" style="display:block;font-size:36px;line-height:1.1">${a}</span><span class="small">${b}</span></div>`).join('')}</div><div style="display:flex;flex-direction:column;gap:12px;margin-top:22px">${v.works.map(w => { const m = mainPhoto(w); return `<button class="hit row" data-act="go" data-to="work" data-id="${w.id}">${m ? `<img src="${purl(m)}" alt="" style="width:58px;height:58px;object-fit:cover;padding:3px;border:1px solid var(--gold);background:var(--card)">` : ''}<span class="grow" style="line-height:1.5"><strong>${esc(w.title)}</strong><br><span class="muted small">${esc(w.artist || '')}${w.artist ? '・' : ''}${photosOf(w.id).filter(p => ymd(p.takenAt) === d).length} 張</span></span></button>`; }).join('')}</div>`;
  } else h += `<p class="muted">今天還沒有拍照。</p>`;
  return h + `<p class="card" style="margin-top:22px;background:var(--sky)">回家想補可以補，不補也沒關係，今天的畫廊已經在這裡了。</p><button class="btn solid block" data-act="tab" data-to="home" style="margin-top:12px">回到畫廊</button></main>`;
}

function viewMap() {
  const pls = [...S.places].sort((a, b) => placeLast(b) - placeLast(a));
  const cities = new Set(pls.map(p => p.city).filter(Boolean));
  let h = `<main class="screen"><h1 class="serif" style="margin:0;font-size:32px">去過的地方</h1><p class="muted small" style="margin:2px 0 16px">${cities.size} 座城市・${pls.length} 個地點</p>`;
  h += pls.some(p => p.lat != null) ? `<div id="map" role="region" aria-label="地圖"></div><p class="muted tiny" style="margin:6px 0 16px">地圖資料 © OpenStreetMap 貢獻者</p>` : `<div class="card" style="background:var(--sky)">拍照時允許「使用位置」，去過的地方就會出現在地圖上。</div>`;
  h += `<div style="display:flex;flex-direction:column;gap:10px;margin-top:12px">${pls.map(pl => { const c = placeCover(pl); return `<button class="hit listrow" data-act="go" data-to="place" data-id="${pl.id}">${c ? `<img src="${purl(c)}" alt="">` : ''}<span class="grow" style="line-height:1.5"><strong>${esc(pl.name)}</strong><br><span class="muted small">${esc(pl.city || '')}・${worksAt(pl.id).length} 件</span></span>${I.next}</button>`; }).join('')}</div></main>${nav('map')}`;
  return h;
}
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
  let h = `<main class="screen"><div class="row" style="justify-content:space-between"><button class="back" data-act="back">${I.back}我的畫廊</button><button class="ibtn" data-act="go" data-to="settings" aria-label="設定">${I.set}</button></div>
  <div class="row" style="gap:16px;margin-top:6px">${avatarHtml(96)}<div class="grow"><p class="serif" style="margin:0;font-size:24px;line-height:1.3">${esc(S.settings.name || '我')}</p><p class="muted small" style="margin:0">${S.works.length} 件作品・${S.places.length} 個地點</p>
  <div class="row wrap" style="margin-top:8px"><button class="btn" data-act="pickAvatar" style="min-height:44px;font-size:14px">上傳照片</button>${meShots.length ? `<button class="btn" data-act="togglePick" style="min-height:44px;font-size:14px">從收藏挑</button>` : ''}</div></div></div>`;
  if (S.ui.pick) h += `<div class="card" style="margin-top:12px"><p style="margin:0 0 8px">選一張「我與作品」當大頭照</p><div class="row wrap">${meShots.map(p => `<button class="hit" style="width:auto" data-act="avatarFrom" data-id="${p.id}"><img class="avatar" src="${purl(p)}" alt="" style="width:72px;height:72px"></button>`).join('')}</div><p class="muted tiny" style="margin:8px 0 0">照片只存在你的手機裡。</p></div>`;
  h += `<h1 class="serif" style="margin:26px 0 0;font-size:30px">我的美感 DNA</h1>`;
  if (n < 5) {
    return h + `<div class="card" style="margin-top:16px;background:var(--pink)"><h2 class="serif" style="margin:0;font-size:22px;line-height:1.35">再收藏 ${5 - n} 件作品，就能看到你的美感 DNA</h2><p class="muted" style="margin:6px 0 0">目前有 ${n} 件可以分析的作品。多拍幾件喜歡的作品，這一頁會慢慢長出你自己的樣子。</p></div></main>${nav('home')}`;
  }
  h += `<p class="muted small" style="margin:4px 0 0">AI 歸納・依 ${D ? D.basis : n} 件作品・會隨你的收藏慢慢改變</p>`;
  if (!D) return h + `<button class="btn solid block" data-act="makeDna" style="margin-top:18px">${S.ui.busy.dna ? '<span class="spin"></span> 策展人正在看你的收藏…' : '請策展人整理我的美感'}</button></main>${nav('home')}`;
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
  if ((d.closest || []).length) h += `<p class="sec" style="margin-top:28px">你收藏裡最像你的藝術家</p><div style="display:flex;flex-direction:column;gap:10px">${d.closest.map((a, i) => `<div class="card row" style="border-radius:${RAD[i]}"><span class="serif ring" style="width:42px;height:42px;background:${PASTEL[i]};font-size:20px;flex:none;border-radius:24px 16px 26px 14px">${i + 1}</span><span class="grow" style="line-height:1.5"><strong>${esc(a.artist)}</strong><br><span class="muted small">${esc(a.why)}</span></span></div>`).join('')}</div>`;
  if ((d.recs || []).length) h += `<div style="margin:30px -22px 0;padding:26px 22px 28px;background:var(--sky);border-radius:48px 48px 0 0"><p class="sec" style="margin:0 0 4px">策展人推薦</p><h2 class="serif" style="margin:0 0 14px;font-size:24px;line-height:1.35">你可能也會喜歡，<br>但還沒認識的藝術家</h2><div style="display:flex;flex-direction:column;gap:12px">${d.recs.map((r, i) => `<div class="card" style="border-radius:${RAD[i]}"><strong style="font-size:18px">${esc(r.artist)}</strong> <span class="serif muted">${esc(r.artistOriginal || '')}</span><p style="margin:6px 0 0"><span class="muted">為什麼推薦：</span>${esc(r.why)}</p><p class="small row" style="margin:6px 0 0;align-items:flex-start;gap:6px">${I.pin}<span>${esc(r.where || '')}</span></p></div>`).join('')}</div></div>`;
  if (d.surprise && d.surprise.title) h += `<div class="card" style="margin-top:22px;background:var(--pink)"><p class="sec" style="margin:0">讓你意外的收藏</p><strong>${esc(d.surprise.title)}</strong><p style="margin:2px 0 0">${esc(d.surprise.text)}</p></div>`;
  h += `<p class="muted small" style="margin-top:16px">在作品頁點「最喜歡」，策展人會更了解你。</p><button class="btn solid block" data-act="shareDna" style="margin-top:12px">${I.dl}存成圖片分享</button></main>${nav('home')}`;
  return h;
}
function dimWord(k, v) { const d = DIMS.find(x => x[0] === k); if (!d || v == null) return '—'; if (v < 1.8) return '很' + d[2]; if (v < 2.7) return '偏' + d[2]; if (v <= 3.3) return '介於兩者之間'; if (v <= 4.2) return '偏' + d[3]; return '很' + d[3]; }

function keyGuide(p) {
  const G = {
    gemini: { url: 'https://aistudio.google.com/apikey', site: 'Google AI Studio', steps: ['用你的 Google 帳號登入（第一次使用要同意服務條款）', '按「Create API key」（建立 API 金鑰）', '複製以「AIza」開頭的那串文字，回來貼在下面'], note: '不用綁信用卡也能先用，每天有免費次數。依 Google 規定，免費額度的資料可能被用來改善他們的服務；在意的話可以在 AI Studio 開啟付費。注意：Gemini app 的訂閱和 API 是分開的。' },
    claude: { url: 'https://console.anthropic.com/settings/keys', site: 'Claude Console', steps: ['登入或註冊，先在 Billing 儲值一點額度（和 Claude 訂閱分開計費）', '按「Create Key」', '複製以「sk-ant-」開頭的金鑰，回來貼在下面'], note: 'Claude 目前無法把語音感想轉成文字，錄音會保留聲音。' },
    openai: { url: 'https://platform.openai.com/api-keys', site: 'OpenAI Platform', steps: ['登入，先在 Billing 設定付款（和 ChatGPT 訂閱分開計費）', '按「Create new secret key」', '複製以「sk-」開頭的金鑰，回來貼在下面'], note: 'ChatGPT 的 API 在這裡無法把語音感想轉成文字，錄音會保留聲音。' }
  }[p];
  return `<ol class="steps" style="margin-top:14px"><li>打開 <a href="${G.url}" target="_blank" rel="noopener">${G.site}</a>（會開新視窗）</li>${G.steps.map(s => `<li>${s}</li>`).join('')}</ol><p class="note">${G.note}<br>你的金鑰只存在這支手機裡，不會傳給任何人；只有在辨識照片時，才會直接送到你選的 AI。</p>`;
}
function aiSetupHtml(context) {
  const p = S.settings.provider;
  return `<div class="row wrap" role="radiogroup" aria-label="選擇 AI">${Object.entries(AI.PROVIDERS).map(([k, v]) => `<button class="opt ${p === k ? 'on' : ''}" role="radio" aria-checked="${p === k}" data-act="provider" data-v="${k}">${v.name}${k === 'gemini' ? '（推薦）' : ''}</button>`).join('')}</div>
  ${keyGuide(p)}<label class="lab" for="keyIn" style="margin-top:12px">${AI.PROVIDERS[p].name} 金鑰（${AI.PROVIDERS[p].keyHint}）</label><input id="keyIn" class="field" type="password" autocomplete="off" value="${esc((S.settings.keys || {})[p] || '')}" placeholder="貼上你的金鑰">
  <button class="btn solid block" data-act="testKey" data-ctx="${context}" style="margin-top:10px">${S.ui.busy.key ? '<span class="spin"></span> 測試中…' : '測試並儲存'}</button>${S.ui.obMsg ? `<p class="small" role="status" style="margin:8px 0 0">${esc(S.ui.obMsg)}</p>` : ''}`;
}

function viewSettings() {
  const p = S.settings.provider;
  return `<main class="screen"><button class="back" data-act="back">${I.back}返回</button><h1 class="serif" style="margin:6px 0 18px;font-size:32px">設定</h1>
  <p class="sec">解說用的 AI</p>${aiSetupHtml('settings')}
  <details style="margin-top:12px"><summary class="small" style="min-height:44px;display:flex;align-items:center;cursor:pointer">進階：模型名稱</summary><label class="lab" for="modelIn">${AI.PROVIDERS[p].name} 模型（看不懂可以不用改）</label><div class="row"><input id="modelIn" class="field" value="${esc((S.settings.models || {})[p] || AI.PROVIDERS[p].model)}"><button class="btn" data-act="saveModel">存</button></div></details>
  <p class="sec" style="margin-top:26px">解說長度</p><div class="row">${[['short', '簡短'], ['deep', '深入']].map(([k, l]) => `<button class="opt ${S.settings.length === k ? 'on' : ''}" data-act="length" data-v="${k}">${l}</button>`).join('')}</div>
  <p class="sec" style="margin-top:26px">備份</p><p class="small" style="margin:0 0 10px">照片和資料只存在這支手機的瀏覽器裡。換手機或清除 Safari 資料前，記得先匯出備份。建議每天看完展匯出一次。</p>
  <div class="row wrap"><button class="btn solid" data-act="exportData">${S.ui.busy.export ? '<span class="spin"></span> 匯出中…' : '匯出備份'}</button><button class="btn" data-act="importData">匯入備份</button></div><p class="muted tiny" id="storageInfo" style="margin:8px 0 0"></p>
  <p class="sec" style="margin-top:26px">加到主畫面</p><p class="small" style="margin:0">iPhone：用 Safari 打開，按下方的「分享」，選「加入主畫面」。Android：Chrome 選單裡選「安裝應用程式」。</p>
  <p class="sec" style="margin-top:26px">隱私</p><div class="card" style="background:var(--sage)">照片和資料都存在你的手機裡，這個 app 沒有伺服器。只有在辨識照片、轉錄語音、整理美感 DNA 時，才會把需要的內容直接送給你選的 AI。地點名稱會向 OpenStreetMap 查詢。</div>
  <button class="linkbtn" data-act="resetAll" style="color:var(--accent);margin-top:20px">清除這支手機上的所有資料</button></main>${nav('home')}`;
}

function viewOnboarding() {
  const st = S.ui.ob;
  let h = `<main class="screen nonav" style="padding-top:calc(48px + var(--safe-t))"><div style="position:absolute;right:-10px;top:10px">${I.leaf('#EBCDC2', 100)}</div>`;
  if (st === 0) h += `<p class="sec">歡迎</p><h1 class="serif" style="font-size:36px;line-height:1.2;margin:0">我的美術館</h1>${I.flourish}<p>把每次看展、路上遇見的美，自動整理成你自己的畫廊。</p>
  <div style="display:flex;flex-direction:column;gap:10px;margin:18px 0">${[['在美術館或路上，拍下來就好', 'AI 會判斷作品、地點和日期，自動整理。'], ['邊看邊理解', '拍完立刻有簡短解說，想聽更多再點開。'], ['慢慢認識自己的美感', '收藏越多，策展人越懂你喜歡什麼。']].map(([a, b], i) => `<div class="card" style="background:${PASTEL[i]};border-radius:${RAD[i]}"><strong>${a}</strong><br><span class="small">${b}</span></div>`).join('')}</div>
  <p class="muted small">照片和資料只存在你的手機裡。</p><button class="btn solid block" data-act="ob" data-v="1">開始</button>`;
  if (st === 1) h += `<p class="sec">1 / 3</p><h1 class="serif" style="font-size:30px;margin:0 0 14px">怎麼稱呼你？</h1><label class="lab" for="obName">你的名字</label><input id="obName" class="field" maxlength="12" value="${esc(S.settings.name)}" placeholder="例如：Ruby"><p class="muted small">畫廊會叫做「名字的畫廊」，之後也可以改。</p><button class="btn solid block" data-act="obName" style="margin-top:12px">下一步</button>`;
  if (st === 2) h += `<p class="sec">2 / 3</p><h1 class="serif" style="font-size:30px;margin:0 0 6px">設定你的 AI</h1><p style="margin:0 0 12px">辨識作品和寫解說，需要一把你自己的 AI 金鑰。照著下面的步驟，大約 3 分鐘。</p>${aiSetupHtml('ob')}<div class="row" style="margin-top:12px"><button class="btn ghost grow" data-act="ob" data-v="3">先跳過，之後再設定</button>${(S.settings.keys || {})[S.settings.provider] ? '<button class="btn solid grow" data-act="ob" data-v="3">下一步</button>' : ''}</div>`;
  if (st === 3) h += `<p class="sec">3 / 3</p><h1 class="serif" style="font-size:30px;margin:0 0 10px">放到手機主畫面</h1><p>這樣打開就像一般的 app，也比較不會被系統清掉資料。</p>
  <ol class="steps"><li>用 Safari 打開這個網頁</li><li>按下方中間的「分享」按鈕</li><li>往下找「加入主畫面」，按「新增」</li></ol><p class="muted small">Android：在 Chrome 選單裡選「安裝應用程式」。</p><div class="note" style="margin-top:8px">拍照時請允許使用相機和位置，AI 才能判斷你在哪裡。</div><button class="btn solid block" data-act="obDone" style="margin-top:16px">開始使用</button>`;
  return h + `</main>`;
}

const VIEWS = { home: viewHome, place: viewPlace, work: viewWork, camera: viewCamera, summary: viewSummary, map: viewMap, dna: viewDna, settings: viewSettings };
function render() {
  const app = $('#app');
  app.innerHTML = !S.settings.onboarded ? viewOnboarding() : (VIEWS[S.route.name] || viewHome)();
  const rk = S.settings.onboarded ? S.route.name + (S.route.p.id || '') : 'ob' + S.ui.ob;
  if (rk !== render.last) { const sc = app.querySelector('.screen,.cam'); if (sc) sc.classList.add('enter'); render.last = rk; }
  if (S.route.name === 'map' && S.settings.onboarded) initMap();
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
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=14&accept-language=zh-TW&lat=${loc.lat}&lon=${loc.lng}`, { signal: ctl.signal });
    clearTimeout(t); const j = await r.json(); const a = j.address || {};
    const out = { city: a.city || a.town || a.village || a.municipality || a.county || a.state || null, country: a.country || null };
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
  const name = (city || '路上') + '街頭';
  const f = S.places.find(p => p.kind === 'walk' && norm(p.city || '') === norm(city || '') && (city || (dist(loc, p) != null && dist(loc, p) < 3)));
  return f || newPlace({ kind: 'walk', name, city: city || '', lat: loc ? loc.lat : null, lng: loc ? loc.lng : null });
}
async function museumPlace(r, loc, city) {
  const f = S.places.find(p => p.kind === 'museum' && (norm(p.name) === norm(r.museum) || (r.museumOriginal && norm(p.nameOriginal) === norm(r.museumOriginal)) || (dist(loc, p) != null && dist(loc, p) < 0.3)));
  return f || newPlace({ kind: 'museum', name: r.museum, nameOriginal: r.museumOriginal || '', city: r.city || city || '', lat: loc ? loc.lat : null, lng: loc ? loc.lng : null });
}
function applyAI(w, r, opts = {}) {
  const keep = (a, b) => (b != null && b !== '' ? b : a);
  Object.assign(w, {
    title: keep(w.title, r.title), titleOriginal: keep(w.titleOriginal, r.titleOriginal), artist: keep(w.artist, r.artist), artistOriginal: keep(w.artistOriginal, r.artistOriginal),
    year: keep(w.year, r.year), medium: keep(w.medium, r.medium), short: keep(w.short, r.short), long: keep(w.long, r.long), labelText: keep(w.labelText, r.labelText),
    confidence: r.confidence || w.confidence || 'medium', isCopy: !!r.isCopy, dims: r.dims || w.dims, subjects: (r.subjects && r.subjects.length) ? r.subjects : (w.subjects || []),
    kind: r.isStreet ? 'street' : 'artwork', aiProvider: S.settings.provider, status: 'ready', error: ''
  });
  if (opts.fromLabel) { w.labelUsed = true; if (w.confidence === 'low') w.confidence = 'high'; }
}
function candidatesFor(placeId) { return placeId ? worksAt(placeId).filter(w => w.status === 'ready').sort((a, b) => lastAt(b) - lastAt(a)).slice(0, 40).map(w => ({ id: w.id, title: w.title + (w.titleOriginal ? ' / ' + w.titleOriginal : ''), artist: w.artist })) : []; }

async function processFile(file, fromCamera) {
  const q = { id: uid(), status: 'prep', thumb: null }; S.queue.push(q); if (S.route.name === 'camera') render();
  try {
    const exif = await readExif(file);
    const prep = await prepareImage(file);
    q.thumb = URL.createObjectURL(prep.thumb);
    const takenAt = exif.time || (fromCamera ? Date.now() : (file.lastModified || Date.now()));
    const loc = exif.lat != null ? { lat: exif.lat, lng: exif.lng } : (fromCamera ? await getLocation() : null);
    const photo = { id: uid(), workId: null, placeId: null, type: '作品', blob: prep.full, thumb: prep.thumb, w: prep.w, h: prep.h, takenAt, lat: loc ? loc.lat : null, lng: loc ? loc.lng : null, createdAt: Date.now() };
    const sess = currentSession(takenAt, loc);
    const geo = await reverseCity(loc);
    q.status = 'ai'; if (S.route.name === 'camera') render();
    let r = null, err = null;
    try { r = await AI.analyzePhoto(S.settings, { imageB64: prep.aiData, takenAt, placeHint: sess ? placeOf(sess.placeId).name : null, cityHint: geo && geo.city, candidates: candidatesFor(sess && sess.placeId) }); }
    catch (e) { err = e; }
    await integrate(photo, r, { sess, loc, geo, takenAt, err });
    if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  } catch (e) { toast('這張照片處理失敗：' + e.message); }
  S.queue = S.queue.filter(x => x !== q);
  render();
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
  else if (r.museum && !r.isStreet) place = await museumPlace(r, loc, city);
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
  if (!fromCamera && arr.length > 1) {
    const withT = await Promise.all(arr.map(async f => ({ f, t: (await readExif(f)).time || f.lastModified || 0 })));
    withT.sort((a, b) => a.t - b.t); arr.splice(0, arr.length, ...withT.map(x => x.f));
    toast(`正在整理 ${arr.length} 張照片，會依拍攝時間自動分組。`, 4000);
  }
  for (const f of arr) await processFile(f, fromCamera);
}
async function reanalyze(w, useCandidates = false) {
  const ps = photosOf(w.id); if (!ps.length) return;
  S.ui.busy[w.id] = true; render();
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
  delete S.ui.busy[w.id]; render();
}
async function retryPending() {
  if (S.ui.busy.retry || !navigator.onLine || !(S.settings.keys || {})[S.settings.provider]) return;
  const ps = S.works.filter(w => w.status === 'pending'); if (!ps.length) return;
  S.ui.busy.retry = true; render();
  for (const w of ps) await reanalyze(w, true);
  delete S.ui.busy.retry; render();
}

/* ---------- 錄音 ---------- */
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
  const w = workOf(workId); if (!w) return render();
  const t = { id: uid(), at: Date.now(), kind: 'voice', audio: blob, dur, text: AI.PROVIDERS[S.settings.provider].audio ? '轉成文字中…' : `（語音 ${dur} 秒）` };
  w.thoughts = [t, ...(w.thoughts || [])]; await saveWork(w); render();
  if (AI.PROVIDERS[S.settings.provider].audio) {
    try { const text = await AI.transcribe(S.settings, { audioB64: await blobToBase64(blob), audioMime: blob.type.split(';')[0], workTitle: w.title }); t.text = String(text).trim(); toast(`感想已存到《${w.title}》`); }
    catch (e) { t.text = `（語音 ${dur} 秒，之後可以重新轉文字）`; toast(e.message); }
    await saveWork(w); render();
  } else toast(`感想已存到《${w.title}》`);
}

/* ---------- 美感 DNA ---------- */
async function makeDna(reword) {
  const el = eligible(); if (el.length < 5) return;
  S.ui.busy.dna = true; render();
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
    S.dna = { basis: el.length, data, palette, avg, subjects, at: Date.now() }; await DB.setKV('dna', S.dna);
  } catch (e) { toast(e.message); }
  delete S.ui.busy.dna; render();
}
async function shareDna() {
  const d = S.dna && S.dna.data; if (!d) return;
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; const g = c.getContext('2d');
  g.fillStyle = '#FBF7EF'; g.fillRect(0, 0, 1080, 1350); g.fillStyle = '#F4E3DD'; g.beginPath(); g.roundRect(70, 160, 940, 760, [120, 50, 140, 40]); g.fill();
  g.fillStyle = '#6B5D55'; g.font = '36px "Noto Sans TC", sans-serif'; g.fillText(`${S.settings.name || '我'}的美感 DNA`, 130, 260);
  g.fillStyle = '#3A2F2A'; g.font = '700 74px "Noto Serif TC", serif'; wrap(g, d.name, 130, 370, 820, 92);
  g.font = '34px "Noto Sans TC", sans-serif'; g.fillStyle = '#6B5D55'; g.fillText((d.tags || []).join('  ·  '), 130, 560);
  g.fillStyle = '#3A2F2A'; g.font = '38px "Noto Sans TC", sans-serif'; wrap(g, d.oneLiner || '', 130, 640, 820, 58);
  (S.dna.palette || []).forEach((col, i) => { g.fillStyle = col; g.beginPath(); g.arc(190 + i * 175, 1050, 70, 0, Math.PI * 2); g.fill(); });
  g.fillStyle = '#6B5D55'; g.font = '30px "Noto Sans TC", sans-serif'; g.fillText(`依 ${S.dna.basis} 件作品・我的美術館`, 130, 1240);
  const blob = await new Promise(r => c.toBlob(r, 'image/png')); const file = new File([blob], 'my-aesthetic-dna.png', { type: 'image/png' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: '我的美感 DNA' }); return; } catch (e) { if (e.name === 'AbortError') return; } }
  downloadBlob(blob, 'my-aesthetic-dna.png');
}
function wrap(g, text, x, y, maxW, lh) { let line = ''; for (const ch of String(text)) { if (g.measureText(line + ch).width > maxW) { g.fillText(line, x, y); line = ch; y += lh; } else line += ch; } if (line) g.fillText(line, x, y); }
function downloadBlob(blob, name) { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000); }

/* ---------- 備份 ---------- */
async function exportData() {
  S.ui.busy.export = true; render();
  try {
    const photos = [];
    for (const p of S.photos) photos.push({ ...p, blob: await blobToBase64(p.blob), thumb: await blobToBase64(p.thumb) });
    const works = [];
    for (const w of S.works) works.push({ ...w, thoughts: await Promise.all((w.thoughts || []).map(async t => t.audio ? { ...t, audio: await blobToBase64(t.audio), audioType: t.audio.type } : t)) });
    const settings = { ...S.settings, keys: {} };
    const avatar = await DB.getKV('avatar', null);
    const data = { app: 'my-gallery', version: 1, exportedAt: Date.now(), settings, places: S.places, works, photos, dna: S.dna, artist: S.artist, avatar: avatar ? await blobToBase64(avatar) : null };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const name = `my-gallery-backup-${ymd(Date.now())}.json`; const file = new File([blob], name, { type: 'application/json' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: '我的美術館備份' }); } catch (e) { if (e.name !== 'AbortError') downloadBlob(blob, name); } }
    else downloadBlob(blob, name);
    toast('備份檔已產生。建議存到「檔案」或雲端硬碟。（金鑰不會包含在備份裡）', 5000);
  } catch (e) { toast('匯出失敗：' + e.message); }
  delete S.ui.busy.export; render();
}
async function importData(file) {
  try {
    const data = JSON.parse(await file.text());
    if (data.app !== 'my-gallery') throw new Error('這不是我的美術館的備份檔');
    if (!confirm(`要匯入 ${data.works.length} 件作品、${data.photos.length} 張照片嗎？相同的資料會被覆蓋，其他資料會保留。`)) return;
    for (const p of data.places) { await savePlace(p); }
    for (const p of data.photos) { await savePhoto({ ...p, blob: base64ToBlob(p.blob, 'image/jpeg'), thumb: base64ToBlob(p.thumb, 'image/jpeg') }); }
    for (const w of data.works) { await saveWork({ ...w, thoughts: (w.thoughts || []).map(t => t.audio ? { ...t, audio: base64ToBlob(t.audio, t.audioType || 'audio/mp4') } : t) }); }
    if (data.dna) await DB.setKV('dna', data.dna);
    if (data.artist) await DB.setKV('artist', data.artist);
    if (data.avatar) await DB.setKV('avatar', base64ToBlob(data.avatar, 'image/jpeg'));
    if (data.settings && data.settings.name && !S.settings.name) { S.settings.name = data.settings.name; await saveSettings(); }
    await loadAll(); toast('匯入完成。'); render();
  } catch (e) { toast('匯入失敗：' + e.message, 5000); }
}

/* ---------- 動作 ---------- */
const ACT = {
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
  saveInfo: async () => { const w = workOf(S.route.p.id); Object.assign(w, { title: $('#eiT').value.trim() || w.title, artist: $('#eiA').value.trim(), year: $('#eiY').value.trim(), medium: $('#eiM').value.trim(), userEdited: true, confidence: 'high' }); if (w.status === 'pending' && w.title !== '待辨識的作品') w.status = 'ready'; S.ui.editInfo = false; await saveWork(w); toast('已更新。'); render(); },
  reanalyze: () => { const w = workOf(S.route.p.id); if (w && !S.ui.busy[w.id]) reanalyze(w, w.status === 'pending'); },
  retryAll: () => retryPending(),
  artistDna: async () => {
    const w = workOf(S.route.p.id); if (S.ui.busy.artist) return; S.ui.busy.artist = true; render();
    try { const k = norm(w.artistOriginal || w.artist); const works = S.works.filter(x => norm(x.artistOriginal || x.artist) === k).map(x => x.title); S.artist[k] = await AI.artistDna(S.settings, { artist: w.artist, artistOriginal: w.artistOriginal, works }); await DB.setKV('artist', S.artist); }
    catch (e) { toast(e.message); }
    delete S.ui.busy.artist; render();
  },
  write: () => { S.ui.writing = !S.ui.writing; render(); if (S.ui.writing) setTimeout(() => $('#noteIn') && $('#noteIn').focus(), 50); },
  saveNote: async () => { const w = workOf(S.route.p.id); const t = $('#noteIn').value.trim(); if (t) { w.thoughts = [{ id: uid(), at: Date.now(), kind: 'text', text: t }, ...(w.thoughts || [])]; await saveWork(w); toast('感想已存下來。'); } S.ui.writing = false; render(); },
  startRec: d => startRec(d.id || (S.route.name === 'work' ? S.route.p.id : (S.last && S.last.workId))),
  stopRec: () => stopRec(),
  sheet: d => { S.ui.sheet = d.v || null; render(); },
  setType: async d => { const w = workOf(S.route.p.id); const p = photosOf(w.id)[S.ui.photoIdx]; p.type = d.v; await savePhoto(p); S.ui.sheet = null; toast(`已改成「${d.v}」。`); render(); },
  movePhoto: async d => {
    const w = workOf(S.route.p.id); const ps = photosOf(w.id); const p = ps[S.ui.photoIdx]; const t = workOf(d.id);
    p.workId = t.id; await savePhoto(p); S.ui.sheet = null; S.ui.photoIdx = 0;
    if (ps.length <= 1) { S.works = S.works.filter(x => x.id !== w.id); await DB.del('works', w.id); toast(`已移到《${t.title}》。原本那件沒有照片了，已自動移除。`); go('work', { id: t.id }); S.stack.pop(); return; }
    toast(`已移到《${t.title}》。`); render();
  },
  split: async () => {
    const w = workOf(S.route.p.id); const ps = photosOf(w.id); const p = ps[S.ui.photoIdx];
    if (ps.length <= 1) { S.ui.sheet = null; toast('這件作品只有這一張照片了。'); render(); return; }
    const nw = { id: uid(), placeId: w.placeId, title: '新的作品', status: 'pending', thoughts: [], fav: false, createdAt: Date.now() };
    S.works.push(nw); await saveWork(nw); p.workId = nw.id; await savePhoto(p); S.ui.sheet = null;
    go('work', { id: nw.id }); reanalyze(nw, false);
  },
  makeCover: async () => { const w = workOf(S.route.p.id); const p = photosOf(w.id)[S.ui.photoIdx]; const pl = placeOf(w.placeId); pl.coverPhotoId = p.id; await savePlace(pl); S.ui.sheet = null; toast('已設成封面。'); render(); },
  removePhoto: async () => {
    const w = workOf(S.route.p.id); const ps = photosOf(w.id); const p = ps[S.ui.photoIdx];
    if (!confirm(ps.length <= 1 ? '這是這件作品唯一的照片，刪除後整件作品也會移除。確定嗎？（手機相簿裡的原圖不受影響）' : '確定刪除這張照片嗎？（手機相簿裡的原圖不受影響）')) return;
    S.photos = S.photos.filter(x => x.id !== p.id); await DB.del('photos', p.id); S.ui.sheet = null; S.ui.photoIdx = 0;
    if (ps.length <= 1) { S.works = S.works.filter(x => x.id !== w.id); await DB.del('works', w.id); back(); return; }
    render();
  },
  deleteWork: async () => {
    const w = workOf(S.route.p.id); if (!confirm(`確定刪除《${w.title}》和它的 ${photosOf(w.id).length} 張照片嗎？（手機相簿裡的原圖不受影響）`)) return;
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
    try { await AI.testKey(S.settings); S.ui.obMsg = '成功！金鑰可以使用，已經存好了。'; retryPending(); }
    catch (e) { S.ui.obMsg = e.message; }
    delete S.ui.busy.key; render();
  },
  saveModel: async () => { S.settings.models = { ...S.settings.models, [S.settings.provider]: $('#modelIn').value.trim() }; await saveSettings(); toast('已儲存。'); },
  length: async d => { S.settings.length = d.v; await saveSettings(); render(); },
  exportData: () => { if (!S.ui.busy.export) exportData(); },
  importData: () => $('#importInput').click(),
  resetAll: async () => { if (!confirm('確定要清除這支手機上的所有作品、照片和設定嗎？這個動作無法復原，建議先匯出備份。')) return; for (const s of ['photos', 'works', 'places', 'kv']) await DB.clear(s); location.reload(); },
  ob: d => { const k = $('#keyIn'); if (k && k.value.trim()) S.settings.keys[S.settings.provider] = k.value.trim(); saveSettings(); S.ui.ob = +d.v; S.ui.obMsg = ''; render(); scrollTo(0, 0); },
  obName: async () => { S.settings.name = $('#obName').value.trim(); await saveSettings(); S.ui.ob = 2; render(); scrollTo(0, 0); },
  obDone: async () => { S.settings.onboarded = true; await saveSettings(); tab('home'); }
};
async function setAvatar(blob) { await DB.setKV('avatar', blob); if (S.avatarUrl) URL.revokeObjectURL(S.avatarUrl); S.avatarUrl = URL.createObjectURL(blob); }

document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = ACT[el.dataset.act]; if (!fn) return;
  e.preventDefault(); fn(el.dataset, el, e);
});
document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'nameIn') ACT.saveName(); });
$('#camInput').addEventListener('change', e => { const f = e.target.files; if (S.route.name !== 'camera') tab('camera'); handleFiles(f, true).finally(() => { e.target.value = ''; }); });
$('#libInput').addEventListener('change', e => { const f = e.target.files; if (S.route.name !== 'camera') tab('camera'); handleFiles(f, false).finally(() => { e.target.value = ''; }); });
$('#addInput').addEventListener('change', async e => {
  const w = workOf(S.route.p.id); if (!w) return;
  for (const f of e.target.files) { const exif = await readExif(f); const prep = await prepareImage(f); const p = { id: uid(), workId: w.id, type: '細節', blob: prep.full, thumb: prep.thumb, w: prep.w, h: prep.h, takenAt: exif.time || f.lastModified || Date.now(), lat: exif.lat ?? null, lng: exif.lng ?? null, createdAt: Date.now() }; S.photos.push(p); await savePhoto(p); }
  e.target.value = ''; toast('照片已補進這件作品，類型可以在「整理這張照片」裡修改。'); render();
});
$('#avatarInput').addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; const prep = await prepareImage(f); await setAvatar(prep.thumb); e.target.value = ''; render(); });
$('#importInput').addEventListener('change', e => { const f = e.target.files[0]; if (f) importData(f); e.target.value = ''; });
window.addEventListener('online', () => { setTimeout(retryPending, 1500); });

async function loadAll() {
  S.settings = { ...DEFAULTS, ...(await DB.getKV('settings', {})) };
  S.settings.keys = S.settings.keys || {}; S.settings.models = S.settings.models || {};
  [S.works, S.places, S.photos] = await Promise.all([DB.all('works'), DB.all('places'), DB.all('photos')]);
  S.session = await DB.getKV('session', null); S.dna = await DB.getKV('dna', null); S.artist = await DB.getKV('artist', {}) || {};
  const av = await DB.getKV('avatar', null); if (av) { if (S.avatarUrl) URL.revokeObjectURL(S.avatarUrl); S.avatarUrl = URL.createObjectURL(av); }
  URLS.forEach(u => URL.revokeObjectURL(u)); URLS.clear();
}
(async function start() {
  try { await loadAll(); } catch (e) { $('#app').innerHTML = '<p style="padding:30px">這個瀏覽器無法儲存資料（可能是無痕模式）。請用一般模式的 Safari 或 Chrome 打開。</p>'; return; }
  S.route = { name: 'home', p: {} }; render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  setTimeout(retryPending, 3000);
})();
