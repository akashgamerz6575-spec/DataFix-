import { SystemProvider } from './app/context/SystemContext';
import { RunProvider } from './app/context/RunContext';
import { RouterProvider } from './app/routes';
import { AppShell } from './app/AppShell';

export default function App() {
  return (
    <SystemProvider>
      <RunProvider>
        <RouterProvider>
          <AppShell />
        </RouterProvider>
      </RunProvider>
    </SystemProvider>
  );
}
