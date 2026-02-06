import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
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
  const authInitialized = useRef(false);

  const fetchUserProfile = useCallback(async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .maybeSingle();
      
      return {
        id: userId,
        name: data?.full_name || email.split('@')[0],
        email: email,
        isLoggedIn: true
      };
    } catch (err) {
      console.warn("Profile fetch error:", err);
      return {
        id: userId,
        name: email.split('@')[0],
        email: email,
        isLoggedIn: true
      };
    }
  }, []);

  useEffect(() => {
    if (authInitialized.current) return;
    authInitialized.current = true;

    let isMounted = true;

    // Enhanced safety timeout for auth state
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
        console.log("App: Auth initialization reached safety fallback.");
      }
    }, 4500);

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (isMounted && session?.user) {
          const userData = await fetchUserProfile(session.user.id, session.user.email || '');
          setUser(userData);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
      } finally {
        if (isMounted) {
          clearTimeout(safetyTimer);
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (session?.user) {
        setUser(prev => ({
          ...prev,
          id: session.user.id,
          email: session.user.email || '',
          name: prev.id === session.user.id && prev.name ? prev.name : (session.user.email?.split('@')[0] || 'User'),
          isLoggedIn: true
        }));
        
        setIsAuthModalOpen(false);

        try {
          const fullUser = await fetchUserProfile(session.user.id, session.user.email || '');
          if (isMounted) setUser(fullUser);
        } catch (e) {
          console.error("Failed to fetch profile after auth change:", e);
        }
      } else {
        setUser({ id: '', name: '', email: '', isLoggedIn: false });
        setActiveTool(null);
        setIsAuthModalOpen(false);
      }
      
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(safetyTimer);
    };
  }, [fetchUserProfile]);

  const handleLogout = async () => {
    setUser({ id: '', name: '', email: '', isLoggedIn: false });
    setActiveTool(null);
    setIsAuthModalOpen(false);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn("Signout background task error:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em]">Optimizing Session</p>
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
      {isAuthModalOpen && (
        <AuthModal onClose={() => setIsAuthModalOpen(false)} />
      )}
    </HashRouter>
  );
};

export default App;
