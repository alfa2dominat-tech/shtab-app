import React from 'react';
import { Task } from '../types';
import { translations, Lang } from '../i18n';
import { Calendar, User as UserIcon, AlertCircle } from 'lucide-react';

interface KanbanBoardProps {
  tasks: Task[];
  onUpdateTaskStatus: (taskId: string, status: 'new' | 'in_progress' | 'review' | 'done') => void;
  onSelectTask: (task: Task) => void;
  lang: Lang;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  tasks,
  onUpdateTaskStatus,
  onSelectTask,
  lang,
}) => {
  const t = translations[lang];

  const columns: { id: 'new' | 'in_progress' | 'review' | 'done'; title: string; color: string }[] = [
    { id: 'new', title: t.colNew, color: 'border-blue-500 bg-blue-550/10' },
    { id: 'in_progress', title: t.colInProgress, color: 'border-amber-500 bg-amber-500/10' },
    { id: 'review', title: t.colReview, color: 'border-purple-500 bg-purple-500/10' },
    { id: 'done', title: t.colDone, color: 'border-emerald-500 bg-emerald-500/10' },
  ];

  const isDueSoon = (dueDateStr: string | null) => {
    if (!dueDateStr) return false;
    const due = new Date(dueDateStr).getTime();
    const now = new Date().getTime();
    const diff = due - now;
    return diff > 0 && diff < 24 * 60 * 60 * 1000;
  };

  const priorityColors = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700 font-bold',
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: 'new' | 'in_progress' | 'review' | 'done') => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onUpdateTaskStatus(taskId, status);
    }
  };

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 p-8 overflow-x-auto bg-shtab-light items-start">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div key={col.id} className="bg-white border border-shtab-border rounded-2xl flex flex-col max-h-full shadow-sm">
            {/* Column Header */}
            <div className="p-4 border-b border-shtab-border flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full border-2 ${col.color}`} />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">{col.title}</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {colTasks.length}
                </span>
              </div>
            </div>

            {/* Tasks List in Column (Drop Zone) */}
            <div
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, col.id)}
              className="p-3 overflow-y-auto space-y-3 flex-1 min-h-[300px]"
            >
              {colTasks.map((task) => {
                const dueSoon = isDueSoon(task.due_date);
                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onClick={() => onSelectTask(task)}
                    className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing relative group ${
                      dueSoon ? 'border-red-400 bg-red-50/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Priority & Warning Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md uppercase font-semibold ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </span>
                      {dueSoon && (
                        <span className="flex items-center space-x-1 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold animate-pulse">
                          <AlertCircle size={12} />
                          <span>{t.dueSoon}</span>
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h4 className="font-semibold text-sm text-slate-800 line-clamp-2 mb-1">{task.title}</h4>
                    {task.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
                    )}

                    {/* Footer: Due date & Assignee */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                      {task.due_date ? (
                        <div className={`flex items-center space-x-1 ${dueSoon ? 'text-red-600 font-bold' : ''}`}>
                          <Calendar size={13} />
                          <span>{new Date(task.due_date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      ) : <span />}

                      {task.assignee ? (
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center shrink-0 border border-indigo-200" title={task.assignee.name}>
                          {task.assignee.name.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                          <UserIcon size={12} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {colTasks.length === 0 && (
                <div className="h-24 flex items-center justify-center text-xs text-slate-400 border-2 border-dashed border-slate-100 rounded-xl pointer-events-none">
                  {t.noTasks}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
