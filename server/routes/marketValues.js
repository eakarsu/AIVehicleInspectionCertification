const express = require('express');
const { MarketValue, sequelize } = require('../models');
const auth = require('../middleware/auth');
const aiRateLimiter = require('../middleware/aiRateLimiter');
const { callOpenRouter, parseAIJson, persistAIResult } = require('../services/openrouter');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { count, rows } = await MarketValue.findAndCountAll({ order: [['createdAt', 'DESC']], limit, offset });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await MarketValue.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await MarketValue.create(req.body);
    res.status(201).json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await MarketValue.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await MarketValue.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/:id/analyze', auth, aiRateLimiter, async (req, res) => {
  try {
    const item = await MarketValue.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const prompt = `Value ${item.vehicleYear} ${item.vehicleMake} ${item.vehicleModel}, ${item.mileage || 'N/A'} miles, condition: ${item.condition || 'good'}, location: ${item.location || 'US'}. Return ONLY valid JSON:
{"estimated_value":<number>,"range":{"low":<number>,"high":<number>},"factors":["..."],"comparable_vehicles":["..."]}`;

    const aiResult = await callOpenRouter(prompt, 'You are an automotive market valuation expert. Return ONLY valid JSON.');
    const parsed = parseAIJson(aiResult.content) || { estimated_value: 0, range: { low: 0, high: 0 }, factors: [], comparable_vehicles: [] };

    await item.update({ aiAnalysis: { ...parsed, model: aiResult.model, analyzedAt: new Date() } });
    await persistAIResult(sequelize, req.user?.id, 'market-values/analyze', { id: item.id }, parsed);

    res.json({ ...item.toJSON(), aiAnalysis: { ...parsed, model: aiResult.model, analyzedAt: new Date() } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
