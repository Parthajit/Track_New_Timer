
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Cloud } from 'lucide-react';
import { logTimerUsage } from '../../lib/supabase';

interface CountdownProps {
  userId?: string;
}

const Countdown: React.FC<CountdownProps> = ({ userId }) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<number | null>(null);
  const initialDurationRef = useRef<number>(0);

  const startTimer = () => {
    if (!isRunning) {
      const totalSeconds = hours * 3600 + minutes * 60 + seconds;
      if (totalSeconds > 0) {
        initialDurationRef.current = totalSeconds;
        setTimeLeft(totalSeconds);
        setIsRunning(true);
      }
    } else {
      setIsRunning(false);
      if (userId && (initialDurationRef.current - timeLeft) > 1) {
        logTimerUsage(userId, 'countdown', (initialDurationRef.current - timeLeft) * 1000, 'Focus');
      }
    }
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(0);
    setHours(0);
    setMinutes(5);
    setSeconds(0);
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      alert('Time is up!');
      if (userId) {
        logTimerUsage(userId, 'countdown', initialDurationRef.current * 1000, 'Focus');
      }
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, userId]);

  const displayHours = Math.floor(timeLeft / 3600);
  const displayMinutes = Math.floor((timeLeft % 3600) / 60);
  const displaySeconds = timeLeft % 60;

  return (
    <div className="bg-[#0B1120] border border-slate-800 p-8 rounded-3xl flex flex-col items-center justify-center min-h-[300px] shadow-2xl shadow-green-500/5 relative overflow-hidden">
      {userId && (
        <div className="absolute top-6 right-8 flex items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest">
          <Cloud className="w-3 h-3" /> Auto-Saving
        </div>
      )}

      <span className="text-xs font-bold uppercase tracking-[0.3em] text-slate-500 mb-6">Countdown Timer</span>
      
      {!isRunning && timeLeft === 0 ? (
        <div className="flex gap-4 mb-10">
          <InputBox label="HOURS" value={hours} onChange={setHours} max={99} />
          <div className="text-3xl font-bold text-slate-700 flex items-center">:</div>
          <InputBox label="MINUTES" value={minutes} onChange={setMinutes} max={59} />
          <div className="text-3xl font-bold text-slate-700 flex items-center">:</div>
          <InputBox label="SECONDS" value={seconds} onChange={setSeconds} max={59} />
        </div>
      ) : (
        <div className="text-7xl sm:text-8xl font-black text-white tabular-nums tracking-tighter mb-10">
          {displayHours.toString().padStart(2, '0')}:
          {displayMinutes.toString().padStart(2, '0')}:
          {displaySeconds.toString().padStart(2, '0')}
        </div>
      )}

      <div className="flex gap-4 w-full max-w-xs">
        <button
          onClick={startTimer}
          className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${
            isRunning 
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
              : 'bg-green-600 text-white hover:bg-green-500 shadow-green-600/20'
          }`}
        >
          {isRunning ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
          {isRunning ? 'Stop' : 'Start'}
        </button>
        {(isRunning || timeLeft > 0) && (
          <button
            onClick={resetTimer}
            className="px-6 flex items-center justify-center bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white py-4 rounded-2xl transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

interface InputBoxProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  max: number;
}

const InputBox: React.FC<InputBoxProps> = ({ label, value, onChange, max }) => (
  <div className="flex flex-col items-center gap-2">
    <div className="relative group">
      <input
        type="number"
        min="0"
        max={max}
        value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(0, parseInt(e.target.value) || 0)))}
        className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-900 border border-slate-800 text-center text-2xl font-black text-white rounded-2xl focus:border-green-500 focus:outline-none focus:ring-4 focus:ring-green-500/10 transition-all appearance-none"
      />
    </div>
    <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">{label}</span>
  </div>
);

export default Countdown;
