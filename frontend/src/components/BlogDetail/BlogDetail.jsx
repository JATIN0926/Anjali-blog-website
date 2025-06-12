import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from "../Loader/Loader";
import { useSelector } from "react-redux";
import "../CreateBlog/style.css";
import toast from "react-hot-toast";
const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const user = useSelector((state) => state.user.currentUser);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await axios.get(`/api/blogs/${id}`);
        setBlog(res.data.data);
      } catch (error) {
        console.error("Failed to load blog:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handleDelete = async () => {
    setShowConfirmModal(false); // Hide modal first
    const toastId = toast.loading("Deleting blog...");
    try {
      await axios.delete(`/api/blogs/delete/${id}`);
      toast.success("Blog deleted successfully", { id: toastId });
      navigate("/");
    } catch (err) {
      toast.error("Failed to delete blog", { id: toastId });
      console.error("Delete error:", err);
    }
  };

  if (loading) return <Loader />;

  if (!blog)
    return (
      <p
        className="text-center text-4xl text-[#201F1F] mt-10"
        style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
      >
        Blog not found.
      </p>
    );

  return (
    <div className="px-6 py-4 w-full min-h-screen">
      <div className="bg-[#303130] w-full h-[0.1rem]"></div>
      <div
        className="w-full flex items-center justify-between mb-10"
        style={{ fontFamily: "SometypeMono Regular, monospace" }}
      >
        <h1 className="text-[#201F1F] mt-5">Anjali Chaudhary</h1>
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
            <button className=" text-[0.9rem] border border-[#504E4F] px-3 py-0.5">
              Subscribe
            </button>
          </div>
        </div>
        <div className="w-full flex items-center justify-between border-y border-y-[#E7EAEE]">
          <div className=" py-2 flex items-center justify-center gap-5">
            <div className="flex items-center justify-center gap-2">
              <img
                src="/icons/likeIcon.svg"
                alt="Arrow"
                className="w-6 h-6 cursor-pointer"
              />
              <p
                className="text-base text-[#504E4F]"
                style={{ fontFamily: "Inter, sans-serif " }}
              >
                {blog.likes}
              </p>
            </div>
            <img
              src="/icons/comment.svg"
              alt="Arrow"
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-center gap-5">
            {user?.isAdmin && (
              <>
                <img
                  src="/icons/edit.svg"
                  alt="Arrow"
                  className="w-6 h-6 cursor-pointer"
                  onClick={() => navigate(`/edit/${id}`)}
                />
                <img
                  src="/icons/delete.svg"
                  alt="Arrow"
                  className="w-6 h-6 cursor-pointer"
                  onClick={() => setShowConfirmModal(true)}
                />
              </>
            )}
            <img
              src="/icons/share.svg"
              alt="Arrow"
              className="w-6 h-6 cursor-pointer"
            />
          </div>
        </div>

        <div
          className="tiptap w-full text-[#201F1F]"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        ></div>
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
                src="/icons/likeIcon.svg"
                alt="Arrow"
                className="w-6 h-6 cursor-pointer"
              />
              <p
                className="text-base text-[#504E4F]"
                style={{ fontFamily: "Inter, sans-serif " }}
              >
                {blog.likes}
              </p>
            </div>
            <img
              src="/icons/comment.svg"
              alt="Arrow"
              className="w-6 h-6 cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-center gap-5">
            {user?.isAdmin && (
              <>
                <img
                  src="/icons/edit.svg"
                  alt="Arrow"
                  className="w-6 h-6 cursor-pointer"
                  onClick={() => navigate(`/edit/${id}`)}
                />
                <img
                  src="/icons/delete.svg"
                  alt="Arrow"
                  className="w-6 h-6 cursor-pointer"
                  onClick={handleDelete}
                />
              </>
            )}
            <img
              src="/icons/share.svg"
              alt="Arrow"
              className="w-6 h-6 cursor-pointer"
            />
          </div>
        </div>
        {/* Future scope: Comments section */}
        <div className="mt-10">
          <h2
            className="text-4xl font-semibold mb-5"
            style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
          >
            Comments
          </h2>
          <p style={{ fontFamily: "SometypeMono Regular, monospace" }}>
            (Coming soon...)
          </p>
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
    </div>
  );
};

export default BlogDetail;
