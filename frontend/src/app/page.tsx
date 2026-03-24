import Link from "next/link";
import { Mic, ArrowRight, Sparkles, Star } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-zinc-50 selection:bg-indigo-500/30">
      
      {/* Dynamic Background Gradients */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-indigo-600/20 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl text-center space-y-10 relative z-10 animate-in fade-in zoom-in duration-700 slide-in-from-bottom-8">
        
        {/* Floating Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-semibold text-indigo-400 mb-2 shadow-xl shadow-black/50">
          <Sparkles size={16} /> 
          <span>No more fake text reviews. Real voices only.</span>
        </div>

        {/* Hero Logo */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl shadow-indigo-600/30 ring-1 ring-white/20">
            <Mic size={48} className="drop-shadow-lg" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-tight">
          Turn Happy Customers Into <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">
            Your Best Salesmen.
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          Text reviews are dead. Collect authentic, AI-transcribed voice testimonials in seconds, and embed them anywhere with one line of code.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8">
          <Link 
            href="/dashboard"
            className="group relative flex items-center justify-center w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-2xl shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] transition-all hover:scale-105 overflow-hidden"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-[200%] group-hover:animate-[shimmer_1.5s_infinite]" />
            Start Collecting Free
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={22} />
          </Link>
          
          <Link 
            href="/sign-in"
            className="flex items-center justify-center w-full sm:w-auto px-8 py-4 text-lg font-bold text-zinc-300 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 hover:text-white rounded-2xl transition-all shadow-xl"
          >
            Login to Dashboard
          </Link>
        </div>

        {/* Social Proof Mini */}
        <div className="pt-16 flex flex-col items-center gap-4 text-zinc-500 animate-in fade-in duration-1000 delay-300">
           <div className="flex gap-1 text-indigo-500">
             <Star fill="currentColor" size={20} />
             <Star fill="currentColor" size={20} />
             <Star fill="currentColor" size={20} />
             <Star fill="currentColor" size={20} />
             <Star fill="currentColor" size={20} />
           </div>
           <p className="text-sm font-medium">Trusted by 500+ conversion-obsessed creators</p>
        </div>

      </div>
      
      {/* Tailwind Animations for Shimmer and Gradient */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 6s ease infinite;
        }
      `}} />
    </div>
  );
}
