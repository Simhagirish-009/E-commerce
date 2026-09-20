import React, { useEffect, useState } from "react";
import { getCustomerData } from "../apis/product_apis";

import {
  Navbar,
  Nav,
  Container,
  NavDropdown,
  Badge,
  Form,
  Button,
  Modal,
  FormControl,
} from "react-bootstrap";
import {
  ShoppingCart,
  User,
  Package,
  LayoutGrid,
  LogOut,
  ShoppingBag,
  Search,
  Bell,
} from "lucide-react";
import axiosInstance from "../apis/axiosInstance";

import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const [search, setSearch] = useState("");
    const [showModal, setShowModal] = useState(false);
  
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      const access_token = localStorage.getItem("access_token");
      if (!access_token) {
        window.location.href = "/login";
        return;
      }

      try {
        const response = await axiosInstance.get(
          "https://e-commerce-zhu2.onrender.com/api/count-cart/",
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
            },
          },
        );

        setCartCount(response.data.cart_count);
      } catch (err) {
        setError("Failed to fetch cart count");
        console.error(err);
      }
    };

    fetchCart();
  }, []);
  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await getCustomerData();
        const complete = response.data.is_complete;

        if (!complete) {
          setShowModal(true);
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };

    fetchCustomerData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();

    if (!search.trim()) return;

    navigate(`/search?q=${search}`);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };
  return (
    <Navbar expand="lg" className="navbar-custom shadow-sm py-2" sticky="top">
      <Modal show={showModal} backdrop="static" keyboard={false} centered>
        <Modal.Header>
          <Modal.Title>Complete Your Profile</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Please complete your profile to continue using the dashboard.
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => (window.location.href = "/complete-profile")}
          >
            Go to Profile
          </Button>
        </Modal.Footer>
      </Modal>
      <Container>
        {/* Brand */}
        <Navbar.Brand href="/" className="brand-logo d-flex align-items-center">
          <ShoppingBag className="me-2 accent-icon" size={28} />
          <span className="fw-bold brand-text">Shoppy Online</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="dashboard-navbar" />

        <Navbar.Collapse id="dashboard-navbar">
          {/* Navigation Links */}
          <Nav className="mx-auto nav-links-container">
            <Nav.Link href="/" className="nav-item-custom">
              <LayoutGrid size={18} className="me-2" /> Products
            </Nav.Link>

            <Nav.Link href="/orders" className="nav-item-custom">
              <ShoppingBag size={18} className="me-2" /> Orders
            </Nav.Link>

            <Nav.Link href="/paymenthistory" className="nav-item-custom">
              <Package size={18} className="me-2" /> Payment History
            </Nav.Link>

            <Nav.Link href="/notifications" className="nav-item-custom">
              <Bell size={18} className="me-2" /> Notifications
            </Nav.Link>
          </Nav>

          {/* Search Bar */}
          <Form className="d-flex me-lg-4 search-bar" onSubmit={handleSearch}>
            <FormControl
              type="search"
              placeholder="Search products..."
              className="me-2"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Button type="submit" variant="warning">
              <Search size={18} />
            </Button>
          </Form>

          {/* Actions */}
          <Nav className="align-items-center actions-container">
            <Nav.Link
              href="/cart"
              className="position-relative me-lg-4 cart-icon"
            >
              <ShoppingCart size={22} />
              <Badge
                pill
                className="cart-badge position-absolute top-0 start-100 translate-middle"
              >
                {cartCount}
              </Badge>
            </Nav.Link>

            <NavDropdown
              title={
                <div className="profile-trigger d-inline-flex align-items-center">
                  <User size={22} className="me-1" />
                  <span className="d-lg-none">Account</span>
                </div>
              }
              id="profile-dropdown"
              align="end"
            >
              <NavDropdown.Header>Manage Account</NavDropdown.Header>

              <NavDropdown.Item href="/update-profile">
                <User size={16} className="me-2" /> My Profile
              </NavDropdown.Item>

              <NavDropdown.Divider />

              <NavDropdown.Item onClick={handleLogout}>
                <LogOut size={16} className="me-2" /> Logout
              </NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
