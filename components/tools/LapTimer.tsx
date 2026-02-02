
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

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      if (userId && time > 1000) {
        logTimerUsage(userId, 'lap_timer', time, 'Activity');
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, userId]);

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
    <div className="bg-[#0B1120] border border-slate-800 p-8 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row gap-8 relative">
      {userId && (
        <div className="absolute top-6 right-8 flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
          <Cloud className="w-3 h-3" /> Auto-Saving
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-6">Lap Timer</span>
        <div className="text-7xl font-black text-white tabular-nums tracking-tighter mb-10">
          {formatTime(time)}
        </div>
        
        <div className="flex gap-4 w-full max-w-sm">
          <button
            onClick={handleStartStop}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all ${
              isRunning ? 'bg-slate-800 text-slate-300' : 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
            }`}
          >
            {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
            {isRunning ? 'Stop' : 'Start'}
          </button>
          <button
            onClick={handleLap}
            disabled={!isRunning}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold bg-slate-800 text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700"
          >
            <Flag className="w-5 h-5" />
            Lap
          </button>
          <button
            onClick={handleReset}
            className="p-4 bg-slate-900 text-slate-500 border border-slate-800 hover:text-white rounded-2xl transition-all"
            title="Reset"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="w-full md:w-64 bg-slate-900/50 rounded-2xl border border-slate-800 p-4 max-h-[300px] overflow-y-auto">
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2 flex justify-between">
          <span>Lap</span>
          <span>Time</span>
        </div>
        {laps.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-600 italic text-sm py-12">
            No laps yet
          </div>
        ) : (
          <div className="space-y-2">
            {laps.map((lap) => (
              <div key={lap.id} className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-bold">Lap {lap.id.toString().padStart(2, '0')}</span>
                <span className="text-white font-mono">{formatTime(lap.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LapTimer;
