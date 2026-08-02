import React, { useState, useEffect, useRef } from 'react';
import { Project, Notification } from '../types';
import { translations, Lang } from '../i18n';
import { Kanban, List, Table, Bell, Plus, Search, Globe } from 'lucide-react';

interface HeaderProps {
  activeProject?: Project;
  viewMode: 'kanban' | 'list' | 'table';
  onViewChange: (mode: 'kanban' | 'list' | 'table') => void;
  onNewTask: () => void;
  notifications: Notification[];
  onMarkNotificationRead: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  lang: Lang;
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeProject,
  viewMode,
  onViewChange,
  onNewTask,
  notifications,
  onMarkNotificationRead,
  searchQuery,
  onSearchChange,
  lang,
  onToggleLang,
}) => {
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const notifRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-shtab-border px-8 flex items-center justify-between shrink-0 shadow-sm z-10">
      {/* Project Title & Search */}
      <div className="flex items-center space-x-6">
        <div>
          <h2 className="text-lg font-bold text-shtab-text tracking-tight">
            {activeProject ? activeProject.name : t.welcome}
          </h2>
          <p className="text-xs text-shtab-muted">
            {activeProject ? activeProject.description || 'Project Workspace' : t.selectProjectHint}
          </p>
        </div>

        {activeProject && (
          <div className="relative hidden md:block">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={15} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t.searchTasks}
              className="pl-9 pr-4 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-shtab-accent w-56 text-slate-700"
            />
          </div>
        )}
      </div>

      {/* Center: View Switcher */}
      {activeProject && (
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => onViewChange('kanban')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === 'kanban'
                ? 'bg-white text-shtab-accent shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Kanban size={15} />
            <span className="hidden sm:inline">{t.kanban}</span>
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === 'list'
                ? 'bg-white text-shtab-accent shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <List size={15} />
            <span className="hidden sm:inline">{t.list}</span>
          </button>
          <button
            onClick={() => onViewChange('table')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              viewMode === 'table'
                ? 'bg-white text-shtab-accent shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table size={15} />
            <span className="hidden sm:inline">{t.table}</span>
          </button>
        </div>
      )}

      {/* Right: Actions, Language Switcher & Notifications */}
      <div className="flex items-center space-x-3">
        {activeProject && (
          <button
            onClick={onNewTask}
            className="flex items-center space-x-1.5 px-4 py-2 bg-shtab-accent hover:bg-shtab-accentHover text-white text-xs font-medium rounded-xl transition shadow-md shadow-indigo-500/20"
          >
            <Plus size={16} />
            <span>{t.newTask}</span>
          </button>
        )}

        {/* Language Switcher Button */}
        <button
          onClick={onToggleLang}
          className="flex items-center space-x-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition border border-slate-200"
          title="Switch Language / Сменить язык"
        >
          <Globe size={16} className="text-shtab-accent" />
          <span>{lang === 'ru' ? 'EN' : 'RU'}</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            title={t.notifications}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 uppercase tracking-wider">{t.notifications}</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {unreadCount} {t.unread}
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => onMarkNotificationRead(n.id)}
                    className={`p-3 hover:bg-slate-50 transition cursor-pointer flex items-start space-x-3 ${
                      !n.read ? 'bg-indigo-50/40' : ''
                    }`}
                  >
                    <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!n.read ? 'bg-shtab-accent' : 'bg-slate-300'}`} />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-600 mt-0.5">{n.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <div className="p-6 text-center text-xs text-slate-400">
                    {t.noNotifications}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
