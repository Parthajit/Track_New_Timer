import React, { useState, useEffect, useLayoutEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import AboutUs from './pages/AboutUs';
import TermsConditions from './pages/TermsConditions';
import Contact from './pages/Contact';
import AuthModal from './components/AuthModal';
import { User, TimerMode } from './types';
import { supabase } from './lib/supabase';

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
  const [isLoading, setIsLoading] = useState(true);
  const [activeTool, setActiveTool] = useState<TimerMode | null>(null);

  const syncUserProfile = useCallback(async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle();
      if (error) throw error;
      return { id: userId, name: data?.full_name || email.split('@')[0], email: email, isLoggedIn: true };
    } catch (err) {
      console.warn("Using fallback profile data:", err);
      return { id: userId, name: email.split('@')[0], email: email, isLoggedIn: true };
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (isMounted) {
          if (session?.user) {
            const userData = await syncUserProfile(session.user.id, session.user.email || '');
            setUser(userData);
          } else {
            setUser({ id: '', name: '', email: '', isLoggedIn: false });
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        if (session?.user) {
          const userData = await syncUserProfile(session.user.id, session.user.email || '');
          setUser(userData);
          setIsAuthModalOpen(false);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser({ id: '', name: '', email: '', isLoggedIn: false });
        setActiveTool(null);
      }
      
      // Ensure we clear loading if it's still true
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [syncUserProfile]);

  const handleLogout = async () => {
    try {
      // Snappy UI update: Clear local state immediately
      setUser({ id: '', name: '', email: '', isLoggedIn: false });
      setActiveTool(null);
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-6">
        <div className="w-12 h-12 border-2 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] animate-pulse">Establishing Connection</p>
      </div>
    );
  }

  return (
    <HashRouter>
      <AppContent 
        user={user} 
        onLogin={() => setIsAuthModalOpen(true)} 
        handleLogout={handleLogout} 
        activeTool={activeTool} 
        setActiveTool={setActiveTool} 
      />
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </HashRouter>
  );
};

export default App;