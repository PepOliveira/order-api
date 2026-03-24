"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Mic, StopCircle, Loader2, CheckCircle, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import CustomAudioPlayer from "@/components/CustomAudioPlayer";

export default function SubmissionPage() {
  const { slug } = useParams();
  const [collection, setCollection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  // Form states
  const [name, setName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const apiUrl = "";

  useEffect(() => {
    if (slug) fetchCollection();
  }, [slug]);

  const fetchCollection = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/collections/slug/${slug}`);
      if (res.ok) {
        setCollection(await res.json());
      } else {
         toast.error("Campaign not found");
      }
    } catch (error) {
      console.error(error);
      toast.error("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioUrl(audioUrl);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 119) {
            setTimeout(() => stopRecording(), 0);
            return 120;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone", error);
      toast.error("Microphone access is required to record a testimonial.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) clearInterval(timerRef.current);
      
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const reRecord = () => {
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!audioBlob || !name.trim()) return;

    setIsSubmitting(true);
    
    try {
      let publicUrl = "";
      
      try {
         const fileName = `${collection.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.webm`;
         const { data, error } = await supabase.storage
           .from('testimonials')
           .upload(fileName, audioBlob, { contentType: 'audio/webm' });

         if (error) throw error;

         const { data: { publicUrl: url } } = supabase.storage
           .from('testimonials')
           .getPublicUrl(fileName);
           
         publicUrl = url;
      } catch (storageError) {
         toast.error("Failed to upload audio to cloud server.");
         throw storageError;
      }

      const res = await fetch(`${apiUrl}/api/testimonials`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          collection_id: collection.id,
          client_name: name,
          client_job_title: jobTitle,
          audio_url: publicUrl
        })
      });

      if (!res.ok) {
         const err = await res.json();
         console.error(err);
         throw new Error("Failed to save testimonial to database");
      }

      toast.success("Voice testimonial securely submitted!");
      setSubmitted(true);
    } catch (error) {
      console.error('Error submitting testimonial', error);
      toast.error("Something went wrong while submitting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-zinc-950"><Loader2 className="animate-spin text-indigo-500" size={40} /></div>;
  if (!collection) return <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-bold text-xl">Campaign not found</div>;

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 blur-[100px] rounded-full" />
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-zinc-900/60 backdrop-blur-xl p-10 rounded-[2rem] shadow-2xl border border-zinc-800/80 max-w-md w-full text-center relative z-10"
        >
          <div className="mx-auto bg-gradient-to-tr from-emerald-500 to-green-400 text-white w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
            <CheckCircle size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-3">Thank You!</h1>
          <p className="text-zinc-400 font-medium">Your voice testimonial has been successfully submitted to <strong className="text-zinc-200">{collection.name}</strong>.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 -m-32 w-96 h-96 bg-violet-600/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-xl w-full relative z-10">
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 text-indigo-400 mb-6 shadow-xl shadow-indigo-900/20 relative">
            <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl"></div>
             <Mic size={36} className="relative z-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">Record your Voice</h1>
          <p className="text-zinc-400 text-lg">Leave a testimonial for <span className="font-bold text-indigo-300">{collection.name}</span></p>
        </motion.div>

        <motion.form 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          onSubmit={handleSubmit} 
          className="bg-zinc-900/60 backdrop-blur-xl p-8 md:p-10 rounded-[2rem] shadow-2xl border border-zinc-800/80 space-y-8"
        >
          
          {/* Recording UI */}
          <div className="bg-zinc-950/80 rounded-[1.5rem] p-8 border border-zinc-800/50 shadow-inner relative overflow-hidden">
            {isRecording && <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse" />}
            
            {!audioUrl ? (
              <div className="flex flex-col items-center">
                <p className="text-xs font-bold text-zinc-500 mb-6 uppercase tracking-widest flex items-center gap-2">
                  {isRecording ? <><span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Recording Live</> : "Tap to record"}
                </p>
                
                {isRecording && (
                  <motion.div initial={{ scale: 0.8, opacity: 0}} animate={{ scale: 1, opacity: 1 }} className="text-4xl font-mono font-bold mb-6 text-white tracking-widest">
                    {formatTime(recordingTime)} <span className="text-zinc-600 text-xl font-sans">/ 02:00</span>
                  </motion.div>
                )}
                
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`relative flex items-center justify-center w-24 h-24 rounded-full transition-all duration-300 focus:outline-none ${
                    isRecording 
                      ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30" 
                      : "bg-gradient-to-br from-indigo-600 to-violet-700 text-white hover:from-indigo-500 hover:to-violet-600 shadow-xl shadow-indigo-600/30 hover:scale-105 border border-indigo-500/50"
                  }`}
                >
                  {isRecording ? (
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                      <StopCircle size={44} />
                    </motion.div>
                  ) : (
                    <Mic size={44} />
                  )}
                  {isRecording && (
                     <span className="absolute w-full h-full rounded-full border-2 border-red-500/50 animate-ping opacity-75"></span>
                  )}
                </button>
              </div>
            ) : (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center w-full">
                <div className="flex items-center gap-2 mb-6 bg-emerald-500/10 text-emerald-400 px-4 py-1.5 rounded-full border border-emerald-500/20 text-sm font-bold">
                  <CheckCircle size={16} /> Audio ready for upload
                </div>
                
                <CustomAudioPlayer 
                  url={audioUrl} 
                   className="mb-6 w-full max-w-sm"
                />
                
                <button 
                  type="button" 
                  onClick={reRecord}
                  className="text-sm text-zinc-400 hover:text-white transition-colors font-semibold flex items-center gap-2"
                >
                  <StopCircle size={16} /> Record again
                </button>
              </motion.div>
            )}
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-zinc-300 mb-2">Your Full Name <span className="text-rose-500">*</span></label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-zinc-600 shadow-inner"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-zinc-300 mb-2">Job Title / Company</label>
              <input 
                type="text" 
                value={jobTitle}
                onChange={e => setJobTitle(e.target.value)}
                placeholder="e.g. CEO at Acme Corp"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-3.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-zinc-600 shadow-inner"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!audioBlob || !name.trim() || isSubmitting}
            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(99,102,241,0.2)] text-base font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? (
              <><Loader2 size={20} className="animate-spin mr-3" /> Encrypting & Uploading...</>
            ) : (
              <><Sparkles size={20} className="mr-2" /> Submit Voice Testimonial</>
            )}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
