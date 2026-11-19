import React, { useState } from 'react';
import { Copy, Check, Sparkles } from 'lucide-react';
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
    <header className="h-14 bg-slate-950 border-b border-slate-800 px-6 flex items-center justify-between text-white shrink-0 select-none">
      {/* Brand & File Context */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 font-bold tracking-tight text-white hover:opacity-90 transition-opacity"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm">
            D
          </div>
          <span className="text-base tracking-wide font-mono">DataFix</span>
        </button>

        {currentRun ? (
          <div className="flex items-center gap-3 text-xs text-slate-400 font-mono border-l border-slate-800 pl-4">
            <span className="text-slate-200 font-medium">{currentRun.filename}</span>
            <span>·</span>
            <span>
              {currentRun.profile.row_count.toLocaleString()} rows × {currentRun.profile.column_count} cols
            </span>
            {currentRun.input_hash && (
              <>
                <span>·</span>
                <button
                  onClick={handleCopyHash}
                  className="flex items-center gap-1 hover:text-slate-200 transition-colors"
                  title="Click to copy SHA-256 hash"
                >
                  <span>sha256 {currentRun.input_hash.slice(0, 8)}…</span>
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-500" />}
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="text-xs text-slate-500 font-mono border-l border-slate-800 pl-4">
            No active dataset loaded
          </div>
        )}
      </div>

      {/* Fixture Mode Alert if active */}
      {isDemoFixture && (
        <div className="px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono rounded flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>DEVELOPMENT / DEMO DATA (ISOLATED FIXTURE)</span>
        </div>
      )}

      {/* Connectivity Indicators */}
      <div className="flex items-center gap-5">
        <StatusDot status={apiStatus} label={apiLabel} />
        <StatusDot status="neutral" label={aiLabel} />
      </div>
    </header>
  );
};
