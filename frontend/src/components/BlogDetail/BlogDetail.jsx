import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";
import { useDispatch, useSelector } from "react-redux";
import "../CreateBlog/style.css";
import toast from "react-hot-toast";
import Footer from "../HomePage/Footer/Footer";
import { setUser } from "../../redux/slices/userSlice";
import { loginWithGoogle } from "../../utils/loginWithGoogle";
import axiosInstance from "../../utils/axiosInstance";
import html2pdf from "html2pdf.js";
import "./BlogDetail.css";
import "../CreateBlog/style.css";
import SubscribePopup from "./SubscribePopup";
import Recommendations from "./Recommendations";
const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [activeReplyBoxId, setActiveReplyBoxId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [showSubscribePopup, setShowSubscribePopup] = useState(false);
  const [visibleReplies, setVisibleReplies] = useState({});
  const user = useSelector((state) => state.user.currentUser);
  const hasLiked = user && blog?.likes.includes(user._id);
  const commentSectionRef = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axiosInstance.get(`/api/blogs/${id}`);
        setBlog(res.data.data);
      } catch (error) {
        console.error("Failed to load blog:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await axiosInstance.get(`/api/comments/${id}`);
        setComments(res.data.data);
      } catch (err) {
        console.error("Error fetching comments:", err);
      }
    };

    fetchBlog();
    fetchComments();
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".comment-options")) {
        setMenuOpenId(null);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleDelete = async () => {
    setShowConfirmModal(false); // Hide modal first
    const toastId = toast.loading("Deleting blog...");
    try {
      await axiosInstance.delete(`/api/blogs/delete/${id}`);
      toast.success("Blog deleted successfully", { id: toastId });
      navigate("/");
    } catch (err) {
      toast.error("Failed to delete blog", { id: toastId });
      console.error("Delete error:", err);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return toast.error("Please write a comment");

    try {
      const res = await axiosInstance.post(
        `/api/comments/create`,
        {
          blogId: id,
          content: commentText,
        },
        {
          withCredentials: true,
        }
      );

      // Add the new comment on top
      setComments([res.data.data, ...comments]);
      setCommentText("");
    } catch (err) {
      console.error("Failed to post comment", err);
      toast.error("Failed to post comment");
    }
  };

  const handleSaveEdit = async (commentId) => {
    if (!editedContent.trim()) return toast.error("Comment cannot be empty");
    try {
      await axiosInstance.put(
        `/api/comments/edit/${commentId}`,
        { content: editedContent },
        { withCredentials: true }
      );
      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === commentId) {
            // top-level comment
            return { ...comment, content: editedContent };
          } else {
            // check replies
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply._id === commentId
                  ? { ...reply, content: editedContent }
                  : reply
              ),
            };
          }
        })
      );

      setEditingCommentId(null);
      setEditedContent("");
      toast.success("Comment updated");
    } catch (err) {
      console.error("Edit failed:", err);
      toast.error("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axiosInstance.delete(`/api/comments/delete/${commentId}`, {
        withCredentials: true,
      });
      setComments((prev) =>
        prev
          .filter((comment) => comment._id !== commentId) // delete top-level if matched
          .map((comment) => ({
            ...comment,
            replies: comment.replies.filter((reply) => reply._id !== commentId), // delete reply if matched
          }))
      );

      toast.success("Comment deleted");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete comment");
    }
  };

  const handleToggleLike = async (commentId) => {
    if (!user) {
      toast("Sign in to like a comment 🔒", { icon: "🔒" });

      try {
        const signedInUser = await loginWithGoogle(dispatch);
        dispatch(setUser(signedInUser));
        toast.success(`Welcome, ${signedInUser.name}!`);
      } catch (err) {
        console.error("Google Sign-In failed", err);
        toast.error("Sign-in failed. Please try again.");
      }

      return;
    }
    try {
      const res = await axiosInstance.put(
        `/api/comments/toggle-like/${commentId}`,
        {},
        {
          withCredentials: true,
        }
      );

      setComments((prev) =>
        prev.map((comment) => {
          if (comment._id === commentId) {
            // top-level comment
            return { ...comment, likes: res.data.likes };
          } else {
            // check replies
            return {
              ...comment,
              replies: comment.replies.map((reply) =>
                reply._id === commentId
                  ? { ...reply, likes: res.data.likes }
                  : reply
              ),
            };
          }
        })
      );
    } catch (err) {
      console.error("Toggle like failed:", err);
      toast.error("Could not update like status");
    }
  };

  const handleReplySubmit = async (parentCommentId) => {
    if (!replyText.trim()) return toast.error("Reply cannot be empty");

    try {
      const res = await axiosInstance.post(
        "/api/comments/reply",
        {
          blogId: id,
          parentCommentId,
          content: replyText,
        },
        { withCredentials: true }
      );

      // Add new reply under the correct parent comment
      setComments((prev) =>
        prev.map((comment) =>
          comment._id === parentCommentId
            ? {
                ...comment,
                replies: [res.data.data, ...(comment.replies || [])],
              }
            : comment
        )
      );

      setReplyText("");
      setActiveReplyBoxId(null);
      toast.success("Reply posted");
    } catch (err) {
      console.error("Reply failed:", err);
      toast.error("Failed to post reply");
    }
  };

  const toggleRepliesVisibility = (commentId) => {
    setVisibleReplies((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleToggleBlogLike = async () => {
    if (!user) {
      toast("Please sign in to perform this action 🔒", {
        icon: "🔒",
      });

      try {
        const signedInUser = await loginWithGoogle(dispatch);
        dispatch(setUser(signedInUser));
        toast.success(`Welcome, ${signedInUser.name}!`);
      } catch (err) {
        console.error("Google Sign-In failed", err);
        toast.error("Google Sign-In failed");
      }

      return;
    }
    try {
      const res = await axiosInstance.put(
        `/api/blogs/toggle-like/${blog._id}`,
        {},
        { withCredentials: true }
      );

      setBlog((prev) => ({
        ...prev,
        likes: res.data.data.likes,
      }));
    } catch (err) {
      console.error("Blog like toggle failed:", err);
      toast.error("Failed to toggle like");
    }
  };

  const handleScrollToComments = () => {
    commentSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const handleGuestSignIn = async () => {
    toast("Sign in to add a comment 🔒", { icon: "🔒" });

    try {
      const signedInUser = await loginWithGoogle(dispatch);
      dispatch(setUser(signedInUser));
      toast.success(`Welcome, ${signedInUser.name}!`);
    } catch (err) {
      console.error("Google Sign-In failed", err);
      toast.error("Sign-in failed. Please try again.");
    }
  };

  const downloadAsPdf = () => {
    console.log("inside");

    setTimeout(() => {
      const element = document.getElementById("blog-pdf");

      if (!element) {
        console.error("blog-pdf element not found");
        return;
      }

      const opt = {
        margin: 0.5,
        filename: `${blog.title || "blog"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      };

      html2pdf().set(opt).from(element).save();
    }, 100);
  };

  const handleSubscribeClick = async () => {
    if (!user) {
      toast("Sign in to subscribe 🔒", { icon: "🔒" });

      try {
        const signedInUser = await loginWithGoogle(dispatch);
        dispatch(setUser(signedInUser));
        toast.success(`Welcome, ${signedInUser.name}!`);
      } catch (err) {
        console.error("Google Sign-In failed", err);
        toast.error("Sign-in failed. Please try again.");
      }

      return;
    }

    // If user is logged in, open the subscribe popup
    setShowSubscribePopup(true);
  };

  if (loading) return <Loader />;

  if (!blog)
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-6 py-20">
        <h2
          className="text-5xl font-bold mb-4 text-[#FF6B6B]"
          style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
        >
          😕 404
        </h2>
        <p
          className="text-center text-xl text-[#201F1F] mb-2"
          style={{ fontFamily: "SometypeMono Regular, monospace" }}
        >
          Looks like this blog wandered off!
        </p>
        <p
          className="text-center text-[#6F6B6B] mb-6"
          style={{ fontFamily: "SometypeMono Regular, monospace" }}
        >
          Don’t worry, we have plenty more blogs for you. Explore them on the
          homepage!
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-[#201F1F] hover:bg-[#333] text-white px-6 py-3 rounded-md cursor-pointer"
          style={{ fontFamily: "SometypeMono Regular, monospace" }}
        >
          Return Home
        </button>
      </div>
    );

  return (
    <div className="px-6 py-4 w-full min-h-screen">
      <div className="bg-[#303130] w-full h-[0.1rem]"></div>
      <div
        className="w-full flex items-center justify-between mb-10"
        style={{ fontFamily: "SometypeMono Regular, monospace" }}
      >
        <h1
          className="text-[#201F1F] mt-5 cursor-pointer hover:underline"
          onClick={() => navigate("/")}
        >
          Anjali Chaudhary
        </h1>
        <h1
          className="text-[#201F1F] mt-5 cursor-pointer hover:underline"
          onClick={() => navigate("/")}
        >
          Go To HomePage
        </h1>
      </div>

      <div className="flex flex-col gap-3 w-[50rem] max-w-[55rem] m-auto">
        <h1
          className="text-[2.7rem] leading-[3.5rem] font-semibold mb-4 text-black tracking-[-1px]"
          style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
        >
          {blog.title}
        </h1>
        <div
          className="w-full flex items-center justify-between"
          style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
        >
          <div className="flex items-center justify-center gap-3">
            <p className="text-base text-[#201F1F]">
              {blog.type === "Article" ? "Social Pattern" : "My Diary"}
            </p>
            <div className="bg-[#B1AFB0] w-2 h-2 rounded-full"></div>
            <p className="text-base text-[#5F5B5B]">
              {blog.timeToRead + " "} min read
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <p className="text-base text-[#5F5B5B] ">
              {new Date(blog.datePosted).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            {user?.isAdmin ? (
              <button className="text-[0.9rem] bg-[#E7E6E6] px-3 py-0.5">
                Published
              </button>
            ) : user?.subscriptions?.includes(blog.type) ? (
              <button
                disabled
                className="text-[0.9rem] bg-gray-300 text-gray-600 px-3 py-0.5 cursor-not-allowed"
              >
                Subscribed
              </button>
            ) : (
              <button
                onClick={handleSubscribeClick}
                className="cursor-pointer text-[0.9rem] border border-[#504E4F] px-3 py-0.5"
              >
                Subscribe
              </button>
            )}
          </div>
        </div>
        {showSubscribePopup && (
          <SubscribePopup onClose={() => setShowSubscribePopup(false)} />
        )}
        <div className="w-full flex items-center justify-between border-y border-y-[#E7EAEE]">
          <div className=" py-2 flex items-center justify-center gap-5">
            <div
              className="flex items-center justify-center gap-2"
              onClick={handleToggleBlogLike}
            >
              <img
                src={hasLiked ? "/icons/liked.svg" : "/icons/likeIcon.svg"}
                alt="Arrow"
                className="w-6 h-6 cursor-pointer"
              />
              <p
                className="text-base text-[#504E4F]"
                style={{ fontFamily: "Inter, sans-serif " }}
              >
                {blog?.likes.length}
              </p>
            </div>
            <img
              src="/icons/comment.svg"
              alt="Arrow"
              className="w-6 h-6 cursor-pointer"
              onClick={handleScrollToComments}
            />
          </div>
          <div className="flex items-center justify-center gap-5">
            {user?.isAdmin && (
              <>
                <img
                  src="/icons/edit.svg"
                  alt="Arrow"
                  className="w-6 h-6 cursor-pointer edit"
                  onClick={() => navigate(`/edit/${id}`)}
                />
                <img
                  src="/icons/delete.svg"
                  alt="Arrow"
                  className="w-6 h-6 cursor-pointer delete"
                  onClick={() => setShowConfirmModal(true)}
                />
              </>
            )}
            <img
              src="/icons/Download.svg"
              alt="Arrow"
              className="w-6 h-6 cursor-pointer share"
              onClick={downloadAsPdf}
            />
            <img
              src="/icons/share.svg"
              alt="Arrow"
              className="w-6 h-6 cursor-pointer share"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full m-auto">
          <div
            className="tiptap w-full text-[#201F1F]"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          ></div>
        </div>

        {/* hidden content for pdf download */}

        <div
          style={{
            position: "absolute",
            top: "-9999px",
            left: "-9999px",
            visibility: "hidden",
            pointerEvents: "none",
          }}
        >
          <div
            id="blog-pdf"
            className="flex flex-col gap-6 w-full m-auto px-6 py-8"
          >
            <h1
              className="text-[2.7rem] leading-[3.5rem] font-semibold mb-4 text-black tracking-[-1px]"
              style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
            >
              {blog.title}
            </h1>
            <div
              className="flex items-center justify-between text-base text-[#201F1F] mb-4"
              style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
            >
              <p>{blog.type === "Article" ? "Social Pattern" : "My Diary"}</p>
              <p>{blog.timeToRead + " "} min read</p>
              <p>
                {new Date(blog.datePosted).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div
              className="tiptap w-full text-[#201F1F]"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            ></div>
          </div>
        </div>

        {blog.type === "Diary" && blog.next && (
          <h1
            className="py-10 text-[1.2rem] tracking-[-0.24px] font-semibold self-center hover:underline cursor-pointer"
            style={{ fontFamily: "SometypeMono Regular, monospace" }}
            onClick={() => navigate(`/blog/${blog.next}`)}
          >
            Continue to next Journey →
          </h1>
        )}

        <div className="flex justify-center flex-wrap gap-6 mt-6">
          {blog.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-[#E7E6E6] text-[#201F1F] px-4 py-1 text-[1.2rem] tag"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="w-full flex items-center justify-between border-y border-y-[#E7EAEE] mt-10 mb-16">
          <div className=" py-2 flex items-center justify-center gap-5">
            <div className="flex items-center justify-center gap-2">
              <img
                src={hasLiked ? "/icons/liked.svg" : "/icons/likeIcon.svg"}
                onClick={handleToggleBlogLike}
                alt="Arrow"
                className="w-6 h-6 cursor-pointer"
              />
              <p
                className="text-base text-[#504E4F]"
                style={{ fontFamily: "Inter, sans-serif " }}
              >
                {blog?.likes.length}
              </p>
            </div>
            <img
              src="/icons/comment.svg"
              alt="Arrow"
              className="w-6 h-6 cursor-pointer"
              onClick={handleScrollToComments}
            />
          </div>
          <div className="flex items-center justify-center gap-5">
            {user?.isAdmin && (
              <>
                <img
                  src="/icons/edit.svg"
                  alt="Arrow"
                  className="w-6 h-6 cursor-pointer edit"
                  onClick={() => navigate(`/edit/${id}`)}
                />
                <img
                  src="/icons/delete.svg"
                  alt="Arrow"
                  className="w-6 h-6 cursor-pointer delete"
                  onClick={handleDelete}
                />
              </>
            )}
            <img
              src="/icons/share.svg"
              alt="Arrow"
              className="w-6 h-6 cursor-pointer share"
            />
          </div>
        </div>
        <div
          ref={commentSectionRef}
          className="mt-10 flex flex-col items-start justify-center gap-8"
        >
          <h2
            className="text-4xl font-semibold mb-5"
            style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
          >
            Comments
          </h2>
          {/* Comment input box */}
          {user ? (
            <div
              className={`flex flex-col items-start justify-center gap-4 w-full border-b border-b-[#E7E6E6] py-8`}
            >
              <div className="flex items-center justify-center gap-2">
                <img
                  src={
                    user?.photoURL ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                  }
                  alt="avatar"
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex flex-col items-start justify-center">
                  <h3 className="text-lg font-semibold">{user.name}</h3>
                  <p className="text-sm text-[#777]">
                    {new Date().toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex-1 w-full">
                <textarea
                  rows={1}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="What you think?"
                  style={{ fontFamily: "Inter, sans-serif " }}
                  className="w-full mt-2 p-2 border border-[#ccc] bg-[#F6F5F5] rounded resize-none placeholder:text-[#B1AFB0] font-medium"
                />
              </div>
              <button
                onClick={handleAddComment}
                className="mt-2 bg-[#303130] text-white px-4 py-1 rounded hover:bg-[#201F1F] cursor-pointer"
              >
                Add Comment
              </button>
            </div>
          ) : (
            <div className="w-full py-6 px-5 bg-[#F6F5F5] rounded flex items-center justify-between border border-[#E2E2E2] shadow-sm">
              <div className="flex items-center gap-4">
                {/* <img src="/icons/lock.svg" alt="lock" className="w-5 h-5" /> */}
                <p
                  className="text-[#504E4F] font-medium"
                  style={{ fontFamily: "Inter, sans-serif" }}
                >
                  Please sign in to add a comment.
                </p>
              </div>
              <button
                onClick={handleGuestSignIn}
                className="bg-[#303130] text-white px-4 py-1 rounded hover:bg-[#201F1F] transition duration-200 ease-in-out cursor-pointer"
              >
                Sign In
              </button>
            </div>
          )}

          {/* Comment list */}
          {comments.length === 0 ? (
            <div className="flex justify-center items-center mt-8 w-full"></div>
          ) : (
            <div className="mt-8 flex flex-col gap-10 w-full">
              {comments.map((c) => (
                <div
                  key={c._id}
                  className="flex flex-col items-start justify-center gap-6 w-full border-b border-b-[#E7E6E6] py-8"
                >
                  <div className="flex items-center justify-center gap-2">
                    <img
                      src={c.userId?.photoURL}
                      alt="avatar"
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="flex flex-col items-start justify-center">
                      <h3 className="text-lg font-semibold">
                        {" "}
                        {c.userId?.name}
                      </h3>
                      <p className="text-sm text-[#777]">
                        {new Date(c.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  {editingCommentId === c._id ? (
                    <>
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full p-2 border border-[#ccc] bg-[#F6F5F5] rounded resize-none"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSaveEdit(c._id)}
                          className="bg-[#303130] text-white px-3 py-1 rounded cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingCommentId(null);
                            setEditedContent("");
                          }}
                          className="text-[#504E4F] px-3 py-1 border border-[#504E4F] rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <p
                      className="text-base text-[#201F1F]"
                      style={{ fontFamily: "Inter, sans-serif " }}
                    >
                      {c.content}
                    </p>
                  )}

                  <div className="flex items-center justify-center gap-4 text-sm text-[#504E4F]">
                    <div className="flex items-center justify-center gap-2">
                      <img
                        src={
                          c.likes.includes(user?._id)
                            ? "/icons/liked.svg"
                            : "/icons/likeIcon.svg"
                        }
                        alt="Like"
                        className="w-6 h-6 cursor-pointer"
                        onClick={() => handleToggleLike(c._id)}
                      />
                      <p>{c.likes.length}</p>
                    </div>

                    <div className="flex items-center justify-center gap-2">
                      <img
                        src={
                          visibleReplies[c._id]
                            ? "/icons/comment_open.svg"
                            : "/icons/comment.svg"
                        }
                        alt="Arrow"
                        className="w-6 h-6 cursor-pointer"
                        onClick={() => toggleRepliesVisibility(c._id)}
                      />
                      <p>{c.replies?.length || 0}</p>
                    </div>
                    {/* <span>💬 {c.replies.length}</span> */}
                    <p
                      className="cursor-pointer underline text-[#201F1F] text-base"
                      style={{
                        fontFamily: "SometypeMono Regular, monospace",
                      }}
                      onClick={() =>
                        setActiveReplyBoxId(
                          activeReplyBoxId === c._id ? null : c._id
                        )
                      }
                    >
                      Reply
                    </p>

                    {(user?._id === c.userId?._id || user?.isAdmin) && (
                      <div
                        className="relative comment-options"
                        style={{
                          fontFamily: "SometypeMono Regular, monospace",
                        }}
                      >
                        <img
                          src="/icons/3dots.svg"
                          alt="Options"
                          className="w-5 h-5 cursor-pointer"
                          onClick={() =>
                            setMenuOpenId(menuOpenId === c._id ? null : c._id)
                          }
                        />
                        {menuOpenId === c._id && (
                          <div className="absolute top-6 left-0 bg-white border border-gray-300 rounded shadow-md z-10 w-24">
                            {user?._id === c.userId?._id && (
                              <p
                                onClick={() => {
                                  setEditingCommentId(c._id);
                                  setEditedContent(c.content);
                                  setMenuOpenId(null);
                                }}
                                className="px-4 py-2 text-sm text-gray-800 hover:bg-[#E7E6E6] hover:text-[#201F1F] transition-all cursor-pointer font-medium border border-[#504E4F]"
                              >
                                Edit
                              </p>
                            )}
                            <p
                              onClick={() => {
                                handleDeleteComment(c._id);
                                setMenuOpenId(null);
                              }}
                              className="px-4 py-2 text-sm text-[#464445] hover:bg-[#E7E6E6] hover:text-[#201F1F] transition-all cursor-pointer font-medium border border-[#504E4F]"
                            >
                              Delete
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {visibleReplies[c._id] && c.replies?.length > 0 && (
                    <div
                      className={`transition-opacity duration-500 ease-in-out ml-8 mt-4 flex flex-col gap-6
                     ${
                       visibleReplies[c._id]
                         ? "opacity-100"
                         : "opacity-0 pointer-events-none"
                     }
                   `}
                    >
                      {c.replies.map((reply) => (
                        <div
                          key={reply._id}
                          className="flex flex-col gap-2 border-l-2 pl-4 border-gray-300 relative"
                        >
                          {/* User + Date */}
                          <div className="flex items-center gap-2">
                            <img
                              src={
                                reply.userId?.photoURL ||
                                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                              }
                              alt="avatar"
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <h3 className="text-sm font-semibold">
                                {reply.userId?.name}
                              </h3>
                              <p className="text-xs text-[#777]">
                                {new Date(reply.createdAt).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </p>
                            </div>
                          </div>

                          {/* Content or Edit Mode */}
                          {editingCommentId === reply._id ? (
                            <>
                              <textarea
                                value={editedContent}
                                onChange={(e) =>
                                  setEditedContent(e.target.value)
                                }
                                className="w-full p-2 border border-[#ccc] bg-[#F6F5F5] rounded resize-none"
                              />
                              <div className="flex gap-2 mt-1">
                                <button
                                  onClick={() => handleSaveEdit(reply._id)}
                                  className="bg-[#303130] text-white px-3 py-1 rounded cursor-pointer"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingCommentId(null);
                                    setEditedContent("");
                                  }}
                                  className="text-[#504E4F] px-3 py-1 border border-[#504E4F] rounded cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </>
                          ) : (
                            <p className="text-sm text-[#201F1F]">
                              {reply.content}
                            </p>
                          )}

                          {/* Like + 3-Dots Options */}
                          <div className="flex items-center justify-between gap-3 text-sm text-[#504E4F] mt-1">
                            <div className="flex items-center gap-1">
                              <img
                                src={
                                  reply.likes.includes(user?._id)
                                    ? "/icons/liked.svg"
                                    : "/icons/likeIcon.svg"
                                }
                                alt="Like"
                                className="w-5 h-5 cursor-pointer"
                                onClick={() => handleToggleLike(reply._id)}
                              />
                              <p>{reply.likes.length}</p>
                            </div>

                            {(user?._id === reply.userId?._id ||
                              user?.isAdmin) && (
                              <div className="relative comment-options">
                                <img
                                  src="/icons/3dots.svg"
                                  alt="Options"
                                  className="w-5 h-5 cursor-pointer"
                                  onClick={() =>
                                    setMenuOpenId(
                                      menuOpenId === reply._id
                                        ? null
                                        : reply._id
                                    )
                                  }
                                />
                                {menuOpenId === reply._id && (
                                  <div className="absolute top-6 left-0 bg-white border border-gray-300 rounded shadow-md z-10 w-24">
                                    {user?._id === reply.userId?._id && (
                                      <p
                                        onClick={() => {
                                          setEditingCommentId(reply._id);
                                          setEditedContent(reply.content);
                                          setMenuOpenId(null);
                                        }}
                                        className="px-4 py-2 text-sm text-gray-800 hover:bg-[#E7E6E6] hover:text-[#201F1F] transition-all cursor-pointer font-medium border border-[#504E4F]"
                                      >
                                        Edit
                                      </p>
                                    )}
                                    <p
                                      onClick={() => {
                                        handleDeleteComment(reply._id);
                                        setMenuOpenId(null);
                                      }}
                                      className="px-4 py-2 text-sm text-[#464445] hover:bg-[#E7E6E6] hover:text-[#201F1F] transition-all cursor-pointer font-medium border border-[#504E4F]"
                                    >
                                      Delete
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeReplyBoxId === c._id && (
                    <div className="w-full flex flex-col gap-2 mt-4">
                      <textarea
                        rows={1}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full p-2 border border-[#ccc] bg-[#F6F5F5] rounded resize-none placeholder:text-[#B1AFB0] font-medium"
                      />
                      <button
                        onClick={() => handleReplySubmit(c._id)}
                        className="self-start bg-[#303130] text-white px-4 py-1 rounded hover:bg-[#201F1F] cursor-pointer"
                      >
                        Post Reply
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            className="bg-white border border-[#504E4F] rounded-md p-6 w-[90%] max-w-md text-center shadow-lg"
            style={{ fontFamily: "SometypeMono Regular, monospace" }}
          >
            <p className="text-[#201F1F] text-xl mb-6">
              Are you sure you want to delete this blog?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="bg-[#303130] text-white px-6 py-2 rounded hover:bg-[#201F1F] cursor-pointer"
                onClick={handleDelete}
              >
                Yes Delete
              </button>
              <button
                className="border border-[#504E4F] text-[#201F1F] px-6 py-2 rounded hover:bg-[#F3F3F3] cursor-pointer"
                onClick={() => setShowConfirmModal(false)}
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      )}

      <Recommendations blogId={blog._id} />

      <Footer />
    </div>
  );
};

export default BlogDetail;
