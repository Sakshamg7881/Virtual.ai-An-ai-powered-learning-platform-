require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Security & Middlewares ──────────────────────────────────────────────────
// Allowed origins for CORS (local frontend development)
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5000',
  'http://127.0.0.1:5000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive for local development
  },
  credentials: true
}));

// Basic request size limit (100kb)
app.use(express.json({ limit: '100kb' }));

// Simple in-memory rate limiting (max 100 requests/minute per IP)
const rateLimitMap = new Map();
const rateLimiter = (limit = 100, windowMs = 60 * 1000) => (req, res, next) => {
  const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const record = rateLimitMap.get(ip) || { count: 0, resetTime: now + windowMs };

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else {
    record.count++;
  }
  rateLimitMap.set(ip, record);

  if (record.count > limit) {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: 'Rate limit exceeded. Please wait a minute before making more requests.',
      retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000)
    });
  }
  next();
};

app.use(rateLimiter(120, 60 * 1000));

// Serve static frontend files from public/
app.use(express.static(path.join(__dirname, '..', 'public')));

// ─── In-Memory Store ────────────────────────────────────────────────────────
// Data resets when the server restarts. No persistent database required.
const store = {
  announcements: [
    { id: 1, title: 'Welcome to VirtualLearn AI', body: 'Explore 3D models, test your knowledge in quizzes, and try the interactive Science Lab.', date: new Date().toISOString() },
    { id: 2, title: 'AI Assistant Active', body: 'Ask questions in Physics, Chemistry, Biology, Mathematics, or Computer Science.', date: new Date().toISOString() }
  ],
  feedback: [],
  bookmarks: {}
};

// ─── Topics Data (Science, Mathematics, Programming & Technology) ────────────
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
      { title: 'The Sun', content: 'The Sun is a G-type main-sequence star containing 99.86% of the Solar System\'s mass. Its core reaches 15 million°C.' },
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
      { title: 'Heart Function', content: 'The heart beats about 100,000 times per day, pumping approximately 7,500 litres of blood through systole and diastole phases.' }
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
      { title: 'Subatomic Particles', content: 'Atoms consist of protons (+), neutrons (0) in the central nucleus, and electrons (−) orbiting in electron shells.' },
      { title: 'Atomic Number', content: 'The atomic number (Z) equals the number of protons and defines the element. Carbon has Z=6.' },
      { title: 'Electron Shells', content: 'Electrons occupy quantized energy levels (2, 8, 8...). The outermost valence electrons dictate chemical reactivity.' }
    ]
  },
  {
    id: 'geometric-shapes',
    title: 'Geometric Shapes',
    category: 'Mathematics',
    icon: '📐',
    summary: 'Examine 3D polyhedra — cube, tetrahedron, octahedron, and Platonic solids.',
    difficulty: 'Beginner',
    estimatedMinutes: 8,
    lessons: [
      { title: 'Platonic Solids', content: 'There are exactly five Platonic solids: tetrahedron (4 faces), cube (6), octahedron (8), dodecahedron (12), and icosahedron (20).' },
      { title: 'Euler\'s Formula', content: 'Vertices (V), edges (E), and faces (F) satisfy Euler\'s formula: V − E + F = 2 for any convex polyhedron.' }
    ]
  },
  {
    id: 'dna-structure',
    title: 'DNA Structure',
    category: 'Biology',
    icon: '🧬',
    summary: 'Learn about the double helix, base pairs, and genetic coding.',
    difficulty: 'Intermediate',
    estimatedMinutes: 15,
    lessons: [
      { title: 'Double Helix', content: 'DNA is made of two complementary strands formed from sugar-phosphate backbones and four nitrogenous bases.' },
      { title: 'Base Pairing Rules', content: 'Adenine always pairs with Thymine (A-T) via two hydrogen bonds, and Guanine pairs with Cytosine (G-C) via three.' },
      { title: 'Transcription & Translation', content: 'Genes in DNA are transcribed into messenger RNA (mRNA), which ribosomes translate into sequences of amino acids to build proteins.' }
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
      { title: 'Cell Membrane', content: 'A phospholipid bilayer with embedded receptor and transport proteins controls what enters and exits the cell.' },
      { title: 'Cell Nucleus', content: 'Houses chromosomal DNA and coordinates cellular growth, metabolism, and protein synthesis.' },
      { title: 'Mitochondria', content: 'Often called the powerhouses of the cell, mitochondria generate ATP through cellular respiration.' }
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
      { title: 'Molecular Structure', content: 'Water (H₂O) has a bent shape with a 104.5° angle due to the two lone electron pairs on the oxygen atom.' },
      { title: 'Hydrogen Bonding', content: 'Partial negative charge on oxygen and partial positive charges on hydrogen create intermolecular hydrogen bonds, giving water high heat capacity.' }
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
      { title: 'Electric Fields', content: 'Electric fields radiate outward from positive charges and terminate on negative charges according to Coulomb\'s Law.' },
      { title: 'Magnetic Fields', content: 'Moving electric charges generate magnetic fields, and changing magnetic flux induces electromotive force (Faraday\'s Law).' },
      { title: 'Electromagnetic Radiation', content: 'Coupled electric and magnetic oscillations travel through space as waves at speed c (approx. 3×10⁸ m/s).' }
    ]
  },
  {
    id: 'algorithms-basics',
    title: 'Algorithms & Problem Solving',
    category: 'Computer Science',
    icon: '💻',
    summary: 'Learn computational thinking, algorithmic complexity, and foundational data structures.',
    difficulty: 'Beginner',
    estimatedMinutes: 14,
    lessons: [
      { title: 'What is an Algorithm?', content: 'An algorithm is a well-defined, step-by-step computational procedure that takes inputs and produces outputs.' },
      { title: 'Time & Space Complexity', content: 'Big-O notation describes how execution time or memory requirements scale with input size n (e.g. O(1), O(n), O(n²)).' },
      { title: 'Core Control Structures', content: 'Sequencing, selection (if/else conditionals), and iteration (loops) form the universal foundation of computer programs.' }
    ]
  },
  {
    id: 'web-technologies',
    title: 'Web & Internet Technologies',
    category: 'Technology',
    icon: '🌐',
    summary: 'Understand how the internet, HTTP, clients, servers, and modern web applications work.',
    difficulty: 'Beginner',
    estimatedMinutes: 12,
    lessons: [
      { title: 'Client-Server Architecture', content: 'Web browsers (clients) send HTTP requests across the network to servers, which process data and return responses.' },
      { title: 'HTTP Methods & Status Codes', content: 'Standard methods include GET (retrieve) and POST (submit). Status codes indicate outcome: 200 (OK), 400 (Bad Request), 404 (Not Found).' },
      { title: 'Frontend vs Backend', content: 'Frontend code (HTML, CSS, JS) renders interfaces in the browser; backend code (Node.js, APIs) processes logic and protects sensitive credentials.' }
    ]
  }
];

// ─── Courses Data ────────────────────────────────────────────────────────────
const courses = [
  {
    id: 'physics-fundamentals',
    title: 'Physics Fundamentals',
    category: 'Physics',
    difficulty: 'Beginner to Intermediate',
    topics: ['solar-system', 'electromagnetic-field'],
    description: 'Explore motion, forces, planetary gravitation, and electromagnetic fields through interactive models.'
  },
  {
    id: 'biology-basics',
    title: 'Biology & Living Systems',
    category: 'Biology',
    difficulty: 'Beginner',
    topics: ['human-heart', 'human-cell', 'dna-structure'],
    description: 'An engaging journey into cellular machinery, human cardiovascular anatomy, and the genetic code.'
  },
  {
    id: 'chemistry-intro',
    title: 'Introductory Chemistry',
    category: 'Chemistry',
    difficulty: 'Beginner',
    topics: ['atom-structure', 'water-molecule'],
    description: 'Discover the atomic elements, subatomic particles, molecular geometry, and chemical bonding.'
  },
  {
    id: 'maths-geometry',
    title: 'Mathematics & Spatial Geometry',
    category: 'Mathematics',
    difficulty: 'Beginner',
    topics: ['geometric-shapes'],
    description: 'Master geometric reasoning, Platonic solids, vertices, and spatial coordinate visualization.'
  },
  {
    id: 'computer-science-core',
    title: 'Computer Science & Modern Technology',
    category: 'Computer Science',
    difficulty: 'Beginner',
    topics: ['algorithms-basics', 'web-technologies'],
    description: 'Understand computational thinking, algorithmic efficiency, client-server architecture, and APIs.'
  }
];

// ─── Quiz Master Data (52 Original STEM Questions from public/quiz-data.js) ──
const { quizzesData, questions: allQuizQuestions } = require('../public/quiz-data.js');


// Predefined Demo Assistant Responses (used when no real AI key is configured)
const demoTutorDictionary = [
  {
    keywords: ['pythag', 'triangle', 'hypotenuse'],
    reply: 'In any right-angled triangle, the square of the hypotenuse c equals the sum of the squares of the other two sides: a² + b² = c².\n\nExample: If side a = 3 and side b = 4, then 3² + 4² = 9 + 16 = 25, which gives c = √25 = 5.\n\nFollow-up Questions:\n- How is the Pythagorean theorem related to the distance formula?\n- What is the law of cosines?'
  },
  {
    keywords: ['derivative', 'calculus', 'slope', 'rate'],
    reply: 'A derivative measures the instantaneous rate of change of a function — geometrically, it represents the slope of the tangent line at any point.\n\nFor power functions, the power rule states: d/dx(xⁿ) = n·xⁿ⁻¹. For example, the derivative of x² is 2x.\n\nFollow-up Questions:\n- What is an integral in calculus?\n- How does velocity relate to derivatives?'
  },
  {
    keywords: ['newton', 'force', 'motion', 'inertia'],
    reply: 'Newton formulated three laws of motion:\n1. Inertia: An object remains at rest or in uniform motion unless acted upon by a net force.\n2. Acceleration: F = ma (Force = mass × acceleration).\n3. Action & Reaction: For every action, there is an equal and opposite reaction.\n\nFollow-up Questions:\n- How does friction affect Newton\'s second law?\n- What is momentum?'
  },
  {
    keywords: ['ohm', 'voltage', 'current', 'resistance', 'circuit'],
    reply: 'Ohm\'s Law relates electric potential, current, and resistance: V = I × R (or I = V / R).\n\nVoltage (V in volts) pushes electrical charge, current (I in amperes) is the flow of electrons, and resistance (R in ohms) opposes flow. You can test this live in our Science Lab!\n\nFollow-up Questions:\n- How does electrical power (P = VI) relate to Ohm\'s Law?\n- What is the difference between series and parallel circuits?'
  },
  {
    keywords: ['atom', 'proton', 'electron', 'neutron'],
    reply: 'An atom is the basic unit of a chemical element. It features a dense central nucleus of positively charged protons and neutral neutrons, surrounded by orbiting negatively charged electrons.\n\nThe atomic number equals the number of protons and uniquely identifies each element.\n\nFollow-up Questions:\n- What are isotopes?\n- How do electron shells determine chemical reactivity?'
  },
  {
    keywords: ['algorithm', 'code', 'program', 'computer', 'binary', 'variable'],
    reply: 'An algorithm is an unambiguous, step-by-step computational procedure for solving a class of problems.\n\nAlgorithms are evaluated by their correctness and their time/space computational complexity (expressed in Big-O notation like O(n) or O(n log n)).\n\nFollow-up Questions:\n- What is the difference between linear search and binary search?\n- How does recursion work in algorithms?'
  },
  {
    keywords: ['dna', 'gene', 'genetic', 'chromosome'],
    reply: 'DNA (deoxyribonucleic acid) carries the hereditary instructions for all living organisms. Structured as a double helix, it pairs Adenine with Thymine (A-T) and Guanine with Cytosine (G-C).\n\nGenes are specific nucleotide sequences that code for functional proteins.\n\nFollow-up Questions:\n- How does RNA differ from DNA?\n- What causes genetic mutations?'
  }
];

// ─── API Routes ─────────────────────────────────────────────────────────────

// 1. GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    message: 'VirtualLearn AI demo backend is active and healthy',
    features: ['dashboard', 'courses', 'topics', 'quizzes', 'assistant', 'rate-limiting']
  });
});

// 2. GET /api/dashboard
app.get('/api/dashboard', (req, res) => {
  res.json({
    isDemoData: true,
    studentProfile: {
      displayName: 'Demo Student (Sample Profile)',
      enrolledCourses: 4,
      totalPoints: 340,
      currentBadge: 'Explorer 🗺️'
    },
    statistics: {
      topicsCompleted: 5,
      totalTopicsAvailable: topics.length,
      quizzesAttempted: 6,
      averageScorePercent: 88,
      streakDays: 4,
      labHoursLogged: 3.2
    },
    completedLessons: [
      { topicId: 'solar-system', title: 'Solar System', category: 'Physics', completedAt: '2026-10-20' },
      { topicId: 'human-heart', title: 'Human Heart', category: 'Biology', completedAt: '2026-10-21' },
      { topicId: 'atom-structure', title: 'Atom Structure', category: 'Chemistry', completedAt: '2026-10-21' },
      { topicId: 'circuit-lab', title: 'Circuit Lab', category: 'Physics', completedAt: '2026-10-22' },
      { topicId: 'algorithms-basics', title: 'Algorithms & Problem Solving', category: 'Computer Science', completedAt: '2026-10-23' }
    ],
    recentQuizScores: [
      { category: 'Physics', score: 5, total: 5, percentage: 100, date: '2026-10-22' },
      { category: 'Computer Science', score: 5, total: 5, percentage: 100, date: '2026-10-22' },
      { category: 'Mathematics', score: 4, total: 5, percentage: 80, date: '2026-10-21' },
      { category: 'Chemistry', score: 4, total: 5, percentage: 80, date: '2026-10-20' }
    ],
    sampleNote: 'Sample student performance statistics provided by the demo backend. LocalStorage progress on the client remains persistent.'
  });
});

// 3. GET /api/courses
app.get('/api/courses', (req, res) => {
  const result = courses.map(course => ({
    id: course.id,
    title: course.title,
    category: course.category,
    difficulty: course.difficulty,
    description: course.description,
    topicCount: course.topics.length,
    lessonCount: course.topics.reduce((acc, tid) => {
      const top = topics.find(t => t.id === tid);
      return acc + (top ? top.lessons.length : 0);
    }, 0)
  }));
  res.json(result);
});

// 4. GET /api/courses/:id
app.get('/api/courses/:id', (req, res) => {
  const { id } = req.params;
  const course = courses.find(c => c.id.toLowerCase() === id.toLowerCase());

  if (!course) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Course with id "${id}" was not found.`
    });
  }

  const populatedTopics = course.topics
    .map(tid => topics.find(t => t.id === tid))
    .filter(Boolean);

  res.json({
    ...course,
    topics: populatedTopics,
    totalLessons: populatedTopics.reduce((acc, t) => acc + t.lessons.length, 0)
  });
});

// 5. GET /api/topics
app.get('/api/topics', (req, res) => {
  const { category, search } = req.query;
  let result = topics;

  if (category && typeof category === 'string') {
    result = result.filter(t => t.category.toLowerCase() === category.toLowerCase().trim());
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    result = result.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.summary.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q)
    );
  }

  res.json(result.map(({ lessons, ...rest }) => ({
    ...rest,
    lessonCount: lessons.length
  })));
});

// GET /api/topics/:id
app.get('/api/topics/:id', (req, res) => {
  const topic = topics.find(t => t.id.toLowerCase() === req.params.id.toLowerCase());
  if (!topic) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Topic with id "${req.params.id}" was not found.`
    });
  }
  res.json(topic);
});

// 6. GET /api/quizzes
app.get('/api/quizzes', (req, res) => {
  const { category } = req.query;

  if (category && typeof category === 'string') {
    const matched = Object.keys(quizzesData).find(k => k.toLowerCase() === category.toLowerCase().trim());
    if (!matched) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Quiz category "${category}" not found. Available categories: ${Object.keys(quizzesData).join(', ')}`
      });
    }
    const qz = quizzesData[matched];
    // Return questions without disclosing server answerIndex
    return res.json({
      category: qz.category,
      description: qz.description,
      questionCount: qz.questions.length,
      questions: qz.questions.map(({ answerIndex, ...q }) => q)
    });
  }

  // Return summaries for all categories
  const all = Object.values(quizzesData).map(qz => ({
    category: qz.category,
    description: qz.description,
    questionCount: qz.questions.length,
    questions: qz.questions.map(({ answerIndex, ...q }) => q)
  }));

  res.json(all);
});

// 7. POST /api/quizzes/submit
app.post('/api/quizzes/submit', (req, res) => {
  const { category, answers, questionIds } = req.body || {};

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Answers must be provided as an object or array.'
    });
  }

  let questionsToEvaluate = [];
  let evaluatedCategory = category || 'Custom Quiz';

  if (Array.isArray(questionIds) && questionIds.length > 0) {
    questionsToEvaluate = questionIds.map(id => allQuizQuestions.find(q => q.id === id)).filter(Boolean);
  } else if (category && quizzesData[category]) {
    questionsToEvaluate = quizzesData[category].questions;
    evaluatedCategory = category;
  } else if (category) {
    const matchedKey = Object.keys(quizzesData).find(k => k.toLowerCase() === String(category).toLowerCase().trim());
    if (matchedKey) {
      questionsToEvaluate = quizzesData[matchedKey].questions;
      evaluatedCategory = matchedKey;
    }
  }

  if (questionsToEvaluate.length === 0) {
    // If neither category nor valid questionIds, default to all questions or bad request
    return res.status(400).json({
      error: 'Bad Request',
      message: 'A valid category or questionIds array must be provided.'
    });
  }

  let correctCount = 0;
  const questionResults = [];

  questionsToEvaluate.forEach((q, idx) => {
    let selectedOption = null;
    if (Array.isArray(answers)) {
      selectedOption = answers[idx];
    } else if (answers[q.id] !== undefined) {
      selectedOption = answers[q.id];
    } else if (answers[idx] !== undefined) {
      selectedOption = answers[idx];
    }

    const isAnswered = selectedOption !== null && selectedOption !== undefined && selectedOption !== '';
    const numericSelected = isAnswered ? Number(selectedOption) : null;
    const isCorrect = isAnswered && numericSelected === q.answerIndex;
    if (isCorrect) correctCount++;

    questionResults.push({
      questionId: q.id,
      question: q.question,
      category: q.category,
      level: q.level,
      selectedIndex: numericSelected,
      selectedAnswer: isAnswered && q.options[numericSelected] ? q.options[numericSelected] : 'Unanswered',
      correctIndex: q.answerIndex,
      correctAnswer: q.options[q.answerIndex],
      isCorrect: isCorrect,
      explanation: q.explanation || 'Verified conceptual reasoning provided by VirtualLearn AI question bank.'
    });
  });

  const total = questionsToEvaluate.length;
  const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  const pointsEarned = correctCount * 10 + (correctCount === total && total > 0 ? 10 : 0);

  res.json({
    success: true,
    category: evaluatedCategory,
    score: correctCount,
    total: total,
    percentage: percentage,
    pointsEarned: pointsEarned,
    feedback: percentage === 100
      ? 'Outstanding! Perfect score achieved.'
      : percentage >= 70
        ? 'Great job! Strong subject understanding.'
        : 'Good effort! Review the explanations and retry.',
    results: questionResults
  });
});

// 8. POST /api/assistant/chat (and /api/chat)
const handleAssistantChat = async (req, res) => {
  const { message, level, history } = req.body || {};

  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({
      error: 'Bad Request',
      message: 'A non-empty "message" string is required in the request body.'
    });
  }

  const userPrompt = message.trim();
  const apiKey = process.env.GEMINI_API_KEY;
  const hasRealKey = Boolean(apiKey && apiKey.trim() !== '' && !apiKey.includes('YOUR_GEMINI_API_KEY'));

  // If a real AI provider (Google Gemini) is configured with an active key:
  if (hasRealKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey.trim());
      const isInter = level === 'i';
      const systemPrompt = `You are an AI Tutor Agent for VirtualLearn AI, an educational learning platform.
Target Student Level: ${isInter ? 'Intermediate (High school / College, include technical formulations and depth)' : 'Beginner (Intuitive, encouraging, simple, and relatable)'}.
Subjects: Physics, Chemistry, Biology, Mathematics, and Computer Science.

Guidelines:
1. Provide accurate, clear, engaging, and well-structured answers with markdown.
2. Keep explanations concise (2-4 paragraphs max).
3. End with 2-3 relevant questions formatted like:
Follow-up Questions:
- [Question 1]
- [Question 2]
- [Question 3]
4. Politely decline questions unrelated to academic learning, science, or technology.`;

      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt,
        generationConfig: { maxOutputTokens: 800, temperature: 0.7 }
      });

      let contents = [];
      if (Array.isArray(history) && history.length > 0) {
        for (const turn of history.slice(-6)) {
          if (!turn.x) continue;
          contents.push({
            role: turn.r === 'u' ? 'user' : 'model',
            parts: [{ text: turn.x }]
          });
        }
      }
      contents.push({ role: 'user', parts: [{ text: userPrompt }] });

      const result = await model.generateContent({ contents });
      const reply = result.response.text();

      return res.json({
        reply: reply,
        provider: 'Google Gemini 1.5 Flash',
        isDemo: false,
        success: true
      });
    } catch (err) {
      console.warn('Real AI provider error, gracefully switching to labeled demo response:', err.message);
      // Fall through to clearly labeled demo response
    }
  }

  // Predefined Demo Mode Response (Clearly labeled, never pretending to be real AI)
  const queryLower = userPrompt.toLowerCase();
  const matched = demoTutorDictionary.find(entry => entry.keywords.some(k => queryLower.includes(k)));

  const demoReply = matched
    ? matched.reply
    : `I am currently operating in **Demo Mode (Predefined Responses)**.\n\nI can explain concepts across STEM, including Ohm's Law, Newton's Laws, the Pythagorean Theorem, Calculus Derivatives, Atoms, DNA, or Algorithms.\n\nFollow-up Questions:\n- Explain Ohm's Law\n- What is an atom?\n- Explain Newton's laws`;

  return res.json({
    reply: demoReply,
    provider: 'Predefined Demo Responses',
    isDemo: true,
    notice: 'Demo mode active. Responses are curated predefined explanations. To enable live Gemini AI, set GEMINI_API_KEY in the server .env file.',
    success: true
  });
};

app.post('/api/assistant/chat', handleAssistantChat);
app.post('/api/chat', handleAssistantChat);

// GET /api/ai/status
app.get('/api/ai/status', (req, res) => {
  const key = process.env.GEMINI_API_KEY;
  const hasRealKey = Boolean(key && key.trim() !== '' && !key.includes('YOUR_GEMINI_API_KEY'));
  res.json({
    configured: hasRealKey,
    provider: hasRealKey ? 'Google Gemini' : 'Predefined Demo Responses',
    model: hasRealKey ? 'gemini-1.5-flash' : 'Demo Pattern Engine',
    isDemo: !hasRealKey
  });
});

// Additional helpful backend routes
app.get('/api/announcements', (req, res) => res.json(store.announcements));

app.post('/api/feedback', (req, res) => {
  const { name, message } = req.body || {};
  if (!message || typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required' });
  }
  const entry = {
    id: Date.now(),
    name: (typeof name === 'string' && name.trim()) ? name.trim().slice(0, 50) : 'Anonymous Student',
    message: message.trim().slice(0, 1000),
    date: new Date().toISOString()
  };
  store.feedback.push(entry);
  if (store.feedback.length > 100) store.feedback = store.feedback.slice(-100);
  res.status(201).json({ success: true, id: entry.id });
});

app.get('/api/bookmarks/:key', (req, res) => {
  const key = req.params.key.slice(0, 50);
  res.json(store.bookmarks[key] || []);
});

app.post('/api/bookmarks/:key', (req, res) => {
  const key = req.params.key.slice(0, 50);
  const { items } = req.body || {};
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items must be an array' });
  }
  store.bookmarks[key] = items.slice(0, 50).map(i => String(i).slice(0, 100));
  res.json({ success: true });
});

// Catch-all: serve index.html for SPA client-side routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred on the server.'
  });
});

app.listen(PORT, () => {
  console.log(`\n  ✨ VirtualLearn AI Server running at http://localhost:${PORT}\n`);
  console.log(`  Functional Endpoints:`);
  console.log(`    GET   /api/health`);
  console.log(`    GET   /api/dashboard`);
  console.log(`    GET   /api/courses`);
  console.log(`    GET   /api/courses/:id`);
  console.log(`    GET   /api/topics`);
  console.log(`    GET   /api/topics/:id`);
  console.log(`    GET   /api/quizzes`);
  console.log(`    POST  /api/quizzes/submit`);
  console.log(`    POST  /api/assistant/chat (alias: POST /api/chat)`);
  console.log(`    GET   /api/ai/status`);
  console.log(`    GET   /api/announcements`);
  console.log(`    POST  /api/feedback`);
  console.log(`\n  Ready for testing!`);
});

module.exports = app;
