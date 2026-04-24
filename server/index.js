const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { sequelize } = require('./models');

const app = express();
const PORT = process.env.SERVER_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
async function start() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');
    await sequelize.sync({ alter: true });
    console.log('Database synced');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    process.exit(1);
  }
}

start();
