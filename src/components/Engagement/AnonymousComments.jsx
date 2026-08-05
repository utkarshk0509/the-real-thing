import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DeterministicAvatar = ({ seed }) => {
  const hash = useMemo(() => {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
    return Math.abs(h);
  }, [seed]);

  const hue = hash % 360;
  const rotation = (hash % 8) * 45;

  return (
    <div className="w-9 h-9 rounded-full overflow-hidden border border-[#8A8177]/20 flex-shrink-0 bg-[#0F1216] relative flex items-center justify-center">
      <svg viewBox="0 0 40 40" className="w-full h-full">
        <rect width="40" height="40" fill="#080A06" />
        <g transform={`rotate(${rotation} 20 20)`}>
          <circle cx="20" cy="20" r="14" fill={`hsl(${hue}, 40%, 15%)`} stroke="#D5B06C" strokeWidth="0.5" strokeDasharray="2 2" />
          <polygon points="20,8 28,32 12,32" fill={`hsl(${hue + 40}, 60%, 45%)`} opacity="0.6" />
        </g>
      </svg>
    </div>
  );
};

export const AnonymousComments = ({ comments = [], onAddComment, onDeleteComment }) => {
  const [text, setText] = useState('');
  const [alias, setAlias] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);
    await onAddComment({
      content: text,
      author_alias: alias.trim() || 'Anonymous Reader',
      avatar_seed: Math.random().toString(36).substring(2, 10),
    });
    setText('');
    setIsSubmitting(false);
  };

  return (
    <section className="mt-20 border-t border-[#8A8177]/15 pt-12 max-w-2xl mx-auto">
      <h3 className="font-serif text-2xl text-[#FEEFFF] mb-8 tracking-wide">
        Reflections <span className="text-xs font-sans text-[#8A8177] ml-2 tracking-widest uppercase">({comments.length})</span>
      </h3>

      <form onSubmit={handleSubmit} className="mb-12 bg-[#0F1216] border border-[#8A8177]/20 rounded-lg p-5">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Your Alias (Optional)"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            className="w-full bg-transparent border-b border-[#8A8177]/20 px-0 py-2 font-sans text-xs uppercase tracking-widest text-[#FEEFFF] placeholder-[#8A8177]/50 focus:outline-none focus:border-[#D5B06C] transition-colors"
          />
        </div>
        <textarea
          rows={3}
          required
          placeholder="Leave a reflection on this work..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full bg-transparent font-serif text-sm text-[#FEEFFF] placeholder-[#8A8177]/50 resize-none focus:outline-none"
        />
        <div className="flex justify-end mt-3 border-t border-[#8A8177]/10 pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="font-sans text-xs uppercase tracking-widest px-5 py-2 rounded border border-[#D5B06C]/40 text-[#D5B06C] hover:bg-[#D5B06C] hover:text-[#080A06] transition-all duration-300 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? 'Inscribing...' : 'Publish Reflection'}
          </button>
        </div>
      </form>

      <div className="space-y-6">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-4 p-4 rounded-md border border-[#8A8177]/10 bg-[#0F1216]/40 relative group"
            >
              <DeterministicAvatar seed={comment.avatar_seed || comment.id} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-sans text-xs uppercase tracking-wider text-[#D5B06C]">
                    {comment.author_alias}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="font-sans text-[10px] text-[#8A8177]">
                      {new Date(comment.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                    {onDeleteComment && (
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        title="Delete Reflection"
                        className="text-[10px] font-sans uppercase tracking-wider text-red-400/70 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
                <p className="font-serif text-sm text-[#FEEFFF]/90 leading-relaxed">{comment.content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default AnonymousComments;