import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Lazy load pages for lightning-fast initial load
const Landing = lazy(() => import('./pages/Landing'));
const HomeConstellation = lazy(() => import('./pages/HomeConstellation'));
const Hub = lazy(() => import('./pages/Hub'));
const ReaderView = lazy(() => import('./pages/ReaderView'));
const AuthorPortal = lazy(() => import('./pages/AuthorPortal'));

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080A06]" />}>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Landing />} />
          <Route path="/hub" element={<HomeConstellation />} />
          <Route path="/poems" element={<Hub filter="/poems" />} />
          <Route path="/stories" element={<Hub filter="/stories" />} />
          <Route path="/about" element={<Hub filter="/about" />} />
          <Route path="/read/:slug" element={<ReaderView />} />
          <Route path="/portal" element={<AuthorPortal />} />
        </Routes>
      </AnimatePresence>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;