const express  = require('express');
const { analyze } = require('../engine/analyzer');

const router = express.Router();

/**
 * POST /api/analyze
 * Body: { text: string, checklist: ChecklistItem[] }
 * Returns: AnalysisResult
 */
router.post('/', (req, res, next) => {
  try {
    const { text, checklist } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'text is required and must be a non-empty string' });
    }
    if (!Array.isArray(checklist) || checklist.length === 0) {
      return res.status(400).json({ error: 'checklist must be a non-empty array' });
    }

    const result = analyze(text.trim(), checklist);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
