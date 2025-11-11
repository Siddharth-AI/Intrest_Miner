import { Outlet } from "react-router-dom";
import UserHeader from "./UserHeader";
import { Footer } from "./Footer";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { AuthFooter } from "./AuthFooter";
export default function AuthLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Fixed, full height */}
      <UserHeader
        onMenuClick={toggleSidebar}
        sidebarOpen={sidebarOpen}
        onCollapseClick={toggleSidebarCollapse}
        sidebarCollapsed={sidebarCollapsed}
      />

      <Sidebar
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
        isCollapsed={sidebarCollapsed}
      />
      <div className="app-scale-wrapper">
        {/* Main content area that adjusts to sidebar */}

        {/* Header - Adjusts width based on sidebar */}

        {/* Main content - Scrollable with proper top padding */}
        <main
          className={`transition-all duration-300 ${
            sidebarCollapsed ? "sm:ml-20" : "sm:ml-80"
          } pt-16`}>
          <div className="dark:bg-gray-900">
            <Outlet />
          </div>
          <AuthFooter />
        </main>
      </div>
    </div>
  );
}
