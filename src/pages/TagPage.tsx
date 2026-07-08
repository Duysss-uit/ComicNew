/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Story } from "../types";
import StoryCard from "../components/common/StoryCard";
import { Sparkles, Loader2, ArrowLeft, Tag } from "lucide-react";
import { motion } from "motion/react";
import { fetchStories, fetchTags, BackendTag } from "../lib/api";

export default function TagPage() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const currentTag = tag ? decodeURIComponent(tag) : "";

  const [stories, setStories] = useState<Story[]>([]);
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [allStories, backendTags] = await Promise.all([fetchStories(), fetchTags()]);
        setStories(allStories);

        if (currentTag) {
          const matched = allStories.filter((s) =>
            s.tags.some((t) => t.toLowerCase() === currentTag.toLowerCase())
          );
          setFilteredStories(matched);
        } else {
          setFilteredStories(allStories);
        }

        const tagNames = backendTags
          .map((tag: BackendTag) => tag.Name)
          .filter((tag): tag is string => Boolean(tag));
        setAllTags(Array.from(new Set(tagNames)).slice(0, 15));
      } catch (err) {
        console.error("Failed to load stories by tag:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [currentTag]);

  return (
    <div className="min-h-screen bg-obsidian text-ghost relative overflow-hidden pb-32">
      {/* Background radial glow */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-accent/5 blur-[180px] rounded-full pointer-events-none" />

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

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Tag className="text-accent w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">THỂ LOẠI truyện // GENRE</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">
              Mục: <span className="text-accent">{currentTag}</span>
            </h1>
          </div>

          {/* Related/Other Tags cloud */}
          <div className="max-w-md">
            <h3 className="text-[8px] font-black uppercase tracking-widest text-ghost/40 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-accent" /> CÁC CHỦ ĐỀ KHÁC // RELATED
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.filter(t => t.toLowerCase() !== currentTag.toLowerCase()).map(t => (
                <Link
                  key={t}
                  to={`/tag/${encodeURIComponent(t)}`}
                  className="px-3 py-1 bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-widest rounded-full text-ghost/50 hover:bg-white/10 hover:text-accent transition-all"
                >
                  {t}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Loading / Grid layout */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-ghost/40 italic">Đang lọc danh mục truyện...</p>
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
          <div className="text-center py-24 max-w-sm mx-auto">
            <h3 className="text-lg font-black uppercase tracking-tighter mb-2 italic">Trống danh sách</h3>
            <p className="text-xs text-ghost/40 font-medium leading-relaxed">
              Không tìm thấy tác phẩm nào thuộc thể loại này. Hãy khám phá thêm các thể loại khác ở trên.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
