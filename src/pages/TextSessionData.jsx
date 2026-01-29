import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Clock, 
  Bot, // Using Bot as generic icon
  Type, 
  Activity, 
  Search,
  FileText,
  AlignLeft,
  Copy
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from 'framer-motion';
import { toast } from "sonner";

const TextSessionData = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [activeTab, setActiveTab] = useState('text'); // 'text' | 'words'
  const [searchWord, setSearchWord] = useState('');

  useEffect(() => {
    const allSessions = JSON.parse(localStorage.getItem('obvix_sessions') || '[]');
    const found = allSessions.find(s => s.id === id);
    if (found) {
        setSession(found);
    }
  }, [id]);

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mb-4"></div>
         <p className="text-slate-500 font-mono">Loading Session Not Found...</p>
         <Button onClick={() => navigate('/text-dashboard')} variant="link" className="text-yellow-500 mt-4">Return to Dashboard</Button>
      </div>
    );
  }

  // Aggregate all words from all detections in this session
  const allWords = session.detections ? session.detections.flatMap(d => d.words || []) : [];
  
  // Calculate Stats
  const totalWords = allWords.length;
  const avgConfidence = totalWords > 0 
      ? Math.round(allWords.reduce((a,c) => a + c.confidence, 0) / totalWords)
      : 0;
  
  // Prepare Chart Data: Confidence Distribution buckets
  const confidenceBuckets = [
      { name: '0-20%', count: 0, color: '#ef4444' },
      { name: '21-40%', count: 0, color: '#f97316' },
      { name: '41-60%', count: 0, color: '#eab308' },
      { name: '61-80%', count: 0, color: '#84cc16' },
      { name: '81-100%', count: 0, color: '#22c55e' }
  ];

  allWords.forEach(w => {
      const conf = w.confidence;
      if (conf <= 20) confidenceBuckets[0].count++;
      else if (conf <= 40) confidenceBuckets[1].count++;
      else if (conf <= 60) confidenceBuckets[2].count++;
      else if (conf <= 80) confidenceBuckets[3].count++;
      else confidenceBuckets[4].count++;
  });

  const fullText = session.detections ? session.detections.map(d => d.text).join('\n\n') : '';

  const copyToClipboard = () => {
      navigator.clipboard.writeText(fullText);
      toast.success("Full text copied to clipboard");
  };

  const calculateDuration = (start, end) => {
     const durationMs = new Date(end) - new Date(start);
     if (isNaN(durationMs)) return "--";
     const seconds = Math.floor((durationMs / 1000) % 60);
     const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
     return `${minutes}m ${seconds}s`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'long', day: 'numeric', hour: '2-digit', minute:'2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-black text-foreground overflow-hidden selection:bg-yellow-500/30 font-sans pb-20">
       
       <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
           <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" size="icon" 
                  onClick={() => navigate('/text-dashboard')}
                  className="rounded-full cursor-pointer hover:bg-white/10 text-muted-foreground hover:text-white"
                >
                    <ArrowLeft size={20} />
                </Button>
                
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Session</span>
                  <span className="text-sm font-bold text-white font-mono">{id.slice(0, 8)}...</span>
                </div>
           </div>
           
           <div className="flex items-center gap-2">
               <Badge variant="outline" className="border-yellow-500/20 text-yellow-500 bg-yellow-500/5">
                  {session.detections.length} Extractions
               </Badge>
           </div>
        </div>
      </nav>

      <main className="relative z-10 mt-16 container mx-auto px-4 sm:px-6 py-8">
         {/* Title Area */}
         <div className="mb-8 border-b border-white/10 pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
             <div>
                 <p className="text-slate-500 text-sm font-mono mb-1">{formatDate(session.startTime)}</p>
                 <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                    <FileText className="w-8 h-8 text-yellow-500" />
                    Text Extraction Report
                 </h1>
             </div>
             <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Duration</span>
                <span className="text-xl font-mono text-white">
                   {calculateDuration(session.startTime, session.endTime)}
                </span>
             </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Stats & Confidence */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="text-slate-400 text-xs uppercase font-bold mb-2">Total Words</div>
                        <div className="text-2xl font-bold text-white">{totalWords}</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                        <div className="text-slate-400 text-xs uppercase font-bold mb-2">Avg Confidence</div>
                        <div className={`text-2xl font-bold ${avgConfidence > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                            {avgConfidence}%
                        </div>
                    </div>
                </div>

                {/* Confidence Chart */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                    <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-400" /> Confidence Distribution
                    </h3>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={confidenceBuckets}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} interval={0} />
                                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                    contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                />
                                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                                    {confidenceBuckets.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Filter / Search Words */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                       <input 
                         type="text" 
                         placeholder="Find specific word..." 
                         value={searchWord}
                         onChange={(e) => setSearchWord(e.target.value)}
                         className="w-full bg-black/40 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50"
                       />
                    </div>
                </div>

            </div>

            {/* Right Column: Content */}
            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl flex flex-col overflow-hidden backdrop-blur-sm min-h-[500px]">
                
                {/* Tabs */}
                <div className="flex items-center border-b border-white/5 bg-black/20">
                    <button 
                        onClick={() => setActiveTab('text')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'text' ? 'text-yellow-400 border-yellow-400' : 'text-slate-400 border-transparent hover:text-white'}`}
                    >
                        <AlignLeft className="w-4 h-4" /> <span className='hidden sm:block'>Full Text</span> 
                    </button>
                    <button 
                        onClick={() => setActiveTab('words')}
                        className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === 'words' ? 'text-yellow-400 border-yellow-400' : 'text-slate-400 border-transparent hover:text-white'}`}
                    >
                        <Type className="w-4 h-4" /> <span className='hidden sm:block'>Word Analysis</span> 
                    </button>

                    <div className="ml-auto pr-4">
                        <Button variant="ghost" size="sm" onClick={copyToClipboard} className="text-slate-400 hover:text-white">
                            <Copy className="w-4 h-4 mr-2" /> Copy All
                        </Button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-hidden relative">
                    <ScrollArea className="h-full absolute inset-0">
                        {activeTab === 'text' ? (
                            <div className="p-6">
                                {fullText ? (
                                    <p className="text-slate-200 leading-relaxed whitespace-pre-wrap font-serif text-lg">
                                        {fullText}
                                    </p>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                                        <p>No text content available.</p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-col min-h-full">
                                {/* Mobile View: Cards */}
                                <div className="md:hidden overflow-y-auto h-100  space-y-3 p-4">
                                    {allWords
                                      .filter(w => w.text.toLowerCase().includes(searchWord.toLowerCase()))
                                      .map((w, idx) => (
                                        <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col gap-3 active:scale-[0.98] transition-transform">
                                            <div className="flex justify-between items-start gap-4">
                                                <span className="text-white font-bold text-lg break-all">{w.text}</span>
                                                <Badge variant="outline" className={`${w.confidence > 80 ? 'text-green-400 border-green-500/20 bg-green-500/10' : 'text-yellow-400 border-yellow-500/20 bg-yellow-500/10'} whitespace-nowrap`}>
                                                    {w.confidence}%
                                                </Badge>
                                            </div>
                                            <div className="flex justify-between items-center bg-black/20 p-2.5 rounded-lg border border-white/5">
                                                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Location</span>
                                                <span className="text-[10px] text-slate-400 font-mono">
                                                    {w.bbox ? `x:${w.bbox.x0}, y:${w.bbox.y0}` : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {allWords.length === 0 && (
                                         <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                             <p>No individual words found.</p>
                                         </div>
                                    )}
                                </div>

                                {/* Desktop View: Table */}
                                <div className="hidden overflow-y-auto h-100 md:block">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-black sticky top-0 z-10 border-b border-white/10">
                                            <tr>
                                                <th className="px-6 py-3 text-slate-500 font-normal text-xs uppercase tracking-wider">Word Detected</th>
                                                <th className="px-6 py-3 text-slate-500 font-normal text-right text-xs uppercase tracking-wider">Confidence</th>
                                                <th className="px-6 py-3 text-slate-500 font-normal text-right text-xs uppercase tracking-wider">Location</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {allWords
                                              .filter(w => w.text.toLowerCase().includes(searchWord.toLowerCase()))
                                              .map((w, idx) => (
                                                <tr key={idx} className="hover:bg-white/5 cursor-pointer transition-colors group">
                                                    <td className="px-6 py-3 text-white font-medium group-hover:text-yellow-400 transition-colors">{w.text}</td>
                                                    <td className="px-6 py-3 text-right">
                                                        <span className={`${w.confidence > 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                                                            {w.confidence}%
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-3 text-right text-slate-500 font-mono text-xs group-hover:text-slate-400">
                                                        {w.bbox ? `x:${w.bbox.x0}, y:${w.bbox.y0}` : 'N/A'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    {allWords.length === 0 && (
                                         <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                                             <p>No individual words parsed.</p>
                                         </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </ScrollArea>
                </div>

            </div>

         </div>
      </main>
    </div>
  );
};

export default TextSessionData;