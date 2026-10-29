import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useApp } from '../../context/AppContext';

const CAT_LABELS = {
  asset:'📁 Asset', credential:'🔑 Credential', requirement:'📋 Requirement',
  access:'🔐 Access', content:'✍️ Content', legal:'⚖️ Legal',
};
const CAT_COLORS = {
  asset:'#22d3ee', credential:'#f87171', requirement:'#818cf8',
  access:'#fbbf24', content:'#4ade80', legal:'#c084fc',
};

// ── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ pct = 0 }) {
  const circumference = 201;
  const offset = circumference - (circumference * pct / 100);
  const strokeColor = pct >= 80 ? '#22c55e' : pct >= 50 ? '#eab308' : '#ef4444';

  return (
    <div className="score-card glass-card">
      <div className="score-ring-wrapper">
        <svg className="score-ring" viewBox="0 0 80 80">
          <circle className="ring-bg-circle" cx="40" cy="40" r="32" />
          <circle
            className="ring-fill-circle" cx="40" cy="40" r="32"
            stroke={strokeColor}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <span className="score-pct">{pct}%</span>
      </div>
      <div className="score-label">Overall Completion</div>
    </div>
  );
}

// ── Mini Score Card ───────────────────────────────────────────────────────────
function MiniScore({ score }) {
  const color = CAT_COLORS[score.category] || '#94a3b8';
  const label = CAT_LABELS[score.category] || score.category;
  return (
    <div className="score-mini">
      <div className="score-mini-top">
        <span className="score-mini-label">{label}</span>
        <span className="score-mini-pct" style={{ color }}>{score.pct}%</span>
      </div>
      <div className="score-mini-bar-track">
        <div className="score-mini-bar" style={{ background: color, width: `${score.pct}%` }} />
      </div>
      <div className="score-mini-label">{score.confirmed} / {score.total} confirmed</div>
    </div>
  );
}

// ── Finding Panel ─────────────────────────────────────────────────────────────
function FindingPanel({ title, icon, badgeClass, items, renderItem, emptyMsg, panelClass }) {
  return (
    <div className={`finding-panel glass-card ${panelClass}`}>
      <div className="finding-panel-header">
        <div className="finding-icon">{icon}</div>
        <h2 className="finding-title">{title}</h2>
        <span className={`finding-badge ${badgeClass}`}>{items.length}</span>
      </div>
      {items.length === 0 ? (
        <div className="finding-empty"><span>{emptyMsg}</span></div>
      ) : (
        <ul className="finding-list">
          {items.map((item, idx) => (
            <li key={idx} className="finding-item slide-in" style={{ animationDelay: `${idx * 0.05}s` }}>
              {renderItem(item)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Follow-up Card ────────────────────────────────────────────────────────────
function FollowUpCard({ analysisResult }) {
  const { state, actions } = useApp();
  const [tone,    setTone]    = useState('professional');
  const [subject, setSubject] = useState(state.followup.subject || '');
  const [body,    setBody]    = useState(state.followup.body    || '');
  const [loading, setLoading] = useState(false);

  // Sync from context when followup changes
  useEffect(() => {
    setSubject(state.followup.subject || '');
    setBody(state.followup.body    || '');
  }, [state.followup]);

  async function regenerate(newTone = tone) {
    if (!analysisResult) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/followup', { analysisResult, tone: newTone });
      const { subject: s, body: b } = res.data.data;
      setSubject(s); setBody(b);
      actions.setFollowup({ subject: s, body: b });
    } catch {
      actions.showToast('Could not regenerate follow-up', 'error');
    } finally { setLoading(false); }
  }

  function handleToneChange(e) { setTone(e.target.value); regenerate(e.target.value); }

  async function copy(text, label) {
    try { await navigator.clipboard.writeText(text); }
    catch { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); document.execCommand('copy'); document.body.removeChild(t); }
    actions.showToast(`${label} copied!`, 'success');
  }

  function exportPDF() {
    const r = analysisResult;
    const pct = r?.summary?.overallPct ?? 0;
    const win = window.open('', '_blank');
    win.document.write(`<!DOCTYPE html><html><head><title>Onboarding Report</title>
    <style>body{font-family:system-ui,sans-serif;max-width:800px;margin:40px auto;padding:0 24px;line-height:1.6}
    h1{color:#6366f1}h2{font-size:1rem;border-bottom:2px solid #eee;padding-bottom:6px;margin:24px 0 12px}
    .item{padding:10px 14px;border-radius:8px;margin:8px 0;font-size:.9rem}
    .red{background:#fee2e2;border-left:3px solid #ef4444}.orange{background:#fff7ed;border-left:3px solid #f97316}
    .yellow{background:#fefce8;border-left:3px solid #eab308}.green{background:#f0fdf4;border-left:3px solid #22c55e}
    .pre{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:20px;white-space:pre-wrap;font-size:.88rem}
    footer{margin-top:40px;font-size:.75rem;color:#999;text-align:center;border-top:1px solid #eee;padding-top:16px}
    </style></head><body>
    <h1>Client Onboarding Report</h1>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()} · <strong>Completion:</strong> ${pct}%</p>
    ${r?.missingItems?.length ? `<h2>🔴 Missing (${r.missingItems.length})</h2>${r.missingItems.map(i=>`<div class="item red"><b>${i.name}</b>${i.followup ? '<br>'+i.followup : ''}</div>`).join('')}` : ''}
    ${r?.securityWarnings?.length ? `<h2>🟠 Security (${r.securityWarnings.length})</h2>${r.securityWarnings.map(w=>`<div class="item orange"><b>${w.label}</b><br>${w.desc}</div>`).join('')}` : ''}
    ${r?.unclearItems?.length ? `<h2>🟡 Unclear (${r.unclearItems.length})</h2>${r.unclearItems.map(u=>`<div class="item yellow"><b>${u.label}</b><br>${u.suggestion}</div>`).join('')}` : ''}
    ${r?.confirmedItems?.length ? `<h2>🟢 Confirmed (${r.confirmedItems.length})</h2>${r.confirmedItems.map(c=>`<div class="item green"><b>${c.name}</b></div>`).join('')}` : ''}
    <h2>📧 Follow-up Message</h2>
    <p><strong>Subject:</strong> ${subject}</p>
    <div class="pre">${body.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div>
    <footer>Generated by OnboardIQ</footer></body></html>`);
    win.document.close();
    setTimeout(() => win.print(), 400);
  }

  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  return (
    <div className="followup-card glass-card">
      <div className="followup-header">
        <div>
          <h2 className="card-section-title"><EmailIcon /> Client-Ready Follow-up Message</h2>
          <p className="card-section-subtitle">Auto-generated from your findings. Edit before sending.</p>
        </div>
        <div className="followup-controls">
          <div className="tone-selector">
            <label className="form-label" htmlFor="tone-select">Tone</label>
            <select id="tone-select" className="form-input form-select form-select-sm"
              value={tone} onChange={handleToneChange}>
              <option value="professional">Professional</option>
              <option value="friendly">Friendly</option>
              <option value="formal">Formal</option>
              <option value="concise">Concise</option>
            </select>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => regenerate()} disabled={loading}>
            {loading ? <div className="spinner" /> : <RefreshIcon />} Regenerate
          </button>
        </div>
      </div>

      <div className="followup-body">
        <input type="text" className="followup-subject form-input" value={subject}
          onChange={e => setSubject(e.target.value)} placeholder="Subject: Onboarding Follow-up" aria-label="Email subject" />
        <textarea className="followup-textarea" value={body}
          onChange={e => setBody(e.target.value)} aria-label="Follow-up message" spellCheck />
      </div>

      <div className="followup-footer">
        <span className="followup-stats">{wordCount} words · {body.length} characters</span>
        <div className="followup-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => copy(subject, 'Subject')}>
            <CopyIcon /> Copy Subject
          </button>
          <button className="btn btn-secondary btn-sm" onClick={() => copy(body, 'Message')}>
            <CopyIcon /> Copy Message
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => copy(`Subject: ${subject}\n\n${body}`, 'Full email')}>
            <CopyIcon /> Copy Full Email
          </button>
          <button className="btn btn-primary btn-sm" onClick={exportPDF}>
            <DownloadIcon /> Export PDF
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Step 4 Main ───────────────────────────────────────────────────────────────
export default function Step4Results() {
  const { state, actions } = useApp();
  const { analysisResult } = state;

  if (!analysisResult) return null;

  const { summary, missingItems, confirmedItems, securityWarnings, unclearItems } = analysisResult;

  return (
    <section className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Results &amp; Follow-up</h1>
          <p className="panel-subtitle">Review the findings and generate your client-ready follow-up.</p>
        </div>
        <div className="panel-header-actions">
          <button className="btn btn-ghost btn-sm" onClick={() => { actions.goToStep(3); }}>
            <RefreshIcon /> Re-scan
          </button>
        </div>
      </div>

      {/* Scorecard */}
      <div className="scorecard-row">
        <ScoreRing pct={summary.overallPct} />
        <div className="score-mini-cards">
          {summary.categoryScores.map(s => <MiniScore key={s.category} score={s} />)}
        </div>
      </div>

      {/* Findings Grid */}
      <div className="findings-grid">
        <FindingPanel
          title="Missing Items" icon="🔴" panelClass="panel-missing" badgeClass=""
          items={missingItems} emptyMsg="✅ All required items found!"
          renderItem={item => (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="finding-item-icon">❌</div>
              <div className="finding-item-body">
                <div className="finding-item-name">{item.name}</div>
                <div className="finding-item-desc">{CAT_LABELS[item.category]} · Not found in submission</div>
                {item.followup && <div className="finding-item-context">💬 {item.followup}</div>}
              </div>
            </div>
          )}
        />
        <FindingPanel
          title="Security Warnings" icon="🟠" panelClass="panel-security" badgeClass="badge-orange"
          items={securityWarnings} emptyMsg="✅ No credential risks detected!"
          renderItem={item => (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="finding-item-icon">🚨</div>
              <div className="finding-item-body">
                <div className="finding-item-name">{item.label}</div>
                <div className="finding-item-desc">{item.desc}</div>
                {item.context && <div className="finding-item-context">"…{item.context}…"</div>}
              </div>
            </div>
          )}
        />
        <FindingPanel
          title="Unclear Requirements" icon="🟡" panelClass="panel-unclear" badgeClass="badge-yellow"
          items={unclearItems} emptyMsg="✅ All requirements are clear!"
          renderItem={item => (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="finding-item-icon">❓</div>
              <div className="finding-item-body">
                <div className="finding-item-name">{item.label}</div>
                <div className="finding-item-desc">{item.suggestion}</div>
                {item.context && <div className="finding-item-context">"…{item.context}…"</div>}
              </div>
            </div>
          )}
        />
        <FindingPanel
          title="Confirmed Items" icon="🟢" panelClass="panel-confirmed" badgeClass="badge-green"
          items={confirmedItems} emptyMsg="No items confirmed yet."
          renderItem={item => (
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="finding-item-icon">✅</div>
              <div className="finding-item-body">
                <div className="finding-item-name">{item.name}</div>
                <div className="finding-item-desc">{CAT_LABELS[item.category]} · Detected in submission</div>
              </div>
            </div>
          )}
        />
      </div>

      {/* Follow-up Generator */}
      <FollowUpCard analysisResult={analysisResult} />

      {/* Footer */}
      <div className="step-footer">
        <button className="btn btn-ghost" onClick={() => actions.goToStep(3)}>
          <ArrowLeftIcon /> Back
        </button>
        <button className="btn btn-primary btn-lg"
          onClick={() => actions.showModal('Start New Check?', 'This will reset everything and take you back to Step 1.', () => actions.reset())}>
          <PlusIcon /> New Check
        </button>
      </div>
    </section>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────
const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
    <polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const RefreshIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1,4 1,10 7,10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-3.3"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
