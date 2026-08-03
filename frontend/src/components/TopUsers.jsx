import React from 'react';
import { motion } from "framer-motion";

const TopUsers = () => {
  // Temporary dummy data for stories
  const stories = [
    { id: 1, username: 'your_story', isUser: true, img: 'https://cdn-icons-png.flaticon.com/512/149/149071.png' },
    { id: 2, username: 'jane_doe', img: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
    { id: 3, username: 'john_smith', img: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    { id: 4, username: 'travel_lover', img: 'https://i.pravatar.cc/150?u=a04258114e29026302d' },
    { id: 5, username: 'foodie_life', img: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
    { id: 6, username: 'tech_guru', img: 'https://i.pravatar.cc/150?u=a042581f4e29026704d' },
    { id: 7, username: 'art_daily', img: 'https://i.pravatar.cc/150?u=a04258114e29026302d' },
    { id: 8, username: 'music_vibes', img: 'https://i.pravatar.cc/150?u=a042581f4e29026024d' },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto scrollbar-hide p-4 bg-ig-surface border border-ig-border rounded-2xl mb-4 md:mb-6 transition-colors duration-300">
      {stories.map((story) => (
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          key={story.id} 
          className="flex flex-col items-center gap-1.5 min-w-[70px] cursor-pointer"
        >
          {/* Story Ring wrapper with dynamic gradient background */}
          <div className="relative group">
            <div className={`p-[2.5px] rounded-full transition-transform duration-300 group-hover:rotate-12 ${
              story.isUser 
                ? 'bg-ig-border border border-ig-bg' 
                : 'bg-gradient-to-tr from-[#6A5AE0] via-[#8B5CF6] to-[#FF3D81]'
            }`}>
              <div className="bg-ig-surface p-[2.5px] rounded-full transition-colors duration-300">
                <img
                  src={story.img}
                  alt={story.username}
                  className="w-[54px] h-[54px] rounded-full object-cover border border-ig-border/30"
                />
              </div>
            </div>
            
            {story.isUser && (
              <span className="absolute bottom-0 right-0 w-4 h-4 bg-ig-primary border-2 border-ig-surface rounded-full flex items-center justify-center text-white text-[10px] font-bold">+</span>
            )}
          </div>
          <span className="text-[11px] font-medium w-16 truncate text-center text-ig-text">
            {story.isUser ? "Your Story" : story.username}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

export default TopUsers;