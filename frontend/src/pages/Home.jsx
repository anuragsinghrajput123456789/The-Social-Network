import React from "react";
import StoriesBar from "../components/Story/StoriesBar";
import TopUsers from "../components/TopUsers";
import Post from "../components/Post";
import SuggestedUsers from "../components/SuggestedUsers";

const Home = () => {
  return (
    <div className="flex justify-center w-full min-h-screen bg-ig-bg transition-colors duration-300">
      {/* Feed Column */}
      <div className="flex flex-col w-full max-w-[630px] pt-4 md:pt-8 px-4 min-h-screen">
        <StoriesBar />
        <TopUsers />
        <Post />
      </div>

      {/* Suggested Sidebar Column (Desktop Only) */}
      <div className="hidden lg:block w-[350px] pl-12 pr-4 pt-12">
        <SuggestedUsers />
      </div>
    </div>
  );
};

export default Home;
