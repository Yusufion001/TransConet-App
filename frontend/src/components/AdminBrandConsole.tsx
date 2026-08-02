import React from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';

export const AdminBrandConsole = () => (
  <div className="bg-brand-600 border border-brand-500 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl ">
    <div className="absolute top-0 right-0 p-8 opacity-10">
      <Cpu size={160} className="text-white" />
    </div>
    
    <div className="relative space-y-4">
      <div className="inline-flex items-center gap-1.5 bg-brand-700 text-white text-xs font-bold px-3 py-1 rounded-full border border-brand-500 uppercase tracking-wider">
        <ShieldCheck size={14} className="text-white" /> Access Security Control Panel
      </div>
      <h1 className="text-3xl font-serif font-black italic text-white tracking-tight sm:text-4xl">
        TransConet <span className="font-sans not-italic font-black">Admin Engine</span>
      </h1>
      <p className="text-sm text-brand-100 max-w-2xl leading-relaxed">
        Generate and manage your secure administrative privileges. Review logistics compliance, seed simulated heavy-duty carrier trucks, and approve marketplace fleet registries in real time.
      </p>
    </div>
  </div>
);
