import React from 'react';
import { Page } from '../types';
import { ArrowRight, FileText, MessageSquare, HelpCircle, PenTool } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const features = [
    {
      page: Page.ANALYZER,
      title: 'Analyze Case Law',
      description: 'Upload case text to get IRAC summaries, key facts, and rulings instantly.',
      icon: <FileText className="text-blue-600" size={24} />,
      color: 'bg-blue-50 border-blue-100 hover:border-blue-300'
    },
    {
      page: Page.QA,
      title: 'Q&A Generator',
      description: 'Create practice questions and answers automatically from your notes or cases.',
      icon: <HelpCircle className="text-emerald-600" size={24} />,
      color: 'bg-emerald-50 border-emerald-100 hover:border-emerald-300'
    },
    {
      page: Page.DRAFTING,
      title: 'Legal Drafting',
      description: 'Generate structured legal articles based on Moroccan legal methodology (Plan Bipartite).',
      icon: <PenTool className="text-purple-600" size={24} />,
      color: 'bg-purple-50 border-purple-100 hover:border-purple-300'
    },
    {
      page: Page.CHAT,
      title: 'AI Legal Tutor',
      description: 'Ask questions, clarify doubts, and discuss legal concepts in real-time.',
      icon: <MessageSquare className="text-amber-600" size={24} />,
      color: 'bg-amber-50 border-amber-100 hover:border-amber-300'
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-serif font-bold text-juris-900 mb-4">Welcome to JurisMind</h1>
        <p className="text-lg text-juris-600 max-w-2xl mx-auto">
          Your AI-powered companion for law school. Master cases and test your knowledge.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <div
            key={feature.title}
            onClick={() => onNavigate(feature.page)}
            className={`p-6 rounded-xl border-2 transition-all duration-300 cursor-pointer group shadow-sm hover:shadow-md ${feature.color}`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                {feature.icon}
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-transform" size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2 font-serif">{feature.title}</h3>
            <p className="text-gray-600 leading-relaxed">
              {feature.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-serif font-bold text-juris-800 mb-4">Daily Legal Maxim</h2>
        <blockquote className="border-l-4 border-gold-500 pl-4 italic text-juris-600 text-lg">
          "Ignorantia juris non excusat."
        </blockquote>
        <p className="mt-2 text-sm text-gray-500">- Ignorance of the law excuses not.</p>
      </div>
    </div>
  );
};

export default Dashboard;