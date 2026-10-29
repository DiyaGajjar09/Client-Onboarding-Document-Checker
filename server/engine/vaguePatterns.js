/**
 * vaguePatterns.js
 * Patterns that identify vague, unclear, or unresolved language in submissions
 */
const VAGUE_PATTERNS = [
  { pattern: /\bTBD\b/gi,                              label: '"TBD" (To Be Determined)',       suggestion: 'Please clarify this item — what is the specific value or decision needed?' },
  { pattern: /\bTBC\b/gi,                              label: '"TBC" (To Be Confirmed)',         suggestion: 'Please confirm this item with a specific answer before we proceed.' },
  { pattern: /\bASAP\b/gi,                             label: '"ASAP" — vague timeline',         suggestion: 'Could you provide a specific date or deadline instead of "ASAP"?' },
  { pattern: /\bsoon\b/gi,                             label: '"soon" — vague timing',            suggestion: 'Could you clarify "soon" with a concrete date or timeframe?' },
  { pattern: /\bmaybe\b/gi,                            label: '"maybe" — uncertain commitment',   suggestion: 'Is this confirmed or still under consideration? We need a definitive answer.' },
  { pattern: /\bnot sure\b/gi,                         label: '"not sure" — unresolved point',    suggestion: 'Could you clarify this, or loop in the right person to confirm?' },
  { pattern: /\bwe('ll| will) figure (it )?out\b/gi,  label: '"we\'ll figure it out" — unplanned', suggestion: 'Let\'s align on this before we start — can we schedule a quick call to discuss?' },
  { pattern: /\bto be discussed\b/gi,                  label: '"to be discussed" — open item',    suggestion: 'Let\'s schedule time to discuss this so it doesn\'t block project progress.' },
  { pattern: /\bI think\b/gi,                          label: '"I think" — uncertain answer',     suggestion: 'Could you confirm this definitively or verify with your team?' },
  { pattern: /\baround\b/gi,                           label: '"around" — approximate value',     suggestion: 'Could you provide a precise value instead of an approximation?' },
  { pattern: /\bsomething like\b/gi,                   label: '"something like" — vague spec',    suggestion: 'Could you be more specific about the exact requirement?' },
  { pattern: /\bmore or less\b/gi,                     label: '"more or less" — imprecise',       suggestion: 'Please provide an exact figure or specification.' },
  { pattern: /\bideally\b/gi,                          label: '"ideally" — conditional',          suggestion: 'Is this a hard requirement or a preference? Please confirm its priority.' },
  { pattern: /\bif possible\b/gi,                      label: '"if possible" — conditional',      suggestion: 'Is this required or optional? Please clarify so we can plan accordingly.' },
  { pattern: /\bflexible\b/gi,                         label: '"flexible" — undefined constraint', suggestion: 'Please define the acceptable range or boundaries for this item.' },
  { pattern: /\blater\b/gi,                            label: '"later" — deferred without date',  suggestion: 'When exactly? Please provide a specific timeframe so we can plan.' },
  { pattern: /\bunknown\b/gi,                          label: '"unknown" — unresolved info',      suggestion: 'Who in your team can provide this information?' },
  { pattern: /\bwe can figure\b/gi,                    label: '"we can figure" — deferred',       suggestion: 'Let\'s resolve this now to avoid delays later in the project.' },
  { pattern: /\brough(ly)?\b/gi,                       label: '"roughly" — imprecise estimate',   suggestion: 'Could you give a more precise figure or range?' },
  { pattern: /\bprobably\b/gi,                         label: '"probably" — uncertain',           suggestion: 'Please confirm definitively — uncertainty here can cause scope issues.' },
];

module.exports = VAGUE_PATTERNS;
