
import React, { useState } from 'react';
import { gemini } from '../services/geminiService';

const Translator: React.FC = () => {
  const [text, setText] = useState('');
  const [targetLang, setTargetLang] = useState('Japanese');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTranslate = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const response = await gemini.generateTravelAdvice(
        `Translate this text to ${targetLang} and provide a phonetic pronunciation guide. 
        Context: Traveling. 
        Text: "${text}"`,
        undefined,
        []
      );
      setResult(response.text);
    } catch (e) {
      setResult("Translation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Lingo Helper</h2>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">From</label>
              <div className="bg-slate-100 rounded-xl px-4 py-3 text-sm font-medium">Auto-detect</div>
            </div>
            <div className="flex items-end pb-3">
              <i className="fa-solid fa-arrow-right-long text-slate-300"></i>
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-slate-400 uppercase mb-1 block">To</label>
              <select 
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm font-medium"
              >
                <option value="Japanese">🇯🇵 Japanese</option>
                <option value="French">🇫🇷 French</option>
                <option value="Spanish">🇪🇸 Spanish</option>
                <option value="Italian">🇮🇹 Italian</option>
                <option value="Thai">🇹🇭 Thai</option>
                <option value="Hindi">🇮🇳 Hindi</option>
              </select>
            </div>
          </div>

          <textarea
            placeholder="Type what you want to say..."
            className="w-full h-32 bg-slate-50 border border-slate-100 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 transition-all resize-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          <button
            onClick={handleTranslate}
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
          >
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-language"></i>}
            Translate
          </button>
        </div>
      </div>

      {result && (
        <div className="bg-blue-600 text-white rounded-3xl p-6 shadow-xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Translation</span>
            <button className="text-white/80 hover:text-white"><i className="fa-solid fa-volume-high"></i></button>
          </div>
          <div className="text-lg font-medium leading-relaxed mb-4">
            {result.split('\n')[0]}
          </div>
          <div className="pt-4 border-t border-white/20">
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">How to pronounce</p>
            <p className="text-sm opacity-90">{result.includes('\n') ? result.split('\n').slice(1).join('\n') : 'Phonetic guide coming soon...'}</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase ml-2">Quick Phrases</h3>
        <div className="grid grid-cols-2 gap-3">
          {[
            { en: "Where is the bathroom?", icon: "fa-restroom" },
            { en: "How much is this?", icon: "fa-tag" },
            { en: "I have an allergy", icon: "fa-virus" },
            { en: "Need help, please", icon: "fa-hand-holding-medical" }
          ].map((item, i) => (
            <button
              key={i}
              onClick={() => setText(item.en)}
              className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center gap-3 hover:bg-slate-50 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <i className={`fa-solid ${item.icon} text-xs`}></i>
              </div>
              <span className="text-xs font-medium text-slate-700 text-left">{item.en}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Translator;
