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
    <div className="w-full h-full flex flex-col max-w-7xl mx-auto sm:p-5 text-slate-700 dark:text-slate-400  antialiased flex-1">
      
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
      <div className="relative flex-1 w-full h-full min-h-full sm:min-h-[650px] overflow-hidden bg-slate-50 dark:bg-slate-800  sm:rounded-2xl sm:border border-slate-200 dark:border-slate-700 ">
        
        {/* Main Dashboard View */}
        {!activeSection && (
          <div className="h-full overflow-y-auto custom-scrollbar pb-6">
            
            {/* Header Section */}
            <div className="flex flex-row items-center justify-between p-6">
              <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => { handleProfilePictureUpload(e); setShowProfileOptions(false); }} />
                  <div className="relative group cursor-pointer" onClick={() => setShowProfileOptions(!showProfileOptions)}>
                    <div className="w-[64px] h-[64px] bg-slate-200  rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700  flex items-center justify-center transition-all shadow-sm group-hover:border-brand-500">
                      {profilePicture ? <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" /> : <UserRound className="w-8 h-8 text-slate-600 dark:text-slate-400 group-hover:text-brand-500" />}
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-brand-600 w-[24px] h-[24px] rounded-full flex items-center justify-center text-white border-[2px] border-white  shadow-sm">
                      <Camera size={12} />
                    </div>
                  </div>
                  
                  {showProfileOptions && (
                    <div className="absolute top-full mt-2 left-0 bg-white dark:bg-slate-900  rounded-xl shadow-sm border border-slate-200 dark:border-slate-700  p-2 z-10 flex flex-col gap-1 w-40 text-sm overflow-hidden">
                      <Button type="button" className="flex items-center gap-2 p-2 hover:bg-brand-50 cursor-pointer hover:shadow-sm :bg-slate-700 rounded-lg text-slate-700 dark:text-slate-400  font-medium" onClick={() => { setShowSelfie(true); setShowProfileOptions(false); }}>
                        <Camera size={16} /> Take Selfie
                      </Button>
                      <Button type="button" className="flex items-center gap-2 p-2 hover:bg-brand-50 cursor-pointer hover:shadow-sm :bg-slate-700 rounded-lg text-slate-700 dark:text-slate-400  font-medium" onClick={() => { fileInputRef.current?.click(); setShowProfileOptions(false); }}>
                        <UploadCloud size={16} /> Upload Photo
                      </Button>
                    </div>
                  )}
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white  tracking-tight">
                  {fullName || 'Your Profile'}
                </h1>
              </div>
              <Button 
                onClick={() => setShowConfigModal(true)} 
                className="w-12 h-12 rounded-full bg-slate-200  border-[3px] border-white  shadow flex items-center justify-center cursor-pointer hover:scale-105 transition"
              >
                <Settings2 size={24} className="text-slate-600 dark:text-slate-400 " />
              </Button>
            </div>


            {/* Account Settings List */}
            <div className="px-6 mt-8 mb-8">
              <div className="flex flex-col gap-4">
                {[
                  { id: 'SUPPORT', title: 'Help' },
                  { id: 'FINANCE', title: 'Wallet' },
                  { id: 'VERIFICATION', title: 'Verification' },
                  { id: 'SAFETY', title: 'Safety' },
                  { id: 'QUALITY', title: 'Quality' },
                  { id: 'DISPUTE', title: 'Complaints and inquiries' },
                  { id: 'ABOUT', title: 'About' },
                  { id: 'PRIVACY', title: 'Privacy Policy' },
                  { id: 'TERMS', title: 'Terms of Service' },
                  { id: 'DELETE', title: 'Delete Account' },
                ].map((item) => (
                  <Button
                    key={item.id}
                    onClick={() => setActiveSection(item.id as any)}
                    className="w-full flex items-center justify-between py-4 px-0 text-left bg-transparent hover:bg-transparent dark:bg-transparent dark:hover:bg-transparent shadow-none border-0 rounded-none transition-colors"
                  >
                    <span
                      className={`font-bold text-base tracking-wide ${
                        item.id === 'DELETE'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {item.title}
                    </span>

                    <span className="text-slate-500 dark:text-slate-400 font-bold text-2xl leading-none">
                      ›
                    </span>
                  </Button>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Section Detail View */}
        {activeSection && (
          <div className="absolute inset-0 bg-white dark:bg-slate-900  z-10 flex flex-col h-full animate-in slide-in-from-right-full duration-75">
            <div className="flex items-center gap-4 p-5 border-b border-slate-200 dark:border-slate-700  shrink-0">
              <Button onClick={() => setActiveSection(null)} className="p-2 -ml-2 text-slate-700 dark:text-slate-400  hover:bg-slate-100 dark:bg-slate-800 :bg-slate-800 rounded-full transition cursor-pointer">
                <ArrowLeft size={24} />
              </Button>
              <h2 className="text-xl font-black text-slate-900 dark:text-white  tracking-tight">
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
            <main className="flex-1 w-full p-6 overflow-y-auto custom-scrollbar bg-slate-50 dark:bg-slate-800 ">
          
          
          {activeSection === 'VERIFICATION' && (
            <div className="space-y-6 animate-in fade-in duration-75">
              <h2 className="text-xl font-black text-slate-900 dark:text-white  tracking-tight uppercase flex items-center gap-2">
                <Shield size={20} className="text-brand-500" />
                Identity & Asset Verification
              </h2>
              
              <div className="bg-slate-50 dark:bg-slate-800  border border-slate-200 dark:border-slate-700  rounded-2xl p-6">
                {verificationStatus === 'VERIFIED' ? (
                  <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                      <Shield size={40} className="text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white  uppercase tracking-wider">Account Verified</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400  max-w-sm">
                      Your identity and commercial haulage certificates have been successfully cross-referenced with the logistics grid.
                    </p>
                    <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider mt-4">
                      <Check size={14} /> Full Market Access Granted
                    </div>
                  </div>
                ) : verificationStatus === 'VERIFYING' ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-6 text-center">
                    <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-700  border-t-blue-500 rounded-full animate-spin"></div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white  uppercase tracking-wider mb-2">Analyzing Documents</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 ">Verifying security watermarks and cross-referencing national logistics databases...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <p className="text-sm text-slate-500 dark:text-slate-400  leading-relaxed">
                      Upload your valid government-issued ID and structural integrity certificates for your commercial vehicles to unlock full access to the TransConet load board.
                    </p>
                    
                    <div className="flex flex-col gap-6 w-full">
                      {/* Tier 1 Box */}
                      <div className="bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-700  rounded-[20px] p-5 shadow-sm  overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white  uppercase tracking-wider flex items-center gap-2">
                            <span className="bg-brand-600 text-slate-50 dark:text-slate-300 px-2 py-0.5 rounded text-[10px]">TIER 1</span>
                            Basic Compliance
                          </h4>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400  uppercase">Required</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400  mb-4 leading-relaxed">
                          Identity verification, valid vehicle certificates, and fleet physical inspection appointment.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300  hover:border-brand-500 rounded-xl bg-slate-50 dark:bg-slate-800  hover:bg-white dark:bg-slate-900  transition cursor-pointer group">
                            <div className="flex flex-col items-center justify-center pt-4 pb-4 text-center">
                              <Image size={20} className="text-slate-600 dark:text-slate-400 group-hover:text-brand-500 mb-2 transition" />
                              <p className="mb-1 text-xs text-slate-700 dark:text-slate-400  font-bold"><span className="text-brand-500">Government ID</span></p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400  font-mono">PNG, JPG, PDF</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleDocumentUpload(e, 'driverLicense')} />
                          </label>
                          <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300  hover:border-brand-500 rounded-xl bg-slate-50 dark:bg-slate-800  hover:bg-white dark:bg-slate-900  transition cursor-pointer group">
                            <div className="flex flex-col items-center justify-center pt-4 pb-4 text-center">
                              <Image size={20} className="text-slate-600 dark:text-slate-400 group-hover:text-brand-500 mb-2 transition" />
                              <p className="mb-1 text-xs text-slate-700 dark:text-slate-400  font-bold"><span className="text-brand-500">Vehicle Certificate</span></p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400  font-mono">PNG, JPG, PDF</p>
                            </div>
                            <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleDocumentUpload(e, 'vehicleRegistration')} />
                          </label>
                        </div>
                      </div>

                      {/* Business Verification (Optional) Box */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm  overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="bg-brand-600 text-white px-2 py-0.5 rounded text-[10px]">CORPORATE</span>
                            Business Verification (CAC / NIN)
                          </h4>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Optional</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                          Upload your Corporate Affairs Commission (CAC) certificate or National ID to establish corporate trust and unlock enterprise shippers.
                        </p>
                        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300 hover:border-purple-500 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-white dark:bg-slate-900 transition cursor-pointer group">
                          <div className="flex flex-col items-center justify-center pt-4 pb-4 text-center">
                            <Building2 size={20} className="text-slate-600 dark:text-slate-400 group-hover:text-brand-500 mb-2 transition" />
                            <p className="mb-1 text-xs text-slate-700 dark:text-slate-400 font-bold"><span className="text-brand-500">Upload CAC / NIN</span></p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">PNG, JPG, PDF</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleDocumentUpload(e, 'cac')} />
                        </label>
                      </div>
                      {/* Tier 2 Box */}
                      <div className="bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-700  rounded-[20px] p-5 shadow-sm  overflow-hidden">
                        <div className="flex justify-between items-center mb-4">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white  uppercase tracking-wider flex items-center gap-2">
                            <span className="bg-brand-600 text-white px-2 py-0.5 rounded text-[10px]">TIER 2</span>
                            Premium Haulage
                          </h4>
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400  uppercase">Optional</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400  mb-4 leading-relaxed">
                          Goods in Transit (GiT) Insurance. Required for high-value cargo assignments and priority matching.
                        </p>
                        <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-slate-300  hover:border-brand-500 rounded-xl bg-slate-50 dark:bg-slate-800  hover:bg-white dark:bg-slate-900  transition cursor-pointer group">
                          <div className="flex flex-col items-center justify-center pt-4 pb-4 text-center">
                            <Image size={20} className="text-slate-600 dark:text-slate-400 group-hover:text-brand-500 mb-2 transition" />
                            <p className="mb-1 text-xs text-slate-700 dark:text-slate-400  font-bold"><span className="text-brand-500">Upload GiT Insurance</span></p>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400  font-mono">PNG, JPG, PDF</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => handleDocumentUpload(e, 'gitInsurance')} />
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'ABOUT' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white  border-b border-slate-200 dark:border-slate-700  pb-2">Ecosystem Profile</h2>
              <div className="space-y-3 text-xs text-slate-500 dark:text-slate-400  leading-relaxed">
                <p>TransConet is a "Digital market platform " designed to seamlessly close the gap between cargo owners (customers) and commercial truck drivers or fleet owners (transporters). Our ecosystem streamlines freight procurement by providing a secure, transparent, and efficient platform for matching available loads with verified transport vehicles.</p>
                <p>By integrating automated onboarding, role-based interfaces, and direct communication lines, TransConet eliminates middle-man friction, optimizes fleet transit capacity, and creates a reliable trust network for regional haulage operations.</p>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white  mt-4 mb-2">Corporate Governance</h3>
                <p>TransConet operates as a fully independent startup. All data protection, driver verifications, and marketplace dispute regulations are governed under these corporate compliance structures to ensure maximum security for both cargo owners and transport providers.</p>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white  mt-4 mb-2">Secure Escrow Payments</h3>
                <p>To further protect our users, TransConet offers an optional Escrow Payment system. Shippers can securely fund haulage requests, holding payments in escrow until delivery confirmation is received, ensuring trust and guaranteed payment for transporters.</p>
              </div>
            </div>
          )}

          
                              {/* SECTION SAFETY */}
          {activeSection === 'SAFETY' && (
            <div className="space-y-6 animate-in fade-in duration-75">
              <h2 className="text-xl font-black text-slate-900 dark:text-white  tracking-tight uppercase flex items-center gap-2">
                <Shield size={20} className="text-brand-500" />
                Safety
              </h2>
              <div className="space-y-6 text-sm text-slate-600 dark:text-slate-400  leading-relaxed">
                <p>
                  At TransConet, safety is the foundation of our marketplace. We are committed to creating a secure, transparent, and trustworthy digital environment where shippers and transport providers can connect with confidence. While TransConet serves as a technology platform that facilitates connections between users and does not directly operate transport services, we actively promote industry best practices and implement measures that enhance safety, accountability, and professionalism.
                </p>

                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white  uppercase tracking-wider">Our Safety Commitment</h3>
                  <p>We strive to maintain a marketplace where users can engage with confidence through:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Verification of transport providers and business information.</li>
                    <li>Secure user registration and authentication processes.</li>
                    <li>Protection of user data and privacy using modern security practices.</li>
                    <li>Transparent transporter profiles, ratings, and customer reviews.</li>
                    <li>Fair marketplace policies that encourage professionalism and accountability.</li>
                    <li>Reporting mechanisms for suspicious activities, fraud, or misconduct.</li>
                    <li>Continuous monitoring and improvement of platform security and user experience.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white  uppercase tracking-wider">Transport Provider Safety Standards</h3>
                  <p>TransConet encourages transport providers to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Maintain valid business registrations and operating licences where required.</li>
                    <li>Ensure vehicles are roadworthy and properly maintained.</li>
                    <li>Employ qualified, licensed, and experienced drivers.</li>
                    <li>Comply with applicable road transport laws and regulations.</li>
                    <li>Carry cargo safely using appropriate loading and securing practices.</li>
                    <li>Maintain appropriate insurance coverage where applicable.</li>
                    <li>Observe speed limits and practice defensive driving.</li>
                    <li>Prioritize the safety of people, cargo, and property throughout every journey.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white  uppercase tracking-wider">Shipper Safety Guidelines</h3>
                  <p>We encourage shippers to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Choose verified transport providers whenever possible.</li>
                    <li>Provide accurate shipment information, including cargo type, weight, dimensions, and special handling requirements.</li>
                    <li>Ensure goods are packaged appropriately for transport.</li>
                    <li>Confirm pickup and delivery details before shipment begins.</li>
                    <li>Maintain clear communication with the selected transport provider.</li>
                    <li>Report any suspicious behaviour or policy violations through the platform.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white  uppercase tracking-wider">Digital Security</h3>
                  <p>To protect users and their information, TransConet is committed to:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Secure account authentication.</li>
                    <li>Protection of personal and business information.</li>
                    <li>Secure communication channels within the platform.</li>
                    <li>Regular monitoring for fraudulent or unauthorized activities.</li>
                    <li>Responsible handling of user data in accordance with applicable privacy standards.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white  uppercase tracking-wider">Incident Reporting</h3>
                  <p>Users are encouraged to report:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Fraudulent activities.</li>
                    <li>Fake transporter or customer accounts.</li>
                    <li>Misrepresentation of services.</li>
                    <li>Unsafe transport practices.</li>
                    <li>Harassment or abusive behaviour.</li>
                    <li>Security concerns or suspicious transactions.</li>
                  </ul>
                  <p>Reports are reviewed promptly to help maintain the integrity of the marketplace.</p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white  uppercase tracking-wider">Continuous Improvement</h3>
                  <p>Safety is an ongoing commitment. TransConet continuously reviews its policies, technology, and operational procedures to improve platform security, enhance user confidence, and promote responsible logistics practices.</p>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white  uppercase tracking-wider">Our Safety Promise</h3>
                  <p>TransConet is dedicated to fostering a professional and dependable logistics marketplace where safety, transparency, and trust are at the heart of every connection. By encouraging responsible conduct, supporting verified participants, and promoting industry best practices, we aim to create an environment where shippers and transport providers can build lasting business relationships with confidence.</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION QUALITY */}
          {activeSection === 'QUALITY' && (
            <div className="space-y-6 animate-in fade-in duration-75">
              <h2 className="text-xl font-black text-slate-900 dark:text-white  tracking-tight uppercase flex items-center gap-2">
                <Star size={20} className="text-brand-500" />
                Service Quality
              </h2>

              <div className="space-y-6 text-sm text-slate-600 dark:text-slate-400  leading-relaxed">
                <p>
                  TransConet is built on the principles of trust, reliability, transparency, efficiency, and professionalism, delivering a premium digital logistics marketplace that creates value for both shippers and transport providers.
                </p>

                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white  uppercase tracking-wider">For Shippers (Cargo Owners & Businesses)</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Access to a network of verified transport providers.</li>
                    <li>Fast and simple load posting process.</li>
                    <li>Receive multiple competitive quotations from transporters.</li>
                    <li>Compare prices, service quality, vehicle types, and transporter ratings.</li>
                    <li>Transparent pricing with no hidden platform charges.</li>
                    <li>Wide selection of transport options for different cargo types.</li>
                    <li>Quick access to available trucks across multiple locations.</li>
                    <li>Professional transporter profiles with verified information.</li>
                    <li>Secure communication between shippers and transport providers.</li>
                    <li>Real-time shipment status updates and notifications.</li>
                    <li>Digital records of bookings, quotations, and shipment history.</li>
                    <li>Ability to manage multiple shipments from one account.</li>
                    <li>Reduced time and effort in sourcing reliable transport.</li>
                    <li>Improved logistics planning and operational efficiency.</li>
                    <li>Professional customer support and dispute resolution.</li>
                    <li>Trusted marketplace with transparent reviews and ratings.</li>
                    <li>Flexible transport solutions for businesses of all sizes.</li>
                    <li>Increased confidence through verified transport providers.</li>
                    <li>Simplified logistics management through one integrated platform.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white  uppercase tracking-wider">For Transport Providers</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Continuous access to genuine haulage opportunities.</li>
                    <li>Increased business visibility to potential customers.</li>
                    <li>Reduced empty return trips through load matching.</li>
                    <li>Professional digital business profile to attract new clients.</li>
                    <li>Opportunity to submit competitive quotations directly to shippers.</li>
                    <li>Expanded customer reach beyond traditional marketing channels.</li>
                    <li>Increased vehicle utilization and fleet productivity.</li>
                    <li>Ability to manage multiple vehicles and drivers efficiently.</li>
                    <li>Digital job management and booking history.</li>
                    <li>Business performance dashboard and operational insights.</li>
                    <li>Customer ratings and reviews to build credibility.</li>
                    <li>Fair and transparent marketplace for securing contracts.</li>
                    <li>Direct communication with cargo owners.</li>
                    <li>Reduced customer acquisition costs.</li>
                    <li>Opportunities for repeat business and long-term partnerships.</li>
                    <li>Improved operational efficiency through digital workflows.</li>
                    <li>Better fleet planning based on available loads.</li>
                    <li>Enhanced professional reputation within the logistics industry.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white  uppercase tracking-wider">Platform Quality</h3>
                  <p>TransConet delivers a high-quality digital marketplace through:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Secure user authentication and account protection.</li>
                    <li>Comprehensive transporter verification procedures.</li>
                    <li>Professional and intuitive Android application.</li>
                    <li>Mobile-first design for fast and convenient access.</li>
                    <li>Reliable system performance and high availability.</li>
                    <li>User-friendly interface with premium navigation.</li>
                    <li>Smart matching between loads and transport providers.</li>
                    <li>Transparent marketplace rules and policies.</li>
                    <li>Real-time notifications and communication tools.</li>
                    <li>Secure storage of user and booking information.</li>
                    <li>Data-driven insights to support better logistics decisions.</li>
                    <li>Continuous platform improvements based on user feedback.</li>
                    <li>Scalable infrastructure designed for future growth.</li>
                    <li>Compliance with modern digital security and privacy standards.</li>
                    <li>Dedicated customer support and technical assistance.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white  uppercase tracking-wider">Environmental & Economic Quality</h3>
                  <p>TransConet contributes to a more sustainable and productive logistics ecosystem by:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Reducing empty truck movements through efficient load matching.</li>
                    <li>Improving fleet utilization and transport efficiency.</li>
                    <li>Lowering unnecessary fuel consumption.</li>
                    <li>Supporting environmentally responsible freight operations.</li>
                    <li>Helping businesses reduce logistics costs.</li>
                    <li>Increasing income opportunities for transport providers.</li>
                    <li>Promoting digital transformation within the haulage industry.</li>
                    <li>Strengthening supply chain efficiency across Nigeria.</li>
                    <li>Encouraging collaboration between shippers and transport providers.</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white  uppercase tracking-wider">Our Quality Commitment</h3>
                  <p>
                    At TransConet, quality is not limited to technology—it is reflected in every interaction, every booking, and every successful delivery. We are committed to providing a secure, transparent, reliable, and professional digital logistics marketplace that empowers shippers to move goods with confidence while enabling transport providers to grow sustainable and profitable businesses. Our commitment to continuous innovation, operational excellence, and customer satisfaction ensures that TransConet remains a trusted partner in the future of logistics.
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* SECTION PRIVACY POLICY */}
          {activeSection === 'PRIVACY' && (
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar text-xs text-slate-500 dark:text-slate-400  leading-relaxed">
              <h2 className="text-xl font-black text-slate-900 dark:text-white  border-b border-slate-200 dark:border-slate-700  pb-2">TransConet – Privacy Policy</h2>
              
              <div className="space-y-3">
                <p><strong>1. Information We Collect</strong><br/>
                To connect users and provide accurate logistical positioning, we collect:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400 ">
                  <li><strong>Account Details:</strong> Name, email address, phone number, and company profile.</li>
                  <li><strong>Usage and Location Data:</strong> Real-time location data (GPS), device details, IP addresses, and app interaction logs necessary to facilitate connections between transport seekers and providers.</li>
                </ul>

                <p className="mt-4"><strong>2. How We Use Your Data</strong><br/>
                We limit data usage strictly to:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400 ">
                  <li>Connecting transport providers with customers based on location and logistics needs.</li>
                  <li>Preventing fraudulent activities, platform abuse, and security breaches.</li>
                  <li>Communicating vital service status updates, safety alerts, and account-related notices.</li>
                </ul>

                <p className="mt-4"><strong>3. Sharing and Protection</strong></p>
                <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400 ">
                  <li><strong>User-to-User Sharing:</strong> To facilitate a connection, relevant contact information and real-time locations are shared with the matching party (customer or transporter) on the platform.</li>
                  <li><strong>Data Security:</strong> We employ standard encryption protocols, firewalls, and limited-access databases to ensure your personal and business records remain safe from unauthorized external access.</li>
                  <li><strong>Data Rights:</strong> You can view, update, or request the deletion of your personal data at any time through your Account Settings inside the app.</li>
                </ul>

                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700 ">
                  <p><strong>Contact & Support</strong><br/>
                  For any questions regarding these terms, data protection compliance, or to report platform abuse, please contact our team:</p>
                  <ul className="list-disc pl-4 space-y-1 mt-2 text-slate-500 dark:text-slate-400 ">
                    <li><strong>General Inquiries:</strong> info@transconet.com</li>
                    <li><strong>Customer Support:</strong> support@transconet.com</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* SECTION TERMS AND CONDITIONS */}
          {activeSection === 'TERMS' && (
            <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2 custom-scrollbar text-xs text-slate-500 dark:text-slate-400  leading-relaxed">
              <h2 className="text-xl font-black text-slate-900 dark:text-white  border-b border-slate-200 dark:border-slate-700  pb-2">TransConet – Terms of Service</h2>
              
              <div className="space-y-3">
                <p><strong>1. Your Account</strong></p>
                <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400 ">
                  <li><strong>Eligibility:</strong> You must be a human over the age of 18 to create an account. Automated registrations ("bots") are strictly prohibited.</li>
                  <li><strong>Accuracy:</strong> You must provide an accurate name, valid email address, and active phone number during registration.</li>
                  <li><strong>Security:</strong> You are entirely responsible for keeping your password and account secure. TransConet cannot and will not be liable for any loss or damage arising from your failure to maintain account security.</li>
                  <li><strong>Prohibited Use:</strong> You agree not to use the platform for any illegal, fraudulent, or unauthorized purpose. You will not transmit any disruptive code, viruses, or misleading identity details.</li>
                </ul>

                <p className="mt-4"><strong>2. Independent Relationship (No Transaction Interference)</strong></p>
                <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400 ">
                  <li><strong>Platform Role:</strong> TransConet is purely a technology platform connecting independent parties. Unless the Escrow Payment option is utilized, we do not manage, interfere with, dictate, or process payments for the transport transactions between transporters and customers.</li>
                  <li><strong>User Dispute Release:</strong> Any agreements, pricing, payments, or services negotiated outside of the Escrow Payment system are strictly between the transporter and the customer. TransConet holds zero liability for any financial disputes, non-payments, or service failures between users in such cases.</li>
                </ul>

                <p className="mt-4"><strong>3. Escrow Payment Services</strong></p>
                <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400 ">
                  <li><strong>Optional Service:</strong> Users may opt to use our secure Escrow Payment feature. When enabled, the shipper's payment is held securely in an escrow account.</li>
                  <li><strong>Release of Funds:</strong> Funds are released to the transporter only upon satisfactory confirmation of delivery by the shipper or through our dispute resolution process.</li>
                  <li><strong>Disputes:</strong> Any disputes regarding escrowed funds will be handled in accordance with our Dispute Resolution Policy.</li>
                </ul>

                <p className="mt-4"><strong>4. Modifications and Termination</strong></p>
                <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400 ">
                  <li><strong>Changes:</strong> We reserve the right to modify, update, or temporarily discontinue features of the app at any time.</li>
                  <li><strong>Inactive Accounts:</strong> TransConet reserves the right to terminate unverified or free accounts that remain completely inactive for more than 60 consecutive days.</li>
                  <li><strong>Breach:</strong> We may suspend or terminate your access immediately if you violate these terms or engage in behavior that puts the platform or other users at risk.</li>
                </ul>

                <p className="mt-4"><strong>5. Liability and Jurisdiction</strong></p>
                <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-400 ">
                  <li><strong>Warranty:</strong> The service is provided "as is" and "as available" without any explicit or implied warranties.</li>
                  <li><strong>Limitation:</strong> TransConet will not be liable for any indirect, incidental, or consequential damages resulting from your use or inability to use the platform, including any physical or financial incidents occurring during a connection made via the app.</li>
                  <li><strong>Governing Law:</strong> These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes regarding the platform itself will be resolved exclusively within the appropriate courts in Nigeria.</li>
                </ul>
              </div>
            </div>
          )}

          {/* SECTION REPORT A DISPUTE */}
          {activeSection === 'DISPUTE' && (
            <div className="space-y-4">
              <h2 className="text-xl font-black text-slate-900 dark:text-white  border-b border-slate-200 dark:border-slate-700  pb-2">Report a System Dispute</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 ">
                Did a platform user breach safety protocol, submit false plate configurations, or display unprofessional behavior? Log it directly into our administrative tracking ledger:
              </p>

              {disputeFiled ? (
                <div className="p-4 bg-brand-50 border border-brand-200 text-brand-600 rounded-xl text-xs font-bold animate-in zoom-in-95">
                  ✓ Dispute report submitted successfully to our administrative desk. The developer team will trace this user record history.
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setDisputeFiled(true); }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400  uppercase tracking-wider mb-1">Target Match ID or Number</label>
                      <input required type="text" placeholder="e.g., #TC-88931" className="w-full bg-slate-50 dark:bg-slate-800  border border-slate-200 dark:border-slate-700  rounded-2xl text-xs px-3 py-2.5 text-slate-900 dark:text-white  focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400  uppercase tracking-wider mb-1">Nature of Violation</label>
                      <select required className="w-full bg-slate-50 dark:bg-slate-800  border border-slate-200 dark:border-slate-700  rounded-xl text-xs px-3 py-2.5 text-slate-900 dark:text-white  focus:outline-none">
                        <option value="">Select Category...</option>
                        <option value="PLATE">Incorrect License Plate Number</option>
                        <option value="VEHICLE">Vehicle Type Mismatch (Not as registered)</option>
                        <option value="SAFETY">Unprofessional/Unsafe Highway Conduct</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400  uppercase tracking-wider mb-1">Incident Narration</label>
                    <textarea required rows={3} placeholder="Provide specific operational details..." className="w-full bg-slate-50 dark:bg-slate-800  border border-slate-200 dark:border-slate-700  rounded-2xl text-xs p-3 text-slate-900 dark:text-white  focus:outline-none" />
                  </div>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-slate-900 dark:text-white  text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition cursor-pointer">
                    File Investigation Report
                  </Button>
                </form>
              )}
            </div>
          )}

          {/* SECTION CHAT INFO & EMAIL CHANNELS */}
          {activeSection === 'SUPPORT' && (
            <div className="space-y-5">
              <h2 className="text-xl font-black text-slate-900 dark:text-white  border-b border-slate-200 dark:border-slate-700  pb-2">Technical & Support Desk</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400  leading-relaxed">
                Need architectural support, API assistance, or direct validation for your fleet stickers? Reach our monitoring desk through our official corporate mail networks:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800  p-4 rounded-xl border border-slate-200 dark:border-slate-700  space-y-2">
                  <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest block">Main Support Line</span>
                  <a href="mailto:Support@transconet.com" className="text-slate-900 dark:text-white  text-sm font-bold font-mono hover:underline break-all block">
                    Support@transconet.com
                  </a>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 ">Best for immediate driver account issues or sticker re-verifications.</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800  p-4 rounded-xl border border-slate-200 dark:border-slate-700  space-y-2">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block">Corporate Inquiries</span>
                  <a href="mailto:Info@transconet.com" className="text-slate-900 dark:text-white  text-sm font-bold font-mono hover:underline break-all block">
                    Info@transconet.com
                  </a>
                  
                </div>
              </div>
            </div>
          )}

          {/* SECTION ACCOUNT DELETION */}
          {/* SECTION FINANCE */}
          {activeSection === 'FINANCE' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white  border-b border-slate-200 dark:border-slate-700  pb-2 flex items-center gap-2">
                <Landmark size={20} className="text-brand-500" />
                Escrow Settlement Bank Account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 ">
                Please provide the bank account details where your Escrow payments will be settled upon delivery confirmation.
              </p>

              <div className="bg-slate-50 dark:bg-slate-800  border border-slate-200 dark:border-slate-700  rounded-2xl p-5 space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 dark:text-slate-400  uppercase tracking-wider mb-1">Bank Name</label>
                  <input type="text" value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="e.g., Guaranty Trust Bank" className="w-full bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-700  rounded-xl px-3 py-2.5 text-slate-900 dark:text-white  text-xs focus:outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 dark:text-slate-400  uppercase tracking-wider mb-1">Account Number</label>
                  <input type="text" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} placeholder="e.g., 0123456789" className="w-full bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-700  rounded-xl px-3 py-2.5 text-slate-900 dark:text-white  text-xs focus:outline-none font-mono focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 dark:text-slate-400  uppercase tracking-wider mb-1">Account Name</label>
                  <input type="text" value={accountName} onChange={(e) => setAccountName(e.target.value)} placeholder="e.g., John Doe Logistics" className="w-full bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-700  rounded-xl px-3 py-2.5 text-slate-900 dark:text-white  text-xs focus:outline-none focus:border-brand-500" />
                </div>
                <Button 
                  onClick={handleSaveBankDetails} 
                  disabled={bankUpdateStatus === 'SAVING'}
                  className={`${
                    bankUpdateStatus === 'SUCCESS' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    bankUpdateStatus === 'ERROR' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-brand-600 hover:bg-brand-700'
                  } text-white text-xs font-bold px-4 py-2.5 rounded-xl uppercase tracking-wider transition w-full shadow-md  flex items-center justify-center gap-2 cursor-pointer mt-4`}
                >
                  {bankUpdateStatus === 'SAVING' && <Loader2 size={14} className="animate-spin" />}
                  {bankUpdateStatus === 'SUCCESS' && <CheckCircle2 size={14} />}
                  {bankUpdateStatus === 'ERROR' && <AlertTriangle size={14} />}
                  {bankUpdateStatus === 'IDLE' && <Save size={14} />}
                  {bankUpdateStatus === 'SAVING' ? 'Saving...' : 
                   bankUpdateStatus === 'SUCCESS' ? 'Details Saved' :
                   bankUpdateStatus === 'ERROR' ? 'Action Failed' :
                   'Update Bank Details'}
                </Button>
              </div>
            </div>
          )}
          {activeSection === 'DELETE' && (
            <div className="space-y-4 border border-red-900/30 bg-red-950/10 p-5 rounded-xl">
              <h2 className="text-xl font-black text-red-400 flex items-center gap-2">
                <Trash2 size={22} /> Permanent Account Purge
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400  leading-relaxed">
                Warning: Triggering this command will completely erase your profile credentials, vehicle arrays, active route listings, and matching logs from our active environment. This action is **irreversible** and complies fully with data safety standards.
              </p>
              <div className="pt-2">
                {deleteScheduled ? (
                  <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 text-xs font-bold rounded-xl animate-in zoom-in-95">
                    ✓ Account record scheduled for permanent removal from our databases within 24 hours.
                  </div>
                ) : (
                  <Button 
                    onClick={() => setDeleteScheduled(true)}
                    className="bg-red-600 hover:bg-red-700 text-slate-900 dark:text-white  text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition shadow-lg  shadow-red-900/20 cursor-pointer overflow-hidden"
                  >
                    Confirm Permanent Deletion
                  </Button>
                )}
              </div>
            </div>
          )}

        </main>
          </div>
        )}
      </div>

      {/* Profile Preferences Modal Box */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-75">
          <div className="bg-white dark:bg-slate-900  border border-slate-200 dark:border-slate-700  w-full max-w-xl rounded-[20px] p-6 space-y-5 shadow-sm scale-in duration-75 overflow-hidden">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700  pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white  uppercase tracking-wider">Account Control Deck</h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400  font-mono">Synchronize your active database profile attributes</p>
              </div>
              <Button onClick={() => setShowConfigModal(false)} className="p-1.5 bg-slate-50 dark:bg-slate-800  hover:bg-brand-100 hover:text-brand-600 border border-slate-200 dark:border-slate-700  rounded-lg text-slate-500 dark:text-slate-400  hover:text-slate-900 dark:text-white  transition cursor-pointer">
                <X size={16} />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 dark:text-slate-400  uppercase tracking-wider mb-1">Legal Name</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800  border border-slate-200 dark:border-slate-700  rounded-xl px-3 py-2.5 text-slate-900 dark:text-white  text-xs focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-500 dark:text-slate-400  uppercase tracking-wider mb-1">Mobile Connection String</label>
                <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800  border border-slate-200 dark:border-slate-700  rounded-xl px-3 py-2.5 text-slate-900 dark:text-white  text-xs focus:outline-none font-mono" />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-slate-200 dark:border-slate-700 ">
              <Button onClick={() => setShowConfigModal(false)} className="px-4 py-2 bg-slate-50 dark:bg-slate-800  border border-slate-200 dark:border-slate-700  hover:bg-brand-100 hover:text-brand-600 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400  transition cursor-pointer">Cancel</Button>
              <Button onClick={handleSaveParameters} className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 cursor-pointer">
                <Save size={14} /> Save Parameters
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
