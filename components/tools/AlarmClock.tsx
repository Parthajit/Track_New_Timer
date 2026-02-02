
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Plus, Calendar, Clock, Music, Trash2, Check, Volume2 } from 'lucide-react';
import { Alarm } from '../../types';

const TONES = [
  { id: 'classic', label: 'Classic Beep', icon: '🎵' },
  { id: 'digital', label: 'Digital Alarm', icon: '🎶' },
  { id: 'soft', label: 'Soft Chime', icon: '🔔' },
  { id: 'electronic', label: 'Electronic', icon: '🎹' },
];

const AlarmClock: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [selectedTone, setSelectedTone] = useState('classic');
  const [message, setMessage] = useState('');
  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const soundIntervalRef = useRef<number | null>(null);

  const initAudio = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playSingleTone = useCallback((ctx: AudioContext, type: string) => {
    const playClassic = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    };

    const playDigital = () => {
      [0, 0.1, 0.2].forEach(delay => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, ctx.currentTime + delay);
        gain.gain.setValueAtTime(0.4, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.08);
      });
    };

    const playSoft = () => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.8);
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    };

    const playElectronic = () => {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      osc1.type = 'sawtooth';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(220, ctx.currentTime);
      osc2.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);
      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.4);
    };

    if (type === 'classic') playClassic();
    else if (type === 'digital') playDigital();
    else if (type === 'soft') playSoft();
    else if (type === 'electronic') playElectronic();
  }, []);

  const stopSound = useCallback(() => {
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }
  }, []);

  const triggerAlarm = useCallback((alarm: Alarm) => {
    const ctx = initAudio();
    setRingingAlarm(alarm);
    
    // Stop any existing sound
    stopSound();
    
    // Start looping the sound
    soundIntervalRef.current = window.setInterval(() => {
      playSingleTone(ctx, alarm.tone);
    }, alarm.tone === 'soft' ? 1200 : 1000);
    
    // Auto-disable alarm once triggered
    setAlarms(prev => prev.map(a => a.id === alarm.id ? { ...a, isActive: false } : a));
  }, [initAudio, playSingleTone, stopSound]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (ringingAlarm) return;

      const now = new Date();
      const nowDateStr = now.toISOString().split('T')[0];
      const nowTimeStr = now.toTimeString().slice(0, 5);

      alarms.forEach(alarm => {
        if (alarm.isActive && alarm.date === nowDateStr && alarm.time === nowTimeStr) {
          triggerAlarm(alarm);
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms, ringingAlarm, triggerAlarm]);

  const handleStopAlarm = () => {
    stopSound();
    setRingingAlarm(null);
  };

  const handlePreviewTone = (toneId: string) => {
    const ctx = initAudio();
    setSelectedTone(toneId);
    playSingleTone(ctx, toneId);
  };

  const handleSetAlarm = () => {
    initAudio(); // Initialize audio on interaction
    if (!time) return;

    const newAlarm: Alarm = {
      id: Math.random().toString(36).substr(2, 9),
      date,
      time,
      tone: selectedTone,
      message,
      isActive: true,
    };

    setAlarms([...alarms, newAlarm]);
    setTime('');
    setMessage('');
  };

  const deleteAlarm = (id: string) => {
    setAlarms(alarms.filter(a => a.id !== id));
    if (ringingAlarm?.id === id) handleStopAlarm();
  };

  const toggleAlarm = (id: string) => {
    initAudio();
    setAlarms(alarms.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500 relative">
      {ringingAlarm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in zoom-in duration-300">
          <div className="bg-[#0B1120] border-2 border-blue-500 p-12 rounded-[3rem] text-center space-y-8 shadow-[0_0_50px_rgba(59,130,246,0.5)] max-w-lg w-full">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-25" />
              <div className="relative p-8 bg-blue-600 rounded-full">
                <Bell className="w-16 h-16 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase">Alarm Ringing!</h2>
              <p className="text-2xl font-bold text-blue-400">{ringingAlarm.time}</p>
              <p className="text-slate-400 font-medium text-lg">{ringingAlarm.message || 'Time is up!'}</p>
            </div>
            <button
              onClick={handleStopAlarm}
              className="w-full py-6 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-[0.2em] rounded-3xl transition-all shadow-xl shadow-red-600/20 active:scale-95 text-xl"
            >
              Stop Alarm
            </button>
          </div>
        </div>
      )}

      <div className="text-center space-y-2">
        <h2 className="text-5xl font-black text-white tracking-tight uppercase">Alarms</h2>
        <p className="text-slate-500 font-medium">Never miss a deadline or a wake-up call.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-8 items-start">
        <div className="md:col-span-2 bg-[#0B1120] border border-slate-800 rounded-[2.5rem] p-8 space-y-8 shadow-2xl relative">
          <div className="flex items-center gap-3 text-white">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Plus className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold">New Alarm</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Time</label>
              <div className="relative group">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold focus:outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Alarm Tone</label>
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-1">
                <Volume2 className="w-3 h-3" /> Preview Enabled
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {TONES.map(tone => (
                <button
                  key={tone.id}
                  onClick={() => handlePreviewTone(tone.id)}
                  className={`flex items-center justify-between px-4 py-4 rounded-2xl border text-xs font-bold transition-all ${
                    selectedTone === tone.id
                      ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/20'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {tone.label}
                    <Music className="w-3 h-3 opacity-50" />
                  </span>
                  {selectedTone === tone.id && <Check className="w-3 h-3" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Message</label>
            <input
              type="text"
              placeholder="e.g. Wake up call"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 px-6 text-white font-medium placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          <button
            onClick={handleSetAlarm}
            disabled={!time}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:hover:bg-blue-600 text-white font-black uppercase tracking-widest rounded-3xl transition-all shadow-xl shadow-blue-600/20 active:scale-95"
          >
            Set Alarm
          </button>
        </div>

        <div className="md:col-span-3 min-h-[500px] flex flex-col">
          {alarms.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[2.5rem] p-12 text-center group">
              <div className="p-6 bg-slate-900 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500">
                <Clock className="w-12 h-12 text-slate-700" />
              </div>
              <h4 className="text-xl font-bold text-slate-400">No alarms scheduled yet</h4>
              <p className="text-sm text-slate-600 mt-2 max-w-[200px]">Create one on the left to get started.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-4">Active Alarms ({alarms.length})</h3>
              <div className="grid gap-4">
                {alarms.map(alarm => (
                  <div 
                    key={alarm.id} 
                    className={`p-6 rounded-3xl border transition-all flex items-center justify-between group ${
                      alarm.isActive ? 'bg-[#0B1120] border-slate-800 shadow-lg' : 'bg-slate-900/30 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl transition-colors ${alarm.isActive ? 'bg-blue-600/10 text-blue-500' : 'bg-slate-800 text-slate-500'}`}>
                        <Bell className={`w-6 h-6 ${alarm.isActive ? 'animate-bounce' : ''}`} />
                      </div>
                      <div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-black text-white">{alarm.time}</span>
                          <span className="text-xs font-bold text-slate-500 uppercase">{alarm.date}</span>
                        </div>
                        <p className="text-sm font-medium text-slate-400 mt-1">{alarm.message || 'No message'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleAlarm(alarm.id)}
                        className={`relative w-12 h-6 rounded-full transition-colors ${alarm.isActive ? 'bg-blue-600' : 'bg-slate-800'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${alarm.isActive ? 'left-7' : 'left-1'}`} />
                      </button>
                      <button 
                        onClick={() => deleteAlarm(alarm.id)}
                        className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlarmClock;
