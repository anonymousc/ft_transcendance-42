const { Router } = require('express');

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'planner-service' });
});

module.exports = router;
