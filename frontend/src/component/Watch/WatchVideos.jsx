"use client";

import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThumbsUp, EllipsisVertical } from "lucide-react";
import VideoPlayer from "./VideoPlayer";

export default function WatchVideos() {
  const { id } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const [video, setVideo] = useState(state || null);
  const [views, setViews] = useState(0);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [editCommentId, setEditCommentId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const [content, setContent] = useState("");

  const [deletecmt, setDeletecmt] = useState(null);

  const token = localStorage.getItem("token");

  /* ---------------- GET HLS URL ---------------- */
  const getHlsUrl = (mp4Url) => {
    if (!mp4Url) return "";
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const cleanPublicId = mp4Url
      .replace(/^https:\/\/res.cloudinary.com\/[^/]+\/video\/upload\//, "")
      .replace(".mp4", "");
    return `https://res.cloudinary.com/${cloudName}/video/upload/sp_hd/${cleanPublicId}.m3u8`;
  };

  /* ---------------- FETCH VIDEO ---------------- */
  useEffect(() => {
    if (!video) {
      const fetchVideo = async () => {
        try {
          const res = await axios.get(
            `${import.meta.env.VITE_BACKEND_URL}/api/v1/videos/${id}`
          );
          console.log("video :", res.data.data);
          setVideo(res.data.data.video);
        } catch (err) {
          console.error("Error fetching video:", err);
        }
      };
      fetchVideo();
    }
  }, [id, video]);


   useEffect( ()=>{
  
  const res = axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/watch-history/${id}`,
    {},
    {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
  )
  },[id])

  /* ---------------- VIEWS ---------------- */
  const totalViews = async () => {
    if (!token || !id) return;
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/videos/${id}/views`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setViews(res.data.data.video.views);
    } catch (err) {
      console.log("Views error:", err);
    }
  };

  /* ---------------- LIKE ---------------- */
  const fetchLikeStatus = async () => {
    if (!token || !id) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/likes/status/v/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(res.data.data.liked);
    } catch (err) {
      console.log("Like status error:", err);
    }
  };

  const fetchLikeCount = async () => {
    if (!token || !id) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/likes/count/v/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLikeCount(res.data.data.count);
    } catch (err) {
      console.log("Like count error:", err);
    }
  };

  const toggleLike = async () => {
    if (!token || !id) return;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/likes/toggle/v/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.message === "liked successfully") {
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      } else {
        setLiked(false);
        setLikeCount((prev) => prev - 1);
      }
    } catch (err) {
      console.log("Toggle like error:", err);
    }
  };

  /* ---------------- COMMENTS ---------------- */
  const loadComments = async () => {
    if (!token || !id) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/comments/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments(res.data?.data[0]?.comments || []);
      console.log("load comment :", res.data.data[0]);
    } catch (err) {
      console.log("Load comments error:", err);
    }
  };

  const addComment = async () => {
    if (!token || !id || !content.trim()) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/comments/${id}`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContent("");
      loadComments();
    } catch (err) {
      console.log("Add comment error:", err);
    }
  };
  const handleEditSubmit = async (commentId) => {
    if (!token || !editContent.trim()) return;

    try {
      await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/comments/c/${commentId}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditCommentId(null);
      setEditContent("");
      loadComments();
    } catch (err) {
      console.log("Edit error:", err);
    }
  };

  const deleteComment = async (commentId) => {
    if (!token || !id) return;
    try {
      await axios.delete(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/comments/c/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      setDeletecmt(null);
    } catch (err) {
      console.log("Delete comment error:", err);
    }
  };
  const loggedUserId = localStorage.getItem("userId");

  console.log(loggedUserId);

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    if (video) {
      fetchLikeStatus();
      fetchLikeCount();
      loadComments();
      totalViews();
    }
  }, [video]);

  if (!video) return <div>Loading video...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* VIDEO */}
      <div className="max-w-4xl mx-auto bg-black rounded-xl overflow-hidden">
        <VideoPlayer src={getHlsUrl(video.videoFile)} />
      </div>

      {/* INFO */}
      <div className="max-w-4xl mx-auto mt-4 bg-white p-4 rounded-xl">
        <h1 className="text-xl font-bold">{video.title}</h1>
        <p className="text-gray-600 text-sm mt-1">{video.description}</p>

        <div className="flex items-center gap-6 mt-4">
          {/* Avatar */}
          <div
            onClick={() => navigate(`/channel/${video.owner._id}`)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <img
              src={video.owner.avatar}
              className="w-10 h-10 rounded-full object-cover"
            />
          </div>

          {/* Like */}
          <div
            onClick={toggleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full cursor-pointer
              ${liked ? "bg-blue-100 text-blue-700" : "bg-gray-200"}
            `}
          >
            <ThumbsUp fill={liked ? "#1d4ed8" : "none"} />
            <span>{likeCount}</span>
          </div>

          {/* Views */}
          <span className="text-sm text-gray-500">{views} views</span>
        </div>
      </div>

      {/* COMMENTS */}
      <div className="max-w-4xl mx-auto mt-6 bg-white p-4 rounded-xl">
        <h2 className="font-semibold mb-2">Comments</h2>

        <Input
          placeholder="Add a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addComment();
          }}
        />

        <Button onClick={addComment} className="mt-2 cursor-pointer ">
          Comment
        </Button>

        <div className="mt-4 space-y-3">
          {comments.map((c) => (
            <div key={c._id} className="border-b pb-3 relative">
              {/* CONTENT / EDIT */}
              {editCommentId === c._id ? (
                <>
                  <Input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="mb-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditSubmit();
                    }}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleEditSubmit(c._id)}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditCommentId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p>{c.content}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(c.createdAt).toLocaleString()}
                  </p>
                </>
              )}

              {/* ELLIPSIS (ONLY OWNER) */}
              {c.owner?.toString() === loggedUserId && (
                <EllipsisVertical
                  className="absolute right-0 top-0 cursor-pointer"
                  onClick={() =>
                    setMenuOpenId(menuOpenId === c._id ? null : c._id)
                  }
                />
              )}

              {/* DROPDOWN */}
              {menuOpenId === c._id && (
                <div className="absolute right-0 top-6 bg-white border shadow-md rounded-md z-10">
                  <button
                    className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                    onClick={() => {
                      setEditCommentId(c._id);
                      setEditContent(c.content);
                      setMenuOpenId(null);
                    }}
                  >
                    Edit
                  </button>

                  <button
                    className="block px-4 py-2 hover:bg-red-100 text-red-600 w-full text-left"
                    onClick={() => deleteComment(c._id)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
