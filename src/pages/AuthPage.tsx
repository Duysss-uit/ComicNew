/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from "react";
import { Chrome } from "lucide-react";
import { motion } from "motion/react";

import { supabase } from "../lib/supabase";
import { AuthState } from "../types";

interface AuthPageProps {
  setAuth: (auth: AuthState) => void;
}

export default function AuthPage({ setAuth: _setAuth }: AuthPageProps) {
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setError("");

    if (!supabase) {
      setError("Supabase chưa được cấu hình. Hãy thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY.");
      return;
    }

    setIsGoogleLoading(true);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/[0.02] border border-white/10 p-12 rounded-sm shadow-2xl backdrop-blur-xl relative"
      >
        <div className="absolute -top-12 -left-12 text-8xl font-black text-white/5 italic pointer-events-none uppercase tracking-tighter">JOIN</div>
        
        <div className="text-center mb-12 relative z-10">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">
            Chào mừng trở lại<span className="text-accent">.</span>
          </h1>
          <p className="text-[10px] text-ghost/40 font-bold uppercase tracking-widest leading-relaxed">
            ĐĂNG NHẬP VÀO HỒ SƠ COMICNEW CỦA BẠN
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading}
          className="w-full mb-6 bg-white text-obsidian py-4 rounded-sm font-black uppercase tracking-widest text-xs hover:scale-[1.01] transition-transform flex items-center justify-center gap-3 disabled:opacity-60 disabled:hover:scale-100"
        >
          <Chrome className="w-4 h-4" />
          {isGoogleLoading ? "Đang chuyển hướng..." : "Đăng nhập với Google"}
        </button>

        {error && <p className="text-accent text-[10px] uppercase font-black text-center tracking-widest italic">{error}</p>}

        <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-[8px] text-center text-ghost/20 font-bold uppercase tracking-[0.3em] leading-relaxed">
                Tất cả dữ liệu được mã hóa. Đăng nhập để trải nghiệm ngay.
            </p>
        </div>
      </motion.div>
    </div>
  );
}
