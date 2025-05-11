import React from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logo from '../../assets/Sol-icon.png'
import { FaUserCircle } from 'react-icons/fa'
import { ModeToggle } from './ModeToggle.jsx'
import { AdminDynamiclink } from '@/routes/RouteSource/AdminDynamiclink.js'

import { ChevronRight } from 'lucide-react'
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarSeparator,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
  SidebarRail,
  SidebarTrigger, // ← import the trigger component
} from '@/components/ui/sidebar'

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

export function SidebarNav() {
  const { pathname } = useLocation()
  const { open, toggleSidebar } = useSidebar()
  const sidebarProps = open ? {} : { collapsed: true }

  return (
    <div className="relative flex">
      <Sidebar {...sidebarProps}>
        <SidebarContent>
          <SidebarHeader className="p-4">
            <Link to="/admin">
              <img src={logo} alt="Cafe Logo" className="h-12 mx-auto" />
            </Link>
          </SidebarHeader>
          <SidebarSeparator />

          <SidebarMenu className="list-none space-y-1">
            {AdminDynamiclink
              .filter(({ showInSidebar = true }) => showInSidebar)
              .map(({ title, to, icon: Icon, children }) => {
                const base = `/admin/${to}`
                // use NavLink for exact parent match

                if (children?.length) {
                  return (
                    <Collapsible key={to} defaultOpen>
                      <SidebarMenuItem asChild>
                        <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                          <Icon className="w-5 h-5" />
                          <span className={open ? 'flex-1' : 'sr-only'}>
                            {title}
                          </span>
                          <ChevronRight className="w-4 h-4 transition-transform data-[state=open]:rotate-90" />
                        </CollapsibleTrigger>
                      </SidebarMenuItem>

                      <CollapsibleContent>
                        <SidebarMenu>
                          <SidebarMenuItem asChild>
                            <SidebarMenuButton asChild>
                              <NavLink
                                end
                                to={base}
                                className={({ isActive }) =>
                                  `flex items-center gap-2 pl-8 ${
                                    isActive
                                      ? 'font-semibold text-primary'
                                      : 'text-gray-600 dark:text-gray-400'
                                  }`
                                }
                              >
                                {title}
                              </NavLink>
                            </SidebarMenuButton>
                          </SidebarMenuItem>

                          {children.map(({ to: subTo, title: subTitle }) => {
                            const full = `${base}/${subTo}`
                            // use NavLink for exact child match

                            return (
                              <SidebarMenuItem key={subTo} asChild>
                                <SidebarMenuButton asChild>
                                  <NavLink
                                    to={full}
                                    className={({ isActive }) =>
                                      `block pl-12 ${
                                        isActive
                                          ? 'font-semibold text-primary'
                                          : 'text-gray-600 dark:text-gray-400'
                                      }`
                                    }
                                  >
                                    {subTitle || subTo}
                                  </NavLink>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            )
                          })}
                        </SidebarMenu>
                      </CollapsibleContent>
                    </Collapsible>
                  )
                }

                // single link (no dropdown)
                return (
                  <SidebarMenuItem key={to} asChild>
                    <SidebarMenuButton asChild>
                      <NavLink
                        end
                        to={base}
                        className={({ isActive }) =>
                          `flex items-center gap-2 p-2 ${
                            isActive
                              ? 'font-semibold text-primary'
                              : 'text-gray-600 dark:text-gray-400'
                          }`
                        }
                      >
                        <Icon className="w-5 h-5" />
                        <span>{title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4 border-t dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ModeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                  <FaUserCircle className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={4} align="end">
                <DropdownMenuItem onSelect={() => console.log('Profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => console.log('Log out')}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>

        {/* use the library’s SidebarTrigger (no asChild here) */}
        <SidebarTrigger
          className="absolute top-4 -right-7 z-50 p-2 bg-Transparent "
        >
          {open ? <FiChevronLeft /> : <FiChevronRight />}
        </SidebarTrigger>
      </Sidebar>
    </div>
  )
}