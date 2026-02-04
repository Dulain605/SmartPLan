
import React from 'react';
import { ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
  lastSaved: Date;
  userEmail?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, lastSaved, userEmail }) => {
  const navItems = [
    { id: 'agenda' as ViewType, label: 'Agenda', icon: 'fa-calendar-check' },
    { id: 'studio' as ViewType, label: 'Image Lab', icon: 'fa-wand-magic-sparkles' },
    { id: 'video' as ViewType, label: 'Video Lab', icon: 'fa-film' },
    { id: 'password' as ViewType, label: 'Password Gen', icon: 'fa-key' },
    { id: 'clips' as ViewType, label: 'Shorts', icon: 'fa-play-circle' },
    { id: 'connect' as ViewType, label: 'Connect', icon: 'fa-globe' },
    { id: 'settings' as ViewType, label: 'Settings', icon: 'fa-cog' },
  ];

  const timeString = lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <aside className="w-20 md:w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 shadow-sm relative z-50">
      <div className="p-4 md:p-6 mb-2">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-100">
            <i className="fas fa-clock"></i>
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-slate-800 leading-none">SmartPlan</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Workspace v2.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={`w-full flex items-center p-3 rounded-2xl transition-all duration-300 ${
              activeView === item.id 
                ? 'bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <div className="w-8 flex justify-center">
              <i className={`fas ${item.icon} text-lg ${activeView === item.id ? 'text-white' : 'text-slate-400'}`}></i>
            </div>
            <span className="hidden md:block ml-3">{item.label}</span>
            {activeView === item.id && (
              <div className="hidden md:block ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4 space-y-3">
        {/* User Badge */}
        {userEmail && (
          <div className="hidden md:flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
              {userEmail.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-700 truncate">{userEmail.split('@')[0]}</p>
              <p className="text-[9px] text-slate-400 truncate">Connected Session</p>
            </div>
          </div>
        )}

        {/* Persistence Status */}
        <div className="hidden md:block p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-tighter">Persistence</p>
            <div className="flex items-center space-x-1">
               <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-cloud-check text-emerald-600 text-xs"></i>
            <span className="text-[11px] font-medium text-emerald-800">Saved at {timeString}</span>
          </div>
        </div>

        <div className="hidden md:block p-3 bg-slate-50 rounded-2xl text-center">
          <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Powered by Gemini</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
