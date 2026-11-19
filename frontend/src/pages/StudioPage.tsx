import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldBan,
  Check,
  X,
  ArrowRight,
  Search,
  FlaskConical,
  ArrowLeft,
  Layers,
} from 'lucide-react';
import { useRun } from '../app/context/RunContext';
import { useRouter } from '../app/routes';
import type { GateDecisionType, RepairProposal, CellDiff, InvariantResult } from '../lib/contract-types';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';

export const StudioPage: React.FC = () => {
  const { currentRun, counts, updateDecision, applyPlan, loadDemoFixture, isDemoFixture } = useRun();
  const { navigate, routeState } = useRouter();

  // Lane filter from query or state
  const initialLane = (routeState.params?.lane as GateDecisionType | 'all') || 'all';
  const [activeLane, setActiveLane] = useState<GateDecisionType | 'all'>(initialLane);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(
    routeState.params?.proposal || currentRun?.proposals[0]?.id || null
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showOverrideExplainer, setShowOverrideExplainer] = useState(false);
  const [showPlanDrawer, setShowPlanDrawer] = useState(false);
  const [mobileView, setMobileView] = useState<'queue' | 'dossier'>('queue');

  // Sync state with URL hash parameters when deep linking or clicking Safety Ribbon
  useEffect(() => {
    if (routeState.params?.lane) {
      setActiveLane(routeState.params.lane as GateDecisionType | 'all');
    }
    if (routeState.params?.proposal) {
      setSelectedProposalId(routeState.params.proposal);
      setMobileView('dossier');
    }
  }, [routeState.params?.lane, routeState.params?.proposal]);

  if (!currentRun) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">No active run loaded</h2>
        <p className="text-sm text-slate-500">Upload a dataset first to review repair proposals.</p>
        <Button onClick={() => navigate('/app')}>Go to Intake</Button>
      </div>
    );
  }

  // If real run has no proposals yet (backend analyze is upcoming milestone)
  if (currentRun.proposals.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-6 text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
          <ShieldCheck className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-slate-900">Dataset Profiled Successfully</h2>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            The dataset has been profiled by deterministic Pandas code ({currentRun.profile.row_count} rows,{' '}
            {currentRun.profile.missing_cells} missing cells). The automated issue detection & repair hypothesis
            engine is currently in development by Teammate 3.
          </p>
        </div>

        <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto space-y-3">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wide">
            Design Specification Walkthrough
          </div>
          <p className="text-xs text-slate-600">
            Preview DataFix's three-lane Repair Studio with interactive Auto-apply, Needs approval, and Guardian
            Refusal lanes:
          </p>
          <Button
            variant="guard"
            onClick={() => {
              loadDemoFixture();
              setSelectedProposalId('prop_ref_1');
            }}
            icon={<FlaskConical className="w-4 h-4" />}
          >
            Load Studio Walkthrough Fixture
          </Button>
        </div>
      </div>
    );
  }

  // Filter proposals
  const proposals = currentRun.proposals.filter((p: RepairProposal) => {
    const matchesLane = activeLane === 'all' || p.decision === activeLane;
    const matchesSearch =
      searchQuery === '' ||
      p.column.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLane && matchesSearch;
  });

  const selectedProposal =
    currentRun.proposals.find((p: RepairProposal) => p.id === selectedProposalId) || proposals[0] || currentRun.proposals[0];

  const handleApply = async () => {
    await applyPlan();
    navigate(`/runs/${currentRun.run_id}/proof`);
  };

  const handleSelectProposal = (id: string) => {
    setSelectedProposalId(id);
    setMobileView('dossier');
  };

  const renderProposalBadge = (prop: RepairProposal, size: 'sm' | 'md' = 'sm') => {
    if (prop.decision === 'auto_apply') {
      return (
        <Badge variant="auto_apply" size={size}>
          Auto-apply
        </Badge>
      );
    }
    if (prop.decision === 'refused') {
      return (
        <Badge variant="refused" size={size}>
          {size === 'md' ? 'Refused: Zero-damage Guarantee' : 'Refused'}
        </Badge>
      );
    }
    // prop.decision === 'needs_approval'
    if (prop.user_action === 'approved') {
      return (
        <Badge variant="user_approved" size={size}>
          {size === 'md' ? 'Needs approval · User approved' : 'User approved'}
        </Badge>
      );
    }
    if (prop.user_action === 'rejected') {
      return (
        <Badge variant="user_rejected" size={size}>
          {size === 'md' ? 'Needs approval · User rejected' : 'User rejected'}
        </Badge>
      );
    }
    return (
      <Badge variant="pending_approval" size={size}>
        {size === 'md' ? 'Needs approval · Pending' : 'Pending approval'}
      </Badge>
    );
  };

  // Reusable Application Plan content
  const renderPlanContent = () => (
    <div className="space-y-6">
      <div>
        <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Application Plan</div>
        <h2 className="text-base font-bold text-slate-900 mt-1">Pending Execution</h2>
      </div>

      {isDemoFixture && (
        <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] font-mono text-amber-800">
          Notice: Viewing development fixture for design evaluation.
        </div>
      )}

      <div className="space-y-4 text-xs font-mono">
        <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
          <div className="text-emerald-900 font-semibold">Will Apply</div>
          <div className="text-slate-600">
            • {counts.auto} auto-apply
            <br />• {counts.userApproved} user approved
          </div>
          <div className="text-emerald-800 font-bold pt-1">
            {counts.willApplyCells} cells touched ({counts.willRemoveRows} rows removed)
          </div>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
          <div className="text-slate-700 font-semibold">Held Back / Refused</div>
          <div className="text-slate-500">
            • {counts.pendingApproval} pending approval
            {counts.userRejected > 0 && (
              <>
                <br />• {counts.userRejected} user rejected
              </>
            )}
            <br />• {counts.refused} refused (never applied)
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        Sums of independent previews. The combined effect will be verified against the untouched original upon apply.
      </p>

      <div className="pt-2">
        <Button
          variant="primary"
          className="w-full"
          onClick={handleApply}
          icon={<ArrowRight className="w-4 h-4 ml-1 order-last" />}
        >
          Apply Plan & Verify
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-2.5rem)] overflow-hidden bg-[#f9fafb]">
      <div className="flex flex-1 overflow-hidden relative">
        {/* PANEL 1: QUEUE (320px on desktop, full-width on mobile when active) */}
        <div
          className={`${
            mobileView === 'queue' ? 'flex' : 'hidden'
          } lg:flex w-full lg:w-80 bg-white border-r border-slate-200 flex-col shrink-0`}
        >
          {/* Lane Tabs */}
          <div className="p-3 border-b border-slate-200 bg-slate-50/60 space-y-2.5">
            <div className="grid grid-cols-4 gap-1 text-[11px] font-mono">
              <button
                onClick={() => setActiveLane('all')}
                className={`py-1.5 rounded text-center transition-colors ${
                  activeLane === 'all' ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({currentRun.proposals.length})
              </button>
              <button
                onClick={() => setActiveLane('auto_apply')}
                className={`py-1.5 rounded text-center transition-colors ${
                  activeLane === 'auto_apply'
                    ? 'bg-emerald-700 text-white font-semibold'
                    : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100'
                }`}
              >
                Auto ({counts.auto})
              </button>
              <button
                onClick={() => setActiveLane('needs_approval')}
                className={`py-1.5 rounded text-center transition-colors ${
                  activeLane === 'needs_approval'
                    ? 'bg-amber-600 text-white font-semibold'
                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                }`}
                title="Needs approval proposals"
              >
                Approval ({counts.approval})
              </button>
              <button
                onClick={() => setActiveLane('refused')}
                className={`py-1.5 rounded text-center transition-colors ${
                  activeLane === 'refused'
                    ? 'bg-indigo-700 text-white font-semibold'
                    : 'text-indigo-900 bg-indigo-50 hover:bg-indigo-100'
                }`}
              >
                Refused ({counts.refused})
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter column or op…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          {/* Proposals List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
            {proposals.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No proposals in this lane.</div>
            ) : (
              proposals.map((prop: RepairProposal) => {
                const isSelected = prop.id === selectedProposal?.id;
                const borderAccent =
                  prop.decision === 'auto_apply'
                    ? 'border-l-emerald-500'
                    : prop.decision === 'needs_approval'
                    ? 'border-l-amber-500'
                    : 'border-l-indigo-600';

                return (
                  <div
                    key={prop.id}
                    onClick={() => handleSelectProposal(prop.id)}
                    className={`p-3 rounded-lg border border-l-4 cursor-pointer transition-all ${borderAccent} ${
                      isSelected
                        ? 'bg-slate-50 border-slate-300 shadow-xs'
                        : 'bg-white border-transparent hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      {renderProposalBadge(prop, 'sm')}
                      <span className="text-[10px] font-mono text-slate-500 uppercase">{prop.source}</span>
                    </div>

                    <div className="text-xs font-semibold text-slate-900 line-clamp-1">{prop.title}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-1 flex items-center justify-between">
                      <span>{prop.column}</span>
                      <span>{prop.simulation?.cells_changed ?? 0} cells</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* PANEL 2: REPAIR DOSSIER (FLEX) */}
        <div
          className={`${
            mobileView === 'dossier' ? 'flex' : 'hidden'
          } lg:flex flex-1 bg-white overflow-y-auto border-r border-slate-200 flex-col min-w-0`}
        >
          {/* Mobile Back Button */}
          <div className="lg:hidden p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <button
              onClick={() => setMobileView('queue')}
              className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-700 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Proposal Queue</span>
            </button>
            <button
              onClick={() => setShowPlanDrawer(true)}
              className="flex items-center gap-1.5 text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Plan ({counts.auto + counts.userApproved})</span>
            </button>
          </div>

          {selectedProposal ? (
            <div className="flex-1 flex flex-col justify-between">
              <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 max-w-3xl">
                {/* Dossier Header */}
                <div
                  className={`p-4 sm:p-5 rounded-xl border ${
                    selectedProposal.decision === 'refused'
                      ? 'bg-indigo-50/70 border-indigo-200 guard-hatch-pattern'
                      : selectedProposal.decision === 'needs_approval'
                      ? 'bg-amber-50/60 border-amber-200'
                      : 'bg-emerald-50/60 border-emerald-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {renderProposalBadge(selectedProposal, 'md')}
                    <span className="text-xs font-mono text-slate-600">
                      Source: {selectedProposal.source} · Risk: {selectedProposal.risk_class}
                    </span>
                  </div>
                  <h1 className="font-serif text-lg sm:text-xl font-bold text-slate-900 mt-2">{selectedProposal.title}</h1>
                  <p className="text-xs text-slate-600 font-mono mt-1">
                    Reason: {selectedProposal.reasons[0] || selectedProposal.explanation}
                  </p>
                </div>

                {/* 1. What and Why */}
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    1. What and Why
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200/80">
                    {selectedProposal.explanation}
                  </p>
                </div>

                {/* 2. The Change (Before vs After Diff) */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    2. The Change (Preview)
                  </h3>
                  {selectedProposal.simulation?.sample_diff && selectedProposal.simulation.sample_diff.length > 0 ? (
                    <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 font-mono text-xs">
                      {selectedProposal.simulation.sample_diff.map((diff: CellDiff, i: number) => (
                        <div key={i} className="p-3 flex flex-wrap items-center justify-between gap-2 bg-slate-50/40">
                          <span className="text-slate-500">
                            Row {diff.row_id} · {diff.column}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="line-through text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                              {String(diff.before ?? '∅ null')}
                            </span>
                            <span className="text-slate-400">→</span>
                            <span className="text-sky-700 bg-sky-50 font-semibold px-2 py-0.5 rounded border border-sky-200">
                              {String(diff.after ?? '∅ null')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 italic">No cell diffs generated.</div>
                  )}
                </div>

                {/* 3. Blast Radius */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    3. Blast Radius Simulation
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-center">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-[11px] font-mono text-slate-500">Reach</div>
                      <div className="text-base font-bold text-slate-900 mt-0.5">
                        {selectedProposal.simulation?.cells_changed ?? 0} cells
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-[11px] font-mono text-slate-500">Collateral</div>
                      <div className="text-base font-bold text-emerald-600 mt-0.5">
                        {selectedProposal.simulation?.previously_valid_cells_changed ?? 0} valid
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-[11px] font-mono text-slate-500">Rows Removed</div>
                      <div className="text-base font-bold text-slate-900 mt-0.5">
                        {selectedProposal.simulation?.rows_removed ?? 0}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                      <div className="text-[11px] font-mono text-slate-500">Reversible</div>
                      <div className="text-xs font-semibold text-emerald-600 mt-1">Undoable</div>
                    </div>
                  </div>
                </div>

                {/* 4. Safety Invariants */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    4. Safety Check Invariants
                  </h3>
                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                    {selectedProposal.simulation?.invariants.map((inv: InvariantResult, idx: number) => (
                      <div key={idx} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {inv.status === 'pass' ? (
                            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-indigo-600 shrink-0" />
                          )}
                          <span className="font-medium text-slate-800">{inv.label}</span>
                        </div>
                        <span className="text-slate-500 font-mono text-[11px]">{inv.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Evidence & Confidence */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold">
                    5. Evidence & Confidence
                  </h3>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="text-slate-600">Method: {selectedProposal.confidence.method}</span>
                      <span className="font-semibold text-slate-900">
                        Confidence:{' '}
                        {selectedProposal.confidence.value !== null
                          ? `${Math.round(selectedProposal.confidence.value * 100)}%`
                          : 'Not provided (insufficient evidence)'}
                      </span>
                    </div>
                    {selectedProposal.confidence.caveat && (
                      <p className="text-[11px] text-slate-500 italic">{selectedProposal.confidence.caveat}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sticky Action Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 sticky bottom-0 z-10">
                {selectedProposal.decision === 'needs_approval' ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => updateDecision(selectedProposal.id, 'approved')}
                      icon={<Check className="w-4 h-4" />}
                    >
                      Approve repair
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => updateDecision(selectedProposal.id, 'rejected')}
                      icon={<X className="w-4 h-4" />}
                    >
                      Reject repair
                    </Button>
                    {selectedProposal.user_action === 'approved' ? (
                      <span className="text-xs font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                        Status: <strong>User approved</strong> (Will apply with plan)
                      </span>
                    ) : selectedProposal.user_action === 'rejected' ? (
                      <span className="text-xs font-mono text-rose-800 bg-rose-50 px-2.5 py-1 rounded border border-rose-200">
                        Status: <strong>User rejected</strong> (Held back from plan)
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                        Status: <strong>Pending approval</strong> (Awaiting decision)
                      </span>
                    )}
                  </div>
                ) : selectedProposal.decision === 'refused' ? (
                  <div className="flex flex-wrap items-center justify-between w-full text-xs gap-2">
                    <div className="text-indigo-900 font-medium flex items-center gap-2">
                      <ShieldBan className="w-4 h-4 text-indigo-600 shrink-0" />
                      <span>DataFix declined this repair to protect data integrity. Nothing was changed.</span>
                    </div>
                    <button
                      onClick={() => setShowOverrideExplainer(!showOverrideExplainer)}
                      className="text-indigo-700 hover:text-indigo-900 underline font-mono"
                    >
                      Why can't I override?
                    </button>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-800 font-medium flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Cleared by Safety Gate. Will apply automatically with the plan.</span>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {/* Override Modal */}
          {showOverrideExplainer && (
            <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-2xl max-w-md p-6 space-y-4 shadow-xl border border-slate-200">
                <h3 className="text-base font-bold text-slate-900">Why can't I override a refusal?</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Refused means DataFix could not make this change safely: either an integrity invariant failed, or the
                  evidence was too thin to guess a value without risking corruption.
                </p>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In this version, refusals are final so the audit log and verification proof can guarantee that every
                  applied change cleared safety gates. If you know the correct value, update the source data and re-run.
                </p>
                <div className="pt-2 text-right">
                  <Button size="sm" onClick={() => setShowOverrideExplainer(false)}>
                    Understood
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PANEL 3: APPLICATION PLAN (Visible on xl: 1280px and up) */}
        <div className="hidden xl:flex w-72 bg-white border-l border-slate-200 p-5 flex-col justify-between shrink-0 overflow-y-auto">
          {renderPlanContent()}
        </div>
      </div>

      {/* STICKY BOTTOM APPLY BAR (For screens < 1280px where Panel 3 is collapsed) */}
      <div className="xl:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs font-mono shrink-0 select-none z-20 shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-slate-400">Plan:</span>
          <span className="text-emerald-700 font-semibold">
            {counts.auto + counts.userApproved} will apply
          </span>
          <span className="text-slate-500 hidden sm:inline">
            ({counts.willApplyCells} cells touched)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPlanDrawer(true)}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded font-medium transition-colors"
          >
            View Plan
          </button>
          <button
            onClick={handleApply}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>Apply & Verify</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* PLAN SLIDE-OVER DRAWER (For mobile / tablet screens) */}
      {showPlanDrawer && (
        <div className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs flex justify-end z-50">
          <div className="w-full max-w-sm bg-white h-full p-6 flex flex-col justify-between shadow-2xl overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <span className="font-bold text-slate-900">Execution Plan</span>
                <button
                  onClick={() => setShowPlanDrawer(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="pt-4">{renderPlanContent()}</div>
            </div>
            <div className="pt-4 text-center">
              <button
                onClick={() => setShowPlanDrawer(false)}
                className="text-xs text-slate-500 hover:text-slate-700 font-mono underline"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
