import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Brain, Cpu, Activity, Lock, Share2, ScanFace, Hand, PersonStanding, Type, Image as ImageIcon } from 'lucide-react';

const FEATURE_DATA = [
  {
    icon: Zap,
    title: "Zero Latency",
    description: "Real-time facial analysis with 486 3D landmarks relative to the human face.",
    color: "from-red-400 to-orange-500"
  },
  {
    icon: ScanFace,
    title: "Face Detection",
    description: "Real-time facial analysis with 486 3D landmarks relative to the human face.",
    color: "from-purple-400 to-indigo-500"
  },
  {
    icon: Hand,
    title: "Gesture Control",
    description: "Precise hand tracking with 21 3D landmarks for sign language and AR.",
    color: "from-blue-400 to-indigo-500"
  },
  {
    icon: PersonStanding,
    title: "Motion Analytics",
    description: "Full-body pose estimation using MoveNet for fitness and movement analysis.",
    color: "from-green-400 to-emerald-500"
  },
  {
    icon: Type,
    title: "Text Recognition",
    description: "Instant OCR scanning to extract and digitize text from the physical world.",
    color: "from-yellow-400 to-amber-500"
  },
  {
    icon: ImageIcon,
    title: "Image Classification",
    description: "Real-time scene and object recognition powered by MobileNet.",
    color: "from-orange-400 to-red-500"
  },
  {
    icon: Activity,
    title: "Real-time Metrics",
    description: "Live detection confidence scores and performance monitoring dashboard.",
    color: "from-teal-400 to-cyan-500"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Powered by TensorFlow.js with WebGL acceleration for <10ms latency.",
    color: "from-amber-400 to-orange-500"
  }
];

const Features = () => {
  return (
    <section className="pt-32 relative z-10 overflow-hidden">
        {/* Animated Background Flow */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grid-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(168, 85, 247, 0)" />
                        <stop offset="50%" stopColor="rgba(168, 85, 247, 0.3)" />
                        <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
                    </linearGradient>
                </defs>
                <pattern id="small-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="url(#grid-grad)" strokeWidth="0.5"/>
                </pattern>
                <rect width="100%" height="100%" fill="url(#small-grid)" />
            </svg>
        </div>

      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block mb-4"
          >
              <div className="px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-xs font-mono text-primary uppercase tracking-widest">System Architecture</span>
              </div>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
          >
            Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400 text-glow">Intelligence</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto"
          >
             Next-generation computer vision running entirely in client-side Javascript.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Connecting Lines (Desktop) */}
            <div className="hidden lg:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent -translate-y-1/2 z-0">
                 <div className="absolute top-1/2 left-0 w-20 h-[3px] bg-primary blur-[2px] -translate-y-1/2 animate-flow-h" />
            </div>

          {FEATURE_DATA.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative group z-10"
            >
                <div className="absolute -inset-0.5 bg-gradient-to-b from-primary/50 to-purple-600/50 rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-500" />
                <div className="relative h-full p-8 rounded-2xl bg-black/90 border border-white/10 overflow-hidden backdrop-blur-xl">
                    
                    {/* Hover Glow Gradient */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-500`} />

                    <div className="relative z-10">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                            <div className="w-full h-full bg-black/90 rounded-[10px] flex items-center justify-center">
                                <feature.icon className="w-7 h-7 text-white" />
                            </div>
                        </div>
                        
                        <h3 className="text-xl font-bold mb-3 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all">
                            {feature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            {feature.description}
                        </p>
                    </div>

                    {/* Corner accents */}
                     <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-white/10 group-hover:bg-primary/50 transition-colors" />
                </div>
            </motion.div>
          ))}
        </div>
      </div>

       <style jsx>{`
            @keyframes flow-h {
                0% { left: 0%; opacity: 0; }
                50% { opacity: 1; }
                100% { left: 100%; opacity: 0; }
            }
            .animate-flow-h {
                animation: flow-h 3s linear infinite;
            }
        `}</style>
    </section>
  );
};

export default Features;
