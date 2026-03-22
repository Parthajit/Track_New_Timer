import React from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Timer, BarChart2, Zap, Shield, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';

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

  const generalFAQs = [
    {
      question: "History of Timer clock",
      answer: "The history of timer clocks dates back to ancient civilizations using water clocks and sundials. Modern digital timers evolved from mechanical stopwatches developed in the 18th century for maritime navigation and scientific experiments."
    },
    {
      question: "How to set timer clock",
      answer: "To set a timer clock on our platform, navigate to the 'Countdown' or 'Interval' tool, input your desired hours, minutes, and seconds, and click 'Start'. You can also save presets for frequent tasks."
    },
    {
      question: "Are time clocks still used?",
      answer: "Yes, time clocks are essential in modern society. They are used in professional workplaces for attendance, in sports for precise performance measurement, in laboratories for experiments, and in daily life for cooking and productivity (like the Pomodoro technique)."
    },
    {
      question: "How do time clocks work?",
      answer: "Digital time clocks work by using an electronic oscillator (usually a quartz crystal) to create a precise frequency. A microchip counts these oscillations to track elapsed time with millisecond accuracy."
    },
    {
      question: "How does time clock works in soccer?",
      answer: "In soccer, the time clock runs continuously for 45 minutes per half. The referee keeps 'stoppage time' on a separate watch to account for injuries and substitutions, which is added at the end of each half."
    },
    {
      question: "How does time clock works for athletes?",
      answer: "Athletes use time clocks (stopwatches and lap timers) to measure split times, track improvements in speed, and manage high-intensity interval training (HIIT) sessions to optimize physical conditioning."
    },
    {
      question: "How does time clock works for students?",
      answer: "Students use timer clocks to implement study techniques like Pomodoro (25 mins study, 5 mins break), manage time during exams, and prevent burnout by scheduling structured breaks."
    },
    {
      question: "How does time clock works for professionals?",
      answer: "Professionals use time clocks to track billable hours, manage project deadlines, and ensure meetings stay on schedule. It's a key tool for time-blocking and deep-work strategies."
    },
    {
      question: "Why is a Timer clock important?",
      answer: "A timer clock is important because it provides objective data on how time is spent. It creates a sense of urgency, improves focus by limiting distractions, and helps in identifying productivity bottlenecks."
    }
  ];

  const usageFAQs = [
    {
      question: "How can I find my stopwatch usage history?",
      answer: "You can find your stopwatch usage history by navigating to the 'Dashboard'. Filter the logs by 'Stopwatch' to see all your recorded sessions, durations, and timestamps."
    },
    {
      question: "How can I find my Countdown timer usage history?",
      answer: "Your countdown history is available in the 'Dashboard'. Use the tool filter to select 'Countdown' to view your completed sessions and total focus volume."
    },
    {
      question: "How can I find my Lap Timer usage history?",
      answer: "Lap timer history is stored in your 'Dashboard'. Selecting 'Lap Timer' will show you not just the total time, but also individual lap data and consistency metrics for each session."
    },
    {
      question: "How can I find my Interval Timer usage history?",
      answer: "Interval history can be viewed in the 'Dashboard' under the 'Interval' filter. You can see your work/rest cycles and track your stamina trends over time."
    },
    {
      question: "How to check my performance using a timer",
      answer: "Navigate to the 'Dashboard' and look at the 'Intensity Progress' and 'Advanced Insights' sections. You can track your consistency streak, average work duration, and peak performance times to evaluate your productivity growth."
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-12 py-8"
    >
      <Helmet>
        <title>Questions & Answers | Track My Timer - Productivity & Time Tracking FAQ</title>
        <meta name="description" content="Find answers to common questions about Track My Timer, productivity analytics, and how to optimize your workflow with our precision timing tools." />
        <meta name="keywords" content="Timer clock for study, Timer clock online, Timer clock with seconds, Stopwatch, Digital Timer Clock, Timer clock app, Timer Clock countdown, FAQ, help, time tracking support" />
      </Helmet>
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

        {/* General Knowledge Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-800" />
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">General Knowledge</h2>
            </div>
            <div className="h-px flex-1 bg-slate-800" />
          </div>
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-3xl px-6 md:px-8">
            {generalFAQs.map((faq, index) => {
              const globalIndex = index + timerFAQs.length + analyticsFAQs.length;
              return (
                <FAQItem
                  key={globalIndex}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openIndex === globalIndex}
                  onClick={() => setOpenIndex(openIndex === globalIndex ? null : globalIndex)}
                />
              );
            })}
          </div>
        </section>

        {/* Usage Guide Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-800" />
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-black text-white uppercase tracking-[0.4em]">Usage Guide</h2>
            </div>
            <div className="h-px flex-1 bg-slate-800" />
          </div>
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-3xl px-6 md:px-8">
            {usageFAQs.map((faq, index) => {
              const globalIndex = index + timerFAQs.length + analyticsFAQs.length + generalFAQs.length;
              return (
                <FAQItem
                  key={globalIndex}
                  question={faq.question}
                  answer={faq.answer}
                  isOpen={openIndex === globalIndex}
                  onClick={() => setOpenIndex(openIndex === globalIndex ? null : globalIndex)}
                />
              );
            })}
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


