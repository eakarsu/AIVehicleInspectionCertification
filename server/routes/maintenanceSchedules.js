const express = require('express');
const { MaintenanceSchedule, sequelize } = require('../models');
const auth = require('../middleware/auth');
const aiRateLimiter = require('../middleware/aiRateLimiter');
const { callOpenRouter, parseAIJson, persistAIResult } = require('../services/openrouter');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { count, rows } = await MaintenanceSchedule.findAndCountAll({ order: [['createdAt', 'DESC']], limit, offset });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const item = await MaintenanceSchedule.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = await MaintenanceSchedule.create(req.body);
    res.status(201).json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await MaintenanceSchedule.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await MaintenanceSchedule.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/:id/analyze', auth, aiRateLimiter, async (req, res) => {
  try {
    const item = await MaintenanceSchedule.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const prompt = `Analyze maintenance for ${item.vehicleYear} ${item.vehicleMake} ${item.vehicleModel}, service: ${item.serviceType}, mileage: ${item.mileage || 'N/A'}, priority: ${item.priority}. Return ONLY valid JSON:
{"priority":"high","estimated_cost":250,"next_service_miles":5000,"related_services":["Air filter","Cabin filter"],"diy_difficulty":"moderate"}`;

    const aiResult = await callOpenRouter(prompt, 'You are an automotive maintenance expert. Return ONLY valid JSON.');
    const parsed = parseAIJson(aiResult.content) || { priority: item.priority || 'medium', estimated_cost: 0, next_service_miles: 5000, related_services: [], diy_difficulty: 'professional' };

    await item.update({ aiAnalysis: { ...parsed, model: aiResult.model, analyzedAt: new Date() } });
    await persistAIResult(sequelize, req.user?.id, 'maintenance-schedules/analyze', { id: item.id }, parsed);

    res.json({ ...item.toJSON(), aiAnalysis: { ...parsed, model: aiResult.model, analyzedAt: new Date() } });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
