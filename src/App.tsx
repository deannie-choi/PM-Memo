/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useData } from './hooks/useData';
import { Dashboard } from './components/Dashboard';
import { ClientWorkspace } from './components/ClientWorkspace';
import { Building2, LayoutDashboard, Plus, Menu, X, Archive, Briefcase } from 'lucide-react';
import { cn } from './lib/utils';

export type ViewState = 
  | { type: 'dashboard' }
  | { type: 'internal', projectId?: string }
  | { type: 'client', clientId: string, projectId?: string };

export default function App() {
  const dataStore = useData();
  const [view, setView] = useState<ViewState>({ type: 'dashboard' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [newClientName, setNewClientName] = useState('');
  const [isAddingClient, setIsAddingClient] = useState(false);

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    dataStore.addClient(newClientName.trim());
    setNewClientName('');
    setIsAddingClient(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className={cn(
        "bg-slate-900 text-slate-300 w-64 flex-shrink-0 flex flex-col transition-all duration-300 h-full",
        !isSidebarOpen ? "-ml-64" : ""
      )}>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h1 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
            <Archive className="w-5 h-5 text-indigo-400" />
            PM 메모보드
          </h1>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 border-b border-slate-800 space-y-1">
          <button
            onClick={() => setView({ type: 'dashboard' })}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
              view.type === 'dashboard' ? "bg-indigo-600 text-white shadow-sm" : "hover:bg-slate-800 hover:text-white text-slate-300"
            )}
          >
            <LayoutDashboard className="w-4 h-4" />
            대시보드
          </button>
          
          <button
            onClick={() => setView({ type: 'internal' })}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
              view.type === 'internal' ? "bg-slate-800 text-white shadow-sm" : "hover:bg-slate-800 hover:text-white text-slate-300"
            )}
          >
            <Briefcase className="w-4 h-4 text-emerald-400" />
            일반 회사 업무
          </button>
        </div>

        <div className="flex-1 overflow-y-auto w-full">
          <div className="px-3 pt-4 pb-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-3">고객사 (노트북)</div>
            <div className="space-y-1">
              {dataStore.data.clients.map(client => (
                <button
                  key={client.id}
                  onClick={() => setView({ type: 'client', clientId: client.id })}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm font-medium",
                    view.type === 'client' && view.clientId === client.id 
                      ? "bg-slate-800 text-white" 
                      : "hover:bg-slate-800 hover:text-white text-slate-400"
                  )}
                >
                  {client.color ? (
                     <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: client.color }} />
                  ) : (
                     <Building2 className={cn("w-4 h-4 flex-shrink-0", view.type === 'client' && view.clientId === client.id ? "text-indigo-400" : "text-slate-500")} />
                  )}
                  <span className="truncate flex-1 text-left">{client.name}</span>
                </button>
              ))}
              
              {isAddingClient ? (
                <form onSubmit={handleAddClient} className="px-2 py-1 mt-1">
                  <input
                    autoFocus
                    type="text"
                    className="w-full bg-slate-100/10 border border-slate-700/50 rounded-md px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500 focus:bg-slate-800 transition-colors"
                    placeholder="고객사명 입력..."
                    value={newClientName}
                    onChange={e => setNewClientName(e.target.value)}
                    onBlur={() => setIsAddingClient(false)}
                  />
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingClient(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" /> 새 고객사 추가
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden bg-white relative">
        {!isSidebarOpen && (
          <div className="absolute top-4 left-4 z-20">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-lg shadow-md transition-colors"
              title="사이드바 열기"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {view.type === 'dashboard' ? (
          <div className="h-full overflow-y-auto w-full">
            <Dashboard dataStore={dataStore} setView={setView} />
          </div>
        ) : view.type === 'internal' ? (
          <ClientWorkspace 
            dataStore={dataStore} 
            clientId="internal" 
            projectId={view.projectId} 
            setView={setView}
            isInternal={true}
          />
        ) : (
          <ClientWorkspace 
            dataStore={dataStore} 
            clientId={view.clientId} 
            projectId={view.projectId} 
            setView={setView} 
          />
        )}
      </main>
    </div>
  );
}

