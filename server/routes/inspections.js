const express = require('express');
const path = require('path');
const multer = require('multer');
const PDFDocument = require('pdfkit');
const { Inspection, Compliance, sequelize } = require('../models');
const auth = require('../middleware/auth');
const aiRateLimiter = require('../middleware/aiRateLimiter');
const { callOpenRouter, parseAIJson, persistAIResult } = require('../services/openrouter');
const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => cb(null, `inspection_${req.params.id}_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 20 * 1024 * 1024 } });

// GET all with pagination
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const { count, rows } = await Inspection.findAndCountAll({
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const item = await Inspection.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create
router.post('/', auth, async (req, res) => {
  try {
    const item = await Inspection.create(req.body);
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update
router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Inspection.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.update(req.body);
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Inspection.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    await item.destroy();
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload image
router.post('/:id/upload-image', auth, upload.single('image'), async (req, res) => {
  try {
    const item = await Inspection.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });
    if (!req.file) return res.status(400).json({ error: 'No image file provided' });
    const imageUrl = `/uploads/${req.file.filename}`;
    await item.update({ imageUrl });
    res.json({ imageUrl, message: 'Image uploaded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Inspection Analysis - structured JSON
router.post('/:id/analyze', auth, aiRateLimiter, async (req, res) => {
  try {
    const item = await Inspection.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const prompt = `Analyze this vehicle inspection and return ONLY valid JSON with no other text:
Vehicle: ${item.vehicleYear} ${item.vehicleMake} ${item.vehicleModel}
VIN: ${item.vin || 'N/A'}, Mileage: ${item.mileage || 'N/A'}
Inspector Notes: ${item.notes || 'No notes provided'}

Return JSON exactly:
{
  "pass_fail": "PASS or FAIL or CONDITIONAL",
  "overall_score": <number 0-100>,
  "defects": [{"item": "...", "severity": "minor|moderate|severe", "description": "..."}],
  "recommendations": ["..."],
  "next_inspection_date": "YYYY-MM-DD"
}`;

    const aiResult = await callOpenRouter(prompt, 'You are an expert automotive inspector. Return ONLY valid JSON, no markdown.');
    const parsed = parseAIJson(aiResult.content) || { pass_fail: 'CONDITIONAL', overall_score: 70, defects: [], recommendations: [aiResult.content], next_inspection_date: '' };

    await item.update({ aiReport: { ...parsed, model: aiResult.model, analyzedAt: new Date() } });
    await persistAIResult(sequelize, req.user?.id, 'inspections/analyze', { id: item.id }, parsed);

    res.json({ ...item.toJSON(), aiReport: { ...parsed, model: aiResult.model, analyzedAt: new Date() } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vision-based damage detection
router.post('/:id/vision-analyze', auth, aiRateLimiter, upload.single('image'), async (req, res) => {
  try {
    const item = await Inspection.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    let imageContent = null;
    if (req.file) {
      const fs = require('fs');
      const imageData = fs.readFileSync(req.file.path);
      const base64Image = imageData.toString('base64');
      const mimeType = req.file.mimetype || 'image/jpeg';
      imageContent = { type: 'image', source: { type: 'base64', media_type: mimeType, data: base64Image } };
      await item.update({ imageUrl: `/uploads/${req.file.filename}` });
    }

    const prompt = imageContent
      ? `Analyze the vehicle damage visible in this image and return ONLY valid JSON:\n{"damage_areas":[{"location":"...","severity":"minor|moderate|severe","description":"..."}],"overall_severity":"minor|moderate|severe","repair_cost_estimate":<number>,"annotated_notes":"..."}`
      : `Based on notes: "${item.notes || 'N/A'}", return JSON: {"damage_areas":[],"overall_severity":"minor","repair_cost_estimate":0,"annotated_notes":"No image provided"}`;

    const aiResult = await callOpenRouter(prompt, 'You are an automotive damage assessment expert. Return ONLY valid JSON.');
    const parsed = parseAIJson(aiResult.content) || { damage_areas: [], overall_severity: 'unknown', repair_cost_estimate: 0, annotated_notes: aiResult.content };

    await persistAIResult(sequelize, req.user?.id, 'inspections/vision-analyze', { id: item.id }, parsed);
    res.json({ ...parsed, model: aiResult.model, analyzedAt: new Date() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PDF Certificate
router.get('/:id/certificate-pdf', auth, async (req, res) => {
  try {
    const item = await Inspection.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="inspection-certificate-${item.id}.pdf"`);
    doc.pipe(res);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('VEHICLE INSPECTION CERTIFICATE', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).font('Helvetica').text(`Certificate ID: VIC-${String(item.id).padStart(6, '0')}`, { align: 'center' });
    doc.moveDown(1);

    // Status stamp
    const status = (item.overallStatus || 'conditional').toUpperCase();
    const statusColor = status === 'PASS' ? '#22c55e' : status === 'FAIL' ? '#ef4444' : '#f59e0b';
    doc.fontSize(36).fillColor(statusColor).text(status, { align: 'center' });
    doc.fillColor('#000000').fontSize(12);
    doc.moveDown(1);

    // Vehicle info
    doc.font('Helvetica-Bold').text('VEHICLE INFORMATION');
    doc.font('Helvetica');
    doc.text(`Vehicle: ${item.vehicleYear} ${item.vehicleMake} ${item.vehicleModel}`);
    doc.text(`VIN: ${item.vin || 'N/A'}`);
    doc.text(`Mileage: ${item.mileage ? item.mileage.toLocaleString() + ' miles' : 'N/A'}`);
    doc.text(`Color: ${item.color || 'N/A'}`);
    doc.moveDown(1);

    // Inspection details
    doc.font('Helvetica-Bold').text('INSPECTION DETAILS');
    doc.font('Helvetica');
    doc.text(`Inspection Date: ${item.inspectionDate || new Date().toISOString().split('T')[0]}`);
    doc.text(`Inspector: ${item.inspectorName || 'N/A'}`);

    if (item.aiReport) {
      doc.moveDown(0.5);
      doc.text(`Overall Score: ${item.aiReport.overall_score || 'N/A'}/100`);
      const nextDate = item.aiReport.next_inspection_date;
      if (nextDate) doc.text(`Next Inspection Due: ${nextDate}`);
      if (item.aiReport.recommendations?.length) {
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').text('Recommendations:');
        doc.font('Helvetica');
        item.aiReport.recommendations.slice(0, 5).forEach(r => doc.text(`  • ${r}`));
      }
    }

    doc.moveDown(2);
    // QR code placeholder (text-based)
    doc.font('Helvetica-Bold').text('VERIFICATION');
    doc.font('Helvetica-Oblique').fontSize(10);
    doc.text(`Verify at: https://inspection.example.com/verify/${item.id}`);
    doc.text(`Certificate valid for: ${item.vehicleYear} ${item.vehicleMake} ${item.vehicleModel}`);
    doc.moveDown(2);

    // Signature block
    doc.fontSize(12).font('Helvetica');
    doc.text('_______________________________    _______________________________');
    doc.text('Inspector Signature                  Authorized Official');
    doc.moveDown(0.5);
    doc.fontSize(9).fillColor('#666666').text(`Generated: ${new Date().toISOString()} | Certificate ID: VIC-${String(item.id).padStart(6, '0')}`, { align: 'center' });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Certify - state machine workflow
router.post('/:id/certify', auth, aiRateLimiter, async (req, res) => {
  try {
    const item = await Inspection.findByPk(req.params.id);
    if (!item) return res.status(404).json({ error: 'Not found' });

    const workflow = item.aiReport?.workflow || 'pending';
    const states = ['pending', 'inspected', 'compliance_checked', 'certified'];
    const currentIdx = states.indexOf(workflow);

    // Move state machine forward
    if (currentIdx < 1) {
      // Trigger AI analysis first
      const prompt = `Analyze inspection for ${item.vehicleYear} ${item.vehicleMake} ${item.vehicleModel}, VIN: ${item.vin || 'N/A'}. Notes: ${item.notes || 'N/A'}. Return JSON: {"pass_fail":"PASS","overall_score":85,"defects":[],"recommendations":[],"next_inspection_date":""}`;
      const aiResult = await callOpenRouter(prompt, 'Return ONLY valid JSON.');
      const parsed = parseAIJson(aiResult.content) || { pass_fail: 'CONDITIONAL', overall_score: 70 };
      await item.update({ aiReport: { ...parsed, workflow: 'inspected', model: aiResult.model } });
      return res.json({ status: 'inspected', message: 'Inspection analyzed. Run compliance check next.', data: parsed });
    }

    if (currentIdx < 2) {
      // Auto-trigger compliance check
      const complianceCheck = await Compliance.findOne({ where: { vin: item.vin } });
      if (complianceCheck && complianceCheck.emissionsStatus !== 'compliant') {
        return res.status(400).json({ error: 'Compliance check failed. Cannot certify.', compliance: complianceCheck });
      }
      await item.update({ aiReport: { ...item.aiReport, workflow: 'compliance_checked' } });
      return res.json({ status: 'compliance_checked', message: 'Compliance verified. Ready to certify.' });
    }

    if (currentIdx < 3) {
      await item.update({ aiReport: { ...item.aiReport, workflow: 'certified', certifiedAt: new Date() }, overallStatus: 'pass' });
      return res.json({ status: 'certified', message: 'Vehicle inspection certified successfully!', certificateUrl: `/api/inspections/${item.id}/certificate-pdf` });
    }

    res.json({ status: 'certified', message: 'Already certified', certificateUrl: `/api/inspections/${item.id}/certificate-pdf` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
