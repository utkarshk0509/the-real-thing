import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import { CustomCelestialCursor } from './components/Shared/CustomCelestialCursor';
import { MagicStardustTrail } from './components/Shared/MagicStardustTrail';
import { CelestialAudioPlayer } from './components/Shared/CelestialAudioPlayer';

// Lazy load pages for lightning-fast initial load
const Landing = lazy(() => import('./pages/Landing'));
const HomeConstellation = lazy(() => import('./pages/HomeConstellation'));
const Hub = lazy(() => import('./pages/Hub'));
const ReaderView = lazy(() => import('./pages/ReaderView'));
const AuthorPortal = lazy(() => import('./pages/AuthorPortal'));

function PageTransitionWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080A06]" />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransitionWrapper><Landing /></PageTransitionWrapper>} />
          <Route path="/hub" element={<PageTransitionWrapper><HomeConstellation /></PageTransitionWrapper>} />
          <Route path="/poems" element={<PageTransitionWrapper><Hub filter="/poems" /></PageTransitionWrapper>} />
          <Route path="/stories" element={<PageTransitionWrapper><Hub filter="/stories" /></PageTransitionWrapper>} />
          <Route path="/about" element={<PageTransitionWrapper><Hub filter="/about" /></PageTransitionWrapper>} />
          <Route path="/read/:slug" element={<PageTransitionWrapper><ReaderView /></PageTransitionWrapper>} />
          <Route path="/portal" element={<PageTransitionWrapper><AuthorPortal /></PageTransitionWrapper>} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <CustomCelestialCursor />
      <MagicStardustTrail />
      <CelestialAudioPlayer />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;