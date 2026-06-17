import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 p-2 border-b border-slate-100 bg-slate-50 flex-wrap">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`px-2.5 py-1 text-sm font-bold rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2.5 py-1 text-sm font-bold rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`px-2.5 py-1 text-sm font-bold rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
      >
        H3
      </button>
      <div className="w-px h-4 bg-slate-300 mx-1"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`px-2.5 py-1 text-sm font-medium rounded ${editor.isActive('paragraph') ? 'bg-slate-200 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
      >
        본문
      </button>
      <div className="w-px h-4 bg-slate-300 mx-1"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`px-2.5 py-1 text-sm font-bold rounded ${editor.isActive('bold') ? 'bg-slate-200 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`px-2.5 py-1 text-sm italic rounded ${editor.isActive('italic') ? 'bg-slate-200 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`px-2.5 py-1 text-sm line-through rounded ${editor.isActive('strike') ? 'bg-slate-200 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
      >
        S
      </button>
      <div className="w-px h-4 bg-slate-300 mx-1"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2.5 py-1 text-sm font-medium rounded ${editor.isActive('bulletList') ? 'bg-slate-200 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
      >
        • 목록
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2.5 py-1 text-sm font-medium rounded ${editor.isActive('orderedList') ? 'bg-slate-200 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
      >
        1. 목록
      </button>
    </div>
  );
};

export const RichTextEditor = ({ value, onChange, className = "" }: { value: string, onChange: (val: string) => void, className?: string }) => {
  const isInitialRender = useRef(true);

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
        attributes: {
            class: 'focus:outline-none min-h-[100px] p-4 text-slate-800 tiptap-content outline-none'
        }
    }
  });

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    
    // This handles reseting the editor after form submit (when value changes back to '')
    if (editor && value === '' && editor.getHTML() !== '<p></p>') {
      editor.commands.setContent('');
    }
  }, [value, editor]);

  return (
    <div className={`border border-slate-200 rounded-lg bg-white overflow-hidden focus-within:border-indigo-500 transition-colors flex flex-col ${className}`}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="flex-1 overflow-y-auto" />
    </div>
  );
};
