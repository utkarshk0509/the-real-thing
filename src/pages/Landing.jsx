import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MoveDown } from 'lucide-react';

import moonImg from '../assets/moon.png';
import mountainsImg from '../assets/mountains.png';

export default function Landing() {
  const navigate = useNavigate();

  const stars = useMemo(() => {
    return Array.from({ length: 80 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 65}%`, left: `${Math.random() * 100}%`,
      size: `${Math.random() * 2 + 1}px`, delay: Math.random() * 4, duration: Math.random() * 3 + 2,
    }));
  }, []);

  return (
    <motion.div 
      className="absolute inset-0 min-h-screen w-full overflow-hidden bg-background flex flex-col items-center justify-between z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)", transition: { duration: 0.8 } }} // Everything fades naturally
    >
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(213,176,108,0.03)_0%,transparent_100%)] pointer-events-none" />
      
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <motion.div key={star.id} className="absolute bg-white rounded-full" style={{ top: star.top, left: star.left, width: star.size, height: star.size }} animate={{ opacity: [0.1, 0.8, 0.1] }} transition={{ duration: star.duration, repeat: Infinity, delay: star.delay, ease: "easeInOut" }} />
        ))}
      </div>

      <motion.nav initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }} className="absolute top-12 w-full flex justify-center gap-8 text-textMuted font-sans text-[11px] uppercase tracking-[0.35em] z-20">
        <span className="hover:text-gold transition-colors cursor-pointer">Home</span><span className="opacity-30">|</span>
        <span className="hover:text-gold transition-colors cursor-pointer">Poems</span><span className="opacity-30">|</span>
        <span className="hover:text-gold transition-colors cursor-pointer">Stories</span><span className="opacity-30">|</span>
        <span className="hover:text-gold transition-colors cursor-pointer">About</span>
      </motion.nav>

      <motion.img src={moonImg} alt="Moon" initial={{ opacity: 0 }} animate={{ opacity: 0.85, x: [-5, 5] }} transition={{ opacity: { duration: 2, delay: 0.3 }, x: { duration: 40, repeat: Infinity, repeatType: "reverse", ease: "linear" } }} className="absolute top-[8%] right-[10%] w-[250px] object-contain mix-blend-screen z-0 pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 0.8, y: 0 }} transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }} className="absolute bottom-0 left-0 w-full h-[40vh] z-0 pointer-events-none">
        <img src={mountainsImg} alt="Mountains" className="w-full h-full object-cover object-bottom [mask-image:linear-gradient(to_bottom,transparent_0%,black_20%)]" />
      </motion.div>

      <motion.div className="relative z-10 flex flex-col items-center text-center mt-[22vh]" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
        <motion.h1 initial={{ filter: "blur(8px)" }} animate={{ filter: "blur(0px)" }} transition={{ duration: 1.2, ease: "easeOut" }} className="font-serif text-landing-hero font-medium text-textPrimary tracking-wide mb-8">The Real Thing</motion.h1>
        <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: "easeOut", delay: 0.3 }} className="font-sans text-textSecondary text-landing-subtitle max-w-[500px] leading-relaxed">Not every story asks to be remembered.<br/>Some only ask to be felt.</motion.p>
      </motion.div>

      <div className="absolute bottom-16 w-full flex flex-col items-center z-50">
        <div className="flex flex-col items-center cursor-pointer group" onClick={() => navigate('/hub')}>
          <span className="font-sans text-textSecondary text-[11px] uppercase tracking-[0.35em] mb-4 group-hover:text-gold transition-colors">Begin Reading</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }} className="text-textSecondary group-hover:text-gold transition-colors mb-4">
            <MoveDown size={14} strokeWidth={1.5} />
          </motion.div>
        </div>
        
        <div className="relative w-full flex justify-center items-center mt-2">
          <div className="absolute w-[60%] h-[1px] bg-gradient-to-r from-transparent via-borderSoft to-transparent z-0" />
          
          {/* PLACEHOLDER: The GlobalCompass floats perfectly over this empty space */}
          <div className="w-[120px] h-[120px]" />
          
        </div>
      </div>
    </motion.div>
  );
}