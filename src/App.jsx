import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Hub from './pages/Hub';
import ReaderView from './pages/ReaderView';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;