
import React, { useMemo } from 'react';
import { SceneState } from '../types';

interface SceneBackgroundProps {
  scene: SceneState;
}

const SceneBackground: React.FC<SceneBackgroundProps> = ({ scene }) => {
  const imageUrl = useMemo(() => {
    const query = encodeURIComponent(scene.destination);
    return `https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1920&ixid=${query}`;
    // Using a reliable landscape placeholder that feels like travel if Unsplash dynamic fails
    // But for "online pictures", we can construct a search URL
  }, [scene.destination]);

  // Actually, let's use a more direct Unsplash Source dynamic URL for better results
  const dynamicImageUrl = `https://images.unsplash.com/photo-1493246507139-91e8bef99c02?q=80&w=2070&auto=format&fit=crop`; // Default
  const actualUrl = `https://source.unsplash.com/featured/1600x900/?${encodeURIComponent(scene.destination)},travel`;

  const getOverlayColor = () => {
    switch(scene.timeOfDay) {
      case 'night': return 'bg-slate-950/70';
      case 'sunset': return 'bg-orange-950/50';
      case 'sunrise': return 'bg-indigo-950/40';
      default: return 'bg-slate-900/40';
    }
  };

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-black">
      {/* Dynamic Location Image */}
      <div 
        className="absolute inset-0 transition-all duration-1000 scale-105"
        style={{
          backgroundImage: `url('${actualUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px) saturate(1.2)'
        }}
      ></div>

      {/* High Contrast Color Overlay */}
      <div className={`absolute inset-0 transition-colors duration-1000 ${getOverlayColor()}`}></div>

      {/* Ambient Visual Effects */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
        <div className="absolute inset-0 opacity-[0.05] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>
    </div>
  );
};

export default SceneBackground;
