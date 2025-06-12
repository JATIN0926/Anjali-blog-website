import React, { useEffect, useState } from "react";
import ViewCard from "./ViewCard/ViewCard";
import axios from "axios";
import "./ViewStories.css";
const ViewStories = () => {
  const [activeTab, setActiveTab] = useState("Diary");
  const [blogStatus, setBlogStatus] = useState("Published");
  const [blogs, setBlogs] = useState([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get(`/api/blogs/status-type`, {
          params: {
            status: blogStatus,
            type: activeTab,
          },
        });
        console.log("r", response.data.data);
        setBlogs(response.data.data || []);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, [blogStatus, activeTab]);

  return (
    <div className="w-full p-4">
      <div className="bg-[#303130] w-full h-[0.1rem]"></div>
      <div
        className="w-full flex items-center justify-between mt-4"
        style={{ fontFamily: "SometypeMono Regular, monospace" }}
      >
        <h1 className="text-[#201F1F]">Anjali Chaudhary</h1>
        <img
          src="/icons/notification.svg"
          alt="Notification"
          className="w-6 h-6 object-cover cursor-pointer"
        />
      </div>

      <div className="w-[60%] justify-self-center pt-16 flex flex-col gap-10 relative z-0">
        <h1
          className="text-[3.3rem] font-semibold font-serif text-black"
          style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
        >
          View Stories
        </h1>

        {/* Status Tabs */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center justify-center gap-7">
            {["Published", "Draft"].map((status) => (
              <h3
                key={status}
                className={`text-base text-[#201F1F] cursor-pointer hover:underline transition-all ${
                  blogStatus === status ? "underline font-semibold" : ""
                }`}
                style={{ fontFamily: "Inter, sans-serif " }}
                onClick={() => setBlogStatus(status)}
              >
                {status}
              </h3>
            ))}

            <h3
              className="text-base text-[#201F1F] cursor-not-allowed text-opacity-40"
              style={{ fontFamily: "Inter, sans-serif " }}
            >
              Plan to Publish
            </h3>
          </div>

          {/* Toggle Switch */}
          <div className="relative flex bg-[#E6E6E6] rounded-xl p-2 w-40">
            {/* Sliding Background */}
            <div
              className={`absolute top-1 bottom-1 left-1 w-[48%] bg-white rounded-xl transition-all duration-300 flex items-center justify-center ${
                activeTab === "Diary" ? "translate-x-0" : "translate-x-full"
              }`}
            >
              <span className="text-black text-sm font-medium">
                {activeTab}
              </span>
            </div>

            {/* Type Tabs */}
            <button
              className={`flex-1 z-10 text-sm font-medium rounded-full cursor-pointer transition-colors ${
                activeTab === "Diary" ? "text-transparent" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("Diary")}
            >
              Diary
            </button>

            <button
              className={`flex-1 z-10 text-sm font-medium rounded-full cursor-pointer transition-colors ${
                activeTab === "Article" ? "text-transparent" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("Article")}
            >
              Article
            </button>
          </div>
        </div>

        {/* Blog List */}
        <div className="w-full flex flex-col gap-6 transition-all duration-300 ease-in-out">
          {blogs.filter((blog) => blog.type === activeTab).length > 0 ? (
            blogs
              .filter((blog) => blog.type === activeTab)
              .map((blog, index) => (
                <div
                  key={blog._id}
                  className="transition-all duration-500 ease-in-out opacity-0 translate-y-5 animate-fade-in"
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: "forwards",
                  }}
                >
                  <ViewCard
                    title={blog.title}
                    date={new Date(blog.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    id={blog._id}
                  />
                </div>
              ))
          ) : (
            <div className="text-gray-500 text-center text-lg italic opacity-0 translate-y-5 animate-fade-in flex flex-col items-center gap-2">
              <span>
                No {blogStatus.toLowerCase()} {activeTab.toLowerCase()}s yet.
              </span>
              <a
                href="/create-blog"
                className="text-blue-600 underline text-base transition-opacity duration-300 hover:opacity-80"
              >
                Create one →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewStories;
