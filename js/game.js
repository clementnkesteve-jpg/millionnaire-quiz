(() => {
  'use strict';

  /* =========================================================
   * Configuration
   * ======================================================= */
  const LADDER = [100, 200, 300, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 125000, 250000, 500000, 1000000];
  const SAFE_LEVELS = [4, 9];               // index des paliers garantis (1 000 € et 32 000 €)
  const TIME_BY_TIER = [30, 45, 60];        // secondes par question selon la difficulté
  const RECENT_MAX = 120;                   // évite de reposer trop vite les mêmes questions
  const STORE_KEY = 'millionnaire-quiz.profile.v1';

  const CATEGORIES = window.QUIZ_CATEGORIES;
  const QUESTIONS = window.QUIZ_QUESTIONS;
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
    achievements: [], catsPlayed: [], catBest: {}, recent: [], muted: false
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
      if (reducedMotion) n = Math.min(n, 20);
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, s = 3 + Math.random() * 9;
        add({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 6, w: 6 + Math.random() * 6, h: 4 + Math.random() * 4,
              r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, c: colors[i % colors.length], life: 110 + Math.random() * 60 });
      }
    }
    function rain(n = 220) {
      if (reducedMotion) n = 30;
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
    if (screen === 'home') renderHome();
    if (screen === 'cats') renderCats();
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
    const card = (c, extra = '') => {
      const best = profile.catBest[c.id] || 0;
      return `<button class="cat ${extra}" style="--c:${c.color}" data-cat="${c.id}" type="button">
        <span class="cat-emoji">${c.emoji}</span>
        <span><span class="cat-name">${esc(c.name)}</span>
        <span class="cat-meta">${count(c.id)} questions</span>
        ${best ? `<span class="cat-best">Record : ${fmt(best)}</span>` : ''}</span>
      </button>`;
    };
    $('#cat-grid').innerHTML = card(MIX, 'mix') + CATEGORIES.map(c => card(c)).join('');
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
    $$('.lifeline').forEach(b => { b.disabled = false; });
    renderLadder();
    show('game');
    nextQuestion();
  }

  function nextQuestion(swap = false) {
    game.current = pickQuestion(game.level);
    rememberQuestion(game.current.src.id);
    const cur = game.current;

    const qBox = $('#question-box');
    qBox.classList.remove('enter'); void qBox.offsetWidth; qBox.classList.add('enter');
    $('#q-text').textContent = cur.q;
    $$('.answer').forEach((btn, i) => {
      btn.className = 'answer';
      void btn.offsetWidth;
      btn.classList.add('enter');
      btn.disabled = false;
      $('.txt', btn).textContent = cur.answers[i];
    });
    updateHud();
    renderLadder();
    game.locked = false;
    startTimer();
    if (!swap) Sound.click();
  }

  function updateHud() {
    $('#hud-step').textContent = `Question ${game.level + 1} / 15 · ${fmt(LADDER[game.level])}`;
    $('#hud-bonus').textContent = `✨ Bonus ${fmt(game.bonus)}`;
    const combo = $('#hud-combo');
    combo.hidden = game.combo < 2;
    combo.textContent = `🔥 Série ×${game.combo}`;
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
        game && i === game.level && !game.over ? 'current' : ''
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
    game.timeTotal = TIME_BY_TIER[tierFor(game.level) - 1];
    game.timeLeft = game.timeTotal;
    game.paused = false;
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
    const ratio = game.timeLeft / game.timeTotal;
    $('#timer-fill').style.strokeDashoffset = (119.38 * (1 - ratio)).toFixed(2);
    $('#timer-text').textContent = Math.ceil(game.timeLeft);
    const t = $('#timer');
    t.classList.toggle('warn', ratio <= 0.5 && ratio > 0.2);
    t.classList.toggle('danger', ratio <= 0.2);
  }
  function timeUp() {
    stopTimer();
    if (game.locked) return;
    game.locked = true;
    $$('.answer').forEach(b => { b.disabled = true; });
    $$('.answer')[game.current.correct].classList.add('correct');
    floatText('⏰ Temps écoulé !', false);
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
    const elapsed = game.timeTotal - game.timeLeft;
    $$('.answer').forEach((b, j) => { b.disabled = true; if (j !== i) b.classList.add('dim'); });
    btn.classList.add('selected');
    Sound.select();
    // Suspense plus long sur les grosses questions
    const suspense = reducedMotion ? 600 : 1100 + game.level * 90;
    setTimeout(() => reveal(i, elapsed), suspense);
  }

  function reveal(i, elapsed) {
    const answers = $$('.answer');
    const ok = i === game.current.correct;
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
    const ratio = Math.max(0, game.timeLeft / game.timeTotal);
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

    if (isSafe) {
      Confetti.burst(160);
      toast('🔒', 'Palier atteint', fmt(base) + ' garantis', 'Même en cas d\'erreur, cette somme est à toi.');
    } else if (!isTop) {
      Confetti.burst(40 + lvl * 6, innerWidth / 2, innerHeight * 0.55);
    }

    game.level++;
    updateHud();
    renderLadder();

    if (isTop) {
      Confetti.rain(320);
      setTimeout(() => endGame('million'), 1800);
      return;
    }
    setTimeout(nextQuestion, 1900);
  }

  function onWrong() {
    game.combo = 0;
    Sound.wrong();
    $('#question-box').animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(10px)' }, { transform: 'translateX(0)' }],
      { duration: 400 }
    );
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
  function useLifeline(kind) {
    if (!game || game.locked || !game.lifelines[kind]) return;
    game.lifelines[kind] = false;
    game.usedLifeline = true;
    $(`.lifeline[data-life="${kind}"]`).disabled = true;
    Sound.lifeline();
    ({ fifty, phone, audience, swap })[kind]();
  }

  function visibleIndexes() {
    return [0, 1, 2, 3].filter(i => !game.current.removed.includes(i));
  }

  function fifty() {
    const cur = game.current;
    const wrong = shuffle([0, 1, 2, 3].filter(i => i !== cur.correct)).slice(0, 2);
    cur.removed = wrong;
    wrong.forEach(i => { const b = $$('.answer')[i]; b.classList.add('removed'); b.disabled = true; });
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
      const v = k === others.length - 1 ? rest : rand(rest + 1);
      pct[i] = v; rest -= v;
    });

    openModal(`
      <div class="modal-big">👥</div>
      <h3>Le public a voté</h3>
      <div class="bars">
        ${[0, 1, 2, 3].map(i => `<div class="bar">
          <span class="bar-pct">${vis.includes(i) ? pct[i] + ' %' : '—'}</span>
          <div class="bar-col" data-h="${pct[i]}"></div>
          <span class="bar-letter">${LETTERS[i]}</span></div>`).join('')}
      </div>
      <div class="modal-actions"><button class="btn btn-gold" data-close type="button">Merci le public !</button></div>`);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      $$('.bar-col').forEach(el => { el.style.height = Math.max(2, +el.dataset.h) + '%'; });
    }));
  }

  function phone() {
    const cur = game.current;
    const tier = tierFor(game.level);
    const friend = FRIENDS[rand(FRIENDS.length)];
    const expert = friend.fav.includes(cur.src.cat);
    const chance = Math.min(0.97, [0.9, 0.72, 0.5][tier - 1] + (expert ? 0.2 : 0));
    const vis = visibleIndexes();
    const right = Math.random() < chance;
    const pick = right ? cur.correct : vis.filter(i => i !== cur.correct)[rand(vis.length - 1)];
    const conf = right ? 60 + rand(36) : 30 + rand(40);
    const lines = conf >= 80
      ? `Facile ! C'est la réponse <b>${LETTERS[pick]}</b> : « ${esc(cur.answers[pick])} ». J'en suis sûr${friend.f ? 'e' : ''} à ${conf} %.`
      : conf >= 55
        ? `Hmm… je dirais <b>${LETTERS[pick]}</b>, « ${esc(cur.answers[pick])} ». Confiance : ${conf} %.`
        : `Alors là… honnêtement, je tenterais <b>${LETTERS[pick]}</b> (« ${esc(cur.answers[pick])} »), mais seulement à ${conf} %. Désolé${friend.f ? 'e' : ''} !`;

    openModal(`
      <div class="modal-big">📞</div>
      <h3>Appel à ${esc(friend.name)}</h3>
      <p class="muted">${esc(friend.job)}${expert ? ' — c\'est son domaine !' : ''}</p>
      <div class="phone-bubble"><span class="who">${esc(friend.name)}</span><span id="phone-msg" class="typing">En train de réfléchir</span></div>
      <div class="modal-actions"><button class="btn btn-gold" data-close type="button">Raccrocher</button></div>`);
    setTimeout(() => { const m = $('#phone-msg'); if (m) { m.classList.remove('typing'); m.innerHTML = lines; } }, 1600);
  }

  function swap() {
    stopTimer();
    floatText('🔄 Nouvelle question', false);
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
   * Événements
   * ======================================================= */
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
    if (go) { Sound.click(); show(go.dataset.go); return; }
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
