import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { profileDataset } from '../lib/api';
import { useRun } from '../app/context/RunContext';
import { useRouter } from '../app/routes';
import { Dropzone } from '../components/intake/Dropzone';
import { SampleDatasetCard } from '../components/intake/SampleDatasetCard';
import { WakingServerBanner } from '../components/intake/WakingServerBanner';

export const IntakePage: React.FC = () => {
  const { loadProfileAsRun, loadDemoFixture } = useRun();
  const { navigate } = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setIsProcessing(true);
    setApiError(null);

    try {
      const profile = await profileDataset(file);
      const runId = loadProfileAsRun(profile);
      navigate(`/runs/${runId}/overview`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'The dataset could not be profiled.';
      setApiError(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadFixture = () => {
    loadDemoFixture();
    navigate('/runs/run_demo_01/studio');
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-6 space-y-8">
      {/* Header Copy */}
      <div className="space-y-2">
        <div className="text-[11px] font-mono tracking-wider text-emerald-600 font-semibold uppercase">
          Autonomous Data Quality & Repair Engine
        </div>
        <h1 className="font-serif text-3xl font-bold text-slate-900 tracking-tight">
          Fix data without trusting a fix blindly.
        </h1>
        <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
          Every repair is previewed, checked by safety invariants, and either applied, held for your approval,
          or explicitly refused.
        </p>
      </div>

      <WakingServerBanner />

      {apiError && (
        <div className="bg-red-50 border border-red-200 text-red-900 p-4 rounded-xl flex items-start gap-3 text-xs shadow-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-red-950">Upload failed</div>
            <div>{apiError}</div>
          </div>
        </div>
      )}

      {/* Main Upload Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Dropzone onFileSelected={handleUpload} isProcessing={isProcessing} />
        </div>
        <div className="md:col-span-1">
          <SampleDatasetCard
            onLoadSampleFile={handleUpload}
            onLoadDemoFixture={handleLoadFixture}
            disabled={isProcessing}
          />
        </div>
      </div>

      {/* Trust & Invariant Assurance Banner */}
      <div className="border border-slate-200/80 bg-slate-50/70 rounded-2xl p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600">
        <div>
          <div className="font-semibold text-slate-900 mb-1">Original Immutable</div>
          <p className="text-slate-500 leading-relaxed">
            Your original file is never overwritten. Changes are computed and previewed on a working copy.
          </p>
        </div>
        <div>
          <div className="font-semibold text-slate-900 mb-1">Human Gate for Uncertainty</div>
          <p className="text-slate-500 leading-relaxed">
            High-risk or ambiguous substitutions require explicit approval. DataFix never guesses blindly.
          </p>
        </div>
        <div>
          <div className="font-semibold text-slate-900 mb-1">Refusal as a Feature</div>
          <p className="text-slate-500 leading-relaxed">
            When integrity checks fail or evidence is split, DataFix visibly declines the repair to keep data safe.
          </p>
        </div>
      </div>
    </div>
  );
};
