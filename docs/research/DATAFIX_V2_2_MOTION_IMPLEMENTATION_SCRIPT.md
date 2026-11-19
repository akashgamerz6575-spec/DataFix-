# DataFix V2.2 — Motion Engineering Implementation Script

**Purpose:** Upgrade the existing `datafix-motion-poc-01-visual-v2` prototype from a mostly static, fade-and-stagger walkthrough into a polished, data-led, scroll-driven product story. This is an implementation script for Antigravity, not a general design brief.

**Target project:** `D:\datafix-motion-poc-01-visual-v2`  
**Target local URL:** `http://127.0.0.1:5176/`  
**Baseline:** Visual V2 archive supplied on 19 November 2026  
**Priority:** Desktop-first. Primary viewports are 1920×1080, 1440×900, 1366×768 and 1280×720. Mobile only needs a clean functional fallback; do not spend time polishing mobile motion.

---

## 0. Non-negotiable implementation contract

1. Work **only** inside `D:\datafix-motion-poc-01-visual-v2`. This is a standalone prototype. Do not edit `D:\DataFix`, the main DataFix application, any backend, database, deployment configuration, or repository outside this folder.
2. Before editing, create a dated backup of the current `src` directory and the current `package.json`. Do not overwrite the backup during this task.
3. Preserve the current visual direction: light, editorial, enterprise SaaS; warm off-white canvas; fresh mint hero; restrained emerald for safe actions; amber for human approval; violet for policy refusal. Do not return to a uniformly dark, cyberpunk, neon, terminal or glowing-grid style.
4. The purpose of the animation is to show **real sample records and repair decisions moving through a process**. Do not add random particles, floating dots, decorative data rain, generic shimmer, or motion that does not communicate a data operation.
5. Use the dependencies already installed: React 19, TypeScript, Vite, `gsap` 3.12.x, `@gsap/react` and `ScrollTrigger`. Do not add another animation library. Do not use GSAP MotionPathPlugin; it is not part of the current dependency setup. SVG path movement can be implemented with `getPointAtLength()`.
6. Keep all displayed information explicitly identified as an **illustrative client-side sample demonstration**. No backend calls, no API calls, no claims of live validation, and no implication that the sample approval button mutates a real dataset.
7. The original sample data must remain immutable. Every proposed/applied result is derived into a separate working-copy object. The Refused branch must leave the original `R-103.customer_tax_id` value `NULL`.
8. Do not invent metrics. Remove the hero preview values `169 failed`, `24 warned` and `87%`; they are unrelated to this 6-row sample. All figures must derive from `demoData.ts` and the deterministic functions described below.
9. Do not introduce a vertical scrollbar inside the pinned product window or any stage card. The browser page remains the only vertical scroll surface. Horizontal table overflow is acceptable only where genuinely needed; the four target desktop sizes should display the tables without clipping.
10. Do not create screenshots, GIFs, videos, contact sheets or other visual evidence deliverables. Run runtime checks and give a factual implementation report. Akash will inspect the running browser himself.
11. Preserve accessible controls, keyboard navigation, focus states and `prefers-reduced-motion`. When reduced motion is enabled, render the final visual state immediately and bypass pinning/scrubbing as the current code does.
12. Avoid broad refactors unrelated to the motion journey. Do not silently change the sample records, issue counts, policy decisions or formula.

---

## 1. Actual source baseline — inspected files and confirmed defects

The supplied V2 archive contains these relevant source files:

- `src/App.tsx` — hero, hero dashboard mockup, section label and outro.
- `src/components/GuidedDemoSection.tsx` — desktop two-column story, left narrative steps, pinned right product window, scroll triggers, stage state and approval state.
- `src/components/StageViewport.tsx` — product chrome and conditional content for all eight stages.
- `src/components/ScrollBeamSvg.tsx` — vertical SVG narrative rail and scroll-scrubbed progress beam.
- `src/data/demoData.ts` — sample records, proposals, diffs, checks, stage copy and proof calculation.
- `src/styles/demo.css` — layout and component styles.
- `src/styles/tokens.css` — design tokens plus global reset styles.

Existing dependencies already include `gsap`, `@gsap/react`, React and TypeScript. Keep the dependency list unchanged unless a genuine compile-time requirement is found. Do not install Framer Motion, Lottie or another animation library.

### 1.1 Existing functional behaviour to preserve

- `GuidedDemoSection` pins the right product stage on desktop at `min-width: 1024px` while narrative content scrolls on the left.
- `ScrollTrigger` changes the active stage on forward and reverse scrolling.
- Narrative buttons and keyboard navigation select stages.
- Reduced-motion preference disables desktop pinning/scrubbing.
- Stage 5 currently contains a local duplicate-approval toggle; the value propagates to the proof score.
- The stage window already has a persistent sample-data provenance ribbon.
- CSS is mostly component-prefixed with `df-` names.

Keep this interaction model; improve the stage order, state derivation, composition and motion.

### 1.2 Confirmed content and implementation defects

1. **Wrong hero data:** `App.tsx` currently renders `169`, `24` and `87%`. Replace these with values derived from the actual six-row sample.
2. **Wrong order:** current stage 5 is Gate and current stage 6 is Simulate. The required order is Simulate first, then Gate & Apply.
3. **Missing CSS selectors:** JSX uses these classes but the supplied stylesheets do not define them: `df-anim-item`, `df-anim-panel`, `df-block-icon`, `df-cell-subtag`, `df-col-indicator`, `df-diff-dot`, `df-diff-pane-label`, `df-diff-split-header`, `df-dossier-label-row`, `df-pill-icon`, `df-proposal-target`. Define all of them deliberately; do not leave them dependent on browser defaults.
4. **Insufficient motion:** the current stage hook mostly fades a panel, staggers generic children, highlights issue cells, slides a dossier and animates the proof ring. The data itself does not travel through the workflow. This is the primary problem to solve.
5. **Fixed 380px narrative spine and 1240px max-width leave too much desktop space unused.** Widen the composition while retaining clear hierarchy.
6. **Stage 6 is a plain diff table.** It needs a staged original-to-proposed comparison with meaningful, sequenced value changes.
7. **The decision is placed before simulation in the current experience.** Simulation must be a preview; the gate and apply action must follow it.
8. **Verification summaries are partly static.** Checks must be derived from the decision state. A pending primary-key check must not appear as a pass.
9. **Score semantics must be explicit.** The 30-cell denominator is the fixed *original sample-source baseline*. It is not the number of cells in the post-deduplication output working copy. Label it accordingly to avoid suggesting that a 5-row output contains 30 cells.
10. **Outro and journey labels still say Gate before Simulate.** Update them to match the new order.

---

## 2. The final eight-stage story — use this order exactly

The pinned product window changes its internal scene as the reader advances through the left narrative. The left rail and right-hand product must always agree on the active stage.

| Stage | Name | Narrative purpose | Product scene |
|---|---|---|---|
| 01 | Ingest | Bring the source file into a protected workspace | File arrival, immutable source table, six sample rows settling into place |
| 02 | Detect | Identify the six data-quality issues | A scan sweeps the table; six affected cells are highlighted and linked to category counts |
| 03 | Diagnose | Explain why each issue exists | Evidence connectors lead from affected cells into a root-cause dossier |
| 04 | Propose | Generate repair proposals with policy decisions | Three proposal cards branch from the evidence into Auto, Approval and Refused categories |
| 05 | Simulate | Preview the proposed changes without applying them | Side-by-side source/proposed diff, with pending and refused rows visibly unchanged in the source |
| 06 | Gate & Apply | Apply safe changes, stop for approval, refuse unsafe fabrication | Three-way decision gate; auto lane advances, approval lane pauses until clicked, refusal lane remains locked |
| 07 | Verify | Run integrity and safety checks against the derived working copy | Four checks resolve sequentially to Passed, Pending or Guarded based on state |
| 08 | Proof | Show a transparent, reproducible result | Animated score ring, issue-resolution figures, working-copy row count and audit ledger |

Use these exact labels in `DEMO_STAGES`, stage pill, mobile fallback, hero preview, outro journey strip, and all explanatory copy. For stage 6 use the short label `Gate & Apply` (allow sufficient width in the stage pill). Stage 7 can be labelled `Verify`; Stage 8 `Proof`.

### Scroll choreography

- Keep the existing desktop pinned split-screen model; the left narrative advances while the right product stage stays pinned.
- Keep bidirectional scrolling. Scrolling upward must restore the correct previous stage and its correct state.
- Use the existing `ScrollTrigger` stage anchors to update `activeStage`; do not call React state setters on every scroll frame.
- Keep the emerald SVG progress beam tied to scroll progress. Update the stage count/labels so its eight milestones correspond to the new order.
- Keep the natural release into the outro after Stage 8. The Stage 8 narrative card must not remain active or visually overlap the outro after the pin has released.
- Clicking a left narrative step must smoothly scroll to that step on desktop. Keyboard controls must continue to work.

---

## 3. Sample data truth — lock this before changing any UI

Use the sample that already exists in `src/data/demoData.ts`. Do not replace its values.

### 3.1 Source rows and issue map

There are **6 sample rows × 5 data columns = 30 original source cells**. The row identifier (`rowId`) is an index and is excluded from the 30-cell denominator.

| Issue | Source row / column | Original value | Safe/proposed value | Decision |
|---|---|---|---|---|
| I-01 | R-102 / customer | `  Meridian Supply Co ` | `Meridian Supply Co` | Auto-apply |
| I-02 | R-102 / order_date | `14/09/2026` | `2026-09-14` | Auto-apply |
| I-03 | R-102 / amount | `USD 890.5` | `$890.50` | Auto-apply |
| I-04 | R-105 / order_date | `09-16-2026` | `2026-09-16` | Auto-apply |
| I-05 | R-104 / order_id | `ORD-8842` (duplicate of R-102) | Consolidate R-104 into canonical R-102 | Needs human approval |
| I-06 | R-103 / customer_tax_id | `NULL` | No generated value; preserve `NULL` | Refused by policy |

Category counts: 1 missing value, 1 duplicate key, 2 invalid dates, 2 inconsistent formats. Total = 6 issues. Four issues are deterministic formatting repairs, one requires human approval, one is explicitly refused.

### 3.2 Correct sample calculation

- Baseline: `(30 - 6) / 30 = 24 / 30 = 80%`.
- After the four deterministic formatting repairs, while duplicate approval is pending: `(30 - 2) / 30 = 28 / 30 = 93%`.
- After duplicate approval: `(30 - 1) / 30 = 29 / 30 = 97%`.
- At 93%, the remaining 2 issues are 1 pending duplicate + 1 refused missing tax ID.
- At 97%, the remaining 1 issue is the refused missing tax ID.

In the UI, call this metric **“Source-cell quality score”** or **“Sample source-cell resolution”**, and visibly state **“Fixed baseline: 30 original source cells (6 rows × 5 columns)”**. Do not label 29/30 as the count of cells in the output working copy.

### 3.3 Required immutable working-copy rules

Create pure deterministic derivation functions in a new `src/data/demoState.ts` (or similarly named single-purpose module):

- `deriveOperations(isDuplicateApproved)` — returns the safe, approval, and refused operation states with counts and explanations.
- `deriveWorkingCopy(isDuplicateApproved)` — starts from a fresh clone of `SAMPLE_ROWS`; applies only the four safe formatting changes; removes R-104 only when duplicate approval is true; never changes R-103 tax ID from `null`.
- `deriveChecks(isDuplicateApproved)` — returns exactly four dynamic check records.
- `deriveProof(isDuplicateApproved)` — reuses the baseline 30-cell formula and returns all figures used in the UI.

Do not mutate `SAMPLE_ROWS`, `SIMULATION_DIFFS`, `REPAIR_PROPOSALS` or any imported constant. Each call to `deriveWorkingCopy` must produce a new array and new row objects. The original source remains available unchanged even after multiple approve/reset cycles.

Expected working-copy state:

| Decision | Working-copy rows | R-104 | R-103 tax ID | Primary-key check |
|---|---:|---|---|---|
| Not approved | 6 | Retained; duplicate visible | `NULL` | Pending |
| Approved | 5 | Removed after consolidation into R-102 | `NULL` | Passed |

The auto-normalized fields in the working copy must be:

- R-102 customer: `Meridian Supply Co`
- R-102 order date: `2026-09-14`
- R-102 amount: `$890.50`
- R-105 order date: `2026-09-16`

The duplicate removal is a simulated local approval, not a real backend write. The refusal is permanent for this demonstration state and must never fabricate a tax ID.

### 3.4 Dynamic verification states

Use exactly four checks, derived from current state:

1. Schema and format conformance — `Passed` after the safe deterministic normalizations.
2. Row-count invariant — `Passed` when the current row count matches the expected plan (6 before duplicate approval, 5 after approval). State the actual row count and expected delta.
3. Primary-key uniqueness — `Pending approval` before duplicate approval; `Passed` after approval.
4. No fabricated identifiers — `Guarded / Refused` because R-103 remains `NULL`. This is not a system failure.

A pending check is not a pass. A guarded refusal is not a failure. Use Red only for an actual failed invariant/system failure, which this normal sample must not invent.

---

## 4. Visual composition changes — make desktop space work harder

Keep the V2 palette and visual tone. The goal is not to make everything busier; it is to give the product scene more scale and make the movement easier to see.

### 4.1 Desktop grid

Replace the current `max-width: 1240px` / fixed `380px 1fr` feeling with a fluid desktop layout. Target approximately:

- Main demo max width: `1680px` (or close; keep consistent outer margins).
- Container side padding: about `40px` at desktop, reducing only when needed.
- Narrative column: `clamp(310px, 25vw, 420px)`.
- Column gap: `clamp(32px, 3vw, 56px)`.
- Product window: `minmax(0, 1fr)` and use all remaining width.

At 1280×720 the product window should still be wide enough for the table and controls. At 1920×1080 do not leave a narrow product window floating in an oversized blank canvas. Do not make the narrative column wider than the product scene.

### 4.2 Stage window height and clipping

- Preserve one page-level vertical scroll surface.
- The pinned product stage should fit comfortably inside the available desktop viewport below the site/header area.
- Remove any stage-specific `max-height` + `overflow-y:auto` combination that creates a nested scrollbar.
- Do not set `overflow-y:auto` on `.df-product-window`, `.df-stage-body`, proposal stacks, diff panels or gate lanes.
- `.df-table-wrap` may keep `overflow-x:auto`; it must not become a vertical scrolling region.
- Use compact spacing at `max-height: 800px` so Stage 4, 6 and 7 fit at 1366×768 and 1280×720. Reduce padding/gaps/line heights before shrinking text to illegible sizes.
- Do not hide rows to force a fit. All six sample rows and all six issue records must remain visible in the appropriate stages.

### 4.3 Layout per scene

- Stage 1–2: use a wide, clear data table. Stage 2 includes a compact legend/count strip, not a second oversized card.
- Stage 3: use a two-column diagnostic dossier with evidence items that can expand/reveal in sequence. Keep all four evidence points readable.
- Stage 4: retain three proposal cards, but use the available horizontal space intelligently. On wide desktop, a three-column card layout is acceptable; on 1280px, use a compact vertical/stacked layout if necessary. Do not create a nested scroll area.
- Stage 5: use an obvious original-versus-proposed comparison. Keep all six diff entries readable. A side-by-side two-pane layout is preferred, with issue status on every row.
- Stage 6: use a clear three-lane decision gate, not three plain stacked cards. The working-copy result should be visible as the destination of the lanes.
- Stage 7: show four sequential checks, with strong state labels and a small progress/status header.
- Stage 8: the proof ring, four headline measures and audit explanation should form a confident final report. Use more horizontal width than the current narrow ring-plus-grid arrangement.

---

## 5. Motion design system — build one coherent “living data pipeline”

All motion must explain an operation. Use restrained spring/ease curves and short pauses; avoid constant ambient motion. The user should be able to understand what is happening even without reading every paragraph.

### 5.1 Shared visual grammar

Use one consistent language throughout the eight scenes:

- **Rows / records:** data travels as a row or row fragment; do not turn records into abstract particles.
- **Cells:** the exact affected cell is highlighted, then connected to the relevant issue, proposal or output.
- **Connectors:** thin SVG paths with rounded corners, subtle color and clear start/end points. Draw paths with `strokeDasharray` / `strokeDashoffset`.
- **Moving token:** a small rounded rectangle or compact token containing a row ID / field name / short value travels along a path. Use actual sample values such as `R-102`, `order_date`, `14/09/2026` or `ORD-8842`.
- **Decision lanes:** Emerald = deterministic safe action; Amber = human approval required; Violet = refused by policy. Red is reserved for a real failure.
- **Motion hierarchy:** large movement for a file/row entering; medium movement for a branch or comparison; small movement for a cell highlight, badge or check.
- **Final state:** every animated object must settle into a stable state. No endless pulses except a low-key indicator that an approval is waiting.

### 5.2 Recommended reusable motion components

Create small components only where reuse is real. Suggested file plan:

- `src/components/DataFlowOverlay.tsx` — SVG connector layer for source-to-target paths inside a stage scene.
- `src/components/GateApplyScene.tsx` — Stage 6 three-lane gate/apply scene; keep it separate from the main viewport JSX to avoid one enormous component.
- `src/components/SimulationScene.tsx` — Stage 5 diff preview scene.
- `src/data/demoState.ts` — pure state derivation functions.

If implementation is cleaner with fewer files, Antigravity may combine scene components into `StageViewport.tsx`, but keep the state derivation separate and keep the file readable. Do not create abstractions used only once unless they materially simplify the scene.

### 5.3 SVG connector measurement

For connectors between actual table cells and diagnosis/proposal targets, use a measured overlay rather than guessed hard-coded pixel positions:

1. Add matching data attributes to endpoints, for example `data-flow-source="issue-date-r102"` and `data-flow-target="group-invalid-date"`.
2. Put the SVG overlay in a positioned scene root that contains both endpoints.
3. After layout, read each endpoint's `getBoundingClientRect()` and convert the start/end points to coordinates relative to the scene root.
4. Draw a cubic Bézier path from the right-centre of the source to the left-centre of the target. Use a modest horizontal bend; route behind the content, not over labels.
5. Re-measure on scene resize with `ResizeObserver` (with cleanup) and on viewport resize. Re-measure after the font/layout has settled.
6. Animate the path from fully dashed to drawn. Move a small SVG circle/token along the path by using `path.getTotalLength()` and `path.getPointAtLength(progress * length)` inside a GSAP tween's `onUpdate`. No MotionPathPlugin is required.
7. Pair each source and target by a stable data key. If either endpoint is absent, skip that connector safely; never throw.
8. Keep the overlay `aria-hidden="true"`; expose the same relationship in nearby readable text.

Do not run `getBoundingClientRect()` on every scroll frame. Measure on mount/layout/resize and animate with GSAP after measurement.

---

## 6. Exact stage-by-stage storyboard and timeline requirements

Use `useGSAP()` scoped to `stageBodyRef` or the scene root. Every stage gets a master entrance timeline. Keep the transition reversible and cleanup-safe. The suggested durations are target timings, not hard-coded requirements; tune slightly if needed to look natural.

### Stage 1 — Ingest: the file enters a protected workspace

**Initial state:** show the source file identity, an empty/quiet table frame, and the read-only badge. The source filename is `orders_demo_sample.csv`.

**Timeline (roughly 1.8–2.2 seconds):**

1. File token enters from the left/top edge of the product scene and settles into the dataset header (`0.0–0.45s`). Token label: `orders_demo_sample.csv`.
2. A thin emerald/neutral connector draws from the file token to the table frame (`0.25–0.7s`).
3. Six sample rows arrive in order with a restrained stagger. Each row should move into position; do not fade all rows in at once (`0.5–1.25s`).
4. The read-only lock/badge draws or resolves into a clear locked state. Add a short highlight around the source label (`1.2–1.55s`).
5. The metadata counters resolve to `6 rows`, `5 columns`, `30 source cells` (`1.4–1.9s`).

**Important:** the data must be readable throughout. Do not animate rows from `display:none`; use transform/opacity only. The source table must remain labelled `READ-ONLY SOURCE SNAPSHOT`.

### Stage 2 — Detect: scan and mark the six actual issues

**Initial state:** same table and values; no diagnostics yet.

**Timeline (roughly 2.2–2.8 seconds):**

1. A narrow scan beam passes horizontally across the table rows or across the table body. It should feel like a profiler examining cells, not a laser effect (`0.0–0.9s`).
2. Reveal the six affected cells in this exact order: R-102 customer, R-102 order_date, R-102 amount, R-105 order_date, R-104 order_id, R-103 customer_tax_id. Each cell briefly receives a ring/tint and then settles into its category color (`0.45–1.55s`).
3. Draw connectors from the six cells to their four category summary items. Pair two date issues with `Invalid date (2)` and the two formatting issues with `Inconsistent format (2)`; duplicate and missing each get one connection (`0.9–1.9s`).
4. Count the total issue count from 0 to 6 and reveal the category counts. End with all six issue markers visible (`1.5–2.4s`).

Use the existing semantic diagnostic palette: duplicate blue, invalid date red/pink, inconsistent format amber/orange, missing slate. Do not use the safety-gate colors for diagnostics.

### Stage 3 — Diagnose: evidence flows into the root-cause dossier

1. Keep a small visual reference to the affected rows/fields at one side of the scene.
2. Draw four evidence connectors from source issues into four evidence entries in the dossier. Each line must correspond to a true sample explanation.
3. Reveal the diagnostic profile and root-cause blocks in sequence.
4. Reveal the four evidence rows with a short stagger; emphasize the row/field reference in mono text.
5. Finish with an “6 issues explained” count and all four evidence items visible.

Do not invent AI confidence values, model names, probabilities or inferred causes beyond the text already in `DIAGNOSTIC_DOSSIER`.

### Stage 4 — Propose: three proposals branch from diagnosis

Use the three existing proposal records, retaining their actual policy meanings:

- `R-101` / formatting repair bundle: auto-apply, four issues addressed.
- `R-104` / duplicate consolidation: requires human approval, one issue.
- `R-103` / missing tax ID: refused, one issue.

**Timeline:**

1. Evidence lines converge into a proposal hub.
2. Three proposal cards emerge one by one from the hub, connected by paths.
3. Each card settles into its proper semantic lane/color: emerald, amber, violet.
4. The exact operation, affected row(s), rule and reason are visible. Do not compress the explanation into an unreadable micro-card.
5. Finish with an explicit `3 proposals · 6 issues accounted for` summary. This is sample math, not a real engine metric.

### Stage 5 — Simulate: inspect before applying

This stage is a preview. **No approval button is presented here and no working-copy mutation happens here.**

Design a clear two-sided comparison:

- Left: `ORIGINAL SAMPLE — READ ONLY`.
- Right: `PROPOSED RESULT — PREVIEW ONLY`.
- A connecting center rail/arrow for each diff.

Show all six diff entries. Reveal them sequentially, not as one static table:

1. R-102 customer trim.
2. R-102 date normalization.
3. R-102 currency normalization.
4. R-105 date normalization.
5. R-104 duplicate consolidation preview — amber `WAITING FOR APPROVAL`; do not visually remove the original row yet.
6. R-103 tax ID — violet `REFUSED / NULL PRESERVED`; do not create a proposed value.

For the four safe changes, animate the original value token across the center rail into the proposed value. Preserve the original value in the source pane; do not morph the source cell itself. For the duplicate, show a ghost/preview of consolidation but keep it explicitly pending. For the refused tax ID, draw no transformation arrow; use a locked branch ending at `NULL PRESERVED`.

Keep the status and the reason readable. The viewer must understand that a preview does not equal an applied change.

### Stage 6 — Gate & Apply: three branches, one human decision

This is the most important interactive scene. It must feel like a real decision point, not three informational cards.

Arrange three clearly separated lanes that feed toward a visible `WORKING COPY` destination:

**A. Emerald — SAFE / AUTO-APPLY**
- One bundle representing four deterministic formatting repairs.
- Animate the four transformed values moving into the derived working copy.
- End at a green `4 safe cell repairs staged` / `Auto-applied in sample working copy` indicator.

**B. Amber — HUMAN APPROVAL**
- Show duplicate `ORD-8842`, source rows R-102 and R-104, and why consolidation is destructive.
- Before approval, the amber token must visibly stop at a gate/barrier. Display `1 duplicate decision pending`.
- Present the button `Approve duplicate consolidation`.
- On click, animate the amber token through the gate; show R-104 collapsing/merging into the canonical R-102 record in the **derived working copy only**; update row count from 6 to 5; change the decision badge to `Approved (sample)`; pending count becomes 0.
- Add visible text `Local demonstration state only — no backend write`.
- The button becomes `Reset sample decision`. Reset must restore the unapproved state and all dependent views.

**C. Violet — POLICY REFUSED**
- Show R-103 `customer_tax_id = NULL`.
- A lock/shield closes the route. The branch ends at `Refused — no authoritative source`.
- The cell remains `NULL` in both source and working copy. Never animate a synthetic value into this branch.

**State propagation requirements:**
- Approval state is held once in `GuidedDemoSection` (or a small parent state object) and passed to StageViewport/scenes.
- `deriveWorkingCopy`, `deriveChecks`, `deriveProof`, badges, counts and row count all derive from that single state.
- Do not separately maintain duplicate booleans/counters in individual child components.
- Reset returns every downstream value and animation to the unapproved state.
- Scrolling away and back must not reset the approval state.
- Switching stage must not accidentally re-trigger the approval action.

### Stage 7 — Verify: run four checks in sequence

On entering Stage 7, show four check rows in a queued state. A sequential timeline should move each from `Queued` to `Running` to its correct result. Use restrained progress strokes/checkmark scale-in. This is a local deterministic sample animation; it is not a real backend execution.

Expected final state:

| Check | Before approval | After approval |
|---|---|---|
| Schema and format conformance | Passed | Passed |
| Row-count invariant | Passed (6 rows; expected delta 0) | Passed (5 rows; expected delta −1) |
| Primary-key uniqueness | Pending approval | Passed |
| No fabricated identifiers | Guarded / Refused | Guarded / Refused |

The check summary must calculate totals from the returned check list. Do not use a fixed number such as “3 passed” in a template string if the current state can make it different. No pending check may use a green pass icon.

### Stage 8 — Proof: close the loop with verifiable numbers

Use the existing deterministic calculation but make its scope explicit.

Display:
- Source-cell quality score: 80% baseline → 93% pending approval, or 97% after approval.
- Fixed source baseline: 30 original cells.
- Issues: 6 before → 2 remaining (pending + refused), or 1 remaining (refused only).
- Issues resolved: 4 of 6 before approval, 5 of 6 after approval.
- Pending approval: 1 or 0.
- Explicitly refused: 1.
- Working-copy row count: 6 before approval, 5 after approval.
- Original source integrity: preserved / unchanged.

**Timeline:** draw the ring from 80% to current result; count up the numeric metrics; reveal the audit record; then settle all values. If GSAP count-up logic is used, make the final value come from the derived proof object, not hard-coded text. Provide a static accessible text equivalent.

The final proof copy must explain: four auto-safe formatting issues were repaired; duplicate consolidation is either pending or approved; one missing tax ID was refused and remains `NULL`; all figures describe this illustrative sample only.

---

## 7. File-by-file implementation instructions

### Step 1 — `src/data/demoData.ts`

1. Preserve the six sample rows and existing textual evidence.
2. Update `DEMO_STAGES` metadata to the exact eight-stage order in Section 2.
3. Ensure Stage 5 is `Simulate`; Stage 6 is `Gate & Apply`; Stage 7 is `Verify`; Stage 8 is `Proof`.
4. Keep the six issue facts consistent with Section 3.1. If a reusable issue catalog is useful, add a typed `SAMPLE_ISSUES` export with stable IDs `I-01` through `I-06`, category, row ID, column, original value, proposed value (nullable for refusal), decision and explanation.
5. Do not duplicate facts in multiple unconnected sources. Derive category counts from the issue catalog or central metadata.
6. Keep `computeSampleProofMetrics` or refactor it into `deriveProof`, but do not change the 80/93/97 math. Return fixed denominator `30` and label it as source baseline.
7. Make `SIMULATION_DIFFS` support the two-pane preview. Do not present a fake new tax ID for the refused item.
8. Remove stale stage copy that still says Gate is stage 5 or Simulate is stage 6.

### Step 2 — new `src/data/demoState.ts`

Create strongly typed pure functions. Suggested output shapes:

- `OperationState`: proposal ID, decision category, issue count, status (`staged`, `pending`, `approved`, `refused`) and display explanation.
- `WorkingCopyResult`: `rows`, `rowCount`, `duplicateApproved`, `appliedSafeIssueIds`, `approvedIssueIds`, `pendingIssueIds`, `refusedIssueIds`.
- `DerivedCheck`: ID, label, result (`passed`, `pending`, `guarded`), outcome text.
- `DerivedProof`: fixed baseline counts, resolved/remaining/pending/refused counts, score percentage, and working-copy row count.

Required functions:

```ts
export function deriveOperations(isDuplicateApproved: boolean): OperationState[];
export function deriveWorkingCopy(isDuplicateApproved: boolean): WorkingCopyResult;
export function deriveChecks(isDuplicateApproved: boolean): DerivedCheck[];
export function deriveProof(isDuplicateApproved: boolean): DerivedProof;
```

Implementation details:
- Start from `SAMPLE_ROWS.map(row => ({ ...row, issues: row.issues ? { ...row.issues } : undefined }))` or an equivalent clone.
- Apply the four exact safe changes only to the clone.
- If approved, filter R-104 out of the clone; do not delete/mutate from `SAMPLE_ROWS`.
- Keep R-103 `taxId` exactly `null`.
- Return new objects on every invocation.
- Keep all counts derived from the issue catalogue / known operation definitions; avoid repeated unexplained magic numbers. If using constants for the four safe issues, centralize and name them.

Add development-time assertions or a small deterministic verification function for these invariants:
- source row count remains 6;
- source R-102 customer/orderDate/amount remain unchanged;
- source R-104 remains present;
- source R-103 tax ID remains `null`;
- unapproved derived working copy has 6 rows;
- approved derived working copy has 5 rows;
- approved derived working copy has no duplicate `order_id`;
- approved and unapproved both retain R-103 tax ID as `null`;
- proof scores are 80%, 93%, 97% in the right states.

Do not add a test framework solely for this task. Put pure assertions in a development-only helper or run a small temporary verification script that is removed before final delivery. Do not keep untracked scratch files in the deliverable.

### Step 3 — `src/components/GuidedDemoSection.tsx`

1. Keep the current `activeStage` and single approval state in the parent.
2. Update stage metadata usages automatically from the revised `DEMO_STAGES`.
3. Keep `ScrollTrigger` pinning, bidirectional stage triggers, left-step click/keyboard navigation and reduced-motion behaviour.
4. Keep ScrollTrigger IDs stable where possible. Ensure `ScrollTrigger.refresh()` still happens after the layout has settled.
5. Ensure selecting Stage 5 and Stage 6 scrolls to the correct narrative cards after the reorder.
6. Update comments that refer to the approval toggle as Stage 5; it now belongs to Stage 6.
7. Pass the single `isDuplicateApproved` state down; do not add duplicate state to child components.
8. Ensure the pinned stage height does not create clipping at the target desktop resolutions. If using `gsap.matchMedia`, keep all created triggers within the existing `useGSAP` scope and clean up via `mm.revert()`.

### Step 4 — `src/components/StageViewport.tsx`

Refactor the conditional render blocks into the new sequence. Prefer readable child scene components over deeply nested conditional JSX.

Expected render map:

```text
activeStage 1 -> Ingest scene
activeStage 2 -> Detect scene
activeStage 3 -> Diagnose scene
activeStage 4 -> Propose scene
activeStage 5 -> SimulationScene
activeStage 6 -> GateApplyScene
activeStage 7 -> Verify scene
activeStage 8 -> Proof scene
```

1. Keep the product chrome and provenance banner persistent.
2. Change navigation active-state rules so Stage 5 is still in the run/simulation context and Stage 6 is the decision/apply context. Use coherent labels, not stale stage boundaries.
3. Replace direct use of static `INTEGRITY_CHECKS` values with `deriveChecks(isDuplicateApproved)`.
4. Replace hard-coded status strings/counts with derived values.
5. Use `deriveWorkingCopy` for the resulting sample preview on Stage 6 and Stage 7. Keep the source table rendering from `SAMPLE_ROWS` only.
6. Ensure all stage changes are scoped to `stageBodyRef` and all GSAP timelines are cleaned on stage switch/unmount.
7. Keep the Stage 8 ring stroke and numeric readouts derived from `deriveProof`.
8. No stage should render an empty body while waiting for an animation. Base HTML/React content must be readable before and after the timeline.

### Step 5 — new `src/components/SimulationScene.tsx`

Implement Stage 5.

- Render a clearly labelled source pane and proposed pane.
- Render all six issue changes from the central sample issue/diff data.
- Each diff entry has row ID, column, original value, proposed value or refusal state, decision badge and reason.
- Four safe transformations animate original-value tokens across a central arrow/connector into the proposed value.
- Duplicate shows an amber pending preview; it is not removed here.
- Refused tax ID shows `NULL` preserved and a locked indicator; do not animate a fabricated replacement.
- Use data attributes or refs to scope animation targets. Avoid global CSS selectors.

### Step 6 — new `src/components/GateApplyScene.tsx`

Implement Stage 6 as three connected lanes and a working-copy destination.

- Emerald lane: four safe formatting repairs flow into the working copy.
- Amber lane: duplicate consolidation waits at an approval barrier; the explicit button controls this branch.
- Violet lane: missing tax identifier remains refused and unchanged.
- Show working-copy row count and the sample provenance notice.
- The approve/reset action calls only the parent callback.
- All content derives from `deriveOperations` and `deriveWorkingCopy`.
- Do not claim the button sends a backend request or changes a real file.

Approval animation must not depend on the user scrolling away and back. It responds to the state transition. Reset must animate back to the pending/6-row state and restore all proof/check values.

### Step 7 — new `src/components/DataFlowOverlay.tsx` (or equivalent)

If you implement measured SVG connectors, follow Section 5.3 exactly. Keep this component defensive and scoped to one scene root. It must:

- tolerate missing endpoints;
- recalculate only on mount/layout/resize;
- disconnect `ResizeObserver` and remove listeners on cleanup;
- never write to unrelated DOM nodes;
- not cause a React state update per animation frame;
- respect reduced motion (show final paths without moving tokens).

If measured connector geometry is too fragile for a particular stage, use a simple explicit SVG path in that stage's own layout. Do not substitute random movement.

### Step 8 — `src/components/ScrollBeamSvg.tsx`

Keep the vertical editorial progress rail, but ensure the active nodes and line represent the corrected order. Remove unused props/ref names if they are no longer accurate. The beam remains emerald and understated. Avoid neon/glow styling.

### Step 9 — `src/App.tsx`

1. Replace the inaccurate hero dashboard numbers. Derive its data from the shared sample data functions.
2. The hero preview should show something related to this sample, such as:
   - `6 sample rows`
   - `6 detected issues`
   - `80% starting source-cell quality`
3. Add a small persistent caption such as `Illustrative sample run · 30 original source cells`. This preview is decorative, but its figures must be correct.
4. If you animate the preview, use the same vocabulary and colors as the eight-stage story. Do not animate fake real-time counters.
5. Update outro journey strip exactly to `Ingest → Detect → Diagnose → Propose → Simulate → Gate & Apply → Verify → Proof`.
6. Ensure the outro does not claim a real production run completed. It is the completion of the sample demonstration.

### Step 10 — `src/styles/demo.css`

1. Widen `.df-demo-container` and `.df-demo-grid` as in Section 4.1.
2. Define all 11 missing classes listed in Section 1.2. Define styles for any new component classes introduced by the scene components.
3. Add a compact-height desktop treatment (for example, `@media (max-height: 800px) and (min-width: 1024px)`) that reduces vertical gaps/padding while preserving readable type and all content.
4. Make Stage 4 proposal cards and Stage 6 gate lanes responsive across 1280–1920px desktop widths.
5. Remove any nested vertical overflow. Keep `overflow-x:auto` only on true table wrappers if required.
6. Ensure overlay SVG paths sit behind cards/cells using a deliberate stacking context (`position` and `z-index`). Do not let SVG connectors cover text or intercept clicks (`pointer-events:none`).
7. Avoid setting `opacity:0` or `visibility:hidden` permanently in CSS on `.df-anim-item` or `.df-anim-panel`. GSAP must not be the only thing that makes essential content visible.
8. Add clear focus-visible styles for new buttons and interactive controls.
9. Use existing `--df-*` tokens. Keep new colors consistent with V2.

### Step 11 — `src/styles/tokens.css`

Keep the established palette and typography. Add only missing tokens needed by the new motion scenes. This file currently includes global selectors (`:root`, reset, `html`, `body`, `button`); that is acceptable for this isolated standalone POC, but do not copy these global rules into the main DataFix app as-is. No broad visual re-theme is requested.

---

## 8. GSAP engineering rules

1. Register `ScrollTrigger` and `useGSAP` once at module scope as the current code does.
2. Use `useGSAP()` with a component root scope. Prefer `revertOnUpdate: true` for stage-specific entrance timelines.
3. Separate **stage entrance** animation from **approval state-change** animation so clicking Approve/Reset does not replay all stage entrance effects.
4. Do not create a ScrollTrigger for every cell. The only scroll-driven triggers should be the main pin, progress beam and eight narrative-stage anchors.
5. Stage-specific data animations are triggered when `activeStage` changes, not by creating additional competing scroll triggers.
6. Animate transforms and opacity wherever possible. Avoid layout-thrashing properties (`top`, `left`, `width`, `height`) during continuous motion.
7. For numeric counters, animate a proxy value and update a dedicated text ref; always finish exactly on the derived number. Avoid setting React state on every frame.
8. For SVG paths, draw using dash offsets; move a token via `getPointAtLength()` on the path. Cache path length after path measurement and recalculate if the scene dimensions change.
9. Every GSAP hook/timeline/observer/listener must clean up when the stage changes, the component unmounts or the breakpoint changes.
10. On `prefers-reduced-motion: reduce`, do not run the staged entrance, path movement, counters or pinning. Render final values and fully drawn paths immediately.
11. Never leave a stage with elements at opacity 0 after interrupted or reverse navigation. Test fast scrolling in both directions.
12. Do not use an infinite repeating timeline for the main scene. A small approval-wait indicator may pulse gently, but all data movement settles.

---

## 9. CSS and visual polish acceptance

- The hero and main scenes remain light-first and visually connected.
- The full product canvas uses the desktop width; avoid the previous narrow floating mockup feeling.
- The visual focus is the data itself: table, evidence paths, repair proposals, comparison, three-way gate and proof.
- Semantic color mapping is consistent:
  - Diagnostic: blue duplicate, red/pink invalid date, amber inconsistent format, slate missing.
  - Decision: emerald auto/safe, amber approval, violet refusal.
  - Red is not used for pending or refused states.
- No meaningless blinking elements, excessive glow, spinning icons, background particle effects or continuously moving decoration.
- No blank table rows; all six records appear where required.
- No cut-off cards, overlapped labels, clipped approval button or internal vertical scrollbars.
- The pinned product scene must fit 1280×720 and 1366×768. If there is a trade-off, simplify spacing before shrinking essential content.
- The visual design must hold together at 1440×900 and 1920×1080 without stretching the table into excessive whitespace.

---

## 10. Required acceptance tests

Run all checks from `D:\datafix-motion-poc-01-visual-v2`.

### 10.1 Static checks

```bash
npm run typecheck
npm run build
```

Both must pass. Do not mark the work accepted if either command fails. Report the exact terminal result.

### 10.2 Functional state checks

Verify in the running browser:

1. Initial state: Stage 1 is active; source table has six rows; provenance is visible.
2. Stage 2: exactly six issue markers; category totals add to six.
3. Stage 3: all four evidence entries are present and accurate.
4. Stage 4: exactly three proposal branches: auto, needs approval, refused.
5. Stage 5: all six diffs visible; no approval action here; no changes applied to source; duplicate remains pending; refused NULL remains intact.
6. Stage 6 before approval: auto repairs are in the derived working copy; duplicate remains pending; working-copy row count is six; R-103 tax ID is NULL.
7. Stage 6 after approval: duplicate is consolidated; row count becomes five; primary-key check becomes eligible to pass; pending count becomes zero; score becomes 97%; refused NULL remains.
8. Stage 6 after reset: row count returns to six; duplicate is pending; score returns to 93%; all prior state is restored.
9. Stage 7 before/after approval: four checks show correct dynamic statuses; no pending status is green.
10. Stage 8 before/after approval: exact values 93% / 97%, 28/30 / 29/30, 4/6 / 5/6, pending 1 / 0, refused 1, output row count 6 / 5.
11. Source immutability: after approve and reset, `SAMPLE_ROWS` still has the exact original values and six rows. R-104 remains in the source array. R-103 remains `null`.
12. Scroll down through all eight stages, then scroll back up. Correct narrative card, product scene and values must reappear. The approval state must persist when navigating between stages.
13. Restart/outro journey labels are in the correct order.

### 10.3 Motion checks

- Stage 1 file-to-table arrival and row settlement are visible.
- Stage 2 scan, six issue highlights and source-to-category connectors are visible.
- Stage 3 evidence connectors and dossier reveal are visible.
- Stage 4 three proposal branches emerge and resolve into their semantic colors.
- Stage 5 values visibly travel from original to preview; duplicate is pending; refused NULL does not move.
- Stage 6 green lane advances; amber stops until click; click moves the duplicate through the gate; violet remains blocked.
- Stage 7 checks resolve sequentially to the correct states.
- Stage 8 ring and proof values animate and settle at exact derived values.
- Motion looks intentional at normal scroll speed and does not flash, jump or leave hidden content after rapid direction changes.

### 10.4 Desktop viewports

Test the four target resolutions:

- 1920×1080
- 1440×900
- 1366×768
- 1280×720

At all four, check Stage 1, Stage 5, Stage 6 and Stage 7 for clipping/scrollbars/overlap. Test the full scroll journey at 1440×900. Do not create screenshot deliverables; just inspect runtime and report pass/fail.

### 10.5 Accessibility / resilience

- Keyboard can move through the eight narrative stages.
- Approve/Reset is keyboard accessible and announces the state change.
- Focus is visible.
- Reduced-motion mode displays complete, readable final states with no pinning or scroll-scrubbing.
- Browser console has no uncaught JavaScript errors.
- No missing component keys or React warnings caused by the new scenes.

---

## 11. Execution order for Antigravity

Follow these steps in order. Do not skip ahead to styling before the state model is correct.

**Phase A — Protect and inspect**
1. Confirm the current working directory is `D:\datafix-motion-poc-01-visual-v2`.
2. Create a dated source backup.
3. Read the current `README.md`, report and all relevant source files.
4. Do not touch `D:\DataFix` or any other directory.

**Phase B — Correct data and stage architecture**
5. Update `DEMO_STAGES` to the exact order.
6. Create `demoState.ts` and implement the four pure derivation functions.
7. Verify the expected 6-row/5-row working copies and 93%/97% proof states before changing visual components.
8. Fix hero data and outro stage order.

**Phase C — Build the scenes**
9. Refactor `StageViewport` to use the corrected scene map.
10. Implement Stage 5 `SimulationScene` as preview-only.
11. Implement Stage 6 `GateApplyScene` with the three decision lanes and working-copy destination.
12. Implement the Stage 7 dynamic verification list.
13. Implement the Stage 8 proof scene from `deriveProof`.

**Phase D — Add purposeful motion**
14. Add the reusable SVG connector layer (or explicit per-scene SVG paths if more robust).
15. Implement Stage 1–8 timelines exactly following Section 6.
16. Separate stage-entry motion from approval/reset motion.
17. Test reverse scroll and rapid stage switching before polishing.

**Phase E — Desktop composition and polish**
18. Expand the desktop layout to use the screen width.
19. Add missing CSS selectors and all new scene styles.
20. Remove vertical nested scroll areas and fix compact-height desktop layouts.
21. Verify V2 color semantics, type sizes, table readability and narrative/product balance.

**Phase F — Verify and report**
22. Run typecheck and production build.
23. Run state, motion, responsive, accessibility and console checks from Section 10.
24. Fix every failure, rerun both build commands and recheck the critical flow.
25. Update the README with the corrected stage order, how to run the demo and the fact that it is sample-only.
26. Create `V2_2_MOTION_IMPLEMENTATION_REPORT.md` in the project root with: files changed, functions/components added, exact tests run, actual pass/fail results, known limitations and confirmation that `D:\DataFix` was not modified.

---

## 12. Final deliverable definition

Antigravity must finish with:

1. Updated working prototype inside `D:\datafix-motion-poc-01-visual-v2`.
2. New `src/data/demoState.ts` with immutable, deterministic derived state.
3. New `SimulationScene.tsx`, `GateApplyScene.tsx` and `DataFlowOverlay.tsx` (or documented equivalent implementation if the components are combined sensibly).
4. Updated `demoData.ts`, `GuidedDemoSection.tsx`, `StageViewport.tsx`, `ScrollBeamSvg.tsx`, `App.tsx`, `demo.css`, `tokens.css` and README as required.
5. `V2_2_MOTION_IMPLEMENTATION_REPORT.md` with factual verification results.

**Acceptance standard:** the experience should visibly demonstrate data moving through Detect → Diagnose → Propose → Simulate → Gate & Apply → Verify → Proof, with a deliberate human approval interruption and a refused branch that never fabricates data. A set of attractive static cards with fade-ins is not sufficient. A successful build alone is not acceptance; the actual data-flow motion and state transitions must work.

**Do not ask Akash to make design decisions that are already specified here.** Make the implementation choices needed to satisfy this script, document any unavoidable limitation, and deliver the working prototype plus report.
