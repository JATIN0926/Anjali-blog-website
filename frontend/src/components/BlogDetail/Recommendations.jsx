import React, { useEffect, useState } from "react";
import BlogCard from "../HomePage/BlogCard/BlogCard";
import axiosInstance from "../../utils/axiosInstance";
import Loader from "../Loader/Loader";
import { motion, AnimatePresence } from "framer-motion";
import "./BlogDetail.css"
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

const Recommendations = ({ blogId }) => {
  const isMobile = useIsMobile();

  const LIMIT = isMobile ? 3 : 6;

  const [recommendations, setRecommendations] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchRecommendations = async (pageNum) => {
    try {
      setLoading(true);

      const { data } = await axiosInstance.get(
        `/api/blogs/${blogId}/recommendations/?page=${pageNum}&limit=${LIMIT}`
      );

      if (data.success && data.data.length > 0) {
        setRecommendations(data.data);
        setHasMore(data.data.length === LIMIT);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching recos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(page);
  }, [page, blogId, isMobile]);

  const handleShowMore = () => setPage((p) => p + 1);

  if (!recommendations.length) return null;

  return (
    <div className="bg-[#F6F5F5] w-full py-12 my-48 px-6 md:px-12 rounded-2xl">
      <h2
        className="text-4xl text-center font-semibold my-16 text-[#b9b1b1]"
        style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
      >
        You may also like
      </h2>

      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 gap-6"
        >
          {/* ✅ MOBILE LAYOUT: single-column 3 rows */}
          {isMobile &&
            recommendations.map((blog) => (
              <div key={blog._id} className="border-b border-[#E7E6E6] pb-4">
                <BlogCard
                  id={blog._id}
                  heading={blog.title}
                  date={new Date(blog.datePosted).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                  imgSrc={blog.thumbnail}
                  variant="no-border"
                />
              </div>
            ))}

          {/* ✅ DESKTOP LAYOUT: 2 columns × 3 rows */}
          {!isMobile &&
            recommendations.map((blog, idx) => {
              if (idx % 2 === 0) {
                const secondBlog = recommendations[idx + 1];
                return (
                  <div
                    key={blog._id}
                    className="flex border-b border-[#E7E6E6] pb-4"
                  >
                    <div className="w-1/2 border-r border-[#E7E6E6] pr-4">
                      <BlogCard
                        id={blog._id}
                        heading={blog.title}
                        date={new Date(blog.datePosted).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                        imgSrc={blog.thumbnail}
                        variant="no-border"
                      />
                    </div>

                    {secondBlog && (
                      <div className="w-1/2 pl-4">
                        <BlogCard
                          id={secondBlog._id}
                          heading={secondBlog.title}
                          date={new Date(
                            secondBlog.datePosted
                          ).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                          imgSrc={secondBlog.thumbnail}
                          variant="no-border"
                        />
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })}
        </motion.div>
      </AnimatePresence>

      {loading && (
        <div className="flex justify-center mt-10">
          <Loader />
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-12">
          <button
            onClick={handleShowMore}
            disabled={loading}
            className="text-[#464445] px-6 py-2 border border-[#504E4F] font-medium fetch_more"
            style={{ fontFamily: "SometypeMono Regular, monospace" }}
          >
            {loading ? "Loading..." : "See More Recommendations"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Recommendations;
