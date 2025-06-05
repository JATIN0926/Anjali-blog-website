import React, { useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import CustomParagraph from "./CustomParagraph.js";
import "./style.css";

const CreateBlog = () => {
  const fileInputRef = useRef();
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

  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState("");
  const [showInput, setShowInput] = useState(false);

  const handleAddTag = () => {
    if (currentTag.trim() !== "" && tags.length < 5) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
      setShowInput(false);
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleDeleteTag = (indexToDelete) => {
    const newTags = tags.filter((_, idx) => idx !== indexToDelete);
    setTags(newTags);
  };

  if (!editor) return null;

  const addSeparator = () => {
    editor.commands.insertContent('<p class="separator">•  •  •</p><br/>');
  };

  const handleImageUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Only image files are allowed.");
      return;
    }

    // Upload to server or use a temporary URL
    const reader = new FileReader();
    reader.onload = () => {
      const imageUrl = reader.result;
      editor.chain().focus().setImage({ src: imageUrl }).run();
    };
    reader.readAsDataURL(file);
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
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`px-4 py-1 rounded cursor-pointer ${
            editor.isActive("italic") ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          Italic
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
          onClick={() => applyClassToCurrentParagraph("Value_Statement")}
          className="px-4 py-1 bg-gray-200 rounded cursor-pointer"
        >
          Value Statement
        </button>
        <button
          onClick={addSeparator}
          className="px-4 py-1 bg-gray-200 rounded cursor-pointer"
        >
          Separator (•••)
        </button>
        <button
          onClick={handleImageUploadClick}
          className="px-4 py-1 bg-gray-200 rounded cursor-pointer"
        >
          Image Input
        </button>
        <input
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
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
      <div className="flex flex-col items-center gap-2 mt-8">
        {/* Tags Display */}
        <div className="flex justify-center flex-wrap gap-3">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="bg-[#E7E6E6] text-[#201F1F] px-4 py-1 text-[1.2rem] tag"
            >
              {tag}
              <button
                onClick={() => handleDeleteTag(index)}
                className="ml-2 text-gray-600 hover:text-red-600 font-bold"
              >
                &times;
              </button>
            </span>
          ))}
          {/* Input shown only if showInput is true and tags < 5 */}
          {showInput && tags.length < 5 && (
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              onKeyDown={handleInputKeyPress}
              autoFocus
              className="px-4 py-1 rounded-full text-sm border border-gray-400 bg-white"
              placeholder="Type tag & press Enter"
            />
          )}
        </div>

        {/* Button to show input */}
        {!showInput && tags.length < 5 && (
          <button
            onClick={() => setShowInput(true)}
            className="px-4 py-1 bg-gray-300 rounded-full text-sm font-medium hover:bg-gray-400"
          >
            + Add Tag
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateBlog;
