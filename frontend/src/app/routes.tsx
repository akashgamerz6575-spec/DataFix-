import React, { createContext, useContext, useEffect, useState } from 'react';

export type RoutePath =
  | '/'
  | '/walkthrough'
  | '/app'
  | '/intake'
  | `/runs/${string}/overview`
  | `/runs/${string}/studio`
  | `/runs/${string}/proof`
  | `/runs/${string}/history`
  | `/runs/${string}/export`;

interface RouteState {
  path: string;
  runId?: string;
  tab?: 'overview' | 'studio' | 'proof' | 'history' | 'export';
  params: Record<string, string>;
}

interface RouterContextValue {
  currentPath: string;
  routeState: RouteState;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterContextValue | null>(null);

function parsePath(pathname: string): RouteState {
  const [cleanPath, search] = pathname.split('?');
  const params: Record<string, string> = {};
  if (search) {
    const urlParams = new URLSearchParams(search);
    urlParams.forEach((val, key) => {
      params[key] = val;
    });
  }

  // 1. First page: The Product Tour / Walkthrough is the default front page
  if (
    cleanPath === '' ||
    cleanPath === '/' ||
    cleanPath === '/walkthrough' ||
    cleanPath.startsWith('/walkthrough')
  ) {
    return {
      path: '/walkthrough',
      params,
    };
  }

  // 2. Operational App Workspace (Intake)
  if (cleanPath === '/app' || cleanPath === '/intake') {
    return {
      path: '/app',
      params,
    };
  }

  // 3. Operational Runs
  const runMatch = cleanPath.match(/^\/runs\/([^/]+)\/(overview|studio|proof|history|export)$/);
  if (runMatch) {
    return {
      path: cleanPath,
      runId: runMatch[1],
      tab: runMatch[2] as RouteState['tab'],
      params,
    };
  }

  return {
    path: cleanPath || '/walkthrough',
    params,
  };
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use hash-based or pathname-based navigation
  const getInitialPath = () => {
    if (window.location.hash.startsWith('#')) {
      return window.location.hash.slice(1) || '/';
    }
    return window.location.pathname || '/';
  };

  const [currentPath, setCurrentPath] = useState<string>(getInitialPath());
  const [routeState, setRouteState] = useState<RouteState>(parsePath(getInitialPath()));

  useEffect(() => {
    const handleHashChange = () => {
      const p = window.location.hash.slice(1) || '/';
      setCurrentPath(p);
      setRouteState(parsePath(p));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (to: string) => {
    window.location.hash = to;
    setCurrentPath(to);
    setRouteState(parsePath(to));
  };

  return (
    <RouterContext.Provider value={{ currentPath, routeState, navigate }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = (): RouterContextValue => {
  const context = useContext(RouterContext);
  if (!context) throw new Error('useRouter must be used within a RouterProvider');
  return context;
};
