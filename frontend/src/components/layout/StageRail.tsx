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

  const currentTab = routeState.tab || (routeState.path === '/' ? 'intake' : '');

  const stages = [
    {
      id: 'intake',
      label: 'Intake',
      step: '①',
      icon: UploadCloud,
      path: '/',
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
    <aside className="w-56 bg-slate-950 border-r border-slate-800 flex flex-col justify-between py-4 select-none shrink-0 text-slate-300">
      <div className="space-y-6">
        {/* Stages label */}
        <div className="px-5">
          <div className="text-[10px] font-mono tracking-wider text-slate-500 uppercase">
            Repair Journey
          </div>
        </div>

        {/* Core 4 Stages */}
        <nav className="space-y-1 px-3">
          {stages.map((stage) => {
            const isActive = currentTab === stage.id;
            const Icon = stage.icon;

            return (
              <button
                key={stage.id}
                onClick={() => stage.enabled && navigate(stage.path)}
                disabled={!stage.enabled}
                title={stage.lockedReason}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 font-semibold'
                    : stage.enabled
                    ? 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    : 'text-slate-600 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[11px] text-slate-500">{stage.step}</span>
                  <Icon className="w-4 h-4" />
                  <span>{stage.label}</span>
                </div>
                {!stage.enabled && stage.lockedReason && (
                  <Lock className="w-3 h-3 text-slate-600" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Auxiliary links */}
        <div className="pt-4 border-t border-slate-850 px-3 space-y-1">
          <div className="px-2 text-[10px] font-mono tracking-wider text-slate-500 uppercase mb-2">
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
                title={stage.lockedReason}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-emerald-400 font-semibold'
                    : stage.enabled
                    ? 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    : 'text-slate-600 cursor-not-allowed opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{stage.label}</span>
                </div>
                {!stage.enabled && stage.lockedReason && (
                  <Lock className="w-3 h-3 text-slate-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Safety Notice Footer */}
      <div className="px-5 text-[11px] font-mono text-slate-500 space-y-1 border-t border-slate-900 pt-3">
        <div className="text-slate-400 font-medium">Original Data Immutable</div>
        <p className="text-[10px] leading-relaxed text-slate-600">
          Repairs operate on a temporary working copy. No original records are overwritten.
        </p>
      </div>
    </aside>
  );
};
