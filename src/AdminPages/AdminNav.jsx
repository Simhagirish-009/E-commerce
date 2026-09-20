import React from "react";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  LayoutGrid,
  ShoppingBag,
  Boxes,
  Users,
  CreditCard,
  ShieldCheck,
  LogOut,
  Settings,
  UserCog,
} from "lucide-react";
import "../App.css";
import axiosInstance from "../apis/axiosInstance";

const links = [
  { to: "/admin-dashboard", label: "Overview", end: true, icon: LayoutGrid },
  { to: "/admin-dashboard/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin-dashboard/products", label: "Products", icon: Boxes },
  { to: "/admin-dashboard/customers", label: "Customers", icon: Users },
  { to: "/admin-dashboard/payments", label: "Payments", icon: CreditCard },
];

const AdminNav = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully.");
    navigate("/login");
  };

  return (
    <Navbar expand="lg" className="navbar-custom shadow-sm py-2" sticky="top">
      <Container fluid>
        {/* Brand */}
        <Navbar.Brand
          href="/admin-dashboard"
          className="brand-logo d-flex align-items-center"
        >
          <ShieldCheck className="me-2 accent-icon" size={28} />
          <span className="fw-bold brand-text">Admin Panel</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="admin-nav-collapse" />

        <Navbar.Collapse id="admin-nav-collapse">
          {/* Navigation Links */}
          <Nav className="mx-auto nav-links-container">
            {links.map(({ to, label, end, icon: Icon }) => (
              <Nav.Link
                key={to}
                as={NavLink}
                to={to}
                end={end}
                className={({ isActive }) =>
                  isActive ? "nav-item-custom active" : "nav-item-custom"
                }
              >
                <Icon size={18} className="me-2" />
                {label}
              </Nav.Link>
            ))}
          </Nav>

          {/* Actions */}
          <Nav className="align-items-center actions-container">
            <NavDropdown
              title={
                <div className="profile-trigger d-inline-flex align-items-center">
                  <UserCog size={22} className="me-1" />
                  <span className="d-lg-none">Admin</span>
                </div>
              }
              id="admin-profile-dropdown"
              align="end"
            >
              <NavDropdown.Header>Admin Account</NavDropdown.Header>

              <NavDropdown.Divider />

              <NavDropdown.Item onClick={handleLogout}>
                <LogOut size={16} className="me-2" /> Log out
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminNav;
