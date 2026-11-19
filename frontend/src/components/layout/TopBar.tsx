import React, { useState } from 'react';
import { Copy, Check, FlaskConical, Compass } from 'lucide-react';
import { useSystem } from '../../app/context/SystemContext';
import { useRun } from '../../app/context/RunContext';
import { useRouter } from '../../app/routes';
import { StatusDot } from '../common/StatusDot';

export const TopBar: React.FC = () => {
  const { isApiOnline, isServerWaking, aiStatus } = useSystem();
  const { currentRun, isDemoFixture } = useRun();
  const { navigate } = useRouter();
  const [copiedHash, setCopiedHash] = useState(false);

  const handleCopyHash = () => {
    if (currentRun?.input_hash) {
      navigator.clipboard.writeText(currentRun.input_hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  const apiStatus = isServerWaking
    ? 'waking'
    : isApiOnline === true
    ? 'online'
    : isApiOnline === false
    ? 'offline'
    : 'neutral';

  const apiLabel = isServerWaking
    ? 'API Waking…'
    : isApiOnline === true
    ? 'API online'
    : isApiOnline === false
    ? 'API unreachable'
    : 'Connecting…';

  const aiLabel = aiStatus === 'active' ? 'AI active' : 'AI: rule-based';

  return (
    <header className="h-14 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 md:px-6 flex items-center justify-between text-slate-900 shrink-0 select-none shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      {/* Brand & File Context */}
      <div className="flex items-center gap-3 md:gap-6 min-w-0">
        <button
          onClick={() => navigate('/app')}
          className="flex items-center gap-2 font-bold tracking-tight text-slate-900 hover:opacity-90 transition-opacity shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
            D
          </div>
          <span className="text-base font-serif font-bold tracking-wide hidden sm:inline text-slate-900">DataFix</span>
        </button>

        {currentRun ? (
          <div className="flex items-center gap-2 md:gap-3 text-xs text-slate-600 font-mono bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-md truncate">
            <span className="text-slate-900 font-semibold truncate max-w-[120px] md:max-w-none">{currentRun.filename}</span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span className="hidden sm:inline text-slate-500">
              {currentRun.profile.row_count.toLocaleString()} rows × {currentRun.profile.column_count} cols
            </span>
            {currentRun.input_hash && (
              <>
                <span className="hidden lg:inline text-slate-300">·</span>
                <button
                  onClick={handleCopyHash}
                  className="hidden lg:flex items-center gap-1 text-slate-500 hover:text-slate-900 transition-colors"
                  title="Click to copy SHA-256 hash"
                >
                  <span>sha256 {currentRun.input_hash.slice(0, 8)}…</span>
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-400 font-mono border-l border-slate-200 pl-3 md:pl-4 truncate hidden sm:block">
            No active dataset loaded
          </div>
        )}
      </div>

      {/* Fixture Mode Alert if active */}
      {isDemoFixture && (
        <div className="mx-2 px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 text-[10px] md:text-xs font-mono rounded-md flex items-center gap-1.5 shrink-0">
          <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
          <span className="hidden md:inline font-medium">DEMO DATA (ISOLATED FIXTURE)</span>
          <span className="md:hidden font-medium">DEMO FIXTURE</span>
        </div>
      )}

      {/* Product Tour Action & Connectivity Indicators */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        <button
          onClick={() => navigate('/walkthrough')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 transition-colors shadow-2xs"
          title="Open interactive 8-stage cinematic product tour"
          data-testid="topbar-product-tour-button"
        >
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          <span>Product Tour</span>
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <StatusDot status={apiStatus} label={apiLabel} />
          <span className="hidden sm:inline">
            <StatusDot status="neutral" label={aiLabel} />
          </span>
        </div>
      </div>
    </header>
  );
};
