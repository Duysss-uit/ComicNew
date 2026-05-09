/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { storage } from "../lib/storage";
import { AuthState, User } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { LogIn, UserPlus, ArrowLeft } from "lucide-react";

interface AuthPageProps {
  setAuth: (auth: AuthState) => void;
}

export default function AuthPage({ setAuth }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      const users = storage.getUsers();
      const user = users.find(u => u.email === email);
      if (user) {
        // Success
        const authData = { user, isAuthenticated: true };
        setAuth(authData);
        storage.saveAuth(authData);
        navigate("/home");
      } else {
        // Mock success for first time user if no users exist
        if (email === "demo@comicnew.com") {
          const newUser: User = {
            id: "demo-user",
            name: "Người dùng Demo",
            email: email,
            readingHistory: [],
            publishedStories: []
          };
          const authData = { user: newUser, isAuthenticated: true };
          setAuth(authData);
          storage.saveAuth(authData);
          navigate("/home");
        } else {
          setError("Tài khoản không tồn tại. Hãy dùng demo@comicnew.com hoặc đăng ký.");
        }
      }
    } else {
      // Register
      const users = storage.getUsers();
      if (users.find(u => u.email === email)) {
        setError("Email đã được sử dụng.");
        return;
      }
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        email: email,
        readingHistory: [],
        publishedStories: []
      };
      storage.saveUsers([...users, newUser]);
      const authData = { user: newUser, isAuthenticated: true };
      setAuth(authData);
      storage.saveAuth(authData);
      navigate("/home");
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
            {isLogin ? "Chào mừng trở lại" : "Khởi tạo hành trình"}<span className="text-accent">.</span>
          </h1>
          <p className="text-[10px] text-ghost/40 font-bold uppercase tracking-widest leading-relaxed">
            {isLogin ? "ĐĂNG NHẬP VÀO HỒ SƠ COMICNEW CỦA BẠN" : "TRỞ THÀNH THÀNH VIÊN CỦA CỘNG ĐỒNG SÁNG TẠO"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-8">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-2 text-ghost/30 italic">Tên hiển thị // ALIAS</label>
                <input 
                  type="text" 
                  required 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 p-4 text-xs rounded-sm focus:border-accent transition-all outline-none font-bold text-ghost"
                  placeholder="VOID_WALKER"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-2 text-ghost/30 italic">Email // IDENTITY</label>
            <input 
              type="email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 text-xs rounded-sm focus:border-accent transition-all outline-none font-bold text-ghost"
              placeholder="PILOT@COMICNEW.COM"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-[0.2em] block mb-2 text-ghost/30 italic">Mật khẩu // SECURITY</label>
            <input 
              type="password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 p-4 text-xs rounded-sm focus:border-accent transition-all outline-none font-bold text-ghost"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-accent text-[10px] uppercase font-black text-center tracking-widest italic">{error}</p>}

          <button 
            type="submit" 
            className="w-full bg-accent text-obsidian py-5 rounded-sm font-black italic uppercase tracking-widest text-sm hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
            id="auth-submit"
          >
            {isLogin ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            {isLogin ? "Tiến vào login" : "Bắt đầu đăng ký"}
          </button>
        </form>

        <div className="mt-12 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-[10px] font-black uppercase tracking-widest text-ghost/40 hover:text-accent transition-colors"
            id="switch-auth-mode"
          >
            {isLogin ? "BẠN CHƯA CÓ HỒ SƠ? ĐĂNG KÝ NGAY" : "BẠN ĐÃ CÓ HỒ SƠ? ĐĂNG NHẬP NGAY"}
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-[8px] text-center text-ghost/20 font-bold uppercase tracking-[0.3em] leading-relaxed">
                Tất cả dữ hiệu được mã hóa. Tham gia để trãi nghiệm ngay.
            </p>
        </div>
      </motion.div>
    </div>
  );
}
