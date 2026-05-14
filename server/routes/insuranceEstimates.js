const express = require('express');
const { InsuranceEstimate, sequelize } = require('../models');
const auth = require('../middleware/auth');
const aiRateLimiter = require('../middleware/aiRateLimiter');
const { callOpenRouter, parseAIJson, persistAIResult } = require('../services/openrouter');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { count, rows } = await InsuranceEstimate.findAndCountAll({ order: [['createdAt', 'DESC']], limit, offset });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await InsuranceEstimate.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await InsuranceEstimate.create(req.body);
    res.status(201).json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await InsuranceEstimate.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await InsuranceEstimate.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/:id/analyze', auth, aiRateLimiter, async (req, res) => {
  try {
    const item = await InsuranceEstimate.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const prompt = `Estimate insurance for ${item.vehicleYear} ${item.vehicleMake} ${item.vehicleModel}, driver age: ${item.driverAge || 'N/A'}, state: ${item.driverState || 'N/A'}, coverage: ${item.coverageType}, driving record: ${item.drivingRecord}. Return ONLY valid JSON:
{"monthly_estimate":150,"annual_estimate":1800,"risk_score":45,"factors":["..."],"recommendations":["..."]}`;

    const aiResult = await callOpenRouter(prompt, 'You are an insurance actuary expert. Return ONLY valid JSON.');
    const parsed = parseAIJson(aiResult.content) || { monthly_estimate: 0, annual_estimate: 0, risk_score: 50, factors: [], recommendations: [] };

    await item.update({ aiAnalysis: { ...parsed, model: aiResult.model, analyzedAt: new Date() } });
    await persistAIResult(sequelize, req.user?.id, 'insurance-estimates/analyze', { id: item.id }, parsed);

    res.json({ ...item.toJSON(), aiAnalysis: { ...parsed, model: aiResult.model, analyzedAt: new Date() } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
