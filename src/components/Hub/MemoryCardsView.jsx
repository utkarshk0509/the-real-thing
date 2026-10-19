import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

const MEMORY_ROTATIONS = [-1.5, 1.2, -0.8, 1.6, -1.2, 0.9, -1.8, 1.4];

export const MemoryCardsView = ({ works, onSelectWork }) => {
  if (!works || works.length === 0) return null;

  return (
    <div className="py-6 select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
        {works.map((poem, idx) => {
          const rotation = MEMORY_ROTATIONS[idx % MEMORY_ROTATIONS.length];
          const excerpt = poem.excerpt
            ? poem.excerpt.replace(/\n+/g, ' ').slice(0, 75)
            : 'I became the thing I was afraid of...';

          return (
            <motion.div
              key={poem.slug || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -6, rotate: 0, scale: 1.02 }}
              onClick={() => onSelectWork(poem)}
              style={{ rotate: `${rotation}deg` }}
              className="relative bg-[#E8DFC8]/90 text-[#2B2620] rounded-sm p-6 shadow-[0_12px_30px_rgba(0,0,0,0.7)] border border-[#C5BAA2] cursor-pointer group flex flex-col justify-between min-h-[300px]"
            >
              {/* Masking Tape effect at top center */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-[#F4ECD8]/75 backdrop-blur-xs shadow-xs rotate-[-1deg] border border-[#D5CAA8]/40" />

              <div>
                {/* Header: Polaroid / photo slot and info */}
                <div className="flex items-start gap-4">
                  {poem.image_url ? (
                    <div className="w-16 h-16 rounded-xs overflow-hidden border-2 border-white/80 shadow-inner flex-shrink-0">
                      <img
                        src={poem.image_url}
                        alt=""
                        className="w-full h-full object-cover grayscale contrast-125 group-hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xs bg-[#D5CAA8]/60 border-2 border-white/80 flex items-center justify-center flex-shrink-0 text-xl font-serif">
                      ✧
                    </div>
                  )}

                  <div className="space-y-0.5">
                    <h3 className="font-serif text-lg md:text-xl font-semibold text-[#1F1B16] leading-tight group-hover:text-[#8A682C] transition-colors">
                      {poem.title}
                    </h3>
                    <span className="block font-sans text-[10px] uppercase tracking-widest text-[#6B6154]">
                      {new Date(poem.published_at || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Handwritten Memory Fragment */}
                <div className="mt-6 pt-4 border-t border-[#D5CAA8]/60">
                  <p className="font-serif italic text-sm text-[#3E3830] leading-relaxed">
                    "{excerpt}..."
                  </p>
                </div>
              </div>

              {/* Bottom Read Action */}
              <div className="mt-6 pt-3 flex items-center justify-between border-t border-[#D5CAA8]/40">
                <span className="font-serif text-xs text-[#8A7A66] italic">
                  By {poem.author || 'UTKARSH'}
                </span>
                <span className="inline-flex items-center gap-1 font-serif text-sm text-[#8A682C] group-hover:translate-x-1 transition-transform font-medium">
                  <span>Read</span>
                  <span>→</span>
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MemoryCardsView;
