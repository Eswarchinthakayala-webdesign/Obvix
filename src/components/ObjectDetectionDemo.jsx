import React, { useRef, useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Loader2, AlertCircle, StopCircle, Scan, Aperture } from 'lucide-react';
import { Button } from "@/components/ui/button";

const ObjectDetectionDemo = ({ onPredictionUpdate, minimal = false }) => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [model, setModel] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cameraActive, setCameraActive] = useState(false);
    const [predictions, setPredictions] = useState([]);
    const requestRef = useRef(null);

    // Load Model
    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.ready();
                const loadedModel = await cocoSsd.load();
                setModel(loadedModel);
                setLoading(false);
            } catch (err) {
                console.error("Failed to load model", err);
                setLoading(false);
            }
        };
        loadModel();
    }, []);

    const startCamera = async () => {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                    audio: false,
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.onloadedmetadata = () => {
                        videoRef.current.play();
                        setCameraActive(true);
                        detectFrame();
                    };
                }
            } catch (error) {
                console.error("Error accessing camera:", error);
                alert("Camera access denied or not available.");
            }
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setCameraActive(false);
            setPredictions([]);
            if (requestRef.current) {
                cancelAnimationFrame(requestRef.current);
            }
            // Clear canvas
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
        }
    };

    const detectFrame = async () => {
        if (videoRef.current && canvasRef.current && model && !videoRef.current.paused && !videoRef.current.ended) {
            const video = videoRef.current;
            const canvas = canvasRef.current;

            if (video.readyState === 4) {
                 // Match canvas size to video display size
                 const displayWidth = video.clientWidth;
                 const displayHeight = video.clientHeight;
                 
                 if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
                     canvas.width = displayWidth;
                     canvas.height = displayHeight;
                 }

                // Detect objects
                const predictions = await model.detect(video);
                setPredictions(predictions);
                if (onPredictionUpdate) {
                    onPredictionUpdate(predictions);
                }
                renderPredictions(predictions, canvas);

                requestRef.current = requestAnimationFrame(detectFrame);
            } else {
                requestRef.current = requestAnimationFrame(detectFrame);
            }
        }
    };

    const renderPredictions = (predictions, canvas) => {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Scaling factors if video resolution differs from display resolution
        // HTMLVideoElement.width vs videoWidth. 
        // tensorflow model usually expects the video element itself.
        // We need to ensure drawing coordinates match the scaled canvas.
        // Actually, model.detect(video) returns coords based on video resolution.
        // If we draw on a canvas matched to display size, we might need to scale.
        // Simple approach: Use video resolution for canvas, let CSS scale it down.
        // Re-adjusting logic:
        
        // Let's force canvas resolution to match video resolution for accurate drawing
        if (videoRef.current) {
             if (canvas.width !== videoRef.current.videoWidth || canvas.height !== videoRef.current.videoHeight) {
                 canvas.width = videoRef.current.videoWidth;
                 canvas.height = videoRef.current.videoHeight;
             }
        }

        const font = "16px Inter";
        ctx.font = font;
        ctx.textBaseline = "top";

        predictions.forEach(prediction => {
            const [x, y, width, height] = prediction.bbox;
            const label = prediction.class.toUpperCase();
            const score = Math.round(prediction.score * 100);

            // Futuristic Bounding Box
            const cornerLength = width * 0.1; // proportional corners
            const color = "#a855f7"; // Primary Purple
            const lineWidth = 4;

            ctx.strokeStyle = color;
            ctx.lineWidth = lineWidth;
            ctx.setLineDash([]);

            // Draw Corners
            ctx.beginPath();
            // Top Left
            ctx.moveTo(x, y + cornerLength);
            ctx.lineTo(x, y);
            ctx.lineTo(x + cornerLength, y);
            
            // Top Right
            ctx.moveTo(x + width - cornerLength, y);
            ctx.lineTo(x + width, y);
            ctx.lineTo(x + width, y + cornerLength);

            // Bottom Right
            ctx.moveTo(x + width, y + height - cornerLength);
            ctx.lineTo(x + width, y + height);
            ctx.lineTo(x + width - cornerLength, y + height);

            // Bottom Left
            ctx.moveTo(x + cornerLength, y + height);
            ctx.lineTo(x, y + height);
            ctx.lineTo(x, y + height - cornerLength);
            ctx.stroke();

            // Minimal Fill
            ctx.fillStyle = "rgba(168, 85, 247, 0.05)";
            ctx.fillRect(x, y, width, height);
            
            // Scanning line effect inside box
            // We can't easily animate canvas loop here without complexity, so static fill or simple overlay

            // Label Tab
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + ctx.measureText(label + " " + score + "%").width + 20, y);
            ctx.lineTo(x + ctx.measureText(label + " " + score + "%").width + 10, y + 24);
            ctx.lineTo(x, y + 24);
            ctx.fill();

            // Label Text
            ctx.fillStyle = "#ffffff";
            ctx.fillText(`${label} ${score}%`, x + 8, y + 4);
        });
    };

    return (
        <section className={`${minimal ? 'h-full w-full' : 'py-24'} relative z-10`} id="demo">
            <div className={`${minimal ? 'h-full w-full' : 'container mx-auto px-4 sm:px-6 max-w-6xl'}`}>
                <motion.div 
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`${minimal ? 'h-full rounded-none border-0' : 'rounded-3xl border border-white/10 shadow-2xl p-1 sm:p-2'} overflow-hidden bg-white/5 backdrop-blur-xl relative flex flex-col items-center justify-center`}
                >
                    
                    {/* Futuristic Header Bar */}
                    <div className="w-full p-3 sm:p-4 flex justify-between items-center bg-black/40 border-b border-white/5 mb-1 rounded-t-2xl">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${cameraActive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`} />
                            <div className="flex flex-col">
                                <span className="text-xs sm:text-sm font-bold tracking-widest text-white uppercase">Neural Vision</span>
                                <span className="text-[8px] sm:text-[10px] text-muted-foreground font-mono">TENSORFLOW.js | COCO-SSD</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             {cameraActive && (
                                <Button 
                                    variant="destructive" 
                                    size="sm" 
                                    onClick={stopCamera}
                                    className="h-7 sm:h-8 gap-1.5 cursor-pointer sm:gap-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/50 text-xs sm:text-sm px-2 sm:px-4"
                                >
                                    <StopCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                    STOP
                                </Button>
                             )}
                        </div>
                    </div>

                    {/* Main Viewport */}
                    <div className="relative w-full h-100 sm:h-120 bg-black/90 rounded-xl overflow-hidden shadow-inner border border-white/5 group">
                        
                        {!cameraActive && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 sm:p-6 z-30 bg-[radial-gradient(circle_at_center,rgba(40,40,40,0.8),rgba(0,0,0,0.9))]">
                                {loading ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 rounded-full blur-md bg-primary/40 animate-pulse" />
                                            <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 text-primary animate-spin relative z-10" />
                                        </div>
                                        <p className="text-xs sm:text-base text-muted-foreground font-mono animate-pulse">INITIALIZING...</p>
                                    </div>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }} 
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center gap-4 sm:gap-6 max-w-md w-full"
                                    >
                                        <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-primary/20 to-purple-500/20 border border-white/10 flex items-center justify-center mb-2 shadow-[0_0_30px_-5px_var(--color-primary)]">
                                            <Aperture className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 mb-2">Ready to Scan</h3>
                                            <p className="text-sm sm:text-base text-muted-foreground px-4">
                                                Activate camera for real-time inference.
                                            </p>
                                        </div>
                                        <Button 
                                            size="lg"
                                            onClick={startCamera}
                                            className="rounded-full cursor-pointer px-6 py-4 sm:px-8 sm:py-6 text-base sm:text-lg bg-primary hover:bg-primary/90 shadow-[0_0_20px_-5px_var(--color-primary)] transition-all hover:scale-105 w-full sm:w-auto"
                                        >
                                            <Scan className="mr-2 w-4 h-4 sm:w-5 sm:h-5" />
                                            Initialize Camera
                                        </Button>
                                    </motion.div>
                                )}
                            </div>
                        )}

                        {/* Video Layer */}
                        <video
                            ref={videoRef}
                            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${cameraActive ? 'opacity-100' : 'opacity-0'}`}
                            muted
                            playsInline
                        />
                        
                        {/* Canvas Layer */}
                        <canvas
                            ref={canvasRef}
                            className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
                        />
                        
                        {/* Overlay Elements */}
                        {cameraActive && (
                            <>
                                {/* Corner Brackets */}
                                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 w-4 h-4 sm:w-8 sm:h-8 border-t-2 border-l-2 border-primary/50 rounded-tl-lg" />
                                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 w-4 h-4 sm:w-8 sm:h-8 border-t-2 border-r-2 border-primary/50 rounded-tr-lg" />
                                <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 w-4 h-4 sm:w-8 sm:h-8 border-b-2 border-l-2 border-primary/50 rounded-bl-lg" />
                                <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 w-4 h-4 sm:w-8 sm:h-8 border-b-2 border-r-2 border-primary/50 rounded-br-lg" />
                                
                                {/* Scan Line Animation */}
                                <div className="absolute inset-0 bg-[linear-gradient(transparent_0%,rgba(168,85,247,0.1)_50%,transparent_100%)] bg-[length:100%_200%] animate-scan pointer-events-none mix-blend-screen" />
                            </>
                        )}
                    </div>

                    {/* Footer Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 w-full gap-px bg-white/10 mt-1 border border-white/5 rounded-b-xl overflow-hidden">
                        <div className="bg-black/40 p-2 sm:p-3 flex flex-col items-center justify-center">
                            <span className="text-[8px] sm:text-[10px] uppercase text-muted-foreground font-mono">FPS</span>
                            <span className="text-sm sm:text-lg font-bold text-primary">60</span>
                        </div>
                        <div className="bg-black/40 p-2 sm:p-3 flex flex-col items-center justify-center">
                             <span className="text-[8px] sm:text-[10px] uppercase text-muted-foreground font-mono">OBJECTS</span>
                             <span className="text-sm sm:text-lg font-bold text-white">{predictions.length}</span>
                        </div>
                         <div className="bg-black/40 p-2 sm:p-3 flex flex-col items-center justify-center">
                             <span className="text-[8px] sm:text-[10px] uppercase text-muted-foreground font-mono">LATENCY</span>
                             <span className="text-sm sm:text-lg font-bold text-green-400">~12ms</span>
                        </div>
                         <div className="bg-black/40 p-2 sm:p-3 flex flex-col items-center justify-center">
                             <span className="text-[8px] sm:text-[10px] uppercase text-muted-foreground font-mono">STATUS</span>
                             <div className="flex items-center gap-1.5">
                                <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-[10px] sm:text-xs font-bold text-white">ACTIVE</span>
                             </div>
                        </div>
                    </div>

                </motion.div>
            </div>
            
            <style jsx>{`
                @keyframes scan {
                    0% { background-position: 0% -100%; }
                    100% { background-position: 0% 200%; }
                }
                .animate-scan {
                    animation: scan 3s linear infinite;
                }
            `}</style>
        </section>
    );
};

export default ObjectDetectionDemo;
