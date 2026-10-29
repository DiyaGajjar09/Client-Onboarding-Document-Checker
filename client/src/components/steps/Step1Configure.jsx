import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../../context/AppContext';

const CAT_LABELS = {
  asset: '📁 Asset', credential: '🔑 Credential', requirement: '📋 Requirement',
  access: '🔐 Access', content: '✍️ Content', legal: '⚖️ Legal',
};

const CATEGORY_OPTIONS = Object.entries(CAT_LABELS).map(([v, l]) => ({ value: v, label: l }));

const FILTER_OPTIONS = [
  { key: 'all',         label: 'All'           },
  { key: 'asset',       label: '📁 Assets'      },
  { key: 'credential',  label: '🔑 Credentials' },
  { key: 'requirement', label: '📋 Requirements'},
  { key: 'access',      label: '🔐 Access'      },
  { key: 'content',     label: '✍️ Content'     },
  { key: 'legal',       label: '⚖️ Legal'       },
];

// ── Add Item Form ─────────────────────────────────────────────────────────────
function AddItemForm({ onAdd }) {
  const [form, setForm] = useState({
    name: '', category: 'asset', keywords: '', required: true, sensitive: false, followup: '',
  });

  const nameRef = useRef(null);

  function handleSubmit(e) {
    e?.preventDefault();
    if (!form.name.trim()) { nameRef.current?.focus(); return; }
    onAdd(form);
    setForm({ name: '', category: 'asset', keywords: '', required: true, sensitive: false, followup: '' });
    nameRef.current?.focus();
  }

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h2 className="card-section-title">
        <PlusCircleIcon /> Add Checklist Item
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row" style={{ marginBottom: '16px' }}>
          <div className="form-group flex-2">
            <label className="form-label" htmlFor="item-name">
              Item Name <span className="required">*</span>
            </label>
            <input
              id="item-name" ref={nameRef} type="text" className="form-input"
              placeholder="e.g. Brand Logo (SVG)" autoComplete="off"
              value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="item-category">Category</label>
            <select id="item-category" className="form-input form-select"
              value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
              {CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row" style={{ marginBottom: '16px' }}>
          <div className="form-group flex-2">
            <label className="form-label" htmlFor="item-keywords">
              Detection Keywords <span className="hint">(comma separated)</span>
            </label>
            <input id="item-keywords" type="text" className="form-input"
              placeholder="e.g. logo, brand mark, SVG, icon"
              value={form.keywords} onChange={e => setForm(p => ({ ...p, keywords: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Options</label>
            <div className="toggle-group">
              <label className="toggle-label">
                <span
                  className={`toggle-track${form.required ? ' toggle-on' : ''}`}
                  onClick={() => setForm(p => ({ ...p, required: !p.required }))}
                />
                <span>Required</span>
              </label>
              <label className="toggle-label">
                <span
                  className={`toggle-track${form.sensitive ? ' toggle-danger-on' : ''}`}
                  onClick={() => setForm(p => ({ ...p, sensitive: !p.sensitive }))}
                />
                <span>Sensitive</span>
              </label>
            </div>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group flex-2">
            <label className="form-label" htmlFor="item-followup">
              Auto Follow-up Question <span className="hint">(used if missing)</span>
            </label>
            <input id="item-followup" type="text" className="form-input"
              placeholder="e.g. Could you please share the logo in SVG format?"
              value={form.followup} onChange={e => setForm(p => ({ ...p, followup: e.target.value }))} />
          </div>
          <div className="form-group form-actions-col">
            <button type="submit" className="btn btn-primary btn-full">
              <PlusIcon /> Add Item
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Checklist Item Row ────────────────────────────────────────────────────────
function ChecklistItemRow({ item, onDelete }) {
  const kws = item.keywords.slice(0, 4).join(', ') + (item.keywords.length > 4 ? ', …' : '');
  const catLabel = CAT_LABELS[item.category] || item.category;

  return (
    <li className="checklist-item" data-category={item.category}>
      <span className={`item-cat-badge cat-${item.category}`}>{catLabel}</span>
      <div className="item-info">
        <div className="item-name">{item.name}</div>
        <div className="item-keywords">{kws}</div>
      </div>
      <div className="item-flags">
        <span className={`item-flag ${item.required ? 'flag-required' : 'flag-optional'}`}>
          {item.required ? 'Required' : 'Optional'}
        </span>
        {item.sensitive && <span className="item-flag flag-sensitive">🔒 Sensitive</span>}
      </div>
      <div className="item-actions">
        <button className="item-btn item-btn-delete" onClick={() => onDelete(item.id)} aria-label={`Delete ${item.name}`}>
          <TrashIcon />
        </button>
      </div>
    </li>
  );
}

// ── Template Dropdown ─────────────────────────────────────────────────────────
function TemplateDropdown({ templates, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!templates) return null;

  return (
    <div className="template-dropdown-wrapper" ref={ref}>
      <button className="btn btn-secondary btn-sm" onClick={() => setOpen(o => !o)} aria-haspopup="true" aria-expanded={open}>
        <GridIcon /> Use Template
        <ChevronIcon />
      </button>
      {open && (
        <div className="template-dropdown" role="menu">
          {Object.entries(templates).map(([key, tpl]) => (
            <button key={key} className="template-option" role="menuitem"
              onClick={() => { onSelect(key, tpl); setOpen(false); }}>
              <span className="template-icon">{tpl.icon}</span>
              <div className="template-option-info">
                <strong>{tpl.label}</strong>
                <small>{tpl.description}</small>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Step 1 Main ───────────────────────────────────────────────────────────────
export default function Step1Configure() {
  const { state, actions } = useApp();
  const { checklist } = state;
  const [activeFilter, setActiveFilter] = useState('all');
  const [templates, setTemplates]       = useState(null);

  // Load templates from API on mount
  useEffect(() => {
    axios.get('/api/templates')
      .then(res => setTemplates(res.data.data))
      .catch(() => actions.showToast('Could not load templates from server', 'warning'));
  }, []); // eslint-disable-line

  function handleAddItem(form) {
    const item = actions.addItem(form);
    actions.showToast(`"${item.name}" added to checklist`, 'success');
  }

  function handleDeleteItem(id) {
    actions.deleteItem(id);
  }

  function handleSelectTemplate(key, tpl) {
    if (checklist.length > 0) {
      actions.showModal(
        'Replace Checklist?',
        'This will replace your current checklist with the template items. Continue?',
        () => {
          actions.setChecklist(tpl.items);
          actions.showToast(`Template loaded: ${tpl.label}`, 'success');
        }
      );
    } else {
      actions.setChecklist(tpl.items);
      actions.showToast(`Template loaded: ${tpl.label}`, 'success');
    }
  }

  function handleNext() {
    if (checklist.length === 0) {
      actions.showToast('Add at least one checklist item first', 'warning');
      return;
    }
    actions.goToStep(2);
  }

  const visible = activeFilter === 'all'
    ? checklist
    : checklist.filter(i => i.category === activeFilter);

  return (
    <section className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Panel Header */}
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Configure Your Checklist</h1>
          <p className="panel-subtitle">Define expected items. Use templates to get started quickly.</p>
        </div>
        <div className="panel-header-actions">
          <TemplateDropdown templates={templates} onSelect={handleSelectTemplate} />
        </div>
      </div>

      {/* Add Item Form */}
      <AddItemForm onAdd={handleAddItem} />

      {/* Checklist Table */}
      <div className="glass-card">
        <div className="card-header-row">
          <h2 className="card-section-title">
            <ChecklistIcon /> Checklist Items
          </h2>
          <span className="item-count-badge">{checklist.length} item{checklist.length !== 1 ? 's' : ''}</span>
        </div>

        <div className="checklist-filters">
          {FILTER_OPTIONS.map(f => (
            <button key={f.key} className={`filter-chip${activeFilter === f.key ? ' active' : ''}`}
              onClick={() => setActiveFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        {checklist.length === 0 ? (
          <div className="checklist-empty">
            <div className="empty-icon">📋</div>
            <p>No checklist items yet. Add items above or use a template.</p>
          </div>
        ) : (
          <ul className="checklist-list">
            {visible.map(item => (
              <ChecklistItemRow key={item.id} item={item} onDelete={handleDeleteItem} />
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      <div className="step-footer">
        <div />
        <button className="btn btn-primary btn-lg" onClick={handleNext}>
          Continue to Paste Submission <ArrowRightIcon />
        </button>
      </div>
    </section>
  );
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const PlusCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);
const GridIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
  </svg>
);
const ChevronIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6,9 12,15 18,9"/>
  </svg>
);
const ChecklistIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9,11 12,14 22,4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);
const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
  </svg>
);
