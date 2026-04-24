const express = require('express');
const { ConditionScore } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const items = await ConditionScore.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await ConditionScore.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await ConditionScore.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await ConditionScore.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await ConditionScore.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const item = await ConditionScore.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const prompt = `You are an expert vehicle condition assessor. Score this vehicle's condition comprehensively.

Vehicle: ${item.vehicleYear} ${item.vehicleMake} ${item.vehicleModel}
VIN: ${item.vin || 'N/A'}
Mileage: ${item.mileage || 'N/A'}
Current Scores - Exterior: ${item.exteriorScore || 'N/A'}, Interior: ${item.interiorScore || 'N/A'}, Mechanical: ${item.mechanicalScore || 'N/A'}, Electrical: ${item.electricalScore || 'N/A'}
Details: ${item.details || 'No details provided'}

Provide a detailed condition scoring including:
1. Exterior Score (1-10) with detailed breakdown (paint, body panels, glass, trim, wheels)
2. Interior Score (1-10) with detailed breakdown (seats, dashboard, carpet, headliner, controls)
3. Mechanical Score (1-10) with detailed breakdown (engine, transmission, brakes, suspension, exhaust)
4. Electrical Score (1-10) with detailed breakdown (battery, alternator, lights, electronics, sensors)
5. Overall Condition Grade (A+ to F)
6. Comparable Vehicle Condition Rating
7. Depreciation Analysis Based on Condition
8. Maintenance Recommendations
9. Expected Remaining Lifespan
10. Condition Summary

Format your response as a structured condition report.`;

    const aiResult = await callOpenRouter(prompt, 'You are an expert automotive condition assessor with years of experience in vehicle grading.');
    await item.update({ aiAnalysis: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
    res.json({ ...item.toJSON(), aiAnalysis: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
