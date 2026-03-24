"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Quote } from "lucide-react";
import CustomAudioPlayer from "@/components/CustomAudioPlayer";

export default function EmbedPage() {
  const { id } = useParams();
  const [collection, setCollection] = useState<any>(null);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const apiUrl = "";

  useEffect(() => {
    if (id) fetchEmbedData();
  }, [id]);

  const fetchEmbedData = async () => {
    try {
      const [colRes, testRes] = await Promise.all([
        fetch(`${apiUrl}/api/collections/${id}`),
        fetch(`${apiUrl}/api/testimonials/embed/${id}`)
      ]);
      
      if (colRes.ok) setCollection(await colRes.json());
      if (testRes.ok) setTestimonials(await testRes.json());
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="h-40 flex items-center justify-center font-medium text-zinc-500 animate-pulse">Loading Testimonials...</div>;
  if (!collection) return <div className="p-4 text-center text-rose-500 font-bold">Widget error: Collection not found</div>;

  return (
    <div className="bg-transparent p-4 font-sans max-w-4xl mx-auto">
      {testimonials.length === 0 ? (
        <div className="text-center text-zinc-500 italic p-6 border border-zinc-800 border-dashed rounded-2xl bg-zinc-900/50 backdrop-blur-sm">
          No testimonials to show yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {testimonials.map((test, idx) => (
              <motion.div
                key={test.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-zinc-900/80 backdrop-blur-md rounded-2xl p-6 border border-zinc-800 hover:border-indigo-500/50 transition-all group relative overflow-hidden shadow-lg"
              >
                <div className="absolute -right-4 -top-4 text-zinc-800 opacity-20 transform -rotate-12 group-hover:scale-110 group-hover:text-indigo-900/40 transition-all pointer-events-none">
                   <Quote size={80} fill="currentColor" />
                </div>
                
                <div className="flex flex-col h-full justify-between relative z-10">
                  <div className="mb-5">
                    <h4 className="font-extrabold text-white text-[17px] tracking-wide">{test.client_name}</h4>
                    <p className="text-indigo-400 text-sm font-semibold">{test.client_job_title}</p>
                  </div>
                  
                  <div className="rounded-xl flex items-center">
                    <CustomAudioPlayer 
                      url={test.audio_url} 
                      id={test.id}
                      playingId={playingAudio}
                      onPlayStart={(id) => setPlayingAudio(id)}
                      waveColor="#818cf8" 
                      progressColor="#c7d2fe"
                      className="bg-black/40 border border-zinc-800/80 shadow-inner"
                    />
                  </div>
                  
                  {test.transcript && (
                    <div className="mt-4 pt-4 border-t border-zinc-800/50 relative">
                       <Quote size={12} className="text-zinc-600 absolute -top-1.5 left-2 bg-zinc-900 px-0.5" />
                       <p className="text-sm text-zinc-300 italic leading-relaxed px-1 tracking-wide">
                         "{test.transcript}"
                       </p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      <style dangerouslySetInnerHTML={{__html:`
        .custom-audio-player::-webkit-media-controls-panel { background-color: #18181b; }
        .custom-audio-player::-webkit-media-controls-current-time-display,
        .custom-audio-player::-webkit-media-controls-time-remaining-display { color: #a1a1aa; }
      `}} />
    </div>
  );
}
