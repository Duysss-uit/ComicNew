import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { storage } from "../lib/storage";
import { Story, Chapter } from "../types";
import { ChevronLeft, ChevronRight, Menu, Share2, Heart, MessageSquare, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";

export default function ReaderPage() {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const allStories = storage.getStories();
    const found = allStories.find(s => s.id === id);
    if (found) {
      setStory(found);
      
      // If chapterId is specified, find it. Otherwise, default to first chapter.
      const targetChapter = found.chapters.find(c => c.id === chapterId) || found.chapters[0];
      setCurrentChapter(targetChapter);

      // Update history
      const auth = storage.getAuth();
      if (auth.isAuthenticated && auth.user && targetChapter) {
        const history = auth.user.readingHistory.filter(h => h.storyId !== found.id);
        const newHistory = [
            { storyId: found.id, chapterId: targetChapter.id, lastReadAt: new Date().toISOString() },
            ...history
        ].slice(0, 20);
        
        const users = storage.getUsers();
        const updatedUsers = users.map(u => u.id === auth.user!.id ? { ...u, readingHistory: newHistory } : u);
        storage.saveUsers(updatedUsers);
        storage.saveAuth({ ...auth, user: { ...auth.user, readingHistory: newHistory } });
      }
    }
  }, [id, chapterId]);

  if (!story || !currentChapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <p className="text-sm uppercase font-black tracking-widest text-accent animate-pulse">
          Đang tải chương truyện...
        </p>
      </div>
    );
  }

  // Calculate index for navigation
  const currentChapterIndex = story.chapters.findIndex(c => c.id === currentChapter.id);
  const hasPrev = currentChapterIndex > 0;
  const hasNext = currentChapterIndex < story.chapters.length - 1;

  const handlePrev = () => {
    if (hasPrev) {
      const prevCh = story.chapters[currentChapterIndex - 1];
      navigate(`/story/${story.id}/chapter/${prevCh.id}`);
      window.scrollTo(0, 0);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      const nextCh = story.chapters[currentChapterIndex + 1];
      navigate(`/story/${story.id}/chapter/${nextCh.id}`);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="relative min-h-screen bg-obsidian text-ghost">
      {/* Reader Nav */}
      <div className="fixed top-16 left-0 right-0 h-16 bg-obsidian/90 backdrop-blur-md border-b border-white/10 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="p-2 hover:bg-white/10 rounded-full text-ghost transition-colors"
            title="Mục lục"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <Link 
            to={`/story/${story.id}`}
            className="group flex items-center gap-2 text-xs text-ghost hover:text-accent transition-colors"
            title="Về trang chi tiết"
          >
            <ArrowLeft className="w-4 h-4 text-ghost/40 group-hover:text-accent transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline font-black uppercase tracking-[0.4em] text-accent italic">READING // </span>
            <span className="font-black italic uppercase tracking-tighter truncate max-w-[120px] sm:max-w-[200px]">{story.title}</span>
            <span className="font-black italic uppercase tracking-tighter opacity-40">/</span>
            <span className="font-black italic uppercase tracking-tighter text-accent">{currentChapter.title}</span>
          </Link>
        </div>

        <div className="flex items-center gap-8">
          <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:text-accent transition-colors">
            <Heart className="w-4 h-4" /> 1.2K
          </button>
          <button className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest hover:text-accent transition-colors">
            <MessageSquare className="w-4 h-4" /> 84
          </button>
          <button className="p-2 hover:bg-white/10 rounded-full text-ghost">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="pt-24 max-w-4xl mx-auto px-6">
        <div className="py-20">
          {story.type === 'comic' ? (
            <div className="space-y-6">
              {currentChapter.content.map((url, i) => (
                <div key={i} className="group relative">
                  <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  <img 
                    src={url} 
                    alt={`Page ${i + 1}`} 
                    className="w-full h-auto border border-white/5 shadow-2xl transition-transform group-hover:scale-[1.01]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 text-[8px] font-black text-white/20 uppercase tracking-widest bg-obsidian/60 px-2 py-1 rounded-xs backdrop-blur-xs">PAGE_{i + 1}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="mb-24 text-center relative">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-9xl font-black text-white/5 italic pointer-events-none uppercase tracking-tighter">CHAPTER</div>
                <h1 className="text-6xl font-black italic uppercase tracking-tighter mb-4 relative z-10 leading-none">{currentChapter.title}</h1>
                <div className="w-24 h-1 bg-accent mx-auto mt-8" />
              </div>
              <div className="space-y-12 text-xl font-medium text-ghost/80 leading-[2] tracking-wide first-letter:text-8xl first-letter:font-black first-letter:float-left first-letter:mr-6 first-letter:text-accent first-letter:mt-2 italic">
                {currentChapter.content.map((para, i) => (
                  <p key={i}>
                    {para}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chapter Navigation */}
        <div className="py-20 border-t border-white/10 flex justify-between items-center mb-32">
          <button 
            onClick={handlePrev}
            disabled={!hasPrev}
            className={cn(
              "flex items-center gap-4 px-10 py-5 border rounded-sm text-[10px] font-black uppercase tracking-widest transition-all italic",
              hasPrev 
                ? "bg-white/5 border-white/10 text-ghost hover:bg-white hover:text-obsidian" 
                : "opacity-20 border-white/5 text-ghost/20 cursor-not-allowed"
            )}
          >
            <ChevronLeft className="w-5 h-5" /> PREV_CHAPTER
          </button>
          
          <button 
            onClick={handleNext}
            disabled={!hasNext}
            className={cn(
              "flex items-center gap-4 px-10 py-5 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all italic",
              hasNext 
                ? "bg-accent text-obsidian border-accent hover:scale-105" 
                : "bg-white/5 border-white/5 text-ghost/20 cursor-not-allowed"
            )}
          >
            NEXT_CHAPTER <ChevronRight className="w-5 h-5 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-obsidian/80 backdrop-blur-md z-[100]" 
              onClick={() => setIsSidebarOpen(false)} 
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 md:w-96 bg-obsidian border-r border-white/10 z-[101] p-12 overflow-y-auto"
            >
              <div className="mb-16 relative">
                  <div className="absolute -top-8 -left-4 text-7xl font-black text-white/5 italic pointer-events-none uppercase tracking-tighter">INDEX</div>
                  <img src={story.coverUrl} className="w-24 aspect-[3/4] object-cover rounded-sm mb-8 shadow-[0_0_40px_rgba(255,77,0,0.2)] relative z-10" />
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-2 relative z-10">{story.title}</h2>
                  <p className="text-[9px] uppercase font-black tracking-widest text-ghost/40 relative z-10 font-bold">BY {story.authorName}</p>
              </div>

              <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-accent italic mb-10">Mục lục // CHAPTERS</h3>
                  {story.chapters.map((ch, i) => (
                      <button 
                          key={ch.id}
                          onClick={() => {
                            navigate(`/story/${story.id}/chapter/${ch.id}`);
                            setIsSidebarOpen(false);
                            window.scrollTo(0, 0);
                          }}
                          className={cn(
                            "w-full text-left p-6 rounded-sm border transition-all relative group overflow-hidden",
                            currentChapter.id === ch.id 
                                ? "bg-accent text-obsidian border-accent" 
                                : "bg-white/5 border-white/10 text-ghost/40 hover:border-white/20 hover:text-ghost"
                          )}
                      >
                          <div className="absolute top-0 left-0 w-1 h-0 bg-white/20 group-hover:h-full transition-all" />
                          <span className="text-[10px] font-black uppercase block tracking-widest italic">{ch.title}</span>
                          <span className="text-[8px] font-bold opacity-30 block mt-2 tracking-widest uppercase">UPLOADED: 05/05/2026</span>
                      </button>
                  ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
