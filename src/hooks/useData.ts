import { useState, useEffect } from 'react';
import { Client, Project, Memo } from '../types';

const STORAGE_KEY = 'pm-recall-data-v1';

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];
const getRandomColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

export interface AppData {
  clients: Client[];
  projects: Project[];
  memos: Memo[];
}

const defaultData: AppData = {
  clients: [],
  projects: [],
  memos: []
};

export function useData() {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultData;
      }
    }
    return defaultData;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const addClient = (name: string) => {
    setData(prev => ({
      ...prev,
      clients: [...prev.clients, { id: crypto.randomUUID(), name, color: getRandomColor(), createdAt: new Date().toISOString() }]
    }));
  };

  const addProject = (clientId: string, name: string) => {
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, { id: crypto.randomUUID(), clientId, name, color: getRandomColor(), status: 'active', createdAt: new Date().toISOString() }]
    }));
  };

  const addMemo = (projectId: string, content: string, targetDate?: string, priority?: 1 | 2 | 3) => {
    setData(prev => ({
      ...prev,
      memos: [...prev.memos, { id: crypto.randomUUID(), projectId, content, createdAt: new Date().toISOString(), targetDate, isAcknowledged: false, priority }]
    }));
  };

  const toggleMemoAcknowledge = (memoId: string) => {
    setData(prev => ({
      ...prev,
      memos: prev.memos.map(m => m.id === memoId ? { ...m, isAcknowledged: !m.isAcknowledged } : m)
    }));
  };

  const setMemoPriority = (memoId: string, priority?: 1 | 2 | 3) => {
    setData(prev => ({
      ...prev,
      memos: prev.memos.map(m => m.id === memoId ? { ...m, priority } : m)
    }));
  };

  const deleteMemo = (memoId: string) => {
    setData(prev => ({
      ...prev,
      memos: prev.memos.filter(m => m.id !== memoId)
    }));
  }

  const editMemo = (memoId: string, content: string, targetDate?: string) => {
    setData(prev => ({
      ...prev,
      memos: prev.memos.map(m => m.id === memoId ? { ...m, content, targetDate } : m)
    }));
  };

  const editProject = (projectId: string, name: string) => {
    setData(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === projectId ? { ...p, name } : p)
    }));
  };

  const editClient = (clientId: string, name: string) => {
    setData(prev => ({
        ...prev,
        clients: prev.clients.map(c => c.id === clientId ? { ...c, name } : c)
    }));
  };

  const deleteProject = (projectId: string) => {
      setData(prev => ({
          ...prev,
          projects: prev.projects.filter(p => p.id !== projectId),
          memos: prev.memos.filter(m => m.projectId !== projectId)
      }))
  }

  const deleteClient = (clientId: string) => {
      setData(prev => {
          const projectIdsToDelete = prev.projects.filter(p => p.clientId === clientId).map(p => p.id);
          return {
              ...prev,
              clients: prev.clients.filter(c => c.id !== clientId),
              projects: prev.projects.filter(p => p.clientId !== clientId),
              memos: prev.memos.filter(m => !projectIdsToDelete.includes(m.projectId))
          };
      });
  }

  const addProjectImage = (projectId: string, dataUrl: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === projectId 
          ? { ...p, images: [...(p.images || []), { id: crypto.randomUUID(), dataUrl, createdAt: new Date().toISOString() }] }
          : p
      )
    }));
  };

  const deleteProjectImage = (projectId: string, imageId: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === projectId 
          ? { ...p, images: (p.images || []).filter(img => img.id !== imageId) }
          : p
      )
    }));
  };

  const updateProjectImageDescription = (projectId: string, imageId: string, description: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => 
        p.id === projectId 
          ? { ...p, images: (p.images || []).map(img => img.id === imageId ? { ...img, description } : img) }
          : p
      )
    }));
  };

  return {
    data,
    addClient,
    addProject,
    addProjectImage,
    deleteProjectImage,
    updateProjectImageDescription,
    addMemo,
    editMemo,
    editProject,
    editClient,
    toggleMemoAcknowledge,
    setMemoPriority,
    deleteMemo,
    deleteProject,
    deleteClient
  };
}
