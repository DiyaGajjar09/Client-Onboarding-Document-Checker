/* ===================================================================
   OnboardIQ — Application Logic
   Checklist builder · Analysis engine · Follow-up generator
   =================================================================== */

'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// 1.  STATE
// ─────────────────────────────────────────────────────────────────────────────
const state = {
  currentStep: 1,
  checklist: [],          // Array of ChecklistItem
  submissionText: '',
  analysisResult: null,   // AnalysisResult object
  filterActive: 'all',
};

let itemIdCounter = 1;

// ─────────────────────────────────────────────────────────────────────────────
// 2.  TEMPLATES
// ─────────────────────────────────────────────────────────────────────────────
const TEMPLATES = {
  web: [
    { name: 'Brand Logo (SVG/PNG)', category: 'asset', required: true, sensitive: false, keywords: ['logo', 'brand mark', 'svg', 'icon', 'logotype'], followup: 'Could you please share your brand logo in SVG or high-resolution PNG format?' },
    { name: 'Brand Style Guide', category: 'asset', required: true, sensitive: false, keywords: ['style guide', 'brand guide', 'brand book', 'color palette', 'typography'], followup: 'Do you have a brand style guide or brand book we can reference for colors, fonts, and design rules?' },
    { name: 'Website Copy / Content', category: 'content', required: true, sensitive: false, keywords: ['copy', 'content', 'text', 'pages', 'about us', 'homepage text'], followup: 'Please share the written content for each page (Homepage, About, Services, Contact, etc.).' },
    { name: 'Domain Name & Registrar Access', category: 'access', required: true, sensitive: true, keywords: ['domain', 'godaddy', 'namecheap', 'dns', 'registrar', 'cpanel'], followup: 'Please share domain registrar login details securely (use a password manager share link, not plain text).' },
    { name: 'Hosting Credentials', category: 'credential', required: true, sensitive: true, keywords: ['hosting', 'ftp', 'ssh', 'cpanel', 'server', 'wp-admin', 'wordpress login'], followup: 'Please share hosting/FTP credentials via a secure channel (e.g. 1Password, Bitwarden send link).' },
    { name: 'Google Analytics / Tag Manager', category: 'access', required: false, sensitive: false, keywords: ['google analytics', 'gtm', 'tag manager', 'ga4', 'measurement id'], followup: 'Do you have a Google Analytics or Tag Manager account? If so, please add us as an editor.' },
    { name: 'Target Audience Description', category: 'requirement', required: true, sensitive: false, keywords: ['audience', 'target', 'personas', 'demographic', 'ideal customer'], followup: 'Could you describe your target audience — who are your ideal customers or users?' },
    { name: 'Project Timeline / Deadline', category: 'requirement', required: true, sensitive: false, keywords: ['deadline', 'timeline', 'launch date', 'due date', 'go live', 'target date'], followup: 'What is your preferred launch date or project deadline?' },
  ],
  brand: [
    { name: 'Existing Logo Files', category: 'asset', required: false, sensitive: false, keywords: ['logo', 'existing logo', 'current brand', 'ai file', 'eps', 'vector'], followup: 'Do you have existing logo files (AI, EPS, SVG)? If yes, please share them.' },
    { name: 'Brand Colors (Hex/Pantone)', category: 'requirement', required: true, sensitive: false, keywords: ['colors', 'hex', 'pantone', 'brand color', 'palette', 'rgb', 'cmyk'], followup: 'Please share your brand colors in Hex, Pantone, or CMYK values.' },
    { name: 'Brand Messaging / Tagline', category: 'content', required: true, sensitive: false, keywords: ['tagline', 'slogan', 'messaging', 'brand voice', 'mission', 'value proposition'], followup: 'What is your brand tagline, mission statement, or key messaging pillars?' },
    { name: 'Target Audience', category: 'requirement', required: true, sensitive: false, keywords: ['audience', 'target market', 'personas', 'demographic'], followup: 'Who is the target audience for this campaign?' },
    { name: 'Campaign Budget', category: 'requirement', required: true, sensitive: false, keywords: ['budget', 'spend', 'investment', 'cost', 'allocated'], followup: 'What is the allocated budget for this campaign?' },
    { name: 'Competitor References', category: 'requirement', required: false, sensitive: false, keywords: ['competitors', 'reference', 'inspiration', 'benchmark', 'like brands'], followup: 'Could you share 2–3 competitor or inspiration brands you admire?' },
    { name: 'Campaign Deliverables List', category: 'requirement', required: true, sensitive: false, keywords: ['deliverables', 'output', 'assets needed', 'formats', 'social media'], followup: 'Please list all campaign deliverables needed (e.g. social posts, banners, video, email).' },
    { name: 'Legal / Usage Restrictions', category: 'legal', required: false, sensitive: false, keywords: ['legal', 'restrictions', 'trademark', 'compliance', 'nda', 'brand guidelines', 'usage rights'], followup: 'Are there any legal restrictions, trademarked elements, or brand usage guidelines we should be aware of?' },
  ],
  api: [
    { name: 'API Keys / Tokens', category: 'credential', required: true, sensitive: true, keywords: ['api key', 'token', 'secret', 'bearer', 'oauth', 'client id', 'client secret'], followup: 'Please share API keys/tokens via a secure link (e.g. 1Password, Doppler, or encrypted email).' },
    { name: 'API Documentation / Spec', category: 'asset', required: true, sensitive: false, keywords: ['api docs', 'swagger', 'openapi', 'postman', 'documentation', 'spec', 'endpoints'], followup: 'Please share the API documentation, Swagger/OpenAPI spec, or Postman collection.' },
    { name: 'Base URL / Endpoint', category: 'requirement', required: true, sensitive: false, keywords: ['base url', 'endpoint', 'api url', 'host', 'api base', 'production url', 'staging url'], followup: 'What is the base URL for the API (production and staging)?' },
    { name: 'Authentication Method', category: 'requirement', required: true, sensitive: false, keywords: ['auth', 'authentication', 'jwt', 'oauth', 'basic auth', 'api key header'], followup: 'What authentication method does the API use (OAuth 2.0, JWT, API Key header, etc.)?' },
    { name: 'Test / Sandbox Credentials', category: 'credential', required: true, sensitive: true, keywords: ['sandbox', 'test env', 'staging creds', 'test key', 'test secret'], followup: 'Please provide test/sandbox credentials so we can develop without affecting production data.' },
    { name: 'Rate Limits & Quotas', category: 'requirement', required: false, sensitive: false, keywords: ['rate limit', 'quota', 'requests per minute', 'throttle', 'limits'], followup: 'Are there any rate limits, quotas, or throttling policies we should be aware of?' },
    { name: 'Webhook URLs / Callback Config', category: 'requirement', required: false, sensitive: false, keywords: ['webhook', 'callback', 'callback url', 'notify url', 'event listener'], followup: 'Do you require webhook or callback URL setup? If so, what events should trigger them?' },
    { name: 'Error Handling Expectations', category: 'requirement', required: false, sensitive: false, keywords: ['error', 'error handling', 'retry', 'failure', '4xx', '5xx'], followup: 'How should our integration handle API errors and retry scenarios?' },
  ],
  ecommerce: [
    { name: 'Product Catalog / CSV', category: 'asset', required: true, sensitive: false, keywords: ['products', 'catalog', 'csv', 'product list', 'sku', 'inventory'], followup: 'Please share your complete product catalog (CSV, Excel, or Shopify export) with titles, descriptions, prices, and SKUs.' },
    { name: 'Product Images', category: 'asset', required: true, sensitive: false, keywords: ['product images', 'photos', 'product photos', 'images', 'photography'], followup: 'Please share all product images. High-resolution JPEGs or PNGs preferred.' },
    { name: 'Payment Gateway Credentials', category: 'credential', required: true, sensitive: true, keywords: ['stripe', 'paypal', 'payment gateway', 'payment api', 'merchant id', 'publishable key'], followup: 'Please share payment gateway credentials (Stripe/PayPal etc.) via a secure link.' },
    { name: 'Shipping Configuration', category: 'requirement', required: true, sensitive: false, keywords: ['shipping', 'delivery', 'shipping rates', 'carrier', 'fedex', 'ups', 'usps'], followup: 'What are your shipping zones, rates, and carriers?' },
    { name: 'Return / Refund Policy', category: 'legal', required: true, sensitive: false, keywords: ['return policy', 'refund', 'returns', 'exchange policy'], followup: 'Please share your return and refund policy text.' },
    { name: 'Terms & Conditions', category: 'legal', required: true, sensitive: false, keywords: ['terms', 'terms and conditions', 'tos', 'legal terms'], followup: 'Please share your Terms & Conditions document.' },
    { name: 'Tax Configuration', category: 'requirement', required: true, sensitive: false, keywords: ['tax', 'vat', 'gst', 'tax rates', 'tax exempt'], followup: 'What tax rules apply? (e.g. VAT in EU, sales tax by state, tax-exempt products).' },
    { name: 'Email Notification Templates', category: 'content', required: false, sensitive: false, keywords: ['email templates', 'order confirmation', 'shipping notification', 'transactional email'], followup: 'Do you have existing email templates for order confirmations and shipping notifications?' },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 3.  CREDENTIAL & VAGUE PATTERNS (Analysis Engine)
// ─────────────────────────────────────────────────────────────────────────────
const CREDENTIAL_PATTERNS = [
  { pattern: /password\s*[:=]\s*\S+/gi,          label: 'Plain-text password detected',      desc: 'Never share passwords in plain text. Use a password manager share link.' },
  { pattern: /pwd\s*[:=]\s*\S+/gi,               label: 'Plain-text password (pwd) detected', desc: 'Never share passwords in plain text.' },
  { pattern: /passwd\s*[:=]\s*\S+/gi,            label: 'Plain-text passwd detected',         desc: 'Use an encrypted channel for credentials.' },
  { pattern: /api[_\s-]?key\s*[:=]\s*["']?\S{8,}/gi, label: 'Raw API key in submission',   desc: 'API keys should be shared via secure vault, not in plain text.' },
  { pattern: /secret\s*[:=]\s*["']?\S{6,}/gi,    label: 'Raw secret value detected',          desc: 'Secrets should be stored in a secrets manager, not shared directly.' },
  { pattern: /token\s*[:=]\s*["']?\S{8,}/gi,     label: 'Auth token in plain text',           desc: 'Tokens should be shared via secure link, not plain text.' },
  { pattern: /bearer\s+[A-Za-z0-9\-._~+/]{20,}/gi, label: 'Bearer token exposed',           desc: 'Bearer tokens must not be shared in unsecured messages.' },
  { pattern: /ssh-rsa\s+[A-Za-z0-9+/=]{20,}/gi,  label: 'SSH public/private key exposed',    desc: 'SSH keys should never appear in plain onboarding text.' },
  { pattern: /private[_\s]?key\s*[:=]\s*["']?\S+/gi, label: 'Private key reference found',  desc: 'Private keys are sensitive — share only through a secure vault.' },
  { pattern: /ftp[s]?\s*password\s*[:=]\s*\S+/gi, label: 'FTP password in plain text',      desc: 'FTP credentials must be sent securely.' },
  { pattern: /mysql[_\s]?password\s*[:=]\s*\S+/gi, label: 'Database password detected',     desc: 'Database credentials must never be shared in plain text.' },
  { pattern: /AKIA[A-Z0-9]{16}/g,                 label: 'AWS Access Key ID detected',        desc: 'AWS credentials are extremely sensitive — revoke and rotate immediately.' },
  { pattern: /\b[0-9a-f]{32,}\b/gi,               label: 'Potential raw hash/token',          desc: 'This looks like a raw cryptographic token. Confirm it is safe to share.' },
  { pattern: /(client_?secret|app_?secret)\s*[:=]\s*["']?\S{8,}/gi, label: 'App secret in plain text', desc: 'App secrets must be protected — use a secrets manager.' },
];

const VAGUE_PATTERNS = [
  { pattern: /\bTBD\b/gi,                                     label: '"TBD" (To Be Determined)', suggestion: 'Please clarify this item — what is the specific value or decision?' },
  { pattern: /\bTBC\b/gi,                                     label: '"TBC" (To Be Confirmed)',   suggestion: 'Please confirm this item with a specific answer.' },
  { pattern: /\bASAP\b/gi,                                    label: '"ASAP" — vague timeline',   suggestion: 'Could you provide a specific date or deadline instead of "ASAP"?' },
  { pattern: /\bsoon\b/gi,                                    label: '"soon" — vague timing',      suggestion: 'Could you clarify "soon" with an actual date or timeframe?' },
  { pattern: /\bmaybe\b/gi,                                   label: '"maybe" — uncertain',        suggestion: 'Is this confirmed or still under consideration?' },
  { pattern: /\bnot sure\b/gi,                                label: '"not sure" — unresolved',    suggestion: 'Could you clarify this point or loop in the right person to confirm?' },
  { pattern: /\bwe('ll| will) figure (it )?out\b/gi,         label: '"we\'ll figure it out" — unplanned', suggestion: 'We\'d love to align on this before starting — can we schedule a quick call?' },
  { pattern: /\bto be discussed\b/gi,                         label: '"to be discussed" — open item', suggestion: 'Let\'s schedule time to discuss this so it doesn\'t block progress.' },
  { pattern: /\bI think\b/gi,                                 label: '"I think" — uncertain answer', suggestion: 'Could you confirm this definitively or check with your team?' },
  { pattern: /\baround\b/gi,                                  label: '"around" — approximate value', suggestion: 'Could you provide a precise value instead of an approximation?' },
  { pattern: /\bsomething like\b/gi,                          label: '"something like" — vague spec', suggestion: 'Could you be more specific about the exact requirement?' },
  { pattern: /\bmore or less\b/gi,                            label: '"more or less" — imprecise',  suggestion: 'Please provide an exact figure or specification.' },
  { pattern: /\bideally\b/gi,                                 label: '"ideally" — conditional',    suggestion: 'Is this a hard requirement or a preference? Please confirm.' },
  { pattern: /\bif possible\b/gi,                             label: '"if possible" — conditional', suggestion: 'Is this required or optional? Please clarify the priority.' },
  { pattern: /\bwe can figure\b/gi,                           label: '"we can figure" — deferred',  suggestion: 'Let\'s resolve this now to avoid delays later in the project.' },
  { pattern: /\bflexible\b/gi,                                label: '"flexible" — undefined constraint', suggestion: 'Please define the acceptable range or boundaries for this item.' },
  { pattern: /\blater\b/gi,                                   label: '"later" — deferred',          suggestion: 'When exactly? Please provide a specific timeframe.' },
  { pattern: /\bunknown\b/gi,                                 label: '"unknown" — unresolved info', suggestion: 'Who in your team can provide this information?' },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4.  UTILITY FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────
function generateId() { return `item-${Date.now()}-${itemIdCounter++}`; }

function normalizeText(str) { return str.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim(); }

/** Fuzzy keyword check — returns true if ANY keyword appears in the text */
function textContainsKeywords(text, keywords) {
  const norm = normalizeText(text);
  return keywords.some(kw => norm.includes(normalizeText(kw)));
}

/** Find first match context (surrounding snippet) */
function findMatchContext(text, pattern, maxLen = 80) {
  const match = pattern.exec(text);
  if (!match) return null;
  const start = Math.max(0, match.index - 20);
  const end = Math.min(text.length, match.index + match[0].length + 40);
  let snippet = text.slice(start, end).replace(/\n/g, ' ').trim();
  if (snippet.length > maxLen) snippet = snippet.slice(0, maxLen) + '…';
  return snippet;
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function delay(ms) { return new Promise(res => setTimeout(res, ms)); }

// ─────────────────────────────────────────────────────────────────────────────
// 5.  TOAST NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
function showToast(message, type = 'success', duration = 3000) {
  const container = document.getElementById('toast-container');
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || '•'}</span><span>${escapeHtml(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'toast-out 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─────────────────────────────────────────────────────────────────────────────
// 6.  MODAL
// ─────────────────────────────────────────────────────────────────────────────
function showModal(title, body, onConfirm) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').textContent = body;
  const overlay = document.getElementById('modal-overlay');
  overlay.hidden = false;

  const confirmBtn = document.getElementById('modal-confirm');
  const cancelBtn  = document.getElementById('modal-cancel');

  function cleanup() {
    overlay.hidden = true;
    confirmBtn.replaceWith(confirmBtn.cloneNode(true));
    cancelBtn.replaceWith(cancelBtn.cloneNode(true));
  }

  document.getElementById('modal-confirm').addEventListener('click', () => { cleanup(); onConfirm(); });
  document.getElementById('modal-cancel').addEventListener('click', cleanup);
}

// ─────────────────────────────────────────────────────────────────────────────
// 7.  STEP NAVIGATION
// ─────────────────────────────────────────────────────────────────────────────
function goToStep(step) {
  for (let i = 1; i <= 4; i++) {
    const panel = document.getElementById(`step-${i}`);
    const nav   = document.getElementById(`step-nav-${i}`);
    panel.hidden = (i !== step);
    if (i !== step) panel.classList.remove('active');
    else            panel.classList.add('active');

    nav.classList.remove('active', 'completed');
    if (i === step) nav.classList.add('active');
    else if (i < step) nav.classList.add('completed');

    // Update step num icon for completed steps
    const numEl = nav.querySelector('.step-num');
    if (i < step) {
      numEl.innerHTML = `<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20,6 9,17 4,12"/></svg>`;
    } else {
      numEl.textContent = i;
    }
  }
  state.currentStep = step;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ─────────────────────────────────────────────────────────────────────────────
// 8.  CHECKLIST MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────
function addChecklistItem(item) {
  const newItem = {
    id:       generateId(),
    name:     item.name.trim(),
    category: item.category || 'requirement',
    keywords: item.keywords
      ? item.keywords.split(',').map(k => k.trim()).filter(Boolean)
      : [item.name.toLowerCase()],
    required:  item.required !== false,
    sensitive: !!item.sensitive,
    followup:  item.followup || '',
  };
  state.checklist.push(newItem);
  renderChecklistItem(newItem);
  updateChecklistMeta();
}

function deleteChecklistItem(id) {
  state.checklist = state.checklist.filter(i => i.id !== id);
  const el = document.querySelector(`[data-item-id="${id}"]`);
  if (el) {
    el.style.animation = 'none';
    el.style.opacity = '0'; el.style.transform = 'translateX(8px)';
    el.style.transition = '0.2s ease';
    setTimeout(() => el.remove(), 200);
  }
  updateChecklistMeta();
}

const CAT_LABELS = {
  asset: '📁 Asset', credential: '🔑 Credential', requirement: '📋 Requirement',
  access: '🔐 Access', content: '✍️ Content', legal: '⚖️ Legal',
};

function renderChecklistItem(item) {
  const list  = document.getElementById('checklist-list');
  const empty = document.getElementById('checklist-empty');
  empty.hidden = true;
  list.hidden  = false;

  const li = document.createElement('li');
  li.className = 'checklist-item';
  li.setAttribute('data-item-id', item.id);
  li.setAttribute('data-category', item.category);

  const catLabel = CAT_LABELS[item.category] || item.category;
  const kws = item.keywords.slice(0, 4).join(', ') + (item.keywords.length > 4 ? ', …' : '');

  li.innerHTML = `
    <span class="item-cat-badge cat-${item.category}">${escapeHtml(catLabel)}</span>
    <div class="item-info">
      <div class="item-name">${escapeHtml(item.name)}</div>
      <div class="item-keywords">${escapeHtml(kws)}</div>
    </div>
    <div class="item-flags">
      <span class="item-flag ${item.required ? 'flag-required' : 'flag-optional'}">${item.required ? 'Required' : 'Optional'}</span>
      ${item.sensitive ? '<span class="item-flag flag-sensitive">🔒 Sensitive</span>' : ''}
    </div>
    <div class="item-actions">
      <button class="item-btn item-btn-delete" title="Delete item" aria-label="Delete ${escapeHtml(item.name)}" data-del="${item.id}">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
      </button>
    </div>`;

  li.querySelector('[data-del]').addEventListener('click', (e) => {
    deleteChecklistItem(e.currentTarget.dataset.del);
  });

  list.appendChild(li);
  applyFilter(state.filterActive);
}

function renderAllChecklistItems() {
  const list = document.getElementById('checklist-list');
  list.innerHTML = '';
  list.hidden = state.checklist.length === 0;
  document.getElementById('checklist-empty').hidden = state.checklist.length > 0;
  state.checklist.forEach(item => {
    const li = document.createElement('li');
    li.className = 'checklist-item';
    li.setAttribute('data-item-id', item.id);
    li.setAttribute('data-category', item.category);

    const catLabel = CAT_LABELS[item.category] || item.category;
    const kws = item.keywords.slice(0, 4).join(', ') + (item.keywords.length > 4 ? ', …' : '');

    li.innerHTML = `
      <span class="item-cat-badge cat-${item.category}">${escapeHtml(catLabel)}</span>
      <div class="item-info">
        <div class="item-name">${escapeHtml(item.name)}</div>
        <div class="item-keywords">${escapeHtml(kws)}</div>
      </div>
      <div class="item-flags">
        <span class="item-flag ${item.required ? 'flag-required' : 'flag-optional'}">${item.required ? 'Required' : 'Optional'}</span>
        ${item.sensitive ? '<span class="item-flag flag-sensitive">🔒 Sensitive</span>' : ''}
      </div>
      <div class="item-actions">
        <button class="item-btn item-btn-delete" title="Delete item" aria-label="Delete ${escapeHtml(item.name)}" data-del="${item.id}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </button>
      </div>`;

    li.querySelector('[data-del]').addEventListener('click', (e) => {
      deleteChecklistItem(e.currentTarget.dataset.del);
    });

    list.appendChild(li);
  });
  applyFilter(state.filterActive);
}

function updateChecklistMeta() {
  const count = state.checklist.length;
  document.getElementById('item-count-badge').textContent = `${count} item${count !== 1 ? 's' : ''}`;
  if (count === 0) {
    document.getElementById('checklist-list').hidden = true;
    document.getElementById('checklist-empty').hidden = false;
  }
}

function applyFilter(filter) {
  state.filterActive = filter;
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('active', c.dataset.filter === filter));
  document.querySelectorAll('.checklist-item').forEach(li => {
    if (filter === 'all' || li.dataset.category === filter) li.style.display = '';
    else li.style.display = 'none';
  });
}

function clearAddForm() {
  document.getElementById('item-name').value      = '';
  document.getElementById('item-keywords').value  = '';
  document.getElementById('item-followup').value  = '';
  document.getElementById('item-required').checked  = true;
  document.getElementById('item-sensitive').checked = false;
  document.getElementById('item-category').value  = 'asset';
  document.getElementById('item-name').focus();
}

// ─────────────────────────────────────────────────────────────────────────────
// 9.  ANALYSIS ENGINE
// ─────────────────────────────────────────────────────────────────────────────
async function runAnalysis() {
  const text = state.submissionText;

  const progressBar = document.getElementById('analysis-progress-bar');
  const statusText  = document.getElementById('analysis-status-text');
  const logLines    = [1,2,3,4].map(n => document.getElementById(`log-line-${n}`));

  function setLog(idx, msg, cls = '') {
    logLines[idx].textContent = msg;
    logLines[idx].className = `log-line ${cls}`;
  }
  function setProgress(pct) { progressBar.style.width = `${pct}%`; }
  function setStatus(msg)   { statusText.textContent = msg; }

  // Reset UI
  logLines.forEach(l => { l.textContent = ''; l.className = 'log-line'; });
  setProgress(0);
  document.getElementById('btn-run-analysis').disabled = true;

  // ── Phase 1: Init ──
  setStatus('Initializing engine…');
  setLog(0, '▶ Loading analysis engine…');
  await delay(400);
  setProgress(10);
  setLog(0, `✔ Engine loaded — ${state.checklist.length} checklist items`, 'log-ok');
  setLog(1, `▶ Parsing submission (${text.length} characters)…`);
  await delay(350);

  // ── Phase 2: Missing Items ──
  setProgress(25);
  setStatus('Scanning for missing items…');
  setLog(1, `▶ Checking required items against submission…`);
  await delay(450);

  const missingItems = [];
  const confirmedItems = [];

  for (const item of state.checklist) {
    const allKeywords = [item.name, ...item.keywords];
    const found = textContainsKeywords(text, allKeywords);
    if (found) confirmedItems.push(item);
    else if (item.required) missingItems.push(item);
  }

  setProgress(45);
  setLog(1, `✔ Found ${confirmedItems.length} confirmed, ${missingItems.length} missing`, missingItems.length > 0 ? 'log-warn' : 'log-ok');

  // ── Phase 3: Credential Scan ──
  setLog(2, '▶ Scanning for insecure credential patterns…');
  setStatus('Checking credential security…');
  await delay(500);

  const securityWarnings = [];
  for (const cp of CREDENTIAL_PATTERNS) {
    const regex = new RegExp(cp.pattern.source, cp.pattern.flags);
    regex.lastIndex = 0;
    const match = regex.exec(text);
    if (match) {
      const context = findMatchContext(text, new RegExp(cp.pattern.source, cp.pattern.flags)) || match[0].slice(0, 60) + '…';
      securityWarnings.push({ label: cp.label, desc: cp.desc, context });
    }
  }

  setProgress(65);
  setLog(2, securityWarnings.length > 0
    ? `⚠ ${securityWarnings.length} security risk(s) detected`
    : '✔ No credential risks detected', securityWarnings.length > 0 ? 'log-warn' : 'log-ok');

  // ── Phase 4: Vague Language ──
  setLog(3, '▶ Detecting unclear or vague requirements…');
  setStatus('Analyzing requirement clarity…');
  await delay(450);

  const unclearItems = [];
  for (const vp of VAGUE_PATTERNS) {
    const regex = new RegExp(vp.pattern.source, vp.pattern.flags);
    regex.lastIndex = 0;
    const match = regex.exec(text);
    if (match) {
      const context = findMatchContext(text, new RegExp(vp.pattern.source, vp.pattern.flags)) || match[0];
      unclearItems.push({ label: vp.label, suggestion: vp.suggestion, context });
    }
  }

  setProgress(85);
  setLog(3, unclearItems.length > 0
    ? `⚠ ${unclearItems.length} unclear requirement(s) found`
    : '✔ All requirements are clearly stated', unclearItems.length > 0 ? 'log-warn' : 'log-ok');

  await delay(350);
  setProgress(100);
  setStatus('Analysis complete ✔');

  // Store results
  state.analysisResult = { missingItems, confirmedItems, securityWarnings, unclearItems };

  await delay(600);

  // Transition to results
  goToStep(4);
  renderResults();
}

// ─────────────────────────────────────────────────────────────────────────────
// 10.  RESULTS RENDERING
// ─────────────────────────────────────────────────────────────────────────────
function renderResults() {
  const { missingItems, confirmedItems, securityWarnings, unclearItems } = state.analysisResult;
  const total = state.checklist.length;
  const confirmed = confirmedItems.length;
  const pct = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  // ── Scorecard ──
  renderOverallScore(pct);
  renderMiniScores();

  // ── Finding Panels ──
  renderFindingList('list-missing',   'badge-missing',   'empty-missing',   missingItems,       renderMissingItem);
  renderFindingList('list-security',  'badge-security',  'empty-security',  securityWarnings,   renderSecurityItem);
  renderFindingList('list-unclear',   'badge-unclear',   'empty-unclear',   unclearItems,       renderUnclearItem);
  renderFindingList('list-confirmed', 'badge-confirmed', 'empty-confirmed', confirmedItems,     renderConfirmedItem);

  // ── Follow-up ──
  generateFollowUp();
}

function renderOverallScore(pct) {
  const circumference = 201; // 2π × 32
  const offset = circumference - (circumference * pct / 100);
  const ring = document.getElementById('ring-fill-overall');

  // Inject gradient into SVG
  const svg = ring.closest('svg');
  if (!svg.querySelector('defs')) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `<linearGradient id="overall-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6366f1"/><stop offset="100%" stop-color="#22c55e"/>
    </linearGradient>`;
    svg.insertBefore(defs, svg.firstChild);
  }

  setTimeout(() => {
    ring.style.strokeDashoffset = offset;
    document.getElementById('score-pct-overall').textContent = `${pct}%`;
  }, 200);

  // Color ring based on score
  ring.style.stroke = pct >= 80 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444';
}

function renderMiniScores() {
  const { missingItems, confirmedItems } = state.analysisResult;
  const categories = [...new Set(state.checklist.map(i => i.category))];
  const container = document.getElementById('score-mini-cards');
  container.innerHTML = '';

  const catColors = { asset:'#22d3ee', credential:'#f87171', requirement:'#818cf8', access:'#fbbf24', content:'#4ade80', legal:'#c084fc' };

  categories.forEach(cat => {
    const catItems = state.checklist.filter(i => i.category === cat);
    const catConfirmed = confirmedItems.filter(i => i.category === cat).length;
    const catPct = catItems.length > 0 ? Math.round((catConfirmed / catItems.length) * 100) : 100;
    const color = catColors[cat] || '#94a3b8';
    const label = CAT_LABELS[cat] || cat;

    const div = document.createElement('div');
    div.className = 'score-mini';
    div.innerHTML = `
      <div class="score-mini-top">
        <span class="score-mini-label">${escapeHtml(label)}</span>
        <span class="score-mini-pct" style="color:${color}">${catPct}%</span>
      </div>
      <div class="score-mini-bar-track">
        <div class="score-mini-bar" style="background:${color};width:0%"></div>
      </div>
      <div class="score-mini-label">${catConfirmed} / ${catItems.length} confirmed</div>`;

    container.appendChild(div);
    setTimeout(() => { div.querySelector('.score-mini-bar').style.width = `${catPct}%`; }, 250);
  });
}

function renderFindingList(listId, badgeId, emptyId, items, renderFn) {
  const list  = document.getElementById(listId);
  const badge = document.getElementById(badgeId);
  const empty = document.getElementById(emptyId);

  list.innerHTML = '';
  badge.textContent = items.length;

  if (items.length === 0) {
    list.hidden = true;
    empty.hidden = false;
  } else {
    list.hidden = false;
    empty.hidden = true;
    items.forEach((item, idx) => {
      const li = renderFn(item);
      li.style.animationDelay = `${idx * 0.05}s`;
      list.appendChild(li);
    });
  }
}

function renderMissingItem(item) {
  const li = document.createElement('li');
  li.className = 'finding-item';
  li.innerHTML = `
    <div class="finding-item-icon">❌</div>
    <div class="finding-item-body">
      <div class="finding-item-name">${escapeHtml(item.name)}</div>
      <div class="finding-item-desc">${escapeHtml(CAT_LABELS[item.category] || item.category)} · Not found in submission</div>
      ${item.followup ? `<div class="finding-item-context" style="border-color:var(--clr-red)">💬 ${escapeHtml(item.followup)}</div>` : ''}
    </div>`;
  return li;
}

function renderSecurityItem(item) {
  const li = document.createElement('li');
  li.className = 'finding-item';
  li.innerHTML = `
    <div class="finding-item-icon">🚨</div>
    <div class="finding-item-body">
      <div class="finding-item-name">${escapeHtml(item.label)}</div>
      <div class="finding-item-desc">${escapeHtml(item.desc)}</div>
      ${item.context ? `<div class="finding-item-context">"…${escapeHtml(item.context)}…"</div>` : ''}
    </div>`;
  return li;
}

function renderUnclearItem(item) {
  const li = document.createElement('li');
  li.className = 'finding-item';
  li.innerHTML = `
    <div class="finding-item-icon">❓</div>
    <div class="finding-item-body">
      <div class="finding-item-name">${escapeHtml(item.label)}</div>
      <div class="finding-item-desc">${escapeHtml(item.suggestion)}</div>
      ${item.context ? `<div class="finding-item-context">"…${escapeHtml(item.context)}…"</div>` : ''}
    </div>`;
  return li;
}

function renderConfirmedItem(item) {
  const li = document.createElement('li');
  li.className = 'finding-item';
  li.innerHTML = `
    <div class="finding-item-icon">✅</div>
    <div class="finding-item-body">
      <div class="finding-item-name">${escapeHtml(item.name)}</div>
      <div class="finding-item-desc">${escapeHtml(CAT_LABELS[item.category] || item.category)} · Detected in submission</div>
    </div>`;
  return li;
}

// ─────────────────────────────────────────────────────────────────────────────
// 11.  FOLLOW-UP GENERATOR
// ─────────────────────────────────────────────────────────────────────────────
const TONE_OPENERS = {
  professional: { greeting: 'Dear Client,',    intro: 'Thank you for submitting your onboarding information. After reviewing your submission, we have a few follow-up items we\'d like to address before we can proceed.' },
  friendly:     { greeting: 'Hi there! 👋',    intro: 'Thanks so much for sending over your onboarding details! We\'ve had a chance to go through everything and have a few quick questions we\'d love to clear up.' },
  formal:       { greeting: 'Dear Sir/Madam,', intro: 'We acknowledge receipt of your onboarding submission. Upon review, the following items require clarification or supplementary information prior to project commencement.' },
  concise:      { greeting: 'Hi,',             intro: 'We reviewed your submission. A few items need attention:' },
};
const TONE_CLOSERS = {
  professional: 'Please don\'t hesitate to reach out if you have any questions. We look forward to your response.\n\nBest regards,\n[Your Name]',
  friendly:     'We\'re super excited to work with you and just want to make sure we have everything we need to hit the ground running! 🚀\n\nCheers,\n[Your Name]',
  formal:       'We kindly request your prompt attention to the above matters. Please do not hesitate to contact us should you require clarification.\n\nYours sincerely,\n[Your Name]',
  concise:      'Let us know if you have questions.\n\nThanks,\n[Your Name]',
};

function generateFollowUp() {
  const { missingItems, securityWarnings, unclearItems } = state.analysisResult;
  const tone = document.getElementById('tone-select').value;
  const opener = TONE_OPENERS[tone] || TONE_OPENERS.professional;
  const closer = TONE_CLOSERS[tone] || TONE_CLOSERS.professional;

  const sections = [];
  let questionNum = 1;

  // Missing items
  if (missingItems.length > 0) {
    sections.push('📋 MISSING INFORMATION');
    sections.push('─'.repeat(40));
    missingItems.forEach(item => {
      const q = item.followup || `Could you please provide the following: ${item.name}?`;
      sections.push(`${questionNum++}. ${q}`);
    });
    sections.push('');
  }

  // Security concerns
  if (securityWarnings.length > 0) {
    sections.push('🔒 SECURITY NOTICE');
    sections.push('─'.repeat(40));
    sections.push(`${questionNum++}. We noticed some sensitive information was shared in plain text (e.g. passwords, API keys, or tokens). For the security of your account, please:`);
    sections.push('   • Revoke and regenerate any credentials shared in your submission');
    sections.push('   • Re-share them through a secure channel such as 1Password, Bitwarden Send, or Doppler');
    sections.push('   • Never send credentials via email or plain-text documents');
    sections.push('');
  }

  // Unclear requirements
  if (unclearItems.length > 0) {
    sections.push('❓ CLARIFICATIONS NEEDED');
    sections.push('─'.repeat(40));
    unclearItems.forEach(item => {
      sections.push(`${questionNum++}. ${item.suggestion}`);
    });
    sections.push('');
  }

  if (sections.length === 0) {
    sections.push('Great news — your submission looks complete! We have everything we need to get started.');
  }

  const body = [
    opener.greeting,
    '',
    opener.intro,
    '',
    ...sections,
    closer,
  ].join('\n');

  document.getElementById('followup-textarea').value = body;
  document.getElementById('followup-subject').value  = `Onboarding Follow-up — Action Required (${questionNum - 1} item${questionNum - 1 !== 1 ? 's' : ''})`;
  updateFollowUpStats();
}

function updateFollowUpStats() {
  const text = document.getElementById('followup-textarea').value;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  document.getElementById('followup-stats').textContent = `${words} words · ${text.length} characters`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 12.  CLIPBOARD & EXPORT
// ─────────────────────────────────────────────────────────────────────────────
async function copyToClipboard(text, label) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(`${label} copied to clipboard!`, 'success');
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast(`${label} copied!`, 'success');
  }
}

function exportPDF() {
  const subject = document.getElementById('followup-subject').value;
  const body    = document.getElementById('followup-textarea').value;
  const { missingItems, securityWarnings, unclearItems, confirmedItems } = state.analysisResult;
  const total = state.checklist.length;
  const pct   = total > 0 ? Math.round((confirmedItems.length / total) * 100) : 0;

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html><html><head>
    <title>Onboarding Report — OnboardIQ</title>
    <style>
      body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 24px;color:#1a1a2e;line-height:1.6}
      h1{font-size:1.8rem;color:#6366f1;margin-bottom:4px}
      .meta{font-size:0.85rem;color:#666;margin-bottom:32px}
      .score{display:inline-block;font-size:2rem;font-weight:800;padding:8px 20px;border-radius:12px;
             background:${pct>=80?'#dcfce7':pct>=50?'#fef9c3':'#fee2e2'};color:${pct>=80?'#166534':pct>=50?'#854d0e':'#991b1b'}}
      h2{font-size:1rem;font-weight:700;margin:24px 0 12px;padding-bottom:6px;border-bottom:2px solid #eee}
      .item{padding:10px 14px;border-radius:8px;margin-bottom:8px;font-size:0.88rem}
      .red{background:#fee2e2;border-left:3px solid #ef4444}
      .orange{background:#fff7ed;border-left:3px solid #f97316}
      .yellow{background:#fefce8;border-left:3px solid #eab308}
      .green{background:#f0fdf4;border-left:3px solid #22c55e}
      .followup{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;white-space:pre-wrap;font-size:0.88rem}
      .subject{font-weight:600;margin-bottom:16px;color:#333}
      footer{margin-top:40px;font-size:0.75rem;color:#999;text-align:center;border-top:1px solid #eee;padding-top:16px}
    </style></head><body>
    <h1>Client Onboarding Report</h1>
    <div class="meta">Generated by OnboardIQ · ${new Date().toLocaleString()}</div>
    <p><span class="score">${pct}% Complete</span></p>
    ${missingItems.length ? `<h2>🔴 Missing Items (${missingItems.length})</h2>${missingItems.map(i=>`<div class="item red"><strong>${escapeHtml(i.name)}</strong><br>${escapeHtml(i.followup||'')}</div>`).join('')}` : ''}
    ${securityWarnings.length ? `<h2>🟠 Security Warnings (${securityWarnings.length})</h2>${securityWarnings.map(w=>`<div class="item orange"><strong>${escapeHtml(w.label)}</strong><br>${escapeHtml(w.desc)}</div>`).join('')}` : ''}
    ${unclearItems.length ? `<h2>🟡 Unclear Requirements (${unclearItems.length})</h2>${unclearItems.map(u=>`<div class="item yellow"><strong>${escapeHtml(u.label)}</strong><br>${escapeHtml(u.suggestion)}</div>`).join('')}` : ''}
    ${confirmedItems.length ? `<h2>🟢 Confirmed Items (${confirmedItems.length})</h2>${confirmedItems.map(c=>`<div class="item green"><strong>${escapeHtml(c.name)}</strong></div>`).join('')}` : ''}
    <h2>📧 Follow-up Message</h2>
    <div class="subject">Subject: ${escapeHtml(subject)}</div>
    <div class="followup">${escapeHtml(body)}</div>
    <footer>Generated by OnboardIQ — Client Onboarding Document Checker</footer>
    </body></html>`);
  win.document.close();
  setTimeout(() => win.print(), 500);
}

// ─────────────────────────────────────────────────────────────────────────────
// 13.  PERSISTENCE (localStorage)
// ─────────────────────────────────────────────────────────────────────────────
function saveChecklist() {
  try {
    localStorage.setItem('onboardiq-checklist', JSON.stringify(state.checklist));
    showToast('Checklist saved to browser storage!', 'success');
  } catch { showToast('Could not save checklist', 'error'); }
}

function loadChecklist() {
  try {
    const raw = localStorage.getItem('onboardiq-checklist');
    if (!raw) { showToast('No saved checklist found', 'warning'); return; }
    state.checklist = JSON.parse(raw);
    renderAllChecklistItems();
    updateChecklistMeta();
    showToast(`Checklist loaded (${state.checklist.length} items)`, 'success');
  } catch { showToast('Could not load checklist', 'error'); }
}

// ─────────────────────────────────────────────────────────────────────────────
// 14.  SAMPLE TEXT
// ─────────────────────────────────────────────────────────────────────────────
const SAMPLE_SUBMISSION = `Hi team,

Here's our onboarding information for the website project:

BRAND ASSETS:
- Logo: I'll send the logo files soon, probably a PNG. We might have an SVG somewhere, TBD.
- Color palette: Our main colors are blue and white, more or less. I think our designer knows the exact hex codes.
- Style guide: We don't really have a formal one, we'll figure it out.

CONTENT:
- Homepage copy: Attached below (see rough draft)
- About us page: TBC — our founder wants to write this herself but she's been busy ASAP.
- Blog content: Maybe 3-4 posts to start with, ideally.

CREDENTIALS (URGENT):
- WordPress admin: username: admin, password: [redacted]
- Hosting (cPanel): login@host.com / [redacted]
- Domain registrar is GoDaddy — I'll share login details if possible.
- Google Analytics ID: GA-123456789

API / INTEGRATIONS:
- Stripe API key: [redacted; configure securely outside the repository]
- Mailchimp API: not sure which key, I'll check with IT later.

TIMELINE:
- We'd like to go live ASAP, maybe around mid-next-month? Flexible on this.
- Reviews/approvals: we'll figure out a process.

Let me know if you need anything else!

Thanks,
Sarah
Acme Corp`;

// ─────────────────────────────────────────────────────────────────────────────
// 15.  RESET
// ─────────────────────────────────────────────────────────────────────────────
function resetAll() {
  state.checklist = [];
  state.submissionText = '';
  state.analysisResult = null;
  document.getElementById('submission-text').value = '';
  document.getElementById('checklist-list').innerHTML = '';
  document.getElementById('checklist-list').hidden = true;
  document.getElementById('checklist-empty').hidden = false;
  document.getElementById('analysis-progress-bar').style.width = '0%';
  document.getElementById('analysis-status-text').textContent = 'Preparing…';
  [1,2,3,4].forEach(n => {
    const el = document.getElementById(`log-line-${n}`);
    el.textContent = n === 1 ? 'Initializing engine…' : '';
    el.className = 'log-line';
  });
  document.getElementById('btn-run-analysis').disabled = false;
  updateChecklistMeta();
  goToStep(1);
  showToast('Reset complete', 'info');
}

// ─────────────────────────────────────────────────────────────────────────────
// 16.  EVENT WIRING
// ─────────────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ── Step nav buttons ──
  document.querySelectorAll('.step-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = parseInt(btn.dataset.step);
      if (target < state.currentStep) goToStep(target); // allow going back
    });
  });

  // ── Add item ──
  document.getElementById('btn-add-item').addEventListener('click', () => {
    const name = document.getElementById('item-name').value.trim();
    if (!name) { showToast('Please enter an item name', 'warning'); document.getElementById('item-name').focus(); return; }
    addChecklistItem({
      name,
      category: document.getElementById('item-category').value,
      keywords: document.getElementById('item-keywords').value,
      required: document.getElementById('item-required').checked,
      sensitive: document.getElementById('item-sensitive').checked,
      followup: document.getElementById('item-followup').value.trim(),
    });
    clearAddForm();
    showToast(`"${name}" added to checklist`, 'success');
  });

  // Enter key on item name field
  document.getElementById('item-name').addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btn-add-item').click();
  });

  // ── Filter chips ──
  document.getElementById('checklist-filters').addEventListener('click', e => {
    const chip = e.target.closest('.filter-chip');
    if (chip) applyFilter(chip.dataset.filter);
  });

  // ── Template dropdown ──
  const templateBtn = document.getElementById('btn-template-toggle');
  const templateDd  = document.getElementById('template-dropdown');
  templateBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = !templateDd.hidden;
    templateDd.hidden = open;
    templateBtn.setAttribute('aria-expanded', !open);
  });
  document.addEventListener('click', () => { templateDd.hidden = true; templateBtn.setAttribute('aria-expanded', 'false'); });

  document.querySelectorAll('.template-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const key = opt.dataset.template;
      const tpl = TEMPLATES[key];
      if (!tpl) return;
      if (state.checklist.length > 0) {
        showModal(
          'Replace Checklist?',
          'This will replace your current checklist items with the template. Continue?',
          () => {
            state.checklist = [];
            document.getElementById('checklist-list').innerHTML = '';
            tpl.forEach(item => addChecklistItem(item));
            showToast(`Template loaded: ${opt.querySelector('strong').textContent}`, 'success');
          }
        );
      } else {
        tpl.forEach(item => addChecklistItem(item));
        showToast(`Template loaded: ${opt.querySelector('strong').textContent}`, 'success');
      }
      templateDd.hidden = true;
    });
  });

  // ── Save / Load ──
  document.getElementById('btn-save-checklist').addEventListener('click', saveChecklist);
  document.getElementById('btn-load-checklist').addEventListener('click', loadChecklist);
  document.getElementById('btn-reset-all').addEventListener('click', () => {
    showModal('Reset Everything?', 'This will clear your checklist, submission, and all results.', resetAll);
  });

  // ── Step 1 → 2 ──
  document.getElementById('btn-step1-next').addEventListener('click', () => {
    if (state.checklist.length === 0) { showToast('Add at least one checklist item first', 'warning'); return; }
    goToStep(2);
  });

  // ── Step 2: textarea ──
  const textarea = document.getElementById('submission-text');
  function updateTextCounts() {
    const text = textarea.value;
    document.getElementById('char-count').textContent = `${text.length} characters`;
    document.getElementById('word-count').textContent = `${text.trim().split(/\s+/).filter(Boolean).length} words`;
    state.submissionText = text;
  }
  textarea.addEventListener('input', updateTextCounts);

  document.getElementById('btn-clear-text').addEventListener('click', () => {
    textarea.value = '';
    state.submissionText = '';
    updateTextCounts();
  });

  document.getElementById('btn-load-sample').addEventListener('click', () => {
    textarea.value = SAMPLE_SUBMISSION;
    state.submissionText = SAMPLE_SUBMISSION;
    updateTextCounts();
    showToast('Sample submission loaded', 'info');
  });

  // ── File drop zone ──
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('file-input');

  document.getElementById('btn-browse-file').addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('click', () => fileInput.click());
  dropzone.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      textarea.value = e.target.result;
      state.submissionText = e.target.result;
      updateTextCounts();
      showToast(`File loaded: ${file.name}`, 'success');
    };
    reader.readAsText(file);
  });

  dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('drag-over'); });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('drag-over'));
  dropzone.addEventListener('drop', e => {
    e.preventDefault(); dropzone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith('.txt')) { showToast('Please drop a .txt file', 'warning'); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      textarea.value = ev.target.result;
      state.submissionText = ev.target.result;
      updateTextCounts();
      showToast(`File loaded: ${file.name}`, 'success');
    };
    reader.readAsText(file);
  });

  document.getElementById('btn-step2-back').addEventListener('click', () => goToStep(1));
  document.getElementById('btn-step2-next').addEventListener('click', () => {
    if (!state.submissionText.trim()) { showToast('Please paste or upload submission text first', 'warning'); return; }
    goToStep(3);
  });

  // ── Step 3: back + run ──
  document.getElementById('btn-step3-back').addEventListener('click', () => goToStep(2));
  document.getElementById('btn-run-analysis').addEventListener('click', () => runAnalysis());

  // ── Step 4: back / rerun / new check ──
  document.getElementById('btn-step4-back').addEventListener('click', () => goToStep(3));
  document.getElementById('btn-rerun').addEventListener('click', () => {
    document.getElementById('btn-run-analysis').disabled = false;
    goToStep(3);
  });
  document.getElementById('btn-new-check').addEventListener('click', () => {
    showModal('Start New Check?', 'This will reset everything and take you back to Step 1.', resetAll);
  });

  // ── Follow-up controls ──
  document.getElementById('tone-select').addEventListener('change', generateFollowUp);
  document.getElementById('btn-regenerate').addEventListener('click', generateFollowUp);
  document.getElementById('followup-textarea').addEventListener('input', updateFollowUpStats);

  // ── Copy / Export ──
  document.getElementById('btn-copy-subject').addEventListener('click', () => {
    copyToClipboard(document.getElementById('followup-subject').value, 'Subject line');
  });
  document.getElementById('btn-copy-message').addEventListener('click', () => {
    copyToClipboard(document.getElementById('followup-textarea').value, 'Message');
  });
  document.getElementById('btn-copy-full').addEventListener('click', () => {
    const subject = document.getElementById('followup-subject').value;
    const body    = document.getElementById('followup-textarea').value;
    copyToClipboard(`Subject: ${subject}\n\n${body}`, 'Full email');
  });
  document.getElementById('btn-export-pdf').addEventListener('click', exportPDF);

  // ── Load Web template by default ──
  TEMPLATES.web.forEach(item => addChecklistItem(item));
  showToast('Web Project template loaded. Customize your checklist!', 'info', 4000);
});
