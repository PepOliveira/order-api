"use client";

import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause, Loader2 } from "lucide-react";

interface CustomAudioPlayerProps {
  url: string;
  id?: string;
  playingId?: string | null;
  onPlayStart?: (id: string) => void;
  className?: string; // Optional wrapper styles
  waveColor?: string;
  progressColor?: string;
  height?: number;
}

export default function CustomAudioPlayer({ 
  url, 
  id,
  playingId,
  onPlayStart,
  className = "",
  waveColor = "#4f46e5", // indigo-600
  progressColor = "#a5b4fc", // indigo-300
  height = 40
}: CustomAudioPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [duration, setDuration] = useState("0:00");
  const [currentTime, setCurrentTime] = useState("0:00");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: waveColor,
      progressColor: progressColor,
      cursorColor: "transparent",
      barWidth: 2,
      barGap: 3,
      barRadius: 2,
      height: height,
      normalize: true,
      url: url,
    });

    wavesurferRef.current = ws;

    ws.on('ready', () => {
      setIsReady(true);
      setDuration(formatTime(ws.getDuration()));
    });

    ws.on('audioprocess', () => {
      setCurrentTime(formatTime(ws.getCurrentTime()));
    });

    ws.on('play', () => {
      setIsPlaying(true);
      if (onPlayStart && id) {
        onPlayStart(id);
      }
    });
    
    ws.on('pause', () => setIsPlaying(false));
    ws.on('finish', () => setIsPlaying(false));
    ws.on('interaction', () => {
      setCurrentTime(formatTime(ws.getCurrentTime()));
    });

    return () => {
      ws.destroy();
    };
  }, [url, waveColor, progressColor, height]);

  // Pause if another player started
  useEffect(() => {
    if (id && playingId && playingId !== id && isPlaying && wavesurferRef.current) {
      wavesurferRef.current.pause();
    }
  }, [playingId, id, isPlaying]);

  const togglePlay = () => {
    if (wavesurferRef.current && isReady) {
      wavesurferRef.current.playPause();
    }
  };

  return (
    <div className={`flex items-center gap-4 w-full bg-zinc-900/50 p-3 rounded-2xl border border-zinc-800/80 shadow-inner backdrop-blur-sm ${className}`}>
      <button 
        onClick={togglePlay}
        disabled={!isReady}
        className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
      >
        {!isReady ? (
          <Loader2 size={24} className="animate-spin" />
        ) : isPlaying ? (
          <Pause size={24} fill="currentColor" className="group-hover:scale-110 transition-transform" />
        ) : (
          <Play size={24} fill="currentColor" className="ml-1 group-hover:scale-110 transition-transform" />
        )}
      </button>

      <div className="flex-1 flex flex-col justify-center min-w-0 pt-1">
        <div ref={containerRef} className="w-full relative overflow-hidden cursor-pointer" />
        <div className="flex justify-between items-center text-[10px] font-bold text-zinc-500 mt-1 uppercase tracking-widest px-1">
          <span>{currentTime}</span>
          <span>{duration}</span>
        </div>
      </div>
    </div>
  );
}
