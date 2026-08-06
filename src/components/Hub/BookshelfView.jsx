import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { readerProgressService } from '../../services/readerProgressService';

export const BookshelfView = ({ works, onSelectWork }) => {
  const allProgress = readerProgressService.getAllProgress();

  if (!works || works.length === 0) {
    return (
      <div className="text-center py-20 text-[#8A8177]">
        <p className="font-serif text-xl italic">The archives are quiet. No books rest on this shelf.</p>
      </div>
    );
  }

  const BOOKS_PER_SHELF = 5;
  const shelfRows = [];
  for (let i = 0; i < works.length; i += BOOKS_PER_SHELF) {
    const rowChunk = works.slice(i, i + BOOKS_PER_SHELF);
    if (rowChunk && rowChunk.length > 0) {
      shelfRows.push(rowChunk);
    }
  }

  const heightClasses = [
    'h-52 md:h-76',
    'h-56 md:h-80',
    'h-48 md:h-72',
    'h-60 md:h-84',
    'h-52 md:h-76',
  ];

  const tiltAngles = [-2, 1.5, -1, 2, -1.5];

  return (
    <div className="space-y-16 py-8 select-none relative">
      <AnimatePresence>
        {shelfRows.map((row, rowIndex) => (
          <motion.div
            key={`shelf-row-${rowIndex}`}
            layout
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative pt-12"
          >
            <div className="absolute left-0 bottom-4 top-12 w-3 md:w-4 rounded-t-sm bg-gradient-to-r from-[#D5B06C] via-[#FEEFFF] to-[#B5904C] shadow-[0_0_15px_rgba(213,176,108,0.4)] z-20 border-r border-[#080A06]" />
            <div className="absolute right-0 bottom-4 top-12 w-3 md:w-4 rounded-t-sm bg-gradient-to-l from-[#D5B06C] via-[#FEEFFF] to-[#B5904C] shadow-[0_0_15px_rgba(213,176,108,0.4)] z-20 border-l border-[#080A06]" />

            <div className="flex items-end justify-start gap-3 md:gap-8 px-4 md:px-12 pb-3 min-h-[250px] md:min-h-[320px] overflow-x-auto perspective-1000">
              {row.map((work, idx) => {
                const bookHeightClass = heightClasses[idx % heightClasses.length];
                const restingTilt = tiltAngles[idx % tiltAngles.length];
                const progress = allProgress[work.slug] || 0;

                return (
                  <motion.div
                    key={work.slug || work.id || idx}
                    layout
                    initial={{ rotateZ: restingTilt, opacity: 0, scale: 0.9 }}
                    animate={{ rotateZ: restingTilt, opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{
                      y: -24,
                      scale: 1.08,
                      rotateZ: 0,
                      rotateY: -15,
                      z: 30,
                    }}
                    transition={{ type: 'spring', stiffness: 260, damping: 22 }}
                    onClick={() => onSelectWork(work)}
                    className="group relative flex-shrink-0 cursor-pointer"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    <div className="absolute -bottom-4 left-4 md:left-6 w-2 md:w-2.5 h-5 md:h-6 bg-gradient-to-b from-[#D5B06C] to-[#8A682C] rounded-b-xs shadow-md z-30 transition-transform duration-300 group-hover:translate-y-2" />

                    <div
                      className={`relative w-28 md:w-44 ${bookHeightClass} rounded-r-md rounded-l-xs overflow-hidden bg-[#0F1216] border-t border-r border-b border-[#D5B06C]/30 shadow-[8px_12px_25px_rgba(0,0,0,0.85)] group-hover:border-[#D5B06C] group-hover:shadow-[0_20px_40px_rgba(213,176,108,0.35)] transition-all duration-300`}
                    >
                      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#D9D0C1] via-[#F2E8D9] to-[#C9C0B1] border-b border-black/60 z-30 shadow-inner" />

                      <div className="absolute left-0 top-0 bottom-0 w-3 md:w-4 bg-gradient-to-r from-black/90 via-[#1A1E24] to-transparent border-r border-white/10 z-30">
                        <div className="absolute top-4 left-0 right-0 h-0.5 bg-[#D5B06C]/70" />
                        <div className="absolute top-8 left-0 right-0 h-0.5 bg-[#D5B06C]/70" />
                        <div className="absolute bottom-8 left-0 right-0 h-0.5 bg-[#D5B06C]/70" />
                        <div className="absolute bottom-4 left-0 right-0 h-0.5 bg-[#D5B06C]/70" />
                      </div>

                      {work.image_url && (
                        <img
                          src={work.image_url}
                          alt={work.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-300 grayscale group-hover:grayscale-0"
                          style={{
                            transform: `scale(${work.bookshelf_crop_scale || work.crop_scale || 1})`,
                            objectPosition: `${work.bookshelf_crop_pos_x ?? work.crop_pos_x ?? 50}% ${work.bookshelf_crop_pos_y ?? work.crop_pos_y ?? 50}%`,
                          }}
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-[#080A06] via-[#0F1216]/65 to-transparent z-10" />
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(213,176,108,0.12),transparent_70%)] z-15" />

                      <div className="relative z-20 p-4 md:p-5 h-full flex flex-col justify-between pl-6 md:pl-7">
                        <div className="flex items-center justify-between border-b border-[#D5B06C]/30 pb-2">
                          <span className="font-sans text-[8px] md:text-[9px] uppercase tracking-[0.25em] text-[#D5B06C] font-semibold flex items-center gap-1">
                            <span>{work.category}</span>
                            <span className="inline-flex items-center gap-0.5 text-[#D5B06C] ml-1">
                              <Heart className="w-2.5 h-2.5 fill-[#D5B06C]" />
                              <span className="text-[8px] font-sans">{work.gilded_likes_count || work.gildedLikesCount || 0}</span>
                            </span>
                          </span>
                          {progress > 0 ? (
                            <span className="bg-[#D5B06C]/25 border border-[#D5B06C]/60 px-1.5 py-0.5 rounded text-[8px] md:text-[9px] font-sans text-[#D5B06C] uppercase tracking-wider font-semibold shadow-[0_0_8px_rgba(213,176,108,0.3)]">
                              {progress >= 90 ? '100%' : `${progress}%`}
                            </span>
                          ) : (
                            <span className="font-sans text-[8px] text-[#8A8177]">
                              {work.read_time_minutes}m
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-serif text-sm md:text-lg text-[#FEEFFF] group-hover:text-[#D5B06C] transition-colors font-medium leading-snug line-clamp-3 drop-shadow-md">
                            {work.title}
                          </h4>
                          <p className="font-sans text-[10px] md:text-xs text-[#8A8177] group-hover:text-[#FEEFFF]/80 transition-colors truncate">
                            By {work.author}
                          </p>
                        </div>
                      </div>

                      {progress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#8A8177]/20 z-30 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-600 via-[#D5B06C] to-amber-400 shadow-[0_0_8px_#D5B06C]"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="absolute -bottom-2 left-3 right-3 h-3 bg-black/90 blur-sm rounded-full opacity-70 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                );
              })}
            </div>

            <div className="relative h-6 md:h-8 rounded-sm bg-gradient-to-b from-[#3D2E21] via-[#241A12] to-[#120B06] border-t-2 border-[#D5B06C] border-b border-black shadow-[0_12px_30px_rgba(0,0,0,0.95)]">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(213,176,108,0.25),transparent_75%)]" />
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#FEEFFF]/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/80" />
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BookshelfView;
