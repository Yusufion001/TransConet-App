import React, { useState, useEffect } from 'react';
import { Bot, Sparkles, Brain, Zap, Settings, Activity, Power, BarChart, ChevronRight, Loader2, Info } from 'lucide-react';
import api from '../api/client';
import { Button } from './ui/Button';
import { useAdminLiveData } from '../hooks/useAdminLiveData';

interface AIModel {
  id: string;
  name: string;
  description: string;
  status: 'ACTIVE' | 'TRAINING' | 'INACTIVE';
  accuracy: string;
  requests: string;
  impact: string;
}

export default function AdminAIAutomation() {
  const { data: aiData, loading } = useAdminLiveData<{models: AIModel[], geminiHealth: string}>({
    endpoint: '/admin/ai-models',
    queryKey: 'admin-ai-models',
    mockData: { models: [], geminiHealth: 'Unknown' }
  });

  const [models, setModels] = useState<AIModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [insights, setInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState<boolean>(false);

  useEffect(() => {
    if (aiData?.models) {
      setModels(aiData.models);
    }
  }, [aiData]);

  const generateInsights = async () => {
    try {
      setLoadingInsights(true);
      const response = await api.get('/admin/ai-insights');
      setInsights(response.data.insights || 'No insights available.');
    } catch (error) {
      console.error(error);
      setInsights('Failed to fetch insights.');
    } finally {
      setLoadingInsights(false);
    }
  };

  const toggleStatus = (id: string, currentStatus: string) => {
    if (currentStatus === 'TRAINING') return; // Cannot toggle while training
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setModels(prev => prev.map(m => m.id === id ? { ...m, status: newStatus as any } : m));
    if (selectedModel?.id === id) {
      setSelectedModel(prev => prev ? { ...prev, status: newStatus as any } : null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><Activity size={10} /> Active</span>;
      case 'TRAINING': return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><Brain size={10} className="animate-pulse" /> Training</span>;
      case 'INACTIVE': return <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate- px-2 py-0.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 w-fit"><Power size={10} /> Inactive</span>;
      default: return null;
    }
  };

  if (loading && models.length === 0) {
    return <div className="py-12 flex justify-center text-slate-500"><Loader2 className="animate-spin" size={24} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bot className="text-brand-600" /> AI & Automation
          </h2>
          <p className="text-slate-500 dark:text-slate- text-sm mt-1">Manage intelligent workflows, automated load matching, and pricing engines.</p>
        </div>
        <Button onClick={generateInsights} disabled={loadingInsights} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
          {loadingInsights ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
          Generate AI Insights
        </Button>
      </div>
      
      {insights && (
        <div className="bg-brand-50 border border-brand-100 rounded-2xl p-5 shadow-sm animate-fade-in flex items-start gap-4">
           <div className="p-2 bg-brand-100 text-brand-600 rounded-xl mt-1 shrink-0">
              <Info size={20} />
           </div>
           <div>
              <h3 className="font-bold text-brand-900 mb-1">Generated Analytical Insights</h3>
              <p className="text-sm text-brand-800 whitespace-pre-wrap">{insights}</p>
           </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 text-white border border-brand-400 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white dark:bg-slate-900/20 rounded-xl">
              <Sparkles size={20} />
            </div>
            <h3 className="font-bold text-brand-50 text-sm">Automated Matches</h3>
          </div>
          <p className="text-3xl font-black">12,450</p>
          <p className="text-xs text-brand-200 mt-1">This month</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Zap size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Hours Saved</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">4,280<span className="text-sm text-slate-500 dark:text-slate- font-medium ml-1">hrs</span></p>
          <p className="text-xs text-emerald-600 mt-1 font-medium">+15% vs last month</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
              <Brain size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Avg Model Accuracy</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">93.9%</p>
          <p className="text-xs text-slate-500 dark:text-slate- mt-1">Across all active models</p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Activity size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Total AI Requests</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">1.8M</p>
          <p className="text-xs text-slate-500 dark:text-slate- mt-1">Last 30 days</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm flex-col w-full ${selectedModel ? 'hidden lg:flex lg:w-1/2' : 'flex'}`}>
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
            <h3 className="font-bold text-slate-800 dark:text-slate-">Deployed Models & Workflows</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {models.map(model => (
              <Button
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`w-full text-left p-4 transition-all flex items-start justify-between gap-4 ${
                  selectedModel?.id === model.id 
                    ? 'bg-brand-50/50 border-l-4 border-brand-500' 
                    : 'bg-white dark:bg-slate-900 hover:bg-brand-50 cursor-pointer hover:shadow-sm border-l-4 border-transparent'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 dark:text-white">{model.name}</span>
                    {getStatusBadge(model.status)}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate- line-clamp-2">{model.description}</p>
                </div>
                <ChevronRight size={20} className="text-slate-300 dark:text-slate-300 flex-shrink-0 mt-2" />
              </Button>
            ))}
          </div>
        </div>

        {selectedModel ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm flex flex-col w-full lg:w-1/2 animate-fade-in">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedModel.name}</h3>
                  {getStatusBadge(selectedModel.status)}
                </div>
                <p className="text-slate-500 dark:text-slate- text-sm">{selectedModel.description}</p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate- uppercase mb-1">Accuracy Score</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{selectedModel.accuracy}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate- uppercase mb-1">Request Volume</div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">{selectedModel.requests}</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-800 col-span-2">
                  <div className="text-xs font-bold text-slate-500 dark:text-slate- uppercase mb-1">Business Impact</div>
                  <div className="text-xl font-bold text-brand-600">{selectedModel.impact}</div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                <h4 className="font-bold text-slate-800 dark:text-slate- mb-4">Model Controls</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white text-sm">Enable/Disable Model</div>
                      <div className="text-xs text-slate-500 dark:text-slate-">Toggle whether this AI model is actively running in production.</div>
                    </div>
                    <Button 
                      onClick={() => toggleStatus(selectedModel.id, selectedModel.status)}
                      disabled={selectedModel.status === 'TRAINING'}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${selectedModel.status === 'ACTIVE' ? 'bg-brand-600' : 'bg-slate-300'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 transition-transform ${selectedModel.status === 'ACTIVE' ? 'translate-x-6' : 'translate-x-1'}`} />
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate- font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                      <Settings size={16} /> Configure Parameters
                    </Button>
                    <Button className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate- font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                      <BarChart size={16} /> View Detailed Logs
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-col items-center justify-center w-1/2 border border-dashed border-slate-300 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-400 rounded-full flex items-center justify-center mb-4">
              <Bot size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-">Select an AI Model</h3>
            <p className="text-slate-500 dark:text-slate- text-sm mt-1 max-w-sm text-center">Choose a model from the list to view its metrics, configure parameters, or toggle its status.</p>
          </div>
        )}
      </div>
    </div>
  );
}
