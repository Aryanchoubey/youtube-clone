import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Home({ isSidebarOpen }) {
  const [videos, setVideos] = useState([]);
const navigate = useNavigate()
  const getAllVideos = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/videos/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log("all videos:",res.data.data)


      setVideos(res.data.data.videos || []);
      console.log("all videos:",res.data.data.videos[0].owner.username)
    } catch (error) {
      console.log("Error getting videos:", error);
    }
  };

  useEffect(() => {
    getAllVideos();
  }, []);
  // const handleNavigation =()=>{
  //   navigate(`/watch/${video._id}`)
  // }

  return (
    <div
      className={`min-h-screen w-full bg-gray-100 pt-3 lg:pt-20 transition-all duration-300 ${
        isSidebarOpen ? "lg:pl-64" : "lg:pl-0"
      }`}
    >
      <div
        className={`
          p-6 grid gap-6
          grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-3 
          lg:grid-cols-4    /* Only 4 cards per row */
        `}
      >
        {videos.length === 0 && (
          <p className="text-center col-span-full text-gray-600 text-lg">
            No videos uploaded yet.
          </p>
        )}

       

{videos.map((video) => (
  <Card
    key={video._id}
    className="shadow-lg rounded-xl overflow-hidden hover:shadow-2xl transition-all border hover:-translate-y-1"
    onClick={() => navigate(`/watch/${video._id}`, { state: video })}
  >
    <div className="w-full h-48 bg-black">
      <img
        src={video.thumbnail}
        alt={video.title}
        className="w-full h-40 object-cover rounded-t-xl"
      />
    </div>

    <CardContent className="p-4 flex flex-col gap justify-start items-start">
      <h2 className="font-bold text-lg text-gray-900 truncate">{video.title}</h2>

      <p className="text-sm text-gray-500 mt-1">
        By: <span className="font-medium">{video.owner?.username || "Unknown"}</span>
      </p>

      <div className="mt-3 flex justify-between text-xs text-gray-400">
        <span>{new Date(video.createdAt).toLocaleDateString()}</span>
        <span>{video.views || 0} views</span>
      </div>
    </CardContent>
  </Card>
))}

      </div>
    </div>
  );
}

export default Home;

