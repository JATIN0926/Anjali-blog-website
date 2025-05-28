import React from "react";

const BlogCard = ({ date, heading, imgSrc }) => {
  return (
    <div className="w-full border-t-[1px] border-t-[#303130] p-4 flex items-center justify-between gap-6">
      {/* Left content */}
      <div className="flex flex-col items-start justify-center gap-5 w-[45%]">
        <p
          className="text-[#5A5858] text-sm"
          style={{ fontFamily: "SometypeMono Regular, monospace" }}
        >
          {date}
        </p>
        <h1
          className="text-[1.7rem] leading-8 text-[#201F1F]"
          style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
        >
          {heading}
        </h1>
        <button
          className="text-[#201F1F] p-2 px-3 rounded-md bg-[#DEDEDE] cursor-pointer text-[0.7rem]"
          style={{ fontFamily: "SometypeMono Regular, monospace" }}
        >
          Explore Deeper
        </button>
      </div>

      {/* Right image with fixed height */}
      <div className="w-[30%] h-[20%] self-start">
        <img
          src={imgSrc}
          alt=""
          className="w-full h-full object-cover rounded-md"
        />
      </div>
    </div>
  );
};

export default BlogCard;
