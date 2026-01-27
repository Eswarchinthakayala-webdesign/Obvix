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
  Target, 
  Trash2, 
  ChevronRight,
  TrendingUp,
  Activity,
  Calendar,
  Grid,
  Search,
  ScanFace,
  Hand
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

const SessionsDashboard = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalDetections: 0,
    avgConfidence: 0,
    classDistribution: [],
    trendData: []
  });

  useEffect(() => {
    // Load sessions from localStorage
    const storedSessions = JSON.parse(localStorage.getItem('obvix_sessions') || '[]');
    setSessions(storedSessions);

    // Calculate Stats
    if (storedSessions.length > 0) {
      const totalDetections = storedSessions.reduce((acc, curr) => acc + (curr.detectionCount || 0), 0);
      
      // Calculate avg confidence across all items
      let totalScore = 0;
      let countScore = 0;
      let classMap = {};

      storedSessions.forEach(session => {
        if (session.detections) {
          session.detections.forEach(d => {
             totalScore += d.score;
             countScore++;
             classMap[d.label] = (classMap[d.label] || 0) + 1;
          });
        }
      });
      
      // Distribution Data for Bar Chart
      const chartData = Object.keys(classMap).map(key => ({
        name: key,
        count: classMap[key]
      })).sort((a,b) => b.count - a.count).slice(0, 10);

      // Trend Data for Area Chart (Reverse chronological to chronological)
      // Group by Date for cleaner chart if many sessions
      const relevantSessions = [...storedSessions].reverse().slice(-14); // Last 14 sessions
      const trendData = relevantSessions.map(s => ({
          date: new Date(s.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }),
          count: s.detectionCount,
          confidence: s.detections && s.detections.length > 0 
            ? Math.round(s.detections.reduce((a,c) => a + c.score, 0) / s.detections.length) 
            : 0
      }));

      setStats({
        totalSessions: storedSessions.length,
        totalDetections,
        avgConfidence: countScore > 0 ? Math.round(totalScore / countScore) : 0,
        classDistribution: chartData,
        trendData
      });
    }
  }, []);



  const clearAllData = () => {
      localStorage.removeItem('obvix_sessions');
      setSessions([]);
      setStats({
        totalSessions: 0,
        totalDetections: 0,
        avgConfidence: 0,
        classDistribution: [],
        trendData: []
      });
      toast.success("Session history cleared successfully");
  };
  
  // ... formatDate, calculateDuration ...

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

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-purple-500/30 font-sans  pb-20">
      
      {/* Header */}
      <nav className="sticky top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
           <div className="flex items-center gap-4">
               <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                    <div className="relative flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                        <ObvixLogo className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-tight text-white leading-none">Obvix</span>
                        <span className="text-[10px] uppercase tracking-widest text-primary font-bold">Analytics</span>
                    </div>
                </div>
           </div>
           
           <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/start-detection')} className="hidden sm:flex rounded-full bg-black hover:bg-black/80 border border-white/20 cursor-pointer text-white transition-all hover:scale-105">
                 <Target className="w-4 h-4 mr-2" />
                 New Session
              </Button>
           </div>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
          
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
              <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-400">
                      Obvix Sessions
                  </h1>
                  <p className="text-slate-400 text-sm sm:text-base max-w-xl">
                      Real-time analysis of your object detection sessions.
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
                          Clear Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-zinc-950 border-white/10 text-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                          This action cannot be undone. This will permanently delete your
                          session history and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={clearAllData} className="bg-red-600 hover:bg-red-700 text-white border-none">Continue</AlertDialogAction>
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
                      <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                          <Database className="w-5 h-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-purple-500/30 text-purple-400 bg-purple-500/5">Total</Badge>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-3xl font-bold text-white tracking-tight group-hover:scale-105 transition-transform origin-left duration-300">
                          {stats.totalSessions}
                      </span>
                      <span className="text-xs text-slate-400 mt-1 font-medium">Recorded Sessions</span>
                  </div>
              </div>

              {/* Total Objects */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm group hover:bg-white/[0.07] transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                          <Target className="w-5 h-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-500/30 text-blue-400 bg-blue-500/5">Lifetime</Badge>
                  </div>
                  <div className="flex flex-col">
                       <span className="text-3xl font-bold text-white tracking-tight group-hover:scale-105 transition-transform origin-left duration-300">
                          {stats.totalDetections}
                       </span>
                      <span className="text-xs text-slate-400 mt-1 font-medium">Objects Detected</span>
                  </div>
              </div>

              {/* Avg Confidence */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm group hover:bg-white/[0.07] transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                          <Activity className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-mono text-emerald-400">+2.4%</span>
                  </div>
                  <div className="flex flex-col">
                       <span className="text-3xl font-bold text-white tracking-tight group-hover:scale-105 transition-transform origin-left duration-300">
                          {stats.avgConfidence}%
                       </span>
                      <span className="text-xs text-slate-400 mt-1 font-medium">Avg. Confidence</span>
                  </div>
              </div>

               {/* Top Object */}
               <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm group hover:bg-white/[0.07] transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                          <TrendingUp className="w-5 h-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-orange-500/30 text-orange-400 bg-orange-500/5">Frequent</Badge>
                  </div>
                  <div className="flex flex-col">
                       <span className="text-3xl font-bold text-white tracking-tight group-hover:scale-105 transition-transform origin-left duration-300 truncate">
                          {stats.classDistribution.length > 0 ? stats.classDistribution[0].name.toUpperCase() : "N/A"}
                       </span>
                      <span className="text-xs text-slate-400 mt-1 font-medium">Primary Target</span>
                  </div>
              </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Area Chart: Trend */}
              <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
                   <div className="flex items-center justify-between mb-6">
                       <div>
                          <h3 className="text-lg font-bold text-white">Detection Trend</h3>
                          <p className="text-xs text-slate-400">Objects detected per session over time</p>
                       </div>
                       <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">Live Data</Badge>
                   </div>
                   <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={stats.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                            <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                            <Tooltip 
                               contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                               itemStyle={{ color: '#fff' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="count" 
                                stroke="#a855f7" 
                                strokeWidth={3}
                                fillOpacity={1} 
                                fill="url(#colorCount)" 
                                activeDot={{ r: 6, fill: '#fff', stroke: '#a855f7', strokeWidth: 2 }}
                            />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
              </div>

              {/* Bar Chart: Distribution */}
              <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                   <div className="flex items-center justify-between mb-6">
                       <h3 className="text-lg font-bold text-white">Class Distribution</h3>
                       <Grid className="w-4 h-4 text-slate-500" />
                   </div>
                   <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.classDistribution} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                              <XAxis type="number" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                              <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} width={80} />
                              <Tooltip 
                                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                  itemStyle={{ color: '#fff' }}
                              />
                              <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24}>
                              </Bar>
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
          </div>

          {/* Recent Sessions List & Detailed Table */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Detailed Table */}
              <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex flex-col">
                  {/* Table Header with Search */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                     <div className="flex items-center gap-2">
                        <div className="bg-emerald-500/10 p-2 rounded-lg">
                           <Calendar className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                           <h3 className="text-lg font-bold text-white leading-none">Session History</h3>
                           <span className="text-xs text-slate-400">
                             {sessions.length} total records
                           </span>
                        </div>
                     </div>
                     
                     <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input 
                          type="text" 
                          placeholder="Search session..." 
                          value={searchQuery}
                          onChange={(e) => {
                              setSearchQuery(e.target.value);
                              setVisibleCount(8); // Reset pagination on search
                          }}
                          className="w-full bg-black/40 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                        />
                     </div>
                  </div>
                  
                  {/* Filter Logic */}
                  {(() => {
                      const filteredSessions = sessions.filter(session => {
                          const query = searchQuery.toLowerCase();
                          const dateStr = new Date(session.startTime).toLocaleDateString().toLowerCase();
                          const idMatch = session.id.toLowerCase().includes(query);
                          const dateMatch = dateStr.includes(query);
                          const objectMatch = session.detections && session.detections.some(d => d.label.toLowerCase().includes(query));
                          return idMatch || dateMatch || objectMatch;
                      });

                      const displaySessions = filteredSessions.slice(0, visibleCount);

                      return (
                        <div className="flex flex-col flex-1">
                           <div className="overflow-x-auto min-h-[300px]">
                             <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-500 font-mono text-xs uppercase tracking-wider">
                                        <th className="pb-4 pl-2 font-medium">Timestamp</th>
                                        <th className="pb-4 font-medium">Duration</th>
                                        <th className="pb-4 font-medium">Detections</th>
                                        <th className="pb-4 text-right pr-2 font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    {displaySessions.map((session, idx) => (
                                        <motion.tr 
                                            key={session.id} 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => navigate(`/session/${session.id}`)}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer"
                                        >
                                            <td className="py-3 pl-2">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-2">
                                                        {session.type === 'face_detection' 
                                                            ? <ScanFace className="w-3 h-3 text-purple-400" />
                                                            : session.type === 'hand_tracking'
                                                            ? <Hand className="w-3 h-3 text-blue-400" />
                                                            : <Target className="w-3 h-3 text-emerald-400" />
                                                        }
                                                        <span className="font-medium text-white">{formatDate(session.startTime).split(',')[0]}</span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 pl-5">{new Date(session.startTime).toLocaleTimeString()}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 font-mono text-xs text-slate-400 group-hover:text-slate-200 transition-colors">
                                                {calculateDuration(session.startTime, session.endTime)}
                                            </td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="secondary" className={`bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-0 h-5 text-[10px] ${session.type === 'face_detection' ? 'bg-indigo-500/20 text-indigo-300' : session.type === 'hand_tracking' ? 'bg-blue-500/20 text-blue-300' : ''}`}>
                                                        {session.detectionCount}
                                                    </Badge>
                                                    <span className="text-xs text-slate-500 truncate max-w-[150px] hidden sm:inline-block opacity-60 group-hover:opacity-100 transition-opacity">
                                                        {session.type === 'face_detection' 
                                                            ? `${session.detectionCount} Faces Scanned`
                                                            : session.type === 'hand_tracking'
                                                            ? `${session.detectionCount} Hands Tracked`
                                                            : (session.detections ? session.detections.slice(0,2).map(d => d.label).join(', ') + (session.detections.length > 2 ? '...' : '') : '')
                                                        }
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-right pr-2">
                                                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center ml-auto group-hover:text-white transition-all">
                                                    <ChevronRight className="w-4 h-4" />
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                             </table>
                             
                             {filteredSessions.length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500">
                                    <Search className="w-8 h-8 mb-2 opacity-20" />
                                    <span className="text-sm">No sessions match "{searchQuery}"</span>
                                </div>
                             )}
                           </div>
                           
                           {/* Load More / View All */}
                           {filteredSessions.length > visibleCount && (
                               <div className="mt-4 flex justify-center border-t border-white/5 pt-4">
                                   <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      onClick={() => setVisibleCount(prev => prev + 8)}
                                      className="text-xs text-slate-400 hover:text-white hover:bg-white/5"
                                   >
                                      Load More ({filteredSessions.length - visibleCount} remaining)
                                   </Button>
                               </div>
                           )}
                        </div>
                      );
                  })()}
              </div>

               {/* Recent Activity Feed */}
               <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-0 overflow-hidden flex flex-col backdrop-blur-sm h-full">
                  <div className="p-6 border-b border-white/5 bg-black/20">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        Recent Activity
                      </h3>
                  </div>
                  <ScrollArea className="flex-1 max-h-[500px]">
                      <div className="p-4 flex flex-col gap-3">
                          {sessions.slice(0, 6).map((session, idx) => (
                              <motion.div 
                                key={session.id} 
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                onClick={() => navigate(`/session/${session.id}`)}
                                className="p-4 bg-white/[0.03] hover:bg-white/[0.08] rounded-xl transition-all border border-white/5 hover:border-white/10 cursor-pointer group relative overflow-hidden"
                              >
                                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                                  
                                  <div className="flex justify-between items-start mb-2">
                                      <div className="flex flex-col">
                                          <span className="text-xs font-bold text-white mb-0.5">Session #{session.id.slice(0,5)}</span>
                                          <span className="text-[10px] font-mono text-slate-500">{formatDate(session.startTime)}</span>
                                      </div>
                                      <Badge variant="outline" className="border-white/10 text-white bg-black/40 text-[10px]">
                                          {calculateDuration(session.startTime, session.endTime)}
                                      </Badge>
                                  </div>
                                  
                                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                                      <div className="flex -space-x-2">
                                          {[...Array(Math.min(3, session.detectionCount || 0))].map((_, i) => (
                                              <div key={i} className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[8px] text-white">
                                                  <Target size={10} />
                                              </div>
                                          ))}
                                          {(session.detectionCount || 0) > 3 && (
                                              <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[8px] text-white">
                                                  +{session.detectionCount - 3}
                                              </div>
                                          )}
                                      </div>
                                      <span className="text-xs font-medium text-slate-300 group-hover:text-blue-300 transition-colors">
                                          View Details
                                      </span>
                                  </div>
                              </motion.div>
                          ))}
                          {sessions.length === 0 && (
                             <div className="py-12 text-center text-slate-500 text-xs">No recent activity recorded.</div>
                          )}
                      </div>
                  </ScrollArea>
              </div>

          </div>
      </main>
    </div>
  );
};

export default SessionsDashboard;