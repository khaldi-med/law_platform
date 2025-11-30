import React from 'react';
import { FileText, MessageSquare, GraduationCap, HelpCircle, PenTool } from 'lucide-react';
import { Page } from '../types';

interface SidebarProps {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const navItems = [
    { page: Page.DASHBOARD, label: 'Dashboard', icon: <GraduationCap size={20} /> },
    { page: Page.ANALYZER, label: 'Case Analyzer', icon: <FileText size={20} /> },
    { page: Page.QA, label: 'Q&A Practice', icon: <HelpCircle size={20} /> },
    { page: Page.DRAFTING, label: 'Legal Drafting', icon: <PenTool size={20} /> },
    { page: Page.CHAT, label: 'AI Tutor', icon: <MessageSquare size={20} /> },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-juris-900 text-white flex flex-col shadow-2xl z-20 transition-all duration-300">
      <div className="p-6 border-b border-juris-700 flex items-center gap-3">
        <div className="w-8 h-8 bg-gold-500 rounded-md flex items-center justify-center text-juris-900 font-bold font-serif">
          J
        </div>
        <h1 className="text-xl font-serif font-bold tracking-wide">JurisMind</h1>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              currentPage === item.page
                ? 'bg-gold-500 text-juris-900 font-semibold shadow-md'
                : 'text-juris-200 hover:bg-juris-800 hover:text-white'
            }`}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-juris-700">
        <div className="bg-juris-800 rounded-lg p-4 text-xs text-juris-300 leading-relaxed">
          <p className="font-semibold text-juris-100 mb-1">Study Tip:</p>
          Always summarize cases in your own words to improve retention.
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;