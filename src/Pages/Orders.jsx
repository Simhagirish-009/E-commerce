import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Badge,
  Button,
} from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import { getOrders } from "../apis/product_apis";
import axiosInstance from "../apis/axiosInstance";

const API_BASE = "https://e-commerce-zhu2.onrender.com/api";
const MEDIA_BASE = API_BASE.replace(/\/api\/?$/, "");

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
});

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await getOrders();
      setOrders(res.data);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirmReceived = async (orderId) => {
    setConfirmingId(orderId);
    try {
      const res = await axios.post(
        `${API_BASE}/orders/${orderId}/confirm-received/`,
        {},
        authHeaders(),
      );
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.data : o)));
      toast.success("Thanks — marked as received!");
    } catch (err) {
      toast.error(
        err.response?.data?.error ||
          "Could not confirm receipt. Please try again.",
      );
    } finally {
      setConfirmingId(null);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "Accepted":
        return "info";
      case "Packed":
        return "primary";
      case "On The Way":
        return "warning";
      case "Delivered":
        return "success";
      case "Cancel":
        return "danger";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container className="mt-4">
      <h3 className="mb-4">My Orders</h3>

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <Row>
          {orders.map((order) => {
            const canConfirm =
              ["On The Way", "Delivered"].includes(order.status) &&
              !order.received_confirmed;

            return (
              <Col md={6} lg={4} key={order.id} className="mb-4">
                <Card className="shadow-sm h-100">
                  <Card.Img
                    variant="top"
                    src={`${MEDIA_BASE}${order.product.product_image}`}
                    style={{ height: "200px", objectFit: "contain" }}
                  />

                  <Card.Body>
                    <Card.Title>{order.product.title}</Card.Title>
                    <Card.Text>
                      <strong>Brand:</strong> {order.product.brand} <br />
                      <strong>Quantity:</strong> {order.quantity} <br />
                      <strong>Total:</strong> ₹{order.total_cost} <br />
                      <strong>Date:</strong>{" "}
                      {new Date(order.ordered_date).toLocaleDateString()}
                    </Card.Text>

                    <div className="d-flex align-items-center flex-wrap gap-2">
                      <Badge bg={getStatusVariant(order.status)}>
                        {order.status}
                      </Badge>

                      {order.received_confirmed && (
                        <Badge bg="success">Receipt confirmed</Badge>
                      )}
                    </div>

                    {canConfirm && (
                      <Button
                        size="sm"
                        className="btn-theme w-100 mt-3"
                        disabled={confirmingId === order.id}
                        onClick={() => handleConfirmReceived(order.id)}
                      >
                        {confirmingId === order.id ? (
                          <Spinner size="sm" />
                        ) : (
                          "Mark as received"
                        )}
                      </Button>
                    )}
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
};

export default Orders;
