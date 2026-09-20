import React from "react";
import { Navigate, Outlet } from "react-router-dom";

function AdminRoute() {
  const token = localStorage.getItem("access_token");
  const isAdmin = JSON.parse(localStorage.getItem("is_admin") || "false");

  if (!token) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/" replace />;

  return <Outlet />;
}

export default AdminRoute;
