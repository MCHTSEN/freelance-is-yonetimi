import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
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
    className={`p-2 rounded-lg transition-colors ${
      isActive
        ? 'bg-primary/20 text-primary'
        : 'text-text-secondary hover:bg-surface-dark hover:text-white'
    }`}
    title={title}
  >
    <span className="material-symbols-rounded text-lg">{icon}</span>
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
        class: 'prose prose-invert prose-sm max-w-none focus:outline-none min-h-[200px] px-4 py-3',
      },
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="border border-border-dark rounded-xl overflow-hidden bg-background-dark">
      {/* Toolbar */}
      {editable && (
        <div className="flex items-center gap-1 p-2 border-b border-border-dark bg-surface-dark">
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

          <div className="w-px h-6 bg-border-dark mx-1" />

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

          <div className="w-px h-6 bg-border-dark mx-1" />

          <MenuButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            icon="code"
            title="Kod bloğu"
          />
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            icon="format_quote"
            title="Alıntı"
          />

          <div className="w-px h-6 bg-border-dark mx-1" />

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
          color: #6b8ba3;
          pointer-events: none;
          height: 0;
        }
        .ProseMirror {
          min-height: 200px;
        }
        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
          color: white;
          font-weight: 700;
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror h2 {
          font-size: 1.25rem;
        }
        .ProseMirror p {
          color: #c4d6e8;
          margin-bottom: 0.75em;
        }
        .ProseMirror ul, .ProseMirror ol {
          padding-left: 1.5em;
          margin-bottom: 0.75em;
        }
        .ProseMirror li {
          color: #c4d6e8;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #3b82f6;
          padding-left: 1em;
          margin-left: 0;
          color: #92adc9;
          font-style: italic;
        }
        .ProseMirror pre {
          background: #0d141c;
          border-radius: 0.5rem;
          padding: 1rem;
          margin-bottom: 0.75em;
          overflow-x: auto;
        }
        .ProseMirror code {
          font-family: 'Fira Code', monospace;
          font-size: 0.875rem;
          color: #e2e8f0;
        }
        .ProseMirror pre code {
          color: inherit;
          background: none;
          padding: 0;
        }
        .ProseMirror :not(pre) > code {
          background: #233648;
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          color: #f472b6;
        }
        .ProseMirror strong {
          color: white;
          font-weight: 700;
        }
        .ProseMirror em {
          color: #c4d6e8;
        }
        .ProseMirror s {
          color: #6b8ba3;
        }
        /* Syntax highlighting */
        .hljs-comment,
        .hljs-quote {
          color: #6b8ba3;
        }
        .hljs-keyword,
        .hljs-selector-tag {
          color: #c678dd;
        }
        .hljs-string,
        .hljs-attr {
          color: #98c379;
        }
        .hljs-number,
        .hljs-literal {
          color: #d19a66;
        }
        .hljs-name,
        .hljs-title {
          color: #61afef;
        }
      `}</style>
    </div>
  )
}
