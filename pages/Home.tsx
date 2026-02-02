import React from 'react';
import { 
  History, 
  Activity, 
  BarChart2, 
  AlarmClock as AlarmIcon, 
  Zap,
  Clock,
  Hourglass,
  ArrowRight,
  ChevronLeft
} from 'lucide-react';
import Stopwatch from '../components/tools/Stopwatch';
import Countdown from '../components/tools/Countdown';
import LapTimer from '../components/tools/LapTimer';
import DigitalClock from '../components/tools/DigitalClock';
import AlarmClock from '../components/tools/AlarmClock';
import IntervalTimer from '../components/tools/IntervalTimer';
import { User, TimerMode } from '../types';

interface HomeProps {
  user: User;
  onLogin: () => void;
  activeTool: TimerMode | null;
  setActiveTool: (mode: TimerMode | null) => void;
}

const Home: React.FC<HomeProps> = ({ user, onLogin, activeTool, setActiveTool }) => {
  const renderTool = () => {
    if (!activeTool) return null;
    switch (activeTool) {
      case TimerMode.STOPWATCH:
        return <Stopwatch userId={user.id} />;
      case TimerMode.COUNTDOWN:
        return <Countdown userId={user.id} />;
      case TimerMode.LAP_TIMER:
        return <LapTimer userId={user.id} />;
      case TimerMode.DIGITAL_CLOCK:
        return <DigitalClock />;
      case TimerMode.ALARM_CLOCK:
        return <AlarmClock />;
      case TimerMode.INTERVAL:
        return <IntervalTimer userId={user.id} />;
      default:
        return null;
    }
  };

  const toolConfig = [
    { id: TimerMode.STOPWATCH, icon: <History className="w-8 h-8" />, title: "Stopwatch", desc: "Easy to use stopwatch for tracking any activity" },
    { id: TimerMode.COUNTDOWN, icon: <Hourglass className="w-8 h-8" />, title: "Countdown", desc: "Set a timer and get notified when time is up" },
    { id: TimerMode.LAP_TIMER, icon: <Activity className="w-8 h-8" />, title: "Lap Timer", desc: "Track individual laps and see your total progress" },
    { id: TimerMode.INTERVAL, icon: <BarChart2 className="w-8 h-8" />, title: "Intervals", desc: "Perfect for exercise, yoga, and HIIT workouts" },
    { id: TimerMode.DIGITAL_CLOCK, icon: <Clock className="w-8 h-8" />, title: "Clock", desc: "A clean digital clock showing your local time" },
    { id: TimerMode.ALARM_CLOCK, icon: <AlarmIcon className="w-8 h-8" />, title: "Alarms", desc: "Create multiple alarms with custom sounds" },
  ];

  return (
    <div className={`space-y-12 pb-24 animate-in fade-in duration-700 ${user.isLoggedIn ? 'lg:pl-4' : ''}`}>
      {!activeTool ? (
        <>
          <section className="text-center space-y-6 pt-12 md:pt-20 pb-8 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
            
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-400 to-blue-700 tracking-tighter uppercase leading-[0.9] select-none drop-shadow-2xl relative z-10 py-2">
              Track my <br className="sm:hidden" /> Timer
            </h1>
            <p className="max-w-xl mx-auto text-[9px] md:text-xs text-slate-500 font-black uppercase tracking-[0.4em] md:tracking-[0.6em] relative z-10 opacity-70 px-4">
              Simple. Accurate. Free for everyone.
            </p>
            
            {!user.isLoggedIn && (
              <div className="relative z-10 pt-6">
                <button 
                  onClick={onLogin}
                  className="inline-flex items-center gap-3 px-8 md:px-10 py-3.5 md:py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full transition-all shadow-xl shadow-blue-600/20 active:scale-95 group"
                >
                  <Zap className="w-3.5 h-3.5 fill-current group-hover:scale-125 transition-transform" />
                  Get Started
                </button>
              </div>
            )}
          </section>

          <section className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 py-8">
            {toolConfig.map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group relative flex flex-col items-start p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-[#0B1120] border border-slate-800/40 hover:border-blue-500/30 hover:bg-[#0E1629] transition-all duration-500 overflow-hidden text-left shadow-2xl"
              >
                <div className="absolute -right-12 -top-12 w-40 h-40 bg-blue-500/5 rounded-full blur-[60px] group-hover:bg-blue-500/10 transition-colors" />
                
                <div className="p-4 md:p-5 bg-slate-900 border border-slate-800 rounded-2xl mb-8 md:mb-10 text-slate-500 group-hover:text-blue-400 group-hover:bg-blue-600/5 group-hover:border-blue-500/20 transition-all duration-500">
                  {/* Fix: cast tool.icon to React.ReactElement<any> to avoid className typing error on line 102 */}
                  {React.cloneElement(tool.icon as React.ReactElement<any>, { className: 'w-6 h-6 md:w-8 md:h-8' })}
                </div>
                
                <div className="space-y-4 w-full">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl md:text-2xl font-black uppercase italic text-white group-hover:translate-x-1 transition-transform tracking-tighter">
                      {tool.title}
                    </h3>
                    <div className="p-2 md:p-2.5 rounded-xl bg-slate-800 text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    </div>
                  </div>
                  <p className="text-slate-500 text-[10px] md:text-xs font-bold leading-relaxed tracking-tight group-hover:text-slate-300">
                    {tool.desc}
                  </p>
                </div>
              </button>
            ))}
          </section>
        </>
      ) : (
        <section className="max-w-5xl mx-auto w-full min-h-[500px] animate-in slide-in-from-bottom-8 duration-700 px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-10 gap-4 sm:gap-0">
            <button 
              onClick={() => setActiveTool(null)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-all py-2.5 px-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 group"
            >
              <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              Back to Tools
            </button>
            <div className="flex items-center gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[9px] font-black text-blue-500 bg-blue-500/5 px-4 py-1.5 rounded-lg uppercase tracking-[0.2em] border border-blue-500/10">
                {activeTool.replace('_', ' ')}
              </span>
            </div>
          </div>
          
          <div className="relative">
             {renderTool()}
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;