/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { verifySessionWithBackend } from "./lib/auth";
import { storage } from "./lib/storage";
import { supabase } from "./lib/supabase";
import { AuthState } from "./types";

// Pages
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import ProfilePage from "./pages/ProfilePage";
import UploadPage from "./pages/UploadPage";
import ReaderPage from "./pages/ReaderPage";

// Components
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";

export default function App() {
  const [auth, setAuth] = useState<AuthState>(storage.getAuth());

  useEffect(() => {
    storage.saveAuth(auth);
  }, [auth]);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isMounted = true;

    const syncCurrentSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (!isMounted || !data.session?.user) {
        return;
      }

      const authData = await verifySessionWithBackend();
      if (isMounted) {
        setAuth(authData);
        if (!authData.isAuthenticated) {
          storage.clearAuth();
        }
      }
    };

    void syncCurrentSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) {
        return;
      }

      if (session?.user) {
        void verifySessionWithBackend().then((authData) => {
          if (isMounted) {
            setAuth(authData);
            if (!authData.isAuthenticated) {
              storage.clearAuth();
            }
          }
        });
        return;
      }

      setAuth({ user: null, isAuthenticated: false });
      storage.clearAuth();
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-obsidian text-ghost font-sans selection:bg-accent selection:text-obsidian">
        <Navbar auth={auth} setAuth={setAuth} />
        <main className="pt-16 pb-20">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage setAuth={setAuth} />} />
            <Route path="/auth/callback" element={<AuthCallbackPage setAuth={setAuth} />} />
            <Route 
              path="/profile" 
              element={auth.isAuthenticated ? <ProfilePage user={auth.user!} /> : <Navigate to="/auth" />} 
            />
            <Route 
              path="/upload" 
              element={auth.isAuthenticated ? <UploadPage user={auth.user!} /> : <Navigate to="/auth" />} 
            />
            <Route path="/story/:id" element={<ReaderPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
