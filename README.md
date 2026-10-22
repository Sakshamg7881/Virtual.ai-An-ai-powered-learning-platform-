# 🎓 VirtualLearn AI — Learn Beyond Reality

> An interactive, immersive STEM learning platform featuring real-time 3D models, hands-on virtual science lab simulations, multi-category quizzes, student analytics, and a lightweight Node.js/Express backend.

[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-v5.0-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Three.js](https://img.shields.io/badge/Three.js-r128-black?logo=three.js&logoColor=white)](https://threejs.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla%20ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🌟 Overview

**VirtualLearn AI** bridges abstract scientific concepts and tangible comprehension. Rather than relying on static textbook diagrams, students can orbit around a pulsating human heart, manipulate atomic electron shells, visualize DNA base pairs, and adjust voltages in a live circuit simulator while watching current flow and bulb luminosity change in real-time.

All student progress, quiz scores, and preferences persist locally via **LocalStorage** for zero-friction access without requiring account creation, paired with an Express REST API for curriculum data and resources.

---

## ✨ Key Features

### 1. 🪐 Interactive 3D Learning (Three.js r128)
- Real-time 3D rendering with custom lighting, camera controls, drag-to-rotate, zoom, and auto-rotation.
- Interactive anatomical and structural part labels with instant explanations.
- **8 Comprehensive 3D Models**:
  - **Solar System**: Sun and planetary orbits with accurate relative spacing and speeds.
  - **Human Heart**: Four chambers, aortic valve, ventricles, and blood circulation pathway.
  - **Atom Structure**: Protons, neutrons, and orbiting electron energy shells.
  - **Geometric Polyhedra**: Platonic solids with vertex, edge, and face properties.
  - **DNA Structure**: Double-helix ladder, base pairs (A-T, G-C), and nucleotide bonds.
  - **Human Cell**: Cell membrane, nucleus, mitochondria, and cytoplasm organelles.
  - **Water Molecule**: H₂O bent molecular geometry, bond angles (104.5°), and polar hydrogen bonds.
  - **Electromagnetic Field**: Electric charges, magnetic poles, and interactive field line vectors.

### 2. ⚡ Virtual Science Lab
- **Ohm's Law Circuit Simulator**:
  - Real-time calculations: Current ($I = V / R$) and Power ($P = V \cdot I$).
  - Animated circuit paths with dashed electron flow speed tied to current.
  - Dynamic filament glow reflecting dissipated power.
  - Built-in presets: *AA Battery*, *9V + 470Ω*, *12V LED*, *USB + 1kΩ*.
- **Projectile Motion Simulator**:
  - Configurable launch angle and initial velocity sliders.
  - 2D trajectory animation with real-time flight time, max height, and range outputs.
- **Harmonic Pendulum & Wave Simulator**:
  - Adjustable string length, gravity, wave frequency, and amplitude.

### 3. 📊 Student Dashboard & Analytics
- Personalized for student profile (default: **Saksham**).
- **Topic Completion Gauge**: Circular SVG progress tracker.
- **Quiz Performance Bar Chart**: Subject-by-subject score breakdown.
- Stat counters: *Topics Done*, *Quizzes Taken*, *Average Score*, *Points*.
- Recommended next topics and bookmarking system.

### 4. 📝 Multi-Disciplinary Quizzes
- Categorized question banks:
  - 📐 **Mathematics** (Geometry, calculus, algebra)
  - ⚛️ **Physics** (Mechanics, optics, thermodynamics)
  - 🧪 **Chemistry** (Periodic table, molecular bonding, stoichiometry)
  - 💻 **Computer Science** (Algorithms, data structures, binary logic)
  - 🧬 **Biology** (Genetics, cell biology, human anatomy)
- Immediate feedback with rationale and score bonus for 100% completion.

### 5. 🤖 Demo AI Tutor
- Educational assistant with transparent labeling (*Demo pattern-matching tutor; no external paid AI services required*).
- Switchable difficulty: **Beginner** vs. **Intermediate**.
- Covers math theorems, derivatives, Newton's laws, Ohm's law, atoms, and genetics.

### 6. 🌓 Dual Theme Engine (Light & Dark Mode)
- Engineered with CSS custom property tokens and smooth color transitions.
- Light theme with crisp slate-navy typography (`#0f172a`) and violet accents.
- Dark theme with sleek navy background (`#070b14`) and luminous highlights.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend UI** | HTML5 Semantic Shell | Accessible, responsive structure |
| **Styling** | Vanilla CSS3 Design System | Light/dark theme tokens, card layouts, animations |
| **Typography** | Inter (Google Fonts) | Clean, modern sans-serif type |
| **3D Engine** | Three.js (r128 CDN) | Real-time WebGL mesh rendering and orbit control |
| **Client State** | Web Storage API (LocalStorage) | Instant persistence for progress, badges, and scores |
| **Backend** | Node.js + Express.js | In-memory REST API and static asset hosting |
| **CORS** | `cors` middleware | Cross-origin resource sharing support |

---

## 📂 Project Structure

```text
virtual.ai-project/
├── public/                     # Frontend client files
│   ├── index.html              # HTML shell, header navigation, modals, footer
│   ├── styles.css              # Full CSS design system with light/dark tokens
│   └── app.js                  # Client logic, 3D scenes, lab simulators, quizzes
├── server/                     # Backend API server
│   └── index.js                # Express REST API routes & in-memory data store
├── package.json                # Project dependencies and npm scripts
├── package-lock.json           # Locked dependency tree
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18.x or higher recommended)
- `npm` (bundled with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Sakshamg7881/Virtual.ai-An-ai-powered-learning-platform-.git
   cd Virtual.ai-An-ai-powered-learning-platform-
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Launch the application:**
   Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## 🔌 API Endpoints

The Express server exposes the following REST endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service uptime and health status |
| `GET` | `/api/topics` | List all topics with optional `?category=` or `?search=` |
| `GET` | `/api/topics/:id` | Full topic details with interactive lesson content |
| `GET` | `/api/courses` | Available learning paths and course modules |
| `GET` | `/api/courses/:id` | Single course with populated lessons |
| `GET` | `/api/announcements` | System notices and platform updates |
| `POST`| `/api/feedback` | Submit student feedback (in-memory store) |
| `GET` | `/api/bookmarks/:key`| Retrieve saved user bookmarks |
| `POST`| `/api/bookmarks/:key`| Store user bookmarks |

*Note: The backend operates with an in-memory store without external database dependencies; server restarts reset volatile data while LocalStorage retains all student records.*

---

## 🎯 Keyboard & Mouse Navigation in 3D Viewer

- **Left Mouse Click + Drag**: Orbit / Rotate 3D models.
- **Scroll Wheel**: Zoom into or out of objects.
- **Right Mouse Click + Drag**: Pan camera view.
- **On-Screen Buttons**: Quick Zoom In, Zoom Out, Auto-Rotate Toggle, and Reset View.

---

## 📜 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute for educational purposes.

---

Made with ❤️ by [Saksham](https://github.com/Sakshamg7881)
