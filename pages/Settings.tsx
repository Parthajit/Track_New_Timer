
import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Bell, 
  Shield, 
  Database, 
  Volume2, 
  Save,
  CheckCircle2,
  Lock,
  Loader2,
  Zap,
  Moon,
  Trash2
} from 'lucide-react';
import { User } from '../types';
import { supabase } from '../lib/supabase';

interface SettingsProps {
  user: User;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [fullName, setFullName] = useState(user.name);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  
  const [notifications, setNotifications] = useState(() => {
    return localStorage.getItem('timer_notifications') !== 'false';
  });
  const [soundVolume, setSoundVolume] = useState(() => {
    return parseInt(localStorage.getItem('timer_volume') || '80');
  });
  const [audioSuccess, setAudioSuccess] = useState(false);

  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [highPerformanceMode, setHighPerformanceMode] = useState(false);

  useEffect(() => {
    localStorage.setItem('timer_notifications', notifications.toString());
    localStorage.setItem('timer_volume', soundVolume.toString());
  }, [notifications, soundVolume]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: fullName });
    
    if (!error) {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    }
    setSavingProfile(false);
  };

  const saveAudioPrefs = () => {
    setAudioSuccess(true);
    setTimeout(() => setAudioSuccess(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-1000 pb-20">
      <header className="text-center space-y-4 pt-10">
        <h1 className="text-6xl md:text-7xl font-black text-white italic uppercase tracking-tighter">Settings</h1>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.6em] opacity-80">Manage your profile and preferences</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-4 hidden md:block">
          <SettingsNavButton active icon={<UserIcon className="w-4 h-4" />} label="Profile Info" />
          <SettingsNavButton icon={<Bell className="w-4 h-4" />} label="Notifications" />
          <SettingsNavButton icon={<Shield className="w-4 h-4" />} label="Security" />
          <SettingsNavButton icon={<Database className="w-4 h-4" />} label="Data Sync" />
        </div>

        <div className="md:col-span-3 space-y-10">
          <section className="bg-[#0B1120] border border-slate-800 rounded-[3rem] p-12 shadow-2xl space-y-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <UserIcon className="w-64 h-64 text-blue-500" />
            </div>
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="p-5 bg-blue-600/10 border border-blue-500/20 rounded-3xl text-blue-500 shadow-xl shadow-blue-500/5">
                <UserIcon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Profile Info</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Update your name and email settings</p>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Your Name</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-5 px-8 text-white font-black outline-none focus:border-blue-500 focus:bg-slate-800 transition-all text-sm"
                  placeholder="Enter your name"
                />
              </div>
              <div className="space-y-3 opacity-60">
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Your Email</label>
                <div className="flex items-center justify-between bg-slate-900/40 border border-slate-800 rounded-2xl py-5 px-8 text-slate-400 font-bold text-sm">
                  <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4" />
                    {user.email}
                  </div>
                  <span className="text-[9px] font-black uppercase text-blue-500 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">Verified</span>
                </div>
              </div>
              
              <button 
                type="submit"
                disabled={savingProfile}
                className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 active:scale-95 text-[11px]"
              >
                {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : profileSuccess ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {profileSuccess ? 'Profile Updated' : 'Save Changes'}
              </button>
            </form>
          </section>

          <section className="bg-[#0B1120] border border-slate-800 rounded-[3rem] p-12 shadow-2xl space-y-10 group relative">
            <div className="flex items-center gap-6">
              <div className="p-5 bg-purple-600/10 border border-purple-500/20 rounded-3xl text-purple-500 shadow-xl shadow-purple-500/5">
                <Volume2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Sounds & Alerts</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Adjust volume and notification alerts</p>
              </div>
            </div>

            <div className="space-y-10">
              <div className="flex items-center justify-between p-6 bg-slate-900/30 rounded-3xl border border-slate-800/50">
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white uppercase tracking-widest">Timer Notifications</h4>
                  <p className="text-[10px] text-slate-500 uppercase font-bold">Get alerted when a timer finishes</p>
                </div>
                <button 
                  onClick={() => { setNotifications(!notifications); saveAudioPrefs(); }}
                  className={`w-14 h-7 rounded-full relative transition-all shadow-inner ${notifications ? 'bg-blue-600' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-md ${notifications ? 'left-8' : 'left-1'}`} />
                </button>
              </div>

              <div className="space-y-5 px-4">
                <div className="flex justify-between items-center text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  <span>Volume Level</span>
                  <span className="text-blue-500 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">{soundVolume}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={soundVolume}
                  onChange={(e) => { setSoundVolume(parseInt(e.target.value)); saveAudioPrefs(); }}
                  className="w-full h-2 bg-slate-800 rounded-xl appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {audioSuccess && (
                <div className="flex items-center gap-2 justify-center text-emerald-500 text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Settings Saved
                </div>
              )}
            </div>
          </section>

          <section className="bg-red-950/5 border border-red-900/30 rounded-[3rem] p-12 space-y-8 relative overflow-hidden">
             <div className="absolute inset-0 bg-red-900/5 blur-3xl pointer-events-none" />
             <div className="flex items-center gap-6 relative z-10">
               <div className="p-5 bg-red-600/10 border border-red-500/20 rounded-3xl text-red-500 shadow-xl shadow-red-500/5">
                 <Trash2 className="w-8 h-8" />
               </div>
               <div>
                 <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">Danger Zone</h2>
                 <p className="text-[10px] font-black text-red-500/60 uppercase tracking-widest">Careful! These actions cannot be undone</p>
               </div>
             </div>
             
             <div className="p-8 bg-red-900/10 border border-red-900/20 rounded-3xl space-y-4 relative z-10">
               <p className="text-xs text-red-400/80 font-bold uppercase leading-relaxed tracking-wider">
                 Delete Account: This will permanently delete your account, your statistics, and all your history.
               </p>
               <button className="px-10 py-5 bg-red-600 hover:bg-red-500 text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl transition-all shadow-xl shadow-red-600/30 active:scale-95">
                 Delete My Data
               </button>
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const SettingsNavButton: React.FC<{ active?: boolean, icon: React.ReactNode, label: string }> = ({ active, icon, label }) => (
  <button className={`w-full flex items-center gap-4 px-8 py-5 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30' : 'text-slate-500 hover:text-white hover:bg-slate-900/80 border border-transparent hover:border-slate-800 shadow-lg'}`}>
    {icon}
    {label}
  </button>
);

export default Settings;
