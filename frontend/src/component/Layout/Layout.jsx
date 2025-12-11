import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../SideBar/SideBar";
import { useState } from "react";
import Header from "../Header/Header";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const location = useLocation();

  // Routes where header/sidebar should NOT show
  const hideLayoutRoutes = ["/login", "/register"];

  const shouldHideLayout = hideLayoutRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen w-full">

      {/* Show Header only if not login/register */}
      {!shouldHideLayout && (
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      )}

      {/* Show Sidebar & Main Content */}
      <div className="flex flex-1 w-full">

        {/* Sidebar (hide on login/register) */}
        {!shouldHideLayout && (
          <aside className="w-fit bg-muted shadow-md mt-16">
            <Sidebar
              isSidebarOpen={isSidebarOpen}
              setIsSidebarOpen={setIsSidebarOpen}
            />
          </aside>
        )}

        {/* Page Content */}
        <main
          className={`flex-1 p-3 bg-background overflow-y-auto ${
            !shouldHideLayout ? "mt-16" : ""
          }`}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}


