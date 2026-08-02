import React, { useState, useEffect, useRef } from 'react';
import { api, getAuthToken, setAuthToken } from './services/api';
import { User, Project, Task, Notification } from './types';
import { translations, Lang } from './i18n';
import { AuthModal } from './components/AuthModal';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { KanbanBoard } from './components/KanbanBoard';
import { ListView } from './components/ListView';
import { TableView } from './components/TableView';
import { TaskModal } from './components/TaskModal';
import { UserStats } from './components/UserStats';
import { AdminPanel } from './components/AdminPanel';
import { FolderPlus, X } from 'lucide-react';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectID, setActiveProjectID] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<Project | undefined>(undefined);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'projects' | 'stats' | 'admin'>('projects');
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'table'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');

  // Language state (default 'ru', saved in localStorage)
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('shtab_lang') as Lang) || 'ru';
  });

  const toggleLang = () => {
    const nextLang = lang === 'ru' ? 'en' : 'ru';
    setLang(nextLang);
    localStorage.setItem('shtab_lang', nextLang);
  };

  const t = translations[lang];

  // Modals state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const wsRef = useRef<WebSocket | null>(null);

  // Check auth on mount
  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setLoading(false);
      return;
    }

    api.get<User>('/auth/me')
      .then((u) => {
        setUser(u);
        loadInitialData();
      })
      .catch(() => {
        setAuthToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Setup WebSocket when user logs in
  useEffect(() => {
    if (!user) return;
    const token = getAuthToken();
    if (!token) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`;
    
    const finalWsUrl = window.location.port === '3000' 
      ? `ws://localhost:8080/ws?token=${token}` 
      : wsUrl;

    const ws = new WebSocket(finalWsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification' && data.notification) {
          setNotifications((prev) => [data.notification, ...prev]);
        }
      } catch (e) {
        console.error('WS message parse error', e);
      }
    };

    return () => {
      ws.close();
    };
  }, [user]);

  const loadInitialData = async () => {
    try {
      const [projList, notifList] = await Promise.all([
        api.get<Project[]>('/projects'),
        api.get<Notification[]>('/notifications'),
      ]);
      setProjects(projList);
      setNotifications(notifList);
      if (projList.length > 0 && !activeProjectID) {
        setActiveProjectID(projList[0].id);
      }
    } catch (err) {
      console.error('Failed to load initial data', err);
    }
  };

  useEffect(() => {
    if (!activeProjectID) return;
    api.get<Project>(`/projects/${activeProjectID}`).then((p) => setActiveProject(p));
    api.get<Task[]>(`/projects/${activeProjectID}/tasks`).then((t) => setTasks(t));
  }, [activeProjectID]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      const p = await api.post<Project>('/projects', {
        name: newProjectName,
        description: newProjectDesc,
      });
      setProjects([p, ...projects]);
      setActiveProjectID(p.id);
      setIsNewProjectModalOpen(false);
      setNewProjectName('');
      setNewProjectDesc('');
    } catch (err: any) {
      alert(err.message || 'Failed to create project');
    }
  };

  const handleSaveTask = async (taskData: any) => {
    if (!activeProjectID) return;
    try {
      const targetProjectId = taskData.project_id || activeProjectID;
      if (editingTask) {
        const updated = await api.put<Task>(`/tasks/${editingTask.id}`, taskData);
        if (updated.project_id !== activeProjectID) {
          setTasks(tasks.filter((t) => t.id !== updated.id));
        } else {
          setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
        }
      } else {
        const created = await api.post<Task>(`/projects/${targetProjectId}/tasks`, taskData);
        if (targetProjectId === activeProjectID) {
          setTasks([created, ...tasks]);
        }
      }
      setIsTaskModalOpen(false);
      setEditingTask(null);
    } catch (err: any) {
      alert(err.message || 'Failed to save task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm(lang === 'ru' ? 'Вы уверены, что хотите удалить эту задачу?' : 'Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter((t) => t.id !== taskId));
      setIsTaskModalOpen(false);
      setEditingTask(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete task');
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: 'new' | 'in_progress' | 'review' | 'done') => {
    try {
      const updated = await api.put<Task>(`/tasks/${taskId}`, { status });
      setTasks(tasks.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err: any) {
      alert(err.message || 'Failed to update task status');
    }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await api.post(`/notifications/${id}/read`, {});
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-shtab-dark flex items-center justify-center text-white">
        Loading Shtab...
      </div>
    );
  }

  if (!user) {
    return <AuthModal onLoginSuccess={(u) => { setUser(u); loadInitialData(); }} lang={lang} onToggleLang={toggleLang} />;
  }

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen overflow-hidden bg-shtab-light">
      <Sidebar
        user={user}
        projects={projects}
        activeProjectID={activeProjectID}
        onSelectProject={(id) => { setActiveProjectID(id); setActiveTab('projects'); }}
        onCreateProject={() => setIsNewProjectModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={(tab) => setActiveTab(tab)}
        onLogout={() => { setAuthToken(null); setUser(null); }}
        lang={lang}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {activeTab === 'projects' && (
          <>
            <Header
              activeProject={activeProject}
              viewMode={viewMode}
              onViewChange={(mode) => setViewMode(mode)}
              onNewTask={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
              notifications={notifications}
              onMarkNotificationRead={handleMarkNotificationRead}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              lang={lang}
              onToggleLang={toggleLang}
            />

            {activeProjectID ? (
              <>
                {viewMode === 'kanban' && (
                  <KanbanBoard
                    tasks={filteredTasks}
                    onUpdateTaskStatus={handleUpdateTaskStatus}
                    onSelectTask={(task) => { setEditingTask(task); setIsTaskModalOpen(true); }}
                    lang={lang}
                  />
                )}
                {viewMode === 'list' && (
                  <ListView
                    tasks={filteredTasks}
                    onSelectTask={(task) => { setEditingTask(task); setIsTaskModalOpen(true); }}
                    lang={lang}
                  />
                )}
                {viewMode === 'table' && (
                  <TableView
                    tasks={filteredTasks}
                    onSelectTask={(task) => { setEditingTask(task); setIsTaskModalOpen(true); }}
                    lang={lang}
                  />
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500">
                <FolderPlus size={48} className="text-slate-300 mb-3" />
                <h3 className="text-lg font-bold text-slate-700">{t.noProjectSelected}</h3>
                <p className="text-xs text-slate-400 mt-1 mb-4">{t.noProjectHint}</p>
                <button
                  onClick={() => setIsNewProjectModalOpen(true)}
                  className="px-4 py-2 bg-shtab-accent text-white rounded-xl text-xs font-medium shadow"
                >
                  {t.projects}
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === 'stats' && <UserStats lang={lang} />}
        {activeTab === 'admin' && <AdminPanel lang={lang} />}
      </div>

      {/* Task Modal */}
      {isTaskModalOpen && (
        <TaskModal
          task={editingTask}
          projects={projects}
          projectMembers={activeProject?.members || []}
          onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
          onSave={handleSaveTask}
          onDelete={handleDeleteTask}
          lang={lang}
        />
      )}

      {/* New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-shtab-border rounded-2xl w-full max-w-md shadow-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base text-slate-800">{t.createProjectModal}</h3>
              <button onClick={() => setIsNewProjectModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  {t.projectName}
                </label>
                <input
                  type="text"
                  required
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder={t.projectNamePlaceholder}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-shtab-accent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  {t.description}
                </label>
                <textarea
                  rows={3}
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  placeholder={t.projectDescPlaceholder}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-shtab-accent resize-none"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewProjectModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-shtab-accent text-white rounded-xl text-xs font-medium shadow-md shadow-indigo-500/20"
                >
                  {t.createProjectModal}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
