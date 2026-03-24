import Link from "next/link";
import { Mic, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] bg-indigo-600 text-white shadow-xl shadow-indigo-200 mb-4">
          <Mic size={40} />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900">
          Supercharge your trust with <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Audio Testimonials
          </span>
        </h1>
        
        <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
          The easiest way to collect, manage, and display authentic voice feedback from your clients. Build deeper connections through the power of voice.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link 
            href="/dashboard"
            className="group flex items-center justify-center w-full sm:w-auto px-8 py-4 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-2xl shadow-lg shadow-indigo-200 transition-all hover:scale-105"
          >
            Go to Dashboard
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </Link>
          
          <Link 
            href="/sign-in"
            className="flex items-center justify-center w-full sm:w-auto px-8 py-4 text-base font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-2xl transition-all"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
