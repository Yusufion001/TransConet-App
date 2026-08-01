const fs = require('fs');
const file = 'src/components/AdminUserManagement.tsx';
let code = fs.readFileSync(file, 'utf8');

const replacement = `
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4 font-bold">User</th>
              <th className="py-3 px-4 font-bold">Role</th>
              <th className="py-3 px-4 font-bold">KYC Level</th>
              <th className="py-3 px-4 font-bold">Documents</th>
              <th className="py-3 px-4 font-bold">Status</th>
              <th className="py-3 px-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                <td className="py-3 px-4">
                  <p className="font-bold text-slate-900">{user.name}</p>
                  <p className="text-[10px] text-slate-500">{user.id}</p>
                </td>
                <td className="py-3 px-4">
                  <span className={\`px-2 py-1 rounded text-[10px] font-bold \${user.role === 'SHIPPER' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}\`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={\`px-2 py-1 rounded-full text-[9px] font-bold tracking-widest \${
                    user.verificationLevel === 'LEVEL_3' ? 'bg-purple-100 text-purple-700' :
                    user.verificationLevel === 'LEVEL_2' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-slate-100 text-slate-600'
                  }\`}>
                    {user.verificationLevel || 'LEVEL_1'}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="flex items-center gap-1 text-xs">
                    {user.docs === 'Verified' ? <ShieldCheck size={14} className="text-emerald-500"/> : <Zap size={14} className="text-amber-500"/>}
                    {user.docs}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={\`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider \${
                    user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 
                    user.status === 'SUSPENDED' ? 'bg-rose-100 text-rose-700' : 
                    'bg-slate-100 text-slate-700'
                  }\`}>
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right flex justify-end gap-2">
                  {user.status === 'PENDING' ? (
                    <button onClick={() => toggleStatus(user.id, user.status)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100" title="Approve">
                      <CheckCircle2 size={16} />
                    </button>
                  ) : user.status === 'ACTIVE' ? (
                    <button onClick={() => toggleStatus(user.id, user.status)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100" title="Suspend">
                      <XCircle size={16} />
                    </button>
                  ) : (
                    <button onClick={() => toggleStatus(user.id, user.status)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100" title="Unsuspend">
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {users.map(user => (
          <div key={user.id} className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-900">{user.name}</p>
                <p className="text-[10px] text-slate-500">{user.id}</p>
              </div>
              <span className={\`px-2 py-1 rounded text-[10px] font-bold \${user.role === 'SHIPPER' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}\`}>
                {user.role}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500 block mb-1 text-[10px] uppercase">KYC Level</span>
                <span className={\`px-2 py-0.5 rounded-full text-[9px] font-bold tracking-widest \${
                  user.verificationLevel === 'LEVEL_3' ? 'bg-purple-100 text-purple-700' :
                  user.verificationLevel === 'LEVEL_2' ? 'bg-indigo-100 text-indigo-700' :
                  'bg-slate-100 text-slate-600'
                }\`}>
                  {user.verificationLevel || 'LEVEL_1'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block mb-1 text-[10px] uppercase">Status</span>
                <span className={\`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider \${
                  user.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 
                  user.status === 'SUSPENDED' ? 'bg-rose-100 text-rose-700' : 
                  'bg-slate-100 text-slate-700'
                }\`}>
                  {user.status}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
              <span className="flex items-center gap-1 text-xs text-slate-700">
                {user.docs === 'Verified' ? <ShieldCheck size={14} className="text-emerald-500"/> : <Zap size={14} className="text-amber-500"/>}
                {user.docs}
              </span>
              <div className="flex gap-2">
                {user.status === 'PENDING' ? (
                  <button onClick={() => toggleStatus(user.id, user.status)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100" title="Approve">
                    <CheckCircle2 size={16} />
                  </button>
                ) : user.status === 'ACTIVE' ? (
                  <button onClick={() => toggleStatus(user.id, user.status)} className="p-1.5 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100" title="Suspend">
                    <XCircle size={16} />
                  </button>
                ) : (
                  <button onClick={() => toggleStatus(user.id, user.status)} className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100" title="Unsuspend">
                    <CheckCircle2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
`;

code = code.replace(/<div className="overflow-x-auto">[\s\S]*?<\/div>/, replacement);
fs.writeFileSync(file, code);
