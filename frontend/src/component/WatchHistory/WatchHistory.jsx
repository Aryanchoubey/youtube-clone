"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

export default function WatchHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/history`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setHistory(res.data.data || []);
        console.log("videos :",res.data.data);
        
      } catch (error) {
        console.error("Failed to fetch watch history", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-60 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
        No watch history found
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {history.map((video) => (
        <Card
          key={video._id}
          className="cursor-pointer hover:shadow-lg transition"
          onClick={() =>navigate(`/watch/${video._id}`, { state: video })}
        >
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-40 object-cover rounded-t-xl"
          />

          <CardContent className="flex gap-3 pt-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={video.owner?.avatar} />
              <AvatarFallback>{video.owner?.username?.[0]}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <h3 className="font-medium text-sm line-clamp-2">
                {video.title}
              </h3>
              <span className="text-xs text-muted-foreground">
                {video.owner?.username}
              </span>
              <span className="text-xs text-muted-foreground">
                {video.views} views
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
