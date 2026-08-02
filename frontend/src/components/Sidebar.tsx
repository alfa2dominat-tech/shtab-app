import React from 'react';
import { Project, User } from '../types';
import { translations, Lang } from '../i18n';
import { FolderKanban, Plus, BarChart2, Shield, LogOut, ChevronRight, Briefcase } from 'lucide-react';

interface SidebarProps {
  user: User;
  projects: Project[];
  activeProjectID: string | null;
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  activeTab: 'projects' | 'stats' | 'admin';
  onSelectTab: (tab: 'projects' | 'stats' | 'admin') => void;
  onLogout: () => void;
  lang: Lang;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  projects,
  activeProjectID,
  onSelectProject,
  onCreateProject,
  activeTab,
  onSelectTab,
  onLogout,
  lang,
}) => {
  const t = translations[lang];

  return (
    <aside className="w-64 bg-shtab-dark border-r border-slate-800 flex flex-col h-screen select-none text-slate-300">
      {/* Brand / Logo */}
      <div className="p-5 flex items-center space-x-3 border-b border-slate-800">
        <div className="w-9 h-9 bg-shtab-accent rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20">
          Ш
        </div>
        <div>
          <span className="font-bold text-white tracking-tight text-lg">Shtab</span>
          <span className="text-xs block text-slate-500 font-medium">{t.workspace}</span>
        </div>
      </div>

      {/* Navigation menu */}
      <div className="p-4 space-y-1">
        <button
          onClick={() => onSelectTab('projects')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
            activeTab === 'projects'
              ? 'bg-shtab-accent text-white shadow-md shadow-indigo-500/20'
              : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-100'
          }`}
        >
          <FolderKanban size={18} />
          <span>{t.projects}</span>
        </button>

        <button
          onClick={() => onSelectTab('stats')}
          className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
            activeTab === 'stats'
              ? 'bg-shtab-accent text-white shadow-md shadow-indigo-500/20'
              : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-100'
          }`}
        >
          <BarChart2 size={18} />
          <span>{t.myStats}</span>
        </button>

        {user.role === 'admin' && (
          <button
            onClick={() => onSelectTab('admin')}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              activeTab === 'admin'
                ? 'bg-shtab-accent text-white shadow-md shadow-indigo-500/20'
                : 'hover:bg-slate-800/60 text-slate-400 hover:text-slate-100'
            }`}
          >
            <Shield size={18} />
            <span>{t.adminPanel}</span>
          </button>
        )}
      </div>

      {/* Projects List Section */}
      {activeTab === 'projects' && (
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">
            <span>{t.projects}</span>
            <button
              onClick={onCreateProject}
              className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              title="New Project"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="space-y-1">
            {projects.map((proj) => {
              const isActive = activeProjectID === proj.id;
              return (
                <button
                  key={proj.id}
                  onClick={() => onSelectProject(proj.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition text-left ${
                    isActive
                      ? 'bg-slate-800 text-white font-medium border-l-2 border-shtab-accent'
                      : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <Briefcase size={15} className={isActive ? 'text-shtab-accent shrink-0' : 'text-slate-500 shrink-0'} />
                    <span className="truncate">{proj.name}</span>
                  </div>
                  {isActive && <ChevronRight size={14} className="text-shtab-accent shrink-0" />}
                </button>
              );
            })}
            {projects.length === 0 && (
              <div className="text-xs text-slate-600 px-2 py-4 text-center">
                {t.noProjects}
              </div>
            )}
          </div>
        </div>
      )}

      {/* User profile & logout footer */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-500/30">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-red-400 transition"
          title={t.signOut}
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
};
