import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  Target, 
  Cpu, 
  Activity, 
  Search,
  Scan,
  TrendingUp,
  Share2,
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from 'framer-motion';

// Mock Logo (Shared)
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

const SessionData = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [pieData, setPieData] = useState([]);
  const [logFilter, setLogFilter] = useState("");
  const [timelineData, setTimelineData] = useState([]);
  
  useEffect(() => {
    // Fetch session data
    const allSessions = JSON.parse(localStorage.getItem('obvix_sessions') || '[]');
    const foundSession = allSessions.find(s => s.id === id);
    
    if (foundSession) {
      setSession(foundSession);
      
      // Calculate Pie Chart Data
      const classMap = {};
      foundSession.detections.forEach(d => {
         classMap[d.label] = (classMap[d.label] || 0) + 1;
      });
      const data = Object.keys(classMap).map(key => ({
         name: key,
         value: classMap[key]
      })).sort((a,b) => b.value - a.value);
      setPieData(data);

      // Calculate Timeline Data
      // To avoid too many points, we can group or just take every Nth if massive. 
      // For now, let's take all.
      const timeData = foundSession.detections.map(d => ({
         time: new Date(d.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' }),
         score: Math.round(d.score),
         label: d.label
      }));
      setTimelineData(timeData);
    }
  }, [id]);

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
         <p className="text-slate-500 font-mono">Loading Session Data...</p>
      </div>
    );
  }

  const COLORS = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short', month: 'long', day: 'numeric', year: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
  };

  const calculateDuration = (start, end) => {
    const ms = new Date(end) - new Date(start);
    const min = Math.floor(ms / 60000);
    const sec = ((ms % 60000) / 1000).toFixed(0);
    return `${min}m ${sec}s`;
  };
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
    <div className="min-h-screen bg-black text-foreground selection:bg-primary/20 selection:text-primary pb-20 ">


       {/* Header */}
       <nav className="sticky top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
           <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" size="icon" 
                  onClick={() => navigate('/dashboard')}
                  className="rounded-full cursor-pointer hover:bg-white/10 text-muted-foreground hover:text-white"
                >
                    <ArrowLeft size={20} />
                </Button>
                
                <div className="flex flex-col">
                  <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">Session ID</span>
                  <span className="text-sm font-bold text-white font-mono">{id.slice(0, 8)}...</span>
                </div>
           </div>
     
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-8">
        
        {/* Title + Date */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 border-b border-white/10 pb-6">
           <div>
              <div className="flex items-center gap-2 mb-2">
                 <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                    COMPLETED
                 </Badge>
                 <span className="text-slate-500 text-sm font-mono">{formatDate(session.startTime)}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Session Report</h1>
           </div>
           
           <div className="flex items-center gap-6 mt-4 sm:mt-0">
              <div className="flex flex-col items-end">
                 <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Start Time</span>
                 <span className="text-lg font-mono text-white flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    {formatTime(session.startTime)}
                 </span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Duration</span>
                  <span className="text-lg font-mono text-white">
                     {calculateDuration(session.startTime, session.endTime)}
                  </span>
              </div>
           </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           
           {/* Left Column: Stats & Charts */}
           <div className="lg:col-span-2 space-y-6">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-blue-500/5 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-sm group"
                  >
                      <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                         <Target className="w-12 h-12 text-purple-500/20" />
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400">
                             <Target className="w-5 h-5" />
                         </div>
                         <h3 className="text-sm font-medium text-slate-300">Total Detections</h3>
                      </div>
                      <div className="flex items-baseline gap-2 mt-4">
                          <span className="text-4xl font-bold text-white tracking-tight">{session.detectionCount}</span>
                          <span className="text-xs text-purple-400 font-mono">+ Objects</span>
                      </div>
                  </motion.div>

                  <motion.div 
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.1 }}
                     className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-6 backdrop-blur-sm group"
                  >
                      <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                         <Activity className="w-12 h-12 text-emerald-500/20" />
                      </div>
                      <div className="flex items-center gap-3 mb-2">
                         <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                             <Activity className="w-5 h-5" />
                         </div>
                         <h3 className="text-sm font-medium text-slate-300">Confidence Score</h3>
                      </div>
                      <div className="flex items-baseline gap-2 mt-4">
                          <span className="text-4xl font-bold text-white tracking-tight">
                              {Math.round(session.detections.reduce((acc, c) => acc + c.score, 0) / session.detections.length || 0)}%
                          </span>
                          <span className="text-xs text-emerald-400 font-mono">Average</span>
                      </div>
                  </motion.div>
              </div>

              {/* Confidence Trend Chart (Area) */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden">
                 <div className="flex items-center justify-between mb-6">
                     <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                         <Activity className="w-5 h-5 text-blue-400" />
                         Confidence Timeline
                     </h3>
                     <Badge variant="outline" className="border-blue-500/30 text-blue-400 bg-blue-500/5">Session Performance</Badge>
                 </div>
                 <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                             <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                          <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} minTickGap={30} />
                          <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={[0, 100]} />
                          <RechartsTooltip content={<DarkTooltip />} />
                          <Area 
                              type="monotone" 
                              dataKey="score" 
                              stroke="#3b82f6" 
                              strokeWidth={2} 
                              fillOpacity={1} 
                              fill="url(#colorScore)" 
                          />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Class Distribution Chart */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm min-h-[300px]">
                  <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                     <TrendingUp className="w-5 h-5 text-purple-400" />
                     Detection Distribution
                  </h3>
                   <div className="h-[300px] w-full flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                         <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <RechartsTooltip content={<DarkTooltip />} />

                            <Legend 
                                verticalAlign="bottom" 
                                align="center" 
                                layout="horizontal" 
                                iconType="circle"
                                wrapperStyle={{ paddingTop: '20px' }}
                            />
                         </PieChart>
                      </ResponsiveContainer>
                   </div>
              </div>

           </div>

           {/* Right Column: Detailed Log */}
           <div className="lg:col-span-1">
              <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm flex flex-col h-full max-h-[600px]">
                 <div className="p-4 border-b border-white/5 bg-black/20">
                    <h3 className="font-bold text-white flex items-center gap-2">
                       <Scan className="w-4 h-4 text-primary" /> Event Log
                    </h3>
                 </div>
                 
                 <div className="p-2 border-b border-white/5">
                    <div className="relative">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                       <input 
                         type="text" 
                         placeholder="Filter objects..."
                         value={logFilter}
                         onChange={(e) => setLogFilter(e.target.value)}
                         className="w-full bg-black/20 border border-white/5 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-primary/50 transition-colors"
                       />
                    </div>
                 </div>

                 <ScrollArea className="h-100">
                    <div className="flex flex-col">
                       {session.detections.filter(d => d.label.toLowerCase().includes(logFilter.toLowerCase())).map(( detection, idx ) => (
                          <div key={idx} className="p-4 border-b border-white/5 hover:bg-white/5 transition-colors group">
                             <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                                   {detection.label}
                                </span>
                                <span className="text-xs bg-white/5 px-2 py-0.5 rounded text-slate-400 font-mono">
                                   {formatTime(detection.timestamp)}
                                </span>
                             </div>
                             <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center gap-2 flex-1 mr-4">
                                   <div className="h-1.5 w-full max-w-[100px] bg-white/10 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500" 
                                        style={{ width: `${detection.score || 0}%` }}
                                      />
                                   </div>
                                   <span className="text-xs text-slate-400">{(detection.score || 0).toFixed(1)}%</span>
                                </div>
                                <span className="text-[10px] text-slate-600 font-mono uppercase tracking-widest">
                                   ID: {detection.id ? detection.id.slice(0, 4) : '---'}
                                </span>
                             </div>
                          </div>
                       ))}
                       {session.detections.filter(d => d.label.toLowerCase().includes(logFilter.toLowerCase())).length === 0 && (
                          <div className="p-8 text-center text-slate-500 text-sm">
                             No detections match filter.
                          </div>
                       )}
                    </div>
                 </ScrollArea>
              </div>
           </div>
        </div>

      </main>
    </div>
  )
}

export default SessionData
