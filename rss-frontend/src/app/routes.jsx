import { createBrowserRouter } from "react-router-dom";
import Shell from "./Shell";
import Login from "../pages/Login";
import Home from "../pages/Home";
import Collections from "../pages/Collections";
import CollectionDetail from "../pages/CollectionDetail";
import Articles from "../pages/Articles";
import ProtectedRoute from "../components/ProtectedRoute";
import OauthSuccess from "../pages/OauthSuccess";


export const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  { path: "/oauth-success", element: < OauthSuccess />}, 
  {
    path: "/",               
    element: <ProtectedRoute />,  
    children: [
      {
        element: <Shell />,  
        children: [
          { index: true, element: <Home /> },         
          { path: "collections", element: <Collections /> }, 
          { path: "collections/:collectionId", element: <CollectionDetail /> },
          { path: "collections/:collectionId/articles", element: <Articles /> },
        ],
      },
    ],
  },
]);
