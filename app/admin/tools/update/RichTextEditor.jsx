"use client";

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import MenuBar from './MenuBar';

const RichTextEditor = ({ description, onChange }) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: description,
    immediatelyRender: false, 
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[250px] p-4 focus:outline-none text-blue-50',
      },
    },
  });

  return (
    <div className="bg-[#0a0f1c] rounded-xl border border-blue-500/20 overflow-hidden flex flex-col shadow-inner">
      <MenuBar editor={editor} />
      <div className="flex-1 cursor-text" onClick={() => editor?.commands.focus()}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default RichTextEditor;