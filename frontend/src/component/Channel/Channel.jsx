

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
  const [videos, setVideos] = useState([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [showDelete, setShowDelete] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch channel profile
  useEffect(() => {
    if (!userId || !token) return;

    const getChannelUser = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/c/${userId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUserData(res.data.data);
        setIsSubscribed(res.data.data.isSubscribed || false);
        setSubscriberCount(res.data.data.subscriberCount || 0);
      } catch (err) {
        console.error("Error loading channel user:", err);
      }
    };
    getChannelUser();
  }, [userId]);

  // Fetch channel videos
  useEffect(() => {
    if (!userId || !token) return null;

    const getUserVideos = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/videos/`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            params: {userId, page: 1, limit: 10 } 
          }
        );
        setVideos(res.data.data.videos || []);
      } catch (err) {
        console.error("Error loading user videos:", err);
      }
    };
    getUserVideos();
  }, [userId]);

  const toggleSubscribe = async () => {
    if (!userData?._id || !token) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/subscriptions/c/${userData._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsSubscribed(!isSubscribed);
      setSubscriberCount(prev => (isSubscribed ? prev - 1 : prev + 1));
    } catch (err) {
      console.error("Subscription error:", err);
    }
  };

  const handleDelete = async (videoId) => {
    if (!token) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/videos/${videoId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setVideos(prev => prev.filter(v => v._id !== videoId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };
console.log(userData);

  return (
    <div className="min-h-screen bg-gray-100 pt-16 px-4 flex flex-col items-center">
      {/* Profile */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-md overflow-hidden">
        <div className="h-48 bg-gray-300"></div>

        <CardContent className="p-6 flex items-center gap-4">
          {userData && (
            <>
              <img
                onClick={() => navigate(`/channel/${userData._id}/stats`)}

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
                  className={`${isSubscribed ? "bg-gray-400" : "bg-red-700"}`}
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
          videos.map(video => (
            <Card key={video._id} className="rounded-xl shadow hover:shadow-lg cursor-pointer">
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
                      onClick={() => setShowDelete(showDelete === video._id ? null : video._id)}
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
          <p className="text-gray-600 text-center col-span-3">No videos uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
