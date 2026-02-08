import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Flag, Cloud, CheckCircle2, Activity } from 'lucide-react';
import { Lap } from '../../types';
import { logTimerUsage } from '../../lib/supabase';

interface LapTimerProps {
  userId?: string;
}

const LapTimer: React.FC<LapTimerProps> = ({ userId }) => {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<Lap[]>([]);
  const [lastSyncStatus, setLastSyncStatus] = useState<'idle' | 'syncing' | 'success'>('idle');
  
  const timerRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const lapsRef = useRef<Lap[]>([]);

  useEffect(() => {
    timeRef.current = time;
  }, [time]);

  useEffect(() => {
    lapsRef.current = laps;
  }, [laps]);

  const calculateSessionMetrics = () => {
    const currentLaps = lapsRef.current;
    if (currentLaps.length === 0) return null;

    // Calculate Average
    const totalLapTime = currentLaps.reduce((acc, curr) => acc + curr.time, 0);
    const avg = totalLapTime / currentLaps.length;

    // Calculate Consistency (Mean Absolute Deviation percentage)
    let totalDeviation = 0;
    currentLaps.forEach(l => {
      totalDeviation += Math.abs(l.time - avg);
    });
    const avgDeviation = totalDeviation / currentLaps.length;
    // Higher deviation = lower consistency. 100% is perfect.
    const consistency = Math.max(0, Math.min(100, Math.round(100 - (avgDeviation / avg * 100))));

    return {
      lap_count: currentLaps.length,
      avg_lap: Math.round(avg),
      consistency: consistency
    };
  };

  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTime((prev) => prev + 10);
      }, 10);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Sync session when stopped
      if (userId && timeRef.current > 1000) {
        const metrics = calculateSessionMetrics();
        if (metrics) {
          setLastSyncStatus('syncing');
          logTimerUsage(userId, 'lap_timer', timeRef.current, 'Performance', metrics).then(() => {
            setLastSyncStatus('success');
            setTimeout(() => setLastSyncStatus('idle'), 3000);
          });
        }
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
    setLastSyncStatus('idle');
  };

  const handleLap = () => {
    if (isRunning) {
      const currentTime = timeRef.current;
      const lastLapOverall = laps.length > 0 ? laps[0].overall : 0;
      const newLap: Lap = {
        id: laps.length + 1,
        time: currentTime - lastLapOverall,
        overall: currentTime
      };
      setLaps([newLap, ...laps]);
    }
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return {
      main: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
      ms: centiseconds.toString().padStart(2, '0')
    };
  };

  const formatted = formatTime(time);

  return (
    <div className="bg-[#0B1120] border border-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col items-center">
      {userId && (
        <div className="absolute top-6 right-8 flex items-center gap-2">
          {lastSyncStatus === 'success' ? (
            <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-in fade-in slide-in-from-right-2">
              <CheckCircle2 className="w-3 h-3" /> Data Secured
            </div>
          ) : (
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-colors ${lastSyncStatus === 'syncing' ? 'text-blue-400 animate-pulse' : 'text-slate-600'}`}>
              <Cloud className="w-3 h-3" /> {lastSyncStatus === 'syncing' ? 'Syncing...' : 'Chronos Cloud'}
            </div>
          )}
        </div>
      )}

      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 mb-8">Performance Session</span>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-5xl">
        <div className="flex flex-col items-center justify-center space-y-12">
          <div className="flex items-baseline select-none">
            <div className="text-7xl md:text-8xl font-black text-white tabular-nums tracking-tighter drop-shadow-2xl">
              {formatted.main}
            </div>
            <div className="text-3xl md:text-4xl font-bold text-blue-600/50 ml-2 tabular-nums">
              .{formatted.ms}
            </div>
          </div>

          <div className="flex gap-4 w-full max-w-sm">
            <button
              onClick={handleStartStop}
              className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-[0.97] ${
                isRunning 
                  ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20'
              }`}
            >
              {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
              {isRunning ? 'Stop' : 'Start'}
            </button>
            <button
              onClick={handleLap}
              disabled={!isRunning}
              className="flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl font-black bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-widest text-xs transition-all"
            >
              <Flag className="w-4 h-4" />
              Lap
            </button>
            <button
              onClick={handleReset}
              className="px-6 flex items-center justify-center bg-slate-900 border border-slate-800 text-slate-500 hover:bg-slate-800 hover:text-white py-5 rounded-2xl transition-all group"
              title="Reset"
            >
              <RotateCcw className="w-5 h-5 group-hover:rotate-[-45deg] transition-transform" />
            </button>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/60 rounded-[2rem] p-6 flex flex-col h-[350px]">
          <div className="flex items-center justify-between text-[10px] font-black text-slate-600 uppercase tracking-widest mb-6 border-b border-slate-800/50 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-3 h-3" />
              <span>Intervals</span>
            </div>
            <span>Lap Time</span>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
            {laps.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 italic space-y-4 opacity-40">
                <Flag className="w-10 h-10" />
                <span className="text-[10px] font-black uppercase tracking-widest">No laps recorded</span>
              </div>
            ) : (
              laps.map((lap) => {
                const lapFormatted = formatTime(lap.time);
                return (
                  <div 
                    key={lap.id} 
                    className="flex justify-between items-center py-4 px-5 bg-slate-900/40 border border-slate-800/50 rounded-xl hover:bg-slate-800/40 transition-colors animate-in slide-in-from-top-2 duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-[9px] font-black text-blue-500/50 uppercase tracking-widest">#{lap.id.toString().padStart(2, '0')}</span>
                    </div>
                    <div className="text-lg font-black text-white tabular-nums tracking-tighter">
                      {lapFormatted.main}<span className="text-blue-500/50 text-xs ml-0.5">.{lapFormatted.ms}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          {laps.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800/50 flex justify-between items-center px-2">
               <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Average Lap</span>
               <span className="text-xs font-bold text-slate-400 tabular-nums">
                 {(() => {
                   const avg = time / laps.length;
                   const f = formatTime(avg);
                   return `${f.main}.${f.ms}`;
                 })()}
               </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LapTimer;
