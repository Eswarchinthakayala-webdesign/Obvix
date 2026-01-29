import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, 
  Activity, 
  Maximize2, 
  Layers,
  PersonStanding,
  LayoutDashboard
} from 'lucide-react';
import * as poseDetection from '@tensorflow-models/pose-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const PoseDetectionPage = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [detector, setDetector] = useState(null);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [poseCount, setPoseCount] = useState(0);
    const [fps, setFps] = useState(0);
    const requestRef = useRef();
    const [cameraMode, setCameraMode] = useState('user');
    
    // Session Recording Refs
    const sessionRef = useRef({
        id: null,
        startTime: null,
        detections: [],
        detectionCount: 0
    });
    const lastLogTime = useRef(0);

    // Skeleton Connections for MoveNet
    const skeletonConnections = [
        ['nose', 'left_eye'], ['left_eye', 'left_ear'],
        ['nose', 'right_eye'], ['right_eye', 'right_ear'],
        ['left_shoulder', 'right_shoulder'],
        ['left_shoulder', 'left_elbow'], ['left_elbow', 'left_wrist'],
        ['right_shoulder', 'right_elbow'], ['right_elbow', 'right_wrist'],
        ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
        ['left_hip', 'right_hip'],
        ['left_hip', 'left_knee'], ['left_knee', 'left_ankle'],
        ['right_hip', 'right_knee'], ['right_knee', 'right_ankle']
    ];

    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.setBackend('webgl');
                await tf.ready();
                
                const model = poseDetection.SupportedModels.MoveNet;
                const detectorConfig = {
                    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
                };
                const detector = await poseDetection.createDetector(model, detectorConfig);
                
                setDetector(detector);
                setIsLoading(false);
                toast.success("Pose Detection Model Loaded");
            } catch (err) {
                console.error("Failed to load model", err);
                toast.error("Failed to load AI model");
                setIsLoading(false);
            }
        };
        loadModel();
    }, []);

    const startCamera = async () => {
        setIsLoading(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: cameraMode,
                    width: { ideal: 640 },
                    height: { ideal: 480 }
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
                        type: 'pose_detection'
                    };
                    lastLogTime.current = performance.now();
                    
                    detectPose();
                };
            }
        } catch (err) {
            console.error("Camera Error: ", err);
            toast.error("Unable to access camera");
            setIsLoading(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsStreaming(false);
            setPoseCount(0);
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
            
            // Clear canvas
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
            
            cancelAnimationFrame(requestRef.current);
        }
    };

    const detectPose = async () => {
        if (!detector || !videoRef.current || !canvasRef.current) return;

        const startTime = performance.now();

        try {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            
            if (video.videoWidth > 0 && video.videoHeight > 0) {
                if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                }

                // Default MoveNet expects 'flipHorizontal' handled manually if drawing
                // but the API options?
                const poses = await detector.estimatePoses(video);
                // MoveNet Lightning is single pose, Thunder/others might be multi
                setPoseCount(poses.length);

                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                
                // Drawing logic
                poses.forEach(pose => {
                    const keypoints = pose.keypoints;
                    
                    // Filter low confidence points
                    const goodPoints = keypoints.filter(k => (k.score || 0) > 0.3);
                    
                    if (goodPoints.length > 5) {
                         // Draw connections
                         ctx.strokeStyle = '#22c55e'; // Green
                         ctx.lineWidth = 3;
                         
                         // We need a map for quick access
                         const kpMap = {};
                         keypoints.forEach(k => kpMap[k.name] = k);

                         skeletonConnections.forEach(([p1, p2]) => {
                             const kp1 = kpMap[p1];
                             const kp2 = kpMap[p2];
                             
                             if (kp1 && kp2 && (kp1.score || 0) > 0.3 && (kp2.score || 0) > 0.3) {
                                 ctx.beginPath();
                                 ctx.moveTo(kp1.x, kp1.y);
                                 ctx.lineTo(kp2.x, kp2.y);
                                 ctx.stroke();
                             }
                         });

                         // Draw Keypoints
                         goodPoints.forEach(k => {
                             ctx.beginPath();
                             ctx.arc(k.x, k.y, 5, 0, 2 * Math.PI);
                             ctx.fillStyle = '#ffffff'; 
                             ctx.fill();
                             ctx.strokeStyle = '#22c55e';
                             ctx.stroke();
                         });
                         
                         // Draw Label
                         // Find bounding box logic roughly
                         const xs = goodPoints.map(k => k.x);
                         const ys = goodPoints.map(k => k.y);
                         const minX = Math.min(...xs);
                         const minY = Math.min(...ys);

                         ctx.fillStyle = '#22c55e';
                         const score = pose.score ? Math.round(pose.score * 100) : 100;
                         const label = `Pose: ${score}%`;
                         const textWidth = ctx.measureText(label).width;
                         ctx.fillRect(minX, minY - 30, textWidth + 20, 25);

                         ctx.fillStyle = '#000000';
                         ctx.font = 'bold 14px "Inter", sans-serif';
                         ctx.fillText(label, minX + 5, minY - 13);
                    }
                });

                // Log Data
                const now = performance.now();
                if (now - lastLogTime.current > 1000 && poses.length > 0) {
                    const timestamp = new Date().toISOString();
                    poses.forEach(pose => {
                        const score = pose.score ? Math.round(pose.score * 100) : 100;
                        sessionRef.current.detections.push({
                           id: Math.random().toString(36).substr(2, 5),
                           label: 'Human Pose',
                           score: score,
                           timestamp
                        });
                        sessionRef.current.detectionCount++;
                    });
                    lastLogTime.current = now;
                }

                // FPS
                const endTime = performance.now();
                const frameTime = endTime - startTime;
                if(frameTime > 0) {
                   setFps(Math.round(1000 / frameTime));
                }
            }
            
            requestRef.current = requestAnimationFrame(detectPose);

        } catch (error) {
            console.error("Detection Error", error);
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
            videoRef.current?.parentElement?.requestFullscreen().catch(err => {
                toast.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    return (
        <div className="min-h-screen bg-black text-foreground selection:bg-green-500/30 pb-20">
            {/* Header */}
            <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                     <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-white/10 text-white rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex flex-col">
                             <span className="font-bold text-white tracking-tight">Obvix Pose</span>
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
                         <div className="relative flex-1 bg-zinc-900/50 rounded-2xl overflow-hidden border border-white/10 shadow-2xl group">
                              <video 
                                 ref={videoRef}
                                 className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
                                 playsInline
                                 muted
                              />
                              <canvas 
                                 ref={canvasRef}
                                 className="absolute inset-0 w-full h-full pointer-events-none scale-x-[-1]"
                              />

                              {!isStreaming && (
                                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/80 backdrop-blur-sm z-10 p-6 text-center">
                                       <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-green-500/30">
                                           <PersonStanding className="w-8 h-8 text-green-400" />
                                       </div>
                                       <h2 className="text-2xl font-bold text-white mb-2">Start Pose Detection</h2>
                                       <p className="text-slate-400 max-w-md mb-8">
                                           Real-time body segmentation and skeletal tracking using MoveNet Lightning technology.
                                       </p>
                                       <Button 
                                          size="lg" 
                                          className="rounded-full bg-green-600 hover:bg-green-700 text-white px-8 font-medium shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all hover:scale-105"
                                          onClick={startCamera}
                                          disabled={isLoading || !detector}
                                       >
                                          {isLoading ? 'Loading Model...' : (detector ? 'Initialize Camera' : 'Waiting for Model...')}
                                       </Button>
                                  </div>
                              )}

                              {isStreaming && (
                                  <div className="absolute inset-0 z-20 pointer-events-none p-4 sm:p-6 flex flex-col justify-between">
                                       <div className="flex justify-between items-start">
                                            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-lg flex items-center gap-2">
                                                 <Activity className="w-3 h-3 text-emerald-400" />
                                                 <span className="text-xs font-mono text-emerald-400 font-bold">{fps} FPS</span>
                                            </div>
                                            <div className="bg-red-500/20 backdrop-blur-md border border-red-500/30 px-3 py-1.5 rounded-full animate-pulse flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                                <span className="text-xs font-bold text-red-200 uppercase tracking-wider">Live</span>
                                            </div>
                                       </div>

                                       <div className="flex justify-between items-end pointer-events-auto">
                                            <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl flex items-center gap-4">
                                                 <div className="flex flex-col">
                                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Poses Detected</span>
                                                    <div className="flex items-baseline gap-1">
                                                        <PersonStanding className="w-4 h-4 text-green-400" />
                                                        <span className="text-2xl font-bold text-white font-mono leading-none">{poseCount}</span>
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
                                                    End Session
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
                                <Layers className="w-4 h-4 text-green-400" /> Live Session Log
                             </h3>
                             <Badge variant="secondary" className="bg-green-500/10 text-green-400 text-[10px]">
                                {sessionRef.current.detectionCount} Events
                             </Badge>
                         </div>
                         <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                             {sessionRef.current.detections.length === 0 ? (
                                 <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm opacity-50">
                                     <PersonStanding className="w-12 h-12 mb-2" />
                                     <p>Waiting for movement...</p>
                                 </div>
                             ) : (
                                 [...sessionRef.current.detections].reverse().map((det, i) => (
                                     <div key={i} className="bg-white/5 border border-white/5 rounded-lg p-3 flex items-center justify-between">
                                         <div className="flex items-center gap-3">
                                             <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                                 <PersonStanding size={16} />
                                             </div>
                                             <div>
                                                 <div className="text-sm font-medium text-white">{det.label}</div>
                                                 <div className="text-[10px] text-slate-500 font-mono">
                                                     {new Date(det.timestamp).toLocaleTimeString()}
                                                 </div>
                                             </div>
                                         </div>
                                         <div className="text-right">
                                             <div className="text-xs font-bold text-green-300">{det.score}%</div>
                                             <div className="text-[10px] text-slate-500">Confidence</div>
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

export default PoseDetectionPage;