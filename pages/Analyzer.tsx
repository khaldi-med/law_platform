import React, { useState, useRef } from 'react';
import { analyzeLegalText } from '../services/geminiService';
import { CaseAnalysis, LoadingState } from '../types';
import { Loader2, BookOpen, AlertCircle, Upload, X, FileText } from 'lucide-react';

const Analyzer: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; data: string; mimeType: string } | null>(null);
  const [analysis, setAnalysis] = useState<CaseAnalysis | null>(null);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64String = (event.target.result as string).split(',')[1];
          setSelectedFile({
            name: file.name,
            data: base64String,
            mimeType: file.type
          });
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!inputText.trim() && !selectedFile) return;
    setStatus(LoadingState.LOADING);
    try {
      const result = await analyzeLegalText(
        inputText, 
        selectedFile ? { data: selectedFile.data, mimeType: selectedFile.mimeType } : undefined
      );
      setAnalysis(result);
      setStatus(LoadingState.SUCCESS);
    } catch (e) {
      setStatus(LoadingState.ERROR);
    }
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-8rem)] flex flex-col md:flex-row gap-6">
      {/* Input Section */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="font-serif font-bold text-juris-800 flex items-center gap-2">
            <BookOpen size={18} />
            Case Input
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 text-juris-600 hover:bg-gray-100 rounded-md text-sm font-medium flex items-center gap-2 transition-colors border border-dashed border-gray-300"
              title="Upload PDF or Image"
            >
              <Upload size={16} />
              <span className="hidden sm:inline">Upload File</span>
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="application/pdf,image/*" 
              className="hidden" 
              onChange={handleFileSelect}
            />
            <button
              onClick={handleAnalyze}
              disabled={status === LoadingState.LOADING || (!inputText && !selectedFile)}
              className="px-4 py-2 bg-juris-800 text-white rounded-md text-sm font-medium hover:bg-juris-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {status === LoadingState.LOADING ? <Loader2 className="animate-spin" size={16} /> : 'Analyze'}
            </button>
          </div>
        </div>

        {selectedFile && (
          <div className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <FileText size={16} />
              <span className="truncate max-w-[200px] font-medium">{selectedFile.name}</span>
            </div>
            <button onClick={clearFile} className="text-blue-400 hover:text-blue-600">
              <X size={16} />
            </button>
          </div>
        )}

        <textarea
          dir="auto"
          className="flex-1 p-6 resize-none focus:outline-none text-gray-700 font-serif leading-relaxed legal-scroll"
          placeholder="Paste case text (English or Arabic)..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
      </div>

      {/* Output Section */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h2 className="font-serif font-bold text-juris-800">Legal Analysis (IRAC)</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 legal-scroll bg-slate-50" dir="auto">
          {status === LoadingState.IDLE && (
            <div className="h-full flex items-center justify-center text-gray-400 text-center p-8">
              <p>Paste text or upload a PDF to see the breakdown.</p>
            </div>
          )}

          {status === LoadingState.LOADING && (
            <div className="h-full flex flex-col items-center justify-center text-juris-500 gap-4">
              <Loader2 className="animate-spin" size={40} />
              <p className="font-medium animate-pulse">Consulting the AI Clerk...</p>
            </div>
          )}

          {status === LoadingState.ERROR && (
            <div className="h-full flex flex-col items-center justify-center text-red-500 gap-2">
              <AlertCircle size={32} />
              <p>Failed to analyze content. Please try again.</p>
            </div>
          )}

          {status === LoadingState.SUCCESS && analysis && (
            <div className="space-y-6 text-right-auto">
              <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-juris-500 mb-2">Executive Summary</h3>
                <p className="text-gray-800 leading-relaxed font-serif bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                  {analysis.summary}
                </p>
              </section>

              <div className="grid grid-cols-1 gap-6">
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Facts</h3>
                  <ul className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-blue-500 space-y-2">
                    {analysis.facts.map((fact, i) => (
                      <li key={i} className="text-sm text-gray-700 flex gap-2">
                        <span className="text-blue-400 flex-shrink-0">•</span> <span>{fact}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">Issues</h3>
                  <ul className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-amber-500 space-y-2">
                    {analysis.issues.map((issue, i) => (
                      <li key={i} className="text-sm text-gray-700 font-medium flex gap-2">
                        <span className="text-amber-400 flex-shrink-0">?</span> <span>{issue}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-2">Ruling & Reasoning</h3>
                  <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-emerald-500 space-y-4">
                    <div>
                      <span className="text-sm font-bold text-emerald-800 block mb-1">Holding:</span>
                      <p className="text-sm text-gray-700">{analysis.ruling}</p>
                    </div>
                    <div className="pt-3 border-t border-gray-100">
                      <span className="text-sm font-bold text-emerald-800 block mb-1">Rationale:</span>
                      <p className="text-sm text-gray-700">{analysis.reasoning}</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analyzer;