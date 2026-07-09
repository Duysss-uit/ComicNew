/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Story } from "../types";
import StoryCard from "../components/common/StoryCard";
import { Search, Loader2, ArrowLeft, Frown } from "lucide-react";
import { motion } from "motion/react";
import { fetchStories, searchStories } from "../lib/api";

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get("q") || "";
  
  const [filteredStories, setFilteredStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAndFilter() {
      setIsLoading(true);
      try {
        if (query) {
          const results = await searchStories(query, 20);
          setFilteredStories(results);
        } else {
          // If no query, show some default stories
          const allStories = await fetchStories();
          setFilteredStories(allStories);
        }
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAndFilter();
  }, [query]);

  return (
    <div className="min-h-screen bg-obsidian text-ghost relative overflow-hidden pb-32">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full pointer-events-none" />

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Search className="text-accent w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">KẾT QUẢ TÌM KIẾM // SEARCH</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter">
              Từ khóa: &ldquo;<span className="text-accent">{query || "Tất cả"}</span>&rdquo;
            </h1>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-ghost/30 bg-white/5 border border-white/10 px-4 py-2.5 rounded-sm">
            TÌM THẤY {filteredStories.length} TÁC PHẨM
          </div>
        </div>

        {/* Loading / Results logic */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-ghost/40 italic">Đang lọc kết quả tìm kiếm...</p>
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
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto"
          >
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <Frown className="w-8 h-8 text-ghost/40" />
            </div>
            <h3 className="text-lg font-black uppercase tracking-tighter mb-2 italic">Không tìm thấy tác phẩm</h3>
            <p className="text-xs text-ghost/40 font-medium leading-relaxed mb-8">
              Rất tiếc, không có truyện tranh hay tiểu thuyết nào khớp với từ khóa tìm kiếm của bạn. Hãy thử dùng từ khóa khác hoặc quay lại Khám phá.
            </p>
            <button
              onClick={() => navigate("/home")}
              className="px-6 py-2.5 bg-accent text-obsidian text-xs font-black uppercase tracking-tighter hover:scale-105 transition-transform rounded-sm"
            >
              Xem các truyện khác
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
