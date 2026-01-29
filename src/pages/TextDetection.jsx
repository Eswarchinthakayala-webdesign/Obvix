import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, 
  Activity, 
  Maximize2, 
  Layers,
  Type,
  LayoutDashboard
} from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const TextDetection = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [worker, setWorker] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [textCount, setTextCount] = useState(0);
    const [fps, setFps] = useState(0);
    const requestRef = useRef();
    const isProcessingRef = useRef(false);
    
    // Session Recording Refs
    const sessionRef = useRef({
        id: null,
        startTime: null,
        detections: [],
        detectionCount: 0
    });
    const lastLogTime = useRef(0);

    useEffect(() => {
        const initTesseract = async () => {
             try {
                 const workerInstance = await createWorker('eng', 1, {
                     logger: m => console.log(m)
                 });
                 setWorker(workerInstance);
                 setIsLoading(false);
                 toast.success("OCR Engine Loaded");
             } catch (err) {
                 console.error("Tesseract Error", err);
                 toast.error("Failed to load OCR engine");
                 setIsLoading(false);
             }
        };
        initTesseract();

        return () => {
            if (worker) {
                // worker.terminate(); // V5 createWorker returns a promise that resolves to worker, but here we set state.
                // It's safer to handle cleanup differently or just leave it for now.
                // If we terminate immediately on unmount, active jobs might crash.
            }
        };
    }, []);

    const startCamera = async () => {
        if (!worker) return;
        setIsLoading(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'environment', // Rear camera is better for text
                    width: { ideal: 1280 }, // Higher res for better OCR
                    height: { ideal: 720 }
                }, 
                audio: false
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current.play();
                    setIsStreaming(true);
                    setIsLoading(false);
                    
                    // Initialize Session
                    sessionRef.current = {
                        id: Math.random().toString(36).substr(2, 9),
                        startTime: new Date().toISOString(),
                        detections: [],
                        detectionCount: 0,
                        type: 'text_detection'
                    };
                    
                    detectText();
                };
            }
        } catch (err) {
            console.error("Camera Error: ", err);
            toast.error("Unable to access camera or generic error");
            setIsLoading(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsStreaming(false);
            setTextCount(0);
            setFps(0);
            
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
            
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
            
            cancelAnimationFrame(requestRef.current);
        }
    };

    const toggleFullscreen = () => {
         if (!document.fullscreenElement) {
             videoRef.current?.parentElement?.requestFullscreen().catch(err => {
                 toast.error(`Error attempting to enable full-screen mode: ${err.message}`);
             });
         } else {
             document.exitFullscreen();
         }
    };

    const detectText = async () => {
        if (!worker || !videoRef.current || !canvasRef.current || !isStreaming) return;

        // If already processing a frame, skip (throttle)
        if (isProcessingRef.current) {
            requestRef.current = requestAnimationFrame(detectText);
            return;
        }

        isProcessingRef.current = true;
        const startTime = performance.now();

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            if (video.videoWidth > 0 && video.videoHeight > 0) {
                if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                }

                // Recognize text
                // console.log("Starting recognition...");
                const { data } = await worker.recognize(video);
                // console.log("Recognition done", data.words.length);
                
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Draw boxes
                data.words.forEach(word => {
                   if (word.confidence > 50) {
                       const { x0, y0, x1, y1 } = word.bbox;
                       
                       // Draw Box
                       ctx.strokeStyle = '#eab308'; // Yellow-500
                       ctx.lineWidth = 2;
                       ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
                       
                       // Draw Background for text (Optional, can be distracting)
                       // ctx.fillStyle = 'rgba(234, 179, 8, 0.2)';
                       // ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
                       
                       // Draw Label Background
                       ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                       const textWidth = ctx.measureText(word.text).width;
                       ctx.fillRect(x0, y0 - 20, textWidth + 10, 20);
                       
                       // Draw Text
                       ctx.fillStyle = '#fce7f3'; // Light yellow/white
                       ctx.font = 'bold 12px "Inter", sans-serif';
                       ctx.fillText(word.text, x0 + 5, y0 - 5);
                   }
                });
                
                const validWords = data.words.filter(w => w.confidence > 50);
                setTextCount(validWords.length);

                // ... logging logic ...
                if (validWords.length > 0) {
                     const now = performance.now();
                     if (now - lastLogTime.current > 2000) {
                         const topWords = validWords
                            .sort((a,b) => b.confidence - a.confidence)
                            .slice(0, 5)
                            .map(w => w.text)
                            .join(' ');
                            
                         if (topWords.length > 2) {
                             sessionRef.current.detections.push({
                                 id: Math.random().toString(36).substr(2, 5),
                                 label: topWords,
                                 score: Math.round(validWords[0].confidence),
                                 timestamp: new Date().toISOString()
                             });
                             sessionRef.current.detectionCount += validWords.length;
                             lastLogTime.current = now;
                         }
                     }
                }

                const endTime = performance.now();
                const frameTime = endTime - startTime;
                if(frameTime > 0) {
                    setFps((1000 / frameTime).toFixed(1));
                }
            }
        } catch (error) {
            console.error("OCR Error", error);
        } finally {
            isProcessingRef.current = false;
            requestRef.current = requestAnimationFrame(detectText);
        }
    };

    // ... rest of code ...

    return (
        <div className="min-h-screen bg-black text-foreground selection:bg-yellow-500/30 pb-20">
            {/* Header */}
            <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                     <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-white/10 text-white rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex flex-col">
                             <span className="font-bold text-white tracking-tight">Obvix OCR</span>
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
                                 className="absolute inset-0 w-full h-full object-contain" 
                                 playsInline 
                                 muted
                              />
                              <canvas 
                                 ref={canvasRef}
                                 className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                              />

                              {!isStreaming && (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm z-10 p-6 text-center">
                                       <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-yellow-500/30">
                                           <Type className="w-8 h-8 text-yellow-500" />
                                       </div>
                                       <h2 className="text-2xl font-bold text-white mb-2">Start Text Detection</h2>
                                       <p className="text-slate-400 max-w-md mb-8">
                                           Real-time optical character recognition (OCR) running locally in your browser using Tesseract.js.
                                       </p>
                                       <Button 
                                          size="lg" 
                                          className="rounded-full bg-yellow-600 hover:bg-yellow-700 text-black px-8 font-medium shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all hover:scale-105"
                                          onClick={startCamera}
                                          disabled={isLoading || !worker}
                                       >
                                          {isLoading ? 'Loading Engine...' : (worker ? 'Start Scanner' : 'Waiting for Engine...')}
                                       </Button>
                                  </div>
                              )}

                              {isStreaming && (
                                  <div className="absolute inset-0 z-20 pointer-events-none p-4 sm:p-6 flex flex-col justify-between">
                                       <div className="flex justify-between items-start">
                                            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                 <Activity className="w-3 h-3 text-yellow-400" />
                                                 <span className="text-xs font-mono text-yellow-400 font-bold">{fps} OPS</span>
                                            </div>
                                            <div className="bg-yellow-500/20 backdrop-blur-md border border-yellow-500/30 px-3 py-1.5 rounded-full animate-pulse flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                                <span className="text-xs font-bold text-yellow-200 uppercase tracking-wider">Scanning</span>
                                            </div>
                                       </div>

                                       <div className="flex justify-between items-end pointer-events-auto">
                                            <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4">
                                                 <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Words Found</span>
                                                    <div className="flex items-baseline gap-1">
                                                        <Type className="w-4 h-4 text-yellow-400" />
                                                        <span className="text-2xl font-bold text-white font-mono leading-none">{textCount}</span>
                                                    </div>
                                                 </div>
                                            </div>

                                            <div className="flex gap-2">
                                                 <Button 
                                                    variant="secondary" 
                                                    size="icon" 
                                                    className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10"
                                                    onClick={toggleFullscreen}
                                                  >
                                                    <Maximize2 className="w-4 h-4" />
                                                 </Button>
                                                 <Button 
                                                    variant="destructive" 
                                                    className="rounded-full px-6 font-medium shadow-lg hover:bg-red-600"
                                                    onClick={stopCamera}
                                                 >
                                                    End Scan
                                                 </Button>
                                            </div>
                                       </div>
                                  </div>
                              )}
                         </div>
                     </div>

                     {/* Right Column: Live Session Log */}
                     <div className="lg:col-span-1 bg-zinc-900/30 border border-white/10 rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl">
                         <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
                             <h3 className="font-bold text-white flex items-center gap-2">
                                <Layers className="w-4 h-4 text-yellow-400" /> Live Text Log
                             </h3>
                             <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 text-[10px]">
                                {sessionRef.current.detectionCount} Words
                             </Badge>
                         </div>
                         <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                             {sessionRef.current.detections.length === 0 ? (
                                 <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm opacity-50">
                                     <Type className="w-12 h-12 mb-2" />
                                     <p>Point camera at text...</p>
                                 </div>
                             ) : (
                                 [...sessionRef.current.detections].reverse().map((det, i) => (
                                     <div key={i} className="bg-white/5 border border-white/5 rounded-lg p-3 flex items-center justify-between">
                                         <div className="flex items-center gap-3 overflow-hidden">
                                             <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex flex-shrink-0 items-center justify-center text-yellow-400">
                                                 <Type size={16} />
                                             </div>
                                             <div className="min-w-0">
                                                 <div className="text-sm font-medium text-white truncate">{det.label}</div>
                                                 <div className="text-[10px] text-slate-500 font-mono">
                                                     {new Date(det.timestamp).toLocaleTimeString()}
                                                 </div>
                                             </div>
                                         </div>
                                         <div className="text-right flex-shrink-0 pl-2">
                                             <div className="text-xs font-bold text-yellow-300">{det.score}%</div>
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

export default TextDetection;