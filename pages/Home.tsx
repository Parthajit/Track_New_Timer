import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
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
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

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
      <Helmet>
        <title>Online Timer with Performance Analytics | Stopwatch, Interval Timer & Study Timer</title>
        <meta name="description" content="Use our online timer tools including stopwatch, lap timer, interval timer and study timer with advanced timer performance analytics and tracking dashboard." />
      </Helmet>
      {!activeTool ? (
        <>
          {/* Hero Section */}
          <section className="text-center space-y-6 pt-12 md:pt-20 pb-8 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
            
            {/* Hero Digital Clock */}
            <div className="relative z-10 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
              <div className="inline-flex flex-col items-center px-8 py-4 bg-white/5 border border-white/10 rounded-3xl backdrop-blur-md shadow-2xl">
                <span className="text-[9px] font-black text-blue-500 uppercase tracking-[0.4em] mb-2">Local Time</span>
                <div className="text-4xl md:text-5xl font-black text-white tracking-tighter tabular-nums flex items-baseline gap-2">
                  {formatTime(currentTime).split(' ')[0]}
                  <span className="text-lg md:text-xl text-blue-400 font-bold uppercase">
                    {formatTime(currentTime).split(' ')[1]}
                  </span>
                </div>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-300 to-blue-600 tracking-tight leading-tight select-none drop-shadow-xl relative z-10 py-2 max-w-4xl mx-auto">
              Smart Online Timer Tools <br className="hidden md:block" /> with Performance Analytics
            </h1>
            <div className="space-y-4 relative z-10 px-4">
              <p className="max-w-xl mx-auto text-[10px] md:text-xs text-blue-400 font-black uppercase tracking-[0.4em] md:tracking-[0.6em]">
                Precision Timing Meets Productivity Intelligence
              </p>
              <p className="max-w-3xl mx-auto text-sm md:text-base text-slate-400 font-medium leading-relaxed">
                TrackMyTimer provides powerful online timer tools designed for productivity, training, and performance tracking. Whether you need an online timer for study, a stopwatch timer for study, or an online interval timer, our platform helps you measure time with precision.
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

          {/* How to Use Section */}
          <section className="max-w-6xl mx-auto px-4 md:px-6 py-24 space-y-16">
            <div className="text-center space-y-6 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                How to Use Our Online Timer & <span className="text-blue-500">Performance Analytics</span> Platform
              </h2>
              <p className="text-slate-400 text-sm md:text-base font-medium leading-relaxed">
                Getting started with TrackMyTimer is simple. Our platform combines powerful online timer tools with advanced online timer performance analytics to help you track and improve productivity.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Choose the Right Online Timer Tool",
                  desc: "Select the tool based on your needs:",
                  items: [
                    "Use an online timer for study to manage focus sessions",
                    "Try the online stopwatch timer for study for precise tracking",
                    "Use an online stopwatch with lap for workouts or tasks",
                    "Choose an online interval timer free for structured sessions",
                    "Use an online timer with alarm for reminders"
                  ],
                  footer: "Each tool is designed to work instantly in your browser."
                },
                {
                  step: "2",
                  title: "Start Your Timer Session",
                  desc: "Start using your preferred online timer, online stopwatch, or online interval timer with a single click.",
                  items: [
                    "Track time accurately",
                    "Record laps using the online lap timer",
                    "Measure splits using the online split timer"
                  ],
                  footer: "No installation required — everything works online."
                },
                {
                  step: "3",
                  title: "Track Your Timer Usage Automatically",
                  desc: "As you use the tools, your sessions contribute to your timer performance tracking system.",
                  items: [
                    "Stopwatch sessions",
                    "Study timer usage",
                    "Interval timer activities"
                  ],
                  footer: "All data is securely recorded for analysis."
                },
                {
                  step: "4",
                  title: "Access the Performance Analytics Dashboard",
                  desc: "View your data inside the online timer performance analyzer dashboard. You can explore:",
                  items: [
                    "Online timer performance analysis reports",
                    "Weekly and monthly productivity trends",
                    "Session duration and consistency"
                  ],
                  footer: "This helps you understand how effectively you use your time."
                },
                {
                  step: "5",
                  title: "Run a Timer Performance Test",
                  desc: "Use your session history to perform an online timer performance test. This allows you to:",
                  items: [
                    "Measure improvement over time",
                    "Identify productivity patterns",
                    "Optimize your study or work sessions"
                  ]
                },
                {
                  step: "6",
                  title: "Improve with Data-Driven Insights",
                  desc: "With built-in online timer performance analytics, you can:",
                  items: [
                    "Track progress using online timer performance analysis free tools",
                    "Improve consistency and focus",
                    "Build better time management habits"
                  ],
                  footer: "TrackMyTimer turns a simple online timer clock for study into a powerful productivity system."
                }
              ].map((item, i) => (
                <div key={i} className="p-8 bg-slate-900/50 border border-slate-800/50 rounded-[2rem] space-y-6 hover:border-blue-500/20 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 font-black text-sm">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight leading-tight group-hover:text-blue-400 transition-colors">
                      {item.title}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-xs text-slate-400 font-medium leading-relaxed">{item.desc}</p>
                    <ul className="space-y-2">
                      {item.items.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[11px] text-slate-500 font-medium leading-tight">
                          <span className="text-blue-500 mt-1">▹</span>
                          {bullet}
                        </li>
                      ))}
                    </ul>
                    {item.footer && (
                      <p className="text-[10px] text-blue-400/80 font-bold uppercase tracking-wider pt-2 border-t border-slate-800/50">
                        {item.footer}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Marketing & Info Content Section */}
          <section className="max-w-6xl mx-auto px-4 md:px-6 space-y-24 border-t border-slate-900 pt-24">
            
            {/* Detailed Content Section */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
                  Advanced <span className="text-blue-500">Timer Performance</span> Tracking
                </h2>
                <div className="space-y-4">
                  <p className="text-lg text-slate-300 font-bold leading-relaxed">
                    Unlike basic timers, TrackMyTimer also offers a timer performance tracking system that allows users to monitor timer usage and analyze productivity trends.
                  </p>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    The built-in online timer performance analytics dashboard helps users view historical performance data and improve productivity over time.
                  </p>
                </div>
                <div className="grid sm:grid-cols-1 gap-4">
                  {[
                    "Online stopwatch with lap tracking",
                    "Online lap timer and split timer",
                    "Online interval timer free for workouts or study sessions",
                    "Online timer with alarm for reminders",
                    "Online timer clock for study focus sessions"
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-white/5 border border-white/5 rounded-2xl group hover:bg-blue-600/5 hover:border-blue-500/20 transition-all">
                      <div className="p-2 bg-blue-600/20 rounded-lg text-blue-500 group-hover:scale-110 transition-transform">
                        <ShieldCheck size={18} />
                      </div>
                      <span className="text-xs md:text-sm font-black uppercase tracking-tight text-white/90">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-600/10 to-emerald-600/10 rounded-[3rem] p-1 border border-white/5">
                <div className="bg-[#020617] rounded-[2.9rem] p-8 md:p-12 aspect-square flex flex-col justify-center items-center text-center space-y-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
                    <BarChart2 size={80} className="text-blue-500 relative z-10" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Performance Insights</h3>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest max-w-xs">
                      Visualize your focus and productivity with automated data collection.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="w-2 bg-blue-500/20 rounded-full" style={{ height: `${20 + i * 15}px` }}>
                        <div className="w-full bg-blue-500 rounded-full" style={{ height: `${10 + i * 10}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

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
