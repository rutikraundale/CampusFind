import { lazy } from "react";
import ProtectedRoutes from "../components/ProtectedRoutes";

const Home = lazy(() => import("../pages/Home"));
const Contact = lazy(() => import("../pages/contact"));
const SearchItems = lazy(() => import("../pages/SearchItem"));
const Signin = lazy(() => import("../pages/Signin"));
const Signup = lazy(() => import("../pages/Signup"));
const ItemDetail = lazy(() => import("../pages/ItemDetail"));
const PostItem = lazy(() => import("../pages/PostItem"));
const ClaimItem = lazy(() => import("../pages/Claimitem"));

export const routes = [
  { path: "/", element: <Home /> },
  { path: "/contact", element: <Contact /> },
  { path: "/browse", element: <SearchItems /> },
  { path: "/signin", element: <Signin /> },
  { path: "/signup", element: <Signup /> },
  {path:"/claim",element:<ClaimItem/>},
  { path:"/items/:id", element: <ItemDetail /> },
  {
    path: "/postitem",
    element: (
      <ProtectedRoutes>
        <PostItem />
      </ProtectedRoutes>
    ),
  },
  { path: "/claim", element: <ClaimItem /> },
];