import React, { useState } from 'react';
import { useAdminLiveData } from '../hooks/useAdminLiveData';
import { FileText, Download, Filter, Calendar, BarChart2, PieChart, TrendingUp, Clock, Plus, Settings, RefreshCw, Loader2, Activity } from 'lucide-react';
import { Button } from './ui/Button';

interface Report {
  id: string;
  name: string;
  type: 'FINANCIAL' | 'OPERATIONAL' | 'USER_ACTIVITY' | 'SYSTEM_HEALTH';
  format: 'PDF' | 'CSV' | 'EXCEL';
  status: 'READY' | 'GENERATING' | 'FAILED';
  generatedAt: string;
  size: string;
}

export default function AdminReportsCenter() {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: reportsData, loading, error, isOffline, refetch } = useAdminLiveData<Report[]>({
    endpoint: '/admin/reports',
    queryKey: 'admin_reports',
    autoRefreshInterval: 60000,
    socketEvent: 'report_updated',
    mockData: []
  });

  const reports = reportsData || [];


  const filteredReports = reports.filter(r => filterType === 'ALL' || r.type === filterType);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'READY': return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit">Ready</span>;
      case 'GENERATING': return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><RefreshCw size={10} className="animate-spin" /> Generating</span>;
      case 'FAILED': return <span className="bg-red-100 text-red-800 px-2.5 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit">Failed</span>;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'FINANCIAL': return <PieChart size={16} className="text-brand-500" />;
      case 'OPERATIONAL': return <TrendingUp size={16} className="text-emerald-500" />;
      case 'USER_ACTIVITY': return <BarChart2 size={16} className="text-brand-500" />;
      case 'SYSTEM_HEALTH': return <Activity size={16} className="text-amber-500" />;
      default: return <FileText size={16} />;
    }
  };

  if (loading && reports.length === 0) {
    return <div className="py-12 flex justify-center text-slate-500"><Loader2 className="animate-spin" size={24} /></div>;
  }

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newReport: Report = {
        id: `RPT-${10025 + Math.floor(Math.random() * 100)}`,
        name: 'Custom Ad-hoc Report',
        type: 'OPERATIONAL',
        format: 'PDF',
        status: 'READY',
        generatedAt: 'Just now',
        size: '1.1 MB'
      };
      refetch();
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="text-brand-600" /> Reports Center
          </h2>
          <p className="text-slate-500 dark:text-slate- text-sm mt-1">Generate, schedule, and download advanced analytics and system reports.</p>
        </div>
        <div className="flex gap-2">
          <Button className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate- hover:bg-brand-50 cursor-pointer hover:shadow-sm px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
            <Calendar size={16} /> Scheduled Reports
          </Button>
          <Button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            {isGenerating ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />}
            {isGenerating ? 'Generating...' : 'Generate New'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <FileText size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Generated This Month</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">142</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Calendar size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Active Schedules</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">18</p>
        </div>
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-800 text-brand-400 rounded-xl">
              <TrendingUp size={20} />
            </div>
            <h3 className="font-bold text-slate-300 dark:text-slate-300 text-sm">Most Exported Metric</h3>
          </div>
          <p className="text-xl font-black text-white mt-1">Revenue by Region</p>
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">45 exports this week</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit overflow-x-auto hide-scrollbar">
            {['ALL', 'FINANCIAL', 'OPERATIONAL', 'USER_ACTIVITY', 'SYSTEM_HEALTH'].map(type => (
              <Button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  filterType === type 
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200'
                }`}
              >
                {type === 'ALL' ? 'All Reports' : type.replace('_', ' ')}
              </Button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Button className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 p-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 flex items-center gap-2 text-sm font-bold">
              <Filter size={16} /> Filters
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse animate-fade-in">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Report Name & ID</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Format</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Generated</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.map(report => (
                <tr key={report.id || report?.id || Math.random()} className="hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                  <td className="p-4">
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{report.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate- font-mono mt-0.5">{report.id}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate- font-medium text-xs">
                      {getTypeIcon(report.type)}
                      {report.type.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                      report.format === 'PDF' ? 'bg-red-50 text-red-700' :
                      report.format === 'CSV' ? 'bg-brand-50 text-brand-700' :
                      'bg-emerald-50 text-emerald-700'
                    }`}>
                      {report.format}
                    </span>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(report.status)}
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-slate-700 dark:text-slate-">{report.generatedAt}</div>
                    <div className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">{report.size}</div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button aria-label="Action" 
                        className={`p-2 rounded-lg transition-colors ${
                          report.status === 'READY' 
                            ? 'text-slate-500 dark:text-slate-400 hover:text-brand-600 hover:bg-brand-50' 
                            : 'text-slate-300 cursor-not-allowed'
                        }`}
                        title="Download"
                        disabled={report.status !== 'READY'}
                      >
                         <Download size={16} />
                      </Button>
                      <Button aria-label="Action" className="text-slate-400 hover:text-slate-700 dark:text-slate- transition-colors p-2 rounded-lg hover:bg-slate-100 dark:bg-slate-800" title="Options">
                         <Settings size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredReports.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 dark:text-slate-">
                    No reports found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
