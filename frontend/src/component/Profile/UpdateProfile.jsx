"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdateProfile() {
  const [form, setForm] = useState({
    fullname: "",
    email: "",
  });
  const { userId } = useParams();

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const navigate= useNavigate()
  console.log(userId);
  

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMsg("");

    try {
      const token = localStorage.getItem("token");

      const res = await axios.patch(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/update-account`,
        form,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMsg("Profile updated successfully!");
      navigate (`/c/${userId}`)
    } catch (error) {
      setMsg("Error updating profile!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Load existing user data when page opens
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/current-user`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = res.data?.data;
        console.log(data);
        

        setForm({
          fullname: data?.fullname || "",
          email: data?.email || "",
        });
      } catch (error) {
        console.log(error);
      }
    };

    fetchProfile();
  }, []);
  

  return (
    <div className="w-full flex justify-center mt-10 px-4">
      <Card className="w-full max-w-md shadow-lg border rounded-xl">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Update Profile
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-semibold">Full Name</label>
            <Input
              name="fullname"
              value={form.fullname}
              onChange={handleChange}
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Email</label>
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
          </div>

          <Button
            className="w-full mt-2"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Profile"}
          </Button>

          {msg && (
            <p className="text-center text-sm font-medium text-green-600">
              {msg}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
