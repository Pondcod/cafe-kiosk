import React from "react";
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Chip,
} from "@material-tailwind/react";
import ColorPalette from "./ColorPalette";
import logo from "../assets/Sol-icon.png";
import {
  PresentationChartBarIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  InboxIcon,
  PowerIcon,
} from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

export function SideBar() {
  const navigate = useNavigate();

  return (
    <Card
      className="h-full w-full max-w-[22.5%] mx-auto p-4 shadow-xl shadow-blue-gray-900/5 rounded-tr-[3rem]"
      style={{ backgroundColor: ColorPalette.beige_cus_1 }}
    >
      <div>
        <img
          src={logo}
          alt="Logo"
          className="rounded-4xl w-75% h-auto mx-auto opacity-95"
        />
      </div>
      <List className="mx-auto">
        <ListItem
          className="mt-5 text-3xl cursor-pointer p-4 rounded-lg hover:bg-gray-200"
          onClick={() => navigate("/Menu")}
        >
          Home
        </ListItem>
        <ListItem
          className="mt-5 text-3xl cursor-pointer p-4 rounded-lg hover:bg-gray-200"
          onClick={() => navigate("/Menu/Coffee")}
        >
          Coffee
        </ListItem>
        <ListItem
          className="mt-5 text-3xl cursor-pointer p-4 rounded-lg hover:bg-gray-200"
          onClick={() => navigate("/Menu/Tea")}
        >
          Tea
        </ListItem>
        <ListItem
          className="mt-5 text-3xl cursor-pointer p-4 rounded-lg hover:bg-gray-200"
          onClick={() => navigate("/Menu/Milk")}
        >
          Milk
        </ListItem>
        <ListItem
          className="mt-5 text-3xl cursor-pointer p-4 rounded-lg hover:bg-gray-200"
          onClick={() => navigate("/Menu/Others")}
        >
          Others
        </ListItem>
        <ListItem
          className="mt-5 text-3xl cursor-pointer p-4 rounded-lg hover:bg-gray-200"
          onClick={() => navigate("/Menu/Bakery")}
        >
          Bakery
        </ListItem>
        <ListItem
          className="mt-5 text-3xl cursor-pointer p-4 rounded-lg hover:bg-gray-200"
          onClick={() => navigate("/Menu/Cake")}
        >
          Cake
        </ListItem>
      </List>
    </Card>
  );
}