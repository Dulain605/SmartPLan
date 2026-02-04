
import React, { useState, useRef } from 'react';
import { editImageWithGemini, generateImageWithGemini } from '../services/geminiService';
import { ImageStudioState, StudioMode } from '../types';

const ImageStudio: React.FC = () => {
  const [state, setState] = useState<ImageStudioState>({
    mode: 'generate',
    originalUrl: null,
    resultUrl: null,
    loading: false,
    error: null,
  });
  const [prompt, setPrompt] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setState(prev => ({
          ...prev,
          originalUrl: event.target?.result as string,
          resultUrl: null,
          error: null
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAction = async () => {
    if (!prompt) return;
    if (state.mode === 'edit' && !state.originalUrl) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      let result = '';
      if (state.mode === 'edit' && state.originalUrl) {
        const parts = state.originalUrl.split(';');
        const mimeType = parts[0].split(':')[1];
        const base64Data = parts[1].split(',')[1];
        result = await editImageWithGemini(base64Data, mimeType, prompt);
      } else {
        result = await generateImageWithGemini(prompt);
      }
      
      setState(prev => ({ ...prev, resultUrl: result, loading: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, loading: false, error: err.message || 'Failed to process request' }));
    }
  };

  const switchMode = (mode: StudioMode) => {
    setState(prev => ({
      ...prev,
      mode,
      originalUrl: null,
      resultUrl: null,
      error: null
    }));
    setPrompt('');
  };

  const reset = () => {
    setState(prev => ({
      ...prev,
      originalUrl: null,
      resultUrl: null,
      loading: false,
      error: null
    }));
    setPrompt('');
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">AI Image Lab</h2>
          <p className="text-slate-500">Create or modify images with Gemini 2.5 Flash.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 self-start">
          <button 
            onClick={() => switchMode('generate')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${state.mode === 'generate' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <i className="fas fa-plus-circle mr-2"></i>Generate
          </button>
          <button 
            onClick={() => switchMode('edit')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${state.mode === 'edit' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <i className="fas fa-wand-magic-sparkles mr-2"></i>Edit
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Input Area */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            {state.mode === 'edit' && !state.originalUrl ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-2xl p-8 bg-slate-50 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all mb-6 group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600 group-hover:scale-110 transition-transform">
                  <i className="fas fa-image text-xl"></i>
                </div>
                <h4 className="font-bold text-slate-800">Upload Reference Image</h4>
                <p className="text-xs text-slate-500 mt-1">Required for editing mode</p>
              </div>
            ) : state.mode === 'edit' && state.originalUrl ? (
              <div className="relative mb-6 group">
                <img src={state.originalUrl} alt="Source" className="w-full h-48 object-cover rounded-2xl border border-slate-200" />
                <button 
                  onClick={() => setState(prev => ({ ...prev, originalUrl: null }))}
                  className="absolute top-2 right-2 w-8 h-8 bg-black/50 text-white rounded-full flex items-center justify-center hover:bg-black/70 transition"
                >
                  <i className="fas fa-times text-xs"></i>
                </button>
              </div>
            ) : null}

            <h4 className="text-lg font-bold mb-4 flex items-center text-slate-800">
              <i className={`fas ${state.mode === 'generate' ? 'fa-pen-nib' : 'fa-comment-dots'} mr-2 text-indigo-600`}></i>
              {state.mode === 'generate' ? 'What should I create?' : 'What changes should I make?'}
            </h4>
            
            <textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder={state.mode === 'generate' 
                ? "e.g. 'A futuristic city with flying cars and neon lights in cyberpunk style'..." 
                : "e.g. 'Add a red hat to the person', 'Make the background a snowy forest'..."}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition h-36 resize-none text-slate-700"
            />
            
            <div className="mt-4 flex gap-2">
              <button 
                onClick={handleAction}
                disabled={state.loading || !prompt || (state.mode === 'edit' && !state.originalUrl)}
                className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-2xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-100"
              >
                {state.loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    <span>Gemini is thinking...</span>
                  </>
                ) : (
                  <>
                    <i className={`fas ${state.mode === 'generate' ? 'fa-sparkles' : 'fa-magic'}`}></i>
                    <span>{state.mode === 'generate' ? 'Generate Image' : 'Apply Edits'}</span>
                  </>
                )}
              </button>
              <button 
                onClick={reset}
                className="px-6 py-3 border border-slate-200 rounded-2xl text-slate-600 hover:bg-slate-50 transition"
                title="Reset All"
              >
                <i className="fas fa-trash-can"></i>
              </button>
            </div>
            
            {state.error && (
              <div className="mt-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-xl flex items-center animate-in fade-in zoom-in-95">
                <i className="fas fa-circle-exclamation mr-2"></i>
                {state.error}
              </div>
            )}
          </div>
        </div>

        {/* Result Area */}
        <div className="flex flex-col h-full">
          <div className={`flex-1 bg-slate-100 rounded-[32px] overflow-hidden shadow-inner border border-slate-200 flex items-center justify-center relative min-h-[450px] group`}>
            {!state.resultUrl ? (
              <div className="text-center p-8">
                {state.loading ? (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <i className="fas fa-wand-magic-sparkles text-indigo-600 text-xl"></i>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <p className="text-slate-700 font-bold text-lg">Brewing your creation</p>
                      <p className="text-slate-500 text-sm max-w-[240px] mx-auto">Gemini 2.5 is processing your prompt. This usually takes just a few seconds.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-slate-400">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                      <i className="fas fa-image text-2xl"></i>
                    </div>
                    <p className="text-sm font-medium">Ready for your prompt</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full p-4 flex items-center justify-center animate-in fade-in zoom-in-95 duration-500">
                <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src={state.resultUrl} 
                    alt="Result" 
                    className="max-h-full max-w-full rounded-2xl shadow-2xl object-contain border border-white" 
                  />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a 
                      href={state.resultUrl} 
                      download={`gemini-${state.mode}-${Date.now()}.png`}
                      className="bg-white text-slate-800 h-12 w-12 rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                      title="Download Image"
                    >
                      <i className="fas fa-download"></i>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageStudio;
