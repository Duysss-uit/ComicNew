/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { User, Story } from "../types";
import { storage } from "../lib/storage";
import { BookMarked, Layers, Settings, History } from "lucide-react";
import StoryCard from "../components/common/StoryCard";

interface ProfilePageProps {
  user: User;
}

export default function ProfilePage({ user }: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<'history' | 'uploads' | 'settings'>('history');
  const [userStories, setUserStories] = useState<Story[]>([]);
  const [readingHistory, setReadingHistory] = useState<Story[]>([]);

  useEffect(() => {
    const allStories = storage.getStories();
    setUserStories(allStories.filter(s => user.publishedStories.includes(s.id)));
    
    const historyIds = user.readingHistory.map(h => h.storyId);
    setReadingHistory(allStories.filter(s => historyIds.includes(s.id)));
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      {/* Profile Header */}
      <div className="bg-white/5 border border-white/10 p-12 rounded-sm mb-12 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
        
        <div className="w-32 h-32 bg-gradient-to-tr from-accent to-[#FF9000] rounded-full flex items-center justify-center text-obsidian text-5xl font-black italic uppercase relative z-10">
          {user.name.charAt(0)}
        </div>
        <div className="text-center md:text-left flex-1 relative z-10">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-2">{user.name}<span className="text-accent">.</span></h1>
          <p className="text-[10px] text-ghost/40 font-bold uppercase tracking-[0.4em] mb-8">{user.email}</p>
          <div className="flex flex-wrap gap-12 justify-center md:justify-start">
            <div>
              <span className="block text-3xl font-black italic">{readingHistory.length}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">TRUYỆN ĐANG ĐỌC</span>
            </div>
            <div>
              <span className="block text-3xl font-black italic">{userStories.length}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 italic">TÁC PHẨM ĐÃ ĐĂNG</span>
            </div>
          </div>
        </div>
        <button className="px-10 py-4 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-obsidian transition-all rounded-sm relative z-10">
          Chỉnh sửa hồ sơ
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-16 border-b border-white/10 mb-16 overflow-x-auto">
        {[
          { id: 'history', label: 'Lịch sử đọc', icon: History },
          { id: 'uploads', label: 'Tác phẩm của tôi', icon: Layers },
          { id: 'settings', label: 'Cài đặt', icon: Settings },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-3 pb-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${
              activeTab === tab.id ? "text-accent" : "text-ghost/20 hover:text-ghost/60"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-accent" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'history' && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {readingHistory.length > 0 ? (
              readingHistory.map(story => <StoryCard key={story.id} story={story} isCompact />)
            ) : (
              <div className="col-span-full py-32 text-center opacity-20 uppercase font-black text-xs tracking-[0.5em] italic">
                BẠN CHƯA ĐỌC CÂU CHUYỆN NÀO // EMPTY_STATE
              </div>
            )}
          </div>
        )}

        {activeTab === 'uploads' && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
             {userStories.length > 0 ? (
              userStories.map(story => <StoryCard key={story.id} story={story} />)
            ) : (
              <div className="col-span-full py-32 text-center opacity-20 uppercase font-black text-xs tracking-[0.5em] italic">
                BẠN CHƯA ĐĂNG TÁC PHẨM NÀO // EMPTY_STATE
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl bg-white/[0.02] border border-white/10 p-12 rounded-sm relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <Settings className="w-16 h-16" />
            </div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-12">Cấu hình hồ sơ<span className="text-accent">/</span>Settings</h3>
            <div className="space-y-12">
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-6 text-ghost/30 italic">NGÔN NGỮ HIỂN THỊ</label>
                <select className="w-full bg-white/5 border border-white/10 p-5 text-xs font-bold rounded-sm outline-none text-ghost">
                  <option>Tiếng Việt</option>
                  <option>English</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-6 text-ghost/30 italic">CHẾ ĐỘ GIAO DIỆN</label>
                <div className="flex gap-4">
                    <button className="flex-1 p-5 bg-accent text-obsidian text-[10px] font-black uppercase tracking-[0.2em] rounded-sm">Sáng (Mặc định)</button>
                    <button className="flex-1 p-5 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.2em] rounded-sm opacity-40 hover:opacity-100 transition-opacity">Tối (Sắp mắt)</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
