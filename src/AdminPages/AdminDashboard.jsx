import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import axios from "axios";
import axiosInstance from "../apis/axiosInstance";
import "../App.css";

// Base URL for API calls — adjust to match your existing apis/ config if you
// centralize it elsewhere (e.g. apis/axiosInstance.js).
const API_BASE = "https://e-commerce-zhu2.onrender.com/api";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
});

const STATUS_VARIANT = {
  Pending: "secondary",
  Accepted: "info",
  Packed: "primary",
  "On The Way": "warning",
  Delivered: "success",
  Cancel: "danger",
};

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [payments, setPayments] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      try {
        const [ordersRes, paymentsRes, productsRes] = await Promise.all([
          axiosInstance.get(`${API_BASE}/admin/orders/`, authHeaders()),
          axiosInstance.get(`${API_BASE}/admin/payments/`, authHeaders()),
          axiosInstance.get(`${API_BASE}/products-by-category/`, authHeaders()),
        ]);
        setOrders(ordersRes.data);
        setPayments(paymentsRes.data);
        setProducts(productsRes.data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Could not load dashboard data. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalRevenue = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0,
  );
  const deliveredRevenue = orders
    .filter((o) => o.status === "Delivered")
    .reduce((sum, o) => sum + Number(o.total_cost || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.ordered_date) - new Date(a.ordered_date))
    .slice(0, 8);

  const stats = [
    { label: "Total Orders", value: orders.length },
    { label: "Pending Orders", value: pendingOrders },
    { label: "Products Listed", value: products.length },
    {
      label: "Revenue (Delivered / Total)",
      value: `₹${deliveredRevenue.toFixed(2)} / ₹${totalRevenue.toFixed(2)}`,
    },
  ];

  return (
    <Container fluid className="py-4 px-4">
      <h3 className="mb-4">Dashboard overview</h3>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <Row className="g-3 mb-4">
            {stats.map((stat) => (
              <Col key={stat.label} xs={12} sm={6} lg={3}>
                <Card className="admin-stat-card h-100">
                  <Card.Body>
                    <div className="text-muted small">{stat.label}</div>
                    <div className="fs-3 fw-semibold">{stat.value}</div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Card>
            <Card.Body>
              <Card.Title className="mb-3">Recent orders</Card.Title>
              {recentOrders.length === 0 ? (
                <p className="text-muted mb-0">No orders yet.</p>
              ) : (
                <Table responsive hover className="align-middle">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td>{order.product?.title || "—"}</td>
                        <td>{order.quantity}</td>
                        <td>₹{Number(order.total_cost).toFixed(2)}</td>
                        <td>
                          <Badge
                            bg={STATUS_VARIANT[order.status] || "secondary"}
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td>
                          {new Date(order.ordered_date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
};

export default AdminDashboard;
