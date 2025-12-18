
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import SceneBackground from './components/SceneBackground';
import ChatInterface from './components/ChatInterface';
import ItineraryBuilder from './components/ItineraryBuilder';
import VoiceGuide from './components/VoiceGuide';
import Translator from './components/Translator';
import SafetyCenter from './components/SafetyCenter';
import LensMode from './components/LensMode';
import { TabType, SceneState, TimeOfDay } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [hasConsent, setHasConsent] = useState(false);
  
  const [scene, setScene] = useState<SceneState>({
    destination: 'Kyoto, Japan',
    theme: 'nature',
    timeOfDay: 'day',
    weather: 'clear'
  });

  // Automatically adjust time of day based on clock
  useEffect(() => {
    const hour = new Date().getHours();
    let time: TimeOfDay = 'day';
    if (hour < 6 || hour > 20) time = 'night';
    else if (hour >= 6 && hour < 9) time = 'sunrise';
    else if (hour >= 18 && hour <= 20) time = 'sunset';
    
    setScene(prev => ({ ...prev, timeOfDay: time }));
  }, []);

  const handleLocationChange = (newLoc: string) => {
    setScene(prev => ({ ...prev, destination: newLoc }));
  };

  if (!hasConsent) {
    return (
      <div className="fixed inset-0 bg-slate-950 flex items-center justify-center p-6 z-[100]">
        <SceneBackground scene={scene} />
        <div className="bg-white/40 backdrop-blur-3xl border border-white/30 rounded-[3rem] p-10 max-w-sm w-full shadow-2xl relative z-10 animate-in zoom-in duration-700">
          <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white mb-8 mx-auto shadow-2xl shadow-blue-500/40">
            <i className="fa-solid fa-plane-up text-3xl"></i>
          </div>
          <h1 className="text-3xl font-black text-center text-slate-900 mb-4 tracking-tighter">Your World, <br/>Curated.</h1>
          <p className="text-slate-600 text-sm text-center mb-10 leading-relaxed font-medium">
            Step into an immersive travel experience guided by intelligence. We personalize your journey using your location and local context.
          </p>
          <button 
            onClick={() => setHasConsent(true)}
            className="w-full bg-slate-900 text-white font-bold py-5 rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20 uppercase tracking-widest text-xs"
          >
            Start Your Adventure
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SceneBackground scene={scene} />
      <Layout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        locationName={scene.destination}
      >
        <div className="h-full relative z-10">
          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'lens' && <LensMode />}
          {activeTab === 'itinerary' && <ItineraryBuilder onLocationChange={handleLocationChange} currentLoc={scene.destination} />}
          {activeTab === 'voice' && <VoiceGuide />}
          {activeTab === 'translate' && <Translator />}
          {activeTab === 'safety' && <SafetyCenter />}
        </div>
      </Layout>
    </div>
  );
};

export default App;
