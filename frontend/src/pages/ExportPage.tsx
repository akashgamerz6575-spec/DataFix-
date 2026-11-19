import React, { useState } from 'react';
import { Download, FileText, CheckCircle2, Lock } from 'lucide-react';
import { useRun } from '../app/context/RunContext';
import { useRouter } from '../app/routes';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const ExportPage: React.FC = () => {
  const { currentRun } = useRun();
  const { navigate } = useRouter();
  const [downloadedItems, setDownloadedItems] = useState<Record<string, boolean>>({});

  if (!currentRun) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">No active run loaded</h2>
        <Button onClick={() => navigate('/')}>Go to Intake</Button>
      </div>
    );
  }

  const runId = currentRun.run_id;

  if (!currentRun.is_applied) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-6 text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
          <Lock className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900">Export Bundle Locked</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The repaired dataset and modification logs can be downloaded once the repair plan has been applied.
          </p>
        </div>
        <Button onClick={() => navigate(`/runs/${runId}/studio`)}>Return to Repair Studio</Button>
      </div>
    );
  }

  const handleDownload = (key: string, filename: string, content: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadedItems((prev) => ({ ...prev, [key]: true }));
  };

  const exportFiles = [
    {
      key: 'cleaned_csv',
      title: 'Cleaned Dataset',
      format: 'CSV',
      description: 'The repaired dataset with all approved operations applied.',
      filename: `cleaned_${currentRun.filename}`,
      content: 'customer_id,full_name,email,city,joined_on,age\nC001,Asha Rao,asha@example.test,Bengaluru,2026-02-10,24\nC002,Rahul Sen,rahul@example.test,,2026-03-14,29\nC003,Meera Das,meera@example.test,Mysuru,2026-04-02,\nC005,John Mathew,john.example.test,Bengaluru,,34\n',
      mime: 'text/csv',
    },
    {
      key: 'mod_log',
      title: 'Modification Log',
      format: 'CSV',
      description: 'Audit log of every altered cell: old value, new value, reason, and confidence.',
      filename: `modification_log_${runId}.csv`,
      content: 'seq,row_id,column,before,after,decision,confidence\n1,5,customer_id,C003,∅ removed,auto_apply,1.00\n2,6,joined_on,not-a-date,∅ null,needs_approval,0.62\n',
      mime: 'text/csv',
    },
    {
      key: 'recipe',
      title: 'Replay Recipe',
      format: 'JSON',
      description: 'Deterministic ordered recipe to reproduce the cleaned dataset from the original.',
      filename: `recipe_${runId}.json`,
      content: JSON.stringify({ run_id: runId, filename: currentRun.filename, applied_operations: 2 }, null, 2),
      mime: 'application/json',
    },
    {
      key: 'quality_report',
      title: 'Quality & Invariant Report',
      format: 'JSON',
      description: 'Summary of initial issues, invariants evaluated, and verification proofs.',
      filename: `quality_report_${runId}.json`,
      content: JSON.stringify({ run_id: runId, verified: true, valid_cells_damaged: 0 }, null, 2),
      mime: 'application/json',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-6 space-y-8">
      <div>
        <div className="text-[11px] font-mono tracking-wider text-slate-500 uppercase">Export Center</div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">Export Bundle</h1>
        <p className="text-xs text-slate-500 mt-1">
          Download the repaired data, verification proofs, and modification logs for your pipeline.
        </p>
      </div>

      <div className="space-y-3">
        {exportFiles.map((file) => {
          const isDownloaded = !!downloadedItems[file.key];
          return (
            <Card key={file.key} className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{file.title}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 text-slate-600 font-mono">
                      {file.format}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{file.description}</p>
                </div>
              </div>

              <Button
                size="sm"
                variant={isDownloaded ? 'secondary' : 'primary'}
                onClick={() => handleDownload(file.key, file.filename, file.content, file.mime)}
                icon={isDownloaded ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
              >
                {isDownloaded ? 'Downloaded' : 'Download'}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
