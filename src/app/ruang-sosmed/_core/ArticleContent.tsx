"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Heart, Calendar, Tag, Layout, Zap, Share2, X, Camera } from "lucide-react";
import { supabaseV2 as supabase } from "@/lib/supabase";
import { getCachedSession } from "@/lib/authCache";

interface ArticleContentProps {
  articleId: string;
  workspaceId: string;
}

export default function ArticleContent({ articleId, workspaceId }: ArticleContentProps) {
  const [article, setArticle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const session = await getCachedSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from("v2_profiles")
            .select("id, full_name, avatar_url, role")
            .eq("id", session.user.id)
            .single();
          setCurrentUser(profile);
        }

        const { data, error } = await supabase
          .from("v2_announcements")
          .select("*")
          .eq("id", articleId)
          .single();

        if (error) throw error;
        setArticle(data);
      } catch (err) {
        console.error("Failed to load article", err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, [articleId]);

  const handleReaction = async () => {
    if (!currentUser || !article) return;
    let newReactions = Array.isArray(article.reactions) ? [...article.reactions] : [];
    if (newReactions.includes(currentUser.id)) {
      newReactions = newReactions.filter((id: string) => id !== currentUser.id);
    } else {
      newReactions.push(currentUser.id);
    }
    const { error } = await supabase
      .from("v2_announcements")
      .update({ reactions: newReactions })
      .eq("id", articleId);
    if (!error) setArticle({ ...article, reactions: newReactions });
  };

  const handleBack = () => {
    window.history.back();
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: article?.title, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link berhasil disalin!");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Memuat Artikel...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Layout size={60} className="text-slate-200 mx-auto" />
          <p className="text-lg font-black text-slate-400 uppercase tracking-widest">Artikel tidak ditemukan</p>
          <button onClick={handleBack} className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm">
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const liked = article.reactions?.includes(currentUser?.id);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative w-full h-[55vh] md:h-[65vh] overflow-hidden">
        {article.image_url ? (
          <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-700 to-violet-900 flex items-center justify-center">
            <Layout size={120} className="text-white/10" />
          </div>
        )}
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={handleBack}
          className="absolute top-8 left-8 flex items-center gap-3 px-5 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl text-white font-black text-sm hover:bg-white/20 transition-all"
        >
          <ArrowLeft size={18} /> Kembali
        </motion.button>

        {/* Pinned Badge */}
        {article.is_pinned && (
          <div className="absolute top-8 right-8 flex items-center gap-2 px-4 py-2 bg-amber-400 rounded-xl text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
            <Zap size={14} fill="currentColor" /> Pinned
          </div>
        )}

        {/* Hero Content */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-blue-500 rounded-xl text-[10px] font-black uppercase tracking-widest text-white">
                {article.category}
              </span>
              <span className="text-[10px] font-black text-white/50 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={12} />
                {new Date(article.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.05] tracking-tighter uppercase">
              {article.title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Article Body */}
      <div className="max-w-3xl mx-auto px-6 md:px-8 py-16 space-y-12">
        {/* Action Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between py-6 border-b border-slate-100"
        >
          <button
            onClick={handleReaction}
            className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black text-sm transition-all ${
              liked
                ? "bg-rose-50 text-rose-600 border border-rose-100"
                : "bg-slate-50 text-slate-400 border border-slate-100 hover:bg-rose-50 hover:text-rose-600"
            }`}
          >
            <Heart size={20} fill={liked ? "currentColor" : "none"} />
            {article.reactions?.length || 0} Likes
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3.5 bg-slate-50 text-slate-400 border border-slate-100 rounded-2xl font-black text-sm hover:bg-blue-50 hover:text-blue-600 transition-all"
          >
            <Share2 size={18} /> Bagikan
          </button>
        </motion.div>

        {/* Summary (Italicized Quote Style) */}
        {article.summary && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl md:text-2xl text-slate-500 italic leading-relaxed border-l-8 border-blue-500 pl-8 font-medium"
          >
            {article.summary}
          </motion.p>
        )}

        {/* Divider */}
        <div className="flex items-center gap-4">
          <div className="h-[2px] w-12 bg-blue-600 rounded-full" />
          <Tag size={14} className="text-slate-300" />
          <div className="h-[2px] flex-1 bg-slate-100 rounded-full" />
        </div>

        {/* Main Content */}
        {article.content && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="prose prose-lg prose-slate max-w-none"
          >
            <div className="text-lg md:text-xl text-slate-700 leading-loose whitespace-pre-wrap font-medium">
              {article.content}
            </div>
          </motion.div>
        )}
 
        {/* Gallery Section */}
        {article.gallery_images?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
               <div className="h-[2px] w-12 bg-blue-600 rounded-full" />
               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image Gallery</span>
               <div className="h-[2px] flex-1 bg-slate-100 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {article.gallery_images.map((img: string, idx: number) => (
                <div 
                  key={idx} 
                  onClick={() => setLightboxImg(img)}
                  className="aspect-video rounded-[32px] overflow-hidden border border-slate-100 cursor-zoom-in group"
                >
                  <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                </div>
              ))}
            </div>
          </motion.div>
        )}
 
        {/* Lightbox */}
        <AnimatePresence>
          {lightboxImg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImg(null)}
              className="fixed inset-0 z-[500] flex items-center justify-center p-6 md:p-12 bg-slate-950/90 backdrop-blur-2xl cursor-zoom-out"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-5xl max-h-[90vh] flex items-center justify-center"
              >
                <img src={lightboxImg} className="w-auto h-auto max-w-full max-h-[85vh] rounded-[32px] shadow-2xl" />
                <button 
                  onClick={() => setLightboxImg(null)}
                  className="absolute top-4 right-4 p-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl text-white hover:bg-white/20 transition-all"
                >
                  <X size={24} />
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="pt-12 pb-20 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={handleReaction}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all ${
              liked
                ? "bg-rose-500 text-white shadow-xl shadow-rose-500/30"
                : "bg-slate-100 text-slate-400 hover:bg-rose-500 hover:text-white hover:shadow-xl hover:shadow-rose-500/30"
            }`}
          >
            <Heart size={20} fill={liked ? "currentColor" : "none"} />
            {liked ? "Kamu menyukai ini" : "Suka artikel ini?"}
          </button>
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-blue-600 transition-all"
          >
            <ArrowLeft size={18} /> Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
