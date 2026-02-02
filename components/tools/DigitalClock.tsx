
import React, { useState, useEffect } from 'react';

const DigitalClock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="bg-[#0B1120] border border-slate-800 p-12 rounded-3xl shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6">Current Local Time</span>
      <div className="text-7xl md:text-8xl font-black text-white tracking-tighter mb-4 tabular-nums">
        {formatTime(time).split(' ')[0]}
        <span className="text-3xl md:text-4xl text-blue-500 ml-2 font-bold uppercase">
          {formatTime(time).split(' ')[1]}
        </span>
      </div>
      <div className="text-slate-400 font-medium text-lg tracking-wide uppercase">
        {formatDate(time)}
      </div>
    </div>
  );
};

export default DigitalClock;
