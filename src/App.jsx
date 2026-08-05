import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Hub from './pages/Hub';
import ReaderView from './pages/ReaderView';
import AuthorPortal from './pages/AuthorPortal';
import AuthorLockModal from './components/Shared/AuthorLockModal';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/hub" element={<Hub />} />
        <Route path="/poems" element={<Hub filter="/poems" />} />
        <Route path="/stories" element={<Hub filter="/stories" />} />
        <Route path="/about" element={<Hub filter="/about" />} />
        <Route path="/read/:slug" element={<ReaderView />} />
        <Route path="/portal" element={<AuthorPortal />} />
      </Routes>

      {/* Discrete Author Portal Access Available on Every Page */}
      <AuthorLockModal />
    </BrowserRouter>
  );
}

export default App;