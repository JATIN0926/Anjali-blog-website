import React from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import CustomParagraph from "./CustomParagraph.js";
import "./style.css";

const CreateBlog = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: false,
      }),
      CustomParagraph,
      Image,
      BulletList,
      ListItem,
    ],
    content: "",
  });

  if (!editor) return null;

  const addSeparator = () => {
    editor.commands.insertContent('<p class="separator">•  •  •</p><br/>');
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const applyClassToCurrentParagraph = (className) => {
    const { state, view } = editor;
    const { selection, tr } = state;
    const { $from } = selection;

    const pos = $from.before($from.depth);
    const node = state.doc.nodeAt(pos);

    if (node?.type.name === "paragraph") {
      const transaction = tr.setNodeMarkup(pos, undefined, {
        ...node.attrs,
        class: className,
      });
      view.dispatch(transaction);
    } else {
      // Fallback if not inside a paragraph
      editor.commands.insertContent(`<p class="${className}"></p>`);
    }
  };

  return (
    <div className="w-full p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Create Blog</h1>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => editor.chain().focus().setHeading({ level: 1 }).run()}
          className="px-4 py-1 bg-gray-200 rounded cursor-pointer"
        >
          H1
        </button>
        <button
          onClick={() => editor.chain().focus().setHeading({ level: 2 }).run()}
          className="px-4 py-1 bg-gray-200 rounded cursor-pointer"
        >
          H2
        </button>
        <button
          onClick={() => editor.chain().focus().setHeading({ level: 3 }).run()}
          className="px-4 py-1 bg-gray-200 rounded cursor-pointer"
        >
          H3
        </button>
        <button
          onClick={() => applyClassToCurrentParagraph("title")}
          className="px-4 py-1 bg-gray-200 rounded cursor-pointer"
        >
          Title
        </button>
        <button
          onClick={() => applyClassToCurrentParagraph("regular-para")}
          className="px-4 py-1 bg-gray-200 rounded cursor-pointer"
        >
          Regular Para
        </button>
        <button
          onClick={() => applyClassToCurrentParagraph("small-desc")}
          className="px-4 py-1 bg-gray-200 rounded cursor-pointer"
        >
          Small Desc
        </button>
        <button
          onClick={() => applyClassToCurrentParagraph("quote-para")}
          className="px-4 py-1 bg-gray-200 rounded cursor-pointer"
        >
          Quote Para
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`px-4 py-1 rounded cursor-pointer ${
            editor.isActive("bold") ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          Bold
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-4 py-1 rounded cursor-pointer ${
            editor.isActive("blockquote")
              ? "bg-black text-white"
              : "bg-gray-200"
          }`}
        >
          Blockquote
        </button>
        <button
          onClick={addSeparator}
          className="px-4 py-1 bg-gray-200 rounded cursor-pointer"
        >
          Separator (•••)
        </button>
        <button
          onClick={addImage}
          className="px-4 py-1 bg-gray-200 rounded cursor-pointer"
        >
          Image Input
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`px-4 py-1 rounded cursor-pointer ${
            editor.isActive("bulletList")
              ? "bg-black text-white"
              : "bg-gray-200"
          }`}
        >
          Bullet List
        </button>
      </div>

      <EditorContent editor={editor} className="tiptap" />
    </div>
  );
};

export default CreateBlog;
