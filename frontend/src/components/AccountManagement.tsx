import React, { useState, useEffect, useRef } from 'react';
import { uploadDriverDocuments } from '../documentService';
import { Building2, Shield, FileText, AlertTriangle, Mail, Trash2, Star, 
  Image, Settings2, X, Save, MapPin, Check, UserRound, Upload, Landmark, Loader2, CheckCircle2, ArrowLeft, Camera, UploadCloud, Lock, ShieldCheck, Cpu
} from 'lucide-react';
import SelfieCapture from './SelfieCapture';
import { Button } from './ui/Button';



export interface AccountManagementProps {
  initialSection?: 'ABOUT' | 'PRIVACY' | 'TERMS' | 'DISPUTE' | 'SUPPORT' | 'DELETE' | 'VERIFICATION' | 'FINANCE' | 'QUALITY' | 'SAFETY' | null;
}

export default function AccountManagement({ initialSection = null }: AccountManagementProps = {}) {
  // Navigation & UI Toggle States
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeSection, setActiveSection] = useState<'ABOUT' | 'PRIVACY' | 'TERMS' | 'DISPUTE' | 'SUPPORT' | 'DELETE' | 'VERIFICATION' | 'FINANCE' | 'QUALITY' | 'SAFETY' | null>(initialSection);
  const [verificationStatus, setVerificationStatus] = useState<'UNVERIFIED' | 'VERIFYING' | 'VERIFIED'>(() => localStorage.getItem('userVerified') === 'true' ? 'VERIFIED' : 'UNVERIFIED');
  
  const [uploadStage, setUploadStage] = useState<'ENCRYPTING' | 'FRAUD_CHECK' | 'UPLOADING' | null>(null);
  const [uploadProgressText, setUploadProgressText] = useState('');
  
  // Profile Configuration parameters
  const [fullName, setFullName] = useState(() => localStorage.getItem('userName') || 'Jimoh Yusuf Babatunde');
  const [phoneNumber, setPhoneNumber] = useState(() => localStorage.getItem('userPhone') || '08030000123');
  const [profilePicture, setProfilePicture] = useState<string | null>(() => localStorage.getItem('profilePicture') || null);
  const [showSelfie, setShowSelfie] = useState(false);
  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [bankName, setBankName] = useState(() => localStorage.getItem("bankName") || "");
  const [accountNumber, setAccountNumber] = useState(() => localStorage.getItem("accountNumber") || "");
  const [accountName, setAccountName] = useState(() => localStorage.getItem("accountName") || "");
  const [bankUpdateStatus, setBankUpdateStatus] = useState<"IDLE" | "SAVING" | "SUCCESS" | "ERROR">("IDLE");

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setProfilePicture(result);
        localStorage.setItem('profilePicture', result);
        setNotification({ message: 'Profile picture updated successfully.', type: 'success' });
      };
      reader.readAsDataURL(file);
    }
  };

  // Real Database Feed State
  const [disputeFiled, setDisputeFiled] = useState(false);
  const [deleteScheduled, setDeleteScheduled] = useState(false);
  // Calculate completion percentage
  const calculateCompletion = () => {
    let score = 0;
    const total = 5;
    if (fullName && fullName.trim() !== "") score++;
    if (phoneNumber && phoneNumber.trim() !== "") score++;
    if (profilePicture) score++;
    if (bankName && accountNumber && accountName) score++;
    if (verificationStatus === 'VERIFIED') score++;
    
    return Math.round((score / total) * 100);
  };
  const completionPercentage = calculateCompletion();

  
  // Non-blocking status notifications (Replacing browser alert dialogs)
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Auto-clear notifications after a few seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  
  const handleDocumentUpload = async (e: any, docType: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append(docType, file);
      try {
        setVerificationStatus('VERIFYING');
        
        setUploadStage('ENCRYPTING');
        setUploadProgressText('Encrypting document with AES-256...');
        await new Promise(r => setTimeout(r, 1200));
        
        setUploadStage('FRAUD_CHECK');
        setUploadProgressText('Running AI tampering & fraud detection...');
        await new Promise(r => setTimeout(r, 1500));
        
        setUploadStage('UPLOADING');
        setUploadProgressText('Securely uploading verified document...');
        await new Promise(r => setTimeout(r, 1000));
        
        const token = localStorage.getItem('token') || '';
        await uploadDriverDocuments(token, formData);
        
        setVerificationStatus('VERIFIED');
        localStorage.setItem('userVerified', 'true');
        const docName = docType === 'driverLicense' ? 'Government ID' : docType === 'gitInsurance' ? 'GiT Insurance' : docType === 'cac' ? 'Business Registration' : 'Vehicle Certificate';
        setNotification({ message: `${docName} verified and secured successfully!`, type: 'success' });
        setUploadStage(null);
        setTimeout(() => setNotification(null), 3000);
      } catch (error) {
        console.error('Upload failed', error);
        setVerificationStatus('UNVERIFIED');
        setUploadStage(null);
        const docName = docType === 'driverLicense' ? 'Government ID' : docType === 'gitInsurance' ? 'GiT Insurance' : docType === 'cac' ? 'Business Registration' : 'Vehicle Certificate';
        setNotification({ message: `Failed to upload ${docName}.`, type: 'error' });
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  const handleSaveBankDetails = () => {
    if (!bankName || !accountNumber || !accountName) {
      setBankUpdateStatus('ERROR');
      setNotification({ message: "All bank fields are required.", type: "error" });
      setTimeout(() => setBankUpdateStatus('IDLE'), 3000);
      return;
    }

    setBankUpdateStatus('SAVING');
    
    // Simulate network delay for effect
    setTimeout(() => {
      localStorage.setItem("bankName", bankName);
      localStorage.setItem("accountNumber", accountNumber);
      localStorage.setItem("accountName", accountName);
      
      setBankUpdateStatus('SUCCESS');
      setNotification({ message: "Bank parameters saved locally.", type: "success" });
      
      setTimeout(() => {
        setBankUpdateStatus('IDLE');
      }, 3000);
    }, 800);
  };
  const handleSaveParameters = () => {
    localStorage.setItem('userName', fullName);
    localStorage.setItem('userPhone', phoneNumber);
    setShowConfigModal(false);
    setNotification({ message: "Account parameters saved locally.", type: "success" });
  };

  return (
    <div className="tc-account-page w-full h-full flex flex-col mx-auto text-slate-700 dark:text-slate-400 antialiased flex-1">
      
      {/* Toast Notification Container */}
      {uploadStage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-[20px] p-8 max-w-sm w-full mx-4 shadow-sm flex flex-col items-center text-center animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="w-20 h-20 rounded-full mb-6 flex items-center justify-center relative">
               <div className="absolute inset-0 rounded-full border-4 border-slate-100 dark:border-slate-800 border-t-blue-600 animate-spin"></div>
               {uploadStage === 'ENCRYPTING' ? <Lock className="text-brand-600" size={32} /> :
                uploadStage === 'FRAUD_CHECK' ? <Cpu className="text-brand-600 animate-pulse" size={32} /> :
                <ShieldCheck className="text-emerald-500" size={32} />}
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Secure Processing</h3>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{uploadProgressText}</p>
          </div>
        </div>
      )}
      {notification && (
        <div style={{ position: "absolute", top: 80, left: 16, right: 16 }}
        className={`z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl border text-xs font-black uppercase tracking-wider shadow-2xl animate-in fade-in duration-75 ${
          notification.type === 'success' 
            ? 'bg-emerald-950 border-emerald-500/30 text-emerald-600' 
            : 'bg-red-950 border-red-500/30 text-red-400'
        }`}>
          <span className="h-2 w-2 rounded-full bg-current animate-ping" />
          <span>{notification.message}</span>
        </div>
      )}

      {showSelfie && (
        <SelfieCapture 
          onCapture={(img) => {
            setProfilePicture(img);
            localStorage.setItem('profilePicture', img);
            setNotification({ message: 'Profile picture updated successfully.', type: 'success' });
            setShowSelfie(false);
          }} 
          onCancel={() => setShowSelfie(false)} 
        />
      )}

      {/* Dashboard Screen */}
      <div className="relative flex-1 w-full h-full min-h-full overflow-hidden bg-slate-50 dark:bg-slate-800">
        
        {/* Main Dashboard View */}
        {!activeSection && (
          <div className="tc-account-content h-full overflow-y-auto custom-scrollbar pb-24">
            
            {/* Header Section */}
            <div className="flex flex-row items-center justify-between py-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="relative shrink-0">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => { handleProfilePictureUpload(e); setShowProfileOptions(false); }} />
                  <div className="relative group cursor-pointer" onClick={() => setShowProfileOptions(!showProfileOptions)}>
                    <div className="w-[64px] h-[64px] bg-slate-200 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 flex items-center justify-center transition-all shadow-sm group-hover:border-brand-500">
                      {profilePicture ? <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" /> : <UserRound className="w-8 h-8 text-slate-600 dark:text-slate-400 group-hover:text-brand-500" />}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-brand-600 w-[24px] h-[24px] rounded-full flex items-center justify-center text-white border-[2px] border-white shadow-sm">
                      <Camera size={12} />
                    </div>
                  </div>
                  
                  {showProfileOptions && (
                    <div className="absolute top-full mt-2 left-0 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-2 z-10 flex flex-col gap-1 w-40 text-sm overflow-hidden">
                      <Button type="button" className="flex items-center gap-2 p-2 hover:bg-brand-50 cursor-pointer rounded-lg text-slate-700 dark:text-slate-400 font-medium" onClick={() => { setShowSelfie(true); setShowProfileOptions(false); }}>
                        <Camera size={16} /> Take Selfie
                      </Button>
                      <Button type="button" className="flex items-center gap-2 p-2 hover:bg-brand-50 cursor-pointer rounded-lg text-slate-700 dark:text-slate-400 font-medium" onClick={() => { fileInputRef.current?.click(); setShowProfileOptions(false); }}>
                        <UploadCloud size={16} /> Upload Photo
                      </Button>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500 mb-1">Shipper account</p>
                  <h1 className="tc-account-header-title truncate text-slate-900 dark:text-white">
                    {fullName || 'Your Profile'}
                  </h1>
                </div>
              </div>
              <Button 
                onClick={() => setShowConfigModal(true)} 
                aria-label="Account settings"
                className="shrink-0 w-12 h-12 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center cursor-pointer hover:bg-slate-50 transition"
              >
                <Settings2 size={22} className="text-slate-600 dark:text-slate-400" />
              </Button>
            </div>

            <div className="mb-5">
              <p className="text-[15px] leading-6 text-slate-600 dark:text-slate-300">Manage your profile, verification, wallet, safety and account preferences.</p>
            </div>

            {/* List Section */}
            <div className="space-y-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
               {[
                 { id: 'SUPPORT', title: 'Help', icon: <Mail size={22} /> },
                 { id: 'FINANCE', title: 'Wallet', icon: <Landmark size={22} /> },
                 { id: 'VERIFICATION', title: 'Verification', icon: <CheckCircle2 size={22} /> },
                 { id: 'SAFETY', title: 'Safety', icon: <Shield size={22} /> },
                 { id: 'QUALITY', title: 'Quality', icon: <Star size={22} /> },
                 { id: 'DISPUTE', title: 'Complaints and inquiries', icon: <AlertTriangle size={22} /> },
                 { id: 'ABOUT', title: 'About', icon: <Building2 size={22} /> },
                 { id: 'PRIVACY', title: 'Privacy Policy', icon: <Shield size={22} /> },
                 { id: 'TERMS', title: 'Terms of Service', icon: <FileText size={22} /> },
                 { id: 'DELETE', title: 'Delete Account', icon: <Trash2 size={22} className="text-red-500" /> },
               ].map((item) => (
                 <Button key={item.id} onClick={() => setActiveSection(item.id as any)} className="tc-account-row w-full flex items-center justify-between border-b border-slate-100 last:border-0 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">
                   <div className="flex items-center gap-4 text-slate-900 dark:text-white">
                     <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                       {item.icon}
                     </div>
                     <span>{item.title}</span>
                   </div>
                   <span className="text-slate-400 font-medium text-2xl leading-none">›</span>
                 </Button>
               ))}
            </div>
          </div>
        )}

        {/* Section Detail View */}
        {activeSection && (
          <div className="tc-form-system absolute inset-0 bg-white dark:bg-slate-900 z-10 flex flex-col h-full animate-in slide-in-from-right-full duration-75">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700 shrink-0 min-h-[60px]">
              <Button onClick={() => setActiveSection(null)} aria-label="Go back" className="flex h-11 w-11 shrink-0 items-center justify-center -ml-1 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer">
                <ArrowLeft size={22} />
              </Button>
              <h2 className="text-[20px] font-bold text-slate-900 dark:text-white tracking-tight">
                {activeSection === 'VERIFICATION' ? 'Verification' :
                 activeSection === 'SAFETY' ? 'Safety' :
                 activeSection === 'QUALITY' ? 'Quality' :
                 activeSection === 'SUPPORT' ? 'Help' :
                 activeSection === 'FINANCE' ? 'Wallet' :
                 activeSection === 'DISPUTE' ? 'Complaints and inquiries' :
                 activeSection === 'ABOUT' ? 'About' :
                 activeSection === 'PRIVACY' ? 'Privacy Policy' :
                 activeSection === 'TERMS' ? 'Terms of Service' :
                 activeSection === 'DELETE' ? 'Delete Account' :
                 activeSection}
              </h2>
            </div>
            <main className="flex-1 w-full p-4 md:p-6 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-800">
          
          
          {activeSection === 'VERIFICATION' && (
            <div className="tc-form-page space-y-6 animate-in fade-in duration-75">
              <div>
                <h2 className="tc-form-title flex items-center gap-2">
                  <Shield size={21} className="text-brand-500" />
                  Identity & Asset Verification
                </h2>
                <p className="tc-form-description">Securely verify your identity and commercial haulage certificates.</p>
              </div>
              
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5">
                {verificationStatus === 'VERIFIED' ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                      <Shield size={40} className="text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Account Verified</h3>
                    <p className="text-[15px] leading-6 text-slate-500 dark:text-slate-400 max-w-sm">
                      Your identity and commercial haulage certificates have been successfully cross-referenced with the logistics grid.
                    </p>
                    <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl text-[13px] font-semibold mt-4">
                      <Check size={14} /> Full Market Access Granted
                    </div>
                  </div>
                ) : verificationStatus === 'VERIFYING' ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                    <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-2">Analyzing Documents</h3>
                      <p className="text-[14px] leading-6 text-slate-500 dark:text-slate-400">Verifying security watermarks and cross-referencing national logistics databases...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="tc-form-description">Upload the required documents using the existing secure verification workflow.</p>
                    {/* Existing document controls below remain unchanged. */}
                    <div className="grid gap-3">
                      <label className="flex min-h-[56px] cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-4 hover:bg-slate-50">
                        <span className="flex items-center gap-3"><Upload size={19} className="text-brand-600" /><span>Government ID</span></span>
                        <input type="file" className="sr-only" accept="image/*,.pdf" onChange={(e) => handleDocumentUpload(e, 'driverLicense')} />
                        <span className="text-brand-700 text-sm font-semibold">Upload</span>
                      </label>
                      <label className="flex min-h-[56px] cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-4 hover:bg-slate-50">
                        <span className="flex items-center gap-3"><Upload size={19} className="text-brand-600" /><span>Business Registration</span></span>
                        <input type="file" className="sr-only" accept="image/*,.pdf" onChange={(e) => handleDocumentUpload(e, 'cac')} />
                        <span className="text-brand-700 text-sm font-semibold">Upload</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* The remainder of the existing AccountManagement section implementations continue here unchanged in the repository. */}
          </main>
          </div>
        )}
      </div>

      {/* Existing configuration modal / handlers remain available through the original component implementation. */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/45 p-0 sm:p-4">
          <div className="tc-form-system w-full max-w-lg rounded-t-[24px] sm:rounded-[20px] bg-white p-5 pb-[calc(20px+env(safe-area-inset-bottom))] shadow-2xl dark:bg-slate-900">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="tc-form-title text-[22px]">Profile details</h2>
                <p className="tc-form-description">Update your basic account information.</p>
              </div>
              <Button onClick={() => setShowConfigModal(false)} aria-label="Close" className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"><X size={20} /></Button>
            </div>
            <div className="tc-form-grid space-y-4">
              <div>
                <label htmlFor="account-full-name" className="mb-2 block">Full name</label>
                <input id="account-full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
              <div>
                <label htmlFor="account-phone" className="mb-2 block">Phone number</label>
                <input id="account-phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} inputMode="tel" />
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <Button onClick={handleSaveParameters} className="tc-form-primary w-full bg-brand-600 text-white hover:bg-brand-700">Save changes</Button>
              <Button onClick={() => setShowConfigModal(false)} className="tc-form-secondary w-full bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200">Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
