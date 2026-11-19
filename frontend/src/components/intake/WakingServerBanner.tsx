import React from 'react';
import { Server, RefreshCw } from 'lucide-react';
import { useSystem } from '../../app/context/SystemContext';

export const WakingServerBanner: React.FC = () => {
  const { isServerWaking, wakingElapsedSeconds, checkHealthNow } = useSystem();

  if (!isServerWaking) return null;

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3.5 text-amber-900 mb-6 shadow-xs">
      <Server className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-pulse" />
      <div className="flex-1 text-xs space-y-1">
        <div className="font-semibold text-sm text-amber-950">
          Server is waking up (free hosting cold-start)
        </div>
        <p className="text-slate-600 leading-relaxed">
          The backend service is spinning up after inactivity. This typically takes about 30 to 60 seconds.
          Uploads remain active and will process as soon as the service responds.
        </p>
        <div className="font-mono text-amber-800 pt-1 flex items-center gap-3">
          <span>Elapsed: {wakingElapsedSeconds}s</span>
          <button
            onClick={() => checkHealthNow()}
            className="inline-flex items-center gap-1 text-amber-700 hover:text-amber-950 underline font-sans"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Check now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
