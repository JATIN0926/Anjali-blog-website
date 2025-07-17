import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import CustomParagraph from "../CreateBlog/CustomParagraph";
import toast from "react-hot-toast";
import "../CreateBlog/style.css";
import Loader from "../Loader/Loader";
import axiosInstance from "../../utils/axiosInstance";
import { Separator } from "../CreateBlog/Separator";
import debounce from "lodash.debounce";
import axios from "axios";

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef();
  const dropdownRef = useRef(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [type, setType] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [status, setStatus] = useState("Draft");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentTag, setCurrentTag] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ paragraph: false }),
      CustomParagraph,
      Image,
      BulletList,
      ListItem,
      Separator,
    ],
    content: "",
  });

  useEffect(() => {
    if (!editor) return;

    const updatedContent = editor.getHTML();

    const autoSaveDraft = debounce(async () => {
      try {
        await axiosInstance.put(
          `/api/blogs/edit/${id}`,
          {
            title,
            content: updatedContent,
            tags,
            type,
            thumbnail,
            status: "Draft",
          },
          { withCredentials: true }
        );

        const now = new Date();
        setLastSavedTime(now);
        console.log("Auto-saved at", now.toLocaleTimeString());
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, 5000);

    autoSaveDraft();

    return () => autoSaveDraft.cancel();
  }, [title, content, tags, type, thumbnail, id, editor]);

  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const html = editor.getHTML();
      setContent(html);
    };

    editor.on("update", handleUpdate);

    return () => editor.off("update", handleUpdate);
  }, [editor]);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axiosInstance.get(`/api/blogs/${id}`);
        const { title, content, tags, type, thumbnail } = res.data.data;

        setTitle(title);
        setContent(content);
        setTags(tags || []);
        setType(type);
        setThumbnail(thumbnail);
        setStatus(status || "Draft");

        if (editor) {
          editor.commands.setContent(content);
        }
      } catch (err) {
        toast.error("Failed to fetch blog.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id, editor]);

  const handleInputKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };
  const addSeparator = () => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "separator",
      })
      .run();
  };

  const handleImageUploadClick = () => {
    fileInputRef.current.click();
  };

  // Image Upload for inside blog
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    e.target.value = null;
    if (!file || !file.type.startsWith("image/"))
      return toast.error("Only images allowed.");

    toast.loading("Uploading...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "blog_preset");

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/upload`,
        formData
      );
      toast.dismiss();
      toast.success("Image uploaded!");
      editor
        ?.chain()
        .focus()
        .insertContent([{ type: "image", attrs: { src: res.data.secure_url } }])
        .run();
    } catch (err) {
      toast.dismiss();
      toast.error("Upload failed.");
      console.error(err);
    }
  };

  // Thumbnail Upload
  const handleThumbnailUpload = async (e) => {
    const file = e.target.files[0];
    e.target.value = null;
    if (!file || !file.type.startsWith("image/"))
      return toast.error("Only images allowed.");

    toast.loading("Uploading thumbnail...");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "blog_preset");

    try {
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${
          import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
        }/upload`,
        formData
      );
      toast.dismiss();
      toast.success("Thumbnail uploaded!");
      setThumbnail(res.data.secure_url);
    } catch (err) {
      toast.dismiss();
      toast.error("Thumbnail upload failed.");
      console.error(err);
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
      editor.commands.insertContent(`<p class="${className}"></p>`);
    }
  };

  const handleAddTag = () => {
    if (tags.length >= 5 || tags.includes(currentTag.trim())) return;
    if (currentTag.trim()) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
      setShowInput(false);
    }
  };

  const handleDeleteTag = (indexToDelete) => {
    setTags(tags.filter((_, idx) => idx !== indexToDelete));
  };

  const handleUpdateBlog = async (newStatus) => {
    const updatedContent = editor?.getHTML();
    if (!title.trim() || !updatedContent || !tags.length || !type) {
      return toast.error("Please fill all fields.");
    }

    try {
      toast.loading("Updating...");

      const res = await axiosInstance.put(
        `/api/blogs/edit/${id}`,
        {
          title,
          content: updatedContent,
          tags,
          type,
          thumbnail,
          status: newStatus,
        },
        { withCredentials: true }
      );
      toast.dismiss();
      toast.success(
        newStatus === "Published" ? "Blog published!" : "Draft saved."
      );

      if (newStatus === "Published") {
        navigate(`/blog/${id}`);
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Failed to update.");
      console.error(err);
    }
  };

  if (loading || !editor) return <Loader />;

  return (
    <div className="w-full p-6 flex flex-col gap-6">
      <div className="bg-[#303130] w-full h-[0.1rem]"></div>
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
            {type || "Publish To"}
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
                      setType(option);
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

      <div className="w-full flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Edit Blog</h1>
        <input
          type="file"
          accept="image/*"
          id="thumbnailInput"
          style={{ display: "none" }}
          onChange={handleThumbnailUpload}
        />
        <div className="flex flex-col items-center justify-center gap-2">
          <button
            onClick={() => document.getElementById("thumbnailInput").click()}
            className=" cursor-pointer mt-2 px-4 py-1 bg-gray-300 rounded-full text-sm font-medium hover:bg-gray-400 self-center"
          >
            {thumbnail ? "Change Thumbnail" : "    Upload Thumbnail"}
          </button>

          {thumbnail && (
            <img
              src={thumbnail}
              alt="Thumbnail Preview"
              className="mt-2 w-64 h-40 object-cover rounded self-center"
            />
          )}
        </div>
      </div>

      <input
        type="text"
        placeholder="Enter Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full p-2 border-b text-xl font-semibold outline-none"
      />

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
        {lastSavedTime && (
          <div className="text-sm text-gray-500 text-start font-mono mt-1 mb-2">
            Auto-saved{" "}
            {Math.floor((Date.now() - lastSavedTime.getTime()) / 1000)} seconds
            ago
          </div>
        )}
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

      <div className="flex gap-4 justify-center mt-8">
        <button
          onClick={() => handleUpdateBlog("Published")}
          className="px-4 py-2 w-1/2 cursor-pointer bg-green-400 rounded-full text-sm font-medium hover:bg-green-500"
        >
          Publish
        </button>
      </div>
    </div>
  );
};

export default EditBlog;
