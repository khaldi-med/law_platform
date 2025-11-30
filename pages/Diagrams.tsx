import React, { useState, useRef } from 'react';
import { generateFlowchart } from '../services/geminiService';
import MermaidChart from '../components/MermaidChart';
import { LoadingState } from '../types';
import { Loader2, Zap, Upload, FileText, X } from 'lucide-react';

const Diagrams: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; data: string; mimeType: string } | null>(null);
  const [chartCode, setChartCode] = useState('');
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

  const handleVisualize = async () => {
    if (!inputText.trim() && !selectedFile) return;
    setStatus(LoadingState.LOADING);
    setChartCode('');
    try {
      const code = await generateFlowchart(
        inputText,
        selectedFile ? { data: selectedFile.data, mimeType: selectedFile.mimeType } : undefined
      );
      setChartCode(code);
      setStatus(LoadingState.SUCCESS);
    } catch (e) {
      setStatus(LoadingState.ERROR);
    }
  };

  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-8rem)] gap-6">
      <div className="flex-none bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-serif font-bold text-juris-800 mb-2">Visual Explainer</h2>
        <p className="text-sm text-gray-500 mb-4">Describe a legal process or upload a document (PDF/Image) to visualize it.</p>
        
        <div className="flex flex-col gap-3">
          {selectedFile && (
            <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded-lg max-w-md">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <FileText size={16} />
                <span className="truncate">{selectedFile.name}</span>
              </div>
              <button onClick={clearFile} className="text-blue-400 hover:text-blue-600">
                <X size={16} />
              </button>
            </div>
          )}

          <div className="flex gap-4">
            <input
              type="text"
              dir="auto"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="E.g. Explain the path of a bill becoming a law (or upload file)..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleVisualize()}
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors"
              title="Upload File"
            >
              <Upload size={18} />
            </button>
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="application/pdf,image/*" 
              className="hidden" 
              onChange={handleFileSelect}
            />

            <button
              onClick={handleVisualize}
              disabled={status === LoadingState.LOADING || (!inputText && !selectedFile)}
              className="bg-juris-800 hover:bg-juris-700 text-white font-medium px-6 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {status === LoadingState.LOADING ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
              Visualize
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-50 rounded-xl border border-gray-200 shadow-inner flex items-center justify-center overflow-hidden relative">
        {status === LoadingState.LOADING && (
          <div className="flex flex-col items-center gap-3 text-juris-500">
            <Loader2 className="animate-spin" size={40} />
            <p>Constructing Logic Map...</p>
          </div>
        )}
        
        {status === LoadingState.SUCCESS && chartCode && (
          <div className="w-full h-full overflow-auto p-8 flex items-center justify-center bg-dots">
            <MermaidChart chart={chartCode} />
          </div>
        )}

        {status === LoadingState.IDLE && (
          <div className="text-gray-400 text-sm">Diagram will appear here</div>
        )}

        {status === LoadingState.ERROR && (
          <div className="text-red-500">Failed to generate diagram. Try a clearer description or clearer document.</div>
        )}
      </div>
    </div>
  );
};

export default Diagrams;