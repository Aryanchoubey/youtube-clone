

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function LikedVideos({ isSidebarOpen }) {
  const {userId} = useParams();
  const navigate = useNavigate()
  console.log(userId);
  const [likedVideos, setLikedVideos]= useState()
  
  const getLikedVideos =async()=>{
    const token = localStorage.getItem("token");
    if(!token)return null;
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/likes/${userId}`,{
        headers:{Authorization: `Bearer ${token}`}
      })
      console.log(res.data.data);
      setLikedVideos(res.data.data)
      
    } catch (error) {
      console.log(error);
      
    }
  }
  

useEffect(()=>{
  getLikedVideos()
},[])
  return (
    <div
      className={`min-h-screen w-full bg-gray-100 pt-16 transition-all duration-300 ${
        isSidebarOpen ? "lg:pl-64" : "lg:pl-0"
      }`}
    >
      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-6 px-4">Liked Videos</h1>

      {/* Responsive Grid */}
      <div
        className={`
          p-4 
          grid gap-6 
          grid-cols-1
          sm:grid-cols-2
          md:grid-cols-3
          ${isSidebarOpen ? "lg:grid-cols-4" : "lg:grid-cols-3"}
        `}
      >
       {likedVideos && likedVideos.length > 0 ? (
  <>
    {likedVideos.map((video) => (
      <Card key={video._id}
      onClick={() => navigate(`/watch/${video._id}`, { state: video })}
      className="shadow-md rounded-lg overflow-hidden">
        <CardContent>
           <img
        src={video.thumbnail}
        alt={video.title}
        className="w-full h-40 object-cover rounded-t-xl"
      />
          <h2>{video.title}</h2>
        </CardContent>
      </Card>
    ))}
  </>
) : (
  <p>No liked videos found</p>
)}

      </div>
    </div>
  );
}
