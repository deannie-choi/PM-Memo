import { useData } from '../hooks/useData';
import { ViewState } from '../App';
import { format, parseISO } from 'date-fns';
import { CheckCircle, FileText, AlertCircle, Clock, AlertTriangle, Trash2, ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { cn } from '../lib/utils';
import { useState } from 'react';

export function Dashboard({ dataStore, setView }: { dataStore: ReturnType<typeof useData>, setView: (v: ViewState) => void }) {
  const { data } = dataStore;
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  const priority1Memos = data.memos.filter(m => m.priority === 1 && !m.isAcknowledged).sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const priority2Memos = data.memos.filter(m => m.priority === 2 && !m.isAcknowledged).sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  const priority3Memos = data.memos.filter(m => m.priority === 3 && !m.isAcknowledged).sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const generalMemos = data.memos.filter(m => m.priority !== 1 && m.priority !== 2 && m.priority !== 3 && !m.isAcknowledged).sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const groupedGeneralMemos = generalMemos.reduce((acc, memo) => {
    if (!acc[memo.projectId]) {
      acc[memo.projectId] = [];
    }
    acc[memo.projectId].push(memo);
    return acc;
  }, {} as Record<string, typeof generalMemos>);

  const completedMemos = data.memos.filter(m => m.isAcknowledged).sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }).slice(0, 20);

  return (
    <div className="w-full max-w-[1600px] mx-auto p-6 md:p-10 pb-32">
       <header className="mb-8 border-b border-slate-200 pb-5">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">전체 현황 대시보드</h2>
        <p className="text-sm text-slate-500 mt-1">우선순위별로 핵심 사항을 파악하고 일반 메모를 확인해보세요.</p>
       </header>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {/* Priority 1 */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-rose-600 border-b border-rose-100 pb-2">
              <AlertCircle className="w-5 h-5" />
              <h3 className="text-lg font-semibold">1. 중요</h3>
              <span className="ml-auto bg-rose-100 text-rose-700 text-xs font-bold px-2 py-0.5 rounded-full">{priority1Memos.length}</span>
            </div>
            {priority1Memos.length === 0 ? (
               <div className="text-slate-400 p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-center">
                  중요 항목이 없습니다.
               </div>
            ) : (
                <div className="space-y-2">
                  {priority1Memos.map(memo => (
                      <CompactMemoItem key={memo.id} memo={memo} dataStore={dataStore} setView={setView} colorTheme="rose" />
                  ))}
                </div>
            )}
          </section>

          {/* Priority 2 */}
          <section className="space-y-4">
              <div className="flex items-center gap-2 text-amber-600 border-b border-amber-100 pb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-lg font-semibold">2. 보통</h3>
              <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{priority2Memos.length}</span>
              </div>
              {priority2Memos.length === 0 ? (
              <div className="text-slate-400 p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-center">
                  보통 항목이 없습니다.
              </div>
              ) : (
                  <div className="space-y-2">
                  {priority2Memos.map(memo => (
                      <CompactMemoItem key={memo.id} memo={memo} dataStore={dataStore} setView={setView} colorTheme="amber" />
                  ))}
                  </div>
              )}
          </section>

          {/* Priority 3 */}
          <section className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 border-b border-emerald-100 pb-2">
              <Clock className="w-5 h-5" />
              <h3 className="text-lg font-semibold">3. 덜 중요</h3>
              <span className="ml-auto bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{priority3Memos.length}</span>
              </div>
              {priority3Memos.length === 0 ? (
              <div className="text-slate-400 p-4 bg-slate-50 rounded-lg border border-slate-200 text-sm text-center">
                  해당 항목이 없습니다.
              </div>
              ) : (
                  <div className="space-y-2">
                  {priority3Memos.map(memo => (
                      <CompactMemoItem key={memo.id} memo={memo} dataStore={dataStore} setView={setView} colorTheme="emerald" />
                  ))}
                  </div>
              )}
          </section>
       </div>

       {/* General Memos section */}
       <section className="mt-12 pt-8 border-t border-slate-200">
            <div className="flex items-center gap-2 text-slate-600 mb-4">
              <FileText className="w-5 h-5" />
              <h3 className="text-xl font-semibold">일반 메모</h3>
              <span className="ml-2 bg-slate-100 text-slate-600 text-sm font-bold px-2 py-0.5 rounded-full">{generalMemos.length}</span>
            </div>
            {generalMemos.length === 0 ? (
               <div className="text-slate-400 p-6 bg-slate-50 rounded-xl border border-slate-200 text-sm text-center">
                  일반 메모가 없습니다.
               </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
                  {Object.entries(groupedGeneralMemos).map(([projectId, projectMemos]) => {
                    const project = dataStore.data.projects.find(p => p.id === projectId);
                    const isInternal = project?.clientId === 'internal';
                    const client = isInternal ? { id: 'internal', name: '일반 회사 업무', color: '#10b981' } : dataStore.data.clients.find(c => c.id === project?.clientId);
                    const projectName = project?.name || '삭제된 프로젝트';
                    const clientName = client?.name || '삭제된 클라이언트';
                    const isExpanded = expandedProjects[projectId] ?? true;

                    return (
                      <div key={projectId} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                        <button
                          onClick={() => toggleProject(projectId)}
                          className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3">
                            <Folder className="w-5 h-5" style={{ color: project?.color || client?.color || '#6366f1' }} />
                            <div>
                               <h4 className="font-semibold text-slate-800 line-clamp-1">{projectName}</h4>
                               <p className="text-xs text-slate-500 line-clamp-1">{clientName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2 py-1 rounded-full">{projectMemos.length}</span>
                            {isExpanded ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                          </div>
                        </button>
                        {isExpanded && (
                           <div className="p-3 flex flex-col gap-3 bg-slate-50/50">
                             {projectMemos.map(memo => (
                               <CompactMemoItem key={memo.id} memo={memo} dataStore={dataStore} setView={setView} colorTheme="slate" />
                             ))}
                           </div>
                        )}
                      </div>
                    );
                  })}
                </div>
            )}
       </section>

       {/* Completed Memos section */}
       {completedMemos.length > 0 && (
         <section className="mt-12 pt-8 border-t border-slate-200 opacity-60 hover:opacity-100 transition-opacity">
              <div className="flex items-center gap-2 text-slate-500 mb-4">
                <CheckCircle className="w-5 h-5" />
                <h3 className="text-xl font-semibold">최근 완료된 항목</h3>
                <span className="ml-2 bg-slate-100 text-slate-500 text-sm font-bold px-2 py-0.5 rounded-full">{completedMemos.length}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {completedMemos.map(memo => (
                    <CompactMemoItem key={memo.id} memo={memo} dataStore={dataStore} setView={setView} colorTheme="slate" />
                ))}
              </div>
         </section>
       )}
    </div>
  )
}

function CompactMemoItem({ memo, dataStore, setView, colorTheme = "slate" }: any) {
  const project = dataStore.data.projects.find((p: any) => p.id === memo.projectId);
  const isInternal = project?.clientId === 'internal';
  const client = isInternal ? { id: 'internal', name: '일반 회사 업무', color: '#10b981' } : dataStore.data.clients.find((c: any) => c.id === project?.clientId);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(memo.content);

  const handleSave = () => {
      if (editContent.trim() && editContent.trim() !== memo.content) {
          dataStore.editMemo(memo.id, editContent.trim(), memo.targetDate);
      }
      setIsEditing(false);
  };

  const colors = {
      rose: "border-rose-200 bg-rose-50/30 hover:border-rose-300",
      amber: "border-amber-200 bg-amber-50/50 hover:border-amber-300",
      emerald: "border-emerald-200 bg-emerald-50/30 hover:border-emerald-300",
      slate: "border-slate-200 hover:border-slate-300"
  };

  return (
    <div className={cn(
        "bg-white rounded-lg border shadow-sm p-3 flex items-start gap-3 transition-colors group",
        memo.isAcknowledged ? "opacity-50 grayscale" : "",
        !memo.isAcknowledged ? (colors as any)[colorTheme] : "border-slate-200"
    )}>
        <button 
          onClick={() => dataStore.toggleMemoAcknowledge(memo.id)}
          className={cn(
            "mt-0.5 flex-shrink-0 transition-colors",
            memo.isAcknowledged ? "text-emerald-500" : "text-slate-300 hover:text-emerald-500"
          )}
        >
          <CheckCircle className="w-5 h-5" />
        </button>

        <div className="flex-1 min-w-0">
            {isEditing ? (
                 <textarea
                    autoFocus
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    onBlur={handleSave}
                    onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSave();
                        } else if (e.key === 'Escape') {
                            setEditContent(memo.content);
                            setIsEditing(false);
                        }
                    }}
                    className="w-full text-sm text-slate-800 break-words mb-1 bg-white border border-indigo-300 rounded p-1.5 outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none min-h-[60px]"
                 />
            ) : (
                <div 
                    className={cn(
                        "text-sm text-slate-800 break-words mb-1 cursor-pointer hover:text-indigo-600 transition-colors",
                        memo.isAcknowledged ? "line-through text-slate-500" : "font-medium"
                    )}
                    onClick={() => !memo.isAcknowledged && setIsEditing(true)}
                    title="클릭하여 수정"
                >
                   {memo.content}
                </div>
            )}
            
            <div className="flex items-center text-xs text-slate-500 overflow-hidden whitespace-nowrap mt-2">
                <div 
                  className="flex items-center gap-1.5 hover:text-indigo-600 cursor-pointer transition-colors shrink min-w-0" 
                  onClick={() => isInternal ? setView({ type: 'internal' }) : setView({ type: 'client', clientId: client?.id })}
                >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: client?.color || '#94a3b8' }} />
                    <span className="font-medium truncate">{client?.name || '알 수 없음'}</span>
                </div>
                {!isInternal && (
                  <>
                    <span className="text-slate-300 mx-1.5 shrink-0">•</span>
                    <div 
                      className="flex items-center gap-1.5 hover:text-indigo-600 cursor-pointer transition-colors shrink min-w-0" 
                      onClick={() => setView({ type: 'client', clientId: client?.id, projectId: project?.id })}
                    >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project?.color || '#94a3b8' }} />
                        <span className="font-medium text-slate-600 truncate">{project?.name || '알 수 없음'}</span>
                    </div>
                  </>
                )}
                
                {memo.targetDate && (
                    <>
                       <span className="text-slate-300 mx-1.5 shrink-0">•</span>
                       <span className="text-slate-600 font-semibold shrink-0">
                           {format(parseISO(memo.targetDate), 'yyyy-MM-dd')}
                       </span>
                    </>
                )}
            </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex bg-slate-100 rounded-md p-0.5">
                  <button
                    onClick={() => dataStore.setMemoPriority(memo.id, memo.priority === 1 ? undefined : 1)}
                    className={cn("px-1.5 py-0.5 text-[10px] font-bold rounded transition-all", memo.priority === 1 ? "bg-white text-rose-500 shadow-sm" : "text-slate-400 hover:text-rose-400")}
                  >1</button>
                  <button
                    onClick={() => dataStore.setMemoPriority(memo.id, memo.priority === 2 ? undefined : 2)}
                    className={cn("px-1.5 py-0.5 text-[10px] font-bold rounded transition-all", memo.priority === 2 ? "bg-white text-amber-500 shadow-sm" : "text-slate-400 hover:text-amber-400")}
                  >2</button>
                  <button
                    onClick={() => dataStore.setMemoPriority(memo.id, memo.priority === 3 ? undefined : 3)}
                    className={cn("px-1.5 py-0.5 text-[10px] font-bold rounded transition-all", memo.priority === 3 ? "bg-white text-emerald-500 shadow-sm" : "text-slate-400 hover:text-emerald-400")}
                  >3</button>
            </div>
            <button
              onClick={() => dataStore.deleteMemo(memo.id)}
              className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 transition-colors"
              title="메모 삭제"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
        </div>
    </div>
  )
}
