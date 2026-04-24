const express = require('express');
const { PartsPricing } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try { const items = await PartsPricing.findAll({ order: [['createdAt', 'DESC']] }); res.json(items); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try { const item = await PartsPricing.findByPk(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try { const item = await PartsPricing.create(req.body); res.status(201).json(item); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try { const item = await PartsPricing.findByPk(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); await item.update(req.body); res.json(item); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try { const item = await PartsPricing.findByPk(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); await item.destroy(); res.json({ message: 'Deleted successfully' }); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const item = await PartsPricing.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const prompt = `You are an expert auto parts specialist and pricing analyst. Analyze this parts pricing request.

Vehicle: ${item.vehicleYear} ${item.vehicleMake} ${item.vehicleModel}
Part Name: ${item.partName}
Part Number: ${item.partNumber || 'N/A'}
Category: ${item.category || 'N/A'}
OEM Price: $${item.oemPrice || 'N/A'}
Aftermarket Price: $${item.aftermarketPrice || 'N/A'}
Used Price: $${item.usedPrice || 'N/A'}
Labor Cost: $${item.laborCost || 'N/A'}
Availability: ${item.availability}
Notes: ${item.notes || 'N/A'}

Provide a comprehensive parts pricing analysis including:
1. Fair Market Price Range (OEM, aftermarket, used)
2. OEM vs Aftermarket Quality Comparison
3. Top Aftermarket Brand Recommendations
4. Where to Find Best Prices
5. Installation Complexity (DIY rating 1-10)
6. Estimated Labor Time & Cost
7. Compatible Part Numbers & Cross-References
8. Warranty Comparison (OEM vs aftermarket)
9. Common Issues with Cheap Alternatives
10. Total Cost of Ownership Analysis (part + labor + warranty)

Format your response as a structured parts pricing report.`;

    const aiResult = await callOpenRouter(prompt, 'You are an expert auto parts specialist with deep knowledge of OEM and aftermarket parts pricing.');
    await item.update({ aiAnalysis: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
    res.json({ ...item.toJSON(), aiAnalysis: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
