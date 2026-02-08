import React, { useState } from 'react';
import { 
  Mail, 
  User, 
  MessageSquare, 
  CheckCircle2, 
  Loader2, 
  Send,
  ChevronLeft,
  AlertCircle
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const response = await fetch("https://formspree.io/f/mvgzpoyz", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          _subject: `Contact Form Inquiry from ${formData.name}`
        })
      });

      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-2xl mx-auto py-32 px-6 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-8">
          <CheckCircle2 className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-4">Message Sent</h2>
        <p className="text-slate-400 font-medium mb-10">
          Thanks for reaching out! We've received your message and will get back to you at <strong>{formData.email}</strong> as soon as possible.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="px-8 py-4 bg-slate-900 border border-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all"
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

      <div className="space-y-8 mb-12">
        <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase tracking-tighter">
          Contact Us
        </h1>
        <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-xl">
          Have a question or feedback about Track My Timer? Drop us a message below.
        </p>
      </div>

      <div className="bg-[#0B1120] border border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {status === 'error' && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400 text-xs font-bold">
              <AlertCircle size={18} />
              Something went wrong. Please try again or email us directly at tatai.maitra@gmail.com
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Name</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-bold outline-none focus:border-blue-500 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Message</label>
            <div className="relative">
              <MessageSquare className="absolute left-5 top-5 w-4 h-4 text-slate-600" />
              <textarea
                name="message"
                required
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help?"
                rows={5}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white font-medium outline-none focus:border-blue-500 transition-all resize-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
          >
            {status === 'submitting' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Send Message
                <Send size={16} />
              </>
            )}
          </button>
        </form>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
          Direct Email: tatai.maitra@gmail.com
        </p>
      </div>
    </div>
  );
};

export default Contact;
