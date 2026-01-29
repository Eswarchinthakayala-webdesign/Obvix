import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Trash2, 
  Activity,
  FileImage,
  Layers,
  ChevronRight,
  Maximize2,
  Scan,
  Calendar
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// Professional Logo (Shared) - Reused for consistency
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

const FaceLandmarkSession = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [selectedItem, setSelectedItem] = useState(null);
    const [viewMode, setViewMode] = useState('masked'); // Default to masked for impact
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const storedSessions = JSON.parse(localStorage.getItem('obvix_sessions') || '[]');
        const foundSession = storedSessions.find(s => s.id === id);
        
        if (foundSession) {
            setSession(foundSession);
            // Select the most recent detection that has image data
            const validDetection = foundSession.detections.find(d => d.originalImage || d.maskedImage);
            setSelectedItem(validDetection || null);
        } else {
            toast.error("Session not found");
            navigate('/face-landmark-dashboard');
        }
    }, [id, navigate]);

    if (!session) return null;

    const deleteSession = () => {
        setIsDeleting(true);
        // Simulate a slight delay for smoother UX
        setTimeout(() => {
            const storedSessions = JSON.parse(localStorage.getItem('obvix_sessions') || '[]');
            const newSessions = storedSessions.filter(s => s.id !== id);
            localStorage.setItem('obvix_sessions', JSON.stringify(newSessions));
            toast.success("Session deleted successfully");
            navigate('/face-landmark-dashboard');
        }, 500);
    };

    const downloadImage = (dataUrl, suffix) => {
        if (!dataUrl) return;
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `obvix-face-mesh-${suffix}-${session.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Downloaded ${suffix} image`);
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const imageVariants = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
    };

    return (
        <div className="min-h-screen bg-black text-foreground font-sans pb-20 relative overflow-x-hidden">
             
             {/* Background Ambience */}
             <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
             <div className="fixed bottom-0 left-[-10%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <nav className="fixed top-0 w-full z-50 bg-black/70 backdrop-blur-xl border-b border-white/10 shadow-lg">
                <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/face-landmark-dashboard')} className="hover:bg-white/10 text-white rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                         <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                             <div className="relative flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                                 <ObvixLogo className="w-8 h-8 text-pink-500" />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-lg font-bold tracking-tight text-white leading-none hidden sm:block">Obvix</span>
                             </div>
                         </div>
                    </div>

                    <div className="flex gap-3 items-center">
                         <div className="hidden sm:flex flex-col items-end mr-2">
                             <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Session ID</span>
                             <span className="text-sm font-mono font-bold text-white">#{session.id.substring(0, 8)}</span>
                         </div>
                         <div className="h-8 w-px bg-white/10 hidden sm:block mx-1" />
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" disabled={isDeleting} className="rounded-full shadow-lg hover:bg-red-600 transition-colors">
                                  {isDeleting ? <Activity className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                                  {isDeleting ? 'Deleting...' : 'Delete'}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-zinc-950 border-white/10 text-white">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Session?</AlertDialogTitle>
                                <AlertDialogDescription className="text-zinc-400">
                                  This action cannot be undone. It will permanently remove this analysis and its associated images.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={deleteSession} className="bg-red-600 hover:bg-red-700 border-none">Delete Forever</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                    </div>
                </div>
            </nav>

            <motion.main 
                className="container mx-auto px-4 mt-16 sm:px-6 py-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Left Column: Image Viewer (Takes up more space) */}
                    <motion.div variants={itemVariants} className="lg:col-span-8 flex flex-col gap-6">
                        
                        {/* Interactive Viewer Card */}
                        <div className="group relative bg-zinc-900/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md min-h-[500px] flex flex-col">
                             
                             {/* Toolbar */}
                             <div className="absolute top-4 left-4 right-4 z-20 flex justify-center sm:justify-end pointer-events-none">
                                 <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-1 flex items-center shadow-xl pointer-events-auto">
                                    <Button 
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setViewMode('original')}
                                        className={`rounded-full px-4 text-xs font-medium transition-all ${viewMode === 'original' ? 'bg-white text-black shadow-sm' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        Original
                                    </Button>
                                    <Button 
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setViewMode('masked')}
                                        className={`rounded-full px-4 text-xs font-medium transition-all ${viewMode === 'masked' ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        Mesh Overlay
                                    </Button>
                                    <Button 
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setViewMode('side-by-side')}
                                        className={`rounded-full px-4 text-xs font-medium transition-all ${viewMode === 'side-by-side' ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                                    >
                                        Split View
                                    </Button>
                                 </div>
                             </div>

                             {/* Image Display Area */}
                             <div className="flex-1 relative w-full h-full p-4 sm:p-8 flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
                                 {selectedItem ? (
                                     <AnimatePresence mode="wait">
                                          {viewMode === 'original' && (
                                              <motion.img 
                                                key="original"
                                                variants={imageVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                src={selectedItem.originalImage} 
                                                alt="Original" 
                                                className="max-h-[600px] w-auto object-contain rounded-xl shadow-2xl border border-white/5"
                                              />
                                          )}
                                          {viewMode === 'masked' && (
                                              <motion.img 
                                                key="masked"
                                                variants={imageVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                src={selectedItem.maskedImage} 
                                                alt="Masked Overlay" 
                                                className="max-h-[600px] w-auto object-contain rounded-xl shadow-2xl border border-pink-500/20"
                                              />
                                          )}
                                          {viewMode === 'side-by-side' && (
                                              <motion.div 
                                                key="side-by-side"
                                                variants={imageVariants}
                                                initial="initial"
                                                animate="animate"
                                                exit="exit"
                                                className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full h-full items-center justify-items-center"
                                              >
                                                  <div className="relative group/img w-full">
                                                      <span className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] uppercase font-bold text-slate-300 z-10 border border-white/10">Input</span>
                                                      <img src={selectedItem.originalImage} alt="Input" className="w-full h-auto max-h-[400px] object-contain rounded-xl border border-white/10 shadow-lg" />
                                                  </div>
                                                  <div className="relative group/img w-full">
                                                      <span className="absolute top-2 left-2 bg-pink-500/20 backdrop-blur-sm px-2 py-0.5 rounded text-[10px] uppercase font-bold text-pink-300 z-10 border border-pink-500/20">Mesh Output</span>
                                                      <img src={selectedItem.maskedImage} alt="Output" className="w-full h-auto max-h-[400px] object-contain rounded-xl border border-pink-500/20 shadow-lg" />
                                                  </div>
                                              </motion.div>
                                          )}
                                     </AnimatePresence>
                                 ) : (
                                     <div className="flex flex-col items-center justify-center text-slate-500">
                                         <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                                            <FileImage className="w-8 h-8 opacity-50" />
                                         </div>
                                         <p>No image data available.</p>
                                     </div>
                                 )}
                             </div>
                        </div>

                        {/* Quick Insight (Mobile/Tablet Friendly) */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                             {[
                                { label: 'Faces', value: selectedItem?.faceCount || 0, icon: Scan, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                                { label: 'Confidence', value: `${selectedItem?.score || 0}%`, icon: Activity, color: 'text-green-400', bg: 'bg-green-500/10' },
                                { label: 'Date', value: new Date(session.startTime).toLocaleDateString(undefined, {month:'short', day:'numeric'}), icon: Calendar, color: 'text-slate-400', bg: 'bg-white/5' },
                                { label: 'Time', value: new Date(session.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), icon: Activity, color: 'text-slate-400', bg: 'bg-white/5' },
                             ].map((stat, i) => (
                                 <motion.div 
                                    key={i} 
                                    variants={itemVariants}
                                    className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors"
                                 >
                                     <stat.icon className={`w-5 h-5 mb-2 ${stat.color}`} />
                                     <span className="text-xl font-bold text-white">{stat.value}</span>
                                     <span className="text-[10px] text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                 </motion.div>
                             ))}
                        </div>

                    </motion.div>

                    {/* Right Column: Downloads & Detailed Info */}
                    <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
                        
                        {/* Download Panel */}
                        <div className="bg-gradient-to-br from-zinc-900/80 to-black border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-pink-500/20 transition-all duration-700" />
                            
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                                <Download className="w-5 h-5 text-pink-500" /> 
                                Export Results
                            </h3>
                            
                            <div className="space-y-4 relative z-10">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group/btn"
                                    onClick={() => downloadImage(selectedItem?.originalImage, 'original')}
                                    disabled={!selectedItem?.originalImage}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-black/40 rounded-lg text-slate-300">
                                            <FileImage className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <span className="block text-sm font-bold text-white group-hover/btn:text-pink-400 transition-colors">Original Image</span>
                                            <span className="block text-[10px] text-slate-500">Source photo without overlay</span>
                                        </div>
                                    </div>
                                    <Download className="w-4 h-4 text-slate-500 group-hover/btn:text-white transition-colors" />
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border border-pink-500/20 bg-pink-500/5 hover:bg-pink-500/10 hover:border-pink-500/30 transition-all group/btn"
                                    onClick={() => downloadImage(selectedItem?.maskedImage, 'masked')}
                                    disabled={!selectedItem?.maskedImage}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-pink-500/20 rounded-lg text-pink-400">
                                            <Layers className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <span className="block text-sm font-bold text-white group-hover/btn:text-pink-400 transition-colors">Mesh Overlay</span>
                                            <span className="block text-[10px] text-pink-500/60">Processed image with 468 points</span>
                                        </div>
                                    </div>
                                    <Download className="w-4 h-4 text-pink-400 group-hover/btn:text-white transition-colors" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Analysis Details Panel */}
                        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-400" /> 
                                Technical Details
                            </h3>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                    <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Model</span>
                                    <Badge variant="secondary" className="bg-black/40 text-slate-200 border border-white/5">MediaPipe FaceMesh</Badge>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                    <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Resolution</span>
                                    <span className="text-white font-mono text-sm">High Quality</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                                    <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Latency</span>
                                    <span className="text-white font-mono text-sm">~250ms</span>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-white/5">
                                    <p className="text-[10px] text-slate-500 leading-relaxed text-center">
                                        This analysis was generated using TensorFlow.js and MediaPipe. Data is stored locally on your device.
                                    </p>
                                </div>
                            </div>
                        </div>

                    </motion.div>

                </div>
            </motion.main>
        </div>
    );
};

export default FaceLandmarkSession;
