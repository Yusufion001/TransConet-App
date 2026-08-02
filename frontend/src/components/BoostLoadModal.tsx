import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Rocket, Zap, TrendingUp, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from './ui/Button';

interface BoostLoadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BoostLoadModal({ isOpen, onClose }: BoostLoadModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-white dark:bg-slate-900/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-[20px] w-full max-w-lg shadow-sm overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="relative h-32 bg-gradient-to-br from-brand-700 to-brand-900 p-6 flex flex-col justify-end overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white dark:bg-slate-900/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="absolute -top-12 -left-12 opacity-20">
              <Rocket size={120} className="text-white" />
            </div>
            
            <Button aria-label="Action" 
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white dark:bg-slate-900/20 hover:bg-white dark:bg-slate-900/30 flex items-center justify-center text-white transition-colors z-10 backdrop-blur-md"
            >
              <X size={18} />
            </Button>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-1">
                <div className="bg-white dark:bg-slate-900/20 px-2 py-0.5 rounded text-white text-[10px] font-black uppercase tracking-widest backdrop-blur-md flex items-center gap-1 w-fit">
                  <Zap size={10} className="text-amber-300" fill="#FCD34D" /> Premium
                </div>
              </div>
              <h3 className="font-black text-white text-2xl leading-tight">Boost Load Visibility</h3>
            </div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-800 flex-1">
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 font-medium">
              Promote your cargo to our top-rated transporters and get matched up to 3x faster. Choose a promotion tier:
            </p>

            <div className="space-y-4">
              {/* Standard Boost */}
              <label className={`block relative bg-white dark:bg-slate-900 border-2 rounded-[20px] p-4 cursor-pointer transition-all ${selectedPlan === 'standard' ? 'border-purple-600 shadow-sm ring-4 ring-purple-600/10' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'}`}>
                <input type="radio" name="boost_plan" className="sr-only" onChange={() => setSelectedPlan('standard')} checked={selectedPlan === 'standard'} />
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'standard' ? 'border-purple-600 bg-brand-600' : 'border-slate-300'}`}>
                      {selectedPlan === 'standard' && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Standard Boost</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Top 5 in search results for 24h</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-lg text-slate-900">₦5,000</div>
                  </div>
                </div>
              </label>

              {/* Premium Boost */}
              <label className={`block relative bg-white dark:bg-slate-900 border-2 rounded-[20px] p-4 cursor-pointer transition-all overflow-hidden ${selectedPlan === 'premium' ? 'border-amber-500 shadow-sm ring-4 ring-amber-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'}`}>
                <input type="radio" name="boost_plan" className="sr-only" onChange={() => setSelectedPlan('premium')} checked={selectedPlan === 'premium'} />
                
                {/* Popular Badge */}
                <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
                
                <div className="flex justify-between items-start mb-2 mt-1">
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedPlan === 'premium' ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`}>
                      {selectedPlan === 'premium' && <CheckCircle2 size={12} className="text-white" strokeWidth={3} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                        Priority Boost <TrendingUp size={14} className="text-amber-500" />
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pinned at the top + SMS Alerts to drivers</p>
                    </div>
                  </div>
                  <div className="text-right mt-1">
                    <div className="font-black text-lg text-slate-900">₦12,500</div>
                  </div>
                </div>
              </label>
            </div>
          </div>
          
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-end gap-3">
            <Button 
              onClick={onClose}
              className="px-5 py-3 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-100 dark:bg-slate-800 transition-colors"
            >
              Cancel
            </Button>
            <Button 
              disabled={!selectedPlan}
              onClick={() => {
                // In a real app, this would redirect to a payment gateway
                alert(`Redirecting to payment gateway for ${selectedPlan} plan...`);
                onClose();
              }}
              className="px-6 py-3 bg-gradient-to-r from-brand-700 to-brand-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:shadow-lg disabled:hover:translate-y-0 flex items-center gap-2"
            >
              Confirm & Pay <ChevronRight size={18} />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
