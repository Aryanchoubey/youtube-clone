"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";


export default function VideoUpload() {
  const [form, setForm] = useState({
    title: "",
    description: "",
  });

  const getCurrentUser = async ()=>{
   try {
    const token = localStorage.getItem("token");
    if(!token) return null;
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/current-user`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setUserData(res.data.data)
    console.log("current user:", res.data.data._id);
   } catch (error) {
    
   }
  }

  useEffect(()=>{
    getCurrentUser()
  },[])
  const [videoFile, setVideoFile] = useState(null);
  const [userData , setUserData] = useState();
  const [thumbnail, setThumbnail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate()
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleUpload = async () => {
 
    if (!form.title || !videoFile || !thumbnail) {
      return setMessage("All fields are required!");
    }

    setLoading(true);
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        // redirect if no token
        setLoading(false);
        return;
      }

      const data = new FormData();
      data.append("title", form.title);
      data.append("description", form.description);
      data.append("videoFile", videoFile);
      data.append("thumbnail", thumbnail);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/videos`,
        data,
        {
          headers: {
             Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
            // <-- send token
          },
        }
      );

      setMessage("Video uploaded successfully!");
      console.log(res.data);
    } catch (error) {
      console.log(error);
      setMessage("Upload failed!");
    }

    setLoading(false);
  };
   const handleNavigation = (path) => {
    navigate(`/${path}`);
   
  };

  return (
    <div className="flex justify-center py-10 px-4">
      <Card className="w-full max-w-xl p-5 rounded-2xl shadow-lg">
        <CardContent className="space-y-4">
         <div className="flex gap-10">
          <Button onClick={() => handleNavigation(`channel/${userData?._id}/stats`)}>

            <ArrowLeft />
            Back</Button>
           <h1 className="text-2xl font-bold text-center">Upload Video</h1>
         </div>
          <div className="flex flex-col gap-6">
            <Input
              name="title"
              placeholder="Enter video title"
              value={form.title}
              onChange={handleChange}
            />

            <Textarea
              name="description"
              placeholder="Enter video description"
              value={form.description}
              onChange={handleChange}
            />

            <div>
              <label className="font-semibold">Select Video</label>
              <Input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
              />
            </div>

            <div>
              <label className="font-semibold">Select Thumbnail</label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnail(e.target.files[0])}
              />
            </div>

            <Button
              className="w-full"
              onClick={handleUpload}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Upload Video"
              )}
            </Button>

            {message && (
              <p className="text-center font-semibold text-blue-600">
                {message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
