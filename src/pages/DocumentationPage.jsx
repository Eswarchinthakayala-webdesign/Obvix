import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import MDEditor from "@uiw/react-md-editor";
import {
  Terminal,
  Search,
  ArrowLeft,
  Menu,
  ChevronRight,
  Code2,
  Cpu,
  Layers,
  Zap,
  Layout,
  X,
  Code,
  Check,
  FileText,
  Copy
} from "lucide-react";
import mermaid from "mermaid";
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// --- UTILS ---
function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
};

// Helper to extract raw text from React children
const getNodeText = (node) => {
  if (["string", "number"].includes(typeof node)) return node;
  if (node instanceof Array) return node.map(getNodeText).join("");
  if (typeof node === "object" && node?.props?.children)
    return getNodeText(node.props.children);
  return "";
};

// --- COMPONENTS ---

// Dark Theme Button
const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  const variants = {
    default: "bg-white text-black hover:bg-zinc-200",
    destructive: "bg-red-900 text-white hover:bg-red-800",
    outline: "border border-zinc-800 bg-black hover:bg-zinc-900 text-zinc-300",
    secondary: "bg-zinc-800 text-white hover:bg-zinc-700",
    ghost: "hover:bg-zinc-800 text-zinc-300 hover:text-white",
    link: "text-white underline-offset-4 hover:underline",
  }
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  }
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-black transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

// Dark Theme Input
const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-zinc-800 bg-black px-3 py-2 text-sm text-white ring-offset-black file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

// Dark Theme Badge
function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "border-transparent bg-white text-black hover:bg-white/80",
    secondary: "border-transparent bg-zinc-800 text-white hover:bg-zinc-800/80",
    destructive: "border-transparent bg-red-900 text-white hover:bg-red-900/80",
    outline: "text-zinc-400 border-zinc-800 bg-zinc-950",
  }
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2", variants[variant], className)} {...props} />
  )
}

// Simplified ScrollArea
const ScrollArea = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("relative overflow-auto custom-scrollbar", className)} {...props}>
    {children}
  </div>
))
ScrollArea.displayName = "ScrollArea"


const Mermaid = ({ chart }) => {
  const ref = useRef(null);
  const [svg, setSvg] = useState("");

  useEffect(() => {
    if (!chart) return;

    mermaid.initialize({
      startOnLoad: false,
      theme: "dark",
      securityLevel: "loose",
      fontFamily: "ui-sans-serif, system-ui, sans-serif",
      themeVariables: {
        background: "#000000",
        primaryColor: "#27272a",
        primaryBorderColor: "#3f3f46",
        primaryTextColor: "#ffffff",
        lineColor: "#71717a",
        fontFamily: "inherit"
      },
    });

    const renderChart = async () => {
      try {
        const id = `mermaid-${Math.random().toString(36).slice(2)}`;
        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (error) {
        console.error("Mermaid error:", error);
        setSvg(`
          <pre class="text-xs p-3 rounded-lg border text-red-400 bg-red-950/30 border-red-900 font-mono">
${error.message}
          </pre>
        `);
      }
    };

    renderChart();
  }, [chart]);

  return (
    <div
      ref={ref}
      className="my-6 flex justify-center overflow-x-auto rounded-xl border p-6 bg-black border-zinc-900"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

// --- DATA ---

const DOCS_DATA = [
  // ------------------------------------------------------------------
  // 1. GETTING STARTED
  // ------------------------------------------------------------------
  {
    category: "Get Started",
    items: [
      {
        id: "introduction",
        title: "Introduction",
        content: `
# Introduction

**LucidLens** is a next-generation object detection interface built for the modern web. It combines the raw power of **TensorFlow.js** with the aesthetic precision of **Shadcn UI**.

## The Problem
Traditional computer vision apps are often clunky, require heavy backend servers, and suffer from network latency.

## The Solution
LucidLens moves the "Brain" to the browser.
- **Client-Side:** Zero server costs.
- **Privacy-First:** Images never leave the user's device.
- **Reactive:** 60FPS detection loops.

## Tech Stack

| Technology | Role |
| :--- | :--- |
| **React 18** | UI Library & State Management |
| **TensorFlow.js** | Client-side Machine Learning (WebGL) |
| **COCO-SSD** | Pre-trained object detection model |
| **Framer Motion** | Physics-based layout animations |
| **Shadcn UI** | Accessible component primitives |
| **Vite** | Build tool & HMR |
`
      },
      {
        id: "installation",
        title: "Installation",
        content: `
# Installation

Get up and running in less than 5 minutes.

## Prerequisites
- Node.js 18+
- A webcam-enabled device

## CLI Quickstart

\`\`\`bash
# 1. Clone the repo
git clone https://github.com/your-username/lucid-lens.git

# 2. Enter directory
cd lucid-lens

# 3. Install dependencies (we use pnpm, but npm works)
npm install

# 4. Start the dev server
npm run dev
\`\`\`

## Environment Variables
Create a \`.env.local\` file if you need to override default thresholds:

\`\`\`bash
VITE_DEFAULT_CONFIDENCE=0.6
VITE_MAX_DETECTIONS=10
\`\`\`
`
      },
      {
        id: "folder-structure",
        title: "Directory Structure",
        content: `
# Directory Structure

We follow a scalable "Feature-First" architecture.

\`\`\`plaintext
src/
├── components/
│   ├── ui/               # Shadcn Primitives (Button, Slider)
│   ├── detector/         # AI Logic
│   │   ├── CameraView.jsx
│   │   ├── BoundingBox.jsx
│   │   └── StatsPanel.jsx
│   └── layout/
├── hooks/
│   ├── use-webcam.js     # MediaStream logic
│   └── use-model.js      # TensorFlow loader
├── lib/
│   ├── utils.js          # Tailwind merge
│   └── constants.js      # COCO class names
└── App.jsx
\`\`\`
`
      }
    ]
  },

  // ------------------------------------------------------------------
  // 2. CORE CONCEPTS (THE BRAIN)
  // ------------------------------------------------------------------
  {
    category: "Core Concepts",
    items: [
      {
        id: "detection-loop",
        title: "The Detection Loop",
        content: `
# The Detection Loop

The heartbeat of the application is the **Inference Loop**. Unlike standard React effects, this loop must run completely independent of the render cycle to maintain performance.

## The Flow

\`\`\`mermaid
sequenceDiagram
    participant Cam as Webcam
    participant Raf as RAF Loop
    participant TF as TensorFlow
    participant UI as React State

    Raf->>Cam: Grab Frame
    Raf->>TF: model.detect()
    TF-->>Raf: Predictions [x,y,w,h]
    Raf->>UI: setState(predictions)
    UI-->>Raf: requestAnimationFrame
\`\`\`

## Why requestAnimationFrame?

We do **not** use \`setInterval\`.
1. **Syncing**: \`rAF\` syncs with the monitor's refresh rate (usually 60Hz).
2. **Throttling**: Browsers automatically pause \`rAF\` when the tab is inactive, saving battery.
`
      },
      {
        id: "tensors-memory",
        title: "Tensors & Memory",
        content: `
# Memory Management

TensorFlow.js creates **Tensors** (math objects) on the GPU. JavaScript's garbage collector **cannot** see these objects. If you don't clean them up, the app will crash after 10 seconds.

## The Automatic Solution: \`tf.tidy()\`

Wrap all inference logic inside a tidy block.

\`\`\`javascript
import * as tf from '@tensorflow/tfjs';

const detect = async (net, video) => {
  // tf.tidy executes the function, then cleans up all intermediate tensors
  return tf.tidy(() => {
    const img = tf.browser.fromPixels(video);
    const smallImg = tf.image.resizeBilinear(img, [640, 480]);
    // ... inference logic
    return predictions;
  });
};
\`\`\`
`
      },
      {
        id: "coordinate-systems",
        title: "Coordinate Mapping",
        content: `
# Coordinate Mapping

The AI sees the image differently than the CSS sees the DOM.

## The Scale Problem

The webcam might stream at **640x480**, but the CSS displays the video at **100% width** (responsive).

## The Formula

To draw the box correctly, we calculate percentages:

\`\`\`javascript
const style = {
  left: \`\${(bbox[0] / videoWidth) * 100}%\`,
  top: \`\${(bbox[1] / videoHeight) * 100}%\`,
  width: \`\${(bbox[2] / videoWidth) * 100}%\`,
  height: \`\${(bbox[3] / videoHeight) * 100}%\`
};
\`\`\`

This ensures that even if the window resizes, the bounding box stays locked to the object.
`
      }
    ]
  },

  // ------------------------------------------------------------------
  // 3. UI & ANIMATION
  // ------------------------------------------------------------------
  {
    category: "UI & Interaction",
    items: [
      {
        id: "animations",
        title: "Framer Motion",
        content: `
# Physics-Based Animations

Raw AI data is "jittery". A bounding box might jump 5 pixels left or right every frame due to noise. We use **Framer Motion** to smooth this out.

## The Layout Prop

By adding the \`layoutId\`, Framer automatically interpolates the position changes.

\`\`\`jsx
<motion.div
  layoutId={object.id} // Unique ID tracks specific objects
  initial={{ opacity: 0, scale: 0.8 }}
  animate={{ 
    opacity: 1, 
    scale: 1,
    x: normalizedX,
    y: normalizedY
  }}
  transition={{ 
    type: "spring", 
    stiffness: 300, 
    damping: 30 
  }}
/>
\`\`\`
`
      },
      {
        id: "hud-overlays",
        title: "HUD Overlays",
        content: `
# HUD Design (Heads-Up Display)

We use a "Sci-Fi" aesthetic for the overlays.

## Components
1. **Target Corners**: SVG brackets that frame the detected object.
2. **Confidence Badge**: A pill showing the % score.
3. **Trace Line**: A fading trail showing where the object has been.

## Z-Index Stratification

\`\`\`css
z-0  -> Video Element
z-10 -> Canvas Overlay (Drawing)
z-20 -> HTML Overlay (Interactions)
z-50 -> Settings Modal
\`\`\`
`
      }
    ]
  },

  // ------------------------------------------------------------------
  // 4. CONFIGURATION
  // ------------------------------------------------------------------
  {
    category: "Configuration",
    items: [
      {
        id: "model-tuning",
        title: "Model Tuning",
        content: `
# Model Tuning

You can adjust the sensitivity of the AI.

## Parameters

| Parameter | Default | Description |
| :--- | :--- | :--- |
| **IOU Threshold** | 0.5 | "Intersection over Union". Determines how much overlap is allowed before two boxes are considered the same object. |
| **Score Threshold** | 0.6 | Minimum confidence required to show a box. |
| **Max Detections** | 10 | Hard limit on objects to prevent UI clutter. |

## Adjusting via Props

\`\`\`jsx
<ObjectDetector 
  minScore={0.75} 
  maxResults={5} 
/>
\`\`\`
`
      },
      {
        id: "supported-classes",
        title: "Supported Objects",
        content: `
# COCO-SSD Classes

The model is pre-trained on the COCO (Common Objects in Context) dataset. It can detect **80 unique classes**.

## Common Classes
- **Person**
- **Vehicle**: Car, Bicycle, Motorcycle, Airplane, Bus, Train, Truck, Boat.
- **Animal**: Bird, Cat, Dog, Horse, Sheep, Cow, Elephant, Bear, Zebra, Giraffe.
- **Accessory**: Backpack, Umbrella, Handbag, Tie, Suitcase.
- **Electronic**: Cell phone, Mouse, Remote, Keyboard, TV, Laptop.
- **Kitchen**: Bottle, Wine glass, Cup, Fork, Knife, Spoon, Bowl.
`
      }
    ]
  },

  // ------------------------------------------------------------------
  // 5. ADVANCED GUIDES
  // ------------------------------------------------------------------
  {
    category: "Advanced",
    items: [
      {
        id: "custom-models",
        title: "Using Custom Models",
        content: `
# Custom Models

Want to detect face masks? Or defects in manufacturing? You can swap COCO-SSD for a custom GraphModel.

## 1. Train your model
Train a model in Python using TensorFlow or YOLO, then convert it to TFJS format:

\`\`\`bash
tensorflowjs_converter --input_format=keras model.h5 /web_model
\`\`\`

## 2. Load in React

\`\`\`javascript
const loadCustomModel = async () => {
  const model = await tf.loadGraphModel('/models/my-custom-model/model.json');
  return model;
}
\`\`\`
`
      },
      {
        id: "performance-mode",
        title: "Performance Optimization",
        content: `
# Performance & Battery

Running Neural Networks drains battery. Here is how to mitigate it.

## Frame Throttling

You don't need to detect 60 times a second. 10 times is often enough for UI.

\`\`\`javascript
let lastRun = 0;
const fps = 10;
const interval = 1000 / fps;

const loop = (timestamp) => {
  if (timestamp - lastRun >= interval) {
    detect();
    lastRun = timestamp;
  }
  requestAnimationFrame(loop);
}
\`\`\`
`
      }
    ]
  },

  // ------------------------------------------------------------------
  // 6. DEPLOYMENT
  // ------------------------------------------------------------------
  {
    category: "Deployment",
    items: [
      {
        id: "pwa-integration",
        title: "PWA Support",
        content: `
# Progressive Web App (PWA)

Obvix is configured to be installable on iOS and Android.

## Manifest Configuration
Located in \`public/manifest.json\`:

\`\`\`json
{
  "name": "LucidLens AI",
  "short_name": "LucidLens",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [...]
}
\`\`\`

## iOS Camera Constraints
**Note:** iOS Safari has strict memory limits. If the app crashes on iPhone, try switching to the \`lite_mobilenet_v2\` model.
`
      },
      {
        id: "https-security",
        title: "HTTPS Requirement",
        content: `
# HTTPS is Mandatory

Browsers **block** \`navigator.mediaDevices.getUserMedia\` on insecure origins.

| Environment | Protocol | Status |
| :--- | :--- | :--- |
| Localhost | http://localhost | ✅ Allowed (Exception) |
| Production | http://example.com | ❌ Blocked |
| Production | https://example.com | ✅ Allowed |

## Vercel Deployment
We recommend Vercel as it provides free SSL certificates automatically.
`
      }
    ]
  },

  // ------------------------------------------------------------------
  // 7. API REFERENCE
  // ------------------------------------------------------------------
  {
    category: "API Reference",
    items: [
      {
        id: "props-detector",
        title: "<ObjectDetector />",
        content: `
# <ObjectDetector />

The main container component.

## Props

| Prop | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| \`model\` | \`string\` | 'coco' | The model key to load. |
| \`onDetect\` | \`func\` | - | Callback fired when objects are found. |
| \`facingMode\` | \`string\` | 'user' | 'user' (selfie) or 'environment' (rear). |
| \`threshold\` | \`number\` | 0.6 | Confidence threshold (0.0 - 1.0). |

## Example

\`\`\`jsx
<ObjectDetector 
  facingMode="environment"
  threshold={0.8}
  onDetect={(objs) => console.log(objs)}
/>
\`\`\`
`
      }
    ]
  },
  // ------------------------------------------------------------------
  // 8. ACCESSIBILITY (A11Y)
  // ------------------------------------------------------------------
  {
    category: "Accessibility",
    items: [
      {
        id: "screen-readers",
        title: "Screen Reader Support",
        content: `
# ARIA & Screen Readers

Making computer vision accessible to the visually impaired is a core goal. We cannot simply draw boxes on a canvas; the DOM must reflect what is happening.

## Live Regions

We use an invisible \`aria-live\` region to announce detections.

\`\`\`jsx
<div 
  role="status" 
  aria-live="polite" 
  className="sr-only"
>
  {objects.length > 0 
    ? \`Detected \${objects.length} objects: \${objects.map(o => o.class).join(', ')}\`
    : "No objects detected"}
</div>
\`\`\`

## Frequency Limiting

**Warning:** Don't update the live region every frame (60 times a second), or the screen reader will crash or stutter. Throttle updates to once every 2-3 seconds.
`
      },
      {
        id: "voice-feedback",
        title: "Voice Synthesis",
        content: `
# Text-to-Speech (TTS)

LucidLens can "speak" what it sees using the Web Speech API.

## Implementation

\`\`\`javascript
const speak = (text) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.2; // Slightly faster
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
};

// Usage in detection loop
if (prediction.class === 'person' && !hasSpoken) {
  speak("Person detected");
  setHasSpoken(true);
}
\`\`\`

## Browser Support
This API is supported in Chrome, Edge, Safari, and Firefox without external libraries.
`
      }
    ]
  },

  // ------------------------------------------------------------------
  // 9. UNDER THE HOOD (DEEP DIVE)
  // ------------------------------------------------------------------
  {
    category: "Deep Dive",
    items: [
      {
        id: "understanding-iou",
        title: "Understanding IoU",
        content: `
# Intersection over Union (IoU)

When the AI detects an object, it often finds 10-20 slightly different boxes for the same object. **Non-Max Suppression (NMS)** cleans this up using IoU.

## The Math

IoU measures how much two boxes overlap.

$$ IoU = \\frac{\\text{Area of Overlap}}{\\text{Area of Union}} $$

- **IoU = 1.0**: The boxes are identical.
- **IoU = 0.0**: The boxes do not touch.

## Visualizing IoU

\`\`\`mermaid
graph TD
    A[Box A - AI Prediction] 
    B[Box B - Ground Truth]
    C{Calculate IoU}
    
    A --> C
    B --> C
    C -- "IoU &gt; 0.5" --> D[Valid Detection]
    C -- "IoU &lt; 0.5" --> E[False Positive]
\`\`\`

If two boxes overlap by more than 50% (IoU > 0.5), we assume they are the same object and delete the one with the lower confidence score.
`
      },
      {
        id: "webgl-acceleration",
        title: "WebGL Acceleration",
        content: `
# WebGL & Shaders

TensorFlow.js is fast because it doesn't run on the CPU. It converts mathematical operations into **WebGL Shaders** (GLSL) to run on your Graphics Card.

## The Bottleneck: "Data Texture Upload"

The slowest part of the app is not the math—it's moving the image data from the CPU (RAM) to the GPU (VRAM).

## Optimization Tip
Keep your video element size small in the DOM if possible, or use \`tf.browser.fromPixels\` sparingly.

\`\`\`javascript
// ❌ Slow: Converting 4k video to tensor
const heavy = tf.browser.fromPixels(video4k);

// ✅ Fast: Resize on the fly
const light = tf.tidy(() => {
  return tf.image.resizeBilinear(tf.browser.fromPixels(video), [300, 300]);
});
\`\`\`
`
      }
    ]
  },

  // ------------------------------------------------------------------
  // 10. QUALITY ASSURANCE (TESTING)
  // ------------------------------------------------------------------
  {
    category: "QA & Testing",
    items: [
      {
        id: "mocking-webcam",
        title: "Mocking the Webcam",
        content: `
# Mocking Media Streams

You cannot run automated tests (CI/CD) with a real webcam. You must inject a fake video stream.

## Chrome Flag Strategy

When running Cypress or Selenium, launch Chrome with:

\`\`\`bash
chrome --use-fake-ui-for-media-stream --use-file-for-fake-video-capture=./tests/fixtures/test_video.y4m
\`\`\`

## React-Level Mocking

Alternatively, override the hook during testing:

\`\`\`javascript
// __mocks__/use-webcam.js
export const useWebcam = () => {
  return {
    videoRef: { current: null },
    stream: new MediaStream(), // Empty stream
    isReady: true
  };
};
\`\`\`
`
      }
    ]
  },

  // ------------------------------------------------------------------
  // 11. COMMUNITY
  // ------------------------------------------------------------------
  {
    category: "Community",
    items: [
      {
        id: "contributing",
        title: "Contributing",
        content: `
# Contributing to LucidLens

We welcome pull requests!

## Development Workflow

1. **Fork** the repository.
2. **Branch** off \`main\`: \`git checkout -b feature/amazing-feature\`.
3. **Commit** your changes.
4. **Push** to your fork.
5. **Open a PR**.

## Code Style

We use **Prettier** and **ESLint**. Run the linter before pushing:

\`\`\`bash
npm run lint
\`\`\`
`
      },
      {
        id: "license",
        title: "License",
        content: `
# MIT License

Copyright (c) 2024 LucidLens Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so.
`
      }
    ]
  },
];

// --- APP ---

const SidebarContent = ({
  activeDocId,
  setActiveDocId,
  onNavigate,
  docsData,
}) => (
  <aside className="flex flex-col h-full bg-black border-r border-zinc-900">
    <div className="p-4 sm:p-6 border-b border-zinc-900">
      <Link to="/" className="flex items-center gap-2 mb-5 text-zinc-500 hover:text-white transition-colors group text-sm">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Home
      </Link>

      <div className="flex items-center gap-3">
        {/* Obvix Logo */}
        <div className="h-10 w-10 flex items-center justify-center">
             <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white">
                <defs>
                <linearGradient id="logoGradientDocs" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                    <stop stopColor="currentColor" />
                    <stop offset="1" stopColor="currentColor" stopOpacity="0.5" />
                </linearGradient>
                </defs>
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="url(#logoGradientDocs)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" fill="currentColor" fillOpacity="0.2" />
                <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
        </div>

        <div className="min-w-0">
          <h1 className="font-bold text-base text-white sm:text-lg tracking-tight truncate">
            Obvix
          </h1>
        
        </div>
      </div>
    </div>

    <ScrollArea className="flex-1 px-2 sm:px-4 py-4 sm:py-6">
      <div className="space-y-8 pb-20">
        {docsData.map((section, idx) => (
          <div key={idx}>
            <h3 className="px-2 mb-3 text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2 font-mono">
              {section.category}
            </h3>

            <div className="ml-2 pl-3 space-y-0.5 border-l border-zinc-900">
              {section.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveDocId(item.id);
                    if (onNavigate) onNavigate();
                  }}
                  className={cn(
                    "relative w-full cursor-pointer text-left px-3 py-2 rounded-md text-sm transition-all",
                    activeDocId === item.id
                      ? "font-medium text-white bg-zinc-900"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                  )}
                >
                  {item.title}
                  {activeDocId === item.id && (
                    <span className="absolute -left-[14px] top-2 bottom-2 w-[2px] rounded-full bg-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  </aside>
);

export default function DocumentationPage() {
  const [activeDocId, setActiveDocId] = useState("introduction");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
        contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeDocId]);

  const filteredDocs = useMemo(() => {
    if (!searchQuery) return DOCS_DATA;
    const lowerQuery = searchQuery.toLowerCase();
    return DOCS_DATA.map(section => {
      const filteredItems = section.items.filter(item => 
        item.title.toLowerCase().includes(lowerQuery) || 
        item.content.toLowerCase().includes(lowerQuery)
      );
      if (filteredItems.length > 0) return { ...section, items: filteredItems };
      return null;
    }).filter(Boolean);
  }, [searchQuery]);

  const flatDocs = useMemo(() => DOCS_DATA.flatMap(s => s.items), []);
  const currentIndex = flatDocs.findIndex(i => i.id === activeDocId);
  const activeDoc = flatDocs[currentIndex];
  const prevDoc = flatDocs[currentIndex - 1];
  const nextDoc = flatDocs[currentIndex + 1];

  const toc = useMemo(() => {
    if (!activeDoc) return [];
    return activeDoc.content.match(/^## (.*$)/gm)?.map(h => h.replace('## ', '')) || [];
  }, [activeDoc]);

  const handleScrollToSection = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden selection:bg-zinc-800 selection:text-white" data-color-mode="dark">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="w-72 border-r border-zinc-900 hidden xl:flex z-30 fixed inset-y-0 left-0 bg-black">
        <SidebarContent 
            activeDocId={activeDocId} 
            setActiveDocId={setActiveDocId} 
            docsData={filteredDocs}
        />
      </aside>

      {/* MOBILE HEADER */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 xl:hidden">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-80 bg-black border-r border-zinc-900 shadow-2xl">
                <SidebarContent 
                    activeDocId={activeDocId} 
                    setActiveDocId={setActiveDocId} 
                    docsData={filteredDocs}
                    onNavigate={() => setIsMobileMenuOpen(false)}
                />
            </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col min-w-0 relative xl:pl-72 bg-black">
        <header className="sticky top-0 z-40 h-16 border-b border-zinc-900 flex items-center justify-between px-6 bg-black/80 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="xl:hidden -ml-2 text-zinc-400" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden md:flex items-center gap-2 text-sm">
                <span className="text-zinc-500">Docs</span>
                <ChevronRight className="w-3 h-3 text-zinc-600" />
                <span className="font-medium text-zinc-200">{activeDoc?.title}</span>
            </div>
          </div>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input 
                placeholder="Search documentation..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-9 bg-zinc-900/50 border-zinc-800 focus:bg-zinc-900 focus:border-zinc-700 h-9 transition-all"
            />
            {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
          </div>
        </header>

        <ScrollArea ref={contentRef} className="flex-1">
           <div className="max-w-[1600px] mx-auto flex min-h-[calc(100vh-4rem)]">
              <div className="flex-1 min-w-0 p-8 lg:p-12 lg:pr-16">
                 <motion.div
                    key={activeDocId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                 >
                    <div className="flex items-center gap-3 mb-8">
                        <Badge variant="outline" className="border-zinc-800 text-zinc-400 bg-zinc-900/30 px-3 py-1 text-xs tracking-wide">v1.0.0</Badge>
                        <span className="text-xs text-zinc-600 font-mono uppercase tracking-wider">Last updated today</span>
                    </div>

                    <div className="prose prose-invert prose-zinc max-w-none 
                        prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
                        prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl
                        prose-p:text-zinc-400 prose-p:leading-relaxed
                        prose-a:text-white prose-a:underline prose-a:decoration-zinc-700 prose-a:underline-offset-4 hover:prose-a:decoration-white
                        prose-code:text-white prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:border prose-code:border-zinc-800
                        prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-900 prose-pre:rounded-xl
                        prose-strong:text-white prose-strong:font-semibold
                        prose-ul:list-disc prose-ul:marker:text-zinc-600
                        prose-img:rounded-xl prose-img:border prose-img:border-zinc-800
                    ">
<MDEditor.Markdown 
  source={activeDoc?.content} 
  components={{
    // ----------------------------------------------------
    // 1. CUSTOM CODE BLOCK (Green Button Style)
    // ----------------------------------------------------
    code: ({ inline, children, className, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      const codeContent = getNodeText(children);

      // Handle Mermaid Diagrams
      if (!inline && match && match[1] === "mermaid") {
        return <Mermaid chart={codeContent} />;
      }

      // Handle Standard Code Blocks
      if (!inline && match) {
        return (
          <div className="relative my-6 rounded-lg border border-zinc-800 bg-zinc-950/50 overflow-hidden group">
            
            {/* HEADER */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900/40">
              <span className="text-xs font-mono font-medium text-zinc-500 uppercase">
                {match[1]}
              </span>

     
            </div>

            {/* CONTENT */}
            <div className="p-4 overflow-x-auto">
              <code className={`${className} font-mono text-sm leading-relaxed`} {...props}>
                {children}
              </code>
            </div>
          </div>
        );
      }

      // Handle Inline Code
      return (
        <code 
          className="px-1.5 py-0.5 rounded-md bg-zinc-800/50 border border-zinc-700/50 text-blue-200 font-mono text-[0.9em]" 
          {...props}
        >
          {children}
        </code>
      );
    },

    // ----------------------------------------------------
    // 2. FULL WIDTH TABLE (Forced Expansion)
    // ----------------------------------------------------
    table: ({ children, ...props }) => (
      <div className="my-8 w-full !w-full rounded-xl border border-zinc-800 bg-zinc-950/30 overflow-hidden">
        {/* 'min-w-full' ensures it stretches even in flex containers */}
        <div className="w-full overflow-x-auto">
          <table className="min-w-full w-full text-left text-sm" {...props}>
            {children}
          </table>
        </div>
      </div>
    ),
    thead: ({ children, ...props }) => (
      <thead className="bg-zinc-900/50 border-b border-zinc-800" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }) => (
      <tbody className="divide-y divide-zinc-800/50" {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }) => (
      <tr className="transition-colors hover:bg-zinc-900/30" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }) => (
      <th className="px-6 py-4 font-medium text-zinc-300 uppercase tracking-wider text-xs whitespace-nowrap" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="px-6 py-4 text-zinc-400 whitespace-nowrap" {...props}>
        {children}
      </td>
    ),
    
    // ----------------------------------------------------
    // OTHER ELEMENTS
    // ----------------------------------------------------
    blockquote: ({ children, ...props }) => (
      <blockquote className="my-6 border-l-2 border-blue-500 pl-6 italic text-zinc-400" {...props}>
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-10 border-zinc-800" />,
    a: ({ children, href, ...props }) => (
       <a href={href} className="text-blue-400 hover:text-blue-300 hover:underline underline-offset-4 decoration-zinc-700" {...props}>
          {children}
       </a>
    ),
  }}
  style={{ backgroundColor: "transparent", color: "inherit", fontSize: "1.05rem" }} 
/>
                    </div>
                    
                    <div className="mt-20 pt-10 border-t border-zinc-900 flex justify-between gap-6">
                        {prevDoc && (
                            <Button variant="outline" onClick={() => setActiveDocId(prevDoc.id)} className="flex-1 sm:flex-none h-auto py-4 px-6 flex-col items-start gap-1.5 border-zinc-800 bg-black hover:bg-zinc-900 transition-all group">
                                <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400"><ArrowLeft className="w-3 h-3" /> Previous</span>
                                <span className="text-base font-medium text-zinc-200 group-hover:text-white">{prevDoc.title}</span>
                            </Button>
                        )}
                        <div className="flex-1 sm:flex-none" />
                        {nextDoc && (
                            <Button variant="outline" onClick={() => setActiveDocId(nextDoc.id)} className="flex-1 sm:flex-none h-auto py-4 px-6 flex-col items-end gap-1.5 border-zinc-800 bg-black hover:bg-zinc-900 transition-all group">
                                <span className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400">Next <ChevronRight className="w-3 h-3" /></span>
                                <span className="text-base font-medium text-zinc-200 group-hover:text-white">{nextDoc.title}</span>
                            </Button>
                        )}
                    </div>
                 </motion.div>
              </div>

              {/* TABLE OF CONTENTS - DESKTOP */}
              <div className="hidden lg:block w-64 shrink-0 border-l border-zinc-900">
                 <div className="sticky top-16 p-8">
                    <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-zinc-500">On This Page</h4>
                    <ul className="space-y-3 text-sm border-l border-zinc-900 relative">
                        {toc.map((item, idx) => (
                            <li key={idx} className="-ml-px">
                                <a href={`#${slugify(item)}`} onClick={(e) => handleScrollToSection(e, slugify(item))} className="block pl-4 border-l border-transparent hover:border-white text-zinc-500 hover:text-white transition-colors py-1">
                                    {item}
                                </a>
                            </li>
                        ))}
                    </ul>

                 </div>
              </div>
           </div>
        </ScrollArea>
      </main>
    </div>
  );
}