"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Copy, CheckCircle2, Play, Square, Code, ArrowLeft, Mic, Trash2, Check, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import CustomAudioPlayer from "@/components/CustomAudioPlayer"; // <<

export default function CollectionDetailsPage() {
  const { id } = useParams();
  const { userId } = useAuth();
  const [collection, setCollection] = useState<any>(null);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

  const apiUrl = "";
  
  useEffect(() => {
    if (userId && id) {
      fetchCollectionDetails();
    }
  }, [userId, id]);

  const fetchCollectionDetails = async () => {
    try {
      const [colRes, testRes] = await Promise.all([
        fetch(`${apiUrl}/api/collections/${id}`),
        fetch(`${apiUrl}/api/testimonials/collection/${id}`)
      ]);
      
      if (colRes.ok) setCollection(await colRes.json());
      if (testRes.ok) setTestimonials(await testRes.json());
    } catch (error) {
      console.error("Failed to fetch details", error);
      toast.error("Failed to load collection details");
    } finally {
      setIsLoading(false);
    }
  };

  const publicLink = typeof window !== "undefined" ? `${window.location.origin}/c/${collection?.public_slug}` : "";
  const embedLink = typeof window !== "undefined" ? `${window.location.origin}/embed/${collection?.id}` : "";

  const embedCode = `<iframe src="${embedLink}" width="100%" height="600px" frameborder="0" style="border:none; border-radius: 16px; overflow:hidden;"></iframe>`;

  const copyToClipboard = (text: string, isEmbed: boolean) => {
    navigator.clipboard.writeText(text);
    toast.success(isEmbed ? "Iframe embed code copied to clipboard!" : "Public sharing link copied to clipboard!");
    if (isEmbed) {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const toggleAudio = (url: string) => {
    if (playingAudio === url) {
      setPlayingAudio(null);
    } else {
      setPlayingAudio(url);
    }
  };

  const handleApprove = async (testId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'approved' ? 'rejected' : 'approved';
    try {
      const res = await fetch(`${apiUrl}/api/testimonials/${testId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setTestimonials(prev => prev.map(t => t.id === testId ? { ...t, status: newStatus } : t));
        toast.success(`Testimonial physically ${newStatus === 'approved' ? 'approved' : 'rejected'}`);
      } else {
        toast.error("Failed to update status");
      }
    } catch (error) {
       toast.error("Network error");
    }
  };

  const handleDelete = async (testId: string) => {
    if (!confirm("Are you sure you want to completely delete this testimonial audio?")) return;
    try {
      const res = await fetch(`${apiUrl}/api/testimonials/${testId}`, { method: 'DELETE' });
      if (res.ok) {
        setTestimonials(prev => prev.filter(t => t.id !== testId));
        toast.success("Testimonial audio destroyed forever.");
      } else {
        toast.error("Failed to delete testimonial");
      }
    } catch (error) {
       toast.error("Network error preventing deletion");
    }
  };

  if (isLoading) return (
    <div className="space-y-6 animate-pulse">
       <div className="h-12 w-1/3 bg-zinc-900 rounded-xl"></div>
       <div className="h-[400px] bg-zinc-900 rounded-3xl"></div>
    </div>
  );
  if (!collection) return <div className="text-center py-12 text-zinc-400">Collection not found</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 min-h-[calc(100vh-4rem)] bg-zinc-950 text-zinc-50 p-6 md:p-10 rounded-3xl border border-zinc-900/80 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 -m-32 w-96 h-96 bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="flex items-center gap-4 mb-8 relative z-10">
        <Link href="/dashboard" className="p-3 bg-zinc-900/80 border border-zinc-800 rounded-xl hover:bg-zinc-800 hover:text-white text-zinc-400 backdrop-blur-md transition-all hover:scale-105">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">{collection.name}</h1>
          <p className="text-indigo-400 mt-1 text-sm font-semibold flex items-center gap-2">
            Campaign Hub
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        {/* Share & Code Section */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800/80 shadow-xl backdrop-blur-md hover:border-indigo-500/30 transition-all duration-300"
          >
            <h2 className="text-2xl font-bold mb-3 text-white">Share Public Link</h2>
            <p className="text-zinc-400 text-sm mb-6">Send this link to your clients so they can record and submit their testimonial.</p>
            <div className="flex items-center gap-3">
              <input 
                type="text" 
                readOnly 
                value={publicLink} 
                className="flex-1 rounded-xl border-zinc-700 border bg-zinc-800/50 px-4 py-3.5 text-sm text-zinc-300 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
              <button 
                onClick={() => copyToClipboard(publicLink, false)}
                className="p-3.5 bg-indigo-600 text-white hover:bg-indigo-500 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center shrink-0 hover:scale-105 active:scale-95"
              >
                {copiedLink ? <CheckCircle2 size={20} className="text-green-300" /> : <Copy size={20} />}
              </button>
            </div>
            <div className="mt-6 flex justify-end">
               <a href={publicLink} target="_blank" rel="noreferrer" className="text-sm font-bold text-indigo-400 hover:text-indigo-300 hover:underline flex items-center gap-1 group">
                 Open link in new tab <ArrowLeft className="rotate-135 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" size={14}/>
               </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
            className="bg-zinc-900/50 p-8 rounded-3xl border border-zinc-800/80 shadow-xl backdrop-blur-md hover:border-indigo-500/30 transition-all duration-300"
          >
            <h2 className="text-2xl font-bold mb-3 text-white">Embed on your Website</h2>
            <p className="text-zinc-400 text-sm mb-6">Copy and paste this iframe code to securely show <strong className="text-white">approved</strong> testimonials on your own site.</p>
            <div className="relative group">
              <textarea 
                readOnly 
                value={embedCode} 
                className="w-full rounded-xl border-zinc-800 border bg-[#09090b] text-indigo-300 px-5 py-4 text-sm font-mono h-32 resize-none outline-none focus:border-indigo-500/50 transition-colors"
              />
              <button 
                onClick={() => copyToClipboard(embedCode, true)}
                className="absolute top-3 right-3 p-2 bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-lg transition-all shadow-md active:scale-95"
                title="Copy Iframe Code"
              >
                {copiedEmbed ? <CheckCircle2 size={18} className="text-green-400" /> : <Code size={18} />}
              </button>
            </div>
          </motion.div>
        </div>

        {/* Testimonials List */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
          className="bg-zinc-900/40 p-8 rounded-3xl border border-zinc-800/50 shadow-2xl flex flex-col h-[calc(100vh-14rem)] min-h-[600px] backdrop-blur-md"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
              Inbox 
              <span className="bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 py-1 px-3 rounded-full text-xs font-extrabold shadow-inner">
                {testimonials.length}
              </span>
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 futuristic-scrollbar">
            {testimonials.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
                <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4 border border-zinc-700/50 shadow-inner">
                  <Mic size={32} className="text-zinc-500" />
                </div>
                <p className="text-zinc-400 text-sm max-w-[200px]">No testimonials collected yet. Share your link to get started!</p>
              </div>
            ) : (
              <AnimatePresence>
                {testimonials.map((test, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ delay: i * 0.05 }}
                    key={test.id} 
                    className="p-5 bg-zinc-900/80 border border-zinc-800 rounded-2xl hover:border-zinc-700 transition-all shadow-md group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h4 className="font-extrabold text-zinc-100 text-lg">{test.client_name}</h4>
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest border ${
                              test.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                              test.status === 'rejected' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                              'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                            {test.status || 'pending'}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-zinc-500">{test.client_job_title}</p>
                      </div>
                      <span className="text-[10px] text-zinc-600 font-bold tracking-wider">
                        {new Date(test.created_at).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      </span>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1 w-full rounded-xl">
                        <CustomAudioPlayer 
                          url={test.audio_url} 
                          id={test.id}
                          playingId={playingAudio}
                          onPlayStart={(id) => setPlayingAudio(id)}
                        />
                      </div>

                      {test.transcript && (
                        <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50 relative group-hover:border-zinc-700/50 transition-colors">
                          <p className="text-sm text-zinc-300 italic leading-relaxed">"{test.transcript}"</p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-end gap-2 mt-2">
                        <button 
                          onClick={() => handleApprove(test.id, test.status)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm focus:outline-none ${
                            test.status === 'approved' 
                              ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/10' 
                              : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/10 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          }`}
                          title={test.status === 'approved' ? "Change to Rejected" : "Approve & Publish"}
                        >
                          {test.status === 'approved' ? <><X size={14} /> Refuse</> : <><Check size={14} /> Approve</>}
                        </button>
                        
                        <div className="w-px h-4 bg-zinc-800 mx-1"></div>

                        <button 
                          onClick={() => handleDelete(test.id)}
                          className="flex items-center justify-center p-2 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 rounded-lg transition-all focus:outline-none"
                          title="Permanently Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
{/* Added this tiny style block so the scrollbar matches the dark future theme */}
<style dangerouslySetInnerHTML={{__html:`
  .futuristic-scrollbar::-webkit-scrollbar { width: 6px; }
  .futuristic-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .futuristic-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
  .futuristic-scrollbar::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
  .custom-audio-player::-webkit-media-controls-panel { background-color: #18181b; }
  .custom-audio-player::-webkit-media-controls-current-time-display,
  .custom-audio-player::-webkit-media-controls-time-remaining-display { color: #a1a1aa; }
`}} />
    </div>
  );
}
