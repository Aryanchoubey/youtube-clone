import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import GoogleLogin from "@/component/GoogleLogin";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/users/login`,
        {
          username: form.identifier,
          email: form.identifier,
          password: form.password,
        },
        {
          withCredentials: true,
        }
      );

      console.log(res.data);

      if (res.data.success) {
        localStorage.setItem(
          "token",
          res.data.data.accessToken
        );

        localStorage.setItem(
          "username",
          res.data.data.username
        );

        localStorage.setItem(
          "refresh",
          res.data.data.refreshToken
        );

        localStorage.setItem(
          "userId",
          res.data.data._id
        );

        if (res.data.data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(res.data.data.user)
          );
        }

        navigate("/");
      }
    } catch (err) {
      console.log(
        "Login Error:",
        err.response?.data || err
      );

      alert(
        err.response?.data?.message ||
        "Invalid username/email or password"
      );
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 shadow-xl rounded-xl w-full max-w-md space-y-4"
      >
        <h1 className="text-2xl font-bold text-center">
          Login
        </h1>

        {/* Normal Login */}

        <Input
          name="identifier"
          placeholder="Email or Username"
          value={form.identifier}
          onChange={handleChange}
        />

        <Input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <Button
          type="submit"
          className="w-full"
        >
          Login
        </Button>

        {/* Divider */}

        <div className="flex items-center gap-3">
          <div className="h-px bg-gray-300 flex-1" />

          <span className="text-sm text-gray-500">
            OR
          </span>

          <div className="h-px bg-gray-300 flex-1" />
        </div>

        {/* Google Login */}

        <GoogleLogin
          onSuccess={() => {
            navigate("/");
          }}
        />

        {/* Register */}

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => navigate("/register")}
        >
          Create an Account{" "}
          <span className="text-red-500 ml-1">
            Register
          </span>
        </Button>
      </form>
    </div>
  );
}

export default Login;