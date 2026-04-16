import React from 'react';
import { Bold, Italic, Strikethrough, List, ListOrdered } from 'lucide-react';

const MenuBar = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const getButtonClass = (isActive) => 
    `p-2 rounded-lg transition-colors ${
      isActive 
        ? 'bg-blue-500/20 text-cyan-400' 
        : 'text-blue-400/50 hover:bg-blue-500/10 hover:text-blue-200'
    }`;

  return (
    <div className="flex items-center gap-1 p-2 border-b border-blue-500/20 bg-[#0a0f1c]">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={getButtonClass(editor.isActive('bold'))}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={getButtonClass(editor.isActive('italic'))}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={getButtonClass(editor.isActive('strike'))}
        title="Strikethrough"
      >
        <Strikethrough size={18} />
      </button>
      
      <div className="w-[1px] h-6 bg-blue-500/20 mx-2" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={getButtonClass(editor.isActive('bulletList'))}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={getButtonClass(editor.isActive('orderedList'))}
        title="Numbered List"
      >
        <ListOrdered size={18} />
      </button>
    </div>
  );
};

export default MenuBar;