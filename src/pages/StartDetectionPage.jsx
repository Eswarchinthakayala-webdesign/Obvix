import React, { useState, useRef, useEffect } from 'react';
import ObjectDetectionDemo from '../components/ObjectDetectionDemo';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  History, 
  Cpu, 
  Activity, 
  Clock, 
  Target, 
  ShieldCheck, 
  ChevronRight,
  Database,
  Search,
  Trash2,
  Github,
  ArrowLeft,
  LayoutDashboard
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';

// Professional SVG Logo Component (Shared style)
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

const StartDetectionPage = () => {
  const [history, setHistory] = useState([]);
  const activeObjectsRef = useRef(new Map());
  const [sessionStartTime] = useState(new Date());
  const navigate = useNavigate();

  const handlePredictionUpdate = (predictions) => {
    const now = Date.now();
    const highConfPredictions = predictions.filter(p => p.score > 0.60);

    highConfPredictions.forEach(pred => {
      const label = pred.class.toUpperCase();
      if (!activeObjectsRef.current.has(label)) {
        const newEntry = {
          id: crypto.randomUUID(),
          label: label,
          score: Math.round(pred.score * 100),
          timestamp: new Date(),
        };
        setHistory(prev => [newEntry, ...prev]);
        activeObjectsRef.current.set(label, now);
      } else {
        activeObjectsRef.current.set(label, now);
      }
    });

    for (const [label, lastSeen] of activeObjectsRef.current.entries()) {
      if (now - lastSeen > 2000) {
        activeObjectsRef.current.delete(label);
      }
    }
  };

  const clearHistory = () => {
    setHistory([]);
    activeObjectsRef.current.clear();
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Save session on unmount
  useEffect(() => {
    return () => {
       if (history.length > 0) {
           const sessionData = {
               id: crypto.randomUUID(),
               startTime: sessionStartTime,
               endTime: new Date(),
               detections: history,
               detectionCount: history.length
           };
           
           const existingSessions = JSON.parse(localStorage.getItem('obvix_sessions') || '[]');
           // Limit to last 50 sessions to save space
           const updatedSessions = [sessionData, ...existingSessions].slice(0, 50);
           localStorage.setItem('obvix_sessions', JSON.stringify(updatedSessions));
       }
    };
  }, [history, sessionStartTime]);

  return (
    <div className="min-h-screen bg-black text-foreground overflow-hidden selection:bg-primary/20 selection:text-primary pb-20 flex flex-col">
      
    

       {/* Professional Header (Matching Landing Page) */}
       <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            

              {/* Logo & Title Section */}
              <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
                <div className="relative flex items-center justify-center">
                  <ObvixLogo className="w-8 h-8 text-primary relative z-10" />
                </div>
                <div className="flex flex-col">
                    <span className="text-xl font-bold tracking-tight text-white leading-none">
                    Obvix
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                        Start Detection
                    </span>
                </div>
              </div>
          </div>

          {/* Desktop Navigation & Actions */}
          <div className="flex items-center gap-4">
             <Button 
                variant="ghost" 
                className="text-sm font-medium cursor-pointer text-slate-300 hover:text-white hover:bg-white/5"
                onClick={() => navigate('/dashboard')}
             >
                <LayoutDashboard className="w-4 h-4" />
                <span className='text-white  hidden sm:black'> View Dashboard</span>
             </Button>
             
             <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">SYSTEM ACTIVE</span>
             </div>

            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noreferrer" 
                className="group flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                title="Star on GitHub"
              >
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                  <Github size={18} />
                </div>
              </a>
            </div>
          </div>

        </div>
      </nav>

      {/* Main Content */}
      <div className="relative  z-10 mt-14 md:mt-14 sm:mt-14 flex-1 bg-black container mx-auto p-4 lg:p-6 overflow-hidden flex flex-col">
        {/* Main Content Grid */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
            
            {/* Left Column: Camera Feed */}
            <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl">
                    <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:30px_30px]" />
                    
                    {/* The Detection Component */}
                    <div className="h-full w-full flex flex-col">
                        <ObjectDetectionDemo onPredictionUpdate={handlePredictionUpdate} minimal={true} />
                    </div>

                    {/* Overlay Tech Decals */}
                    <div className="absolute top-16 sm:top-20 left-4 pointer-events-none z-20">
                       <span className="text-[10px] font-mono text-purple-400/50 rounded-full  border border-purple-400/30 p-1">ALGORITHM: COCO-SSD v2</span>
                    </div>
                </div>
            </div>

            {/* Right Column: Session History */}
            <div className="lg:col-span-1 flex flex-col h-full min-h-[400px]">
                <div className="flex-1 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl flex flex-col overflow-hidden shadow-2xl">
                    
                    {/* Panel Header */}
                    <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                       <div className="flex items-center gap-2">
                          <History className="w-4 h-4 text-purple-400" />
                          <h3 className="font-semibold text-sm tracking-wide text-slate-200">DETECTION LOG</h3>
                          <Badge variant="outline" className="ml-2 bg-purple-500/10 border-purple-500/20 text-purple-300 text-[10px] h-5">
                            {history.length}
                          </Badge>
                       </div>
                       <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={clearHistory}
                          className="h-7 w-7 text-slate-400 cursor-pointer hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Clear History"
                        >
                          <Trash2 className="w-4 h-4" />
                       </Button>
                    </div>

                    {/* List Area */}
                    <ScrollArea className="h-120 p-0">
                       <div className="p-4 flex flex-col gap-3">
                          <AnimatePresence initial={false}>
                            {history.map((item, index) => (
                              <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: 20, height: 0 }}
                                animate={{ opacity: 1, x: 0, height: 'auto' }}
                                exit={{ opacity: 0, x: -20, height: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="relative overflow-hidden cursor-pointer group"
                              >
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500 rounded-l-md" />
                                <div className="ml-1 bg-white/5 hover:bg-white/10 border border-white/5 release-border-r-md p-3 transition-colors">
                                  <div className="flex justify-between items-start mb-1">
                                    <h4 className="font-bold text-sm text-white tracking-wide flex items-center gap-2">
                                      {item.label}
                                      {index === 0 && (
                                        <span className="flex h-2 w-2 relative">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                                        </span>
                                      )}
                                    </h4>
                                    <span className="text-[10px] font-mono text-slate-400">{formatTime(item.timestamp)}</span>
                                  </div>
                                  
                                  <div className="flex justify-between items-end">
                                      <div className="flex gap-4">
                                        <div className="flex flex-col">
                                          <span className="text-[10px] uppercase text-slate-500 font-mono">CONFIDENCE</span>
                                          <span className={`text-xs font-bold font-mono ${item.score > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {item.score}%
                                          </span>
                                        </div>
                                          <div className="flex flex-col">
                                            <span className="text-[10px] uppercase text-slate-500 font-mono">ID</span>
                                            <span className="text-xs text-slate-300 font-mono truncate w-16">
                                              #{item.id.slice(0,6)}
                                            </span>
                                          </div>
                                      </div>
                                      <Target className="w-4 h-4 text-purple-500/30 group-hover:text-purple-500/60 transition-colors" />
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                            
                            {history.length === 0 && (
                              <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                                <Search className="w-12 h-12 mb-3 text-slate-500" />
                                <p className="text-sm font-medium text-slate-400">No objects detected</p>
                                <p className="text-xs text-slate-600 max-w-[150px] mt-1">Waiting for video input signal...</p>
                              </div>
                            )}
                          </AnimatePresence>
                       </div>
                    </ScrollArea>
                    
                    {/* List Footer Stats */}
                     <div className="p-3 bg-black/20 border-t border-white/5 grid grid-cols-2 gap-2">
                        <div className="bg-white/5 rounded p-2 flex flex-col justify-center items-center">
                           <span className="text-[9px] text-slate-400 uppercase">Total Events</span>
                           <span className="text-sm font-bold text-white">{history.length}</span>
                        </div>
                        <div className="bg-white/5 rounded p-2 flex flex-col justify-center items-center">
                           <span className="text-[9px] text-slate-400 uppercase">Session Time</span>
                           <span className="text-sm font-bold text-white">
                             {formatTime(sessionStartTime)}
                           </span>
                        </div>
                     </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  )
}

export default StartDetectionPage