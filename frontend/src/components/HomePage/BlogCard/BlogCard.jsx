import React from "react";
import { useNavigate } from "react-router-dom";

const BlogCard = ({ date, heading, imgSrc , id }) => {
  const navigate = useNavigate();
  return (
    <div className="w-full border-t border-t-[#303130] p-4 flex items-center justify-between gap-6">
      {/* Left content */}
      <div className="flex flex-col items-start justify-center gap-2 w-[65%]">
        <p
          className="text-[#6F6B6B] text-[0.75rem]"
          style={{ fontFamily: "SometypeMono Regular, monospace" }}
        >
          {date}
        </p>
        <h1
          className="text-[2rem] leading-8 text-[#201F1F] tracking-[-0.84px] font-medium"
          style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
        >
          {heading}
        </h1>
        <button
          onClick={() => navigate(`/blog/${id}`)}
          className="text-[#201F1F] p-2 px-3 rounded-md bg-[#DEDEDE] cursor-pointer text-[0.75rem] mt-6"
          style={{ fontFamily: "SometypeMono Regular, monospace" }}
        >
          Explore Deeper
        </button>
      </div>

      {/* Right image with fixed height */}
      <div className="w-[40%] h-32 self-start">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt=""
            className="w-full h-full object-cover rounded-md"
          />
        ) : (
          <div className="w-full h-full rounded-md" />
        )}
      </div>
    </div>
  );
};

export default BlogCard;
