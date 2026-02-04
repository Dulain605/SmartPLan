import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { VideoStudioState } from '../types';

/**
 * Loading messages used to provide a better user experience during long-running
 * video generation tasks.
 */
const LOADING_MESSAGES = [
  "Dreaming up your sequence...",
  "Painting motion into reality...",
  "Assembling the cinematic frames...",
  "Fine-tuning the animation path...",
  "Applying digital magic...",
  "Almost there! Just a few more seconds...",
  "Polishing the final output..."
];

const VideoStudio: React.FC = () => {
  const [state, setState] = useState<VideoStudioState>({
    videoUrl: null,
    loading: false,
    error: null,
    progressMessage: LOADING_MESSAGES[0]
  });
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('720p');
  const [hasKey, setHasKey] = useState<boolean | null>(null);

  // Use the global aistudio object provided by the environment.
  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore - window.aistudio is injected by the environment
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    // @ts-ignore - window.aistudio is injected by the environment
    await window.aistudio.openSelectKey();
    // Per instructions, assume key selection was successful after triggering openSelectKey.
    setHasKey(true);
  };

  const handleGenerate = async () => {
    if (!prompt) return;

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      progressMessage: LOADING_MESSAGES[0],
      videoUrl: null
    }));

    // Cycling through messages for enhanced user experience during longer generation times.
    let msgIndex = 0;
    const intervalId = setInterval(() => {
      msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length;
      setState(prev => ({ ...prev, progressMessage: LOADING_MESSAGES[msgIndex] }));
    }, 8000);

    try {
      // Create a new GoogleGenAI instance right before the call to use the latest API key, as per guidelines.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: resolution,
          aspectRatio: aspectRatio
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video generation failed to return a link.");

      // You must append an API key when fetching from the download link.
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      if (!response.ok) {
        if (response.status === 404) {
          setHasKey(false);
          throw new Error("Requested entity was not found. Please re-select your API key.");
        }
        throw new Error("Failed to fetch the generated video file.");
      }
      
      const blob = await response.blob();
      const videoUrl = URL.createObjectURL(blob);
      setState(prev => ({ ...prev, videoUrl, loading: false }));
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || 'An error occurred during generation.';
      // Reset the key selection state if the request fails with "Requested entity was not found."
      if (errorMessage.includes("Requested entity was not found")) {
        setHasKey(false);
      }
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
    } finally {
      clearInterval(intervalId);
    }
  };

  if (hasKey === false) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-6 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
          <i className="fas fa-key text-3xl"></i>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-800">API Key Required</h2>
          <p className="text-slate-500 mt-2 max-w-md">
            Veo 3.1 models require a paid API key for video generation. 
            Please select your key from a paid GCP project.
          </p>
          <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline text-sm block mt-2">
            Learn more about billing
          </a>
        </div>
        <button 
          onClick={handleSelectKey}
          className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
        >
          Select API Key
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Video Lab</h2>
        <p className="text-slate-500">Cinematic motion generation powered by Veo 3.1.</p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <h4 className="text-lg font-bold mb-4 flex items-center text-slate-800">
              <i className="fas fa-clapperboard mr-2 text-indigo-600"></i>
              Script Your Vision
            </h4>
            
            <textarea 
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Describe your scene in detail... e.g., 'A golden retriever puppy wearing sunglasses lounging on a tropical beach in 4k realism, slow panning shot'"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition h-40 resize-none text-slate-700 mb-4"
            />

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Aspect Ratio</label>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button 
                    onClick={() => setAspectRatio('16:9')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${aspectRatio === '16:9' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Landscape (16:9)
                  </button>
                  <button 
                    onClick={() => setAspectRatio('9:16')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${aspectRatio === '9:16' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Portrait (9:16)
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Quality</label>
                <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button 
                    onClick={() => setResolution('720p')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${resolution === '720p' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    720p
                  </button>
                  <button 
                    onClick={() => setResolution('1080p')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${resolution === '1080p' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    1080p
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={state.loading || !prompt}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2 shadow-lg shadow-indigo-100"
            >
              {state.loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Processing Operation...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-film"></i>
                  <span>Generate Cinematic Video</span>
                </>
              )}
            </button>
            
            {state.error && (
              <div className="mt-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-xl flex items-start animate-in fade-in zoom-in-95">
                <i className="fas fa-circle-exclamation mt-0.5 mr-2"></i>
                <span>{state.error}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col h-full">
          <div className={`flex-1 bg-slate-100 rounded-[32px] overflow-hidden shadow-inner border border-slate-200 flex items-center justify-center relative min-h-[450px] group ${aspectRatio === '9:16' ? 'aspect-[9/16] max-w-[300px] mx-auto' : 'aspect-video w-full'}`}>
            {!state.videoUrl ? (
              <div className="text-center p-12">
                {state.loading ? (
                  <div className="space-y-6">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <i className="fas fa-video text-indigo-600 text-2xl animate-pulse"></i>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-slate-800 font-bold text-xl">{state.progressMessage}</p>
                      <p className="text-slate-500 text-sm max-w-[280px] mx-auto">
                        Video generation can take a few minutes. Hang tight while our AI builds your scene.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 text-slate-400">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                      <i className="fas fa-clapperboard text-3xl"></i>
                    </div>
                    <p className="text-sm font-medium">The projector is waiting for your script...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full p-2 flex items-center justify-center animate-in fade-in zoom-in-95 duration-700">
                <div className="relative w-full h-full flex items-center justify-center">
                  <video 
                    src={state.videoUrl} 
                    controls 
                    autoPlay 
                    loop 
                    className="max-h-full max-w-full rounded-2xl shadow-2xl bg-black"
                  />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a 
                      href={state.videoUrl} 
                      download={`veo-video-${Date.now()}.mp4`}
                      className="bg-white/90 backdrop-blur-sm text-slate-800 h-12 w-12 rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                      title="Download Video"
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

export default VideoStudio;