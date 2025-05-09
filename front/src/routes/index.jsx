import React from "react";
import { Outlet } from "react-router-dom";
import Coffee from "../pages/kiosk/Menu/Coffee.jsx";
import Tea from "../pages/kiosk/Menu/Tea.jsx";
import Milk from "../pages/kiosk/Menu/Milk.jsx";
import Others from "../pages/kiosk/Menu/Others.jsx";
import Bakery from "../pages/kiosk/Menu/Bakery.jsx";
import Cake from "../pages/kiosk/Menu/Cake.jsx";
import MenuPage from "../pages/kiosk/MenuPage.jsx"

const MenuLayout = () => <Outlet />;

export const IndexRoutes = {
  path: "/Menu",
  element: <MenuLayout />, 
  children: [
    { index: true, element: <MenuPage /> }, 
    { path: "Coffee", element: <Coffee /> },
    { path: "Milk", element: <Milk /> },
    { path: "Tea", element: <Tea /> },
    { path: "Others", element: <Others /> },
    { path: "Cake", element: <Cake /> },
    { path: "Bakery", element: <Bakery /> },
  ],
};
