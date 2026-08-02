import React from 'react';
import { Task } from '../types';
import { translations, Lang } from '../i18n';
import { Calendar, AlertCircle } from 'lucide-react';

interface ListViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  lang: Lang;
}

export const ListView: React.FC<ListViewProps> = ({ tasks, onSelectTask, lang }) => {
  const t = translations[lang];

  const isDueSoon = (dueDateStr: string | null) => {
    if (!dueDateStr) return false;
    const due = new Date(dueDateStr).getTime();
    const now = new Date().getTime();
    const diff = due - now;
    return diff > 0 && diff < 24 * 60 * 60 * 1000;
  };

  const statusLabels: Record<string, { label: string; color: string }> = {
    new: { label: t.colNew, color: 'bg-blue-100 text-blue-700' },
    in_progress: { label: t.colInProgress, color: 'bg-amber-100 text-amber-700' },
    review: { label: t.colReview, color: 'bg-purple-100 text-purple-700' },
    done: { label: t.colDone, color: 'bg-emerald-100 text-emerald-700' },
  };

  const priorityColors: Record<string, string> = {
    low: 'text-slate-500',
    medium: 'text-blue-600',
    high: 'text-orange-600',
    urgent: 'text-red-600 font-bold',
  };

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-shtab-light">
      <div className="bg-white border border-shtab-border rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-shtab-border bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="p-4">{t.taskTitle}</th>
              <th className="p-4">{t.status}</th>
              <th className="p-4">{t.priority}</th>
              <th className="p-4">{t.dueDate}</th>
              <th className="p-4">{t.assignee}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {tasks.map((task) => {
              const dueSoon = isDueSoon(task.due_date);
              return (
                <tr
                  key={task.id}
                  onClick={() => onSelectTask(task)}
                  className="hover:bg-slate-50 cursor-pointer transition"
                >
                  <td className="p-4 font-semibold text-slate-900 flex items-center space-x-2">
                    <span>{task.title}</span>
                    {dueSoon && (
                      <span className="flex items-center space-x-1 text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold animate-pulse">
                        <AlertCircle size={11} />
                        <span>{t.dueSoon}</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase ${statusLabels[task.status]?.color}`}>
                      {statusLabels[task.status]?.label || task.status}
                    </span>
                  </td>
                  <td className="p-4 uppercase font-semibold text-[11px]">
                    <span className={priorityColors[task.priority]}>{task.priority}</span>
                  </td>
                  <td className="p-4">
                    {task.due_date ? (
                      <div className={`flex items-center space-x-1 ${dueSoon ? 'text-red-600 font-bold' : 'text-slate-600'}`}>
                        <Calendar size={13} />
                        <span>{new Date(task.due_date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">{t.noDeadline}</span>
                    )}
                  </td>
                  <td className="p-4">
                    {task.assignee ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center justify-center border border-indigo-200">
                          {task.assignee.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{task.assignee.name}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">{t.unassigned}</span>
                    )}
                  </td>
                </tr>
              );
            })}
            {tasks.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-400">
                  {t.noTasks}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
