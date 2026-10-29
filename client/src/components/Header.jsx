import React from 'react';
import { useApp } from '../context/AppContext';

export default function Header() {
  const { actions } = useApp();

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="logo-group">
          <div className="logo-icon">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="28" height="28" rx="8" fill="url(#logo-grad)"/>
              <path d="M7 9h14M7 14h10M7 19h7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="21" cy="19" r="3" fill="#34d399"/>
              <defs>
                <linearGradient id="logo-grad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1"/>
                  <stop offset="1" stopColor="#8b5cf6"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="logo-text">OnboardIQ</span>
        </div>

        <nav className="header-actions">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => {
              const data = localStorage.getItem('onboardiq-checklist');
              if (data) {
                actions.showToast('Checklist saved to localStorage', 'success');
              }
            }}
            title="Save checklist"
          >
            <SaveIcon /> Save Checklist
          </button>
          <button
            className="btn btn-ghost btn-sm btn-danger"
            onClick={() =>
              actions.showModal(
                'Reset Everything?',
                'This will clear your checklist, submission text, and all results.',
                () => actions.reset()
              )
            }
            title="Reset all"
          >
            <ResetIcon /> Reset
          </button>
        </nav>
      </div>
    </header>
  );
}

const SaveIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
    <polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/>
  </svg>
);

const ResetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1,4 1,10 7,10"/>
    <path d="M3.51 15a9 9 0 1 0 .49-3.3"/>
  </svg>
);
