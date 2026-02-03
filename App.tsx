import React, { useState, useEffect, useLayoutEffect } from 'react';
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

  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      const { data } = await supabase.from('profiles').select('full_name').eq('id', userId).maybeSingle();
      return { id: userId, name: data?.full_name || email.split('@')[0], email: email, isLoggedIn: true };
    } catch (err) {
      return { id: userId, name: email.split('@')[0], email: email, isLoggedIn: true };
    }
  };

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const userData = await fetchUserProfile(session.user.id, session.user.email || '');
        setUser(userData);
        setIsAuthModalOpen(false);
      } else {
        setUser({ id: '', name: '', email: '', isLoggedIn: false });
        setActiveTool(null);
      }
      setIsLoading(false);
    });

    const checkInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const userData = await fetchUserProfile(session.user.id, session.user.email || '');
          setUser(userData);
        }
      } catch (err) {
        console.error("Session initial check error:", err);
      } finally {
        setIsLoading(false);
        clearTimeout(loadingTimeout);
      }
    };

    checkInitialSession();
    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center space-y-6">
        <div className="w-10 h-10 border-2 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] animate-pulse">Establishing Protocol</p>
      </div>
    );
  }

  return (
    <HashRouter>
      <AppContent user={user} onLogin={() => setIsAuthModalOpen(true)} handleLogout={handleLogout} activeTool={activeTool} setActiveTool={setActiveTool} />
      {isAuthModalOpen && <AuthModal onClose={() => setIsAuthModalOpen(false)} />}
    </HashRouter>
  );
};

export default App;