import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { User } from '../types';
import { Shield, Mail, Calendar, CheckSquare, UserCheck, UserX } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    api.get<User[]>('/admin/users')
      .then((data) => setUsers(data))
      .catch((err) => console.error('Failed to load users', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-shtab-light text-slate-500">
        Loading admin panel...
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-shtab-light space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Admin Cabinet</h2>
        <p className="text-xs text-slate-500">Manage registered users, inspect account metadata, and control access roles.</p>
      </div>

      <div className="bg-white border border-shtab-border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-shtab-border bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="p-4">User</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Registered</th>
              <th className="p-4">Tasks Count</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 transition">
                <td className="p-4 font-semibold text-slate-900 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs border border-indigo-200">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <span>{u.name}</span>
                </td>
                <td className="p-4 text-slate-600">{u.email}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${
                    u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="p-4 text-slate-500">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 font-bold text-slate-800">
                  {u.task_count || 0}
                </td>
                <td className="p-4 text-right">
                  {u.role === 'admin' ? (
                    <button
                      onClick={() => handleRoleChange(u.id, 'user')}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition"
                    >
                      Demote to User
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRoleChange(u.id, 'admin')}
                      className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium transition"
                    >
                      Make Admin
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
