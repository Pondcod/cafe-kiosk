import React from 'react'
import { ThemeProvider } from '../component/admin/ThemeProvider.jsx'
import MainPage from '../pages/admin/MainPage.jsx'
import Dashboard from '../pages/admin/Dashboard.jsx'
import LoginForm from '../pages/admin/UserManagement/LoginForm.jsx'
import { AdminDynamiclink } from './RouteSource/AdminDynamiclink.js'// adjust path if needed


export const AdminRoutes = {
  path: '/admin',
  element: (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <MainPage />
    </ThemeProvider>
  ),
  children: [
    { index: true, element: <Dashboard/> },

    ...AdminDynamiclink.map(({ to, component: Comp, children }) => ({
      path: to,
      element: <Comp />,
      children: children?.map(({ to: sub, component: Sub }) => ({
        path: sub,
        element: <Sub />,
      })),
    })),
  ],
}