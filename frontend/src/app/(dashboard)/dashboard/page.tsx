"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderPlus, ExternalLink, PlaySquare, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function DashboardPage() {
  const { userId } = useAuth();
  const [collections, setCollections] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");

  const apiUrl = "";

  useEffect(() => {
    if (userId) {
      fetchCollections();
    }
  }, [userId]);

  const fetchCollections = async () => {
    try {
      const res = await fetch(`${apiUrl}/api/collections/user/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCollections(data);
      }
    } catch (error) {
      console.error("Failed to fetch collections", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim() || !userId) return;

    setIsCreating(true);
    const slug = newCollectionName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 8);

    try {
      const res = await fetch(`${apiUrl}/api/collections`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          name: newCollectionName,
          public_slug: slug,
        }),
      });

      if (res.ok) {
        setNewCollectionName("");
        fetchCollections();
        toast.success("Campaign created successfully!");
      } else {
        toast.error("Failed to create campaign");
      }
    } catch (error) {
      console.error("Error creating collection", error);
      toast.error("Network error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCollection = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this campaign? All testimonials will be lost.")) return;
    
    try {
      const res = await fetch(`${apiUrl}/api/collections/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCollections(prev => prev.filter(c => c.id !== id));
        toast.success("Campaign deleted successfully");
      } else {
        toast.error("Failed to delete campaign");
      }
    } catch (error) {
      toast.error("An error occurred while deleting");
    }
  };

  return (
    <div className="space-y-8 min-h-[calc(100vh-4rem)] bg-zinc-950 text-zinc-50 p-6 md:p-10 rounded-3xl border border-zinc-900/80 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 -m-32 w-96 h-96 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 -m-32 w-96 h-96 bg-violet-600/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Your Campaigns</h1>
          <p className="text-zinc-400 mt-2 text-sm md:text-base">Manage your testimonial collections and embed links.</p>
        </div>
        
        <form onSubmit={handleCreateCollection} className="flex gap-3 w-full md:w-auto">
          <input
            type="text"
            placeholder="New campaign name..."
            className="flex-1 md:w-64 rounded-xl border-zinc-800 bg-zinc-900/80 px-4 py-3 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 shadow-inner outline-none transition-all placeholder:text-zinc-500 backdrop-blur-sm"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            disabled={isCreating}
            required
          />
          <button
            type="submit"
            disabled={isCreating}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600/90 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-900/20 hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 transition-all hover:scale-[1.02] active:scale-95"
          >
            <FolderPlus size={18} />
            {isCreating ? "Creating..." : "Create"}
          </button>
        </form>
      </div>

      <div className="relative z-10 pt-4">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-3xl bg-zinc-900/50 animate-pulse border border-zinc-800/50"></div>
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/30 rounded-3xl border border-zinc-800 border-dashed shadow-sm backdrop-blur-sm">
            <div className="mx-auto w-16 h-16 bg-zinc-800/50 rounded-full flex items-center justify-center mb-4">
              <FolderPlus className="h-8 w-8 text-zinc-500" />
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">No campaigns found</h3>
            <p className="mt-2 text-sm text-zinc-400 max-w-sm mx-auto">Get started by creating your first testimonial collection campaign above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {collections.map((collection, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={collection.id}
              >
                <Link href={`/dashboard/${collection.id}`} className="block h-full group">
                  <div className="bg-zinc-900/60 rounded-3xl p-6 border border-zinc-800 shadow-lg hover:shadow-indigo-900/20 hover:border-indigo-500/40 transition-all duration-300 h-full flex flex-col relative overflow-hidden backdrop-blur-md">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div className="p-3.5 bg-zinc-800/80 text-zinc-300 rounded-2xl group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-inner">
                        <PlaySquare size={24} />
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => handleDeleteCollection(collection.id, e)}
                          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                          title="Delete Campaign"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-zinc-100 relative z-10 group-hover:text-white transition-colors">{collection.name}</h3>
                    <div className="mt-auto pt-8 flex justify-between items-center text-sm font-semibold relative z-10">
                       <span className="text-zinc-500 group-hover:text-indigo-400 transition-colors">Manage Campaign</span>
                       <ExternalLink size={16} className="text-zinc-600 group-hover:text-indigo-400 transition-colors translate-x-0 group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
