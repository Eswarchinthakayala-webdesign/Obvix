import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  Activity, 
  LayoutDashboard,
  CheckCircle2,
  ScanFace,
  Users,
  Maximize2,
  X,
  Zap
} from 'lucide-react';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';
import * as tf from '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const FaceLandmark = () => {
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [model, setModel] = useState(null);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [faces, setFaces] = useState([]);
    
    const imageRef = useRef(null);
    const canvasRef = useRef(null);
    const fileInputRef = useRef(null);
    
    // Session logic
    const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
    const [sessionStartTime] = useState(() => new Date().toISOString());

    useEffect(() => {
        loadModel();
    }, []);

    const loadModel = async () => {
        try {
            console.log("Loading FaceLandmarks model...");
            await tf.setBackend('webgl');
            await tf.ready();
            
            const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
            const detectorConfig = {
                runtime: 'tfjs', 
                refineLandmarks: true, 
                maxFaces: 5 
            };
            const detector = await faceLandmarksDetection.createDetector(model, detectorConfig);
            
            setModel(detector);
            setIsModelLoading(false);
            toast.success("Face Landmark Model Loaded");
        } catch (err) {
            console.error("Failed to load model", err);
            toast.error("Failed to load AI model");
            setIsModelLoading(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target.result);
                setFaces([]);
                if (canvasRef.current) {
                    const ctx = canvasRef.current.getContext('2d');
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const runAnalysis = async () => {
        if (!model || !imageRef.current) return;
        
        setIsProcessing(true);
        try {
            const imgElement = imageRef.current;
            const canvas = canvasRef.current;

            // Resize canvas to match image
            canvas.width = imgElement.width;
            canvas.height = imgElement.height;
            
            // Detect faces
            const estimatedFaces = await model.estimateFaces(imgElement);
            setFaces(estimatedFaces);
            
            // Draw Results
            const ctx = canvas.getContext('2d');
            // We want to overlay on the original image, so we draw the image first
            ctx.drawImage(imgElement, 0, 0, canvas.width, canvas.height);
            
            if (estimatedFaces.length > 0) {
                estimatedFaces.forEach(face => {
                    // Draw Keypoints
                    if (face.keypoints) {
                        ctx.fillStyle = '#f472b6'; // pink-400
                        face.keypoints.forEach((keypoint) => {
                             ctx.beginPath();
                             ctx.arc(keypoint.x, keypoint.y, 1, 0, 2 * Math.PI);
                             ctx.fill();
                        });
                    }
                    
                    // Draw Bounding Box
                    if (face.box) {
                         const { xMin, yMin, width, height } = face.box;
                         ctx.strokeStyle = '#f472b6';
                         ctx.lineWidth = 2;
                         ctx.strokeRect(xMin, yMin, width, height);
                    }
                });

                // Capture the masked image
                const maskedImageUrl = canvas.toDataURL('image/png');

                saveSession(estimatedFaces, image, maskedImageUrl);
                toast.success(`Detected ${estimatedFaces.length} faces`);
            } else {
                toast.warning("No faces detected in this image");
            }

        } catch (error) {
            console.error("Analysis error:", error);
            toast.error("Failed to analyze image");
        } finally {
            setIsProcessing(false);
        }
    };

    const saveSession = (results, originalDataUrl, maskedDataUrl) => {
         try {
            const storedSessions = JSON.parse(localStorage.getItem('obvix_sessions') || '[]');
            const existingSessionIndex = storedSessions.findIndex(s => s.id === sessionId);
            
            // Get score if available, otherwise default to 100 (high confidence if detected)
            // MediaPipe FaceMesh V2 often returns 'faceInViewConfidence' or 'score' in some versions, but not all.
            // We'll safe check.
            const confidence = results[0].score ? Math.round(results[0].score * 100) : 100;

            const newDetection = {
                id: Math.random().toString(36).substr(2, 5),
                timestamp: new Date().toISOString(),
                label: 'Face Mesh Analysis',
                faceCount: results.length,
                score: confidence,
                originalImage: originalDataUrl,
                maskedImage: maskedDataUrl
            };

            const currentSession = existingSessionIndex >= 0 ? storedSessions[existingSessionIndex] : {
                id: sessionId,
                type: 'face_landmark',
                startTime: sessionStartTime,
                detections: [],
                detectionCount: 0
            };

            const updatedSession = {
                ...currentSession,
                endTime: new Date().toISOString(),
                detections: [newDetection, ...currentSession.detections],
                detectionCount: currentSession.detectionCount + 1
            };

            if (existingSessionIndex >= 0) {
                storedSessions[existingSessionIndex] = updatedSession;
            } else {
                storedSessions.push(updatedSession);
            }

            localStorage.setItem('obvix_sessions', JSON.stringify(storedSessions));
            toast.success("Analysis saved to session history");

        } catch (error) {
            console.error("Session save error", error);
        }
    };

    return (
        <div className="min-h-screen bg-black text-foreground selection:bg-pink-500/30 pb-20">
            {/* Header */}
            <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                     <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="hover:bg-white/10 text-white rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex flex-col">
                             <span className="font-bold text-white tracking-tight">Face Landmarks</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-2">
                        <Button 
                            variant="ghost" 
                            className="text-sm font-medium cursor-pointer text-slate-300 hover:text-white hover:bg-white/5"
                            onClick={() => navigate('/face-landmark-dashboard')}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            <span className='text-white hidden sm:block ml-2'>Dashboard</span>
                        </Button>
                     </div>
                </div>
            </nav>

            <main className="container mx-auto px-4 pt-24 pb-12">
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
                     
                     {/* Left Column: Image Area */}
                     <div className="lg:col-span-2 h-full flex flex-col gap-4">
                         <div className="relative flex-1 bg-zinc-900/50 rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex items-center justify-center p-4">
                               {image ? (
                                   <div className="relative w-full h-full flex items-center justify-center group bg-black/50 rounded-lg">
                                       <div className="relative inline-block max-w-full max-h-full">
                                            <img 
                                                ref={imageRef}
                                                src={image} 
                                                alt="Upload" 
                                                className="max-w-full max-h-full object-contain rounded-lg shadow-lg" 
                                                onLoad={() => {
                                                    // Resize canvas when image loads
                                                    if (canvasRef.current && imageRef.current) {
                                                        canvasRef.current.width = imageRef.current.width;
                                                        canvasRef.current.height = imageRef.current.height;
                                                    }
                                                }}
                                            />
                                            <canvas 
                                                ref={canvasRef}
                                                className="absolute inset-0 w-full h-full pointer-events-none"
                                            />
                                       </div>
                                       
                                       <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                           <Button 
                                              size="icon" 
                                              variant="destructive" 
                                              className="rounded-full shadow-lg"
                                              onClick={() => {
                                                  setImage(null);
                                                  setFaces([]);
                                                  if(fileInputRef.current) fileInputRef.current.value = '';
                                              }}
                                            >
                                               <X className="w-4 h-4" />
                                            </Button>
                                       </div>
                                   </div>
                               ) : (
                                   <div className="text-center p-12">
                                       <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                           <Upload className="w-10 h-10 text-slate-400" />
                                       </div>
                                       <h3 className="text-xl font-medium text-white mb-2">Upload Image</h3>
                                       <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                                           Upload a photo to detect 468+ facial landmarks and analyze geometry.
                                       </p>
                                       <Button 
                                           onClick={() => fileInputRef.current?.click()}
                                           disabled={isModelLoading}
                                           className="bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-full px-8 shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all hover:scale-105"
                                       >
                                           {isModelLoading ? 'Loading Model...' : 'Select Photo'}
                                       </Button>
                                   </div>
                               )}
                               <input 
                                   type="file" 
                                   ref={fileInputRef} 
                                   onChange={handleFileUpload} 
                                   accept="image/*" 
                                   className="hidden" 
                               />
                         </div>

                         {/* Controls */}
                         <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                  <div className="flex flex-col">
                                      <span className="text-xs text-slate-400 uppercase tracking-wider font-bold">Status</span>
                                      <div className="flex items-center gap-2">
                                          {isProcessing && <Activity className="w-4 h-4 text-pink-400 animate-spin" />}
                                          {!isProcessing && faces.length > 0 && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                                          {!isProcessing && faces.length === 0 && <div className="w-2 h-2 rounded-full bg-slate-500" />}
                                          
                                          <span className="text-sm font-mono text-white">
                                              {isModelLoading ? 'Loading Model...' : isProcessing ? 'Analyzing Mesh...' : faces.length > 0 ? 'Analysis Complete' : 'Ready'}
                                          </span>
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="flex gap-2">
                                  <Button 
                                    onClick={runAnalysis} 
                                    disabled={!image || isProcessing || isModelLoading}
                                    className="bg-pink-500 hover:bg-pink-600 text-white font-bold"
                                  >
                                    <Zap className="w-4 h-4 mr-2" />
                                    Analyze Face
                                  </Button>
                              </div>
                         </div>
                     </div>

                     {/* Right Column: Results Log */}
                     <div className="lg:col-span-1 bg-zinc-900/30 border border-white/10 rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl">
                         <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
                             <h3 className="font-bold text-white flex items-center gap-2">
                                <ScanFace className="w-4 h-4 text-pink-400" /> Mesh Data
                             </h3>
                             <Badge variant="secondary" className="bg-pink-500/10 text-pink-400 text-[10px]">
                                {faces.length} Detected
                             </Badge>
                         </div>
                         
                         <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                             {faces.length === 0 ? (
                                 <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm opacity-50">
                                     <ScanFace className="w-12 h-12 mb-2" />
                                     <p>Upload & Analyze to see mesh statistics</p>
                                 </div>
                             ) : (
                                 <div className="space-y-3">
                                     {faces.map((face, i) => (
                                         <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 active:scale-[0.98] transition-transform">
                                              <div className="flex justify-between items-start mb-2">
                                                  <span className="text-white font-bold text-lg">Face #{i + 1}</span>
                                                  <Badge className="bg-pink-500 text-white hover:bg-pink-600">
                                                      468 Points
                                                  </Badge>
                                              </div>
                                              
                                              <div className="grid grid-cols-2 gap-2 mt-4">
                                                  <div className="bg-black/30 p-2 rounded-lg">
                                                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Left Eye</span>
                                                      <span className="text-pink-300 font-mono text-xs">
                                                        {face.keypoints ? `(${Math.round(face.keypoints[33].x)}, ${Math.round(face.keypoints[33].y)})` : 'N/A'}
                                                      </span>
                                                  </div>
                                                  <div className="bg-black/30 p-2 rounded-lg">
                                                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Right Eye</span>
                                                      <span className="text-pink-300 font-mono text-xs">
                                                        {face.keypoints ? `(${Math.round(face.keypoints[263].x)}, ${Math.round(face.keypoints[263].y)})` : 'N/A'}
                                                      </span>
                                                  </div>
                                                  <div className="bg-black/30 p-2 rounded-lg">
                                                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Nose Tip</span>
                                                      <span className="text-pink-300 font-mono text-xs">
                                                        {face.keypoints ? `(${Math.round(face.keypoints[1].x)}, ${Math.round(face.keypoints[1].y)})` : 'N/A'}
                                                      </span>
                                                  </div>
                                                  <div className="bg-black/30 p-2 rounded-lg">
                                                      <span className="text-[10px] text-slate-500 uppercase font-bold block">Lips Center</span>
                                                      <span className="text-pink-300 font-mono text-xs">
                                                        {face.keypoints ? `(${Math.round(face.keypoints[13].x)}, ${Math.round(face.keypoints[13].y)})` : 'N/A'}
                                                      </span>
                                                  </div>
                                              </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                         </div>
                     </div>

                 </div>
            </main>
        </div>
    );
};

export default FaceLandmark;