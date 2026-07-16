/* ===================================
   UI EFFECTS
   1. Particle Typography (hero title)
   2. Magnet Lines (contact background)
   3. Lanyard (about badge)
   4. Evil Eye (experience section)
   5. Infinite Menu (nav overlay)
   =================================== */

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ===================================
   1. PARTICLE TYPOGRAPHY
   =================================== */

(function particleTypography() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let W = 0, H = 0;
  let raf = null;
  let running = false;
  const mouse = { x: -9999, y: -9999 };

  function build() {
    const parent = canvas.parentElement;
    W = Math.min(parent.clientWidth, 820);
    const twoLine = W < 520;
    const fontSize = twoLine ? Math.min(W / 4.6, 72) : Math.min(W / 7.6, 100);
    H = twoLine ? fontSize * 2.7 : fontSize * 1.4;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Rasterize the name offscreen, then sample pixels into particles
    const off = document.createElement('canvas');
    off.width = W;
    off.height = H;
    const octx = off.getContext('2d');
    octx.fillStyle = '#fff';
    octx.font = `900 ${fontSize}px "Playfair Display", serif`;
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    if (twoLine) {
      octx.fillText('Rugved', W / 2, H * 0.27);
      octx.fillText('Zambare', W / 2, H * 0.73);
    } else {
      octx.fillText('Rugved Zambare', W / 2, H / 2);
    }

    const data = octx.getImageData(0, 0, W, H).data;
    const gap = Math.max(3, Math.round(W / 230));
    particles = [];
    for (let y = 0; y < H; y += gap) {
      for (let x = 0; x < W; x += gap) {
        if (data[(y * W + x) * 4 + 3] > 128) {
          const roll = Math.random();
          particles.push({
            hx: x, hy: y,
            x: W / 2 + (Math.random() - 0.5) * W * 1.4,
            y: H / 2 + (Math.random() - 0.5) * H * 4,
            vx: 0, vy: 0,
            r: gap * 0.38 + Math.random() * gap * 0.2,
            c: roll < 0.12 ? '#8b83ff' : (roll < 0.56 ? '#f0f0f5' : '#b9bac8')
          });
        }
      }
    }

    if (REDUCED_MOTION) {
      particles.forEach(p => { p.x = p.hx; p.y = p.hy; });
      drawFrame();
    }
  }

  function drawFrame() {
    ctx.clearRect(0, 0, W, H);
    for (const p of particles) {
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    }
  }

  function step() {
    ctx.clearRect(0, 0, W, H);
    const R = 85;
    for (const p of particles) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < R * R && d2 > 0.01) {
        const d = Math.sqrt(d2);
        const f = (R - d) / R;
        p.vx -= (dx / d) * f * 2.6;
        p.vy -= (dy / d) * f * 2.6;
      }
      p.vx += (p.hx - p.x) * 0.05;
      p.vy += (p.hy - p.y) * 0.05;
      p.vx *= 0.85;
      p.vy *= 0.85;
      p.x += p.vx;
      p.y += p.vy;
      ctx.fillStyle = p.c;
      ctx.fillRect(p.x - p.r, p.y - p.r, p.r * 2, p.r * 2);
    }
    raf = requestAnimationFrame(step);
  }

  function start() {
    if (running || REDUCED_MOTION) return;
    running = true;
    raf = requestAnimationFrame(step);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  window.addEventListener('pointermove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  }, { passive: true });

  // Only animate while the hero is on screen
  new IntersectionObserver((entries) => {
    entries[0].isIntersecting ? start() : stop();
  }, { threshold: 0 }).observe(canvas);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 200);
  });

  // Playfair Display must be loaded before rasterizing
  const init = () => document.fonts.load('900 80px "Playfair Display"').then(build).catch(build);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(init);
  } else {
    window.addEventListener('load', build);
  }
})();

/* ===================================
   2. MAGNET LINES
   =================================== */

(function magnetLines() {
  const container = document.getElementById('magnetLines');
  if (!container) return;

  let items = [];   // { el, cx, cy } in viewport coords
  let active = false;
  let pending = null;

  function build() {
    container.innerHTML = '';
    const w = container.clientWidth;
    const h = container.clientHeight;
    const cell = w < 640 ? 56 : 74;
    const cols = Math.ceil(w / cell);
    const rows = Math.ceil(h / cell);
    container.style.setProperty('--ml-cols', cols);
    container.style.setProperty('--ml-rows', rows);
    const frag = document.createDocumentFragment();
    for (let i = 0; i < cols * rows; i++) {
      const cellEl = document.createElement('div');
      cellEl.className = 'ml-cell';
      const line = document.createElement('span');
      line.className = 'ml-line';
      line.style.transform = 'rotate(-20deg)';
      cellEl.appendChild(line);
      frag.appendChild(cellEl);
    }
    container.appendChild(frag);
    cacheRects();
  }

  function cacheRects() {
    items = Array.from(container.querySelectorAll('.ml-line')).map(el => {
      const r = el.parentElement.getBoundingClientRect();
      return { el, cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
    });
  }

  function pointAt(px, py) {
    for (const it of items) {
      const deg = Math.atan2(py - it.cy, px - it.cx) * 180 / Math.PI;
      it.el.style.transform = `rotate(${deg + 90}deg)`;
    }
  }

  window.addEventListener('pointermove', (e) => {
    if (!active || REDUCED_MOTION) return;
    if (pending) return;
    pending = requestAnimationFrame(() => {
      pending = null;
      pointAt(e.clientX, e.clientY);
    });
  }, { passive: true });

  // Rects go stale on scroll — recache lazily
  let scrollTimer;
  window.addEventListener('scroll', () => {
    if (!active) return;
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(cacheRects, 120);
  }, { passive: true });

  new IntersectionObserver((entries) => {
    active = entries[0].isIntersecting;
    if (active) cacheRects();
  }, { threshold: 0 }).observe(container);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 200);
  });

  build();
})();

/* ===================================
   3. LANYARD (verlet rope + badge)
   =================================== */

(function lanyard() {
  const scene = document.getElementById('lanyardScene');
  const canvas = document.getElementById('lanyardCanvas');
  const card = document.getElementById('lanyardCard');
  if (!scene || !canvas || !card) return;

  const ctx = canvas.getContext('2d');
  const SEGMENTS = 14;
  let points = [];
  let segLen = 0;
  let W = 0, H = 0;
  let dragging = false;
  const pointer = { x: 0, y: 0 };
  let running = false;
  let raf = null;

  function setup() {
    W = scene.clientWidth;
    H = scene.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const ropeLen = H * 0.42;
    segLen = ropeLen / SEGMENTS;
    points = [];
    for (let i = 0; i <= SEGMENTS; i++) {
      points.push({
        x: W / 2 + i * 2,
        y: (i / SEGMENTS) * ropeLen,
        px: W / 2 + i * 2,
        py: (i / SEGMENTS) * ropeLen
      });
    }
    // Paint the resting state so the card isn't misplaced before the loop starts
    draw();
    placeCard();
  }

  function simulate(t) {
    const wind = REDUCED_MOTION ? 0 : Math.sin(t * 0.0012) * 0.016;
    for (let i = 1; i <= SEGMENTS; i++) {
      const p = points[i];
      const vx = (p.x - p.px) * 0.985 + wind;
      const vy = (p.y - p.py) * 0.985;
      p.px = p.x;
      p.py = p.y;
      p.x += vx;
      p.y += vy + (i === SEGMENTS ? 0.9 : 0.55); // card is heavier
    }

    // Constraints
    for (let iter = 0; iter < 20; iter++) {
      points[0].x = W / 2;
      points[0].y = 0;
      if (dragging) {
        const last = points[SEGMENTS];
        last.x = pointer.x;
        last.y = pointer.y;
      }
      for (let i = 0; i < SEGMENTS; i++) {
        const a = points[i];
        const b = points[i + 1];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        const diff = (dist - segLen) / dist;
        const ax = i === 0 ? 0 : 0.5;
        const bx = (dragging && i + 1 === SEGMENTS) ? 0 : (i === 0 ? 1 : 0.5);
        a.x += dx * diff * ax;
        a.y += dy * diff * ax;
        b.x -= dx * diff * bx;
        b.y -= dy * diff * bx;
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i <= SEGMENTS; i++) {
      const prev = points[i - 1];
      const p = points[i];
      ctx.quadraticCurveTo(prev.x, prev.y, (prev.x + p.x) / 2, (prev.y + p.y) / 2);
    }
    ctx.lineTo(points[SEGMENTS].x, points[SEGMENTS].y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Strap: dark band with a thin accent stitch
    ctx.strokeStyle = '#1c1c28';
    ctx.lineWidth = 13;
    ctx.stroke();
    ctx.strokeStyle = '#23233a';
    ctx.lineWidth = 9;
    ctx.stroke();
    ctx.strokeStyle = 'rgba(108, 99, 255, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Metal clip at the badge
    const last = points[SEGMENTS];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = '#8a8da0';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(last.x, last.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0a0f';
    ctx.fill();
  }

  function placeCard() {
    const last = points[SEGMENTS];
    const prev = points[SEGMENTS - 1];
    // Deviation of the rope's last segment from vertical; card hangs along it
    const angle = -Math.atan2(last.x - prev.x, last.y - prev.y);
    const cardW = card.offsetWidth;
    card.style.transform = `translate(${last.x - cardW / 2}px, ${last.y + 4}px) rotate(${angle}rad)`;
  }

  function loop(t) {
    simulate(t);
    draw();
    placeCard();
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    if (raf) cancelAnimationFrame(raf);
    raf = null;
  }

  function toLocal(e) {
    const rect = scene.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  }

  card.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    dragging = true;
    card.classList.add('grabbing');
    card.setPointerCapture(e.pointerId);
    toLocal(e);
  });

  card.addEventListener('pointermove', (e) => {
    if (dragging) toLocal(e);
  });

  const release = (e) => {
    dragging = false;
    card.classList.remove('grabbing');
    try { card.releasePointerCapture(e.pointerId); } catch (_) {}
  };
  card.addEventListener('pointerup', release);
  card.addEventListener('pointercancel', release);

  new IntersectionObserver((entries) => {
    entries[0].isIntersecting ? start() : stop();
  }, { threshold: 0 }).observe(scene);

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setup, 200);
  });

  setup();
})();

/* ===================================
   4. EVIL EYE
   =================================== */

(function evilEye() {
  const eye = document.getElementById('evilEye');
  const iris = document.getElementById('evilEyeIris');
  if (!eye || !iris) return;

  const target = { x: 0, y: 0 };
  const pos = { x: 0, y: 0 };
  let raf = null;
  let running = false;

  window.addEventListener('pointermove', (e) => {
    const rect = eye.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const maxOffset = rect.width * 0.14;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    const clamped = Math.min(d, maxOffset * 8);
    target.x = (dx / d) * maxOffset * (clamped / (maxOffset * 8));
    target.y = (dy / d) * maxOffset * (clamped / (maxOffset * 8));
  }, { passive: true });

  function step() {
    pos.x += (target.x - pos.x) * 0.12;
    pos.y += (target.y - pos.y) * 0.12;
    iris.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    raf = requestAnimationFrame(step);
  }

  // Random blinking
  function scheduleBlink() {
    const delay = 2400 + Math.random() * 4200;
    setTimeout(() => {
      eye.classList.add('blinking');
      setTimeout(() => {
        eye.classList.remove('blinking');
        // occasional double blink
        if (Math.random() < 0.25) {
          setTimeout(() => {
            eye.classList.add('blinking');
            setTimeout(() => eye.classList.remove('blinking'), 140);
          }, 200);
        }
        scheduleBlink();
      }, 160);
    }, delay);
  }

  if (!REDUCED_MOTION) {
    new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(step);
      } else if (!entries[0].isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    }, { threshold: 0 }).observe(eye);
    scheduleBlink();
  }
})();

/* ===================================
   5. INFINITE MENU
   =================================== */

(function infiniteMenu() {
  const overlay = document.getElementById('infiniteMenu');
  const track = document.getElementById('infiniteMenuTrack');
  const hamburger = document.getElementById('hamburger');
  if (!overlay || !track) return;

  const MENU_ITEMS = [
    { num: '01', label: 'Home', id: 'hero' },
    { num: '02', label: 'About', id: 'about' },
    { num: '03', label: 'Skills', id: 'skills' },
    { num: '04', label: 'Projects', id: 'portfolio' },
    { num: '05', label: 'Experience', id: 'experience' },
    { num: '06', label: 'Contact', id: 'contact' }
  ];

  let cells = [];       // { el, index }
  let cellH = 0;
  let loopH = 0;
  let offset = 0;
  let velocity = 0;
  let isOpen = false;
  let raf = null;
  let dragStartY = 0;
  let dragStartOffset = 0;
  let lastY = 0;
  let lastT = 0;
  let dragDist = 0;
  let isDragging = false;

  function build() {
    track.innerHTML = '';
    cells = [];
    const vh = window.innerHeight;
    cellH = Math.min(130, Math.max(84, vh / 6.5));
    const copies = Math.max(2, Math.ceil(vh / (MENU_ITEMS.length * cellH)) + 1);
    const total = MENU_ITEMS.length * copies;
    loopH = total * cellH;

    for (let i = 0; i < total; i++) {
      const item = MENU_ITEMS[i % MENU_ITEMS.length];
      const el = document.createElement('button');
      el.className = 'im-item';
      el.type = 'button';
      el.innerHTML = `<span class="im-num">${item.num}</span><span class="im-label">${item.label}</span>`;
      el.style.height = cellH + 'px';
      el.addEventListener('click', () => {
        if (dragDist > 8) return; // it was a drag, not a click
        close();
        const section = document.getElementById(item.id);
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      track.appendChild(el);
      cells.push({ el });
    }
    render();
  }

  function render() {
    const vh = window.innerHeight;
    const center = vh / 2;
    for (let i = 0; i < cells.length; i++) {
      let y = (i * cellH - offset) % loopH;
      if (y < -cellH) y += loopH;
      if (y > loopH - cellH) y -= loopH;
      const { el } = cells[i];
      if (y < -cellH * 1.5 || y > vh + cellH * 0.5) {
        el.style.visibility = 'hidden';
        continue;
      }
      el.style.visibility = 'visible';
      const d = Math.abs(y + cellH / 2 - center);
      const t = Math.min(1, d / center);
      const scale = 1 - 0.38 * t;
      const opacity = 1 - 0.72 * t;
      el.style.transform = `translateY(${y}px) scale(${scale})`;
      el.style.opacity = opacity;
      el.classList.toggle('im-active', t < 0.16);
    }
  }

  function loop() {
    if (!isDragging) {
      offset += velocity;
      velocity *= 0.94;
      if (Math.abs(velocity) < 0.05) velocity = 0;
    }
    render();
    raf = requestAnimationFrame(loop);
  }

  function open() {
    isOpen = true;
    build();
    // Start with "Home" just above center so the menu feels alive
    offset = -window.innerHeight / 2 + cellH * 1.5;
    velocity = REDUCED_MOTION ? 0 : 1.2;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    if (hamburger) hamburger.classList.add('active');
    document.body.style.overflow = 'hidden';
    render();
    if (!raf) raf = requestAnimationFrame(loop);
  }

  function close() {
    isOpen = false;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    if (hamburger) hamburger.classList.remove('active');
    document.body.style.overflow = 'auto';
    if (raf) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  window.toggleInfiniteMenu = () => (isOpen ? close() : open());

  overlay.addEventListener('pointerdown', (e) => {
    isDragging = true;
    dragDist = 0;
    dragStartY = e.clientY;
    dragStartOffset = offset;
    lastY = e.clientY;
    lastT = performance.now();
    velocity = 0;
    overlay.setPointerCapture(e.pointerId);
  });

  overlay.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    offset = dragStartOffset - (e.clientY - dragStartY);
    dragDist = Math.max(dragDist, Math.abs(e.clientY - dragStartY));
    const now = performance.now();
    const dt = now - lastT;
    if (dt > 0) velocity = -(e.clientY - lastY) / dt * 16;
    lastY = e.clientY;
    lastT = now;
  });

  const endDrag = () => { isDragging = false; };
  overlay.addEventListener('pointerup', endDrag);
  overlay.addEventListener('pointercancel', endDrag);

  overlay.addEventListener('wheel', (e) => {
    e.preventDefault();
    velocity += e.deltaY * 0.04;
  }, { passive: false });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) close();
  });

  window.addEventListener('resize', () => {
    if (isOpen) build();
  });
})();
