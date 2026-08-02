import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, FileText, ShieldCheck } from 'lucide-react';
import { Button } from './ui/Button';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'terms' | 'privacy' | null;
}

export default function LegalModal({ isOpen, onClose, type }: LegalModalProps) {
  if (!isOpen || !type) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 20, opacity: 0, scale: 0.95 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-[20px] w-full max-w-lg shadow-sm overflow-hidden flex flex-col max-h-[85vh]"
        >
          <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
                {type === 'terms' ? <FileText size={20} /> : <ShieldCheck size={20} />}
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg leading-tight">
                  {type === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Last updated: July 2026</p>
              </div>
            </div>
            <Button aria-label="Action" 
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
            >
              <X size={18} />
            </Button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-600 dark:text-slate-400 space-y-4">
            {type === 'terms' ? (
              <>
                <p><strong>1. Acceptance of Terms</strong><br/>By accessing and using TransConet, you accept and agree to be bound by the terms and provision of this agreement.</p>
                <p><strong>2. Description of Service</strong><br/>TransConet provides a digital logistics hub and haulage marketplace connecting cargo owners and logistics fleet managers.</p>
                <p><strong>3. User Conduct</strong><br/>You agree to use the service only for lawful purposes. You agree not to take any action that might compromise the security of the service, render the service inaccessible to others or otherwise cause damage to the service.</p>
                <p><strong>4. Intellectual Property</strong><br/>All content included on this site, such as text, graphics, logos, button icons, images, is the property of TransConet or its content suppliers and protected by international copyright laws.</p>
                <p><strong>5. Limitation of Liability</strong><br/>TransConet shall not be liable for any direct, indirect, incidental, special or consequential damages resulting from the use or inability to use the service.</p>
              </>
            ) : (
              <>
                <p><strong>1. Information Collection</strong><br/>We collect information from you when you register on our site, place an order, subscribe to our newsletter, respond to a survey or fill out a form.</p>
                <p><strong>2. Use of Information</strong><br/>Any of the information we collect from you may be used to personalize your experience, improve our website, improve customer service, process transactions, or send periodic emails.</p>
                <p><strong>3. Information Protection</strong><br/>We implement a variety of security measures to maintain the safety of your personal information when you enter, submit, or access your personal information.</p>
                <p><strong>4. Information Disclosure</strong><br/>We do not sell, trade, or otherwise transfer to outside parties your personally identifiable information. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.</p>
                <p><strong>5. Consent</strong><br/>By using our site, you consent to our privacy policy.</p>
              </>
            )}
          </div>
          
          <div className="p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex justify-end">
            <Button 
              onClick={onClose}
              className="px-6 py-2.5 bg-brand-600 text-white font-bold rounded-xl shadow-sm hover:bg-brand-600 transition-colors"
            >
              I Understand
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
