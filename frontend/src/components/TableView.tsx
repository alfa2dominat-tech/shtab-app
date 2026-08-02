import React from 'react';
import { Task } from '../types';
import { translations, Lang } from '../i18n';
import { CheckCircle2, Clock } from 'lucide-react';

interface TableViewProps {
  tasks: Task[];
  onSelectTask: (task: Task) => void;
  lang: Lang;
}

export const TableView: React.FC<TableViewProps> = ({ tasks, onSelectTask, lang }) => {
  const t = translations[lang];

  return (
    <div className="flex-1 p-8 overflow-y-auto bg-shtab-light">
      <div className="bg-white border border-shtab-border rounded-2xl shadow-sm p-6">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4">{t.table} & {t.projects}</h3>
        <div className="space-y-4">
          {tasks.map((task) => {
            const hasDue = task.due_date != null;
            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task)}
                className="flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition"
              >
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-xl ${task.status === 'done' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                    {task.status === 'done' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-800">{task.title}</h4>
                    <p className="text-xs text-slate-500">
                      {t.author}: {task.author?.name || 'Unknown'} • {t.assignee}: {task.assignee?.name || t.unassigned}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.priority}</span>
                    <span className="text-xs font-semibold uppercase text-slate-700">{task.priority}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">{t.dueDate}</span>
                    <span className="text-xs font-semibold text-slate-700">
                      {hasDue ? new Date(task.due_date!).toLocaleDateString([], { month: 'short', day: 'numeric' }) : t.noDeadline}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {tasks.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              {t.noTasks}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
