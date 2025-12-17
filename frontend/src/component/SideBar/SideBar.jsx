"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { X, ChevronDown, ChevronRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Overlay } from "../Overlay/Overlay";
import { useIsMobile } from "@/hooks/use-mobile";
import axios from "axios";

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen }) {
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState();
  const _id = userData?._id;
  const pathname = location.pathname
  const isMobile = useIsMobile();
  const handleProfileClick = () => {
    const userId = localStorage.getItem("userId"); 
    console.log(_id);
    // get logged-in username
    if (_id) {
      navigate(`/c/${_id}`); // go to /c/:username
      setIsSidebarOpen(false);
    } else {
      navigate("/login")
    }
  };
  // console.log("Sidebar username:", localStorage.getItem("username"));
  const getUserData = async()=>{
    
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/users/current-user`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (res.data && res.data.data) {
    setUserData(res.data.data);
    console.log("user data:", res.data.data);
  } else {
    // console.log("Unexpected response:", res);
        
  }
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(()=>{
    getUserData()
  },[])


  const handleNavigation = (path) => {
    navigate(`/${path}`);
    setIsSidebarOpen(false);
  };

  return (
    <>
      <aside
        className={`fixed lg: top-16 left-0 h-full bg-[#0f1a3c] text-white transition-all duration-300 overflow-y-auto z-9999 
  ${isSidebarOpen ? "w-64" : "w-0 lg:w-0"}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4">
          {isSidebarOpen && <span className="font-semibold text-lg">Menu</span>}
          {isSidebarOpen && (
            <Button
              variant="ghost"
              size="icon"
              className="text-white"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          )}
        </div>

        <hr className="border-gray-600" />

        {/* Menu Items */}
        {isSidebarOpen && (
          <nav className="mt-4 space-y-4 px-4">
            {/* Super Admin + My School */}
            <div className="space-y-3">
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  pathname.includes("home")
                    ? "bg-primary text-white"
                    : "hover:bg-primary hover:text-white"
                }`}
                onClick={() => handleNavigation("")}
              >
               Home
              </Button>
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  pathname.includes("channel")
                    ? "bg-primary text-white"
                    : "hover:bg-primary hover:text-white"
                }`}
                onClick={() => handleNavigation(`channel/${_id}`)}
              >
                Channel
              </Button>

              <Button
                onClick={() => handleNavigation("history")}
                variant="ghost"
                className={`w-full justify-start ${
                  pathname.includes("history")
                    ? "bg-primary text-white"
                    : "hover:bg-primary hover:text-white"
                }`}
              >
                Watch History
              </Button>
            </div>

            {/* Accordion */}
            <div className="space-y-3">
              <Button
                onClick={() => handleNavigation(`liked/${_id}`)}
                variant="ghost"
                className={`w-full justify-start ${
                  pathname.includes("liked")
                    ? "bg-primary text-white"
                    : "hover:bg-primary hover:text-white"
                }`}
              >
                Liked Videos
              </Button>
              <div className="space-y-3">
                <Button
                  onClick={() => handleNavigation("")}
                  variant="ghost"
                  className={`w-full justify-start ${
                    pathname.includes("collections")
                      ? "bg-primary text-white"
                      : "hover:bg-primary hover:text-white"
                  }`}
                >
                  Collections
                </Button>
              </div>
              <div>
                <Button
                  onClick={handleProfileClick}
                  variant="ghost"
                  className={`w-full justify-start ${
                    pathname.includes("profile")
                      ? "bg-primary text-white"
                      : "hover:bg-primary hover:text-white"
                  }`}
                >
                  Profile
                </Button>
              </div>
            </div>
          </nav>
        )}
      </aside>
      {isMobile && (
        <Overlay
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}
    </>
  );
}
