const $ = s => document.querySelector(s);
const st = { tab: 'blocks', sel: null, assets: {}, custom: { blocks: [], items: [] } };
const FIVE = 'textures/';

// ---------- cute stuff: critter + click sound ----------
const cr = $('#critter'); let mx = 0, my = 0, cx = 0, cy = 0;
addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function tick() { cx += (mx + 12 - cx) * .25; cy += (my + 12 - cy) * .25;
  cr.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(tick); })();
const AC = new (window.AudioContext || window.webkitAudioContext)();
function pop(f = 520) {
  const o = AC.createOscillator(), g = AC.createGain();
  o.type = 'sine'; o.frequency.setValueAtTime(f, AC.currentTime);
  o.frequency.exponentialRampToValueAtTime(f * 2, AC.currentTime + .08);
  g.gain.setValueAtTime(.2, AC.currentTime); g.gain.exponentialRampToValueAtTime(.001, AC.currentTime + .15);
  o.connect(g).connect(AC.destination); o.start(); o.stop(AC.currentTime + .16);
}
addEventListener('mousedown', e => {
  pop(450 + Math.random() * 200); cr.textContent = '😻';
  for (let i = 0; i < 6; i++) { const p = document.createElement('div'); p.className = 'pop';
    p.textContent = ['💖', '✨', '⭐', '🌸'][i % 4]; p.style.left = e.clientX + 'px'; p.style.top = e.clientY + 'px';
    p.style.setProperty('--dx', (Math.random() * 80 - 40) + 'px'); document.body.append(p); setTimeout(() => p.remove(), 800); }
});
addEventListener('mouseup', () => cr.textContent = '🐱');
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2200); }

// ---------- data ----------
function entries() {
  if (st.tab === 'env') return ENV;
  const base = st.tab === 'blocks' ? BLOCKS : ITEMS, dir = st.tab === 'blocks' ? 'blocks' : 'items';
  return [...base, ...st.custom[st.tab]].map(id => ({ id, path: `${FIVE}${dir}/${id}.png` }));
}
function renderList() {
  const q = $('#search').value.toLowerCase(), l = $('#list'); l.innerHTML = '';
  entries().filter(e => e.id.includes(q)).forEach(e => {
    const d = document.createElement('div');
    d.className = 'row' + (st.sel && st.sel.path === e.path ? ' sel' : '');
    d.innerHTML = `<span>${e.id}</span><span class="dot">${st.assets[e.path] ? '●' : ''}</span>`;
    d.onclick = () => { st.sel = e; renderList(); renderEditor(); }; l.append(d);
  });
}
const loadImg = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = src; });
let timer;
async function drawPreview(a, cv) {
  clearInterval(timer); const img = await loadImg(a.png), c = cv.getContext('2d');
  const w = img.width, frames = a.anim.on ? Math.max(1, Math.floor(img.height / w)) : 1, h = a.anim.on ? w : img.height;
  cv.width = w; cv.height = h; let f = 0;
  const draw = () => { c.clearRect(0, 0, w, h); c.drawImage(img, 0, f * h, w, h, 0, 0, w, h); f = (f + 1) % frames; };
  draw(); if (frames > 1) timer = setInterval(draw, a.anim.frametime * 50);
}
function renderEditor() {
  const e = st.sel, ed = $('#editor'), a = st.assets[e.path];
  ed.innerHTML = `<h2>🎨 ${e.id}</h2>
  <div class="card prev"><canvas id="cv" width="16" height="16"></canvas>
   <div><div>${a ? 'Your texture is loaded!' : 'No texture yet — pick a PNG!'}</div>
   <div class="btns"><button id="up">📂 Choose PNG</button>
   ${a ? '<button id="glow">✨ Make it glow</button><button id="rm" class="danger">🗑 Remove</button>' : ''}</div></div></div>
  ${a ? `<div class="card"><b>🎞 Animation</b>
   <label class="chk"><input type="checkbox" id="an" ${a.anim.on ? 'checked' : ''}> Animated (PNG is frames stacked top-to-bottom)</label>
   <label class="chk">Speed (ticks per frame): <input type="number" id="ft" min="1" max="200" value="${a.anim.frametime}" style="width:80px"></label>
   <label class="chk"><input type="checkbox" id="ip" ${a.anim.interpolate ? 'checked' : ''}> Smooth blend between frames</label></div>` : ''}
  <input type="file" id="file" accept="image/png" hidden>`;
  $('#up').onclick = () => $('#file').click();
  $('#file').onchange = ev => { const f = ev.target.files[0]; if (!f) return; const r = new FileReader();
    r.onload = () => { st.assets[e.path] = { png: r.result, anim: { on: false, frametime: 2, interpolate: false } };
      renderList(); renderEditor(); toast('Texture added! 🎉'); }; r.readAsDataURL(f); };
  if (a) {
    drawPreview(a, $('#cv'));
    $('#rm').onclick = () => { delete st.assets[e.path]; renderList(); renderEditor(); };
    $('#an').onchange = ev => { a.anim.on = ev.target.checked; drawPreview(a, $('#cv')); };
    $('#ft').oninput = ev => { a.anim.frametime = Math.max(1, +ev.target.value || 1); drawPreview(a, $('#cv')); };
    $('#ip').onchange = ev => a.anim.interpolate = ev.target.checked;
    $('#glow').onclick = async () => {
      const img = await loadImg(a.png), w = img.width, h = a.anim.on ? w : img.height, N = 8;
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h * N; const c = cv.getContext('2d');
      for (let i = 0; i < N; i++) { c.filter = `brightness(${1 + .7 * Math.sin(Math.PI * i / (N - 1))}) saturate(1.2)`;
        c.drawImage(img, 0, 0, w, h, 0, i * h, w, h); }
      a.png = cv.toDataURL('image/png'); a.anim = { on: true, frametime: 3, interpolate: true };
      renderEditor(); toast('Glow animation made! ✨');
    };
  } else { const c = $('#cv').getContext('2d'); c.font = '12px serif'; c.fillText('🧱', 0, 12); }
}

// ---------- wiring ----------
document.querySelectorAll('#tabs button').forEach(b => b.onclick = () => {
  document.querySelectorAll('#tabs button').forEach(x => x.classList.remove('on')); b.classList.add('on');
  st.tab = b.dataset.tab; st.sel = null; $('#addrow').style.display = st.tab === 'env' ? 'none' : 'flex';
  $('#editor').innerHTML = '<p class="hint">👈 Pick something from the list to start decorating!</p>'; renderList(); });
$('#search').oninput = renderList;
$('#addbtn').onclick = () => { const v = $('#custom').value.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (v && st.tab !== 'env') { st.custom[st.tab].push(v); $('#custom').value = ''; renderList(); toast('Added ' + v + ' 💖'); } };
$('#export').onclick = async () => {
  const files = Object.entries(st.assets).map(([path, a]) => ({ path, b64: a.png.split(',')[1],
    mcmeta: a.anim.on ? { animation: { frametime: a.anim.frametime, interpolate: a.anim.interpolate } } : null }));
  if (!files.length) return toast('Add at least one texture first! 🧸');
  const r = await exportPack({ name: $('#pname').value, desc: $('#pdesc').value, format: $('#pfmt').value, files });
  if (r.ok) toast('Pack saved! Open the .mcpack file to import it into Minecraft 🎉');
};
renderList();

// ---------- export that works on Windows (Electron), web, and Android ----------
const u8b64 = s => btoa(unescape(encodeURIComponent(s)));
async function exportPack(p) {
  const manifest = { format_version: 2,
    header: { name: p.name || 'BlockBuddy Pack', description: p.desc, uuid: crypto.randomUUID(), version: [1, 0, 0], min_engine_version: p.format.split('.').map(Number) },
    modules: [{ type: 'resources', uuid: crypto.randomUUID(), version: [1, 0, 0] }] };
  const flip = p.files.filter(f => f.mcmeta).map(f => ({ flipbook_texture: f.path.replace(/\.png$/, ''),
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
