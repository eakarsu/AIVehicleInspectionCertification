const express = require('express');
const { Inspection } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

// Get all
router.get('/', auth, async (req, res) => {
  try {
    const items = await Inspection.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Inspection.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create
router.post('/', auth, async (req, res) => {
  try {
    const item = await Inspection.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Inspection.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Inspection.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Inspection Analysis
router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const item = await Inspection.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const prompt = `You are an expert vehicle inspector. Analyze this vehicle inspection and provide a detailed report.

Vehicle: ${item.vehicleYear} ${item.vehicleMake} ${item.vehicleModel}
VIN: ${item.vin || 'N/A'}
Mileage: ${item.mileage || 'N/A'}
Inspector Notes: ${item.notes || 'No notes provided'}

Provide a comprehensive inspection report including:
1. Overall Assessment (Pass/Fail/Conditional)
2. Exterior Condition (rating 1-10 and details)
3. Interior Condition (rating 1-10 and details)
4. Mechanical Systems (rating 1-10 and details)
5. Electrical Systems (rating 1-10 and details)
6. Safety Features Check
7. Recommended Repairs (with estimated costs)
8. Final Recommendation (Buy/Don't Buy/Negotiate)

Format your response as a structured report.`;

    const aiResult = await callOpenRouter(prompt, 'You are an expert automotive inspector providing detailed vehicle inspection reports.');
    await item.update({ aiReport: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
    res.json({ ...item.toJSON(), aiReport: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
