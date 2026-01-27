import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue } from 'framer-motion';
import { Button } from "@/components/ui/button"; 
import { ArrowRight, ScanEye, Box, Cpu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {

    const navigate=useNavigate()
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    
    // Mouse Tilt Effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["20deg", "-20deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-20deg", "20deg"]);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;
        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <section className="relative bg-black min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-12 perspective-[2000px]">
             {/* Grid Background */}
             
            
            {/* Aurora Effect */}
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(0, 0, 0, 0.76),transparent_50%)] animate-aurora mix-blend-screen filter blur-[100px]" />
            </div>

            <div className="container mx-auto px-4 sm:px-6 relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                
                {/* Text Content */}
                <div className="text-center lg:text-left order-2 lg:order-1 flex flex-col items-center lg:items-start">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-lg mb-6 border-primary/20 bg-primary/5"
                    >
                        <Cpu className="w-4 h-4 text-primary animate-pulse" />
                        <span className="text-[10px] sm:text-sm font-medium tracking-wide text-primary uppercase">
                            Neural Engine
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
                    >
                        Object <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-zinc-400 to-indigo-500 text-glow">
                             Detection
                        </span>
                        <br /> Reinvented.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed px-4 lg:px-0"
                    >
                         State-of-the-art computer vision completely in your browser. 
                         Zero latency. 100% Privacy. Powered by TensorFlow.js.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start w-full sm:w-auto px-4 sm:px-0"
                    >
                         <Button onClick={()=>navigate('/start-detection')} className="rounded-full cursor-pointer text-lg h-14 px-8 shadow-[0_0_30px_-5px_var(--color-primary)] hover:shadow-[0_0_50px_-5px_var(--color-primary)] transition-shadow duration-500 bg-primary text-primary-foreground w-full sm:w-auto">
                            Start Detection
                            <ArrowRight className="ml-2 w-5 h-5" />
                         </Button>
                         <Button onClick={()=>navigate('/docs')} variant="outline"  className="rounded-full  cursor-pointer text-lg h-14 px-8 border-primary/20 hover:bg-primary/5 backdrop-blur-sm w-full sm:w-auto">
                            View Documentation
                         </Button>
                    </motion.div>
                </div>

                {/* 3D Interactive Visual */}
                <div 
                    className="relative order-1 lg:order-2 h-[350px] sm:h-[500px] flex items-center justify-center perspective-[1000px] cursor-pointer w-full"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                >
                     <motion.div 
                        style={{ 
                            y: y1, 
                            rotateX, 
                            rotateY,
                            transformStyle: "preserve-3d",
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="relative z-10 w-full max-w-[280px] sm:max-w-md aspect-square"
                     >
                        {/* Layer 1: Base Glow */}
                        <div 
                            className="absolute inset-4 rounded-[2.5rem] bg-gradient-to-tr from-primary/30 to-zinc-600/30 blur-2xl -z-10 animate-pulse" 
                            style={{ transform: "translateZ(-50px)" }}
                        />

                        {/* Layer 2: Main Glass Card */}
                        <div 
                            className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/0 rounded-[2rem] border border-white/20 backdrop-blur-md shadow-2xl"
                            style={{ transform: "translateZ(0px)" }}
                        >
                             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay rounded-[2rem]" />
                             {/* Inner Grid */}
                             <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] rounded-[2rem]" />
                        </div>
                        
                        {/* Layer 3: Floating Stats (Pop out more) */}
                        <motion.div 
                             style={{ transform: "translateZ(60px)" }}
                             className="absolute top-8 -right-4 sm:top-12 sm:-right-6 p-3 sm:p-4 rounded-xl glass-panel border border-white/20 shadow-xl"
                        >
                            <Box className="w-6 h-6 sm:w-8 sm:h-8 text-primary mb-2" />
                            <div className="h-1 w-10 sm:w-12 bg-primary/30 rounded-full overflow-hidden">
                                <div className="h-full w-[98%] bg-primary" />
                            </div>
                            <div className="mt-2 text-[10px] sm:text-xs font-mono text-muted-foreground flex justify-between gap-2 sm:gap-4">
                                <span>CONFIDENCE</span>
                                <span className="text-primary">99.8%</span>
                            </div>
                        </motion.div>

                         <motion.div 
                             style={{ transform: "translateZ(80px)" }}
                             className="absolute bottom-12 -left-4 sm:bottom-16 sm:-left-6 p-3 sm:p-4 rounded-xl glass-panel border border-white/20 shadow-xl"
                        >
                            <ScanEye className="w-6 h-6 sm:w-8 sm:h-8 text-secondary mb-2" />
                            <div className="text-[10px] sm:text-xs font-mono text-muted-foreground">
                                TRACKING_ID: <span className="text-secondary">#AF01</span>
                            </div>
                        </motion.div>

                        {/* Layer 4: Central Holographic Core */}
                        <div 
                            className="absolute inset-[15%] rounded-full border border-white/10 bg-black/40 flex items-center justify-center shadow-[inset_0_0_40px_rgba(168,85,247,0.2)]"
                            style={{ transform: "translateZ(40px)" }}
                        >
                             <div className="absolute inset-0 rounded-full border border-primary/30 animate-[spin_8s_linear_infinite]" />
                             <div className="absolute inset-4 rounded-full border border-dashed border-secondary/40 animate-[spin_12s_linear_infinite_reverse]" />
                             
                             {/* Central Glowing Orb */}
                             <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-zinc-500 blur-md animate-pulse" />
                             <div className="absolute w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/50 blur-sm mix-blend-overlay" />
                        </div>
                     </motion.div>
                </div>
            </div>
            
        </section>
    );
};

export default Hero;

