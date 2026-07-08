/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, StoryType } from "../types";
import { storage } from "../lib/storage";
import { useDropzone } from "react-dropzone";
import { Upload, FileText, Image as ImageIcon, X, Check } from "lucide-react";
import { uploadStory, uploadChapter } from "../lib/api";
import { STORY_TAG_OPTIONS } from "../lib/tags";

interface UploadPageProps {
  user: User;
}

export default function UploadPage({ user }: UploadPageProps) {
  const navigate = useNavigate();
  const [type, setType] = useState<StoryType>("comic");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [cover, setCover] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // @ts-ignore
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => setFiles([...files, ...acceptedFiles]),
    accept: (type === "comic" 
      ? { "image/*": [], "application/pdf": [] } 
      : { "application/pdf": [], "application/msword": [], "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [] })
  });

  const toggleTag = (tag: string) => {
    setTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag]
    );
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || files.length === 0) return;

    setIsUploading(true);

    try {
      const storyFormData = new FormData();
      storyFormData.append("Title", title);
      storyFormData.append("Description", description);
      storyFormData.append("Type", type === "comic" ? "Comic" : "Novel");
      storyFormData.append("Status", "Ongoing");
      tags.forEach((tag) => storyFormData.append("Tags", tag));
      if (cover) {
        storyFormData.append("coverFile", cover);
      }

      const newStory = await uploadStory(storyFormData);

      const chapterFormData = new FormData();
      chapterFormData.append("Title", "Chương 1");
      chapterFormData.append("ChapterNumber", "1");
      chapterFormData.append("StoryId", newStory.id);
      files.forEach((file) => {
        chapterFormData.append("files", file);
      });

      await uploadChapter(newStory.id, chapterFormData, newStory.type);

      const auth = storage.getAuth();
      if (auth.isAuthenticated && auth.user) {
        const updatedUser = {
          ...auth.user,
          publishedStories: [...(auth.user.publishedStories || []), newStory.id]
        };
        const users = storage.getUsers();
        const updatedUsers = users.map(u => u.id === auth.user!.id ? updatedUser : u);
        storage.saveUsers(updatedUsers);
        storage.saveAuth({ ...auth, user: updatedUser });
      }

      setIsUploading(false);
      navigate(`/story/${newStory.id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Đăng tác phẩm thất bại. Vui lòng thử lại.");
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 bg-obsidian text-ghost">
      <div className="mb-12 relative">
        <div className="absolute -top-12 -left-4 text-8xl font-black text-white/5 italic pointer-events-none uppercase tracking-tighter">PUBLISH</div>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-2 relative z-10">Đăng tác phẩm mới<span className="text-accent">.</span></h1>
        <p className="text-[10px] text-ghost/40 font-bold uppercase tracking-[0.4em]">Chia sẻ câu chuyện của bạn với thế giới</p>
      </div>

      <form onSubmit={handleUpload} className="space-y-16">
        {/* Type Selector */}
        <section>
          <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-6 text-ghost/30 italic">LOẠI TÁC PHẨM // STREAMS</label>
          <div className="grid grid-cols-2 gap-6">
            <button 
              type="button"
              onClick={() => { setType("comic"); setFiles([]); }}
              className={`p-10 border rounded-sm flex flex-col items-center gap-4 transition-all relative group overflow-hidden ${
                type === "comic" ? "bg-accent text-obsidian border-accent" : "bg-white/5 border-white/10 opacity-40 grayscale hover:opacity-100 hover:grayscale-0"
              }`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white/10" />
              <ImageIcon className="w-10 h-10" />
              <span className="text-[10px] font-black uppercase tracking-widest">Truyện tranh (Manga)</span>
            </button>
            <button 
              type="button"
              onClick={() => { setType("novel"); setFiles([]); }}
              className={`p-10 border rounded-sm flex flex-col items-center gap-4 transition-all relative group overflow-hidden ${
                type === "novel" ? "bg-accent text-obsidian border-accent" : "bg-white/5 border-white/10 opacity-40 grayscale hover:opacity-100 hover:grayscale-0"
              }`}
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-white/10" />
              <FileText className="w-10 h-10" />
              <span className="text-[10px] font-black uppercase tracking-widest">Tiểu thuyết mạng</span>
            </button>
          </div>
        </section>

        {/* Basic Info */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="md:col-span-1">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-6 text-ghost/30 italic">ẢNH BÌA // COVER</label>
             <div className="aspect-[3/4] bg-white/5 border border-white/10 rounded-sm relative group overflow-hidden hover:border-accent transition-colors">
                {cover ? (
                    <img src={URL.createObjectURL(cover)} className="w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-ghost/20 p-6 text-center">
                        <Upload className="w-10 h-10 mb-4 opacity-20" />
                        <span className="text-[9px] uppercase font-black tracking-widest leading-loose">Drop cover image here</span>
                    </div>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => e.target.files && setCover(e.target.files[0])}
                />
             </div>
          </div>
          <div className="md:col-span-2 space-y-12">
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-6 text-ghost/30 italic">TIÊU ĐỀ // TITLE</label>
              <input 
                type="text" 
                required 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="NHẬP TÊN TRUYỆN..."
                className="w-full bg-white/5 border border-white/10 p-5 text-ghost text-xs rounded-sm focus:border-accent outline-none font-bold placeholder:text-ghost/20"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-6 text-ghost/30 italic">MÔ TẢ // SYNOPSIS</label>
              <textarea 
                required 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="MỘT VÀI DÒNG VỀ CÂU CHUYỆN CỦA BẠN..."
                className="w-full bg-white/5 border border-white/10 p-5 text-ghost text-xs rounded-sm focus:border-accent outline-none h-40 resize-none font-medium placeholder:text-ghost/20 leading-relaxed"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-6 text-ghost/30 italic">THỂ LOẠI // TAGS</label>
              <div className="flex flex-wrap gap-2.5">
                {STORY_TAG_OPTIONS.map((tag) => {
                  const active = tags.includes(tag);

                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3.5 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-wider border transition-all ${
                        active
                          ? "bg-white text-obsidian border-white"
                          : "bg-white/5 border-white/10 text-ghost/40 hover:border-white/20"
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* File Upload */}
        <section>
          <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-6 text-ghost/30 italic">
            NỘI DUNG // ASSETS ({type === "comic" ? "IMAGES/PDF" : "WORD/PDF"})
          </label>
          <div 
            {...getRootProps()}
            className={`p-16 border border-white/10 bg-white/5 rounded-sm transition-all text-center relative overflow-hidden group hover:border-accent ${
              isDragActive ? "bg-accent/5 border-accent" : ""
            }`}
          >
            <input {...getInputProps()} />
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5 group-hover:bg-accent transition-colors" />
            <Upload className="w-16 h-16 mx-auto mb-8 opacity-10 group-hover:opacity-40 group-hover:text-accent transition-all" />
            <p className="text-xs font-black uppercase tracking-[0.2em] text-accent mb-2">Kéo thả file vào đây để đăng tài</p>
            <p className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-20 italic">Hoặc click để chọn từ thư mục thiết bị</p>
          </div>

          {/* File List */}
          <div className="mt-8 flex flex-wrap gap-4">
            {files.map((file, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-sm">
                <span className="text-[10px] font-black uppercase tracking-tighter text-ghost/60 truncate max-w-[200px]">{file.name}</span>
                <button 
                  type="button" 
                  onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                  className="hover:text-accent transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Submit */}
        <div className="pt-16 border-t border-white/10">
          <button 
            type="submit" 
            disabled={isUploading}
            className={`w-full py-8 bg-accent text-obsidian rounded-sm font-black italic uppercase tracking-[0.3em] text-lg flex items-center justify-center gap-6 transition-all ${
                isUploading ? "opacity-50 cursor-not-allowed scale-95" : "hover:scale-[1.01] active:scale-95 shadow-[0_0_50px_rgba(255,77,0,0.3)]"
            }`}
          >
            {isUploading ? (
              <>ĐANG ĐỒNG BỘ HÓA...</>
            ) : (
              <>KÍCH HOẠT XUẤT BẢN <Check className="w-6 h-6 stroke-[3]" /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
