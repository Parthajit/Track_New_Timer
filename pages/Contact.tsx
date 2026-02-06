import React, { useState } from 'react';
import { Mail, User, Phone, Send, CheckCircle2, Copy, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const targetEmail = 'tatai.maitra@gmail.com';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(targetEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      // Using Formspree to send emails without triggering local mail client pop-ups
      // Note: You may need to verify your email once on Formspree.io after the first submission.
      const response = await fetch(`https://formspree.io/f/${btoa(targetEmail)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          _subject: `New Inquiry from Track My Timer - ${formData.fullName}`
        })
      });

      if (response.ok) {
        setStatus('success');
        setFormData({ fullName: '', email: '', phone: '', message: '' });
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      console.error('Contact error:', error);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-4xl mx-auto py-24 px-6 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-2xl shadow-emerald-500/10 mb-8 relative">
          <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-10" />
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">Message Delivered!</h2>
          <p className="text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
            Your inquiry has been sent directly to <span className="text-white">{targetEmail}</span>. We will review it and get back to you shortly.
          </p>
          <button 
            onClick={() => setStatus('idle')}
            className="mt-8 px-10 py-4 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all active:scale-95"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* Left Section: Branding & Contact Info */}
        <div className="space-y-12">
          <div className="space-y-6">
            <span className="inline-block px-4 py-1.5 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-lg text-[9px] font-black uppercase tracking-[0.3em]">
              Support Hub
            </span>
            <h1 className="text-6xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.85]">
              Get In <br />
              <span className="text-blue-500">Touch.</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
              Fill out the form and your query will be sent directly to our inbox. No pop-ups, no local mail client required.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-8 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-6 hover:border-blue-500/30 transition-all group">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
                  <Mail className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Direct Email</p>
                  <p className="text-xl font-black text-white italic tracking-tight">{targetEmail}</p>
                </div>
              </div>
              <button 
                onClick={handleCopyEmail}
                className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-white hover:text-black rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            
            <div className="flex items-center gap-3 text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] px-8">
              <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
              Direct Server-to-Inbox Delivery Active
            </div>
          </div>
        </div>

        {/* Right Section: The Form */}
        <div className="bg-[#0B1120] border border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Full Name</label>
                <div className="relative group/input">
                  <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/input:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    name="fullName"
                    required
                    disabled={status === 'submitting'}
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-[1.5rem] py-5 pl-14 pr-6 text-white font-medium placeholder:text-slate-700 outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Email Address</label>
                <div className="relative group/input">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/input:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    required
                    disabled={status === 'submitting'}
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-[1.5rem] py-5 pl-14 pr-6 text-white font-medium placeholder:text-slate-700 outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Phone Number (Optional)</label>
              <div className="relative group/input">
                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600 group-focus-within/input:text-blue-500 transition-colors" />
                <input
                  type="tel"
                  name="phone"
                  disabled={status === 'submitting'}
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-[1.5rem] py-5 pl-14 pr-6 text-white font-medium placeholder:text-slate-700 outline-none focus:border-blue-500 transition-all disabled:opacity-50"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Your Query</label>
              <textarea
                name="message"
                required
                disabled={status === 'submitting'}
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                className="w-full bg-slate-900/50 border border-slate-800 rounded-[1.5rem] py-6 px-8 text-white font-medium placeholder:text-slate-700 min-h-[160px] outline-none focus:border-blue-500 transition-all resize-none disabled:opacity-50"
              />
            </div>

            <div className="space-y-4">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending Inquiry...
                  </>
                ) : (
                  <>
                    Submit Message
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              {status === 'error' && (
                <div className="flex items-center gap-3 justify-center text-red-500 animate-in fade-in">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Error. Please try again later.</span>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
