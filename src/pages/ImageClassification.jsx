import React, { useEffect, useRef, useState } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  Activity, 
  ImageIcon,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  Zap,
  Tag,
  Maximize2,
  X
} from 'lucide-react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const ImageClassification = () => {
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [model, setModel] = useState(null);
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [predictions, setPredictions] = useState([]);
    const imageRef = useRef(null);
    const fileInputRef = useRef(null);

    // Session logic
    const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
    const [sessionStartTime] = useState(() => new Date().toISOString());

    useEffect(() => {
        loadModel();
    }, []);

    const loadModel = async () => {
        try {
            console.log("Loading MobileNet...");
            await tf.ready();
            const net = await mobilenet.load({ version: 2, alpha: 1.0 });
            setModel(net);
            setIsModelLoading(false);
            console.log("MobileNet loaded");
        } catch (err) {
            console.error("Failed to load model", err);
            toast.error("Failed to load Tensor flow model");
            setIsModelLoading(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target.result);
                setPredictions([]);
            };
            reader.readAsDataURL(file);
        }
    };

    const saveSession = (results, imageDataUrl) => {
        try {
            const storedSessions = JSON.parse(localStorage.getItem('obvix_sessions') || '[]');
            const existingSessionIndex = storedSessions.findIndex(s => s.id === sessionId);
            
            // For image classification, we might want one session per image or one big session?
            // User pattern suggests "Start Detection" -> "Session". 
            // Here we are in a page that acts like "TextDetection". 
            // Let's treat every classification as an event in a session, OR create a new session per image?
            // "TextDetection" updated the *same* session (cumulative). 
            // But if we want to show "Uploaded images" in the dashboard, storing one massive session with many images might be clunky.
            // Let's do: One "Session" = One Visit to this page. Each image classified is a "detection" record within that session.
            
            // However, storing multiple base64 images in one localStorage object is risky.
            // Let's try to store just this detection as a new item in the array if we want "History of classifications".
            // Actually, usually "Session" implies a period of time.
            // Let's stick to the TextDetection pattern: One active session ID for this page mount.
            
            const newDetection = {
                id: Math.random().toString(36).substr(2, 5),
                timestamp: new Date().toISOString(),
                label: results[0].className, // Top result as main label
                score: Math.round(results[0].probability * 100),
                allPredictions: results,
                // We'll store the image here. WARNING: Size limits.
                imageData: imageDataUrl 
            };

            const currentSession = existingSessionIndex >= 0 ? storedSessions[existingSessionIndex] : {
                id: sessionId,
                type: 'image_classification',
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
            toast.success("Result saved to session history");

        } catch (error) {
            console.error(error);
            if (error.name === 'QuotaExceededError') {
                toast.error("Storage full. Image not saved to history.");
                // Fallback: save without image data
                // ... logic to save without image ...
            }
        }
    };

    const runClassification = async () => {
        if (!model || !imageRef.current) return;
        
        setIsProcessing(true);
        try {
            // Classify the image.
            const results = await model.classify(imageRef.current);
            setPredictions(results);
            
            if (results && results.length > 0) {
                saveSession(results, image);
            }

        } catch (error) {
            console.error("Classification error:", error);
            toast.error("Failed to classify image");
        } finally {
            setIsProcessing(false);
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
                            onClick={() => navigate('/image-dashboard')}
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
                                   <div className="relative w-full h-full flex items-center justify-center group">
                                       <img 
                                            ref={imageRef}
                                            src={image} 
                                            alt="Upload" 
                                            className="max-w-full max-h-full object-contain rounded-lg shadow-lg" 
                                            crossOrigin="anonymous"
                                       />
                                       
                                       <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                           <Button 
                                              size="icon" 
                                              variant="destructive" 
                                              className="rounded-full shadow-lg"
                                              onClick={() => {
                                                  setImage(null);
                                                  setPredictions([]);
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
                                           Upload an image (JPG, PNG) to identify objects and scenes using MobileNet V2.
                                       </p>
                                       <Button 
                                           onClick={() => fileInputRef.current?.click()}
                                           disabled={isModelLoading}
                                           className="bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-full px-8"
                                       >
                                           {isModelLoading ? 'Loading Model...' : 'Select Image'}
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
                                          {isProcessing && <Activity className="w-4 h-4 text-orange-400 animate-spin" />}
                                          {!isProcessing && predictions.length > 0 && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                                          {!isProcessing && predictions.length === 0 && <div className="w-2 h-2 rounded-full bg-slate-500" />}
                                          
                                          <span className="text-sm font-mono text-white">
                                              {isModelLoading ? 'Loading Model...' : isProcessing ? 'Analyzing...' : predictions.length > 0 ? 'Analysis Complete' : 'Ready'}
                                          </span>
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="flex gap-2">
                                  <Button 
                                    onClick={runClassification} 
                                    disabled={!image || isProcessing || isModelLoading}
                                    className="bg-orange-500 hover:bg-orange-600 text-black font-bold"
                                  >
                                    <Zap className="w-4 h-4 mr-2" />
                                    Identify
                                  </Button>
                              </div>
                         </div>
                     </div>

                     {/* Right Column: Results Log */}
                     <div className="lg:col-span-1 bg-zinc-900/30 border border-white/10 rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl">
                         <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
                             <h3 className="font-bold text-white flex items-center gap-2">
                                <Tag className="w-4 h-4 text-orange-400" /> Predictions
                             </h3>
                             <Badge variant="secondary" className="bg-orange-500/10 text-orange-400 text-[10px]">
                                {predictions.length} Found
                             </Badge>
                         </div>
                         
                         <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                             {predictions.length === 0 ? (
                                 <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm opacity-50">
                                     <ImageIcon className="w-12 h-12 mb-2" />
                                     <p>Upload & Identify to see results</p>
                                 </div>
                             ) : (
                                 <div className="space-y-3">
                                     {predictions.map((p, i) => (
                                         <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5 active:scale-[0.98] transition-transform">
                                              <div className="flex justify-between items-start mb-2">
                                                  <span className="text-white font-bold capitalize text-lg">{p.className.split(',')[0]}</span>
                                                  <Badge className="bg-orange-500 text-black hover:bg-orange-600">
                                                      {(p.probability * 100).toFixed(1)}%
                                                  </Badge>
                                              </div>
                                              
                                              {/* Confidence Bar */}
                                              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                                                  <div 
                                                    className="h-full bg-gradient-to-r from-orange-500 to-yellow-500" 
                                                    style={{ width: `${p.probability * 100}%` }}
                                                  />
                                              </div>
                                              
                                              {p.className.includes(',') && (
                                                  <p className="text-xs text-slate-500 mt-2">
                                                      Also known as: {p.className.split(',').slice(1).join(', ')}
                                                  </p>
                                              )}
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

export default ImageClassification;