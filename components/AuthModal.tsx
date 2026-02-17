import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User as UserIcon, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, ShieldAlert, Hash, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
}

type AuthState = 'login' | 'signup' | 'forgotPassword' | 'resetPassword';

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [view, setView] = useState<AuthState>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; title: string; type: 'error' | 'warning' | 'limit'; details?: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  
  const initialFocusRef = useRef<HTMLInputElement>(null);

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

  const validateForm = () => {
    if (!email || !email.includes('@')) {
      setError({ title: 'Invalid Email', message: 'Please enter a valid email address.', type: 'error' });
      return false;
    }
    if (view !== 'forgotPassword' && password.length < 6) {
      setError({ title: 'Short Password', message: 'Passwords must be at least 6 characters long.', type: 'error' });
      return false;
    }
    if (view === 'signup' && fullName.trim().length < 2) {
      setError({ title: 'Name Required', message: 'Please enter your name to sign up.', type: 'error' });
      return false;
    }
    if (view === 'resetPassword' && resetCode.length < 6) {
      setError({ title: 'Invalid Code', message: 'Please enter the 6-digit code from your email.', type: 'error' });
      return false;
    }
    return true;
  };

  const handleForgotPassword = async () => {
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    
    if (resetError) throw resetError;
    
    setView('resetPassword');
    setLoading(false);
    setError({
      title: 'Action Required',
      message: 'If an account exists, a recovery code has been sent to your email.',
      type: 'warning'
    });
  };

  const handleResetPassword = async () => {
    setLoading(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: resetCode,
      type: 'recovery'
    });
    if (verifyError) throw verifyError;

    const { error: updateError } = await supabase.auth.updateUser({
      password: password
    });
    if (updateError) throw updateError;

    setIsSuccess(true);
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || loading || cooldown > 0) return;

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
            emailRedirectTo: window.location.origin 
          }
        });
        if (authError) throw authError;
        if (data.user) {
          if (data.user.identities?.length === 0) {
            setError({ title: 'Account Exists', message: 'This email is already registered.', type: 'warning' });
            setLoading(false);
            return;
          }
          setIsSuccess(true);
        }
      } else if (view === 'forgotPassword') {
        await handleForgotPassword();
      } else if (view === 'resetPassword') {
        await handleResetPassword();
      }
    } catch (err: any) {
      // PROACTIVE FIX: Comprehensive error extraction
      console.error("Authentication Error Details:", err);
      
      let title = 'System Error';
      let message = 'An unexpected error occurred during authentication.';
      let type: 'error' | 'warning' | 'limit' = 'error';

      // Status check (Supabase returns status for many errors)
      const status = err?.status || err?.status_code || 0;

      if (status === 429 || (err?.message && err.message.toLowerCase().includes('rate limit'))) {
        title = 'Rate Limited';
        message = 'Too many requests. Please wait 60 seconds before trying again.';
        type = 'limit';
        setCooldown(60);
      } else if (err?.message && err.message !== '{}') {
        message = err.message;
      } else if (err?.error_description) {
        message = err.error_description;
      } else if (err?.error) {
        message = typeof err.error === 'string' ? err.error : (err.error.message || message);
      } else if (typeof err === 'string' && err !== '{}') {
        message = err;
      }

      // If we still end up with nothing or '{}', provide a helpful diagnostic message
      if (message === '{}' || !message || message.trim() === '') {
        message = 'The server returned an empty response. This is often caused by incorrect Redirect URLs in Supabase settings or Email Provider (SMTP) rate limits.';
      }

      const msgLower = message.toLowerCase();
      if (msgLower.includes('invalid login credentials')) {
        title = 'Login Failed';
        message = 'Email or password incorrect.';
      } else if (msgLower.includes('otp') || msgLower.includes('token')) {
        title = 'Invalid Code';
        message = 'The recovery code is incorrect or has expired.';
      }

      setError({ title, message, type });
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const CloseButton = () => (
    <button 
      onClick={onClose} 
      className="absolute top-6 right-6 p-2.5 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-all z-[120]"
      aria-label="Close modal"
    >
      <X className="w-5 h-5" />
    </button>
  );

  if (isSuccess) {
    const isReset = view === 'resetPassword';
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={handleBackdropClick}>
        <div className="bg-[#0B1120] border border-slate-800 w-full max-w-md rounded-[3rem] p-12 relative shadow-2xl text-center space-y-8" onClick={(e) => e.stopPropagation()}>
          <CloseButton />
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
              {isReset ? 'Success' : 'Check Email'}
            </h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
              {isReset ? 'Password updated' : 'Security link sent'}
            </p>
          </div>
          <p className="text-slate-500 font-medium leading-relaxed text-sm">
            {isReset ? 'Your password has been changed. You can now sign in with your new credentials.' : `A confirmation message has been sent to ${email}.`}
          </p>
          <button onClick={() => isReset ? setView('login') : onClose()} className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl shadow-blue-600/30 text-xs active:scale-95">
            {isReset ? 'Go to Sign In' : 'Done'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300" onClick={handleBackdropClick}>
      <div className="bg-[#0B1120] border border-slate-800 w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <CloseButton />

        <div className="mb-10 relative z-10 flex items-start justify-between pr-14">
          <div>
            <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none">
              {view === 'login' ? 'Login' : view === 'signup' ? 'Sign Up' : view === 'forgotPassword' ? 'Reset' : 'Verify'}
            </h2>
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] mt-3 opacity-80">
              {view === 'login' ? 'Welcome back' : view === 'signup' ? 'System entry' : 'Account Recovery'}
            </p>
          </div>
          {view !== 'login' && view !== 'signup' && (
            <button 
              type="button"
              onClick={() => { setView('login'); setError(null); }} 
              className="p-2.5 text-slate-500 hover:text-white transition-all bg-slate-900 rounded-xl border border-slate-800 hover:border-slate-700 active:scale-95"
            >
               <ArrowLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {error && (
          <div className={`mb-8 p-5 border rounded-3xl animate-in slide-in-from-top-4 duration-500 shadow-xl ${
            error.type === 'limit' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
            error.type === 'warning' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
            'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <div className="flex gap-4 items-start">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <p className="text-[11px] font-black uppercase tracking-widest">{error.title}</p>
                <p className="text-[10px] font-bold opacity-80 leading-normal">{error.message}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {view === 'signup' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Display Name</label>
              <div className="relative group">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <input ref={initialFocusRef} type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl py-5 pl-14 pr-5 text-white font-bold focus:border-blue-500/50 focus:bg-slate-900/80 outline-none transition-all placeholder:text-slate-700 text-sm" />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
              <input ref={view === 'login' ? initialFocusRef : undefined} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operator@domain.com" className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl py-5 pl-14 pr-5 text-white font-bold focus:border-blue-500/50 focus:bg-slate-900/80 outline-none transition-all placeholder:text-slate-700 text-sm" />
            </div>
          </div>

          {view === 'resetPassword' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">6-Digit Recovery Code</label>
              <div className="relative group">
                <Hash className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <input type="text" required maxLength={6} value={resetCode} onChange={(e) => setResetCode(e.target.value)} placeholder="000000" className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl py-5 pl-14 pr-5 text-white font-black tracking-[0.5em] focus:border-blue-500/50 focus:bg-slate-900/80 outline-none transition-all placeholder:text-slate-700 text-sm" />
              </div>
            </div>
          )}

          {view !== 'forgotPassword' && (
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{view === 'resetPassword' ? 'Set New Password' : 'Password'}</label>
                {view === 'login' && (
                  <button type="button" onClick={() => { setView('forgotPassword'); setError(null); }} className="text-[9px] font-black text-blue-500 hover:text-white uppercase tracking-widest transition-colors">Recover Account</button>
                )}
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl py-5 pl-14 pr-14 text-white font-bold focus:border-blue-500/50 focus:bg-slate-900/80 outline-none transition-all placeholder:text-slate-700 text-sm" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button type="submit" disabled={loading || cooldown > 0} className={`w-full py-5 font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3 mt-4 text-[11px] ${
            cooldown > 0 ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
          }`}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : cooldown > 0 ? `Wait: ${cooldown}s` : view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : view === 'forgotPassword' ? 'Send Recovery Code' : 'Finalize Reset'}
          </button>
        </form>

        <div className="mt-10 text-center relative z-10 border-t border-slate-800/50 pt-8">
          <button onClick={() => { setView(view === 'login' ? 'signup' : 'login'); setError(null); }} className="text-[10px] font-black text-slate-500 hover:text-white transition-all flex items-center justify-center gap-3 mx-auto uppercase tracking-widest">
            {view === 'login' ? "Need account? Join Now" : "Have account? Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
