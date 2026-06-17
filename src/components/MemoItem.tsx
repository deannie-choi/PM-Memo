import { useState } from 'react';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { Clock, CheckCircle, Trash2, Edit2, X, Save, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { Memo, Project, Client } from '../types';

interface MemoItemProps {
  memo: Memo;
  project?: Project;
  client?: Client;
  onToggleAcknowledge: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string, targetDate?: string) => void;
  onSetPriority?: (id: string, priority?: 1 | 2 | 3) => void;
  onClickProject?: (projectId: string) => void;
  showProjectContext?: boolean;
}

export function MemoItem({
  memo,
  project,
  client,
  onToggleAcknowledge,
  onDelete,
  onEdit,
  onSetPriority,
  onClickProject,
  showProjectContext = false,
}: MemoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(memo.content);
  const [editDate, setEditDate] = useState(
    memo.targetDate ? memo.targetDate.split('T')[0] : ''
  );

  const hasTarget = !!memo.targetDate;
  const isResurfaced =
    hasTarget &&
    (isPast(parseISO(memo.targetDate!)) || isToday(parseISO(memo.targetDate!)));

  const handleSave = () => {
    if (!editContent.trim()) return;
    let targetIso: string | undefined = undefined;
    if (editDate) {
      const parts = editDate.split('-');
      if (parts.length === 3) {
        targetIso = new Date(
          parseInt(parts[0]),
          parseInt(parts[1]) - 1,
          parseInt(parts[2]),
          12,
          0,
          0
        ).toISOString();
      }
    }
    onEdit(memo.id, editContent.trim(), targetIso);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white p-5 rounded-xl border border-indigo-200 shadow-sm mb-4">
        <textarea
          className="w-full border border-slate-200 rounded-lg p-3 min-h-[100px] mb-3 text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y text-sm"
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          placeholder="내용을 입력하세요..."
          autoFocus
        />
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              예약일
            </label>
            <input
              type="date"
              className="border border-slate-200 rounded-md px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                setIsEditing(false);
                setEditContent(memo.content);
                setEditDate(memo.targetDate ? memo.targetDate.split('T')[0] : '');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-slate-600 hover:text-slate-900 text-sm font-medium transition-colors bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              <X className="w-4 h-4" /> 취소
            </button>
            <button
              onClick={handleSave}
              disabled={!editContent.trim()}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              <Save className="w-4 h-4" /> 저장
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "p-5 rounded-xl border shadow-sm group transition-colors relative overflow-hidden flex gap-4 items-start",
      memo.priority === 1 ? "bg-rose-50/30 border-rose-200 hover:border-rose-300" :
      memo.priority === 2 ? "bg-amber-50/50 border-amber-200 hover:border-amber-300" :
      memo.priority === 3 ? "bg-emerald-50/30 border-emerald-200 hover:border-emerald-300" :
      "bg-white border-slate-200 hover:border-slate-300"
    )}>
      {hasTarget && isResurfaced && !memo.isAcknowledged && (
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500" />
      )}
      
      <button
        onClick={() => onToggleAcknowledge(memo.id)}
        className={cn(
          "mt-1 flex-shrink-0 focus:outline-none transition-colors",
          memo.isAcknowledged ? "text-emerald-500" : "text-slate-300 hover:text-emerald-500"
        )}
        title={memo.isAcknowledged ? "완료 취소" : "완료로 표시"}
      >
        <CheckCircle className="w-6 h-6" />
      </button>

      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          {showProjectContext ? (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>{client?.name || '고객사 미정'}</span>
              <span className="text-slate-300">•</span>
              {onClickProject ? (
                <button
                  onClick={() => onClickProject(project?.id!)}
                  className="hover:text-indigo-600 transition-colors"
                >
                  {project?.name || '프로젝트 미정'}
                </button>
              ) : (
                <span>{project?.name || '프로젝트 미정'}</span>
              )}
            </div>
          ) : (
            <span className="text-xs font-semibold text-slate-400 tracking-wider">
              {format(parseISO(memo.createdAt), 'yyyy년 M월 d일')} 기록됨
            </span>
          )}

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {onSetPriority && (
               <div className="flex bg-slate-100 rounded-md p-0.5">
                  <button
                    onClick={() => onSetPriority(memo.id, memo.priority === 1 ? undefined : 1)}
                    className={cn("px-2 py-0.5 text-xs font-bold rounded transition-all", memo.priority === 1 ? "bg-white text-rose-500 shadow-sm" : "text-slate-400 hover:text-rose-400")}
                  >1</button>
                  <button
                    onClick={() => onSetPriority(memo.id, memo.priority === 2 ? undefined : 2)}
                    className={cn("px-2 py-0.5 text-xs font-bold rounded transition-all", memo.priority === 2 ? "bg-white text-amber-500 shadow-sm" : "text-slate-400 hover:text-amber-400")}
                  >2</button>
                  <button
                    onClick={() => onSetPriority(memo.id, memo.priority === 3 ? undefined : 3)}
                    className={cn("px-2 py-0.5 text-xs font-bold rounded transition-all", memo.priority === 3 ? "bg-white text-emerald-500 shadow-sm" : "text-slate-400 hover:text-emerald-400")}
                  >3</button>
               </div>
            )}
            <button
               onClick={() => setIsEditing(true)}
              className="text-slate-300 hover:text-indigo-500 transition-colors"
              title="수정"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(memo.id)}
              className="text-slate-300 hover:text-red-500 transition-colors"
              title="삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-slate-800 text-base whitespace-pre-wrap leading-relaxed">{memo.content}</p>

        {hasTarget && (
          <div
            className={cn(
              'mt-4 pt-3 flex items-center justify-between border-t',
              isResurfaced ? 'border-amber-100' : 'border-slate-100'
            )}
          >
            <div className="flex items-center gap-2">
              {isResurfaced ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1.5 rounded-md border border-amber-200 shadow-sm">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {format(parseISO(memo.targetDate!), 'yyyy년 M월 d일')} 열람됨
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200">
                  <Clock className="w-3.5 h-3.5" />
                  {format(parseISO(memo.targetDate!), 'yyyy년 M월 d일')} 열람 예약
                </div>
              )}
            </div>

            {isResurfaced && (
              <button
                onClick={() => onToggleAcknowledge(memo.id)}
                className={cn(
                  'text-xs font-semibold px-3 py-1.5 rounded-lg transition-all border',
                  memo.isAcknowledged
                    ? 'bg-slate-50 text-slate-400 border-slate-200 italic'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-sm hover:shadow'
                )}
              >
                {memo.isAcknowledged ? '확인 완료' : '확인 완료로 표시'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
