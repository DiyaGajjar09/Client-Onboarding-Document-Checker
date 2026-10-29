/**
 * credentialPatterns.js
 * Regex patterns that detect insecurely shared credentials in plain text
 */
const CREDENTIAL_PATTERNS = [
  {
    pattern: /password\s*[:=]\s*\S+/gi,
    label: 'Plain-text password detected',
    desc: 'Never share passwords in plain text. Use a password manager share link (e.g. 1Password, Bitwarden Send).',
    severity: 'critical',
  },
  {
    pattern: /pwd\s*[:=]\s*\S+/gi,
    label: 'Plain-text password (pwd) detected',
    desc: 'Use a secure channel for credential sharing.',
    severity: 'critical',
  },
  {
    pattern: /passwd\s*[:=]\s*\S+/gi,
    label: 'Plain-text passwd detected',
    desc: 'Use an encrypted channel for credentials.',
    severity: 'critical',
  },
  {
    pattern: /api[_\s-]?key\s*[:=]\s*["']?\S{8,}/gi,
    label: 'Raw API key in submission',
    desc: 'API keys should be shared via a secrets vault, not in plain text.',
    severity: 'critical',
  },
  {
    pattern: /secret\s*[:=]\s*["']?\S{6,}/gi,
    label: 'Raw secret value detected',
    desc: 'Secrets should be stored in a secrets manager, not shared directly.',
    severity: 'high',
  },
  {
    pattern: /token\s*[:=]\s*["']?\S{8,}/gi,
    label: 'Auth token in plain text',
    desc: 'Tokens should be shared via secure link, not plain text.',
    severity: 'high',
  },
  {
    pattern: /bearer\s+[A-Za-z0-9\-._~+/]{20,}/gi,
    label: 'Bearer token exposed',
    desc: 'Bearer tokens must not be shared in unsecured messages.',
    severity: 'critical',
  },
  {
    pattern: /ssh-rsa\s+[A-Za-z0-9+/=]{20,}/gi,
    label: 'SSH key exposed',
    desc: 'SSH keys should never appear in plain onboarding text.',
    severity: 'critical',
  },
  {
    pattern: /private[_\s]?key\s*[:=]\s*["']?\S+/gi,
    label: 'Private key reference found',
    desc: 'Private keys are sensitive — share only through a secure vault.',
    severity: 'critical',
  },
  {
    pattern: /ftp[s]?\s*password\s*[:=]\s*\S+/gi,
    label: 'FTP password in plain text',
    desc: 'FTP credentials must be sent securely.',
    severity: 'critical',
  },
  {
    pattern: /mysql[_\s]?password\s*[:=]\s*\S+/gi,
    label: 'Database password detected',
    desc: 'Database credentials must never be shared in plain text.',
    severity: 'critical',
  },
  {
    pattern: /AKIA[A-Z0-9]{16}/g,
    label: 'AWS Access Key ID detected',
    desc: 'AWS credentials are extremely sensitive — revoke and rotate immediately.',
    severity: 'critical',
  },
  {
    pattern: /(client_?secret|app_?secret)\s*[:=]\s*["']?\S{8,}/gi,
    label: 'App secret in plain text',
    desc: 'App secrets must be protected — use a secrets manager.',
    severity: 'high',
  },
  {
    pattern: /sk_live_[A-Za-z0-9]{24,}/g,
    label: 'Stripe Live Secret Key exposed',
    desc: 'Stripe live keys are critical — revoke this key immediately in your Stripe dashboard.',
    severity: 'critical',
  },
  {
    pattern: /ghp_[A-Za-z0-9]{36,}/g,
    label: 'GitHub Personal Access Token exposed',
    desc: 'Revoke this token immediately in GitHub Settings → Developer Settings.',
    severity: 'critical',
  },
];

module.exports = CREDENTIAL_PATTERNS;
