/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, User as UserIcon, Upload, LogOut, Search, Loader2 } from "lucide-react";

import { supabase } from "../../lib/supabase";
import { AuthState, Story } from "../../types";
import { storage } from "../../lib/storage";
import { searchStories } from "../../lib/api";

interface NavbarProps {
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
}

export default function Navbar({ auth, setAuth }: NavbarProps) {
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Story[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchStories(searchQuery, 5);
          setSearchResults(results);
          setShowDropdown(true);
        } catch (error) {
          console.error(error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleLogout = async () => {
    try {
      if (supabase) {
        await supabase.auth.signOut();
      }
    } finally {
      storage.clearAuth();
      setAuth({ user: null, isAuthenticated: false });
      navigate("/");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-obsidian/80 backdrop-blur-md border-b border-white/10 z-50 px-6 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 bg-accent rounded-sm flex items-center justify-center transition-transform group-hover:rotate-12">
          <BookOpen className="text-obsidian w-5 h-5 fill-obsidian" />
        </div>
        <span className="font-display text-xl tracking-tighter uppercase text-accent">comicnew.</span>
      </Link>

      <div className="flex items-center gap-6">
        <Link to="/home" className="text-xs font-bold hover:text-accent transition-colors uppercase tracking-widest text-ghost/70">Khám phá</Link>
        <div className="relative group hidden md:block" ref={dropdownRef}>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 focus-within:border-accent transition-all">
            <Search className="w-4 h-4 opacity-40 text-ghost" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => {
                if (searchQuery.trim().length >= 2) setShowDropdown(true);
              }}
              className="bg-transparent border-none outline-none text-[10px] w-48 placeholder:text-ghost/30 text-ghost"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (searchQuery.trim()) {
                    setShowDropdown(false);
                    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                  }
                }
              }}
            />
          </div>
          
          {/* Dropdown UI */}
          {showDropdown && (
            <div className="absolute top-full mt-2 left-0 w-[300px] bg-obsidian border border-white/10 rounded-md shadow-xl overflow-hidden z-50">
              {isSearching ? (
                <div className="p-4 flex justify-center items-center gap-2 text-xs text-ghost/50">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  Đang tìm kiếm...
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="max-h-80 overflow-y-auto">
                    {searchResults.map((story) => (
                      <Link 
                        key={story.id} 
                        to={`/story/${story.id}`}
                        onClick={() => {
                          setShowDropdown(false);
                          setSearchQuery("");
                        }}
                        className="flex gap-3 p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      >
                        <img 
                          src={story.coverUrl} 
                          alt={story.title} 
                          className="w-10 h-14 object-cover rounded-sm"
                        />
                        <div className="flex flex-col justify-center overflow-hidden">
                          <h4 className="text-xs font-bold truncate text-ghost">{story.title}</h4>
                          <span className="text-[10px] text-ghost/50 truncate">{story.authorName}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <button 
                    onClick={() => {
                      setShowDropdown(false);
                      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
                    }}
                    className="w-full p-2.5 bg-white/5 text-[10px] uppercase tracking-widest text-accent font-bold hover:bg-white/10 transition-colors"
                  >
                    Xem tất cả kết quả
                  </button>
                </>
              ) : (
                <div className="p-4 text-center text-xs text-ghost/50">
                  Không tìm thấy truyện
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {auth.isAuthenticated ? (
          <>
            <Link 
              to="/upload" 
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-accent text-obsidian text-xs font-black uppercase tracking-tighter hover:scale-105 transition-transform rounded-sm"
              id="upload-button"
            >
              <Upload className="w-4 h-4" />
              Đăng truyện
            </Link>
            <Link to="/profile" className="p-2 hover:bg-white/10 rounded-full transition-colors text-ghost" id="profile-link">
              <UserIcon className="w-5 h-5" />
            </Link>
            <button 
              onClick={handleLogout} 
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-accent"
              title="Đăng xuất"
              id="logout-button"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </>
        ) : (
          <Link 
            to="/auth" 
            className="px-6 py-2 bg-accent text-obsidian text-xs font-black uppercase tracking-tighter hover:scale-105 transition-transform rounded-sm"
            id="login-button"
          >
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
}
