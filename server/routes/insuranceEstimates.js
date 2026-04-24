const express = require('express');
const { InsuranceEstimate } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try { const items = await InsuranceEstimate.findAll({ order: [['createdAt', 'DESC']] }); res.json(items); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try { const item = await InsuranceEstimate.findByPk(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try { const item = await InsuranceEstimate.create(req.body); res.status(201).json(item); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try { const item = await InsuranceEstimate.findByPk(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); await item.update(req.body); res.json(item); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try { const item = await InsuranceEstimate.findByPk(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); await item.destroy(); res.json({ message: 'Deleted successfully' }); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const item = await InsuranceEstimate.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const prompt = `You are an expert auto insurance analyst. Estimate insurance costs for this vehicle and driver profile.

Vehicle: ${item.vehicleYear} ${item.vehicleMake} ${item.vehicleModel}
VIN: ${item.vin || 'N/A'}
Driver Age: ${item.driverAge || 'N/A'}
Driver State: ${item.driverState || 'N/A'}
Coverage Type: ${item.coverageType}
Deductible: $${item.deductible || 500}
Annual Mileage: ${item.annualMileage || 'N/A'}
Driving Record: ${item.drivingRecord}

Provide a comprehensive insurance analysis including:
1. Estimated Monthly Premium Range
2. Estimated Annual Premium Range
3. Coverage Breakdown (liability, collision, comprehensive, uninsured motorist)
4. Risk Score Assessment (1-100)
5. Factors Affecting Premium (positive and negative)
6. Discount Opportunities (bundling, safe driver, good student, etc.)
7. Recommended Coverage Levels
8. Deductible Optimization Analysis
9. State-Specific Requirements for ${item.driverState || 'the driver\'s state'}
10. Money-Saving Tips & Recommendations

Format your response as a structured insurance estimate report.`;

    const aiResult = await callOpenRouter(prompt, 'You are an expert auto insurance analyst with deep knowledge of US auto insurance markets and regulations.');
    await item.update({ aiAnalysis: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
    res.json({ ...item.toJSON(), aiAnalysis: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
