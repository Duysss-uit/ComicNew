/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { storage } from "../lib/storage";
import { Story, Chapter, User } from "../types";
import { 
  ArrowLeft, Upload, Check, Trash2, Plus, 
  BookOpen, Layers, Info, FileText, Image as ImageIcon, Sparkles 
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "../lib/utils";
import { BackendTag, fetchStory, fetchTags, uploadChapter, deleteChapter } from "../lib/api";

interface EditStoryPageProps {
  user: User;
}

export default function EditStoryPage({ user }: EditStoryPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [story, setStory] = useState<Story | null>(null);
  const [tagOptions, setTagOptions] = useState<BackendTag[]>([]);
  
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"ongoing" | "completed">("ongoing");
  const [tags, setTags] = useState<string[]>([]);
  const [coverUrl, setCoverUrl] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  // New chapter states
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterContent, setNewChapterContent] = useState<string[]>([]);
  const [chapterFiles, setChapterFiles] = useState<File[]>([]);
  const [novelParagraphs, setNovelParagraphs] = useState("");
  const [isUploadingChapter, setIsUploadingChapter] = useState(false);

  // General loading states
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadStory = async () => {
      if (!id) return;
      let found = await fetchStory(id);
      if (!found) {
        const allStories = storage.getStories();
        found = allStories.find((s) => s.id === id) || null;
      }
      if (found) {
        const isMockStory = found.id === "1" || found.id === "2";
        const authorId = found.authorId || "";
        const userId = user?.id || "";
        const isUserPublished = user?.publishedStories?.includes(found.id) || false;
        console.log("EditStoryPage Auth Check:", {
          storyId: found.id,
          isMockStory,
          authorId,
          userId,
          match: authorId.toLowerCase() === userId.toLowerCase() || isUserPublished
        });
        if (!isMockStory && authorId.toLowerCase() !== userId.toLowerCase() && !isUserPublished) {
          console.warn("EditStoryPage: Redirecting to /home due to authorId/userId mismatch.");
          navigate("/home");
          return;
        }
        setStory(found);
        setTitle(found.title);
        setDescription(found.description);
        setStatus(found.status);
        setTags(found.tags);
        setCoverUrl(found.coverUrl);
      } else {
        console.warn(`EditStoryPage: Story not found for id ${id}. Redirecting to /home.`);
        navigate("/home");
      }
    };
    void loadStory();
  }, [id, navigate, user]);

  useEffect(() => {
    const loadTags = async () => {
      const backendTags = await fetchTags();
      setTagOptions(backendTags);
    };

    void loadTags();
  }, []);

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <p className="text-sm uppercase font-black tracking-[0.3em] text-accent animate-pulse">
          ĐANG TẢI THÔNG TIN SỬA ĐỔI...
        </p>
      </div>
    );
  }

  // Cover upload reader
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setCoverUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Tag toggling
  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  };

  const handleComicPagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setChapterFiles((prev) => [...prev, ...filesArray]);
      const previews = filesArray.map((f: any) => URL.createObjectURL(f));
      setNewChapterContent((prev) => [...prev, ...previews]);
    }
  };

  const handleAddChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newChapterTitle.trim()) {
      setError("Vui lòng điền tiêu đề chương mới.");
      return;
    }

    setIsUploadingChapter(true);

    try {
      const formData = new FormData();
      formData.append("Title", newChapterTitle.trim());
      const nextNumber = story.chapters.length + 1;
      formData.append("ChapterNumber", nextNumber.toString());
      formData.append("StoryId", story.id);

      if (story.type === "novel") {
        if (!novelParagraphs.trim()) {
          setError("Vui lòng nhập nội dung tiểu thuyết.");
          setIsUploadingChapter(false);
          return;
        }
        const blob = new Blob([novelParagraphs], { type: "text/plain" });
        const file = new File([blob], "content.txt", { type: "text/plain" });
        formData.append("files", file);
      } else {
        if (chapterFiles.length === 0) {
          setError("Vui lòng tải lên ít nhất 1 trang truyện tranh.");
          setIsUploadingChapter(false);
          return;
        }
        chapterFiles.forEach((file) => {
          formData.append("files", file);
        });
      }

      const newChapter = await uploadChapter(story.id, formData, story.type);

      const updatedStory = {
        ...story,
        chapters: [...story.chapters, newChapter],
        updatedAt: new Date().toISOString()
      };
      setStory(updatedStory);

      setNewChapterTitle("");
      setNewChapterContent([]);
      setChapterFiles([]);
      setNovelParagraphs("");
      setSuccess("Thêm chương mới thành công!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Không thể tải lên chương mới.");
    } finally {
      setIsUploadingChapter(false);
    }
  };

  const handleDeleteChapter = async (chapterId: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa chương này? Hành động này không thể hoàn tác.")) {
      try {
        await deleteChapter(story.id, chapterId);
        const updatedChapters = story.chapters.filter((c) => c.id !== chapterId);
        setStory({
          ...story,
          chapters: updatedChapters
        });
        setSuccess("Đã xóa chương thành công!");
        setTimeout(() => setSuccess(""), 4000);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Xóa chương thất bại.");
      }
    }
  };

  // Save general story info
  const handleSaveStoryInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    if (!title.trim()) {
      setError("Tiêu đề tác phẩm không được bỏ trống.");
      setIsSaving(false);
      return;
    }

    const updatedStory: Story = {
      ...story,
      title: title.trim(),
      description: description.trim(),
      status: status,
      tags: tags,
      coverUrl: coverUrl,
      updatedAt: new Date().toISOString(),
    };

    const allStories = storage.getStories();
    const newStoriesList = allStories.map((s) => (s.id === story.id ? updatedStory : s));
    storage.saveStories(newStoriesList);

    setIsSaving(false);
    setSuccess("Cập nhật thông tin tác phẩm thành công!");
    setTimeout(() => {
      setSuccess("");
      navigate(`/story/${story.id}`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-obsidian text-ghost py-16 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Navigation */}
        <Link 
          to={`/story/${story.id}`}
          className="group inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-ghost/40 hover:text-accent transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          QUAY LẠI CHI TIẾT TRUYỆN
        </Link>

        {/* Header */}
        <div className="mb-16 relative">
          <div className="absolute -top-12 -left-4 text-8xl font-black text-white/5 italic pointer-events-none uppercase tracking-tighter">MANAGEMENT</div>
          <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter mb-2 relative z-10">
            Cấu hình tác phẩm<span className="text-accent">.</span>
          </h1>
          <p className="text-[10px] text-ghost/40 font-bold uppercase tracking-[0.4em]">
            Chỉnh sửa tác phẩm & cập nhật chương mới của {story.title}
          </p>
        </div>

        {/* Global Notifications */}
        {error && (
          <div className="p-5 bg-accent/10 border border-accent/20 rounded-sm mb-8 text-accent text-xs font-black uppercase tracking-widest italic animate-pulse">
            LỖI: {error}
          </div>
        )}
        {success && (
          <div className="p-5 bg-green-500/10 border border-green-500/20 rounded-sm mb-8 text-green-400 text-xs font-black uppercase tracking-widest italic">
            THÀNH CÔNG: {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Left: General Info Form */}
          <div className="lg:col-span-7 space-y-12">
            <form onSubmit={handleSaveStoryInfo} className="space-y-10 bg-white/[0.01] border border-white/5 p-10 rounded-sm relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
              <div className="flex items-center gap-3 mb-6">
                <Info className="w-4 h-4 text-accent" />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] italic">THÔNG TIN CHUNG // METADATA</h3>
              </div>

              {/* Title */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-3 text-ghost/30 italic">TIÊU ĐỀ // TITLE</label>
                <input 
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 text-ghost text-xs rounded-sm focus:border-accent outline-none font-bold"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-3 text-ghost/30 italic">MÔ TẢ // SYNOPSIS</label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 text-ghost text-xs rounded-sm focus:border-accent outline-none h-40 resize-none font-medium leading-relaxed"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-4 text-ghost/30 italic">TRẠNG THÁI // STATUS</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStatus("ongoing")}
                    className={cn(
                      "flex-1 p-4 rounded-sm text-[10px] font-black uppercase tracking-widest border transition-all",
                      status === "ongoing"
                        ? "bg-accent text-obsidian border-accent"
                        : "bg-white/5 border-white/10 text-ghost/40"
                    )}
                  >
                    ĐANG TIẾN HÀNH (ONGOING)
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("completed")}
                    className={cn(
                      "flex-1 p-4 rounded-sm text-[10px] font-black uppercase tracking-widest border transition-all",
                      status === "completed"
                        ? "bg-accent text-obsidian border-accent"
                        : "bg-white/5 border-white/10 text-ghost/40"
                    )}
                  >
                    HOÀN THÀNH (COMPLETED)
                  </button>
                </div>
              </div>

              {/* Tags Selector */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-4 text-ghost/30 italic">THỂ LOẠI // TAGS</label>
                <div className="flex flex-wrap gap-2.5">
                  {tagOptions.map((tag) => {
                    const active = tags.includes(tag.Name);
                    return (
                      <button
                        key={tag.Id}
                        type="button"
                        onClick={() => toggleTag(tag.Name)}
                        className={cn(
                          "px-3.5 py-1.5 rounded-sm text-[9px] font-black uppercase tracking-wider border transition-all",
                          active
                            ? "bg-white text-obsidian border-white"
                            : "bg-white/5 border-white/10 text-ghost/40 hover:border-white/20"
                        )}
                      >
                        {tag.Name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cover URL / Upload preview */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-4 text-ghost/30 italic">ẢNH BÌA // COVER ART</label>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                  <div className="sm:col-span-4 aspect-[3/4] rounded-sm overflow-hidden border border-white/10 bg-white/5">
                    {coverUrl ? (
                      <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ghost/10 uppercase font-bold text-[8px] text-center p-2">
                        CHƯA CÓ ẢNH
                      </div>
                    )}
                  </div>
                  <div className="sm:col-span-8 space-y-4">
                    <p className="text-[9px] text-ghost/40 font-bold uppercase tracking-widest leading-relaxed">
                      Kéo thả hoặc nhấn bên dưới để tải lên ảnh bìa mới từ thiết bị của bạn.
                    </p>
                    <div className="relative">
                      <input 
                        type="file"
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                        id="cover-file-input"
                      />
                      <label 
                        htmlFor="cover-file-input"
                        className="flex items-center justify-center gap-3 w-full p-4 bg-white/5 border border-dashed border-white/10 rounded-sm text-xs font-black uppercase tracking-widest text-ghost hover:border-accent hover:text-accent cursor-pointer transition-all"
                      >
                        <Upload className="w-4 h-4" /> TẢI ẢNH MỚI LÊN
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Info Changes */}
              <div className="pt-6 border-t border-white/5">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-4 bg-accent text-obsidian rounded-sm font-black italic uppercase tracking-widest text-xs hover:scale-[1.01] transition-transform flex items-center justify-center gap-3"
                >
                  {isSaving ? "ĐANG LƯU..." : "CẬP NHẬT THÔNG TIN TÁC PHẨM"}
                </button>
              </div>
            </form>

            {/* Existing Chapters List & Deletion */}
            <div className="bg-white/[0.01] border border-white/5 p-10 rounded-sm">
              <div className="flex items-center gap-3 mb-8">
                <Layers className="w-4 h-4 text-ghost/40" />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] italic">QUẢN LÝ CHƯƠNG // CHAPTER LIST ({story.chapters.length})</h3>
              </div>

              {story.chapters.length > 0 ? (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {story.chapters.map((ch, index) => (
                    <div 
                      key={ch.id}
                      className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-sm"
                    >
                      <div>
                        <span className="text-[10px] font-black text-accent block tracking-wider uppercase mb-1">
                          CHƯƠNG {index + 1}
                        </span>
                        <h4 className="text-xs font-bold uppercase tracking-tight text-ghost">
                          {ch.title}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteChapter(ch.id)}
                        className="p-3 text-ghost/40 hover:text-accent hover:bg-white/5 rounded-full transition-all"
                        title="Xóa chương này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-10 text-[10px] uppercase font-black tracking-widest text-ghost/20 italic">
                  Tác phẩm này chưa có chương nào được xuất bản.
                </p>
              )}
            </div>
          </div>

          {/* Right: Publish New Chapter Form */}
          <div className="lg:col-span-5">
            <form onSubmit={handleAddChapter} className="space-y-10 bg-white/[0.01] border border-white/5 p-10 rounded-sm relative sticky top-24">
              <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
              <div className="flex items-center gap-3 mb-6">
                <Plus className="w-4 h-4 text-accent" />
                <h3 className="text-xs font-black uppercase tracking-[0.3em] italic">XUẤT BẢN CHƯƠNG MỚI // NEW CHAPTER</h3>
              </div>

              {/* Chapter Title */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-3 text-ghost/30 italic">TIÊU ĐỀ CHƯƠNG // CHAPTER TITLE</label>
                <input 
                  type="text"
                  required
                  placeholder="Ví dụ: Chương 2: Đối mặt"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 text-ghost text-xs rounded-sm focus:border-accent outline-none font-bold placeholder:text-ghost/20"
                />
              </div>

              {/* Dynamic input based on story type */}
              {story.type === "novel" ? (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-3 text-ghost/30 italic">NỘI DUNG CHỮ // PARAGRAPHS</label>
                  <p className="text-[8px] text-ghost/30 uppercase font-black tracking-widest mb-3">
                    Bấm Enter để ngắt đoạn. Mỗi dòng trống sẽ tạo thành một đoạn văn hoàn chỉnh.
                  </p>
                  <textarea 
                    value={novelParagraphs}
                    onChange={(e) => setNovelParagraphs(e.target.value)}
                    placeholder="Viết hoặc dán nội dung văn chương ở đây..."
                    className="w-full bg-white/5 border border-white/10 p-4 text-ghost text-xs rounded-sm focus:border-accent outline-none h-80 resize-none font-medium leading-relaxed placeholder:text-ghost/20"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-3 text-ghost/30 italic">TRANG TRUYỆN TRANH // MANGA PAGES</label>
                  <p className="text-[8px] text-ghost/30 uppercase font-black tracking-widest mb-4 leading-relaxed">
                    Tải lên các trang truyện tranh (file ảnh). Bạn có thể chọn nhiều file ảnh cùng lúc.
                  </p>
                  
                  {/* File selector input */}
                  <div className="relative mb-6">
                    <input 
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleComicPagesChange}
                      className="hidden"
                      id="comic-pages-input"
                    />
                    <label 
                      htmlFor="comic-pages-input"
                      className="flex flex-col items-center justify-center gap-4 w-full p-8 bg-white/5 border border-dashed border-white/10 rounded-sm text-xs font-black uppercase tracking-widest text-ghost hover:border-accent hover:text-accent cursor-pointer transition-all"
                    >
                      <Upload className="w-8 h-8 opacity-20" />
                      {isUploadingChapter ? "ĐANG ĐỌC PHÂN ĐOẠN..." : "CHỌN CÁC TRANG TRUYỆN TRANH"}
                    </label>
                  </div>

                  {/* Uploaded pages preview tracker */}
                  {newChapterContent.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest text-ghost/40">
                        <span>Đã tải {newChapterContent.length} trang</span>
                        <button 
                          type="button" 
                          onClick={() => { setNewChapterContent([]); setChapterFiles([]); }}
                          className="text-accent hover:underline"
                        >
                          Xóa tất cả
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-2 max-h-[160px] overflow-y-auto pr-1">
                        {newChapterContent.map((url, i) => (
                          <div key={i} className="aspect-[3/4] rounded-xs overflow-hidden border border-white/10 relative group">
                            <img src={url} alt={`page-${i}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-obsidian/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <span className="text-[8px] font-black">{i + 1}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Submit chapter Button */}
              <button
                type="submit"
                disabled={isUploadingChapter}
                className="w-full py-5 bg-white text-obsidian rounded-sm font-black italic uppercase tracking-widest text-xs hover:bg-accent hover:text-obsidian hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
              >
                <Sparkles className="w-4 h-4" /> KÍCH HOẠT XUẤT BẢN CHƯƠNG MỚI
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
