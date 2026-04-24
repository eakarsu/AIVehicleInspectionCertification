const express = require('express');
const { RecallAlert } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try { const items = await RecallAlert.findAll({ order: [['createdAt', 'DESC']] }); res.json(items); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try { const item = await RecallAlert.findByPk(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try { const item = await RecallAlert.create(req.body); res.status(201).json(item); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try { const item = await RecallAlert.findByPk(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); await item.update(req.body); res.json(item); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try { const item = await RecallAlert.findByPk(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); await item.destroy(); res.json({ message: 'Deleted successfully' }); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const item = await RecallAlert.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const prompt = `You are an expert in vehicle safety recalls and NHTSA regulations. Analyze this recall alert.

Vehicle: ${item.vehicleYear} ${item.vehicleMake} ${item.vehicleModel}
VIN: ${item.vin || 'N/A'}
Recall Number: ${item.recallNumber || 'N/A'}
Component: ${item.component}
Risk Level: ${item.riskLevel}
Status: ${item.status}
Summary: ${item.summary || 'N/A'}
Remedy: ${item.remedy || 'N/A'}
Affected Units: ${item.affectedUnits || 'N/A'}

Provide a comprehensive recall analysis including:
1. Safety Risk Assessment (1-10 scale)
2. Urgency Level & Recommended Timeline
3. Affected Component Deep Dive
4. Potential Failure Modes & Consequences
5. Temporary Safety Measures Until Repair
6. Recall Repair Process & What to Expect
7. Owner Rights & Legal Considerations
8. Impact on Vehicle Value
9. Related Recalls or Technical Service Bulletins
10. Recommendations for Owner

Format your response as a structured recall analysis report.`;

    const aiResult = await callOpenRouter(prompt, 'You are an expert in vehicle safety recalls, NHTSA regulations, and automotive safety engineering.');
    await item.update({ aiAnalysis: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
    res.json({ ...item.toJSON(), aiAnalysis: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
