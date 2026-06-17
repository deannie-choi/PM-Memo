import { useState, useEffect, useRef } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { useData } from '../hooks/useData';
import { ViewState } from '../App';
import { Plus, Folder, Trash2, Calendar, Star, Building2, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { MemoItem } from './MemoItem';

export function ClientWorkspace({ 
  dataStore, 
  clientId, 
  projectId, 
  setView,
  isInternal = false
}: { 
  dataStore: ReturnType<typeof useData>, 
  clientId: string, 
  projectId?: string, 
  setView: (v: ViewState) => void,
  isInternal?: boolean
}) {
  const client = isInternal 
    ? { id: 'internal', name: '일반 회사 업무', color: '#64748b' } as any
    : dataStore.data.clients.find(c => c.id === clientId);
  const projects = dataStore.data.projects.filter(p => p.clientId === clientId);
  
  // If no projectId is passed, default to the first project if it exists.
  const activeProjectId = projectId || (projects.length > 0 ? projects[0].id : null);
  const activeProject = projects.find(p => p.id === activeProjectId);

  const [isAddingProject, setIsAddingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const [isEditingClient, setIsEditingClient] = useState(false);
  const [editClientName, setEditClientName] = useState('');

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    dataStore.addProject(clientId, newProjectName.trim());
    setNewProjectName('');
    setIsAddingProject(false);
  };

  if (!client) {
    return <div className="p-8 text-slate-500">고객사를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Workspace Header */}
      <div className="px-8 pt-8 pb-4 border-b border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            {client.color ? (
               <div className="w-5 h-5 rounded-md flex-shrink-0" style={{ backgroundColor: client.color }} />
            ) : (
               <Building2 className="w-6 h-6 text-indigo-500 flex-shrink-0" />
            )}
            {isEditingClient ? (
                <input
                    autoFocus
                    value={editClientName}
                    onChange={(e) => setEditClientName(e.target.value)}
                    onBlur={() => {
                        if (editClientName.trim() && editClientName.trim() !== client.name) {
                            dataStore.editClient(client.id, editClientName.trim());
                        }
                        setIsEditingClient(false);
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            if (editClientName.trim() && editClientName.trim() !== client.name) {
                                dataStore.editClient(client.id, editClientName.trim());
                            }
                            setIsEditingClient(false);
                        } else if (e.key === 'Escape') {
                            setIsEditingClient(false);
                        }
                    }}
                    className="border-b border-indigo-500 outline-none bg-transparent w-full"
                />
            ) : (
            <div className="flex items-center gap-2 group">
                <h2 
                    title={!isInternal ? "더블클릭하여 이름 수정" : undefined}
                    onDoubleClick={() => {
                        if (!isInternal) {
                            setEditClientName(client.name);
                            setIsEditingClient(true);
                        }
                    }} 
                    className={cn("text-2xl font-bold text-slate-900", !isInternal ? "cursor-pointer hover:text-indigo-600 transition-colors" : "")}
                >
                    {client.name}
                </h2>
                {!isInternal && (
                <button 
                  onClick={() => {
                      setEditClientName(client.name);
                      setIsEditingClient(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-500 transition-opacity"
                  title="이름 변경"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                </button>
                )}
            </div>
            )}
          </h2>
          {!isInternal && (
          <button
            onClick={() => {
              dataStore.deleteClient(client.id);
              setView({ type: 'dashboard' });
            }}
            className="text-sm font-medium text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" /> 고객사 삭제
          </button>
          )}
        </div>

        {/* Project Tabs (OneNote Style) */}
        {!isInternal && (
        <div className="flex flex-wrap items-end gap-1 border-b border-slate-200 -mb-[17px]">
          {projects.map(proj => (
            <button
              key={proj.id}
              onClick={() => setView({ type: 'client', clientId, projectId: proj.id })}
              className={cn(
                "px-5 py-2.5 rounded-t-lg font-medium text-sm transition-all border border-b-0",
                activeProjectId === proj.id
                  ? "bg-white text-indigo-600 border-slate-200 pb-[11px] -mb-[1px] relative z-10 shadow-[0_-2px_4px_rgba(0,0,0,0.02)]"
                  : "bg-slate-50 text-slate-500 border-transparent hover:bg-slate-100 mb-[1px]"
              )}
            >
              <div className="flex items-center gap-2">
                {proj.color ? (
                   <div className="w-3 h-3 rounded-full" style={{ backgroundColor: proj.color }} />
                ) : (
                   <Folder className={cn("w-4 h-4", activeProjectId === proj.id ? "text-indigo-500" : "text-slate-400")} />
                )}
                <span style={{ color: activeProjectId === proj.id ? (proj.color || '#4f46e5') : 'inherit' }}>{proj.name}</span>
              </div>
            </button>
          ))}

          {isAddingProject ? (
            <form onSubmit={handleAddProject} className="px-2 py-1 pb-2 border-b-2 border-indigo-500 relative z-10 -mb-[1px]">
              <input
                autoFocus
                type="text"
                className="w-32 outline-none text-sm font-medium bg-transparent"
                placeholder="프로젝트명..."
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                onBlur={() => {
                  if(!newProjectName.trim()) setIsAddingProject(false);
                }}
              />
            </form>
          ) : (
            <button
              onClick={() => setIsAddingProject(true)}
              className="px-3 py-2 text-slate-400 hover:text-indigo-600 transition-colors mb-1"
              title="새 프로젝트 탭 추가"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
        )}
      </div>

      {/* Project Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50">
        {isInternal ? (
          <ProjectContent 
            project={{ id: 'internal-main', name: '업무 목록', clientId: 'internal' }} 
            dataStore={dataStore} 
            onDeleteProject={() => {}}
            isInternal={true}
          />
        ) : activeProject ? (
          <ProjectContent 
            project={activeProject} 
            dataStore={dataStore} 
            onDeleteProject={() => {
              dataStore.deleteProject(activeProject.id);
              setView({ type: 'client', clientId });
            }}
            isInternal={false}
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500">
            <Folder className="w-12 h-12 text-slate-300 mb-4" />
            <p>위의 + 버튼을 눌러 첫 번째 프로젝트 탭을 생성해주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectContent({ project, dataStore, onDeleteProject, isInternal = false }: { project: any, dataStore: ReturnType<typeof useData>, onDeleteProject: () => void, isInternal?: boolean }) {
  const activeMemos = dataStore.data.memos
    .filter(m => m.projectId === project.id && !m.isAcknowledged)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
  const completedMemos = dataStore.data.memos
    .filter(m => m.projectId === project.id && m.isAcknowledged)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const [newMemoContent, setNewMemoContent] = useState('');
  const [newMemoDate, setNewMemoDate] = useState('');
  const [newMemoPriority, setNewMemoPriority] = useState<1 | 2 | 3 | undefined>(undefined);
  
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editProjectName, setEditProjectName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const result = event.target?.result;
              if (typeof result === 'string') {
                dataStore.addProjectImage(project.id, result);
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [project.id, dataStore]);

  const handleAddMemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemoContent.trim()) return;
    
    let targetIso: string | undefined = undefined;
    if (newMemoDate) {
      const parts = newMemoDate.split('-');
      if (parts.length === 3) {
        targetIso = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]), 12, 0, 0).toISOString();
      }
    }
    
    dataStore.addMemo(project.id, newMemoContent.trim(), targetIso, newMemoPriority);
    setNewMemoContent('');
    setNewMemoDate('');
    setNewMemoPriority(undefined);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-10 pb-32">
      {!isInternal && (
      <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
        {isEditingProject ? (
            <input
                autoFocus
                value={editProjectName}
                onChange={(e) => setEditProjectName(e.target.value)}
                onBlur={() => {
                    if (editProjectName.trim() && editProjectName.trim() !== project.name) {
                        dataStore.editProject(project.id, editProjectName.trim());
                    }
                    setIsEditingProject(false);
                }}
                onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        if (editProjectName.trim() && editProjectName.trim() !== project.name) {
                            dataStore.editProject(project.id, editProjectName.trim());
                        }
                        setIsEditingProject(false);
                    } else if (e.key === 'Escape') {
                        setIsEditingProject(false);
                    }
                }}
                className="text-xl font-semibold text-slate-800 border-b border-indigo-500 outline-none bg-transparent w-full mr-4"
            />
        ) : (
            <div className="flex items-center gap-2 group">
                <h3 
                    title="더블클릭하여 이름 수정"
                    onDoubleClick={() => {
                        setEditProjectName(project.name);
                        setIsEditingProject(true);
                    }}
                    className="text-xl font-semibold text-slate-800 cursor-pointer hover:text-indigo-600 transition-colors"
                >
                    {project.name}
                </h3>
                <button 
                  onClick={() => {
                      setEditProjectName(project.name);
                      setIsEditingProject(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-500 transition-opacity"
                  title="이름 변경"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
                </button>
            </div>
        )}
        <button
          onClick={() => onDeleteProject()}
          className="text-slate-400 hover:text-red-500 text-sm font-medium transition-colors flex items-center gap-1 flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" /> 삭제
        </button>
      </div>
      )}

      {/* Input Area */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm mb-10 transition-colors overflow-hidden">
        <form onSubmit={handleAddMemo} className="flex flex-col gap-4 p-5">
          <RichTextEditor 
            value={newMemoContent}
            onChange={setNewMemoContent}
          />
          <div className="flex flex-col sm:flex-row justify-between items-center pt-3 border-t border-slate-100 gap-4">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5 cursor-pointer hover:text-indigo-600">
                <Calendar className="w-4 h-4" />
                Due Date
                <input 
                  type="date"
                  className="ml-2 border border-slate-200 rounded-lg px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-indigo-500 hover:bg-slate-50 relative z-10"
                  value={newMemoDate}
                  onChange={e => setNewMemoDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  onClick={(e) => e.stopPropagation()}
                />
              </label>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600">우선순위:</span>
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setNewMemoPriority(newMemoPriority === 1 ? undefined : 1)}
                    className={cn(
                      "px-3 py-1 text-xs font-bold rounded-md transition-all",
                      newMemoPriority === 1 ? "bg-white text-rose-600 shadow-sm" : "text-slate-500 hover:bg-white hover:text-rose-500"
                    )}
                  >
                    1. 중요
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMemoPriority(newMemoPriority === 2 ? undefined : 2)}
                    className={cn(
                      "px-3 py-1 text-xs font-bold rounded-md transition-all",
                      newMemoPriority === 2 ? "bg-white text-amber-500 shadow-sm" : "text-slate-500 hover:bg-white hover:text-amber-500"
                    )}
                  >
                    2. 보통
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMemoPriority(newMemoPriority === 3 ? undefined : 3)}
                    className={cn(
                      "px-3 py-1 text-xs font-bold rounded-md transition-all",
                      newMemoPriority === 3 ? "bg-white text-emerald-500 shadow-sm" : "text-slate-500 hover:bg-white hover:text-emerald-500"
                    )}
                  >
                    3. 덜 중요
                  </button>
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={!newMemoContent.trim()}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              기록하기
            </button>
          </div>
        </form>
      </div>

      {project.images && project.images.length > 0 && (
          <div className="mb-10">
              <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2 px-1">
                  <ImageIcon className="w-4 h-4" />
                  프로젝트 시각 자료
                  <span className="text-xs text-slate-400 font-normal ml-2">({project.images.length}개의 이미지)</span>
              </h3>
               <div className="flex flex-wrap gap-4">
                  {project.images.map((img: { id: string; dataUrl: string; createdAt: string; description?: string }) => (
                      <div key={img.id} className="relative group w-[300px] flex flex-col rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white p-1">
                          <img 
                            src={img.dataUrl} 
                            alt="Project attachment" 
                            className="w-full h-auto object-contain max-h-[250px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                            onClick={() => setSelectedImage(img.dataUrl)}
                          />
                          <textarea
                            value={img.description || ''}
                            onChange={(e) => dataStore.updateProjectImageDescription(project.id, img.id, e.target.value)}
                            placeholder="설명을 추가하세요..."
                            className="mt-2 w-full p-2 text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500 resize-none h-16"
                          />
                          <button
                              onClick={() => dataStore.deleteProjectImage(project.id, img.id)}
                              className="absolute top-3 right-3 bg-white/90 text-slate-700 hover:text-red-500 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-sm"
                              title="삭제"
                          >
                              <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* Memos List */}
      <div className="space-y-4">
        {activeMemos.length === 0 && completedMemos.length === 0 ? (
          <div className="text-center py-12 text-slate-400 bg-white/50 rounded-xl border border-dashed border-slate-200">
            아직 기록이 없습니다. 새로운 내용을 추가해보세요.
          </div>
        ) : (
          <>
            {activeMemos.map(memo => (
              <MemoItem
                key={memo.id}
                memo={memo}
                onToggleAcknowledge={dataStore.toggleMemoAcknowledge}
                onDelete={dataStore.deleteMemo}
                onEdit={dataStore.editMemo}
                onSetPriority={dataStore.setMemoPriority}
              />
            ))}
            
            {completedMemos.length > 0 && (
              <div className="pt-8 mt-8 border-t border-slate-200">
                <h3 className="text-sm font-semibold text-slate-500 mb-4 px-2">완료된 항목</h3>
                <div className="space-y-4 opacity-60 hover:opacity-100 transition-opacity">
                  {completedMemos.map(memo => (
                    <MemoItem
                      key={memo.id}
                      memo={memo}
                      onToggleAcknowledge={dataStore.toggleMemoAcknowledge}
                      onDelete={dataStore.deleteMemo}
                      onEdit={dataStore.editMemo}
                      onSetPriority={dataStore.setMemoPriority}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-7xl max-h-[90vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 transition-colors p-2"
            >
              <X className="w-8 h-8" />
            </button>
            <img 
              src={selectedImage} 
              alt="Expanded view" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
