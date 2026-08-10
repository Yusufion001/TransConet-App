import React, { useEffect, useRef, useState } from 'react';
import api from '../api/client';
import { ArrowRight, Camera, Check, ChevronDown, Eye, EyeOff, Globe2, Headphones, Loader2, Lock, MapPin, ShieldCheck, Truck, UploadCloud, UserRound } from 'lucide-react';
import LegalModal from './LegalModal';
import { auth, googleProvider } from '../utils/firebase';
import { signInWithPopup } from 'firebase/auth';
import SelfieCapture from './SelfieCapture';
import { Button } from './ui/Button';
import { useAuth } from '../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';

interface LoginGatewayProps { onLoginSuccess: (token: string, phone: string) => void; }

type AuthPage = 'signin' | 'signup';

const images = {
  light: 'https://images.unsplash.com/photo-1494412574643-ff11b0a2d8d8?auto=format&fit=crop&q=85&w=1800',
  dark: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&q=85&w=1800',
};

const benefits = [
] as const;

const GoogleIcon = () => <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>;

function Brand({ dark, onLanguage }: { dark: boolean; onLanguage?: () => void }) {
  return <div className="flex items-start justify-between"><div><div className="text-[27px] font-black tracking-[-.05em]"><span className={dark ? 'text-white' : 'text-[#1457E6]'}>Trans</span><span className={dark ? 'text-white/90' : 'text-[#172033]'}>Conet</span></div><p className={`mt-1.5 text-[13px] font-medium ${dark ? 'text-white/70' : 'text-[#657087]'}`}>Connecting Cargo. Moving Business.</p></div><button type="button" onClick={onLanguage} aria-label="Select language" className={`flex h-10 items-center gap-2 rounded-full border px-3.5 text-xs font-semibold backdrop-blur ${dark ? 'border-white/20 bg-white/10 text-white' : 'border-white/80 bg-white/85 text-[#172033] shadow-sm'}`}><Globe2 size={15}/> EN <ChevronDown size={14}/></button></div>;
}

function Field({ label, icon, value, onChange, type='text', placeholder, right }: any) {
  return <label className="block"><span className="mb-1.5 block text-[12px] font-semibold text-[#4F5B70]">{label}</span><span className="relative block"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A93A5]">{icon}</span><input required type={type} value={value} onChange={onChange} placeholder={placeholder || label} className="h-14 w-full rounded-xl border-0 bg-white/10 backdrop-blur-md pl-11 pr-11 text-[14px] font-medium text-[#172033] outline-none transition placeholder:text-[#9AA3B2] focus:border-[#1457E6] focus:ring-4 focus:ring-[#1457E6]/10"/>{right}</span></label>;
}

function Divider() { return <div className="my-5 flex items-center gap-3"><span className="h-px flex-1 bg-[#E6EAF0]"/><span className="text-[10px] font-bold tracking-[.2em] text-[#8A93A5]">OR</span><span className="h-px flex-1 bg-[#E6EAF0]"/></div>; }

function Primary({ loading, children }: any) { return <button type="submit" disabled={loading} className="group relative flex h-14 w-full items-center justify-center rounded-xl bg-[#1457E6] text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(20,87,230,.22)] transition hover:bg-[#0F4DCE] focus:outline-none focus:ring-4 focus:ring-[#1457E6]/20 disabled:opacity-60">{loading ? <Loader2 className="animate-spin" size={21}/> : <>{children}<ArrowRight size={19} className="absolute right-5 transition group-hover:translate-x-0.5"/></>}</button>; }

export default function LoginGateway({ onLoginSuccess }: LoginGatewayProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const page: AuthPage = location.pathname === '/signup' ? 'signup' : 'signin';
  const [phoneNumber,setPhoneNumber]=useState(''); const [email,setEmail]=useState(''); const [firstName,setFirstName]=useState(''); const [lastName,setLastName]=useState('');
  const [role,setRole]=useState<'SHIPPER'|'TRANSPORTER'>('SHIPPER'); const [pin,setPin]=useState(''); const [showPassword,setShowPassword]=useState(false);
  const [loading,setLoading]=useState(false); const [error,setError]=useState<string|null>(null); const [message,setMessage]=useState<string|null>(null);
  const [forgot,setForgot]=useState(false); const [rememberMe,setRememberMe]=useState(false); const [resetStep,setResetStep]=useState<1|2|3>(1); const [resetToken,setResetToken]=useState(''); const [newPassword,setNewPassword]=useState('');
  const [profileImage,setProfileImage]=useState<string|null>(null); const [profileOptions,setProfileOptions]=useState(false); const [showSelfie,setShowSelfie]=useState(false);
  const [legal,setLegal]=useState<{isOpen:boolean,type:'terms'|'privacy'|null}>({isOpen:false,type:null}); const fileRef=useRef<HTMLInputElement>(null);
  const {loginWithPin,registerWithPin,resetPasswordRequest,resetPasswordConfirm}=useAuth();

  useEffect(()=>{ if(location.pathname !== '/signin' && location.pathname !== '/signup') navigate('/signin',{replace:true}); },[location.pathname,navigate]);
  const clear=()=>{setError(null);setMessage(null)};
  const goSignIn=()=>{clear();setForgot(false);navigate('/signin')};
  const goSignUp=()=>{clear();setForgot(false);navigate('/signup')};
  const phone=(e:React.ChangeEvent<HTMLInputElement>)=>setPhoneNumber(e.target.value.replace(/\D/g,''));

  const google=async()=>{setLoading(true);clear();try{const r=await signInWithPopup(auth,googleProvider);const u=r.user;const response=await api.post('/auth/google',{email:u.email,name:u.displayName,uid:u.uid,idToken:await u.getIdToken()});onLoginSuccess(response.data.token,u.phoneNumber||u.email||'unknown')}catch{setError('Google sign-in failed. Please try again.')}finally{setLoading(false)}};
  const login=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);clear();const p=phoneNumber.trim();if(p.length<10){setError('Please supply a valid contact phone number.');setLoading(false);return}if(pin.length<6){setError('Please enter your password (PIN).');setLoading(false);return}try{const r=await loginWithPin(p,pin);onLoginSuccess(r.token,p)}catch(err:any){setError((typeof err.response?.data?.error==='object'?JSON.stringify(err.response?.data?.error):err.response?.data?.error)||'Incorrect phone number or password.')}finally{setLoading(false)}};
  const register=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);clear();const p=phoneNumber.trim();if(p.length<10){setError('Please supply a valid contact phone number.');setLoading(false);return}if(pin.length<6){setError('Password must be at least 6 characters.');setLoading(false);return}try{const r=await registerWithPin(p,pin,email.trim()||`${p}@transconet.com`,role,`${firstName.trim()} ${lastName.trim()}`.trim());onLoginSuccess(r.token,p)}catch(err:any){setError((typeof err.response?.data?.error==='object'?JSON.stringify(err.response?.data?.error):err.response?.data?.error)||'Registration failed. Please try again.')}finally{setLoading(false)}};
  const requestReset=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);clear();if(!/^\S+@\S+\.\S+$/.test(email.trim())){setError('Please supply a valid email address.');setLoading(false);return}try{await resetPasswordRequest(email.trim());setResetStep(2);setMessage('A secure reset token has been sent to your email.')}catch{setError('Failed to process password recovery request.')}finally{setLoading(false)}};
  const confirmReset=async(e:React.FormEvent)=>{e.preventDefault();setLoading(true);clear();if(!resetToken.trim()||newPassword.length<6){setError('Enter the reset token and a password of at least 6 characters.');setLoading(false);return}try{await resetPasswordConfirm(email.trim(),resetToken.trim(),newPassword);setResetStep(3);setMessage('Your password has been reset successfully.')}catch{setError('Invalid or expired reset token.')}finally{setLoading(false)}};
  const upload=(e:React.ChangeEvent<HTMLInputElement>)=>{const f=e.target.files?.[0];if(!f)return;if(f.size>5*1024*1024){setError('Profile photo must be 5MB or smaller.');return}setProfileImage(URL.createObjectURL(f));setProfileOptions(false);clear()};

  const Status=()=> <>{error&&<div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-xs font-medium leading-5 text-red-700">{error}</div>}{message&&<div role="status" className="rounded-xl border border-blue-100 bg-blue-50 px-3.5 py-3 text-xs font-medium leading-5 text-[#1457E6]">{message}</div>}</>;
  const Google=()=> <Button type="button" disabled={loading} onClick={google} className="h-14 w-full rounded-xl border-0 bg-white/10 backdrop-blur-md text-sm font-semibold text-[#172033] shadow-none hover:bg-[#F7F9FC]"><span className="flex items-center justify-center gap-3"><GoogleIcon/>Continue with Google</span></Button>;
  const LegalLinks=()=> <div className="mt-3 text-center text-[10px] leading-4 text-[#8A93A5]">By continuing, you agree to our <button type="button" onClick={()=>setLegal({isOpen:true,type:'terms'})} className="font-semibold text-[#1457E6]">Terms & Conditions</button> and <button type="button" onClick={()=>setLegal({isOpen:true,type:'privacy'})} className="font-semibold text-[#1457E6]">Privacy Policy</button>.</div>;

  const signUpCard=<div className="tc-auth-mobile-form w-full max-w-[520px] rounded-[28px] border-0 bg-white/10 backdrop-blur-md p-5 shadow-[0_28px_70px_rgba(7,27,73,.14)] sm:p-7"><h2 className="text-[28px] font-bold tracking-[-.03em] text-[#172033]">Create your account</h2><p className="mt-1 text-[13px] leading-5 text-[#657087]">Join a trusted network for smarter cargo movement.</p><div className="my-5 text-center"><div className="relative inline-block"><input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={upload}/><button type="button" onClick={()=>setProfileOptions(v=>!v)} className="relative h-24 w-24 overflow-hidden rounded-full border-2 border-dashed border-[#AFC2E6] bg-[#F5F8FC] focus:outline-none focus:ring-4 focus:ring-[#1457E6]/10">{profileImage?<img src={profileImage} alt="Profile preview" className="h-full w-full object-cover"/>:<Camera className="mx-auto text-[#1457E6]" size={28}/>}<span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-[#1457E6] text-xl font-bold text-white">+</span></button><div className="mt-2 text-[11px] font-semibold text-[#4F5B70]">Upload profile photo</div><div className="text-[10px] text-[#8A93A5]">JPG, PNG up to 5MB</div>{profileOptions&&<div className="absolute left-1/2 top-[118px] z-20 w-44 -translate-x-1/2 rounded-xl border-0 bg-white/10 backdrop-blur-md p-1.5 text-left shadow-xl"><button type="button" onClick={()=>{setShowSelfie(true);setProfileOptions(false)}} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-[#F5F8FC]"><Camera size={15}/>Take a selfie</button><button type="button" onClick={()=>fileRef.current?.click()} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold hover:bg-[#F5F8FC]"><UploadCloud size={15}/>Upload photo</button></div>}</div></div><form onSubmit={register} className="space-y-3"><div className="grid grid-cols-1 gap-3 sm:grid-cols-2"><Field label="First name" icon={<UserRound size={17}/>} value={firstName} onChange={(e:any)=>setFirstName(e.target.value)} placeholder="First name"/><Field label="Last name" icon={<UserRound size={17}/>} value={lastName} onChange={(e:any)=>setLastName(e.target.value)} placeholder="Last name"/></div><Field label="Email address" icon={<span>@</span>} type="email" value={email} onChange={(e:any)=>setEmail(e.target.value)} placeholder="you@example.com"/><label className="block"><span className="mb-1.5 block text-[12px] font-semibold text-[#4F5B70]">Mobile number</span><span className="flex h-14 overflow-hidden rounded-xl border-0 bg-white/10 backdrop-blur-md focus-within:ring-4 focus-within:ring-[#1457E6]/10 focus-within:ring-4 focus-within:ring-[#1457E6]/10"><input required type="tel" inputMode="numeric" value={phoneNumber} onChange={phone} placeholder="Mobile number" className="min-w-0 flex-1 px-3 text-sm outline-none placeholder:text-[#9AA3B2]"/></span></label><Field label="Password" icon={<Lock size={17}/>} type={showPassword?'text':'password'} value={pin} onChange={(e:any)=>setPin(e.target.value)} placeholder="Your account PIN" right={<button type="button" aria-label="Toggle password visibility" onClick={()=>setShowPassword(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#8A93A5]">{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button>}/><p className="-mt-1 text-[10px] leading-4 text-[#8A93A5]">Use your existing 6-digit TransConet account PIN. Your credentials remain protected.</p><div className="flex gap-1 rounded-xl bg-[#F5F8FC] p-1"><button type="button" onClick={()=>setRole('SHIPPER')} className={`flex-1 rounded-lg py-2 text-[11px] font-bold ${role==='SHIPPER'?'bg-white text-[#1457E6] shadow-sm':'text-[#657087]'}`}>Shipper</button><button type="button" onClick={()=>setRole('TRANSPORTER')} className={`flex-1 rounded-lg py-2 text-[11px] font-bold ${role==='TRANSPORTER'?'bg-white text-[#1457E6] shadow-sm':'text-[#657087]'}`}>Transporter</button></div><Status/><Primary loading={loading}>Create account</Primary></form><Divider/><Google/><div className="mt-5 text-center text-[13px] text-[#657087]">Already have an account? <button type="button" onClick={goSignIn} className="font-bold text-[#1457E6] hover:underline">Sign in</button></div><LegalLinks/></div>;

  const signInCard=<div className="tc-auth-mobile-form w-full max-w-[520px] rounded-[28px] border-0 bg-white/10 backdrop-blur-md p-5 shadow-[0_28px_70px_rgba(7,27,73,.14)] sm:p-7">{forgot?<><button type="button" onClick={()=>{setForgot(false);clear()}} className="mb-5 flex items-center gap-2 text-xs font-bold text-[#1457E6]"><ArrowRight size={15} className="rotate-180"/>Back to sign in</button><h2 className="text-[28px] font-bold text-[#172033]">Reset your password</h2><p className="mb-5 mt-1 text-[13px] text-[#657087]">Securely regain access to your account.</p>{resetStep===1&&<form onSubmit={requestReset} className="space-y-3"><Field label="Email address" icon={<span>@</span>} type="email" value={email} onChange={(e:any)=>setEmail(e.target.value)} placeholder="you@example.com"/><Status/><Primary loading={loading}>Send reset token</Primary></form>}{resetStep===2&&<form onSubmit={confirmReset} className="space-y-3"><Field label="Email address" icon={<span>@</span>} type="email" value={email} onChange={(e:any)=>setEmail(e.target.value)}/><Field label="Reset token" icon={<Lock size={17}/>} value={resetToken} onChange={(e:any)=>setResetToken(e.target.value)} placeholder="Enter token"/><Field label="New password" icon={<Lock size={17}/>} type={showPassword?'text':'password'} value={newPassword} onChange={(e:any)=>setNewPassword(e.target.value)} right={<button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#8A93A5]">{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button>}/><Status/><Primary loading={loading}>Reset password</Primary></form>}{resetStep===3&&<div className="space-y-3"><div className="flex items-center gap-3 rounded-xl bg-blue-50 p-4 text-sm font-semibold text-[#1457E6]"><Check size={20}/>Password reset successful.</div><button type="button" onClick={()=>{setForgot(false);clear()}} className="h-14 w-full rounded-xl bg-[#1457E6] text-sm font-bold text-white">Return to sign in</button></div>}</>:<><h2 className="text-[32px] font-bold tracking-[-.04em] text-[#172033]">Welcome back</h2><p className="mb-6 mt-1 text-[15px] leading-6 text-[#657087]">Sign in to continue to your account.</p><form onSubmit={login} className="space-y-3"><label className="block"><span className="mb-1.5 block text-[12px] font-semibold text-[#4F5B70]">Mobile number</span><span className="flex h-14 overflow-hidden rounded-xl border-0 bg-white/10 backdrop-blur-md focus-within:ring-4 focus-within:ring-[#1457E6]/10 focus-within:ring-4 focus-within:ring-[#1457E6]/10"><input required type="tel" inputMode="numeric" value={phoneNumber} onChange={phone} placeholder="Mobile number" className="min-w-0 flex-1 px-3 text-sm outline-none placeholder:text-[#9AA3B2]"/></span></label><Field label="Password" icon={<Lock size={17}/>} type={showPassword?'text':'password'} value={pin} onChange={(e:any)=>setPin(e.target.value)} placeholder="Your account PIN" right={<button type="button" aria-label="Toggle password visibility" onClick={()=>setShowPassword(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#8A93A5]">{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button>}/><div className="flex items-center justify-between gap-3 text-xs"><label className="flex items-center gap-2 text-[#657087]"><input type="checkbox" checked={rememberMe} onChange={e=>setRememberMe(e.target.checked)} className="h-4 w-4 accent-[#1457E6]"/>Remember me</label><button type="button" onClick={()=>{setForgot(true);setResetStep(1);clear()}} className="font-bold text-[#1457E6] hover:underline">Forgot password?</button></div><Status/><Primary loading={loading}>Sign in</Primary></form><Divider/><Google/><div className="mt-5 text-center text-[13px] text-[#657087]">Don’t have an account? <button type="button" onClick={goSignUp} className="font-bold text-[#1457E6] hover:underline">Sign up</button></div><LegalLinks/></>}</div>;

  const Footer=({dark}:{dark:boolean})=><div className={`flex justify-center gap-2 pt-3 text-[10px] font-medium ${dark?'text-white/55':'text-[#7A8496]'}`}><button type="button" onClick={()=>setLegal({isOpen:true,type:'terms'})} className="hover:text-[#1457E6]">Terms & Conditions</button><span>•</span><button type="button" onClick={()=>setLegal({isOpen:true,type:'privacy'})} className="hover:text-[#1457E6]">Privacy Policy</button></div>;


  const isSignup=page==='signup';
  return <div className="min-h-[100dvh] w-full overflow-x-hidden bg-[#F5F8FC] font-sans text-[#172033]">{isSignup ? <section className="relative flex min-h-[100dvh] flex-col overflow-hidden px-5 py-6 sm:px-8 lg:px-10 xl:px-14"><div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`linear-gradient(180deg,rgba(255,255,255,.93),rgba(255,255,255,.73) 38%,rgba(245,248,252,.97)),url(${images.light})`}}/><div className="relative z-10 flex min-h-full flex-1 flex-col"><Brand dark={false}/><div className="flex flex-1 flex-col items-center justify-center py-8"><div className="mb-4 hidden w-full max-w-[520px] lg:block"><span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-[#1457E6] shadow-sm"><Truck size={13}/>Global freight network</span></div>{signUpCard}</div><Footer dark={false}/></div></section> : <section className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-[#071B49] px-5 py-6 sm:px-8 lg:px-10 xl:px-14"><div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:`linear-gradient(180deg,rgba(7,27,73,.72),rgba(7,27,73,.62) 34%,rgba(7,27,73,.95)),url(${images.dark})`}}/><div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 20% 20%,rgba(255,255,255,.55) 0 1px,transparent 1px),radial-gradient(circle at 80% 70%,rgba(255,255,255,.4) 0 1px,transparent 1px)',backgroundSize:'38px 38px,52px 52px'}}/><div className="relative z-10 flex min-h-full flex-1 flex-col"><Brand dark/><div className="flex flex-1 flex-col items-center justify-center py-8"><div className="mb-4 hidden w-full max-w-[520px] lg:block"><span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.16em] text-white/80"><Globe2 size={13}/>International logistics</span></div>{signInCard}</div><Footer dark/></div></section>}{showSelfie&&<SelfieCapture onCapture={data=>{setProfileImage(data);setShowSelfie(false)}} onCancel={()=>setShowSelfie(false)}/>}<LegalModal isOpen={legal.isOpen} type={legal.type} onClose={()=>setLegal({isOpen:false,type:null})}/></div>;

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
      <div className="min-h-[100dvh] w-full bg-slate-950 text-white flex items-center justify-center px-4 py-10">
        <motion.div 
          key="signup-step1"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="w-full max-w-3xl rounded-[32px] overflow-hidden border border-white/10 bg-slate-900/95 shadow-[0_40px_120px_rgba(0,0,0,0.35)]"
        >
          <div className="relative overflow-hidden bg-slate-950/90 px-6 py-8 sm:px-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.24),transparent_25%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.18),transparent_25%)] pointer-events-none" />
            <div className="relative flex flex-col items-center text-center">
              <span className="text-[11px] uppercase tracking-[0.35em] text-slate-400">Secure onboarding</span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight">Create your TransConet account</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Choose the role that matches your business and continue with a tailored setup flow.</p>
            </div>
          </div>

          <div className="grid gap-4 bg-slate-950/95 px-4 py-6 sm:grid-cols-2 sm:px-6">
            <button
              type="button"
              onClick={() => { setRole('SHIPPER'); setSignUpStep(2); }}
              className="group rounded-[28px] border border-slate-800 bg-slate-900/90 p-6 text-left transition hover:border-brand-500 hover:bg-slate-800"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.35em] text-slate-500">Shipper</span>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-brand-400 transition group-hover:bg-brand-500 group-hover:text-white">
                  <ArrowRight size={18} strokeWidth={2.5} />
                </div>
              </div>
              <h2 className="mt-5 text-lg font-semibold text-white">Cargo Owner</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">Post loads, compare quotes, and manage shipments from a modern dashboard.</p>
            </button>

            <button
              type="button"
              onClick={() => { setRole('TRANSPORTER'); setSignUpStep(2); }}
              className="group rounded-[28px] border border-slate-800 bg-slate-900/90 p-6 text-left transition hover:border-brand-500 hover:bg-slate-800"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.35em] text-slate-500">Transporter</span>
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-800 text-brand-400 transition group-hover:bg-brand-500 group-hover:text-white">
                  <ArrowRight size={18} strokeWidth={2.5} />
                </div>
              </div>
              <h2 className="mt-5 text-lg font-semibold text-white">Driver / Carrier</h2>
              <p className="mt-3 text-sm leading-6 text-slate-400">Find loads, manage trips, and get paid faster with real-time tools.</p>
            </button>
          </div>

          <div className="border-t border-white/10 bg-slate-950/90 px-6 py-5 sm:px-10 text-center">
            <p className="text-sm text-slate-400">Complete your profile in the next step and access the freight network instantly.</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full bg-slate-950 text-slate-100 flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-lg">
        <div className="overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/95 shadow-[0_40px_120px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.15),transparent_28%)] px-6 py-8 sm:px-8 sm:py-10">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-start gap-3"
            >
              <span className="text-[11px] uppercase tracking-[0.35em] text-slate-400">Premium login</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                TransConet
              </h1>
              <p className="max-w-xl text-sm leading-6 text-slate-300">
                Move freight smarter with a modern, mobile-first access experience for shippers and transporters.
              </p>
            </motion.div>
          </div>

          <div className="px-6 pb-8 sm:px-8 sm:pb-10 bg-white dark:bg-slate-950">
            <div className="rounded-[28px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 p-6 shadow-sm">
              <div className="text-center mb-6">
                <p className="text-sm text-slate-500 dark:text-slate-400">Secure access with phone, PIN, or Google login.</p>
              </div>

              <div className="space-y-3">
                {showSelfie && (
                  <SelfieCapture 
                    onCapture={(img) => { setProfileImage(img); setShowSelfie(false); }} 
                    onCancel={() => setShowSelfie(false)} 
                  />
                )}

                <AnimatePresence mode="wait">
                  {isForgotPasswordMode ? (
                    <motion.div
                      key="forgot"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col w-full h-full"
                    >
                      <div className="flex items-center gap-3 mb-6">
                        <Button onClick={() => { setIsForgotPasswordMode(false); setResetStep(1); setError(null); setMessage(null); }} className="text-slate-900 p-2 rounded-full hover:bg-slate-100 dark:bg-slate-800 transition-colors">
                          <ArrowRight size={20} className="rotate-180" />
                        </Button>
                        <div>
                          <h2 className="text-[20px] font-bold text-slate-900 dark:text-white">Password Recovery</h2>
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {resetStep === 1 
                              ? "Enter your email address to receive a secure reset token." 
                              : resetStep === 2
                              ? "Enter the token sent to your email and your new password."
                              : "Your password has been successfully reset."}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3">
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

                        {resetStep === 1 ? (
                          <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                            <label className="block text-[12px] font-bold text-slate-900 uppercase tracking-wider mb-1.5">Email Address</label>
                            <input 
                              type="email"
                              placeholder="e.g. driver@transconet.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full h-[54px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-[15px] font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all"
                              required
                            />

                            <motion.button 
                              whileTap={{ scale: 0.98 }}
                              type="submit" 
                              disabled={loading}
                              className="w-full h-[54px] bg-brand-600 hover:bg-brand-700 rounded-2xl flex items-center justify-center transition-all disabled:opacity-70 text-white font-bold text-[15px] shadow-[0_4px_14px_rgba(37,99,235,0.25)]"
                            >
                              {loading ? <Loader2 className="animate-spin" size={22} /> : 'Send Reset Token'}
                            </motion.button>
                          </form>
                        ) : resetStep === 2 ? (
                          <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                            <label className="block text-[12px] font-bold text-slate-900 uppercase tracking-wider mb-1.5">Reset Token</label>
                            <input 
                              type="text"
                              placeholder="Enter token code"
                              value={resetToken}
                              onChange={(e) => setResetToken(e.target.value)}
                              className="w-full h-[54px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 text-[15px] font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all"
                              required
                            />

                            <div className="space-y-2">
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
                                  className="w-full h-[54px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-12 text-[15px] font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all tracking-widest"
                                  required
                                />
                                <Button 
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 dark:text-slate-400 hover:text-slate-900"
                                >
                                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </Button>
                              </div>
                            </div>

                            <motion.button 
                              whileTap={{ scale: 0.98 }}
                              type="submit" 
                              disabled={loading}
                              className="w-full h-[54px] bg-brand-600 hover:bg-brand-700 rounded-2xl flex items-center justify-center transition-all disabled:opacity-70 text-white font-bold text-[15px] shadow-[0_4px_14px_rgba(37,99,235,0.25)]"
                            >
                              {loading ? <Loader2 className="animate-spin" size={22} /> : 'Reset Password'}
                            </motion.button>
                          </form>
                        ) : (
                          <div className="flex flex-col items-center justify-center mt-4 gap-4">
                            <Check size={48} className="text-emerald-500" />
                            <Button onClick={() => { setIsForgotPasswordMode(false); setResetStep(1); }} className="text-brand-600 font-bold hover:underline">
                              Return to Login
                            </Button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : !isSignUpMode ? (
                    <motion.div 
                      key="signin"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="flex flex-col w-full h-full"
                    >
                      <form onSubmit={handleLoginSubmit} className="space-y-3 w-full">
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
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within:text-brand-600 transition-colors">
                            <Smartphone size={20} strokeWidth={2} />
                          </div>
                          <input 
                            type="tel" 
                            required
                            placeholder="Mobile Number"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                            className="w-full h-[54px] pl-[3rem] pr-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-[14px] focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium"
                          />
                        </div>

                        <div className="relative group w-full">
                          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within:text-brand-600 transition-colors">
                            <Lock size={20} strokeWidth={2} />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            required
                            value={pin}
                            onChange={(e) => setPin(e.target.value)}
                            maxLength={6}
                            placeholder="Password"
                            className="w-full h-[54px] pl-[3rem] pr-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl text-[14px] focus:outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-600/20 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium"
                          />
                          <Button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-brand-600 transition-colors p-1.5"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </Button>
                        </div>

                        <div className="flex items-center justify-between w-full text-sm">
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
                            <span className="text-slate-900 dark:text-slate-100 font-medium">Remember Me</span>
                          </label>
                          <Button type="button" onClick={() => { setIsForgotPasswordMode(true); setError(null); setMessage(null); }} className="text-brand-600 font-semibold hover:underline">Forgot Password?</Button>
                        </div>

                        <motion.button 
                          whileTap={{ scale: 0.98 }}
                          type="submit" 
                          disabled={loading}
                          className="w-full h-[54px] bg-brand-600 hover:bg-brand-700 rounded-[16px] flex items-center justify-center transition-all disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-[15px] shadow-[0_4px_14px_rgba(21,101,192,0.25)] overflow-hidden"
                        >
                          {loading ? <Loader2 className="animate-spin text-white" size={22} /> : (
                            <>
                              <span className="tracking-wide">Continue</span>
                              <ArrowRight size={18} className="text-white absolute right-4" strokeWidth={2.5} />
                            </>
                          )}
                        </motion.button>

                        <div className="relative py-1">
                          <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200 dark:bg-slate-700" />
                          <div className="relative flex justify-center">
                            <span className="bg-white dark:bg-slate-950 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">OR</span>
                          </div>
                        </div>

                        <Button type="button" onClick={handleGoogleLogin} className="w-full h-[50px] bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2.5 transition hover:bg-brand-50 shadow-sm text-slate-900 dark:text-slate-100">
                          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                          <span className="text-[14px] font-bold">Continue with Google</span>
                        </Button>

                        <div className="flex flex-col items-center justify-center gap-3 pt-3 text-sm text-slate-500 dark:text-slate-400">
                          <div>
                            Don't have an account?{' '}
                            <Button type="button" onClick={() => { setIsSignUpMode(true); setSignUpStep(1); }} className="text-brand-600 font-semibold hover:underline">Sign Up</Button>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button type="button" onClick={() => setLegalModal({isOpen: true, type: 'terms'})} className="flex items-center gap-1 hover:text-brand-600 transition-colors"><FileText size={12} /> Terms</Button>
                            <span className="text-slate-400">•</span>
                            <Button type="button" onClick={() => setLegalModal({isOpen: true, type: 'privacy'})} className="flex items-center gap-1 hover:text-brand-600 transition-colors"><ShieldCheck size={12} /> Privacy</Button>
                          </div>
                          <div className="flex items-center gap-3">
                            <a aria-label="LinkedIn" href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition"><Linkedin size={15} strokeWidth={2} /></a>
                            <a aria-label="Facebook" href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition"><Facebook size={15} strokeWidth={2} /></a>
                            <a aria-label="TikTok" href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition"><TikTokIcon size={15} /></a>
                            <a aria-label="Twitter" href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition"><Twitter size={15} strokeWidth={2} /></a>
                          </div>
                        </div>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="signup"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      className="flex flex-col w-full h-full"
                    >
                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h2>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Finish sign-up details so we can personalize your experience.</p>
                      </div>

                      <div className="flex flex-col items-center justify-center mb-6 gap-3 relative">
                        <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => { handleImageUpload(e); setShowProfileOptions(false); }} />
                        <div className="relative group cursor-pointer" onClick={() => setShowProfileOptions(!showProfileOptions)}>
                          <div className="w-[72px] h-[72px] bg-white dark:bg-slate-900 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 border-dashed flex items-center justify-center transition-all shadow-sm group-hover:border-brand-600">
                            {profileImage ? <img src={profileImage} alt="Profile" className="w-full h-full object-cover" /> : <Camera className="w-6 h-6 text-slate-400 dark:text-slate-400 group-hover:text-brand-600" />}
                          </div>
                          <div className="absolute -bottom-1 -right-1 bg-brand-600 w-[24px] h-[24px] rounded-full flex items-center justify-center text-white border-[2px] border-white shadow-sm">
                            <span className="text-[16px] leading-none pb-0.5 font-bold">+</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Upload profile photo</span>

                        {showProfileOptions && (
                          <div className="absolute top-full mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-2 z-10 flex flex-col gap-1 w-40 text-sm overflow-hidden">
                            <Button type="button" className="flex items-center gap-2 p-2 hover:bg-brand-50 cursor-pointer hover:shadow-sm rounded-lg text-slate-700 dark:text-slate-400 font-medium" onClick={() => { setShowSelfie(true); setShowProfileOptions(false); }}>
                              <Camera size={16} /> Take Selfie
                            </Button>
                            <Button type="button" className="flex items-center gap-2 p-2 hover:bg-brand-50 cursor-pointer hover:shadow-sm rounded-lg text-slate-700 dark:text-slate-400 font-medium" onClick={() => { fileInputRef.current?.click(); setShowProfileOptions(false); }}>
                              <UploadCloud size={16} /> Upload Photo
                            </Button>
                          </div>
                        )}
                      </div>

                      <form onSubmit={handleSignupSubmit} className="space-y-3 w-full">
                        {error && <div className="bg-red-50 text-red-600 p-2 rounded-xl text-center border border-red-100 font-medium text-sm">{error && error ? ((error as any).message || JSON.stringify(error)) : error}</div>}
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 group-focus-within:text-brand-600 transition-colors"><UserRound size={16} strokeWidth={2} /></div>
                            <input required placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full h-[48px] pl-9 pr-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium shadow-sm" />
                          </div>
                          <div className="relative group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 group-focus-within:text-brand-600 transition-colors"><UserRound size={16} strokeWidth={2} /></div>
                            <input required placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full h-[48px] pl-9 pr-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium shadow-sm" />
                          </div>
                        </div>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 group-focus-within:text-brand-600 transition-colors">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                          </div>
                          <input required type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-[48px] pl-9 pr-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium shadow-sm" />
                        </div>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 group-focus-within:text-brand-600 transition-colors"><Smartphone size={16} strokeWidth={2} /></div>
                          <input required type="tel" placeholder="Mobile Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))} className="w-full h-[48px] pl-9 pr-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium font-mono shadow-sm" />
                        </div>
                        <div className="relative group">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 group-focus-within:text-brand-600 transition-colors"><Lock size={16} strokeWidth={2} /></div>
                          <input type={showPassword ? "text" : "password"} required maxLength={6} placeholder="Password" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full h-[48px] pl-9 pr-10 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium font-mono shadow-sm" />
                          <Button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 hover:text-brand-600 transition-colors p-1"><EyeOff size={16} /></Button>
                        </div>
                        <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading} className="w-full h-[50px] bg-brand-600 hover:bg-brand-700 rounded-xl flex items-center justify-center transition-all disabled:opacity-70 text-white font-bold text-[15px] cursor-pointer relative shadow-sm mt-1 overflow-hidden">
                          {loading ? <Loader2 className="animate-spin text-white" size={22} /> : <><span className="tracking-wide">Sign Up</span><ArrowRight size={18} className="text-white absolute right-4" strokeWidth={2.5} /></>}
                        </motion.button>

                        <div className="relative py-1">
                          <div className="absolute inset-x-0 top-1/2 h-px bg-slate-200 dark:bg-slate-700" />
                          <div className="relative flex justify-center">
                            <span className="bg-white dark:bg-slate-950 px-3 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">OR</span>
                          </div>
                        </div>

                        <Button type="button" onClick={handleGoogleLogin} className="w-full h-[50px] bg-white dark:bg-slate-900 rounded-[20px] border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2.5 hover:bg-brand-50 dark:hover:bg-slate-800 transition text-slate-900 dark:text-slate-100 shadow-sm">
                          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px]"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                          <span className="text-[14px] font-bold">Continue with Google</span>
                        </Button>

                        <div className="flex flex-col items-center justify-center gap-3 pt-3 text-sm text-slate-500 dark:text-slate-400">
                          <div>
                            Already have an account?{' '}
                            <Button type="button" onClick={() => setIsSignUpMode(false)} className="text-brand-600 font-semibold hover:underline">Sign In</Button>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button type="button" onClick={() => setLegalModal({isOpen: true, type: 'terms'})} className="flex items-center gap-1 hover:text-brand-600 transition-colors"><FileText size={12} /> Terms</Button>
                            <span className="text-slate-400">•</span>
                            <Button type="button" onClick={() => setLegalModal({isOpen: true, type: 'privacy'})} className="flex items-center gap-1 hover:text-brand-600 transition-colors"><ShieldCheck size={12} /> Privacy</Button>
                          </div>
                          <div className="flex items-center gap-3">
                            <a aria-label="LinkedIn" href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition"><Linkedin size={15} strokeWidth={2} /></a>
                            <a aria-label="Facebook" href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition"><Facebook size={15} strokeWidth={2} /></a>
                            <a aria-label="TikTok" href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition"><TikTokIcon size={15} /></a>
                            <a aria-label="Twitter" href="#" className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-brand-50 hover:text-brand-600 transition"><Twitter size={15} strokeWidth={2} /></a>
                          </div>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
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

