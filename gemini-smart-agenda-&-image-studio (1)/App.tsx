
import React, { useState, useEffect, useCallback } from 'react';
import { ViewType, AgendaItem } from './types';
import Sidebar from './components/Sidebar';
import Agenda from './components/Agenda';
import ImageStudio from './components/ImageStudio';
import VideoStudio from './components/VideoStudio';
import PasswordGenerator from './components/PasswordGenerator';
import ClipsViewer from './components/ClipsViewer';
import Connect from './components/Connect';
import Login from './components/Login';

const App: React.FC = () => {
  // PERSISTENCE: Initialize state from localStorage to ensure data survives tab/browser closure
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('smart_plan_auth') === 'true';
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem('smart_plan_user_email') || '';
  });

  const [activeView, setActiveView] = useState<ViewType>(() => {
    return (localStorage.getItem('smart_plan_active_view') as ViewType) || 'agenda';
  });

  const [agenda, setAgenda] = useState<AgendaItem[]>(() => {
    const saved = localStorage.getItem('smart_plan_agenda_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [triggeredAlarms, setTriggeredAlarms] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('smart_plan_triggered_alarms');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [lastSaved, setLastSaved] = useState<Date>(new Date());

  // PERSISTENCE: Save state changes to localStorage reactively
  useEffect(() => {
    localStorage.setItem('smart_plan_agenda_data', JSON.stringify(agenda));
    localStorage.setItem('smart_plan_auth', isAuthenticated.toString());
    localStorage.setItem('smart_plan_user_email', userEmail);
    localStorage.setItem('smart_plan_active_view', activeView);
    localStorage.setItem('smart_plan_triggered_alarms', JSON.stringify(Array.from(triggeredAlarms)));
    setLastSaved(new Date());
  }, [agenda, isAuthenticated, userEmail, activeView, triggeredAlarms]);

  // PERSISTENCE: Extra safety layer for tab closure
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.setItem('smart_plan_agenda_data', JSON.stringify(agenda));
      localStorage.setItem('smart_plan_triggered_alarms', JSON.stringify(Array.from(triggeredAlarms)));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [agenda, triggeredAlarms]);

  // Alarm Monitoring Logic
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      const now = new Date();
      agenda.forEach(item => {
        if (item.alarmEnabled && !item.completed) {
          const alarmTime = new Date(item.time);
          if (alarmTime <= now && !triggeredAlarms.has(item.id)) {
            triggerAlarm(item);
          }
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [agenda, triggeredAlarms, isAuthenticated]);

  const triggerAlarm = useCallback((item: AgendaItem) => {
    setTriggeredAlarms(prev => {
      const next = new Set(prev);
      next.add(item.id);
      return next;
    });
    
    if (Notification.permission === 'granted') {
      new Notification(`Alarm: ${item.title}`, {
        body: item.description,
        icon: 'https://picsum.photos/100/100'
      });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }
    
    alert(`ALARM: ${item.title}\n${item.description}`);
  }, []);

  const handleToggleAlarm = (id: string) => {
    setAgenda(prev => prev.map(item => 
      item.id === id ? { ...item, alarmEnabled: !item.alarmEnabled } : item
    ));
    setTriggeredAlarms(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleAddItem = (item: Omit<AgendaItem, 'id'>) => {
    const newItem: AgendaItem = {
      ...item,
      id: crypto.randomUUID(),
    };
    setAgenda(prev => [...prev, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    setAgenda(prev => prev.filter(item => item.id !== id));
    setTriggeredAlarms(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleToggleComplete = (id: string) => {
    setAgenda(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out? All your data remains saved locally.")) {
      setIsAuthenticated(false);
      setUserEmail('');
      localStorage.removeItem('smart_plan_auth');
      localStorage.removeItem('smart_plan_user_email');
      // We keep the agenda data even after logout for persistence
    }
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => handleLogin(userEmail)} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        activeView={activeView} 
        onViewChange={setActiveView} 
        lastSaved={lastSaved}
        userEmail={userEmail}
      />
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto h-full">
          {activeView === 'agenda' && (
            <Agenda 
              items={agenda} 
              onAdd={handleAddItem} 
              onToggleAlarm={handleToggleAlarm}
              onRemove={handleRemoveItem}
              onToggleComplete={handleToggleComplete}
            />
          )}
          {activeView === 'studio' && <ImageStudio />}
          {activeView === 'video' && <VideoStudio />}
          {activeView === 'password' && <PasswordGenerator />}
          {activeView === 'clips' && <ClipsViewer />}
          {activeView === 'connect' && <Connect />}
          {activeView === 'settings' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold mb-4 text-slate-800">Account Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <p className="font-semibold text-slate-700">Notifications</p>
                      <p className="text-sm text-slate-500">Enable desktop alerts for scheduled tasks.</p>
                    </div>
                    <button 
                      onClick={() => Notification.requestPermission()}
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium shadow-md"
                    >
                      Check Permission
                    </button>
                  </div>
                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm">
                      <i className="fas fa-floppy-disk"></i>
                    </div>
                    <div>
                      <p className="text-indigo-900 text-sm font-semibold">Automatic Persistence Active</p>
                      <p className="text-indigo-700/70 text-xs">Your workspace is locally stored and synchronized in real-time.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-bold mb-4 text-slate-800">Session</h2>
                <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-rose-800">Log Out</p>
                    <p className="text-sm text-rose-600/70">Exit and lock your workspace session.</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-6 py-3 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition font-bold shadow-lg shadow-rose-200 active:scale-95"
                  >
                    <i className="fas fa-sign-out-alt"></i>
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
