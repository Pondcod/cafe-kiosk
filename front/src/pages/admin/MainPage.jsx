import React from 'react'
import { Outlet } from 'react-router-dom'
import { SidebarNav } from '../../component/admin/SidebarNav.jsx'
import { SidebarProvider } from '@/components/ui/sidebar'

const MainPage = () => (
  <SidebarProvider>
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900">
      <SidebarNav />
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  </SidebarProvider>
)

export default MainPage