import React from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Timer, BarChart2, Zap, Shield, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, isOpen, onClick }) => {
  return (
    <div className="border-b border-slate-800 last:border-0">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between text-left group transition-all"
      >
        <span className={`text-sm md:text-base font-bold uppercase tracking-widest transition-colors ${isOpen ? 'text-blue-400' : 'text-slate-300 group-hover:text-white'}`}>
          {question}
        </span>
        <div className={`p-2 rounded-lg transition-all ${isOpen ? 'bg-blue-500/10 text-blue-400 rotate-180' : 'bg-slate-900 text-slate-500 group-hover:text-slate-300'}`}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-slate-400 text-xs md:text-sm leading-relaxed font-medium uppercase tracking-wider">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const QandA: React.FC = () => {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const timerFAQs = [
    {
      question: "How accurate are the timers on Track My Timer?",
      answer: "Our timers use high-precision browser APIs (performance.now()) to ensure millisecond accuracy. However, background tab throttling by browsers can occasionally affect performance if the tab is not active. We recommend keeping the tab visible for critical timing tasks."
    },
    {
      question: "Can I save my lap times and countdown presets?",
      answer: "Yes! If you are logged in, your lap times and custom countdown presets are automatically synced to your profile. You can access them from any device by logging into your account."
    },
    {
      question: "Does the timer continue if I close the browser tab?",
      answer: "Currently, timers run locally in your browser session. If you close the tab, the active timer will stop. However, we are working on a server-side sync feature for long-duration countdowns."
    },
    {
      question: "What is the maximum duration for a countdown timer?",
      answer: "You can set a countdown for up to 99 hours, 59 minutes, and 59 seconds. For longer durations, we recommend using our 'Date Countdown' tool (coming soon)."
    }
  ];

  const analyticsFAQs = [
    {
      question: "What kind of analytics does the dashboard provide?",
      answer: "The dashboard tracks your total focus time, session frequency, and distribution across different tools (Stopwatch vs. Countdown). It helps you visualize your productivity trends over days, weeks, and months."
    },
    {
      question: "Is my timing data private?",
      answer: "Absolutely. We use industry-standard encryption and secure database protocols (Supabase) to protect your data. Your timing history is only visible to you."
    },
    {
      question: "Can I export my analytics data?",
      answer: "Yes, you can export your session history as a CSV or JSON file directly from the Dashboard settings. This is useful for professional time-tracking and billing."
    },
    {
      question: "How is 'Focus Score' calculated?",
      answer: "Your Focus Score is a proprietary metric based on session consistency, duration, and the reduction of 'idle time' between sessions. A higher score indicates better deep-work habits."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 py-8"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
          <HelpCircle className="w-4 h-4 text-blue-400" />
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Knowledge Base</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-white uppercase">
          Questions & <span className="text-blue-500">Answers</span>
        </h1>
        <p className="text-slate-500 text-xs md:text-sm font-bold uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
          Everything you need to know about mastering your time and understanding your productivity data.
        </p>
      </div>

      {/* Quick Stats/Features */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: <Timer className="w-5 h-5" />, label: "Precision", value: "99.9%" },
          { icon: <BarChart2 className="w-5 h-5" />, label: "Analytics", value: "Real-time" },
          { icon: <Zap className="w-5 h-5" />, label: "Sync", value: "Instant" },
          { icon: <Shield className="w-5 h-5" />, label: "Privacy", value: "Encrypted" },
        ].map((stat, i) => (
          <div key={i} className="bg-slate-900/50 border border-slate-800 p-4 rounded-2xl text-center space-y-2">
            <div className="mx-auto w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400">
              {stat.icon}
            </div>
            <div className="space-y-0.5">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-sm font-bold text-white uppercase">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Q&A Sections */}
      <div className="space-y-16">
        {/* Timer Tools Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-800" />
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Timer Tools</h2>
            </div>
            <div className="h-px flex-1 bg-slate-800" />
          </div>
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-3xl px-6 md:px-8">
            {timerFAQs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              />
            ))}
          </div>
        </section>

        {/* Analytics Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-800" />
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Analytics & Data</h2>
            </div>
            <div className="h-px flex-1 bg-slate-800" />
          </div>
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-3xl px-6 md:px-8">
            {analyticsFAQs.map((faq, index) => (
              <FAQItem
                key={index + timerFAQs.length}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index + timerFAQs.length}
                onClick={() => setOpenIndex(openIndex === index + timerFAQs.length ? null : index + timerFAQs.length)}
              />
            ))}
          </div>
        </section>
      </div>

      {/* CTA */}
      <div className="bg-blue-600 rounded-3xl p-8 md:p-12 text-center space-y-6 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-700" />
        <div className="relative z-10 space-y-4">
          <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter">Still have questions?</h3>
          <p className="text-blue-100 text-xs md:text-sm font-bold uppercase tracking-widest max-w-md mx-auto">
            Our support team is ready to help you optimize your workflow.
          </p>
          <div className="pt-4">
            <a 
              href="/contact" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-50 transition-all shadow-xl shadow-blue-900/20"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QandA;


