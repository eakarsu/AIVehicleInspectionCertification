const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/inspections', require('./routes/inspections'));
app.use('/api/compliance', require('./routes/compliance'));
app.use('/api/condition-scores', require('./routes/conditionScores'));
app.use('/api/market-values', require('./routes/marketValues'));
app.use('/api/damage-reports', require('./routes/damageReports'));
app.use('/api/vehicle-history', require('./routes/vehicleHistory'));
app.use('/api/recall-alerts', require('./routes/recallAlerts'));
app.use('/api/insurance-estimates', require('./routes/insuranceEstimates'));
app.use('/api/maintenance-schedules', require('./routes/maintenanceSchedules'));
app.use('/api/parts-pricing', require('./routes/partsPricing'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/adas-calibration-readiness', require('./routes/adasCalibrationReadiness'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    await sequelize.sync({ force: false });
    console.log('Database synced');

    // Create ai_results table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS ai_results (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        endpoint VARCHAR(100),
        input_data JSONB,
        result JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create uploads directory
    const fs = require('fs');
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    app.use('/api/vision-damage-assessment', require('./routes/visionDamageAssessment')); app.use('/api/predictive-maintenance', require('./routes/predictiveMaintenance')); app.use('/api/parts-price-monitor', require('./routes/partsPriceMonitor')); app.use('/api/repair-shop-network', require('./routes/repairShopNetwork')); app.use('/api/insurance-claim-automation', require('./routes/insuranceClaimAutomation')); app.use('/api/vin-decoder', require('./routes/vinDecoder'));

// === Batch 08 Gaps & Frontend Mounts ===
app.use('/api/gap-critical-no-ai-for-damage-assessment-from-photos', require('./routes/gapCriticalNoAiForDamageAssessmentFromPhotos'));
app.use('/api/gap-no-predictive-maintenance-ml', require('./routes/gapNoPredictiveMaintenanceMl'));
app.use('/api/gap-no-insurance-estimate-generation-ai', require('./routes/gapNoInsuranceEstimateGenerationAi'));
app.use('/api/gap-no-fraud-detection-on-inspection-data', require('./routes/gapNoFraudDetectionOnInspectionData'));
app.use('/api/gap-no-integration-with-oem-recall-databases-only-manual', require('./routes/gapNoIntegrationWithOemRecallDatabasesOnlyManual'));
app.use('/api/gap-no-parts-supplier-integration', require('./routes/gapNoPartsSupplierIntegration'));
app.use('/api/gap-no-third-party-repair-shop-network', require('./routes/gapNoThirdPartyRepairShopNetwork'));
app.use('/api/gap-no-insurance-claim-integration-direct-insurer-api', require('./routes/gapNoInsuranceClaimIntegrationDirectInsurerApi'));
app.use('/api/gap-no-webhooks-notifications-for-recall-events', require('./routes/gapNoWebhooksNotificationsForRecallEvents'));
app.use('/api/gap-no-audit-logging', require('./routes/gapNoAuditLogging'));
app.use('/api/gap-no-customer-self-service-portal', require('./routes/gapNoCustomerSelfServicePortal'));

app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

start();
