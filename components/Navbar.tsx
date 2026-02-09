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
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="p-1.5 bg-blue-600 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-blue-600/20">
            <Timer className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <span className="text-sm sm:text-lg md:text-xl font-black italic tracking-tighter text-white uppercase group-hover:text-blue-400 transition-colors block">Track my Timer</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
          {/* Dashboard/Stats Link - Visible when logged in */}
          {isLoggedIn && (
            <Link 
              to="/dashboard" 
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                location.pathname === '/dashboard' 
                ? 'text-blue-400 bg-blue-400/10 border border-blue-400/20 shadow-lg shadow-blue-400/5' 
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Your Stats</span>
            </Link>
          )}

          {isLoggedIn ? (
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="h-8 w-px bg-slate-800 mx-1 hidden sm:block" />
              <div className="flex flex-col items-end mr-2 hidden lg:flex">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Operator</span>
                <span className="text-xs font-bold text-white truncate max-w-[100px]">{userName}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-slate-400 hover:text-red-400"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Exit</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
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
