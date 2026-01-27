import React, { useEffect, useState } from 'react';
import { Github, Menu, X, ArrowRight, Home, ScanFace, Hand, FileText, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Professional SVG Logo Component
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

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();
  
    // Smooth scroll behavior
    useEffect(() => {
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 10);
      };
  
      window.addEventListener('scroll', handleScroll, { passive: true });
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);

  return (
    <>
      {/* Professional Header */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ease-in-out border-b ${
          isScrolled 
            ? 'bg-black/80 backdrop-blur-xl border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]' 
            : 'bg-transparent border-transparent'
        }`}
      >
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
            <div className="relative flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <ObvixLogo className="w-9 h-9 text-primary relative z-10" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Obvix
            </span>
          </div>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
              <a 
                href="/hand-tracking" 
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Hand Tracking
              </a>
              <a 
                href="/face-detection" 
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Face Detection
              </a>
              <a 
                href="/docs" 
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                Docs
              </a>
            </div>
            
            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer" 
                className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors"
              >
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                  <Github size={18} />
                </div>
                <span className="hidden lg:inline">Star on GitHub</span>
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10 p-2 pb-6 flex justify-around items-center">
            <a href="/" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-white hover:bg-white/10 transition-all flex-1">
                <Home className="w-5 h-5" />
                <span className="text-[10px] font-medium">Home</span>
            </a>
            <a href="/face-detection" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all flex-1">
                <ScanFace className="w-5 h-5" />
                <span className="text-[10px] font-medium">Face</span>
            </a>
            <a href="/hand-tracking" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all flex-1">
                <Hand className="w-5 h-5" />
                <span className="text-[10px] font-medium">Hands</span>
            </a>
            <a href="/dashboard" className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all flex-1">
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-[10px] font-medium">Dashboard</span>
            </a>
      </div>
    </>
  )
}

export default Header
