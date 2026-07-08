/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchStorybyAuthor } from "../lib/api";
import { Story } from "../types";
import StoryCard from "../components/common/StoryCard";
import { BookOpen, Loader2, ArrowLeft, User, Eye, Star } from "lucide-react";
import { motion } from "motion/react";

export default function AuthorPage() {
  const { authorId } = useParams<{ authorId: string }>();
  const navigate = useNavigate();
  const decodedAuthor = authorId ? decodeURIComponent(authorId) : "";

  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [authorName, setAuthorName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Author stats
  const [stats, setStats] = useState({
    totalStories: 0,
    totalViews: 0,
    avgRating: 0,
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const matched = await fetchStorybyAuthor(decodedAuthor);
        setStories(matched);
        setFilteredStories(matched);

        if (matched.length > 0) {
          setAuthorName(matched[0].authorName);
          
          const totalViews = matched.reduce((acc: number, curr: Story) => acc + curr.views, 0);
          const totalRating = matched.reduce((acc: number, curr: Story) => acc + curr.rating, 0);
          const avgRating = matched.length > 0 ? Number((totalRating / matched.length).toFixed(1)) : 5.0;

          setStats({
            totalStories: matched.length,
            totalViews,
            avgRating,
          });
        } else {
          setAuthorName(decodedAuthor);
          setStats({
            totalStories: 0,
            totalViews: 0,
            avgRating: 0,
          });
        }
      } catch (err) {
        console.error("Failed to load stories for author:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [decodedAuthor]);

  return (
    <div className="min-h-screen bg-obsidian text-ghost relative overflow-hidden pb-32">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-[350px] bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none border-b border-white/5" />
      <div className="absolute top-12 left-10 w-[400px] h-[400px] bg-accent/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 pt-12 relative z-10">
        {/* Back navigation */}
        <button
          onClick={() => navigate("/home")}
          className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-ghost/40 hover:text-accent transition-colors mb-12"
          id="back-home-button"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          QUAY LẠI KHÁM PHÁ
        </button>

        {/* Author banner & info card */}
        <div className="bg-white/[0.02] border border-white/10 rounded-sm p-8 md:p-12 mb-16 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-accent" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center text-obsidian shadow-lg shadow-accent/10">
                <User className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent block mb-1">TÁC GIẢ // CREATOR</span>
                <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">
                  {authorName}
                </h1>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-10 lg:gap-14 bg-black/30 px-6 py-4 rounded-sm border border-white/5">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-accent" />
                <div>
                  <span className="block text-xl font-black leading-none">{stats.totalStories}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-ghost/30">TÁC PHẨM</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-accent" />
                <div>
                  <span className="block text-xl font-black leading-none">{stats.totalViews.toLocaleString()}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-ghost/30">LƯỢT XEM</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-accent fill-accent" />
                <div>
                  <span className="block text-xl font-black leading-none">{stats.avgRating}</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-ghost/30">ĐIỂM ĐÁNH GIÁ</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section title */}
        <div className="flex items-center gap-3 mb-10">
          <div className="w-1.5 h-6 bg-white/20" />
          <h2 className="text-xl font-black italic uppercase tracking-tighter">
            Danh sách tác phẩm<span className="text-accent">/</span>Publications
          </h2>
        </div>

        {/* Grid layout */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-ghost/40 italic">Đang tải danh sách tác phẩm...</p>
          </div>
        ) : filteredStories.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8"
          >
            {filteredStories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-24 max-w-sm mx-auto border border-dashed border-white/10 rounded-sm">
            <h3 className="text-lg font-black uppercase tracking-tighter mb-2 italic">Chưa có tác phẩm</h3>
            <p className="text-xs text-ghost/40 font-medium leading-relaxed">
              Tác giả này chưa xuất bản tác phẩm nào trên hệ thống hoặc danh sách trống.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
