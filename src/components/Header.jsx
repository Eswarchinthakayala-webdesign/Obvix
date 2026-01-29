import React, { useEffect, useState } from 'react';
import { Github, Menu, X, Layers, ArrowRight, Home, ScanFace, Hand, FileText, LayoutDashboard, PersonStanding, Type, Image as ImageIcon, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button";

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
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
  
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

    const navItems = [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Face Detection', href: '/face-detection', icon: ScanFace },
        { label: 'Face Landmarks', href: '/face-landmark', icon: ScanFace },
        { label: 'Pose Analysis', href: '/pose-detection', icon: PersonStanding },
        { label: 'Image Vision', href: '/image-classification', icon: ImageIcon },
        { label: 'Text Recognition', href: '/text-detection', icon: Type },
        { label: 'Hand Tracking', href: '/hand-tracking', icon: Hand },
        { label: 'Docs', href: '/docs', icon: FileText },
    ];

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
              <ObvixLogo className="w-9 h-9 text-zinc-500 relative z-10" />
            </div>
            <span className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Obvix
            </span>
          </div>

          {/* Desktop Navigation & Actions */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6">
                {navItems.filter(item => item.label !== 'Home').map((item) => (
                    <a 
                        key={item.href}
                        href={item.href} 
                        className={`text-sm font-medium transition-colors ${location.pathname === item.href ? 'text-zinc-400' : 'text-slate-300 hover:text-white'}`}
                    >
                        {item.label === 'Image Vision' ? 'Vision' : 
                         item.label === 'Text Recognition' ? 'Text' : 
                         item.label === 'Pose Analysis' ? 'Pose' : item.label}
                    </a>
                ))}
               
            </div>
            
            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
             <button onClick={() => navigate('/settings')} className="text-slate-300 hover:text-white transition-colors">
                     <Settings className="w-5 h-5" />
                </button>
            </div>
          </div>

          {/* Mobile Menu Trigger (Sheet) */}
          <div className="md:hidden flex items-center">
              <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                  <SheetTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 rounded-full">
                          <Menu className="w-6 h-6" />
                      </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="bg-zinc-950 border-l border-white/10 w-[80%] sm:w-[385px] p-0">
                      <div className="flex flex-col h-full bg-zinc-950">
                          {/* Sheet Header */}
                          <div className="p-6 border-b border-white/10 bg-black/20">
                              <div className="flex items-center gap-3 mb-2">
                                  <ObvixLogo className="w-8 h-8 text-zinc-500" />
                                  <span className="text-xl font-bold text-white">Obvix</span>
                              </div>
                              <p className="text-sm text-slate-400">Advanced AI Vision at your fingertips.</p>
                          </div>
                          
                          {/* Navigation Links */}
                          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                              {navItems.map((item) => {
                                  const Icon = item.icon;
                                  const isActive = location.pathname === item.href;
                                  return (
                                      <a 
                                          key={item.href}
                                          href={item.href}
                                          onClick={() => setIsSheetOpen(false)}
                                          className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                                              isActive 
                                              ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' 
                                              : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                          }`}
                                      >
                                          <div className={`p-2 rounded-lg ${isActive ? 'bg-zinc-500/20' : 'bg-white/5'}`}>
                                              <Icon className="w-5 h-5" />
                                          </div>
                                          <span className="font-medium text-sm">{item.label}</span>
                                          {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-zinc-500" />}
                                      </a>
                                  )
                              })}
                              
                              <a 
                                  onClick={() => {
                                      navigate('/settings');
                                      setIsSheetOpen(false);
                                  }}
                                  className={`flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer ${
                                      location.pathname === '/settings'
                                      ? 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20' 
                                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                                  }`}
                              >
                                  <div className={`p-2 rounded-lg ${location.pathname === '/settings' ? 'bg-zinc-500/20' : 'bg-white/5'}`}>
                                      <Settings className="w-5 h-5" />
                                  </div>
                                  <span className="font-medium text-sm">Settings</span>
                                  {location.pathname === '/settings' && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-zinc-500" />}
                              </a>
                          </div>

                          {/* Footer Actions */}
                          <div className="p-6 border-t border-white/10 mt-auto bg-black/20">
                               <Button className="w-full bg-white text-black hover:bg-slate-200" onClick={() => {
                                   navigate('/dashboard');
                                   setIsSheetOpen(false);
                               }}>
                                   View Dashboard <ArrowRight className="w-4 h-4 ml-2" />
                               </Button>
                          </div>
                      </div>
                  </SheetContent>
              </Sheet>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation Bar - Sticky Premium */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
           <div className="bg-black/90 backdrop-blur-2xl border-t border-white/10 shadow-[0_-4px_30px_rgba(0,0,0,0.5)] pb-5 pt-3 px-2">
               <div className="flex justify-between items-center relative">
                    {[
                        { label: 'Home', href: '/', icon: Home, color: 'text-zinc-400' },
                        { label: 'Main', href: '/dashboard', icon: LayoutDashboard, color: 'text-primary' },
                        { label: 'Text', href: '/text-dashboard', icon: Type, color: 'text-yellow-400' },
                        { label: 'Vision', href: '/image-dashboard', icon: ImageIcon, color: 'text-orange-600' },
                        { label: 'Faces', href: '/face-landmark-dashboard', icon: ScanFace, color: 'text-pink-500' },
                      
                    ].map((item) => {
                        const isActive = location.pathname === item.href;
                        const Icon = item.icon;
                        
                        return (
                            <button 
                                key={item.label}
                                onClick={() => navigate(item.href)}
                                className={`relative flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all flex-1 min-w-[60px] ${isActive ? item.color : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {isActive && (
                                    <span className="absolute inset-0 bg-white/5 rounded-xl animate-in zoom-in duration-200" />
                                )}
                                <div className={`relative z-10 transition-transform duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                                    <Icon className={`w-5 h-5 ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}`} />
                                </div>
                                {isActive && (
                                    <span className="text-[10px] font-bold tracking-wide animate-in slide-in-from-bottom-2 fade-in duration-300 absolute -bottom-1">
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
               </div>
           </div>
      </div>
    </>
  )
}

export default Header
