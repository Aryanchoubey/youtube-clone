import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { EllipsisVertical, ThumbsUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function WatchVideos() {
  const { id } = useParams();
  const { state: video } = useLocation();
  const navigate = useNavigate();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [deletecmt, setDeletecmt] = useState(null);
  const [form, setForm] = useState({ content: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNavigation = () => {
    navigate(`/channel/${video?.owner._id}`);
  };

  /* LIKE STATUS */
  const fetchLikeStatus = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/v1/likes/status/v/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(res.data.data.liked);
    } catch (err) {
      console.log("Like status error:", err);
    }
  };

  /* LIKE COUNT */
  const fetchLikeCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/v1/likes/count/v/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLikeCount(res.data.data.count);
    } catch (err) {
      console.log("Like count error:", err);
    }
  };

  /* LIKE TOGGLE */
  const toggleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:5000/api/v1/likes/toggle/v/${id}`,
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

  /* ADD COMMENT */
  const addComment = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.post(
        `http://localhost:5000/api/v1/comments/${id}`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("add comment :", res.data.data);

      setForm({ content: "" });
      loadComments(); // refresh comments after adding

    } catch (error) {
      console.log("add comments error:", error);
    }
  };

  /* LOAD COMMENTS */
  const loadComments = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/v1/comments/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setComments(res.data?.data[0]?.comments || []);
    } catch (error) {
      console.log("COMMENTS ERROR:", error);
    }
  };

  /* INITIAL LOAD */
  useEffect(() => {
    fetchLikeStatus();
    fetchLikeCount();
    loadComments();
  }, [id]);

  /* DELETE COMMENT */
  const deleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.delete(
        `http://localhost:5000/api/v1/comments/c/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("Delete comment response:", res.data);

      setDeletecmt(null);

      setComments((prev) =>
        prev.filter((item) => item._id !== commentId)
      );

    } catch (error) {
      console.log("Delete comment error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8 font-bold">
      <Card className="max-w-4xl w-full mx-auto shadow-lg rounded-2xl overflow-hidden">
        
        {/* Video */}
        <div className="w-full h-[230px] sm:h-[300px] md:h-[450px] bg-black">
          <video
            className="w-full h-full object-cover"
            controls
            preload="metadata"
            autoPlay
          >
            <source src={video?.videoFile} type="video/mp4" />
          </video>
        </div>

        {/* Title + Description */}
        <div className="w-full p-5 flex flex-col gap-4">
          <h1 className="text-xl sm:text-2xl text-gray-800">{video?.title}</h1>

          <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
            {video?.description || "No description available."}
          </p>

          {/* Username + Like Button */}
          <div className="flex items-center gap-4 justify-start">
            
            {/* Avatar */}
            <div
              onClick={handleNavigation}
              className="cursor-pointer px-2 py-2 bg-gray-200 rounded-full 
                       hover:bg-gray-300 active:scale-95 transition-all text-sm 
                       shadow-sm"
            >
              <img
                src={video.owner.avatar}
                alt=""
                className="w-8 h-8 rounded-full object-cover"
              />
            </div>

            {/* Like Button */}
            <div
              onClick={toggleLike}
              className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full shadow-sm 
                active:scale-95 transition-all
                ${
                  liked
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-200 text-gray-700"
                }
              `}
            >
              <ThumbsUp
                className="w-6 h-6"
                color={liked ? "#1e3a8a" : "#4b5563"}
                fill={liked ? "#1e3a8a" : "none"}
              />
              <span className="text-sm">{likeCount} Likes</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Comments */}
      <div className="max-w-4xl mx-auto mt-6 p-4 bg-white rounded-xl shadow">
        <h1 className="text-lg mb-3">Comments</h1>

        <Input
          name="content"
          placeholder="Add a comment..."
          value={form.content}
          onChange={handleChange}
          className="mb-3"
        />

        <Button onClick={addComment} className="bg-amber-600">Add</Button>

        <Card className="w-full mt-4 p-4 rounded-xl shadow-sm">
          <CardTitle className="pb-3 text-gray-800">All Comments</CardTitle>

          {comments.length > 0 ? (
            comments.map((c) => (
              <div key={c._id} className="p-3 border-b last:border-none">
                <p className="text-gray-800">{c.content}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(c.createdAt).toLocaleString()}
                </p>

                <div className="flex justify-end">
                  <EllipsisVertical
                    onClick={() =>
                      setDeletecmt(deletecmt === c._id ? null : c._id)
                    }
                    className="cursor-pointer"
                  />

                  {deletecmt === c._id && (
                    <button
                      onClick={() => deleteComment(c._id)}
                      className="text-red-600 hover:bg-red-100 px-2 py-1 rounded-md ml-2"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No comments yet.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
