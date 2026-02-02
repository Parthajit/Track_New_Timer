
import React from 'react';
import { Target, Lightbulb, BarChart, ShieldCheck } from 'lucide-react';

const AboutUs: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in duration-1000 pb-32 pt-6 px-4">
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">About Us</h1>
        <p className="text-[10px] md:text-xs font-black text-blue-500 uppercase tracking-[0.5em]">Helping People Use Time More Effectively</p>
      </header>

      <section className="bg-[#0B1120] border border-slate-800 rounded-[3rem] p-10 md:p-16 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-20 opacity-[0.02] group-hover:scale-110 transition-transform duration-1000">
           <Target className="w-64 h-64 text-blue-500" />
        </div>
        <div className="relative z-10 space-y-8">
          <p className="text-lg md:text-xl font-bold text-slate-200 leading-relaxed italic">
            "We are dedicated to building reliable online timer tools combined with performance analytics that help users understand and improve how they use their time."
          </p>
          <div className="space-y-4 text-sm text-slate-400 font-medium leading-relaxed">
            <p>
              Timers are often treated as basic utilities. We believe they should be powerful productivity tools. That belief inspired us to create a platform where time tracking meets insight, consistency, and measurable progress.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[#0B1120]/50 border border-slate-800/60 p-10 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/10 rounded-xl">
              <Lightbulb className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">Our Purpose</h3>
          </div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Empowering Better Decisions</p>
          <ul className="space-y-4">
            <PurposeItem text="Accurate timing tools" />
            <PurposeItem text="Clear performance data" />
            <PurposeItem text="Long-term progress tracking" />
            <PurposeItem text="A distraction-free experience" />
          </ul>
        </div>

        <div className="bg-[#0B1120]/50 border border-slate-800/60 p-10 rounded-[2.5rem] space-y-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-600/10 rounded-xl">
              <BarChart className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-xl font-black text-white italic uppercase tracking-tighter">What We Provide</h3>
          </div>
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Platform Capabilities</p>
          <ul className="space-y-4">
            <PurposeItem text="A full suite of professional-grade timer tools" />
            <PurposeItem text="A personalized user dashboard with analytics" />
            <PurposeItem text="Weekly and monthly usage reports" />
            <PurposeItem text="Continuous platform improvements" />
          </ul>
        </div>
      </div>

      <section className="text-center space-y-10 bg-gradient-to-br from-blue-600/5 to-transparent border border-blue-500/10 p-12 md:p-16 rounded-[3.5rem]">
        <div className="space-y-4">
          <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Built with the User in Mind</h3>
          <p className="text-slate-400 text-sm font-medium max-w-2xl mx-auto leading-relaxed">
            We focus on simplicity, accuracy, and reliability. Every feature is designed to support long-term improvement, whether you’re managing daily tasks or structured training sessions.
          </p>
        </div>
        <div className="pt-6 border-t border-blue-500/10 max-w-sm mx-auto">
          <p className="text-[11px] font-black text-blue-500 uppercase tracking-[0.4em] leading-relaxed">
            We don’t just help you track time — <br/>
            we help you improve how you use it.
          </p>
        </div>
      </section>
    </div>
  );
};

const PurposeItem: React.FC<{ text: string }> = ({ text }) => (
  <li className="flex items-start gap-3">
    <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
    <span className="text-sm font-bold text-slate-300 tracking-tight">{text}</span>
  </li>
);

export default AboutUs;
