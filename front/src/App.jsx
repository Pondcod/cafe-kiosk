import { useEffect, useState } from 'react';
import react from 'react';
import './App.css';
import axios from "axios";
import Welcome from './pages/kiosk/welcome.jsx';
import OptionDine from './pages/kiosk/OptionDine.jsx';
import {createBrowserRouter, RouterProvider} from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Welcome />,
  },
  {
    path: "/OptionDine",
    element: <OptionDine />,
  },
]);

function App() {
  const [count, setCount] = useState(0)
  
  const fetchAPI = async () =>{
    const response = await axios.get("http://localhost:8080/api")
    console.log(response.data.fruits)
  }
  useEffect(() =>{
    fetchAPI();
  }, [])
  return (
    <RouterProvider router={router} />
  );
}

export default App
