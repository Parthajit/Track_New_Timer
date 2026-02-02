
import React, { useState } from 'react';
import { Mail, User, Phone, Send, CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [refId, setRefId] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;

    setStatus('sending');
    const generatedRef = `TMT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    setRefId(generatedRef);

    try {
      // Persist to Supabase
      const { error } = await supabase
        .from('contact_messages')
        .insert([{
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          message: formData.message,
          reference_id: generatedRef,
          recipient_routing: 'tatai.maitra@gmail.com' 
        }]);

      if (error) throw error;

      setTimeout(() => {
        setStatus('success');
        setFormData({ fullName: '', email: '', phone: '', message: '' });
      }, 800);

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.message || 'We could not send your message. Please check your connection.');
    }
  };

  if (status === 'success') {
    return (
      <div className="max-w-4xl mx-auto py-16 px-6 flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
        <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.3)] mb-8 relative">
          <div className="absolute inset-0 bg-blue-600 rounded-full animate-ping opacity-20" />
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <div className="text-center space-y-6">
          <h2 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">Message Sent!</h2>
          <div className="space-y-2">
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">We've received your inquiry</p>
            <p className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-4 py-1.5 rounded-lg border border-blue-500/20 inline-block uppercase tracking-[0.2em]">
              Reference ID: {refId}
            </p>
          </div>
          <p className="text-slate-500 text-base max-w-md mx-auto leading-relaxed font-medium">
            Thank you for reaching out. We will review your message and get back to you within 24 hours.
          </p>
          <div className="pt-8">
            <button 
              onClick={() => setStatus('idle')}
              className="px-10 py-4 bg-slate-900 border border-slate-800 hover:border-blue-500/50 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all flex items-center gap-3 mx-auto"
            >
              Back to Form <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        {/* Left Column: Branding and Info */}
        <div className="space-y-12">
          <div className="space-y-6">
            <span className="inline-block px-4 py-1.5 bg-blue-600/10 text-blue-500 border border-blue-500/20 rounded-lg text-[9px] font-black uppercase tracking-[0.3em]">
              Contact Us
            </span>
            <h1 className="text-6xl md:text-8xl font-black italic text-white uppercase tracking-tighter leading-[0.85]">
              Get In <br />
              <span className="text-blue-500">Touch.</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </div>

          <div className="p-10 bg-slate-900/30 border border-slate-800 rounded-[2.5rem] flex items-center gap-6 group hover:border-blue-500/30 transition-all shadow-xl">
            <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-500 group-hover:scale-110 transition-transform">
              <Mail className="w-7 h-7" />
            </div>
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.4em] mb-1">Email Support</p>
              <p className="text-lg font-black text-white italic tracking-tight">support@trackmytimer.com</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[9px] font-black text-slate-600 uppercase tracking-widest px-6">
            <ShieldCheck className="w-4 h-4 text-emerald-500/50" />
            Your data is safe and secure
          </div>
        </div>

        {/* Right Column: The Form */}
        <div className="bg-[#0B1120] border border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <FormInput 
                label="Full Name" 
                name="fullName" 
                icon={<User className="w-4 h-4" />} 
                placeholder="e.g. John Doe" 
                value={formData.fullName} 
                onChange={handleChange}
                required
              />
              <FormInput 
                label="Email Address" 
                name="email" 
                type="email" 
                icon={<Mail className="w-4 h-4" />} 
                placeholder="e.g. john@email.com" 
                value={formData.email} 
                onChange={handleChange}
                required
              />
            </div>

            <FormInput 
              label="Phone Number (Optional)" 
              name="phone" 
              type="tel" 
              icon={<Phone className="w-4 h-4" />} 
              placeholder="+1 (555) 000-0000" 
              value={formData.phone} 
              onChange={handleChange}
            />

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Your Message</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="How can we help you?"
                required
                className="w-full bg-slate-900/50 border border-slate-800 rounded-[1.5rem] py-5 px-6 text-white font-medium placeholder:text-slate-700 min-h-[160px] outline-none focus:border-blue-500 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'sending'}
              className={`w-full py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl ${
                status === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
              }`}
            >
              {status === 'sending' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending...
                </>
              ) : status === 'error' ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  Try Again
                </>
              ) : (
                <>
                  Send Message
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
            
            {status === 'error' && (
              <p className="text-[10px] text-red-500 font-bold uppercase text-center tracking-widest animate-in fade-in bg-red-500/5 py-2 rounded-lg border border-red-500/10">
                {errorMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

interface FormInputProps {
  label: string;
  name: string;
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({ label, name, icon, placeholder, value, onChange, type = "text", required }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">{label}</label>
    <div className="relative group">
      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-slate-900/50 border border-slate-800 rounded-[1.5rem] py-5 pl-14 pr-6 text-white font-medium placeholder:text-slate-700 outline-none focus:border-blue-500 transition-all"
      />
    </div>
  </div>
);

export default Contact;
