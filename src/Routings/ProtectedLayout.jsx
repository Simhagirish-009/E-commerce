import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Pages/NavBar"; // your Navbar component

const ProtectedLayout = () => {
  return (
    <>
      <Navbar /> {/* Common Navbar only for protected pages */}
      <Outlet /> {/* Child routes like Dashboard, ContextPage */}
    </>
  );
};

export default ProtectedLayout;
