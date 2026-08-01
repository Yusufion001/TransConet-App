import React, { useState, useEffect } from 'react';
import { Settings, Globe, Shield, Save, RotateCcw, Sliders, Link2, CreditCard, Mail, MessageSquare } from 'lucide-react';
import { Button } from './ui/Button';
import { useAdminLiveData } from '../hooks/useAdminLiveData';
import api from '../api/client';

export default function AdminPlatformConfiguration() {
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'OPERATIONS' | 'SECURITY' | 'INTEGRATIONS'>('GENERAL');
  
  const { data, loading, mutate } = useAdminLiveData<Record<string, string>>({
    endpoint: '/admin/config',
    queryKey: 'admin-platform-config',
    mockData: {}
  });

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData(data);
    }
  }, [data]);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.patch('/admin/config', formData);
      mutate(formData);
    } catch (err) {
      console.error('Failed to save config', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (data) setFormData(data);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Sliders className="text-indigo-600" /> Platform Configuration
          </h2>
          <p className="text-slate-500 dark:text-slate- text-sm mt-1">Manage global system settings, operational parameters, and third-party integrations.</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDiscard} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate- hover:bg-blue-50 cursor-pointer hover:shadow-sm px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
            <RotateCcw size={16} /> Discard Changes
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isSaving || loading}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {isSaving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : <Save size={16} />}
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Settings Navigation */}
        <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-800 border-r border-slate-100 dark:border-slate-800 p-4 space-y-1">
          <Button
            onClick={() => setActiveTab('GENERAL')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'GENERAL' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Globe size={18} /> General Setup
          </Button>
          <Button
            onClick={() => setActiveTab('OPERATIONS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'OPERATIONS' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Settings size={18} /> Operational Params
          </Button>
          <Button
            onClick={() => setActiveTab('SECURITY')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'SECURITY' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Shield size={18} /> Security & Auth
          </Button>
          <Button
            onClick={() => setActiveTab('INTEGRATIONS')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === 'INTEGRATIONS' 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Link2 size={18} /> Integrations & APIs
          </Button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 p-6 md:p-8 animate-fade-in bg-white dark:bg-slate-900 overflow-y-auto">
          {loading ? (
             <div className="py-12 flex justify-center text-slate-500">Loading configuration...</div>
          ) : activeTab === 'GENERAL' && (
            <div className="max-w-2xl space-y-8 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">General Information</h3>
                <p className="text-sm text-slate-500 dark:text-slate- mb-4">Basic platform details and contact information.</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-">Platform Name</label>
                      <input type="text" value={formData.platformName || 'LoadGigs'} onChange={e => handleChange('platformName', e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-">Support Email</label>
                      <input type="email" value={formData.supportEmail || 'support@loadgigs.com'} onChange={e => handleChange('supportEmail', e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-">Support Phone Number</label>
                    <input type="text" value={formData.supportPhone || '+234 (800) 123-4567'} onChange={e => handleChange('supportPhone', e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900" />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Localization</h3>
                <p className="text-sm text-slate-500 dark:text-slate- mb-4">Default currency, timezone, and regional formats.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-">Default Currency</label>
                    <select value={formData.currency || 'NGN'} onChange={e => handleChange('currency', e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900">
                      <option value="NGN">Nigerian Naira (₦)</option>
                      <option value="USD">US Dollar ($)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="GBP">British Pound (£)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-">System Timezone</label>
                    <select value={formData.timezone || 'Africa/Lagos'} onChange={e => handleChange('timezone', e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900">
                      <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === 'OPERATIONS' && (
            <div className="max-w-2xl space-y-8 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Matching & Pricing</h3>
                <p className="text-sm text-slate-500 dark:text-slate- mb-4">Configure algorithmic thresholds and platform fees.</p>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-">Platform Escrow Fee (%)</label>
                      <input type="number" value={formData.escrowFee || '3.5'} onChange={e => handleChange('escrowFee', e.target.value)} step="0.1" className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-">Max Auto-Match Radius (km)</label>
                      <input type="number" value={formData.matchRadius || '50'} onChange={e => handleChange('matchRadius', e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Dynamic Surge Pricing</h4>
                      <p className="text-xs text-slate-500 dark:text-slate- mt-0.5">Automatically adjust prices based on regional demand</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={formData.surgePricing === 'true' || formData.surgePricing === undefined} onChange={e => handleChange('surgePricing', e.target.checked ? 'true' : 'false')} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Disputes & Escalations</h3>
                <p className="text-sm text-slate-500 dark:text-slate- mb-4">Rules for resolving conflicts between shippers and drivers.</p>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-">Auto-Resolve Inactive Disputes (Days)</label>
                    <input type="number" value={formData.autoResolveDays || '7'} onChange={e => handleChange('autoResolveDays', e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-">Default Payout Window (Hours)</label>
                    <input type="number" value={formData.payoutWindow || '24'} onChange={e => handleChange('payoutWindow', e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === 'SECURITY' && (
            <div className="max-w-2xl space-y-8 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Authentication Policies</h3>
                <p className="text-sm text-slate-500 dark:text-slate- mb-4">Enforce security standards for admin and user accounts.</p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Require 2FA for all Admins</h4>
                      <p className="text-xs text-slate-500 dark:text-slate- mt-0.5">Mandatory two-factor authentication via Authenticator app</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={formData.require2FA === 'true'} onChange={e => handleChange('require2FA', e.target.checked ? 'true' : 'false')} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">Enforce Biometrics for Transporters</h4>
                      <p className="text-xs text-slate-500 dark:text-slate- mt-0.5">Require Face ID / Fingerprint on mobile app launch</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={formData.enforceBiometrics === 'true'} onChange={e => handleChange('enforceBiometrics', e.target.checked ? 'true' : 'false')} className="sr-only peer" />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-900 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-8">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Session & Access limits</h3>
                <p className="text-sm text-slate-500 dark:text-slate- mb-4">Control session durations and login thresholds.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-">Admin Session Timeout (Mins)</label>
                    <input type="number" value={formData.adminSessionTimeout || '30'} onChange={e => handleChange('adminSessionTimeout', e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-">Max Failed Login Attempts</label>
                    <input type="number" value={formData.maxFailedLogins || '5'} onChange={e => handleChange('maxFailedLogins', e.target.value)} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === 'INTEGRATIONS' && (
            <div className="max-w-2xl space-y-6 animate-fade-in">
              
              <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 hover:border-indigo-200 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Payment Gateway (Paystack)</h4>
                    <p className="text-sm text-slate-500 dark:text-slate- mt-1 max-w-sm">Process escrow deposits, payouts, and card tokenization.</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold text-emerald-700 uppercase">Connected</span>
                    </div>
                  </div>
                </div>
                <Button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate- text-sm font-bold rounded-xl transition-colors shrink-0">Configure</Button>
              </div>

              <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 hover:border-indigo-200 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                    <MessageSquare size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">SMS Gateway (Twilio)</h4>
                    <p className="text-sm text-slate-500 dark:text-slate- mt-1 max-w-sm">Send OTPs, driver assignment alerts, and tracking links via SMS.</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold text-emerald-700 uppercase">Connected</span>
                    </div>
                  </div>
                </div>
                <Button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate- text-sm font-bold rounded-xl transition-colors shrink-0">Configure</Button>
              </div>

              <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 hover:border-indigo-200 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Email Service (SendGrid)</h4>
                    <p className="text-sm text-slate-500 dark:text-slate- mt-1 max-w-sm">Transactional emails, weekly reports, and marketing campaigns.</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                      <span className="text-xs font-bold text-slate-500 dark:text-slate- uppercase">Not Configured</span>
                    </div>
                  </div>
                </div>
                <Button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shrink-0">Connect</Button>
              </div>

              <div className="p-5 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 hover:border-indigo-200 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
                    <Globe size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Google Maps Platform</h4>
                    <p className="text-sm text-slate-500 dark:text-slate- mt-1 max-w-sm">Routing, distance matrix, and geocoding for accurate pricing.</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold text-emerald-700 uppercase">Connected</span>
                    </div>
                  </div>
                </div>
                <Button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate- text-sm font-bold rounded-xl transition-colors shrink-0">Configure</Button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
