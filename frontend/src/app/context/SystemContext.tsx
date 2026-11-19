import React, { createContext, useContext, useEffect, useState } from 'react';
import { checkApiHealth, type ApiHealthResponse } from '../../lib/api';

interface SystemContextValue {
  isApiOnline: boolean | null;
  isServerWaking: boolean;
  wakingElapsedSeconds: number;
  aiStatus: 'active' | 'offline_rule_based';
  healthData?: ApiHealthResponse;
  checkHealthNow: () => Promise<void>;
}

const SystemContext = createContext<SystemContextValue | null>(null);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isApiOnline, setIsApiOnline] = useState<boolean | null>(null);
  const [isServerWaking, setIsServerWaking] = useState(false);
  const [wakingElapsedSeconds, setWakingElapsedSeconds] = useState(0);
  const [healthData, setHealthData] = useState<ApiHealthResponse | undefined>();

  // In accordance with AGENTS.md, AI is gracefully offline/rule-based when keys are absent
  const [aiStatus] = useState<'active' | 'offline_rule_based'>('offline_rule_based');

  const checkHealthNow = async () => {
    const res = await checkApiHealth();
    setIsApiOnline(res.online);
    setIsServerWaking(res.waking);
    if (res.data) setHealthData(res.data);
  };

  useEffect(() => {
    checkHealthNow();
    const interval = setInterval(checkHealthNow, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isServerWaking) {
      timer = setInterval(() => {
        setWakingElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setWakingElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isServerWaking]);

  return (
    <SystemContext.Provider
      value={{
        isApiOnline,
        isServerWaking,
        wakingElapsedSeconds,
        aiStatus,
        healthData,
        checkHealthNow,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = (): SystemContextValue => {
  const context = useContext(SystemContext);
  if (!context) throw new Error('useSystem must be used within a SystemProvider');
  return context;
};
