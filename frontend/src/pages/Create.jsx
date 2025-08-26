import Navbar from "../components/Navbar";
import Bottom from "../components/Bottom";
import { toast } from "react-toastify";
import { api_based_url } from "../helper";
import { useState } from "react";

const Create = () => {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState("");

  const create = () => {
    if (caption === "" && image === "") {
      toast.error("Please fill all the fields");
    }

    let formData = new FormData();
    formData.append("caption", caption);
    formData.append("image", image);
    formData.append("token", localStorage.getItem("token"));

    fetch(api_based_url + "/createPost", {
      mode: "cors",
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          toast.success("Post Created Successfully");
        } else {
          toast.error(data.msg);
        }
      });
  };

  return (
    <>
      <Navbar />
      <div className="create px-[10px] mb-5">
        <h1 className="text-xl">Create</h1>
        <input
          onChange={(e) => {
            setImage(e.target.files[0]);
          }}
          type="file"
          id="file"
          required
        />
        <div className="inputBox mt-4">
          <textarea
            onChange={(e) => {
              setCaption(e.target.value);
            }}
            value={caption}
            placeholder="Caption"
            name=""
            id=""
          ></textarea>
        </div>
        <button
          onClick={create}
          className="btnNormal w-full  bg-purple-500 font-bold"
        >
          Create
        </button>
      </div>
      <Bottom />
    </>
  );
};

export default Create;
