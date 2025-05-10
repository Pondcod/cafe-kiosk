import React, { useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { CartProvider } from './Context/CartContext.jsx';
import IdleGuard from './component/IdleTimer/IdleGuard.jsx';

import Welcome    from './pages/kiosk/welcome.jsx';
import OptionDine from './pages/kiosk/OptionDine.jsx';
import Summary    from './pages/kiosk/Summary.jsx';
import Checkout   from './pages/kiosk/Checkout.jsx';
import { IndexRoutes } from './routes/index.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Welcome />,
  },
  {
    // all non-“/” routes run inside IdleGuard
    element: <IdleGuard><Outlet/></IdleGuard>,
    children: [
      { path: 'OptionDine', element: <OptionDine/> },
      { path: 'Summary',    element: <Summary/> },
      { path: 'Checkout',   element: <Checkout/> },
      // include the /Menu/* routes
      IndexRoutes
    ]
  }
]);

export default function App() {
  useEffect(() => {
    axios.get('http://localhost:8080/api').then(res => console.log(res.data.fruits));
  }, []);

  return (
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>
  );
}

