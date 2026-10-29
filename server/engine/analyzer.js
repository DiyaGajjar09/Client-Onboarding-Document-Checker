/**
 * analyzer.js
 * Core analysis engine — fuzzy matching, credential scan, vague language detection
 */
const CREDENTIAL_PATTERNS = require('./credentialPatterns');
const VAGUE_PATTERNS       = require('./vaguePatterns');

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Normalize text for fuzzy comparison */
function normalizeText(str) {
  return str.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Returns true if ANY keyword from list appears in the submission */
function textContainsKeywords(text, keywords) {
  const norm = normalizeText(text);
  return keywords.some((kw) => norm.includes(normalizeText(kw)));
}

/** Extract surrounding context snippet for a regex match */
function extractContext(text, regex, maxLen = 90) {
  const flags = (regex.flags || '').replace(/g/g, '');
  const finalFlags = flags.includes('i') ? flags : flags + 'i';
  const clone = new RegExp(regex.source, finalFlags);
  const match = clone.exec(text);
  if (!match) return null;
  const start   = Math.max(0, match.index - 25);
  const end     = Math.min(text.length, match.index + match[0].length + 50);
  let snippet   = text.slice(start, end).replace(/\n/g, ' ').trim();
  if (snippet.length > maxLen) snippet = snippet.slice(0, maxLen) + '…';
  return snippet;
}

// ── Main Analyzer ─────────────────────────────────────────────────────────────

/**
 * Runs the full analysis pipeline on a submission.
 *
 * @param {string}   text       - Raw submission text
 * @param {object[]} checklist  - Array of checklist items
 * @returns {object} analysisResult
 */
function analyze(text, checklist) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new Error('Submission text is required');
  }
  if (!Array.isArray(checklist) || checklist.length === 0) {
    throw new Error('Checklist must be a non-empty array');
  }

  // ── Phase 1: Missing / Confirmed items ──
  const missingItems   = [];
  const confirmedItems = [];

  for (const item of checklist) {
    const keywords  = Array.isArray(item.keywords) ? item.keywords : [item.name];
    const allTokens = [item.name, ...keywords];
    const found     = textContainsKeywords(text, allTokens);

    if (found) {
      confirmedItems.push({ ...item, status: 'confirmed' });
    } else if (item.required !== false) {
      missingItems.push({ ...item, status: 'missing' });
    }
  }

  // ── Phase 2: Credential / Security scan ──
  const securityWarnings = [];
  for (const cp of CREDENTIAL_PATTERNS) {
    const regex = new RegExp(cp.pattern.source, cp.pattern.flags);
    const match = regex.exec(text);
    if (match) {
      securityWarnings.push({
        label:    cp.label,
        desc:     cp.desc,
        severity: cp.severity,
        context:  extractContext(text, cp.pattern) || match[0].slice(0, 60) + '…',
      });
    }
  }

  // ── Phase 3: Vague language detection ──
  const unclearItems = [];
  for (const vp of VAGUE_PATTERNS) {
    const regex = new RegExp(vp.pattern.source, vp.pattern.flags);
    const match = regex.exec(text);
    if (match) {
      unclearItems.push({
        label:      vp.label,
        suggestion: vp.suggestion,
        context:    extractContext(text, vp.pattern) || match[0],
      });
    }
  }

  // ── Scoring ──
  const total     = checklist.length;
  const confirmed = confirmedItems.length;
  const overallPct = total > 0 ? Math.round((confirmed / total) * 100) : 100;

  // Per-category breakdown
  const categories = [...new Set(checklist.map((i) => i.category))];
  const categoryScores = categories.map((cat) => {
    const catItems     = checklist.filter((i) => i.category === cat);
    const catConfirmed = confirmedItems.filter((i) => i.category === cat).length;
    return {
      category:  cat,
      total:     catItems.length,
      confirmed: catConfirmed,
      pct:       catItems.length > 0 ? Math.round((catConfirmed / catItems.length) * 100) : 100,
    };
  });

  return {
    summary: {
      overallPct,
      total,
      confirmed,
      missing:       missingItems.length,
      securityCount: securityWarnings.length,
      unclearCount:  unclearItems.length,
      categoryScores,
    },
    missingItems,
    confirmedItems,
    securityWarnings,
    unclearItems,
    analysedAt: new Date().toISOString(),
  };
}

module.exports = { analyze };
