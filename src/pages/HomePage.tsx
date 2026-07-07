/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { storage } from "../lib/storage";
import { Story } from "../types";
import { Star, TrendingUp, Sparkles, History as HistoryIcon } from "lucide-react";
import StoryCard from "../components/common/StoryCard";
import { fetchStories } from "../lib/api";

export default function HomePage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [readingHistory, setReadingHistory] = useState<Story[]>([]);
  const auth = storage.getAuth();
  const authUserId = auth.user?.id ?? "";
  const authHistoryKey = auth.user?.readingHistory.map(h => h.storyId).join("|") ?? "";

  useEffect(() => {
    if (!auth.isAuthenticated) {
      setReadingHistory([]);
      return;
    }

    const loadStories = async () => {
      const allStories = await fetchStories();
      setStories(allStories);

      const historyIds = new Set(auth.user?.readingHistory.map(h => h.storyId) ?? []);
      setReadingHistory(allStories.filter(s => historyIds.has(s.id)));
    };

    void loadStories();
  }, [auth.isAuthenticated, authUserId, authHistoryKey]);

  const popularStories = [...stories].sort((a, b) => b.views - a.views).slice(0, 4);
  const recommendedStories = stories.slice(0, 6);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-24 relative">
        <div className="relative">
          <div className="absolute -top-12 -left-4 text-8xl font-black text-white/5 italic pointer-events-none uppercase tracking-tighter">DISCOVER</div>
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-2 relative z-10">Khám phá<span className="text-accent">.</span></h1>
          <p className="text-[10px] text-ghost/40 font-bold uppercase tracking-[0.4em]">Những câu chuyện mới nhất</p>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 md:pb-0 w-full md:w-auto items-center">
          {["Tất cả", "Manga", "Novel", "Trending", "Completed"].map(tag => (
            <button key={tag} className="whitespace-nowrap px-6 py-2 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-obsidian hover:border-accent transition-all">
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Reading History */}
      {auth.isAuthenticated && readingHistory.length > 0 && (
        <section className="mb-24 px-8 py-10 bg-white/[0.02] border border-white/5 rounded-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent opacity-50" />
          <div className="flex items-center gap-3 mb-10">
            <HistoryIcon className="text-accent w-4 h-4" />
            <h2 className="text-xs font-black uppercase tracking-[0.3em] italic">Vừa đọc gần đây // HISTORY</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {readingHistory.map(story => (
              <StoryCard key={story.id} story={story} isCompact />
            ))}
          </div>
        </section>
      )}

      {/* Popular Stories */}
      <section className="mb-32">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-accent" />
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Phổ biến<span className="text-accent">/</span>Trending</h2>
          </div>
          <Link to="#" className="text-[10px] font-black uppercase tracking-widest text-ghost/30 hover:text-accent transition-colors">Xem tất cả</Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {popularStories.map(story => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>

      {/* Recommended for you */}
      <section>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-white/20" />
            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Dành cho bạn<span className="text-white/20">/</span>Recommended</h2>
          </div>
          <Link to="#" className="text-[10px] font-black uppercase tracking-widest text-ghost/30 hover:text-accent transition-colors">Khám phá thêm</Link>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {recommendedStories.map(story => (
            <StoryCard key={story.id} story={story} isCompact />
          ))}
        </div>
      </section>
    </div>
  );
}
