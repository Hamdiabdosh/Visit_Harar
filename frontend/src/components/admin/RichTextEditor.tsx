"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Undo2,
  Redo2,
} from "lucide-react";
import { useEffect, type ReactNode } from "react";
import type React from "react";
import { ClientOnly } from "@/components/admin/ClientOnly";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
};

export function RichTextEditor({ value, onChange, placeholder }: Props) {
  return (
    <ClientOnly fallback={<EditorPlaceholder placeholder={placeholder} />}>
      <RichTextEditorInner
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </ClientOnly>
  );
}

function EditorPlaceholder({ placeholder }: { placeholder?: string }) {
  return (
    <div
      className="rounded border border-border bg-white min-h-[260px] px-3 py-2 text-sm text-ink-muted"
      aria-hidden
    >
      {placeholder ? placeholder : "Loading editor…"}
    </div>
  );
}

function RichTextEditorInner({ value, onChange, placeholder }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
    ],
    content: value || "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[220px] px-3 py-2",
        "data-placeholder": placeholder ?? "",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (value === editor.getHTML()) return;
    const isEmptyIncoming = !value || value === "<p></p>";
    const isEmptyEditor =
      editor.getText().trim().length === 0 && editor.getHTML() === "<p></p>";
    if (isEmptyIncoming && isEmptyEditor) return;
    editor.commands.setContent(value || "", { emitUpdate: false });
  }, [editor, value]);

  if (!editor) {
    return <EditorPlaceholder placeholder={placeholder} />;
  }

  return (
    <div className="rounded border border-border overflow-hidden bg-white">
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-surface">
        <ToolbarButton
          label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
        >
          <Bold className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
        >
          <Italic className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Heading"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
        >
          <Heading2 className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Bulleted list"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
        >
          <List className="w-4 h-4" />
        </ToolbarButton>
        <ToolbarButton
          label="Numbered list"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
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
  );
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  children,
  label,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`inline-flex items-center justify-center w-9 h-9 rounded border text-ink transition-colors disabled:opacity-40 ${
        active
          ? "bg-brand text-white border-brand"
          : "bg-white border-border hover:bg-surface"
      }`}
    >
      {children}
    </button>
  );
}
