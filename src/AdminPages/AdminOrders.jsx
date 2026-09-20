import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Table,
  Badge,
  Spinner,
  Alert,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import axiosInstance from "../apis/axiosInstance";

import "../App.css";

const API_BASE = "https://e-commerce-zhu2.onrender.com/api";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
});

const STATUS_CHOICES = [
  "Pending",
  "Accepted",
  "Packed",
  "On The Way",
  "Delivered",
  "Cancel",
];

const STATUS_VARIANT = {
  Pending: "secondary",
  Accepted: "info",
  Packed: "primary",
  "On The Way": "warning",
  Delivered: "success",
  Cancel: "danger",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(`${API_BASE}/admin/orders/`, authHeaders());
      setOrders(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not load orders. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    const previousOrders = orders;
    const previousOrder = orders.find((o) => o.id === orderId);
    if (!previousOrder || previousOrder.status === newStatus) return;

    // Optimistic update so the dropdown reflects the change immediately.
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
    );
    setUpdatingId(orderId);

    try {
      await axiosInstance.patch(
        `${API_BASE}/admin/orders/${orderId}/status/`,
        { status: newStatus },
        authHeaders(),
      );
      toast.success(`Order #${orderId} marked as ${newStatus}.`);
    } catch (err) {
      // Roll back on failure.
      setOrders(previousOrders);
      toast.error(
        err.response?.data?.status?.[0] ||
          err.response?.data?.detail ||
          "Could not update order status.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders =
    statusFilter === "All"
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  return (
    <Container fluid className="py-4 px-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h3 className="mb-0">Orders</h3>
        </Col>
        <Col xs="auto">
          <Form.Select
            size="sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="All">All statuses</option>
            {STATUS_CHOICES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Form.Select>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <p className="text-muted mb-0">No orders match this filter.</p>
          ) : (
            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Destination</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Received?</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const isDelivered = order.status === "Delivered";

                  return (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        {order.customer?.user_name || "—"}
                        <div className="text-muted small">
                          {order.customer?.email}
                        </div>
                      </td>
                      <td>{order.product?.title || "—"}</td>
                      <td>{order.quantity}</td>
                      <td>₹{Number(order.total_cost).toFixed(2)}</td>
                      <td
                        className="text-truncate"
                        style={{ maxWidth: "200px" }}
                        title={order.destination}
                      >
                        {order.destination || "—"}
                      </td>
                      <td>
                        {new Date(order.ordered_date).toLocaleDateString()}
                      </td>
                      <td style={{ minWidth: "160px" }}>
                        <div className="d-flex align-items-center gap-2">
                          <Badge
                            bg={STATUS_VARIANT[order.status] || "secondary"}
                          >
                            {order.status}
                          </Badge>
                          <Form.Select
                            size="sm"
                            value={order.status}
                            disabled={isDelivered || updatingId === order.id}
                            title={
                              isDelivered
                                ? "Delivered orders can't be changed."
                                : undefined
                            }
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value)
                            }
                          >
                            {STATUS_CHOICES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </Form.Select>
                          {updatingId === order.id && (
                            <Spinner animation="border" size="sm" />
                          )}
                        </div>
                      </td>
                      <td>
                        {order.received_confirmed ? (
                          <Badge
                            bg="success"
                            title={new Date(
                              order.received_confirmed_at,
                            ).toLocaleString()}
                          >
                            Confirmed
                          </Badge>
                        ) : (
                          <Badge bg="light" text="dark">
                            Not yet
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminOrders;
