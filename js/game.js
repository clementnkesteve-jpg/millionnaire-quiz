(() => {
  'use strict';

  /* =========================================================
   * Configuration
   * ======================================================= */
  const LADDER = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];
  const SAFE_LEVELS = [4, 9];               // index des paliers garantis (1 000 € et 32 000 €)
  const TIME_MODES = {                      // secondes par question selon la difficulté
    normal:  { label: 'Normal (30 / 45 / 60 s)', times: [30, 45, 60] },
    express: { label: 'Express (15 / 20 / 25 s)', times: [15, 20, 25] },
    relax:   { label: 'Détente (sans chrono)', times: null }
  };
  const RECENT_MAX = 120;                   // évite de reposer trop vite les mêmes questions
  const STORE_KEY = 'millionnaire-quiz.profile.v1';

  const CATEGORIES = window.QUIZ_CATEGORIES;
  const BASE_QUESTIONS = window.QUIZ_QUESTIONS;
  const PLUS_QUESTIONS = window.QUIZ_QUESTIONS_PLUS || [];
  let QUESTIONS = BASE_QUESTIONS;           // recalculé selon les options (pack étendu, questions perso)
  const CAT_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c]));
  const MIX = { id: 'mix', name: 'Mixte', emoji: '🎲', color: '#ffc93c' };

  const RANKS = [
    [0, 'Candidat'], [10000, 'Amateur'], [100000, 'Challenger'], [500000, 'Expert'],
    [1000000, 'Millionnaire'], [5000000, 'Magnat'], [20000000, 'Légende vivante']
  ];

  const ACHIEVEMENTS = [
    { id: 'first',     ico: '🌱', name: 'Premier pas',     desc: 'Donner une première bonne réponse' },
    { id: 'palier1',   ico: '🥉', name: 'Premier palier',  desc: 'Atteindre 1 000 € garantis' },
    { id: 'palier2',   ico: '🥈', name: 'Second palier',   desc: 'Atteindre 32 000 € garantis' },
    { id: 'million',   ico: '💎', name: 'Millionnaire',    desc: 'Remporter le million' },
    { id: 'flash',     ico: '⚡', name: 'Éclair',          desc: 'Bonne réponse en moins de 3 secondes' },
    { id: 'combo5',    ico: '🔥', name: 'En feu',          desc: '5 bonnes réponses d\'affilée' },
    { id: 'combo10',   ico: '☄️', name: 'Inarrêtable',     desc: '10 bonnes réponses d\'affilée' },
    { id: 'nolife',    ico: '🦅', name: 'Sans filet',      desc: 'Atteindre 32 000 € sans joker' },
    { id: 'wise',      ico: '🦉', name: 'Sage décision',   desc: 'Partir avec au moins 8 000 €' },
    { id: 'explorer',  ico: '🧭', name: 'Touche-à-tout',   desc: 'Jouer dans toutes les catégories' },
    { id: 'bank1m',    ico: '🏦', name: 'Coffre-fort',     desc: 'Cumuler 1 000 000 € en banque' },
    { id: 'level10',   ico: '👑', name: 'Vétéran',         desc: 'Atteindre le niveau 10' }
  ];

  const FRIENDS = [
    { name: 'Sophie', f: true, job: 'professeure d\'histoire', fav: ['histoire', 'geo', 'culture'] },
    { name: 'Kevin', job: 'fan absolu d\'anime', fav: ['anime', 'jeux'] },
    { name: 'Aïcha', f: true, job: 'journaliste sportive', fav: ['sport'] },
    { name: 'Marc', job: 'critique de cinéma', fav: ['cinema', 'musique'] },
    { name: 'Dr Nadia', f: true, job: 'chercheuse en physique', fav: ['sciences', 'culture'] }
  ];

  /* =========================================================
   * Utilitaires
   * ======================================================= */
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const fmt = n => Math.round(n).toLocaleString('fr-FR') + ' €';
  const fmtMult = m => '×' + m.toFixed(2).replace('.', ',');
  const rand = n => Math.floor(Math.random() * n);
  const shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LETTERS = ['A', 'B', 'C', 'D'];
  const reducedMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* =========================================================
   * Profil joueur (sauvegardé dans le navigateur)
   * ======================================================= */
  const defaultProfile = () => ({
    name: '', bank: 0, xp: 0, games: 0, millions: 0, best: 0, correct: 0,
    achievements: [], catsPlayed: [], catBest: {}, recent: [], muted: false,
    custom: [],
    options: { extended: true, custom: true, timer: 'normal', fx: 'max' }
  });
  function loadProfile() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return Object.assign(defaultProfile(), JSON.parse(raw));
    } catch (e) { /* stockage indisponible : on joue sans sauvegarde */ }
    return defaultProfile();
  }
  function saveProfile() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(profile)); } catch (e) { /* ignoré */ }
  }
  const profile = loadProfile();
  profile.options = Object.assign(defaultProfile().options, profile.options);
  if (!TIME_MODES[profile.options.timer]) profile.options.timer = 'normal';

  function rebuildPool() {
    QUESTIONS = BASE_QUESTIONS.concat(
      profile.options.extended ? PLUS_QUESTIONS : [],
      profile.options.custom ? profile.custom : []
    );
  }
  rebuildPool();

  const fxLow = () => reducedMotion || profile.options.fx === 'low';
  function applyFx() { document.body.classList.toggle('fx-low', fxLow()); }
  applyFx();

  // Progression : chaque victoire rapporte de l'XP ; chaque niveau augmente le multiplicateur de gains de 5 %.
  const levelFromXp = xp => Math.floor(Math.sqrt(xp / 50)) + 1;
  const xpForLevel = l => 50 * (l - 1) * (l - 1);
  const multiplierFor = l => Math.min(1 + (l - 1) * 0.05, 3);
  const rankFor = bank => RANKS.reduce((r, [min, name]) => (bank >= min ? name : r), RANKS[0][1]);

  /* =========================================================
   * Sons (synthétisés, aucun fichier audio)
   * ======================================================= */
  const Sound = (() => {
    let ctx = null;
    function ac() {
      if (!ctx) {
        const C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        ctx = new C();
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function tone(freq, dur, { type = 'sine', vol = 0.12, delay = 0, slide = 0 } = {}) {
      if (profile.muted) return;
      const c = ac(); if (!c) return;
      const t = c.currentTime + delay;
      const o = c.createOscillator(), g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination);
      o.start(t); o.stop(t + dur + 0.05);
    }
    const seq = (notes, step, opts) => notes.forEach((f, i) => tone(f, opts.dur || 0.25, { ...opts, delay: i * step }));
    return {
      click: () => tone(700, 0.07, { type: 'triangle', vol: 0.06 }),
      select: () => { tone(196, 0.9, { type: 'sawtooth', vol: 0.035 }); tone(294, 0.9, { type: 'triangle', vol: 0.05 }); },
      correct: () => seq([523, 659, 784, 1047], 0.09, { type: 'triangle', vol: 0.12 }),
      wrong: () => { tone(220, 0.7, { type: 'sawtooth', vol: 0.09, slide: -140 }); tone(160, 0.8, { type: 'square', vol: 0.04, delay: 0.1, slide: -90 }); },
      tick: () => tone(1100, 0.04, { type: 'square', vol: 0.025 }),
      lifeline: () => seq([440, 660, 880], 0.07, { type: 'sine', vol: 0.1, dur: 0.18 }),
      palier: () => seq([523, 659, 784, 1047, 1319], 0.1, { type: 'triangle', vol: 0.13, dur: 0.35 }),
      win: () => seq([523, 659, 784, 1047, 784, 1047, 1319, 1568], 0.13, { type: 'triangle', vol: 0.13, dur: 0.4 }),
      coin: () => { tone(1320, 0.08, { type: 'square', vol: 0.035 }); tone(1760, 0.12, { type: 'square', vol: 0.035, delay: 0.07 }); },
      levelup: () => seq([392, 523, 659, 784, 1047], 0.08, { type: 'sine', vol: 0.12, dur: 0.3 })
    };
  })();

  /* =========================================================
   * Confettis (canvas)
   * ======================================================= */
  const Confetti = (() => {
    const cv = $('#confetti'), cx = cv.getContext('2d');
    const colors = ['#ffd54a', '#ff9f1c', '#2ec4b6', '#ef4444', '#9b5de5', '#ffffff', '#48cae4'];
    let parts = [], raf = null;
    function resize() {
      const dpr = window.devicePixelRatio || 1;
      cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
      cx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    addEventListener('resize', resize); resize();
    function add(p) { parts.push(p); if (!raf) raf = requestAnimationFrame(loop); }
    function burst(n = 100, x = innerWidth / 2, y = innerHeight / 3) {
      if (fxLow()) n = Math.min(n, 20);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = 3 + Math.random() * 9;
        add({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 6, w: 6 + Math.random() * 6, h: 4 + Math.random() * 4,
              r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: colors[i % colors.length], life: 110 + Math.random() * 60 });
      }
    }
    function rain(n = 220) {
      if (fxLow()) n = 30;
      for (let i = 0; i < n; i++) {
        add({ x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * 0.6, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3,
              w: 7 + Math.random() * 6, h: 4 + Math.random() * 4, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.25,
              c: colors[i % colors.length], life: 260 + Math.random() * 120, money: Math.random() < 0.18 });
      }
    }
    function loop() {
      cx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter(p => p.life > 0 && p.y < innerHeight + 40);
      for (const p of parts) {
        p.vy += p.money ? 0.03 : 0.22; p.vx *= 0.99; p.x += p.vx; p.y += Math.min(p.vy, p.money ? 3 : 14); p.r += p.vr; p.life--;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.r); cx.globalAlpha = Math.min(1, p.life / 40);
        if (p.money) { cx.font = '22px serif'; cx.fillText('💶', -11, 8); }
        else { cx.fillStyle = p.c; cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); }
        cx.restore();
      }
      raf = parts.length ? requestAnimationFrame(loop) : null;
      if (!raf) cx.clearRect(0, 0, innerWidth, innerHeight);
    }
    return { burst, rain };
  })();

  /* =========================================================
   * Navigation entre écrans
   * ======================================================= */
  function show(screen) {
    $$('.screen').forEach(s => s.classList.toggle('active', s.id === 'screen-' + screen));
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
    document.body.classList.remove('suspense', 'danger');
    if (screen === 'home') renderHome();
    if (screen === 'cats') renderCats();
    if (screen === 'editor') renderEditor();
  }

  /* =========================================================
   * Effets visuels
   * ======================================================= */
  function restartAnim(el, cls) {
    if (!el) return;
    el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls);
  }
  const bump = el => restartAnim(el, 'bump');

  function flash(kind) {
    if (fxLow()) return;
    const el = $('#fx-flash');
    el.className = 'fx-flash ' + kind;
    restartAnim(el, 'on');
  }

  function shakeScreen() {
    if (fxLow()) return;
    restartAnim($('main'), 'shake');
  }

  let bannerTimer = null;
  function showBanner(kicker, title, kind = '') {
    const el = $('#banner');
    el.className = 'banner ' + kind;
    el.innerHTML = `<small>${esc(kicker)}</small><strong>${esc(title)}</strong>`;
    el.hidden = false;
    restartAnim(el, 'on');
    clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => { el.hidden = true; }, 1900);
  }

  // Une pièce s'envole de la bonne réponse vers la pyramide
  function flyCoin(fromEl, toEl) {
    if (fxLow() || !fromEl || !toEl || !fromEl.animate) return;
    const a = fromEl.getBoundingClientRect(), b = toEl.getBoundingClientRect();
    for (let k = 0; k < 3; k++) {
      const coin = document.createElement('div');
      coin.className = 'fly-coin';
      coin.textContent = '€';
      document.body.appendChild(coin);
      const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2;
      const x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
      const mx = (x0 + x1) / 2 + (Math.random() - 0.5) * 120, my = Math.min(y0, y1) - 80 - Math.random() * 60;
      coin.animate([
        { transform: `translate(${x0}px, ${y0}px) scale(0.4) rotate(0deg)`, opacity: 0 },
        { transform: `translate(${mx}px, ${my}px) scale(1.2) rotate(200deg)`, opacity: 1, offset: 0.45 },
        { transform: `translate(${x1}px, ${y1}px) scale(0.6) rotate(400deg)`, opacity: 0.2 }
      ], { duration: 900 + k * 120, delay: k * 90, easing: 'cubic-bezier(.3,.7,.4,1)', fill: 'forwards' })
        .onfinish = () => coin.remove();
    }
    setTimeout(() => restartAnim(toEl, 'hit'), 900);
  }

  // Compteur animé pour les montants du HUD
  function tweenMoney(el, from, to, prefix = '', dur = 700) {
    if (fxLow() || from === to) { el.textContent = prefix + fmt(to); return; }
    const t0 = performance.now();
    (function step(t) {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = prefix + fmt(from + (to - from) * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  // Pièces flottantes sur l'accueil
  function spawnCoins() {
    const box = $('#coins');
    if (!box || box.childElementCount) return;
    const icons = ['💰', '🪙', '💶', '💎', '⭐'];
    for (let i = 0; i < 16; i++) {
      const s = document.createElement('span');
      s.textContent = icons[i % icons.length];
      s.style.left = (Math.random() * 100) + '%';
      s.style.animationDelay = (-Math.random() * 14) + 's';
      s.style.animationDuration = (9 + Math.random() * 8) + 's';
      s.style.fontSize = (14 + Math.random() * 22) + 'px';
      box.appendChild(s);
    }
  }

  // Inclinaison 3D des cartes au survol
  function attachTilt(root) {
    $$('.cat', root).forEach(card => {
      card.addEventListener('pointermove', e => {
        if (fxLow() || e.pointerType !== 'mouse') return;
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--ry', (px * 14).toFixed(2) + 'deg');
        card.style.setProperty('--rx', (-py * 14).toFixed(2) + 'deg');
        card.style.setProperty('--mx', ((px + 0.5) * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((py + 0.5) * 100).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
      });
    });
  }

  /* =========================================================
   * Accueil / profil
   * ======================================================= */
  function renderChip() {
    const lvl = levelFromXp(profile.xp);
    $('#chip-level').textContent = 'Niv. ' + lvl;
    $('#chip-mult').textContent = fmtMult(multiplierFor(lvl));
    $('#chip-bank').textContent = fmt(profile.bank);
    $('#sound-toggle').textContent = profile.muted ? '🔇' : '🔊';
    $('#sound-toggle').setAttribute('aria-label', profile.muted ? 'Activer le son' : 'Couper le son');
  }

  function renderHome() {
    renderChip();
    spawnCoins();
    const lvl = levelFromXp(profile.xp);
    const cur = xpForLevel(lvl), next = xpForLevel(lvl + 1);
    $('#player-name').value = profile.name;
    $('#home-rank').textContent = rankFor(profile.bank);
    $('#stat-bank').textContent = fmt(profile.bank);
    $('#stat-best').textContent = fmt(profile.best);
    $('#stat-games').textContent = profile.games;
    $('#stat-correct').textContent = profile.correct;
    $('#stat-level').textContent = lvl;
    $('#stat-mult').textContent = fmtMult(multiplierFor(lvl));
    $('#xp-fill').style.width = Math.round(((profile.xp - cur) / (next - cur)) * 100) + '%';
    $('#xp-foot').textContent = `${profile.xp - cur} / ${next - cur} XP vers le niveau ${lvl + 1}`;
    $('#badge-count').textContent = `${profile.achievements.length}/${ACHIEVEMENTS.length}`;
    $('#badges').innerHTML = ACHIEVEMENTS.map(a => {
      const on = profile.achievements.includes(a.id);
      return `<div class="badge ${on ? 'on' : ''}" title="${esc(a.desc)}"><span class="b-ico">${a.ico}</span>${esc(a.name)}</div>`;
    }).join('');
  }

  function renderCats() {
    const count = id => QUESTIONS.filter(q => id === 'mix' || q.cat === id).length;
    let n = 0;
    const card = (c, extra = '') => {
      const best = profile.catBest[c.id] || 0;
      return `<button class="cat ${extra}" style="--c:${c.color};--i:${n++}" data-cat="${c.id}" type="button">
        <span class="cat-emoji">${c.emoji}</span>
        <span><span class="cat-name">${esc(c.name)}</span>
        <span class="cat-meta">${count(c.id)} questions</span>
        ${best ? `<span class="cat-best">Record : ${fmt(best)}</span>` : ''}</span>
      </button>`;
    };
    $('#cat-grid').innerHTML = card(MIX, 'mix') + CATEGORIES.map(c => card(c)).join('');
    attachTilt($('#cat-grid'));
    const extras = [];
    if (profile.options.extended) extras.push('📚 Pack étendu');
    if (profile.options.custom && profile.custom.length) extras.push(`✍️ ${profile.custom.length} perso`);
    $('#pack-pill').textContent = extras.length ? extras.join(' · ') : '📘 Pack classique';
  }

  function unlock(id) {
    if (profile.achievements.includes(id)) return;
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (!a) return;
    profile.achievements.push(id);
    saveProfile();
    toast(a.ico, 'Trophée débloqué', a.name, a.desc);
    Sound.coin();
  }

  function toast(ico, kicker, title, desc) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `<span class="toast-ico">${ico}</span><div><small>${esc(kicker)}</small><b>${esc(title)}</b><span class="desc">${esc(desc || '')}</span></div>`;
    $('#toasts').appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 3600);
  }

  /* =========================================================
   * Modale (met le chrono en pause)
   * ======================================================= */
  let modalOnClose = null;
  function openModal(html, onClose) {
    $('#modal-card').innerHTML = html;
    $('#modal').hidden = false;
    modalOnClose = onClose || null;
    pauseTimer(true);
    const focusable = $('#modal-card button');
    if (focusable) focusable.focus();
  }
  function closeModal() {
    if ($('#modal').hidden) return;
    $('#modal').hidden = true;
    const cb = modalOnClose; modalOnClose = null;
    pauseTimer(false);
    if (cb) cb();
  }

  /* =========================================================
   * Partie
   * ======================================================= */
  let game = null;

  const tierFor = level => (level < 5 ? 1 : level < 10 ? 2 : 3);
  const currentWinnings = () => (game && game.level > 0 ? LADDER[game.level - 1] : 0);
  const securedWinnings = () => {
    let s = 0;
    for (const i of SAFE_LEVELS) if (game.level > i) s = LADDER[i];
    return s;
  };

  function pickQuestion(level) {
    const want = tierFor(level);
    const inCat = q => game.cat === 'mix' || q.cat === game.cat;
    const unused = q => !game.used.has(q.id);
    const recent = new Set(profile.recent);
    const order = [want, want - 1, want + 1, want - 2, want + 2].filter(d => d >= 1 && d <= 3);
    const pools = [QUESTIONS.filter(q => inCat(q) && unused(q)), QUESTIONS.filter(unused)];
    for (const pool of pools) {
      for (const d of order) {
        const cands = pool.filter(q => q.d === d);
        if (!cands.length) continue;
        const fresh = cands.filter(q => !recent.has(q.id));
        const src = (fresh.length ? fresh : cands)[rand((fresh.length ? fresh : cands).length)];
        return prepare(src);
      }
    }
    return prepare(QUESTIONS[rand(QUESTIONS.length)]);
  }

  function prepare(src) {
    const order = shuffle([0, 1, 2, 3]);
    return { src, q: src.q, answers: order.map(i => src.a[i]), correct: order.indexOf(0), removed: [] };
  }

  function rememberQuestion(id) {
    game.used.add(id);
    profile.recent = profile.recent.filter(x => x !== id).concat(id).slice(-RECENT_MAX);
  }

  function startGame(cat) {
    const lvl = levelFromXp(profile.xp);
    game = {
      cat, level: 0, used: new Set(), current: null,
      lifelines: { fifty: true, phone: true, audience: true, swap: true },
      usedLifeline: false, combo: 0, maxCombo: 0, bonus: 0, xp: 0, correct: 0,
      startLevel: lvl, mult: multiplierFor(lvl),
      locked: true, timer: null, timeLeft: 0, timeTotal: 0, paused: false, over: false
    };
    if (cat !== 'mix' && !profile.catsPlayed.includes(cat)) profile.catsPlayed.push(cat);
    if (CATEGORIES.every(c => profile.catsPlayed.includes(c.id))) unlock('explorer');
    saveProfile();

    const c = cat === 'mix' ? MIX : CAT_BY_ID[cat];
    $('#hud-cat').textContent = `${c.emoji} ${c.name}`;
    $$('.lifeline').forEach(b => { b.disabled = false; b.classList.remove('used'); });
    game.shownBonus = 0;
    renderLadder();
    show('game');
    renderJokerCount();
    nextQuestion();
    if (!profile.seenJokers) {
      profile.seenJokers = true;
      saveProfile();
      setTimeout(() => { if (game && !game.over) showJokerHelp(true); }, 900);
    }
  }

  function nextQuestion(swap = false) {
    if (game.over) return;
    game.locked = true;
    const qBox = $('#question-box');
    const fill = () => {
      if (game.over) return;
      game.current = pickQuestion(game.level);
      rememberQuestion(game.current.src.id);
      const cur = game.current;
      qBox.classList.remove('leave');
      restartAnim(qBox, 'enter');
      $('#q-text').textContent = cur.q;
      $$('.answer').forEach((btn, i) => {
        btn.className = 'answer';
        void btn.offsetWidth;
        btn.classList.add('enter');
        btn.disabled = false;
        btn.style.removeProperty('--pct');
        $('.hint', btn).innerHTML = '';
        $('.txt', btn).textContent = cur.answers[i];
      });
      $('#answers').classList.remove('has-votes');
      updateHud();
      game.locked = false;
      startTimer();
      if (!swap) Sound.click();
    };
    // Sortie animée de l'ancienne question avant d'afficher la suivante
    if (game.current && !fxLow()) {
      qBox.classList.remove('enter');
      qBox.classList.add('leave');
      $$('.answer').forEach(b => { b.classList.remove('enter'); b.classList.add('leave'); });
      setTimeout(fill, 320);
    } else {
      fill();
    }
  }

  function updateHud() {
    const step = $('#hud-step');
    const stepText = `Question ${game.level + 1} / 15 · ${fmt(LADDER[game.level])}`;
    if (step.textContent !== stepText) { step.textContent = stepText; bump(step); }
    const bonusEl = $('#hud-bonus');
    if (game.shownBonus !== game.bonus) {
      tweenMoney(bonusEl, game.shownBonus || 0, game.bonus, '✨ Bonus ');
      bump(bonusEl);
      game.shownBonus = game.bonus;
    } else {
      bonusEl.textContent = `✨ Bonus ${fmt(game.bonus)}`;
    }
    const combo = $('#hud-combo');
    const wasHidden = combo.hidden;
    combo.hidden = game.combo < 2;
    combo.textContent = `🔥 Série ×${game.combo}`;
    combo.style.setProperty('--heat', Math.min(game.combo, 10) / 10);
    if (!combo.hidden && !wasHidden) bump(combo);
    $('#quit-amount').textContent = fmt(currentWinnings() + game.bonus);
    $('#btn-quit').disabled = game.level === 0;
  }

  function renderLadder() {
    const ol = $('#ladder');
    ol.innerHTML = LADDER.map((amt, i) => i).reverse().map(i => {
      const cls = [
        SAFE_LEVELS.includes(i) ? 'safe' : '',
        i === LADDER.length - 1 ? 'top' : '',
        game && i < game.level ? 'done' : '',
        game && i === game.level && !game.over ? 'current' : '',
        game && i === game.level && game.level > 0 && !game.over ? 'climb' : ''
      ].join(' ');
      return `<li class="${cls}"><span class="num">${i + 1}</span><span class="amt">${fmt(LADDER[i])}</span></li>`;
    }).join('');
    const cur = $('li.current', ol);
    if (cur && ol.scrollWidth > ol.clientWidth) {
      ol.scrollLeft = cur.offsetLeft - ol.clientWidth / 2 + cur.offsetWidth / 2;
    }
  }

  /* ---------- Chrono ---------- */
  function startTimer() {
    stopTimer();
    game.qStart = performance.now();
    game.paused = false;
    const times = TIME_MODES[profile.options.timer].times;
    if (!times) {                       // mode Détente : pas de chrono
      game.timeTotal = 0; game.timeLeft = 0;
      drawTimer();
      return;
    }
    game.timeTotal = times[tierFor(game.level) - 1];
    game.timeLeft = game.timeTotal;
    drawTimer();
    let lastSec = Math.ceil(game.timeLeft);
    game.timer = setInterval(() => {
      if (game.paused) return;
      game.timeLeft = Math.max(0, game.timeLeft - 0.1);
      const sec = Math.ceil(game.timeLeft);
      if (sec !== lastSec) { lastSec = sec; if (sec <= 5 && sec > 0) Sound.tick(); }
      drawTimer();
      if (game.timeLeft <= 0) timeUp();
    }, 100);
  }
  function stopTimer() { if (game && game.timer) { clearInterval(game.timer); game.timer = null; } }
  function pauseTimer(p) {
    if (!game || !game.timer) return;
    game.paused = p;
    $('#timer').classList.toggle('paused', p);
  }
  function drawTimer() {
    const t = $('#timer');
    if (!game.timeTotal) {
      $('#timer-fill').style.strokeDashoffset = '0';
      $('#timer-text').textContent = '∞';
      t.classList.remove('warn', 'danger');
      t.classList.add('relax');
      document.body.classList.remove('danger');
      return;
    }
    t.classList.remove('relax');
    const ratio = game.timeLeft / game.timeTotal;
    $('#timer-fill').style.strokeDashoffset = (119.38 * (1 - ratio)).toFixed(2);
    $('#timer-text').textContent = Math.ceil(game.timeLeft);
    t.classList.toggle('warn', ratio <= 0.5 && ratio > 0.2);
    t.classList.toggle('danger', ratio <= 0.2);
    document.body.classList.toggle('danger', ratio <= 0.2 && ratio > 0 && !game.locked);
  }
  function timeUp() {
    stopTimer();
    if (game.locked) return;
    game.locked = true;
    $$('.answer').forEach(b => { b.disabled = true; b.classList.remove('enter'); });
    $$('.answer')[game.current.correct].classList.add('correct');
    document.body.classList.remove('danger');
    floatText('⏰ Temps écoulé !', false);
    flash('bad'); shakeScreen();
    Sound.wrong();
    setTimeout(() => endGame('time'), 2200);
  }

  /* ---------- Réponse ---------- */
  function selectAnswer(i) {
    if (!game || game.locked || game.paused) return;
    const btn = $$('.answer')[i];
    if (!btn || btn.classList.contains('removed')) return;
    game.locked = true;
    stopTimer();
    const elapsed = (performance.now() - game.qStart) / 1000;
    $$('.answer').forEach((b, j) => { b.disabled = true; b.classList.remove('enter'); if (j !== i) b.classList.add('dim'); });
    btn.classList.add('selected');
    document.body.classList.remove('danger');
    document.body.classList.add('suspense');
    Sound.select();
    // Suspense plus long sur les grosses questions
    const suspense = fxLow() ? 600 : 1100 + game.level * 90;
    setTimeout(() => reveal(i, elapsed), suspense);
  }

  function reveal(i, elapsed) {
    const answers = $$('.answer');
    const ok = i === game.current.correct;
    document.body.classList.remove('suspense');
    answers.forEach(b => b.classList.remove('dim', 'selected'));
    answers[game.current.correct].classList.add('correct');
    if (ok) onCorrect(elapsed);
    else { answers[i].classList.add('wrong'); onWrong(); }
  }

  function onCorrect(elapsed) {
    const lvl = game.level;
    const base = LADDER[lvl];
    game.combo++; game.correct++;
    game.maxCombo = Math.max(game.maxCombo, game.combo);

    // Bonus : vitesse (jusqu'à 10 % du palier) + série (2 % par réponse au-delà de 2, plafonné à 10 %)
    // En mode Détente (sans chrono), le bonus vitesse est calculé sur une base de 30 s
    const ratio = game.timeTotal ? Math.max(0, game.timeLeft / game.timeTotal) : Math.max(0, 1 - elapsed / 30) * 0.5;
    const speedBonus = Math.round((base * 0.10 * ratio) / 10) * 10;
    const comboBonus = game.combo >= 3 ? Math.round((base * 0.02 * Math.min(game.combo - 2, 5)) / 10) * 10 : 0;
    game.bonus += speedBonus + comboBonus;
    game.xp += 10 + lvl * 5;

    const isSafe = SAFE_LEVELS.includes(lvl);
    const isTop = lvl === LADDER.length - 1;
    if (isTop) { Sound.win(); }
    else if (isSafe) { Sound.palier(); }
    else { Sound.correct(); }

    floatText('+' + fmt(base), true);
    if (speedBonus || comboBonus) {
      const parts = [];
      if (speedBonus) parts.push(`⚡ +${fmt(speedBonus)}`);
      if (comboBonus) parts.push(`🔥 +${fmt(comboBonus)}`);
      setTimeout(() => floatText(parts.join('  '), false), 350);
    }

    unlock('first');
    if (elapsed < 3) unlock('flash');
    if (game.combo >= 5) unlock('combo5');
    if (game.combo >= 10) unlock('combo10');
    if (lvl >= 4) unlock('palier1');
    if (lvl >= 9) unlock('palier2');
    if (lvl >= 9 && !game.usedLifeline) unlock('nolife');

    flash(isSafe || isTop ? 'gold' : 'good');
    const answerEl = $$('.answer')[game.current.correct];
    const r = answerEl.getBoundingClientRect();
    if (isSafe) {
      Confetti.burst(180, r.left + r.width / 2, r.top + r.height / 2);
      showBanner('🔒 Palier atteint', fmt(base) + ' garantis', 'gold');
    } else if (!isTop) {
      Confetti.burst(40 + lvl * 6, r.left + r.width / 2, r.top + r.height / 2);
      if (game.combo >= 3) showBanner(`🔥 Série de ${game.combo}`, game.combo >= 5 ? 'Inarrêtable !' : 'Tu es en feu !', 'fire');
    }

    game.level++;
    updateHud();
    renderLadder();
    flyCoin(answerEl, $$('#ladder li')[LADDER.length - 1 - lvl]);

    if (isTop) {
      showBanner('💎 Incroyable', 'MILLIONNAIRE !', 'gold');
      Confetti.rain(320);
      setTimeout(() => endGame('million'), 2200);
      return;
    }
    setTimeout(nextQuestion, 1900);
  }

  function onWrong() {
    game.combo = 0;
    Sound.wrong();
    flash('bad');
    shakeScreen();
    setTimeout(() => endGame('wrong'), 2400);
  }

  function floatText(text, big) {
    const el = document.createElement('div');
    el.className = 'float' + (big ? '' : ' small');
    el.textContent = text;
    $('#float-layer').appendChild(el);
    setTimeout(() => el.remove(), 1700);
  }

  /* ---------- Jokers ---------- */
  // 4 jokers, un seul usage chacun par partie
  const JOKERS = {
    fifty:    { ico: '½',  name: '50:50',       desc: 'Deux mauvaises réponses sont retirées. Il ne reste que la bonne et une mauvaise.' },
    audience: { ico: '👥', name: 'Vote du public', desc: 'Le public vote de son côté : tu vois le pourcentage de votes pour chaque réponse, directement sur les réponses.' },
    swap:     { ico: '⏭️', name: 'Skip',        desc: 'Tu sautes la question : elle est remplacée par une autre question du même niveau, sans perdre tes gains.' },
    phone:    { ico: '📞', name: 'Appel à un ami', desc: 'Tu choisis un ami parmi trois. Il te recommande une réponse, avec son niveau de confiance. Plus fiable si c\'est son domaine !' }
  };

  function jokersLeft() {
    return Object.values(game.lifelines).filter(Boolean).length;
  }
  function renderJokerCount() {
    const el = $('#ll-count');
    el.innerHTML = `🃏 <b>${jokersLeft()}</b>/4`;
    bump(el);
  }

  function showJokerHelp(first) {
    openModal(`
      <div class="modal-big">🃏</div>
      <h3>${first ? 'Tu as droit à 4 jokers !' : 'Tes 4 jokers'}</h3>
      <p class="muted small">Chaque joker ne peut être utilisé qu'une seule fois par partie. Le chrono est en pause pendant le vote du public et l'appel.</p>
      <ul class="joker-list">
        ${Object.entries(JOKERS).map(([k, j], n) => `
          <li style="--i:${n}" class="${game && !game.lifelines[k] ? 'spent' : ''}">
            <span class="jk-ico">${j.ico}</span>
            <span><b>${esc(j.name)}</b>${game && !game.lifelines[k] ? ' <em>(déjà utilisé)</em>' : ''}<small>${esc(j.desc)}</small></span>
          </li>`).join('')}
      </ul>
      <div class="modal-actions"><button class="btn btn-gold" data-close type="button">${first ? 'C\'est parti !' : 'Compris'}</button></div>`);
  }

  function useLifeline(kind) {
    if (!game || game.locked || !game.lifelines[kind]) return;
    game.lifelines[kind] = false;
    game.usedLifeline = true;
    const btn = $(`.lifeline[data-life="${kind}"]`);
    btn.disabled = true;
    restartAnim(btn, 'used');
    flash('blue');
    Sound.lifeline();
    renderJokerCount();
    ({ fifty, phone, audience, swap })[kind]();
  }

  function visibleIndexes() {
    return [0, 1, 2, 3].filter(i => !game.current.removed.includes(i));
  }

  // Petite étiquette affichée sur une réponse (pourcentage du public, conseil de l'ami)
  function setHint(i, html, kind, extra = '') {
    const hint = $('.hint', $$('.answer')[i]);
    const tag = document.createElement('span');
    tag.className = 'tag tag-' + kind + (extra ? ' ' + extra : '');
    tag.innerHTML = html;
    hint.querySelectorAll('.tag-' + kind).forEach(t => t.remove());
    hint.appendChild(tag);
  }

  function fifty() {
    const cur = game.current;
    const wrong = shuffle([0, 1, 2, 3].filter(i => i !== cur.correct)).slice(0, 2);
    cur.removed = wrong;
    wrong.forEach(i => { const b = $$('.answer')[i]; b.classList.remove('enter'); b.classList.add('removed'); b.disabled = true; });
    showBanner('½ Joker 50:50', 'Deux réponses retirées', '');
  }

  function audience() {
    const cur = game.current;
    const tier = tierFor(game.level);
    const vis = visibleIndexes();
    // Le public est fiable au début, beaucoup moins sur les dernières questions
    const misled = Math.random() < [0.03, 0.12, 0.25][tier - 1];
    const favorite = misled ? vis.filter(i => i !== cur.correct)[rand(vis.length - 1)] : cur.correct;
    const lo = [50, 38, 28][tier - 1], hi = [82, 64, 50][tier - 1];
    const pct = [0, 0, 0, 0];
    pct[favorite] = lo + rand(hi - lo + 1);
    let rest = 100 - pct[favorite];
    const others = shuffle(vis.filter(i => i !== favorite));
    others.forEach((i, k) => {
      // Les autres réponses ne dépassent jamais la réponse favorite
      const v = k === others.length - 1 ? rest : Math.min(rand(rest + 1), pct[favorite] - 1);
      pct[i] = v; rest -= v;
    });
    const top = vis.reduce((a, b) => (pct[b] > pct[a] ? b : a), vis[0]);

    openModal(`
      <div class="modal-big">👥</div>
      <h3>Le public a voté</h3>
      <p class="muted small" id="aud-status">Dépouillement des votes…</p>
      <div class="bars">
        ${[0, 1, 2, 3].map(i => `<div class="bar ${i === top ? 'top' : ''} ${vis.includes(i) ? '' : 'off'}">
          <span class="bar-pct" data-pct="${pct[i]}">${vis.includes(i) ? '0 %' : '—'}</span>
          <div class="bar-col" data-h="${pct[i]}"></div>
          <span class="bar-letter">${LETTERS[i]}</span></div>`).join('')}
      </div>
      <p class="aud-reco" id="aud-reco" hidden>Le public recommande la réponse <b>${LETTERS[top]}</b> : « ${esc(cur.answers[top])} » (${pct[top]} %)</p>
      <div class="modal-actions"><button class="btn btn-gold" data-close type="button">Merci le public !</button></div>`,
      () => {
        // Les pourcentages restent affichés sur les réponses
        vis.forEach(i => setHint(i, `👥 ${pct[i]} %`, 'aud', i === top ? 'tag-top' : ''));
        $$('.answer').forEach((b, i) => b.style.setProperty('--pct', vis.includes(i) ? pct[i] + '%' : '0%'));
        $('#answers').classList.add('has-votes');
      });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      $$('.bar-col').forEach(el => { el.style.height = Math.max(2, +el.dataset.h) + '%'; });
      // Les pourcentages « comptent » pendant que les barres montent
      const t0 = performance.now();
      (function step(t) {
        const p = Math.min(1, (t - t0) / 1200);
        $$('.bar:not(.off) .bar-pct').forEach(el => { el.textContent = Math.round(+el.dataset.pct * (1 - Math.pow(1 - p, 3))) + ' %'; });
        if (p < 1 && !$('#modal').hidden) requestAnimationFrame(step);
        else if (!$('#modal').hidden) {
          $('#aud-status').textContent = 'Résultat du vote';
          $('#aud-reco').hidden = false;
          const topBar = $('.bar.top');
          if (topBar) topBar.classList.add('win');
        }
      })(t0);
    }));
  }

  function phone() {
    const cur = game.current;
    // On propose 3 amis : celui dont c'est le domaine (s'il existe) + 2 autres au hasard
    const experts = FRIENDS.filter(f => f.fav.includes(cur.src.cat));
    const pool = shuffle(FRIENDS.filter(f => !experts.includes(f)));
    const choices = shuffle((experts.length ? [experts[rand(experts.length)]] : []).concat(pool).slice(0, 3));

    openModal(`
      <div class="modal-big">📞</div>
      <h3>Qui veux-tu appeler ?</h3>
      <p class="muted small">Choisis bien : un ami est plus fiable dans son domaine.</p>
      <div class="friend-pick">
        ${choices.map((f, n) => `<button class="friend" data-friend="${FRIENDS.indexOf(f)}" type="button" style="--i:${n}">
          <span class="friend-ava">${esc(f.name.replace('Dr ', '').charAt(0))}</span>
          <span><b>${esc(f.name)}</b><small>${esc(f.job)}</small></span>
        </button>`).join('')}
      </div>`);
    $$('.friend', $('#modal-card')).forEach(b => b.addEventListener('click', () => callFriend(FRIENDS[+b.dataset.friend])));
  }

  function callFriend(friend) {
    const cur = game.current;
    const tier = tierFor(game.level);
    const expert = friend.fav.includes(cur.src.cat);
    const chance = Math.min(0.97, [0.9, 0.72, 0.5][tier - 1] + (expert ? 0.2 : 0));
    const vis = visibleIndexes();
    const right = Math.random() < chance;
    const pick = right ? cur.correct : vis.filter(i => i !== cur.correct)[rand(vis.length - 1)];
    const conf = right ? 60 + rand(36) : 30 + rand(40);
    const e = friend.f ? 'e' : '';
    const lines = conf >= 80
      ? `Facile ! Je te recommande la réponse <b>${LETTERS[pick]}</b> : « ${esc(cur.answers[pick])} ». J'en suis sûr${e} à ${conf} %.`
      : conf >= 55
        ? `Hmm… je te conseille <b>${LETTERS[pick]}</b>, « ${esc(cur.answers[pick])} ». Confiance : ${conf} %.`
        : `Alors là… honnêtement, je tenterais <b>${LETTERS[pick]}</b> (« ${esc(cur.answers[pick])} »), mais seulement à ${conf} %. Désolé${e} !`;

    $('#modal-card').innerHTML = `
      <div class="modal-big ringing">📞</div>
      <h3>Appel à ${esc(friend.name)}</h3>
      <p class="muted">${esc(friend.job)}${expert ? ' — <b class="gold">c\'est son domaine !</b>' : ''}</p>
      <div class="phone-bubble"><span class="who">${esc(friend.name)}</span><span id="phone-msg" class="typing">Ça sonne</span></div>
      <div class="conf" id="phone-conf" hidden><span>Confiance</span><div class="conf-bar"><div class="conf-fill" id="conf-fill"></div></div><b>${conf} %</b></div>
      <div class="modal-actions"><button class="btn btn-gold" data-close type="button">Raccrocher</button></div>`;
    modalOnClose = () => setHint(pick, `📞 ${esc(friend.name)} · ${conf} %`, 'friend');
    setTimeout(() => { const m = $('#phone-msg'); if (m) m.textContent = 'En train de réfléchir'; }, 900);
    setTimeout(() => {
      const m = $('#phone-msg');
      if (!m) return;
      m.classList.remove('typing'); m.innerHTML = lines;
      $('.ringing') && $('.ringing').classList.remove('ringing');
      $('#phone-conf').hidden = false;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        const fill = $('#conf-fill');
        if (fill) { fill.style.width = conf + '%'; fill.classList.toggle('low', conf < 55); }
      }));
    }, 2000);
  }

  function swap() {
    stopTimer();
    showBanner('⏭️ Skip', 'Question remplacée', '');
    nextQuestion(true);
  }

  /* ---------- Partir ---------- */
  function askQuit() {
    if (!game || game.locked || game.level === 0) return;
    const amount = currentWinnings();
    openModal(`
      <div class="modal-big">🤔</div>
      <h3>C'est votre dernier mot ?</h3>
      <p>Tu repars avec <b class="gold">${fmt(amount)}</b> + <b>${fmt(game.bonus)}</b> de bonus, multipliés par ton niveau.<br>
      Si tu continues et que tu te trompes, tu retombes à <b>${fmt(securedWinnings())}</b> et tu perds le bonus.</p>
      <div class="modal-actions">
        <button class="btn btn-ghost" data-close type="button">Je continue !</button>
        <button class="btn btn-gold" id="confirm-quit" type="button">Je pars avec l'argent</button>
      </div>`);
    $('#confirm-quit').addEventListener('click', () => {
      modalOnClose = null; closeModal();
      game.locked = true; stopTimer();
      endGame('quit');
    });
  }

  /* ---------- Fin ---------- */
  function endGame(type) {
    if (game.over) return;
    game.over = true;
    stopTimer();

    let base, keepBonus;
    if (type === 'million') { base = LADDER[LADDER.length - 1]; keepBonus = true; }
    else if (type === 'quit') { base = currentWinnings(); keepBonus = true; }
    else { base = securedWinnings(); keepBonus = false; }

    const multiplied = Math.round(base * game.mult);
    const bonus = keepBonus ? game.bonus : 0;
    const total = multiplied + bonus;
    const xpGain = game.xp + (type === 'million' ? 300 : 0);

    const lvlBefore = levelFromXp(profile.xp);
    profile.bank += total;
    profile.xp += xpGain;
    profile.games++;
    profile.correct += game.correct;
    profile.best = Math.max(profile.best, total);
    if (type === 'million') profile.millions++;
    profile.catBest[game.cat] = Math.max(profile.catBest[game.cat] || 0, total);
    const lvlAfter = levelFromXp(profile.xp);
    saveProfile();

    if (type === 'million') unlock('million');
    if (type === 'quit' && base >= 8000) unlock('wise');
    if (profile.bank >= 1000000) unlock('bank1m');
    if (lvlAfter >= 10) unlock('level10');

    // Écran de fin
    const texts = {
      million: ['💎', 'MILLIONNAIRE !', 'Incroyable ! Tu as répondu juste aux 15 questions.'],
      quit: ['🦉', 'Sage décision !', `Tu t'arrêtes à la question ${game.level + 1} et tu sécurises tes gains.`],
      wrong: ['😬', 'Mauvaise réponse…', `La bonne réponse était « ${game.current.answers[game.current.correct]} ».`],
      time: ['⏰', 'Temps écoulé !', `La bonne réponse était « ${game.current.answers[game.current.correct]} ».`]
    }[type];
    $('#end-emoji').textContent = texts[0];
    $('#end-title').textContent = texts[1];
    $('#end-sub').textContent = texts[2];
    $('#cheque-name').textContent = profile.name || 'Candidat';
    $('#cheque-date').textContent = new Date().toLocaleDateString('fr-FR');

    const rows = [
      [type === 'wrong' || type === 'time' ? 'Palier garanti' : 'Gains de la pyramide', fmt(base)],
      [`Multiplicateur niveau ${game.startLevel}`, fmtMult(game.mult)],
      [keepBonus ? 'Cagnotte bonus' : 'Cagnotte bonus perdue', (keepBonus ? '+ ' : '') + fmt(game.bonus), keepBonus ? '' : 'lost'],
      ['Total encaissé', fmt(total), 'total']
    ];
    $('#breakdown').innerHTML = rows.map(([k, v, c]) => `<li class="${c || ''}"><span>${esc(k)}</span><b>${esc(v)}</b></li>`).join('');

    const cur = xpForLevel(lvlAfter), next = xpForLevel(lvlAfter + 1);
    $('#end-xp').innerHTML = `
      <div class="card">
        <div class="xp-head"><span>+${xpGain} XP · Niveau <b>${lvlAfter}</b></span><span>Prochain multiplicateur <b class="gold">${fmtMult(multiplierFor(lvlAfter + 1))}</b></span></div>
        <div class="xp-bar"><div class="xp-fill" id="end-xp-fill"></div></div>
        <div class="xp-foot">Meilleure série : ${game.maxCombo} · Bonnes réponses : ${game.correct}</div>
      </div>`;

    show('end');
    renderChip();
    animateNumber($('#cheque-amount'), total, 1600);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const fill = $('#end-xp-fill');
      if (fill) fill.style.width = Math.round(((profile.xp - cur) / (next - cur)) * 100) + '%';
    }));

    if (total > 0) {
      setTimeout(() => (type === 'million' ? Confetti.rain(400) : Confetti.burst(Math.min(260, 60 + total / 4000))), 300);
    }
    if (lvlAfter > lvlBefore) {
      setTimeout(() => {
        Sound.levelup();
        Confetti.burst(180);
        openModal(`
          <div class="modal-big">⬆️</div>
          <h3>Niveau ${lvlAfter} atteint !</h3>
          <p>Ton multiplicateur de gains passe de <b>${fmtMult(multiplierFor(lvlBefore))}</b> à <b class="gold">${fmtMult(multiplierFor(lvlAfter))}</b>.<br>Toutes tes prochaines victoires rapporteront plus !</p>
          <div class="modal-actions"><button class="btn btn-gold" data-close type="button">Génial !</button></div>`);
      }, 1900);
    }
  }

  function animateNumber(el, to, dur) {
    if (reducedMotion) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    let lastCoin = 0;
    (function step(t) {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e);
      if (to > 0 && t - lastCoin > 120 && p < 1) { lastCoin = t; Sound.coin(); }
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* =========================================================
   * Options
   * ======================================================= */
  function openOptions() {
    const o = profile.options;
    const inGame = $('#screen-game').classList.contains('active') && game && !game.over;
    const seg = (name, entries, cur) => `<div class="seg">${entries.map(([k, label]) =>
      `<label><input type="radio" name="${name}" value="${k}" ${cur === k ? 'checked' : ''}><span>${esc(label)}</span></label>`).join('')}</div>`;
    openModal(`
      <div class="modal-big">⚙️</div>
      <h3>Options</h3>
      <div class="opts">
        <label class="opt">
          <span><b>📚 Pack de questions étendu</b><small>+${PLUS_QUESTIONS.length} questions réparties dans toutes les catégories</small></span>
          <input type="checkbox" class="switch" data-opt="extended" ${o.extended ? 'checked' : ''}>
        </label>
        <label class="opt">
          <span><b>✍️ Inclure mes questions</b><small>${profile.custom.length} question(s) personnelle(s)</small></span>
          <input type="checkbox" class="switch" data-opt="custom" ${o.custom ? 'checked' : ''}>
        </label>
        <div class="opt opt-col"><b>⏱️ Chrono</b>${seg('opt-timer', Object.entries(TIME_MODES).map(([k, m]) => [k, m.label]), o.timer)}
          ${inGame ? '<small>Le changement s\'applique à la prochaine question.</small>' : ''}</div>
        <div class="opt opt-col"><b>✨ Animations</b>${seg('opt-fx', [['max', 'Spectaculaires'], ['low', 'Réduites']], o.fx)}
          ${reducedMotion ? '<small>Ton système demande des animations réduites : elles restent légères.</small>' : ''}</div>
      </div>
      <p class="opt-total" id="opt-total"></p>
      <div class="modal-actions">
        ${inGame ? '' : '<button class="btn btn-ghost" data-go="editor" type="button">➕ Gérer mes questions</button>'}
        <button class="btn btn-gold" data-close type="button">OK</button>
      </div>`);
    const total = () => { $('#opt-total').textContent = `${QUESTIONS.length} questions disponibles au total`; };
    total();
    $('#modal-card').addEventListener('change', e => {
      const t = e.target;
      if (t.dataset.opt) o[t.dataset.opt] = t.checked;
      if (t.name === 'opt-timer') o.timer = t.value;
      if (t.name === 'opt-fx') o.fx = t.value;
      saveProfile(); rebuildPool(); applyFx(); total();
      if ($('#screen-cats').classList.contains('active')) renderCats();
      Sound.click();
    });
  }

  /* =========================================================
   * Éditeur « Mes questions »
   * ======================================================= */
  function renderEditor() {
    const sel = $('#ed-cat');
    if (!sel.options.length) {
      sel.innerHTML = CATEGORIES.map(c => `<option value="${c.id}">${c.emoji} ${esc(c.name)}</option>`).join('');
    }
    $('#ed-count').textContent = profile.custom.length;
    $('#editor-list').innerHTML = profile.custom.length
      ? profile.custom.slice().reverse().map((q, k) => {
          const c = CAT_BY_ID[q.cat];
          return `<li class="ed-item" style="--i:${k}">
            <div class="ed-body">
              <span class="ed-meta">${c ? c.emoji + ' ' + esc(c.name) : esc(q.cat)} · ${'★'.repeat(q.d)}${'☆'.repeat(3 - q.d)}</span>
              <b>${esc(q.q)}</b>
              <span class="ed-ans"><span class="good">✔ ${esc(q.a[0])}</span> ${q.a.slice(1).map(x => `<span class="bad">✘ ${esc(x)}</span>`).join(' ')}</span>
            </div>
            <button class="icon-btn ed-del" data-del="${esc(q.id)}" type="button" aria-label="Supprimer cette question">🗑️</button>
          </li>`;
        }).join('')
      : '<li class="ed-empty">Aucune question pour l\'instant. Ajoute la première ! ✍️</li>';
  }

  function validQuestion(x) {
    return x && CAT_BY_ID[x.cat] && typeof x.q === 'string' && x.q.trim() &&
      Array.isArray(x.a) && x.a.length === 4 && x.a.every(s => typeof s === 'string' && s.trim()) &&
      new Set(x.a.map(s => s.trim().toLowerCase())).size === 4 && [1, 2, 3].includes(+x.d);
  }
  const newCustomId = () => 'custom-' + Date.now().toString(36) + '-' + rand(1e6).toString(36);

  $('#editor-form').addEventListener('submit', e => {
    e.preventDefault();
    const item = {
      id: newCustomId(),
      cat: $('#ed-cat').value,
      q: $('#ed-q').value.trim(),
      a: ['#ed-good', '#ed-bad1', '#ed-bad2', '#ed-bad3'].map(s => $(s).value.trim()),
      d: +$('input[name="ed-d"]:checked').value
    };
    if (!validQuestion(item)) {
      $('#ed-error').textContent = 'Les 4 réponses doivent être remplies et toutes différentes.';
      restartAnim($('#editor-form'), 'shake');
      return;
    }
    $('#ed-error').textContent = '';
    profile.custom.push(item);
    saveProfile(); rebuildPool(); renderEditor();
    ['#ed-q', '#ed-good', '#ed-bad1', '#ed-bad2', '#ed-bad3'].forEach(s => { $(s).value = ''; });
    $('#ed-q').focus();
    const first = $('#editor-list .ed-item');
    if (first) first.classList.add('fresh');
    Sound.correct();
    toast('✍️', 'Question ajoutée', CAT_BY_ID[item.cat].name, profile.options.custom ? 'Elle peut tomber dès ta prochaine partie.' : 'Active « Inclure mes questions » dans ⚙️ Options pour la jouer.');
  });

  $('#editor-list').addEventListener('click', e => {
    const del = e.target.closest('[data-del]');
    if (!del) return;
    const li = del.closest('.ed-item');
    const remove = () => {
      profile.custom = profile.custom.filter(q => q.id !== del.dataset.del);
      saveProfile(); rebuildPool(); renderEditor();
    };
    if (li && !fxLow()) { li.classList.add('gone'); setTimeout(remove, 280); } else remove();
    Sound.click();
  });

  $('#ed-export').addEventListener('click', () => {
    const data = JSON.stringify(profile.custom.map(({ cat, q, a, d }) => ({ cat, q, a, d })), null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url; link.download = 'mes-questions-millionnaire.json';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  $('#ed-import').addEventListener('change', async e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const list = JSON.parse(await file.text());
      if (!Array.isArray(list)) throw new Error('format');
      const known = new Set(profile.custom.map(q => q.q.trim().toLowerCase()));
      let added = 0;
      for (const x of list) {
        if (!validQuestion(x) || known.has(x.q.trim().toLowerCase())) continue;
        profile.custom.push({ id: newCustomId(), cat: x.cat, q: x.q.trim().slice(0, 200), a: x.a.map(s => s.trim().slice(0, 80)), d: +x.d });
        known.add(x.q.trim().toLowerCase());
        added++;
      }
      saveProfile(); rebuildPool(); renderEditor();
      toast('📥', 'Import terminé', `${added} question(s) ajoutée(s)`, added < list.length ? 'Les doublons et questions invalides ont été ignorés.' : '');
    } catch (err) {
      toast('⚠️', 'Import impossible', 'Fichier invalide', 'Utilise un fichier exporté depuis « Mes questions ».');
    }
  });

  /* =========================================================
   * Événements
   * ======================================================= */
  $('#options-btn').addEventListener('click', () => { Sound.click(); openOptions(); });
  function goHomeFromAnywhere() {
    if (game && !game.over && $('#screen-game').classList.contains('active')) {
      openModal(`
        <div class="modal-big">🚪</div>
        <h3>Abandonner la partie ?</h3>
        <p>Tu repartiras sans rien gagner sur cette partie.</p>
        <div class="modal-actions">
          <button class="btn btn-ghost" data-close type="button">Continuer à jouer</button>
          <button class="btn btn-gold" id="confirm-leave" type="button">Abandonner</button>
        </div>`);
      $('#confirm-leave').addEventListener('click', () => {
        modalOnClose = null; closeModal();
        stopTimer(); game.over = true;
        show('home');
      });
      return;
    }
    show('home');
  }

  $('#brand-home').addEventListener('click', goHomeFromAnywhere);

  $('#sound-toggle').addEventListener('click', () => {
    profile.muted = !profile.muted;
    saveProfile(); renderChip();
    Sound.click();
  });

  $('#player-name').addEventListener('input', e => {
    profile.name = e.target.value.trim().slice(0, 20);
    saveProfile();
  });
  $('#player-name').addEventListener('keydown', e => { if (e.key === 'Enter') $('#btn-play').click(); });

  $('#btn-play').addEventListener('click', () => { Sound.click(); show('cats'); });
  $('#btn-replay').addEventListener('click', () => { Sound.click(); if (game) startGame(game.cat); });

  document.addEventListener('click', e => {
    const go = e.target.closest('[data-go]');
    if (go) { Sound.click(); modalOnClose = null; closeModal(); show(go.dataset.go); return; }
    if (e.target.closest('[data-open-options]')) { Sound.click(); openOptions(); return; }
    const cat = e.target.closest('[data-cat]');
    if (cat) { startGame(cat.dataset.cat); return; }
    if (e.target.closest('[data-close]')) { closeModal(); return; }
    if (e.target.id === 'modal') closeModal();
  });

  $('#answers').addEventListener('click', e => {
    const btn = e.target.closest('.answer');
    if (btn) selectAnswer(+btn.dataset.i);
  });
  $$('.lifeline').forEach(b => b.addEventListener('click', () => useLifeline(b.dataset.life)));
  $('#btn-quit').addEventListener('click', askQuit);
  $('#ll-help').addEventListener('click', () => { Sound.click(); showJokerHelp(false); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#modal').hidden) { closeModal(); return; }
    if (!$('#screen-game').classList.contains('active') || !$('#modal').hidden) return;
    if (e.target.tagName === 'INPUT' || e.ctrlKey || e.metaKey || e.altKey) return;
    const map = { a: 0, b: 1, c: 2, d: 3, 1: 0, 2: 1, 3: 2, 4: 3 };
    const k = e.key.toLowerCase();
    if (k in map) selectAnswer(map[k]);
  });

  // Démarrage
  renderLadder();
  show('home');
})();
