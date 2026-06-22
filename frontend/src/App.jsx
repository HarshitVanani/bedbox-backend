// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SettingsPanel from './components/SettingsPanel';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Sign In Route path */}
        <Route path="/login" element={<Login />} />
        
        {/* Secure Dashboard View Layout */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Wildcard Fallback Redirect Routing */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}