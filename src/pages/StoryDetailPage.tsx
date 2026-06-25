/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { storage } from "../lib/storage";
import { Story } from "../types";
import { Eye, Star, BookOpen, Clock, Edit3, ArrowLeft, Play } from "lucide-react";
import { motion } from "motion/react";
import { cn, formatDate } from "../lib/utils";

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const auth = storage.getAuth();

  useEffect(() => {
    const allStories = storage.getStories();
    const found = allStories.find((s) => s.id === id);
    if (found) {
      setStory(found);
    }
  }, [id]);

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <p className="text-sm uppercase font-black tracking-[0.3em] text-accent animate-pulse">
          ĐANG TẢI THÔNG TIN...
        </p>
      </div>
    );
  }

  const isAuthor = auth.isAuthenticated && auth.user?.id === story.authorId;
  const hasChapters = story.chapters && story.chapters.length > 0;
  const firstChapterId = hasChapters ? story.chapters[0].id : null;

  // Find last read chapter
  const lastReadRecord = auth.isAuthenticated && auth.user
    ? auth.user.readingHistory.find((h) => h.storyId === story.id)
    : null;

  const lastReadChapter = lastReadRecord && hasChapters
    ? story.chapters.find((ch) => ch.id === lastReadRecord.chapterId)
    : null;

  return (
    <div className="min-h-screen bg-obsidian text-ghost relative overflow-hidden pb-32">
      {/* Background decoration */}
      <div 
        className="absolute top-0 left-0 right-0 h-[60vh] bg-cover bg-center opacity-10 blur-3xl pointer-events-none"
        style={{ backgroundImage: `url(${story.coverUrl})` }}
      />
      <div className="absolute top-0 left-0 right-0 h-[60vh] bg-gradient-to-b from-transparent to-obsidian pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        {/* Back navigation */}
        <button
          onClick={() => navigate("/home")}
          className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-ghost/40 hover:text-accent transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          QUAY LẠI KHÁM PHÁ
        </button>

        {/* Story details grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* Left Column: Cover art */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-4"
          >
            <div className="relative aspect-[3/4] w-full rounded-sm overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(255,77,0,0.15)] group">
              <img 
                src={story.coverUrl} 
                alt={story.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-0 left-0 bg-accent text-obsidian text-[10px] font-black uppercase tracking-tighter px-4 py-2">
                {story.type === "comic" ? "MANGA" : "NOVEL"}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-obsidian via-obsidian/40 to-transparent flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-obsidian/80 px-3 py-1.5 rounded-sm border border-accent/20">
                  {story.status === "ongoing" ? "ĐANG TIẾN HÀNH" : "HOÀN THÀNH"}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Metadata */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-8 space-y-10"
          >
            {/* Tag pills */}
            <div className="flex flex-wrap gap-3">
              {story.tags.map((tag) => (
                <span 
                  key={tag} 
                  className="px-4 py-1.5 bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest text-ghost/60 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Title & Author */}
            <div>
              <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-4">
                {story.title}<span className="text-accent">.</span>
              </h1>
              <p className="text-xs font-black uppercase tracking-[0.3em] text-accent">
                TÁC GIẢ // {story.authorName}
              </p>
            </div>

            {/* Stat Row */}
            <div className="flex flex-wrap items-center gap-12 py-6 border-y border-white/5">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-accent" />
                <div>
                  <span className="block text-lg font-black leading-none">{story.views.toLocaleString()}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-ghost/30">LƯỢT XEM</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-accent fill-accent" />
                <div>
                  <span className="block text-lg font-black leading-none">{story.rating}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-ghost/30">ĐÁNH GIÁ</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-ghost/40" />
                <div>
                  <span className="block text-xs font-bold leading-none">{formatDate(story.updatedAt)}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-ghost/30">CẬP NHẬT</span>
                </div>
              </div>
            </div>

            {/* Synopsis */}
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-ghost/40 italic">MÔ TẢ TÁC PHẨM // SYNOPSIS</h3>
              <p className="text-base text-ghost/70 leading-relaxed font-medium bg-white/[0.01] p-6 border border-white/5 rounded-sm italic">
                {story.description || "Chưa có mô tả chi tiết cho tác phẩm này."}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-6 pt-4">
              {hasChapters ? (
                <>
                  {lastReadChapter ? (
                    <>
                      <Link
                        to={`/story/${story.id}/chapter/${lastReadChapter.id}`}
                        className="flex items-center gap-3 px-8 py-4 bg-accent text-obsidian rounded-sm font-black uppercase tracking-tighter text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,77,0,0.2)]"
                      >
                        <Play className="w-4 h-4 fill-obsidian" />
                        ĐỌC TIẾP // {lastReadChapter.title}
                      </Link>
                      <Link
                        to={`/story/${story.id}/chapter/${firstChapterId}`}
                        className="flex items-center gap-3 px-8 py-4 border border-white/20 text-ghost/80 rounded-sm font-black uppercase tracking-tighter text-sm hover:border-accent hover:text-accent transition-all"
                      >
                        ĐỌC LẠI TỪ ĐẦU
                      </Link>
                    </>
                  ) : (
                    <Link
                      to={`/story/${story.id}/chapter/${firstChapterId}`}
                      className="flex items-center gap-3 px-10 py-5 bg-accent text-obsidian rounded-sm font-black uppercase tracking-tighter text-sm hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,77,0,0.2)]"
                    >
                      <Play className="w-4 h-4 fill-obsidian" />
                      ĐỌC CHƯƠNG ĐẦU
                    </Link>
                  )}
                </>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-3 px-10 py-5 bg-white/5 border border-white/10 text-ghost/30 rounded-sm font-black uppercase tracking-tighter text-sm cursor-not-allowed"
                >
                  SẮP RA MẮT
                </button>
              )}

              {isAuthor && (
                <Link
                  to={`/edit-story/${story.id}`}
                  className="flex items-center gap-3 px-10 py-5 border border-accent text-accent rounded-sm font-black uppercase tracking-tighter text-sm hover:bg-accent hover:text-obsidian transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  CHỈNH SỬA TRUYỆN
                </Link>
              )}
            </div>
          </motion.div>
        </div>

        {/* Chapters Section */}
        <div className="mt-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-1 h-8 bg-accent" />
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">
              Danh sách chương<span className="text-accent">/</span>Chapters
            </h2>
          </div>

          {hasChapters ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {story.chapters.map((chapter, index) => (
                <Link
                  key={chapter.id}
                  to={`/story/${story.id}/chapter/${chapter.id}`}
                  className="group flex items-center justify-between p-6 bg-white/[0.02] border border-white/5 rounded-sm hover:border-accent/40 hover:bg-white/[0.04] transition-all"
                >
                  <div className="flex items-center gap-6">
                    <span className="text-xl font-black italic text-accent opacity-40 group-hover:opacity-100 transition-opacity">
                      {index + 1 < 10 ? `0${index + 1}` : index + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-black uppercase tracking-tight text-ghost group-hover:text-accent transition-colors">
                        {chapter.title}
                      </h4>
                      <p className="text-[9px] text-ghost/30 uppercase font-bold tracking-widest mt-1">
                        NGÀY ĐĂNG: {formatDate(chapter.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-ghost/40 group-hover:text-accent group-hover:border-accent transition-colors">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center border border-dashed border-white/10 rounded-sm">
              <BookOpen className="w-12 h-12 text-ghost/10 mx-auto mb-4" />
              <p className="text-xs uppercase font-black tracking-[0.3em] text-ghost/30">
                TÁC PHẨM CHƯA CÓ CHƯƠNG NÀO // COMING_SOON
              </p>
              {isAuthor && (
                <Link
                  to={`/edit-story/${story.id}`}
                  className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-accent text-obsidian text-xs font-black uppercase tracking-widest rounded-sm hover:scale-105 transition-transform"
                >
                  <Edit3 className="w-4 h-4" /> THÊM CHƯƠNG MỚI NGAY
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
