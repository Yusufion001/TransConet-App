import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Users, Key, Search, Edit2, Trash2, Plus, Loader2, Save, X } from 'lucide-react';
import { Button } from './ui/Button';
import api from '../api/client';

interface AdminUser {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export default function AdminRolePermission() {
  const [activeTab, setActiveTab] = useState<'USERS' | 'ROLES'>('USERS');
  const [searchTerm, setSearchTerm] = useState('');
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingAdmin, setEditingAdmin] = useState<Partial<AdminUser> | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const roles = [
    'SUPER_ADMIN', 'PLATFORM_ADMIN', 'COMPLIANCE_ADMIN', 
    'FINANCE_ADMIN', 'SUPPORT_ADMIN', 'DEVELOPER'
  ];

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/management', { withCredentials: true });
      setAdmins(data);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAdmin = async () => {
    if (!editingAdmin?.email || !editingAdmin?.role) return;
    
    try {
      setSaving(true);
      if (editingAdmin.id) {
        // Update
        await api.put(`/admin/management/${editingAdmin.id}`, {
          email: editingAdmin.email,
          role: editingAdmin.role,
          isActive: editingAdmin.isActive,
          password: editPassword || undefined
        }, { withCredentials: true });
      } else {
        // Create
        if (!editPassword) {
          alert('Password is required for new admin');
          setSaving(false);
          return;
        }
        await api.post('/admin/management', {
          email: editingAdmin.email,
          role: editingAdmin.role,
          password: editPassword
        }, { withCredentials: true });
      }
      setIsModalOpen(false);
      setEditingAdmin(null);
      setEditPassword('');
      fetchAdmins();
    } catch (err: any) {
      alert((typeof err.response?.data?.error === 'object' ? JSON.stringify(err.response?.data?.error) : err.response?.data?.error) || 'Failed to save admin');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admin?')) return;
    try {
      await api.delete(`/admin/management/${id}`, { withCredentials: true });
      fetchAdmins();
    } catch (err: any) {
      alert((typeof err.response?.data?.error === 'object' ? JSON.stringify(err.response?.data?.error) : err.response?.data?.error) || 'Failed to delete admin');
    }
  };

  const openNewAdminModal = () => {
    setEditingAdmin({ email: '', role: 'SUPPORT_ADMIN', isActive: true });
    setEditPassword('');
    setIsModalOpen(true);
  };

  const openEditModal = (admin: AdminUser) => {
    setEditingAdmin(admin);
    setEditPassword('');
    setIsModalOpen(true);
  };

  const filteredAdmins = admins.filter(a => a.email.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Admin Management</h2>
          <p className="text-sm text-slate-500 dark:text-slate- mt-1">Manage system administrators and their roles</p>
        </div>
        
        <Button onClick={openNewAdminModal} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 flex items-center gap-2 text-sm font-bold shadow-sm transition">
          <Plus size={16} /> New Admin
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Total Admins</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{admins.length}</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Shield size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate- text-sm">Active Roles</h3>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{new Set(admins.map(a => a.role)).size}</p>
        </div>
        
        <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-slate-800 text-indigo-400 rounded-xl">
              <ShieldAlert size={20} />
            </div>
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Super Admins</h3>
          </div>
          <p className="text-3xl font-black">{admins.filter(a => a.role === 'SUPER_ADMIN').length}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit overflow-x-auto hide-scrollbar">
            <Button
              onClick={() => setActiveTab('USERS')}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === 'USERS' 
                  ? 'bg-blue-600 text-white shadow-md border border-transparent' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <Users size={16} /> Admin Users
            </Button>
          </div>
          
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>
          ) : (
            <table className="w-full text-left border-collapse animate-fade-in">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Email</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Role</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider">Last Login</th>
                  <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate- uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdmins.map(admin => (
                  <tr key={admin.id || admin?.id || Math.random()} className="hover:bg-blue-50 cursor-pointer hover:shadow-sm transition-colors border-b border-slate-100 dark:border-slate-800">
                    <td className="p-4">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{admin.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-indigo-50 text-indigo-700 font-bold px-3 py-1 rounded-lg text-xs">
                        {admin.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${admin.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-500 dark:text-slate-">
                      {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'Never'}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button onClick={() => openEditModal(admin)} aria-label="Action" className="text-slate-400 dark:text-slate-400 hover:text-indigo-600 transition-colors p-2 rounded-lg hover:bg-indigo-50">
                           <Edit2 size={16} />
                        </Button>
                        <Button onClick={() => handleDeleteAdmin(admin.id)} aria-label="Action" className="text-slate-400 dark:text-slate-400 hover:text-red-600 transition-colors p-2 rounded-lg hover:bg-red-50">
                           <Trash2 size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredAdmins.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500 dark:text-slate-">
                      No admins found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {isModalOpen && editingAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-black text-xl text-slate-900 dark:text-white">
                {editingAdmin.id ? 'Edit Admin' : 'New Admin'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:text-slate- p-2 rounded-full hover:bg-slate-100 dark:bg-slate-800 transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate- mb-1.5 uppercase">Email Address</label>
                <input 
                  type="email" 
                  value={editingAdmin.email}
                  onChange={(e) => setEditingAdmin({...editingAdmin, email: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  placeholder="admin@example.com"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate- mb-1.5 uppercase">Admin Role</label>
                <select 
                  value={editingAdmin.role}
                  onChange={(e) => setEditingAdmin({...editingAdmin, role: e.target.value})}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition appearance-none"
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{role.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate- mb-1.5 uppercase">
                  {editingAdmin.id ? 'New Password (leave blank to keep current)' : 'Password'}
                </label>
                <input 
                  type="password" 
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                  placeholder="••••••••"
                />
              </div>

              {editingAdmin.id && (
                <div className="flex items-center gap-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="isActive"
                    checked={editingAdmin.isActive}
                    onChange={(e) => setEditingAdmin({...editingAdmin, isActive: e.target.checked})}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isActive" className="text-sm font-bold text-slate-700 dark:text-slate-">Account Active</label>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex justify-end gap-3">
              <Button 
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 dark:text-slate- hover:bg-slate-200 transition"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveAdmin}
                disabled={saving || (!editingAdmin.id && !editPassword)}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm flex items-center gap-2 transition disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Admin
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
