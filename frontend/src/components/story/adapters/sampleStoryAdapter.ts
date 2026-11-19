/**
 * sampleStoryAdapter.ts — Deterministic Sample Data Adapter for DataFix Walkthrough.
 *
 * Implements `StoryDataAdapter` by deriving pure, deterministic state from `demoData.ts`
 * and `demoState.ts`.
 */

import type { StoryDataAdapter, StorySnapshot } from './types';
import { DEMO_DATASET_META, SAMPLE_ROWS, SIMULATION_DIFFS } from '../data/demoData';
import { deriveChecks, deriveProof, deriveWorkingCopy } from '../data/demoState';

export const sampleStoryAdapter: StoryDataAdapter = {
  getSnapshot(isDuplicateApproved: boolean): StorySnapshot {
    const workingCopy = deriveWorkingCopy(isDuplicateApproved);
    const checks = deriveChecks(isDuplicateApproved);
    const proof = deriveProof(isDuplicateApproved);

    return {
      meta: {
        fileName: DEMO_DATASET_META.fileName,
        sampleRowsCount: DEMO_DATASET_META.sampleRowsCount,
        sampleColumnsCount: DEMO_DATASET_META.sampleColumnsCount,
        totalSampleCells: DEMO_DATASET_META.totalSampleCells,
        totalDetectedIssues: DEMO_DATASET_META.totalDetectedIssues,
        sampleRowsLabel: DEMO_DATASET_META.sampleRowsLabel,
        sourceMode: DEMO_DATASET_META.sourceMode,
        provenanceLabel: DEMO_DATASET_META.provenanceLabel,
        provenanceSubtext: DEMO_DATASET_META.provenanceSubtext,
      },
      sampleRows: SAMPLE_ROWS,
      issueCoordinates: [
        {
          rowId: 'R-102',
          column: 'customer',
          value: '" Meridian Supply Co "',
          issueType: 'inconsistent',
          tag: 'PADDING SPACE',
          badgeClass: 'v3-badge-warn',
        },
        {
          rowId: 'R-102',
          column: 'order_date',
          value: '14/09/2026',
          issueType: 'invalid',
          tag: 'NON-ISO',
          badgeClass: 'v3-badge-err',
        },
        {
          rowId: 'R-104',
          column: 'order_id',
          value: 'ORD-8842',
          issueType: 'duplicate',
          tag: 'DUPLICATE KEY',
          badgeClass: 'v3-badge-info',
        },
        {
          rowId: 'R-103',
          column: 'customer_tax_id',
          value: 'NULL',
          issueType: 'missing',
          tag: 'MISSING VALUE',
          badgeClass: 'v3-badge-err',
        },
      ],
      diagnoses: [
        {
          id: 'diag-01',
          num: '01',
          column: 'order_date',
          issueSummary: 'order_date (2 issues)',
          description: 'R-102 ("14/09/2026") and R-105 ("09-16-2026") violate ISO-8601 (YYYY-MM-DD).',
        },
        {
          id: 'diag-02',
          num: '02',
          column: 'customer & amount',
          issueSummary: 'customer & amount (2 issues)',
          description: 'R-102 contains leading/trailing whitespace in customer and non-standard currency string "USD 890.5".',
        },
        {
          id: 'diag-03',
          num: '03',
          column: 'order_id',
          issueSummary: 'order_id (1 issue)',
          description: '"ORD-8842" repeats on R-104 with slightly different customer naming ("Meridian Supply" vs "Meridian Supply Co").',
        },
        {
          id: 'diag-04',
          num: '04',
          column: 'customer_tax_id',
          issueSummary: 'customer_tax_id (1 issue)',
          description: 'R-103 is NULL with no authoritative lookup key in the sample dataset.',
        },
      ],
      proposals: [
        {
          id: 'prop-01',
          column: 'customer, order_date, amount',
          operation: 'Trim customer whitespace & standardize ISO-8601 dates + USD currency',
          decision: 'auto_apply',
          decisionLabel: 'AUTO',
          badgeText: '✓ AUTO',
          badgeType: 'auto',
          title: 'Trim customer whitespace & standardize ISO-8601 dates + USD currency',
          scopeText: '2 sample rows (R-102, R-105) · 4 issues',
          reason: 'Deterministic transforms: strip outer whitespace, reformat date strings to YYYY-MM-DD, parse currency to standard $XX.XX. Zero structural ambiguity.',
        },
        {
          id: 'prop-02',
          column: 'order_id',
          operation: 'Consolidate duplicate order ORD-8842 (merge R-104 into R-102)',
          decision: 'needs_approval',
          decisionLabel: 'APPROVAL',
          badgeText: '▲ APPROVAL',
          badgeType: 'approval',
          title: 'Consolidate duplicate order ORD-8842 (merge R-104 into R-102)',
          scopeText: '2 sample rows (R-102, R-104) · 1 issue',
          reason: 'Duplicate primary key ORD-8842 detected across two rows with minor customer name variance. Automated deletion would be reckless; human confirmation required.',
        },
        {
          id: 'prop-03',
          column: 'customer_tax_id',
          operation: 'Impute missing tax identifier on R-103',
          decision: 'refused',
          decisionLabel: 'REFUSED',
          badgeText: '⊘ REFUSED',
          badgeType: 'refused',
          title: 'Impute missing tax identifier on R-103',
          scopeText: '1 sample row (R-103) · 1 issue preserved',
          reason: 'No external tax registry connected and customer name "Apex Freight Ltd" has no corroborating records. Fabricating a tax ID would create synthetic data debt.',
        },
      ],
      simulationDiffs: SIMULATION_DIFFS,
      workingCopy: {
        rows: workingCopy.rows,
        rowCount: workingCopy.rowCount,
        duplicateApproved: workingCopy.duplicateApproved,
        appliedSafeIssueIds: workingCopy.appliedSafeIssueIds,
        approvedIssueIds: workingCopy.approvedIssueIds,
        pendingIssueIds: workingCopy.pendingIssueIds,
        refusedIssueIds: workingCopy.refusedIssueIds,
      },
      checks: checks.map((c) => ({
        id: c.id,
        label: c.label,
        scope: c.scope,
        result: c.result,
        outcomeText: c.outcomeText,
      })),
      proof: {
        baselineCells: proof.baselineCells,
        baselineScore: proof.baselineScore,
        currentScore: proof.currentScore,
        cleanCells: proof.cleanCells,
        totalCells: proof.totalCells,
        baselineIssues: proof.baselineIssues,
        resolvedIssues: proof.resolvedIssues,
        remainingIssues: proof.remainingIssues,
        appliedProposalsCount: isDuplicateApproved ? 2 : 1,
        pendingProposalsCount: isDuplicateApproved ? 0 : 1,
        refusedIssuesCount: proof.refusedIssues,
        verifiedAtIso: '2026-11-19T14:30:00.000Z',
        inputHash: '7d4a9c8b...e01f',
        workingCopyHash: isDuplicateApproved ? '3f8e1a2c...b94d' : '9c2d4e6f...a108',
        ledgerRecordsCount: 6,
      },
    };
  },
};
