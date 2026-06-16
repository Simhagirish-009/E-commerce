import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function PublicRoute() {
  const token = localStorage.getItem("access_token");

  // If logged in, send them away from login/register/otp
  return token ? <Navigate to="/" replace /> : <Outlet />;
}

export default PublicRoute;
