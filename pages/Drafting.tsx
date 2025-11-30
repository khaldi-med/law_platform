import React, { useState } from 'react';
import { generateLegalArticle } from '../services/geminiService';
import { LoadingState } from '../types';
import { Loader2, PenTool, Download, Feather } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

declare global {
  interface Window {
    html2pdf: any;
  }
}

const Drafting: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [article, setArticle] = useState('');
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setStatus(LoadingState.LOADING);
    setArticle('');
    try {
      const result = await generateLegalArticle(topic);
      setArticle(result);
      setStatus(LoadingState.SUCCESS);
    } catch (e) {
      setStatus(LoadingState.ERROR);
    }
  };

  const handleDownloadPDF = () => {
    if (!article || !window.html2pdf) return;
    
    const element = document.getElementById('article-content');
    const opt = {
      margin: [15, 15],
      filename: `Legal_Article_${Date.now()}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    window.html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col gap-6">
      {/* Input Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-700">
            <PenTool size={20} />
          </div>
          <div>
            <h2 className="text-xl font-serif font-bold text-juris-800">Legal Drafting (Methodology)</h2>
            <p className="text-sm text-gray-500">Generate structured articles based on Moroccan Legal Methodology (تحرير موضوع قانوني).</p>
          </div>
        </div>

        <div className="flex gap-4">
          <input
            dir="auto"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter legal topic (e.g. أركان العقد في القانون المدني)..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:outline-none font-serif"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <button
            onClick={handleGenerate}
            disabled={status === LoadingState.LOADING || !topic.trim()}
            className="bg-purple-700 hover:bg-purple-800 text-white font-medium px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50 min-w-[120px] justify-center"
          >
            {status === LoadingState.LOADING ? <Loader2 className="animate-spin" size={18} /> : <Feather size={18} />}
            Draft
          </button>
        </div>
      </div>

      {/* Article Output */}
      <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 shadow-inner overflow-hidden relative flex flex-col">
        {status === LoadingState.IDLE && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-2">
            <PenTool size={48} className="opacity-20" />
            <p>Enter a topic above to generate a structured dissertation.</p>
          </div>
        )}

        {status === LoadingState.LOADING && (
          <div className="flex-1 flex flex-col items-center justify-center text-purple-700 gap-4">
            <Loader2 className="animate-spin" size={40} />
            <div className="text-center">
              <p className="font-bold">Structuring the Argument...</p>
              <p className="text-sm text-purple-500 mt-1">Applying Introduction, Dualist Plan, and Conclusion.</p>
            </div>
          </div>
        )}

        {status === LoadingState.ERROR && (
          <div className="flex-1 flex items-center justify-center text-red-500">
            <p>Failed to generate article. Please try again.</p>
          </div>
        )}

        {status === LoadingState.SUCCESS && article && (
          <>
            <div className="p-4 bg-white border-b border-gray-200 flex justify-end">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-purple-700 transition-colors px-3 py-1.5 rounded-md hover:bg-purple-50"
              >
                <Download size={16} />
                Download PDF
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 legal-scroll bg-white" dir="auto">
              <div 
                id="article-content" 
                className="max-w-3xl mx-auto bg-white p-8 md:p-12 text-gray-900 shadow-sm print:shadow-none print:p-0"
              >
                {/* Header for PDF */}
                <div className="text-center mb-8 pb-6 border-b-2 border-double border-gray-300">
                  <h1 className="text-2xl font-serif font-bold mb-2">{topic}</h1>
                  <p className="text-sm text-gray-500 uppercase tracking-widest">Legal Dissertation</p>
                </div>
                
                <div className="prose prose-slate max-w-none font-serif leading-loose text-justify prose-headings:font-bold prose-headings:text-juris-800 prose-h2:mt-8 prose-h2:border-b prose-h2:pb-2 prose-h2:border-gray-200 prose-p:mb-4">
                  <ReactMarkdown>{article}</ReactMarkdown>
                </div>

                <div className="mt-12 pt-6 border-t border-gray-100 text-center text-xs text-gray-400 italic">
                  Generated by JurisMind AI
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Drafting;