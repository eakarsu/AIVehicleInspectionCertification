const express = require('express');
const auth = require('../middleware/auth');
const aiRateLimiter = require('../middleware/aiRateLimiter');
const { callOpenRouter, parseAIJson, persistAIResult } = require('../services/openrouter');
const { sequelize } = require('../models');
const router = express.Router();

// POST /api/ai/predictive-maintenance
// Estimate maintenance needs based on vehicle attributes
router.post('/predictive-maintenance', auth, aiRateLimiter, async (req, res) => {
  try {
    const { vehicle, history, mileage, ageYears, conditionScore } = req.body || {};
    const systemPrompt = 'You are an expert automotive maintenance analyst. Always reply with valid JSON.';
    const prompt = `Given this vehicle data, predict the next likely maintenance items in the next 12 months and rough cost ranges.\n\nVehicle: ${JSON.stringify(vehicle || {})}\nMileage: ${mileage ?? 'unknown'}\nAge (years): ${ageYears ?? 'unknown'}\nCondition score (1-100): ${conditionScore ?? 'unknown'}\nRecent history: ${JSON.stringify(history || [])}\n\nReturn JSON: { "items": [{ "name": "", "rationale": "", "priority": "high|medium|low", "estimatedCostUsd": 0, "expectedMonths": 0 }], "summary": "" }`;
    const aiResult = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(aiResult.content) || { raw: aiResult.content };
    await persistAIResult(sequelize, req.user?.id || req.user?.userId, 'predictive-maintenance', { mileage, ageYears, conditionScore }, parsed);
    res.json({ result: parsed, model: aiResult.model });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/insurance-estimate
// Generate an insurance repair-cost estimate from a damage description
router.post('/insurance-estimate', auth, aiRateLimiter, async (req, res) => {
  try {
    const { damageDescription, vehicle, region } = req.body || {};
    if (!damageDescription) return res.status(400).json({ error: 'damageDescription is required' });
    const systemPrompt = 'You are an experienced auto insurance claims adjuster. Always reply with valid JSON.';
    const prompt = `Estimate repair cost ranges for this damage:\n\nVehicle: ${JSON.stringify(vehicle || {})}\nRegion: ${region || 'US'}\nDescription: ${damageDescription}\n\nReturn JSON: { "lineItems": [{ "part": "", "labor": 0, "materials": 0, "subtotal": 0 }], "totalLow": 0, "totalHigh": 0, "currency": "USD", "notes": "" }`;
    const aiResult = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(aiResult.content) || { raw: aiResult.content };
    await persistAIResult(sequelize, req.user?.id || req.user?.userId, 'insurance-estimate', { damageDescription, region }, parsed);
    res.json({ result: parsed, model: aiResult.model });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/recall-summary
// Summarize recall alerts and recommend customer messaging
router.post('/recall-summary', auth, aiRateLimiter, async (req, res) => {
  try {
    const { recall, vehicleCount } = req.body || {};
    if (!recall) return res.status(400).json({ error: 'recall is required' });
    const systemPrompt = 'You are a fleet compliance specialist. Always reply with valid JSON.';
    const prompt = `Summarize this manufacturer recall and draft owner notification text.\n\nRecall: ${JSON.stringify(recall)}\nAffected vehicles in fleet: ${vehicleCount ?? 'unknown'}\n\nReturn JSON: { "summary": "", "severity": "low|medium|high|critical", "ownerNotification": "", "internalActions": ["..."] }`;
    const aiResult = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(aiResult.content) || { raw: aiResult.content };
    await persistAIResult(sequelize, req.user?.id || req.user?.userId, 'recall-summary', { vehicleCount }, parsed);
    res.json({ result: parsed, model: aiResult.model });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/nhtsa-recall-lookup
// Audit-recommended (NEEDS-CREDS): OEM recall database integration via NHTSA.
// PRODUCT-DECISION: NHTSA's public vPIC + recalls API is keyless, but production usage should
// rotate behind an api.data.gov DATA_GOV_API_KEY. We attempt the keyless endpoint by default;
// if NHTSA_API_KEY env is set we send it as `api_key` query param. The response is augmented
// with an AI-generated severity/notification summary by reusing /recall-summary's prompt.
// ENV (optional): NHTSA_API_KEY — if you require a registered key for higher quotas.
// ENV (required for AI summary): OPENROUTER_API_KEY — returns 503 missing if unset.
router.post('/nhtsa-recall-lookup', auth, aiRateLimiter, async (req, res) => {
  try {
    const { make, model, year, vin } = req.body || {};
    if (!vin && !(make && model && year)) {
      return res.status(400).json({ error: 'Provide either vin OR (make, model, year).' });
    }
    const _orKey = process.env.OPENROUTER_API_KEY;
    if (!_orKey || _orKey === 'your_openrouter_api_key_here' || _orKey === 'your-openrouter-api-key-here') {
      return res.status(503).json({ error: 'AI not configured.', missing: 'OPENROUTER_API_KEY' });
    }

    const https = require('https');
    const apiKeyParam = process.env.NHTSA_API_KEY ? `?api_key=${encodeURIComponent(process.env.NHTSA_API_KEY)}` : '';
    let nhtsaPath;
    if (vin) {
      nhtsaPath = `/recalls/recallsByVehicle?vin=${encodeURIComponent(vin)}` + (apiKeyParam ? '&' + apiKeyParam.slice(1) : '');
    } else {
      nhtsaPath = `/recalls/recallsByVehicle?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}&modelYear=${encodeURIComponent(year)}` + (apiKeyParam ? '&' + apiKeyParam.slice(1) : '');
    }

    const fetchNhtsa = () => new Promise((resolve) => {
      const opts = {
        hostname: 'api.nhtsa.gov',
        path: nhtsaPath,
        method: 'GET',
        timeout: 10000,
        headers: { 'Accept': 'application/json', 'User-Agent': 'AIVehicleInspection/1.0' },
      };
      const reqN = https.request(opts, (r) => {
        let buf = '';
        r.on('data', (c) => { buf += c; });
        r.on('end', () => {
          try { resolve({ ok: r.statusCode < 400, status: r.statusCode, data: JSON.parse(buf) }); }
          catch (e) { resolve({ ok: false, status: r.statusCode, data: null, error: 'parse_error' }); }
        });
      });
      reqN.on('error', (e) => resolve({ ok: false, status: 0, error: e.message }));
      reqN.on('timeout', () => { reqN.destroy(); resolve({ ok: false, status: 0, error: 'timeout' }); });
      reqN.end();
    });

    const nhtsaResp = await fetchNhtsa();
    const recalls = (nhtsaResp.data && Array.isArray(nhtsaResp.data.results)) ? nhtsaResp.data.results : [];

    if (!nhtsaResp.ok || recalls.length === 0) {
      return res.json({
        nhtsa_status: nhtsaResp.status,
        nhtsa_error: nhtsaResp.error || null,
        query: vin ? { vin } : { make, model, year },
        recalls: [],
        ai_summary: null,
        notes: nhtsaResp.ok ? 'No NHTSA recalls returned for this query.' : 'NHTSA upstream not reachable.',
        nhtsa_api_key_configured: !!process.env.NHTSA_API_KEY,
      });
    }

    // Summarise via existing AI helper
    const systemPrompt = 'You are an automotive recall compliance analyst. Always reply with valid JSON.';
    const prompt = `Summarize the following NHTSA recall records for an owner-notification dashboard. Group by severity, list customer-facing actions, and flag any safety-critical items.\n\nRecalls: ${JSON.stringify(recalls).slice(0, 12000)}\n\nReturn JSON: { "summary": "", "severity": "low|medium|high|critical", "by_component": [{"component": "", "count": 0, "highest_severity": "" }], "owner_notification": "", "internal_actions": ["..."] }`;
    const aiResult = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(aiResult.content) || { raw: aiResult.content };
    await persistAIResult(sequelize, req.user?.id || req.user?.userId, 'nhtsa-recall-lookup', { make, model, year, vin: vin || null, count: recalls.length }, parsed);

    res.json({
      nhtsa_status: nhtsaResp.status,
      query: vin ? { vin } : { make, model, year },
      recall_count: recalls.length,
      recalls,
      ai_summary: parsed,
      model: aiResult.model,
      nhtsa_api_key_configured: !!process.env.NHTSA_API_KEY,
    });
  } catch (error) {
    console.error('nhtsa-recall-lookup error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/parts-price-monitor
// Audit-recommended (NEEDS-PRODUCT-DECISION): Parts price monitoring.
// PRODUCT-DECISION: Without a contracted supplier feed, we use AI as a price-band estimator
// based on part name + vehicle context. Output is a low/median/high USD range per part with
// rationale and a "confidence" flag. NOT a real-time market price; clearly labeled advisory.
// ENV: OPENROUTER_API_KEY — 503 missing if unset.
router.post('/parts-price-monitor', auth, aiRateLimiter, async (req, res) => {
  try {
    const { parts, vehicle, region, currency } = req.body || {};
    if (!Array.isArray(parts) || parts.length === 0) {
      return res.status(400).json({ error: 'parts must be a non-empty array of part names.' });
    }
    if (parts.length > 30) {
      return res.status(400).json({ error: 'Max 30 parts per request.' });
    }
    const _orKey = process.env.OPENROUTER_API_KEY;
    if (!_orKey || _orKey === 'your_openrouter_api_key_here' || _orKey === 'your-openrouter-api-key-here') {
      return res.status(503).json({ error: 'AI not configured.', missing: 'OPENROUTER_API_KEY' });
    }

    const systemPrompt = 'You are an automotive parts pricing analyst. Reply ONLY with valid JSON. Be transparent: when uncertain, say so via the confidence field.';
    const prompt = `Estimate market price ranges for these parts. This is an advisory estimate, not a live quote.\n\nParts: ${JSON.stringify(parts)}\nVehicle: ${JSON.stringify(vehicle || {})}\nRegion: ${region || 'US'}\nCurrency: ${currency || 'USD'}\n\nReturn JSON: { "currency": "USD", "items": [{"part": "", "low": 0, "median": 0, "high": 0, "oem_premium_pct": 0, "confidence": "low|medium|high", "notes": ""}], "estimate_disclaimer": "" }`;
    const aiResult = await callOpenRouter(prompt, systemPrompt);
    const parsed = parseAIJson(aiResult.content) || { raw: aiResult.content };
    await persistAIResult(sequelize, req.user?.id || req.user?.userId, 'parts-price-monitor', { count: parts.length, region }, parsed);

    res.json({ result: parsed, model: aiResult.model, supplier_feed_configured: !!process.env.PARTS_SUPPLIER_API_KEY });
  } catch (error) {
    console.error('parts-price-monitor error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
