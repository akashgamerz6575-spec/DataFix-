import React from 'react';
import { ShieldCheck, Hand, ShieldBan, ShieldAlert } from 'lucide-react';
import { useRun } from '../../app/context/RunContext';
import { useRouter } from '../../app/routes';

export const SafetyRibbon: React.FC = () => {
  const { currentRun, counts } = useRun();
  const { navigate } = useRouter();

  if (!currentRun) {
    return null;
  }

  const runId = currentRun.run_id;
  const total = counts.auto + counts.approval + counts.refused;

  // Proportional widths for the visual bar (Review 4.2)
  const autoPct = total > 0 ? (counts.auto / total) * 100 : 0;
  const apprPct = total > 0 ? (counts.approval / total) * 100 : 0;
  const refPct = total > 0 ? (counts.refused / total) * 100 : 0;

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-xs px-6 py-2.5 flex flex-col gap-2 select-none shrink-0">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* 3-Segment Decision Buttons */}
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-mono font-medium tracking-wide uppercase text-[11px]">
            Safety Ribbon:
          </span>
          <div className="flex items-center gap-1.5 h-7">
            <button
              onClick={() => navigate(`/runs/${runId}/studio?lane=auto_apply`)}
              className="h-full px-3 bg-emerald-950/80 hover:bg-emerald-900/90 border border-emerald-500/40 text-emerald-300 rounded flex items-center gap-1.5 font-medium transition-colors"
              title="View Auto-apply repairs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{counts.auto} Auto-apply</span>
            </button>

            <button
              onClick={() => navigate(`/runs/${runId}/studio?lane=needs_approval`)}
              className="h-full px-3 bg-amber-950/80 hover:bg-amber-900/90 border border-amber-500/40 text-amber-300 rounded flex items-center gap-1.5 font-medium transition-colors"
              title="View repairs needing your approval"
            >
              <Hand className="w-3.5 h-3.5 text-amber-400" />
              <span>{counts.approval} Needs approval</span>
            </button>

            <button
              onClick={() => navigate(`/runs/${runId}/studio?lane=refused`)}
              className="h-full px-3 bg-indigo-950/80 hover:bg-indigo-900/90 border border-indigo-500/40 text-indigo-200 rounded flex items-center gap-1.5 font-medium transition-colors"
              title="View refused / guarded repairs"
            >
              <ShieldBan className="w-3.5 h-3.5 text-indigo-400" />
              <span>{counts.refused} Refused</span>
            </button>
          </div>
        </div>

        {/* Changes Prevented & Plan State */}
        <div className="flex items-center gap-6 font-mono text-[11px] text-slate-300">
          {counts.refused > 0 && (
            <div className="flex items-center gap-1.5 text-indigo-300">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                Changes prevented: <strong>{counts.refused} repairs</strong> ({counts.cellsPrevented} cells,{' '}
                {counts.previouslyValidProtected} previously valid)
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
            <span className="text-slate-500">Plan:</span>
            {currentRun.is_applied ? (
              <span className="text-emerald-400 font-semibold">Applied</span>
            ) : (
              <span className="text-slate-300 font-medium">Not applied (preview only)</span>
            )}
          </div>
        </div>
      </div>

      {/* Proportional visual bar */}
      {total > 0 && (
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden flex">
          <div
            style={{ width: `${autoPct}%` }}
            className="bg-emerald-500 transition-all duration-300"
            title={`${counts.auto} Auto-apply (${Math.round(autoPct)}%)`}
          />
          <div
            style={{ width: `${apprPct}%` }}
            className="bg-amber-400 transition-all duration-300"
            title={`${counts.approval} Needs approval (${Math.round(apprPct)}%)`}
          />
          <div
            style={{ width: `${refPct}%` }}
            className="bg-indigo-500 transition-all duration-300"
            title={`${counts.refused} Refused (${Math.round(refPct)}%)`}
          />
        </div>
      )}
    </div>
  );
};
