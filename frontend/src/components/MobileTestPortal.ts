import React from 'react';
import { Smartphone, X, Copy, Check } from 'lucide-react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  expoTunnelUrl: string;
  setExpoTunnelUrl: (url: string) => void;
  copied: boolean;
  handleCopyLink: () => void;
};

export default function MobileTestPortal({
  isOpen,
  onClose,
  expoTunnelUrl,
  setExpoTunnelUrl,
  copied,
  handleCopyLink,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-800 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl shadow-blue-500/10 animate-in fade-in zoom-in duration-75">

        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="text-brand-500" size={20} />
            <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
              Mobile Test Portal
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">

          <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-lg overflow-hidden">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(expoTunnelUrl)}`}
                alt="Mobile App QR Code"
                className="w-48 h-48"
                referrerPolicy="no-referrer"
              />
            </div>

            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-4 tracking-wider uppercase">
              Scan to Open on Phone
            </span>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Web App URL
            </label>

            <div className="flex gap-2">
              <input
                type="text"
                value={expoTunnelUrl}
                onChange={(e) => setExpoTunnelUrl(e.target.value)}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-mono flex-1 focus:outline-none focus:border-brand-500"
                placeholder="https://..."
              />

              <button
                onClick={handleCopyLink}
                className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-2 rounded-xl transition flex items-center justify-center"
              >
                {copied ? (
                  <Check size={14} className="text-emerald-400" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 space-y-2.5">
            <p className="font-bold text-slate-700 dark:text-slate-200">
              How to test on your phone:
            </p>

            <ol className="list-decimal list-inside space-y-1.5 leading-relaxed">
              <li>
                Install the <strong>Expo Go</strong> app from App Store (iOS) or Play Store (Android).
              </li>

              <li>
                Scan the QR Code above with your Camera (iOS) or the Expo Go scanner (Android).
              </li>

              <li>
                Alternatively, copy and paste the URL directly into Expo Go's address bar.
              </li>
            </ol>
          </div>

        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex justify-end">
          <button
            onClick={onClose}
            className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}