/**
 * VisualStoryExperience.tsx — 8-Stage Cinematic Scroll Experience for DataFix.
 *
 * Implements the full Afundi-inspired 8-stage visual product demonstration:
 *   Stage 01: Ingest Ledger & Data Provenance (Read-only sandbox)
 *   Stage 02: Coordinate Anomaly Scanner & Heatmap Grid
 *   Stage 03: Root-Cause Forensic Diagnostic Dossier
 *   Stage 04: Tri-Branch Governance Protocol (Auto / Approval / Refused)
 *   Stage 05: Transformation Simulation Workbench (Non-destructive diffs)
 *   Stage 06: Human-in-the-Loop Governance Console (Interactive approval)
 *   Stage 07: Post-Repair Invariant Precision Calipers (Deterministic checks)
 *   Stage 08: Certified Cryptographic Truth Ledger (Verified audit proof)
 *
 * All stage metrics and text render as live React HTML.
 * Reads data through the normalized `StoryDataAdapter` boundary.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { STORY_ASSETS } from './data/storyAssets';
import type { StoryDataAdapter } from './adapters/types';
import { sampleStoryAdapter } from './adapters/sampleStoryAdapter';

// Register GSAP plugins once
gsap.registerPlugin(ScrollTrigger, useGSAP);

interface VisualStoryExperienceProps {
  adapter?: StoryDataAdapter;
  isDuplicateApproved: boolean;
  onToggleApproval: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onExit?: () => void;
}

export const VisualStoryExperience: React.FC<VisualStoryExperienceProps> = ({
  adapter = sampleStoryAdapter,
  isDuplicateApproved,
  onToggleApproval,
  theme = 'light',
  onToggleTheme,
  onExit,
}) => {
  const [activeStage, setActiveStage] = useState<number>(1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pinTrackRef = useRef<HTMLDivElement | null>(null);
  const imageStageRef = useRef<HTMLDivElement | null>(null);
  const textStageRef = useRef<HTMLDivElement | null>(null);
  const stepTriggerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isNavigatingRef = useRef<boolean>(false);
  const navTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get normalized data snapshot from adapter
  const snapshot = adapter.getSnapshot(isDuplicateApproved);
  const { meta, sampleRows, diagnoses, proposals, simulationDiffs, workingCopy, checks, proof } = snapshot;

  const currentMeta = STORY_ASSETS.find((s) => s.id === activeStage) ?? STORY_ASSETS[0];

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  useEffect(() => {
    return () => {
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Intelligent adjacent scene preloading for silky-smooth transitions
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const preload = (src: string) => {
      const img = new Image();
      img.src = src;
    };
    const nextMeta = STORY_ASSETS.find((s) => s.id === activeStage + 1);
    if (nextMeta?.image) preload(nextMeta.image);
    const prevMeta = STORY_ASSETS.find((s) => s.id === activeStage - 1);
    if (prevMeta?.image) preload(prevMeta.image);
  }, [activeStage]);

  /**
   * GSAP ScrollTrigger Integration — Desktop Pinned Scroll
   */
  useGSAP(
    () => {
      if (typeof window === 'undefined') return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          isDesktop: '(min-width: 1024px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { isDesktop, reduceMotion: isReduced } = context.conditions as {
            isDesktop: boolean;
            reduceMotion: boolean;
          };

          if (!isDesktop || isReduced) return;

          const containerEl = containerRef.current;
          if (!containerEl) return;

          const st = ScrollTrigger.create({
            id: 'v3-story-scroll',
            trigger: containerEl,
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
              if (isNavigatingRef.current) return;
              const stage = Math.min(8, Math.max(1, Math.floor(self.progress * 8) + 1));
              setActiveStage((prev) => (prev !== stage ? stage : prev));
            },
          });

          return () => {
            st.kill();
          };
        },
      );

      return () => mm.revert();
    },
    { scope: containerRef },
  );

  /**
   * Stage Entry & Transition Animations
   */
  useGSAP(
    () => {
      const imgEl = imageStageRef.current?.querySelector('.v3-active-artwork');
      const textEl = textStageRef.current;

      if (reducedMotion) {
        if (imgEl) gsap.set(imgEl, { clearProps: 'all', opacity: 1, scale: 1 });
        if (textEl?.children) gsap.set(textEl.children, { clearProps: 'all', opacity: 1, y: 0 });
        return;
      }

      if (imgEl) {
        switch (currentMeta.transitionType) {
          case 'expand-reveal':
            gsap.fromTo(
              imgEl,
              { scale: 0.90, opacity: 0.2, filter: 'blur(8px)' },
              { scale: 1, opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power3.out' },
            );
            break;
          case 'horizontal-clip':
            gsap.fromTo(
              imgEl,
              { clipPath: 'polygon(0 0, 0 0, 0 100%, 0 100%)', scale: 1.05 },
              { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)', scale: 1, duration: 0.65, ease: 'power2.inOut' },
            );
            break;
          case 'exploded-depth':
            gsap.fromTo(
              imgEl,
              { y: 30, scale: 0.93, opacity: 0.4 },
              { y: 0, scale: 1, opacity: 1, duration: 0.58, ease: 'back.out(1.4)' },
            );
            break;
          case 'trifurcation-branch':
            gsap.fromTo(
              imgEl,
              { clipPath: 'circle(15% at 50% 50%)', opacity: 0.5 },
              { clipPath: 'circle(80% at 50% 50%)', opacity: 1, duration: 0.62, ease: 'power2.out' },
            );
            break;
          case 'bilateral-atrium':
            gsap.fromTo(
              imgEl,
              { x: -20, opacity: 0.3, scale: 0.97 },
              { x: 0, opacity: 1, scale: 1, duration: 0.55, ease: 'power3.out' },
            );
            break;
          case 'three-portal-gate':
            gsap.fromTo(
              imgEl,
              { y: -25, opacity: 0.4, scale: 0.96 },
              { y: 0, opacity: 1, scale: 1, duration: 0.58, ease: 'power3.out' },
            );
            break;
          case 'cardinal-caliper':
            gsap.fromTo(
              imgEl,
              { scale: 1.08, opacity: 0.3 },
              { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out' },
            );
            break;
          case 'radial-audit-orbit':
            gsap.fromTo(
              imgEl,
              { scale: 0.92, rotate: -2, opacity: 0.3 },
              { scale: 1, rotate: 0, opacity: 1, duration: 0.65, ease: 'power3.out' },
            );
            break;
        }
      }

      if (textEl) {
        gsap.fromTo(
          textEl.children,
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.06, ease: 'power2.out' },
        );
      }
    },
    {
      dependencies: [activeStage, reducedMotion],
      scope: containerRef,
      revertOnUpdate: true,
    },
  );

  const handleSelectStage = useCallback((stageNum: number) => {
    setActiveStage(stageNum);
    isNavigatingRef.current = true;
    if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current);
    navTimeoutRef.current = setTimeout(() => {
      isNavigatingRef.current = false;
    }, 800);

    const containerEl = containerRef.current;
    if (containerEl && typeof window !== 'undefined' && window.innerWidth >= 1024) {
      const containerRect = containerEl.getBoundingClientRect();
      const currentScrollY = window.scrollY || window.pageYOffset;
      const containerTop = currentScrollY + containerRect.top;
      const totalScrollable = containerEl.offsetHeight - window.innerHeight;

      if (totalScrollable > 0) {
        const stageRatio = (stageNum - 0.5) / STORY_ASSETS.length;
        const targetY = containerTop + stageRatio * totalScrollable;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }
    }
  }, []);

  return (
    <section
      ref={containerRef}
      className="v3-cinematic-section"
      aria-label="DataFix 8-Stage Cinematic Scroll Experience"
      data-testid="walkthrough-cinematic-section"
    >
      {/* 1. Invisible Scroll Triggers (8 viewport-height steps) */}
      <div className="v3-scroll-track" aria-hidden="true">
        {STORY_ASSETS.map((stage, idx) => (
          <div
            key={stage.id}
            ref={(el) => {
              stepTriggerRefs.current[idx] = el;
            }}
            className="v3-scroll-step"
            data-stage={stage.id}
          />
        ))}
      </div>

      {/* 2. Pinned Showcase Viewport */}
      <div ref={pinTrackRef} className="v3-showcase-viewport">
        {/* Top Control Bar: Stage Navigator & Controls */}
        <div className="v3-top-bar">
          <div className="v3-top-brand">
            <span className="v3-brand-badge">STAGE {currentMeta.stageNum} / 08</span>
            <span className="v3-brand-phase">{currentMeta.phase}</span>
          </div>

          <div className="v3-top-stepper" role="tablist" aria-label="Stages">
            {STORY_ASSETS.map((stage) => {
              const isActive = activeStage === stage.id;
              return (
                <button
                  key={stage.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`v3-step-dot ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleSelectStage(stage.id)}
                  title={`Stage ${stage.id}: ${stage.title}`}
                  data-testid={`stage-tab-${stage.id}`}
                >
                  <span className="v3-dot-num">{stage.stageNum}</span>
                  <span className="v3-dot-indicator" />
                </button>
              );
            })}
          </div>

          <div className="v3-top-controls">
            {onToggleTheme && (
              <button
                type="button"
                className="df-theme-toggle v3-theme-toggle"
                onClick={onToggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                data-testid="walkthrough-theme-toggle"
              >
                {theme === 'dark' ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                    <span>Dark</span>
                  </>
                )}
              </button>
            )}

            {onExit && (
              <button
                type="button"
                className="v3-theme-toggle"
                onClick={onExit}
                title="Exit walkthrough and return to DataFix workspace"
                data-testid="walkthrough-exit-button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid var(--df-surface-border-strong)',
                  background: 'var(--df-surface-white)',
                  color: 'var(--df-text-heading)',
                }}
              >
                <span>← Exit</span>
              </button>
            )}

            <div className="v3-provenance-tag">
              <span className="v3-prov-dot" aria-hidden="true" />
              <span>{meta.provenanceLabel}</span>
            </div>
          </div>
        </div>

        {/* Main Split Grid: Artwork Canvas + Live HTML Story Card */}
        <div className="v3-showcase-grid">
          {/* LEFT: Dominant 2.5D Artwork Canvas */}
          <div ref={imageStageRef} className="v3-artwork-frame">
            <div className="v3-artwork-wrapper">
              <img
                key={currentMeta.id}
                src={currentMeta.image}
                alt={currentMeta.alt}
                className="v3-active-artwork"
                loading="eager"
                data-testid={`stage-artwork-${currentMeta.id}`}
              />
              <div className="v3-artwork-shadow" aria-hidden="true" />
              <div className="v3-transition-pill" aria-hidden="true">
                <span>Transition: {currentMeta.transitionType}</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Live Editorial & Data Intelligence Pane */}
          <div ref={textStageRef} className="v3-narrative-frame">
            <div className="v3-narrative-header">
              <span className="v3-stage-eyebrow">
                {currentMeta.stageNum} · {currentMeta.subtitle}
              </span>
              <h2 className="v3-stage-title">{currentMeta.title}</h2>
              <p className="v3-stage-summary">{currentMeta.summary}</p>
            </div>

            {/* DYNAMIC LIVE HTML DATA MODULES ACCORDING TO STAGE */}
            <div className="v3-live-module" aria-live="polite">
              {/* STAGE 1: Intake Sandbox Metadata & Specimen Ledger */}
              {activeStage === 1 && (
                <div className="v3-data-card v3-card-ingest" data-testid="stage-card-1">
                  <div className="v3-card-top">
                    <div className="v3-card-docket">
                      <span className="v3-docket-tag">[ RECORD // STAGE 01 ]</span>
                      <h3 className="v3-card-heading-serif">Raw Ingest Ledger &amp; Data Provenance</h3>
                    </div>
                    <span className="v3-chip is-locked">● {meta.sourceMode}</span>
                  </div>

                  {/* Stat Ribbon with Petrona Numerals */}
                  <div className="v3-stats-row">
                    <div className="v3-stat-box">
                      <span className="v3-stat-num">{meta.sampleRowsCount}</span>
                      <span className="v3-stat-lbl">Records Preserved</span>
                    </div>
                    <div className="v3-stat-box">
                      <span className="v3-stat-num">{meta.sampleColumnsCount}</span>
                      <span className="v3-stat-lbl">Data Attributes</span>
                    </div>
                    <div className="v3-stat-box is-highlight">
                      <span className="v3-stat-num">{meta.totalSampleCells}</span>
                      <span className="v3-stat-lbl">Frozen Memory Cells</span>
                    </div>
                  </div>

                  {/* Authentic CSV Specimen Ledger View */}
                  <div className="v3-specimen-ledger">
                    <div className="v3-ledger-topbar">
                      <span className="v3-ledger-title">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <span>{meta.fileName}</span>
                      </span>
                      <span className="v3-ledger-hash">SHA-256: 7d4a9c8b...e01f</span>
                    </div>
                    <div className="v3-specimen-table-wrap">
                      <table className="v3-specimen-table">
                        <thead>
                          <tr>
                            <th>Row</th>
                            <th>order_id</th>
                            <th>order_date</th>
                            <th>customer</th>
                            <th>amount</th>
                            <th>tax_id</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sampleRows.slice(0, 4).map((row) => (
                            <tr key={row.rowId}>
                              <td className="v3-cell-mono v3-cell-idx">{row.rowId}</td>
                              <td className="v3-cell-mono">
                                {row.rowId === 'R-104' ? (
                                  <span className="v3-dirty-tag is-dup" title="Duplicate key">ORD-8842 ⇄</span>
                                ) : (
                                  row.orderId
                                )}
                              </td>
                              <td className="v3-cell-mono">
                                {row.rowId === 'R-102' ? (
                                  <span className="v3-dirty-tag is-date" title="Non-ISO date">14/09/2026</span>
                                ) : (
                                  row.orderDate
                                )}
                              </td>
                              <td>
                                {row.rowId === 'R-102' ? (
                                  <span className="v3-dirty-tag is-str" title="Untrimmed whitespace">&quot;  Meridian Supply Co &quot;</span>
                                ) : (
                                  row.customer
                                )}
                              </td>
                              <td className="v3-cell-mono">
                                {row.rowId === 'R-102' ? (
                                  <span className="v3-dirty-tag is-amt" title="Currency symbol string">USD 890.5</span>
                                ) : (
                                  row.amount
                                )}
                              </td>
                              <td className="v3-cell-mono">
                                {row.rowId === 'R-103' ? (
                                  <span className="v3-dirty-tag is-null" title="Missing identifier">NULL</span>
                                ) : (
                                  row.taxId
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="v3-card-footer-note">
                    <span className="v3-fnote-icon">🔒</span>
                    <span>Source data remains strictly immutable. Zero mutations are written to original memory buffer.</span>
                  </div>
                </div>
              )}

              {/* STAGE 2: Spatial Coordinate Anomaly Scanner & Heatmap Grid */}
              {activeStage === 2 && (
                <div className="v3-data-card v3-card-detect" data-testid="stage-card-2">
                  <div className="v3-card-top">
                    <div className="v3-card-docket">
                      <span className="v3-docket-tag">[ SCAN // STAGE 02 ]</span>
                      <h3 className="v3-card-heading-serif">Spatial Coordinate Anomaly Scanner</h3>
                    </div>
                    <span className="v3-chip is-alert">● {meta.totalDetectedIssues} ANOMALIES ISOLATED</span>
                  </div>

                  {/* Tactile 6x5 Spatial Anomaly Grid Matrix */}
                  <div className="v3-matrix-container">
                    <div className="v3-matrix-header-row">
                      <span className="v3-matrix-hdr-cell is-idx">ROW</span>
                      <span className="v3-matrix-hdr-cell">order_id</span>
                      <span className="v3-matrix-hdr-cell">order_date</span>
                      <span className="v3-matrix-hdr-cell">customer</span>
                      <span className="v3-matrix-hdr-cell">amount</span>
                      <span className="v3-matrix-hdr-cell">tax_id</span>
                    </div>

                    <div className="v3-matrix-rows">
                      <div className="v3-matrix-row">
                        <span className="v3-matrix-row-lbl">R-101</span>
                        <span className="v3-matrix-cell is-clean" title="Clean ID">●</span>
                        <span className="v3-matrix-cell is-clean" title="Clean Date">●</span>
                        <span className="v3-matrix-cell is-clean" title="Clean Customer">●</span>
                        <span className="v3-matrix-cell is-clean" title="Clean Amount">●</span>
                        <span className="v3-matrix-cell is-clean" title="Clean Tax ID">●</span>
                      </div>

                      <div className="v3-matrix-row is-flagged">
                        <span className="v3-matrix-row-lbl">R-102</span>
                        <span className="v3-matrix-cell is-clean" title="Clean ID">●</span>
                        <span className="v3-matrix-cell is-anomaly is-date" title="R-102 Date: Non-ISO format">NON-ISO</span>
                        <span className="v3-matrix-cell is-anomaly is-pad" title="R-102 Customer: Padding whitespace">PADDING</span>
                        <span className="v3-matrix-cell is-anomaly is-cur" title="R-102 Amount: Currency prefix">CURRENCY</span>
                        <span className="v3-matrix-cell is-clean" title="Clean Tax ID">●</span>
                      </div>

                      <div className="v3-matrix-row is-flagged">
                        <span className="v3-matrix-row-lbl">R-103</span>
                        <span className="v3-matrix-cell is-clean" title="Clean ID">●</span>
                        <span className="v3-matrix-cell is-clean" title="Clean Date">●</span>
                        <span className="v3-matrix-cell is-clean" title="Clean Customer">●</span>
                        <span className="v3-matrix-cell is-clean" title="Clean Amount">●</span>
                        <span className="v3-matrix-cell is-anomaly is-missing" title="R-103 Tax ID: NULL missing">MISSING</span>
                      </div>

                      <div className="v3-matrix-row is-flagged">
                        <span className="v3-matrix-row-lbl">R-104</span>
                        <span className="v3-matrix-cell is-anomaly is-dup" title="R-104 ID: Duplicate key ORD-8842">DUPLICATE</span>
                        <span className="v3-matrix-cell is-clean" title="Clean Date">●</span>
                        <span className="v3-matrix-cell is-clean" title="Clean Customer">●</span>
                        <span className="v3-matrix-cell is-clean" title="Clean Amount">●</span>
                        <span className="v3-matrix-cell is-clean" title="Clean Tax ID">●</span>
                      </div>

                      <div className="v3-matrix-row is-flagged">
                        <span className="v3-matrix-row-lbl">R-105</span>
                        <span className="v3-matrix-cell is-clean" title="Clean ID">●</span>
                        <span className="v3-matrix-cell is-anomaly is-date" title="R-105 Date: Non-ISO format">NON-ISO</span>
                        <span className="v3-matrix-cell is-clean" title="Clean Customer">●</span>
                        <span className="v3-matrix-cell is-clean" title="Clean Amount">●</span>
                        <span className="v3-matrix-cell is-clean" title="Clean Tax ID">●</span>
                      </div>

                      <div className="v3-matrix-row">
                        <span className="v3-matrix-row-lbl">R-106</span>
                        <span className="v3-matrix-cell is-clean" title="Clean ID">●</span>
                        <span className="v3-matrix-cell is-clean" title="Clean Date">●</span>
                        <span className="v3-matrix-cell is-clean" title="Clean Customer">●</span>
                        <span className="v3-matrix-cell is-clean" title="Clean Amount">●</span>
                        <span className="v3-matrix-cell is-clean" title="Clean Tax ID">●</span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Categorical Fault Dossier Cards */}
                  <div className="v3-anomaly-summary-grid">
                    <div className="v3-anomaly-card is-missing">
                      <div className="v3-anom-num">1×</div>
                      <div className="v3-anom-desc">
                        <strong>Missing Tax ID</strong>
                        <span>R-103 NULL customer_tax_id</span>
                      </div>
                    </div>
                    <div className="v3-anomaly-card is-dup">
                      <div className="v3-anom-num">1×</div>
                      <div className="v3-anom-desc">
                        <strong>Duplicate Primary Key</strong>
                        <span>R-104 collision on ORD-8842</span>
                      </div>
                    </div>
                    <div className="v3-anomaly-card is-date">
                      <div className="v3-anom-num">2×</div>
                      <div className="v3-anom-desc">
                        <strong>Malformed Dates</strong>
                        <span>R-102 (DD/MM) &amp; R-105 (MM-DD)</span>
                      </div>
                    </div>
                    <div className="v3-anomaly-card is-format">
                      <div className="v3-anom-num">2×</div>
                      <div className="v3-anom-desc">
                        <strong>Inconsistent Formats</strong>
                        <span>R-102 whitespace &amp; USD symbol</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 3: Multi-Layered Forensic Diagnostic Dossier */}
              {activeStage === 3 && (
                <div className="v3-data-card v3-card-diagnose" data-testid="stage-card-3">
                  <div className="v3-card-top">
                    <div className="v3-card-docket">
                      <span className="v3-docket-tag">[ INVESTIGATION // STAGE 03 ]</span>
                      <h3 className="v3-card-heading-serif">Root Cause Forensic Dossier</h3>
                    </div>
                    <span className="v3-chip is-info">● DETERMINISTIC INFERENCE</span>
                  </div>

                  <div className="v3-dossier-deck">
                    {diagnoses.map((d) => (
                      <div key={d.id} className={`v3-dossier-card is-${d.column.includes('date') ? 'date' : d.column.includes('tax') ? 'missing' : d.column.includes('order_id') ? 'dup' : 'format'}`}>
                        <div className="v3-dossier-top">
                          <span className="v3-dossier-num">CASE {d.num}</span>
                          <span className="v3-dossier-tag">{d.column}</span>
                        </div>
                        <h4 className="v3-dossier-title">{d.issueSummary}</h4>
                        <p className="v3-dossier-body">{d.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STAGE 4: Tri-Branch Governance Protocol */}
              {activeStage === 4 && (
                <div className="v3-data-card v3-card-propose" data-testid="stage-card-4">
                  <div className="v3-card-top">
                    <div className="v3-card-docket">
                      <span className="v3-docket-tag">[ GOVERNANCE // STAGE 04 ]</span>
                      <h3 className="v3-card-heading-serif">Tri-Branch Governance Protocol</h3>
                    </div>
                    <span className="v3-chip is-amber">● STRICT SAFETY GATING</span>
                  </div>

                  <div className="v3-chamber-deck">
                    {proposals.map((prop) => (
                      <div key={prop.id} className={`v3-chamber-card is-${prop.badgeType === 'auto' ? 'emerald' : prop.badgeType === 'approval' ? 'amber' : 'violet'}`}>
                        <div className="v3-chamber-top">
                          <span className={`v3-chamber-badge is-${prop.badgeType}`}>{prop.badgeText}</span>
                          <span className="v3-chamber-scope">{prop.scopeText}</span>
                        </div>
                        <h4 className="v3-chamber-title">{prop.title}</h4>
                        <p className="v3-chamber-desc">{prop.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STAGE 5: Transformation Simulation Workbench */}
              {activeStage === 5 && (
                <div className="v3-data-card v3-card-simulate" data-testid="stage-card-5">
                  <div className="v3-card-top">
                    <div className="v3-card-docket">
                      <span className="v3-docket-tag">[ WORKBENCH // STAGE 05 ]</span>
                      <h3 className="v3-card-heading-serif">Transformation Simulation Workbench</h3>
                    </div>
                    <span className="v3-chip is-neutral">● PREVIEW ONLY · ZERO MUTATIONS</span>
                  </div>

                  <div className="v3-workbench-table">
                    <div className="v3-wbench-header">
                      <span>LOCATION</span>
                      <span>ORIGINAL SOURCE SPECIMEN</span>
                      <span>SIMULATED TARGET (PROPOSED)</span>
                    </div>

                    <div className="v3-wbench-rows">
                      {simulationDiffs.slice(0, 4).map((d) => (
                        <div key={d.rowId + d.column} className="v3-wbench-row">
                          <span className="v3-wbench-cell is-loc">{d.rowId} · {d.column}</span>
                          <span className="v3-wbench-cell is-orig"><del>{d.original}</del></span>
                          <span className="v3-wbench-cell is-prop"><ins>{d.proposed}</ins></span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="v3-staging-status-grid">
                    <div className="v3-sstatus-pill is-pending">
                      <span className="v3-sdot is-amber" />
                      <span>Staging Hold: Duplicate ORD-8842 consolidation paused for Gate 06</span>
                    </div>
                    <div className="v3-sstatus-pill is-refused">
                      <span className="v3-sdot is-violet" />
                      <span>Refusal Upheld: R-103 customer_tax_id remains NULL (Zero-Fabrication)</span>
                    </div>
                  </div>

                  <p className="v3-card-footnote">
                    No data is mutated in simulation. The original memory buffer remains 100% frozen.
                  </p>
                </div>
              )}

              {/* STAGE 6: Human-in-the-Loop Governance Console */}
              {activeStage === 6 && (
                <div className="v3-data-card v3-card-gate" data-testid="stage-card-6">
                  <div className="v3-card-top">
                    <div className="v3-card-docket">
                      <span className="v3-docket-tag">[ CONTROLLER // STAGE 06 ]</span>
                      <h3 className="v3-card-heading-serif">Human-in-the-Loop Governance Console</h3>
                    </div>
                    <span className="v3-chip is-working">
                      ● WORKING COPY: <strong>{workingCopy.rowCount} ROWS</strong>
                    </span>
                  </div>

                  <div className="v3-console-deck">
                    <div className="v3-console-header">
                      <span className="v3-console-tag">▲ IRREVERSIBLE MUTATION GUARD</span>
                      <span className="v3-console-state">
                        {isDuplicateApproved ? '✓ CONSOLIDATED (5 ROWS)' : '⏸ AWAITING SIGN-OFF (6 ROWS)'}
                      </span>
                    </div>

                    <div className="v3-console-body">
                      <h4 className="v3-console-title">Merge Duplicate Order ORD-8842 (R-104 into R-102)</h4>
                      <p className="v3-console-desc">
                        Deduplication permanently purges duplicate transaction R-104 and reconciles customer naming differences. Because record deletion is irreversible, this action cannot be auto-applied.
                      </p>

                      <button
                        type="button"
                        className={`v3-btn-gate ${isDuplicateApproved ? 'is-active-reset' : 'is-active-approve'}`}
                        onClick={onToggleApproval}
                        aria-pressed={isDuplicateApproved}
                        data-testid="stage-approval-toggle"
                      >
                        {isDuplicateApproved ? (
                          <>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                            <span>Reset Decision (Restore 6 Rows)</span>
                          </>
                        ) : (
                          <>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
                            <span>Approve Duplicate Consolidation (Commit 5 Rows)</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="v3-console-lanes">
                      <div className="v3-clane is-emerald">
                        <span className="v3-clane-dot" />
                        <span>Emerald Lane: 4 safe formatting repairs written to working copy</span>
                      </div>
                      <div className="v3-clane is-violet">
                        <span className="v3-clane-dot" />
                        <span>Violet Lane: R-103 NULL preserved (Zero-Fabrication Mandate enforced)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STAGE 7: Invariant Precision Verification Calipers */}
              {activeStage === 7 && (
                <div className="v3-data-card v3-card-verify" data-testid="stage-card-7">
                  <div className="v3-card-top">
                    <div className="v3-card-docket">
                      <span className="v3-docket-tag">[ INVARIANTS // STAGE 07 ]</span>
                      <h3 className="v3-card-heading-serif">Post-Repair Invariant Precision Calipers</h3>
                    </div>
                    <span className="v3-chip is-pass">● 4 CALIPERS ENGAGED</span>
                  </div>

                  <div className="v3-caliper-grid">
                    {checks.map((chk) => (
                      <div key={chk.id} className="v3-caliper-card">
                        <div className="v3-caliper-topbar">
                          <span className="v3-caliper-id">{chk.id.toUpperCase()}</span>
                          <span className={`v3-caliper-badge is-${chk.result}`}>
                            {chk.result === 'passed' ? 'PASS' : 'GUARDED'}
                          </span>
                        </div>
                        <h4 className="v3-caliper-name">{chk.label}</h4>
                        <div className="v3-caliper-gauge">
                          <div
                            className={`v3-gauge-bar is-${chk.result}`}
                            style={{ width: chk.result === 'passed' ? '100%' : '65%' }}
                          />
                        </div>
                        <p className="v3-caliper-outcome">{chk.outcomeText}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STAGE 8: Certified Cryptographic Truth Ledger & Proof */}
              {activeStage === 8 && (
                <div className="v3-data-card v3-card-proof" data-testid="stage-card-8">
                  <div className="v3-card-top">
                    <div className="v3-card-docket">
                      <span className="v3-docket-tag">[ CERTIFICATE // STAGE 08 ]</span>
                      <h3 className="v3-card-heading-serif">Certified Cryptographic Truth Ledger</h3>
                    </div>
                    <span className="v3-chip is-proof">● RUN #DF-2024-09 VERIFIED</span>
                  </div>

                  <div className="v3-proof-hero">
                    <div className="v3-proof-ring">
                      <span className="v3-proof-pct">{proof.currentScore}%</span>
                      <span className="v3-proof-sub">{proof.cleanCells}/{proof.totalCells} Cells Clean</span>
                    </div>

                    <div className="v3-proof-metrics-grid">
                      <div className="v3-proof-box">
                        <span className="v3-pbox-num is-green">{proof.baselineScore}% → {proof.currentScore}%</span>
                        <span className="v3-pbox-lbl">Quality Gain</span>
                      </div>
                      <div className="v3-proof-box">
                        <span className="v3-pbox-num is-green">+{proof.cleanCells - 24} Clean Cells</span>
                        <span className="v3-pbox-lbl">Deterministic Delta</span>
                      </div>
                      <div className="v3-proof-box">
                        <span className="v3-pbox-num is-green">{proof.baselineIssues} → {proof.remainingIssues}</span>
                        <span className="v3-pbox-lbl">Issues Remaining</span>
                      </div>
                      <div className="v3-proof-box">
                        <span className="v3-pbox-num is-green">{proof.resolvedIssues} of {proof.baselineIssues}</span>
                        <span className="v3-pbox-lbl">Repairs Completed</span>
                      </div>
                      <div className="v3-proof-box">
                        <span className="v3-pbox-num is-neutral">{workingCopy.rowCount} Rows</span>
                        <span className="v3-pbox-lbl">Working State</span>
                      </div>
                    </div>
                  </div>

                  <div className="v3-proof-hash-strip">
                    <span className="v3-phash-label">CRYPTOGRAPHIC ATTESTATION:</span>
                    <span className="v3-phash-val">SHA-256: 7d4a9c8b3e5f2a10c49089ef23b71ad0e01f2a33</span>
                  </div>

                  <p className="v3-card-footnote">
                    Source cell cleanliness improved from {proof.baselineScore}% to {proof.currentScore}% across fixed {proof.totalCells} cells. All mutations derived deterministically. Zero synthetic data hallucinated.
                  </p>
                </div>
              )}
            </div>

            {/* Stage Navigation Stepper & Controls */}
            <div className="v3-nav-actions">
              <button
                type="button"
                className="v3-nav-btn"
                disabled={activeStage === 1}
                onClick={() => handleSelectStage(Math.max(1, activeStage - 1))}
                aria-label="Previous stage"
                data-testid="stage-prev-btn"
              >
                ← Previous
              </button>
              <div className="v3-nav-stepper">
                <span className="v3-nav-counter">
                  Stage <strong>{activeStage}</strong> of {STORY_ASSETS.length}
                </span>
                <div className="v3-nav-mini-track" role="tablist" aria-label="Quick jump stages">
                  {STORY_ASSETS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="tab"
                      aria-label={`Jump to stage ${s.id}: ${s.title}`}
                      aria-selected={s.id === activeStage}
                      className={`v3-mini-track-dot ${s.id === activeStage ? 'is-active' : (s.id < activeStage ? 'is-passed' : '')}`}
                      onClick={() => handleSelectStage(s.id)}
                    />
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="v3-nav-btn is-next"
                disabled={activeStage === STORY_ASSETS.length}
                onClick={() => handleSelectStage(Math.min(STORY_ASSETS.length, activeStage + 1))}
                aria-label="Next stage"
                data-testid="stage-next-btn"
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
