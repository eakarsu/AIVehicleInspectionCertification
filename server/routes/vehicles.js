const express = require('express');
const { sequelize } = require('../models');
const auth = require('../middleware/auth');
const aiRateLimiter = require('../middleware/aiRateLimiter');
const { callOpenRouter, parseAIJson, persistAIResult } = require('../services/openrouter');
const router = express.Router();

// VIN Decoder
router.post('/decode-vin', auth, aiRateLimiter, async (req, res) => {
  try {
    const { vin } = req.body;
    if (!vin) return res.status(400).json({ error: 'VIN is required' });
    if (vin.length !== 17) return res.status(400).json({ error: 'VIN must be 17 characters' });

    const prompt = `Decode this VIN: ${vin}. Return ONLY valid JSON:
{"year":<number>,"make":"...","model":"...","engine":"...","transmission":"...","country_of_origin":"...","plant":"...","recall_summary":"brief summary of known recalls for this make/model/year"}`;

    const aiResult = await callOpenRouter(prompt, 'You are a VIN decoding expert with knowledge of NHTSA recall data. Return ONLY valid JSON.');
    const parsed = parseAIJson(aiResult.content) || { year: null, make: 'Unknown', model: 'Unknown', engine: 'Unknown', transmission: 'Unknown', country_of_origin: 'Unknown', plant: 'Unknown', recall_summary: 'Unable to decode' };

    await persistAIResult(sequelize, req.user?.id, 'vehicles/decode-vin', { vin }, parsed);
    res.json({ vin, ...parsed, model: aiResult.model });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check recalls for a vehicle by id
router.post('/:id/check-recalls', auth, aiRateLimiter, async (req, res) => {
  try {
    const { RecallAlert } = require('../models');
    const { Inspection } = require('../models');
    const inspection = await Inspection.findByPk(req.params.id);
    if (!inspection) return res.status(404).json({ error: 'Inspection not found' });

    const prompt = `Generate a recall risk assessment for ${inspection.vehicleYear} ${inspection.vehicleMake} ${inspection.vehicleModel}, VIN: ${inspection.vin || 'N/A'}. Return ONLY valid JSON:
{"recall_risk":"low|medium|high","known_recalls":["..."],"components_at_risk":["..."],"nhtsa_investigation_status":"...","recommended_actions":["..."]}`;

    const aiResult = await callOpenRouter(prompt, 'You are an automotive safety expert with NHTSA recall knowledge. Return ONLY valid JSON.');
    const parsed = parseAIJson(aiResult.content) || { recall_risk: 'unknown', known_recalls: [], components_at_risk: [], nhtsa_investigation_status: 'N/A', recommended_actions: [] };

    await persistAIResult(sequelize, req.user?.id, 'vehicles/check-recalls', { id: req.params.id, vin: inspection.vin }, parsed);
    res.json({ vehicle: `${inspection.vehicleYear} ${inspection.vehicleMake} ${inspection.vehicleModel}`, vin: inspection.vin, ...parsed, model: aiResult.model });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
