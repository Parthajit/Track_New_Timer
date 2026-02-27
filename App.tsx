import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AboutUs from './pages/AboutUs';
import TermsConditions from './pages/TermsConditions';
import Contact from './pages/Contact';
import AuthModal from './components/AuthModal';
import { User, TimerMode, AuthState } from './types';
import { supabase } from './lib/supabase';
import { Helmet } from 'react-helmet-async';

const ScrollToTop = ({ activeTool }: { activeTool: TimerMode | null }) => {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname, activeTool]);
  return null;
};

const AppContent: React.FC<{
  user: User;
  onLogin: () => void;
  handleLogout: () => void;
  activeTool: TimerMode | null;
  setActiveTool: (mode: TimerMode | null) => void;
}> = ({ user, onLogin, handleLogout, activeTool, setActiveTool }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleToolSelect = (mode: TimerMode | null) => {
    setActiveTool(mode);
    if (location.pathname !== '/') {
      navigate('/');
    }
    window.scrollTo(0, 0);
  };

  return (
    <div className="flex min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30">
      <Helmet>
        <title>Track Timer | Professional Productivity Tools</title>
        <meta name="description" content="Master your time with Track Timer. Professional stopwatch, countdown, and lap timers designed for focus and performance." />
        <meta name="keywords" content="timer, stopwatch, countdown, productivity, focus, lap timer, interval timer" />
        <link rel="canonical" href={`https://www.trackmytimer.com${location.pathname}`} />
        <meta property="og:title" content="Track Timer | Professional Productivity Tools" />
        <meta property="og:description" content="Master your time with Track Timer. Professional stopwatch, countdown, and lap timers designed for focus and performance." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <ScrollToTop activeTool={activeTool} />
      {user.isLoggedIn && (
        <Sidebar 
          activeTool={activeTool} 
          onSelectTool={handleToolSelect} 
          currentPath={location.pathname}
        />
      )}
      
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar 
          isLoggedIn={user.isLoggedIn} 
          userName={user.name} 
          onLogin={onLogin} 
          onLogout={handleLogout} 
        />
        <main className={`flex-1 container mx-auto px-4 py-6 ${user.isLoggedIn ? 'lg:pl-8 pb-24 lg:pb-6' : 'pb-6'}`}>
          <Routes>
            <Route path="/" element={<Home user={user} onLogin={onLogin} activeTool={activeTool} setActiveTool={setActiveTool} />} />
            <Route path="/dashboard" element={user.isLoggedIn ? <Dashboard user={user} /> : <Navigate to="/" />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/terms" element={<TermsConditions />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer onSelectTool={handleToolSelect} onLogin={onLogin} isLoggedIn={user.isLoggedIn} />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User>({ id: '', name: '', email: '', isLoggedIn: false });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<AuthState>('login');
  const authModalViewRef = useRef<AuthState>('login');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTool, setActiveTool] = useState<TimerMode | null>(null);
  
  const isMountedRef = useRef(true);

  const handleSetAuthModalView = (view: AuthState) => {
    authModalViewRef.current = view;
    setAuthModalView(view);
  };

  const syncUserProfile = useCallback(async (sessionUser: any) => {
    const userId = sessionUser.id;
    const email = sessionUser.email || '';
    
    // 1. Set basic login state immediately to prevent "logout on refresh" UI flicker
    setUser(prev => ({
      ...prev,
      id: userId,
      email: email,
      isLoggedIn: true,
      name: prev.name || sessionUser.user_metadata?.full_name || email.split('@')[0]
    }));

    try {
      // 2. Background fetch of display name if needed
      if (!sessionUser.user_metadata?.full_name) {
        const { data } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', userId)
          .maybeSingle();
        
        if (data?.full_name && isMountedRef.current) {
          setUser(prev => ({ ...prev, name: data.full_name }));
        }
      }
    } catch (err) {
      console.warn("Profile sync delay.");
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // Safety timeout to ensure app reveals if Supabase takes too long
    const safetyTimeout = setTimeout(() => {
      if (isMountedRef.current && isLoading) {
        setIsLoading(false);
      }
    }, 2500);

    // Initial check and subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMountedRef.current) return;

      if (event === 'PASSWORD_RECOVERY') {
        handleSetAuthModalView('resetPassword');
        setIsAuthModalOpen(true);
        setIsLoading(false);
        return;
      }

      if (session?.user) {
        await syncUserProfile(session.user);
        if (isMountedRef.current && authModalViewRef.current !== 'resetPassword') {
          setIsAuthModalOpen(false);
        }
      } else {
        if (isMountedRef.current) {
          setUser({ id: '', name: '', email: '', isLoggedIn: false });
          setActiveTool(null);
        }
      }
      
      if (isMountedRef.current) {
        setIsLoading(false);
        clearTimeout(safetyTimeout);
      }
    });

    return () => {
      isMountedRef.current = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, [syncUserProfile]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Logout error:", err);
      setUser({ id: '', name: '', email: '', isLoggedIn: false });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-12 h-12 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 bg-blue-500/10 blur-xl animate-pulse rounded-full" />
        </div>
        <div className="space-y-1 text-center">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em]">Secure Protocol</p>
          <p className="text-[9px] font-bold text-slate-700 uppercase tracking-widest">Restoring Session</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AppContent 
        user={user} 
        onLogin={() => {
          handleSetAuthModalView('login');
          setIsAuthModalOpen(true);
        }} 
        handleLogout={handleLogout}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
      />
      {isAuthModalOpen && (
        <AuthModal 
          onClose={() => setIsAuthModalOpen(false)} 
          initialView={authModalView}
        />
      )}
    </BrowserRouter>
  );
};

export default App;
