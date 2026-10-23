/* ═══════════════════════════════════════════════════════════════════════════
   VirtualLearn AI — Application Logic
   Preserves existing features: dashboard, 3D models, tutor, lab, quizzes,
   resources, LocalStorage persistence. Adds: courses, theme toggle,
   backend integration, new experiments, expanded content.
   ═══════════════════════════════════════════════════════════════════════════ */

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const KEY = 'virtuallearn-ai-v1';
const API = ''; // Same origin — relative URLs

// ─── HTML Escaping ──────────────────────────────────────────────────────────
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ─── LocalStorage Persistence ───────────────────────────────────────────────
function load() {
  const d0 = { name: 'Saksham', quizzes: [], done: [], points: 0, log: [], bookmarks: [] };
  try {
    const d = JSON.parse(localStorage.getItem(KEY));
    if (d && typeof d === 'object') return {
      name: typeof d.name === 'string' && d.name.trim() ? d.name.trim().slice(0, 30) : 'Saksham',
      quizzes: (Array.isArray(d.quizzes) ? d.quizzes : []).filter(q => q && Number.isFinite(q.s) && Number.isFinite(q.n) && q.n > 0),
      done: Array.isArray(d.done) ? d.done.filter(x => typeof x === 'string') : [],
      points: Number.isFinite(d.points) ? d.points : 0,
      log: (Array.isArray(d.log) ? d.log : []).filter(l => l && l.t).slice(0, 12),
      bookmarks: Array.isArray(d.bookmarks) ? d.bookmarks.filter(x => typeof x === 'string') : []
    };
  } catch (e) { /* corrupted data */ }
  return d0;
}

let S = load();
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* quota */ } };
const act = t => { S.log.unshift({ t, d: new Date().toLocaleString() }); S.log = S.log.slice(0, 12); };
const avg = () => S.quizzes.length ? Math.round(S.quizzes.reduce((a, q) => a + q.s / q.n * 100, 0) / S.quizzes.length) : 0;

// ─── Constants ──────────────────────────────────────────────────────────────
const TOPICS = ['Solar System', 'Human Heart', 'Atom Structure', 'Geometric Shapes', 'Circuit Lab', 'DNA Structure', 'Human Cell', 'Water Molecule', 'EM Field'];
const CATS = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Biology'];
const BADGES = [
  ['First Steps', '🌟', 'Complete a quiz', () => S.quizzes.length >= 1],
  ['Perfect Score', '🏅', 'Score 100% on any quiz', () => S.quizzes.some(q => q.s === q.n)],
  ['Quiz Streak', '🔥', 'Complete 5 quizzes', () => S.quizzes.length >= 5],
  ['Explorer', '🗺️', 'Complete 3 topics', () => S.done.length >= 3],
  ['Century', '💯', 'Earn 100 points', () => S.points >= 100],
  ['Scholar', '📚', 'Complete 5 topics', () => S.done.length >= 5],
  ['Quiz Master', '👑', 'Complete 10 quizzes', () => S.quizzes.length >= 10],
  ['Scientist', '🔬', 'Complete Circuit Lab', () => S.done.includes('Circuit Lab')],
  ['All Stars', '⭐', 'Average above 80%', () => S.quizzes.length >= 3 && avg() >= 80],
  ['Bookworm', '📖', 'Bookmark 3 resources', () => S.bookmarks.length >= 3]
];

const NAV = [
  ['home', 'Home'], ['dash', 'Dashboard'], ['learn', '3D Learn'], ['tutor', 'AI Tutor'],
  ['lab', 'Science Lab'], ['quiz', 'Quiz'], ['courses', 'Courses'], ['res', 'Resources'], ['about', 'About']
];

// ─── Backend Connection ─────────────────────────────────────────────────────
let backendOnline = false;
let aiConfigured = false;
let backendDashboard = null;
let backendCourses = null;

async function checkBackend() {
  try {
    const r = await fetch(API + '/api/health', { signal: AbortSignal.timeout(3000) });
    const d = await r.json();
    backendOnline = d.status === 'ok';
    if (backendOnline) {
      try {
        const aiR = await fetch(API + '/api/ai/status', { signal: AbortSignal.timeout(3000) });
        const aiD = await aiR.json();
        aiConfigured = Boolean(aiD.configured);
      } catch { aiConfigured = false; }

      // Fetch dashboard & courses data in background
      try {
        const [dashRes, courseRes] = await Promise.all([
          fetch(API + '/api/dashboard', { signal: AbortSignal.timeout(3000) }),
          fetch(API + '/api/courses', { signal: AbortSignal.timeout(3000) })
        ]);
        if (dashRes.ok) backendDashboard = await dashRes.json();
        if (courseRes.ok) backendCourses = await courseRes.json();
      } catch { /* keep defaults */ }
    }
  } catch {
    backendOnline = false;
    aiConfigured = false;
  }
  const dot = $('#connection-status');
  if (dot) {
    dot.classList.toggle('online', backendOnline);
    dot.classList.toggle('offline', !backendOnline);
    dot.title = backendOnline
      ? (aiConfigured ? 'Backend: connected (Gemini AI active ⚡)' : 'Backend: connected (Demo AI active)')
      : 'Backend: offline — local features still work';
  }
}

async function apiFetch(path) {
  if (!backendOnline) return null;
  try {
    const r = await fetch(API + path, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

// ─── Theme Toggle ───────────────────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('vl-theme');
  if (saved) {
    document.documentElement.setAttribute('data-theme', saved);
  } else {
    // Default to dark navy theme with blue, cyan, and violet accents
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('vl-theme', next);
}

// ─── Navigation ─────────────────────────────────────────────────────────────
function buildNav() {
  const links = NAV.map(([id, label]) => `<a href="#${id}" data-v="${id}">${label}</a>`).join('');
  $('#nav').innerHTML = links;
  $('#mobile-nav').innerHTML = links;
}

function toggleMobileMenu() {
  const menu = $('#mobile-menu');
  menu.classList.toggle('open');
  menu.setAttribute('aria-hidden', !menu.classList.contains('open'));
}

// Close mobile menu on navigation
document.addEventListener('click', e => {
  if (e.target.closest('.mobile-nav a')) {
    const menu = $('#mobile-menu');
    menu.classList.remove('open');
    menu.setAttribute('aria-hidden', 'true');
  }
});

// ─── Topic Completion ───────────────────────────────────────────────────────
function complete(t) {
  if (S.done.includes(t)) return;
  S.done.push(t);
  S.points += 20;
  act('Completed topic: ' + t + ' (+20 points)');
  save();
  const b = $('#mk');
  if (b) { b.textContent = '✓ Completed'; b.disabled = true; }
}

function openTopic(t) {
  const k = Object.keys(MT).find(k => MT[k] === t);
  if (k) { cur3 = k; location.hash = '#learn'; }
  else if (t === 'Circuit Lab') location.hash = '#lab';
  else location.hash = '#quiz';
}

// ─── Built With ─────────────────────────────────────────────────────────────
const BW = [
  ['🎨', 'CSS Custom Properties', 'Light/dark theme with design system tokens'],
  ['📐', 'Inter (Google Fonts)', 'Clean, modern typography throughout'],
  ['🧊', 'Three.js r128', 'Interactive 3D models with click/drag/zoom'],
  ['💾', 'Browser LocalStorage', 'Saves profile, progress, and quiz scores'],
  ['⚡', 'Vanilla JavaScript', 'Single-page app with hash-based routing'],
  ['🖥️', 'Node.js + Express', 'Simple backend serving topics and courses API'],
];

function builtWith() {
  return `<section class="mt-10">
    <h2 class="section-title">Built With</h2>
    <p class="text-secondary text-sm mt-2 mb-4">Only technologies genuinely used in this project.</p>
    <div class="grid-3">${BW.map(([ic, n, d]) => `
      <div class="card built-with-card">
        <div class="built-with-icon">${ic}</div>
        <div><div class="built-with-name">${n}</div><div class="built-with-desc">${d}</div></div>
      </div>`).join('')}
    </div>
  </section>`;
}

// ─── Progress Display ───────────────────────────────────────────────────────
function progress() {
  const topicsDone = S.done.length;
  const totalTopics = TOPICS.length;
  const pct = totalTopics ? Math.round(topicsDone / totalTopics * 100) : 0;
  return `<div class="grid-4">
    <div class="stat-card"><div class="stat-value">${topicsDone}/${totalTopics}</div><div class="stat-label">Topics Done</div></div>
    <div class="stat-card"><div class="stat-value">${S.quizzes.length}</div><div class="stat-label">Quizzes Taken</div></div>
    <div class="stat-card"><div class="stat-value">${S.quizzes.length ? avg() + '%' : '—'}</div><div class="stat-label">Average Score</div></div>
    <div class="stat-card"><div class="stat-value">${S.points}</div><div class="stat-label">Points</div></div>
  </div>
  <div class="mt-3">
    <div class="flex items-center justify-between text-xs mb-2">
      <span class="text-muted">Overall Progress</span>
      <span class="font-semibold">${pct}%</span>
    </div>
    <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
  </div>
  ${S.quizzes.length + S.done.length ? '' : '<p class="text-muted text-sm mt-3">No activity yet — finish a topic or quiz and this fills in.</p>'}`;
}

// ─── Donut Chart Helper ─────────────────────────────────────────────────────
function donutChart(pct, label) {
  const r = 50, c = 2 * Math.PI * r, offset = c - (pct / 100) * c;
  return `<div class="donut-chart">
    <svg viewBox="0 0 120 120" width="120" height="120">
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--bg-tertiary)" stroke-width="10"/>
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="url(#donutGrad)" stroke-width="10"
        stroke-dasharray="${c}" stroke-dashoffset="${offset}" stroke-linecap="round"/>
      <defs><linearGradient id="donutGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="var(--accent-primary)"/>
        <stop offset="100%" stop-color="var(--accent-secondary)"/>
      </linearGradient></defs>
    </svg>
    <div class="donut-label"><div class="donut-value">${pct}%</div><div class="donut-text">${label}</div></div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW: HOME
// ═══════════════════════════════════════════════════════════════════════════
const topicCard = (t, d, ic) => `<button class="topic-card" onclick="openTopic('${t}')">
  <div class="topic-icon">${ic}</div>
  <div class="topic-title">${t}</div>
  <div class="topic-desc">${d}</div>
</button>`;

const V = {};
V.home = () => `
  <section class="hero">
    <div class="chip mb-3">Free · No login · Works offline</div>
    <h1 class="hero-title"><span class="gradient-text">VirtualLearn AI</span></h1>
    <p class="hero-subtitle">Learn Beyond Reality. Experience Knowledge.</p>
    <p class="hero-desc">Explore interactive 3D models, experiment in virtual labs, chat with a demo tutor, test yourself with quizzes, and track your learning journey.</p>
    <div class="hero-actions">
      <a class="btn btn-primary btn-lg" href="#learn">🧊 Explore 3D Learning</a>
      <a class="btn btn-secondary btn-lg" href="#lab">⚡ Science Lab</a>
      <a class="btn btn-secondary btn-lg" href="#quiz">📝 Take a Quiz</a>
    </div>
  </section>

  <section class="mt-8">
    <h2 class="section-title">Featured Topics</h2>
    <p class="section-subtitle">Choose a topic to start learning interactively</p>
    <div class="grid-4 mt-4">
      ${topicCard('Solar System', 'Planets, orbits, and the Sun', '🪐')}
      ${topicCard('Human Heart', 'Chambers, valves, blood flow', '❤️')}
      ${topicCard('Atom Structure', 'Protons, neutrons, electrons', '⚛️')}
      ${topicCard('Circuit Lab', "Ohm's law — live simulation", '⚡')}
    </div>
  </section>

  <section class="mt-10">
    <h2 class="section-title">Learning Features</h2>
    <div class="grid-3 mt-4">
      ${[
        ['🧊', '3D Learning', 'learn', 'Rotate, zoom, and inspect labelled models with interactive controls.'],
        ['🤖', 'AI Tutor Agent', 'tutor', 'Powered by Google Gemini 1.5 Flash for personalized STEM tutoring.'],
        ['🔬', 'Science Lab', 'lab', 'Circuit simulator plus projectile, pendulum, and wave experiments.'],
        ['📝', 'Quizzes', 'quiz', 'Multiple categories with instant feedback and score tracking.'],
        ['📖', 'Resources', 'res', 'Searchable notes, formula sheets, and learning paths.'],
        ['📊', 'Dashboard', 'dash', 'Real statistics from your actual learning activity.']
      ].map(([ic, t, h, d]) => `<a href="#${h}" class="card card-hover feature-card">
        <div class="feature-icon">${ic}</div><h3>${t}</h3><p>${d}</p>
      </a>`).join('')}
    </div>
  </section>

  <section class="mt-10">
    <div class="card">
      <h2 class="section-title mb-2">Your Progress</h2>
      ${progress()}
    </div>
  </section>

  <section class="mt-10 card">
    <h2 class="section-title mb-2">About VirtualLearn AI</h2>
    <p class="text-secondary">VirtualLearn AI is an interactive learning platform that helps students understand concepts through simple explanations, interactive simulations, quizzes, and learning progress tracking.</p>
  </section>

  ${builtWith()}`;

// ═══════════════════════════════════════════════════════════════════════════
// VIEW: DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
V.dash = () => {
  const next = TOPICS.find(t => !S.done.includes(t));
  const nx = next
    ? `Suggested: <b>${next}</b> <button class="btn btn-primary btn-sm ml-auto" onclick="openTopic('${next}')">Start</button>`
    : `All topics done! Try quizzes to improve your scores. <a class="btn btn-primary btn-sm ml-auto" href="#quiz">Quiz</a>`;

  // Quiz score chart
  const catScores = CATS.map(c => {
    const qs = S.quizzes.filter(q => q.c === c);
    return { cat: c, count: qs.length, best: qs.length ? Math.max(...qs.map(q => Math.round(q.s / q.n * 100))) : 0 };
  });

  const chartBars = catScores.map(cs => `
    <div class="chart-bar-wrapper">
      <div class="chart-bar-value">${cs.count > 0 ? cs.best + '%' : '—'}</div>
      <div class="chart-bar" style="height:${cs.count > 0 ? Math.max(8, cs.best * 1.4) : 4}px"></div>
      <div class="chart-bar-label">${cs.cat.replace('Computer Science', 'CS')}</div>
    </div>
  `).join('');

  return `<h1 class="section-title">Welcome back, <span class="gradient-text">${esc(S.name)}</span>!</h1>
    <p class="section-subtitle mt-2">Here's your learning dashboard</p>

    <div class="grid-4 mt-6">${progress()}</div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px" class="mt-6 dash-grid">
      <div class="card">
        <h3 class="font-bold mb-3">📊 Quiz Performance</h3>
        <div class="chart-container">${chartBars}</div>
        <p class="text-xs text-muted mt-3 text-center">${S.quizzes.length > 0 ? 'Best scores by category' : 'Take a quiz to see your performance chart'}</p>
      </div>

      <div class="card">
        <h3 class="font-bold mb-3">🎯 Topic Completion</h3>
        <div class="text-center mt-4">${donutChart(Math.round(S.done.length / TOPICS.length * 100), 'complete')}</div>
        <div class="flex flex-wrap gap-2 mt-4 justify-center">
          ${TOPICS.map(t => `<span class="chip ${S.done.includes(t) ? 'chip-success' : ''}" style="font-size:0.7rem">${S.done.includes(t) ? '✓' : '○'} ${t}</span>`).join('')}
        </div>
      </div>

      <div class="card">
        <h3 class="font-bold mb-3">👤 Student Profile</h3>
        <label for="nm" class="text-sm text-secondary">Display name</label>
        <input id="nm" type="text" maxlength="30" value="${esc(S.name)}" class="input mt-2">
        <div class="flex items-center gap-3 mt-3">
          <button class="btn btn-primary btn-sm" onclick="saveName()">Save</button>
          <span id="nmsg" class="text-sm" role="status"></span>
        </div>
        <div class="mt-4" style="border-top:1px solid var(--border-color);padding-top:12px">
          <h4 class="font-bold text-sm mb-2">🎯 Next Up</h4>
          <div class="flex items-center gap-2 text-sm">${nx}</div>
        </div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px" class="mt-4 dash-grid-2">
      <div class="card">
        <h3 class="font-bold mb-3">🏆 Achievement Badges</h3>
        <div class="grid-auto" style="grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:10px">
          ${BADGES.map(([n, ic, d, f]) => {
            const earned = f();
            return `<div class="badge-card ${earned ? 'earned' : 'locked'}">
              <div class="badge-icon">${earned ? ic : '🔒'}</div>
              <div class="badge-name">${n}</div>
              <div class="badge-desc">${d}</div>
            </div>`;
          }).join('')}
        </div>
      </div>

      <div class="card">
        <h3 class="font-bold mb-3">📜 Recent Activity</h3>
        ${S.log.length ? `<div>
          ${S.log.map(l => `<div class="activity-item">
            <div class="activity-dot"></div>
            <div><div>${esc(l.t)}</div><div class="activity-time">${esc(l.d)}</div></div>
          </div>`).join('')}
        </div>` : '<p class="text-muted text-sm">No activity yet. Complete topics and take quizzes to build your history.</p>'}
      </div>
    </div>

    ${backendDashboard ? `
    <div class="card mt-4" style="border:1px solid var(--accent-primary);background:var(--accent-soft)">
      <div class="flex items-center justify-between flex-wrap gap-2">
        <h3 class="font-bold flex items-center gap-2">
          <span>⚡ Backend Demo Metrics (GET /api/dashboard)</span>
        </h3>
        <span class="chip" style="background:var(--bg-primary);color:var(--accent-primary);font-weight:700">Sample Demo Data</span>
      </div>
      <p class="text-xs text-muted mt-1">Live student benchmark metrics served by the Node.js Express backend. Your personal progress on this device is saved above via LocalStorage.</p>
      <div class="grid-4 mt-3">
        <div class="stat-card">
          <div class="stat-label">Demo Profile</div>
          <div class="stat-value" style="font-size:1rem">${esc(backendDashboard.studentProfile.displayName)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Enrolled Courses</div>
          <div class="stat-value">${backendDashboard.studentProfile.enrolledCourses}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Quizzes Completed</div>
          <div class="stat-value">${backendDashboard.statistics.quizzesAttempted}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Benchmark Avg</div>
          <div class="stat-value">${backendDashboard.statistics.averageScorePercent}%</div>
        </div>
      </div>
    </div>` : ''}

    <div class="mt-4 flex gap-3">
      <button class="btn btn-secondary btn-sm" onclick="resetAll()">Reset All Progress</button>
    </div>`;
};

function saveName() {
  const v = $('#nm').value.trim().slice(0, 30), m = $('#nmsg');
  if (!v) { m.textContent = "Name can't be empty."; m.style.color = 'var(--error)'; return; }
  S.name = v; act('Updated profile name'); save(); m.textContent = '✓ Saved!'; m.style.color = 'var(--success)';
  $('#who').textContent = S.name;
  setTimeout(() => { if (m) m.textContent = ''; }, 2000);
}

function resetAll() {
  if (confirm('Clear all saved progress on this device?')) {
    S = { name: 'Saksham', quizzes: [], done: [], points: 0, log: [], bookmarks: [] };
    save(); go();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW: 3D LEARNING
// ═══════════════════════════════════════════════════════════════════════════
let R3 = null;

function stop3d() {
  if (R3) {
    cancelAnimationFrame(R3.raf);
    removeEventListener('resize', R3.rs);
    R3.r.dispose();
    R3 = null;
  }
}

const mat = c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: 0.1 });
const sph = (r, c, p, i, s = [1, 1, 1]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 24), mat(c)); m.position.set(...p); m.scale.set(...s); m.userData.p = i; return m; };
const cyl = (r, h, c, p, i, rz = 0) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 20), mat(c)); m.position.set(...p); m.rotation.z = rz; m.userData.p = i; return m; };

const MT = {
  solar: 'Solar System', heart: 'Human Heart', atom: 'Atom Structure',
  shapes: 'Geometric Shapes', dna: 'DNA Structure', cell: 'Human Cell',
  molecule: 'Water Molecule', emfield: 'EM Field'
};

let cur3 = 'solar';

const MODELS = {
  solar() {
    const g = new THREE.Group(), P = [
      ['Mercury', .25, 0xb1b1b1, 2.2, 1.6], ['Venus', .4, 0xe6c27a, 3.1, 1.2],
      ['Earth', .42, 0x3b82f6, 4.1, 1], ['Mars', .33, 0xe0613a, 5, .8],
      ['Jupiter', .9, 0xd9a066, 6.6, .5], ['Saturn', .75, 0xe8d28a, 8.2, .4]
    ], pv = [];
    const s = sph(1.3, 0xffc94a, [0, 0, 0], 0); s.material.emissive.setHex(0x553300); g.add(s);
    P.forEach((p, i) => {
      const pv0 = new THREE.Group();
      pv0.add(sph(p[1], p[2], [p[3], 0, 0], i + 1));
      g.add(pv0); pv.push([pv0, p[4]]);
      const ring = new THREE.Mesh(new THREE.RingGeometry(p[3] - .01, p[3] + .01, 64), new THREE.MeshBasicMaterial({ color: 0x4a5590, side: 2 }));
      ring.rotation.x = Math.PI / 2; g.add(ring);
    });
    // Saturn rings
    const sr = new THREE.Mesh(new THREE.RingGeometry(.9, 1.3, 32), new THREE.MeshBasicMaterial({ color: 0xe8d28a, side: 2, opacity: 0.5, transparent: true }));
    sr.rotation.x = Math.PI / 2.5; sr.position.set(8.2, 0, 0); pv[5][0].add(sr);
    return {
      g, cam: 15,
      tick: t => pv.forEach(([a, sp]) => a.rotation.y = t * .3 * sp),
      parts: [
        ['Sun', 'A star holding 99.8% of the Solar System\'s mass. Its gravity keeps every planet in orbit. Surface temperature: ~5,500°C.'],
        ['Mercury', 'Smallest planet and closest to the Sun; one orbit takes only 88 Earth days. It has no atmosphere.'],
        ['Venus', 'Thick CO₂ atmosphere makes it the hottest planet (~465°C). It rotates backward compared to most planets.'],
        ['Earth', 'Our home — the only known world with liquid surface water and life. Orbits at ~150 million km from the Sun.'],
        ['Mars', 'The cold "Red Planet", coloured by iron oxide dust. Home to Olympus Mons, the solar system\'s tallest volcano.'],
        ['Jupiter', 'A gas giant so large that all other planets would fit inside it. The Great Red Spot is a storm bigger than Earth.'],
        ['Saturn', 'Famous for its extensive icy ring system. Saturn is less dense than water — it would float!']
      ]
    };
  },

  heart() {
    const g = new THREE.Group(), h = new THREE.Group(); g.add(h);
    h.add(
      sph(.7, 0x6c7fe0, [-.8, .7, 0], 0),
      sph(.7, 0xe85d75, [.8, .8, -.2], 1),
      sph(.95, 0x5560c8, [-.45, -.5, .2], 2, [1, 1.2, 1]),
      sph(1, 0xc9243f, [.5, -.5, 0], 3, [1, 1.35, 1]),
      cyl(.3, 1.2, 0xd62839, [.1, 1.7, 0], 4, .3),
      cyl(.28, 1, 0x4455cc, [-.3, 1.6, .5], 5, -.2),
      cyl(.25, 1.4, 0x4455cc, [-1.3, 1.1, 0], 6)
    );
    return {
      g, cam: 7,
      tick: t => { const s = 1 + .05 * Math.max(0, Math.sin(t * 5)) ** 2; h.scale.setScalar(s); },
      parts: [
        ['Right Atrium', 'Receives oxygen-poor blood from the body via the superior and inferior vena cava. Thin-walled upper right chamber.'],
        ['Left Atrium', 'Receives oxygen-rich blood from the lungs via the pulmonary veins. Upper left chamber.'],
        ['Right Ventricle', 'Pumps blood to the lungs through the pulmonary artery for gas exchange.'],
        ['Left Ventricle', 'The strongest chamber; pumps oxygenated blood to the entire body via the aorta. Has the thickest walls.'],
        ['Aorta', 'The largest artery in the body, carrying oxygen-rich blood from the left ventricle to systemic circulation.'],
        ['Pulmonary Artery', 'Carries oxygen-poor blood from the right ventricle to the lungs for oxygenation.'],
        ['Vena Cava', 'The two largest veins (superior and inferior) returning deoxygenated blood from the body to the right atrium.']
      ]
    };
  },

  atom() {
    const g = new THREE.Group(), n = new THREE.Group(), el = [];
    g.add(n);
    for (let i = 0; i < 12; i++) {
      const a = i * 2.4, y = (i % 3 - 1) * .25;
      n.add(sph(.28, i % 2 ? 0xaaaaaa : 0xff4d5a, [Math.cos(a) * .35, y, Math.sin(a) * .35], i % 2 ? 1 : 0));
    }
    [[1.8, 2, .3], [3, 4, -.4]].forEach(([r, c, tilt]) => {
      const p = new THREE.Group(); p.rotation.x = tilt;
      const t = new THREE.Mesh(new THREE.TorusGeometry(r, .025, 8, 80), mat(0x6c7fe0));
      t.rotation.x = Math.PI / 2; t.userData.p = 3; p.add(t);
      for (let i = 0; i < c; i++) {
        const e = new THREE.Group(); e.rotation.y = i * Math.PI * 2 / c;
        e.add(sph(.14, 0x58e6ff, [r, 0, 0], 2)); p.add(e); el.push([e, r]);
      }
      g.add(p);
    });
    return {
      g, cam: 9,
      tick: t => el.forEach(([e, r]) => e.rotation.y += .02 / r * 2),
      parts: [
        ['Protons', 'Positively charged particles in the nucleus; their number (atomic number) defines the element. Carbon has 6 protons.'],
        ['Neutrons', 'Neutral particles in the nucleus that add mass and stabilise the nucleus through the strong nuclear force.'],
        ['Electrons', 'Tiny negative particles (~1/1836 the mass of a proton) orbiting the nucleus in quantised energy levels.'],
        ['Electron Shells', 'Energy levels around the nucleus. Carbon fills 2 electrons in the first shell (K) and 4 in the second (L).']
      ]
    };
  },

  shapes() {
    const g = new THREE.Group();
    const G = [new THREE.BoxGeometry(1.5, 1.5, 1.5), new THREE.TetrahedronGeometry(1.1), new THREE.OctahedronGeometry(1.1), new THREE.DodecahedronGeometry(1.1), new THREE.IcosahedronGeometry(1.1)];
    const C = [0x3b5bdb, 0xf97316, 0x16a34a, 0x7c3aed, 0xec4899];
    const ms = G.map((q, i) => {
      const m = new THREE.Mesh(q, mat(C[i])); m.userData.p = i;
      const a = i / 5 * Math.PI * 2;
      m.position.set(Math.cos(a) * 3, 0, Math.sin(a) * 3);
      g.add(m); return m;
    });
    return {
      g, cam: 11,
      tick: t => ms.forEach((m, i) => { m.rotation.x = t * .4 + i; m.rotation.y = t * .5; }),
      parts: [
        ['Cube', '6 square faces, 12 edges, 8 vertices. Volume = side³. Surface area = 6 × side².'],
        ['Tetrahedron', '4 equilateral triangular faces, 6 edges, 4 vertices — the simplest Platonic solid.'],
        ['Octahedron', '8 equilateral triangular faces, 12 edges, 6 vertices. Dual of the cube.'],
        ['Dodecahedron', '12 regular pentagonal faces, 30 edges, 20 vertices. Dual of the icosahedron.'],
        ['Icosahedron', '20 equilateral triangular faces, 30 edges, 12 vertices. Has the most faces of any Platonic solid.']
      ]
    };
  },

  dna() {
    const g = new THREE.Group();
    const bases = [0x3b82f6, 0xef4444, 0x22c55e, 0xfbbf24]; // A, T, G, C
    const steps = 30, radius = 1.5, height = 10;
    for (let i = 0; i < steps; i++) {
      const a = (i / steps) * Math.PI * 4;
      const y = (i / steps) * height - height / 2;
      // Two strands
      const s1 = sph(.18, 0x6d8cff, [Math.cos(a) * radius, y, Math.sin(a) * radius], 0);
      const s2 = sph(.18, 0xa78bfa, [Math.cos(a + Math.PI) * radius, y, Math.sin(a + Math.PI) * radius], 1);
      g.add(s1, s2);
      // Base pairs (rungs)
      if (i % 3 === 0) {
        const bc = bases[i % 4];
        const rung = cyl(.06, radius * 2, bc, [0, y, 0], 2);
        rung.rotation.z = Math.PI / 2;
        rung.rotation.y = a;
        g.add(rung);
      }
    }
    return {
      g, cam: 12,
      tick: t => { g.rotation.y = t * 0.3; },
      parts: [
        ['Sugar-Phosphate Backbone', 'The two helical strands of DNA are made of alternating deoxyribose sugar and phosphate groups, forming the structural framework.'],
        ['Complementary Strand', 'The second strand runs antiparallel (3\'→5\' opposite 5\'→3\') and contains complementary bases enabling replication.'],
        ['Base Pairs', 'Adenine pairs with Thymine (A-T, 2 hydrogen bonds) and Guanine pairs with Cytosine (G-C, 3 hydrogen bonds). The sequence encodes genetic information.']
      ]
    };
  },

  cell() {
    const g = new THREE.Group();
    // Cell membrane
    const membrane = new THREE.Mesh(new THREE.SphereGeometry(3, 32, 24), new THREE.MeshStandardMaterial({ color: 0x90cdf4, opacity: 0.25, transparent: true, roughness: 0.3 }));
    membrane.userData.p = 0; g.add(membrane);
    // Nucleus
    const nucleus = sph(1.2, 0x3b5bdb, [0, 0, 0], 1); g.add(nucleus);
    // Nucleolus
    g.add(sph(.4, 0x1e3a8a, [0.3, 0.2, 0], 2));
    // Mitochondria
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2, r = 2;
      const mt = new THREE.Mesh(new THREE.SphereGeometry(.35, 16, 12), mat(0xef4444));
      mt.scale.set(1.5, 0.8, 0.8);
      mt.position.set(Math.cos(a) * r, (i % 3 - 1) * .5, Math.sin(a) * r);
      mt.userData.p = 3; g.add(mt);
    }
    // ER
    const erMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, opacity: 0.5, transparent: true, roughness: 0.4 });
    for (let i = 0; i < 3; i++) {
      const er = new THREE.Mesh(new THREE.TorusGeometry(1.5 + i * .3, .08, 8, 40), erMat);
      er.rotation.x = Math.PI / 2 + i * .3; er.rotation.z = i * .5;
      er.userData.p = 4; g.add(er);
    }
    // Golgi
    for (let i = 0; i < 4; i++) {
      const golgi = new THREE.Mesh(new THREE.TorusGeometry(.6, .12, 8, 20), mat(0xfbbf24));
      golgi.position.set(-1.5, .8 + i * .25, 1);
      golgi.rotation.x = Math.PI / 2;
      golgi.userData.p = 5; g.add(golgi);
    }
    return {
      g, cam: 10,
      tick: t => { g.rotation.y = t * 0.1; },
      parts: [
        ['Cell Membrane', 'A phospholipid bilayer that controls what enters and exits the cell. Contains embedded proteins for transport and signalling.'],
        ['Nucleus', 'The control centre housing DNA organised in chromosomes. Surrounded by a double membrane (nuclear envelope) with pores.'],
        ['Nucleolus', 'A dense region inside the nucleus where ribosomal RNA (rRNA) is produced, essential for ribosome assembly.'],
        ['Mitochondria', 'The powerhouses of the cell. They produce ATP through cellular respiration: glucose + O₂ → CO₂ + H₂O + energy.'],
        ['Endoplasmic Reticulum', 'A network of membranes. Rough ER (with ribosomes) makes proteins; Smooth ER synthesises lipids and detoxifies.'],
        ['Golgi Apparatus', 'Stacks of flattened membranes that modify, sort, and package proteins and lipids for transport or secretion.']
      ]
    };
  },

  molecule() {
    const g = new THREE.Group();
    // Oxygen
    const O = sph(.8, 0xef4444, [0, 0, 0], 0);
    g.add(O);
    // Hydrogens
    const angle = 104.5 * Math.PI / 180;
    const bondLen = 1.8;
    const H1 = sph(.5, 0x94a3b8, [Math.cos(angle / 2) * bondLen, Math.sin(angle / 2) * bondLen, 0], 1);
    const H2 = sph(.5, 0x94a3b8, [Math.cos(-angle / 2) * bondLen, Math.sin(-angle / 2) * bondLen, 0], 1);
    g.add(H1, H2);
    // Bonds
    const bondMat = mat(0xd1d5db);
    const b1 = cyl(.08, bondLen, 0xd1d5db, [Math.cos(angle / 2) * bondLen / 2, Math.sin(angle / 2) * bondLen / 2, 0], 2, -angle / 2);
    const b2 = cyl(.08, bondLen, 0xd1d5db, [Math.cos(-angle / 2) * bondLen / 2, Math.sin(-angle / 2) * bondLen / 2, 0], 2, angle / 2);
    g.add(b1, b2);
    // Electron cloud (partial charges)
    const cloud = new THREE.Mesh(new THREE.SphereGeometry(1.5, 16, 12), new THREE.MeshStandardMaterial({ color: 0x60a5fa, opacity: 0.1, transparent: true }));
    cloud.userData.p = 3; g.add(cloud);
    return {
      g, cam: 7,
      tick: t => { g.rotation.y = t * 0.3; g.rotation.x = Math.sin(t * 0.5) * 0.1; },
      parts: [
        ['Oxygen Atom', 'The central oxygen atom is highly electronegative, pulling electron density toward itself, creating a partial negative charge (δ−).'],
        ['Hydrogen Atoms', 'Two hydrogen atoms bonded to oxygen at 104.5°. Each carries a partial positive charge (δ+) due to electron sharing.'],
        ['Covalent Bonds', 'Two O-H bonds share electron pairs. Bond length is ~96 pm. The bent shape is due to two lone pairs on oxygen.'],
        ['Electron Cloud', 'The asymmetric electron distribution makes water a polar molecule, enabling hydrogen bonding and its unique properties.']
      ]
    };
  },

  emfield() {
    const g = new THREE.Group();
    // Electric field lines (radial from center)
    const lineMat = new THREE.LineBasicMaterial({ color: 0x3b82f6 });
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const pts = [];
      for (let r = 0.5; r < 4; r += 0.3) {
        pts.push(new THREE.Vector3(Math.cos(angle) * r, 0, Math.sin(angle) * r));
      }
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat);
      line.userData.p = 0;
      g.add(line);
    }
    // Positive charge
    g.add(sph(.4, 0xef4444, [0, 0, 0], 1));
    // Magnetic field loops
    const magMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, opacity: 0.4, transparent: true, roughness: 0.3 });
    for (let i = 0; i < 4; i++) {
      const torus = new THREE.Mesh(new THREE.TorusGeometry(2 + i * .5, .04, 8, 50), magMat);
      torus.rotation.y = (i / 4) * Math.PI;
      torus.userData.p = 2;
      g.add(torus);
    }
    // Electromagnetic wave visualization
    const wavePts = [];
    const wavePts2 = [];
    for (let x = -5; x < 5; x += 0.2) {
      wavePts.push(new THREE.Vector3(x, Math.sin(x * 2) * 1.5, 0));
      wavePts2.push(new THREE.Vector3(x, 0, Math.sin(x * 2) * 1.5));
    }
    const wave1 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(wavePts), new THREE.LineBasicMaterial({ color: 0x3b82f6 }));
    const wave2 = new THREE.Line(new THREE.BufferGeometry().setFromPoints(wavePts2), new THREE.LineBasicMaterial({ color: 0xef4444 }));
    wave1.position.y = 3; wave2.position.y = 3;
    wave1.userData.p = 3; wave2.userData.p = 3;
    g.add(wave1, wave2);
    return {
      g, cam: 12,
      tick: t => { g.rotation.y = t * 0.15; },
      parts: [
        ['Electric Field Lines', 'Field lines radiate outward from positive charges and inward toward negative charges. Density indicates field strength.'],
        ['Point Charge', 'A positive charge creates an electric field E = kQ/r² in all directions. The field does work on other charges.'],
        ['Magnetic Field Loops', 'Magnetic field lines form closed loops. A current-carrying wire creates circular magnetic field lines around it (Ampère\'s law).'],
        ['EM Wave', 'Oscillating perpendicular electric (blue) and magnetic (red) fields propagate at c ≈ 3×10⁸ m/s. They carry energy without a medium.']
      ]
    };
  }
};

let sel = 0;

V.learn = () => {
  const M = MODELS[cur3]();
  return `<h1 class="section-title">Interactive 3D Learning</h1>
    <p class="section-subtitle">Drag to rotate, scroll to zoom, click a component to learn about it.</p>

    <div class="flex flex-wrap gap-2 mt-4" role="group" aria-label="Choose topic">
      ${Object.keys(MT).map(k => `<button class="btn ${k === cur3 ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="cur3='${k}';go()">${MT[k]}</button>`).join('')}
    </div>

    <div style="display:grid;grid-template-columns:2fr 1fr;gap:16px" class="mt-4 learn-grid">
      <div>
        <div id="cv" class="viewer-container" aria-label="3D model viewer"></div>
        <div class="viewer-controls">
          <button class="btn btn-secondary btn-sm" onclick="zoom(-1)" aria-label="Zoom in">＋ Zoom</button>
          <button class="btn btn-secondary btn-sm" onclick="zoom(1)" aria-label="Zoom out">− Zoom</button>
          <button id="au" class="btn btn-secondary btn-sm active" onclick="R3&&(R3.auto=!R3.auto,this.classList.toggle('active'))">Auto-rotate</button>
          <button id="wf" class="btn btn-secondary btn-sm" onclick="toggleWireframe()">Wireframe</button>
          <button class="btn btn-secondary btn-sm" onclick="cycleSpeed()">Speed: <span id="speedVal">1x</span></button>
          <button class="btn btn-secondary btn-sm" onclick="R3&&(R3.root.rotation.set(0,0,0))">Reset View</button>
        </div>
      </div>

      <div>
        <div class="card">
          <h2 class="font-bold">${MT[cur3]}</h2>
          <div id="info" class="info-panel mt-3">Select a component below to inspect its scientific definition and functioning.</div>
          <div class="flex flex-wrap gap-2 mt-3" id="parts">
            ${M.parts.map((p, i) => `<button class="part-btn" data-i="${i}" onclick="pick(${i})">${p[0]}</button>`).join('')}
          </div>
          <button id="mk" class="btn btn-primary btn-sm mt-4 w-full" ${S.done.includes(MT[cur3]) ? 'disabled' : ''} onclick="complete('${MT[cur3]}')">
            ${S.done.includes(MT[cur3]) ? '✓ Completed' : 'Mark Topic Complete (+20)'}
          </button>
        </div>
      </div>
    </div>`;
};

function toggleWireframe() {
  if (!R3) return;
  R3.wireframe = !R3.wireframe;
  R3.root.traverse(o => {
    if (o.isMesh && o.material) {
      if (Array.isArray(o.material)) o.material.forEach(m => m.wireframe = R3.wireframe);
      else o.material.wireframe = R3.wireframe;
    }
  });
  const btn = $('#wf');
  if (btn) btn.classList.toggle('active', R3.wireframe);
}

function cycleSpeed() {
  if (!R3) return;
  const speeds = [0.5, 1.0, 1.5, 2.0];
  const curIdx = speeds.indexOf(R3.speed || 1.0);
  R3.speed = speeds[(curIdx + 1) % speeds.length];
  const spVal = $('#speedVal');
  if (spVal) spVal.textContent = R3.speed + 'x';
}

function pick(i) {
  sel = i;
  const P = (R3 ? R3.M : MODELS[cur3]()).parts[i];
  const infoEl = $('#info');
  if (infoEl) {
    infoEl.innerHTML = `<div class="edu-card">
      <div class="edu-heading">${esc(P[0])}</div>
      <p class="edu-step">${esc(P[1])}</p>
      <div class="takeaway-box mt-2">
        <b>💡 Key Takeaway:</b> ${esc(P[0])} is an essential component of the ${esc(MT[cur3])} model. Ask the floating AI Tutor anytime to delve deeper!
      </div>
    </div>`;
  }
  $$('#parts button').forEach(b => b.classList.toggle('active', +b.dataset.i === i));
  if (R3) R3.root.traverse(o => {
    if (o.isMesh && o.userData.p !== undefined)
      o.material.emissive.setHex(o.userData.p === i ? 0x3355aa : (o.userData.p === 0 && cur3 === 'solar' ? 0x553300 : 0));
  });
}

function zoom(d) {
  if (R3) R3.cam.position.z = Math.min(30, Math.max(3, R3.cam.position.z * (d > 0 ? 1.15 : .87)));
}

function init3d() {
  stop3d();
  const box = $('#cv');
  sel = 0;
  let r;
  try {
    const c = document.createElement('canvas');
    if (!(c.getContext('webgl') || c.getContext('experimental-webgl'))) throw 0;
    if (typeof THREE === 'undefined') throw 0;
    r = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  } catch (e) {
    box.innerHTML = `<div style="padding:32px;text-align:center">
      <b>2D Fallback Mode</b>
      <p class="text-secondary text-sm mt-2">3D rendering isn't available on this device. Use the part buttons on the right to read about each component of ${MT[cur3]}.</p>
    </div>`;
    return;
  }

  const M = MODELS[cur3]();
  const w = box.clientWidth, h = box.clientHeight || 400;
  r.setSize(w, h);
  r.setPixelRatio(Math.min(devicePixelRatio, 2));

  // Set background based on theme
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  r.setClearColor(isDark ? 0x0a0f1f : 0xf0f4f8, 1);

  box.appendChild(r.domElement);
  r.domElement.style.display = 'block';

  const sc = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(45, w / h, .1, 100);
  cam.position.z = M.cam;
  sc.add(new THREE.AmbientLight(0xffffff, .6));
  const dl = new THREE.DirectionalLight(0xffffff, .9);
  dl.position.set(5, 8, 6);
  sc.add(dl);
  sc.add(new THREE.PointLight(0xffffff, .5, 0));

  const root = new THREE.Group();
  root.add(M.g);
  sc.add(root);
  if (cur3 === 'solar') root.rotation.x = .5;

  const rs = () => {
    const w2 = box.clientWidth;
    r.setSize(w2, h);
    cam.aspect = w2 / h;
    cam.updateProjectionMatrix();
  };
  addEventListener('resize', rs);

  R3 = { r, cam, root, M, auto: true, raf: 0, rs };
  let down = null, moved = 0, t0 = performance.now();
  const cv = r.domElement;

  cv.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; moved = 0; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    if (!down) return;
    const dx = e.clientX - down[0], dy = e.clientY - down[1];
    moved += Math.abs(dx) + Math.abs(dy);
    root.rotation.y += dx * .01;
    root.rotation.x = Math.max(-1.5, Math.min(1.5, root.rotation.x + dy * .01));
    down = [e.clientX, e.clientY];
  });
  cv.addEventListener('pointerup', e => {
    down = null;
    if (moved < 5) {
      const b = cv.getBoundingClientRect();
      const rc = new THREE.Raycaster();
      rc.setFromCamera(new THREE.Vector2((e.clientX - b.left) / b.width * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1), cam);
      const hit = rc.intersectObject(root, true).find(x => x.object.userData.p !== undefined);
      if (hit) pick(hit.object.userData.p);
    }
  });
  cv.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY); }, { passive: false });

  const loop = () => {
    R3.raf = requestAnimationFrame(loop);
    const t = (performance.now() - t0) / 1000;
    M.tick(t);
    if (R3.auto && !down) root.rotation.y += .004;
    r.render(sc, cam);
  };
  loop();
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW: DEMO TUTOR
// ═══════════════════════════════════════════════════════════════════════════
const TUT = [
  { k: ['pythag', 'triangle', 'hypotenuse'], b: 'In a right-angled triangle, the longest side (the hypotenuse) c follows a² + b² = c². Example: sides 3 and 4 give 9 + 16 = 25, so c = 5.', i: 'The theorem relates the squares of the legs to the square of the hypotenuse. It generalises to the distance formula d = √((x₂−x₁)² + (y₂−y₁)²) and to the law of cosines when the angle isn\'t 90°.', f: ['What is a derivative?', 'Explain Ohm\'s law'] },
  { k: ['derivative', 'calculus', 'slope'], b: 'A derivative tells you how fast something is changing — like the slope of a hill at one spot. For y = x², the slope at any x is 2x.', i: 'The derivative f′(x) = lim(h→0) [f(x+h) − f(x)]/h. Power rule: d/dx xⁿ = n·xⁿ⁻¹. It gives instantaneous rate of change and the tangent slope.', f: ['Explain the Pythagorean theorem', 'Explain Newton\'s laws'] },
  { k: ['newton', 'force', 'motion', 'inertia'], b: 'Newton\'s 3 laws: (1) things keep doing what they\'re doing unless a force acts; (2) a bigger force gives bigger acceleration, F = ma; (3) every action has an equal and opposite reaction.', i: 'First law defines inertial frames; second law F = dp/dt (= ma for constant mass); third law says forces come in equal, opposite pairs acting on different bodies. A 2 kg mass under 10 N accelerates at 5 m/s².', f: ['Explain Ohm\'s law', 'What is an atom?'] },
  { k: ['ohm', 'voltage', 'current', 'resistance', 'circuit'], b: 'Ohm\'s law: current = voltage ÷ resistance, I = V/R. More voltage pushes more current; more resistance lets less current through. Try it in the Science Lab!', i: 'V = IR holds for ohmic conductors, where resistance is constant. Power dissipated is P = VI = I²R = V²/R. Real components (diodes, bulbs) deviate because R changes with conditions.', f: ['Explain Newton\'s laws', 'What is a chemical bond?'] },
  { k: ['atom', 'proton', 'electron', 'neutron'], b: 'An atom has a nucleus with protons (+) and neutrons (neutral), with tiny electrons (−) around it. The number of protons decides which element it is.', i: 'Electrons occupy quantised energy levels. Atomic number Z = protons; mass number A = protons + neutrons. Isotopes share Z but differ in neutrons. See the Atom Structure 3D model.', f: ['What is a chemical bond?', 'Explain an algorithm'] },
  { k: ['bond', 'chemical', 'molecule', 'chemistry', 'h2o', 'ionic', 'covalent'], b: 'A chemical bond holds atoms together. In water (H₂O), oxygen shares electrons with two hydrogens — that\'s a covalent bond. In salt, one atom gives an electron to another — an ionic bond.', i: 'Covalent bonds share electron pairs (electronegativity difference small); ionic bonds transfer electrons forming oppositely charged ions held by electrostatic attraction. Octet rule explains many bonding patterns.', f: ['What is an atom?', 'Explain an algorithm'] },
  { k: ['algorithm', 'variable', 'code', 'program', 'computer', 'loop', 'binary'], b: 'An algorithm is a step-by-step recipe for solving a problem. A variable stores a value, and a loop repeats steps. Computers store everything in binary — 5 is 101.', i: 'Algorithms are judged by correctness and efficiency (time and memory, e.g. O(n) vs O(n²)). Variables bind names to values, loops iterate, and functions package reusable logic. Binary place values: 101₂ = 4 + 0 + 1.', f: ['Explain the Pythagorean theorem', 'What is a derivative?'] },
  { k: ['gravity', 'gravitational', 'weight', 'mass'], b: 'Gravity is the force that pulls objects toward each other. On Earth, objects accelerate downward at about 9.8 m/s². Your weight is your mass times g: W = mg.', i: 'Newton\'s law of gravitation: F = Gm₁m₂/r². G ≈ 6.674 × 10⁻¹¹ N·m²/kg². Weight varies by location (g_moon ≈ 1.6 m/s²), but mass is constant. General relativity describes gravity as spacetime curvature.', f: ['Explain Newton\'s laws', 'What is energy?'] },
  { k: ['energy', 'kinetic', 'potential', 'conservation'], b: 'Energy is the ability to do work. Kinetic energy is motion energy (KE = ½mv²). Potential energy is stored energy (PE = mgh for gravity). Energy can change forms but is never created or destroyed.', i: 'Conservation of energy: total energy in a closed system is constant. KE = ½mv², gravitational PE = mgh, elastic PE = ½kx². Power = energy/time. First law of thermodynamics formalises conservation.', f: ['Explain gravity', 'Explain Newton\'s laws'] },
  { k: ['dna', 'gene', 'genetic', 'heredity', 'chromosome'], b: 'DNA is a molecule that stores genetic instructions. It\'s shaped like a twisted ladder (double helix). Genes are sections of DNA that code for proteins, which do most of the work in your cells.', i: 'DNA uses four bases: Adenine-Thymine and Guanine-Cytosine pairs. Replication is semi-conservative. Transcription makes mRNA, translation makes proteins. Mutations are changes in the base sequence that can alter protein function.', f: ['What is an atom?', 'Explain cell biology'] },
  { k: ['cell', 'mitochondria', 'organelle', 'nucleus', 'biology'], b: 'Cells are the basic units of life. Animal cells have a nucleus (control centre), mitochondria (energy), ribosomes (make proteins), and a cell membrane (outer barrier).', i: 'Eukaryotic cells have membrane-bound organelles. The nucleus contains DNA. Mitochondria have their own DNA. The endomembrane system (ER, Golgi, vesicles) processes proteins. Cell division: mitosis (growth) and meiosis (gametes).', f: ['Explain DNA', 'What is a chemical bond?'] },
  { k: ['wave', 'frequency', 'wavelength', 'sound', 'light'], b: 'A wave carries energy without moving matter. Waves have frequency (how often), wavelength (how long), and amplitude (how big). Sound waves need a medium; light waves don\'t.', i: 'v = fλ. Sound: longitudinal, ~343 m/s in air. Light: transverse EM wave, c ≈ 3×10⁸ m/s. Interference, diffraction, and resonance are key wave phenomena. The Doppler effect shifts frequency with relative motion.', f: ['Explain energy', 'What is an atom?'] },
];

const SAMPLE = [
  'Explain the Pythagorean theorem', 'What is a derivative?', 'Explain Newton\'s laws',
  'Explain Ohm\'s law', 'What is an atom?', 'What is a chemical bond?', 'Explain an algorithm',
  'Explain gravity', 'What is energy?', 'Explain DNA', 'What are waves?'
];

let CH = [], LV = 'b', isAsking = false;

function formatAiText(raw) {
  if (!raw) return '';
  let s = esc(raw);
  // Bold: **text**
  s = s.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // Italic: *text*
  s = s.replace(/(^|[^*])\*(?!\*)(.*?)\*/g, '$1<em>$2</em>');
  // Headers: ### text
  s = s.replace(/^###\s+(.+)$/gm, '<h4 style="font-weight:700;margin:8px 0 4px;color:var(--accent-primary)">$1</h4>');
  s = s.replace(/^##\s+(.+)$/gm, '<h3 style="font-weight:700;margin:10px 0 6px;color:var(--text-primary)">$1</h3>');
  // Bullet items
  s = s.replace(/(?:^|\n)[*-]\s+(.+)/g, '<div style="display:flex;gap:6px;margin:3px 0"><span style="color:var(--accent-primary)">•</span><div>$1</div></div>');
  // Double linebreaks to paragraphs
  s = s.replace(/\n\n/g, '<div style="height:8px"></div>');
  // Single linebreaks
  s = s.replace(/\n/g, '<br>');
  return s;
}

function parseFollowUps(text) {
  if (!text) return [];
  const lines = text.split('\n');
  const questions = [];
  let capture = false;
  for (const line of lines) {
    if (/follow-up questions|suggested follow-ups|questions to explore/i.test(line)) {
      capture = true;
      continue;
    }
    if (capture) {
      const clean = line.replace(/^[\s*-•\d.)\]]+/, '').trim();
      if (clean && clean.length > 5 && clean.length < 100) {
        questions.push(clean);
      }
    }
  }
  return questions.slice(0, 4);
}

V.tutor = () => `<div class="flex items-center justify-between flex-wrap gap-3">
    <div>
      <h1 class="section-title">AI Tutor Agent</h1>
      <p class="section-subtitle">
        ${aiConfigured
          ? '<span style="color:var(--success);font-weight:700">● Gemini AI Active</span> — Powered by Google Gemini 1.5 Flash. Ask any STEM question!'
          : '<span style="color:var(--accent-primary);font-weight:700">⚡ AI Learning Assistant</span> — Personalized help for Physics, Chemistry, Biology, Math & CS.'}
      </p>
    </div>
    <div class="flex items-center gap-2">
      <span class="chip" style="background:var(--accent-soft);color:var(--accent-primary);font-weight:700;border:1px solid var(--accent-primary)">🤖 Google Gemini</span>
    </div>
  </div>

  <div class="flex flex-wrap gap-3 items-center mt-4">
    <span class="text-sm text-secondary font-semibold">Audience Level:</span>
    <button id="lb" class="btn ${LV === 'b' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="setLv('b')">Beginner (Intuitive & Clear)</button>
    <button id="li" class="btn ${LV === 'i' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="setLv('i')">Intermediate (In-Depth & Math)</button>
    <button class="btn btn-secondary btn-sm ml-auto" onclick="CH=[];drawChat()">Clear Chat</button>
  </div>

  <div class="card mt-3">
    <div id="chat" class="chat-container" aria-live="polite"></div>
    <div id="sug" class="suggestions-row"></div>
    <div class="chat-input-row">
      <input id="q" type="text" class="input" placeholder="Ask anything about physics, chemistry, biology, maths, or computer science…" aria-label="Your question" onkeydown="event.key==='Enter'&&ask()">
      <button id="send-btn" class="btn btn-primary flex items-center gap-2" onclick="ask()">
        <span>Send</span>
      </button>
    </div>
  </div>

  <div class="card mt-4">
    <h3 class="font-bold mb-2">💡 Tips for Getting Great Answers</h3>
    <div class="grid-3 mt-3">
      <div class="info-panel">
        <b>🔬 Science Experiments</b>
        Ask why Ohm's Law behaves the way it does in the Science Lab, or how projectile velocity decomposes into components.
      </div>
      <div class="info-panel">
        <b>📐 Step-by-Step Derivations</b>
        Ask for step-by-step math breakdowns, Pythagorean proofs, or calculus chain rule explanations.
      </div>
      <div class="info-panel">
        <b>🧬 Biology & Molecules</b>
        Inquire about DNA replication, ATP production in mitochondria, or atomic electron configurations.
      </div>
    </div>
  </div>`;

function setLv(l) {
  LV = l;
  const lb = $('#lb');
  const li = $('#li');
  if (lb) lb.className = `btn ${l === 'b' ? 'btn-primary' : 'btn-secondary'} btn-sm`;
  if (li) li.className = `btn ${l === 'i' ? 'btn-primary' : 'btn-secondary'} btn-sm`;
}

function drawChat() {
  const c = $('#chat');
  if (!c) return;
  c.innerHTML = CH.length
    ? CH.map(m => {
        const body = m.html ? formatAiText(m.x) : esc(m.x);
        const badge = (m.r === 't' && m.provider)
          ? `<div class="text-xs mb-1" style="font-weight:700;letter-spacing:0.02em;color:${m.isDemo ? 'var(--text-muted)' : 'var(--success)'}">${m.isDemo ? '📋 ' + esc(m.provider) : '✨ ' + esc(m.provider)}</div>`
          : '';
        return `<div class="chat-msg ${m.r === 'u' ? 'chat-user' : 'chat-tutor'}">${badge}${body}</div>`;
      }).join('')
    : '<p class="text-muted text-sm">Welcome to your AI Tutor! Type any question above or choose a suggested topic below.</p>';
  c.scrollTop = c.scrollHeight;
  const last = CH[CH.length - 1];
  const fl = last && last.f && last.f.length ? last.f : SAMPLE.slice(0, 5);
  const sug = $('#sug');
  if (sug) {
    sug.innerHTML = fl.map(s => `<button class="btn btn-secondary btn-sm" onclick="ask(this.textContent)">${esc(s)}</button>`).join('');
  }
}

async function ask(t) {
  if (isAsking) return;
  const i = $('#q');
  t = (t || (i ? i.value : '')).trim();
  if (!t) return;
  if (i) i.value = '';

  // Add user prompt to chat
  CH.push({ r: 'u', x: t });
  act('Asked AI Tutor: ' + t.slice(0, 50));
  save();
  drawChat();

  const c = $('#chat');
  const sendBtn = $('#send-btn');
  if (sendBtn) sendBtn.disabled = true;
  isAsking = true;

  // Add loading indicator bubble
  const loader = document.createElement('div');
  loader.className = 'chat-msg chat-tutor flex items-center gap-2';
  loader.id = 'chat-loader';
  loader.innerHTML = `<span class="animate-pulse" style="display:inline-flex;align-items:center;gap:6px">
    <span>${aiConfigured ? '✨ Gemini AI is generating response...' : '⚡ AI Assistant is retrieving answer...'}</span>
  </span>`;
  if (c) {
    c.appendChild(loader);
    c.scrollTop = c.scrollHeight;
  }

  try {
    const res = await fetch(API + '/api/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: t,
        level: LV,
        history: CH.slice(-6)
      }),
      signal: AbortSignal.timeout(25000)
    });

    const data = await res.json();
    if (res.ok && data.reply) {
      const followUps = parseFollowUps(data.reply);
      CH.push({
        r: 't',
        x: data.reply,
        html: true,
        isDemo: Boolean(data.isDemo),
        provider: data.provider || (aiConfigured ? 'Google Gemini 1.5 Flash' : 'Predefined Demo Responses'),
        f: followUps.length ? followUps : SAMPLE.slice(0, 4)
      });
    } else {
      fallbackAsk(t);
    }
  } catch (err) {
    console.warn('AI chat error, using pattern-matcher:', err);
    fallbackAsk(t);
  } finally {
    isAsking = false;
    if (sendBtn) sendBtn.disabled = false;
    save();
    drawChat();
  }
}

function fallbackAsk(t) {
  const l = t.toLowerCase();
  const h = TUT.find(e => e.k.some(k => l.includes(k)));
  CH.push(h
    ? { r: 't', x: (LV === 'b' ? '[Beginner] ' : '[Intermediate] ') + h[LV], f: h.f, isDemo: true, provider: 'Predefined Demo Responses' }
    : { r: 't', x: 'I am currently in Demo Mode. You can ask about introductory concepts like Ohm\'s law, Newton\'s laws, atoms, derivatives, or algorithms!', f: SAMPLE.slice(0, 5), isDemo: true, provider: 'Predefined Demo Responses' }
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW: SCIENCE LAB
// ═══════════════════════════════════════════════════════════════════════════
const LAB = { v: 9, r: 100, on: true };
let currentExperiment = 'circuit';

V.lab = () => `<h1 class="section-title">Virtual Science Lab</h1>
  <p class="section-subtitle">Interactive experiments with real-time calculations and visualizations</p>

  <div class="experiment-tabs mt-4 flex flex-wrap gap-2">
    <button class="btn ${currentExperiment === 'circuit' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="currentExperiment='circuit';go()">⚡ Circuit Lab</button>
    <button class="btn ${currentExperiment === 'projectile' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="currentExperiment='projectile';go()">🎯 Projectile Motion</button>
    <button class="btn ${currentExperiment === 'pendulum' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="currentExperiment='pendulum';go()">🕐 Pendulum</button>
    <button class="btn ${currentExperiment === 'wave' ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="currentExperiment='wave';go()">🌊 Wave Simulator</button>
  </div>

  <div id="lab-content" class="mt-4"></div>`;

function renderCircuitLab() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const wireColor = isDark ? '#6d8cff' : '#3b5bdb';
  const textColor = isDark ? '#a3b1cc' : '#475569';
  const bgColor = isDark ? '#131b2e' : '#f5f7fb';
  const compBg = isDark ? '#1a2340' : '#e2e8f0';

  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px" class="lab-grid">
    <div class="card">
      <h3 class="font-bold mb-3">⚡ Circuit Diagram</h3>
      <svg id="svg" viewBox="0 0 400 220" class="circuit-svg" role="img" aria-label="Circuit diagram">
        <rect width="400" height="220" fill="${bgColor}" rx="8"/>
        <path id="wire" d="M60 40H340V180H60Z" fill="none" stroke="${wireColor}" stroke-width="3.5" stroke-dasharray="6 8" class="flow-anim"/>
        <!-- Battery -->
        <rect x="40" y="88" width="40" height="44" fill="${compBg}" rx="4"/>
        <line x1="48" y1="100" x2="72" y2="100" stroke="${textColor}" stroke-width="3"/>
        <line x1="54" y1="118" x2="66" y2="118" stroke="${textColor}" stroke-width="2"/>
        <text x="86" y="115" fill="${textColor}" font-size="12" font-weight="600" id="tv">9 V</text>
        <!-- Resistor -->
        <rect x="155" y="26" width="90" height="28" fill="${compBg}" rx="4"/>
        <polyline points="160,40 172,40 177,30 187,50 197,30 207,50 217,30 223,40 240,40" fill="none" stroke="#f59e0b" stroke-width="2.5"/>
        <text x="168" y="20" fill="${textColor}" font-size="12" font-weight="600" id="tr">100 Ω</text>
        <!-- Bulb -->
        <circle id="bulb" cx="340" cy="110" r="22" fill="#fde047" fill-opacity=".08" stroke="#f59e0b" stroke-width="2.5"/>
        <text x="312" y="148" fill="${textColor}" font-size="11">Bulb</text>
        <!-- Switch -->
        <rect x="155" y="166" width="90" height="28" fill="${compBg}" rx="4"/>
        <line id="sw" x1="165" y1="180" x2="235" y2="180" stroke="${textColor}" stroke-width="3"/>
        <circle cx="165" cy="180" r="4" fill="${textColor}"/>
        <circle cx="235" cy="180" r="4" fill="${textColor}"/>
      </svg>

      <div class="readings-grid">
        <div class="reading-card"><div class="reading-label">Voltage</div><div class="reading-value" id="rv"></div></div>
        <div class="reading-card"><div class="reading-label">Current</div><div class="reading-value" id="ri">—</div></div>
        <div class="reading-card"><div class="reading-label">Resistance</div><div class="reading-value" id="rr"></div></div>
        <div class="reading-card"><div class="reading-label">Power</div><div class="reading-value" id="rp">—</div></div>
      </div>
      <p id="lm" class="text-sm mt-3" role="status"></p>
    </div>

    <div class="card" style="display:flex;flex-direction:column;gap:20px">
      <div>
        <label for="sv" class="font-semibold text-sm">Voltage: <span id="lv"></span> V</label>
        <input id="sv" type="range" min="0" max="24" step="0.5" value="${LAB.v}" oninput="LAB.v=+this.value;labUpd()" class="mt-2">
      </div>
      <div>
        <label for="sr" class="font-semibold text-sm">Resistance: <span id="lr"></span> Ω</label>
        <input id="sr" type="range" min="0" max="1000" step="10" value="${LAB.r}" oninput="LAB.r=+this.value;labUpd()" class="mt-2">
      </div>
      <button id="so" class="btn btn-primary" onclick="LAB.on=!LAB.on;labUpd()" aria-pressed="true">Switch: ON</button>

      <div class="card-accent" style="padding:16px;background:var(--bg-tertiary);border-radius:var(--radius-md)">
        <h4 class="font-bold text-sm">📐 Ohm's Law</h4>
        <p class="text-sm text-secondary mt-2">Current equals voltage divided by resistance: <b>I = V ÷ R</b></p>
        <p class="text-xs text-muted mt-2">Volts (V) push charge, ohms (Ω) resist it, and the result is measured in amperes (A). Power dissipated: P = V × I.</p>
      </div>

      <div>
        <h4 class="font-bold text-sm mb-2">Presets</h4>
        <div class="flex flex-wrap gap-2">
          <button class="btn btn-secondary btn-sm" onclick="LAB.v=1.5;LAB.r=100;labUpd();updateSliders()">AA Battery</button>
          <button class="btn btn-secondary btn-sm" onclick="LAB.v=9;LAB.r=470;labUpd();updateSliders()">9V + 470Ω</button>
          <button class="btn btn-secondary btn-sm" onclick="LAB.v=12;LAB.r=220;labUpd();updateSliders()">12V LED</button>
          <button class="btn btn-secondary btn-sm" onclick="LAB.v=5;LAB.r=1000;labUpd();updateSliders()">USB + 1kΩ</button>
        </div>
      </div>

      <button id="mk" class="btn btn-secondary btn-sm" ${S.done.includes('Circuit Lab') ? 'disabled' : ''} onclick="complete('Circuit Lab')">
        ${S.done.includes('Circuit Lab') ? '✓ Completed' : 'Mark Circuit Lab Complete (+20)'}
      </button>
    </div>
  </div>`;
}

function updateSliders() {
  const sv = $('#sv'), sr = $('#sr');
  if (sv) sv.value = LAB.v;
  if (sr) sr.value = LAB.r;
}

function labUpd() {
  const { v, r, on } = LAB;
  let I = 0, ok = true, m = '';
  if (!on) m = 'Switch is OFF — no current flows.';
  else if (r <= 0) { ok = false; m = '⚠ Resistance is 0 Ω: short circuit! Current cannot be calculated safely.'; }
  else I = v / r;
  if (ok && !Number.isFinite(I)) { I = 0; ok = false; }

  const f = x => x < 1 ? (x * 1000).toFixed(1) + ' mA' : x.toFixed(2) + ' A';
  const run = on && ok && I > 0;

  const lv = $('#lv'), lr = $('#lr'), tv = $('#tv'), tr = $('#tr'), rv = $('#rv'), rr = $('#rr');
  if (lv) lv.textContent = v;
  if (lr) lr.textContent = r;
  if (tv) tv.textContent = v + ' V';
  if (tr) tr.textContent = r + ' Ω';
  if (rv) rv.textContent = v.toFixed(1) + ' V';
  if (rr) rr.textContent = r + ' Ω';

  const ri = $('#ri'), rp = $('#rp');
  if (ri) ri.textContent = ok ? f(I) : 'Undefined';
  if (rp) rp.textContent = ok ? (v * I < 1 ? (v * I * 1000).toFixed(1) + ' mW' : (v * I).toFixed(2) + ' W') : '—';

  if (ok && on) m = I > 0 ? `I = ${v} V ÷ ${r} Ω = ${f(I)}` : 'Voltage is 0 V — no current flows.';
  const lm = $('#lm');
  if (lm) { lm.textContent = m; lm.style.color = ok ? 'var(--text-secondary)' : 'var(--warning)'; }

  const w = $('#wire');
  if (w) {
    w.classList.toggle('flow-anim', run);
    w.style.setProperty('--flow-speed', Math.max(.25, Math.min(3, .3 / Math.max(I, .01) * .3 + .25)) + 's');
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    w.setAttribute('stroke', run ? (isDark ? '#60a5fa' : '#3b5bdb') : (isDark ? '#4a5590' : '#94a3b8'));
  }
  const bulb = $('#bulb');
  if (bulb) bulb.setAttribute('fill-opacity', run ? Math.min(1, .15 + I * 8) : .08);
  const sw = $('#sw');
  if (sw) sw.setAttribute('y2', on ? 180 : 150);
  const so = $('#so');
  if (so) { so.textContent = 'Switch: ' + (on ? 'ON' : 'OFF'); so.setAttribute('aria-pressed', on); }
}

// ─── Projectile Motion ──────────────────────────────────────────────────────
let projAnim = null;
let projGravity = 9.8;

function renderProjectileLab() {
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px" class="lab-grid">
    <div class="card">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-bold">🎯 Projectile Motion Simulator</h3>
        <span class="chip" style="font-size:0.75rem">Newtonian Mechanics</span>
      </div>
      <canvas id="projCanvas" class="experiment-canvas" width="600" height="260"></canvas>
      <div class="sim-control-row mt-3">
        <div class="sim-control-group">
          <label class="text-xs font-semibold">Launch Speed: <span id="projV">20</span> m/s</label>
          <input type="range" min="5" max="50" value="20" id="projVel" oninput="$('#projV').textContent=this.value">
        </div>
        <div class="sim-control-group">
          <label class="text-xs font-semibold">Launch Angle: <span id="projA">45</span>°</label>
          <input type="range" min="10" max="85" value="45" id="projAng" oninput="$('#projA').textContent=this.value">
        </div>
        <div class="sim-control-group">
          <label class="text-xs font-semibold">Gravity Environment:</label>
          <select id="projGravSelect" class="input" style="padding:4px 8px;font-size:0.8rem" onchange="projGravity=+this.value;fireProjectile()">
            <option value="9.8">Earth (g = 9.80 m/s²)</option>
            <option value="1.62">Moon (g = 1.62 m/s²)</option>
            <option value="3.72">Mars (g = 3.72 m/s²)</option>
          </select>
        </div>
      </div>
      <div class="flex gap-2 mt-3">
        <button class="btn btn-primary btn-sm flex-1" onclick="fireProjectile()">🚀 Launch Projectile</button>
        <button class="btn btn-secondary btn-sm" onclick="clearProjectile()">↺ Reset</button>
      </div>
    </div>
    <div class="card">
      <h4 class="font-bold mb-2">Theoretical Kinematics</h4>
      <div class="info-panel">
        <div class="formula-box mb-2">
          <b>Horizontal:</b> <code>x(t) = v₀ · cos(θ) · t</code> (constant velocity)
        </div>
        <div class="formula-box mb-2">
          <b>Vertical:</b> <code>y(t) = v₀ · sin(θ) · t − ½ · g · t²</code> (gravitational acceleration)
        </div>
        <div class="formula-box">
          <b>Range:</b> <code>R = (v₀² · sin(2θ)) ÷ g</code> (maximum at θ = 45°)
        </div>
      </div>
      <div class="mt-4">
        <h4 class="font-bold text-sm mb-2">Calculated Results & Telemetry</h4>
        <div id="projResults" class="grid-2">
          <div class="reading-card"><div class="reading-label">Total Range (R)</div><div class="reading-value" id="projRange">—</div></div>
          <div class="reading-card"><div class="reading-label">Apex Height (H_max)</div><div class="reading-value" id="projHeight">—</div></div>
          <div class="reading-card"><div class="reading-label">Flight Duration (t)</div><div class="reading-value" id="projTime">—</div></div>
          <div class="reading-card"><div class="reading-label">Impact Velocity</div><div class="reading-value" id="projImpact">—</div></div>
        </div>
      </div>
    </div>
  </div>`;
}

function fireProjectile() {
  if (projAnim) cancelAnimationFrame(projAnim);
  const canvas = $('#projCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const v0 = Math.max(1, +($('#projVel') ? $('#projVel').value : 20));
  const angleDeg = Math.min(89, Math.max(5, +($('#projAng') ? $('#projAng').value : 45)));
  const angle = angleDeg * Math.PI / 180;
  const g = projGravity || 9.8;

  const vx = v0 * Math.cos(angle), vy = v0 * Math.sin(angle);
  const tFlight = (2 * vy) / g;
  const range = vx * tFlight;
  const maxH = (vy * vy) / (2 * g);

  // Scale
  const scaleX = (w - 80) / Math.max(range, 1);
  const scaleY = (h - 60) / Math.max(maxH, 1);
  const sc = Math.min(scaleX, scaleY, 15);
  const groundY = h - 30;
  const startX = 40;

  // Update results
  const pr = $('#projRange'); if (pr) pr.textContent = range.toFixed(2) + ' m';
  const ph = $('#projHeight'); if (ph) ph.textContent = maxH.toFixed(2) + ' m';
  const pt = $('#projTime'); if (pt) pt.textContent = tFlight.toFixed(2) + ' s';
  const pi = $('#projImpact'); if (pi) pi.textContent = v0.toFixed(2) + ' m/s';

  const trail = [];
  let t = 0;
  const dt = tFlight / 150;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  function draw() {
    ctx.clearRect(0, 0, w, h);
    // Ground
    ctx.strokeStyle = isDark ? '#2d4a6f' : '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, groundY); ctx.lineTo(w, groundY); ctx.stroke();

    // Trail
    if (trail.length > 1) {
      ctx.strokeStyle = isDark ? '#6d8cff' : '#3b5bdb';
      ctx.lineWidth = 2;
      ctx.beginPath();
      trail.forEach(([px, py], i) => { i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
      ctx.stroke();
    }

    // Projectile
    const x = vx * t, y = vy * t - .5 * g * t * t;
    const px = startX + x * sc, py = groundY - y * sc;
    trail.push([px, py]);

    ctx.fillStyle = isDark ? '#f59e0b' : '#dc2626';
    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();

    // Labels
    ctx.fillStyle = isDark ? '#a3b1cc' : '#475569';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`t = ${t.toFixed(2)}s`, px + 10, py - 10);
    ctx.fillText('0', startX - 10, groundY + 15);

    t += dt;
    if (t <= tFlight + dt) {
      projAnim = requestAnimationFrame(draw);
    }
  }
  draw();
}

function clearProjectile() {
  if (projAnim) cancelAnimationFrame(projAnim);
  const canvas = $('#projCanvas');
  if (canvas) canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
  ['projRange', 'projHeight', 'projTime', 'projImpact'].forEach(id => {
    const el = $('#' + id); if (el) el.textContent = '—';
  });
}

// ─── Pendulum ───────────────────────────────────────────────────────────────
let pendAnim = null;

function renderPendulumLab() {
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px" class="lab-grid">
    <div class="card">
      <h3 class="font-bold mb-3">🕐 Simple Pendulum</h3>
      <canvas id="pendCanvas" class="experiment-canvas" width="600" height="260"></canvas>
      <div class="sim-control-row">
        <div class="sim-control-group">
          <label>Length: <span id="pendL">1.5</span> m</label>
          <input type="range" min="0.5" max="3" step="0.1" value="1.5" id="pendLen" oninput="$('#pendL').textContent=this.value;startPendulum()">
        </div>
        <div class="sim-control-group">
          <label>Angle: <span id="pendD">30</span>°</label>
          <input type="range" min="5" max="60" value="30" id="pendDeg" oninput="$('#pendD').textContent=this.value;startPendulum()">
        </div>
        <button class="btn btn-secondary btn-sm" onclick="startPendulum()">Restart</button>
      </div>
    </div>
    <div class="card">
      <h4 class="font-bold mb-2">Pendulum Physics</h4>
      <div class="info-panel">
        <b>Period: T = 2π√(L/g)</b>
        For small angles, the period depends only on length and gravity — not mass or amplitude.

<b>Angular frequency: ω = √(g/L)</b>
        The pendulum oscillates at this natural frequency.
      </div>
      <div class="mt-4 grid-2" id="pendResults">
        <div class="reading-card"><div class="reading-label">Period</div><div class="reading-value" id="pendPeriod">—</div></div>
        <div class="reading-card"><div class="reading-label">Frequency</div><div class="reading-value" id="pendFreq">—</div></div>
      </div>
    </div>
  </div>`;
}

function startPendulum() {
  if (pendAnim) cancelAnimationFrame(pendAnim);
  const canvas = $('#pendCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const L = +$('#pendLen').value;
  const angleDeg = +$('#pendDeg').value;
  const theta0 = angleDeg * Math.PI / 180;
  const g = 9.8;
  const omega = Math.sqrt(g / L);
  const T = 2 * Math.PI / omega;

  const pp = $('#pendPeriod'); if (pp) pp.textContent = T.toFixed(3) + ' s';
  const pf = $('#pendFreq'); if (pf) pf.textContent = (1 / T).toFixed(3) + ' Hz';

  const pivotX = w / 2, pivotY = 30;
  const pixelLen = Math.min(h - 70, L * 80);
  const t0 = performance.now();
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  function draw() {
    const t = (performance.now() - t0) / 1000;
    const theta = theta0 * Math.cos(omega * t);
    const bobX = pivotX + Math.sin(theta) * pixelLen;
    const bobY = pivotY + Math.cos(theta) * pixelLen;

    ctx.clearRect(0, 0, w, h);

    // Pivot
    ctx.fillStyle = isDark ? '#6b7fa3' : '#94a3b8';
    ctx.beginPath(); ctx.arc(pivotX, pivotY, 5, 0, Math.PI * 2); ctx.fill();

    // String
    ctx.strokeStyle = isDark ? '#a3b1cc' : '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(pivotX, pivotY); ctx.lineTo(bobX, bobY); ctx.stroke();

    // Bob
    ctx.fillStyle = isDark ? '#6d8cff' : '#3b5bdb';
    ctx.beginPath(); ctx.arc(bobX, bobY, 16, 0, Math.PI * 2); ctx.fill();

    // Angle arc
    ctx.strokeStyle = isDark ? '#4a5590' : '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 30, Math.PI / 2 - theta0, Math.PI / 2 + theta0);
    ctx.stroke();

    // Label
    ctx.fillStyle = isDark ? '#a3b1cc' : '#475569';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText(`θ = ${(theta * 180 / Math.PI).toFixed(1)}°`, pivotX + 40, pivotY + 20);

    pendAnim = requestAnimationFrame(draw);
  }
  draw();
}

// ─── Wave Simulator ─────────────────────────────────────────────────────────
let waveAnim = null;

function renderWaveLab() {
  return `<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px" class="lab-grid">
    <div class="card">
      <h3 class="font-bold mb-3">🌊 Transverse Wave</h3>
      <canvas id="waveCanvas" class="experiment-canvas" width="600" height="260"></canvas>
      <div class="sim-control-row">
        <div class="sim-control-group">
          <label>Frequency: <span id="waveF">2</span> Hz</label>
          <input type="range" min="0.5" max="5" step="0.1" value="2" id="waveFreq" oninput="$('#waveF').textContent=this.value;startWave()">
        </div>
        <div class="sim-control-group">
          <label>Amplitude: <span id="waveAmp">50</span> px</label>
          <input type="range" min="10" max="100" value="50" id="waveA" oninput="$('#waveAmp').textContent=this.value;startWave()">
        </div>
        <div class="sim-control-group">
          <label>Wavelength: <span id="waveLam">100</span> px</label>
          <input type="range" min="30" max="200" value="100" id="waveL" oninput="$('#waveLam').textContent=this.value;startWave()">
        </div>
      </div>
    </div>
    <div class="card">
      <h4 class="font-bold mb-2">Wave Properties</h4>
      <div class="info-panel">
        <b>v = f × λ</b>
        Wave speed equals frequency times wavelength.

<b>Transverse waves</b> oscillate perpendicular to the direction of travel (like water waves and light).

<b>Period: T = 1/f</b>
        The time for one complete oscillation.
      </div>
      <div class="mt-4 grid-2">
        <div class="reading-card"><div class="reading-label">Wave Speed</div><div class="reading-value" id="waveSpeed">—</div></div>
        <div class="reading-card"><div class="reading-label">Period</div><div class="reading-value" id="wavePeriod">—</div></div>
      </div>
    </div>
  </div>`;
}

function startWave() {
  if (waveAnim) cancelAnimationFrame(waveAnim);
  const canvas = $('#waveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const freq = +$('#waveFreq').value;
  const amp = +$('#waveA').value;
  const lambda = +$('#waveL').value;
  const speed = freq * lambda;

  const ws = $('#waveSpeed'); if (ws) ws.textContent = speed.toFixed(0) + ' px/s';
  const wp = $('#wavePeriod'); if (wp) wp.textContent = (1 / freq).toFixed(3) + ' s';

  const t0 = performance.now();
  const midY = h / 2;
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  function draw() {
    const t = (performance.now() - t0) / 1000;
    ctx.clearRect(0, 0, w, h);

    // Center line
    ctx.strokeStyle = isDark ? '#2d4a6f' : '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath(); ctx.moveTo(0, midY); ctx.lineTo(w, midY); ctx.stroke();
    ctx.setLineDash([]);

    // Wave
    ctx.strokeStyle = isDark ? '#6d8cff' : '#3b5bdb';
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const y = midY + amp * Math.sin(2 * Math.PI * (x / lambda - freq * t));
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Second harmonic (lighter)
    ctx.strokeStyle = isDark ? 'rgba(167,139,250,0.4)' : 'rgba(124,58,237,0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const y = midY + (amp * 0.5) * Math.sin(2 * Math.PI * (x / (lambda / 2) - freq * 2 * t));
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Labels
    ctx.fillStyle = isDark ? '#a3b1cc' : '#475569';
    ctx.font = '11px Inter, sans-serif';
    ctx.fillText('Amplitude', 10, midY - amp - 5);
    ctx.fillText('λ (wavelength)', w / 2 - 30, midY + amp + 25);

    waveAnim = requestAnimationFrame(draw);
  }
  draw();
}

function initLab() {
  const content = $('#lab-content');
  if (!content) return;
  switch (currentExperiment) {
    case 'circuit':
      content.innerHTML = renderCircuitLab();
      labUpd();
      break;
    case 'projectile':
      content.innerHTML = renderProjectileLab();
      break;
    case 'pendulum':
      content.innerHTML = renderPendulumLab();
      setTimeout(startPendulum, 100);
      break;
    case 'wave':
      content.innerHTML = renderWaveLab();
      setTimeout(startWave, 100);
      break;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW: ADVANCED QUIZ SYSTEM (52 STEM Questions · 5 Modes · Real Explanations)
// ═══════════════════════════════════════════════════════════════════════════
let Q = null;
let quizTimer = null;
let quizTimeLeft = 45;
let quizReviewFilter = 'all';
let activeQuizMode = 'topic';
let activeQuizCategory = 'Mathematics';
let activeDifficultyFilter = 'all';

function getQuizBank() {
  if (typeof QUIZ_DATA !== 'undefined' && Array.isArray(QUIZ_DATA.questions)) {
    return QUIZ_DATA.questions;
  }
  return [];
}

function startQuiz(mode, category) {
  if (quizTimer) { clearInterval(quizTimer); quizTimer = null; }
  activeQuizMode = mode || 'topic';
  if (category) activeQuizCategory = category;

  const allQuestions = getQuizBank();
  let selectedQuestions = [];

  if (activeQuizMode === 'quick') {
    // 5 random questions across all subjects
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    selectedQuestions = shuffled.slice(0, 5);
  } else if (activeQuizMode === 'advanced') {
    // All questions of Advanced difficulty
    selectedQuestions = allQuestions.filter(q => q.level === 'Advanced');
    if (selectedQuestions.length > 10) {
      selectedQuestions = selectedQuestions.sort(() => 0.5 - Math.random()).slice(0, 10);
    }
  } else if (activeQuizMode === 'mixed') {
    // 10 questions balanced across categories
    const categories = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'General Science'];
    categories.forEach(cat => {
      const catQs = allQuestions.filter(q => q.category.toLowerCase() === cat.toLowerCase());
      const shuffled = [...catQs].sort(() => 0.5 - Math.random());
      selectedQuestions.push(...shuffled.slice(0, 2));
    });
    selectedQuestions = selectedQuestions.slice(0, 10);
  } else if (activeQuizMode === 'timed') {
    // 10 random questions with a 45-second timer
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    selectedQuestions = shuffled.slice(0, 10);
  } else {
    // Topic-based
    selectedQuestions = allQuestions.filter(q => q.category.toLowerCase() === activeQuizCategory.toLowerCase());
    if (activeDifficultyFilter !== 'all') {
      selectedQuestions = selectedQuestions.filter(q => q.level.toLowerCase() === activeDifficultyFilter.toLowerCase());
    }
  }

  if (selectedQuestions.length === 0) {
    selectedQuestions = allQuestions.slice(0, 5);
  }

  Q = {
    mode: activeQuizMode,
    category: activeQuizCategory,
    questions: selectedQuestions,
    answers: new Array(selectedQuestions.length).fill(null),
    i: 0,
    fin: false,
    score: 0,
    earned: 0,
    serverValidated: false,
    feedback: '',
    results: []
  };

  quizReviewFilter = 'all';

  if (activeQuizMode === 'timed') {
    quizTimeLeft = 45;
    quizTimer = setInterval(() => {
      quizTimeLeft--;
      const timeVal = $('#quizTimerVal');
      const timeBar = $('#quizTimerBar');
      if (timeVal) timeVal.textContent = quizTimeLeft + 's';
      if (timeBar) timeBar.style.width = ((quizTimeLeft / 45) * 100) + '%';
      if (quizTimeLeft <= 0) {
        clearInterval(quizTimer);
        quizTimer = null;
        submitQuiz();
      }
    }, 1000);
  }

  $('#app').innerHTML = V.quiz();
  scrollTo({ top: 0, behavior: 'smooth' });
}

function selectQuizOption(optIdx) {
  if (!Q || Q.fin) return;
  Q.answers[Q.i] = optIdx;
  $('#app').innerHTML = V.quiz();
}

function jumpToQuestion(idx) {
  if (!Q || Q.fin) return;
  if (idx >= 0 && idx < Q.questions.length) {
    Q.i = idx;
    $('#app').innerHTML = V.quiz();
  }
}

async function submitQuiz() {
  if (!Q || Q.fin) return;
  if (quizTimer) { clearInterval(quizTimer); quizTimer = null; }

  const questionIds = Q.questions.map(q => q.id);
  let serverResults = null;

  if (backendOnline) {
    try {
      const res = await fetch(API + '/api/quizzes/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: Q.mode === 'topic' ? Q.category : 'Mixed Subjects',
          answers: Q.answers,
          questionIds: questionIds
        }),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          serverResults = data;
          Q.serverValidated = true;
          Q.score = data.score;
          Q.feedback = data.feedback;
          Q.results = data.results;
        }
      }
    } catch (e) {
      console.warn('Server quiz submit failed, using local scoring:', e);
    }
  }

  // Local fallback evaluation if offline or server failed
  if (!serverResults) {
    let correct = 0;
    const resList = [];
    Q.questions.forEach((q, idx) => {
      const selIdx = Q.answers[idx];
      const isAns = selIdx !== null && selIdx !== undefined;
      const isCor = isAns && Number(selIdx) === q.answerIndex;
      if (isCor) correct++;
      resList.push({
        questionId: q.id,
        question: q.question,
        category: q.category,
        level: q.level,
        selectedIndex: selIdx,
        selectedAnswer: isAns ? q.options[selIdx] : 'Unanswered',
        correctIndex: q.answerIndex,
        correctAnswer: q.options[q.answerIndex],
        isCorrect: isCor,
        explanation: q.explanation || 'Verified STEM conceptual principle.'
      });
    });
    Q.score = correct;
    Q.results = resList;
    const pct = Math.round((correct / Q.questions.length) * 100);
    Q.feedback = pct === 100 ? 'Outstanding! Perfect score achieved.' : pct >= 70 ? 'Great job! Strong subject mastery.' : 'Good effort! Review the explanations below and retry.';
  }

  // Update student stats in LocalStorage
  const total = Q.questions.length;
  Q.earned = Q.score * 10 + (Q.score === total ? 10 : 0);
  S.quizzes.push({
    c: Q.mode === 'topic' ? Q.category : `${Q.mode.toUpperCase()} Quiz`,
    s: Q.score,
    n: total,
    d: Date.now()
  });
  S.points += Q.earned;
  act(`Completed ${Q.mode} quiz: ${Q.score}/${total} (+${Q.earned} pts)`);
  save();

  Q.fin = true;
  $('#app').innerHTML = V.quiz();
  scrollTo({ top: 0, behavior: 'smooth' });
}

function setReviewFilter(filterType) {
  quizReviewFilter = filterType;
  const container = $('#quizReviewContainer');
  if (container && Q && Q.results) {
    container.innerHTML = renderQuizReviewItems();
  }
  $$('.review-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filterType);
  });
}

function renderQuizReviewItems() {
  if (!Q || !Q.results) return '';
  const filtered = Q.results.filter(r => {
    if (quizReviewFilter === 'correct') return r.isCorrect;
    if (quizReviewFilter === 'wrong') return !r.isCorrect && r.selectedIndex !== null;
    if (quizReviewFilter === 'unanswered') return r.selectedIndex === null;
    return true; // all
  });

  if (filtered.length === 0) {
    return `<div class="card text-center" style="padding:24px"><p class="text-muted">No questions found matching this filter.</p></div>`;
  }

  return filtered.map((r, i) => {
    const isUnanswered = r.selectedIndex === null;
    const statusClass = r.isCorrect ? 'correct' : (isUnanswered ? 'unanswered' : 'wrong');
    const statusText = r.isCorrect ? '✓ Correct' : (isUnanswered ? '⚪ Unanswered' : '✗ Incorrect');

    return `<div class="review-item ${statusClass}">
      <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <span class="font-bold text-sm">Question ${i + 1}</span>
          <span class="chip" style="font-size:0.75rem">${esc(r.category || 'STEM')}</span>
          <span class="chip ${r.level === 'Advanced' ? 'chip-violet' : r.level === 'Intermediate' ? 'chip-blue' : 'chip-green'}" style="font-size:0.75rem">${esc(r.level || 'Standard')}</span>
        </div>
        <span class="font-bold text-xs ${r.isCorrect ? 'text-success' : (isUnanswered ? 'text-muted' : 'text-error')}">${statusText}</span>
      </div>
      <div class="font-semibold text-base mb-3" style="line-height:1.6">${esc(r.question)}</div>
      <div class="grid-2 mb-3">
        <div class="info-panel" style="padding:10px 14px;border-left:3px solid ${r.isCorrect ? 'var(--success)' : (isUnanswered ? 'var(--border)' : 'var(--error)')}">
          <div class="text-xs text-muted uppercase font-bold">Your Response</div>
          <div class="font-medium mt-1">${esc(r.selectedAnswer)}</div>
        </div>
        <div class="info-panel" style="padding:10px 14px;border-left:3px solid var(--success)">
          <div class="text-xs text-muted uppercase font-bold">Verified Correct Answer</div>
          <div class="font-medium text-success mt-1">${esc(r.correctAnswer)}</div>
        </div>
      </div>
      <div class="review-explanation">
        <div class="flex items-center gap-1 font-bold mb-1" style="color:var(--accent-primary)">
          <span>💡 Conceptual Explanation:</span>
        </div>
        <div class="text-secondary text-sm" style="line-height:1.7">${esc(r.explanation)}</div>
      </div>
    </div>`;
  }).join('');
}

V.quiz = () => {
  const allQs = getQuizBank();
  const totalQuestionsCount = allQs.length || 52;

  // 1. QUIZ DASHBOARD / SELECTION SCREEN
  if (!Q) {
    const cats = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'General Science'];

    return `<div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="section-title">Interactive Quiz Arena</h1>
        <p class="section-subtitle">Challenge yourself with ${totalQuestionsCount} verified STEM questions across 5 dynamic learning modes.</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="chip chip-success">● Universal Question Bank (${totalQuestionsCount} Questions)</span>
      </div>
    </div>

    <!-- Mode Selector Cards -->
    <div class="mt-4">
      <div class="font-bold text-sm text-muted uppercase tracking-wider mb-2">Select Quiz Mode</div>
      <div class="quiz-mode-pill-row">
        <button class="quiz-mode-pill ${activeQuizMode === 'topic' ? 'active' : ''}" onclick="activeQuizMode='topic';go()">📚 Topic-Based Quiz</button>
        <button class="quiz-mode-pill ${activeQuizMode === 'quick' ? 'active' : ''}" onclick="startQuiz('quick')">⚡ Quick Practice (5 Qs)</button>
        <button class="quiz-mode-pill ${activeQuizMode === 'advanced' ? 'active' : ''}" onclick="startQuiz('advanced')">🏆 Advanced Challenge</button>
        <button class="quiz-mode-pill ${activeQuizMode === 'mixed' ? 'active' : ''}" onclick="startQuiz('mixed')">🎲 Mixed Subjects (10 Qs)</button>
        <button class="quiz-mode-pill ${activeQuizMode === 'timed' ? 'active' : ''}" onclick="startQuiz('timed')">⏱️ Timed Quiz (45s)</button>
      </div>
    </div>

    <!-- Topic Selection (when in topic mode) -->
    <div class="mt-6">
      <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
        <h2 class="font-bold text-lg">STEM Subject Modules</h2>
        <div class="flex items-center gap-2">
          <span class="text-xs text-muted">Difficulty Filter:</span>
          <select id="quizDiffFilter" class="input" style="padding:4px 8px;font-size:0.8rem" onchange="activeDifficultyFilter=this.value;go()">
            <option value="all" ${activeDifficultyFilter === 'all' ? 'selected' : ''}>All Difficulties</option>
            <option value="Beginner" ${activeDifficultyFilter === 'Beginner' ? 'selected' : ''}>Beginner Only</option>
            <option value="Intermediate" ${activeDifficultyFilter === 'Intermediate' ? 'selected' : ''}>Intermediate Only</option>
            <option value="Advanced" ${activeDifficultyFilter === 'Advanced' ? 'selected' : ''}>Advanced Only</option>
          </select>
        </div>
      </div>

      <div class="grid-auto">
        ${cats.map(c => {
          const catQs = allQs.filter(q => q.category.toLowerCase() === c.toLowerCase());
          const catAttempts = S.quizzes.filter(q => q.c.toLowerCase() === c.toLowerCase());
          const bestScore = catAttempts.length ? Math.max(...catAttempts.map(q => Math.round((q.s / q.n) * 100))) : null;
          const icon = c === 'Mathematics' ? '📐' : c === 'Physics' ? '⚛️' : c === 'Chemistry' ? '🧪' : c === 'Biology' ? '🧬' : c === 'Computer Science' ? '💻' : '🌌';

          return `<div class="card card-hover flex flex-col justify-between" style="padding:22px;cursor:pointer" onclick="startQuiz('topic', '${c}')">
            <div>
              <div class="flex items-center justify-between mb-3">
                <span style="font-size:2rem">${icon}</span>
                <span class="chip" style="font-size:0.75rem">${catQs.length} Questions</span>
              </div>
              <h3 class="font-bold text-lg mb-1">${c}</h3>
              <p class="text-xs text-secondary mb-3">Foundational concepts, formulas, and advanced reasoning.</p>
            </div>
            <div class="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted">
              <span>${catAttempts.length ? `${catAttempts.length} attempts` : 'Not attempted'}</span>
              <span class="font-bold ${bestScore !== null ? 'text-success' : ''}">${bestScore !== null ? `Best: ${bestScore}%` : 'Start →'}</span>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <!-- Quiz History Component -->
    ${S.quizzes.length > 0 ? `
    <div class="card mt-6" style="padding:24px">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-base">📊 Recent Quiz History</h3>
        <span class="text-xs text-muted">${S.quizzes.length} total attempts recorded in LocalStorage</span>
      </div>
      <div class="grid-auto">
        ${S.quizzes.slice(-6).reverse().map(q => {
          const pct = Math.round((q.s / q.n) * 100);
          return `<div class="card" style="padding:14px;background:var(--bg-tertiary)">
            <div class="text-xs text-muted">${esc(q.c)}</div>
            <div class="font-bold text-xl gradient-text mt-1">${pct}%</div>
            <div class="text-xs text-muted mt-1">${q.s} of ${q.n} correct</div>
          </div>`;
        }).join('')}
      </div>
    </div>` : ''}`;
  }

  // 2. ACTIVE QUIZ SESSION SCREEN
  if (!Q.fin) {
    const q = Q.questions[Q.i];
    const total = Q.questions.length;
    const currentSelected = Q.answers[Q.i];
    const answeredCount = Q.answers.filter(a => a !== null).length;

    return `<div style="max-width:760px;margin:0 auto">
      <!-- Quiz Header Banner -->
      <div class="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div class="flex items-center gap-2">
          <span class="chip chip-blue font-bold">${Q.mode === 'topic' ? Q.category : Q.mode.toUpperCase() + ' MODE'}</span>
          <span class="chip ${q.level === 'Advanced' ? 'chip-violet' : q.level === 'Intermediate' ? 'chip-blue' : 'chip-green'} font-bold">${esc(q.level || 'Standard')}</span>
        </div>
        <div class="flex items-center gap-3">
          ${Q.mode === 'timed' ? `<div class="flex items-center gap-1 font-bold text-sm" style="color:var(--warning)">
            <span>⏱️ Timer:</span>
            <span id="quizTimerVal">${quizTimeLeft}s</span>
          </div>` : ''}
          <span class="text-sm text-secondary font-medium">Question ${Q.i + 1} of ${total}</span>
        </div>
      </div>

      ${Q.mode === 'timed' ? `<div class="quiz-timer-wrapper mb-3">
        <div id="quizTimerBar" class="quiz-timer-bar" style="width:${(quizTimeLeft / 45) * 100}%"></div>
      </div>` : ''}

      <!-- Question Jump Grid -->
      <div class="card mb-4" style="padding:16px">
        <div class="flex items-center justify-between text-xs text-muted mb-2">
          <span>Question Navigation Grid</span>
          <span>${answeredCount} of ${total} Answered</span>
        </div>
        <div class="quiz-nav-grid">
          ${Q.questions.map((_, idx) => {
            const isCurrent = idx === Q.i;
            const isAnswered = Q.answers[idx] !== null;
            let cls = 'quiz-nav-btn';
            if (isCurrent) cls += ' active';
            if (isAnswered) cls += ' answered';
            return `<button class="${cls}" onclick="jumpToQuestion(${idx})" aria-label="Go to question ${idx + 1}">${idx + 1}</button>`;
          }).join('')}
        </div>
      </div>

      <!-- Question Card -->
      <div class="card" style="padding:32px">
        <h2 class="font-bold mb-6" style="font-size:1.25rem;line-height:1.6">${esc(q.question)}</h2>

        <div class="flex flex-col gap-3">
          ${q.options.map((opt, optIdx) => {
            const isChecked = currentSelected === optIdx;
            return `<button class="quiz-option-btn ${isChecked ? 'selected' : ''}" onclick="selectQuizOption(${optIdx})">
              <span class="option-indicator">${String.fromCharCode(65 + optIdx)}</span>
              <span class="flex-1 text-left font-medium">${esc(opt)}</span>
              <span class="radio-check ${isChecked ? 'checked' : ''}"></span>
            </button>`;
          }).join('')}
        </div>

        <!-- Action Controls -->
        <div class="flex items-center justify-between mt-8 pt-4 border-t border-border flex-wrap gap-2">
          <button class="btn btn-secondary btn-sm" onclick="jumpToQuestion(${Q.i - 1})" ${Q.i === 0 ? 'disabled' : ''}>← Previous</button>

          <div class="flex items-center gap-2">
            <button class="btn btn-secondary btn-sm" onclick="if(confirm('Quit quiz? Current progress will be lost.')){if(quizTimer)clearInterval(quizTimer);Q=null;go();}">Quit</button>
            ${Q.i + 1 < total
              ? `<button class="btn btn-primary btn-sm" onclick="jumpToQuestion(${Q.i + 1})">Next Question →</button>`
              : `<button class="btn btn-primary btn-sm" onclick="submitQuiz()">Submit Quiz ✓</button>`
            }
          </div>
        </div>
      </div>
    </div>`;
  }

  // 3. RESULTS & ANSWER REVIEW SCREEN
  const total = Q.questions.length;
  const pct = total > 0 ? Math.round((Q.score / total) * 100) : 0;
  const correctCount = Q.results.filter(r => r.isCorrect).length;
  const wrongCount = Q.results.filter(r => !r.isCorrect && r.selectedIndex !== null).length;
  const unansweredCount = Q.results.filter(r => r.selectedIndex === null).length;

  return `<div style="max-width:800px;margin:0 auto">
    <!-- Results Banner Card -->
    <div class="card text-center" style="padding:40px">
      <div class="chip chip-blue font-bold uppercase mb-2">${esc(Q.mode)} Results</div>
      <h1 class="section-title mb-1">${Q.mode === 'topic' ? esc(Q.category) : 'Challenge Completed'}</h1>
      <div style="font-size:4rem;font-weight:900;margin:16px 0" class="gradient-text">${Q.score} / ${total}</div>
      <p class="text-secondary text-base font-medium">${pct}% Score · +${Q.earned} Points Earned</p>

      ${Q.serverValidated ? `<div class="chip chip-success mt-3" style="font-size:0.8rem">⚡ Verified & Scored on Server (POST /api/quizzes/submit)</div>` : ''}

      <p class="text-muted text-sm mt-3" style="max-width:480px;margin:12px auto 0">${esc(Q.feedback)}</p>

      <!-- Score Breakdown Cards -->
      <div class="grid-3 mt-6">
        <div class="reading-card"><div class="reading-label">Correct Answers</div><div class="reading-value text-success">${correctCount}</div></div>
        <div class="reading-card"><div class="reading-label">Incorrect Answers</div><div class="reading-value text-error">${wrongCount}</div></div>
        <div class="reading-card"><div class="reading-label">Unanswered</div><div class="reading-value text-muted">${unansweredCount}</div></div>
      </div>

      <div class="flex gap-3 justify-center mt-6 flex-wrap">
        <button class="btn btn-primary" onclick="startQuiz(Q.mode, Q.category)">🔄 Retake This Quiz</button>
        <button class="btn btn-secondary" onclick="Q=null;go()">📚 Choose Another Mode</button>
        <a class="btn btn-secondary" href="#dash">📊 View Dashboard</a>
      </div>
    </div>

    <!-- Review Answers Section -->
    <div class="card mt-6" style="padding:28px">
      <div class="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 class="font-bold text-lg">Detailed Conceptual Review</h2>
          <p class="text-xs text-muted">Step-by-step reasoning and formula explanations for every question.</p>
        </div>
        <div class="flex items-center gap-1">
          <button class="btn btn-secondary btn-sm review-filter-btn ${quizReviewFilter === 'all' ? 'active' : ''}" data-filter="all" onclick="setReviewFilter('all')">All (${total})</button>
          <button class="btn btn-secondary btn-sm review-filter-btn ${quizReviewFilter === 'correct' ? 'active' : ''}" data-filter="correct" onclick="setReviewFilter('correct')">Correct (${correctCount})</button>
          <button class="btn btn-secondary btn-sm review-filter-btn ${quizReviewFilter === 'wrong' ? 'active' : ''}" data-filter="wrong" onclick="setReviewFilter('wrong')">Wrong (${wrongCount})</button>
          <button class="btn btn-secondary btn-sm review-filter-btn ${quizReviewFilter === 'unanswered' ? 'active' : ''}" data-filter="unanswered" onclick="setReviewFilter('unanswered')">Unanswered (${unansweredCount})</button>
        </div>
      </div>

      <div id="quizReviewContainer" class="flex flex-col gap-4">
        ${renderQuizReviewItems()}
      </div>
    </div>
  </div>`;
};

// ═══════════════════════════════════════════════════════════════════════════
// VIEW: COURSES
// ═══════════════════════════════════════════════════════════════════════════
V.courses = () => {
  let coursesHtml = '';

  // Try loading from backend; fallback to static content
  const staticCourses = [
    { id: 'physics-fundamentals', title: 'Physics Fundamentals', category: 'Physics', difficulty: 'Beginner to Intermediate', lessonCount: 5, description: 'Core physics concepts from mechanics to electromagnetism.', topics: ['Solar System', 'EM Field'] },
    { id: 'biology-basics', title: 'Biology Basics', category: 'Biology', difficulty: 'Beginner', lessonCount: 6, description: 'Introduction to living systems — cells, organs, and genetics.', topics: ['Human Heart', 'Human Cell', 'DNA Structure'] },
    { id: 'chemistry-intro', title: 'Chemistry Introduction', category: 'Chemistry', difficulty: 'Beginner', lessonCount: 5, description: 'Atoms, molecules, and chemical bonding fundamentals.', topics: ['Atom Structure', 'Water Molecule'] },
    { id: 'maths-geometry', title: 'Mathematics & Geometry', category: 'Mathematics', difficulty: 'Beginner', lessonCount: 4, description: 'Explore geometric shapes, properties, and spatial reasoning.', topics: ['Geometric Shapes'] },
    { id: 'computer-science-core', title: 'Computer Science & Modern Technology', category: 'Computer Science', difficulty: 'Beginner', lessonCount: 6, description: 'Understand computational thinking, algorithms, and web APIs.', topics: ['Algorithms & Problem Solving', 'Web Technologies'] }
  ];

  const courseList = (Array.isArray(backendCourses) && backendCourses.length > 0)
    ? backendCourses.map(bc => {
        const matchingStatic = staticCourses.find(sc => sc.id === bc.id);
        return {
          id: bc.id,
          title: bc.title,
          category: bc.category,
          difficulty: bc.difficulty || 'Beginner',
          lessonCount: bc.lessonCount || 4,
          description: bc.description,
          topics: (matchingStatic && matchingStatic.topics) ? matchingStatic.topics : ['Solar System']
        };
      })
    : staticCourses;

  coursesHtml = courseList.map(c => {
    const topicsDone = c.topics.filter(t => S.done.includes(t)).length;
    const pct = c.topics.length ? Math.round(topicsDone / c.topics.length * 100) : 0;
    return `<div class="card course-card card-hover">
      <div class="flex items-center justify-between mb-1">
        <div class="course-category">${c.category}</div>
        <span class="chip" style="font-size:0.7rem;background:var(--accent-soft);color:var(--accent-primary);font-weight:600">${c.difficulty} · ${c.lessonCount} lessons</span>
      </div>
      <div class="course-title">${c.title}</div>
      <div class="course-desc">${c.description}</div>
      <div class="mt-3">
        <div class="flex justify-between text-xs mb-1">
          <span class="text-muted">${topicsDone}/${c.topics.length} topics completed</span>
          <span class="font-semibold">${pct}%</span>
        </div>
        <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="flex flex-wrap gap-2 mt-3">
        ${c.topics.map(t => `<span class="chip ${S.done.includes(t) ? 'chip-success' : ''}">${S.done.includes(t) ? '✓ ' : ''}${t}</span>`).join('')}
      </div>
    </div>`;
  }).join('');

  // Learning paths
  const paths = [
    { title: 'Mathematics Foundation', steps: ['Number Systems & BODMAS', 'Fractions, Decimals & Percentages', 'Algebra Basics (Variables & Equations)', 'Geometry & Mensuration', 'Trigonometry (sin, cos, tan)', 'Statistics & Probability'] },
    { title: 'Physics Beginner → Intermediate', steps: ['Motion & Forces', 'Energy & Work', 'Electricity (try Science Lab)', 'Waves', 'Atoms (3D model)'] },
    { title: 'Computer Science Starter', steps: ['Binary & Data', 'Variables', 'Conditions & Loops', 'Functions', 'Simple Algorithms'] },
    { title: 'Biology Explorer', steps: ['Cell Structure', 'Human Heart', 'DNA & Genetics', 'Human Systems'] },
  ];

  return `<h1 class="section-title">Courses & Learning Paths</h1>
    <p class="section-subtitle">Structured learning paths to guide your study</p>

    <div class="grid-2 mt-6">${coursesHtml}</div>

    <h2 class="section-title mt-10">📗 Suggested Learning Paths</h2>
    <div class="grid-3 mt-4">
      ${paths.map(p => `<div class="card">
        <h3 class="font-bold text-sm">${p.title}</h3>
        <ol class="mt-3" style="padding-left:20px;list-style:decimal">
          ${p.steps.map(s => `<li class="text-sm text-secondary" style="margin-bottom:6px">${s}</li>`).join('')}
        </ol>
      </div>`).join('')}
    </div>`;
};

// ═══════════════════════════════════════════════════════════════════════════
// VIEW: RESOURCES
// ═══════════════════════════════════════════════════════════════════════════
const RES = [
  ['Mathematics', 'Formula sheet', 'Key Maths Formulas', 'Area of circle = πr² · Circumference = 2πr · Pythagoras: a² + b² = c² · Quadratic: x = (−b ± √(b² − 4ac)) / 2a · Slope = (y₂ − y₁)/(x₂ − x₁)'],
  ['Physics', 'Formula sheet', 'Mechanics & Electricity Formulas', 'v = u + at · F = ma · KE = ½mv² · V = IR · P = VI · Speed = distance ÷ time · W = Fd · g ≈ 9.8 m/s²'],
  ['Chemistry', 'Key concepts', 'Atoms, Elements & Compounds', 'Atom: smallest unit of an element. Element: one kind of atom. Compound: two or more elements bonded. Mole: 6.022 × 10²³ particles. pH: acidity scale 0–14, 7 is neutral.'],
  ['Computer Science', 'Key concepts', 'Programming Basics', 'Algorithm: step-by-step procedure. Variable: named storage. Loop: repeats instructions. Function: reusable block. Binary: base-2 number system (5 = 101).'],
  ['Mathematics', 'Quick revision', 'BODMAS Order of Operations', 'Brackets → Orders (powers) → Division/Multiplication → Addition/Subtraction. Example: 2 + 3 × 4 = 14, not 20.'],
  ['Physics', 'Topic summary', 'Newton\'s Laws in Brief', '1) Inertia: no net force means no change in motion. 2) F = ma. 3) Every action has an equal and opposite reaction.'],
  ['Chemistry', 'Topic summary', 'The Periodic Table', 'Elements are arranged by atomic number. Columns (groups) share chemical behaviour; rows (periods) show filling electron shells. Group 1 are reactive metals; Group 18 are noble gases.'],
  ['Computer Science', 'Topic summary', 'How Programs Run', 'Source code is translated to machine instructions the CPU executes. Data lives in memory as binary. Input → processing → output.'],
  ['Physics', 'Learning path', 'Physics: Beginner → Intermediate', '1) Motion & forces → 2) Energy & work → 3) Electricity (try the Science Lab) → 4) Waves → 5) Atoms (see the 3D model).'],
  ['Computer Science', 'Learning path', 'CS Starter Path', '1) Binary & data → 2) Variables → 3) Conditions & loops → 4) Functions → 5) Simple algorithms such as searching and sorting.'],
  ['Biology', 'Key concepts', 'Cell Biology Essentials', 'Cells are the basic units of life. Organelles: nucleus (DNA), mitochondria (energy), ribosomes (proteins), ER (processing), Golgi (packaging).'],
  ['Biology', 'Topic summary', 'DNA & Genetics Overview', 'DNA stores genetic information in a double helix. Genes code for proteins. A-T and G-C base pairs. Mutations can alter gene function.'],
  ['Physics', 'Formula sheet', 'Wave Physics', 'v = fλ · T = 1/f · Sound speed in air ≈ 343 m/s · Light speed c ≈ 3×10⁸ m/s · Pendulum: T = 2π√(L/g)'],
  ['Mathematics', 'Key concepts', 'Trigonometry Basics', 'sin(θ) = opposite/hypotenuse · cos(θ) = adjacent/hypotenuse · tan(θ) = opposite/adjacent · sin²θ + cos²θ = 1'],
];

let rq = '', rc = 'All';

V.res = () => `<h1 class="section-title">Learning Resources</h1>
  <p class="section-subtitle">Built-in notes, formulas, and learning paths — no downloads needed</p>

  <div class="mt-4">
    <input id="rs" type="text" class="input" placeholder="🔍 Search resources…" value="${esc(rq)}" oninput="rq=this.value;resList()">
  </div>

  <div class="flex flex-wrap gap-2 mt-3">
    ${['All', ...CATS].map(c => `<button class="btn ${c === rc ? 'btn-primary' : 'btn-secondary'} btn-sm rc" data-c="${c}" onclick="rc=this.dataset.c;$$('.rc').forEach(b=>b.className='btn btn-secondary btn-sm rc');this.className='btn btn-primary btn-sm rc';resList()">${c}</button>`).join('')}
  </div>

  <div class="flex justify-between items-center mt-3">
    <span id="res-count" class="text-xs text-muted"></span>
    ${S.bookmarks.length > 0 ? `<button class="btn btn-secondary btn-sm" onclick="rc='bookmarks';resList()">⭐ Bookmarks (${S.bookmarks.length})</button>` : ''}
  </div>

  <div id="rl" class="grid-2 mt-3"></div>`;

function resList() {
  const q = rq.toLowerCase().trim();
  let L;
  if (rc === 'bookmarks') {
    L = RES.filter((r, i) => S.bookmarks.includes('' + i));
  } else {
    L = RES.filter(r => (rc === 'All' || r[0] === rc) && (!q || r.join(' ').toLowerCase().includes(q)));
  }

  const countEl = $('#res-count');
  if (countEl) countEl.textContent = `${L.length} resource${L.length !== 1 ? 's' : ''} found`;

  const rl = $('#rl');
  if (!rl) return;
  rl.innerHTML = L.length
    ? L.map(r => {
      const idx = RES.indexOf(r);
      const saved = S.bookmarks.includes('' + idx);
      return `<article class="card resource-card">
        <button class="bookmark-btn ${saved ? 'saved' : ''}" onclick="toggleBookmark(${idx})" title="${saved ? 'Remove bookmark' : 'Add bookmark'}">
          ${saved ? '⭐' : '☆'}
        </button>
        <span class="resource-type">${r[0]} · ${r[1]}</span>
        <h3 class="resource-title">${r[2]}</h3>
        <p class="resource-body">${r[3]}</p>
      </article>`;
    }).join('')
    : '<p class="text-muted" style="grid-column:1/-1">No resources match your search.</p>';
}

function toggleBookmark(idx) {
  const key = '' + idx;
  if (S.bookmarks.includes(key)) {
    S.bookmarks = S.bookmarks.filter(b => b !== key);
  } else {
    S.bookmarks.push(key);
  }
  save();
  resList();
}

// ═══════════════════════════════════════════════════════════════════════════
// VIEW: ABOUT
// ═══════════════════════════════════════════════════════════════════════════
V.about = () => `<h1 class="section-title">About VirtualLearn AI</h1>
  <p class="section-subtitle">Empowering interactive exploration in science, mathematics, and technology</p>

  <!-- 1. About Description -->
  <div class="card mt-4" style="padding:28px">
    <h3 class="font-bold text-lg mb-3 gradient-text">About VirtualLearn AI</h3>
    <p class="text-secondary" style="font-size:1.05rem;line-height:1.8">
      VirtualLearn AI is an interactive educational platform designed to make learning easier, more engaging, and more accessible. Students can explore scientific concepts through interactive 3D visualizations, understand difficult topics through guided explanations, experiment with virtual science simulations, test their knowledge with quizzes, and monitor their learning progress.
    </p>
  </div>

  <!-- 2. Mission & Vision -->
  <div class="grid-2 mt-4">
    <div class="card" style="padding:24px;border-left:4px solid var(--accent-primary)">
      <div class="flex items-center gap-2 mb-2">
        <span style="font-size:1.5rem">🎯</span>
        <h3 class="font-bold" style="font-size:1.1rem">Mission</h3>
      </div>
      <p class="text-secondary" style="line-height:1.7">
        Make complex concepts easier to understand through interactive learning, experimentation, and independent thinking.
      </p>
    </div>

    <div class="card" style="padding:24px;border-left:4px solid var(--accent-secondary)">
      <div class="flex items-center gap-2 mb-2">
        <span style="font-size:1.5rem">🔭</span>
        <h3 class="font-bold" style="font-size:1.1rem">Vision</h3>
      </div>
      <p class="text-secondary" style="line-height:1.7">
        Create an engaging learning environment where students can explore ideas, practice concepts, and develop a deeper understanding of science, mathematics, and technology.
      </p>
    </div>
  </div>

  <!-- 3. Meet the Team -->
  <div class="card mt-4" style="padding:28px">
    <h3 class="font-bold text-lg mb-1">Meet the Team</h3>
    <p class="text-xs text-muted mb-4">The creators building and designing VirtualLearn AI</p>

    <div class="team-grid">
      <div class="team-card">
        <div class="team-avatar-circle">S</div>
        <div>
          <div class="team-name">Saksham</div>
          <div class="team-role">Founder</div>
          <p class="team-desc">Leads the project's vision, educational experience, and overall development.</p>
        </div>
      </div>

      <div class="team-card">
        <div class="team-avatar-circle designer">HM</div>
        <div>
          <div class="team-name">Hariom Mittal</div>
          <div class="team-role">Web Designer</div>
          <p class="team-desc">Focuses on website design, visual presentation, layouts, and user experience.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- 4. Contact & Support -->
  <div class="card mt-4" style="padding:28px">
    <div class="flex items-center justify-between flex-wrap gap-2 mb-3">
      <h3 class="font-bold text-lg">Contact & Support</h3>
      <span class="demo-support-disclaimer">Fictional Demo Support</span>
    </div>
    <p class="text-secondary text-sm mb-3">
      Have a question or feedback about VirtualLearn AI?
    </p>
    <div class="info-panel" style="padding:16px 20px">
      <div class="text-xs text-muted uppercase font-bold">Email</div>
      <div class="font-mono text-base font-bold mt-1" style="color:var(--accent-primary)">help@virtuallearnai.example</div>
      <p class="text-xs text-muted mt-2">
        Notice: <code>help@virtuallearnai.example</code> is a fictional demo email address provided for demonstration purposes. This is not a monitored support inbox, and messages sent to this address are not delivered.
      </p>
    </div>
  </div>`;

// ═══════════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════════
const INIT = {
  learn: init3d,
  tutor: drawChat,
  lab: initLab,
  res: resList
};

function cleanupExperiments() {
  if (projAnim) { cancelAnimationFrame(projAnim); projAnim = null; }
  if (pendAnim) { cancelAnimationFrame(pendAnim); pendAnim = null; }
  if (waveAnim) { cancelAnimationFrame(waveAnim); waveAnim = null; }
}

function go() {
  stop3d();
  cleanupExperiments();
  const v = (location.hash || '#home').slice(1);
  const f = V[v] ? v : 'home';
  if (f !== 'quiz' && Q && Q.fin) Q = null;
  $('#app').innerHTML = V[f]();

  // Update nav highlights
  $$('#nav a, .mobile-nav a').forEach(a => a.classList.toggle('on', a.dataset.v === f));
  $('#who').textContent = S.name;

  if (INIT[f]) INIT[f]();
  scrollTo({ top: 0, behavior: 'smooth' });
}

// ═══════════════════════════════════════════════════════════════════════════
// FLOATING AI TUTOR WIDGET — Persistent chat accessible from any section
// ═══════════════════════════════════════════════════════════════════════════
let floatingCH = [];   // Separate chat history for floating widget
let floatingAsking = false;

function toggleFloatingTutor() {
  const modal = $('#floating-tutor-modal');
  const trigger = $('#floating-tutor-trigger');
  if (!modal) return;
  const isOpen = modal.style.display !== 'none';
  modal.style.display = isOpen ? 'none' : 'flex';
  modal.setAttribute('aria-modal', !isOpen);
  if (trigger) trigger.style.display = isOpen ? '' : 'none';
  if (!isOpen) {
    // Focus input when opened
    const inp = $('#floating-user-input');
    if (inp) setTimeout(() => inp.focus(), 100);
    // Render current context banner
    const banner = $('#floating-context-banner');
    if (banner) {
      const v = (location.hash || '#home').slice(1);
      const labels = { home: 'Home', dash: 'Dashboard', learn: '3D Learn', tutor: 'AI Tutor', lab: 'Science Lab', quiz: 'Quiz', courses: 'Courses', res: 'Resources', about: 'About' };
      const pill = banner.querySelector('.context-pill');
      if (pill) pill.textContent = 'Context: ' + (labels[v] || 'General');
    }
    drawFloatingChat();
  }
}

function drawFloatingChat() {
  const stream = $('#floating-chat-stream');
  if (!stream) return;
  if (floatingCH.length === 0) {
    stream.innerHTML = `<div class="text-muted text-sm" style="padding:16px;text-align:center">
      👋 Hi! I'm your AI Tutor assistant.<br>Ask me anything about Physics, Chemistry, Biology, Maths, or Computer Science.
    </div>`;
  } else {
    stream.innerHTML = floatingCH.map(m => {
      const body = m.html ? formatAiText(m.x) : esc(m.x);
      const badge = (m.r === 't' && m.provider)
        ? `<div class="text-xs mb-1" style="font-weight:700;color:${m.isDemo ? 'var(--text-muted)' : 'var(--success)'}">${m.isDemo ? '📋 ' + esc(m.provider) : '✨ ' + esc(m.provider)}</div>`
        : '';
      return `<div class="chat-msg ${m.r === 'u' ? 'chat-user' : 'chat-tutor'}" style="margin:6px 0;padding:10px 14px;font-size:0.9rem">${badge}${body}</div>`;
    }).join('');
  }
  stream.scrollTop = stream.scrollHeight;

  // Render quick-action chips
  const chipRow = $('#floating-chip-row');
  if (chipRow) {
    const last = floatingCH[floatingCH.length - 1];
    const suggestions = last && last.f && last.f.length ? last.f : ['Explain Pythagorean theorem', 'What is gravity?', 'Explain quadratic formula', 'What is a derivative?'];
    chipRow.innerHTML = suggestions.slice(0, 4).map(s => 
      `<button class="btn btn-secondary btn-sm" style="font-size:0.75rem;padding:4px 10px" onclick="sendFloatingMessage('${esc(s.replace(/'/g, "\\'"))}')">${esc(s)}</button>`
    ).join('');
  }
}

async function sendFloatingMessage(text) {
  if (floatingAsking) return;
  const inp = $('#floating-user-input');
  const t = (text || (inp ? inp.value : '')).trim();
  if (!t) return;
  if (inp) inp.value = '';

  floatingCH.push({ r: 'u', x: t });
  act('Asked Floating AI Tutor: ' + t.slice(0, 50));
  save();
  drawFloatingChat();

  const stream = $('#floating-chat-stream');
  const sendBtn = $('#floating-send-action');
  if (sendBtn) sendBtn.disabled = true;
  floatingAsking = true;

  // Show loading
  const loader = document.createElement('div');
  loader.className = 'chat-msg chat-tutor';
  loader.style.cssText = 'margin:6px 0;padding:10px 14px;font-size:0.9rem';
  loader.id = 'floating-chat-loader';
  loader.innerHTML = `<span class="animate-pulse" style="display:inline-flex;align-items:center;gap:6px">
    <span>${aiConfigured ? '✨ Gemini AI is thinking...' : '⚡ Generating response...'}</span>
  </span>`;
  if (stream) { stream.appendChild(loader); stream.scrollTop = stream.scrollHeight; }

  try {
    const res = await fetch(API + '/api/assistant/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: t, level: LV, history: floatingCH.slice(-6) }),
      signal: AbortSignal.timeout(25000)
    });
    const data = await res.json();
    if (res.ok && data.reply) {
      const followUps = parseFollowUps(data.reply);
      floatingCH.push({
        r: 't', x: data.reply, html: true,
        isDemo: Boolean(data.isDemo),
        provider: data.provider || (aiConfigured ? 'Google Gemini 1.5 Flash' : 'Demo Responses'),
        f: followUps.length ? followUps : SAMPLE.slice(0, 4)
      });
    } else {
      floatingFallback(t);
    }
  } catch (err) {
    console.warn('Floating tutor error, using fallback:', err);
    floatingFallback(t);
  } finally {
    floatingAsking = false;
    if (sendBtn) sendBtn.disabled = false;
    save();
    drawFloatingChat();
  }
}

function floatingFallback(t) {
  const l = t.toLowerCase();
  const h = TUT.find(e => e.k.some(k => l.includes(k)));
  floatingCH.push(h
    ? { r: 't', x: (LV === 'b' ? '[Beginner] ' : '[Intermediate] ') + h[LV], f: h.f, isDemo: true, provider: 'Demo Responses' }
    : { r: 't', x: 'I can help with Physics, Chemistry, Biology, Maths, and Computer Science! Try asking about atoms, Newton\'s laws, derivatives, or algorithms.', f: SAMPLE.slice(0, 4), isDemo: true, provider: 'Demo Responses' }
  );
}

function clearFloatingChat() {
  floatingCH = [];
  drawFloatingChat();
}

// ─── Initialise ─────────────────────────────────────────────────────────────
initTheme();
buildNav();
checkBackend();
addEventListener('hashchange', go);
go();

// Periodically check backend (every 30 seconds)
setInterval(checkBackend, 30000);
