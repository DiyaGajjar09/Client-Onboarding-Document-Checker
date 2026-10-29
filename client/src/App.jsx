import React from 'react';
import { useApp } from './context/AppContext';
import Header       from './components/Header';
import StepsBar     from './components/StepsBar';
import Toast        from './components/Toast';
import Modal        from './components/Modal';
import Step1Configure from './components/steps/Step1Configure';
import Step2Submit    from './components/steps/Step2Submit';
import Step3Analyze   from './components/steps/Step3Analyze';
import Step4Results   from './components/steps/Step4Results';

export default function App() {
  const { state } = useApp();
  const { currentStep } = state;

  return (
    <>
      {/* Background orbs */}
      <div className="bg-orb orb-1" aria-hidden="true" />
      <div className="bg-orb orb-2" aria-hidden="true" />
      <div className="bg-orb orb-3" aria-hidden="true" />

      <Header />
      <StepsBar />

      <main className="app-main" role="main">
        {currentStep === 1 && <Step1Configure />}
        {currentStep === 2 && <Step2Submit    />}
        {currentStep === 3 && <Step3Analyze   />}
        {currentStep === 4 && <Step4Results   />}
      </main>

      <Toast />
      <Modal />
    </>
  );
}
