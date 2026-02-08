import React, { useState } from 'react';
import { 
  Mail, 
  User, 
  MessageSquare, 
  ChevronLeft,
  Loader2,
  CheckCircle2,
  Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Contact: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const targetEmail = 'tatai.maitra@gmail.com';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      // Direct AJAX submission using Formspree
      // Note: The form ID 'mvgzpoyz' must be configured to point to tatai.maitra@gmail.com on Formspree.io
      const response = await fetch("https://formspree.io/f/mvgzpoyz", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          _subject: `New Query from ${formData.name}`,
          _to: targetEmail
        })
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.error("Submission failed", err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto py-32 px-6 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">Query Received</h2>
        <p className="text-slate-400 font-medium mb-10 max-w-md mx-auto leading-relaxed">
          Thanks for reaching out, <strong>{formData.name}</strong>. Your message has been sent directly to <strong>{targetEmail}</strong>. We'll get back to you shortly.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="px-10 py-4 bg-slate-900 border border-slate-800 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl hover:bg-slate-800 transition-all active:scale-95"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 animate-in fade-in duration-700">
      <button 
        onClick={() => navigate('/')} 
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-all mb-12"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div className="space-y-6 mb-12">
        <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter">
          Contact Us
        </h1>
        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
          Have a question? Send us a quick query and we'll reply within 24 hours.
        </p>
      </div>

      <div className="bg-[#0B1120] border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full pointer-events-none" />
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {status === 'error' && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-[11px] font-bold uppercase tracking-widest text-center">
              Submission failed. Please check your connection and try again.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Name</label>
              <div className="relative group/input">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600 group-focus-within/input:text-blue-500 transition-colors" />
                <input
                  type="text"
                  name="name"
                  required
                  disabled={status === 'submitting'}
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-[1.5rem] py-5 pl-14 pr-6 text-white font-bold placeholder:text-slate-700 outline-none focus:border-blue-500 focus:bg-slate-900 transition-all disabled:opacity-50"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Email</label>
              <div className="relative group/input">
                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-600 group-focus-within/input:text-blue-500 transition-colors" />
                <input
                  type="email"
                  name="email"
                  required
                  disabled={status === 'submitting'}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-[1.5rem] py-5 pl-14 pr-6 text-white font-bold placeholder:text-slate-700 outline-none focus:border-blue-500 focus:bg-slate-900 transition-all disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Query</label>
            <div className="relative group/input">
              <MessageSquare className="absolute left-6 top-8 w-4.5 h-4.5 text-slate-600 group-focus-within/input:text-blue-500 transition-colors" />
              <textarea
                name="message"
                required
                disabled={status === 'submitting'}
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help?"
                rows={5}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-[1.5rem] py-6 pl-14 pr-8 text-white font-medium placeholder:text-slate-700 outline-none focus:border-blue-500 focus:bg-slate-900 transition-all resize-none disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-2xl shadow-blue-600/20 disabled:opacity-70 group"
          >
            {status === 'submitting' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Send Query
                <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
      
      <div className="mt-16 text-center">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">Direct Support: {targetEmail}</p>
      </div>
    </div>
  );
};

export default Contact;
