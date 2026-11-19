# DataFix Visual & Interaction Design Direction

**Document Type:** Visual & Interaction Design Blueprint  
**Author:** Antigravity (Implementation & Research Agent)  
**Input Studies:**  
- [Soda.io Visual Study](file:///d:/DataFix/docs/research/SODA_MOTION_AND_UI_RESEARCH.md)  
- [Monte Carlo Visual Study](file:///d:/DataFix/docs/research/MONTECARLO_MOTION_AND_UI_RESEARCH.md)  
**Target Product:** DataFix (Deterministic Data Quality & Repair Platform)  
**Scope:** Actionable design guidance for DataFix's marketing presentation and in-app micro-interactions.

---

## 1. Design Vision & Strategic Synthesis

DataFix occupies a unique position at the intersection of **data quality observability** and **active deterministic repair**. While platforms like Monte Carlo and Soda excel at *detecting* and *alerting* on anomalies, DataFix closes the loop by *diagnosing, proposing structured repairs, validating outcomes, and maintaining an immutable audit trail*.

From our empirical study of Soda and Monte Carlo, we extract two foundational design principles:
1. **Concrete Anomaly Dossiers (from Monte Carlo):** Never present abstract "quality scores" without tangible, column-level evidence. Every anomaly must look like an actionable incident report: target cell, old value, proposed value, diagnostic rationale, confidence score, and risk tier.
2. **Fluid, High-Contrast Staging (from Soda):** Combine deep obsidian canvas backgrounds with precise, luminous accents (Electric Emerald for verified repairs, Electric Cyan for active inspection, Amber for safety gates, Coral Red for destructive hazards).

---

## 2. Separation of Concerns: Marketing vs. In-App Motion

A critical takeaway from our architectural investigation is the strict separation between **marketing storytelling animations** and **in-app productivity micro-interactions**:

```
┌────────────────────────────────────────────────────────┐
│            DATAFIX MOTION ARCHITECTURE                 │
├───────────────────────────┬────────────────────────────┤
│   MARKETING / LANDING     │    IN-APP APPLICATION      │
│     (Visual Story)        │   (Speed, Trust & Focus)   │
├───────────────────────────┼────────────────────────────┤
│ • Scroll-driven pacing    │ • Zero-latency data grids  │
│ • Sticky split-screen stage│ • Instant cell navigation  │
│ • Framer Motion springs   │ • Lightweight Tailwind CSS │
│ • Animated dripping flow  │ • High-performance diffs  │
│ • Rich looping MP4 demos  │ • Strict prefers-reduced-  │
│                           │   motion support           │
└───────────────────────────┴────────────────────────────┘
```

---

## 3. Marketing & Product Storytelling Blueprint

For public landing pages, demo overviews, or investor/stakeholder walkthroughs, DataFix should adopt the following motion-driven narrative patterns:

### 3.1 The Sticky Split-Screen Stage (Inspired by Monte Carlo & Soda)
- **Layout:** On desktop viewports (≥ 1024px), pin a live interactive Repair Studio preview on the right (`position: sticky; top: 100px`), while the left column scrolls through the four core pillars:
  1. **Deterministic Profiling:** Instant syntax, type, and distribution scans across millions of rows.
  2. **LLM Diagnostic Intelligence:** Root cause hypothesis generation without allowing the LLM to mutate raw data.
  3. **The Human Safety Gate:** Multi-tiered risk classification requiring explicit human sign-off for destructive edits.
  4. **Closed-Loop Proof:** Deterministic re-verification generating cryptographic audit receipts.
- **Motion Trigger:** As each narrative step scrolls into focus (`IntersectionObserver` threshold `0.6`), the right-hand preview smoothly transitions to highlight the corresponding component:
  - Step 1: Raw data grid pulses anomalies in amber.
  - Step 2: The diagnostic drawer slides open, displaying the LLM's structured repair hypothesis.
  - Step 3: The Safety Gate ribbon illuminates with "Pending Approval".
  - Step 4: Verification checks run with green checkmark cascades, outputting a SHA-256 ledger block.

### 3.2 The Flowing Anomaly-to-Resolution Line (Inspired by `mc-scroll-drip`)
- An illuminated vertical SVG connector line running down the narrative spine.
- As the user scrolls, the line illuminates with an animated gradient traveling from coral red (anomaly detection) through amber (safety review) to emerald green (verified repair).

---

## 4. In-App Screen-by-Screen Interaction Blueprint

In-app micro-interactions must prioritize **clarity, speed, and cognitive ergonomics**. They must reassure the user that data is safe, original datasets remain immutable, and no hidden mutations occur.

### 4.1 Intake Screen (File Ingestion)
- **Drag-and-Drop Dropzone:**
  - *Rest State:* Dark slate surface (`#0F172A`) with a dashed border (`rgba(255, 255, 255, 0.15)`).
  - *Drag-Over State:* Border transitions to glowing cyan (`#00E5FF`), and the dropzone scales slightly (`scale(1.01)`) with a gentle radial background pulse.
  - *Drop Action:* Dropzone collapses smoothly into a compact file summary badge while a deterministic row/column counter spins up rapidly (e.g., `0 → 1,420 rows` in 400ms).
- **Format Validation Gate:**
  - Instant client-side check on file size and extension (`.csv`). If invalid, a shake micro-animation (`translateX(-4px) → translateX(4px)`) triggers with a clear error banner.

### 4.2 Overview Screen (Dataset Exploration & Profiling)
- **Health Score Dial:**
  - An animated radial SVG ring that fills from `0%` to the calculated baseline score (e.g., `72%`) over 600ms with cubic-bezier easing (`cubic-bezier(0.16, 1, 0.3, 1)`).
- **Column Quality Breakdown:**
  - Horizontal stacked distribution bars showing the ratio of *Valid* (Emerald), *Missing* (Amber), and *Malformed* (Coral) entries.
  - Hovering over any distribution segment highlights the affected column and displays a summary tooltip.
- **Tab Transitions:**
  - Switching between *Column Profiling* and *Data Preview* uses an instant cross-fade (`opacity: 0 → 1` in 150ms) to maintain maximum UI responsiveness.

### 4.3 Repair Studio (The Core Human Safety Gate)
The Repair Studio is the central control room of DataFix. Its motion design must reinforce trust and deliberate human oversight.

- **Three-Lane Safety Gate Ribbon:**
  - The sticky top ribbon categorizes all proposals into three clear states:
    1. **Needs Review / Pending Approval:** Amber badge with a subtle pulsing dot indicator.
    2. **User Approved:** Crisp Emerald badge with a checkmark icon.
    3. **Refused / Flagged:** Muted Slate/Red badge with a refusal tag.
- **Side-by-Side Diff Reveal:**
  - Original immutable value on the left (neutral slate background), proposed repaired value on the right (emerald tint background).
  - Highlighting characters that changed with an animated yellow-to-green fade on approval.
- **Approval & Rejection Gestures:**
  - Clicking **Approve** triggers a 120ms green border flash on the card, updates the safety ribbon counter, and advances focus to the next pending item.
  - Clicking **Reject / Refuse** opens a quick inline refusal tag selector (*"Keep Original"*, *"Ambiguous Identity"*, *"External Correction Required"*), collapsing the card into a compact refused summary.
- **Hazard Badge for High-Risk Repairs:**
  - Any proposal involving row deletion, ambiguous entity merging, or confidence `< 70%` displays a striped caution hatch pattern along the card's left border.

### 4.4 Proof Screen (Closed-Loop Deterministic Verification)
- **Verification Replay Sequence:**
  - Clicking "Run Closed-Loop Verification" triggers a deterministic replay simulation.
  - A sequence of test rules validates in real-time with a fast downward cascade (100ms per rule):
    - `[✓] Null check: 0 nulls detected (previously 42)`
    - `[✓] Type check: 100% compliant with ISO-8601`
    - `[✓] Uniqueness check: 0 duplicate customer IDs`
- **Issue Delta Counters:**
  - Dual comparison counters:
    - *Before:* `42 Issues Detected` (Red badge)
    - *After:* `0 Unresolved | 3 Refused by User` (Emerald badge)
- **Quality Score Delta:**
  - Score dial transitions smoothly from `72%` to `98%`, accompanied by a clear breakdown explaining that refused items are deliberately accounted for and not fabricated.

### 4.5 History Screen (Audit Trail & Provenance)
- **Timeline Ledger Sequence:**
  - Each recorded operation (File Upload, Scan Run, Repair Approval, Rejection, Verification Replay) renders as an immutable ledger node along a vertical timestamp line.
  - Clicking any event expands an audit dossier showing the operator, timestamp, exact before/after payload, and cryptographic record hash.

### 4.6 Export Screen (Artifact Packaging)
- **Export Bundle Checklist:**
  - Clean checklist showing the four artifacts:
    1. Repaired Clean Dataset (`.csv`)
    2. Audit Trail Ledger (`.jsonl`)
    3. Verification & Compliance Report (`.pdf` / `.markdown`)
    4. DataFix Reproducibility Recipe (`.json`)
- **Download Action State:**
  - Download buttons transition from idle state to an animated spinner (`Generating bundle...`) to a success state (`Downloaded ✓`) with a green confirmation toast.

---

## 5. Concrete Design Tokens for DataFix

To achieve this cohesive visual identity, DataFix should standardize on the following token set:

| Category | Token Name | Value | Purpose |
| :--- | :--- | :--- | :--- |
| **Canvas** | `bg-canvas-base` | `#0A0F19` | Deep obsidian background |
| **Surface** | `bg-surface-card` | `#111827` (with `rgba(255,255,255,0.05)` border) | Standard card and container surface |
| **Surface** | `bg-surface-elevated` | `#1E293B` | Modals, popovers, and sticky ribbons |
| **Accent** | `color-action-emerald` | `#12E29D` (`rgb(18, 226, 157)`) | Approvals, verified metrics, primary CTAs |
| **Accent** | `color-inspect-cyan` | `#00E5FF` (`rgb(0, 229, 255)`) | Active selection, diff highlighting, focus rings |
| **Warning** | `color-safety-amber` | `#F59E0B` (`rgb(245, 158, 11)`) | Pending approvals, high-risk flags |
| **Danger** | `color-danger-coral` | `#EF4444` (`rgb(239, 68, 68)`) | Critical anomalies, destructive operations |
| **Font** | `font-display` | `Inter`, `system-ui`, sans-serif | Application headings and interface text |
| **Font** | `font-mono` | `JetBrains Mono`, `IBM Plex Mono`, monospace | Cell diffs, SQL rules, row IDs, hashes |
| **Radius** | `radius-card` | `12px` | Feature cards and inspection panels |
| **Radius** | `radius-pill` | `9999px` | Action buttons, status badges, filter chips |
| **Motion** | `ease-spring-snappy` | `cubic-bezier(0.16, 1, 0.3, 1)` | In-app modal reveals, drawer slides |
| **Motion** | `duration-micro` | `150ms` | Button hover, toggle switch, tab cross-fade |
| **Motion** | `duration-standard` | `250ms` | Card expansion, diff reveal, alert banner |

---

## 6. Implementation Principles for Engineering

1. **Accessibility First (`prefers-reduced-motion`):**
   - All animations must respect OS-level reduced-motion preferences. When enabled, transitions must fall back to instant state changes (`0ms`).
2. **Zero Overhead on Virtualized Data Grids:**
   - Never attach complex CSS transitions or spring animations to individual table cells in large datasets. Keep the 50,000-row preview grid pure, hardware-accelerated, and instant.
3. **Deterministic Feedback Loop:**
   - Every state change in the UI (approving a repair, rejecting an edit, running verification) must reflect true state in the working copy, with no simulated or mock-only delays.
