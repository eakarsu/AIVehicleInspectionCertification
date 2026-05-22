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
import VINDecoder from './pages/VINDecoder';
import VisionDamageDetector from './pages/VisionDamageDetector';
import FleetSummary from './pages/FleetSummary';
import CertificatePDF from './pages/CertificatePDF';
import AIPredictiveMaintenance from './pages/AIPredictiveMaintenance';
import AIInsuranceEstimate from './pages/AIInsuranceEstimate';
import AIRecallSummary from './pages/AIRecallSummary';
import AINHTSARecallLookup from './pages/AINHTSARecallLookup';
import AIPartsPriceMonitor from './pages/AIPartsPriceMonitor';
import ADASCalibrationReadiness from './pages/ADASCalibrationReadiness';
import CodexCustomVizFeature from './pages/CodexCustomVizFeature';
import CodexOperationsFeature from './pages/CodexOperationsFeature';

import TimelineView from './pages/TimelineView';

// === Batch 08 Gaps & Frontend Mounts ===
import CfVisionBasedDamageAssessmentFromPhotosWith from './pages/CfVisionBasedDamageAssessmentFromPhotosWith'
import CfPredictiveMaintenanceFlaggingVehiclesByAgeMileage from './pages/CfPredictiveMaintenanceFlaggingVehiclesByAgeMileage'
import CfPartsPriceMonitoringWithBulkOrderTiming from './pages/CfPartsPriceMonitoringWithBulkOrderTiming'
import CfRepairShopNetworkWithQualityRatings from './pages/CfRepairShopNetworkWithQualityRatings'
import CfInsuranceClaimAutomationGeneratingFilingsFromDamage from './pages/CfInsuranceClaimAutomationGeneratingFilingsFromDamage'
import CfVinDecoderIntegrationForAutoPopulatedVehicle from './pages/CfVinDecoderIntegrationForAutoPopulatedVehicle'
import GapCriticalNoAiForDamageAssessmentFrom from './pages/GapCriticalNoAiForDamageAssessmentFrom'
import GapNoPredictiveMaintenanceMl from './pages/GapNoPredictiveMaintenanceMl'
import GapNoInsuranceEstimateGenerationAi from './pages/GapNoInsuranceEstimateGenerationAi'
import GapNoFraudDetectionOnInspectionData from './pages/GapNoFraudDetectionOnInspectionData'
import GapNoIntegrationWithOemRecallDatabasesOnly from './pages/GapNoIntegrationWithOemRecallDatabasesOnly'
import GapNoPartsSupplierIntegration from './pages/GapNoPartsSupplierIntegration'
import GapNoThirdPartyRepairShopNetwork from './pages/GapNoThirdPartyRepairShopNetwork'
import GapNoInsuranceClaimIntegrationDirectInsurerApi from './pages/GapNoInsuranceClaimIntegrationDirectInsurerApi'
import GapNoWebhooksNotificationsForRecallEvents from './pages/GapNoWebhooksNotificationsForRecallEvents'
import GapNoAuditLogging from './pages/GapNoAuditLogging'
import GapNoCustomerSelfServicePortal from './pages/GapNoCustomerSelfServicePortal'

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
        <Route path="/insights/timeline" element={<ProtectedRoute><TimelineView /></ProtectedRoute>} />
        <Route path="/codex/custom-viz" element={<CodexCustomVizFeature />} />
        <Route path="/codex/operations" element={<CodexOperationsFeature />} />

            {/* // === Batch 08 Gaps & Frontend Mounts === */}
      <Route path="/cf-vision-based-damage-assessment-from-photos-with-repair-cost" element={<ProtectedRoute><CfVisionBasedDamageAssessmentFromPhotosWith /></ProtectedRoute>} />
      <Route path="/cf-predictive-maintenance-flagging-vehicles-by-age-mileage-condition" element={<ProtectedRoute><CfPredictiveMaintenanceFlaggingVehiclesByAgeMileage /></ProtectedRoute>} />
      <Route path="/cf-parts-price-monitoring-with-bulk-order-timing-recommendations" element={<ProtectedRoute><CfPartsPriceMonitoringWithBulkOrderTiming /></ProtectedRoute>} />
      <Route path="/cf-repair-shop-network-with-quality-ratings" element={<ProtectedRoute><CfRepairShopNetworkWithQualityRatings /></ProtectedRoute>} />
      <Route path="/cf-insurance-claim-automation-generating-filings-from-damage-photos" element={<ProtectedRoute><CfInsuranceClaimAutomationGeneratingFilingsFromDamage /></ProtectedRoute>} />
      <Route path="/cf-vin-decoder-integration-for-auto-populated-vehicle-profiles" element={<ProtectedRoute><CfVinDecoderIntegrationForAutoPopulatedVehicle /></ProtectedRoute>} />
      <Route path="/gap-critical-no-ai-for-damage-assessment-from-photos" element={<ProtectedRoute><GapCriticalNoAiForDamageAssessmentFrom /></ProtectedRoute>} />
      <Route path="/gap-no-predictive-maintenance-ml" element={<ProtectedRoute><GapNoPredictiveMaintenanceMl /></ProtectedRoute>} />
      <Route path="/gap-no-insurance-estimate-generation-ai" element={<ProtectedRoute><GapNoInsuranceEstimateGenerationAi /></ProtectedRoute>} />
      <Route path="/gap-no-fraud-detection-on-inspection-data" element={<ProtectedRoute><GapNoFraudDetectionOnInspectionData /></ProtectedRoute>} />
      <Route path="/gap-no-integration-with-oem-recall-databases-only-manual" element={<ProtectedRoute><GapNoIntegrationWithOemRecallDatabasesOnly /></ProtectedRoute>} />
      <Route path="/gap-no-parts-supplier-integration" element={<ProtectedRoute><GapNoPartsSupplierIntegration /></ProtectedRoute>} />
      <Route path="/gap-no-third-party-repair-shop-network" element={<ProtectedRoute><GapNoThirdPartyRepairShopNetwork /></ProtectedRoute>} />
      <Route path="/gap-no-insurance-claim-integration-direct-insurer-api" element={<ProtectedRoute><GapNoInsuranceClaimIntegrationDirectInsurerApi /></ProtectedRoute>} />
      <Route path="/gap-no-webhooks-notifications-for-recall-events" element={<ProtectedRoute><GapNoWebhooksNotificationsForRecallEvents /></ProtectedRoute>} />
      <Route path="/gap-no-audit-logging" element={<ProtectedRoute><GapNoAuditLogging /></ProtectedRoute>} />
      <Route path="/gap-no-customer-self-service-portal" element={<ProtectedRoute><GapNoCustomerSelfServicePortal /></ProtectedRoute>} />
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
          <Route path="/vin-decoder" element={<VINDecoder />} />
          <Route path="/vision-damage" element={<VisionDamageDetector />} />
          <Route path="/fleet-summary" element={<FleetSummary />} />
          <Route path="/certificates" element={<CertificatePDF />} />
          <Route path="/ai/predictive-maintenance" element={<AIPredictiveMaintenance />} />
          <Route path="/ai/insurance-estimate" element={<AIInsuranceEstimate />} />
          <Route path="/ai/recall-summary" element={<AIRecallSummary />} />
          <Route path="/ai/nhtsa-recall-lookup" element={<AINHTSARecallLookup />} />
          <Route path="/ai/parts-price-monitor" element={<AIPartsPriceMonitor />} />
          <Route path="/adas-calibration-readiness" element={<ADASCalibrationReadiness />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
