import React, { useState } from 'react';
import { Shield, Key, EyeOff, Eye, Loader2, ServerCrash, AlertCircle, Smartphone } from 'lucide-react';
import api from '../api/client';

export default function DedicatedAdminLogin({ onLoginSuccess }: { onLoginSuccess: (admin: any) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState('simulate-captcha-12345');
  const [mfaToken, setMfaToken] = useState('');
  const [requireMfa, setRequireMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
       setError('Email and password are required.');
       return;
    }
    setError('');
    setLoading(true);
    
    try {
       const res = await api.post('/admin/auth/login', { email, password, captchaToken, mfaToken });
       const data = res.data;
       
       if (data.token) {
         localStorage.setItem('admin_token', data.token);
         localStorage.setItem('admin_user', JSON.stringify(data.admin));
         onLoginSuccess(data.admin);
       } else if (data.requireMfa) {
         setRequireMfa(true);
       }
    } catch (err: any) {
       console.log('Login failed. Expected behavior for invalid credentials.');
       const errData = err.response?.data;
       if (errData?.requireMfa) {
         setRequireMfa(true);
         setError('');
       } else {
         let errMessage = 'Authentication failed.';
         if (typeof errData?.error === 'string') {
           errMessage = errData.error;
         } else if (errData?.error && typeof errData.error === 'object') {
           errMessage = errData.error.message || JSON.stringify(errData.error);
         } else if (err.message) {
           errMessage = err.message;
         }
         setError(errMessage);
       }
    } finally {
       setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[20px] shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-8 space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-slate-900 p-4 rounded-[20px] text-white">
               <Shield size={32} />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Admin Portal</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Authorized Personnel Only</p>
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle size={18} className="text-rose-500 mt-0.5" />
              <p className="text-sm text-rose-700">{error && error ? ((error as any).message || JSON.stringify(error)) : error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!requireMfa ? (
              <>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Admin Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-slate-400 focus:bg-white dark:bg-slate-900 transition"
                    placeholder="admin@transconet.com"
                    autoComplete="username"
                  />
                </div>
                
                <div className="space-y-1 relative">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Password</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:border-slate-400 focus:bg-white dark:bg-slate-900 transition"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-7 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-400 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Two-Factor Auth Code</label>
                <div className="flex relative">
                   <div className="absolute left-3 top-3 text-slate-400 dark:text-slate-400"><Smartphone size={18} /></div>
                   <input
                     type="text"
                     value={mfaToken}
                     onChange={(e) => setMfaToken(e.target.value)}
                     className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-4 py-3 text-sm font-mono tracking-widest focus:outline-none focus:border-slate-400 focus:bg-white dark:bg-slate-900 transition text-center"
                     placeholder="000000"
                     maxLength={6}
                   />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2">A verification token has been sent to yusufjimoh969@gmail.com. Please enter it below to approve this login.</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition flex items-center justify-center gap-2 mt-6 disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Authenticating...</>
              ) : (
                <><Key size={18} /> {requireMfa ? 'Verify Identity' : 'Access System'}</>
              )}
            </button>
          </form>
          <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
            <p>Demo Credentials: <b>admin@transconet.com</b> / <b>SecureAdmin123!</b></p>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800 p-4 border-t border-slate-200 dark:border-slate-700 text-center">
           <p className="text-[10px] text-slate-400 dark:text-slate-400 uppercase tracking-wider">Protected by Advanced Security Engine</p>
        </div>
      </div>
    </div>
  );
}
