const express = require('express');
const { Inspection, Compliance, RecallAlert, sequelize } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');
const router = express.Router();

// Fleet Summary
router.get('/fleet-summary', auth, async (req, res) => {
  try {
    const inspections = await Inspection.findAll({
      attributes: ['vehicleMake', 'vehicleModel', 'vehicleYear', 'overallStatus'],
      order: [['createdAt', 'DESC']]
    });

    // Aggregate by make/model/year
    const fleet = {};
    for (const i of inspections) {
      const key = `${i.vehicleYear} ${i.vehicleMake} ${i.vehicleModel}`;
      if (!fleet[key]) fleet[key] = { make: i.vehicleMake, model: i.vehicleModel, year: i.vehicleYear, total: 0, pass: 0, fail: 0, conditional: 0 };
      fleet[key].total++;
      if (i.overallStatus === 'pass') fleet[key].pass++;
      else if (i.overallStatus === 'fail') fleet[key].fail++;
      else fleet[key].conditional++;
    }

    const fleetArray = Object.entries(fleet).map(([key, val]) => ({
      ...val,
      complianceRate: val.total > 0 ? ((val.pass / val.total) * 100).toFixed(1) : '0'
    }));

    // Upcoming inspections (created in last 30 days without pass)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const upcoming = await Inspection.findAll({
      where: { overallStatus: { [Op.ne]: 'pass' }, createdAt: { [Op.gte]: thirtyDaysAgo } },
      limit: 10,
      order: [['createdAt', 'ASC']]
    });

    const totalInspections = await Inspection.count();
    const passCount = await Inspection.count({ where: { overallStatus: 'pass' } });
    const failCount = await Inspection.count({ where: { overallStatus: 'fail' } });
    const openRecalls = await RecallAlert.count({ where: { status: 'open' } });

    res.json({
      summary: {
        totalInspections,
        passCount,
        failCount,
        conditionalCount: totalInspections - passCount - failCount,
        complianceRate: totalInspections > 0 ? ((passCount / totalInspections) * 100).toFixed(1) : '0',
        openRecalls
      },
      fleetByModel: fleetArray,
      upcomingInspections: upcoming
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
