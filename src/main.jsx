import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx'
import LoginPage from './LoginPage.jsx';
import DesignPage from './pages/DesignPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import './index.css'
import { initDB } from './lib/db';

// Environment Check
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

requiredEnvVars.forEach(key => {
  if (!import.meta.env[key]) {
    console.error(`[CRITICAL] Missing environment variable: ${key}`);
  }
});

// Initialize Database (Seed Admin if needed)
initDB();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/design" element={<DesignPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
