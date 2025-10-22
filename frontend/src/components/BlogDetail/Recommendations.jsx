import React, { useEffect, useState } from "react";
import BlogCard from "../HomePage/BlogCard/BlogCard";
import axiosInstance from "../../utils/axiosInstance";
import Loader from "../Loader/Loader";

const Recommendations = ({ blogId }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const fetchRecommendations = async (pageNum = 1) => {
    try {
      setLoading(true);
      if (pageNum > 1) setShowLoader(true);
      const { data } = await axiosInstance.get(
        `/api/blogs/${blogId}/recommendations/?page=${pageNum}`
      );

      if (data.success && data.data.length > 0) {
        setRecommendations(data.data);
        setHasMore(data.data.length === 6); // assume pagination of 6
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoading(false);
      setShowLoader(false);
    }
  };

  useEffect(() => {
    fetchRecommendations(page);
  }, [blogId, page]);

  const handleShowMore = () => {
    setPage((prev) => prev + 1);
  };

  if (!recommendations.length) return null;

  return (
    <div className="bg-[#F6F5F5] w-full py-12 my-48 px-6 md:px-12 mt-12 rounded-2xl ">
      <h2
        className="text-4xl text-center font-semibold my-16 text-[#201F1F]"
        style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
      >
        You may also like
      </h2>

      <div className="grid grid-cols-1 gap-4">
        {recommendations.map((blog, idx) => {
          // Every two blogs form a row
          if (idx % 2 === 0) {
            const secondBlog = recommendations[idx + 1];

            return (
              <div
                key={blog._id}
                className="flex border-b border-[#E7E6E6] pb-4"
              >
                {/* First card with right border */}
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

                {/* Second card if exists */}
                {secondBlog && (
                  <div className="w-1/2 pl-4">
                    <BlogCard
                      id={secondBlog._id}
                      heading={secondBlog.title}
                      date={new Date(secondBlog.datePosted).toLocaleDateString(
                        "en-US",
                        { month: "long", day: "numeric", year: "numeric" }
                      )}
                      imgSrc={secondBlog.thumbnail}
                      variant="no-border"
                    />
                  </div>
                )}
              </div>
            );
          }
          return null; // handled in pairs
        })}
      </div>

      {showLoader && (
        <div className="flex justify-center mt-10">
          <Loader />
        </div>
      )}

      {hasMore && (
        <div className="flex justify-center mt-20">
          <button
            onClick={handleShowMore}
            disabled={loading}
            className=" cursor-pointer text-[#464445] px-6 py-2 border border-[#504E4F] text-base font-medium"
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
