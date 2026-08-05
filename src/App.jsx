import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Landing from './pages/Landing';
import Hub from './pages/Hub';
import ReaderView from './pages/ReaderView';
import AuthorPortal from './pages/AuthorPortal';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/poems" element={<Hub filter="/poems" />} />
        <Route path="/stories" element={<Hub filter="/stories" />} />
        <Route path="/about" element={<Hub filter="/about" />} />
        <Route path="/read/:slug" element={<ReaderView />} />
        <Route path="/portal" element={<AuthorPortal />} />
      </Routes>
    </AnimatePresence>
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