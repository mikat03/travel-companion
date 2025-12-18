
import React, { useState, useEffect } from 'react';
import { gemini } from '../services/geminiService';

const SafetyCenter: React.FC = () => {
  const [locationName, setLocationName] = useState('Detecting location...');
  const [regionStatus, setRegionStatus] = useState('Checking...');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [etiquette, setEtiquette] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocationData = async () => {
      setIsLoading(true);
      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 });
        });
        const data = await gemini.getSafetyAlerts(position.coords.latitude, position.coords.longitude);
        setLocationName(data.locationName);
        setRegionStatus(data.regionStatus);
        setAlerts(data.alerts);
        setEtiquette(data.etiquette);
      } catch (err) {
        setRegionStatus('Unknown');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLocationData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="w-16 h-16 border-4 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Scanning Local Data</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* Urgent Emergency Card */}
      <div className="bg-red-500 text-white rounded-[3rem] p-8 shadow-2xl shadow-red-500/30 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
          <i className="fa-solid fa-shield-heart text-[8rem]"></i>
        </div>
        <div className="relative z-10">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] opacity-80 mb-4">Immediate Action</h3>
          <p className="text-2xl font-black mb-6 leading-tight tracking-tighter">Emergency assistance is one tap away.</p>
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-white text-red-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg">
              <i className="fa-solid fa-phone"></i> Local Police
            </button>
            <button className="bg-white/20 backdrop-blur-md text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 border border-white/30">
              <i className="fa-solid fa-hospital"></i> Medical
            </button>
          </div>
        </div>
      </div>

      {/* Safety Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Regional Alerts</h3>
          <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Live Updates
          </span>
        </div>
        
        {alerts.map((alert, i) => (
          <div key={i} className="bg-white/40 backdrop-blur-2xl border border-white/60 p-6 rounded-[2.5rem] flex gap-5 shadow-xl shadow-black/5">
            <div className={`w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl ${
              alert.severity === 'high' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
            }`}>
              <i className={`fa-solid ${alert.severity === 'high' ? 'fa-triangle-exclamation' : 'fa-info-circle'}`}></i>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-slate-900 tracking-tight">{alert.title}</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">{alert.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Etiquette Card */}
      <div className="bg-indigo-950 text-white rounded-[3rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        <div className="relative z-10">
          <h3 className="text-xs font-black uppercase tracking-[0.3em] text-indigo-400 mb-6">Cultural Intelligence</h3>
          <div className="space-y-4">
            {etiquette.map((tip, i) => (
              <div key={i} className="flex gap-4 items-start">
                <span className="w-6 h-6 rounded-lg bg-indigo-500/30 flex items-center justify-center flex-shrink-0 text-[10px] font-bold">
                  {i + 1}
                </span>
                <p className="text-sm font-medium leading-relaxed opacity-90">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafetyCenter;
