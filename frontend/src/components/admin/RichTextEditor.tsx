import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Heading2, Undo2, Redo2 } from 'lucide-react'
import type React from 'react'

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm max-w-none focus:outline-none min-h-[220px] px-3 py-2',
        'data-placeholder': placeholder ?? '',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // keep editor in sync when form resets/load
  if (editor && value !== editor.getHTML()) {
    const isEmptyIncoming = !value || value === '<p></p>'
    const isEmptyEditor =
      editor.getText().trim().length === 0 && editor.getHTML() === '<p></p>'
    if (!(isEmptyIncoming && isEmptyEditor)) {
      editor.commands.setContent(value || '', false)
    }
  }

  if (!editor) {
    return (
      <div className="rounded border border-border bg-white px-3 py-2 text-sm text-ink-muted">
        Loading editor…
      </div>
    )
  }

  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    children,
    label,
  }: {
    onClick: () => void
    active?: boolean
    disabled?: boolean
    children: React.ReactNode
    label: string
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`inline-flex items-center justify-center w-9 h-9 rounded border text-ink transition-colors disabled:opacity-40 ${
        active ? 'bg-brand text-white border-brand' : 'bg-white border-border hover:bg-surface'
      }`}
    >
      {children}
    </button>
  )

  return (
    <div className="rounded border border-border overflow-hidden bg-white">
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-surface">
        <ToolbarButton
          label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Bulleted list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
        >
          <ListOrdered className="w-4 h-4" />
        </ToolbarButton>
        <div className="flex-1" />
        <ToolbarButton
          label="Undo"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
        >
          <Undo2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Redo"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
        >
          <Redo2 className="w-4 h-4" />
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

