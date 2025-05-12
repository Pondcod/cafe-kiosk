import Dashboard from '../../pages/admin/Dashboard.jsx'
import Users from '../../pages/admin/UserManagement/Users.jsx'
import Products from '../../pages/admin/Products.jsx'
import Categories from '../../pages/admin/Categories.jsx'
import Inventory from '../../pages/admin/Inventory.jsx'
import Orders from '../../pages/admin/Orders.jsx'
import Promotions from '../../pages/admin/Promotions.jsx'
import LoginForm from "@/pages/admin/UserManagement/LoginForm.jsx"; 

import {
  FiGrid,
  FiUsers,
  FiBox,
  FiShoppingCart,
  FiTag,
} from 'react-icons/fi'

export const AdminDynamiclink = [
  {
    title: 'Dashboard',
    to: 'dashboard',
    icon: FiGrid,
    component: Dashboard,
    showInSidebar: false,
  },
  {
    title: 'User Management',
    to: 'users',
    icon: FiUsers,
    component: Users,
  },
  {
    title: 'Products',
    to: 'products',
    icon: FiBox,
    component: Products,
  },
  {
    title: 'Categories',
    to: 'categories',
    icon: FiTag,
    component: Categories,
  },
  {
    title: 'Inventory',
    to: 'inventory',
    icon: FiShoppingCart,
    component: Inventory,
  },
  {
    title: 'Orders',
    to: 'orders',
    icon: FiShoppingCart,
    component: Orders,
  },
  {
    title: 'Promotions',
    to: 'promotions',
    icon: FiTag,
    component: Promotions,
  },
]


