/**
 * followupGenerator.js
 * Generates a professional follow-up email from analysis results
 */

const TONE_OPENERS = {
  professional: {
    greeting: 'Dear Client,',
    intro: "Thank you for submitting your onboarding information. After carefully reviewing your submission, we have identified a few items that need your attention before we can move forward.",
  },
  friendly: {
    greeting: 'Hi there! 👋',
    intro: "Thanks so much for sending over your onboarding details! We've had a chance to go through everything and have a few quick questions we'd love to clear up.",
  },
  formal: {
    greeting: 'Dear Sir/Madam,',
    intro: "We acknowledge receipt of your onboarding submission. Upon review, the following items require clarification or supplementary information prior to project commencement.",
  },
  concise: {
    greeting: 'Hi,',
    intro: "We reviewed your submission. A few items need attention before we can proceed:",
  },
};

const TONE_CLOSERS = {
  professional: "Please don't hesitate to reach out if you have any questions. We look forward to your prompt response.\n\nBest regards,\n[Your Name]\n[Your Company]",
  friendly: "We're super excited to work with you and just want to make sure we have everything we need to hit the ground running! 🚀\n\nCheers,\n[Your Name]",
  formal: "We kindly request your prompt attention to the above matters. Please do not hesitate to contact us should you require clarification.\n\nYours sincerely,\n[Your Name]",
  concise: "Let us know if you have questions.\n\nThanks,\n[Your Name]",
};

/**
 * Generate a follow-up email from analysis results
 *
 * @param {object} analysisResult - From analyzer.js
 * @param {string} tone           - 'professional' | 'friendly' | 'formal' | 'concise'
 * @returns {{ subject: string, body: string, questionCount: number }}
 */
function generateFollowUp(analysisResult, tone = 'professional') {
  const { missingItems, securityWarnings, unclearItems } = analysisResult;
  const opener = TONE_OPENERS[tone] || TONE_OPENERS.professional;
  const closer = TONE_CLOSERS[tone] || TONE_CLOSERS.professional;

  const sections = [];
  let questionNum = 1;

  // ── Missing items ──
  if (missingItems.length > 0) {
    sections.push('📋 MISSING INFORMATION');
    sections.push('─'.repeat(44));
    missingItems.forEach((item) => {
      const question = item.followup
        ? item.followup
        : `Could you please provide the following: ${item.name}?`;
      sections.push(`${questionNum++}. ${question}`);
    });
    sections.push('');
  }

  // ── Security warnings ──
  if (securityWarnings.length > 0) {
    sections.push('🔒 SECURITY NOTICE');
    sections.push('─'.repeat(44));
    sections.push(
      `${questionNum++}. We noticed some sensitive information was shared in plain text (e.g. passwords, API keys, or tokens). For the security of your account, please:`
    );
    sections.push('   • Immediately revoke and regenerate any credentials shared in your submission');
    sections.push('   • Re-share them through a secure channel such as 1Password, Bitwarden Send, or Doppler');
    sections.push('   • Avoid sending credentials via email or plain-text documents in the future');
    sections.push('');
  }

  // ── Unclear requirements ──
  if (unclearItems.length > 0) {
    sections.push('❓ CLARIFICATIONS NEEDED');
    sections.push('─'.repeat(44));
    unclearItems.forEach((item) => {
      sections.push(`${questionNum++}. ${item.suggestion}`);
    });
    sections.push('');
  }

  if (sections.length === 0) {
    sections.push(
      "Great news — your submission looks complete! We have everything we need to get started and will be in touch shortly with next steps."
    );
  }

  const body = [opener.greeting, '', opener.intro, '', ...sections, closer].join('\n');
  const itemCount = questionNum - 1;
  const subject   = itemCount > 0
    ? `Onboarding Follow-up — Action Required (${itemCount} item${itemCount !== 1 ? 's' : ''})`
    : 'Onboarding Received — We\'re Ready to Start!';

  return { subject, body, questionCount: itemCount };
}

module.exports = { generateFollowUp };
