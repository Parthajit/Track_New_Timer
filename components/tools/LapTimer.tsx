import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Cloud } from 'lucide-react';
import { Lap } from '../../types';
import { logTimerUsage } from '../../lib/supabase';

interface LapTimerProps {
  userId?: string;
}

const LapTimer: React.FC<LapTimerProps> = ({ userId }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const timerRef = useRef<number | null>(null);
  // Using ref for laps to avoid stale closures in the logger
  const lapsRef = useRef<Lap[]>([]);

  useEffect(() => {
    lapsRef.current = laps;
  }, [laps]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        if (userId && time > 1000) {
          // Pass the actual recorded lap count in metadata
          logTimerUsage(userId, 'lap_timer', time, 'Activity', { 
            lap_count: lapsRef.current.length 
          });
        }
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, userId]); // Dependencies must only trigger logger on stop

  const handleStartStop = () => setIsRunning(!isRunning);
  
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setLaps([]);
  };

  const handleLap = () => {
    if (isRunning) {
      const lastLapTime = laps.length > 0 ? laps[0].overall : 0;
      const newLap: Lap = {
        id: laps.length + 1,
        time: time - lastLapTime,
        overall: time
      };
      setLaps([newLap, ...laps]);
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-12 relative items-center md:items-start">
      <div className="flex-1 flex flex-col items-center">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-8">Performance Laps</span>
        <div className="text-7xl md:text-8xl font-black text-slate-900 tabular-nums tracking-tighter mb-12 select-none">
          {formatTime(time)}
        </div>
        
        <div className="flex gap-4 w-full max-w-sm">
          <button
            onClick={handleStartStop}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all shadow-lg active:scale-95 ${
              isRunning 
                ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-600/20'
            }`}
          >
            {isRunning ? <Pause size={18} /> : <Play size={18} />}
            {isRunning ? 'Pause' : 'Start'}
          </button>
          <button
            onClick={handleLap}
            disabled={!isRunning}
            className="flex-1 flex items-center justify-center gap-3 py-4 rounded-xl font-bold bg-white border border-slate-200 text-slate-600 hover:border-slate-300 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest text-[10px] transition-all"
          >
            <Flag size={18} />
            Lap
          </button>
          <button
            onClick={handleReset}
            className="p-4 bg-white text-slate-400 border border-slate-200 hover:text-slate-900 hover:border-slate-300 rounded-xl transition-all"
            title="Reset"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <div className="w-full md:w-72 bg-slate-50/50 rounded-2xl border border-slate-200 p-6 max-h-[400px] overflow-y-auto no-scrollbar">
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-200 pb-2 flex justify-between">
          <span>Lap</span>
          <span>Duration</span>
        </div>
        {laps.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 italic py-12 gap-2">
            <Flag size={24} className="opacity-20" />
            <span className="text-[10px] font-bold uppercase tracking-widest">No laps recorded</span>
          </div>
        ) : (
          <div className="space-y-3">
            {laps.map((lap) => (
              <div key={lap.id} className="flex justify-between items-center text-xs animate-in slide-in-from-top-1 duration-300">
                <span className="text-slate-400 font-bold uppercase tracking-tighter">Lap {lap.id.toString().padStart(2, '0')}</span>
                <span className="text-slate-900 font-black tabular-nums">{formatTime(lap.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LapTimer;
