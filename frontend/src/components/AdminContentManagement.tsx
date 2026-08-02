import React, { useState, useEffect } from 'react';
import { FileText, Image, Newspaper, HelpCircle, Shield, Plus, Edit2, Trash2, Eye, Layout, ChevronRight, Check, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { useAdminLiveData } from '../hooks/useAdminLiveData';

interface ContentItem {
  id: string;
  type: 'BANNER' | 'NEWS' | 'HELP_ARTICLE' | 'FAQ' | 'POLICY' | 'USER_GUIDE' | 'LEGAL';
  title: string;
  status: 'PUBLISHED' | 'DRAFT' | 'ARCHIVED';
  lastUpdated: string;
  author: string;
  category?: string;
}

export default function AdminContentManagement() {
  const { data: contentData, loading } = useAdminLiveData<any>({
    endpoint: '/admin/content',
    queryKey: 'admin-content',
    mockData: { articles: [], totalPublished: 0, totalDrafts: 0 }
  });

  const [contentList, setContentList] = useState<ContentItem[]>([]);

  useEffect(() => {
    if (contentData?.articles) {
      setContentList(contentData.articles.map((a: any) => ({
        ...a,
        type: a.category || 'FAQ'
      })));
    }
  }, [contentData]);

  const [activeTab, setActiveTab] = useState<'ALL' | 'BANNER' | 'NEWS' | 'HELP_ARTICLE' | 'FAQ' | 'POLICY' | 'USER_GUIDE' | 'LEGAL'>('ALL');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  const filteredContent = contentList.filter(item => activeTab === 'ALL' || item.type === activeTab);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Published</span>;
      case 'DRAFT': return <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Draft</span>;
      case 'ARCHIVED': return <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-[10px] font-black uppercase">Archived</span>;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BANNER': return <Image size={16} className="text-pink-500" />;
      case 'NEWS': return <Newspaper size={16} className="text-brand-500" />;
      case 'HELP_ARTICLE': 
      case 'USER_GUIDE': return <Layout size={16} className="text-brand-500" />;
      case 'FAQ': return <HelpCircle size={16} className="text-amber-500" />;
      case 'POLICY': 
      case 'LEGAL': return <Shield size={16} className="text-emerald-500" />;
      default: return <FileText size={16} />;
    }
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setIsEditorOpen(true);
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setIsEditorOpen(true);
  };

  const closeEditor = () => {
    setIsEditorOpen(false);
    setEditingItem(null);
  };

  const deleteItem = (id: string) => {
    setContentList(prev => prev.filter(item => item.id !== id));
  };

  if (loading && contentList.length === 0) {
    return <div className="py-12 flex justify-center text-slate-500"><Loader2 className="animate-spin" size={24} /></div>;
  }

  if (isEditorOpen) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] p-6 shadow-sm animate-fade-in">
        <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <Button aria-label="Action" onClick={closeEditor} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 transition-colors">
            <ChevronRight size={24} className="rotate-180" />
          </Button>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {editingItem ? 'Edit Content' : 'Create New Content'}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{editingItem ? `Editing ${editingItem.title}` : 'Drafting a new entry'}</p>
          </div>
        </div>

        <div className="space-y-4 max-w-3xl">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Content Type</label>
            <select className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500">
              <option value="BANNER">Homepage Banner</option>
              <option value="NEWS">News & Announcement</option>
              <option value="HELP_ARTICLE">Help Center Article</option>
              <option value="FAQ">FAQ</option>
              <option value="POLICY">Terms & Privacy Policy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Title</label>
            <input type="text" defaultValue={editingItem?.title || ''} className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="Enter title..." />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-400 mb-1">Content Body (Markdown/HTML supported)</label>
            <textarea rows={10} className="w-full border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2 text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" placeholder="Write content here..."></textarea>
          </div>
          <div className="flex gap-2 pt-4">
            <Button onClick={closeEditor} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-400 font-bold px-6 py-2 rounded-xl text-sm transition-colors">Cancel</Button>
            <Button className="bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-2 rounded-xl text-sm transition-colors flex items-center gap-2">
              <Check size={16} /> Save & Publish
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <FileText className="text-brand-600" /> Content Management
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage banners, news, FAQs, and policies.</p>
        </div>
        <Button onClick={handleCreateNew} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm">
          <Plus size={16} /> Create Content
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-[20px] shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {[
              { id: 'ALL', label: 'All Content' },
              { id: 'BANNER', label: 'Banners' },
              { id: 'NEWS', label: 'News' },
              { id: 'HELP_ARTICLE', label: 'Help Articles' },
              { id: 'FAQ', label: 'FAQs' },
              { id: 'POLICY', label: 'Policies' },
            ].map(tab => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-brand-600 text-white shadow-md border border-transparent' 
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:text-slate-200 border border-transparent'
                }`}
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Title</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Updated</th>
                <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContent.map(item => (
                <tr key={item.id || item?.id || Math.random()} className="hover:bg-brand-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                  <td className="p-4">
                    <div className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{item.id} • {item.author}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(item.type)}
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.type.replace('_', ' ')}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400">
                    {item.lastUpdated}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button aria-label="Action" className="p-2 text-slate-400 dark:text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                        <Eye size={16} />
                      </Button>
                      <Button onClick={() => handleEdit(item)} className="p-2 text-slate-400 dark:text-slate-400 hover:text-brand-600 hover:bg-brand-50 cursor-pointer hover:shadow-sm rounded-lg transition-colors">
                        <Edit2 size={16} />
                      </Button>
                      <Button onClick={() => deleteItem(item.id)} className="p-2 text-slate-400 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredContent.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
                    No content found in this category.
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
