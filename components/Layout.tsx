
import React from 'react';
import { TabType } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  locationName?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, activeTab, setActiveTab, locationName }) => {
  const navItems: { id: TabType; icon: string; label: string }[] = [
    { id: 'chat', icon: 'fa-comments', label: 'Guide' },
    { id: 'lens', icon: 'fa-camera-retro', label: 'Lens' },
    { id: 'itinerary', icon: 'fa-calendar-days', label: 'Plan' },
    { id: 'voice', icon: 'fa-microphone', label: 'Live' },
    { id: 'safety', icon: 'fa-shield-halved', label: 'Safety' },
  ];

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto relative overflow-hidden font-sans selection:bg-blue-100">
      {/* Cinematic Header - Enhanced Contrast */}
      <header className="px-6 py-8 flex items-center justify-between z-20 relative">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 bg-white/95 backdrop-blur-xl border-2 border-white rounded-2xl flex items-center justify-center text-slate-900 shadow-2xl">
              <i className="fa-solid fa-compass text-2xl"></i>
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div className="space-y-0.5">
            <h1 className="font-black text-2xl tracking-tighter leading-none text-white drop-shadow-lg">NomadAI</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 drop-shadow-md">
              {locationName || 'Global Discovery'}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-white flex items-center justify-center hover:bg-white transition-all shadow-lg">
            <i className="fa-solid fa-bell text-sm text-slate-900"></i>
          </button>
          <button className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-2xl hover:scale-105 transition-all">
            <i className="fa-solid fa-user text-sm"></i>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-4 pb-32 pt-2 relative z-10 no-scrollbar">
        {children}
      </main>

      {/* Elevated Floating Navigation - High Contrast */}
      <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto bg-slate-900/95 backdrop-blur-3xl border border-white/20 p-2 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.4)] flex items-center gap-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 ${
                activeTab === item.id 
                ? 'bg-white text-slate-900 shadow-xl scale-105' 
                : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-lg`}></i>
              {activeTab === item.id && (
                <span className="text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-left-2">{item.label}</span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Layout;
