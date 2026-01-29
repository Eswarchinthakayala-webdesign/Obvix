import React, { useEffect, useState } from 'react';
import { 
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
  Target, 
  Trash2, 
  ChevronRight,
  Activity,
  Calendar,
  Search,
  ScanFace,
  Users,
  MoreVertical,
  Filter
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

const FaceLandmarkDashboard = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalFaces: 0,
    avgConfidence: 0,
    trendData: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load sessions from localStorage
    const storedSessions = JSON.parse(localStorage.getItem('obvix_sessions') || '[]');
    // Filter only Face Landmark sessions
    const faceSessions = storedSessions.filter(s => s.type === 'face_landmark' || (s.detections && s.detections.some(d => d.label === 'Face Mesh Analysis')));
    
    setSessions(faceSessions.sort((a, b) => new Date(b.startTime) - new Date(a.startTime)));
    calculateStats(faceSessions);
  };

  const calculateStats = (faceSessions) => {
      const totalSessions = faceSessions.length;
      let totalFaces = 0;
      let totalScore = 0;
      let scoreCount = 0;
      
      faceSessions.forEach(s => {
          if(s.detections) {
              s.detections.forEach(d => {
                  totalFaces += (d.faceCount || 0);
                  if (d.score) {
                      totalScore += d.score;
                      scoreCount++;
                  }
              })
          }
      });

      const avgConfidence = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0;
      
      // Trend Data (Last 14 Sessions)
      const trendData = faceSessions.slice(0, 14).reverse().map(s => ({
          date: new Date(s.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' }),
          faces: s.detectionCount // Actually, let's sum faceCount in detection
      }));

      setStats({
          totalSessions,
          totalFaces,
          avgConfidence,
          trendData
      });
  };

  const clearData = () => {
      const stored = JSON.parse(localStorage.getItem('obvix_sessions') || '[]');
      const kept = stored.filter(s => s.type !== 'face_landmark' && (!s.detections || !s.detections.some(d => d.label === 'Face Mesh Analysis')));
      localStorage.setItem('obvix_sessions', JSON.stringify(kept));
      loadData();
      toast.success("Face Landmark history cleared");
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const filteredSessions = sessions.filter(s => s.id.includes(searchQuery) || new Date(s.startTime).toLocaleDateString().includes(searchQuery));

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-pink-500/30 font-sans pb-24 relative overflow-hidden">
      
  
      {/* Header */}
      <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
           <div className="flex items-center ">
                <Button variant="ghost" size="icon" onClick={() => navigate('/face-landmark')} className="hover:bg-white/10 text-white rounded-full">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                     <div className="relative flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                         <ObvixLogo className="w-8 h-8 text-pink-500" />
                     </div>
                     <span className="text-lg font-bold tracking-tight text-white leading-none hidden sm:block">Obvix</span>
                 </div>
           </div>
           
           <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/face-landmark')} className="rounded-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-bold shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all hover:scale-105">
                 <ScanFace className="w-4 h-4 mr-0 sm:mr-2" />
                 <span className='hidden sm:block'>New Analysis</span>
              </Button>
           </div>
        </div>
      </nav>

      <main className="relative z-10 mt-16 container mx-auto px-4 sm:px-6 py-8 space-y-8">
          
          {/* Dashboard Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6"
          >
              <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 tracking-tight mb-2">
                       Face Analytics
                  </h1>
                  <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
                      Visualize geometric face data and track measurement history.
                  </p>
              </div>
              <div className="flex gap-2">
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
                        <AlertDialogTitle>Clear Face History?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                          This will permanently remove all saved face landmark sessions.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={clearData} className="bg-red-600 hover:bg-red-700 text-white border-none">Delete All</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </div>
          </motion.div>

          {/* KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Sessions', value: stats.totalSessions, icon: Database, color: 'pink', sub: 'Scans Performed' },
                { label: 'Faces Detected', value: stats.totalFaces, icon: Users, color: 'blue', sub: 'Cumulative' },
                { label: 'Avg Confidence', value: `${Number.isNaN(stats.avgConfidence) ? 0 : stats.avgConfidence}%`, icon: Activity, color: 'emerald', sub: 'Reliability' },
                { label: 'Model Quality', value: 'High', icon: Target, color: 'purple', sub: 'MediaPipe V2' }
              ].map((stat, i) => (
                  <motion.div 
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-zinc-900/50 border border-white/10 rounded-2xl p-5 backdrop-blur-md group hover:bg-white/[0.07] transition-all duration-300 hover:border-white/20 relative overflow-hidden"
                  >
                      {/* Glow effect */}
                      <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-${stat.color}-500/20 transition-colors`} />
                      
                      <div className="flex justify-between items-start mb-4 relative z-10">
                          <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                              <stat.icon className="w-5 h-5" />
                          </div>
                      </div>
                      <div className="flex flex-col relative z-10">
                          <span className="text-3xl font-bold text-white tracking-tight group-hover:translate-x-1 transition-transform duration-300">
                              {stat.value}
                          </span>
                          <span className="text-xs text-slate-400 mt-1 font-medium">{stat.sub}</span>
                      </div>
                  </motion.div>
              ))}
          </div>

          {/* Main Content Grid: Chart & History Side-by-Side */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left Column: Chart (Takes 2/3 width) */}
              <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 transition={{ delay: 0.3 }}
                 className="lg:col-span-2 space-y-6"
              >
                  <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden shadow-2xl">
                       <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8">
                           <div>
                              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                 <Activity className="w-5 h-5 text-pink-500" />
                                 Analysis Trend
                              </h3>
                              <p className="text-xs text-slate-400 mt-1">Face detections over time</p>
                           </div>
                           <div className="flex items-center gap-2 mt-4 sm:mt-0">
                              <Badge variant="outline" className="border-white/10 bg-white/5 text-xs">Last 14 Sessions</Badge>
                           </div>
                       </div>
                       <div className="h-[300px] w-full">
                          <ResponsiveContainer width="100%" height="100%">
                             <AreaChart data={stats.trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <defs>
                                  <linearGradient id="colorFaces" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    stroke="#64748b" 
                                    fontSize={10} 
                                    tickLine={false} 
                                    axisLine={false} 
                                    dy={10}
                                />
                                <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip 
                                   contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px', color: '#fff', padding: '12px' }}
                                   itemStyle={{ color: '#ec4899', fontWeight: 'bold' }}
                                   labelStyle={{ color: '#94a3b8', marginBottom: '8px', fontSize: '12px' }}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="faces" 
                                    stroke="#ec4899" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorFaces)" 
                                />
                             </AreaChart>
                          </ResponsiveContainer>
                       </div>
                  </div>
              </motion.div>

              {/* Right Column: History List (Takes 1/3 width) */}
              <div className="lg:col-span-1 space-y-4">
                  
                  {/* Search Bar (Compact) */}
                  <div className="bg-zinc-900/30 p-3 rounded-2xl border border-white/5 backdrop-blur-sm">
                       <div className="relative w-full group">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-hover:text-pink-400 transition-colors" />
                          <input 
                            type="text" 
                            placeholder="Search History..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-all placeholder:text-slate-600"
                          />
                       </div>
                  </div>

                  {/* List Container - Scrollable on desktop? Or just limited items */}
                  <div className="space-y-3">
                      <div className="flex items-center justify-between px-2">
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recent Scans</span>
                          <Badge variant="secondary" className="bg-white/5 text-[10px] text-slate-400">{filteredSessions.length}</Badge>
                      </div>

                      <AnimatePresence>
                          {filteredSessions.length === 0 ? (
                              <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12 bg-zinc-900/30 rounded-2xl border border-white/5"
                              >
                                 <Search className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                 <p className="text-sm text-slate-500">No sessions found</p>
                              </motion.div>
                          ) : (
                              filteredSessions.slice(0, 6).map((session, idx) => ( // Show fewer items directly, maybe add 'View All'
                                  <motion.div 
                                      key={session.id} 
                                      initial={{ opacity: 0, x: 20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: idx * 0.05 }}
                                      onClick={() => navigate(`/face-landmark-session/${session.id}`)}
                                      className="group bg-zinc-900/40 hover:bg-zinc-800/60 border border-white/5 hover:border-pink-500/20 rounded-xl p-3 cursor-pointer backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
                                  >
                                      <div className="flex items-center justify-between gap-3">
                                          <div className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400 group-hover:scale-105 transition-transform">
                                                  <ScanFace className="w-5 h-5" />
                                              </div>
                                              <div>
                                                  <div className="flex items-center gap-2">
                                                      <span className="font-bold text-white text-sm">Face Mesh</span>
                                                      <span className="text-[10px] text-slate-500 font-mono">#{session.id.substr(0,4)}</span>
                                                  </div>
                                                  <div className="text-[10px] text-slate-500 mt-0.5">
                                                      {formatDate(session.startTime).split(',')[0]} • {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                  </div>
                                              </div>
                                          </div>
                                          
                                          <div className="flex flex-col items-end">
                                               {session.detections && session.detections[0]?.score ? (
                                                  <Badge variant="outline" className={`h-5 text-[10px] border-0 ${session.detections[0].score > 80 ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                                      {session.detections[0].score}%
                                                  </Badge>
                                              ) : <span className="text-[10px] text-slate-600">--</span>}
                                              <div className="flex items-center gap-1 mt-1 text-[10px] text-blue-400">
                                                  <Users className="w-3 h-3" />
                                                  <span>{session.detections ? session.detections.reduce((acc, d) => acc + (d.faceCount || 1), 0) : 0}</span>
                                              </div>
                                          </div>
                                      </div>
                                  </motion.div>
                              ))
                          )}
                      </AnimatePresence>
                      
                      {filteredSessions.length > 6 && (
                          <Button variant="ghost" className="w-full text-xs text-slate-500 hover:text-white mt-2" onClick={() => setVisibleCount(c => c + 5)}>
                              View More
                          </Button>
                      )}
                  </div>
              </div>
          </div>

      </main>
    </div>
  );
};

export default FaceLandmarkDashboard;
