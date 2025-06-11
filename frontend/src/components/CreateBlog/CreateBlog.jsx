import React, { useRef, useState, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import CustomParagraph from "./CustomParagraph.js";
import toast from "react-hot-toast";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import {
  setTitle,
  setContent,
  setTags,
  setSelectedOption,
} from "../../redux/slices/blogDraftSlice.js";
import "./style.css";

const CreateBlog = () => {
  const fileInputRef = useRef();
  const dispatch = useDispatch();
  const { title, content, selectedOption } = useSelector(
    (state) => state.blogDraft
  );
  const user = useSelector((state) => state.user.currentUser);
  const storedTags = useSelector((state) => state.blogDraft.tags);

  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
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
    content: content || "",
  });
  const [tags, setLocalTags] = useState(storedTags || []);
  const [currentTag, setCurrentTag] = useState("");
  const [showInput, setShowInput] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!editor) return;

    const updateReduxContent = () => {
      const html = editor.getHTML();
      dispatch(setContent(html));
    };

    editor.on("update", updateReduxContent);

    return () => editor.off("update", updateReduxContent);
  }, [editor, dispatch]);

  useEffect(() => {
    dispatch(setTags(tags));
  }, [tags, dispatch]);

  const handleAddTag = () => {
    if (tags.length >= 5) {
      toast.error("You can add up to 5 tags only.");
      return;
    }

    if (
      currentTag.trim() !== "" &&
      tags.length < 5 &&
      !tags.includes(currentTag.trim())
    ) {
      setLocalTags([...tags, currentTag.trim()]);
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
    setLocalTags(newTags);
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
    event.target.value = null;

    if (!file) return;

    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      toast.error("Only image files are allowed.");
      return;
    }

    toast.loading("Uploading...");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "blog_preset");

    try {
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/upload`,
        formData
      );

      toast.dismiss();
      toast.success("Uploaded successfully!");

      const fileUrl = response.data.secure_url;

      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: "image",
            attrs: {
              src: fileUrl,
            },
          },
          {
            type: "paragraph",
          },
        ])
        .run();
    } catch (error) {
      toast.dismiss();
      toast.error("Upload failed!");
      console.error("Cloudinary upload error:", error);
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

  const handlePostBlog = async () => {
    if (
      !title.trim() ||
      !content.trim() ||
      tags.length === 0 ||
      !selectedOption
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    try {
      toast.loading("Posting your blog...");

      const response = await axios.post(
        `/api/blogs/create`,
        {
          title,
          content,
          tags,
          type: selectedOption,
          uid: user.uid,
        },
        {
          withCredentials: true,
        }
      );

      console.log("res", response.data);

      toast.dismiss();
      toast.success("Blog posted successfully!");

      dispatch(setTitle(""));
      dispatch(setContent(""));
      dispatch(setTags([]));
      dispatch(setSelectedOption("Not Set"));
      setLocalTags([]);
      setCurrentTag("");
      setShowInput(false);
      editor.commands.setContent("");
    } catch (error) {
      toast.dismiss();
      console.error("Error posting blog:", error?.response || error.message);
      toast.error(
        error?.response?.data?.message || "Failed to post blog. Try again!"
      );
    }
  };

  return (
    <div className="w-full p-6 flex flex-col gap-6">
      <div
        className="w-full flex items-center justify-between"
        style={{ fontFamily: "SometypeMono Regular, monospace" }}
      >
        <h1 className="text-[#201F1F]">Anjali Chaudhary</h1>
        <div className="relative inline-block text-left" ref={dropdownRef}>
          <button
            className="flex items-center gap-2 text-[#201F1F] font-medium cursor-pointer border border-[#504E4F] px-4 py-2"
            onClick={() => setDropdownOpen((prev) => !prev)}
          >
            {selectedOption}
            <img src="/icons/arrow.svg" alt="Arrow" className="w-4 h-4" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-30 bg-white border border-[#504E4F] rounded shadow-md z-10">
              <ul className="py-1 text-sm text-[#201F1F]">
                {["Diary", "Article"].map((option) => (
                  <li
                    key={option}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      dispatch(setSelectedOption(option));
                      setDropdownOpen(false);
                    }}
                  >
                    {option}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      <h1 className="text-3xl font-bold">Create Blog</h1>

      <div className="flex flex-wrap gap-2 sticky top-0 bg-white z-20 py-2">
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
      <input
        type="text"
        placeholder="Enter Blog Title"
        value={title}
        onChange={(e) => dispatch(setTitle(e.target.value))}
        className="w-full text-2xl font-semibold p-2 border-b border-gray-300 outline-none mb-4"
      />
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
      <button
        onClick={handlePostBlog}
        className="mt-4 px-4 py-2 w-1/2 cursor-pointer self-center text-center bg-gray-300 rounded-full text-sm font-medium hover:bg-gray-400"
      >
        Post
      </button>
    </div>
  );
};

export default CreateBlog;
