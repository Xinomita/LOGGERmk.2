import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import LoggingPage from './pages/LoggingPage';
import CompoundsPage from './pages/CompoundsPage';
import AIPage from './pages/AIPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/logging" replace />} />
          <Route path="logging" element={<LoggingPage />} />
          <Route path="compounds" element={<CompoundsPage />} />
          <Route path="ai" element={<AIPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
