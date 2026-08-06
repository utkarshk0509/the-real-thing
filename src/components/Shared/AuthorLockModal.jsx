import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const AuthorLockModal = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const AUTHOR_PASSCODE = import.meta.env.VITE_AUTHOR_PASSCODE || '1234';

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (sessionStorage.getItem('real_thing_author_auth') === 'true') {
          navigate('/portal');
        } else {
          setIsOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  const handleAccess = (e) => {
    e.preventDefault();
    if (passcode === AUTHOR_PASSCODE) {
      sessionStorage.setItem('real_thing_author_auth', 'true');
      setIsOpen(false);
      setError(false);
      setPasscode('');
      navigate('/portal');
    } else {
      setError(true);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080A06]/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0F1216] border border-[#8A8177]/20 p-8 rounded-2xl max-w-sm w-full space-y-6 text-center relative shadow-2xl"
            >
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-[#FEEFFF]">Curator Gateway</h3>
                <p className="font-sans text-[10px] uppercase tracking-widest text-[#8A8177]">
                  Enter Passcode for Portal Access
                </p>
              </div>

              <form onSubmit={handleAccess} className="space-y-4">
                <input
                  type="password"
                  autoFocus
                  placeholder="••••"
                  value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                    setError(false);
                  }}
                  className={`w-full bg-[#080A06] border text-center font-sans text-lg tracking-[0.5em] text-[#FEEFFF] px-4 py-3 rounded-lg focus:outline-none transition-colors ${
                    error
                      ? 'border-red-500/60 focus:border-red-500'
                      : 'border-[#8A8177]/30 focus:border-[#D5B06C]'
                  }`}
                />

                {error && (
                  <p className="font-sans text-[10px] uppercase tracking-wider text-red-400">
                    Invalid Curator Passcode
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      setError(false);
                      setPasscode('');
                    }}
                    className="flex-1 py-2.5 border border-[#8A8177]/20 text-[#8A8177] font-sans text-xs uppercase tracking-widest rounded hover:text-[#FEEFFF] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-[#D5B06C] text-[#080A06] font-sans text-xs font-semibold uppercase tracking-widest rounded hover:bg-[#FEEFFF] transition-colors cursor-pointer"
                  >
                    Enter
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AuthorLockModal;