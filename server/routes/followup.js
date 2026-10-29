const express  = require('express');
const { generateFollowUp } = require('../engine/followupGenerator');

const router = express.Router();

const VALID_TONES = ['professional', 'friendly', 'formal', 'concise'];

/**
 * POST /api/followup
 * Body: { analysisResult: object, tone: string }
 * Returns: { subject, body, questionCount }
 */
router.post('/', (req, res, next) => {
  try {
    const { analysisResult, tone = 'professional' } = req.body;

    if (!analysisResult || typeof analysisResult !== 'object') {
      return res.status(400).json({ error: 'analysisResult is required' });
    }
    if (!VALID_TONES.includes(tone)) {
      return res.status(400).json({ error: `tone must be one of: ${VALID_TONES.join(', ')}` });
    }

    const followup = generateFollowUp(analysisResult, tone);
    res.json({ success: true, data: followup });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
