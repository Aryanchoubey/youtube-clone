"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { EllipsisVertical } from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function Channel() {
  const navigate = useNavigate();
  const { userId } = useParams();
  console.log(userId);
  

  const [userData, setUserData] = useState(null);
  const [showDelete, setShowDelete] = useState(null);
 // channel owner data
  const [videos, setVideos] = useState([]);       
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  
  console.log();
  

 
  // Fetch channel owner profile

  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const getChannelUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/c/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res.data.data;
        console.log(res.data.data);
        
        setUserData(data);
        setIsSubscribed(data.isSubscribed || false);
        setSubscriberCount(data.subscriberCount || 0);
      } catch (err) {
        console.error("Error loading channel user:", err);
      }
    };

    getChannelUser();
  }, [userId]);

  
  // Fetch channel owner videos

  useEffect(() => {
    if (!userId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const getUserVideos = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/videos/${userId}?page=1&limit=10`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

       
         setVideos(res.data.data.videos || []);
        console.log("Channel videos:", res.data.data.videos);

      } catch (err) {
        console.error("Error loading user videos:", err);
      }
    };

    getUserVideos();
  }, []);


  // Subscribe / Unsubscribe
  
  const toggleSubscribe = async () => {
    if (!userData?._id) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/subscriptions/c/${userData._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Toggle subscription locally
      setIsSubscribed(!isSubscribed);
      setSubscriberCount((prev) => (isSubscribed ? prev - 1 : prev + 1));
    } catch (err) {
      console.error("Error in subscription:", err);
    }
  };
  const handleDelete = async (videoId) => {
    
  try {
    const token = localStorage.getItem("token");
    if (!token) return;
    console.log(videoId);

    await axios.delete(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/videos/${videoId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    alert("Video deleted successfully");
    setVideos((prev) => prev.filter((v) => v._id !== videoId));
    // refresh or remove from state
  } catch (error) {
    console.log("DELETE ERROR:", error);
  }
};


  
  // Navigation helper

  const handleNavigation = (path) => navigate(`/${path}`);

  
  // Render
  
  return (
    <div className="min-h-screen bg-gray-100 pt-16 px-4 flex flex-col items-center">
      {/* Profile */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="h-48 bg-gray-300"></div>

        <CardContent className="p-6 flex items-center gap-4">
          {userData && (
            <>
              <img
                onClick={() => handleNavigation(`channel/stats/${userId}`)}
                src={userData.avatar}
                alt="avatar"
                className="w-24 h-24 rounded-full cursor-pointer border-4 border-white object-cover"
              />

              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold">{userData.username}</h1>
                <p className="text-gray-500 text-sm">
                  {subscriberCount} Subscribers
                </p>
              </div>

              <div className="ml-auto">
                <Button
                  className={`${
                    isSubscribed ? "bg-gray-400" : "bg-red-700"
                  }  hover:bg-none hover:shadow-none pointer-events-auto`}
                  onClick={toggleSubscribe}
                >
                  {isSubscribed ? "Subscribed" : "Subscribe"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </div>

      {/* Videos */}
      <div className="w-full max-w-5xl mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {videos.length > 0 ? (
  videos.map((video, index) => (
    <Card
      key={video._id || index} 
     
      className="rounded-xl shadow hover:shadow-lg cursor-pointer transition"
    >
      <CardContent className="p-0">
        
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-40 object-cover rounded-t-xl"
           onClick={() => navigate(`/watch/${video._id}`, { state: video })}
        />

        <div className="p-3">
          <h2 className="font-semibold text-lg">{video.title}</h2>
          <p className="text-sm text-gray-500">{video.description}</p>
         <div className="flex justify-end relative">
  <EllipsisVertical
    className="cursor-pointer"
     onClick={() =>
    setShowDelete(showDelete === video._id ? null : video._id)
  }
  />

 {showDelete === video._id && (
  <div className="absolute right-0 top-6 bg-white shadow-lg rounded-lg p-2 w-28">
    <button
      onClick={() => handleDelete(video._id)}
      className="text-red-600 hover:bg-red-100 w-full text-left px-2 py-1 rounded-md"
    >
      Delete
    </button>
  </div>
)}
  
</div>

        </div>
      </CardContent>
    </Card>
  ))
) : (
  <p className="text-gray-600 text-center col-span-3">
    No videos uploaded yet.
  </p>
)}

      </div>
    </div>
  );
}
