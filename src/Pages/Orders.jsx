import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Badge } from "react-bootstrap";
import axios from "axios";
import { getOrders } from "../apis/product_apis";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

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
          {orders.map((order) => (
            <Col md={6} lg={4} key={order.id} className="mb-4">
              <Card className="shadow-sm h-100">
                <Card.Img
                  variant="top"
                src = {`http://localhost:8000${order.product.product_image}`}
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

                  <Badge bg={getStatusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Orders;
