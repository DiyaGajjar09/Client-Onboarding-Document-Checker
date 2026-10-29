import React from 'react';
import { useApp } from '../context/AppContext';

export default function Toast() {
  const { state } = useApp();

  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

  return (
    <div className="toast-container" role="status" aria-live="polite" aria-atomic="true">
      {state.toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          <span>{icons[toast.type] || '•'}</span>
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
