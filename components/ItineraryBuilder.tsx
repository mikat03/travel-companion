
import React, { useState, useEffect } from 'react';
import { gemini } from '../services/geminiService';
import { ActivitySuggestion } from '../types';

interface ItineraryBuilderProps {
  onLocationChange?: (newLoc: string) => void;
  currentLoc?: string;
}

const ItineraryBuilder: React.FC<ItineraryBuilderProps> = ({ onLocationChange, currentLoc }) => {
  const [destination, setDestination] = useState(currentLoc || '');
  const [days, setDays] = useState(3);
  const [prefs, setPrefs] = useState('Relaxed, food-focused');
  const [itinerary, setItinerary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ActivitySuggestion[]>([]);
  const [suggestLoading, setSuggestLoading] = useState(false);

  const fetchSuggestions = async (loc: string) => {
    if (!loc) return;
    setSuggestLoading(true);
    try {
      const data = await gemini.getQuickSuggestions(loc);
      setSuggestions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSuggestLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!destination) return;
    setLoading(true);
    if (onLocationChange) onLocationChange(destination);
    try {
      const result = await gemini.createItinerary(destination, days, prefs);
      setItinerary(result || "Failed to generate itinerary.");
    } catch (error) {
      setItinerary("Sorry, I couldn't build that itinerary right now.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch suggestions when destination is blurred or changed significantly
  const handleDestBlur = () => {
    if (destination && destination !== currentLoc) {
      fetchSuggestions(destination);
      if (onLocationChange) onLocationChange(destination);
    }
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="bg-white/95 backdrop-blur-3xl rounded-[3rem] p-8 shadow-2xl border border-white/20">
        <h2 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Smart Planner</h2>
        
        <div className="space-y-6">
          <div className="group">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Destination</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="e.g. Kyoto, Japan"
                className="w-full bg-slate-100/80 border-2 border-transparent focus:border-blue-500 rounded-2xl px-6 py-4 text-sm font-bold transition-all focus:bg-white"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onBlur={handleDestBlur}
              />
              <i className="fa-solid fa-magnifying-glass absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500"></i>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Duration</label>
              <div className="flex items-center bg-slate-100 rounded-2xl p-1">
                <button onClick={() => setDays(Math.max(1, days-1))} className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-white rounded-xl transition-all shadow-sm">
                  <i className="fa-solid fa-minus text-xs"></i>
                </button>
                <span className="flex-1 text-center font-black text-slate-800 text-sm">{days} Days</span>
                <button onClick={() => setDays(Math.min(14, days+1))} className="w-10 h-10 flex items-center justify-center text-slate-600 hover:bg-white rounded-xl transition-all shadow-sm">
                  <i className="fa-solid fa-plus text-xs"></i>
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block ml-1">Vibe</label>
              <select 
                className="w-full bg-slate-100 border-none rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-blue-500"
                value={prefs}
                onChange={(e) => setPrefs(e.target.value)}
              >
                <option value="Relaxed, food-focused">🍮 Relaxed</option>
                <option value="Action-packed, sightseeing">📸 Sightseeing</option>
                <option value="Budget-friendly, local vibes">🎒 Budget</option>
                <option value="Luxury, exclusive experiences">✨ Luxury</option>
              </select>
            </div>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-slate-900/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
            Generate Journey
          </button>
        </div>
      </div>

      {/* Suggested Activities Grid */}
      {destination && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white/80">Must-Do In {destination}</h3>
            <button onClick={() => fetchSuggestions(destination)} className="text-white/60 hover:text-white transition-colors">
              <i className={`fa-solid fa-rotate-right text-xs ${suggestLoading ? 'animate-spin' : ''}`}></i>
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {suggestLoading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="w-48 h-40 bg-white/20 backdrop-blur-md rounded-3xl animate-pulse flex-shrink-0"></div>
              ))
            ) : suggestions.length > 0 ? suggestions.map((act, i) => (
              <div key={i} className="w-48 bg-white/40 backdrop-blur-2xl border border-white/40 p-5 rounded-[2.5rem] flex-shrink-0 shadow-xl group hover:bg-white/60 transition-all">
                <div className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <i className="fa-solid fa-star text-xs"></i>
                </div>
                <h4 className="text-sm font-black text-slate-900 mb-1 leading-tight">{act.title}</h4>
                <p className="text-[10px] text-slate-600 font-bold uppercase mb-2 text-blue-600">{act.category}</p>
                <p className="text-[11px] text-slate-700 leading-snug line-clamp-2">{act.description}</p>
              </div>
            )) : (
              <div className="w-full p-8 text-center bg-white/20 backdrop-blur-sm rounded-3xl border border-dashed border-white/20">
                <p className="text-xs text-white/60">Enter a location to see trending activities.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {itinerary && (
        <div className="bg-slate-900 text-white rounded-[3rem] p-8 shadow-2xl border border-white/10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-black text-2xl tracking-tighter">Day-by-Day Journey</h3>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mt-1">Generated by NomadAI</p>
            </div>
            <button className="bg-white/10 hover:bg-white/20 p-3 rounded-2xl transition-all">
              <i className="fa-solid fa-download"></i>
            </button>
          </div>
          <div className="prose prose-sm prose-invert max-w-none">
            <div className="whitespace-pre-wrap text-sm leading-loose font-medium opacity-90">
              {itinerary}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItineraryBuilder;
