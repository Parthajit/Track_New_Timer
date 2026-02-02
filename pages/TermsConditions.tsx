
import React from 'react';
import { Scale, FileText, Gavel, ShieldCheck } from 'lucide-react';

const TermsConditions: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-16 animate-in fade-in duration-1000 pb-32 pt-6 px-4">
      <header className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">Terms and Conditions</h1>
        <p className="text-[10px] md:text-xs font-black text-slate-500 uppercase tracking-[0.5em]">Legal Framework & Service Agreement</p>
      </header>

      <section className="bg-[#0B1120] border border-slate-800 rounded-[3rem] p-8 md:p-16 shadow-2xl space-y-12">
        <div className="flex flex-col md:flex-row items-center gap-6 pb-10 border-b border-slate-800/50">
           <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-500">
             <Scale className="w-8 h-8" />
           </div>
           <p className="text-sm font-bold text-slate-400 leading-relaxed italic text-center md:text-left">
             "By accessing or using this website and its services, you agree to comply with the following Terms and Conditions. Please review them carefully."
           </p>
        </div>

        <div className="space-y-12">
          <TermsSection 
            number="1" 
            title="Agreement to Terms" 
            content="By using our website, you confirm that you have read, understood, and accepted these Terms and Conditions. If you do not agree, you must discontinue use of the website."
          />
          <TermsSection 
            number="2" 
            title="Services Provided" 
            content="We offer online timing tools including stopwatch, countdown timer, interval timer, lap timer, alarm clock, and digital clock, along with optional user dashboards and performance analytics. All services are provided for general informational and personal use only."
          />
          <TermsSection 
            number="3" 
            title="User Accounts" 
            content="Access to analytics and performance tracking features may require account registration. You are responsible for maintaining the confidentiality of your account credentials and for all activities conducted under your account."
          />
          <TermsSection 
            number="4" 
            title="Performance Data and Analytics" 
            content="Analytics are generated based on tool usage and are intended to help users track historical performance trends. While we strive for accuracy, we do not guarantee that analytics are error-free or suitable for professional, medical, or competitive decision-making."
          />
          <TermsSection 
            number="5" 
            title="Acceptable Use" 
            content="Users agree not to misuse the website, interfere with its operation, or use the services for any unlawful or harmful purpose."
          />
          <TermsSection 
            number="6" 
            title="Intellectual Property Rights" 
            content="All content, tools, software, branding, and design elements on this website are the intellectual property of the website owner and are protected by applicable laws. Unauthorized reproduction or distribution is prohibited."
          />
          <TermsSection 
            number="7" 
            title="Limitation of Liability" 
            content="We are not liable for any direct, indirect, or incidental damages resulting from the use or inability to use our services, including data loss or performance-related outcomes."
          />
          <TermsSection 
            number="8" 
            title="Modifications to Terms" 
            content="We reserve the right to update or modify these Terms and Conditions at any time. Continued use of the website following changes constitutes acceptance of the revised terms."
          />
          <TermsSection 
            number="9" 
            title="Account Suspension or Termination" 
            content="We reserve the right to suspend or terminate user access if these terms are violated or misuse of the platform is detected."
          />
          <TermsSection 
            number="10" 
            title="Contact Information" 
            content="For questions regarding these Terms and Conditions, please contact us through the website’s official support channels."
          />
        </div>
      </section>

      <div className="text-center opacity-30">
        <p className="text-[9px] font-black uppercase tracking-[0.8em]">End of Document</p>
      </div>
    </div>
  );
};

const TermsSection: React.FC<{ number: string; title: string; content: string }> = ({ number, title, content }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-4">
      <span className="text-[10px] font-black text-blue-500 bg-blue-500/5 px-2.5 py-1 rounded-lg border border-blue-500/10 min-w-[2.5rem] text-center">{number}</span>
      <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">{title}</h3>
    </div>
    <div className="pl-[3.5rem]">
      <p className="text-sm text-slate-400 font-medium leading-relaxed">
        {content}
      </p>
    </div>
  </div>
);

export default TermsConditions;
