import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const AuthorLockModal = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  // Set your secret author passcode here (or in .env as VITE_AUTHOR_PASSCODE)
  const AUTHOR_PASSCODE = import.meta.env.VITE_AUTHOR_PASSCODE || '1234';

  const handleAccess = (e) => {
    e.preventDefault();
    if (passcode === AUTHOR_PASSCODE) {
      // Store session token so you remain authenticated during the session
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
      {/* Discrete Floating Key Access Trigger (Bottom-Right) */}
      <button
        onClick={() => {
          // If already authenticated this session, bypass password prompt
          if (sessionStorage.getItem('real_thing_author_auth') === 'true') {
            navigate('/portal');
          } else {
            setIsOpen(true);
          }
        }}
        aria-label="Curator Access"
        className="fixed bottom-6 right-6 z-50 p-2.5 rounded-full bg-[#0F1216]/80 border border-[#8A8177]/20 text-[#8A8177] hover:text-[#D5B06C] hover:border-[#D5B06C]/50 backdrop-blur-md transition-all duration-300 opacity-40 hover:opacity-100 cursor-pointer shadow-lg"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-4 h-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
          />
        </svg>
      </button>

      {/* Secret Passcode Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#080A06]/80 backdrop-blur-md">
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