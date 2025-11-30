import React, { useState, useRef } from 'react';
import { generateLegalQA } from '../services/geminiService';
import { QAItem, LoadingState } from '../types';
import { Loader2, Plus, Trash2, Upload, FileText, X, ChevronDown, ChevronUp } from 'lucide-react';

const QAGenerator: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<{ name: string; data: string; mimeType: string } | null>(null);
  const [items, setItems] = useState<QAItem[]>([]);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
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

  const handleGenerate = async () => {
    if (!inputText.trim() && !selectedFile) return;
    setStatus(LoadingState.LOADING);
    try {
      const newItems = await generateLegalQA(
        inputText,
        selectedFile ? { data: selectedFile.data, mimeType: selectedFile.mimeType } : undefined
      );
      setItems(prev => [...prev, ...newItems]);
      setStatus(LoadingState.SUCCESS);
      setInputText(''); 
      clearFile();
    } catch (e) {
      setStatus(LoadingState.ERROR);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Header / Input Area */}
      <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex-shrink-0">
        <h2 className="text-2xl font-serif font-bold text-juris-800 mb-4">Q&A Generator</h2>
        
        <div className="flex flex-col gap-4">
          <div className="relative">
             <textarea
              dir="auto"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste text to generate practice questions (English or Arabic)..."
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-gold-500 focus:outline-none min-h-[80px]"
            />
            {selectedFile && (
              <div className="absolute bottom-3 left-3 right-3 bg-blue-50 border border-blue-200 rounded p-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-blue-700">
                  <FileText size={14} />
                  <span className="truncate">{selectedFile.name}</span>
                </div>
                <button onClick={clearFile} className="text-blue-400 hover:text-blue-600">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-juris-500 hover:text-juris-700 text-sm font-medium flex items-center gap-2 transition-colors px-3 py-2 rounded hover:bg-gray-100"
              >
                <Upload size={18} />
                Upload PDF/Image
              </button>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="application/pdf,image/*" 
                className="hidden" 
                onChange={handleFileSelect}
              />
            </div>

            <button
              onClick={handleGenerate}
              disabled={status === LoadingState.LOADING || (!inputText && !selectedFile)}
              className="bg-gold-500 hover:bg-yellow-600 text-juris-900 font-bold px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {status === LoadingState.LOADING ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
              Generate Q&A
            </button>
          </div>
        </div>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto pb-10 legal-scroll">
        {items.length === 0 && status !== LoadingState.LOADING ? (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-lg mb-2">No questions yet.</p>
            <p className="text-sm">Paste legal text or upload a document to generate practice questions.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const isExpanded = expandedItems.has(item.id);
              return (
                <div key={item.id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                  <div 
                    onClick={() => toggleExpand(item.id)}
                    className="p-5 cursor-pointer flex justify-between items-start gap-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      {item.category && (
                        <span dir="auto" className="inline-block text-xs font-bold text-gold-500 uppercase tracking-wider mb-2">
                          {item.category}
                        </span>
                      )}
                      <h3 dir="auto" className="text-lg font-serif font-medium text-juris-900 leading-relaxed">
                        {item.question}
                      </h3>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                       <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeItem(item.id);
                        }}
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                      {isExpanded ? <ChevronUp className="text-juris-400" /> : <ChevronDown className="text-juris-400" />}
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="bg-juris-50 border-t border-gray-100 p-5 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex gap-3">
                        <div className="w-1 h-auto bg-green-500 rounded-full flex-shrink-0 opacity-50"></div>
                        <div dir="auto" className="text-juris-800 leading-relaxed">
                          <span className="font-bold text-sm text-green-700 block mb-1">Answer:</span>
                          {item.answer}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default QAGenerator;
