/**
 * types.ts — Normalized StorySnapshot interface and Data Adapter boundary.
 *
 * This contract establishes an isolated boundary between the visual/motion stage components
 * and the underlying data layer. Stage components render strictly against a normalized
 * `StorySnapshot`.
 *
 * During initial integration, `SampleStoryAdapter` supplies deterministic sample data.
 * Future integration can introduce a `RunContextStoryAdapter` implementing `StoryDataAdapter`
 * without modifying any visual stage component code.
 */

import type { SampleOrderRow, SafetyDecision } from '../data/demoData';

export interface StoryDatasetMeta {
  fileName: string;
  sampleRowsCount: number;
  sampleColumnsCount: number;
  totalSampleCells: number;
  totalDetectedIssues: number;
  sampleRowsLabel: string;
  sourceMode: string;
  provenanceLabel: string;
  provenanceSubtext: string;
}

export interface StoryIssueCoordinate {
  rowId: string;
  column: string;
  value: string;
  issueType: string;
  tag: string;
  badgeClass: string;
}

export interface StoryDiagnosisItem {
  id: string;
  num: string;
  column: string;
  issueSummary: string;
  description: string;
}

export interface StoryProposalItem {
  id: string;
  column: string;
  operation: string;
  decision: SafetyDecision;
  decisionLabel: string;
  badgeText: string;
  badgeType: 'auto' | 'approval' | 'refused';
  title: string;
  scopeText: string;
  reason: string;
}

export interface StorySimulationDiffItem {
  rowId: string;
  column: string;
  original: string;
  proposed: string;
  decision: SafetyDecision;
  note: string;
}

export interface StoryWorkingCopyState {
  rows: SampleOrderRow[];
  rowCount: number;
  duplicateApproved: boolean;
  appliedSafeIssueIds: string[];
  approvedIssueIds: string[];
  pendingIssueIds: string[];
  refusedIssueIds: string[];
}

export interface StoryCheckItem {
  id: string;
  label: string;
  scope: string;
  result: 'passed' | 'pending' | 'guarded';
  outcomeText: string;
}

export interface StoryProofState {
  baselineCells: number;
  baselineScore: number;
  currentScore: number;
  cleanCells: number;
  totalCells: number;
  baselineIssues: number;
  resolvedIssues: number;
  remainingIssues: number;
  appliedProposalsCount: number;
  pendingProposalsCount: number;
  refusedIssuesCount: number;
  verifiedAtIso: string;
  inputHash: string;
  workingCopyHash: string;
  ledgerRecordsCount: number;
}

export interface StorySnapshot {
  meta: StoryDatasetMeta;
  sampleRows: SampleOrderRow[];
  issueCoordinates: StoryIssueCoordinate[];
  diagnoses: StoryDiagnosisItem[];
  proposals: StoryProposalItem[];
  simulationDiffs: StorySimulationDiffItem[];
  workingCopy: StoryWorkingCopyState;
  checks: StoryCheckItem[];
  proof: StoryProofState;
}

export interface StoryDataAdapter {
  getSnapshot(isDuplicateApproved: boolean): StorySnapshot;
}
