import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navigation from '../components/Shared/Navigation';
import AtmosphericBackground from '../components/Shared/AtmosphericBackground';

export const HomeConstellation = () => {
  const navigate = useNavigate();
  const [hoveredNode, setHoveredNode] = useState(null);

  const constellationNodes = [
    { id: 'poems', label: 'Poems', description: 'Explore lyrical verses and rhythmic expressions', route: '/poems', top: '45%', left: '28%' },
    { id: 'stories', label: 'Stories', description: 'Immerse in narrative prose and deep tales', route: '/stories', top: '60%', left: '72%' },
    { id: 'about', label: 'About the Author', description: 'Discover the heart behind the sanctuary', route: '/about', top: '75%', left: '48%' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(8px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(8px)' }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative min-h-screen w-full bg-[#080A06] text-[#FEEFFF] overflow-hidden select-none"
    >
      <AtmosphericBackground />
      <Navigation />

      {/* Increased top padding (pt-40 md:pt-48) to completely prevent header collision */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 pt-40 md:pt-48 pb-16">
        <div className="text-center space-y-2 z-20 mb-8">
          <h1 className="font-serif text-3xl md:text-4xl text-[#FEEFFF] tracking-widest font-light">
            The Constellation Archive
          </h1>
          <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-[#8A8177]">
            Click any cosmic coordinate to navigate the sanctuary
          </p>
        </div>

        <div className="relative w-full max-w-5xl h-[50vh]">
          {constellationNodes.map((node, index) => {
            const isHovered = hoveredNode === node.id;

            return (
              <div
                key={node.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-30"
                style={{ top: node.top, left: node.left }}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => navigate(node.route)}
              >
                <motion.div
                  animate={{
                    scale: isHovered ? [1, 1.5, 1.3] : [1, 1.25, 1],
                    opacity: 1,
                  }}
                  transition={{
                    duration: isHovered ? 0.4 : 2.5 + index,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  className={`relative rounded-full flex items-center justify-center transition-all ${
                    isHovered
                      ? 'w-9 h-9 bg-[#D5B06C] shadow-[0_0_40px_#D5B06C,0_0_15px_#FEEFFF]'
                      : 'w-6 h-6 bg-[#FEEFFF] shadow-[0_0_25px_#D5B06C,0_0_10px_rgba(254,239,255,0.9)] border border-[#D5B06C]'
                  }`}
                >
                  <div className="absolute w-2 h-2 bg-[#080A06] rounded-full" />
                </motion.div>

                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-1/2 transform -translate-x-1/2 bottom-14 w-max bg-[#0F1216]/95 border border-[#D5B06C]/50 px-8 py-5 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.9)] backdrop-blur-md pointer-events-none z-50 text-center space-y-2"
                    >
                      <h3 className="font-serif text-xl text-[#D5B06C] tracking-wider whitespace-nowrap">
                        {node.label}
                      </h3>
                      <p className="font-sans text-xs text-[#8A8177] whitespace-nowrap">
                        {node.description}
                      </p>
                      <div className="pt-2">
                        <span className="font-sans text-[10px] uppercase tracking-[0.2em] text-[#FEEFFF] whitespace-nowrap">
                          Explore Sanctuary →
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </main>
    </motion.div>
  );
};

export default HomeConstellation;