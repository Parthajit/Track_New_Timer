
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LogIn, LogOut, LayoutDashboard, Timer } from 'lucide-react';

interface NavbarProps {
  isLoggedIn: boolean;
  userName: string;
  onLogin: () => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isLoggedIn, userName, onLogin, onLogout }) => {
  const location = useLocation();

  return (
    <nav className={`border-b border-slate-800 bg-[#020617]/80 backdrop-blur-md sticky top-0 z-50 transition-all ${isLoggedIn ? 'lg:pl-20' : ''}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-1.5 bg-blue-600 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-blue-600/20">
            <Timer className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black italic tracking-tighter text-white uppercase group-hover:text-blue-400 transition-colors">Track my Timer</span>
        </Link>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {isLoggedIn && (
              <Link to="/dashboard" className={`hover:text-white transition-colors flex items-center gap-2 ${location.pathname === '/dashboard' ? 'text-white' : ''}`}>
                <LayoutDashboard className="w-3.5 h-3.5" />
                Your Stats
              </Link>
            )}
          </div>

          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <div className="h-8 w-px bg-slate-800 mx-2 hidden md:block" />
              <div className="flex flex-col items-end mr-2 hidden sm:flex">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Logged in as</span>
                <span className="text-xs font-bold text-white">{userName}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
            >
              <LogIn className="w-3.5 h-3.5" />
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
