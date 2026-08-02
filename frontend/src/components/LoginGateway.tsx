import React, { useState, useRef, useEffect } from 'react';
import api from '../api/client';
import { useAuth } from '../hooks/useAuth';
import { Loader2, Smartphone, Lock, Eye, EyeOff, Camera, ArrowRight, ShieldCheck, Check, Facebook, Twitter, Linkedin, FileText, UserRound, Truck, UploadCloud, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import LegalModal from './LegalModal';
import { auth, googleProvider } from '../utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import { supabase } from '../supabaseClient';
import SelfieCapture from './SelfieCapture';
import { Button } from './ui/Button';
import { Shield } from 'lucide-react';

const LOGISTICS_IMAGES = [
  "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20800%20600%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%0A%20%20%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23E3F2FD%22/%3E%0A%20%20%3Crect%20x%3D%22100%22%20y%3D%22200%22%20width%3D%22600%22%20height%3D%22400%22%20fill%3D%22%2390CAF9%22/%3E%0A%20%20%3Crect%20x%3D%22200%22%20y%3D%22300%22%20width%3D%22100%22%20height%3D%22100%22%20fill%3D%22%2342A5F5%22/%3E%0A%20%20%3Crect%20x%3D%22320%22%20y%3D%22350%22%20width%3D%22100%22%20height%3D%2250%22%20fill%3D%22%231E88E5%22/%3E%0A%20%20%3Crect%20x%3D%22440%22%20y%3D%22250%22%20width%3D%22100%22%20height%3D%22150%22%20fill%3D%22%231565C0%22/%3E%0A%20%20%3Ccircle%20cx%3D%22200%22%20cy%3D%22100%22%20r%3D%2240%22%20fill%3D%22%23FFFFFF%22%20opacity%3D%220.8%22/%3E%0A%20%20%3Ccircle%20cx%3D%22250%22%20cy%3D%22100%22%20r%3D%2250%22%20fill%3D%22%23FFFFFF%22%20opacity%3D%220.8%22/%3E%0A%20%20%3Ccircle%20cx%3D%22300%22%20cy%3D%22100%22%20r%3D%2240%22%20fill%3D%22%23FFFFFF%22%20opacity%3D%220.8%22/%3E%0A%3C/svg%3E", // Warehouse / cartons
  "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20800%20600%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%0A%20%20%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23E8F5E9%22/%3E%0A%20%20%3Crect%20x%3D%22100%22%20y%3D%22300%22%20width%3D%22200%22%20height%3D%22150%22%20fill%3D%22%2381C784%22%20rx%3D%2210%22/%3E%0A%20%20%3Crect%20x%3D%22350%22%20y%3D%22250%22%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%234CAF50%22%20rx%3D%2210%22/%3E%0A%20%20%3Crect%20x%3D%22600%22%20y%3D%22300%22%20width%3D%22150%22%20height%3D%22150%22%20fill%3D%22%23388E3C%22%20rx%3D%2210%22/%3E%0A%20%20%3Ccircle%20cx%3D%22150%22%20cy%3D%22450%22%20r%3D%2230%22%20fill%3D%22%232E7D32%22/%3E%0A%20%20%3Ccircle%20cx%3D%22250%22%20cy%3D%22450%22%20r%3D%2230%22%20fill%3D%22%232E7D32%22/%3E%0A%20%20%3Ccircle%20cx%3D%22400%22%20cy%3D%22450%22%20r%3D%2230%22%20fill%3D%22%232E7D32%22/%3E%0A%20%20%3Ccircle%20cx%3D%22500%22%20cy%3D%22450%22%20r%3D%2230%22%20fill%3D%22%232E7D32%22/%3E%0A%3C/svg%3E", // Fleet of vans
  "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20800%20600%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%0A%20%20%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23FFF3E0%22/%3E%0A%20%20%3Cpolygon%20points%3D%22100%2C500%20700%2C500%20600%2C200%20200%2C200%22%20fill%3D%22%23FFB74D%22/%3E%0A%20%20%3Crect%20x%3D%22250%22%20y%3D%22250%22%20width%3D%22300%22%20height%3D%22250%22%20fill%3D%22%23FF9800%22/%3E%0A%20%20%3Crect%20x%3D%22300%22%20y%3D%22300%22%20width%3D%22200%22%20height%3D%22100%22%20fill%3D%22%23F57C00%22/%3E%0A%3C/svg%3E", // Cargo
  "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%20800%20600%22%20width%3D%22100%25%22%20height%3D%22100%25%22%3E%0A%20%20%3Crect%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23F3E5F5%22/%3E%0A%20%20%3Crect%20x%3D%22200%22%20y%3D%22200%22%20width%3D%22200%22%20height%3D%22200%22%20fill%3D%22%23CE93D8%22/%3E%0A%20%20%3Crect%20x%3D%22450%22%20y%3D%22300%22%20width%3D%22150%22%20height%3D%22150%22%20fill%3D%22%23AB47BC%22/%3E%0A%20%20%3Crect%20x%3D%22300%22%20y%3D%22400%22%20width%3D%22150%22%20height%3D%22150%22%20fill%3D%22%238E24AA%22/%3E%0A%20%20%3Cline%20x1%3D%22200%22%20y1%3D%22200%22%20x2%3D%22400%22%20y2%3D%22400%22%20stroke%3D%22%239C27B0%22%20stroke-width%3D%225%22/%3E%0A%3C/svg%3E"  // Boxes / cartons
];

interface LoginGatewayProps {
  onLoginSuccess: (token: string, phone: string) => void;
}

export default function LoginGateway({ onLoginSuccess }: LoginGatewayProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'SHIPPER' | 'TRANSPORTER'>('SHIPPER');
  const [signUpStep, setSignUpStep] = useState<1 | 2>(1);
  const [pin, setPin] = useState('');
  const { loginWithPin, registerWithPin, resetPasswordRequest, resetPasswordConfirm, error: authError, setError: setAuthError } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2 | 3>(1); // 1 = request token, 2 = verify token & reset, 3 = success
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [legalModal, setLegalModal] = useState<{isOpen: boolean, type: 'terms' | 'privacy' | null}>({isOpen: false, type: null});
  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showSelfie, setShowSelfie] = useState(false);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % LOGISTICS_IMAGES.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('Initiating device fingerprinting & AI fraud checks...');
    await new Promise(r => setTimeout(r, 1200));
    setMessage('Securing auth channel (TLS/AES-256)...');
    await new Promise(r => setTimeout(r, 1000));
    setMessage(null);
    
    const formattedPhone = phoneNumber.trim();

    if (formattedPhone.length < 10) {
      setError('Please supply a valid contact phone number.');
      setLoading(false);
      return;
    }

    if (pin.length < 6) {
      setError('Please enter your password (PIN).');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/login-pin', { 
        phoneNumber: formattedPhone, 
        pin: pin 
      });
      
      const { token } = response.data;
      onLoginSuccess(token, formattedPhone);
    } catch (err: any) {
      setError((typeof err.response?.data?.error === 'object' ? JSON.stringify(err.response?.data?.error) : err.response?.data?.error) || 'Incorrect phone number or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      const response = await api.post('/auth/google', {
        email: user.email,
        name: user.displayName,
        uid: user.uid,
        idToken: await user.getIdToken()
      });
      
      onLoginSuccess(response.data.token, user.phoneNumber || user.email || 'unknown');
    } catch (err: any) {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage('Performing Identity Verification (KYC)...');
    await new Promise(r => setTimeout(r, 1200));
    setMessage('Initializing AI fraud detection...');
    await new Promise(r => setTimeout(r, 1200));
    setMessage(null);

    const formattedPhone = phoneNumber.trim();

    if (formattedPhone.length < 10) {
      setError('Please supply a valid contact phone number.');
      setLoading(false);
      return;
    }

    if (pin.length < 6) {
      setError('Password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/register-pin', { 
        phoneNumber: formattedPhone, 
        email: email.trim() || `${formattedPhone}@transconet.com`,
        pin: pin,
        role: role 
      });
      
      const { token } = response.data;
      onLoginSuccess(token, formattedPhone);
    } catch (err: any) {
      setError((typeof err.response?.data?.error === 'object' ? JSON.stringify(err.response?.data?.error) : err.response?.data?.error) || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const formattedEmail = email.trim();
    if (!formattedEmail || !/^\S+@\S+\.\S+$/.test(formattedEmail)) {
      setError('Please supply a valid email address.');
      setLoading(false);
      return;
    }

    try {
      // In a real app this would call: await api.post('/auth/forgot-password', { email: formattedEmail });
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      setResetStep(2);
      setMessage(`A secure reset token has been sent to ${formattedEmail}. Please check your inbox.`);
    } catch (err: any) {
      setError('Failed to process password recovery request.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (resetToken.length < 5) {
      setError('Please provide a valid reset token.');
      setLoading(false);
      return;
    }
    
    if (newPassword.length < 6) {
      setError('Your new password must be at least 6 characters.');
      setLoading(false);
      return;
    }

    try {
      // In a real app this would call: await api.post('/auth/reset-password', { email, token: resetToken, newPassword });
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      setResetStep(3);
      setMessage('Password successfully reset. You can now login with your new credentials.');
      setTimeout(() => {
        setIsForgotPasswordMode(false);
        setResetStep(1);
        setEmail('');
        setResetToken('');
        setNewPassword('');
        setMessage(null);
      }, 3000);
    } catch (err: any) {
      setError('Invalid or expired reset token.');
    } finally {
      setLoading(false);
    }
  };

  const TikTokIcon = ({ size = 24, color = "currentColor", className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );

  if (isSignUpMode && signUpStep === 1) {
    return (
      <div className="bg-white dark:bg-slate-900 font-sans h-[100dvh] w-full flex flex-col relative overflow-hidden text-slate-900 safe-area-inset">
        <motion.div 
          key="signup-step1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex w-full h-full relative"
        >
          
          {/* Top Branding */}
          <div className="absolute top-8 left-0 w-full pt-4 pb-6 flex flex-col items-center z-50 pointer-events-none text-center px-6">
             <div className="flex items-center justify-center pointer-events-none">
               <h1 className="text-[28px] font-black tracking-tight leading-none drop-shadow-md">
                 <span className="text-white">Trans</span>
                 <span className="text-white/90">Conet</span>
               </h1>
             </div>


          </div>
          {/* Left Side (Customer) */}
          <div 
             className="w-1/2 h-full bg-brand-900 relative overflow-hidden flex flex-col cursor-pointer transition-colors group"
             onClick={() => { setRole('SHIPPER'); setSignUpStep(2); }}
          >
             <div 
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" 
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&q=80")' }} 
             />
             <div className="absolute inset-0 bg-brand-900/50 pointer-events-none" />
             <div className="absolute inset-0 bg-gradient-to-t from-brand-900 via-brand-900/60 to-transparent pointer-events-none" />
             <div className="flex-1 flex flex-col items-center justify-center mt-24 px-4 text-center z-10">
                <h2 className="text-[18px] font-bold text-white mb-3">Customers</h2>
                <p className="text-white/80 text-[11px] leading-relaxed max-w-[140px]">Post your cargo, compare quotes and book trusted transporters easily.</p>
             </div>
             <div className="mb-12 flex justify-center z-10">
                <div className="w-12 h-12 rounded-full border-[1.5px] border-white/30 flex items-center justify-center text-white group-hover:bg-white dark:bg-slate-900 group-hover:text-brand-900 transition-colors">
                   <ArrowRight size={20} strokeWidth={2.5} />
                </div>
             </div>
          </div>

          {/* Right Side (Transporter) */}
          <div 
             className="w-1/2 h-full bg-brand-600 relative overflow-hidden flex flex-col cursor-pointer transition-colors group"
             onClick={() => { setRole('TRANSPORTER'); setSignUpStep(2); }}
          >
             <div 
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700" 
                style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=80")' }} 
             />
             <div className="absolute inset-0 bg-brand-600/40 pointer-events-none" />
             <div className="absolute inset-0 bg-gradient-to-t from-brand-600 via-brand-600/60 to-transparent pointer-events-none" />
             <div className="flex-1 flex flex-col items-center justify-center mt-24 px-4 text-center z-10">
                <h2 className="text-[18px] font-bold text-white mb-3">Transporters / Driver</h2>
                <p className="text-white/80 text-[11px] leading-relaxed max-w-[140px]">Find loads, grow your business and get paid.</p>
             </div>
             <div className="mb-12 flex justify-center z-10">
                <div className="w-12 h-12 rounded-full border-[1.5px] border-white/30 flex items-center justify-center text-white group-hover:bg-white dark:bg-slate-900 group-hover:text-brand-600 transition-colors">
                   <ArrowRight size={20} strokeWidth={2.5} />
                </div>
             </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 font-sans h-[100dvh] w-full flex flex-col relative overflow-hidden text-slate-900 safe-area-inset">
      
      {/* Main Content Single Layer */}
      <div className="w-full max-w-md mx-auto z-10 flex flex-col h-full relative px-5 pt-4 pb-2 overflow-y-auto overflow-x-hidden no-scrollbar">
        
        {/* Branding & Welcome Quote */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center shrink-0 pb-3 w-full text-center"
        >
            <h1 className="text-[28px] font-black tracking-tight drop-shadow-sm leading-none mb-2 relative z-10">
              <span className="text-brand-600">Trans</span>
              <span className="text-slate-900">Conet</span>
            </h1>

        </motion.div>

        {/* Dynamic Forms Area */}
        <div className="flex-1 flex flex-col justify-start w-full relative">
          {showSelfie && (
            <SelfieCapture 
              onCapture={(img) => { setProfileImage(img); setShowSelfie(false); }} 
              onCancel={() => setShowSelfie(false)} 
            />
          )}
          <AnimatePresence mode="wait">
            {isForgotPasswordMode ? (
              // FORGOT PASSWORD FORM
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col w-full h-full"
              >
                <div className="flex items-center mb-6">
                  <Button onClick={() => { setIsForgotPasswordMode(false); setResetStep(1); setError(null); setMessage(null); }} className="text-slate-900 p-2 -ml-2 rounded-full hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                     <ArrowRight size={20} className="rotate-180" />
                  </Button>
                  <h2 className="text-[20px] font-bold text-slate-900 tracking-tight ml-2">
                    Password Recovery
                  </h2>
                </div>

                <div className="text-center mb-6">
                  <div className="mx-auto w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4">
                    <Lock size={32} className="text-brand-600" />
                  </div>
                  <p className="text-[14px] text-slate-500 dark:text-slate-">
                    {resetStep === 1 
                      ? "Enter your email address to receive a secure reset token." 
                      : resetStep === 2
                      ? "Enter the token sent to your email and your new password."
                      : "Your password has been successfully reset."}
                  </p>
                </div>

                <div className="flex flex-col flex-1">
                  {error && (
                    <div className="bg-red-50 text-red-600 text-[12px] p-2.5 rounded-xl text-center border border-red-100 font-medium mb-4">
                      {error && error ? ((error as any).message || JSON.stringify(error)) : error}
                    </div>
                  )}
                  {message && (
                    <div className="bg-emerald-50 text-emerald-700 text-[12px] p-2.5 rounded-xl text-center border border-emerald-100 font-medium mb-4">
                      {message}
                    </div>
                  )}

                  {resetStep === 1 ? (
                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[12px] font-bold text-slate-900 uppercase tracking-wider mb-1.5">Email Address</label>
                        <div className="relative">
                          <input 
                            type="email"
                            placeholder="e.g. driver@transconet.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-[54px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-[15px] font-medium text-slate-900 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all"
                            required
                          />
                        </div>
                      </div>

                      <motion.button 
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        disabled={loading}
                        className="w-full h-[54px] bg-brand-600 hover:bg-brand-600 rounded-2xl flex items-center justify-center transition-all disabled:opacity-70 mt-6 text-white font-bold text-[15px] shadow-[0_4px_14px_rgba(37,99,235,0.25)]"
                      >
                        {loading ? <Loader2 className="animate-spin" size={22} /> : 'Send Reset Token'}
                      </motion.button>
                    </form>
                  ) : resetStep === 2 ? (
                    <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[12px] font-bold text-slate-900 uppercase tracking-wider mb-1.5">Reset Token</label>
                        <div className="relative">
                          <input 
                            type="text"
                            placeholder="Enter token code"
                            value={resetToken}
                            onChange={(e) => setResetToken(e.target.value)}
                            className="w-full h-[54px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-[15px] font-medium text-slate-900 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all"
                            required
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-[12px] font-bold text-slate-900 uppercase tracking-wider mb-1.5">New Password</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock size={18} className="text-slate-400 dark:text-slate-400" />
                          </div>
                          <input 
                            type={showPassword ? "text" : "password"}
                            maxLength={6} placeholder="Enter new password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full h-[54px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-12 text-[15px] font-medium text-slate-900 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all tracking-widest"
                            required
                          />
                          <Button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-slate-400 hover:text-slate-900 cursor-pointer"
                          >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                          </Button>
                        </div>
                      </div>

                      <motion.button 
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        disabled={loading}
                        className="w-full h-[54px] bg-brand-600 hover:bg-brand-600 rounded-2xl flex items-center justify-center transition-all disabled:opacity-70 mt-6 text-white font-bold text-[15px] shadow-[0_4px_14px_rgba(37,99,235,0.25)]"
                      >
                        {loading ? <Loader2 className="animate-spin" size={22} /> : 'Reset Password'}
                      </motion.button>
                    </form>
                  ) : (
                    <div className="flex flex-col items-center justify-center mt-4">
                       <Check size={48} className="text-emerald-500 mb-4" />
                       <Button onClick={() => { setIsForgotPasswordMode(false); setResetStep(1); }} className="text-brand-600 font-bold hover:underline">
                         Return to Login
                       </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : !isSignUpMode ? (
              // SIGN IN FORM
              <motion.div 
                key="signin"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col w-full h-full"
              >
                {/* WELCOME SECTION REMOVED */}
                <div className="mb-3 shrink-0"></div>

                <form onSubmit={handleLoginSubmit} className="space-y-3 shrink-0 flex flex-col w-full">
                  {error && (
                    <div className="bg-red-50 text-red-600 text-[12px] p-2.5 rounded-xl text-center border border-red-100 font-medium">
                      {error && error ? ((error as any).message || JSON.stringify(error)) : error}
                    </div>
                  )}
                  {message && (
                    <div className="bg-emerald-50 text-emerald-700 text-[12px] p-2.5 rounded-xl text-center border border-emerald-100 font-medium">
                      {message}
                    </div>
                  )}

                  <div className="relative group w-full">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate- group-focus-within:text-brand-600 transition-colors">
                      <Smartphone size={20} strokeWidth={2} />
                    </div>
                    <input 
                      type="tel" 
                      required
                      placeholder="Mobile Number"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      className="w-full h-[52px] pl-[3rem] pr-4 bg-slate-50 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-[14px] focus:outline-none focus:bg-white dark:bg-slate-900 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 transition-all text-slate-900 placeholder:text-slate-600 dark:text-slate- font-medium"
                    />
                  </div>
                  
                  <div className="relative group w-full">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate- group-focus-within:text-brand-600 transition-colors">
                      <Lock size={20} strokeWidth={2} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      maxLength={6} placeholder="Password"
                      className="w-full h-[52px] pl-[3rem] pr-10 bg-slate-50 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-[14px] focus:outline-none focus:bg-white dark:bg-slate-900 focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 transition-all text-slate-900 placeholder:text-slate-600 dark:text-slate- font-medium"
                    />
                    <Button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 dark:text-slate- hover:text-brand-600 transition-colors p-1.5 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </div>

                  <div className="flex items-center justify-between py-1 w-full">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <div className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${rememberMe ? 'bg-brand-600 border-brand-600' : 'border-slate-300 bg-white dark:bg-slate-900 group-hover:border-brand-600'}`}>
                        {rememberMe && <Check size={12} className="text-white" strokeWidth={3} />}
                      </div>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      <span className="text-[13px] text-slate-900 font-medium">Remember Me</span>
                    </label>
                    <Button type="button" onClick={() => { setIsForgotPasswordMode(true); setError(null); setMessage(null); }} className="text-brand-600 font-semibold text-[13px] hover:underline cursor-pointer">Forgot Password?</Button>
                  </div>

                  <motion.button 
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    disabled={loading}
                    className="w-full h-[54px] bg-brand-600 hover:bg-brand-600 rounded-2xl flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-[0_4px_14px_rgba(21,101,192,0.25)] relative mt-2"
                  >
                    {loading ? <Loader2 className="animate-spin text-white" size={22} /> : (
                      <>
                        <span className="text-white font-bold text-[15px] tracking-wide">Sign In</span>
                        <ArrowRight size={18} className="text-white absolute right-4" strokeWidth={2.5} />
                      </>
                    )}
                  </motion.button>

                  <div className="flex items-center justify-center my-1 relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
                    <div className="relative flex justify-center"><span className="px-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate- text-[11px] font-bold tracking-widest uppercase">OR</span></div>
                  </div>

                  <Button type="button" onClick={handleGoogleLogin} className="w-full h-[50px] bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center gap-2.5 border border-slate-200 dark:border-slate-700 hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors shadow-sm cursor-pointer">
                    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    <span className="text-[14px] font-bold text-slate-900">Continue with Google</span>
                  </Button>

                  <div className="flex flex-col items-center justify-center pt-1 gap-1">
                    <div className="text-[13px]">
                      <span className="text-slate-500 dark:text-slate- font-medium">Don't have an account? </span>
                      <Button type="button" onClick={() => { setIsSignUpMode(true); setSignUpStep(1); }} className="text-brand-600 font-bold cursor-pointer hover:underline">Sign Up</Button>
                    </div>
                    <div className="flex items-center justify-center gap-3 text-[10.5px] text-slate-600 dark:text-slate- pt-1 font-medium">
                      <Button type="button" onClick={() => setLegalModal({isOpen: true, type: 'terms'})} className="flex items-center gap-1 hover:text-brand-600 transition-colors"><FileText size={12} /> Terms</Button>
                      <span className="text-slate-600 dark:text-slate-">•</span>
                      <Button type="button" onClick={() => setLegalModal({isOpen: true, type: 'privacy'})} className="flex items-center gap-1 hover:text-brand-600 transition-colors"><ShieldCheck size={12} /> Privacy</Button>
                    </div>
                    
                    {/* Social Icons Below Privacy Policy */}
                    <div className="flex items-center gap-4 mt-1 mb-0">
                      <a aria-label="Link" href="#" className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate- hover:text-brand-600 hover:border-brand-600 transition-colors">
                        <Linkedin size={15} strokeWidth={2} />
                      </a>
                      <a aria-label="Link" href="#" className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate- hover:text-brand-600 hover:border-brand-600 transition-colors">
                        <Facebook size={15} strokeWidth={2} />
                      </a>
                      <a aria-label="Link" href="#" className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate- hover:text-brand-600 hover:border-brand-600 transition-colors">
                        <TikTokIcon size={15} />
                      </a>
                      <a aria-label="Link" href="#" className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate- hover:text-brand-600 hover:border-brand-600 transition-colors">
                        <Twitter size={15} strokeWidth={2} />
                      </a>
                    </div>
                  </div>
                </form>
                <div className="mt-6 text-center">
                </div>
              </motion.div>
            ) : (
              // SIGN UP FORM
              <motion.div 
                key="signup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col w-full h-full"
              >
                <div className="text-center mb-4 shrink-0 flex flex-col items-center">
                  <h2 className="text-[22px] font-bold text-slate-900 tracking-tight mb-0.5">Create Your Account</h2>
                </div>

                <div className="flex flex-col items-center justify-center mb-4 relative shrink-0">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => { handleImageUpload(e); setShowProfileOptions(false); }} />
                  <div className="relative group cursor-pointer" onClick={() => setShowProfileOptions(!showProfileOptions)}>
                    <div className="w-[72px] h-[72px] bg-white dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 border-dashed flex items-center justify-center transition-all shadow-sm group-hover:border-brand-600">
                      {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 text-slate-400 dark:text-slate-400 group-hover:text-brand-600" />}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-brand-600 w-[24px] h-[24px] rounded-full flex items-center justify-center text-white border-[2px] border-white shadow-sm">
                      <span className="text-[16px] leading-none pb-0.5 font-bold">+</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate- mt-2 font-medium">Upload Profile Photo</span>
                    
                  {showProfileOptions && (
                    <div className="absolute top-full mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-2 z-10 flex flex-col gap-1 w-40 text-sm">
                      <Button type="button" className="flex items-center gap-2 p-2 hover:bg-brand-50 cursor-pointer hover:shadow-sm rounded-lg text-slate-700 dark:text-slate- font-medium" onClick={() => { setShowSelfie(true); setShowProfileOptions(false); }}>
                        <Camera size={16} /> Take Selfie
                      </Button>
                      <Button type="button" className="flex items-center gap-2 p-2 hover:bg-brand-50 cursor-pointer hover:shadow-sm rounded-lg text-slate-700 dark:text-slate- font-medium" onClick={() => { fileInputRef.current?.click(); setShowProfileOptions(false); }}>
                        <UploadCloud size={16} /> Upload Photo
                      </Button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSignupSubmit} className="space-y-3 shrink-0 flex flex-col w-full">
                  {error && <div className="bg-red-50 text-red-600 text-[11.5px] p-2 rounded-xl text-center border border-red-100 font-medium">{error && error ? ((error as any).message || JSON.stringify(error)) : error}</div>}
                  
                  <div className="flex gap-2">
                    <div className="relative w-1/2 group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 group-focus-within:text-brand-600 transition-colors"><UserRound size={16} strokeWidth={2} /></div>
                      <input required placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full h-[48px] pl-9 pr-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all text-slate-900 placeholder:text-slate-500 dark:text-slate- font-medium shadow-sm" />
                    </div>
                    <div className="relative w-1/2 group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 group-focus-within:text-brand-600 transition-colors"><UserRound size={16} strokeWidth={2} /></div>
                      <input required placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full h-[48px] pl-9 pr-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all text-slate-900 placeholder:text-slate-500 dark:text-slate- font-medium shadow-sm" />
                    </div>
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 group-focus-within:text-brand-600 transition-colors">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                    <input required type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-[48px] pl-9 pr-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all text-slate-900 placeholder:text-slate-500 dark:text-slate- font-medium shadow-sm" />
                  </div>
                  
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 group-focus-within:text-brand-600 transition-colors"><Smartphone size={16} strokeWidth={2} /></div>
                    <input required type="tel" placeholder="Mobile Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} className="w-full h-[48px] pl-9 pr-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all text-slate-900 placeholder:text-slate-500 dark:text-slate- font-medium font-mono shadow-sm" />
                  </div>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 group-focus-within:text-brand-600 transition-colors"><Lock size={16} strokeWidth={2} /></div>
                    <input type={showPassword ? "text" : "password"} required maxLength={6} placeholder="Password" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full h-[48px] pl-9 pr-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all text-slate-900 placeholder:text-slate-500 dark:text-slate- font-medium font-mono shadow-sm" />
                    <Button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 hover:text-brand-600 transition-colors p-1"><EyeOff size={16} /></Button>
                  </div>
                  <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full h-[50px] bg-brand-600 hover:bg-brand-700 rounded-xl flex items-center justify-center transition-all disabled:opacity-70 text-white font-bold text-[15px] cursor-pointer relative shadow-sm mt-1">
                    {loading ? <Loader2 className="animate-spin text-white" size={22} /> : <><span className="tracking-wide">Sign Up</span><ArrowRight size={18} className="text-white absolute right-4" strokeWidth={2.5} /></>}
                  </motion.button>
                  <div className="flex items-center justify-center my-1 relative">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700"></div></div>
                    <div className="relative flex justify-center"><span className="px-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate- text-[11px] font-bold tracking-widest uppercase">OR</span></div>
                  </div>

                  <Button type="button" onClick={handleGoogleLogin} className="w-full h-[50px] bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center gap-2.5 border border-slate-200 dark:border-slate-700 hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors shadow-sm cursor-pointer">
                    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                    <span className="text-[14px] font-bold text-slate-900">Continue with Google</span>
                  </Button>

                  <div className="flex flex-col items-center justify-center mt-1 gap-1">
                    <div className="text-[13px]"><span className="text-slate-500 dark:text-slate- font-medium">Already have an account? </span><Button type="button" onClick={() => setIsSignUpMode(false)} className="text-brand-600 font-bold cursor-pointer hover:underline">Sign In</Button></div>
                    <div className="flex items-center justify-center gap-3 text-[10px] text-slate-600 dark:text-slate- mt-1 font-medium">
                      <Button type="button" onClick={() => setLegalModal({isOpen: true, type: 'terms'})} className="flex items-center gap-1 hover:text-brand-600 transition-colors"><FileText size={12} /> Terms</Button>
                      <span className="text-slate-600 dark:text-slate-">•</span>
                      <Button type="button" onClick={() => setLegalModal({isOpen: true, type: 'privacy'})} className="flex items-center gap-1 hover:text-brand-600 transition-colors"><ShieldCheck size={12} /> Privacy</Button>
                    </div>

                    {/* Social Icons Below Privacy Policy */}
                    <div className="flex items-center gap-4 mt-1 mb-0">
                      <a aria-label="Link" href="#" className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate- hover:text-brand-600 hover:border-brand-600 transition-colors">
                        <Linkedin size={15} strokeWidth={2} />
                      </a>
                      <a aria-label="Link" href="#" className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate- hover:text-brand-600 hover:border-brand-600 transition-colors">
                        <Facebook size={15} strokeWidth={2} />
                      </a>
                      <a aria-label="Link" href="#" className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate- hover:text-brand-600 hover:border-brand-600 transition-colors">
                        <TikTokIcon size={15} />
                      </a>
                      <a aria-label="Link" href="#" className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 dark:text-slate- hover:text-brand-600 hover:border-brand-600 transition-colors">
                        <Twitter size={15} strokeWidth={2} />
                      </a>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <LegalModal 
        isOpen={legalModal.isOpen} 
        type={legalModal.type} 
        onClose={() => setLegalModal({isOpen: false, type: null})} 
      />
    </div>
  );
}
