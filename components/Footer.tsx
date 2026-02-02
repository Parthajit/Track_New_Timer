
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Timer, 
  Heart, 
  History, 
  Hourglass, 
  Activity, 
  BarChart2, 
  Clock, 
  Bell 
} from 'lucide-react';
import { TimerMode } from '../types';

interface FooterProps {
  onSelectTool: (mode: TimerMode) => void;
  onLogin: () => void;
  isLoggedIn: boolean;
}

const Footer: React.FC<FooterProps> = ({ onSelectTool, onLogin, isLoggedIn }) => {
  const currentYear = new Date().getFullYear();

  const handleToolClick = (mode: TimerMode) => {
    onSelectTool(mode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#020617] border-t border-slate-900 pt-20 pb-8 px-6 lg:px-12 mt-auto">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-16 gap-y-12 mb-20">
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="p-1.5 bg-blue-600 rounded-lg group-hover:rotate-12 transition-transform shadow-lg shadow-blue-600/20">
                <Timer className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black italic tracking-tighter text-white uppercase">TRACK MY TIMER</span>
            </Link>
            <p className="text-slate-500 text-[10px] font-bold leading-relaxed uppercase tracking-wider max-w-xs">
              Free online timers and clocks for everyone. Simple to use, accurate, and helpful for staying productive.
            </p>
          </div>

          {/* Available Tools Column */}
          <div className="space-y-5">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Our Tools</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8">
              <FooterLink onClick={() => handleToolClick(TimerMode.STOPWATCH)}>Stopwatch</FooterLink>
              <FooterLink onClick={() => handleToolClick(TimerMode.COUNTDOWN)}>Countdown</FooterLink>
              <FooterLink onClick={() => handleToolClick(TimerMode.LAP_TIMER)}>Lap Timer</FooterLink>
              <FooterLink onClick={() => handleToolClick(TimerMode.INTERVAL)}>Interval Timer</FooterLink>
              <FooterLink onClick={() => handleToolClick(TimerMode.DIGITAL_CLOCK)}>Digital Clock</FooterLink>
              <FooterLink onClick={() => handleToolClick(TimerMode.ALARM_CLOCK)}>Alarm Clock</FooterLink>
            </div>
          </div>

          {/* Platform Column */}
          <div className="space-y-5">
            <h4 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">Links</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8">
              <Link to="/about" className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">About Us</Link>
              <Link to="/terms" className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Terms</Link>
              <Link to="/contact" className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Contact Us</Link>
              {isLoggedIn ? (
                <Link to="/dashboard" className="text-[10px] font-bold text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Stats</Link>
              ) : (
                <button onClick={onLogin} className="text-[10px] font-bold text-left text-slate-500 hover:text-white uppercase tracking-widest transition-colors">Login</button>
              )}
            </div>
          </div>

          <div className="hidden lg:block" />
        </div>

        <div className="flex justify-center mb-10">
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl px-8 py-3 flex items-center gap-8 shadow-2xl backdrop-blur-sm">
            <PillIcon icon={<History className="w-4 h-4" />} onClick={() => handleToolClick(TimerMode.STOPWATCH)} />
            <PillIcon icon={<Clock className="w-4 h-4" />} onClick={() => handleToolClick(TimerMode.DIGITAL_CLOCK)} />
            <PillIcon icon={<Hourglass className="w-4 h-4" />} onClick={() => handleToolClick(TimerMode.COUNTDOWN)} />
            <PillIcon icon={<Activity className="w-4 h-4" />} onClick={() => handleToolClick(TimerMode.LAP_TIMER)} />
            <PillIcon icon={<BarChart2 className="w-4 h-4" />} onClick={() => handleToolClick(TimerMode.INTERVAL)} />
            <PillIcon icon={<Bell className="w-4 h-4" />} onClick={() => handleToolClick(TimerMode.ALARM_CLOCK)} />
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-600">
            © {currentYear} TRACK MY TIMER.
          </p>
          <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-600">
            MADE WITH <Heart className="w-3 h-3 text-red-500 fill-red-500 mx-1" /> FOR YOU
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterLink: React.FC<{ children: React.ReactNode; onClick: () => void }> = ({ children, onClick }) => (
  <button 
    onClick={onClick}
    className="text-[10px] font-bold text-left text-slate-500 hover:text-white uppercase tracking-widest transition-colors"
  >
    {children}
  </button>
);

const PillIcon: React.FC<{ icon: React.ReactNode; onClick: () => void }> = ({ icon, onClick }) => (
  <button 
    onClick={onClick}
    className="text-slate-500 hover:text-white hover:scale-125 transition-all duration-300"
  >
    {icon}
  </button>
);

export default Footer;
