const express = require('express');
const { VehicleHistory } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const items = await VehicleHistory.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await VehicleHistory.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await VehicleHistory.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await VehicleHistory.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await VehicleHistory.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const item = await VehicleHistory.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const prompt = `You are an expert vehicle history analyst. Analyze this vehicle's history report.

Vehicle: ${item.vehicleYear} ${item.vehicleMake} ${item.vehicleModel}
VIN: ${item.vin}
Number of Owners: ${item.owners || 'N/A'}
Reported Accidents: ${item.accidents}
Service Records: ${item.serviceRecords}
Title Status: ${item.titleStatus}
Last Service Date: ${item.lastServiceDate || 'N/A'}

Provide a comprehensive history analysis including:
1. Title History Analysis
2. Ownership History Assessment
3. Accident History Impact
4. Service History Evaluation
5. Odometer Verification Status
6. Recall Check Summary
7. Lien & Financial History
8. Risk Assessment Score (1-100)
9. Red Flags & Warnings
10. Overall History Rating & Recommendation

Format your response as a structured history report.`;

    const aiResult = await callOpenRouter(prompt, 'You are an expert vehicle history analyst specializing in pre-purchase assessments.');
    await item.update({ aiAnalysis: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
    res.json({ ...item.toJSON(), aiAnalysis: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
