
import React, { useState, useRef, useEffect } from 'react';
import { gemini } from '../services/geminiService';

const LensMode: React.FC = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' }, 
          audio: false 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || isAnalyzing) return;

    setIsAnalyzing(true);
    setResult(null);

    const context = canvasRef.current.getContext('2d');
    if (context) {
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
      
      const base64Data = canvasRef.current.toDataURL('image/jpeg', 0.8).split(',')[1];
      
      try {
        const analysis = await gemini.identifyImage(base64Data);
        setResult(analysis);
      } catch (error) {
        setResult("Sorry, I couldn't identify this. Try another angle or better lighting.");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  return (
    <div className="h-full flex flex-col relative bg-black overflow-hidden rounded-[3rem]">
      {/* Live Camera View */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Hidden Canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Camera UI Overlays */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-between p-8">
        <div className="w-full flex justify-between items-start pointer-events-auto">
          <div className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">
            <p className="text-[10px] font-black uppercase tracking-widest text-white">NomadAI Lens</p>
          </div>
        </div>

        {/* Scan Frame */}
        <div className="w-64 h-64 border-2 border-white/50 rounded-[2rem] relative">
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-xl"></div>
          {isAnalyzing && <div className="absolute inset-0 bg-blue-500/20 animate-pulse rounded-[2rem]"></div>}
        </div>

        <div className="w-full flex flex-col items-center gap-6 pointer-events-auto">
          {result && (
            <div className="w-full bg-white/95 backdrop-blur-3xl p-6 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-bottom-8">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-blue-600">Identification</h3>
                <button onClick={() => setResult(null)} className="text-slate-400 hover:text-slate-900">
                  <i className="fa-solid fa-circle-xmark"></i>
                </button>
              </div>
              <p className="text-sm font-bold text-slate-900 leading-relaxed">{result}</p>
            </div>
          )}

          <button
            onClick={captureAndAnalyze}
            disabled={isAnalyzing}
            className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all ${
              isAnalyzing ? 'border-blue-500 bg-blue-500/20' : 'border-white hover:scale-110 active:scale-95'
            }`}
          >
            {isAnalyzing ? (
              <i className="fa-solid fa-spinner animate-spin text-white text-2xl"></i>
            ) : (
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <i className="fa-solid fa-camera text-slate-900 text-xl"></i>
              </div>
            )}
          </button>
          
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">Tap to Identify</p>
        </div>
      </div>
    </div>
  );
};

export default LensMode;
