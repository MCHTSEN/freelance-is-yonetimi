import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { common, createLowlight } from 'lowlight'

const lowlight = createLowlight(common)

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  editable?: boolean
}

const MenuButton = ({
  onClick,
  isActive,
  icon,
  title,
}: {
  onClick: () => void
  isActive?: boolean
  icon: string
  title: string
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`group relative flex items-center justify-center size-9 rounded-xl transition-all duration-300 ${
      isActive
        ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-105'
        : 'text-slate-500 hover:bg-white/10 hover:text-white'
    }`}
    title={title}
  >
    <span className="material-symbols-rounded text-[20px]">{icon}</span>
    {isActive && (
       <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white shadow-[0_0_8px_white]" />
    )}
  </button>
)

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Yazmaya başlayın...',
  editable = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[300px] px-8 py-6 selection:bg-primary/30',
      },
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="border border-white/5 rounded-3xl overflow-hidden bg-white/[0.02] backdrop-blur-3xl shadow-2xl">
      {/* Premium Toolbar */}
      {editable && (
        <div className="flex items-center gap-1.5 p-3 border-b border-white/5 bg-white/5 backdrop-blur-xl">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon="format_bold"
            title="Kalın (Ctrl+B)"
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon="format_italic"
            title="İtalik (Ctrl+I)"
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive('strike')}
            icon="strikethrough_s"
            title="Üstü çizili"
          />

          <div className="w-px h-6 bg-white/10 mx-2" />

          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            icon="title"
            title="Başlık"
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon="format_list_bulleted"
            title="Madde listesi"
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            icon="format_list_numbered"
            title="Numaralı liste"
          />

          <div className="w-px h-6 bg-white/10 mx-2" />

          <MenuButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            icon="code_blocks"
            title="Kod bloğu"
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('format_quote')}
            icon="format_quote"
            title="Alıntı"
          />

          <div className="w-px h-6 bg-white/10 mx-2" />

          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            icon="undo"
            title="Geri al (Ctrl+Z)"
          />
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            icon="redo"
            title="Yinele (Ctrl+Y)"
          />
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} />

      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #475569;
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
        .ProseMirror {
          min-height: 300px;
          outline: none !important;
        }
        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
          color: white;
          font-weight: 900;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          letter-spacing: -0.025em;
        }
        .ProseMirror h2 {
          font-size: 1.5rem;
        }
        .ProseMirror p {
          color: #94a3b8;
          margin-bottom: 1em;
          line-height: 1.8;
          font-size: 0.95rem;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 2em;
          margin-bottom: 1em;
          color: #94a3b8;
        }
        .ProseMirror li {
          margin-bottom: 0.5em;
        }
        .ProseMirror blockquote {
          border-left: 4px solid #3b82f6;
          padding: 1rem 1.5rem;
          margin: 1.5rem 0;
          background: rgba(59, 130, 246, 0.05);
          border-radius: 0 1rem 1rem 0;
          color: #cbd5e1;
          font-style: italic;
        }
        .ProseMirror pre {
          background: #0d1117;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 1.5rem;
          padding: 1.5rem;
          margin: 1.5rem 0;
          overflow-x: auto;
        }
        .ProseMirror code {
          font-family: 'Fira Code', monospace;
          font-size: 0.85rem;
          color: #e2e8f0;
        }
        .ProseMirror pre code {
          color: inherit;
          background: none;
          padding: 0;
        }
        .ProseMirror :not(pre) > code {
          background: rgba(255,255,255,0.05);
          padding: 0.3em 0.6em;
          border-radius: 0.5rem;
          color: #c084fc;
          font-weight: 500;
        }
        .ProseMirror strong {
          color: white;
          font-weight: 900;
        }
        /* Syntax highlighting */
        .hljs-comment { color: #475569; }
        .hljs-keyword { color: #c084fc; }
        .hljs-string { color: #4ade80; }
        .hljs-number { color: #fbbf24; }
        .hljs-title { color: #60a5fa; }
      `}</style>
    </div>
  )
}
