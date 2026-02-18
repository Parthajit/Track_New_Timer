import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User as UserIcon, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, Info, Clipboard, Check, ArrowRight, Hash, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
  initialView?: AuthState;
}

type AuthState = 'login' | 'signup' | 'forgotPassword' | 'verifyCode' | 'resetPassword';

const AuthModal: React.FC<AuthModalProps> = ({ onClose, initialView = 'login' }) => {
  const [view, setView] = useState<AuthState>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; title: string; type: 'error' | 'warning' | 'limit'; isConfigError?: boolean } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  
  const initialFocusRef = useRef<HTMLInputElement>(null);

  const rawOrigin = window.location.origin;
  const originWithoutSlash = rawOrigin.endsWith('/') ? rawOrigin.slice(0, -1) : rawOrigin;

  useEffect(() => {
    setView(initialView);
  }, [initialView]);

  useEffect(() => {
    initialFocusRef.current?.focus();
  }, [view]);

  useEffect(() => {
    let timer: number;
    if (cooldown > 0) {
      timer = window.setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      if (view === 'login') {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        onClose(); 
      } else if (view === 'signup') {
        const { error: authError, data } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            data: { full_name: fullName },
            emailRedirectTo: originWithoutSlash 
          }
        });
        if (authError) throw authError;
        if (data.user && data.user.identities?.length === 0) {
          setError({ title: 'Account Exists', message: 'This email is already registered.', type: 'warning' });
          setLoading(false);
          return;
        }
        setIsSuccess(true);
      } else if (view === 'forgotPassword') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: originWithoutSlash
        });
        if (resetError) throw resetError;
        setCooldown(60); 
        setView('verifyCode');
      } else if (view === 'verifyCode') {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          email,
          token: otp,
          type: 'recovery'
        });
        if (verifyError) throw verifyError;
        // Successful OTP verification established a session automatically
        setView('resetPassword');
      } else if (view === 'resetPassword') {
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        setIsSuccess(true);
      }
    } catch (err: any) {
      console.error("Auth Failure:", err);
      
      let title = 'System Error';
      let message = '';

      // Deep extract error message to avoid {}
      if (err) {
        if (typeof err === 'string') {
          message = err;
        } else {
          // Check standard properties even if not enumerable
          message = err.message || err.error_description || err.error || '';
          
          if (!message && err.error && typeof err.error === 'object') {
            message = err.error.message || '';
          }

          if (!message) {
            const keys = Object.getOwnPropertyNames(err);
            if (keys.length > 0) {
              const details: any = {};
              keys.forEach(k => details[k] = err[k]);
              message = details.message || JSON.stringify(details);
            }
          }
        }
      }

      // Final fallback if still empty
      if (!message || message === '{}' || message === 'undefined') {
        message = 'Security protocol returned an empty response. Verify your network or try again.';
      }

      // Title determination based on message content
      if (err?.status === 429 || message.toLowerCase().includes('rate limit')) {
        title = 'Rate Limit';
        message = 'Too many requests. Please wait 60 seconds.';
        setCooldown(60);
      } else if (message.toLowerCase().includes('otp') || message.toLowerCase().includes('token') || message.toLowerCase().includes('verify')) {
        title = 'Invalid Token';
        message = 'The 6-digit code is incorrect or has expired.';
      } else if (message.toLowerCase().includes('invalid login credentials')) {
        title = 'Access Denied';
        message = 'The password or email provided does not match our records.';
      } else if (message.toLowerCase().includes('empty response')) {
        title = 'Connection Error';
      }

      setError({ title, message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const inputClasses = "w-full bg-slate-950/40 border border-slate-800 rounded-2xl py-4 pl-14 pr-5 text-white font-medium placeholder:text-slate-700 outline-none transition-all focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 hover:bg-slate-900/40 text-sm";
  const labelClasses = "text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 mb-1.5 block";

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
        <div className="bg-[#0B1120] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-12 text-center space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
              {view === 'resetPassword' ? 'Session Updated' : 'Account Created'}
            </h2>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              {view === 'resetPassword' 
                ? 'Your new security key has been established. You are now logged in.'
                : 'Account registration started. Check your email to verify your identity.'}
            </p>
          </div>
          <button onClick={onClose} className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all text-[11px] shadow-xl shadow-blue-600/20 active:scale-[0.98]">
            Complete
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-[#0B1120] border border-slate-800 w-full max-w-md rounded-[2.5rem] p-8 md:p-10 relative shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mb-8 flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
              {view === 'login' ? 'Sign In' : view === 'signup' ? 'Create' : view === 'verifyCode' ? 'Verify' : view === 'resetPassword' ? 'Update' : 'Recover'}
            </h2>
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em]">
              {view === 'verifyCode' ? 'Enter Security Token' : 'Secure Protocol Access'}
            </p>
          </div>
          <button onClick={onClose} className="p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all border border-transparent hover:border-slate-800">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl animate-in slide-in-from-top-4 duration-300">
            <div className="flex gap-4 items-start">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-[11px] font-black uppercase text-red-400 tracking-widest">{error.title}</p>
                <p className="text-[10px] font-bold text-red-300/80 leading-tight">{error.message}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleAuthAction} className="space-y-5">
          {view === 'signup' && (
            <div className="space-y-1">
              <label className={labelClasses}>Full Name</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-600 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <UserIcon size={18} />
                </div>
                <input ref={initialFocusRef} type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" className={inputClasses} />
              </div>
            </div>
          )}

          {(view !== 'resetPassword') && (
            <div className="space-y-1">
              <label className={labelClasses}>Network Email</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-600 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <Mail size={18} />
                </div>
                <input 
                  ref={view === 'login' || view === 'forgotPassword' ? initialFocusRef : undefined} 
                  type="email" 
                  required 
                  readOnly={view === 'verifyCode'}
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="user@domain.com" 
                  className={`${inputClasses} ${view === 'verifyCode' ? 'opacity-50' : ''}`} 
                />
              </div>
            </div>
          )}

          {view === 'verifyCode' && (
            <div className="space-y-1">
              <label className={labelClasses}>6-Digit Recovery Code</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-600 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <Hash size={18} />
                </div>
                <input 
                  ref={initialFocusRef}
                  type="text" 
                  required 
                  maxLength={6}
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} 
                  placeholder="000000" 
                  className="w-full bg-slate-950/40 border border-slate-800 rounded-2xl py-4 pl-14 pr-5 text-white font-black tracking-[0.5em] placeholder:text-slate-700 outline-none transition-all focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 hover:bg-slate-900/40 text-xl" 
                />
              </div>
              <div className="flex justify-between items-center px-1 mt-3">
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Code sent to your email</p>
                <button 
                  type="button" 
                  disabled={cooldown > 0}
                  onClick={() => setView('forgotPassword')} 
                  className="text-[9px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest disabled:opacity-30 flex items-center gap-1"
                >
                  <RefreshCw size={10} className={cooldown > 0 ? 'animate-spin' : ''} />
                  {cooldown > 0 ? `Wait ${cooldown}s` : 'Resend Code'}
                </button>
              </div>
            </div>
          )}

          {(view === 'login' || view === 'signup' || view === 'resetPassword') && (
            <div className="space-y-1">
              <div className="flex justify-between items-center px-1 mb-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                  {view === 'resetPassword' ? 'New Password' : 'Password'}
                </label>
                {view === 'login' && (
                  <button type="button" onClick={() => { setView('forgotPassword'); setError(null); }} className="text-[9px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest transition-colors outline-none focus:text-white">
                    Recover Key?
                  </button>
                )}
              </div>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center justify-center text-slate-600 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                  <Lock size={18} />
                </div>
                <input ref={view === 'resetPassword' ? initialFocusRef : undefined} type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={`${inputClasses} pr-14`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors z-10">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading} 
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black uppercase tracking-[0.25em] rounded-2xl transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98] active:shadow-none text-[11px] group flex items-center justify-center gap-3 mt-4 border-t border-white/10"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                {view === 'login' ? 'Sign In' : view === 'signup' ? 'Finalize Profile' : view === 'forgotPassword' ? 'Send Code' : view === 'verifyCode' ? 'Confirm Token' : 'Update Key'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-800/50 flex flex-col gap-4">
          <button 
            onClick={() => { 
              if (view === 'resetPassword' || view === 'forgotPassword' || view === 'verifyCode') {
                setView('login');
              } else {
                setView(view === 'login' ? 'signup' : 'login');
              }
              setError(null); 
            }} 
            className="w-full py-3 text-[10px] font-black text-slate-500 hover:text-blue-400 hover:bg-blue-400/5 rounded-xl uppercase tracking-widest transition-all border border-transparent hover:border-blue-400/10"
          >
            {view === 'login' ? "Register New Identity" : "Back to Login Terminal"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
