import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Regulations from './pages/Regulations';
import RiskAnalysis from './pages/RiskAnalysis';
import ActivityLog from './pages/ActivityLog';
import Settings from './pages/Settings';
import Reports from './pages/Reports';
import Login from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="regulations" element={<Regulations />} />
          <Route path="risks" element={<RiskAnalysis />} />
          <Route path="activity" element={<ActivityLog />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
