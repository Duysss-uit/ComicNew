import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { verifySessionWithBackend } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { AuthState } from "../types";

interface AuthCallbackPageProps {
  setAuth: (auth: AuthState) => void;
}

export default function AuthCallbackPage({ setAuth }: AuthCallbackPageProps) {
  const navigate = useNavigate();
  const didHandleCallback = useRef(false);
  const [message, setMessage] = useState("Đang xử lý đăng nhập Google...");
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (didHandleCallback.current) {
      return;
    }

    didHandleCallback.current = true;

    const handleCallback = async () => {
      if (!supabase) {
        setHasError(true);
        setMessage("Thiếu cấu hình Supabase. Hãy thêm VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY.");
        return;
      }

      const searchParams = new URLSearchParams(window.location.search);
      const hasCode = searchParams.has("code");

      const { data, error } = hasCode
        ? await supabase.auth.exchangeCodeForSession(window.location.search)
        : await supabase.auth.getSession();

      if (error) {
        setHasError(true);
        setMessage(error.message);
        return;
      }

      if (!data.session?.user) {
        setHasError(true);
        setMessage("Không tìm thấy session đăng nhập. Hãy thử lại.");
        return;
      }

      try {
        setMessage("Đang xác thực với hệ thống...");
        const authData = await verifySessionWithBackend();

        setAuth(authData);
        navigate("/home", { replace: true });
      } catch (err: any) {
        setHasError(true);
        setMessage(err.message || "Xác thực với hệ thống thất bại. Vui lòng thử lại.");
      }
    };

    void handleCallback();
  }, [navigate, setAuth]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-6">
      <div className="w-full max-w-lg bg-white/[0.02] border border-white/10 p-12 rounded-sm backdrop-blur-xl shadow-2xl text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-ghost/30 mb-4">OAuth Callback</p>
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-4">
          {hasError ? "Xử lý thất bại" : "Đang xác thực"}
        </h1>
        <p className="text-sm text-ghost/60 leading-relaxed mb-8">{message}</p>
        {hasError ? (
          <Link
            to="/auth"
            className="inline-flex items-center justify-center px-6 py-3 bg-accent text-obsidian text-xs font-black uppercase tracking-widest rounded-sm"
          >
            Quay lại đăng nhập
          </Link>
        ) : (
          <div className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-accent">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Đang chuyển hướng
          </div>
        )}
      </div>
    </div>
  );
}