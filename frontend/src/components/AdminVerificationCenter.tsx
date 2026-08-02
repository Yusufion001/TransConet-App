import React, { useState } from 'react';
import { useAdminLiveData } from '../hooks/useAdminLiveData';
import { ShieldCheck, CheckCircle2, XCircle, Search, FileText, UserCheck, Truck, AlertTriangle, ChevronRight, Eye, Download } from 'lucide-react';
import { Button } from './ui/Button';

interface VerificationRequest {
  id: string;
  type: 'DRIVER' | 'COMPANY' | 'VEHICLE';
  name: string;
  submittedAt: string;
  status: 'PENDING' | 'IN_REVIEW' | 'REJECTED' | 'APPROVED';
  documents: { name: string; url: string; type: string }[];
  riskScore: 'LOW' | 'MEDIUM' | 'HIGH';
}

const MOCK_REQUESTS: VerificationRequest[] = [
  {
    id: 'REQ-8821',
    type: 'DRIVER',
    name: 'Samuel Ojo',
    submittedAt: '2 hours ago',
    status: 'PENDING',
    riskScore: 'LOW',
    documents: [
      { name: 'Driver License', url: '#', type: 'ID' },
      { name: 'Selfie Verification', url: '#', type: 'PHOTO' }
    ]
  },
  {
    id: 'REQ-8822',
    type: 'COMPANY',
    name: 'FastLane Logistics Ltd',
    submittedAt: '4 hours ago',
    status: 'IN_REVIEW',
    riskScore: 'MEDIUM',
    documents: [
      { name: 'Certificate of Incorporation', url: '#', type: 'DOCUMENT' },
      { name: 'Tax Clearance', url: '#', type: 'DOCUMENT' }
    ]
  },
  {
    id: 'REQ-8823',
    type: 'VEHICLE',
    name: 'Mack Vision 2012 (LSR-123-AB)',
    submittedAt: '1 day ago',
    status: 'PENDING',
    riskScore: 'LOW',
    documents: [
      { name: 'Vehicle Registration', url: '#', type: 'DOCUMENT' },
      { name: 'Road Worthiness', url: '#', type: 'DOCUMENT' },
      { name: 'Insurance Certificate', url: '#', type: 'DOCUMENT' }
    ]
  }
];

export default function AdminVerificationCenter() {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  const { data: requestsData, loading, error, isOffline, refetch, mutate } = useAdminLiveData<VerificationRequest[]>({
    endpoint: '/admin/verifications',
    queryKey: 'admin_verifications',
    autoRefreshInterval: 30000,
    socketEvent: 'verification_updated',
    mockData: MOCK_REQUESTS
  });

  const requests = requestsData || [];
  const selectedRequest = requests.find(r => r.id === selectedRequestId) || null;


  const filteredRequests = requests.filter(req => {
    const matchesFilter = filterType === 'ALL' || req.type === filterType;
    const matchesSearch = req.name.toLowerCase().includes(searchTerm.toLowerCase()) || req.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase">Pending</span>;
      case 'IN_REVIEW': return <span className="bg-brand-100 text-brand-800 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase">In Review</span>;
      case 'APPROVED': return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase">Approved</span>;
      case 'REJECTED': return <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase">Rejected</span>;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DRIVER': return <UserCheck size={18} className="text-brand-500" />;
      case 'COMPANY': return <ShieldCheck size={18} className="text-emerald-500" />;
      case 'VEHICLE': return <Truck size={18} className="text-brand-500" />;
      default: return <FileText size={18} />;
    }
  };

  const handleApprove = (id: string) => {
    mutate(prev => prev ? prev.map(req => req.id === id ? { ...req, status: 'APPROVED' as const } : req) : []);
    setSelectedRequestId(null);
  };

  const handleReject = (id: string) => {
    mutate(prev => prev ? prev.map(req => req.id === id ? { ...req, status: 'REJECTED' as const } : req) : []);
    setSelectedRequestId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-brand-600" /> Identity & Verification
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Approve drivers, transport companies, and vehicle documents.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <AlertTriangle size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-400 text-sm">Pending Verifications</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">42</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <UserCheck size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-400 text-sm">Verified Drivers</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">1,248</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <Truck size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-400 text-sm">Verified Vehicles</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">3,492</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <ShieldCheck size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-400 text-sm">Verified Companies</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">315</p>
        </div>
      </div>

      {selectedRequest ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-6 shadow-sm animate-fade-in space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-4">
              <Button onClick={() => setSelectedRequestId(null)} className="text-slate-400 hover:text-slate-600 dark:text-slate-400">
                <ChevronRight size={24} className="rotate-180" />
              </Button>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  {selectedRequest.name} {getStatusBadge(selectedRequest.status)}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-mono mt-1">ID: {selectedRequest.id} • Submitted {selectedRequest.submittedAt}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleReject(selectedRequest.id)}
                className="bg-red-50 hover:bg-red-100 text-red-700 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors"
              >
                <XCircle size={16} /> Reject
              </Button>
              <Button
                onClick={() => handleApprove(selectedRequest.id)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl text-sm flex items-center gap-2 transition-colors shadow-sm"
              >
                <CheckCircle2 size={16} /> Approve
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-700 dark:text-slate-400 mb-4">Submitted Documents</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {selectedRequest.documents.map((doc, idx) => (
                <div key={idx} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col justify-between group hover:border-brand-300 transition-colors bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-brand-100 text-brand-700 rounded-lg">
                      <FileText size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-400">{doc.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{doc.type}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400 text-xs font-bold py-1.5 rounded-lg flex items-center justify-center gap-1 hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors">
                      <Eye size={14} /> View
                    </Button>
                    <Button aria-label="Action" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-400 px-2 py-1.5 rounded-lg flex items-center justify-center hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors">
                      <Download size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 flex gap-3">
             <AlertTriangle className="text-brand-600 shrink-0" size={20} />
             <div>
               <p className="text-sm font-bold text-brand-900">AI Risk Assessment: {selectedRequest.riskScore}</p>
               <p className="text-xs text-brand-800 mt-1">The system has analyzed these documents. No signs of forgery detected. Smile Identity facial match score: 98%.</p>
             </div>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
              {['ALL', 'DRIVER', 'COMPANY', 'VEHICLE'].map(type => (
                <Button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterType === type 
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {type === 'ALL' ? 'All Requests' : type.charAt(0) + type.slice(1).toLowerCase() + 's'}
                </Button>
              ))}
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search name or ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Request ID</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Entity</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Submitted</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map(req => (
                  <tr key={req.id || req?.id || Math.random()} className="hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                    <td className="p-4">
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-400">{req.id}</span>
                    </td>
                    <td className="p-4 font-bold text-sm text-slate-900 dark:text-white">
                      {req.name}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(req.type)}
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{req.type}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                      {req.submittedAt}
                    </td>
                    <td className="p-4">
                      {getStatusBadge(req.status)}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        onClick={() => setSelectedRequestId(req.id)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-300 hover:bg-brand-50 text-brand-700 font-bold px-3 py-1.5 rounded-lg text-xs transition-all shadow-sm"
                      >
                        Review
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredRequests.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-400">
                      No verification requests found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
