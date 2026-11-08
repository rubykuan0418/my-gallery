'use strict';
/* 資料都存在這支手機的瀏覽器裡（IndexedDB），不會上傳到任何伺服器。 */
const DB = (() => {
  let dbp = null;
  function open() {
    if (dbp) return dbp;
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open('my-gallery', 1);
      r.onupgradeneeded = () => {
        const d = r.result;
        if (!d.objectStoreNames.contains('photos')) d.createObjectStore('photos', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('works')) d.createObjectStore('works', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('places')) d.createObjectStore('places', { keyPath: 'id' });
        if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv', { keyPath: 'k' });
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    return dbp;
  }
  function req(store, mode, fn) {
    return open().then(d => new Promise((res, rej) => {
      const t = d.transaction(store, mode);
      const s = t.objectStore(store);
      let result;
      const r = fn(s);
      if (r) r.onsuccess = () => { result = r.result; };
      t.oncomplete = () => res(result);
      t.onerror = () => rej(t.error);
      t.onabort = () => rej(t.error);
    }));
  }
  return {
    all: store => req(store, 'readonly', s => s.getAll()),
    get: (store, key) => req(store, 'readonly', s => s.get(key)),
    put: (store, val) => req(store, 'readwrite', s => s.put(val)),
    del: (store, key) => req(store, 'readwrite', s => s.delete(key)),
    clear: store => req(store, 'readwrite', s => s.clear()),
    async getKV(k, dflt) { const r = await req('kv', 'readonly', s => s.get(k)); return r ? r.v : dflt; },
    setKV(k, v) { return req('kv', 'readwrite', s => s.put({ k, v })); }
  };
})();

/* 讀照片裡的拍攝時間與 GPS（只讀 JPEG 的 EXIF；讀不到就用現在時間與目前位置） */
async function readExif(file) {
  try {
    const buf = await file.slice(0, 256 * 1024).arrayBuffer();
    const v = new DataView(buf);
    if (v.getUint16(0) !== 0xFFD8) return {};
    let off = 2;
    while (off < v.byteLength - 4) {
      const marker = v.getUint16(off);
      const len = v.getUint16(off + 2);
      if (marker === 0xFFE1 && v.getUint32(off + 4) === 0x45786966) return parseTiff(v, off + 10);
      if ((marker & 0xFF00) !== 0xFF00) break;
      off += 2 + len;
    }
  } catch (e) { /* ignore */ }
  return {};
}
function parseTiff(v, start) {
  const le = v.getUint16(start) === 0x4949;
  const u16 = o => v.getUint16(start + o, le), u32 = o => v.getUint32(start + o, le);
  const out = {};
  function ifd(o, cb) {
    if (o <= 0 || start + o + 2 > v.byteLength) return;
    const n = u16(o);
    for (let i = 0; i < n; i++) {
      const e = o + 2 + i * 12;
      if (start + e + 12 > v.byteLength) return;
      cb(u16(e), u16(e + 2), u32(e + 4), e + 8);
    }
  }
  const str = (o, n) => { let s = ''; for (let i = 0; i < n - 1; i++) s += String.fromCharCode(v.getUint8(start + o + i)); return s; };
  const rat3 = o => { const r = i => u32(o + i * 8) / (u32(o + i * 8 + 4) || 1); return r(0) + r(1) / 60 + r(2) / 3600; };
  let exifPtr = 0, gpsPtr = 0;
  ifd(u32(4), (tag, type, count, vo) => {
    if (tag === 0x8769) exifPtr = u32(vo);
    if (tag === 0x8825) gpsPtr = u32(vo);
    if (tag === 0x0132 && !out.date) out.date = str(u32(vo), count);
  });
  ifd(exifPtr, (tag, type, count, vo) => { if (tag === 0x9003) out.date = str(u32(vo), count); });
  let lat, lon, latRef = 'N', lonRef = 'E';
  ifd(gpsPtr, (tag, type, count, vo) => {
    if (tag === 1) latRef = String.fromCharCode(v.getUint8(start + vo));
    if (tag === 3) lonRef = String.fromCharCode(v.getUint8(start + vo));
    if (tag === 2) lat = rat3(u32(vo));
    if (tag === 4) lon = rat3(u32(vo));
  });
  if (lat != null && lon != null && !(lat === 0 && lon === 0)) { out.lat = latRef === 'S' ? -lat : lat; out.lng = lonRef === 'W' ? -lon : lon; }
  if (out.date) {
    const m = out.date.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
    out.time = m ? new Date(+m[1], m[2] - 1, +m[3], +m[4], +m[5], +m[6]).getTime() : null;
  }
  return out;
}

/* 壓縮照片：手機原圖很大，存一張 1600px 的和一張 400px 的縮圖 */
function loadImage(blob) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => { res(img); setTimeout(() => URL.revokeObjectURL(url), 1000); };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('這張照片打不開')); };
    img.src = url;
  });
}
function drawScaled(img, max, quality) {
  const r = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas');
  c.width = Math.round(img.naturalWidth * r); c.height = Math.round(img.naturalHeight * r);
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  return new Promise(res => c.toBlob(b => res({ blob: b, w: c.width, h: c.height, canvas: c }), 'image/jpeg', quality));
}
async function prepareImage(file) {
  const img = await loadImage(file);
  const full = await drawScaled(img, 1600, 0.82);
  const thumb = await drawScaled(img, 420, 0.78);
  const ai = await drawScaled(img, 1024, 0.8);
  const aiData = ai.canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
  return { full: full.blob, thumb: thumb.blob, w: full.w, h: full.h, aiData };
}
function blobToBase64(blob) {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(String(r.result).split(',')[1]); r.onerror = rej; r.readAsDataURL(blob); });
}
function base64ToBlob(b64, type) {
  const bin = atob(b64); const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type });
}

/* 從照片中央取色：避開邊緣的牆面與畫框，不需要使用者裁切 */
async function paletteFromBlobs(blobs, k = 5) {
  const px = [];
  for (const b of blobs.slice(0, 40)) {
    try {
      const img = await loadImage(b);
      const c = document.createElement('canvas'); c.width = 40; c.height = 40;
      const sx = img.naturalWidth * 0.2, sy = img.naturalHeight * 0.18, sw = img.naturalWidth * 0.6, sh = img.naturalHeight * 0.64;
      const g = c.getContext('2d'); g.drawImage(img, sx, sy, sw, sh, 0, 0, 40, 40);
      const d = g.getImageData(0, 0, 40, 40).data;
      for (let i = 0; i < d.length; i += 4) px.push([d[i], d[i + 1], d[i + 2]]);
    } catch (e) { /* skip */ }
  }
  if (px.length < k) return [];
  let C = []; for (let i = 0; i < 12; i++) C.push(px[Math.floor(i * px.length / 12)].slice());
  let L = new Array(px.length);
  for (let it = 0; it < 12; it++) {
    for (let i = 0; i < px.length; i++) { let best = 0, bd = 1e9; for (let j = 0; j < C.length; j++) { const p = px[i], q = C[j]; const dd = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2; if (dd < bd) { bd = dd; best = j; } } L[i] = best; }
    const S = C.map(() => [0, 0, 0, 0]);
    for (let i = 0; i < px.length; i++) { const s = S[L[i]]; s[0] += px[i][0]; s[1] += px[i][1]; s[2] += px[i][2]; s[3]++; }
    C = C.map((c, j) => S[j][3] ? [S[j][0] / S[j][3], S[j][1] / S[j][3], S[j][2] / S[j][3]] : c);
  }
  const cnt = C.map((c, j) => L.filter(x => x === j).length);
  const scored = C.map((c, j) => { const mx = Math.max(...c), mn = Math.min(...c); const sat = mx ? (mx - mn) / mx : 0; return { c, w: cnt[j] / px.length, score: cnt[j] / px.length * (0.6 + 1.6 * sat) }; }).sort((a, b) => b.score - a.score);
  const out = [];
  for (const s of scored) {
    if (out.every(o => Math.hypot(o.c[0] - s.c[0], o.c[1] - s.c[1], o.c[2] - s.c[2]) > 38)) out.push(s);
    if (out.length === k) break;
  }
  return out.map(o => '#' + o.c.map(x => Math.round(x).toString(16).padStart(2, '0')).join('').toUpperCase());
}
