// src/components/AdminAlertCenter.tsx
import React, { useState } from 'react';
import { useAdminLiveData } from '../hooks/useAdminLiveData';
import { Button } from './ui/Button';
import { 
  AlertTriangle, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Database, 
  Copy, 
  FileText, 
  Terminal, 
  Server, 
  HelpCircle, 
  ShieldAlert, 
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DiagnosticIssue {
  id: string;
  service: 'database' | 'storage' | 'realtime' | 'auth' | 'general';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  consequence: string;
  resolution: string;
  sqlFix?: string;
}

interface TableStatus {
  exists: boolean;
  rows: number;
  error?: string;
}

interface DiagnosticsData {
  success: boolean;
  diagnosedAt: string;
  durationMs: number;
  healthScore: 'HEALTHY' | 'STABLE_WITH_WARNINGS' | 'DEGRADED';
  status: {
    latencyMs: number;
    authHealthy: boolean;
    database: string;
    storage: string;
    storageBuckets: string[];
  };
  tables: Record<string, TableStatus>;
  issues: DiagnosticIssue[];
}

export default function AdminAlertCenter() {
  const { data: rawData, loading, error, refetch } = useAdminLiveData<DiagnosticsData>({
    endpoint: '/admin/supabase-diagnostics',
    queryKey: 'admin-diagnostics'
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'INFO'>('ALL');
  const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

  // Simulation controls to demonstrate high-fidelity states to stakeholders/developers
  const [simulations, setSimulations] = useState({
    missingTables: false,
    privateBucket: false,
    authTimeout: false,
    emptyApiKeys: false
  });

  const getSimulatedData = () => {
    if (!rawData) return null;
    
    let diagData = { ...rawData };
    
    // Apply frontend simulations if any are toggled active
    if (simulations.emptyApiKeys) {
      diagData = {
        ...diagData,
        healthScore: 'DEGRADED',
        status: {
          ...diagData.status,
          latencyMs: 0,
          authHealthy: false,
          database: 'unconfigured',
          storage: 'unconfigured'
        },
        issues: [
          {
            id: 'sim-missing-url',
            service: 'general',
            severity: 'critical',
            title: 'Supabase URL Credentials Missing (Simulated)',
            description: 'The API server cannot connect to any cloud instances because the credentials are null.',
            consequence: 'All file uploads and driver document verification actions are blocked.',
            resolution: 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your env variables.'
          },
          ...diagData.issues.filter(i => i.id !== 'simulation-active')
        ]
      };
      return diagData;
    } 

    // Inject active simulations into the payload
    let simulatedIssues = [...diagData.issues];
    let simulatedTables = { ...diagData.tables };
    let simulatedStatus = { ...diagData.status };
    let simulatedHealthScore = diagData.healthScore;

    if (simulations.missingTables) {
      simulatedHealthScore = 'DEGRADED';
      simulatedStatus.database = 'degraded';
      // Make tables missing
      Object.keys(simulatedTables).forEach(tbl => {
        simulatedTables[tbl] = { exists: false, rows: 0, error: 'Relation does not exist (Simulated Error)' };
      });
      simulatedIssues.push({
        id: 'sim-missing-tables',
        service: 'database',
        severity: 'critical',
        title: 'Supabase Database Table Roster Missing (Simulated)',
        description: 'The core postgres schema is completely uninitialized. Queries fail with 42P01: relation not found.',
        consequence: 'Database reads and writes fail instantly. All user activities, cargo matching, and tracking dashboards will fail.',
        resolution: 'Go to your Supabase SQL Editor and execute the complete schema setup script.',
        sqlFix: `-- Create missing core schema tables:
CREATE TABLE IF NOT EXISTS public."User" (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE,
  email TEXT,
  role TEXT DEFAULT 'CUSTOMER',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public."LoadPosting" (
  id TEXT PRIMARY KEY,
  title TEXT,
  origin TEXT,
  destination TEXT,
  weight NUMERIC,
  status TEXT DEFAULT 'AVAILABLE',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);`
      });
    }

    if (simulations.privateBucket) {
      if (simulatedHealthScore === 'HEALTHY') {
        simulatedHealthScore = 'STABLE_WITH_WARNINGS';
      }
      simulatedStatus.storage = 'degraded';
      simulatedIssues.push({
        id: 'sim-private-bucket',
        service: 'storage',
        severity: 'warning',
        title: 'Media Buckets Configured as Private (Simulated)',
        description: 'The required public buckets driver-documents and operational-media exist but have restricted RLS policies.',
        consequence: 'Uploaded file links shown on the admin portal or client receipts will crash with 403 Access Denied messages.',
        resolution: 'Update your Supabase storage policies to permit public read downloads on documents.',
        sqlFix: `-- Grant public select permission to any anonymous readers
CREATE POLICY "Public Read Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'driver-documents');`
      });
    }

    if (simulations.authTimeout) {
      simulatedHealthScore = 'DEGRADED';
      simulatedStatus.authHealthy = false;
      simulatedStatus.latencyMs = 5000;
      simulatedIssues.push({
        id: 'sim-auth-timeout',
        service: 'auth',
        severity: 'critical',
        title: 'Supabase Handshake Gateway Timeout (Simulated)',
        description: 'The authentication server did not respond within the 5000ms ping timeout constraint.',
        consequence: 'Users attempting to login, sign up, or verify OTP codes will experience severe lag and timeout errors.',
        resolution: 'Ensure the Supabase cloud cluster is not currently undergoing maintenance or paused.'
      });
    }

    return {
      ...diagData,
      healthScore: simulatedHealthScore,
      status: simulatedStatus,
      tables: simulatedTables,
      issues: simulatedIssues
    };
  };

  const data = getSimulatedData();
  const scanError = error;

  const handleCopySql = (sqlText: string, id: string) => {
    navigator.clipboard.writeText(sqlText);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/10 text-red-400 border border-red-500/30';
      case 'warning':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/30';
      case 'info':
        return 'bg-brand-500/10 text-brand-400 border border-brand-500/30';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/30';
    }
  };

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'database':
        return <Database size={14} className="text-amber-500" />;
      case 'storage':
        return <Server size={14} className="text-emerald-500" />;
      case 'auth':
        return <ShieldAlert size={14} className="text-brand-500" />;
      case 'realtime':
        return <Terminal size={14} className="text-sky-500" />;
      default:
        return <Server size={14} className="text-slate-500 dark:text-slate-400" />;
    }
  };

  const filteredIssues = data?.issues.filter(issue => {
    if (filterSeverity === 'ALL') return true;
    return issue.severity.toUpperCase() === filterSeverity;
  }) || [];

  return (
    <div id="admin-error-center" className="space-y-6 animate-fade-in">
      {/* Header card */}
      <div className="bg-slate-900 border border-slate-800 rounded-[20px] p-6 relative overflow-hidden shadow-sm text-white">
        <div className="absolute top-0 right-0 p-6 opacity-5">
          <Terminal size={140} className="text-white" />
        </div>
        <div className="relative space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-400 text-[10px] font-bold px-3 py-1 rounded-full border border-red-500/30 uppercase tracking-widest">
            <Terminal size={12} /> SUPABASE INTEGRITY MONITOR
          </div>
          <h2 className="text-2xl font-black text-slate-100 dark:text-slate-300 flex items-center gap-2 font-mono">
            Error & Warning Center
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-400 max-w-3xl leading-relaxed">
            Real-time diagnostics suite for monitoring connection integrity, storage bucket statuses, Row-Level Security (RLS) constraints, and table counts on your Supabase backend. Troubleshoot issues instantly and get exact SQL remedies.
          </p>
        </div>
      </div>

      {scanError && (
        <div className="bg-red-950/40 border border-red-500/40 text-red-200 text-xs p-4 rounded-2xl animate-fade-in flex items-center gap-3">
          <AlertTriangle className="text-red-400 shrink-0" size={18} />
          <span>{scanError?.message || scanError.toString()}</span>
        </div>
      )}

      {/* Grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: Diagnostics Scoreboard & Simulation Toggles */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Health Score Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm space-y-5">
            <div className="flex justify-between items-center">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Server size={14} className="text-brand-600" /> Infrastructure Health
              </h3>
              <Button aria-label="Action" 
                onClick={() => refetch()} 
                disabled={loading}
                className="p-1.5 hover:bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg transition"
                title="Force refresh diagnostics"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin text-brand-600' : ''} />
              </Button>
            </div>

            {data ? (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 font-mono uppercase tracking-widest mb-1">Health Score</span>
                  
                  {data.healthScore === 'HEALTHY' && (
                    <div className="space-y-1">
                      <div className="text-lg font-black text-emerald-600 flex items-center gap-1.5 justify-center">
                        <CheckCircle size={20} className="text-emerald-500" /> HEALTHY
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">All cloud systems fully operational.</p>
                    </div>
                  )}

                  {data.healthScore === 'STABLE_WITH_WARNINGS' && (
                    <div className="space-y-1">
                      <div className="text-lg font-black text-amber-600 flex items-center gap-1.5 justify-center">
                        <AlertTriangle size={20} className="text-amber-500" /> WARNINGS ACTIVE
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Minor issues found, storage/replication limited.</p>
                    </div>
                  )}

                  {data.healthScore === 'DEGRADED' && (
                    <div className="space-y-1">
                      <div className="text-lg font-black text-red-600 flex items-center gap-1.5 justify-center">
                        <AlertCircle size={20} className="text-red-500" /> DEGRADED
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Critical errors blocking essential components.</p>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-3 rounded-xl">
                    <span className="text-[9px] text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Latency</span>
                    <span className="text-sm font-extrabold text-slate-700 dark:text-slate-400 font-mono">
                      {data.status.latencyMs > 0 ? `${data.status.latencyMs}ms` : 'Offline/Mock'}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-3 rounded-xl">
                    <span className="text-[9px] text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Auth Handshake</span>
                    <span className={`text-xs font-bold block ${data.status.authHealthy ? 'text-emerald-600' : 'text-red-500'}`}>
                      {data.status.authHealthy ? 'Pass' : 'Failed'}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-3 rounded-xl">
                    <span className="text-[9px] text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Database Mode</span>
                    <span className={`text-xs font-bold uppercase block ${data.status.database === 'operational' ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {data.status.database}
                    </span>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-3 rounded-xl">
                    <span className="text-[9px] text-slate-400 dark:text-slate-400 uppercase tracking-wider block">Storage Status</span>
                    <span className={`text-xs font-bold uppercase block ${data.status.storage === 'operational' ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {data.status.storage}
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 dark:text-slate-400 flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 font-mono">
                  <span>Last Scanned:</span>
                  <span>{new Date(data.diagnosedAt).toTimeString().split(' ')[0]}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
                Scanning backend infrastructure...
              </div>
            )}
          </div>

          {/* Simulation Playground Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="text-brand-500" size={14} /> Diagnostic Playground
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
              Toggle specific backend failures below to test how the Error Center detects, warns, and guides resolution. Great for demonstrating app robustness!
            </p>

            <div className="space-y-2 pt-2">
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-brand-50 cursor-pointer transition">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-400">Simulate Missing Tables</span>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400">Fakes complete postgres schema deletion</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={simulations.missingTables} 
                  onChange={(e) => setSimulations(prev => ({ ...prev, missingTables: e.target.checked }))}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-brand-50 cursor-pointer transition">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-400">Simulate Private Buckets</span>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400">Triggers warnings on bucket permission levels</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={simulations.privateBucket} 
                  onChange={(e) => setSimulations(prev => ({ ...prev, privateBucket: e.target.checked }))}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-brand-50 cursor-pointer transition">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-400">Simulate Auth Timeout</span>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400">Simulates high-latency auth engine delay</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={simulations.authTimeout} 
                  onChange={(e) => setSimulations(prev => ({ ...prev, authTimeout: e.target.checked }))}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-brand-50 cursor-pointer transition">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-400">Simulate Unconfigured State</span>
                  <p className="text-[9px] text-slate-500 dark:text-slate-400">Simulates zero API keys in local workspace</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={simulations.emptyApiKeys} 
                  onChange={(e) => setSimulations(prev => ({ ...prev, emptyApiKeys: e.target.checked }))}
                  className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                />
              </label>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Database Tables Grid & Issues Feed */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Table Diagnostics Grid */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm space-y-4">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Layers size={14} className="text-amber-500" /> Database Table Diagnostics
            </h3>
            
            {data ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(Object.entries(data.tables) as [string, TableStatus][]).map(([tableName, status]) => (
                  <div key={tableName} className="border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-400 font-mono">{tableName}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] font-medium text-slate-400 dark:text-slate-400 font-mono">
                          {status.exists ? `${status.rows} rows populated` : 'No connection'}
                        </span>
                      </div>
                    </div>

                    <div>
                      {status.exists ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">
                          Active & Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md border border-red-100" title={status.error}>
                          Relation Missing
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-400 font-mono">
                Querying Supabase relations...
              </div>
            )}
          </div>

          {/* Core Detected Issues Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-5 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <AlertTriangle size={15} className="text-red-500" /> Detected Warnings & Recommendations
              </h3>

              {/* Filters */}
              <div className="flex flex-wrap gap-1">
                {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((sev) => (
                  <Button
                    key={sev}
                    onClick={() => setFilterSeverity(sev)}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all border ${
                      filterSeverity === sev
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {sev}
                  </Button>
                ))}
              </div>
            </div>

            {/* List of issues */}
            <div className="space-y-4">
              {filteredIssues.length > 0 ? (
                filteredIssues.map((issue) => (
                  <div 
                    key={issue.id} 
                    className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm hover:border-slate-300 transition"
                  >
                    {/* Collapsed Header */}
                    <div 
                      onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                      className="p-4 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/50 cursor-pointer flex items-start justify-between gap-4 transition"
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          {getServiceIcon(issue.service)}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">{issue.title}</span>
                            <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${getSeverityBadgeColor(issue.severity)}`}>
                              {issue.severity}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider font-mono text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded font-bold">
                              {issue.service}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
                            {issue.description}
                          </p>
                        </div>
                      </div>

                      <Button className="text-slate-400 hover:text-slate-600 dark:text-slate-400 self-center">
                        {expandedIssue === issue.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </Button>
                    </div>

                    {/* Expanded Details Body */}
                    {expandedIssue === issue.id && (
                      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-4 text-xs leading-relaxed animate-fade-in">
                        {/* Consequence card */}
                        <div className="bg-red-50/50 border border-red-100 p-3 rounded-lg text-slate-800 dark:text-slate-400">
                          <strong className="text-red-700 block text-[10px] uppercase font-bold tracking-wider mb-1">
                            ⚠️ App/Platform Impact:
                          </strong>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">{issue.consequence}</p>
                        </div>

                        {/* Resolution instructions */}
                        <div className="space-y-1 text-slate-800 dark:text-slate-400">
                          <strong className="text-brand-700 block text-[10px] uppercase font-bold tracking-wider mb-1">
                            💡 Recommended Troubleshooting Steps:
                          </strong>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">{issue.resolution}</p>
                        </div>

                        {/* SQL copy snippet */}
                        {issue.sqlFix && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-400 font-mono tracking-wide">
                                COPYABLE SQL DIAGNOSTIC REMEDY:
                              </span>
                              <Button 
                                onClick={() => handleCopySql(issue.sqlFix || '', issue.id)}
                                className="flex items-center gap-1.5 text-[10px] font-bold text-brand-600 hover:text-brand-800 px-2 py-1 rounded bg-brand-50 hover:bg-brand-100 transition"
                              >
                                <Copy size={11} />
                                {copiedId === issue.id ? 'Copied to Clipboard!' : 'Copy SQL Script'}
                              </Button>
                            </div>
                            <pre className="bg-slate-900 text-slate-200 dark:text-slate-300 p-3.5 rounded-lg text-[10px] font-mono overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
                              {issue.sqlFix}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                  <CheckCircle size={28} className="text-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-400">No matching issues found!</span>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 max-w-xs">Your checked filters contain clean bills of health. Use the playground options to simulate specific warnings.</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
