const express = require('express');
const { DamageReport } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const items = await DamageReport.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await DamageReport.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await DamageReport.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await DamageReport.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await DamageReport.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const item = await DamageReport.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const prompt = `You are an expert vehicle damage assessor and auto body specialist. Analyze this damage report.

Vehicle: ${item.vehicleYear} ${item.vehicleMake} ${item.vehicleModel}
VIN: ${item.vin || 'N/A'}
Damage Type: ${item.damageType || 'N/A'}
Severity: ${item.severity}
Location on Vehicle: ${item.location || 'N/A'}
Description: ${item.description || 'No description provided'}

Provide a comprehensive damage analysis including:
1. Damage Severity Assessment (1-10 scale)
2. Affected Components List
3. Structural Integrity Impact
4. Safety Implications
5. Repair vs Replace Recommendations
6. Estimated Repair Cost Breakdown (parts + labor)
7. Repair Time Estimate
8. Insurance Claim Recommendations
9. Diminished Value Assessment
10. Repair Priority Level

Format your response as a structured damage assessment report.`;

    const aiResult = await callOpenRouter(prompt, 'You are an expert auto body specialist and damage assessor.');
    await item.update({ aiAnalysis: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
    res.json({ ...item.toJSON(), aiAnalysis: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
