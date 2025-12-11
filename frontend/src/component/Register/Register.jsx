import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  // ---- Form State ----
  const [form, setForm] = useState({
    username: "",
    fullname: "",
    email: "",
    password: "",
  });

  // ---- File State ----
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);

  // TEXT INPUT CHANGE HANDLER
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // FILE INPUT CHANGE
  const handleFileChange = (e) => {
    if (e.target.name === "avatar") {
      setAvatar(e.target.files[0]);
    } else if (e.target.name === "coverImage") {
      setCoverImage(e.target.files[0]);
    }
  };

  // SUBMIT HANDLER
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("username", form.username);
    fd.append("fullname", form.fullname);
    fd.append("email", form.email);
    fd.append("password", form.password);
    fd.append("avatar", avatar);
    fd.append("coverImage", coverImage);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/register`,
        fd,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log(res.data);

      // Go to login page after success
      navigate("/login");
    } catch (error) {
      console.log("Register Error:", error);
      alert("Registration Failed");
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 shadow-xl rounded-xl w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">Register</h1>

        <Input name="username" placeholder="Username" value={form.username} onChange={handleChange} />

        <Input name="fullname" placeholder="Full Name" value={form.fullname} onChange={handleChange} />

        <Input name="email" placeholder="Email" value={form.email} onChange={handleChange} />

        <Input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} />

        <div>
          <label className="text-sm font-medium">Avatar</label>
          <Input type="file" name="avatar" onChange={handleFileChange} />
        </div>

        <div>
          <label className="text-sm font-medium">Cover Image</label>
          <Input type="file" name="coverImage" onChange={handleFileChange} />
        </div>

        <Button type="submit" className="w-full cursor-pointer">
          Register
        </Button>

        {/* 🔵 Login Button Added */}
        <Button
          type="button"
          variant="outline"
          
          className="w-full cursor-pointer "
          onClick={() => navigate("/login")}
        >
          Already have an account? <span style={{color:"red"}}>Login</span>
        </Button>
      </form>
    </div>
  );
}

export default Register;
