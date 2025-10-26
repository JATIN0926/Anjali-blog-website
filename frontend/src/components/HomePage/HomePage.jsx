import React, { useEffect, useState } from "react";
import BlogCard from "./BlogCard/BlogCard";
import Footer from "./Footer/Footer";
import GoogleOneTapLogin from "../GoogleOneTapLogin/GoogleOneTapLogin";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../Loader/Loader";
import axiosInstance from "../../utils/axiosInstance";
import "./HomePage.css";
import { setUser } from "../../redux/slices/userSlice";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 799);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 799);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

const HomePage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(4);
  const [activeTab, setActiveTab] = useState("social");

  const user = useSelector((state) => state.user.currentUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const type = activeTab === "social" ? "Article" : "Diary";
        const res = await axiosInstance.get(`/api/blogs/type/${type}`);

        setBlogs(res.data.data);
        setVisibleCount(4);
      } catch (err) {
        console.error("Failed to fetch blogs:", err);
        setError("Failed to fetch blogs.");
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [activeTab]);

  useEffect(() => {
    axiosInstance
      .get("/api/users/me")
      .then((res) => {
        dispatch(setUser(res.data.data.user));
      })
      .catch((err) => {
        console.log("User not logged in:", err.response?.data || err.message);
        dispatch(setUser(null));
      });
  }, []);

  return (
    <>
      <GoogleOneTapLogin />
      <div className="w-full px-6 p-4">
        <div className="bg-[#303130] w-full h-[0.1rem]"></div>

        {isMobile ? (
          <div className="hero-container-mobile flex flex-col items-center pt-5">
            <h1
              className="text-[#201F1F] text-[0.8rem] self-start "
              style={{ fontFamily: "SometypeMono Regular, monospace" }}
            >
              Anjali Chaudhary
            </h1>

            <p
              className="main-text-mobile tracking-[-1px] text-center"
              style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
            >
              This space holds scattered thoughts, quiet moments, and questions
              without answers. Some days I journal through feelings. Some days I
              trace the patterns — not just around us, but within. I’m not here
              to teach, just to witness — the mess, the meaning, the in-between.
              Some days I untangle what’s inside me. Some days I notice the
              knots around us — the loops we live, the patterns we don’t
              question.
            </p>

            <div className="main-image-mobile w-full">
              <img
                src="/images/img1.png"
                alt=""
                className="object-cover w-full h-full rounded-md"
              />
            </div>

            {user && user.isAdmin && (
              <div
                className="admin-buttons-mobile flex items-center justify-center gap-3 mb-6"
                style={{ fontFamily: "SometypeMono Regular, monospace" }}
              >
                <button
                  className="underline text-[1rem] button-article"
                  onClick={() => navigate("/create-blog")}
                >
                  Write article
                </button>
                <button
                  className="underline text-[1rem] button-story"
                  onClick={() => navigate("/view-stories")}
                >
                  View stories
                </button>
                <div className="w-[1.8rem] settings-icon-wrapper cursor-pointer">
                  <img
                    src="/icons/settings.png"
                    alt=""
                    className="object-cover w-full h-full"
                    onClick={() => navigate("/settings")}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full flex items-start justify-between pt-5 hero-container">
            <div className="flex flex-col items-start justify-between h-full">
              <h1
                className="text-[#201F1F] text-[0.8rem] lg:text-base"
                style={{ fontFamily: "SometypeMono Regular, monospace" }}
              >
                Anjali Chaudhary
              </h1>
              <div className="w-[30vw] h-auto mb-16 main-image">
                <img
                  src="/images/img1.png"
                  alt=""
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
            <div className="w-[60%] self-start flex flex-col items-start gap-12">
              <p
                className="main-text font-medium tracking-[-1px]"
                style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
              >
                This space holds scattered thoughts, quiet moments, and
                questions without answers. Some days I journal through feelings.
                Some days I trace the patterns — not just around us, but within.
                I’m not here to teach, just to witness — the mess, the meaning,
                the in-between. Some days I untangle what’s inside me. Some days
                I notice the knots around us — the loops we live, the patterns
                we don’t question.
              </p>

              {user && user.isAdmin && (
                <div
                  className="flex items-center justify-center gap-4"
                  style={{ fontFamily: "SometypeMono Regular, monospace" }}
                >
                  <button
                    className="underline text-[1.1rem] button-article transition-all cursor-pointer write-article"
                    onClick={() => navigate("/create-blog")}
                  >
                    Write article
                  </button>
                  <button
                    className="underline text-[1.1rem] button-story transition-all cursor-pointer view-stories"
                    onClick={() => navigate("/view-stories")}
                  >
                    View stories
                  </button>
                  <div className="w-[2vw] h-auto cursor-pointer settings-icon-wrapper">
                    <img
                      src="/icons/settings.png"
                      alt=""
                      className="object-cover w-full h-full"
                      onClick={() => navigate("/settings")}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="w-full flex items-end justify-end gap-6 blog_parent_container">
          <div className="blogs_container flex flex-col gap-12">
            <div className="w-full flex flex-col">
              <h1
                className=" blog_heading mb-5"
                style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
              >
                {activeTab === "social"
                  ? "Here, you will find Patterns of behavior, belief, and mindset — across time, place, and culture."
                  : "Here, you will find these are moments I kept. Messy, unsure, and mine"}
              </h1>
              <div
                className="w-full flex items-center justify-center relative mb-2"
                style={{ fontFamily: "SometypeMono Regular, monospace" }}
              >
                {/* Sliding background */}
                <div
                  className="absolute h-full w-1/2 justify-self-center bg-[#3D3C3C] transition-transform duration-300 ease-in-out"
                  style={{
                    transform:
                      activeTab === "diary"
                        ? "translateX(100%)"
                        : "translateX(0%)",
                    left: 0,
                    top: 0,
                    zIndex: 0,
                  }}
                />

                {/* Buttons */}
                <button
                  onClick={() => setActiveTab("social")}
                  className={`w-1/2 px-12 py-2 border border-[#303130] cursor-pointer relative z-10 transition-colors duration-300 social_pattern ${
                    activeTab === "social" ? "text-white" : "text-[#464445]"
                  }`}
                >
                  Social Pattern
                </button>

                <button
                  onClick={() => setActiveTab("diary")}
                  className={`w-1/2 px-12 py-2 border border-[#303130] cursor-pointer relative z-10 transition-colors duration-300 my_diary ${
                    activeTab === "diary" ? "text-white" : "text-[#464445]"
                  }`}
                >
                  My Diary
                </button>
              </div>
            </div>

            <div className="h-[40rem] overflow-y-auto pr-2 custom-scrollbar">
              {loading ? (
                <Loader />
              ) : error ? (
                <p>{error}</p>
              ) : blogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[30%] text-[#8e8e8e]">
                  <span
                    className="text-3xl font-semibold"
                    style={{ fontFamily: "SometypeMono Regular, monospace" }}
                  >
                    No Blogs Yet!
                  </span>
                  <a
                    href="/create-blog"
                    className="text-blue-600 underline text-lg transition-opacity duration-300 hover:opacity-80"
                  >
                    Create one →
                  </a>
                </div>
              ) : (
                blogs.slice(0, visibleCount).map((blog) => (
                  <BlogCard
                    key={blog._id}
                    id={blog._id}
                    date={new Date(blog.datePosted).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}
                    heading={blog.title}
                    imgSrc={blog.thumbnail || ""}
                  />
                ))
              )}
              {visibleCount < blogs.length && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 5)}
                    className=" see_more_btn cursor-pointer text-[0.9rem] border border-[#3D3C3C] text-[#201F1F] px-6 py-2 hover:bg-black hover:text-white transition-all"
                    style={{ fontFamily: "SometypeMono Regular, monospace" }}
                  >
                    See more
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default HomePage;
