import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Analyzer from './pages/Analyzer';
import QAGenerator from './pages/Flashcards';
import Chat from './pages/Chat';
import Drafting from './pages/Drafting';
import { Page } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.DASHBOARD);

  const renderPage = () => {
    switch (currentPage) {
      case Page.DASHBOARD:
        return <Dashboard onNavigate={setCurrentPage} />;
      case Page.ANALYZER:
        return <Analyzer />;
      case Page.QA:
        return <QAGenerator />;
      case Page.DRAFTING:
        return <Drafting />;
      case Page.CHAT:
        return <Chat />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-gray-900">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;