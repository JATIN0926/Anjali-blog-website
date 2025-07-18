import React, { useRef, useState, useEffect } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import BulletList from "@tiptap/extension-bullet-list";
import ListItem from "@tiptap/extension-list-item";
import CustomParagraph from "./CustomParagraph.js";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import {
  setTitle,
  setContent,
  setTags,
  setSelectedOption,
  setThumbnail,
  setDraftId,
} from "../../redux/slices/blogDraftSlice.js";
import "./style.css";
import axiosInstance from "../../utils/axiosInstance.js";
import axios from "axios";
import { Separator } from "./Separator.js";
import debounce from "lodash.debounce";

const CreateBlog = () => {
  const fileInputRef = useRef();
  const dispatch = useDispatch();
  const { title, content, selectedOption, thumbnail } = useSelector(
    (state) => state.blogDraft
  );

  const user = useSelector((state) => state.user.currentUser);
  const storedTags = useSelector((state) => state.blogDraft.tags);

  const dropdownRef = useRef(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: false,
      }),
      CustomParagraph,
      Image,
      BulletList,
      ListItem,
      Separator,
    ],
    content: content || "",
    editorProps: {
      handleKeyDown(view, event) {
        if (event.key === "Enter" && !event.shiftKey) {
          const { state, dispatch } = view;
          const { selection, schema } = state;
          const pos = selection.$from.before(selection.$from.depth);
          const node = state.doc.nodeAt(pos);

          if (
            node?.type.name === "paragraph" &&
            node.attrs.class === "quote-para"
          ) {
            event.preventDefault();

            const newParagraph = schema.nodes.paragraph.create();

            const insertPos = pos + node.nodeSize;
            let tr = state.tr.insert(insertPos, newParagraph);

            tr = tr.setSelection(
              state.selection.constructor.near(tr.doc.resolve(insertPos + 1))
            );

            dispatch(tr);
            return true;
          }
        }
        return false;
      },
    },
  });
  const [tags, setLocalTags] = useState(storedTags || []);
  const [currentTag, setCurrentTag] = useState("");
  const [showInput, setShowInput] = useState(false);
  const draftId = useSelector((state) => state.blogDraft.draftId);

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

  const clearBlogData = () => {
    dispatch(setTitle(""));
    dispatch(setContent(""));
    dispatch(setTags([]));
    // dispatch(setSelectedOption(""));
    dispatch(setThumbnail(""));
    dispatch(setDraftId(null));
    setLocalTags([]);
    setCurrentTag("");
    editor?.commands.setContent("");
  };

  const createInitialDraft = async () => {
    if (!user) {
      toast.error("You must be logged in to start a draft");
      return;
    }

    if (!selectedOption) {
      toast.error("Please select type of blog !");
      return;
    }

    clearBlogData();

    try {
      const res = await axiosInstance.post(
        "/api/blogs/draft",
        {
          title,
          content,
          tags,
          type: selectedOption || "Not Set",
          thumbnail,
          uid: user?.uid,
          status: "Draft",
        },
        { withCredentials: true }
      );

      const blog = res.data.data;
      dispatch(setDraftId(blog._id));
      toast.success("New draft started!");
    } catch (err) {
      toast.error("Failed to create draft");
      console.error("Draft creation error:", err);
    }
  };

  useEffect(() => {
    if (!draftId) return;
    const autoSaveDraft = debounce(async () => {
      try {
        await axiosInstance.put(
          `/api/blogs/draft/${draftId}`,
          {
            title,
            content,
            tags,
            type: selectedOption || "Not Set",
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
  }, [title, content, selectedOption, tags, thumbnail, draftId]);

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
            attrs: {
              class: "small-desc",
            },
            content: [
              {
                type: "text",
                text: "Type your caption here...",
              },
            ],
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

  const handleThumbnailUpload = async (event) => {
    const file = event.target.files[0];
    event.target.value = null;

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }

    toast.loading("Uploading thumbnail...");

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
      toast.success("Thumbnail uploaded!");

      const fileUrl = response.data.secure_url;
      dispatch(setThumbnail(fileUrl));
    } catch (error) {
      toast.dismiss();
      toast.error("Thumbnail upload failed!");
      console.error("Cloudinary thumbnail upload error:", error);
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

  const handleSubmitBlog = async (status) => {
    if (status === "Published") {
      if (
        !title.trim() ||
        !content.trim() ||
        tags.length === 0 ||
        !selectedOption
      ) {
        toast.error("Please fill all required fields.");
        return;
      }
    } else if (status === "Draft") {
      if (!title.trim() && !content.trim()) {
        toast.error("Nothing to save in draft.");
        return;
      }
    }

    try {
      toast.loading(
        status === "Published" ? "Posting your blog..." : "Saving draft..."
      );

      const response = await axiosInstance.post(
        `/api/blogs/create`,
        {
          title,
          content,
          tags,
          type: selectedOption,
          thumbnail,
          uid: user.uid,
          status,
        },
        { withCredentials: true }
      );

      toast.dismiss();
      toast.success(
        status === "Published"
          ? "Blog posted successfully!"
          : "Draft saved successfully!"
      );

      // Reset if published
      if (status === "Published") {
        dispatch(setTitle(""));
        dispatch(setContent(""));
        dispatch(setTags([]));
        dispatch(setSelectedOption(""));
        dispatch(setThumbnail(""));
        setLocalTags([]);
        setCurrentTag("");
        setShowInput(false);
        editor.commands.setContent("");
      }
    } catch (error) {
      toast.dismiss();
      toast.error(
        error?.response?.data?.message || "Failed to submit blog. Try again!"
      );
      console.error("Error:", error?.response || error.message);
    }
  };

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
            {selectedOption || "Publish To"}
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
      <div className="w-full flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">Create Blog</h1>
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
          Quote Regular
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`px-4 py-1 rounded cursor-pointer ${
            editor.isActive("blockquote")
              ? "bg-black text-white"
              : "bg-gray-200"
          }`}
        >
          Quote Bold
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
        onClick={() => handleSubmitBlog("Published")}
        className="mt-4 px-4 py-2 w-1/2 cursor-pointer self-center text-center bg-gray-300 rounded-full text-sm font-medium hover:bg-gray-400"
      >
        Post
      </button>
      {/* <button
        onClick={() => handleSubmitBlog("Draft")}
        className="mt-4 px-4 py-2 w-1/2 cursor-pointer self-center text-center bg-yellow-300 rounded-full text-sm font-medium hover:bg-yellow-400"
      >
        Save to Draft
      </button> */}
      {user && (
        <button
          className="mt-4 px-4 py-2 w-1/2 cursor-pointer self-center text-center bg-yellow-300 rounded-full text-sm font-medium hover:bg-yellow-400"
          onClick={createInitialDraft}
        >
          Start New Draft
        </button>
      )}
    </div>
  );
};

export default CreateBlog;
