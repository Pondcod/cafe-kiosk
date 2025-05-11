import React from "react";
import { Card, List } from "@material-tailwind/react";
import ColorPalette from "./ColorPalette";
import logo from "../../assets/Sol-icon.png";
import { useNavigate, NavLink } from "react-router-dom";

export function SideBar({ className = "" }) {
  const navigate = useNavigate();

  const tabs = [
    { label: "Coffee", path: "/Menu/Coffee" },
    { label: "Tea",    path: "/Menu/Tea"    },
    { label: "Milk",   path: "/Menu/Milk"   },
    { label: "Others", path: "/Menu/Others" },
    { label: "Bakery", path: "/Menu/Bakery" },
    { label: "Cake",   path: "/Menu/Cake"   },
  ];

  return (
    <Card
      className={`h-full w-full max-w-[22.5%] mx-auto shadow-xl rounded-tr-[3rem] ${className}`}
      style={{ backgroundColor: ColorPalette.beige_cus_1 }}
    >
      <div>
        <img
          src={logo}
          alt="Logo"
          className="w-9/10 mx-auto cursor-pointer opacity-95"
          onClick={() => navigate("/Menu")}
        />
      </div>
      <List className="mx-start">
      {tabs.map(({ label, path }) => (
  <NavLink
    key={path}
    to={path}
    className={({ isActive }) =>
      `mt-5 block text-[1.8rem] font-medium cursor-pointer pl-3 py-4 rounded-r-[2rem] hover:bg-gray-200 ` +
      (isActive ? "text-gray-700 font-bold opacity-100" : "text-black opacity-100")
    }
    style={({ isActive }) => ({
      backgroundColor: isActive ? ColorPalette.orange_cus_1 : undefined,
    })}
  >
    {label}
  </NavLink>
))}
      </List>
    </Card>
  );
}