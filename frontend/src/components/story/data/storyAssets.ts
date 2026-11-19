/**
 * storyAssets.ts — Central Asset Manifest for DataFix V3 Cinematic Scroll Experience.
 *
 * HOW TO REPLACE ASSETS:
 * When your teammate delivers final 3D / illustrated artwork:
 * 1. Drop the new images into `public/assets/story/` using the same filenames:
 *    - 01_ingest.png
 *    - 02_detect.png
 *    - 03_diagnose.png
 *    - 04_propose.png
 *    - 05_simulate.png
 *    - 06_gate_apply.png
 *    - 07_verify.png
 *    - 08_proof.png
 * 2. OR update the `image` paths in the `STORY_ASSETS` manifest below.
 * 3. The React components (`VisualStoryExperience.tsx`) read strictly from this manifest.
 *    No image paths are hardcoded in UI components.
 */

export type StoryTransitionType =
  | 'expand-reveal'
  | 'horizontal-clip'
  | 'exploded-depth'
  | 'trifurcation-branch'
  | 'bilateral-atrium'
  | 'three-portal-gate'
  | 'cardinal-caliper'
  | 'radial-audit-orbit';

export interface StoryStageMeta {
  id: number;
  stageNum: string;
  phase: string;
  title: string;
  subtitle: string;
  summary: string;
  image: string;
  alt: string;
  transitionType: StoryTransitionType;
  accent: 'emerald' | 'amber' | 'violet' | 'cyan' | 'blue';
  accentHex: string;
}

export const STORY_ASSETS: StoryStageMeta[] = [
  {
    id: 1,
    stageNum: '01',
    phase: '01 · DETECT — INGEST',
    title: 'Raw documents enter a protected workspace',
    subtitle: 'Immutable intake sandbox preserving source truth',
    summary:
      'orders_demo_sample.csv is captured into a secure, read-only intake repository. Zero source bytes are altered while DataFix profiles schemas, field boundaries, and record formats.',
    image: '/assets/story/01_ingest.png',
    alt: 'Editorial architectural intake vault organizing raw tabular data sheets into modular archival trays in forest green and warm ivory.',
    transitionType: 'expand-reveal',
    accent: 'emerald',
    accentHex: '#10b981',
  },
  {
    id: 2,
    stageNum: '02',
    phase: '02 · DETECT — PROFILE',
    title: 'Anomalies surface across structured coordinates',
    subtitle: 'Diagnostic scanner isolates exact cell-level deviations',
    summary:
      'A precision profiler traverses the structured field, pinpointing exactly six discrete issues across all five data columns: missing values, key duplicates, non-ISO dates, and irregular string formats.',
    image: '/assets/story/02_detect.png',
    alt: 'Top-down architectural data grid showing precision diagnostic scanning aperture highlighting six cell anomalies in subtle terracotta and amber.',
    transitionType: 'horizontal-clip',
    accent: 'blue',
    accentHex: '#3b82f6',
  },
  {
    id: 3,
    stageNum: '03',
    phase: '03 · DIAGNOSE',
    title: 'Forensic cross-section isolates the root cause',
    subtitle: 'Multi-tiered evidence dossier explains anomaly origin',
    summary:
      'Rather than presenting an uninterpretable score, DataFix separates the record into vertical structural layers, exposing un-trimmed whitespace, mixed date conventions, and orphan records.',
    image: '/assets/story/03_diagnose.png',
    alt: 'Forensic exploded-view technical diagram of a data record separated into four vertical architectural inspection tiers with alignment calipers.',
    transitionType: 'exploded-depth',
    accent: 'cyan',
    accentHex: '#00e5ff',
  },
  {
    id: 4,
    stageNum: '04',
    phase: '04 · PROPOSE',
    title: 'Structured repair proposals branch into safety lanes',
    subtitle: 'Categorized interventions with explicit boundary rules',
    summary:
      'Three deterministic repair proposals account for all detected issues: automated normalization for lossless cleanup, guarded human review for record deduplication, and policy refusal for missing identifiers.',
    image: '/assets/story/04_propose.png',
    alt: 'Central architectural decision junction sorting data streams into an open emerald highway, an amber gate checkpoint, and a secure violet locked vault.',
    transitionType: 'trifurcation-branch',
    accent: 'amber',
    accentHex: '#f59e0b',
  },
  {
    id: 5,
    stageNum: '05',
    phase: '05 · SIMULATE',
    title: 'Before-and-after diff simulation preview',
    subtitle: 'Zero mutations committed — safe side-by-side inspection',
    summary:
      'Inspect every cell delta in an opposing-facade simulation. Deterministic transforms preview in real-time, the duplicate row pauses in amber staging, and the missing tax ID remains unmutated.',
    image: '/assets/story/05_simulate.png',
    alt: 'Bilateral architectural atrium showing original read-only dataset facade on the left and simulated preview on the right with values morphing across bridge conduits.',
    transitionType: 'bilateral-atrium',
    accent: 'emerald',
    accentHex: '#10b981',
  },
  {
    id: 6,
    stageNum: '06',
    phase: '06 · GATE & APPLY',
    title: 'Three-way architectural safety gate',
    subtitle: 'Human approval interruption with deterministic working copy',
    summary:
      'The emerald lane glides through to the working copy. The amber lane stops before a physical barrier awaiting human approval. The violet lane stays permanently locked to prevent synthetic fabrication.',
    image: '/assets/story/06_gate_apply.png',
    alt: 'Three monumental physical architectural portals: an open emerald gate, an amber checkpoint with lowered barrier boom, and a sealed violet monolithic door.',
    transitionType: 'three-portal-gate',
    accent: 'amber',
    accentHex: '#f59e0b',
  },
  {
    id: 7,
    stageNum: '07',
    phase: '07 · VERIFY — INVARIANTS',
    title: 'Four dynamic invariant verification calipers',
    subtitle: 'Post-repair structural checks confirm relational health',
    summary:
      'Before releasing the output dataset, DataFix tests schema conformance, row-count conservation, primary-key uniqueness, and anti-fabrication integrity. Pending approval is never treated as a pass.',
    image: '/assets/story/07_verify.png',
    alt: 'Central verified data monolith on a stepped plinth surrounded by four symmetrical cardinal inspection calipers verifying schema, row count, uniqueness, and integrity.',
    transitionType: 'cardinal-caliper',
    accent: 'emerald',
    accentHex: '#10b981',
  },
  {
    id: 8,
    stageNum: '08',
    phase: '08 · VERIFY — PROOF',
    title: 'Cryptographic proof & audit-trail completion',
    subtitle: 'Verifiable cleanliness score derived from fixed source cells',
    summary:
      'Review deterministic quality improvement from 80% to 93% (or 97% on approved deduplication). Complete with immutable before-and-after metrics, applied counts, and zero synthetic fabrications.',
    image: '/assets/story/08_proof.png',
    alt: 'Monumental circular proof amphitheater and calibrated radial sundial integrated into a continuous winding audit-trail ribbon flowing out into the horizon.',
    transitionType: 'radial-audit-orbit',
    accent: 'emerald',
    accentHex: '#12e29d',
  },
];
