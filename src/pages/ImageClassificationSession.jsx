import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Download, 
  Trash2, 
  Activity,
  Tag,
  Clock,
  ChevronRight,
  ImageIcon,
  Calendar,
  Layers,
  Search,
  CheckCircle2,
  Scan,
  Maximize2
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

// Professional Logo (Shared)
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

const ImageClassificationSession = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [selectedDetection, setSelectedDetection] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const storedSessions = JSON.parse(localStorage.getItem('obvix_sessions') || '[]');
        const foundSession = storedSessions.find(s => s.id === id);
        
        if (foundSession) {
            setSession(foundSession);
            if (foundSession.detections && foundSession.detections.length > 0) {
                // Default select the first one or latest
                setSelectedDetection(foundSession.detections[0]);
            }
        } else {
            toast.error("Session not found");
            navigate('/image-classification-dashboard');
        }
    }, [id, navigate]);

    if (!session) return null;

    const deleteSession = () => {
        setIsDeleting(true);
        setTimeout(() => {
            const storedSessions = JSON.parse(localStorage.getItem('obvix_sessions') || '[]');
            const newSessions = storedSessions.filter(s => s.id !== id);
            localStorage.setItem('obvix_sessions', JSON.stringify(newSessions));
            toast.success("Session deleted successfully");
            navigate('/image-classification-dashboard');
        }, 500);
    };

    const downloadImage = (dataUrl, label) => {
        if (!dataUrl) return;
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `obvix-vision-${label.split(',')[0]}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Downloaded ${label} image`);
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

    return (
        <div className="min-h-screen bg-black text-foreground font-sans pb-20 relative overflow-x-hidden">
             
             {/* Background Ambience */}
             <div className="fixed top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />
             <div className="fixed bottom-0 left-[-10%] w-[400px] h-[400px] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <nav className="fixed top-0 w-full z-50 bg-black/70 backdrop-blur-xl border-b border-white/10 shadow-lg">
                <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/image-dashboard')} className="hover:bg-white/10 text-white rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                         <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                             <div className="relative flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                                 <ObvixLogo className="w-8 h-8 text-orange-500" />
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
                             
                             {/* Image Display Area */}
                             <div className="flex-1 relative w-full h-full p-4 sm:p-8 flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-opacity-5">
                                 {selectedDetection ? (
                                     <AnimatePresence mode="wait">
                                          <motion.div 
                                            key={selectedDetection.imageData}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ duration: 0.5 }}
                                            className="relative"
                                          >
                                              <img 
                                                src={selectedDetection.imageData} 
                                                alt="Target" 
                                                className="max-h-[600px] w-auto object-contain rounded-xl shadow-2xl border border-white/10 z-10 relative"
                                              />
                                              {/* Simple glowing backdrop for emphasis */}
                                              <div className="absolute inset-0 bg-orange-500/20 blur-3xl -z-10 rounded-full opacity-50" />
                                          </motion.div>
                                     </AnimatePresence>
                                 ) : (
                                     <div className="flex flex-col items-center justify-center text-slate-500">
                                         <div className="w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
                                            <ImageIcon className="w-8 h-8 opacity-50" />
                                         </div>
                                         <p>No image data available.</p>
                                     </div>
                                 )}
                             </div>
                        </div>

                        {/* Gallery / Thumbnails (If multiple images) */}
                        {session.detections && session.detections.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-4 px-2 snap-x">
                                {session.detections.map((det, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setSelectedDetection(det)}
                                        className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedDetection === det ? 'border-orange-500 scale-105 shadow-lg shadow-orange-500/20' : 'border-white/10 opacity-70 hover:opacity-100'}`}
                                    >
                                        <img src={det.imageData} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Quick Insight Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                             {[
                                { label: 'Top Class', value: selectedDetection?.label?.split(',')[0] || 'Unknown', icon: Tag, color: 'text-orange-400', bg: 'bg-orange-500/10' },
                                { label: 'Confidence', value: `${selectedDetection?.score || 0}%`, icon: Activity, color: 'text-green-400', bg: 'bg-green-500/10' },
                                { label: 'Date', value: new Date(session.startTime).toLocaleDateString(undefined, {month:'short', day:'numeric'}), icon: Calendar, color: 'text-slate-400', bg: 'bg-white/5' },
                                { label: 'Time', value: new Date(session.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}), icon: Clock, color: 'text-slate-400', bg: 'bg-white/5' },
                             ].map((stat, i) => (
                                 <motion.div 
                                    key={i} 
                                    variants={itemVariants}
                                    className="bg-zinc-900/40 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors"
                                 >
                                     <stat.icon className={`w-5 h-5 mb-2 ${stat.color}`} />
                                     <span className="text-md sm:text-lg font-bold text-white capitalize truncate max-w-full px-2" title={stat.value}>{stat.value}</span>
                                     <span className="text-[10px] text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                 </motion.div>
                             ))}
                        </div>

                    </motion.div>

                    {/* Right Column: Downloads & Detailed Info */}
                    <motion.div variants={itemVariants} className="lg:col-span-4 space-y-6">
                        
                        {/* Download Panel */}
                        <div className="bg-gradient-to-br from-zinc-900/80 to-black border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-orange-500/20 transition-all duration-700" />
                            
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                                <Download className="w-5 h-5 text-orange-500" /> 
                                Export Source
                            </h3>
                            
                            <div className="space-y-4 relative z-10">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group/btn"
                                    onClick={() => downloadImage(selectedDetection?.imageData, selectedDetection?.label)}
                                    disabled={!selectedDetection?.imageData}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-black/40 rounded-lg text-slate-300">
                                            <ImageIcon className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <span className="block text-sm font-bold text-white group-hover/btn:text-orange-400 transition-colors">Analyzed Image</span>
                                            <span className="block text-[10px] text-slate-500">Download high-res source</span>
                                        </div>
                                    </div>
                                    <Download className="w-4 h-4 text-slate-500 group-hover/btn:text-white transition-colors" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Predictions List Panel */}
                        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-md">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Layers className="w-5 h-5 text-blue-400" /> 
                                Prediction Details
                            </h3>
                            
                            <div className="space-y-3">
                                {selectedDetection && selectedDetection.allPredictions ? (
                                    selectedDetection.allPredictions.map((pred, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                                           <div className="flex items-center gap-3">
                                               <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-orange-500 text-black' : 'bg-white/10 text-slate-400'}`}>
                                                   {i + 1}
                                               </div>
                                               <div>
                                                   <span className="text-sm font-bold text-white capitalize block">{pred.className.split(',')[0]}</span>
                                                   <div className="w-24 bg-white/10 h-1 rounded-full mt-1.5 overflow-hidden">
                                                       <div className="bg-orange-500 h-full rounded-full" style={{width: `${pred.probability * 100}%`}}></div>
                                                   </div>
                                               </div>
                                           </div>
                                           <Badge variant="secondary" className="bg-black/40 text-xs font-mono border-0">
                                               {(pred.probability * 100).toFixed(1)}%
                                           </Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500 italic">No detailed predictions available.</p>
                                )}
                            </div>
                             
                             <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-2">
                                 <div className="flex justify-between items-center">
                                    <span className="text-slate-500 text-xs">Model Architecture</span>
                                    <span className="text-slate-300 text-xs bg-white/5 px-2 py-0.5 rounded">MobileNet v2</span>
                                 </div>
                                 <div className="flex justify-between items-center">
                                    <span className="text-slate-500 text-xs">Processing Time</span>
                                    <span className="text-slate-300 text-xs bg-white/5 px-2 py-0.5 rounded">~120ms</span>
                                 </div>
                             </div>

                        </div>

                    </motion.div>

                </div>
            </motion.main>
        </div>
    );
};

export default ImageClassificationSession;
