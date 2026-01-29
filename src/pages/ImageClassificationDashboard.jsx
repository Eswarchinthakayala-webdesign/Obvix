import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  ArrowLeft, 
  Database, 
  Trash2, 
  ChevronRight,
  TrendingUp,
  Activity,
  Calendar,
  Grid,
  Search,
  ImageIcon,
  Tag
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const ImageClassificationDashboard = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);
  const [stats, setStats] = useState({
    totalImages: 0,
    uniqueClasses: 0,
    avgConfidence: 0,
    classDistribution: [],
    recentActivity: []
  });

  useEffect(() => {
    // Load sessions
    const allSessions = JSON.parse(localStorage.getItem('obvix_sessions') || '[]');
    // Filter for image_classification types
    // Since we save detections into sessions, we need to iterate sessions and check their type
    // In our logic in ImageClassification.jsx, we create a session with type 'image_classification'
    const imageSessions = allSessions.filter(s => s.type === 'image_classification');
    
    // BUT wait, in ImageClassification.jsx we are pushing *detections*.
    // And users might visit multiple times (multiple sessions). 
    // We want to list all *detections* effectively as "Uploads" for the dashboard list?
    // Or list "Sessions"? 
    // If a user uploads 5 images in 1 session, showing the SESSION is cleaner.
    // If we view session, we see 5 images.
    
    setSessions(imageSessions);

    if (imageSessions.length > 0) {
       let totalImages = 0;
       let totalConf = 0;
       let confCount = 0;
       const classMap = {};

       imageSessions.forEach(session => {
           if(session.detections) {
               totalImages += session.detections.length;
               session.detections.forEach(d => {
                   if(d.score) {
                       totalConf += d.score;
                       confCount++;
                   }
                   if(d.label) {
                       // Clean label (first part before comma)
                       const mainLabel = d.label.split(',')[0].trim();
                       classMap[mainLabel] = (classMap[mainLabel] || 0) + 1;
                   }
               });
           }
       });

       const sortedClasses = Object.keys(classMap).map(k => ({
           name: k,
           count: classMap[k]
       })).sort((a,b) => b.count - a.count).slice(0, 10);

       setStats({
           totalImages,
           uniqueClasses: Object.keys(classMap).length,
           avgConfidence: confCount > 0 ? Math.round(totalConf / confCount) : 0,
           classDistribution: sortedClasses
       });
    }
  }, []);

  const clearData = () => {
      const allSessions = JSON.parse(localStorage.getItem('obvix_sessions') || '[]');
      const kept = allSessions.filter(s => s.type !== 'image_classification');
      localStorage.setItem('obvix_sessions', JSON.stringify(kept));
      setSessions([]);
      setStats({ totalImages: 0, uniqueClasses: 0, avgConfidence: 0, classDistribution: [], recentActivity: [] });
      toast.success("Image classification history cleared");
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
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

  const COLORS = ['#f97316', '#eab308', '#84cc16', '#22c55e', '#3b82f6'];

  return (
    <div className="min-h-screen bg-black text-foreground selection:bg-orange-500/30 font-sans pb-20">
      
      <nav className="sticky top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
             <div className="flex items-center ">
                         <Button variant="ghost" size="icon" onClick={() => navigate('/image-classification')} className="hover:bg-white/10 text-white rounded-full">
                             <ArrowLeft className="w-5 h-5" />
                         </Button>
                         <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                              <div className="relative flex items-center justify-center transition-transform group-hover:scale-105 duration-300">
                                  <ObvixLogo className="w-8 h-8 text-orange-500" />
                              </div>
                              <span className="text-lg font-bold tracking-tight text-white leading-none hidden sm:block">Obvix</span>
                          </div>
             </div>
           
           <div className="flex items-center gap-3">
              <Button onClick={() => navigate('/image-classification')} className="flex rounded-full bg-orange-500 hover:bg-orange-600 text-black font-bold transition-all hover:scale-105">
                 <ImageIcon className="w-4 h-4" />
                <span className='hidden sm:block'>New Analysis</span> 
              </Button>
           </div>
        </div>
      </nav>

      <main className="relative z-10 container mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
              <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-2">
                      Classification History
                  </h1>
                  <p className="text-slate-400 text-sm sm:text-base max-w-xl">
                      Review analyzed images and identified objects.
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
                        <AlertDialogTitle>Clear Image History?</AlertDialogTitle>
                        <AlertDialogDescription className="text-zinc-400">
                          This will permanently remove all saved image classification sessions.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="bg-transparent border-white/10 text-white hover:bg-white/10 hover:text-white">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={clearData} className="bg-red-600 hover:bg-red-700 text-white border-none">Delete All</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
              </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-orange-500/10 text-orange-500">
                          <ImageIcon className="w-5 h-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-orange-500/30 text-orange-500 bg-orange-500/5">Lifetime</Badge>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-3xl font-bold text-white tracking-tight">
                          {stats.totalImages}
                      </span>
                      <span className="text-xs text-slate-400 mt-1 font-medium">Images Analyzed</span>
                  </div>
              </div>

               <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                          <Tag className="w-5 h-5" />
                      </div>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-3xl font-bold text-white tracking-tight">
                          {stats.uniqueClasses}
                      </span>
                      <span className="text-xs text-slate-400 mt-1 font-medium">Unique Objects</span>
                  </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                          <Activity className="w-5 h-5" />
                      </div>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-3xl font-bold text-white tracking-tight">
                          {stats.avgConfidence}%
                      </span>
                      <span className="text-xs text-slate-400 mt-1 font-medium">Avg. Confidence</span>
                  </div>
              </div>
              
              {/* Top Category */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-sm">
                  <div className="flex justify-between items-start mb-4">
                      <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                          <TrendingUp className="w-5 h-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-purple-500/30 text-purple-400 bg-purple-500/5">Frequent</Badge>
                  </div>
                  <div className="flex flex-col">
                      <span className="text-2xl font-bold text-white tracking-tight truncate capitalize">
                          {stats.classDistribution.length > 0 ? stats.classDistribution[0].name : 'N/A'}
                      </span>
                      <span className="text-xs text-slate-400 mt-1 font-medium">Top Detected</span>
                  </div>
              </div>
          </div>
          
           {/* Charts */}
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                   <h3 className="text-lg font-bold text-white mb-6">Object Distribution</h3>
                   <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.classDistribution}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                              <Tooltip 
                                  contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '8px', color: '#fff' }}
                                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                              />
                              <Bar dataKey="count" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
                          </BarChart>
                      </ResponsiveContainer>
                  </div>
              </div>
              
              <div className="lg:col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                   <h3 className="text-lg font-bold text-white mb-6">Analysis Share</h3>
                   <div className="h-[300px] w-full">
                       <ResponsiveContainer width="100%" height="100%">
                           <PieChart>
                               <Pie
                                   data={stats.classDistribution.slice(0, 5)}
                                   cx="50%"
                                   cy="50%"
                                   innerRadius={60}
                                   outerRadius={80}
                                   paddingAngle={5}
                                   dataKey="count"
                               >
                                   {stats.classDistribution.slice(0, 5).map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                   ))}
                               </Pie>
                               <Tooltip content={<DarkTooltip />} />
                           </PieChart>
                       </ResponsiveContainer>
                   </div>
              </div>
           </div>

          {/* Session List */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex flex-col">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                 <h3 className="text-lg font-bold text-white">Recent Upload Sessions</h3>
                 
                 <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Search objects..." 
                      value={searchQuery}
                      onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setVisibleCount(8); 
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors"
                    />
                 </div>
              </div>
              
              {(() => {
                  const filtered = sessions.filter(s => {
                      const q = searchQuery.toLowerCase();
                      const hasLabel = s.detections && s.detections.some(d => d.label.toLowerCase().includes(q));
                      const dateMatch = new Date(s.startTime).toLocaleDateString().includes(q);
                      return hasLabel || dateMatch || s.id.includes(q);
                  });
                  const display = filtered.slice(0, visibleCount);

                  return (
                    <div className="flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b border-white/10 text-slate-500 font-mono text-xs uppercase tracking-wider">
                                        <th className="pb-4 pl-2 font-medium">Session</th>
                                        <th className="pb-4 font-medium">Images</th>
                                        <th className="pb-4 font-medium">Top Detection</th>
                                        <th className="pb-4 text-right pr-2 font-medium">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-slate-300">
                                    {display.map((s, idx) => (
                                        <motion.tr 
                                            key={s.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => navigate(`/image-session/${s.id}`)}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                                        >
                                            <td className="py-4 pl-2">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-white font-mono">{s.id.slice(0,8)}</span>
                                                    <span className="text-[10px] text-slate-500">{formatDate(s.startTime)}</span>
                                                </div>
                                            </td>
                                            <td className="py-4">
                                                <Badge variant="secondary" className="bg-white/5 text-slate-300">
                                                    {s.detections ? s.detections.length : 0} Items
                                                </Badge>
                                            </td>
                                            <td className="py-4">
                                                {s.detections && s.detections.length > 0 ? (
                                                    <span className="capitalize">{s.detections[0].label.split(',')[0]}</span>
                                                ) : (
                                                    <span className="text-slate-500 italic">No data</span>
                                                )}
                                            </td>
                                            <td className="py-4 text-right pr-2">
                                                 <ChevronRight className="w-4 h-4 ml-auto text-slate-500 group-hover:text-white" />
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                             {filtered.length === 0 && (
                                <div className="py-12 text-center text-slate-500">
                                    No sessions found.
                                </div>
                             )}
                        </div>
                        
                        {filtered.length > visibleCount && (
                            <div className="mt-4 flex justify-center border-t border-white/5 pt-4">
                               <Button variant="ghost" onClick={() => setVisibleCount(p => p+8)} className="text-slate-400">Load More</Button>
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

export default ImageClassificationDashboard;
