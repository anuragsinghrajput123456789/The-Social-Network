import React from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { CiHeart } from "react-icons/ci";
import { FaRegComment } from "react-icons/fa";
import { FiSend } from "react-icons/fi";
import { PiBookmarkSimpleBold } from "react-icons/pi";
import { api_based_url } from "../helper";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const Post = () => {
  const [data, setData] = useState(null);

  const getPosts = () => {
    fetch(api_based_url + "/getPosts", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: localStorage.getItem("token"),
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setData(data.data);
        } else {
          toast.error(data.msg);
        }
      });
  };

  useEffect(() => {
    getPosts();
  }, []);

  return (
    <>
      {/* Force vertical stacking */}
      <div className="posts mt-5 flex flex-col pb-[60px] gap-6 w-full max-w-md mx-auto">
        {/* Post Card */}
        <div className="post  rounded-lg p-3">
          {/* Header */}
          <div className="flex px-[8px] items-center justify-between">
            <div className="flex items-center gap-[10px]">
              <img
                className="w-[45px] h-[45px] rounded-full object-cover"
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6k-XfeS9JpRSWGruWiP6vmsNnMs9nFrRb7Q&s"
                alt="profile"
              />
              <div>
                <p>Username</p>
                <p className="text-[13px] text-gray-400 -mt-1">
                  Joined on 13 Jan 2022
                </p>
              </div>
            </div>
            <i className="text-[20px] cursor-pointer">
              <BsThreeDotsVertical />
            </i>
          </div>

          {/* Post Image */}
          <img
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6k-XfeS9JpRSWGruWiP6vmsNnMs9nFrRb7Q&s"
            alt="post"
            className="mt-4 w-full h-auto object-cover rounded-md"
          />

          {/* Actions + Content */}
          <div>
            <div className="flex mt-3 px-[10px] justify-between">
              <div className="flex items-center gap-[15px]">
                <i className="text-[20px] cursor-pointer">
                  <CiHeart />
                </i>
                <i className="text-[20px] cursor-pointer">
                  <FaRegComment />
                </i>
                <i className="text-[20px] cursor-pointer">
                  <FiSend />
                </i>
              </div>
              <i className="text-[20px] cursor-pointer">
                <PiBookmarkSimpleBold />
              </i>
            </div>

            <p className="my-2 text-[14px] text-gray-400">23K likes</p>
            <p className="my-2 text-[14px] text-gray-400">
              <b className="text-white">Username</b> Lorem ipsum dolor sit amet,
              consectetur adipisicing elit. Magni, qui ut! Amet, quidem
              volpellat reiciendis?
            </p>
          </div>
        </div>

         {
          data ? data.map((item, index) => (
            <>
              {/* Render your post data here, for example: */}
              <div key={index} className="post rounded-lg p-3">
                {/* Header */}
                <div className="flex px-[8px] items-center justify-between">
                  <div className="flex items-center gap-[10px]">
                    <img
                      className="w-[45px] h-[45px] rounded-full object-cover"
                      src={item.profileImage || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6k-XfeS9JpRSWGruWiP6vmsNnMs9nFrRb7Q&s"}
                      alt="profile"
                    />
                    <div>
                      <p>{item.username || "Username"}</p>
                      <p className="text-[13px] text-gray-400 -mt-1">
                        Joined on {item.joinedDate || "13 Jan 2022"}
                      </p>
                    </div>
                  </div>
                  <i className="text-[20px] cursor-pointer">
                    <BsThreeDotsVertical />
                  </i>
                </div>

                {/* Post Image */}
                <img
                  src={item.postImage || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6k-XfeS9JpRSWGruWiP6vmsNnMs9nFrRb7Q&s"}
                  alt="post"
                  className="mt-4 w-full h-auto object-cover rounded-md"
                />

                {/* Actions + Content */}
                <div>
                  <div className="flex mt-3 px-[10px] justify-between">
                    <div className="flex items-center gap-[15px]">
                      <i className="text-[20px] cursor-pointer">
                        <CiHeart />
                      </i>
                      <i className="text-[20px] cursor-pointer">
                        <FaRegComment />
                      </i>
                      <i className="text-[20px] cursor-pointer">
                        <FiSend />
                      </i>
                    </div>
                    <i className="text-[20px] cursor-pointer">
                      <PiBookmarkSimpleBold />
                    </i>
                  </div>

                  <p className="my-2 text-[14px] text-gray-400">{item.likes || "23K"} likes</p>
                  <p className="my-2 text-[14px] text-gray-400">
                    <b className="text-white">{item.username || "Username"}</b> {item.caption || "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Magni, qui ut! Amet, quidem volpellat reiciendis?"}
                  </p>
                </div>
              </div>
            </>
          )) : null
         }
         

      

        {/* Duplicate post cards here if needed */}
      </div>
    </>
  );
};

export default Post;
