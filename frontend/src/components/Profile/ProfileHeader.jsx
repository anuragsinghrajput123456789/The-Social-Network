import React from "react";
import { IoSettingsOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import dayjs from "dayjs";
import AnimatedCounter from "../Common/AnimatedCounter";

const ProfileHeader = ({
  userDetails,
  isYouFollowed,
  onToggleFollow,
  onOpenConnectionsModal
}) => {
  if (!userDetails) return null;

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-16 mb-12 border-b border-ig-border/60 pb-12">
      {/* Avatar with gradient border */}
      <div className="flex-shrink-0">
        <div className="w-[85px] h-[85px] md:w-[155px] md:h-[155px] rounded-full p-[3px] bg-gradient-to-tr from-[#6A5AE0] via-[#8B5CF6] to-[#FF3D81] shadow-xl cursor-pointer">
          <div className="bg-ig-bg p-[3px] rounded-full w-full h-full transition-colors duration-300">
            <img
              src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
              className="w-full h-full rounded-full object-cover border border-ig-border/20"
              alt={userDetails.username}
            />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-4 w-full md:w-auto text-ig-text">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <h2 className="text-2xl font-light tracking-wide">{userDetails.username}</h2>
          <div className="flex gap-2">
            {userDetails.isThisYou ? (
              <button className="bg-ig-hover border border-ig-border/80 hover:bg-ig-border text-ig-text px-5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 cursor-pointer">
                Edit profile
              </button>
            ) : (
              <button
                onClick={onToggleFollow}
                className={`px-6 py-2 rounded-xl text-sm font-bold text-white transition-all active:scale-95 cursor-pointer ${
                  isYouFollowed
                    ? "bg-ig-hover text-ig-text border border-ig-border hover:bg-ig-border"
                    : "bg-ig-primary hover:bg-ig-primary-hover shadow-md shadow-ig-primary/20"
                }`}
              >
                {isYouFollowed ? "Following" : "Follow"}
              </button>
            )}
            {userDetails.isThisYou && (
              <motion.div
                whileHover={{ rotate: 45 }}
                className="cursor-pointer p-2 rounded-xl hover:bg-ig-hover border border-transparent hover:border-ig-border transition-all"
              >
                <IoSettingsOutline size={20} />
              </motion.div>
            )}
          </div>
        </div>

        <div className="flex justify-around md:justify-start gap-6 md:gap-8 text-sm md:text-base border-y border-ig-border/40 py-3 md:py-0 md:border-none flex-wrap">
          <div className="text-center md:text-left text-ig-text-secondary">
            <span className="font-bold text-ig-text">
              <AnimatedCounter value={userDetails.posts || 0} />
            </span>{" "}
            posts
          </div>

          <div
            onClick={() => onOpenConnectionsModal("followers")}
            className="text-center md:text-left text-ig-text-secondary cursor-pointer hover:underline"
          >
            <span className="font-bold text-ig-text">
              <AnimatedCounter value={userDetails.followers || 0} />
            </span>{" "}
            followers
          </div>

          <div
            onClick={() => onOpenConnectionsModal("following")}
            className="text-center md:text-left text-ig-text-secondary cursor-pointer hover:underline"
          >
            <span className="font-bold text-ig-text">
              <AnimatedCounter value={userDetails.following || 0} />
            </span>{" "}
            following
          </div>

          <div className="text-center md:text-left text-ig-text-secondary">
            <span className="font-bold text-red-500">
              <AnimatedCounter value={userDetails.totalLikesReceived || 0} />
            </span>{" "}
            likes
          </div>
        </div>

        <div className="hidden md:block">
          <h3 className="font-bold text-sm text-ig-text">{userDetails.name || userDetails.username}</h3>
          <p className="text-xs text-ig-primary font-semibold mt-0.5">Digital Creator</p>
          <p className="text-xs text-ig-text-secondary/70 mt-1">
            Joined {userDetails.date ? dayjs(userDetails.date).format("MMMM YYYY") : "recently"}
          </p>
        </div>
      </div>

      {/* Mobile Bio */}
      <div className="md:hidden w-full px-4 text-sm -mt-4 text-center md:text-left text-ig-text-secondary">
        <h3 className="font-bold text-ig-text">{userDetails.name || userDetails.username}</h3>
        <p className="text-xs text-ig-primary font-semibold">Digital Creator</p>
      </div>
    </div>
  );
};

export default ProfileHeader;
