/**
 * VirtualLearn AI — Simple Express Backend
 * 
 * No database. In-memory storage only — data resets when the server restarts.
 * LocalStorage on the client remains the primary persistence for student data.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100kb' }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, '..', 'public')));

// ─── In-Memory Data Store ───────────────────────────────────────────────────
// This data resets every time the server restarts.
const store = {
  announcements: [
    { id: 1, title: 'Welcome to VirtualLearn AI', body: 'Explore 3D models, take quizzes, and track your progress.', date: new Date().toISOString() },
    { id: 2, title: 'New: Virtual Science Lab', body: 'Try the interactive circuit simulator and physics experiments.', date: new Date().toISOString() }
  ],
  feedback: [],
  bookmarks: {}
};

// ─── Topics & Course Content ────────────────────────────────────────────────
const topics = [
  {
    id: 'solar-system',
    title: 'Solar System',
    category: 'Physics',
    icon: '🪐',
    summary: 'Explore the Sun, planets, and their orbits in an interactive 3D model.',
    difficulty: 'Beginner',
    estimatedMinutes: 15,
    lessons: [
      { title: 'The Sun', content: 'The Sun is a G-type main-sequence star containing 99.86% of the Solar System\'s mass. Its surface temperature is about 5,500°C and its core reaches 15 million°C.' },
      { title: 'Inner Planets', content: 'Mercury, Venus, Earth, and Mars are rocky planets closest to the Sun. Earth is unique for its liquid water and protective atmosphere.' },
      { title: 'Outer Planets', content: 'Jupiter, Saturn, Uranus, and Neptune are gas and ice giants with ring systems and many moons.' }
    ]
  },
  {
    id: 'human-heart',
    title: 'Human Heart',
    category: 'Biology',
    icon: '❤️',
    summary: 'Understand the four chambers, valves, and blood flow through the heart.',
    difficulty: 'Beginner',
    estimatedMinutes: 12,
    lessons: [
      { title: 'Heart Anatomy', content: 'The heart has four chambers: two atria (upper) and two ventricles (lower). The right side handles deoxygenated blood, the left side handles oxygenated blood.' },
      { title: 'Blood Flow', content: 'Blood flows: body → right atrium → right ventricle → lungs → left atrium → left ventricle → body. Valves prevent backflow.' },
      { title: 'Heart Function', content: 'The heart beats about 100,000 times per day, pumping approximately 7,500 litres of blood. The cardiac cycle has systole (contraction) and diastole (relaxation) phases.' }
    ]
  },
  {
    id: 'atom-structure',
    title: 'Atom Structure',
    category: 'Chemistry',
    icon: '⚛️',
    summary: 'Visualise protons, neutrons, and electron shells in a 3D atom model.',
    difficulty: 'Beginner',
    estimatedMinutes: 10,
    lessons: [
      { title: 'Subatomic Particles', content: 'Atoms consist of protons (positive charge), neutrons (no charge) in the nucleus, and electrons (negative charge) orbiting in shells.' },
      { title: 'Atomic Number', content: 'The atomic number (Z) equals the number of protons and defines the element. Carbon has Z=6, meaning 6 protons.' },
      { title: 'Electron Shells', content: 'Electrons occupy energy levels. The first shell holds up to 2 electrons, the second holds up to 8. The arrangement determines chemical properties.' }
    ]
  },
  {
    id: 'geometric-shapes',
    title: 'Geometric Shapes',
    category: 'Mathematics',
    icon: '📐',
    summary: 'Examine 3D polyhedra — cube, tetrahedron, octahedron, and more.',
    difficulty: 'Beginner',
    estimatedMinutes: 8,
    lessons: [
      { title: 'Platonic Solids', content: 'There are exactly five Platonic solids: tetrahedron (4 faces), cube (6), octahedron (8), dodecahedron (12), and icosahedron (20).' },
      { title: 'Properties', content: 'Euler\'s formula relates vertices (V), edges (E), and faces (F): V − E + F = 2 for any convex polyhedron.' }
    ]
  },
  {
    id: 'dna-structure',
    title: 'DNA Structure',
    category: 'Biology',
    icon: '🧬',
    summary: 'Learn about the double helix, base pairs, and genetic code.',
    difficulty: 'Intermediate',
    estimatedMinutes: 15,
    lessons: [
      { title: 'Double Helix', content: 'DNA is a double-stranded helix made of nucleotides. Each nucleotide has a sugar, phosphate group, and one of four bases: Adenine, Thymine, Guanine, or Cytosine.' },
      { title: 'Base Pairing', content: 'Adenine pairs with Thymine (A-T) and Guanine pairs with Cytosine (G-C) through hydrogen bonds. This complementary pairing enables DNA replication.' },
      { title: 'Genetic Code', content: 'DNA sequences are read in triplets called codons. Each codon specifies an amino acid. The sequence of amino acids determines protein structure and function.' }
    ]
  },
  {
    id: 'human-cell',
    title: 'Human Cell',
    category: 'Biology',
    icon: '🔬',
    summary: 'Explore the organelles and structures inside a typical human cell.',
    difficulty: 'Beginner',
    estimatedMinutes: 12,
    lessons: [
      { title: 'Cell Membrane', content: 'The phospholipid bilayer controls what enters and exits the cell. It contains proteins for transport, signalling, and structural support.' },
      { title: 'Nucleus', content: 'The nucleus houses DNA organised into chromosomes. It is surrounded by a nuclear envelope with pores that regulate molecular traffic.' },
      { title: 'Organelles', content: 'Mitochondria produce ATP (energy). Ribosomes synthesise proteins. The endoplasmic reticulum processes proteins and lipids. Golgi apparatus packages and ships molecules.' }
    ]
  },
  {
    id: 'water-molecule',
    title: 'Water Molecule',
    category: 'Chemistry',
    icon: '💧',
    summary: 'Understand H₂O molecular geometry, polarity, and hydrogen bonding.',
    difficulty: 'Beginner',
    estimatedMinutes: 8,
    lessons: [
      { title: 'Molecular Structure', content: 'Water (H₂O) has a bent shape with a 104.5° bond angle. Oxygen is more electronegative, creating a polar molecule.' },
      { title: 'Hydrogen Bonding', content: 'Water molecules form hydrogen bonds between the partially negative oxygen and partially positive hydrogens of neighbouring molecules. This gives water its high boiling point and surface tension.' }
    ]
  },
  {
    id: 'electromagnetic-field',
    title: 'Electromagnetic Field',
    category: 'Physics',
    icon: '🧲',
    summary: 'Visualise electric and magnetic field lines and their interactions.',
    difficulty: 'Intermediate',
    estimatedMinutes: 15,
    lessons: [
      { title: 'Electric Fields', content: 'Electric fields radiate outward from positive charges and inward toward negative charges. Field strength follows Coulomb\'s law: F = kq₁q₂/r².' },
      { title: 'Magnetic Fields', content: 'Magnetic field lines form closed loops from north to south poles. Moving charges create magnetic fields, and changing magnetic fields induce electric fields.' },
      { title: 'Electromagnetic Waves', content: 'Oscillating electric and magnetic fields propagate as waves at the speed of light. The spectrum ranges from radio waves to gamma rays.' }
    ]
  }
];

const courses = [
  { id: 'physics-fundamentals', title: 'Physics Fundamentals', category: 'Physics', topics: ['solar-system', 'electromagnetic-field'], description: 'Core physics concepts from mechanics to electromagnetism.' },
  { id: 'biology-basics', title: 'Biology Basics', category: 'Biology', topics: ['human-heart', 'human-cell', 'dna-structure'], description: 'Introduction to living systems — cells, organs, and genetics.' },
  { id: 'chemistry-intro', title: 'Chemistry Introduction', category: 'Chemistry', topics: ['atom-structure', 'water-molecule'], description: 'Atoms, molecules, and chemical bonding fundamentals.' },
  { id: 'maths-geometry', title: 'Mathematics & Geometry', category: 'Mathematics', topics: ['geometric-shapes'], description: 'Explore geometric shapes, properties, and spatial reasoning.' }
];

// ─── API Routes ─────────────────────────────────────────────────────────────

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    message: 'VirtualLearn AI backend is running'
  });
});

// Get all topics
app.get('/api/topics', (req, res) => {
  const { category, search } = req.query;
  let result = topics;

  if (category && typeof category === 'string') {
    result = result.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    result = result.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  }

  res.json(result.map(({ lessons, ...rest }) => ({ ...rest, lessonCount: lessons.length })));
});

// Get single topic with lessons
app.get('/api/topics/:id', (req, res) => {
  const topic = topics.find(t => t.id === req.params.id);
  if (!topic) return res.status(404).json({ error: 'Topic not found' });
  res.json(topic);
});

// Get all courses
app.get('/api/courses', (req, res) => {
  res.json(courses);
});

// Get single course with populated topics
app.get('/api/courses/:id', (req, res) => {
  const course = courses.find(c => c.id === req.params.id);
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const populatedTopics = course.topics
    .map(tid => topics.find(t => t.id === tid))
    .filter(Boolean)
    .map(({ lessons, ...rest }) => ({ ...rest, lessonCount: lessons.length }));

  res.json({ ...course, topics: populatedTopics });
});

// Get announcements
app.get('/api/announcements', (req, res) => {
  res.json(store.announcements);
});

// Submit feedback (in-memory, resets on restart)
app.post('/api/feedback', (req, res) => {
  const { name, message } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }
  if (message.length > 1000) {
    return res.status(400).json({ error: 'Message too long (max 1000 characters)' });
  }

  const entry = {
    id: Date.now(),
    name: (typeof name === 'string' ? name.trim().slice(0, 50) : 'Anonymous') || 'Anonymous',
    message: message.trim().slice(0, 1000),
    date: new Date().toISOString()
  };

  store.feedback.push(entry);
  // Keep only last 100 feedback entries in memory
  if (store.feedback.length > 100) store.feedback = store.feedback.slice(-100);

  res.status(201).json({ success: true, id: entry.id });
});

// Save / retrieve bookmarks (per session key, in-memory)
app.get('/api/bookmarks/:key', (req, res) => {
  const key = req.params.key.slice(0, 50);
  res.json(store.bookmarks[key] || []);
});

app.post('/api/bookmarks/:key', (req, res) => {
  const key = req.params.key.slice(0, 50);
  const { items } = req.body;
  if (!Array.isArray(items) || items.length > 50) {
    return res.status(400).json({ error: 'Items must be an array with max 50 entries' });
  }
  store.bookmarks[key] = items.slice(0, 50).map(item => {
    if (typeof item !== 'string') return String(item).slice(0, 100);
    return item.slice(0, 100);
  });
  res.json({ success: true });
});

// Catch-all: serve index.html for SPA-style routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n  ✨ VirtualLearn AI server running at http://localhost:${PORT}\n`);
  console.log(`  API endpoints:`);
  console.log(`    GET  /api/health`);
  console.log(`    GET  /api/topics`);
  console.log(`    GET  /api/topics/:id`);
  console.log(`    GET  /api/courses`);
  console.log(`    GET  /api/courses/:id`);
  console.log(`    GET  /api/announcements`);
  console.log(`    POST /api/feedback`);
  console.log(`    GET  /api/bookmarks/:key`);
  console.log(`    POST /api/bookmarks/:key`);
  console.log(`\n  Note: In-memory data resets when the server restarts.\n`);
});
