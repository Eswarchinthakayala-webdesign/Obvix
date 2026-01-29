import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Trash2, 
  HardDrive, 
  ScanFace, 
  Type, 
  Image as ImageIcon, 
  PersonStanding, 
  Hand,
  Settings,
  ChevronRight,
  Shield,
  Zap,
  CheckCircle2,
  Box,
  Info
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
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

// Feature Configuration
const FEATURES = [
  {
    id: 'object-detection',
    title: 'Object Detection',
    description: 'High-speed bounding box detection for 80+ object classes.',
    icon: Box,
    color: 'text-red-500',
    bg: 'bg-red-500/10',
    path: '/start-detection'
  },
  {
    id: 'face-landmarks',
    title: 'Face Landmarks',
    description: '468-point 3D face mesh detection with historic analysis.',
    icon: ScanFace,
    color: 'text-pink-500',
    bg: 'bg-pink-500/10',
    path: '/face-landmark'
  },
  {
    id: 'image-vision',
    title: 'Vision Analytics',
    description: 'Real-time object classification and scene recognition.',
    icon: ImageIcon,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10',
    path: '/image-classification'
  },
  {
    id: 'text-ocr',
    title: 'Text Recognition',
    description: 'Optical character recognition for physical world text.',
    icon: Type,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
    path: '/text-detection'
  },
  {
    id: 'pose-analysis',
    title: 'Pose Analysis',
    description: 'Full-body movement tracking and posture estimation.',
    icon: PersonStanding,
    color: 'text-green-500',
    bg: 'bg-green-500/10',
    path: '/pose-detection'
  },
  {
    id: 'hand-tracking',
    title: 'Hand Tracking',
    description: 'Precise finger and gesture recognition.',
    icon: Hand,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    path: '/hand-tracking'
  }
];

const SettingsPage = () => {
    const navigate = useNavigate();
    const [storageUsage, setStorageUsage] = useState({ used: 0, total: 5242880, percent: 0 }); // 5MB limit assumption

    useEffect(() => {
        calculateStorage();
    }, []);

    const calculateStorage = () => {
        let total = 0;
        for (let x in localStorage) {
            if (Object.prototype.hasOwnProperty.call(localStorage, x)) {
                total += ((localStorage[x].length + x.length) * 2);
            }
        }
        
        const usedBytes = JSON.stringify(localStorage).length;
        const percent = Math.min((usedBytes / 5242880) * 100, 100);
        
        setStorageUsage({
            used: usedBytes,
            total: 5242880,
            percent: percent
        });
    };

    const clearAllData = () => {
        localStorage.clear();
        calculateStorage();
        toast.success("All local data has been cleared.");
    };

    const formatBytes = (bytes, decimals = 2) => {
        if (!+bytes) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    };

    return (
        <div className="min-h-screen bg-black text-foreground font-sans pb-20 selection:bg-slate-700/30">
            {/* Background Ambience */}
            <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-zinc-900/50 to-transparent pointer-events-none" />

            {/* Header */}
            <nav className="sticky top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="rounded-full hover:bg-white/10 text-white">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <h1 className="text-lg font-bold text-white tracking-tight">Settings</h1>
                    </div>
                </div>
            </nav>

            <main className="container mx-auto px-6 py-10 max-w-8xl space-y-12 relative z-10">
                
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <h2 className="text-3xl font-bold text-white">System Preferences</h2>
                    <p className="text-slate-400 max-w-2xl">Manage your local data, review active features, and configure application behavior.</p>
                </motion.div>

                {/* Storage Management Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-sm relative overflow-hidden"
                >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                                <HardDrive className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Local Storage</h3>
                                <p className="text-sm text-slate-400">Browser-based data persistence</p>
                            </div>
                        </div>
                        <div className="text-right">
                             <div className="text-2xl font-mono font-bold text-white">{formatBytes(storageUsage.used)}</div>
                             <div className="text-xs text-slate-500 uppercase tracking-wider">Used of ~5 MB</div>
                        </div>
                    </div>

                    <div className="space-y-2 mb-8">
                        <div className="flex justify-between text-xs font-medium text-slate-400">
                            <span>Usage</span>
                            <span>{storageUsage.percent.toFixed(1)}%</span>
                        </div>
                        <Progress value={storageUsage.percent} className="h-2 bg-white/5" indicatorClassName={storageUsage.percent > 90 ? "bg-red-500" : "bg-blue-500"} />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-white/5 pt-6 gap-4">
                         <div className="flex items-start gap-4 bg-red-500/5 p-4 rounded-xl border border-red-500/10 max-w-xl">
                             <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                             <div>
                                <p className="text-sm font-bold text-red-200">Storage Limit Disclaimer</p>
                                <p className="text-xs text-red-300/80 mt-1 leading-relaxed">
                                   Obvix runs entirely in your browser without a cloud database. 
                                   All generated images and analytics are stored in your device's 
                                   Local Storage (limited to ~5MB). If this fills up, older sessions may need to be cleared manually. 
                                   <br/><br/>
                                   <span className="opacity-100 font-medium tracking-wide">We sincerely apologize for this limitation as we prioritize your privacy and zero-server architecture.</span>
                                </p>
                             </div>
                         </div>
                         
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 h-auto py-3">
                                    <Trash2 className="w-4 h-4 mr-2" /> Clear All Data
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-zinc-950 border-white/10 text-white">
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Reset Application Data?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-zinc-400">
                                        This will delete all analysis history, settings, and cached sessions. This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={clearAllData} className="bg-red-600 hover:bg-red-700 text-white border-none">Yes, Clear Everything</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                         </AlertDialog>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" /> Active Modules
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {FEATURES.map((feature, idx) => (
                            <motion.div
                                key={feature.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + (idx * 0.05) }}
                                className="group bg-zinc-900/30 border border-white/5 hover:border-white/10 rounded-2xl p-5 hover:bg-zinc-900/50 transition-all duration-300 flex flex-col justify-between h-full"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center ${feature.color} group-hover:scale-110 transition-transform shadow-inner`}>
                                            <feature.icon className="w-6 h-6" />
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => navigate(feature.path)}
                                            className="text-slate-500 hover:text-white hover:bg-white/10 rounded-full -mr-2 -mt-2"
                                        >
                                            <ChevronRight className="w-5 h-5" />
                                        </Button>
                                    </div>
                                    
                                    <h4 className="text-lg font-bold text-white group-hover:text-primary transition-colors mb-2">{feature.title}</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed opacity-80">{feature.description}</p>
                                </div>
                                <div className="mt-6 pt-4 border-t border-white/5 flex items-center gap-2">
                                    <Badge variant="secondary" className="bg-black/40 text-[10px] text-green-400 border border-green-500/20 px-2 py-0.5 uppercase tracking-wider font-bold">
                                        Active
                                    </Badge>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* About Project Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="border-t border-white/10 pt-10"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Info className="w-5 h-5 text-blue-400" /> Why Obvix?
                            </h3>
                            <div className="space-y-4 text-sm text-slate-400 leading-relaxed">
                                <p>
                                    We built Obvix to democratize access to advanced computer vision. Traditionally, analyzing video feeds for objects, faces, or text required powerful servers and expensive cloud APIs.
                                </p>
                                <p>
                                    Obvix proves that modern web browsers are capable of running state-of-the-art AI models locally. By leveraging <span className="text-white font-medium">TensorFlow.js</span> and <span className="text-white font-medium">WebGL</span>, we bring privacy-first, zero-latency intelligence to any device with a camera.
                                </p>
                            </div>
                        </div>
                        <div className="bg-zinc-900/20 p-6 rounded-2xl border border-white/5">
                             <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Project Mission</h4>
                             <ul className="space-y-3">
                                 {[
                                     "Zero Server Costs (Client-Side Only)",
                                     "Privacy by Design (No Data Uploads)",
                                     "Real-time Performance (60 FPS)",
                                     "Accessible to Everyone"
                                 ].map((item, i) => (
                                     <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                                         <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                         {item}
                                     </li>
                                 ))}
                             </ul>
                        </div>
                    </div>
                </motion.div>

          

            </main>
        </div>
    );
};

export default SettingsPage;
