import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Users, Search, ShieldCheck, UserX, UserCheck } from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await api.get<any[]>('/api/admin/users', { search: search.trim() || undefined });
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (user: any) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await api.put(`/api/admin/users/${user.id}/status`, { status: nextStatus });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
    } catch (err: any) {
      alert(err.message || 'Status change failed');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0A192F] font-['Space_Grotesk']">
            Enrolled Students Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor registered Telegram users, activity status, and lesson completion progress.
          </p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); fetchUsers(); }} className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder="Search by name, @username, or Telegram ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 shadow-2xs"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
        </form>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400">Loading student directory...</div>
      ) : users.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-600">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Telegram ID</th>
                <th className="p-3.5">Joined Date</th>
                <th className="p-3.5">Last Active</th>
                <th className="p-3.5">Completed</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition">
                  <td className="p-3.5">
                    <div className="flex items-center space-x-2.5">
                      <img
                        src={u.photo_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                        alt={u.first_name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <div className="font-bold text-[#0A192F] flex items-center gap-1">
                          <span>{u.first_name} {u.last_name || ''}</span>
                          {u.isAdmin && (
                            <span className="text-[9px] font-bold px-1 rounded bg-amber-100 text-amber-800">
                              Admin
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {u.username ? `@${u.username}` : 'No username'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-[11px] text-slate-500">
                    {u.telegram_id}
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3.5 text-slate-500">
                    {new Date(u.last_active).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-3.5 font-semibold text-emerald-700">
                    {u.completed_lessons_count || 0} lessons
                  </td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    {!u.isAdmin && (
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                          u.status === 'active'
                            ? 'text-red-700 hover:bg-red-50'
                            : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                      >
                        {u.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
