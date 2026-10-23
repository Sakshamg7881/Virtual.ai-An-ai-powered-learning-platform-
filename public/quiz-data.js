/**
 * VirtualLearn AI — Comprehensive STEM Question Bank
 * 52 Original, Rigorously Verified Educational Questions
 * Categories: Mathematics, Physics, Chemistry, Biology, Computer Science, General Science
 * Difficulty Tiers: Beginner, Intermediate, Advanced
 */

(function(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.QUIZ_DATA = factory();
  }
})(typeof self !== 'undefined' ? self : this, function() {

  const questions = [
    // ═════════════════════════════════════════════════════════════════════════
    // MATHEMATICS (10 Questions)
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'm1',
      category: 'Mathematics',
      level: 'Beginner',
      question: 'In a right-angled triangle, if legs are a = 6 and b = 8, what is the length of hypotenuse c?',
      options: ['10', '12', '14', '100'],
      answerIndex: 0,
      explanation: 'Definition: By the Pythagorean Theorem, c² = a² + b². Calculation: 6² + 8² = 36 + 64 = 100. Thus c = √100 = 10 units.'
    },
    {
      id: 'm2',
      category: 'Mathematics',
      level: 'Beginner',
      question: 'What is the derivative of f(x) = x³ with respect to x?',
      options: ['3x²', 'x²', '3x', 'x⁴/4'],
      answerIndex: 0,
      explanation: 'Formula: By the Power Rule of differentiation, d/dx(xⁿ) = n·xⁿ⁻¹. For n = 3, d/dx(x³) = 3x².'
    },
    {
      id: 'm3',
      category: 'Mathematics',
      level: 'Beginner',
      question: 'What is the exact value of sin(30°)?',
      options: ['1/2', '√3/2', '√2/2', '1'],
      answerIndex: 0,
      explanation: 'Trigonometry: In a 30°-60°-90° right triangle, the side opposite the 30° angle is exactly half the length of the hypotenuse. Therefore, sin(30°) = 1/2.'
    },
    {
      id: 'm4',
      category: 'Mathematics',
      level: 'Beginner',
      question: 'What is the area of a circle having a radius of r = 7 cm (using π ≈ 22/7)?',
      options: ['154 cm²', '44 cm²', '308 cm²', '49 cm²'],
      answerIndex: 0,
      explanation: 'Formula: Area A = π·r². Calculation: A = (22/7) × 7² = (22/7) × 49 = 22 × 7 = 154 cm².'
    },
    {
      id: 'm5',
      category: 'Mathematics',
      level: 'Intermediate',
      question: 'What are the real roots of the quadratic equation x² − 7x + 12 = 0?',
      options: ['x = 3 and x = 4', 'x = −3 and x = −4', 'x = 2 and x = 6', 'x = 1 and x = 12'],
      answerIndex: 0,
      explanation: 'Factoring: We look for numbers that multiply to 12 and add to −7, which are −3 and −4. (x − 3)(x − 4) = 0 gives roots x = 3 and x = 4.'
    },
    {
      id: 'm6',
      category: 'Mathematics',
      level: 'Intermediate',
      question: 'Using the Chain Rule, what is the derivative of f(x) = sin(4x)?',
      options: ['4 cos(4x)', 'cos(4x)', '−4 cos(4x)', '4 sin(4x)'],
      answerIndex: 0,
      explanation: 'Chain Rule: d/dx[sin(u)] = cos(u) · (du/dx). With u = 4x, du/dx = 4. Hence, d/dx[sin(4x)] = 4 cos(4x).'
    },
    {
      id: 'm7',
      category: 'Mathematics',
      level: 'Intermediate',
      question: 'What is the sum of interior angles of a convex hexagon (6 sides)?',
      options: ['720°', '540°', '900°', '360°'],
      answerIndex: 0,
      explanation: 'Formula: For any n-sided convex polygon, sum = (n − 2) × 180°. For n = 6: (6 − 2) × 180° = 4 × 180° = 720°.'
    },
    {
      id: 'm8',
      category: 'Mathematics',
      level: 'Advanced',
      question: 'What is the value of the definite integral ∫₀² (3x² + 2x) dx?',
      options: ['12', '10', '16', '8'],
      answerIndex: 0,
      explanation: 'Integration: Antiderivative F(x) = x³ + x². Evaluate from 0 to 2: F(2) = 2³ + 2² = 8 + 4 = 12. F(0) = 0. Value = 12 − 0 = 12.'
    },
    {
      id: 'm9',
      category: 'Mathematics',
      level: 'Advanced',
      question: 'When rolling two fair standard six-sided dice, what is the probability that the sum of the faces equals 7?',
      options: ['1/6', '1/12', '5/36', '7/36'],
      answerIndex: 0,
      explanation: 'Probability: Total possible outcomes = 6 × 6 = 36. Pairs summing to 7 are: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1) = 6 favorable outcomes. P = 6/36 = 1/6.'
    },
    {
      id: 'm10',
      category: 'Mathematics',
      level: 'Advanced',
      question: 'What are the eigenvalues of the diagonal matrix A = [[3, 0], [0, 8]]?',
      options: ['λ = 3 and λ = 8', 'λ = 11 and λ = 24', 'λ = 5 and λ = 3', 'λ = 0 and λ = 1'],
      answerIndex: 0,
      explanation: 'Linear Algebra: For any triangular or diagonal matrix, the eigenvalues are simply the entries along the main diagonal. Thus λ₁ = 3 and λ₂ = 8.'
    },

    // ═════════════════════════════════════════════════════════════════════════
    // PHYSICS (10 Questions)
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'p1',
      category: 'Physics',
      level: 'Beginner',
      question: 'What is the standard International System (SI) unit of force?',
      options: ['Newton (N)', 'Joule (J)', 'Watt (W)', 'Pascal (Pa)'],
      answerIndex: 0,
      explanation: 'Definition: Force is measured in Newtons (N) in SI units. One Newton is the force needed to accelerate 1 kilogram of mass at 1 meter per second squared (1 N = 1 kg·m/s²).'
    },
    {
      id: 'p2',
      category: 'Physics',
      level: 'Beginner',
      question: 'A net horizontal force of 30 N acts on a 6 kg object. What is its acceleration?',
      options: ['5 m/s²', '180 m/s²', '0.2 m/s²', '36 m/s²'],
      answerIndex: 0,
      explanation: 'Formula: Newton\'s Second Law states F = m·a. Rearranging for acceleration: a = F / m = 30 N / 6 kg = 5 m/s².'
    },
    {
      id: 'p3',
      category: 'Physics',
      level: 'Beginner',
      question: 'According to Ohm\'s Law (I = V / R), if the resistance R is doubled while voltage V is held constant, what happens to current I?',
      options: ['It is halved', 'It is doubled', 'It remains unchanged', 'It quadruples'],
      answerIndex: 0,
      explanation: 'Ohm\'s Law: Current I is inversely proportional to resistance R. If R is multiplied by 2, current I becomes I/2 (halved).'
    },
    {
      id: 'p4',
      category: 'Physics',
      level: 'Beginner',
      question: 'What is the approximate speed of electromagnetic waves in a vacuum?',
      options: ['3.0 × 10⁸ m/s', '3.0 × 10⁶ m/s', '343 m/s', '1.5 × 10⁸ m/s'],
      answerIndex: 0,
      explanation: 'Speed of Light: The universal physical constant c is approximately 299,792,458 m/s, conventionally rounded to 3.0 × 10⁸ m/s.'
    },
    {
      id: 'p5',
      category: 'Physics',
      level: 'Beginner',
      question: 'What is the kinetic energy of a 2 kg cart moving at a velocity of 4 m/s?',
      options: ['16 Joules', '8 Joules', '32 Joules', '4 Joules'],
      answerIndex: 0,
      explanation: 'Formula: Kinetic Energy KE = ½ · m · v². Calculation: KE = 0.5 × 2 kg × (4 m/s)² = 1 × 16 = 16 Joules.'
    },
    {
      id: 'p6',
      category: 'Physics',
      level: 'Intermediate',
      question: 'In projectile motion (ignoring air drag), at what launch angle relative to horizontal is the ground range maximized?',
      options: ['45°', '30°', '60°', '90°'],
      answerIndex: 0,
      explanation: 'Range Formula: R = (v₀² sin 2θ) / g. Range is maximum when sin(2θ) = 1, which occurs when 2θ = 90°, so θ = 45°.'
    },
    {
      id: 'p7',
      category: 'Physics',
      level: 'Intermediate',
      question: 'When a sound source moves directly toward a stationary observer, what does the observer perceive due to the Doppler Effect?',
      options: ['Higher apparent frequency (higher pitch)', 'Lower apparent frequency', 'Slower speed of sound', 'Longer wavelength'],
      answerIndex: 0,
      explanation: 'Doppler Effect: Approaching motion compresses wave crests toward the observer, decreasing perceived wavelength and increasing perceived frequency f′ = f(v / (v − v_s)).'
    },
    {
      id: 'p8',
      category: 'Physics',
      level: 'Intermediate',
      question: 'How much electrical power is dissipated as heat in a 10 Ω resistor carrying a constant current of 3 A?',
      options: ['90 Watts', '30 Watts', '300 Watts', '3.3 Watts'],
      answerIndex: 0,
      explanation: 'Joule Heating: Electrical power P = I² · R. Calculation: P = (3 A)² × 10 Ω = 9 × 10 = 90 Watts.'
    },
    {
      id: 'p9',
      category: 'Physics',
      level: 'Advanced',
      question: 'According to de Broglie\'s quantum hypothesis, what is the wavelength λ of a particle with momentum p?',
      options: ['λ = h / p', 'λ = p / h', 'λ = h · p', 'λ = h / p²'],
      answerIndex: 0,
      explanation: 'Quantum Mechanics: Louis de Broglie proposed that matter exhibits wave-particle duality, with wavelength λ = h / p, where h is Planck\'s constant (6.626 × 10⁻³⁴ J·s).'
    },
    {
      id: 'p10',
      category: 'Physics',
      level: 'Advanced',
      question: 'What is the formula for the escape velocity v_esc from the surface of a spherical planet of mass M and radius R?',
      options: ['v_esc = √(2GM / R)', 'v_esc = √(GM / R)', 'v_esc = 2GM / R²', 'v_esc = √(GM / 2R)'],
      answerIndex: 0,
      explanation: 'Conservation of Energy: Kinetic energy must balance gravitational potential energy: ½ m v² = G M m / R. Solving for velocity yields v_esc = √(2GM / R).'
    },

    // ═════════════════════════════════════════════════════════════════════════
    // CHEMISTRY (9 Questions)
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'c1',
      category: 'Chemistry',
      level: 'Beginner',
      question: 'What is the standard chemical symbol for Sodium on the Periodic Table?',
      options: ['Na', 'S', 'So', 'N'],
      answerIndex: 0,
      explanation: 'Element Symbol: Sodium derives its symbol "Na" from the Latin name "Natrium". Its atomic number is 11.'
    },
    {
      id: 'c2',
      category: 'Chemistry',
      level: 'Beginner',
      question: 'What is the pH value of pure neutral water at room temperature (25°C)?',
      options: ['7', '1', '14', '0'],
      answerIndex: 0,
      explanation: 'Acidity Scale: At 25°C, [H⁺] = 1.0 × 10⁻⁷ M, so pH = −log[H⁺] = 7, representing neutral pH.'
    },
    {
      id: 'c3',
      category: 'Chemistry',
      level: 'Beginner',
      question: 'How many valence electrons does a neutral Carbon atom have in its ground state?',
      options: ['4', '2', '6', '8'],
      answerIndex: 0,
      explanation: 'Electron Configuration: Carbon (Z = 6) has configuration 1s² 2s² 2p². The outermost n = 2 energy level contains 2 + 2 = 4 valence electrons.'
    },
    {
      id: 'c4',
      category: 'Chemistry',
      level: 'Beginner',
      question: 'What type of chemical bond is formed when atoms share one or more pairs of electrons?',
      options: ['Covalent bond', 'Ionic bond', 'Metallic bond', 'Hydrogen bond'],
      answerIndex: 0,
      explanation: 'Bonding: Covalent bonds involve the sharing of electron pairs between nonmetal atoms to attain stable noble-gas electron configurations.'
    },
    {
      id: 'c5',
      category: 'Chemistry',
      level: 'Intermediate',
      question: 'How many moles of water molecules (H₂O) are present in 36 grams of pure water (molar mass = 18 g/mol)?',
      options: ['2 moles', '1 mole', '3 moles', '0.5 moles'],
      answerIndex: 0,
      explanation: 'Stoichiometry: Moles n = mass / molar mass = 36 g / 18 g/mol = 2.0 moles, representing 2 × 6.022 × 10²³ molecules.'
    },
    {
      id: 'c6',
      category: 'Chemistry',
      level: 'Intermediate',
      question: 'What is the oxidation state of Sulfur (S) in sulfuric acid (H₂SO₄)?',
      options: ['+6', '+4', '−2', '+2'],
      answerIndex: 0,
      explanation: 'Oxidation Number Rules: H is +1 (total +2), O is −2 (total −8). Neutral molecule: (+2) + S + (−8) = 0, giving S = +6.'
    },
    {
      id: 'c7',
      category: 'Chemistry',
      level: 'Intermediate',
      question: 'Which element is the most electronegative on the Pauling scale?',
      options: ['Fluorine (F)', 'Oxygen (O)', 'Chlorine (Cl)', 'Nitrogen (N)'],
      answerIndex: 0,
      explanation: 'Periodic Trends: Electronegativity increases across a period and decreases down a group. Fluorine has the highest value (approx. 4.0).'
    },
    {
      id: 'c8',
      category: 'Chemistry',
      level: 'Advanced',
      question: 'According to Le Chatelier\'s Principle, what happens to an exothermic equilibrium reaction (N₂ + 3H₂ ⇌ 2NH₃ + heat) if the temperature is increased?',
      options: ['Equilibrium shifts left toward reactants (less NH₃ formed)', 'Equilibrium shifts right toward products', 'No change in equilibrium position', 'Rate of forward reaction slows to zero'],
      answerIndex: 0,
      explanation: 'Chemical Equilibrium: In an exothermic reaction, heat is a product. Adding heat shifts equilibrium in the reverse endothermic direction to absorb heat, forming more reactants.'
    },
    {
      id: 'c9',
      category: 'Chemistry',
      level: 'Advanced',
      question: 'What is the hybridization of each Carbon atom in the planar benzene ring (C₆H₆)?',
      options: ['sp²', 'sp³', 'sp', 'dsp²'],
      answerIndex: 0,
      explanation: 'Molecular Geometry: Each carbon in benzene forms 3 sigma bonds (trigonal planar geometry, 120° angles) and participates in delocalized pi bonding, corresponding to sp² hybridization.'
    },

    // ═════════════════════════════════════════════════════════════════════════
    // BIOLOGY (9 Questions)
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'b1',
      category: 'Biology',
      level: 'Beginner',
      question: 'Which intracellular organelle is known as the "powerhouse of the cell" due to ATP generation?',
      options: ['Mitochondria', 'Ribosome', 'Nucleus', 'Endoplasmic Reticulum'],
      answerIndex: 0,
      explanation: 'Cell Biology: Mitochondria produce the majority of cellular adenosine triphosphate (ATP) through oxidative phosphorylation during aerobic cellular respiration.'
    },
    {
      id: 'b2',
      category: 'Biology',
      level: 'Beginner',
      question: 'In standard DNA base pairing rules (Watson-Crick), Adenine (A) pairs specifically with which base?',
      options: ['Thymine (T)', 'Guanine (G)', 'Cytosine (C)', 'Uracil (U)'],
      answerIndex: 0,
      explanation: 'Molecular Genetics: In double-stranded DNA, Adenine (A) forms two hydrogen bonds with Thymine (T), while Guanine (G) forms three hydrogen bonds with Cytosine (C).'
    },
    {
      id: 'b3',
      category: 'Biology',
      level: 'Beginner',
      question: 'In eukaryotic plant cells, where does the light-dependent stage of photosynthesis occur?',
      options: ['Chloroplasts', 'Mitochondria', 'Vacuoles', 'Centrosomes'],
      answerIndex: 0,
      explanation: 'Photosynthesis: Chloroplasts contain chlorophyll pigments in thylakoid membrane stacks (grana) that harvest light energy to convert CO₂ and water into glucose.'
    },
    {
      id: 'b4',
      category: 'Biology',
      level: 'Beginner',
      question: 'How many total chromosomes are present in a typical human somatic (body) cell?',
      options: ['46 (23 pairs)', '23', '44', '48'],
      answerIndex: 0,
      explanation: 'Human Genetics: Humans have diploid somatic cells with 2n = 46 chromosomes (22 pairs of autosomes and 1 pair of sex chromosomes XX or XY).'
    },
    {
      id: 'b5',
      category: 'Biology',
      level: 'Intermediate',
      question: 'Which chamber of the human heart possesses the thickest muscular wall and pumps oxygenated blood into the systemic aorta?',
      options: ['Left Ventricle', 'Right Ventricle', 'Left Atrium', 'Right Atrium'],
      answerIndex: 0,
      explanation: 'Cardiovascular Anatomy: The left ventricle must overcome high systemic vascular resistance to pump blood throughout the entire body, requiring a thick myocardium.'
    },
    {
      id: 'b6',
      category: 'Biology',
      level: 'Intermediate',
      question: 'What is the primary biological role of messenger RNA (mRNA) in protein synthesis?',
      options: ['Carrying genetic coding sequences from DNA to ribosomes', 'Transporting specific amino acids to ribosomes', 'Forming the structural catalytic core of ribosomes', 'Repairing mismatched DNA base errors'],
      answerIndex: 0,
      explanation: 'Transcription & Translation: mRNA carries copied genetic instructions from nuclear DNA out into the cytoplasm, where ribosomes read codons to synthesize polypeptides.'
    },
    {
      id: 'b7',
      category: 'Biology',
      level: 'Intermediate',
      question: 'What is the biological mechanism by which protein enzymes accelerate biochemical reactions?',
      options: ['Lowering the activation energy (E_a) required for the reaction', 'Increasing the system temperature', 'Shifting the chemical equilibrium position', 'Increasing the overall free energy change ΔG'],
      answerIndex: 0,
      explanation: 'Enzyme Kinetics: Enzymes act as biological catalysts by stabilizing transition states, dramatically lowering the activation energy barrier without being consumed.'
    },
    {
      id: 'b8',
      category: 'Biology',
      level: 'Advanced',
      question: 'How many daughter cells are produced at the completion of Meiosis, and what is their ploidy?',
      options: ['4 genetically diverse haploid cells (n)', '2 identical diploid cells (2n)', '2 haploid cells (n)', '4 identical diploid cells (2n)'],
      answerIndex: 0,
      explanation: 'Cell Division: Meiosis consists of two successive nuclear divisions (Meiosis I and II) without an intervening S-phase, resulting in 4 genetically distinct haploid gametes (n = 23).'
    },
    {
      id: 'b9',
      category: 'Biology',
      level: 'Advanced',
      question: 'During cellular respiration, which metabolic stage generates the vast majority of ATP molecules via ATP synthase?',
      options: ['Oxidative Phosphorylation (Electron Transport Chain)', 'Glycolysis', 'Citric Acid (Krebs) Cycle', 'Lactic Acid Fermentation'],
      answerIndex: 0,
      explanation: 'Bioenergetics: The electron transport chain creates a proton gradient across the inner mitochondrial membrane, driving ATP synthase to produce ~26–28 ATP per glucose molecule.'
    },

    // ═════════════════════════════════════════════════════════════════════════
    // COMPUTER SCIENCE & PROGRAMMING (9 Questions)
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'cs1',
      category: 'Computer Science',
      level: 'Beginner',
      question: 'What is the decimal number 13 represented in standard 8-bit binary notation?',
      options: ['00001101', '00001011', '00001110', '00000111'],
      answerIndex: 0,
      explanation: 'Binary Conversion: 13 = 8 + 4 + 1. Powers of 2: 2³=8, 2²=4, 2¹=0, 2⁰=1. Binary string: 1101₂. In 8 bits: 00001101.'
    },
    {
      id: 'cs2',
      category: 'Computer Science',
      level: 'Beginner',
      question: 'Which computer data structure follows the First-In, First-Out (FIFO) access discipline?',
      options: ['Queue', 'Stack (LIFO)', 'Tree', 'Hash Table'],
      answerIndex: 0,
      explanation: 'Data Structures: A Queue processes items in the exact order they arrive (FIFO), like people standing in line. Stacks follow LIFO (Last-In, First-Out).'
    },
    {
      id: 'cs3',
      category: 'Computer Science',
      level: 'Beginner',
      question: 'In programming, what is the term for a variable that holds a memory address pointing to another value?',
      options: ['Pointer', 'Constant', 'Boolean', 'Integer'],
      answerIndex: 0,
      explanation: 'Computer Architecture: A pointer is a variable that stores the physical or virtual memory address of another location in memory.'
    },
    {
      id: 'cs4',
      category: 'Computer Science',
      level: 'Beginner',
      question: 'What does the abbreviation HTTP represent in web communications?',
      options: ['Hypertext Transfer Protocol', 'High Technology Transfer Program', 'Hypertext Transmission Packet', 'Host Tracking Transfer Protocol'],
      answerIndex: 0,
      explanation: 'Networking: HTTP (Hypertext Transfer Protocol) is the foundational application-layer protocol powering information exchange across the World Wide Web.'
    },
    {
      id: 'cs5',
      category: 'Computer Science',
      level: 'Intermediate',
      question: 'What is the average time complexity of searching for an element in a sorted array of size n using Binary Search?',
      options: ['O(log n)', 'O(n)', 'O(n²)', 'O(1)'],
      answerIndex: 0,
      explanation: 'Algorithm Analysis: Binary search cuts the search space in half at each iteration: n, n/2, n/4... Taking log₂(n) steps yields logarithmic O(log n) time complexity.'
    },
    {
      id: 'cs6',
      category: 'Computer Science',
      level: 'Intermediate',
      question: 'Which Object-Oriented Programming (OOP) principle restricts direct access to internal state and bundles data with methods operating on that data?',
      options: ['Encapsulation', 'Polymorphism', 'Inheritance', 'Abstraction'],
      answerIndex: 0,
      explanation: 'Software Engineering: Encapsulation hides private internal state inside a class and requires interaction through well-defined public accessors and methods.'
    },
    {
      id: 'cs7',
      category: 'Computer Science',
      level: 'Intermediate',
      question: 'In relational database design, what constraint ensures that each row in a table is uniquely identifiable and cannot contain NULL?',
      options: ['Primary Key', 'Foreign Key', 'Check Constraint', 'Index'],
      answerIndex: 0,
      explanation: 'Database Systems: A Primary Key column enforces uniqueness across all rows and disallows null values, ensuring entity integrity.'
    },
    {
      id: 'cs8',
      category: 'Computer Science',
      level: 'Advanced',
      question: 'What is the worst-case runtime time complexity of the classic QuickSort algorithm (e.g. when already sorted with poor pivot selection)?',
      options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(2ⁿ)'],
      answerIndex: 0,
      explanation: 'Algorithm Design: While average runtime is O(n log n), choosing an extreme pivot repeatedly (e.g. lowest/highest element) reduces partition size by only 1, yielding O(n²) comparisons.'
    },
    {
      id: 'cs9',
      category: 'Computer Science',
      level: 'Advanced',
      question: 'Which graph algorithm computes the single-source shortest path in a weighted graph with non-negative edge weights using a priority queue?',
      options: ['Dijkstra\'s Algorithm', 'Kruskal\'s Algorithm', 'Depth-First Search (DFS)', 'Floyd-Warshall Algorithm'],
      answerIndex: 0,
      explanation: 'Graph Theory: Dijkstra\'s greedy algorithm maintains min-heap distances to visit the closest unvisited vertex, guaranteeing shortest paths with non-negative edge weights in O((V + E) log V).'
    },

    // ═════════════════════════════════════════════════════════════════════════
    // GENERAL SCIENCE & TECHNOLOGY (5 Questions)
    // ═════════════════════════════════════════════════════════════════════════
    {
      id: 'gs1',
      category: 'General Science',
      level: 'Beginner',
      question: 'Which planet orbits closest to the Sun in our Solar System?',
      options: ['Mercury', 'Venus', 'Mars', 'Earth'],
      answerIndex: 0,
      explanation: 'Astronomy: Mercury is the innermost planet, orbiting at an average distance of ~58 million km, completing an orbit in roughly 88 Earth days.'
    },
    {
      id: 'gs2',
      category: 'General Science',
      level: 'Beginner',
      question: 'What does the First Law of Thermodynamics (Law of Conservation of Energy) state?',
      options: ['Energy cannot be created or destroyed, only transformed', 'Entropy of the universe always increases', 'Absolute zero temperature cannot be reached', 'Heat flows spontaneously from cold to hot bodies'],
      answerIndex: 0,
      explanation: 'Thermodynamics: The First Law dictates that the total energy in an isolated system remains constant: ΔU = Q − W.'
    },
    {
      id: 'gs3',
      category: 'General Science',
      level: 'Intermediate',
      question: 'What gas makes up the largest percentage of Earth\'s clean, dry atmosphere by volume?',
      options: ['Nitrogen (approx. 78%)', 'Oxygen (approx. 21%)', 'Carbon Dioxide (approx. 0.04%)', 'Argon (approx. 0.9%)'],
      answerIndex: 0,
      explanation: 'Atmospheric Science: Earth\'s atmosphere is roughly 78.08% Nitrogen (N₂), 20.95% Oxygen (O₂), 0.93% Argon (Ar), and 0.04% Carbon Dioxide (CO₂).'
    },
    {
      id: 'gs4',
      category: 'General Science',
      level: 'Intermediate',
      question: 'What nuclear process fuels the intense radiative power of main-sequence stars like our Sun?',
      options: ['Nuclear Fusion of Hydrogen into Helium', 'Nuclear Fission of Uranium', 'Chemical combustion of methane', 'Gravitational collapse alone'],
      answerIndex: 0,
      explanation: 'Astrophysics: In stellar cores at millions of Kelvin, hydrogen nuclei fuse into helium via the proton-proton chain or CNO cycle, converting mass into energy (E = mc²).'
    },
    {
      id: 'gs5',
      category: 'General Science',
      level: 'Advanced',
      question: 'In the scientific method, what term designates an evidence-based, falsifiable proposed explanation that can be tested through controlled experimentation?',
      options: ['Hypothesis', 'Scientific Law', 'Axiom', 'Postulate'],
      answerIndex: 0,
      explanation: 'Scientific Epistemology: A hypothesis is an informed, testable, and falsifiable proposition designed to investigate natural phenomena before validation into a verified theory.'
    }
  ];

  // Organize by category for quick lookup
  const categories = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'General Science'];
  const quizzesData = {};

  categories.forEach(cat => {
    const list = questions.filter(q => q.category.toLowerCase() === cat.toLowerCase());
    quizzesData[cat] = {
      category: cat,
      description: `${cat} exploration questions spanning foundational to advanced challenges.`,
      questions: list
    };
  });

  return {
    questions,
    quizzesData,
    categories
  };
});
