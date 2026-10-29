import React, { useRef } from 'react';
import { useApp } from '../../context/AppContext';

const SAMPLE = `Hi team,

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

export default function Step2Submit() {
  const { state, actions } = useApp();
  const fileRef = useRef(null);

  const text = state.submissionText;

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  function handleDragOver(e) { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }
  function handleDragLeave(e) { e.currentTarget.classList.remove('drag-over'); }
  function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (!file || !file.name.endsWith('.txt')) {
      actions.showToast('Please drop a .txt file', 'warning'); return;
    }
    readFile(file);
  }

  function readFile(file) {
    const reader = new FileReader();
    reader.onload = ev => {
      actions.setSubmission(ev.target.result);
      actions.showToast(`File loaded: ${file.name}`, 'success');
    };
    reader.readAsText(file);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (file) readFile(file);
    e.target.value = '';
  }

  function handleNext() {
    if (!text.trim()) {
      actions.showToast('Please paste or upload submission text first', 'warning'); return;
    }
    actions.goToStep(3);
  }

  return (
    <section className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Paste Client Submission</h1>
          <p className="panel-subtitle">Paste the client's email, notes, or document text. You can also drag &amp; drop a .txt file.</p>
        </div>
      </div>

      <div className="glass-card">
        {/* Drop zone */}
        <div
          className="dropzone" role="region" aria-label="File drop zone" tabIndex={0}
          onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') fileRef.current?.click(); }}
        >
          <div className="dropzone-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
          </div>
          <p className="dropzone-text">Drop a <strong>.txt</strong> file here, or click to browse</p>
          <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); fileRef.current?.click(); }}>
            Browse File
          </button>
          <input type="file" ref={fileRef} accept=".txt" hidden onChange={handleFileChange} />
        </div>

        {/* Textarea */}
        <div className="textarea-wrapper">
          <div className="textarea-toolbar">
            <span className="textarea-label">
              <DocIcon /> Client Submission Text
            </span>
            <div className="textarea-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => { actions.setSubmission(''); }}>Clear</button>
              <button className="btn btn-ghost btn-sm" onClick={() => {
                actions.setSubmission(SAMPLE);
                actions.showToast('Sample submission loaded', 'info');
              }}>
                Load Sample
              </button>
            </div>
          </div>
          <textarea
            className="submission-textarea"
            placeholder="Paste the client's email body, notes, onboarding form response, or any submission text here..."
            value={text}
            onChange={e => actions.setSubmission(e.target.value)}
            spellCheck={false}
            aria-label="Client submission text"
          />
          <div className="textarea-meta">
            <span className="char-count">{charCount} characters</span>
            <span className="word-count">{wordCount} words</span>
          </div>
        </div>
      </div>

      <div className="step-footer">
        <button className="btn btn-ghost" onClick={() => actions.goToStep(1)}>
          <ArrowLeftIcon /> Back
        </button>
        <button className="btn btn-primary btn-lg" onClick={handleNext}>
          Continue to Analysis <ArrowRightIcon />
        </button>
      </div>
    </section>
  );
}

const DocIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14,2 14,8 20,8"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
  </svg>
);
