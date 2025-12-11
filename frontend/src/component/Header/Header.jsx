import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, Search, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Header({ isSidebarOpen, setIsSidebarOpen }) {
  const navigate = useNavigate();
   
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check login on component mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);   // Convert to true/false
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  };

  return (
    <header className="w-full bg-white shadow-sm p-4 pb-3 flex items-center justify-between gap-4 fixed top-0 left-0 z-50">

      {/* Left */}
    {/* SHOW ONLY IF USER IS LOGGED IN */}
{isLoggedIn && (
  <>
    {/* LEFT SIDE - Logo + Sidebar Button */}
    <div className="flex items-center gap-3">
      {!isSidebarOpen && (
        <Button
          variant="ghost"
          className="cursor-pointer"
          onClick={() => setIsSidebarOpen(true)}
        >
          <Menu />
        </Button>
      )}
      <h1 className="text-xl font-bold">MyTube</h1>
    </div>

    {/* MIDDLE - Search Bar */}
    <div className="flex items-center gap-2 max-w-xl w-full mx-4">
      <Input placeholder="Search" className="rounded-xl" />
      <Button className="rounded-xl p-2">
        <Search className="w-5 h-5" />
      </Button>
     
    </div>
     <Button variant="ghost" className="p-2 rounded-full">
          <Video />
        </Button>
  </>
)}

      {/* Right - Login / Register */}
     { !isLoggedIn && (
      <>
       <div className="flex items-center gap-2">

        {/* Upload Button (Optional) */}
        

        {/* Login Button */}
        <Button
          className="rounded-xl px-4"
          variant="outline"
          onClick={() => navigate("/login")}
        >
          Login
        </Button>

        {/* Register Button */}
        <Button
          className="rounded-xl px-4"
          onClick={() => navigate("/register")}
        >
          Register
        </Button>
      </div>
      </>
     )

     }
    </header>
  );
}

export default Header;
