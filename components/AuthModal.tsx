
import React, { useState, useEffect, useRef } from 'react';
import { X, Mail, Lock, User as UserIcon, Loader2, Eye, EyeOff, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; title: string; type: 'error' | 'warning' | 'limit'; details?: string } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  
  const initialFocusRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initialFocusRef.current?.focus();
  }, [isLogin]);

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
    if (!email.includes('@')) {
      setError({ title: 'Invalid Email', message: 'Please enter a valid email address.', type: 'error' });
      return false;
    }
    if (password.length < 6) {
      setError({ title: 'Short Password', message: 'Passwords must be at least 6 characters long.', type: 'error' });
      return false;
    }
    if (!isLogin && fullName.trim().length < 2) {
      setError({ title: 'Name Required', message: 'Please enter your name to sign up.', type: 'error' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || loading || cooldown > 0) return;

    setLoading(true);
    setError(null);
    setShowDetails(false);

    try {
      if (isLogin) {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
      } else {
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
            setError({ 
              title: 'Account Exists',
              message: 'This email is already registered. Please login instead.', 
              type: 'warning' 
            });
            setLoading(false);
            return;
          }
          setIsSuccess(true);
        }
      }
    } catch (err: any) {
      console.error("Auth Exception:", err);
      const msg = err.message?.toLowerCase() || '';
      const status = err.status || 0;

      if (msg.includes('failed to fetch') || msg.includes('network error') || status === 0) {
        setError({ 
          title: 'Network Error',
          message: 'We could not connect to our servers. Please check your internet.', 
          type: 'error',
          details: 'Please try again in a moment.'
        });
      } else if (msg.includes('rate limit') || status === 429) {
        setError({ 
          title: 'Too Many Attempts',
          message: 'Please wait a minute before trying to login again.', 
          type: 'limit',
          details: 'We have temporarily locked your attempts for security.'
        });
        setCooldown(60);
      } else if (msg.includes('invalid login credentials')) {
        setError({ 
          title: 'Login Failed',
          message: 'Incorrect email or password. Please try again.', 
          type: 'error' 
        });
      } else {
        setError({ 
          title: 'Error Occurred',
          message: err.message || 'Something went wrong. Please try again.', 
          type: 'error',
          details: `Error Code: ${err.code || 'SYS-000'}`
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (isSuccess) {
    return (
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={handleBackdropClick}
      >
        <div 
          className="bg-[#0B1120] border border-slate-800 w-full max-md rounded-[3rem] p-12 relative shadow-2xl text-center space-y-8"
          onClick={(e) => e.stopPropagation()}
        >
          <button 
            onClick={onClose} 
            className="absolute top-8 right-8 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all z-50"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Check Your Email</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Verification Link Sent</p>
          </div>
          <p className="text-slate-500 font-medium leading-relaxed text-sm">
            We've sent a confirmation email to <span className="text-white font-black">{email}</span>. Please click the link to finish signing up.
          </p>
          <button
            onClick={onClose}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl shadow-blue-600/30 text-xs active:scale-95"
          >
            Okay, Got it!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-[#0B1120] border border-slate-800 w-full max-w-md rounded-[3rem] p-10 relative shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
        
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-xl transition-all z-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-10 relative z-10">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h2>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] mt-2 opacity-80">
            {isLogin ? 'Login to view your stats' : 'Start tracking your time today'}
          </p>
        </div>

        {error && (
          <div className={`mb-8 p-5 border rounded-3xl animate-in slide-in-from-top-4 duration-500 shadow-xl overflow-hidden ${
            error.type === 'limit' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
            error.type === 'warning' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
            'bg-red-500/10 border-red-500/30 text-red-400'
          }`}>
            <div className="flex gap-4 items-start">
              <div className="mt-1">
                {error.type === 'limit' ? <ShieldAlert className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-[11px] font-black uppercase tracking-widest">{error.title}</p>
                <p className="text-[10px] font-bold opacity-80 leading-normal">{error.message}</p>
              </div>
              {error.details && (
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="hover:bg-black/20 p-1.5 rounded-lg transition-colors shrink-0"
                >
                  {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              )}
            </div>
            {showDetails && error.details && (
              <div className="mt-4 pt-4 border-t border-current/10 font-mono text-[9px] opacity-70 break-words leading-relaxed">
                {error.details}
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Full Name</label>
              <div className="relative group">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <input
                  ref={initialFocusRef}
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl py-5 pl-14 pr-5 text-white font-bold focus:border-blue-500/50 focus:bg-slate-900/80 outline-none transition-all placeholder:text-slate-700 text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
              <input
                ref={isLogin ? initialFocusRef : undefined}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl py-5 pl-14 pr-5 text-white font-bold focus:border-blue-500/50 focus:bg-slate-900/80 outline-none transition-all placeholder:text-slate-700 text-sm"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Password</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete={isLogin ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-900/40 border border-slate-800 rounded-2xl py-5 pl-14 pr-14 text-white font-bold focus:border-blue-500/50 focus:bg-slate-900/80 outline-none transition-all placeholder:text-slate-700 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cooldown > 0}
            className={`w-full py-5 font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-2xl active:scale-[0.98] flex items-center justify-center gap-3 mt-4 text-[11px] ${
              cooldown > 0 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
            }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : cooldown > 0 ? (
              `Try again in: ${cooldown}s`
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-10 text-center relative z-10 border-t border-slate-800/50 pt-8">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            className="text-[10px] font-black text-slate-500 hover:text-white transition-all flex items-center justify-center gap-3 mx-auto uppercase tracking-widest"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
