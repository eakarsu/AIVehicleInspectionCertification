const express = require('express');
const { Compliance } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const items = await Compliance.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Compliance.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await Compliance.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Compliance.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Compliance.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const item = await Compliance.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const prompt = `You are an expert in vehicle certification and state compliance regulations. Analyze the compliance status for this vehicle.

Vehicle: ${item.vehicleYear} ${item.vehicleMake} ${item.vehicleModel}
VIN: ${item.vin || 'N/A'}
State: ${item.state}
Current Emissions Status: ${item.emissionsStatus}
Current Safety Status: ${item.safetyStatus}

Provide a detailed compliance analysis including:
1. State-Specific Requirements for ${item.state}
2. Emissions Standards & Testing Requirements
3. Safety Inspection Requirements
4. Registration Requirements
5. Insurance Minimums
6. Special Provisions or Exemptions
7. Upcoming Regulatory Changes
8. Compliance Checklist with Pass/Fail items
9. Estimated Costs for Full Compliance
10. Recommended Actions & Timeline

Format your response as a structured compliance report.`;

    const aiResult = await callOpenRouter(prompt, 'You are an expert in US vehicle compliance regulations and state certification requirements.');
    await item.update({ aiAnalysis: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
    res.json({ ...item.toJSON(), aiAnalysis: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
