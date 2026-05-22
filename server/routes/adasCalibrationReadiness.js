const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

let readiness = [
  { id: 1, vin: '1HGCM82633A004352', system: 'Forward camera', glassReplaced: true, targetBoard: 'Honda HDS target', calibrationBay: 'Bay 2', status: 'ready' },
  { id: 2, vin: '5YJ3E1EA7KF317000', system: 'Radar cruise', glassReplaced: false, targetBoard: 'Corner reflector', calibrationBay: 'Bay 1', status: 'blocked' },
  { id: 3, vin: '2T3DFREV0HW654321', system: 'Lane keep camera', glassReplaced: true, targetBoard: 'Toyota SST', calibrationBay: 'Mobile kit', status: 'parts hold' }
];

router.get('/', auth, (req, res) => {
  const summary = readiness.reduce((acc, row) => {
    acc.total += 1;
    acc.ready += row.status === 'ready' ? 1 : 0;
    acc.blocked += row.status === 'blocked' ? 1 : 0;
    return acc;
  }, { total: 0, ready: 0, blocked: 0 });
  res.json({ readiness, summary });
});

router.post('/', auth, (req, res) => {
  const item = {
    id: Date.now(),
    vin: req.body.vin || 'VIN-pending',
    system: req.body.system || 'ADAS system TBD',
    glassReplaced: Boolean(req.body.glassReplaced),
    targetBoard: req.body.targetBoard || 'Target TBD',
    calibrationBay: req.body.calibrationBay || 'Bay TBD',
    status: req.body.status || 'ready'
  };
  readiness = [item, ...readiness];
  res.status(201).json(item);
});

module.exports = router;
