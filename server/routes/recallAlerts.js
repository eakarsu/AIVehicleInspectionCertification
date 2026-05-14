const express = require('express');
const { RecallAlert, sequelize } = require('../models');
const auth = require('../middleware/auth');
const aiRateLimiter = require('../middleware/aiRateLimiter');
const { callOpenRouter, parseAIJson, persistAIResult } = require('../services/openrouter');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { count, rows } = await RecallAlert.findAndCountAll({ order: [['createdAt', 'DESC']], limit, offset });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await RecallAlert.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await RecallAlert.create(req.body);
    res.status(201).json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await RecallAlert.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await RecallAlert.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/:id/analyze', auth, aiRateLimiter, async (req, res) => {
  try {
    const item = await RecallAlert.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const prompt = `Analyze recall for ${item.vehicleYear} ${item.vehicleMake} ${item.vehicleModel}, component: ${item.component}, summary: ${item.summary || 'N/A'}. Return ONLY valid JSON:
{"safety_risk":"high","urgency":"Schedule immediately","remedy_steps":["Contact dealer","Schedule appointment"],"estimated_completion_days":3,"cost_to_owner":0}`;

    const aiResult = await callOpenRouter(prompt, 'You are an automotive safety expert. Return ONLY valid JSON.');
    const parsed = parseAIJson(aiResult.content) || { safety_risk: item.riskLevel || 'moderate', urgency: 'Schedule soon', remedy_steps: [], estimated_completion_days: 7, cost_to_owner: 0 };

    await item.update({ aiAnalysis: { ...parsed, model: aiResult.model, analyzedAt: new Date() } });
    await persistAIResult(sequelize, req.user?.id, 'recall-alerts/analyze', { id: item.id }, parsed);

    res.json({ ...item.toJSON(), aiAnalysis: { ...parsed, model: aiResult.model, analyzedAt: new Date() } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
