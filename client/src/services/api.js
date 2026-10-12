import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:7777/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' }
});

// The record collection routes return { data: rows, pagination }.
// Keep their callers' response.data contract as an array, and retain the
// pagination metadata for views that need the total count.
export const recordRows = (payload) => Array.isArray(payload)
  ? payload
  : Array.isArray(payload?.data) ? payload.data : [];
const getRecordList = async (path) => {
  const response = await api.get(path);
  return { ...response, data: recordRows(response.data), pagination: response.data?.pagination };
};

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
export const getInspections = () => getRecordList('/inspections');
export const getInspection = (id) => api.get(`/inspections/${id}`);
export const createInspection = (data) => api.post('/inspections', data);
export const updateInspection = (id, data) => api.put(`/inspections/${id}`, data);
export const deleteInspection = (id) => api.delete(`/inspections/${id}`);
export const analyzeInspection = (id) => api.post(`/inspections/${id}/analyze`);

// Compliance
export const getCompliances = () => getRecordList('/compliance');
export const getCompliance = (id) => api.get(`/compliance/${id}`);
export const createCompliance = (data) => api.post('/compliance', data);
export const updateCompliance = (id, data) => api.put(`/compliance/${id}`, data);
export const deleteCompliance = (id) => api.delete(`/compliance/${id}`);
export const analyzeCompliance = (id) => api.post(`/compliance/${id}/analyze`);

// Condition Scores
export const getConditionScores = () => getRecordList('/condition-scores');
export const getConditionScore = (id) => api.get(`/condition-scores/${id}`);
export const createConditionScore = (data) => api.post('/condition-scores', data);
export const updateConditionScore = (id, data) => api.put(`/condition-scores/${id}`, data);
export const deleteConditionScore = (id) => api.delete(`/condition-scores/${id}`);
export const analyzeConditionScore = (id) => api.post(`/condition-scores/${id}/analyze`);

// Market Values
export const getMarketValues = () => getRecordList('/market-values');
export const getMarketValue = (id) => api.get(`/market-values/${id}`);
export const createMarketValue = (data) => api.post('/market-values', data);
export const updateMarketValue = (id, data) => api.put(`/market-values/${id}`, data);
export const deleteMarketValue = (id) => api.delete(`/market-values/${id}`);
export const analyzeMarketValue = (id) => api.post(`/market-values/${id}/analyze`);

// Damage Reports
export const getDamageReports = () => getRecordList('/damage-reports');
export const getDamageReport = (id) => api.get(`/damage-reports/${id}`);
export const createDamageReport = (data) => api.post('/damage-reports', data);
export const updateDamageReport = (id, data) => api.put(`/damage-reports/${id}`, data);
export const deleteDamageReport = (id) => api.delete(`/damage-reports/${id}`);
export const analyzeDamageReport = (id) => api.post(`/damage-reports/${id}/analyze`);

// Vehicle History
export const getVehicleHistories = () => getRecordList('/vehicle-history');
export const getVehicleHistory = (id) => api.get(`/vehicle-history/${id}`);
export const createVehicleHistory = (data) => api.post('/vehicle-history', data);
export const updateVehicleHistory = (id, data) => api.put(`/vehicle-history/${id}`, data);
export const deleteVehicleHistory = (id) => api.delete(`/vehicle-history/${id}`);
export const analyzeVehicleHistory = (id) => api.post(`/vehicle-history/${id}/analyze`);

// Recall Alerts
export const getRecallAlerts = () => getRecordList('/recall-alerts');
export const getRecallAlert = (id) => api.get(`/recall-alerts/${id}`);
export const createRecallAlert = (data) => api.post('/recall-alerts', data);
export const updateRecallAlert = (id, data) => api.put(`/recall-alerts/${id}`, data);
export const deleteRecallAlert = (id) => api.delete(`/recall-alerts/${id}`);
export const analyzeRecallAlert = (id) => api.post(`/recall-alerts/${id}/analyze`);

// Insurance Estimates
export const getInsuranceEstimates = () => getRecordList('/insurance-estimates');
export const getInsuranceEstimate = (id) => api.get(`/insurance-estimates/${id}`);
export const createInsuranceEstimate = (data) => api.post('/insurance-estimates', data);
export const updateInsuranceEstimate = (id, data) => api.put(`/insurance-estimates/${id}`, data);
export const deleteInsuranceEstimate = (id) => api.delete(`/insurance-estimates/${id}`);
export const analyzeInsuranceEstimate = (id) => api.post(`/insurance-estimates/${id}/analyze`);

// Maintenance Schedules
export const getMaintenanceSchedules = () => getRecordList('/maintenance-schedules');
export const getMaintenanceSchedule = (id) => api.get(`/maintenance-schedules/${id}`);
export const createMaintenanceSchedule = (data) => api.post('/maintenance-schedules', data);
export const updateMaintenanceSchedule = (id, data) => api.put(`/maintenance-schedules/${id}`, data);
export const deleteMaintenanceSchedule = (id) => api.delete(`/maintenance-schedules/${id}`);
export const analyzeMaintenanceSchedule = (id) => api.post(`/maintenance-schedules/${id}/analyze`);

// Parts Pricing
export const getPartsPricings = () => getRecordList('/parts-pricing');
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
export const aiPredictiveMaintenance = (data) => api.post('/ai/predictive-maintenance', {
  vehicle: data.vehicle ?? { make: data.make, model: data.model, year: data.year ? Number(data.year) : undefined },
  ...(data.history ? { history: data.history } : {}),
  ...(data.mileage !== '' && data.mileage != null ? { mileage: Number(data.mileage) } : {}),
  ...(data.ageYears !== undefined || data.age !== '' && data.age != null ? { ageYears: Number(data.ageYears ?? data.age) } : {}),
  ...(data.conditionScore !== undefined || data.condition_score !== '' && data.condition_score != null ? { conditionScore: Number(data.conditionScore ?? data.condition_score) } : {}),
});
export const aiInsuranceEstimate = (data) => api.post('/ai/insurance-estimate', {
  vehicle: data.vehicle,
  damageDescription: (data.damageDescription ?? data.damage_description ?? '') + (data.severity ? '\nReported scenario severity: ' + data.severity : ''),
  ...(data.region ? { region: data.region } : {}),
});
export const aiRecallSummary = (data) => api.post('/ai/recall-summary', {
  recall: data.recall ?? { ...(data.recall_id ? { id: data.recall_id } : {}), make: data.make, model: data.model, year: data.year, description: data.description },
  ...(data.vehicleCount !== undefined && data.vehicleCount !== '' ? { vehicleCount: Number(data.vehicleCount) } : {}),
});
export const aiNhtsaRecallLookup = (data) => api.post('/ai/nhtsa-recall-lookup', data);
export const aiPartsPriceMonitor = (data) => api.post('/ai/parts-price-monitor', data);

// Inspection extra
export const uploadInspectionImage = (id, formData) => api.post(`/inspections/${id}/upload-image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const visionAnalyzeInspection = (id, formData) => api.post(`/inspections/${id}/vision-analyze`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getInspectionCertificatePDF = (id) => api.get(`/inspections/${id}/certificate-pdf`, { responseType: 'blob' });
export const certifyInspection = (id) => api.post(`/inspections/${id}/certify`);

export default api;

