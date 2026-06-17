import { useState, useEffect } from 'react';
import { Client, Project, Memo } from '../types';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, deleteDoc, updateDoc, onSnapshot, query, where, writeBatch } from 'firebase/firestore';

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

export function useData(userId?: string) {
  const [data, setData] = useState<AppData>(defaultData);

  useEffect(() => {
    if (!userId) {
      setData(defaultData);
      return;
    }

    const qClients = query(collection(db, 'clients'), where('userId', '==', userId));
    const unsubscribeClients = onSnapshot(qClients, (snapshot) => {
      const clients = snapshot.docs.map(doc => doc.data() as Client);
      setData(prev => ({ ...prev, clients }));
    });

    const qProjects = query(collection(db, 'projects'), where('userId', '==', userId));
    const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
      const projects = snapshot.docs.map(doc => doc.data() as Project);
      setData(prev => ({ ...prev, projects }));
    });

    const qMemos = query(collection(db, 'memos'), where('userId', '==', userId));
    const unsubscribeMemos = onSnapshot(qMemos, (snapshot) => {
      const memos = snapshot.docs.map(doc => doc.data() as Memo);
      setData(prev => ({ ...prev, memos }));
    });

    return () => {
      unsubscribeClients();
      unsubscribeProjects();
      unsubscribeMemos();
    };
  }, [userId]);

  const addClient = async (name: string) => {
    if (!userId) return;
    const id = crypto.randomUUID();
    await setDoc(doc(db, 'clients', id), {
      id,
      userId,
      name,
      color: getRandomColor(),
      createdAt: new Date().toISOString()
    });
  };

  const addProject = async (clientId: string, name: string) => {
    if (!userId) return;
    const id = crypto.randomUUID();
    await setDoc(doc(db, 'projects', id), {
      id,
      userId,
      clientId,
      name,
      color: getRandomColor(),
      status: 'active',
      createdAt: new Date().toISOString(),
      images: []
    });
  };

  const addMemo = async (projectId: string, content: string, targetDate?: string, priority?: 1 | 2 | 3) => {
    if (!userId) return;
    const id = crypto.randomUUID();
    await setDoc(doc(db, 'memos', id), {
      id,
      userId,
      projectId,
      content,
      createdAt: new Date().toISOString(),
      targetDate: targetDate || null,
      isAcknowledged: false,
      priority: priority || null
    });
  };

  const toggleMemoAcknowledge = async (memoId: string) => {
    const memo = data.memos.find(m => m.id === memoId);
    if (!memo) return;
    await updateDoc(doc(db, 'memos', memoId), {
      isAcknowledged: !memo.isAcknowledged
    });
  };

  const setMemoPriority = async (memoId: string, priority?: 1 | 2 | 3) => {
    await updateDoc(doc(db, 'memos', memoId), {
      priority: priority || null
    });
  };

  const deleteMemo = async (memoId: string) => {
    await deleteDoc(doc(db, 'memos', memoId));
  };

  const editMemo = async (memoId: string, content: string, targetDate?: string) => {
    await updateDoc(doc(db, 'memos', memoId), {
      content,
      targetDate: targetDate || null
    });
  };

  const editProject = async (projectId: string, name: string) => {
    await updateDoc(doc(db, 'projects', projectId), {
      name
    });
  };

  const editClient = async (clientId: string, name: string) => {
    await updateDoc(doc(db, 'clients', clientId), {
      name
    });
  };

  const deleteProject = async (projectId: string) => {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'projects', projectId));
    
    // Delete associated memos
    data.memos.filter(m => m.projectId === projectId).forEach(m => {
      batch.delete(doc(db, 'memos', m.id));
    });

    await batch.commit();
  };

  const deleteClient = async (clientId: string) => {
    const batch = writeBatch(db);
    batch.delete(doc(db, 'clients', clientId));

    const projectIdsToDelete = data.projects.filter(p => p.clientId === clientId).map(p => p.id);
    projectIdsToDelete.forEach(pid => {
      batch.delete(doc(db, 'projects', pid));
    });

    data.memos.filter(m => projectIdsToDelete.includes(m.projectId)).forEach(m => {
      batch.delete(doc(db, 'memos', m.id));
    });

    await batch.commit();
  };

  const addProjectImage = async (projectId: string, dataUrl: string) => {
    const project = data.projects.find(p => p.id === projectId);
    if (!project) return;
    
    const newImages = [...(project.images || []), { 
      id: crypto.randomUUID(), 
      dataUrl, 
      createdAt: new Date().toISOString() 
    }];
    
    await updateDoc(doc(db, 'projects', projectId), {
      images: newImages
    });
  };

  const deleteProjectImage = async (projectId: string, imageId: string) => {
    const project = data.projects.find(p => p.id === projectId);
    if (!project) return;

    const newImages = (project.images || []).filter(img => img.id !== imageId);
    
    await updateDoc(doc(db, 'projects', projectId), {
      images: newImages
    });
  };

  const updateProjectImageDescription = async (projectId: string, imageId: string, description: string) => {
    const project = data.projects.find(p => p.id === projectId);
    if (!project) return;

    const newImages = (project.images || []).map(img => 
      img.id === imageId ? { ...img, description } : img
    );
    
    await updateDoc(doc(db, 'projects', projectId), {
      images: newImages
    });
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
