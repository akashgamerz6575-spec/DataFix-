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
    <div
      data-testid="safety-ribbon"
      className="bg-[#fafbfc] border-b border-slate-200/90 text-xs px-3 sm:px-6 py-2 sm:py-2.5 flex flex-col gap-2 select-none shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* 3-Segment Decision Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <span className="text-slate-400 font-mono font-medium tracking-wide uppercase text-[10px] sm:text-[11px] hidden md:inline">
            Safety Ribbon:
          </span>
          <div className="flex items-center gap-1 sm:gap-1.5 h-7">
            <button
              onClick={() => navigate(`/runs/${runId}/studio?lane=auto_apply`)}
              className="h-full px-2.5 sm:px-3 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-200 text-emerald-800 rounded-md flex items-center gap-1.5 text-[11px] sm:text-xs font-medium transition-colors shadow-2xs"
              title="View Auto-apply repairs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{counts.auto} Auto-apply</span>
            </button>

            <button
              onClick={() => navigate(`/runs/${runId}/studio?lane=needs_approval`)}
              className="h-full px-2.5 sm:px-3 bg-amber-50 hover:bg-amber-100/90 border border-amber-200 text-amber-800 rounded-md flex items-center gap-1.5 text-[11px] sm:text-xs font-medium transition-colors shadow-2xs"
              title="View repairs needing your approval"
            >
              <Hand className="w-3.5 h-3.5 text-amber-600" />
              <span>{counts.approval} Needs approval</span>
            </button>

            <button
              onClick={() => navigate(`/runs/${runId}/studio?lane=refused`)}
              className="h-full px-2.5 sm:px-3 bg-indigo-50 hover:bg-indigo-100/90 border border-indigo-200 text-indigo-800 rounded-md flex items-center gap-1.5 text-[11px] sm:text-xs font-medium transition-colors shadow-2xs"
              title="View refused / guarded repairs"
            >
              <ShieldBan className="w-3.5 h-3.5 text-indigo-600" />
              <span>{counts.refused} Refused</span>
            </button>
          </div>
        </div>

        {/* Changes Prevented & Plan State */}
        <div className="flex items-center gap-3 sm:gap-6 font-mono text-[10px] sm:text-[11px] text-slate-600 flex-wrap">
          {counts.refused > 0 && (
            <div className="flex items-center gap-1.5 text-indigo-900 bg-indigo-50/80 border border-indigo-200/60 px-2 py-0.5 rounded">
              <ShieldAlert className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span className="truncate">
                Changes prevented: <strong>{counts.refused} repairs</strong> ({counts.cellsPrevented} cells)
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 border-l border-slate-200 pl-3 sm:pl-4">
            <span className="text-slate-400">Plan:</span>
            {currentRun.is_applied ? (
              <span className="text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200/70 px-2 py-0.5 rounded">
                Applied
              </span>
            ) : (
              <span className="text-slate-600 font-medium">Not applied</span>
            )}
          </div>
        </div>
      </div>

      {/* Proportional visual bar */}
      {total > 0 && (
        <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden flex">
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
