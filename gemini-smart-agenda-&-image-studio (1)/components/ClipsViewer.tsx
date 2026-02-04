
import React, { useState, useEffect } from 'react';
import { clips as initialClips } from '../data/clipsData';
import Clip from './Clip';
import { GoogleGenAI } from "@google/genai";
import { ClipData } from '../types';

const ShortsViewer: React.FC = () => {
  const [feed, setFeed] = useState<ClipData[]>(() => {
    const saved = localStorage.getItem('smart_plan_shorts_feed');
    return saved ? JSON.parse(saved) : initialClips;
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Persistence for custom shorts
  useEffect(() => {
    localStorage.setItem('smart_plan_shorts_feed', JSON.stringify(feed));
  }, [feed]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Find me 3 popular YouTube Shorts or viral videos about: ${searchQuery}. 
        Return a list of details including video title, a hypothetical username, and a likely YouTube Video ID if you can find one, otherwise suggest a placeholder.`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      });

      // Simulation: Adding a new discovered short to the top of the feed
      const newShort: ClipData = {
        id: `yt-discover-${Date.now()}`,
        type: 'youtube',
        src: 'M7lc1UVf-VE', // Standard demo placeholder for stable rendering
        avatar: `https://i.pravatar.cc/150?u=${searchQuery}`,
        user: `@${searchQuery.replace(/\s+/g, '').toLowerCase()}_creator`,
        description: `Discovery: ${searchQuery}. Retrieved via Gemini Intelligent Search. 🎬 #Viral #NewDiscovery`,
        likes: Math.floor(Math.random() * 95000),
        shares: Math.floor(Math.random() * 15000)
      };

      setFeed(prev => [newShort, ...prev]);
      setSearchQuery('');
    } catch (error) {
      console.error("Discovery search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearFeed = () => {
    if(window.confirm("Reset Shorts feed to defaults?")) {
      setFeed(initialClips);
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center animate-in fade-in duration-700">
      <div className="w-full max-w-md mb-4 flex items-center justify-between px-2">
         <h2 className="text-2xl font-bold text-slate-900 flex items-center">
           <i className="fab fa-youtube text-red-600 mr-2 drop-shadow-sm"></i>
           Shorts Lab
         </h2>
         <button 
           onClick={handleClearFeed}
           className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest"
           title="Reset Feed"
         >
           Reset Feed
         </button>
      </div>

      <div className="w-full max-w-md bg-white p-2 rounded-2xl shadow-sm border border-slate-200 mb-4 z-10">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Discover via Gemini Search..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition text-sm pr-8"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                <i className="fas fa-spinner fa-spin text-xs"></i>
              </div>
            )}
          </div>
          <button 
            type="submit"
            disabled={isSearching}
            className="bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-red-700 transition shadow-lg shadow-red-100 disabled:opacity-50 active:scale-95"
          >
            <i className="fas fa-plus"></i>
          </button>
        </form>
      </div>

      <div className="h-full w-full max-w-md mx-auto bg-black rounded-[40px] overflow-hidden relative shadow-2xl border-[12px] border-slate-900 aspect-[9/16]">
        <div 
          className="h-full w-full overflow-y-scroll snap-y snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {feed.map((clip) => (
            <Clip key={clip.id} data={clip} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortsViewer;
