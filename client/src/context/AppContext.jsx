import React, { createContext, useContext, useReducer, useCallback } from 'react';

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  currentStep: 1,
  checklist: [],
  submissionText: '',
  analysisResult: null,
  followup: { subject: '', body: '' },
  isAnalyzing: false,
  isGeneratingFollowup: false,
  toasts: [],
  modal: null,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, currentStep: action.payload };
    case 'SET_CHECKLIST':
      return { ...state, checklist: action.payload };
    case 'ADD_ITEM':
      return { ...state, checklist: [...state.checklist, action.payload] };
    case 'DELETE_ITEM':
      return { ...state, checklist: state.checklist.filter((i) => i.id !== action.payload) };
    case 'SET_SUBMISSION':
      return { ...state, submissionText: action.payload };
    case 'SET_ANALYSIS_RESULT':
      return { ...state, analysisResult: action.payload };
    case 'SET_FOLLOWUP':
      return { ...state, followup: action.payload };
    case 'SET_ANALYZING':
      return { ...state, isAnalyzing: action.payload };
    case 'SET_GENERATING_FOLLOWUP':
      return { ...state, isGeneratingFollowup: action.payload };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };
    case 'SET_MODAL':
      return { ...state, modal: action.payload };
    case 'RESET':
      return { ...initialState, toasts: state.toasts };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null);

let toastCounter = 0;
let itemCounter  = 0;

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Toast helper
  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = `toast-${++toastCounter}`;
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
    setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), duration);
  }, []);

  // Modal helper
  const showModal = useCallback((title, body, onConfirm) => {
    dispatch({ type: 'SET_MODAL', payload: { title, body, onConfirm } });
  }, []);

  const closeModal = useCallback(() => {
    dispatch({ type: 'SET_MODAL', payload: null });
  }, []);

  // Generate unique item ID
  const generateId = () => `item-${Date.now()}-${++itemCounter}`;

  const actions = {
    goToStep: (step) => dispatch({ type: 'SET_STEP', payload: step }),

    addItem: (item) => {
      const newItem = {
        id:       generateId(),
        name:     item.name.trim(),
        category: item.category || 'requirement',
        keywords: Array.isArray(item.keywords)
          ? item.keywords
          : (item.keywords || item.name).split(',').map((k) => k.trim()).filter(Boolean),
        required:  item.required !== false,
        sensitive: !!item.sensitive,
        followup:  item.followup || '',
      };
      dispatch({ type: 'ADD_ITEM', payload: newItem });
      return newItem;
    },

    deleteItem: (id) => dispatch({ type: 'DELETE_ITEM', payload: id }),

    setChecklist: (items) => {
      const mapped = items.map((item) => ({ ...item, id: generateId() }));
      dispatch({ type: 'SET_CHECKLIST', payload: mapped });
    },

    setSubmission: (text) => dispatch({ type: 'SET_SUBMISSION', payload: text }),

    setAnalysisResult: (result) => dispatch({ type: 'SET_ANALYSIS_RESULT', payload: result }),
    setFollowup:       (data)   => dispatch({ type: 'SET_FOLLOWUP', payload: data }),
    setAnalyzing:      (val)    => dispatch({ type: 'SET_ANALYZING', payload: val }),

    reset: () => {
      dispatch({ type: 'RESET' });
      showToast('Reset complete', 'info');
    },

    showToast,
    showModal,
    closeModal,
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
