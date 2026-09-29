import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { QuickAddView } from './components/QuickAddView';
import { SearchModal } from './components/SearchModal';
import { Sidebar } from './components/Sidebar';
import { TaskDetailModal } from './components/TaskDetailModal';
import { TaskInputModal } from './components/TaskInputModal';
import { WelcomeModal } from './components/WelcomeModal';
import { WidgetView } from './components/WidgetView';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import { AllTasksPage } from './pages/AllTasksPage';
import { CompletedPage } from './pages/CompletedPage';
import { ImportantPage } from './pages/ImportantPage';
import { SettingsPage } from './pages/SettingsPage';
import { TodayPage } from './pages/TodayPage';
import { UpcomingPage } from './pages/UpcomingPage';

const MainAppContent: React.FC = () => {
  const { activeFilter, settings, setIsAddTaskModalOpen } = useTaskContext();
  const [routeHash, setRouteHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => setRouteHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Keyboard shortcut Ctrl+N for new task
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        setIsAddTaskModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsAddTaskModalOpen]);

  // Route 1: Quick Add window mode
  if (routeHash === '#/quick-add') {
    return <QuickAddView />;
  }

  // Route 2: Compact Widget Mode
  if (settings.currentViewMode === 'widget') {
    return (
      <div className="w-full h-full bg-slate-900 flex flex-col font-sans antialiased text-slate-100 overflow-hidden">
        <WidgetView />
        <TaskInputModal />
        <TaskDetailModal />
        <SearchModal />
      </div>
    );
  }

  // Route 3: Full Application Window
  const renderActivePage = () => {
    switch (activeFilter) {
      case 'today':
        return <TodayPage />;
      case 'upcoming':
        return <UpcomingPage />;
      case 'all':
        return <AllTasksPage />;
      case 'completed':
        return <CompletedPage />;
      case 'important':
        return <ImportantPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <TodayPage />;
    }
  };

  return (
    <div className="w-screen h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased overflow-hidden border border-slate-800/80 rounded-xl shadow-2xl">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950/90">
          {renderActivePage()}
        </main>
      </div>

      {/* Global Modals */}
      <TaskInputModal />
      <TaskDetailModal />
      <SearchModal />
      <WelcomeModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <TaskProvider>
      <MainAppContent />
    </TaskProvider>
  );
};
