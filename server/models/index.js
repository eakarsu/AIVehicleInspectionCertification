const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

// User Model
const User = sequelize.define('User', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.STRING, defaultValue: 'user' }
}, { tableName: 'users', timestamps: true });

// Vehicle Inspection Model
const Inspection = sequelize.define('Inspection', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vehicleMake: { type: DataTypes.STRING, allowNull: false },
  vehicleModel: { type: DataTypes.STRING, allowNull: false },
  vehicleYear: { type: DataTypes.INTEGER, allowNull: false },
  vin: { type: DataTypes.STRING },
  mileage: { type: DataTypes.INTEGER },
  color: { type: DataTypes.STRING },
  inspectionDate: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  inspectorName: { type: DataTypes.STRING },
  overallStatus: { type: DataTypes.ENUM('pass', 'fail', 'conditional'), defaultValue: 'conditional' },
  notes: { type: DataTypes.TEXT },
  imageUrl: { type: DataTypes.STRING },
  aiReport: { type: DataTypes.JSONB }
}, { tableName: 'inspections', timestamps: true });

// State Compliance Model
const Compliance = sequelize.define('Compliance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  state: { type: DataTypes.STRING, allowNull: false },
  vehicleMake: { type: DataTypes.STRING, allowNull: false },
  vehicleModel: { type: DataTypes.STRING, allowNull: false },
  vehicleYear: { type: DataTypes.INTEGER, allowNull: false },
  vin: { type: DataTypes.STRING },
  emissionsStatus: { type: DataTypes.ENUM('compliant', 'non_compliant', 'exempt', 'pending'), defaultValue: 'pending' },
  safetyStatus: { type: DataTypes.ENUM('compliant', 'non_compliant', 'pending'), defaultValue: 'pending' },
  lastChecked: { type: DataTypes.DATEONLY },
  expirationDate: { type: DataTypes.DATEONLY },
  requirements: { type: DataTypes.JSONB },
  aiAnalysis: { type: DataTypes.JSONB }
}, { tableName: 'compliances', timestamps: true });

// Condition Score Model
const ConditionScore = sequelize.define('ConditionScore', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vehicleMake: { type: DataTypes.STRING, allowNull: false },
  vehicleModel: { type: DataTypes.STRING, allowNull: false },
  vehicleYear: { type: DataTypes.INTEGER, allowNull: false },
  vin: { type: DataTypes.STRING },
  mileage: { type: DataTypes.INTEGER },
  exteriorScore: { type: DataTypes.FLOAT },
  interiorScore: { type: DataTypes.FLOAT },
  mechanicalScore: { type: DataTypes.FLOAT },
  electricalScore: { type: DataTypes.FLOAT },
  overallScore: { type: DataTypes.FLOAT },
  grade: { type: DataTypes.STRING },
  details: { type: DataTypes.TEXT },
  imageUrl: { type: DataTypes.STRING },
  aiAnalysis: { type: DataTypes.JSONB }
}, { tableName: 'condition_scores', timestamps: true });

// Market Valuation Model
const MarketValue = sequelize.define('MarketValue', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vehicleMake: { type: DataTypes.STRING, allowNull: false },
  vehicleModel: { type: DataTypes.STRING, allowNull: false },
  vehicleYear: { type: DataTypes.INTEGER, allowNull: false },
  vin: { type: DataTypes.STRING },
  mileage: { type: DataTypes.INTEGER },
  condition: { type: DataTypes.STRING },
  location: { type: DataTypes.STRING },
  estimatedValue: { type: DataTypes.FLOAT },
  lowEstimate: { type: DataTypes.FLOAT },
  highEstimate: { type: DataTypes.FLOAT },
  marketTrend: { type: DataTypes.ENUM('rising', 'stable', 'declining'), defaultValue: 'stable' },
  comparables: { type: DataTypes.JSONB },
  aiAnalysis: { type: DataTypes.JSONB }
}, { tableName: 'market_values', timestamps: true });

// Damage Detection Model
const DamageReport = sequelize.define('DamageReport', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vehicleMake: { type: DataTypes.STRING, allowNull: false },
  vehicleModel: { type: DataTypes.STRING, allowNull: false },
  vehicleYear: { type: DataTypes.INTEGER, allowNull: false },
  vin: { type: DataTypes.STRING },
  damageType: { type: DataTypes.STRING },
  severity: { type: DataTypes.ENUM('minor', 'moderate', 'severe', 'critical'), defaultValue: 'minor' },
  location: { type: DataTypes.STRING },
  estimatedRepairCost: { type: DataTypes.FLOAT },
  description: { type: DataTypes.TEXT },
  imageUrl: { type: DataTypes.STRING },
  repairRecommendation: { type: DataTypes.TEXT },
  aiAnalysis: { type: DataTypes.JSONB }
}, { tableName: 'damage_reports', timestamps: true });

// Vehicle History Model
const VehicleHistory = sequelize.define('VehicleHistory', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vehicleMake: { type: DataTypes.STRING, allowNull: false },
  vehicleModel: { type: DataTypes.STRING, allowNull: false },
  vehicleYear: { type: DataTypes.INTEGER, allowNull: false },
  vin: { type: DataTypes.STRING, allowNull: false },
  owners: { type: DataTypes.INTEGER },
  accidents: { type: DataTypes.INTEGER, defaultValue: 0 },
  serviceRecords: { type: DataTypes.INTEGER, defaultValue: 0 },
  titleStatus: { type: DataTypes.STRING, defaultValue: 'clean' },
  lastServiceDate: { type: DataTypes.DATEONLY },
  odometerReadings: { type: DataTypes.JSONB },
  aiAnalysis: { type: DataTypes.JSONB }
}, { tableName: 'vehicle_histories', timestamps: true });

// Recall Alert Model
const RecallAlert = sequelize.define('RecallAlert', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vehicleMake: { type: DataTypes.STRING, allowNull: false },
  vehicleModel: { type: DataTypes.STRING, allowNull: false },
  vehicleYear: { type: DataTypes.INTEGER, allowNull: false },
  vin: { type: DataTypes.STRING },
  recallNumber: { type: DataTypes.STRING },
  component: { type: DataTypes.STRING, allowNull: false },
  summary: { type: DataTypes.TEXT },
  riskLevel: { type: DataTypes.ENUM('low', 'moderate', 'high', 'critical'), defaultValue: 'moderate' },
  status: { type: DataTypes.ENUM('open', 'completed', 'pending_parts', 'scheduled'), defaultValue: 'open' },
  recallDate: { type: DataTypes.DATEONLY },
  remedy: { type: DataTypes.TEXT },
  affectedUnits: { type: DataTypes.INTEGER },
  aiAnalysis: { type: DataTypes.JSONB }
}, { tableName: 'recall_alerts', timestamps: true });

// Insurance Estimate Model
const InsuranceEstimate = sequelize.define('InsuranceEstimate', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vehicleMake: { type: DataTypes.STRING, allowNull: false },
  vehicleModel: { type: DataTypes.STRING, allowNull: false },
  vehicleYear: { type: DataTypes.INTEGER, allowNull: false },
  vin: { type: DataTypes.STRING },
  driverAge: { type: DataTypes.INTEGER },
  driverState: { type: DataTypes.STRING },
  coverageType: { type: DataTypes.ENUM('liability', 'collision', 'comprehensive', 'full'), defaultValue: 'full' },
  deductible: { type: DataTypes.FLOAT, defaultValue: 500 },
  annualMileage: { type: DataTypes.INTEGER },
  drivingRecord: { type: DataTypes.ENUM('clean', 'minor_violations', 'major_violations', 'accidents'), defaultValue: 'clean' },
  estimatedMonthly: { type: DataTypes.FLOAT },
  estimatedAnnual: { type: DataTypes.FLOAT },
  riskScore: { type: DataTypes.FLOAT },
  aiAnalysis: { type: DataTypes.JSONB }
}, { tableName: 'insurance_estimates', timestamps: true });

// Maintenance Schedule Model
const MaintenanceSchedule = sequelize.define('MaintenanceSchedule', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vehicleMake: { type: DataTypes.STRING, allowNull: false },
  vehicleModel: { type: DataTypes.STRING, allowNull: false },
  vehicleYear: { type: DataTypes.INTEGER, allowNull: false },
  vin: { type: DataTypes.STRING },
  mileage: { type: DataTypes.INTEGER },
  serviceType: { type: DataTypes.STRING, allowNull: false },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'), defaultValue: 'medium' },
  status: { type: DataTypes.ENUM('upcoming', 'overdue', 'completed', 'skipped'), defaultValue: 'upcoming' },
  scheduledDate: { type: DataTypes.DATEONLY },
  completedDate: { type: DataTypes.DATEONLY },
  estimatedCost: { type: DataTypes.FLOAT },
  intervalMiles: { type: DataTypes.INTEGER },
  notes: { type: DataTypes.TEXT },
  aiAnalysis: { type: DataTypes.JSONB }
}, { tableName: 'maintenance_schedules', timestamps: true });

// Parts Pricing Model
const PartsPricing = sequelize.define('PartsPricing', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  vehicleMake: { type: DataTypes.STRING, allowNull: false },
  vehicleModel: { type: DataTypes.STRING, allowNull: false },
  vehicleYear: { type: DataTypes.INTEGER, allowNull: false },
  partName: { type: DataTypes.STRING, allowNull: false },
  partNumber: { type: DataTypes.STRING },
  category: { type: DataTypes.STRING },
  oemPrice: { type: DataTypes.FLOAT },
  aftermarketPrice: { type: DataTypes.FLOAT },
  usedPrice: { type: DataTypes.FLOAT },
  laborCost: { type: DataTypes.FLOAT },
  availability: { type: DataTypes.ENUM('in_stock', 'limited', 'backordered', 'discontinued'), defaultValue: 'in_stock' },
  supplier: { type: DataTypes.STRING },
  notes: { type: DataTypes.TEXT },
  aiAnalysis: { type: DataTypes.JSONB }
}, { tableName: 'parts_pricing', timestamps: true });

module.exports = {
  sequelize,
  User,
  Inspection,
  Compliance,
  ConditionScore,
  MarketValue,
  DamageReport,
  VehicleHistory,
  RecallAlert,
  InsuranceEstimate,
  MaintenanceSchedule,
  PartsPricing
};
