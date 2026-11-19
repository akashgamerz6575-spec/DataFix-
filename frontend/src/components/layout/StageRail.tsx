import React from 'react';
import { UploadCloud, BarChart2, Wrench, ShieldCheck, History, Download, Lock } from 'lucide-react';
import { useRun } from '../../app/context/RunContext';
import { useRouter } from '../../app/routes';

export const StageRail: React.FC = () => {
  const { currentRun } = useRun();
  const { navigate, routeState } = useRouter();

  const runId = currentRun?.run_id;
  const isApplied = !!currentRun?.is_applied;
  const hasRun = !!currentRun;

  const currentTab = routeState.tab || (routeState.path === '/app' || routeState.path === '/intake' ? 'intake' : '');

  const stages = [
    {
      id: 'intake',
      label: 'Intake',
      step: '①',
      icon: UploadCloud,
      path: '/app',
      enabled: true,
    },
    {
      id: 'overview',
      label: 'Overview',
      step: '②',
      icon: BarChart2,
      path: runId ? `/runs/${runId}/overview` : '',
      enabled: hasRun,
    },
    {
      id: 'studio',
      label: 'Repair Studio',
      step: '③',
      icon: Wrench,
      path: runId ? `/runs/${runId}/studio` : '',
      enabled: hasRun,
    },
    {
      id: 'proof',
      label: 'Proof',
      step: '④',
      icon: ShieldCheck,
      path: runId ? `/runs/${runId}/proof` : '',
      enabled: hasRun && isApplied,
      lockedReason: !isApplied ? 'Locked until plan is applied' : undefined,
    },
  ];

  const auxiliaryStages = [
    {
      id: 'history',
      label: 'History & Ledger',
      icon: History,
      path: runId ? `/runs/${runId}/history` : '',
      enabled: hasRun,
    },
    {
      id: 'export',
      label: 'Export Bundle',
      icon: Download,
      path: runId ? `/runs/${runId}/export` : '',
      enabled: hasRun && isApplied,
      lockedReason: !isApplied ? 'Apply plan first' : undefined,
    },
  ];

  return (
    <aside className="w-14 md:w-56 bg-white border-r border-slate-200/90 flex flex-col justify-between py-5 select-none shrink-0 text-slate-600 transition-all shadow-[1px_0_3px_rgba(0,0,0,0.02)]">
      <div className="space-y-6">
        {/* Stages label */}
        <div className="px-3 md:px-5">
          <div className="hidden md:block text-[10px] font-mono tracking-wider text-slate-400 font-semibold uppercase">
            Repair Journey
          </div>
        </div>

        {/* Core 4 Stages */}
        <nav className="space-y-1 px-2 md:px-3">
          {stages.map((stage) => {
            const isActive = currentTab === stage.id;
            const Icon = stage.icon;

            return (
              <button
                key={stage.id}
                onClick={() => stage.enabled && navigate(stage.path)}
                disabled={!stage.enabled}
                title={stage.lockedReason || stage.label}
                className={`w-full flex items-center justify-center md:justify-between px-2 md:px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50/90 text-emerald-800 font-semibold border border-emerald-200/80 shadow-2xs'
                    : stage.enabled
                    ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    : 'text-slate-300 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`hidden md:inline font-mono text-[11px] ${
                      isActive ? 'text-emerald-700' : 'text-slate-400'
                    }`}
                  >
                    {stage.step}
                  </span>
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-emerald-700' : stage.enabled ? 'text-slate-500' : 'text-slate-300'
                    }`}
                  />
                  <span className="hidden md:inline">{stage.label}</span>
                </div>
                {!stage.enabled && stage.lockedReason && (
                  <Lock className="hidden md:inline w-3 h-3 text-slate-400 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Auxiliary links */}
        <div className="pt-4 border-t border-slate-200/80 px-2 md:px-3 space-y-1">
          <div className="hidden md:block px-2 text-[10px] font-mono tracking-wider text-slate-400 font-semibold uppercase mb-2">
            Verification & Audit
          </div>
          {auxiliaryStages.map((stage) => {
            const isActive = currentTab === stage.id;
            const Icon = stage.icon;

            return (
              <button
                key={stage.id}
                onClick={() => stage.enabled && navigate(stage.path)}
                disabled={!stage.enabled}
                title={stage.lockedReason || stage.label}
                className={`w-full flex items-center justify-center md:justify-between px-2 md:px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-50/90 text-emerald-800 font-semibold border border-emerald-200/80 shadow-2xs'
                    : stage.enabled
                    ? 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    : 'text-slate-300 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-emerald-700' : stage.enabled ? 'text-slate-500' : 'text-slate-300'
                    }`}
                  />
                  <span className="hidden md:inline">{stage.label}</span>
                </div>
                {!stage.enabled && stage.lockedReason && (
                  <Lock className="hidden md:inline w-3 h-3 text-slate-400 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="hidden md:block px-5 text-[11px] font-mono text-slate-500 space-y-1 border-t border-slate-200/80 pt-3">
        <div className="text-slate-700 font-semibold">Original Data Immutable</div>
        <p className="text-[10px] leading-relaxed text-slate-500">
          Repairs operate on a temporary working copy. No original records are overwritten.
        </p>
      </div>
    </aside>
  );
};
