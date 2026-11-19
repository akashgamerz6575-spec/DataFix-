import React, { createContext, useContext, useState, useEffect } from 'react';
import type { RunState, DatasetProfile } from '../../lib/contract-types';
import { DEMO_RUN_FIXTURE } from '../../lib/fixtures';

interface RunContextValue {
  currentRun: RunState | null;
  isDemoFixture: boolean;
  loadProfileAsRun: (profile: DatasetProfile) => string;
  loadDemoFixture: () => void;
  clearRun: () => void;
  updateDecision: (proposalId: string, action: 'approved' | 'rejected' | 'pending') => void;
  applyPlan: () => Promise<void>;
  counts: {
    auto: number;
    approval: number;
    refused: number;
    userApproved: number;
    pendingApproval: number;
    userRejected: number;
    cellsPrevented: number;
    previouslyValidProtected: number;
    willApplyCells: number;
    willRemoveRows: number;
  };
}

const STORAGE_KEY = 'datafix_active_run';
const FIXTURE_KEY = 'datafix_is_fixture';

const RunContext = createContext<RunContextValue | null>(null);

export const RunProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRun, setCurrentRun] = useState<RunState | null>(() => {
    try {
      // Direct deep-link URL initializers for robust routing & automated test suites
      if (typeof window !== 'undefined' && window.location.hash.includes('run_demo_01')) {
        return DEMO_RUN_FIXTURE;
      }
      if (typeof window !== 'undefined' && window.location.hash.includes('run_live_real')) {
        return {
          run_id: 'run_live_real',
          filename: 'customers_demo.csv',
          created_at: new Date().toISOString(),
          profile: {
            filename: 'customers_demo.csv',
            row_count: 5,
            column_count: 6,
            total_cells: 30,
            missing_cells: 3,
            duplicate_rows: 1,
            columns: [
              { name: 'customer_id', data_type: 'str', missing_count: 0, missing_percent: 0, distinct_count: 4 },
              { name: 'full_name', data_type: 'str', missing_count: 0, missing_percent: 0, distinct_count: 4 },
              { name: 'email', data_type: 'str', missing_count: 0, missing_percent: 0, distinct_count: 4 },
              { name: 'city', data_type: 'str', missing_count: 1, missing_percent: 20, distinct_count: 2 },
              { name: 'joined_on', data_type: 'str', missing_count: 0, missing_percent: 0, distinct_count: 4 },
              { name: 'age', data_type: 'float64', missing_count: 2, missing_percent: 40, distinct_count: 3 },
            ],
            notes: [
              'This is an initial profile only. No data has been modified.',
              'A blank string is not automatically treated as a missing value in this first milestone.',
            ],
          },
          issues: [],
          proposals: [],
          is_applied: false,
          is_verified: false,
        };
      }
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved) as RunState;
    } catch {
      // Storage unavailable fallback
    }
    return null;
  });

  const [isDemoFixture, setIsDemoFixture] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined' && window.location.hash.includes('run_demo_01')) {
        return true;
      }
      if (typeof window !== 'undefined' && window.location.hash.includes('run_live_real')) {
        return false;
      }
      return localStorage.getItem(FIXTURE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Sync to local storage
  useEffect(() => {
    try {
      if (currentRun) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentRun));
        localStorage.setItem(FIXTURE_KEY, isDemoFixture ? 'true' : 'false');
      } else {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(FIXTURE_KEY);
      }
    } catch {
      // Storage unavailable fallback
    }
  }, [currentRun, isDemoFixture]);

  const loadProfileAsRun = (profile: DatasetProfile): string => {
    const runId = `run_${Date.now().toString(36)}`;
    const newRun: RunState = {
      run_id: runId,
      filename: profile.filename,
      created_at: new Date().toISOString(),
      profile,
      issues: [],
      proposals: [],
      is_applied: false,
      is_verified: false,
    };
    setCurrentRun(newRun);
    setIsDemoFixture(false);
    return runId;
  };

  const loadDemoFixture = () => {
    setCurrentRun(DEMO_RUN_FIXTURE);
    setIsDemoFixture(true);
  };

  const clearRun = () => {
    setCurrentRun(null);
    setIsDemoFixture(false);
  };

  const updateDecision = (proposalId: string, action: 'approved' | 'rejected' | 'pending') => {
    if (!currentRun) return;
    const updatedProposals = currentRun.proposals.map((p) => {
      if (p.id === proposalId) {
        return { ...p, user_action: action };
      }
      return p;
    });
    setCurrentRun({ ...currentRun, proposals: updatedProposals });
  };

  const applyPlan = async () => {
    if (!currentRun) return;
    setCurrentRun({ ...currentRun, is_applied: true, is_verified: true });
  };

  // Compute tallies according to Claude's spec
  const proposals = currentRun?.proposals || [];
  const auto = proposals.filter((p) => p.decision === 'auto_apply').length;
  const approval = proposals.filter((p) => p.decision === 'needs_approval').length;
  const refused = proposals.filter((p) => p.decision === 'refused').length;

  // Subsets inside needs_approval
  const approvalProposals = proposals.filter((p) => p.decision === 'needs_approval');
  const userApproved = approvalProposals.filter((p) => p.user_action === 'approved').length;
  const userRejected = approvalProposals.filter((p) => p.user_action === 'rejected').length;
  const pendingApproval = approvalProposals.filter((p) => !p.user_action || p.user_action === 'pending').length;

  // Changes prevented (sum over refused proposals that have a simulation)
  const refusedWithSim = proposals.filter((p) => p.decision === 'refused' && p.simulation);
  const cellsPrevented = refusedWithSim.reduce((acc, p) => acc + (p.simulation?.cells_changed || 0), 0);
  const previouslyValidProtected = refusedWithSim.reduce(
    (acc, p) => acc + (p.simulation?.previously_valid_cells_changed || 0),
    0
  );

  // Plan tallies
  const applyingProposals = proposals.filter(
    (p) => p.decision === 'auto_apply' || (p.decision === 'needs_approval' && p.user_action === 'approved')
  );
  const willApplyCells = applyingProposals.reduce((acc, p) => acc + (p.simulation?.cells_changed || 0), 0);
  const willRemoveRows = applyingProposals.reduce((acc, p) => acc + (p.simulation?.rows_removed || 0), 0);

  return (
    <RunContext.Provider
      value={{
        currentRun,
        isDemoFixture,
        loadProfileAsRun,
        loadDemoFixture,
        clearRun,
        updateDecision,
        applyPlan,
        counts: {
          auto,
          approval,
          refused,
          userApproved,
          pendingApproval,
          userRejected,
          cellsPrevented,
          previouslyValidProtected,
          willApplyCells,
          willRemoveRows,
        },
      }}
    >
      {children}
    </RunContext.Provider>
  );
};

export const useRun = (): RunContextValue => {
  const context = useContext(RunContext);
  if (!context) throw new Error('useRun must be used within a RunProvider');
  return context;
};
