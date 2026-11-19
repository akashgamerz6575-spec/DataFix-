import React from 'react';
import { useRouter } from './routes';
import { TopBar } from '../components/layout/TopBar';
import { SafetyRibbon } from '../components/layout/SafetyRibbon';
import { StageRail } from '../components/layout/StageRail';
import { IntakePage } from '../pages/IntakePage';
import { OverviewPage } from '../pages/OverviewPage';
import { StudioPage } from '../pages/StudioPage';
import { ProofPage } from '../pages/ProofPage';
import { HistoryPage } from '../pages/HistoryPage';
import { ExportPage } from '../pages/ExportPage';

export const AppShell: React.FC = () => {
  const { routeState } = useRouter();

  const renderContent = () => {
    switch (routeState.tab) {
      case 'overview':
        return <OverviewPage />;
      case 'studio':
        return <StudioPage />;
      case 'proof':
        return <ProofPage />;
      case 'history':
        return <HistoryPage />;
      case 'export':
        return <ExportPage />;
      default:
        return <IntakePage />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 text-slate-900 font-sans">
      {/* 1. Global Topbar */}
      <TopBar />

      {/* 2. Persistent Safety Ribbon */}
      <SafetyRibbon />

      {/* 3. Main Workspace: Stage Rail + Page Content */}
      <div className="flex flex-1 overflow-hidden">
        <StageRail />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
