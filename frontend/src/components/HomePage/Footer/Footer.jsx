import React from "react";

const Footer = () => {
  return (
    <div className="w-full flex items-start justify-between border-t-[1px] border-t-[#303130] p-4 pb-20">
      {/* Left Section */}
      <div className="w-[30%] flex flex-col items-start justify-between">
        {[
          ["Laura Kim", "Instagram"],
          ["Copyright © 2025", "Facebook"],
          ["hello@figma.com", "LinkedIn"],
          ["(646) 555-4567", "TikTok"],
        ].map(([left, right], index) => (
          <div
            key={index}
            className="w-full flex items-center justify-between text-[#201F1F] text-lg"
          >
            <h1 className="text-[0.6rem]">{left}</h1>
            <p className="underline text-left w-max text-[0.6rem]">{right}</p>
          </div>
        ))}
      </div>

      {/* Image Section */}
      <div className="w-[20%] h-[20%] self-start">
        <img
          src="/images/leaf.png"
          alt=""
          className="w-full h-full object-cover rounded-md"
        />
      </div>
    </div>
  );
};

export default Footer;
