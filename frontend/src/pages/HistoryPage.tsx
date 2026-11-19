import React, { useState } from 'react';
import { ShieldBan, Copy, Check, FlaskConical, Info } from 'lucide-react';
import { useRun } from '../app/context/RunContext';
import { useRouter } from '../app/routes';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import type { RepairProposal } from '../lib/contract-types';

export const HistoryPage: React.FC = () => {
  const { currentRun, isDemoFixture } = useRun();
  const { navigate } = useRouter();
  const [activeTab, setActiveTab] = useState<'applied' | 'declined'>('applied');
  const [copiedRecipe, setCopiedRecipe] = useState(false);

  if (!currentRun) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">No active run loaded</h2>
        <Button onClick={() => navigate('/app')}>Go to Intake</Button>
      </div>
    );
  }

  const appliedProposals = currentRun.proposals.filter(
    (p: RepairProposal) => p.decision === 'auto_apply' || p.user_action === 'approved'
  );

  const declinedProposals = currentRun.proposals.filter(
    (p: RepairProposal) => p.decision === 'refused' || p.user_action === 'rejected'
  );

  const sampleRecipe = JSON.stringify(
    {
      engine_version: '0.1.0',
      dataset: currentRun.filename,
      input_hash: currentRun.input_hash || '3f9ac21e7d8902',
      operations: appliedProposals.map((p: RepairProposal, idx: number) => ({
        seq: idx + 1,
        op: p.op,
        column: p.column,
        decision_by: p.decision === 'auto_apply' ? 'auto' : 'user',
        confidence: p.confidence.value,
      })),
    },
    null,
    2
  );

  const handleCopyRecipe = () => {
    navigator.clipboard.writeText(sampleRecipe);
    setCopiedRecipe(true);
    setTimeout(() => setCopiedRecipe(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      <div>
        <div className="text-[11px] font-mono tracking-wider text-slate-500 uppercase">Audit & Reproducibility</div>
        <h1 className="font-serif text-2xl font-bold text-slate-900 mt-1">Repair Ledger</h1>
        <p className="text-xs text-slate-500 mt-1">
          Sequenced operation log of all applied operations and safety gate decisions.
        </p>
      </div>

      {/* Epistemic note on cryptographic guarantees vs in-memory log */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-slate-800">Operation Log Status & Verification</span>
          <p className="text-slate-500 leading-relaxed">
            The operations below are recorded in a deterministic ordered ledger. Cryptographic signing and tamper-evident
            hash verification are planned for Milestone 2 (GAP-5 / GAP-6 backend implementation).
          </p>
        </div>
      </div>

      {isDemoFixture && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs font-mono text-amber-800">
          <FlaskConical className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Notice: Viewing simulated operation ledger for design evaluation.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 flex items-center gap-6 text-xs font-mono">
        <button
          onClick={() => setActiveTab('applied')}
          className={`pb-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'applied'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Applied Operations ({appliedProposals.length})
        </button>
        <button
          onClick={() => setActiveTab('declined')}
          className={`pb-3 font-semibold border-b-2 transition-colors ${
            activeTab === 'declined'
              ? 'border-indigo-600 text-indigo-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Declined & Refused ({declinedProposals.length})
        </button>
      </div>

      {/* Operations List */}
      <Card className="overflow-hidden">
        {activeTab === 'applied' ? (
          appliedProposals.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No operations applied yet. Apply the repair plan in Repair Studio to populate the ledger.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 font-mono bg-slate-50/50">
                    <th className="px-4 sm:px-6 py-3 font-semibold">#</th>
                    <th className="px-4 sm:px-6 py-3 font-semibold">Operation</th>
                    <th className="px-4 sm:px-6 py-3 font-semibold">Column</th>
                    <th className="px-4 sm:px-6 py-3 font-semibold">Cells</th>
                    <th className="px-4 sm:px-6 py-3 font-semibold">Decided By</th>
                    <th className="px-4 sm:px-6 py-3 font-semibold">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {appliedProposals.map((p: RepairProposal, i: number) => (
                    <tr key={p.id} className="hover:bg-slate-50">
                      <td className="px-4 sm:px-6 py-3 text-slate-400">{i + 1}</td>
                      <td className="px-4 sm:px-6 py-3 font-semibold text-slate-800">{p.op}</td>
                      <td className="px-4 sm:px-6 py-3 text-slate-600">{p.column}</td>
                      <td className="px-4 sm:px-6 py-3">{p.simulation?.cells_changed ?? 1}</td>
                      <td className="px-4 sm:px-6 py-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                          {p.decision === 'auto_apply' ? 'Auto Gate' : 'Human Approval'}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-3">
                        {p.confidence.value !== null ? `${Math.round(p.confidence.value * 100)}%` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="divide-y divide-slate-100 p-4 sm:p-6 space-y-4">
            {declinedProposals.map((p: RepairProposal) => (
              <div key={p.id} className="flex items-start justify-between text-xs pt-3 first:pt-0 gap-3">
                <div className="space-y-1">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <ShieldBan className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{p.title}</span>
                  </div>
                  <p className="text-slate-500 font-mono">{p.reasons[0] || p.explanation}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 text-[11px] font-mono border border-indigo-200 shrink-0">
                  {p.decision === 'refused' ? 'Safety Refusal' : 'User Rejected'}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Reproduce this run */}
      <Card className="p-4 sm:p-6 space-y-4 bg-slate-50/50">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Deterministic Recipe</h3>
            <p className="text-xs text-slate-500">
              Exportable JSON recipe to replay and reproduce this run deterministically.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopyRecipe}
            icon={copiedRecipe ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          >
            {copiedRecipe ? 'Copied' : 'Copy Recipe JSON'}
          </Button>
        </div>
        <pre className="p-4 bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-mono overflow-x-auto max-h-48">
          {sampleRecipe}
        </pre>
      </Card>
    </div>
  );
};
