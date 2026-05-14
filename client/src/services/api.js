import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (data) => api.post('/auth/login', data);
export const register = (data) => api.post('/auth/register', data);

// Inspections
export const getInspections = () => api.get('/inspections');
export const getInspection = (id) => api.get(`/inspections/${id}`);
export const createInspection = (data) => api.post('/inspections', data);
export const updateInspection = (id, data) => api.put(`/inspections/${id}`, data);
export const deleteInspection = (id) => api.delete(`/inspections/${id}`);
export const analyzeInspection = (id) => api.post(`/inspections/${id}/analyze`);

// Compliance
export const getCompliances = () => api.get('/compliance');
export const getCompliance = (id) => api.get(`/compliance/${id}`);
export const createCompliance = (data) => api.post('/compliance', data);
export const updateCompliance = (id, data) => api.put(`/compliance/${id}`, data);
export const deleteCompliance = (id) => api.delete(`/compliance/${id}`);
export const analyzeCompliance = (id) => api.post(`/compliance/${id}/analyze`);

// Condition Scores
export const getConditionScores = () => api.get('/condition-scores');
export const getConditionScore = (id) => api.get(`/condition-scores/${id}`);
export const createConditionScore = (data) => api.post('/condition-scores', data);
export const updateConditionScore = (id, data) => api.put(`/condition-scores/${id}`, data);
export const deleteConditionScore = (id) => api.delete(`/condition-scores/${id}`);
export const analyzeConditionScore = (id) => api.post(`/condition-scores/${id}/analyze`);

// Market Values
export const getMarketValues = () => api.get('/market-values');
export const getMarketValue = (id) => api.get(`/market-values/${id}`);
export const createMarketValue = (data) => api.post('/market-values', data);
export const updateMarketValue = (id, data) => api.put(`/market-values/${id}`, data);
export const deleteMarketValue = (id) => api.delete(`/market-values/${id}`);
export const analyzeMarketValue = (id) => api.post(`/market-values/${id}/analyze`);

// Damage Reports
export const getDamageReports = () => api.get('/damage-reports');
export const getDamageReport = (id) => api.get(`/damage-reports/${id}`);
export const createDamageReport = (data) => api.post('/damage-reports', data);
export const updateDamageReport = (id, data) => api.put(`/damage-reports/${id}`, data);
export const deleteDamageReport = (id) => api.delete(`/damage-reports/${id}`);
export const analyzeDamageReport = (id) => api.post(`/damage-reports/${id}/analyze`);

// Vehicle History
export const getVehicleHistories = () => api.get('/vehicle-history');
export const getVehicleHistory = (id) => api.get(`/vehicle-history/${id}`);
export const createVehicleHistory = (data) => api.post('/vehicle-history', data);
export const updateVehicleHistory = (id, data) => api.put(`/vehicle-history/${id}`, data);
export const deleteVehicleHistory = (id) => api.delete(`/vehicle-history/${id}`);
export const analyzeVehicleHistory = (id) => api.post(`/vehicle-history/${id}/analyze`);

// Recall Alerts
export const getRecallAlerts = () => api.get('/recall-alerts');
export const getRecallAlert = (id) => api.get(`/recall-alerts/${id}`);
export const createRecallAlert = (data) => api.post('/recall-alerts', data);
export const updateRecallAlert = (id, data) => api.put(`/recall-alerts/${id}`, data);
export const deleteRecallAlert = (id) => api.delete(`/recall-alerts/${id}`);
export const analyzeRecallAlert = (id) => api.post(`/recall-alerts/${id}/analyze`);

// Insurance Estimates
export const getInsuranceEstimates = () => api.get('/insurance-estimates');
export const getInsuranceEstimate = (id) => api.get(`/insurance-estimates/${id}`);
export const createInsuranceEstimate = (data) => api.post('/insurance-estimates', data);
export const updateInsuranceEstimate = (id, data) => api.put(`/insurance-estimates/${id}`, data);
export const deleteInsuranceEstimate = (id) => api.delete(`/insurance-estimates/${id}`);
export const analyzeInsuranceEstimate = (id) => api.post(`/insurance-estimates/${id}/analyze`);

// Maintenance Schedules
export const getMaintenanceSchedules = () => api.get('/maintenance-schedules');
export const getMaintenanceSchedule = (id) => api.get(`/maintenance-schedules/${id}`);
export const createMaintenanceSchedule = (data) => api.post('/maintenance-schedules', data);
export const updateMaintenanceSchedule = (id, data) => api.put(`/maintenance-schedules/${id}`, data);
export const deleteMaintenanceSchedule = (id) => api.delete(`/maintenance-schedules/${id}`);
export const analyzeMaintenanceSchedule = (id) => api.post(`/maintenance-schedules/${id}/analyze`);

// Parts Pricing
export const getPartsPricings = () => api.get('/parts-pricing');
export const getPartsPricing = (id) => api.get(`/parts-pricing/${id}`);
export const createPartsPricing = (data) => api.post('/parts-pricing', data);
export const updatePartsPricing = (id, data) => api.put(`/parts-pricing/${id}`, data);
export const deletePartsPricing = (id) => api.delete(`/parts-pricing/${id}`);
export const analyzePartsPricing = (id) => api.post(`/parts-pricing/${id}/analyze`);

// Vehicles (VIN decoder, recalls)
export const decodeVIN = (vin) => api.post('/vehicles/decode-vin', { vin });
export const checkRecalls = (id) => api.post(`/vehicles/${id}/check-recalls`);

// Dashboard
export const getFleetSummary = () => api.get('/dashboard/fleet-summary');

// AI Tools (text-only)
export const aiPredictiveMaintenance = (data) => api.post('/ai/predictive-maintenance', data);
export const aiInsuranceEstimate = (data) => api.post('/ai/insurance-estimate', data);
export const aiRecallSummary = (data) => api.post('/ai/recall-summary', data);
export const aiNhtsaRecallLookup = (data) => api.post('/ai/nhtsa-recall-lookup', data);
export const aiPartsPriceMonitor = (data) => api.post('/ai/parts-price-monitor', data);

// Inspection extra
export const uploadInspectionImage = (id, formData) => api.post(`/inspections/${id}/upload-image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const visionAnalyzeInspection = (id, formData) => api.post(`/inspections/${id}/vision-analyze`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getInspectionCertificatePDF = (id) => api.get(`/inspections/${id}/certificate-pdf`, { responseType: 'blob' });
export const certifyInspection = (id) => api.post(`/inspections/${id}/certify`);

export default api;

