import React from "react";
import { Outlet } from "react-router-dom";
import AdminNav from "../AdminPages/AdminNav";

const AdminLayout = () => {
  return (
    <>
      <AdminNav />
      <Outlet /> {/* Child routes: AdminDashboard, AdminOrders, ... */}
    </>
  );
};

export default AdminLayout;
