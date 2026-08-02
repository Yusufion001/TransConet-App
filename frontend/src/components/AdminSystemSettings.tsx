import React, { useState } from 'react';
import { Sliders, Save, RefreshCw, Bell, Globe, Mail } from 'lucide-react';
import { Button } from './ui/Button';

export default function AdminSystemSettings() {
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[20px] p-6 border border-slate-200 dark:border-slate-700 shadow-sm max-w-4xl mx-auto">
      <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
        <Sliders className="text-brand-600" size={20} /> System Settings
      </h2>
      
      <div className="space-y-8">
        <section>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Globe size={16} /> Platform Configuration
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Platform Name</label>
              <input type="text" defaultValue="TransConet Africa" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-brand-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Base Currency</label>
              <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-brand-500">
                <option>NGN (₦)</option>
                <option>USD ($)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Platform Fee (%)</label>
              <input type="number" defaultValue="5" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-brand-500" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Escrow Hold Duration (Days)</label>
              <input type="number" defaultValue="3" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-brand-500" />
            </div>
          </div>
        </section>

        <section>
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Mail size={16} /> Notification Defaults
          </h3>
          <div className="space-y-3">
            {[
              'Send SMS on Booking Confirmation',
              'Send Email on Payment Success',
              'Notify Admin on High Value Dispute',
              'Daily Analytics Digest',
            ].map((setting, i) => (
              <label key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 transition-colors">
                <input type="checkbox" defaultChecked={i < 3} className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500" />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-400">{setting}</span>
              </label>
            ))}
          </div>
        </section>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          {saved && <span className="text-emerald-600 text-sm font-bold flex items-center gap-1">Settings Saved</span>}
          <Button onClick={handleSave} disabled={loading} className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors disabled:opacity-70">
            {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />} Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
