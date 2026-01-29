import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  ArrowLeft, 
  Database, 
  Clock, 
  Trash2, 
  ChevronRight,
  TrendingUp,
  Activity,
  Calendar,
  Grid,
  Search,
  Type,
  FileText
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

const TextDetectionDashboard = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalWords: 0,
    avgConfidence: 0,
    dailyActivity: [],
    trendData: []
  });

  useEffect(() => {
    // Load sessions from localStorage
    const allSessions = JSON.parse(localStorage.getItem('obvix_sessions') || '[]');
    // Filter for text detection only
    const textSessions = allSessions.filter(s => s.type === 'text_detection');
    setSessions(textSessions);

    // Calculate Stats
    if (textSessions.length > 0) {
      let totalWords = 0;
      let totalConfidenceSum = 0;
      let confidenceCount = 0;
      
      const activityMap = {};

      textSessions.forEach(session => {
        // Count total words across all detections in this session
        const sessionWordCount = session.detections ? session.detections.reduce((acc, d) => acc + (d.wordCount || 0), 0) : 0;
        totalWords += sessionWordCount;

        // Confidence
        if (session.detections) {
            session.detections.forEach(d => {
                if (d.avgConfidence) {
                    totalConfidenceSum += d.avgConfidence;
                    confidenceCount++;
                }
            });
        }
        
        // Activity by Date
        const dateKey = new Date(session.startTime).toLocaleDateString();
        activityMap[dateKey] = (activityMap[dateKey] || 0) + sessionWordCount;
      });
      
      // Chart Data: Words per day
      const chartData = Object.keys(activityMap).map(key => ({
        name: key,
        count: activityMap[key]
      })).slice(-7); // Last 7 days active

      // Trend Data: Confidence over time (last 20 detections across all sessions)
      // Flatten all detections
      const allDetections = textSessions.flatMap(s => s.detections || []).sort((a,b) => new Date(a.timestamp) - new Date(b.timestamp));
      const trendData = allDetections.slice(-20).map(d => ({
          time: new Date(d.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
          confidence: Math.round(d.avgConfidence || 0),
          words: d.wordCount || 0
      }));

      setStats({
        totalSessions: textSessions.length,
        totalWords,
        avgConfidence: confidenceCount > 0 ? Math.round(totalConfidenceSum / confidenceCount) : 0,
        dailyActivity: chartData,
        trendData
      });
    }
  }, []);

  const clearTextData = () => {
      // Only remove text sessions
      const allSessions = JSON.parse(localStorage.getItem('obvix_sessions') || '[]');
      const otherSessions = allSessions.filter(s => s.type !== 'text_detection');
      localStorage.setItem('obvix_sessions', JSON.stringify(otherSessions));
      
      setSessions([]);
      setStats({
        totalSessions: 0,
        totalWords: 0,
        avgConfidence: 0,
        dailyActivity: [],
        trendData: []
      });
      toast.success("Text extraction history cleared");
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const calculateDuration = (start, end) => {
     const durationMs = new Date(end) - new Date(start);
     if (isNaN(durationMs)) return "--";
     const seconds = Math.floor((durationMs / 1000) % 60);
     const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
     return `${minutes}m ${seconds}s`;
  };

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

  const DarkTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div
      className="
        rounded-xl border border-white/10
        bg-zinc-950/95 backdrop-blur-md
        px-4 py-3 shadow-2xl
      "
    >
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-zinc-300">
            {item.name}
          </span>
          <span className="ml-auto font-medium text-white">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
};
  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-yellow-500/30 font-sans pb-20">
      
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
             <div className="flex items-center ">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/text-detection')} className="hover:bg-white/10 text-white rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                            <div className="relative flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                                <ObvixLogo className="w-8 h-8 text-yellow-500" />
                            </div>
                            <span className="text-lg font-bold tracking-tight text-white leading-none hidden sm:block">Obvix</span>
                        </div>
            </div>

           <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/text-detection')} className="flex rounded-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold transition-all hover:scale-105">
                 <Type className="w-4 h-4" />
                <span className='hidden sm:block'> New Extraction</span>
              </Button>
           </div>
        </div>
      </nav>

      <main className="relative z-10 mt-16 container mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
          
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
              <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
                      Extraction History
                  </h1>
                  <p className="text-slate-400 text-sm sm:text-base max-w-xl">
                      Deep dive into your OCR text extraction sessions and performance.
                  </p>
              </div>
              <div className="flex gap-3">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled={sessions.length === 0}
                        className="border-red-500/20 cursor-pointer text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear History
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-zinc-950 border-white/10 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear Text History?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                          This will remove all text extraction sessions from local storage.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={clearTextData} className="bg-red-600 hover:bg-red-700 text-white border-none">Delete All</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </div>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
             {/* Total Sessions */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm group hover:bg-white/[0.07] transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500">
                          <Database className="w-5 h-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-yellow-500/30 text-yellow-500 bg-yellow-500/5">Sessions</Badge>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-3xl font-bold text-white tracking-tight group-hover:scale-105 transition-transform origin-left duration-300">
                          {stats.totalSessions}
                      </span>
                  </div>
              </div>

              {/* Total Words */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm group hover:bg-white/[0.07] transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                          <Type className="w-5 h-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-500/30 text-blue-400 bg-blue-500/5">Lifetime</Badge>
                  </div>
                  <div className="flex flex-col">
                       <span className="text-3xl font-bold text-white tracking-tight group-hover:scale-105 transition-transform origin-left duration-300">
                          {stats.totalWords}
                       </span>
                      <span className="text-xs text-slate-400 mt-1 font-medium">Words Extracted</span>
                  </div>
              </div>

              {/* Avg Confidence */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm group hover:bg-white/[0.07] transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                          <Activity className="w-5 h-5" />
                      </div>
                  </div>
                  <div className="flex flex-col">
                       <span className="text-3xl font-bold text-white tracking-tight group-hover:scale-105 transition-transform origin-left duration-300">
                          {stats.avgConfidence}%
                       </span>
                      <span className="text-xs text-slate-400 mt-1 font-medium">Avg. Accuracy</span>
                  </div>
              </div>

               {/* Recent Activity Count (Today) */}
               <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm group hover:bg-white/[0.07] transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                          <TrendingUp className="w-5 h-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-purple-500/30 text-purple-400 bg-purple-500/5">Recent</Badge>
                  </div>
                  <div className="flex flex-col">
                       <span className="text-3xl font-bold text-white tracking-tight group-hover:scale-105 transition-transform origin-left duration-300">
                          {stats.dailyActivity.length > 0 ? stats.dailyActivity[stats.dailyActivity.length-1].count : 0}
                       </span>
                      <span className="text-xs text-slate-400 mt-1 font-medium">Words Today</span>
                  </div>
              </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Area Chart: Trend */}
              <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
                   <div className="flex items-center justify-between mb-6">
                       <div>
                          <h3 className="text-lg font-bold text-white">Detection Confidence</h3>
                          <p className="text-xs text-slate-400">Accuracy over last 20 extractions</p>
                       </div>
                   </div>
                   <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={stats.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorConf" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                            <Tooltip 
                               contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                               itemStyle={{ color: '#fff' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="confidence" 
                                stroke="#eab308" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorConf)" 
                                activeDot={{ r: 6, fill: '#fff', stroke: '#eab308', strokeWidth: 2 }}
                            />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
              </div>

              {/* Bar Chart: Daily Activity */}
              <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                   <div className="flex items-center justify-between mb-6">
                       <h3 className="text-lg font-bold text-white">Words Processed</h3>
                       <Grid className="w-4 h-4 text-slate-500" />
                   </div>
                   <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.dailyActivity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                              <Tooltip 
                                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                  itemStyle={{ color: '#fff' }}
                              />
                              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30}>
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>

          {/* Recent Sessions List */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex flex-col">
              {/* Table Header with Search */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                 <div className="flex items-center gap-2">
                    <div className="bg-emerald-500/10 p-2 rounded-lg">
                       <Calendar className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                       <h3 className="text-lg font-bold text-white leading-none">Recent Sessions</h3>
                    </div>
                 </div>
                 
                 <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Search session ID or content..." 
                      value={searchQuery}
                      onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setVisibleCount(8); 
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-yellow-500/50 transition-colors"
                    />
                 </div>
              </div>
              
              {/* List */}
              {(() => {
                  const filteredSessions = sessions.filter(session => {
                      const query = searchQuery.toLowerCase();
                      const dateStr = new Date(session.startTime).toLocaleDateString().toLowerCase();
                      const idMatch = session.id.toLowerCase().includes(query);
                      // Search inside detected text snippets
                      const contentMatch = session.detections && session.detections.some(d => d.text && d.text.toLowerCase().includes(query));
                      return idMatch || dateStr.includes(query) || contentMatch;
                  });

                  const displaySessions = filteredSessions.slice(0, visibleCount);

                  return (
                    <div className="flex flex-col flex-1">
                       <div className="overflow-x-auto min-h-[300px]">
                         <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-white/10 text-slate-500 font-mono text-xs uppercase tracking-wider">
                                    <th className="pb-4 pl-2 font-medium">Session</th>
                                    <th className="pb-4 font-medium">Process Time</th>
                                    <th className="pb-4 font-medium">Results</th>
                                    <th className="pb-4 font-medium">Confidence</th>
                                    <th className="pb-4 text-right pr-2 font-medium">View</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-300">
                                {displaySessions.map((session, idx) => {
                                    const totalWords = session.detections ? session.detections.reduce((a,c) => a + (c.wordCount || 0), 0) : 0;
                                    const sessionConf = session.detections && session.detections.length > 0
                                        ? Math.round(session.detections.reduce((a,c) => a + (c.avgConfidence || 0), 0) / session.detections.length)
                                        : 0;

                                    return (
                                    <motion.tr 
                                        key={session.id} 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => navigate(`/text-session/${session.id}`)}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                                    >
                                        <td className="py-4 pl-2">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-3 h-3 text-yellow-400" />
                                                    <span className="font-medium text-white font-mono">{session.id.slice(0,8)}</span>
                                                </div>
                                                <span className="text-[10px] text-slate-500 pl-5">{formatDate(session.startTime)}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 font-mono text-xs text-slate-400">
                                            {calculateDuration(session.startTime, session.endTime)}
                                        </td>
                                        <td className="py-4">
                                            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border-0">
                                                {totalWords} Words
                                            </Badge>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500" style={{width: `${sessionConf}%`}} />
                                                </div>
                                                <span className="text-xs text-slate-400">{sessionConf}%</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-right pr-2">
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center ml-auto group-hover:text-white transition-all">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </td>
                                    </motion.tr>
                                )})}
                            </tbody>
                         </table>
                         
                         {filteredSessions.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                                <Search className="w-8 h-8 mb-2 opacity-20" />
                                <span className="text-sm">No valid text sessions found. Start a new extraction!</span>
                            </div>
                         )}
                       </div>
                       
                       {/* Load More */}
                       {filteredSessions.length > visibleCount && (
                           <div className="mt-4 flex justify-center border-t border-white/5 pt-4">
                               <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => setVisibleCount(prev => prev + 8)}
                                  className="text-xs text-slate-400 hover:text-white hover:bg-white/5"
                               >
                                  Load More
                               </Button>
                           </div>
                       )}
                    </div>
                  );
              })()}
          </div>
      </main>
    </div>
  );
};

export default TextDetectionDashboard;
