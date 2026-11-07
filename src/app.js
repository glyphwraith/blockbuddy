const $ = s => document.querySelector(s);
const st = { tab: 'blocks', sel: null, assets: {}, custom: { blocks: [], items: [] } };
const FIVE = 'textures/';

// ---------- cute stuff: cat buddy + soft click sound ----------
const buddy = $('#critter'), flip = $('#flip');
let mx = innerWidth / 2, my = innerHeight / 2, bx = mx, by = my, raf = 0, dir = 1;
function step() {
  const dx = mx + 22 - bx, dy = my + 18 - by; bx += dx * .2; by += dy * .2;
  if (Math.abs(dx) > 2) dir = dx > 0 ? 1 : -1;
  buddy.style.transform = `translate3d(${bx}px,${by}px,0)`; flip.style.transform = `scaleX(${dir})`;
  raf = Math.abs(dx) + Math.abs(dy) > .5 ? requestAnimationFrame(step) : 0;
}
addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; if (!raf) raf = requestAnimationFrame(step); }, { passive: true });
const AC = new (window.AudioContext || window.webkitAudioContext)();
function tok(f) {
  if (AC.state === 'suspended') AC.resume();
  const t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
  o.type = 'triangle'; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * .6, t + .09);
  g.gain.setValueAtTime(.18, t); g.gain.exponentialRampToValueAtTime(.001, t + .12);
  o.connect(g).connect(AC.destination); o.start(t); o.stop(t + .13);
}
const BITS = ['<svg viewBox="0 0 20 20"><path d="M10 18C3 14 3 7 10 6c7 1 7 8 0 12z" fill="#d9566a"/><path d="M6 6l4-3 4 3-4 1z" fill="#7f9e6c"/></svg>',
  '<svg viewBox="0 0 20 20"><g fill="#f7d98b"><circle cx="10" cy="4" r="3.2"/><circle cx="16" cy="10" r="3.2"/><circle cx="10" cy="16" r="3.2"/><circle cx="4" cy="10" r="3.2"/></g><circle cx="10" cy="10" r="2.6" fill="#d98b4a"/></svg>',
  '<svg viewBox="0 0 20 20"><path d="M3 17C3 8 9 3 17 3c0 8-5 14-14 14z" fill="#8fa77e"/></svg>'];
addEventListener('pointerdown', e => {
  tok(520 + Math.random() * 160);
  const s = flip.firstElementChild; s.classList.remove('hop'); void s.getBoundingClientRect(); s.classList.add('hop');
  for (let i = 0; i < 5; i++) { const p = document.createElement('div'); p.className = 'pop'; p.innerHTML = BITS[i % 3];
    p.style.left = e.clientX - 9 + 'px'; p.style.top = e.clientY - 9 + 'px'; p.style.setProperty('--dx', (Math.random() * 90 - 45) + 'px');
    document.body.append(p); setTimeout(() => p.remove(), 800); }
});
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); }

// ---------- library: starter lists + any vanilla pack the user loads ----------
st.base = {}; st.urls = {};
const CATS = { blocks: 'Blocks', items: 'Items', entity: 'Mobs', particle: 'Particles', env: 'Sky & Overlays', ui: 'UI', sounds: 'Sounds' };
const catOf = p => /^textures\/blocks\//.test(p) ? 'blocks' : /^textures\/items\//.test(p) ? 'items' : /^textures\/entity\//.test(p) ? 'entity'
  : /^textures\/particle\//.test(p) ? 'particle' : /^textures\/(environment|misc)\//.test(p) ? 'env' : /^textures\/(ui|gui)\//.test(p) ? 'ui'
  : /^sounds\/.*\.(ogg|wav|fsb)$/i.test(p) ? 'sounds' : null;
function entries() {
  const m = new Map(), add = p => { if (!m.has(p)) m.set(p, { path: p, id: p.replace(/^(textures|sounds)\//, '').replace(/^(blocks|items)\//, '').replace(/\.(png|ogg|wav|fsb)$/i, '') }); };
  if (st.tab === 'blocks') [...BLOCKS, ...st.custom.blocks].forEach(i => add('textures/blocks/' + i + '.png'));
  if (st.tab === 'items') [...ITEMS, ...st.custom.items].forEach(i => add('textures/items/' + i + '.png'));
  if (st.tab === 'env') ENV.forEach(e => add(e.path));
  Object.keys(st.base).forEach(p => catOf(p) === st.tab && add(p));
  return [...m.values()].sort((a, b) => a.id.localeCompare(b.id));
}
const srcOf = e => (st.assets[e.path] && st.assets[e.path].png) || (st.base[e.path] && (st.urls[e.path] = st.urls[e.path] || URL.createObjectURL(st.base[e.path])));
function renderList() {
  const q = $('#search').value.toLowerCase(), l = $('#list'), s = l.scrollTop, all = entries().filter(e => e.id.toLowerCase().includes(q));
  l.innerHTML = '';
  all.slice(0, 500).forEach(e => { const d = document.createElement('div');
    d.className = 'row' + (st.sel && st.sel.path === e.path ? ' sel' : '');
    d.innerHTML = `<span>${e.id}</span><span class="dot">${st.assets[e.path] ? '●' : ''}</span>`; d.onclick = () => openEntry(e); l.append(d); });
  if (all.length > 500) l.insertAdjacentHTML('beforeend', `<p class="hint2">${all.length - 500} more, type to search</p>`);
  l.scrollTop = s;
}
const loadImg = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = src; });
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
const readURL = f => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(f); });

// ---------- pixel editor ----------
let ed = null, timer;
const PAL = ['#5a4636', '#8b5e3c', '#c98b5a', '#f3d98a', '#f7efe0', '#ffffff', '#d9566a', '#f3a9a0', '#9db58c', '#6d8a5e', '#3f5e3a', '#b5ccd6', '#6a8fa8', '#7d7d7d', '#3a3a3a', '#000000'];
const Z = () => Math.max(2, Math.min(32, Math.floor(440 / Math.max(ed.w, ed.h))));
async function openEntry(e) {
  st.sel = e; clearInterval(timer); renderList();
  if (e.path.startsWith('sounds/')) return soundUI(e);
  const src = srcOf(e), a = st.assets[e.path];
  ed = { path: e.path, id: e.id, w: 16, h: 16, frames: [], cur: 0, tool: 'pencil', color: '#d9566a', undo: [], ft: a ? a.anim.frametime : 2, ip: a ? a.anim.interpolate : false };
  if (src) await frames(await loadImg(src), a && a.anim.on); else ed.frames = [mk(16, 16)];
  buildEditor();
}
async function frames(img, strip) {
  const w = img.width, h = strip ? w : img.height, n = strip ? Math.max(1, Math.floor(img.height / w)) : 1;
  ed.w = w; ed.h = h; ed.frames = []; ed.cur = 0;
  for (let i = 0; i < n; i++) { const c = mk(w, h); c.getContext('2d').drawImage(img, 0, i * h, w, h, 0, 0, w, h); ed.frames.push(c); }
}
function buildEditor() {
  $('#editor').innerHTML = `<h2>${ed.id}</h2>
  <div class="tools">${['pencil', 'eraser', 'fill', 'pick'].map(t => `<button data-t="${t}">${{ pencil: 'Pencil', eraser: 'Eraser', fill: 'Fill', pick: 'Pick' }[t]}</button>`).join('')}
   <input type="color" id="col" value="${ed.color}"><span id="pal">${PAL.map(c => `<i style="background:${c}" data-c="${c}"></i>`).join('')}</span>
   <button id="undo">Undo</button></div>
  <div class="edwrap"><canvas id="ec"></canvas><div class="side"><b>Frames</b><div id="fr"></div>
   <div class="btns"><button id="fa">+ Blank</button><button id="fd">Copy</button><button id="fx" class="danger">Delete</button></div>
   <div class="card"><canvas id="pv"></canvas><label class="chk">Speed (ticks per frame) <input type="number" id="ft" min="1" max="200" value="${ed.ft}" style="width:70px"></label>
    <label class="chk"><input type="checkbox" id="ip" ${ed.ip ? 'checked' : ''}> Smooth blend</label></div>
   <div class="btns"><button id="gl">Make it glow</button><button id="up">Load PNG</button><button id="rs" class="danger">Reset</button></div></div></div>
  <input type="file" id="file" accept="image/png" hidden>`;
  setTool('pencil'); refresh(false);
  document.querySelectorAll('.tools [data-t]').forEach(b => b.onclick = () => setTool(b.dataset.t));
  document.querySelectorAll('#pal i').forEach(i => i.onclick = () => { ed.color = i.dataset.c; $('#col').value = ed.color; setTool('pencil'); });
  $('#col').oninput = e => { ed.color = e.target.value; setTool('pencil'); };
  $('#undo').onclick = undo;
  $('#fa').onclick = () => { ed.frames.push(mk(ed.w, ed.h)); ed.cur = ed.frames.length - 1; refresh(); };
  $('#fd').onclick = () => { const c = mk(ed.w, ed.h); c.getContext('2d').drawImage(ed.frames[ed.cur], 0, 0); ed.frames.splice(ed.cur + 1, 0, c); ed.cur++; refresh(); };
  $('#fx').onclick = () => { if (ed.frames.length > 1) { ed.frames.splice(ed.cur, 1); ed.cur = Math.max(0, ed.cur - 1); refresh(); } };
  $('#ft').oninput = e => { ed.ft = Math.max(1, +e.target.value || 1); refresh(); };
  $('#ip').onchange = e => { ed.ip = e.target.checked; refresh(); };
  $('#gl').onclick = () => { const s = ed.frames[ed.cur], N = 8; ed.frames = [];
    for (let i = 0; i < N; i++) { const c = mk(ed.w, ed.h), x = c.getContext('2d'); x.filter = `brightness(${1 + .7 * Math.sin(Math.PI * i / (N - 1))}) saturate(1.2)`; x.drawImage(s, 0, 0); ed.frames.push(c); }
    ed.cur = 0; ed.ft = 3; ed.ip = true; $('#ft').value = 3; $('#ip').checked = true; refresh(); toast('Glow animation made!'); };
  $('#up').onclick = () => $('#file').click();
  $('#file').onchange = async e => { const f = e.target.files[0]; if (!f) return; const img = await loadImg(await readURL(f));
    const strip = img.height > img.width && img.height % img.width === 0 && confirm('This looks like an animation strip. Split it into frames?');
    snap(); await frames(img, strip); refresh(); };
  $('#rs').onclick = () => { delete st.assets[ed.path]; openEntry(st.sel); };
  const ec = $('#ec'); let down = false;
  ec.onpointerdown = e => { ec.setPointerCapture(e.pointerId); snap(); down = true; paint(e); if (ed.tool === 'fill' || ed.tool === 'pick') { down = false; refresh(); } };
  ec.onpointermove = e => down && paint(e);
  ec.onpointerup = () => { if (down) { down = false; refresh(); } };
}
function setTool(t) { ed.tool = t; document.querySelectorAll('.tools [data-t]').forEach(b => b.classList.toggle('on', b.dataset.t === t)); }
function snap() { ed.undo.push([ed.cur, ed.frames[ed.cur].getContext('2d').getImageData(0, 0, ed.w, ed.h)]); if (ed.undo.length > 40) ed.undo.shift(); }
function undo() { const u = ed && ed.undo.pop(); if (u && ed.frames[u[0]]) { ed.frames[u[0]].getContext('2d').putImageData(u[1], 0, 0); refresh(); } }
addEventListener('keydown', e => { if (e.ctrlKey && e.key === 'z' && ed && $('#ec')) undo(); });
function paint(e) {
  const r = $('#ec').getBoundingClientRect(), x = Math.floor((e.clientX - r.left) / r.width * ed.w), y = Math.floor((e.clientY - r.top) / r.height * ed.h);
  if (x < 0 || y < 0 || x >= ed.w || y >= ed.h) return;
  const f = ed.frames[ed.cur], c = f.getContext('2d');
  if (ed.tool === 'pencil') { c.fillStyle = ed.color; c.fillRect(x, y, 1, 1); }
  else if (ed.tool === 'eraser') c.clearRect(x, y, 1, 1);
  else if (ed.tool === 'pick') { const d = c.getImageData(x, y, 1, 1).data; ed.color = '#' + [d[0], d[1], d[2]].map(v => v.toString(16).padStart(2, '0')).join(''); $('#col').value = ed.color; setTool('pencil'); return; }
  else flood(c, x, y, ed.color);
  redraw();
}
function flood(c, x, y, col) {
  const id = c.getImageData(0, 0, ed.w, ed.h), d = id.data, w = ed.w, i0 = (y * w + x) * 4, t = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]];
  const q = mk(1, 1).getContext('2d'); q.fillStyle = col; q.fillRect(0, 0, 1, 1); const n = q.getImageData(0, 0, 1, 1).data;
  if (t[0] === n[0] && t[1] === n[1] && t[2] === n[2] && t[3] === 255) return;
  const stack = [[x, y]];
  while (stack.length) { const [px, py] = stack.pop(); if (px < 0 || py < 0 || px >= w || py >= ed.h) continue;
    const i = (py * w + px) * 4; if (d[i] !== t[0] || d[i + 1] !== t[1] || d[i + 2] !== t[2] || d[i + 3] !== t[3]) continue;
    d[i] = n[0]; d[i + 1] = n[1]; d[i + 2] = n[2]; d[i + 3] = 255; stack.push([px + 1, py], [px - 1, py], [px, py + 1], [px, py - 1]); }
  c.putImageData(id, 0, 0);
}
function redraw() {
  const c = $('#ec'), z = Z(), x = c.getContext('2d'); c.width = ed.w * z; c.height = ed.h * z; x.imageSmoothingEnabled = false;
  x.drawImage(ed.frames[ed.cur], 0, 0, c.width, c.height);
  if (z >= 8) { x.strokeStyle = 'rgba(90,70,54,.2)'; x.beginPath();
    for (let i = 1; i < ed.w; i++) { x.moveTo(i * z, 0); x.lineTo(i * z, c.height); }
    for (let i = 1; i < ed.h; i++) { x.moveTo(0, i * z); x.lineTo(c.width, i * z); } x.stroke(); }
}
function refresh(save = true) {
  redraw();
  const fr = $('#fr'); fr.innerHTML = '';
  ed.frames.forEach((f, i) => { const t = mk(ed.w, ed.h); t.getContext('2d').drawImage(f, 0, 0); t.className = 'fcv' + (i === ed.cur ? ' cur' : ''); t.onclick = () => { ed.cur = i; refresh(false); }; fr.append(t); });
  clearInterval(timer); const p = $('#pv'); p.width = ed.w; p.height = ed.h; const x = p.getContext('2d'); let i = 0;
  const d = () => { x.clearRect(0, 0, ed.w, ed.h); x.drawImage(ed.frames[i % ed.frames.length], 0, 0); i++; }; d();
  if (ed.frames.length > 1) timer = setInterval(d, ed.ft * 50);
  if (save) { const n = ed.frames.length, s = mk(ed.w, ed.h * n), sx = s.getContext('2d'); ed.frames.forEach((f, k) => sx.drawImage(f, 0, k * ed.h));
    st.assets[ed.path] = { png: s.toDataURL('image/png'), anim: { on: n > 1, frametime: ed.ft, interpolate: ed.ip } }; renderList(); }
}
function soundUI(e) {
  const src = srcOf(e);
  $('#editor').innerHTML = `<h2>${e.id}</h2><div class="card">${src ? `<audio controls src="${src}"></audio>` : 'No sound loaded yet'}
   <div class="btns"><button id="up">Replace with my .ogg</button>${st.assets[e.path] ? '<button id="rs" class="danger">Reset</button>' : ''}</div></div><input type="file" id="file" accept=".ogg,audio/ogg" hidden>`;
  $('#up').onclick = () => $('#file').click();
  $('#file').onchange = async ev => { const f = ev.target.files[0]; if (f) { st.assets[e.path] = { png: await readURL(f), anim: { on: false } }; renderList(); soundUI(e); } };
  if ($('#rs')) $('#rs').onclick = () => { delete st.assets[e.path]; renderList(); soundUI(e); };
}

// ---------- wiring ----------
const HINT = '<p class="hint">Pick something from the list to start drawing!<br><small>Tip: press "Load vanilla pack" to list every real Minecraft texture and sound.</small></p>';
Object.entries(CATS).forEach(([k, v]) => { const b = document.createElement('button'); b.textContent = v; b.dataset.tab = k; if (k === st.tab) b.className = 'on';
  b.onclick = () => { document.querySelectorAll('#tabs button').forEach(x => x.classList.remove('on')); b.classList.add('on'); clearInterval(timer); ed = null;
    st.tab = k; st.sel = null; $('#addrow').style.display = k === 'blocks' || k === 'items' ? 'flex' : 'none'; $('#editor').innerHTML = HINT; renderList(); };
  $('#tabs').append(b); });
$('#editor').innerHTML = HINT;
$('#search').oninput = renderList;
const addCustom = () => { const v = $('#custom').value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (v && st.custom[st.tab]) { st.custom[st.tab].push(v); $('#custom').value = ''; renderList(); toast('Added ' + v); } };
$('#addbtn').onclick = addCustom; $('#custom').onkeydown = e => { if (e.key === 'Enter') addCustom(); };
$('#loadbase').onclick = () => $('#base').click();
$('#base').onchange = e => { let n = 0;
  for (const f of e.target.files) { const m = f.webkitRelativePath.match(/(?:^|\/)((?:textures|sounds)\/.+)$/); if (m && catOf(m[1])) { st.base[m[1]] = f; n++; } }
  toast(n ? `Loaded ${n} vanilla files!` : 'No textures found. Pick the resource_pack folder.'); renderList(); };
$('#export').onclick = async () => {
  const files = Object.entries(st.assets).map(([path, a]) => ({ path, b64: a.png.split(',')[1],
    mcmeta: a.anim.on && path.endsWith('.png') ? { animation: { frametime: a.anim.frametime, interpolate: a.anim.interpolate } } : null }));
  if (!files.length) return toast('Edit at least one texture first!');
  const r = await exportPack({ name: $('#pname').value, desc: $('#pdesc').value, format: $('#pfmt').value, files });
  if (r.ok) toast('Pack saved! Open the .mcpack file to import it into Minecraft.');
};
renderList();

// ---------- export that works on Windows (Electron), web, and Android ----------
const u8b64 = s => btoa(unescape(encodeURIComponent(s)));
async function exportPack(p) {
  const manifest = { format_version: 2,
    header: { name: p.name || 'BlockBuddy Pack', description: p.desc, uuid: crypto.randomUUID(), version: [1, 0, 0], min_engine_version: p.format.split('.').map(Number) },
    modules: [{ type: 'resources', uuid: crypto.randomUUID(), version: [1, 0, 0] }] };
  const flip = p.files.filter(f => f.mcmeta && /^textures\/(blocks|items)\//.test(f.path)).map(f => ({ flipbook_texture: f.path.replace(/\.png$/, ''),
    atlas_tile: f.path.split('/').pop().replace('.png', ''), ticks_per_frame: f.mcmeta.animation.frametime, blend_frames: !!f.mcmeta.animation.interpolate }));
  const entries = [{ path: 'manifest.json', b64: u8b64(JSON.stringify(manifest, null, 2)) }, ...p.files.map(f => ({ path: f.path, b64: f.b64 }))];
  if (flip.length) entries.push({ path: 'textures/flipbook_textures.json', b64: u8b64(JSON.stringify(flip, null, 2)) });
  const name = (p.name || 'pack').replace(/[^\w\- ]/g, '') + '.mcpack';
  if (window.api) return window.api.exportPack({ name, files: entries });
  const zip = makeZip(entries.map(e => ({ n: e.path, d: Uint8Array.from(atob(e.b64), c => c.charCodeAt(0)) }))), cap = window.Capacitor;
  if (cap && cap.isNativePlatform && cap.isNativePlatform()) {
    let bin = ''; for (let i = 0; i < zip.length; i += 8192) bin += String.fromCharCode(...zip.subarray(i, i + 8192));
    const w = await cap.Plugins.Filesystem.writeFile({ path: name, data: btoa(bin), directory: 'CACHE' });
    await cap.Plugins.Share.share({ title: name, url: w.uri });
    return { ok: true };
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([zip], { type: 'application/zip' })); a.download = name; a.click();
  return { ok: true };
}
function makeZip(files) {
  const T = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; T[n] = c >>> 0; }
  const crc = d => { let c = ~0; for (let i = 0; i < d.length; i++) c = T[(c ^ d[i]) & 255] ^ (c >>> 8); return ~c >>> 0; };
  const enc = new TextEncoder(), parts = [], cd = []; let off = 0;
  for (const f of files) {
    const n = enc.encode(f.n), c = crc(f.d), L = f.d.length, h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true);
    h.setUint32(14, c, true); h.setUint32(18, L, true); h.setUint32(22, L, true); h.setUint16(26, n.length, true);
    parts.push(new Uint8Array(h.buffer), n, f.d);
    const e = new DataView(new ArrayBuffer(46));
    e.setUint32(0, 0x02014b50, true); e.setUint16(4, 20, true); e.setUint16(6, 20, true); e.setUint16(8, 0x0800, true);
    e.setUint32(16, c, true); e.setUint32(20, L, true); e.setUint32(24, L, true); e.setUint16(28, n.length, true); e.setUint32(42, off, true);
    cd.push(new Uint8Array(e.buffer), n); off += 30 + n.length + L;
  }
  let cs = 0; for (const x of cd) cs += x.length;
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, cs, true); end.setUint32(16, off, true);
  const all = [...parts, ...cd, new Uint8Array(end.buffer)], out = new Uint8Array(all.reduce((s, x) => s + x.length, 0));
  let q = 0; for (const x of all) { out.set(x, q); q += x.length; }
  return out;
}
