const express = require('express');
const { MarketValue } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const items = await MarketValue.findAll({ order: [['createdAt', 'DESC']] });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await MarketValue.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await MarketValue.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await MarketValue.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await MarketValue.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const item = await MarketValue.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const prompt = `You are an expert vehicle market analyst. Estimate the market value for this vehicle.

Vehicle: ${item.vehicleYear} ${item.vehicleMake} ${item.vehicleModel}
VIN: ${item.vin || 'N/A'}
Mileage: ${item.mileage || 'N/A'}
Condition: ${item.condition || 'N/A'}
Location: ${item.location || 'N/A'}

Provide a comprehensive market valuation including:
1. Estimated Market Value (low, mid, high range)
2. Private Party Value
3. Dealer Retail Value
4. Trade-In Value
5. Market Trend Analysis (rising/stable/declining)
6. Comparable Sales Data (5 similar vehicles)
7. Price Factors (positive and negative)
8. Best Time to Sell/Buy
9. Negotiation Tips
10. Regional Price Variations

Format your response as a structured valuation report.`;

    const aiResult = await callOpenRouter(prompt, 'You are an expert automotive market analyst specializing in vehicle valuations.');
    await item.update({ aiAnalysis: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
    res.json({ ...item.toJSON(), aiAnalysis: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
