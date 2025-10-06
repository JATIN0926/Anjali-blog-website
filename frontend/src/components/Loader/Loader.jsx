import React from "react";

const Loader = () => {
  return (
    <div className="flex items-start justify-center w-full h-full">
      <div className="relative w-16 h-16 animate-spin">
        <span className="absolute w-3.5 h-3.5 bg-gray-700 rounded-full top-0 left-1/2 -translate-x-1/2"></span>
        <span className="absolute w-3 h-3 bg-gray-600 rounded-full top-2 left-2"></span>
        <span className="absolute w-2.5 h-2.5 bg-gray-500 rounded-full top-1/2 left-0 -translate-y-1/2"></span>
        <span className="absolute w-2 h-2 bg-gray-400 rounded-full bottom-2 left-2"></span>
        <span className="absolute w-1.5 h-1.5 bg-gray-300 rounded-full bottom-0 left-1/2 -translate-x-1/2"></span>
        <span className="absolute w-2 h-2 bg-gray-400 rounded-full bottom-2 right-2"></span>
        <span className="absolute w-2.5 h-2.5 bg-gray-500 rounded-full top-1/2 right-0 -translate-y-1/2"></span>
        <span className="absolute w-3 h-3 bg-gray-600 rounded-full top-2 right-2"></span>
      </div>
    </div>
  );
};

export default Loader;
