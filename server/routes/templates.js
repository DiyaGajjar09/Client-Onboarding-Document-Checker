const express = require('express');
const router  = express.Router();

const TEMPLATES = {
  web: {
    label: 'Web Project',
    icon: '🌐',
    description: 'Logo, brand guide, content, domain, hosting credentials',
    items: [
      { name: 'Brand Logo (SVG/PNG)', category: 'asset', required: true, sensitive: false, keywords: ['logo', 'brand mark', 'svg', 'icon', 'logotype', 'brand logo'], followup: 'Could you please share your brand logo in SVG or high-resolution PNG format?' },
      { name: 'Brand Style Guide', category: 'asset', required: true, sensitive: false, keywords: ['style guide', 'brand guide', 'brand book', 'color palette', 'typography'], followup: 'Do you have a brand style guide or brand book we can reference for colors, fonts, and design rules?' },
      { name: 'Website Copy / Content', category: 'content', required: true, sensitive: false, keywords: ['copy', 'content', 'text', 'pages', 'about us', 'homepage text', 'website content'], followup: 'Please share the written content for each page (Homepage, About, Services, Contact, etc.).' },
      { name: 'Domain Name & Registrar Access', category: 'access', required: true, sensitive: true, keywords: ['domain', 'godaddy', 'namecheap', 'dns', 'registrar', 'cpanel'], followup: 'Please share domain registrar login details securely (use a password manager share link, not plain text).' },
      { name: 'Hosting Credentials', category: 'credential', required: true, sensitive: true, keywords: ['hosting', 'ftp', 'ssh', 'cpanel', 'server', 'wp-admin', 'wordpress login'], followup: 'Please share hosting/FTP credentials via a secure channel (e.g. 1Password, Bitwarden Send link).' },
      { name: 'Google Analytics / Tag Manager', category: 'access', required: false, sensitive: false, keywords: ['google analytics', 'gtm', 'tag manager', 'ga4', 'measurement id', 'analytics'], followup: 'Do you have a Google Analytics or Tag Manager account? If so, please add us as an editor.' },
      { name: 'Target Audience Description', category: 'requirement', required: true, sensitive: false, keywords: ['audience', 'target', 'personas', 'demographic', 'ideal customer', 'target audience'], followup: 'Could you describe your target audience — who are your ideal customers or users?' },
      { name: 'Project Timeline / Deadline', category: 'requirement', required: true, sensitive: false, keywords: ['deadline', 'timeline', 'launch date', 'due date', 'go live', 'target date', 'go-live'], followup: 'What is your preferred launch date or project deadline?' },
    ],
  },
  brand: {
    label: 'Brand Campaign',
    icon: '🎨',
    description: 'Brand assets, messaging, target audience, budget',
    items: [
      { name: 'Existing Logo Files', category: 'asset', required: false, sensitive: false, keywords: ['logo', 'existing logo', 'current brand', 'ai file', 'eps', 'vector'], followup: 'Do you have existing logo files (AI, EPS, SVG)? If yes, please share them.' },
      { name: 'Brand Colors (Hex/Pantone)', category: 'requirement', required: true, sensitive: false, keywords: ['colors', 'hex', 'pantone', 'brand color', 'palette', 'rgb', 'cmyk'], followup: 'Please share your brand colors in Hex, Pantone, or CMYK values.' },
      { name: 'Brand Messaging / Tagline', category: 'content', required: true, sensitive: false, keywords: ['tagline', 'slogan', 'messaging', 'brand voice', 'mission', 'value proposition'], followup: 'What is your brand tagline, mission statement, or key messaging pillars?' },
      { name: 'Target Audience', category: 'requirement', required: true, sensitive: false, keywords: ['audience', 'target market', 'personas', 'demographic'], followup: 'Who is the target audience for this campaign?' },
      { name: 'Campaign Budget', category: 'requirement', required: true, sensitive: false, keywords: ['budget', 'spend', 'investment', 'cost', 'allocated', 'campaign budget'], followup: 'What is the allocated budget for this campaign?' },
      { name: 'Competitor References', category: 'requirement', required: false, sensitive: false, keywords: ['competitors', 'reference', 'inspiration', 'benchmark', 'like brands'], followup: 'Could you share 2–3 competitor or inspiration brands you admire?' },
      { name: 'Campaign Deliverables List', category: 'requirement', required: true, sensitive: false, keywords: ['deliverables', 'output', 'assets needed', 'formats', 'social media'], followup: 'Please list all campaign deliverables needed (e.g. social posts, banners, video, email).' },
      { name: 'Legal / Usage Restrictions', category: 'legal', required: false, sensitive: false, keywords: ['legal', 'restrictions', 'trademark', 'compliance', 'nda', 'brand guidelines', 'usage rights'], followup: 'Are there any legal restrictions, trademarked elements, or brand usage guidelines we should be aware of?' },
    ],
  },
  api: {
    label: 'API Integration',
    icon: '⚙️',
    description: 'API keys, endpoints, auth tokens, docs, test credentials',
    items: [
      { name: 'API Keys / Tokens', category: 'credential', required: true, sensitive: true, keywords: ['api key', 'token', 'secret', 'bearer', 'oauth', 'client id', 'client secret'], followup: 'Please share API keys/tokens via a secure link (e.g. 1Password, Doppler, or encrypted email).' },
      { name: 'API Documentation / Spec', category: 'asset', required: true, sensitive: false, keywords: ['api docs', 'swagger', 'openapi', 'postman', 'documentation', 'spec', 'endpoints'], followup: 'Please share the API documentation, Swagger/OpenAPI spec, or Postman collection.' },
      { name: 'Base URL / Endpoint', category: 'requirement', required: true, sensitive: false, keywords: ['base url', 'endpoint', 'api url', 'host', 'api base', 'production url', 'staging url'], followup: 'What is the base URL for the API (production and staging)?' },
      { name: 'Authentication Method', category: 'requirement', required: true, sensitive: false, keywords: ['auth', 'authentication', 'jwt', 'oauth', 'basic auth', 'api key header'], followup: 'What authentication method does the API use (OAuth 2.0, JWT, API Key header, etc.)?' },
      { name: 'Test / Sandbox Credentials', category: 'credential', required: true, sensitive: true, keywords: ['sandbox', 'test env', 'staging creds', 'test key', 'test secret'], followup: 'Please provide test/sandbox credentials so we can develop without affecting production data.' },
      { name: 'Rate Limits & Quotas', category: 'requirement', required: false, sensitive: false, keywords: ['rate limit', 'quota', 'requests per minute', 'throttle', 'limits'], followup: 'Are there any rate limits, quotas, or throttling policies we should be aware of?' },
      { name: 'Webhook Configuration', category: 'requirement', required: false, sensitive: false, keywords: ['webhook', 'callback', 'callback url', 'notify url', 'event listener'], followup: 'Do you require webhook or callback URL setup? If so, what events should trigger them?' },
      { name: 'Error Handling Expectations', category: 'requirement', required: false, sensitive: false, keywords: ['error', 'error handling', 'retry', 'failure', '4xx', '5xx'], followup: 'How should our integration handle API errors and retry scenarios?' },
    ],
  },
  ecommerce: {
    label: 'E-Commerce Setup',
    icon: '🛒',
    description: 'Product catalog, payment gateway, shipping, policies',
    items: [
      { name: 'Product Catalog / CSV', category: 'asset', required: true, sensitive: false, keywords: ['products', 'catalog', 'csv', 'product list', 'sku', 'inventory'], followup: 'Please share your complete product catalog (CSV, Excel, or Shopify export) with titles, descriptions, prices, and SKUs.' },
      { name: 'Product Images', category: 'asset', required: true, sensitive: false, keywords: ['product images', 'photos', 'product photos', 'images', 'photography'], followup: 'Please share all product images. High-resolution JPEGs or PNGs preferred.' },
      { name: 'Payment Gateway Credentials', category: 'credential', required: true, sensitive: true, keywords: ['stripe', 'paypal', 'payment gateway', 'payment api', 'merchant id', 'publishable key'], followup: 'Please share payment gateway credentials (Stripe/PayPal etc.) via a secure link.' },
      { name: 'Shipping Configuration', category: 'requirement', required: true, sensitive: false, keywords: ['shipping', 'delivery', 'shipping rates', 'carrier', 'fedex', 'ups', 'usps'], followup: 'What are your shipping zones, rates, and preferred carriers?' },
      { name: 'Return / Refund Policy', category: 'legal', required: true, sensitive: false, keywords: ['return policy', 'refund', 'returns', 'exchange policy'], followup: 'Please share your return and refund policy text.' },
      { name: 'Terms & Conditions', category: 'legal', required: true, sensitive: false, keywords: ['terms', 'terms and conditions', 'tos', 'legal terms'], followup: 'Please share your Terms & Conditions document.' },
      { name: 'Tax Configuration', category: 'requirement', required: true, sensitive: false, keywords: ['tax', 'vat', 'gst', 'tax rates', 'tax exempt'], followup: 'What tax rules apply? (e.g. VAT in EU, sales tax by state, tax-exempt products).' },
      { name: 'Email Notification Templates', category: 'content', required: false, sensitive: false, keywords: ['email templates', 'order confirmation', 'shipping notification', 'transactional email'], followup: 'Do you have existing email templates for order confirmations and shipping notifications?' },
    ],
  },
};

/** GET /api/templates — returns all templates */
router.get('/', (_req, res) => {
  res.json({ success: true, data: TEMPLATES });
});

/** GET /api/templates/:key — returns one template */
router.get('/:key', (req, res) => {
  const tpl = TEMPLATES[req.params.key];
  if (!tpl) return res.status(404).json({ error: 'Template not found' });
  res.json({ success: true, data: tpl });
});

module.exports = router;
