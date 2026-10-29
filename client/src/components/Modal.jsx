import React from 'react';
import { useApp } from '../context/AppContext';

export default function Modal() {
  const { state, actions } = useApp();
  const { modal } = state;

  if (!modal) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-box glass-card">
        <h3 className="modal-title" id="modal-title">{modal.title}</h3>
        <p className="modal-body">{modal.body}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={actions.closeModal}>Cancel</button>
          <button
            className="btn btn-danger"
            onClick={() => { actions.closeModal(); modal.onConfirm(); }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
