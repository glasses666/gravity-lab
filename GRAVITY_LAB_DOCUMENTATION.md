# GravityLab: Interactive Gravity Sandbox

GravityLab is a high-performance, interactive N-Body physics simulation engine designed for the web. It combines professional astrophysical calculations with an artistic visual and auditory experience, allowing users to explore the beauty of gravitational dynamics.

## 1. Key Features

### 🌌 Simulation Core
*   **N-Body Physics**: Simulates gravitational interactions between hundreds of bodies using the **Barnes-Hut algorithm** (Octree optimization).
*   **Collision & Merging**: Bodies merge upon collision, conserving momentum and mass, simulating the formation of larger celestial objects.
*   **Real-time Control**: Adjust the Gravitational Constant ($G$), Time Speed, and particle count on the fly.

### 🎮 Interactive Sandbox
*   **Click to Track**: Simply click on any star or planet to focus the camera on it and track its movement through space.
*   **God Mode**: Dynamically inject new stars into the simulation using the "Sandbox Tools". Create chaos or form new systems instantly.
*   **Scenarios**:
    *   **Galaxy**: A stable, procedurally generated spiral galaxy.
    *   **Binary Star**: Two massive stars in a delicate orbital dance.
    *   **Three Body**: A hierarchical stable system demonstrating complex orbital mechanics.

### 🎨 Visuals & Audio
*   **Visual Style**: A clean, "ordered complexity" aesthetic. Stars glow with procedural textures, and trails visualize orbital paths.
*   **Generative Audio**: An integrated **SpaceSynth** engine generates eternal, non-repetitive ambient music based on the Pentatonic scale, providing a soothing auditory backdrop.
*   **Rendering**: Optimized WebGL rendering (Three.js) with Logarithmic Depth Buffer to prevent visual artifacts at vast cosmic scales.

## 2. Technical Architecture

The codebase follows a strict **Separation of Concerns (SoC)** principle:

### A. Core Physics (`src/core/`)
*   **`physics/World.ts`**: The simulation manager. Handles the physics loop:
    1.  **Collision Detection**: Checks for overlapping bodies and merges them.
    2.  **Octree Build**: Partitions space for Barnes-Hut approximation.
    3.  **Force Calculation**: Computes gravity for every body.
    4.  **Integration**: Updates positions using a Symplectic Euler integrator.

### B. Application Layer (`src/main.ts`)
*   **Scene Management**: Handles Three.js scene graph, materials, and geometry.
*   **Input Handling**: Raycasting for mouse selection and OrbitControls for navigation.
*   **Audio Procedural Generation**: Uses the Web Audio API to synthesize sound in real-time without external assets.

## 3. Controls & UI

*   **Navigation**:
    *   **Left Drag**: Rotate view.
    *   **Right Drag**: Pan view.
    *   **Scroll**: Zoom in/out.
    *   **Click Body**: Select and track a specific star.
*   **GUI Panel**:
    *   **Control**: Adjust Time Speed, Pause, Gravity ($G$), and Base Particle Count.
    *   **Camera**: Toggle Pan, or select specific targets from a list.
    *   **Sandbox Tools**: Add random stars with custom mass into the current simulation.
    *   **Scenarios**: Switch between preset systems.
*   **Music**: Toggle the ambient soundtrack via the note icon (🎵) in the top right.

## 4. Getting Started

### Prerequisites
*   Node.js (v16+)

### Installation & Run
```bash
cd gravity-lab
npm install
npm run dev
```
Open the local URL (e.g., `http://localhost:5173`) to launch the simulation.

## 5. Future Roadmap
*   **VR Support**: Immersive view of the galaxy.
*   **Save/Load**: Export simulation states to JSON.
*   **Custom Scenarios**: Visual editor for placing planets.
