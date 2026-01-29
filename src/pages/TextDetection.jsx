import React, { useRef, useState } from 'react';
import { 
  ArrowLeft, 
  Upload, 
  Layers,
  Type,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle,
  Activity
} from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const TextDetection = () => {
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [detectedText, setDetectedText] = useState([]);
    const [status, setStatus] = useState('IDLE'); // IDLE, PROCESSING, DONE, ERROR
    const fileInputRef = useRef(null);

    // Session Logic (simplified for non-streaming)
    // Session Logic
    const [sessionId] = useState(() => Math.random().toString(36).substr(2, 9));
    const [sessionStartTime] = useState(() => new Date().toISOString());

    const saveSession = (newDetection) => {
        const storedSessions = JSON.parse(localStorage.getItem('obvix_sessions') || '[]');
        const existingSessionIndex = storedSessions.findIndex(s => s.id === sessionId);
        
        const currentSession = existingSessionIndex >= 0 ? storedSessions[existingSessionIndex] : {
            id: sessionId,
            type: 'text_detection',
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
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target.result);
                setStatus('IDLE');
                setDetectedText([]);
                setProgress(0);
            };
            reader.readAsDataURL(file);
        }
    };

    const runOCR = async () => {
        if (!image) return;

        setIsProcessing(true);
        setStatus('PROCESSING');
        setProgress(0);
        
        try {
            console.log("Creating worker...");
            // Verbose initialization for stability
            const worker = await createWorker('eng', 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100));
                    }
                }
            });

            console.log("Worker created. Recognizing...");
            const ret = await worker.recognize(image);
            console.log("OCR Raw Result:", ret);

            const data = ret.data;

            if (!data) {
                 throw new Error("No data object returned from Tesseract");
            }
            if (!data.words) {
                 console.warn("Words array missing in data:", data);
                 // Fallback if words are missing but text exists
                 if (data.text) {
                     const words = data.text.split(/\s+/).map(text => ({
                         text,
                         confidence: 80, // Dummy confidence
                         bbox: { x0:0, y0:0, x1:0, y1:0 }
                     }));
                     data.words = words;
                 } else {
                     throw new Error("No text content found in image response");
                 }
            }

            // Filter and format results
            const confidentWords = data.words.filter(w => w.confidence > 60);
            const formattedDetections = confidentWords.map(w => ({
                text: w.text,
                confidence: Math.round(w.confidence),
                bbox: w.bbox
            }));

            setDetectedText(formattedDetections);
            setStatus('DONE');
            
            // Log for session
            // Log for session
            if (formattedDetections.length > 0) {
                 const newLog = {
                     id: Math.random().toString(36).substr(2, 5),
                     text: data.text,
                     wordCount: formattedDetections.length,
                     avgConfidence: formattedDetections.reduce((acc, curr) => acc + curr.confidence, 0) / formattedDetections.length,
                     timestamp: new Date().toISOString(),
                     // Compatibility with universal dashboard
                     score: formattedDetections.reduce((acc, curr) => acc + curr.confidence, 0) / formattedDetections.length,
                     label: 'Text Extraction',
                     // Store full word details too for deep dive
                     words: formattedDetections
                 };
                 
                 saveSession(newLog);
                 
                 toast.success(`Found ${formattedDetections.length} words!`);
            } else {
                 toast.warning("No clear text found in image.");
            }

            await worker.terminate();

        } catch (err) {
            console.error(err);
            setStatus('ERROR');
            toast.error("Failed to extract text.");
        } finally {
            setIsProcessing(false);
        }
    };

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
                            onClick={() => navigate('/text-dashboard')}
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
                                  <div className="relative w-full h-full flex items-center justify-center">
                                      <img src={image} alt="Upload" className="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
                                      
                                      {/* Bounding Boxes Overlay */}
                                      {status === 'DONE' && (
                                          <div className="absolute inset-0 pointer-events-none">
                                              {/* Note: Accurate overlay on resized image is complex in React without measured refs.
                                                  For this simplified specific request, we just show the image. 
                                                  Advanced impl would map bbox to image natural size vs displayed size. */
                                              }
                                          </div>
                                      )}
                                  </div>
                              ) : (
                                  <div className="text-center p-12">
                                      <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                          <Upload className="w-10 h-10 text-slate-400" />
                                      </div>
                                      <h3 className="text-xl font-medium text-white mb-2">Upload an Image</h3>
                                      <p className="text-slate-400 mb-8 max-w-sm mx-auto">
                                          Upload an image (JPG, PNG) containing text to extract content using OCR.
                                      </p>
                                      <Button 
                                          onClick={() => fileInputRef.current?.click()}
                                          className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-full px-8"
                                      >
                                          Select Image
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
                                          {status === 'PROCESSING' && <Activity className="w-4 h-4 text-blue-400 animate-spin" />}
                                          {status === 'DONE' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                                          {status === 'ERROR' && <AlertCircle className="w-4 h-4 text-red-400" />}
                                          {status === 'IDLE' && <div className="w-2 h-2 rounded-full bg-slate-500" />}
                                          <span className="text-sm font-mono text-white">
                                              {status === 'PROCESSING' ? `Processing... ${progress}%` : status}
                                          </span>
                                      </div>
                                  </div>
                              </div>
                              
                              <div className="flex gap-2">
                                  {image && (
                                      <Button variant="outline" onClick={() => setImage(null)} disabled={isProcessing} className="border-white/10 hover:bg-white/10 text-white">
                                          Clear
                                      </Button>
                                  )}
                                  <Button 
                                    onClick={runOCR} 
                                    disabled={!image || isProcessing}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                                  >
                                    Extract Text
                                  </Button>
                              </div>
                         </div>
                     </div>

                     {/* Right Column: Results Log */}
                     <div className="lg:col-span-1 bg-zinc-900/30 border border-white/10 rounded-2xl flex flex-col overflow-hidden backdrop-blur-xl">
                         <div className="p-4 border-b border-white/5 bg-black/20 flex items-center justify-between">
                             <h3 className="font-bold text-white flex items-center gap-2">
                                <Layers className="w-4 h-4 text-yellow-400" /> Extraction Results
                             </h3>
                             <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 text-[10px]">
                                {detectedText.length} Items
                             </Badge>
                         </div>
                         
                         <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                             {detectedText.length === 0 ? (
                                 <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm opacity-50">
                                     <Type className="w-12 h-12 mb-2" />
                                     <p>No text detected yet...</p>
                                 </div>
                             ) : (
                                 <div className="space-y-4">
                                     <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                                         <p className="text-slate-400 text-xs mb-2 uppercase font-bold">Full Text</p>
                                         <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                                             {detectedText.map(d => d.text).join(' ')}
                                         </p>
                                     </div>

                                     <div className="space-y-2">
                                         <p className="text-slate-400 text-xs uppercase font-bold">Word Confidence</p>
                                         {detectedText.slice(0, 50).map((d, i) => (
                                              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-white/5 last:border-0">
                                                  <span className="text-slate-300 truncate max-w-[70%]">{d.text}</span>
                                                  <Badge variant="outline" className={`
                                                      ${d.confidence > 80 ? 'text-green-400 border-green-400/20' : 'text-yellow-400 border-yellow-400/20'}
                                                  `}>
                                                      {d.confidence}%
                                                  </Badge>
                                              </div>
                                         ))}
                                         {detectedText.length > 50 && (
                                             <p className="text-center text-xs text-slate-500 pt-2">...and {detectedText.length - 50} more</p>
                                         )}
                                     </div>
                                 </div>
                             )}
                         </div>
                     </div>

                 </div>
            </main>
        </div>
    );
};

export default TextDetection;