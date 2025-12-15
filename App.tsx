import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import IncomeGuide from './pages/IncomeGuide';
import ScrollToTop from './components/ScrollToTop';
import CustomCursor from './components/CustomCursor';
import { AuthProvider } from './contexts/AuthContext';

// Helper component to scroll to top on route change
const ScrollToTopHelper = () => {
    return <ScrollToTop />;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CustomCursor />
      <Router>
        <ScrollToTopHelper />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/income-guide" element={<IncomeGuide />} />
          <Route path="/about" element={<About />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;