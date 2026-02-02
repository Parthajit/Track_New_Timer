
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Timer, RefreshCw, Cloud } from 'lucide-react';
import { logTimerUsage } from '../../lib/supabase';

interface IntervalTimerProps {
  userId?: string;
}

const IntervalTimer: React.FC<IntervalTimerProps> = ({ userId }) => {
  const [workTime, setWorkTime] = useState(30);
  const [restTime, setRestTime] = useState(10);
  const [rounds, setRounds] = useState(5);
  
  const [currentRound, setCurrentRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(workTime);
  const [phase, setPhase] = useState<'work' | 'rest' | 'complete'>('work');
  const [isRunning, setIsRunning] = useState(false);
  
  const timerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback((freq: number, duration: number) => {
    if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  }, []);

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      if (phase === 'work') {
        playBeep(440, 0.5);
        if (currentRound < rounds) {
          setPhase('rest');
          setTimeLeft(restTime);
        } else {
          setPhase('complete');
          setIsRunning(false);
          if (userId) {
            const totalTimeMs = (workTime * rounds + restTime * (rounds - 1)) * 1000;
            logTimerUsage(userId, 'interval', totalTimeMs, 'Workout');
          }
        }
      } else if (phase === 'rest') {
        playBeep(880, 0.5);
        setPhase('work');
        setCurrentRound((r) => r + 1);
        setTimeLeft(workTime);
      }
    } else if (!isRunning && timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, phase, currentRound, rounds, workTime, restTime, userId, playBeep]);

  const toggleTimer = () => {
    if (phase === 'complete') resetTimer();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setPhase('work');
    setCurrentRound(1);
    setTimeLeft(workTime);
  };

  return (
    <div className="bg-[#0B1120] border border-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden transition-all duration-500">
      {userId && (
        <div className="absolute top-6 right-8 flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
          <Cloud className="w-3 h-3" /> Auto-Saving
        </div>
      )}

      {!isRunning && phase === 'work' && currentRound === 1 && timeLeft === workTime ? (
        <div className="space-y-8 py-6">
          <div className="text-center">
            <h3 className="text-2xl font-black text-white italic uppercase">Set Up Intervals</h3>
            <p className="text-slate-500 text-sm font-medium">Create your exercise routine</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ConfigCard label="Work (sec)" value={workTime} onChange={setWorkTime} color="text-emerald-500" />
            <ConfigCard label="Rest (sec)" value={restTime} onChange={setRestTime} color="text-rose-500" />
            <ConfigCard label="Rounds" value={rounds} onChange={setRounds} color="text-blue-500" />
          </div>
          <button
            onClick={toggleTimer}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest rounded-3xl transition-all shadow-xl shadow-blue-600/20 active:scale-95"
          >
            Start Routine
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center py-6">
          <div className="flex items-center gap-4 mb-8">
            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
              phase === 'work' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
              phase === 'rest' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
              'bg-blue-500/10 text-blue-500 border border-blue-500/20'
            }`}>
              {phase === 'work' ? 'WORK' : phase === 'rest' ? 'REST' : 'COMPLETE'}
            </span>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
              Round {currentRound} of {rounds}
            </span>
          </div>

          <div className={`text-9xl font-black tabular-nums tracking-tighter transition-colors duration-500 ${
            phase === 'work' ? 'text-white' : phase === 'rest' ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {timeLeft}
          </div>

          <div className="flex gap-4 w-full max-w-sm mt-12">
            <button
              onClick={toggleTimer}
              className={`flex-1 flex items-center justify-center gap-2 py-5 rounded-[1.5rem] font-bold text-base transition-all shadow-xl ${
                isRunning 
                  ? 'bg-slate-800 text-slate-300' 
                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20'
              }`}
            >
              {isRunning ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
              {isRunning ? 'Pause' : phase === 'complete' ? 'Restart' : 'Resume'}
            </button>
            <button
              onClick={resetTimer}
              className="px-8 flex items-center justify-center bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white py-5 rounded-[1.5rem] transition-all"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const ConfigCard: React.FC<{ label: string, value: number, onChange: (v: number) => void, color: string }> = ({ label, value, onChange, color }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-[2rem] flex flex-col items-center gap-4">
    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
    <div className="flex items-center gap-6">
      <button onClick={() => onChange(Math.max(1, value - 5))} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
        <RefreshCw className="w-4 h-4" />
      </button>
      <span className={`text-4xl font-black ${color}`}>{value}</span>
      <button onClick={() => onChange(value + 5)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 transition-colors">
        <Timer className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export default IntervalTimer;
