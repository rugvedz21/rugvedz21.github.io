/* ===================================
   RUGVED ZAMBARE - PIXEL VILLAGE GAME
   =================================== */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const WORLD_W = 3000;
const WORLD_H = 1950;
const PLAYER_SPEED = 300; // px/sec, world units
const INTERACT_RADIUS = 130;

const POI_META = {
  'about':              { icon: '🏠', title: 'About Me' },
  'skills':              { icon: '⚡', title: 'Skill Tree' },
  'project-stackmind':   { icon: '🧠', title: 'StackMind' },
  'project-grader':      { icon: '✅', title: 'AI Assignment Grader' },
  'project-nova':        { icon: '✋', title: 'NOVA' },
  'project-ar':          { icon: '🍽️', title: 'AR Food Menu — The Golden Oak' },
  'experience':          { icon: '🛡️', title: 'Experience' },
  'education':           { icon: '🎓', title: 'Academy — Education' },
  'contact':             { icon: '✉️', title: 'Contact' }
};

const GREETINGS = {
  'about': "Hey! I'm Rugved — an ML dev who ships real things, not just notebooks.",
  'skills': "Here's what I work with.",
  'project-stackmind': "A fine-tuned LLM that learned to stop hallucinating.",
  'project-grader': "Built a grading engine so fast it reads assignments in milliseconds.",
  'project-nova': "Control Spotify with just your hand. No clicks, no touching.",
  'project-ar': "Life-size 3D food, floating on your actual table. No app required.",
  'experience': "A look at my experience outside the classroom.",
  'education': "Where I've studied, from school to college.",
  'contact': "Want to get in touch? Here's how."
};

const QUEST_LOG_ORDER = [
  'about', 'skills',
  'project-stackmind', 'project-grader', 'project-nova', 'project-ar',
  'experience', 'education', 'contact'
];

// World-space centers of each building, for the minimap dots.
const MINIMAP_ZONES = [
  { x: 1148, y: 713, color: '#8b83ff' },  // about house
  { x: 525, y: 1020, color: '#4ade80' },  // skills hut
  { x: 1463, y: 300, color: '#f0b429' },  // academy (education)
  { x: 2243, y: 720, color: '#e05d5d' },  // guild hall (experience)
  { x: 1515, y: 1545, color: '#22d3ee' }, // project arcade
  { x: 2498, y: 1343, color: '#f472b6' }  // mailbox (contact)
];

/* ===================================
   STATE
   =================================== */

const state = {
  x: 1500, y: 1050,
  keys: { up: false, down: false, left: false, right: false },
  walkTarget: null,
  facing: 'right',
  lastFrame: 0,
  raf: null,
  running: false,
  nearPoi: null,
  soundOn: (localStorage.getItem('rz_sound') === '1'),
  explored: new Set(JSON.parse(localStorage.getItem('rz_explored') || '[]'))
};

let audioCtx = null;

function beep(freq = 440, dur = 0.09, type = 'square', vol = 0.045) {
  if (!state.soundOn || REDUCED_MOTION) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = vol;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const t0 = audioCtx.currentTime;
    osc.start(t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.stop(t0 + dur);
  } catch (_) { /* audio unsupported/blocked — silently skip */ }
}

function chirp(seq) {
  seq.forEach(([freq, delay], i) => setTimeout(() => beep(freq, 0.08), delay));
}

/* ===================================
   DOM REFS
   =================================== */

const $ = (sel) => document.querySelector(sel);
const bootScreen = $('#bootScreen');
const startBtn = $('#startBtn');
const gameViewport = $('#gameViewport');
const gameWorld = $('#gameWorld');
const player = $('#player');
const hud = $('#hud');
const soundBtn = $('#soundBtn');
const menuBtn = $('#menuBtn');
const xpFill = $('#xpFill');
const xpLabel = $('#xpLabel');
const tip = $('#tip');
const toast = $('#toast');
const questLog = $('#questLog');
const questLogList = $('#questLogList');
const questLogClose = $('#questLogClose');
const dialogPanel = $('#dialogPanel');
const dialogBackdrop = $('#dialogBackdrop');
const dialogClose = $('#dialogClose');
const dialogIcon = $('#dialogIcon');
const dialogTitle = $('#dialogTitle');
const aBtn = $('#aBtn');
const minimapBtn = $('#minimapBtn');
const minimapCanvas = $('#minimapCanvas');
const avatarBtn = $('#avatarBtn');
const imgLightbox = $('#imgLightbox');
const lightboxClose = $('#lightboxClose');

const poiEls = Array.from(document.querySelectorAll('.poi'));

/* ===================================
   BOOT
   =================================== */

startBtn.addEventListener('click', () => {
  beep(660, 0.12, 'square', 0.06);
  bootScreen.classList.add('hidden');
  setTimeout(() => { bootScreen.hidden = true; }, 550);
  gameViewport.hidden = false;
  updateSoundBtn();
  renderQuestLog();
  updateXpUI();
  positionPlayer();
  updateCamera();
  setupMinimap();
  startLoop();
  setTimeout(() => tip.classList.add('hidden'), 6000);
}, { once: true });

/* ===================================
   MOVEMENT INPUT
   =================================== */

const KEY_MAP = {
  ArrowUp: 'up', w: 'up', W: 'up',
  ArrowDown: 'down', s: 'down', S: 'down',
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right'
};

window.addEventListener('keydown', (e) => {
  const dir = KEY_MAP[e.key];
  if (dir) {
    state.keys[dir] = true;
    state.walkTarget = null;
  }
  if (e.key === 'Enter' || e.key === ' ') {
    if (state.nearPoi) openDialog(state.nearPoi);
  }
  if (e.key === 'Escape') {
    closeLightbox();
    closeDialog();
    closeQuestLog();
  }
});

window.addEventListener('keyup', (e) => {
  const dir = KEY_MAP[e.key];
  if (dir) state.keys[dir] = false;
});

// Pointer capture keeps the button "pressed" even if the finger drifts off
// its small hit area mid-press — without it, touch d-pads glitch/stutter
// because pointerleave fires the instant the finger wobbles a few pixels.
document.querySelectorAll('.dpad-btn').forEach((btn) => {
  const dir = btn.dataset.dir;
  const press = (e) => {
    e.preventDefault();
    try { btn.setPointerCapture(e.pointerId); } catch (_) { /* unsupported */ }
    state.keys[dir] = true;
    state.walkTarget = null;
    btn.classList.add('pressed');
  };
  const release = (e) => {
    if (e) e.preventDefault();
    state.keys[dir] = false;
    btn.classList.remove('pressed');
  };
  btn.addEventListener('pointerdown', press);
  btn.addEventListener('pointerup', release);
  btn.addEventListener('pointercancel', release);
  // Fallback for browsers without pointer capture support (rare):
  // only release on leave if this pointer was never captured.
  btn.addEventListener('pointerleave', (e) => {
    if (!btn.hasPointerCapture || !btn.hasPointerCapture(e.pointerId)) release(e);
  });
});

aBtn.addEventListener('click', () => {
  if (state.nearPoi) openDialog(state.nearPoi);
});

// Tap-to-walk on empty ground (not on a POI/UI element)
gameViewport.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.poi, #hud, #controls, .tip, .dialog-panel, .dialog-backdrop, .quest-log')) return;
  const rect = gameViewport.getBoundingClientRect();
  const camX = getCameraX();
  const camY = getCameraY();
  const worldX = e.clientX - rect.left - camX;
  const worldY = e.clientY - rect.top - camY;
  state.walkTarget = {
    x: Math.max(30, Math.min(WORLD_W - 30, worldX)),
    y: Math.max(30, Math.min(WORLD_H - 30, worldY))
  };
  state.keys = { up: false, down: false, left: false, right: false };
  tip.classList.add('hidden');
});

/* ===================================
   POI CLICK -> OPEN DIALOG IMMEDIATELY
   =================================== */

poiEls.forEach((el) => {
  el.addEventListener('click', () => {
    openDialog(el.dataset.poi);
  });
});

/* ===================================
   CAMERA
   =================================== */

let camX = 0, camY = 0;
function getCameraX() { return camX; }
function getCameraY() { return camY; }

function updateCamera() {
  const vw = gameViewport.clientWidth;
  const vh = gameViewport.clientHeight;

  if (WORLD_W <= vw) camX = (vw - WORLD_W) / 2;
  else camX = Math.min(0, Math.max(vw - WORLD_W, vw / 2 - state.x));

  if (WORLD_H <= vh) camY = (vh - WORLD_H) / 2;
  else camY = Math.min(0, Math.max(vh - WORLD_H, vh / 2 - state.y));

  gameWorld.style.transform = `translate(${camX}px, ${camY}px)`;
}

window.addEventListener('resize', updateCamera);

/* ===================================
   PLAYER RENDER
   =================================== */

function positionPlayer() {
  player.style.transform = `translate(${state.x}px, ${state.y}px) translate(-50%, -92%)`;
}

/* ===================================
   MAIN LOOP
   =================================== */

function startLoop() {
  if (state.running) return;
  state.running = true;
  state.lastFrame = performance.now();
  state.raf = requestAnimationFrame(loop);
}

function loop(now) {
  const dt = Math.min(0.05, (now - state.lastFrame) / 1000);
  state.lastFrame = now;

  let dx = 0, dy = 0;
  if (state.keys.up) dy -= 1;
  if (state.keys.down) dy += 1;
  if (state.keys.left) dx -= 1;
  if (state.keys.right) dx += 1;

  const usingKeys = dx !== 0 || dy !== 0;

  if (!usingKeys && state.walkTarget) {
    const tdx = state.walkTarget.x - state.x;
    const tdy = state.walkTarget.y - state.y;
    const dist = Math.hypot(tdx, tdy);
    if (dist < 6) {
      state.walkTarget = null;
    } else {
      dx = tdx / dist;
      dy = tdy / dist;
    }
  } else if (usingKeys) {
    const len = Math.hypot(dx, dy) || 1;
    dx /= len; dy /= len;
  }

  const moving = dx !== 0 || dy !== 0;

  if (moving) {
    state.x += dx * PLAYER_SPEED * dt;
    state.y += dy * PLAYER_SPEED * dt;
    state.x = Math.max(30, Math.min(WORLD_W - 30, state.x));
    state.y = Math.max(30, Math.min(WORLD_H - 30, state.y));
    if (dx > 0.1) state.facing = 'right';
    else if (dx < -0.1) state.facing = 'left';
    player.dataset.dir = state.facing;
    player.classList.add('walking');
  } else {
    player.classList.remove('walking');
  }

  positionPlayer();
  updateCamera();
  updateProximity();
  drawMinimap();

  state.raf = requestAnimationFrame(loop);
}

/* ===================================
   MINIMAP
   =================================== */

let minimapCtx = null;

function setupMinimap() {
  if (!minimapCanvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const cssW = minimapCanvas.clientWidth || 112;
  const cssH = minimapCanvas.clientHeight || 74;
  minimapCanvas.width = cssW * dpr;
  minimapCanvas.height = cssH * dpr;
  minimapCtx = minimapCanvas.getContext('2d');
  minimapCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
  minimapCtx.__w = cssW;
  minimapCtx.__h = cssH;
}

function drawMinimap() {
  if (!minimapCtx) return;
  const w = minimapCtx.__w, h = minimapCtx.__h;
  const sx = w / WORLD_W, sy = h / WORLD_H;

  minimapCtx.fillStyle = '#2f6b3a';
  minimapCtx.fillRect(0, 0, w, h);

  MINIMAP_ZONES.forEach((z) => {
    minimapCtx.fillStyle = z.color;
    minimapCtx.beginPath();
    minimapCtx.arc(z.x * sx, z.y * sy, 3, 0, Math.PI * 2);
    minimapCtx.fill();
  });

  minimapCtx.beginPath();
  minimapCtx.arc(state.x * sx, state.y * sy, 3, 0, Math.PI * 2);
  minimapCtx.fillStyle = '#ffffff';
  minimapCtx.fill();
  minimapCtx.lineWidth = 1;
  minimapCtx.strokeStyle = '#0d0b1e';
  minimapCtx.stroke();
}

window.addEventListener('resize', () => {
  if (minimapCtx) setupMinimap();
});

if (minimapBtn) minimapBtn.addEventListener('click', () => openQuestLog());

/* ===================================
   PROXIMITY / INTERACT PROMPT
   =================================== */

function updateProximity() {
  let closest = null;
  let closestDist = Infinity;

  poiEls.forEach((el) => {
    const cx = parseFloat(el.style.left) + el.offsetWidth / 2;
    const cy = parseFloat(el.style.top) + el.offsetHeight / 2;
    const d = Math.hypot(cx - state.x, cy - state.y);
    if (d < closestDist) { closestDist = d; closest = el; }
  });

  const inRange = closest && closestDist < INTERACT_RADIUS;
  const newNear = inRange ? closest.dataset.poi : null;

  if (newNear !== state.nearPoi) {
    poiEls.forEach((el) => el.classList.remove('near'));
    if (inRange) closest.classList.add('near');
    aBtn.classList.toggle('ready', !!inRange);
    state.nearPoi = newNear;
  }
}

/* ===================================
   DIALOG PANEL
   =================================== */

let typewriterTimer = null;

function typewriter(el, text) {
  clearInterval(typewriterTimer);
  el.textContent = '';
  if (REDUCED_MOTION) { el.textContent = text; return; }
  let i = 0;
  typewriterTimer = setInterval(() => {
    el.textContent = text.slice(0, i + 1);
    i++;
    if (i >= text.length) clearInterval(typewriterTimer);
  }, 22);
}

function openDialog(id) {
  const meta = POI_META[id];
  if (!meta) return;

  document.querySelectorAll('.dialog-page').forEach((p) => {
    p.hidden = p.dataset.page !== id;
  });

  dialogIcon.textContent = meta.icon;
  dialogTitle.textContent = meta.title;

  const npcLine = document.getElementById('npc-' + id);
  if (npcLine) typewriter(npcLine, GREETINGS[id] || '');

  dialogPanel.classList.add('open');
  dialogBackdrop.classList.add('open');
  dialogPanel.setAttribute('aria-hidden', 'false');
  dialogPanel.querySelector('.dialog-body').scrollTop = 0;

  beep(520, 0.08);
  markExplored(id);
}

function closeDialog() {
  if (!dialogPanel.classList.contains('open')) return;
  dialogPanel.classList.remove('open');
  dialogBackdrop.classList.remove('open');
  dialogPanel.setAttribute('aria-hidden', 'true');
  beep(340, 0.07);
}

dialogClose.addEventListener('click', closeDialog);
dialogBackdrop.addEventListener('click', closeDialog);

/* ===================================
   PHOTO LIGHTBOX
   =================================== */

function openLightbox() {
  imgLightbox.classList.add('open');
  imgLightbox.setAttribute('aria-hidden', 'false');
  beep(560, 0.08);
}
function closeLightbox() {
  if (!imgLightbox.classList.contains('open')) return;
  imgLightbox.classList.remove('open');
  imgLightbox.setAttribute('aria-hidden', 'true');
  beep(340, 0.07);
}

if (avatarBtn) avatarBtn.addEventListener('click', openLightbox);
lightboxClose.addEventListener('click', closeLightbox);
imgLightbox.addEventListener('click', (e) => {
  if (e.target === imgLightbox) closeLightbox();
});

/* ===================================
   EXPLORATION / XP
   =================================== */

function updateXpUI() {
  const total = QUEST_LOG_ORDER.length;
  const done = state.explored.size;
  xpFill.style.width = `${(done / total) * 100}%`;
  xpLabel.textContent = `Explored ${done} / ${total}`;
}

function showToast(text) {
  const item = document.createElement('div');
  item.className = 'toast-item';
  item.textContent = text;
  toast.appendChild(item);
  setTimeout(() => item.remove(), 2000);
}

function markExplored(id) {
  if (state.explored.has(id)) return;
  state.explored.add(id);
  localStorage.setItem('rz_explored', JSON.stringify(Array.from(state.explored)));
  updateXpUI();
  renderQuestLog();
  const title = POI_META[id].title;
  showToast(`+10 XP — Discovered ${title}!`);
  chirp([[880, 0], [1180, 90]]);

  if (state.explored.size === QUEST_LOG_ORDER.length) {
    setTimeout(() => {
      showToast('🏆 100% Explored — thanks for stopping by!');
      chirp([[660, 0], [880, 100], [1100, 200], [1320, 300]]);
    }, 500);
  }
}

/* ===================================
   QUEST LOG (fast travel menu)
   =================================== */

function renderQuestLog() {
  questLogList.innerHTML = '';
  QUEST_LOG_ORDER.forEach((id) => {
    const meta = POI_META[id];
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quest-log-item' + (state.explored.has(id) ? ' done' : '');
    btn.innerHTML = `<span class="qli-icon">${meta.icon}</span><span>${meta.title}</span><span class="qli-check">✓</span>`;
    btn.addEventListener('click', () => {
      closeQuestLog();
      travelTo(id);
    });
    questLogList.appendChild(btn);
  });
}

function travelTo(id) {
  const el = document.querySelector(`.poi[data-poi="${id}"]`);
  if (!el) return;
  const cx = parseFloat(el.style.left) + el.offsetWidth / 2;
  const cy = parseFloat(el.style.top) + el.offsetHeight / 2 + 70;
  state.x = Math.max(30, Math.min(WORLD_W - 30, cx));
  state.y = Math.max(30, Math.min(WORLD_H - 30, cy));
  state.keys = { up: false, down: false, left: false, right: false };
  state.walkTarget = null;
  positionPlayer();
  updateCamera();
  setTimeout(() => openDialog(id), 150);
}

function openQuestLog() {
  questLog.classList.add('open');
  questLog.setAttribute('aria-hidden', 'false');
  beep(500, 0.07);
}
function closeQuestLog() {
  questLog.classList.remove('open');
  questLog.setAttribute('aria-hidden', 'true');
}

menuBtn.addEventListener('click', openQuestLog);
questLogClose.addEventListener('click', closeQuestLog);
questLog.addEventListener('click', (e) => {
  if (e.target === questLog) closeQuestLog();
});

/* ===================================
   ACCORDIONS (skill categories & project "Full Details")
   =================================== */

document.addEventListener('click', (e) => {
  const header = e.target.closest('.acc-header');
  if (!header) return;
  const item = header.closest('.acc-item');
  const group = item.closest('.acc-group');
  const wasOpen = item.classList.contains('open');

  if (group) {
    group.querySelectorAll('.acc-item.open').forEach((el) => {
      if (el !== item) el.classList.remove('open');
    });
  }
  item.classList.toggle('open', !wasOpen);
  beep(wasOpen ? 380 : 480, 0.06);
});

/* ===================================
   SOUND TOGGLE
   =================================== */

function updateSoundBtn() {
  soundBtn.textContent = state.soundOn ? '🔊' : '🔇';
}

soundBtn.addEventListener('click', () => {
  state.soundOn = !state.soundOn;
  localStorage.setItem('rz_sound', state.soundOn ? '1' : '0');
  updateSoundBtn();
  if (state.soundOn) beep(700, 0.09);
});
