import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { UserStats as UserStatsType } from '../types';
import { CheckCircle2, Calendar, TrendingUp, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export const UserStats: React.FC = () => {
  const [stats, setStats] = useState<UserStatsType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<UserStatsType>('/stats')
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load stats', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-shtab-light text-slate-500">
        Loading statistics...
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-shtab-light space-y-8">
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Performance & Statistics</h2>
        <p className="text-xs text-slate-500">Overview of your task completion activity and personal productivity.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-shtab-border rounded-2xl p-6 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Award size={24} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Total Closed Tasks</span>
            <span className="text-2xl font-bold text-slate-900">{stats?.total_closed || 0}</span>
          </div>
        </div>

        <div className="bg-white border border-shtab-border rounded-2xl p-6 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Closed This Week</span>
            <span className="text-2xl font-bold text-slate-900">{stats?.closed_week || 0}</span>
          </div>
        </div>

        <div className="bg-white border border-shtab-border rounded-2xl p-6 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <TrendingUp size={24} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Closed This Month</span>
            <span className="text-2xl font-bold text-slate-900">{stats?.closed_month || 0}</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white border border-shtab-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-6">Task Completion Dynamics (Last 14 Days)</h3>
        <div className="h-72 w-full">
          {stats?.daily_dynamics && stats.daily_dynamics.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.daily_dynamics}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              No completion data recorded in the last 14 days.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
