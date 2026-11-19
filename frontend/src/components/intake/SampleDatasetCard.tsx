import React from 'react';
import { Database, FlaskConical, ArrowRight } from 'lucide-react';
import { SAMPLE_DATASET_NAME } from '../../lib/constants';

interface SampleDatasetCardProps {
  onLoadSampleFile: (file: File) => void;
  onLoadDemoFixture: () => void;
  disabled: boolean;
}

const SAMPLE_CSV_RAW = `customer_id,full_name,email,city,joined_on,age
C001,Asha Rao,asha@example.test,Bengaluru,2026-02-10,24
C002,Rahul Sen,rahul@example.test,,2026-03-14,29
C003,Meera Das,meera@example.test,Mysuru,2026-04-02,
C003,Meera Das,meera@example.test,Mysuru,2026-04-02,
C005,John Mathew,john.example.test,Bengaluru,not-a-date,34`;

export const SampleDatasetCard: React.FC<SampleDatasetCardProps> = ({
  onLoadSampleFile,
  onLoadDemoFixture,
  disabled,
}) => {
  const handleLoadSample = () => {
    const file = new File([SAMPLE_CSV_RAW], SAMPLE_DATASET_NAME, { type: 'text/csv' });
    onLoadSampleFile(file);
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
          <Database className="w-5 h-5" />
        </div>
        <div className="space-y-1 flex-1">
          <div className="text-sm font-semibold text-slate-900">Try the sample dataset</div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Test the live FastAPI profiling pipeline with bundled synthetic customer data (contains missing values,
            duplicates, and invalid date formats).
          </p>
        </div>
      </div>

      <div className="pt-2 flex flex-wrap items-center gap-3">
        <button
          onClick={handleLoadSample}
          disabled={disabled}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <span>Run live API profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={onLoadDemoFixture}
          disabled={disabled}
          data-testid="load-demo-fixture-btn"
          className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
          title="Preview Studio layout with simulated fixture data"
        >
          <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
          <span>Preview Studio fixture</span>
        </button>
      </div>
    </div>
  );
};
