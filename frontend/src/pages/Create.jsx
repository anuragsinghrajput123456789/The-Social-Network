import React, { useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";
import { FaPhotoVideo } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { motion } from "framer-motion";

const Create = () => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const createPost = async () => {
    if (!caption || !image) {
      toast.error("Please add an image and a caption.");
      return;
    }

    setLoading(true);
    let formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", image);
    formData.append("token", localStorage.getItem("token"));

    try {
      const data = await api.createPost(formData);
      if (data.success) {
        toast.success("Post Created Successfully");
        navigate("/");
      } else {
        toast.error(data.msg);
      }
    } catch (error) {
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-screen bg-ig-bg items-center justify-center transition-all duration-300">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-12 bg-ig-surface border-b border-ig-border flex items-center justify-between px-4 z-50">
        <IoArrowBack size={24} className="text-ig-text cursor-pointer" onClick={() => navigate("/")} />
        <span className="font-semibold text-lg text-ig-text">New Post</span>
        <button
          onClick={createPost}
          className="text-ig-primary font-bold text-sm disabled:opacity-50 cursor-pointer"
          disabled={loading}
        >
          Share
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="bg-ig-surface md:border md:border-ig-border md:rounded-2xl w-full md:w-[780px] md:h-[520px] flex flex-col md:flex-row overflow-hidden mt-12 md:mt-0 shadow-2xl transition-colors duration-300"
      >
        {/* Drop Zone / Preview (Frosted Darkroom Vibe) */}
        <div className="w-full md:w-[480px] h-[360px] md:h-full bg-ig-bg flex flex-col items-center justify-center border-r border-ig-border/60 relative p-4 transition-colors duration-300">
          {preview ? (
            <motion.img 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-contain rounded-lg" 
            />
          ) : (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-ig-hover border border-ig-border/60 flex items-center justify-center text-ig-text-secondary/70">
                <FaPhotoVideo size={36} />
              </div>
              <p className="text-lg font-light text-ig-text-secondary">Select photos and videos</p>
              <label htmlFor="file-upload" className="btn-primary mt-2">
                Select from computer
              </label>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>
          )}
        </div>

        {/* Caption Section */}
        <div className="flex-1 flex flex-col h-full bg-ig-surface">
          <div className="hidden md:flex h-14 border-b border-ig-border/60 items-center justify-between px-5">
            <span className="font-semibold text-ig-text-secondary hover:text-ig-text cursor-pointer transition-colors" onClick={() => navigate("/")}>Cancel</span>
            <span className="font-bold text-ig-text text-[15px]">Create new post</span>
            <button
              onClick={createPost}
              className="text-ig-primary hover:text-ig-primary-hover font-bold text-sm disabled:opacity-50 transition-colors cursor-pointer"
              disabled={loading}
            >
              {loading ? "Sharing..." : "Share"}
            </button>
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-ig-hover overflow-hidden border border-ig-border/50">
                  <img src="https://cdn-icons-png.flaticon.com/512/149/149071.png" className="w-full h-full" alt="User" />
                </div>
                <span className="font-bold text-sm text-ig-text">Create Post</span>
              </div>
              
              <textarea
                className="w-full h-36 bg-transparent outline-none resize-none text-sm placeholder-ig-text-secondary/50 text-ig-text border-b border-ig-border/40 pb-3"
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              ></textarea>
            </div>

            <div className="divide-y divide-ig-border/40">
              <div className="flex justify-between items-center py-3 text-ig-text hover:text-ig-primary cursor-pointer transition-colors">
                <span className="text-[13px] font-medium">Add Location</span>
                <span className="text-lg opacity-60">›</span>
              </div>
              <div className="flex justify-between items-center py-3 text-ig-text hover:text-ig-primary cursor-pointer transition-colors">
                <span className="text-[13px] font-medium">Accessibility</span>
                <span className="text-lg opacity-60">›</span>
              </div>
              <div className="flex justify-between items-center py-3 text-ig-text hover:text-ig-primary cursor-pointer transition-colors">
                <span className="text-[13px] font-medium">Advanced settings</span>
                <span className="text-lg opacity-60">›</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Create;
