import React, { useEffect } from 'react';
import { 
  History, 
  Activity, 
  BarChart2, 
  AlarmClock as AlarmIcon, 
  Zap,
  Clock,
  Hourglass,
  ArrowRight,
  ChevronLeft,
  Target,
  ShieldCheck,
  TrendingUp,
  Users,
  MousePointer2
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
  
  // --- MANUAL SEO UPDATE AREA ---
  useEffect(() => {
    const metaTitle = "Online Timer Tools with Performance Analytics | Smart Time Tracking";
    const metaDescription = "Free online timer tools including stopwatch, countdown, interval timer, and alarm clock with performance analytics to track progress weekly and monthly.";

    document.title = metaTitle;
    const metaTag = document.querySelector('meta[name="description"]');
    if (metaTag) {
      metaTag.setAttribute("content", metaDescription);
    }
  }, []);
  // ------------------------------

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
    <div className={`space-y-24 pb-24 animate-in fade-in duration-700 ${user.isLoggedIn ? 'lg:pl-4' : ''}`}>
      {!activeTool ? (
        <>
          {/* Hero Section */}
          <section className="text-center space-y-6 pt-12 md:pt-20 pb-8 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
            
            <h1 className="text-4xl sm:text-6xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-400 to-blue-700 tracking-tighter uppercase leading-[0.9] select-none drop-shadow-2xl relative z-10 py-2">
              Track my <br className="sm:hidden" /> Timer
            </h1>
            <div className="space-y-4 relative z-10 px-4">
              <p className="max-w-xl mx-auto text-[10px] md:text-xs text-blue-400 font-black uppercase tracking-[0.4em] md:tracking-[0.6em]">
                Manage your time with precision. Improve your performance with insight.
              </p>
              <p className="max-w-2xl mx-auto text-sm md:text-base text-slate-400 font-medium leading-relaxed">
                Our platform offers a complete collection of online timer tools designed for accuracy, speed, and ease of use. Whether you’re training, studying, or optimizing daily productivity, our tools help you stay focused and in control.
              </p>
            </div>
            
            {!user.isLoggedIn && (
              <div className="relative z-10 pt-6">
                <button 
                  onClick={onLogin}
                  className="inline-flex items-center gap-3 px-8 md:px-10 py-3.5 md:py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full transition-all shadow-xl shadow-blue-600/20 active:scale-95 group"
                >
                  <Zap className="w-3.5 h-3.5 fill-current group-hover:scale-125 transition-transform" />
                  Get Started for Free
                </button>
              </div>
            )}
          </section>

          {/* Tools Grid */}
          <section className="max-w-6xl mx-auto px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
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

          {/* Marketing & Info Content Section */}
          <section className="max-w-6xl mx-auto px-4 md:px-6 space-y-24 border-t border-slate-900 pt-24">
            
            {/* Performance Analytics Feature */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8 order-2 lg:order-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                  Premium Feature
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter leading-none">
                  More Than Timers — <span className="text-emerald-500">Smart Tracking</span>
                </h2>
                <div className="space-y-4">
                  <p className="text-lg text-slate-300 font-bold leading-relaxed">
                    What truly sets us apart is our user performance dashboard. We don’t just measure time — we analyze it.
                  </p>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    With built-in weekly and monthly analytics, you can transform simple time tracking into meaningful performance optimization.
                  </p>
                </div>
                <ul className="grid sm:grid-cols-2 gap-4">
                  {[
                    "Track usage patterns",
                    "Monitor consistency",
                    "Review performance history",
                    "Identify opportunities"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm font-black uppercase tracking-tight text-white/90">
                      <div className="p-1 bg-emerald-500/20 rounded text-emerald-500">
                        <TrendingUp size={14} />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-600/10 to-emerald-600/10 rounded-[3rem] p-1 border border-white/5 order-1 lg:order-2">
                <div className="bg-[#020617] rounded-[2.9rem] p-8 md:p-12 aspect-square flex flex-col justify-center items-center text-center space-y-6">
                  <div className="w-24 h-24 bg-blue-600/20 rounded-3xl flex items-center justify-center animate-pulse">
                    <BarChart2 size={48} className="text-blue-500" />
                  </div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Visual Insight</p>
                  <div className="space-y-2">
                    <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-3/4 h-full bg-blue-500" />
                    </div>
                    <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-1/2 h-full bg-emerald-500" />
                    </div>
                    <div className="w-40 h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-purple-500" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Target Audience Section */}
            <div className="text-center space-y-12">
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
                  Built for Growth
                </h2>
                <p className="text-slate-500 text-sm font-black uppercase tracking-[0.2em]">Our tools are trusted by professionals worldwide</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Athletes", icon: <Activity className="text-rose-500" />, sub: "Fitness Enthusiasts" },
                  { label: "Students", icon: <Target className="text-blue-500" />, sub: "Educators" },
                  { label: "Professionals", icon: <Users className="text-purple-500" />, sub: "Remote Workers" },
                  { label: "Optimizers", icon: <Zap className="text-amber-500" />, sub: "Time Managers" }
                ].map((item, i) => (
                  <div key={i} className="p-8 bg-white/5 border border-white/5 rounded-[2.5rem] hover:bg-white/[0.08] transition-colors group">
                    <div className="mb-6 inline-flex p-4 bg-white/5 rounded-2xl group-hover:scale-110 transition-transform">
                      {React.cloneElement(item.icon as React.ReactElement<any>, { size: 28 })}
                    </div>
                    <h4 className="text-xl font-black text-white uppercase italic tracking-tighter mb-1">{item.label}</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Values */}
            <div className="bg-white/5 border border-white/5 rounded-[4rem] p-10 md:p-20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 blur-[120px] pointer-events-none" />
              <div className="grid lg:grid-cols-2 gap-12 items-center relative z-10">
                <div className="space-y-6">
                  <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter">
                    Reliable. Secure. <br /> <span className="text-blue-500 text-5xl md:text-6xl">Easy to Use.</span>
                  </h2>
                  <p className="text-slate-400 font-medium leading-relaxed">
                    Start using smarter timer tools today and take control of your time with confidence. Our architecture is built for speed and privacy.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <ValuePoint icon={<MousePointer2 className="text-blue-500" />} title="No Complexity" desc="Clean, intuitive interface" />
                  <ValuePoint icon={<Zap className="text-blue-500" />} title="Responsive" desc="Accurate, real-time tools" />
                  <ValuePoint icon={<ShieldCheck className="text-blue-500" />} title="Secure" desc="Encrypted user data" />
                  <ValuePoint icon={<Users className="text-blue-500" />} title="Cloud Sync" desc="Access stats anywhere" />
                </div>
              </div>
            </div>

            <div className="text-center py-12">
               <p className="text-[11px] font-black text-slate-600 uppercase tracking-[0.6em] italic">
                 Take Control of Your Time with Confidence.
               </p>
            </div>
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

const ValuePoint: React.FC<{ icon: React.ReactNode, title: string, desc: string }> = ({ icon, title, desc }) => (
  <div className="space-y-2">
    <div className="flex items-center gap-3">
      {icon}
      <h5 className="text-sm font-black text-white uppercase tracking-tight">{title}</h5>
    </div>
    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-7">{desc}</p>
  </div>
);

export default Home;
