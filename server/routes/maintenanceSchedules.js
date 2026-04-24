const express = require('express');
const { MaintenanceSchedule } = require('../models');
const auth = require('../middleware/auth');
const { callOpenRouter } = require('../services/openrouter');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  try { const items = await MaintenanceSchedule.findAll({ order: [['createdAt', 'DESC']] }); res.json(items); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try { const item = await MaintenanceSchedule.findByPk(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); res.json(item); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/', auth, async (req, res) => {
  try { const item = await MaintenanceSchedule.create(req.body); res.status(201).json(item); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try { const item = await MaintenanceSchedule.findByPk(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); await item.update(req.body); res.json(item); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try { const item = await MaintenanceSchedule.findByPk(req.params.id); if (!item) return res.status(404).json({ error: 'Not found' }); await item.destroy(); res.json({ message: 'Deleted successfully' }); } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/:id/analyze', auth, async (req, res) => {
  try {
    const item = await MaintenanceSchedule.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const prompt = `You are an expert automotive maintenance advisor. Analyze this maintenance schedule item.

Vehicle: ${item.vehicleYear} ${item.vehicleMake} ${item.vehicleModel}
VIN: ${item.vin || 'N/A'}
Current Mileage: ${item.mileage || 'N/A'}
Service Type: ${item.serviceType}
Priority: ${item.priority}
Status: ${item.status}
Scheduled Date: ${item.scheduledDate || 'N/A'}
Interval (miles): ${item.intervalMiles || 'N/A'}
Notes: ${item.notes || 'N/A'}

Provide a comprehensive maintenance analysis including:
1. Service Importance Rating (1-10)
2. Detailed Description of This Service
3. What Happens If Skipped or Delayed
4. Recommended Service Interval
5. DIY vs Professional Recommendation
6. Estimated Cost Breakdown (parts + labor)
7. Time Required for Service
8. Related Services to Bundle
9. Quality Parts Recommendations (OEM vs aftermarket)
10. Complete Maintenance Schedule for This Vehicle (next 12 months)

Format your response as a structured maintenance advisory report.`;

    const aiResult = await callOpenRouter(prompt, 'You are an expert automotive maintenance advisor with ASE certifications and manufacturer training.');
    await item.update({ aiAnalysis: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
    res.json({ ...item.toJSON(), aiAnalysis: { analysis: aiResult.content, model: aiResult.model, analyzedAt: new Date() } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
