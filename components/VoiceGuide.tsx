
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

const VoiceGuide: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking'>('idle');
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  // Helper functions for audio processing
  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (
    data: Uint8Array,
    ctx: AudioContext,
    sampleRate: number,
    numChannels: number,
  ): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const startSession = async () => {
    setStatus('connecting');
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    
    // Initialize audio contexts
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (!inputContextRef.current) {
      inputContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    const sessionPromise = ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: {
        onopen: () => {
          setStatus('listening');
          const source = inputContextRef.current!.createMediaStreamSource(stream);
          const scriptProcessor = inputContextRef.current!.createScriptProcessor(4096, 1, 1);
          scriptProcessor.onaudioprocess = (e) => {
            const inputData = e.inputBuffer.getChannelData(0);
            const pcmBlob = createBlob(inputData);
            sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
          };
          source.connect(scriptProcessor);
          scriptProcessor.connect(inputContextRef.current!.destination);
        },
        onmessage: async (msg: LiveServerMessage) => {
          if (msg.serverContent?.outputTranscription) {
            const text = msg.serverContent.outputTranscription.text;
            setTranscription(prev => [...prev, text]);
          }

          const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
          if (base64Audio && audioContextRef.current) {
            setStatus('speaking');
            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioContextRef.current.currentTime);
            const buffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.start(nextStartTimeRef.current);
            nextStartTimeRef.current += buffer.duration;
            sourcesRef.current.add(source);
            source.onended = () => {
              sourcesRef.current.delete(source);
              if (sourcesRef.current.size === 0) setStatus('listening');
            };
          }

          if (msg.serverContent?.interrupted) {
            sourcesRef.current.forEach(s => s.stop());
            sourcesRef.current.clear();
            nextStartTimeRef.current = 0;
            setStatus('listening');
          }
        },
        onerror: (e) => console.error("Live API Error", e),
        onclose: () => {
          setStatus('idle');
          setIsActive(false);
        }
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        systemInstruction: "You are NomadAI Live. Speak like a real-time tour guide. Keep responses short and conversational. If the user stops talking, wait for them. If they ask about surroundings, provide interesting facts.",
        outputAudioTranscription: {}
      }
    });

    sessionRef.current = await sessionPromise;
    setIsActive(true);
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsActive(false);
    setStatus('idle');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-900 text-white">
      <div className="text-center space-y-4 mb-12">
        <h2 className="text-2xl font-bold">Interactive Live Guide</h2>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">
          Talk to NomadAI in real-time as you explore. No typing needed—just like having a local friend on call.
        </p>
      </div>

      <div className="relative flex items-center justify-center mb-12">
        {isActive && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 bg-blue-500/20 rounded-full animate-ping"></div>
            <div className="absolute w-40 h-40 bg-blue-500/40 rounded-full animate-pulse"></div>
          </div>
        )}
        <button
          onClick={isActive ? stopSession : startSession}
          className={`relative z-10 w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all ${
            isActive ? 'bg-red-500 shadow-2xl shadow-red-500/50' : 'bg-blue-600 shadow-2xl shadow-blue-500/50'
          }`}
        >
          <i className={`fa-solid ${isActive ? 'fa-stop' : 'fa-microphone'} text-3xl mb-1`}></i>
          <span className="text-[10px] font-bold uppercase tracking-widest">{isActive ? 'Stop' : 'Start'}</span>
        </button>
      </div>

      <div className="w-full space-y-4 max-h-48 overflow-y-auto no-scrollbar">
        <div className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
          {status === 'connecting' ? 'Establishing Connection...' : status === 'listening' ? 'Listening...' : status === 'speaking' ? 'NomadAI is speaking' : 'Tap to start conversation'}
        </div>
        {transcription.slice(-3).map((line, i) => (
          <p key={i} className="text-sm text-center text-slate-300 italic opacity-80 animate-in fade-in slide-in-from-bottom-2">
            "{line}"
          </p>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-2 gap-4 w-full max-w-sm">
        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Voice</p>
          <p className="text-sm">Kore (English)</p>
        </div>
        <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase">Latency</p>
          <p className="text-sm text-green-400">&lt; 300ms</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceGuide;
