import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarNav } from "../../component/admin/SidebarNav.jsx";
import { SidebarProvider } from "@/components/ui/sidebar";
import Notification from "../../component/admin/Notification.jsx";

const MainPage = () => (
  <SidebarProvider>
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900">
      <SidebarNav />
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
      {/* Floating Notification Bell */}
      <div className="fixed top-4 right-4 z-50">
        <Notification />
      </div>
    </div>
  </SidebarProvider>
);

export default MainPage;
