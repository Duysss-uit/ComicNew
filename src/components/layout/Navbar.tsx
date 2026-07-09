/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Link, useNavigate } from "react-router-dom";
import { BookOpen, User as UserIcon, Upload, LogOut, Search } from "lucide-react";

import { supabase } from "../../lib/supabase";
import { AuthState } from "../../types";
import { storage } from "../../lib/storage";

interface NavbarProps {
  auth: AuthState;
  setAuth: (auth: AuthState) => void;
}

export default function Navbar({ auth, setAuth }: NavbarProps) {
  const navigate = useNavigate();

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
        <div className="relative group hidden md:block">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10 focus-within:border-accent transition-all">
            <Search className="w-4 h-4 opacity-40 text-ghost" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              className="bg-transparent border-none outline-none text-[10px] w-48 placeholder:text-ghost/30 text-ghost"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const query = e.currentTarget.value;
                  if (query.trim()) {
                    navigate(`/search?q=${encodeURIComponent(query)}`);
                  }
                }
              }}
            />
          </div>
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
