import React from 'react';
import { useApp } from '../context/AppContext';

const STEPS = [
  { num: 1, label: 'Configure Checklist' },
  { num: 2, label: 'Paste Submission'   },
  { num: 3, label: 'Run Analysis'       },
  { num: 4, label: 'Results & Follow-up'},
];

const CheckIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

export default function StepsBar() {
  const { state, actions } = useApp();
  const { currentStep } = state;

  return (
    <div className="steps-bar">
      <div className="steps-inner">
        {STEPS.map((step, idx) => {
          const isActive    = step.num === currentStep;
          const isCompleted = step.num < currentStep;

          return (
            <React.Fragment key={step.num}>
              <button
                className={`step-pill${isActive ? ' active' : ''}${isCompleted ? ' completed' : ''}`}
                onClick={() => { if (step.num < currentStep) actions.goToStep(step.num); }}
                aria-current={isActive ? 'step' : undefined}
                title={step.label}
              >
                <span className="step-num">
                  {isCompleted ? <CheckIcon /> : step.num}
                </span>
                <span className="step-label">{step.label}</span>
              </button>
              {idx < STEPS.length - 1 && (
                <div className="step-connector" aria-hidden="true" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
