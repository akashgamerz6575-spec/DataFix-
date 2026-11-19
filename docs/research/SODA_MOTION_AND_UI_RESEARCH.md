# Soda.io Visual & Interaction Study

**Target URL:** [https://soda.io/](https://soda.io/)  
**Pages Inspected:**
1. Homepage (`https://soda.io/`) — Full 10,666 px vertical scroll
2. Platform Architecture (`https://soda.io/platform`)
3. Product / Data Quality (`https://soda.io/product/data-quality`)  
**Study Date:** 19 November 2026  
**Auditor:** Antigravity (Implementation & Research Agent)  
**Evidence Directory:** [docs/research/evidence/](file:///d:/DataFix/docs/research/evidence/)

---

## 1. Executive Summary & Product Positioning

Soda positions itself as an enterprise AI-driven data quality and observability platform designed to *"stop data incidents before they hit production"*. Rather than presenting traditional database monitoring dashboards, Soda’s web presence uses high-polish, motion-heavy product simulations, fluid scroll-tied card reveals, and dark-mode glassmorphic aesthetics to convey precision, speed, and modern engineering authority.

The core narrative bridges two historically disconnected personas:
1. **Data Engineers / Analytics Engineers:** Code-first workflows, CLI commands, data contracts in Git, and instant SQL/warehouse tests.
2. **Business & Governance Leaders:** No-code interfaces, rule builders, incident dashboards, and audit-ready reporting.

---

## 2. Technical Stack & Motion Architecture (Verified via Browser DevTools)

Through live Chrome DevTools Protocol (CDP) inspection, we analyzed Soda's underlying architecture:

| Technical Attribute | Observed Implementation | Verification Details |
| :--- | :--- | :--- |
| **Site Framework** | **Framer** (React-based site architecture) | Built with Framer's site engine (`https://framerusercontent.com/sites/4YpeGymneLVFK3i0Q8rOjh/script_main.BSLVg8Ha.mjs`). |
| **Motion Library** | **Framer Motion** | Native Framer Motion animation engine driving all scroll triggers, spring physics, and entrance transitions. |
| **Scroll Triggering** | **IntersectionObserver + Viewport Springs** | Scroll positions trigger CSS transform/opacity interpolation with Framer's dampening springs (`stiffness: 100`, `damping: 20`). |
| **Video & Media** | Embedded MP4 Loops | High-efficiency video files (`9S35Z8IlcVaSCBVTyFiSieCj0.mp4`) looping silently without controls to simulate live software workflows. |
| **CSS Keyframes** | Custom float & spin animations | `sbubble-bg-gqrcg5ms-floatAnim`, `sbubble-bg-xx6rt4jz-floatAnim` driving ambient floating background elements. |
| **Sticky Layouts** | CSS Sticky + Fixed Navigation | Header navbar is fixed (`div.framer-6iivn7-container`), and storytelling cards use `position: sticky` inside `div.framer-1jovxp0`. |
| **Total Page Height** | **10,666 px** | Extensive narrative progression across 14 scroll viewports at 1440 × 900 resolution. |

---

## 3. Visual Design System

### 3.1 Color Palette & Atmospheric Depth
- **Primary Canvas Background:** Pitch black (`rgb(0, 0, 0)`) to midnight obsidian (`rgb(10, 15, 25)`), creating high contrast for brightly lit glowing UI mockups.
- **Brand Accent 1 (Action Emerald):** `rgb(18, 226, 157)` (`#12E29D`) — Used for primary CTAs ("Book a demo"), passing test badges, and healthy metric indicators.
- **Brand Accent 2 (Atmospheric Glow Blue):** `rgb(200, 230, 255)` with box shadows `rgba(120, 170, 255, 0.45)` — Used for product badges, release announcement pills, and active filter highlights.
- **Neutral Card Surfaces:** Semi-transparent dark slate `rgba(18, 24, 38, 0.7)` with `backdrop-filter: blur(8px)`.
- **Text Hierarchy:**
  - Headings: Crisp white (`#FFFFFF`) with bold, high-contrast tracking.
  - Subheadings & Paragraphs: Muted slate (`rgb(156, 163, 175)` / `#9CA3AF`).
  - Monospace Data / Code: Soft cyan and ice gray for table headers and test rules.

### 3.2 Typography Hierarchy
- **Primary Display Font:** Inter / sans-serif with tight character spacing (`letter-spacing: -0.02em`) on display headings.
- **Monospace Code Font:** Menlo / Geist Mono for SQL snippets, check rules, and warehouse identifiers.
- **H1 Scale:** 56px to 64px on desktop, scaling down to 36px on mobile viewports.

### 3.3 Card & Container Architecture
- **Border Radius:** Very generous radii — `24px` for feature cards, `39px` for interactive containers, and `64px` full pill shapes for action buttons.
- **Card Highlights:** Inset top border shine (`box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15)`), giving cards a subtle translucent glass refraction at the top edge.

---

## 4. Section-by-Section Narrative & Motion Walkthrough

### Section 1: Hero & Real-Time Product Demo (0 px – 1,400 px)
- **Visuals Captured:** [soda_home_scroll_00_0px.png](file:///d:/DataFix/docs/research/evidence/soda_home_scroll_00_0px.png), [soda_home_scroll_01_800px.png](file:///d:/DataFix/docs/research/evidence/soda_home_scroll_01_800px.png)
- **Storytelling:** 
  - Starts with an eye-catching announcement pill: *"Data Quality is Solved. See what we launched"*.
  - Powerful headline: *"Stop data incidents before they hit production"*.
  - Immediately displays an embedded video mockup of the Soda interface: an interactive workflow showing data checks running across tables, identifying anomalies, and presenting root-cause explanations.
- **Motion Behavior:**
  - Hero heading and subtext fade upward (`translateY(20px) → translateY(0px)`) with spring easing on initial load.
  - The hero video card features a soft neon gradient underglow that pulses subtly via CSS keyframe transitions.
  - Social proof logo bar scrolls continuously in an infinite horizontal ticker (`scroll-logos`).

### Section 2: Value Pillar Grid & Three Failure Categories (1,400 px – 2,500 px)
- **Visuals Captured:** [soda_home_scroll_02_1600px.png](file:///d:/DataFix/docs/research/evidence/soda_home_scroll_02_1600px.png), [soda_home_scroll_03_2400px.png](file:///d:/DataFix/docs/research/evidence/soda_home_scroll_03_2400px.png)
- **Storytelling:**
  - H2: *"Detection to resolution. All automated with AI."*
  - Breaks data quality into three tangible failure modes:
    1. **Missing Data** (Customer records omitted)
    2. **Duplicated Data** (Sales records repeated)
    3. **Invalid Data** (Transactional records with type/syntax drift)
- **Motion Behavior:**
  - As the visitor scrolls into this section, each card staggers in with a 100ms delay.
  - Hovering over a card triggers a smooth scale expansion (`scale(1.02)`) and illuminates the card's border with a cyan glow.

### Section 3: "Soda 4.0" Sticky Narrative Deep Dive (2,500 px – 7,000 px)
- **Visuals Captured:** [soda_home_scroll_04_3200px.png](file:///d:/DataFix/docs/research/evidence/soda_home_scroll_04_3200px.png) through [soda_home_scroll_07_5600px.png](file:///d:/DataFix/docs/research/evidence/soda_home_scroll_07_5600px.png)
- **Storytelling:**
  - Unveils Soda 4.0 as a comprehensive platform upgrade across four distinct stages:
    1. **Metrics Monitoring:** Benchmarked algorithms scaling to 1 billion rows in 64 seconds.
    2. **Automated Contracts:** Converting plain English into executable tests.
    3. **Shared Workflow:** Git-native code for engineers, clean UI for analysts.
    4. **Diagnostics Warehouse:** Isolating bad data in customer VPCs without data leakage.
- **Motion Behavior:**
  - **Sticky Pinning:** The section headline pins at the top of the viewport (`position: sticky; top: 120px`), while cards on the right scroll vertically past it.
  - When a card reaches the center of the viewport, its opacity transitions from `0.4` to `1.0`, and active metrics illuminate.
  - Tab pills switch dynamically to highlight the current active stage based on scroll progress.

### Section 4: Enterprise Trust & Ecosystem Integrations (7,000 px – 10,666 px)
- **Visuals Captured:** [soda_home_scroll_08_6400px.png](file:///d:/DataFix/docs/research/evidence/soda_home_scroll_08_6400px.png) through [soda_home_scroll_13_10400px.png](file:///d:/DataFix/docs/research/evidence/soda_home_scroll_13_10400px.png)
- **Storytelling:**
  - Validates enterprise deployment through case study testimonials and security compliance badges (SOC 2, ISO 27001).
  - Ecosystem grid displaying live connectors to Snowflake, Databricks, BigQuery, dbt, PostgreSQL, and AWS S3.
- **Motion Behavior:**
  - Grid icons feature interactive hover states: on mouse-over, the logo scales up slightly and displays a popover tag indicating support level ("Certified Connector").
  - Final CTA card uses an animated radial background glow that tracks mouse movement.

---

## 5. Live Interactable Motion Recordings

Through programmatic cursor dispatch and full-screen desktop recordings (2560×1600), live animations and user interactions were captured:
- [soda_cta_hover_motion.gif](file:///d:/DataFix/docs/research/evidence/soda_cta_hover_motion.gif) — Hero CTA "Book a demo" pill button micro-transition upon cursor hover.
- [soda_card_hover_motion.gif](file:///d:/DataFix/docs/research/evidence/soda_card_hover_motion.gif) — Failure category card hover transition showing top-inset border illumination and ambient glow bloom.
- [soda_integration_hover_motion.gif](file:///d:/DataFix/docs/research/evidence/soda_integration_hover_motion.gif) — Ecosystem connector logo hover elevation and popover badge appearance.
- [soda_hero_interface_motion.gif](file:///d:/DataFix/docs/research/evidence/soda_hero_interface_motion.gif) — Continuous capture of the hero product workflow simulation loop.

### 5.1 Desktop Screen Recordings (User Captured)
- [Screen Recording 2026-11-19 124003.mp4](file:///d:/DataFix/docs/research/evidence/Screen%20Recording%202026-11-19%20124003.mp4) (12.0s) — Full desktop scroll highlighting light-mode mint styling, Soda 4.0 feature grid, Contract Copilot pulsing orb, floating 3D emerald sphere, and the "agents that do the work, you approve" headline.
- [Screen Recording 2026-11-19 124036.mp4](file:///d:/DataFix/docs/research/evidence/Screen%20Recording%202026-11-19%20124036.mp4) (3.6s) — Interactive mega-menu dropdown entrance on top navigation hover (*Find*, *Understand*, *Fix at source*).
- *Extracted Keyframes:* [Hero Light Canvas](file:///d:/DataFix/docs/research/evidence/user_recording_frames/2026-11-19_124003_f0000_0.0s.png), [Copilot Module](file:///d:/DataFix/docs/research/evidence/user_recording_frames/2026-11-19_124003_f0102_3.4s.png), [Floating 3D Sphere](file:///d:/DataFix/docs/research/evidence/user_recording_frames/2026-11-19_124003_f0256_8.5s.png), [Mega-Menu Dropdown](file:///d:/DataFix/docs/research/evidence/user_recording_frames/2026-11-19_124036_f0000_0.0s.png).

---

## 6. Key Strengths & Takeaways for DataFix

1. **Concrete Anomaly Categorization:** Soda explicitly labels issues as *Missing*, *Duplicated*, and *Invalid*, which directly parallels DataFix's issue categories.
2. **Lossless Execution Framing:** Soda emphasizes *"Fix bad data at the source, in your environment"*, ensuring data leaves no audit footprint outside trusted boundaries.
3. **Sticky Progression:** The pinned left-column storytelling sequence allows visitors to absorb deep technical capability without disorientation.
4. **Interactive Glassmorphism:** Subtle top-inset borders and muted ambient glows prevent the dark mode from feeling flat or sterile.
