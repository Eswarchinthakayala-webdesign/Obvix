# <img src="./src/assets/logo.svg" width="40" height="40" alt="Obvix Logo" valign="middle"> Obvix

[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-%23FF6F00.svg?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/js)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Obvix** is a next-generation, AI-driven visual intelligence toolkit designed for the modern web. Built with **React 19** and **Vite**, it harnesses the raw power of **TensorFlow.js** and **MediaPipe** to deliver high-performance, real-time computer vision capabilities directly within the browser—no backend required.

> [!IMPORTANT]
> **Privacy-First Architecture**: All processing happens entirely client-side. Your camera stream never leaves your device, ensuring total privacy and low-latency interaction.



---

## 🚀 Core Capabilities

Obvix provides a comprehensive suite of AI vision modules, each designed with a focus on accuracy and user experience:

-   **👤 Face Intelligence**:
    -   **Face Detection**: Rapid detection of facial bounding boxes for privacy and focus.
    -   **468-Point Mesh**: High-fidelity facial landmark tracking (MediaPipe) for AR and expression analysis.
-   **✋ Gesture & Hand Tracking**: Precision tracking of hand skeletal structures and finger coordinates.
-   **🏃 Movement Analysis**: Full-body pose estimation using **MoveNet Lightning** (17 keypoints) for fitness and ergonomic monitoring.
-   **🖼️ Image Classification**: Deep-learning powered object recognition using **MobileNet V2** (1,000+ classes).
-   **📄 Smart OCR**: Advanced text recognition and coordinate mapping using **Tesseract.js** (WebAssembly).
-   **📊 Session Insights**: Interactive dashboards powered by **Recharts** to visualize confidence trends and session history.


---

## 🛠️ Tech Stack

-   **Frontend**: React 19, Vite, React Router 7
-   **AI/ML Engine**: TensorFlow.js, MediaPipe, Tesseract.js
-   **Animations**: Framer Motion
-   **UI & Design**: Tailwind CSS, Radix UI, Lucide Icons
-   **Data Visualization**: Recharts, Mermaid.js
-   **Theming**: Dark/Light mode support via `next-themes`

---

## 📦 Getting Started

### Prerequisites

-   Node.js (v18.0.0 or higher)
-   npm or yarn

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Eswarchinthakayala-webdesign/Obvix.git
    cd obvix
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```

4.  **Build for production**:
    ```bash
    npm run build
    ```

---

## 📂 Project Structure

```text
Obvix/
├── src/
│   ├── assets/       # Static assets and icons
│   ├── components/   # Reusable UI components (Radix + Custom)
│   ├── layout/       # Main application layout wrappers
│   ├── lib/          # Utility functions and AI helper methods
│   ├── pages/        # Route-level components (Face, Pose, OCR, etc.)
│   └── main.jsx      # Entry point
├── public/           # Static public assets
├── vite.config.js    # Vite configuration
└── package.json      # Dependencies and scripts
```

---

## 🌟 Why Obvix?

-   **Privacy First**: Zero server costs and total data sovereignty.
-   **High Performance**: Uses **WebGL/WebGPU** acceleration and `tf.tidy()` for leak-free memory management.
-   **Scientific Aesthetic**: A premium, "Sci-Fi" HUD design language with smooth Framer Motion transitions.
-   **Accessibility**: Built-in support for screen readers with throttled ARIA-live announcements.


---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by the Obvix Team
</p>
