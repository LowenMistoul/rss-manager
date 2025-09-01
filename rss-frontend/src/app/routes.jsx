import { createBrowserRouter } from "react-router-dom";
import Shell from "./Shell";
import Login from "../pages/Login";
import Home from "../pages/Home";
import ProtectedRoute from "../components/ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <ProtectedRoute />,   
    children: [
      {
        path: "/",
        element: <Shell />,        
        children: [
          { index: true, element: <Home /> },
        ],
      },
    ],
  },
]);
