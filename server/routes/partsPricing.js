const express = require('express');
const { PartsPricing, sequelize } = require('../models');
const auth = require('../middleware/auth');
const aiRateLimiter = require('../middleware/aiRateLimiter');
const { callOpenRouter, parseAIJson, persistAIResult } = require('../services/openrouter');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { count, rows } = await PartsPricing.findAndCountAll({ order: [['createdAt', 'DESC']], limit, offset });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await PartsPricing.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await PartsPricing.create(req.body);
    res.status(201).json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await PartsPricing.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await PartsPricing.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/:id/analyze', auth, aiRateLimiter, async (req, res) => {
  try {
    const item = await PartsPricing.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const prompt = `Price "${item.partName}" for ${item.vehicleYear} ${item.vehicleMake} ${item.vehicleModel}, category: ${item.category || 'N/A'}. Return ONLY valid JSON:
{"oem_price":150,"aftermarket_price":85,"labor_hours":1.5,"labor_cost":120,"total_estimate":205,"quality_comparison":"Aftermarket has 90% of OEM quality","best_value":"aftermarket"}`;

    const aiResult = await callOpenRouter(prompt, 'You are an automotive parts pricing expert. Return ONLY valid JSON.');
    const parsed = parseAIJson(aiResult.content) || { oem_price: 0, aftermarket_price: 0, labor_hours: 1, labor_cost: 0, total_estimate: 0, quality_comparison: 'Unknown', best_value: 'oem' };

    await item.update({ aiAnalysis: { ...parsed, model: aiResult.model, analyzedAt: new Date() } });
    await persistAIResult(sequelize, req.user?.id, 'parts-pricing/analyze', { id: item.id }, parsed);

    res.json({ ...item.toJSON(), aiAnalysis: { ...parsed, model: aiResult.model, analyzedAt: new Date() } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
