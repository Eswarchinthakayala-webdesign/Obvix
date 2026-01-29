import React from 'react';
import Hero from '../components/Hero';
import Features from '../components/Features';
import ObjectDetectionDemo from '../components/ObjectDetectionDemo';

// Professional SVG Logo Component (Local for footer if needed, or import from Header? Better to duplicate or move to separate file if reused. For now, I will keep a local one for footer or just import simple logo)
// Actually, the footer uses ObvixLogo. I should probably just leave it or define it locally or import it.
// The Header.jsx has ObvixLogo not exported.
// I will keep a simple ObvixLogo here for the footer because exporting it from Header isn't standard pattern unless I move it to components/Logo.jsx.
// I'll keep the local ObvixLogo for now to ensure footer breakage doesn't happen, or just define it.

const ObvixLogo = ({ className = "w-8 h-8" }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    aria-label="Obvix Logo"
  >
    <defs>
      <linearGradient id="logoGradient" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="currentColor" />
        <stop offset="1" stopColor="currentColor" stopOpacity="0.5" />
      </linearGradient>
    </defs>
    <path 
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" 
      stroke="url(#logoGradient)" 
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path 
      d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" 
      fill="currentColor"
      fillOpacity="0.2" 
    />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </svg>
);

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-foreground overflow-hidden selection:bg-primary/20 selection:text-primary pb-20 md:pb-0">
      
      <main className='bg-black relative'>
        {/* Background gradient effects could go here */}
        <div className="max-w-7xl mx-auto">
            <Hero />
            <ObjectDetectionDemo />
            <Features />
        </div>
      </main>

      <footer className="py-12 border-t border-white/10 mt-20 relative z-10 bg-black/40 backdrop-blur-sm">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
             <ObvixLogo className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} Obvix AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;