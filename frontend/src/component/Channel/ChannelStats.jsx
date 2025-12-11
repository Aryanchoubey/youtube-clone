import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Users, Video, Calendar } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ChannelStats() {
  const [channel, setChannel] = useState(null);
  const navigate= useNavigate()

  useEffect(() => {
    const getChannelStats = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:5000/api/v1/dashboard/stats", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setChannel(res.data.data);
        console.log("channel :" , res.data.data);
        
      } catch (error) {
        console.log("Error loading channel:", error);
      }
    };

    getChannelStats();
  }, []);
  const handleNavigation =(path)=>{
    navigate(`/${path}`)
  }

  if (!channel)
    return (
      <div className="flex justify-center items-center h-screen text-xl">
        Loading...
      </div>
    );

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="w-full h-40 md:h-56 rounded-xl overflow-hidden shadow">
        <img
          src={channel.banner || "/placeholder-banner.jpg"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Avatar + Name */}
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 mt-4">
        <img
          src={channel.avatar}
          className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white shadow"
        />

        <div className="text-center md:text-left">
          <h1 className="text-3xl font-bold">{channel.username}</h1>
          <p className="text-gray-600 text-sm">{channel.bio || "No bio added"}</p>
        </div>

        <div className="ml-auto hidden md:block">
          <Button>Edit Channel</Button>
        </div>
      </div>

      <div className="w-full flex justify-center md:hidden mt-4">
        <Button className="w-full">Edit Channel</Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {/* Subscribers */}
        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-col items-center">
            <Users className="w-6 h-6 mb-2" />
            <h2 className="font-semibold text-lg">{channel.totalSubscribers || 0}</h2>
            <p className="text-gray-600 text-sm">Subscribers</p>
          </CardContent>
        </Card>

        {/* Total Views */}
        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-col items-center">
            <Eye className="w-6 h-6 mb-2" />
            <h2 className="font-semibold text-lg">{channel.totalViews || 0}</h2>
            <p className="text-gray-600 text-sm">Views</p>
          </CardContent>
        </Card>

        {/* Videos */}
        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-col items-center">
            <Video className="w-6 h-6 mb-2" />
            <h2 className="font-semibold text-lg">{channel.totalVideos || 0}</h2>
            <p className="text-gray-600 text-sm">Videos</p>
          </CardContent>
        </Card>

      {/* Join Date */}
        <Card className="shadow-sm">
          <CardContent className="p-4 flex flex-col items-center">
            <Calendar className="w-6 h-6 mb-2" />
            <h2 className="font-semibold text-lg">
              {}
            </h2>
            <p className="text-gray-600 text-sm">Joined</p>
          </CardContent>
        </Card>
      </div>

      {/* CTA */}
      <div className="flex justify-center md:justify-end mt-8">
        <Button 
        onClick={() => handleNavigation("channel/upload")}
        className="px-8">Upload New Video</Button>
      </div>
    </div>
  );
}
