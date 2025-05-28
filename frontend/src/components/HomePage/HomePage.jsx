import React from "react";
import BlogCard from "./BlogCard/BlogCard";
import cardsData from "../../data/cardsData.json";
import Footer from "./Footer/Footer";

const HomePage = () => {
  return (
    <div className="w-full px-6 p-4">
      <div className="bg-[#303130] w-full h-[0.1rem]"></div>
      <div className="w-full flex items-start justify-between">
        <h1
          className="text-[#201F1F]"
          style={{ fontFamily: "SometypeMono Regular, monospace" }}
        >
          Laura Kim
        </h1>
        <p
          className="text-[2.7rem] leading-10 font-medium w-[60%] self-start"
          style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
        >
          Laura Kim is an illustrator and journalist who explores the
          relationship between the individual and the collective. Her photo
          essays, rendered in a style reminiscent of historic scientific
          illustrations, delve into complex emotions such as joy.
        </p>
      </div>
      <div className="w-full flex justify-start items-center mt-2">
        <div className="w-[32vw] h-auto">
          <img
            src="/images/img1.png"
            alt=""
            className="object-cover w-full h-full"
          />
        </div>
      </div>
      <div className="w-full flex items-end justify-end gap-6 mt-10">
        <div className="w-[50%] flex flex-col gap-12">
          <h1
            className="text-[2.05rem] leading-7 mb-10"
            style={{ fontFamily: "ScheherazadeNew Regular, monospace" }}
          >
            Here, you will find thought provoking visual dissections of the
            human experience.
          </h1>

          {cardsData.map((card, index) => (
            <BlogCard
              key={index}
              date={card.date}
              heading={card.heading}
              imgSrc={card.imgSrc}
            />
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;
