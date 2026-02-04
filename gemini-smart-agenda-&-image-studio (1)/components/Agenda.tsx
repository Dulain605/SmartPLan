
import React, { useState } from 'react';
import { AgendaItem } from '../types';

interface AgendaProps {
  items: AgendaItem[];
  onAdd: (item: Omit<AgendaItem, 'id'>) => void;
  onToggleAlarm: (id: string) => void;
  onRemove: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

const Agenda: React.FC<AgendaProps> = ({ items, onAdd, onToggleAlarm, onRemove, onToggleComplete }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCategory, setNewCategory] = useState<AgendaItem['category']>('work');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newTime) return;

    onAdd({
      title: newTitle,
      description: newDesc,
      time: new Date(newTime).toISOString(),
      alarmEnabled: true,
      completed: false,
      category: newCategory
    });

    setNewTitle('');
    setNewDesc('');
    setNewTime('');
    setShowAdd(false);
  };

  const sortedItems = [...items].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">My Agenda</h2>
          <p className="text-slate-500">You have {items.filter(i => !i.completed).length} pending tasks</p>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition flex items-center space-x-2 shadow-lg shadow-indigo-200"
        >
          <i className={`fas ${showAdd ? 'fa-times' : 'fa-plus'}`}></i>
          <span>{showAdd ? 'Close' : 'Add Item'}</span>
        </button>
      </header>

      {showAdd && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Weekly Sync"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Time</label>
                <input 
                  type="datetime-local" 
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                  required
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea 
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Optional details..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition h-[104px] resize-none"
                />
              </div>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
              Create Event
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {sortedItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <i className="fas fa-calendar-alt text-2xl"></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-700">No agenda items yet</h3>
            <p className="text-slate-500">Plan your day by adding your first task above.</p>
          </div>
        ) : (
          sortedItems.map(item => (
            <div key={item.id} className={`group bg-white p-4 rounded-2xl border transition-all duration-200 flex items-center space-x-4 shadow-sm ${item.completed ? 'opacity-60 border-slate-200' : 'border-slate-100 hover:border-indigo-200 hover:shadow-md'}`}>
              <button 
                onClick={() => onToggleComplete(item.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${item.completed ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 hover:border-indigo-500'}`}
              >
                {item.completed && <i className="fas fa-check text-[10px] text-white"></i>}
              </button>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className={`text-lg font-semibold truncate ${item.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                    {item.title}
                  </h4>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.category === 'work' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center text-sm text-slate-500 mt-0.5">
                  <i className="far fa-clock mr-2"></i>
                  <span>{new Date(item.time).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => onToggleAlarm(item.id)}
                  title={item.alarmEnabled ? "Turn off alarm" : "Turn on alarm"}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${item.alarmEnabled ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400 hover:bg-amber-50 hover:text-amber-500'}`}
                >
                  <i className={`fas fa-bell${item.alarmEnabled ? '' : '-slash'}`}></i>
                </button>
                <button 
                  onClick={() => onRemove(item.id)}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                >
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Agenda;
