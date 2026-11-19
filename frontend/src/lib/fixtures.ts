import type { RunState } from './contract-types';

/**
 * Demo Fixtures for Development and Offline Component Walkthrough.
 * In accordance with Section 8 of the Engineering Rules:
 * - Isolated from the production API adapter.
 * - Explicitly labelled as DEVELOPMENT / DEMO DATA in UI.
 * - Never secretly substituted for failed API calls.
 */

export const DEMO_RUN_FIXTURE: RunState = {
  run_id: 'run_demo_01',
  filename: 'customers_demo.csv',
  input_hash: '3f9ac21e7d8902',
  created_at: new Date().toISOString(),
  profile: {
    filename: 'customers_demo.csv',
    row_count: 5,
    column_count: 6,
    total_cells: 30,
    missing_cells: 3,
    duplicate_rows: 1,
    columns: [
      { name: 'customer_id', data_type: 'str', missing_count: 0, missing_percent: 0, distinct_count: 4, is_key_candidate: true },
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
  issues: [
    { id: 'iss_1', category: 'duplicate', column: 'customer_id', likely_cause: 'Repeated row transmission', affected_cells: 6, linked_proposal_id: 'prop_auto_1' },
    { id: 'iss_2', category: 'format', column: 'joined_on', likely_cause: 'Unparseable date token', affected_cells: 1, linked_proposal_id: 'prop_appr_1' },
    { id: 'iss_3', category: 'missing', column: 'city', likely_cause: 'Omitted form input', affected_cells: 1, linked_proposal_id: 'prop_ref_1' },
  ],
  proposals: [
    {
      id: 'prop_auto_1',
      op: 'drop_exact_dupes',
      column: 'row-level',
      risk_class: 'format_only',
      source: 'rule',
      issue_ids: ['iss_1'],
      title: 'Remove duplicate record (Row 4 & 5 identical)',
      explanation: 'Identical key, timestamp, and field values across all columns.',
      decision: 'auto_apply',
      reasons: ['Exact duplicate across all columns; lossless row deduplication.'],
      confidence: {
        value: 1.0,
        method: 'losslessness',
        components: [{ label: 'Exact match', value: 1.0, note: 'All 6 fields identical' }],
        n_support: 2,
        lower_bound: 1.0,
        caveat: 'Lossless removal of redundant row identity.',
      },
      evidence: [
        { kind: 'rule', label: 'Exact row equality', detail: 'Row 4 and Row 5 share identical customer_id C003 and values.' },
      ],
      simulation: {
        cells_changed: 6,
        rows_affected: 1,
        rows_removed: 1,
        previously_valid_cells_changed: 0,
        aggregate_drift: {},
        new_issues_introduced: 0,
        invariants: [
          { name: 'columns_unchanged', label: 'Columns and types unchanged', status: 'pass', detail: 'Schema preserved' },
          { name: 'row_count', label: 'Row count as expected', status: 'pass', detail: 'Reduced by 1 redundant row' },
          { name: 'valid_cells', label: 'Valid cells left alone', status: 'pass', detail: '0 valid cells touched' },
        ],
        sample_diff: [
          { row_id: 5, column: 'customer_id', before: 'C003', after: '∅ removed', was_valid: true },
        ],
      },
    },
    {
      id: 'prop_appr_1',
      op: 'normalise_date',
      column: 'joined_on',
      risk_class: 'value_substitution',
      source: 'llm_assisted',
      issue_ids: ['iss_2'],
      title: 'Parse non-standard date format',
      explanation: 'Value "not-a-date" detected. Suggested substitution requires human inspection.',
      decision: 'needs_approval',
      reasons: ['Non-standard string in date column; cannot be parsed unambiguously without verification.'],
      confidence: {
        value: 0.62,
        method: 'similarity',
        components: [
          { label: 'Token parser support', value: 0.45 },
          { label: 'Column pattern distribution', value: 0.8 },
        ],
        n_support: 4,
        lower_bound: 0.5,
        caveat: 'Low confidence substitution. Manual review required.',
      },
      evidence: [
        { kind: 'pattern_match', label: 'Date syntax anomaly', detail: 'Field contains non-numeric alphabetic token "not-a-date".' },
      ],
      simulation: {
        cells_changed: 1,
        rows_affected: 1,
        rows_removed: 0,
        previously_valid_cells_changed: 0,
        aggregate_drift: {},
        new_issues_introduced: 0,
        invariants: [
          { name: 'columns_unchanged', label: 'Columns and types unchanged', status: 'pass', detail: 'Date column format' },
          { name: 'valid_cells', label: 'Valid cells left alone', status: 'pass', detail: 'Touched 1 flagged cell' },
        ],
        sample_diff: [
          { row_id: 6, column: 'joined_on', before: 'not-a-date', after: '∅ null (review)', was_valid: false },
        ],
      },
      user_action: 'pending',
    },
    {
      id: 'prop_ref_1',
      op: 'map_values',
      column: 'city',
      risk_class: 'value_substitution',
      source: 'stat',
      issue_ids: ['iss_3'],
      title: 'Impute missing city from domain context',
      explanation: 'DataFix refused to fabricate a city name without supporting foreign keys or postal codes.',
      decision: 'refused',
      refusal_kind: 'insufficient_evidence',
      reasons: ['Insufficient statistical evidence; guessing a city name violates zero-fabrication guarantee.'],
      evidence_gap: {
        summary: 'No postal code or IP geolocation present in dataset to derive city identity.',
        observed: 0,
        required: 1,
        competing: [
          { label: 'Bengaluru', count: 2 },
          { label: 'Mysuru', count: 1 },
        ],
      },
      confidence: {
        value: null,
        method: 'similarity',
        components: [],
        n_support: 0,
        lower_bound: null,
        caveat: 'Refused: Evidence insufficient to infer value without fabrication.',
      },
      evidence: [
        { kind: 'frequency', label: 'Frequency ambiguity', detail: 'Multiple cities observed without correlating primary keys.' },
      ],
      simulation: {
        cells_changed: 1,
        rows_affected: 1,
        rows_removed: 0,
        previously_valid_cells_changed: 0,
        aggregate_drift: {},
        new_issues_introduced: 0,
        invariants: [
          { name: 'zero_fabrication', label: 'Valid cells left alone', status: 'fail', detail: 'Violates integrity invariant: fabricated value' },
        ],
        sample_diff: [
          { row_id: 3, column: 'city', before: '∅ null', after: 'Bengaluru (prevented)', was_valid: false },
        ],
      },
    },
  ],
  is_applied: false,
  is_verified: false,
};
