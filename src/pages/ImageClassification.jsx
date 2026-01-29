import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, 
  Activity, 
  Maximize2, 
  Layers,
  Image as ImageIcon,
  LayoutDashboard,
  Zap
} from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const ImageClassification = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const [model, setModel] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [predictions, setPredictions] = useState([]);
    const requestRef = useRef();
    const isProcessingRef = useRef(false);
    
    // Session Recording Refs
    const sessionRef = useRef({
        id: null,
        startTime: null,
        detections: [],
        detectionCount: 0,
        type: 'image_classification'
    });
    const lastLogRef = useRef(0);
    const uniqueItemsRef = useRef(new Set());

    useEffect(() => {
        const loadModel = async () => {
             try {
                 await tf.ready();
                 // Load MobileNet (v2 is better balance of speed/acc)
                 const net = await mobilenet.load({ version: 2, alpha: 1.0 });
                 setModel(net);
                 setIsLoading(false);
                 toast.success("MobileNet V2 Loaded");
             } catch (err) {
                 console.error("Model Error", err);
                 toast.error("Failed to load Neural Network");
                 setIsLoading(false);
             }
        };
        loadModel();

        return () => {
             // TFJS cleanup if needed
        };
    }, []);

    const [facingMode, setFacingMode] = useState('user'); // Default to user for easier testing

    const startCamera = async () => {
        if (!model) return;
        setIsLoading(true);
        try {
            // Stop existing if any
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: facingMode,
                    width: { ideal: 640 }, 
                    height: { ideal: 480 }
                }, 
                audio: false
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Important for iOS/mobile to play inline
                videoRef.current.setAttribute('autoplay', '');
                videoRef.current.setAttribute('muted', '');
                videoRef.current.setAttribute('playsinline', '');
                
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play();
                    setIsStreaming(true);
                    setIsLoading(false);
                    
                    sessionRef.current = {
                        id: Math.random().toString(36).substr(2, 9),
                        startTime: new Date().toISOString(),
                        detections: [],
                        detectionCount: 0,
                        type: 'image_classification'
                    };
                    uniqueItemsRef.current.clear();
                    
                    classifyFrame();
                };
            }
        } catch (err) {
            console.error("Camera Error: ", err);
            toast.error("Unable to access camera. Check permissions.");
            setIsLoading(false);
        }
    };

    const toggleCamera = () => {
        const newMode = facingMode === 'user' ? 'environment' : 'user';
        setFacingMode(newMode);
        // Restart if already streaming
        if (isStreaming) {
            stopCamera(); // Stop first
            // We need to wait a tick or just rely on the user to start again? 
            // Better UX: Auto restart. We'll implement a fast restart effect or just let user click start
            // For simplicity, let's just update state and user clicks start, 
            // OR recursively call startCamera (requires refactoring due to closure).
            // Let's just set state and show a toast "Switching camera... click start"
            toast.info(`Switched to ${newMode === 'user' ? 'Selfie' : 'Back'} camera. Press Start.`);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsStreaming(false);
            setPredictions([]);
            
            // Save Session
            if (sessionRef.current && sessionRef.current.detections.length > 0) {
                const finalSession = {
                    ...sessionRef.current,
                    endTime: new Date().toISOString()
                };
                
                const existingSessions = JSON.parse(localStorage.getItem('obvix_sessions') || '[]');
                localStorage.setItem('obvix_sessions', JSON.stringify([...existingSessions, finalSession]));
                toast.success("Session saved to Dashboard");
            }
            
            cancelAnimationFrame(requestRef.current);
        }
    };

    const [logCount, setLogCount] = useState(0);

    const classifyFrame = async () => {
        if (!model || !videoRef.current || !isStreaming) return;

        if (isProcessingRef.current) {
             requestRef.current = requestAnimationFrame(classifyFrame);
             return;
        }

        isProcessingRef.current = true;

        try {
             // Classify
             const predictions = await model.classify(videoRef.current, 3); // Top 3
             setPredictions(predictions);

             // Log Logic (Only log high confidence, new items)
             if (predictions.length > 0) {
                 const best = predictions[0];
                 const now = Date.now();
                 
                 // Log if > 60% confident (Lowered from 0.8)
                 if (best.probability > 0.6) {
                     const isNew = !uniqueItemsRef.current.has(best.className);
                     
                     // Log if new item OR 2 seconds passed since last log (Lowered from 5s)
                     if (isNew || (now - lastLogRef.current > 2000)) {
                         sessionRef.current.detections.push({
                             id: Math.random().toString(36).substr(2, 5),
                             label: best.className,
                             score: Math.round(best.probability * 100),
                             timestamp: new Date().toISOString()
                         });
                         sessionRef.current.detectionCount = sessionRef.current.detections.length;
                         
                         uniqueItemsRef.current.add(best.className);
                         lastLogRef.current = now;
                         
                         // Force re-render of logs
                         setLogCount(c => c + 1);
                     }
                 }
             }

        } catch (err) {
             console.error(err);
        } finally {
             isProcessingRef.current = false;
             // Throttle slightly to save battery - 10 FPS is enough for classification
             setTimeout(() => {
                 requestRef.current = requestAnimationFrame(classifyFrame);
             }, 100);
        }
    };

    useEffect(() => {
        return () => {
            cancelAnimationFrame(requestRef.current);
            stopCamera();
        };
    }, []);

    const toggleFullscreen = () => {
         if (!document.fullscreenElement) {
             videoRef.current?.parentElement?.requestFullscreen().catch(console.error);
         } else {
             document.exitFullscreen();
         }
    };

    return (
        <div className="min-h-screen bg-black text-foreground selection:bg-orange-500/30 pb-20">
            {/* Header */}
            <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                     <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-white/10 text-white rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex flex-col">
                             <span className="font-bold text-white tracking-tight">Obvix Vision</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            className="text-sm font-medium cursor-pointer text-slate-300 hover:text-white hover:bg-white/5"
                            onClick={() => navigate('/dashboard')}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span className='text-white  hidden sm:black'> View Dashboard</span>
                        </Button>
                         <div className="h-4 w-px bg-white/10 mx-2" />
                         <Badge variant="outline" className="bg-white/5 border-white/10 text-slate-300 font-mono hidden sm:flex">
                            {isLoading ? 'INIT...' : (isStreaming ? 'ACTIVE' : 'READY')}
                         </Badge>
                     </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 pt-24 pb-12">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
                     
                     {/* Left Column: Camera Feed */}
                     <div className="lg:col-span-2 h-100 sm:h-150 flex flex-col gap-4">
                         <div className="relative flex-1 bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group flex items-center justify-center">
                              <video 
                                 ref={videoRef}
                                 className="absolute inset-0 w-full h-full object-cover" 
                                 playsInline 
                                 muted
                              />

                              {/* Prediction Overlay HUD */}
                              {isStreaming && predictions.length > 0 && (
                                  <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-2 z-20">
                                      {predictions.map((p, i) => (
                                          <div key={i} className="bg-black/80 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center gap-4">
                                              <div className="w-12 text-right font-bold text-orange-400 font-mono">
                                                  {(p.probability * 100).toFixed(0)}%
                                              </div>
                                              <div className="flex-1">
                                                  <div className="flex justify-between text-white text-sm font-medium mb-1 uppercase tracking-wide">
                                                      <span>{p.className.split(',')[0]}</span>
                                                  </div>
                                                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                                      <div 
                                                        className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-300 ease-out"
                                                        style={{ width: `${p.probability * 100}%` }}
                                                      />
                                                  </div>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              )}

                              {!isStreaming && (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm z-10 p-6 text-center">
                                       <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-orange-500/30">
                                           <ImageIcon className="w-8 h-8 text-orange-500" />
                                       </div>
                                       <h2 className="text-2xl font-bold text-white mb-2">Image Classification</h2>
                                       <p className="text-slate-400 max-w-md mb-8">
                                           Real-time scene analysis using MobileNet V2. Identify over 1,000 types of objects and scenes instantaneously.
                                       </p>
                                       <Button 
                                          size="lg" 
                                          className="rounded-full bg-orange-600 hover:bg-orange-700 text-white px-8 font-medium shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all hover:scale-105"
                                          onClick={startCamera}
                                          disabled={isLoading || !model}
                                       >
                                          {isLoading ? 'Loading Model...' : 'Start Vision'}
                                       </Button>
                                  </div>
                              )}
                              
                              {isStreaming && (
                                  <div className="absolute top-4 right-4 z-20">
                                      <div className="flex gap-2">
                                          <Button 
                                            variant="secondary" 
                                            size="icon" 
                                            className="rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/10"
                                            onClick={toggleCamera}
                                            title="Switch Camera"
                                          >
                                            <Zap className="w-4 h-4" /> {/* Or CameraFlip icon if available, using Zap as placeholder or refresh */}
                                          </Button>
                                          <Button 
                                            variant="secondary" 
                                            size="icon" 
                                            className="rounded-full bg-black/40 hover:bg-black/60 text-white border border-white/10"
                                            onClick={toggleFullscreen}
                                          >
                                            <Maximize2 className="w-4 h-4" />
                                          </Button>
                                          <Button 
                                            variant="destructive" 
                                            className="rounded-full px-6 font-medium shadow-lg hover:bg-red-600"
                                            onClick={stopCamera}
                                          >
                                            Stop
                                          </Button>
                                      </div>
                                  </div>
                              )}
                         </div>
                     </div>

                     {/* Right Column: Live Session Log */}
                     <div className="lg:col-span-1 bg-zinc-900/30 border border-white/10 rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl">
                         <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
                             <h3 className="font-bold text-white flex items-center gap-2">
                                <Layers className="w-4 h-4 text-orange-400" /> Insight Log
                             </h3>
                             <Badge variant="secondary" className="bg-orange-500/10 text-orange-400 text-[10px]">
                                {sessionRef.current.detectionCount} Items
                             </Badge>
                         </div>
                         <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                             {sessionRef.current.detections.length === 0 ? (
                                 <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm opacity-50">
                                     <Zap className="w-12 h-12 mb-2" />
                                     <p>Scan your surroundings...</p>
                                 </div>
                             ) : (
                                 [...sessionRef.current.detections].reverse().map((det, i) => (
                                     <div key={i} className="bg-white/5 border border-white/5 rounded-lg p-3 flex items-center justify-between animate-in fade-in slide-in-from-right-4 duration-300">
                                         <div className="flex items-center gap-3 overflow-hidden">
                                             <div className="w-8 h-8 rounded-full bg-orange-500/20 flex flex-shrink-0 items-center justify-center text-orange-400">
                                                 <ImageIcon size={16} />
                                             </div>
                                             <div className="min-w-0">
                                                 <div className="text-sm font-medium text-white truncate capitalize">{det.label.split(',')[0]}</div>
                                                 <div className="text-[10px] text-slate-500 font-mono">
                                                     {new Date(det.timestamp).toLocaleTimeString()}
                                                 </div>
                                             </div>
                                         </div>
                                         <div className="text-right flex-shrink-0 pl-2">
                                             <div className="text-xs font-bold text-orange-300">{det.score}%</div>
                                             <div className="text-[10px] text-slate-500">Conf</div>
                                         </div>
                                     </div>
                                 ))
                             )}
                         </div>
                     </div>

                 </div>
            </main>
        </div>
    );
};

export default ImageClassification;