import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import InspectionsPage from './pages/InspectionsPage';
import InspectionDetail from './pages/InspectionDetail';
import CompliancePage from './pages/CompliancePage';
import ComplianceDetail from './pages/ComplianceDetail';
import ConditionScoresPage from './pages/ConditionScoresPage';
import ConditionScoreDetail from './pages/ConditionScoreDetail';
import MarketValuesPage from './pages/MarketValuesPage';
import MarketValueDetail from './pages/MarketValueDetail';
import DamageReportsPage from './pages/DamageReportsPage';
import DamageReportDetail from './pages/DamageReportDetail';
import VehicleHistoryPage from './pages/VehicleHistoryPage';
import VehicleHistoryDetail from './pages/VehicleHistoryDetail';
import RecallAlertsPage from './pages/RecallAlertsPage';
import RecallAlertDetail from './pages/RecallAlertDetail';
import InsuranceEstimatesPage from './pages/InsuranceEstimatesPage';
import InsuranceEstimateDetail from './pages/InsuranceEstimateDetail';
import MaintenanceSchedulesPage from './pages/MaintenanceSchedulesPage';
import MaintenanceScheduleDetail from './pages/MaintenanceScheduleDetail';
import PartsPricingPage from './pages/PartsPricingPage';
import PartsPricingDetail from './pages/PartsPricingDetail';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (!isAuthenticated) {
    return (
      <>
        <Router>
          <Routes>
            <Route path="*" element={<Login onLogin={handleLogin} />} />
          </Routes>
        </Router>
        <ToastContainer theme="dark" position="top-right" />
      </>
    );
  }

  return (
    <Router>
      <ToastContainer theme="dark" position="top-right" />
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inspections" element={<InspectionsPage />} />
          <Route path="/inspections/:id" element={<InspectionDetail />} />
          <Route path="/compliance" element={<CompliancePage />} />
          <Route path="/compliance/:id" element={<ComplianceDetail />} />
          <Route path="/condition-scores" element={<ConditionScoresPage />} />
          <Route path="/condition-scores/:id" element={<ConditionScoreDetail />} />
          <Route path="/market-values" element={<MarketValuesPage />} />
          <Route path="/market-values/:id" element={<MarketValueDetail />} />
          <Route path="/damage-reports" element={<DamageReportsPage />} />
          <Route path="/damage-reports/:id" element={<DamageReportDetail />} />
          <Route path="/vehicle-history" element={<VehicleHistoryPage />} />
          <Route path="/vehicle-history/:id" element={<VehicleHistoryDetail />} />
          <Route path="/recall-alerts" element={<RecallAlertsPage />} />
          <Route path="/recall-alerts/:id" element={<RecallAlertDetail />} />
          <Route path="/insurance-estimates" element={<InsuranceEstimatesPage />} />
          <Route path="/insurance-estimates/:id" element={<InsuranceEstimateDetail />} />
          <Route path="/maintenance-schedules" element={<MaintenanceSchedulesPage />} />
          <Route path="/maintenance-schedules/:id" element={<MaintenanceScheduleDetail />} />
          <Route path="/parts-pricing" element={<PartsPricingPage />} />
          <Route path="/parts-pricing/:id" element={<PartsPricingDetail />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
