
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  History, 
  Hourglass, 
  Activity, 
  BarChart2, 
  Clock, 
  AlarmClock as AlarmIcon,
  LayoutDashboard,
  Timer
} from 'lucide-react';
import { TimerMode } from '../types';

interface SidebarProps {
  activeTool: TimerMode | null;
  onSelectTool: (mode: TimerMode | null) => void;
  currentPath: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTool, onSelectTool, currentPath }) => {
  const tools = [
    { id: TimerMode.STOPWATCH, icon: <History className="w-5 h-5" />, label: "Stopwatch" },
    { id: TimerMode.COUNTDOWN, icon: <Hourglass className="w-5 h-5" />, label: "Countdown" },
    { id: TimerMode.LAP_TIMER, icon: <Activity className="w-5 h-5" />, label: "Lap Timer" },
    { id: TimerMode.INTERVAL, icon: <BarChart2 className="w-5 h-5" />, label: "Interval" },
    { id: TimerMode.DIGITAL_CLOCK, icon: <Clock className="w-5 h-5" />, label: "Clock" },
    { id: TimerMode.ALARM_CLOCK, icon: <AlarmIcon className="w-5 h-5" />, label: "Alarm" },
  ];

  return (
    <aside className="fixed bottom-0 left-0 w-full h-16 lg:h-screen lg:w-20 bg-[#0B1120]/80 backdrop-blur-3xl border-t lg:border-t-0 lg:border-r border-slate-800 z-[60] flex lg:flex-col items-center justify-around lg:justify-start lg:pt-8 lg:gap-4 px-2">
      {/* Dashboard Link */}
      <Link
        to="/dashboard"
        className={`p-3 rounded-2xl transition-all group relative ${
          currentPath === '/dashboard' 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
          : 'text-slate-500 hover:text-white hover:bg-slate-800'
        }`}
        onClick={() => onSelectTool(null)}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-[9px] font-black uppercase tracking-widest text-white rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap hidden lg:block border border-slate-800">
          Analytics
        </span>
      </Link>

      <div className="hidden lg:block w-8 h-px bg-slate-800 my-2" />

      {/* Tool Links */}
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onSelectTool(tool.id)}
          className={`p-3 rounded-2xl transition-all group relative ${
            activeTool === tool.id && currentPath === '/'
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
            : 'text-slate-500 hover:text-white hover:bg-slate-800'
          }`}
        >
          {tool.icon}
          <span className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-[9px] font-black uppercase tracking-widest text-white rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap hidden lg:block border border-slate-800">
            {tool.label}
          </span>
        </button>
      ))}

      <div className="hidden lg:flex mt-auto mb-8 flex-col items-center gap-4">
         <div className="w-8 h-8 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
         </div>
      </div>
    </aside>
  );
};

export default Sidebar;
