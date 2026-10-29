import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useApp } from '../../context/AppContext';

const LOG_STEPS = [
  { msg: '▶ Loading analysis engine…',           delay: 200,  pct: 10 },
  { msg: '▶ Checking required items against submission…', delay: 700, pct: 30 },
  { msg: '▶ Scanning for insecure credential patterns…',  delay: 1200, pct: 55 },
  { msg: '▶ Detecting unclear or vague requirements…',    delay: 1700, pct: 80 },
  { msg: '▶ Finalising report…',                 delay: 2200, pct: 95 },
];

export default function Step3Analyze() {
  const { state, actions } = useApp();
  const [progress, setProgress] = useState(0);
  const [status,   setStatus]   = useState('Click "Start Scan" to begin.');
  const [logs,     setLogs]     = useState([]);
  const [running,  setRunning]  = useState(false);
  const resultRef = useRef(null);

  // Reset when step becomes active
  useEffect(() => {
    setProgress(0);
    setStatus('Click "Start Scan" to begin.');
    setLogs([]);
    setRunning(false);
    resultRef.current = null;
  }, []);

  async function runAnalysis() {
    if (running) return;
    setRunning(true);
    setProgress(0);
    setLogs([{ msg: '▶ Initializing engine…', cls: '' }]);
    setStatus('Preparing…');

    // Animate logs in sequence
    const timers = LOG_STEPS.map(step =>
      setTimeout(() => {
        setProgress(step.pct);
        setStatus(step.msg.replace('▶ ', '').replace('…', '').trim());
        setLogs(prev => [...prev, { msg: step.msg, cls: '' }]);
      }, step.delay)
    );

    try {
      const res = await axios.post('/api/analyze', {
        text:      state.submissionText,
        checklist: state.checklist,
      });
      const result = res.data.data;
      resultRef.current = result;

      // Flush all pending logs after API returns
      timers.forEach(t => clearTimeout(t));
      setProgress(100);
      setStatus('Analysis complete ✔');
      setLogs([
        { msg: `✔ Engine loaded — ${state.checklist.length} checklist items`, cls: 'log-ok' },
        { msg: `✔ Found ${result.confirmedItems.length} confirmed, ${result.missingItems.length} missing`, cls: result.missingItems.length > 0 ? 'log-warn' : 'log-ok' },
        { msg: result.securityWarnings.length > 0 ? `⚠ ${result.securityWarnings.length} security risk(s) detected` : '✔ No credential risks detected', cls: result.securityWarnings.length > 0 ? 'log-warn' : 'log-ok' },
        { msg: result.unclearItems.length > 0 ? `⚠ ${result.unclearItems.length} unclear requirement(s) found` : '✔ All requirements clearly stated', cls: result.unclearItems.length > 0 ? 'log-warn' : 'log-ok' },
        { msg: `✔ Overall completion: ${result.summary.overallPct}%`, cls: 'log-ok' },
      ]);

      // Navigate after short delay to let user see results
      await new Promise(r => setTimeout(r, 700));

      // Fetch follow-up
      const fuRes = await axios.post('/api/followup', { analysisResult: result, tone: 'professional' });
      actions.setFollowup(fuRes.data.data);
      actions.setAnalysisResult(result);
      actions.goToStep(4);
    } catch (err) {
      timers.forEach(t => clearTimeout(t));
      setRunning(false);
      setProgress(0);
      setStatus('Analysis failed — please try again.');
      setLogs(prev => [...prev, { msg: `✖ Error: ${err.response?.data?.error || err.message}`, cls: 'log-error' }]);
      actions.showToast('Analysis failed. Is the server running?', 'error');
    }
  }

  return (
    <section className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="panel-header">
        <div>
          <h1 className="panel-title">Run Analysis</h1>
          <p className="panel-subtitle">
            Scanning submission for missing items, credential risks, and unclear requirements…
          </p>
        </div>
      </div>

      <div className="glass-card analysis-card">
        <div className="analysis-animation">
          {/* Scan rings */}
          <div className="scan-rings" aria-hidden="true">
            <div className="scan-ring ring-1" />
            <div className="scan-ring ring-2" />
            <div className="scan-ring ring-3" />
            <div className="scan-doc">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
              </svg>
            </div>
          </div>

          {/* Log lines */}
          <div className="analysis-log" role="log" aria-live="polite">
            {logs.map((l, i) => (
              <div key={i} className={`log-line${l.cls ? ' ' + l.cls : ''}`}>{l.msg}</div>
            ))}
            {logs.length === 0 && <div className="log-line">Waiting to start…</div>}
          </div>
        </div>

        {/* Progress bar */}
        <div className="analysis-progress-track" aria-hidden="true">
          <div className="analysis-progress-bar" style={{ width: `${progress}%` }} />
        </div>
        <p className="analysis-status-text">{status}</p>
      </div>

      <div className="step-footer">
        <button className="btn btn-ghost" onClick={() => actions.goToStep(2)} disabled={running}>
          <ArrowLeftIcon /> Back
        </button>
        <button className="btn btn-primary btn-lg" onClick={runAnalysis} disabled={running}>
          {running ? (
            <><div className="spinner" />Scanning…</>
          ) : (
            <><PlayIcon /> Start Scan</>
          )}
        </button>
      </div>
    </section>
  );
}

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5,3 19,12 5,21 5,3"/>
  </svg>
);
const ArrowLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12,19 5,12 12,5"/>
  </svg>
);
