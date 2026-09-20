import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import axiosInstance from "../apis/axiosInstance";

import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const API_URL = "https://e-commerce-zhu2.onrender.com/api";

  useEffect(() => {
    fetchCart();
  }, []);

  // ✅ Fetch Cart
  const fetchCart = async () => {
    try {
      const res = await axiosInstance.get(`${API_URL}/cart/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      setCartItems(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Remove Item
  const removeItem = async (id) => {
    try {
      await axiosInstance.delete(`${API_URL}/cart/remove/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      toast.success("Item removed");
      fetchCart();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove item");
    }
  };

  // ✅ Buy Single Item
  const handleBuy = (item) => {
    navigate("/checkout", {
      state: {
        product: item.product,
        quantity: item.quantity,
      },
    });
  };

  // ✅ Buy All Items
  const handleBuyAll = () => {
    if (!cartItems.length) return;

    navigate("/checkout", {
      state: {
        cartItems: cartItems,
        isCartCheckout: true,
      },
    });
  };

  const updateQuantity = async (id, newQty) => {
    if (newQty < 1) return;

    try {
      await axiosInstance.patch(
        `${API_URL}/cart/update/${id}/`,
        { quantity: newQty },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );

      // Update UI instantly (no refetch needed)
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, quantity: newQty } : item,
        ),
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to update quantity");
    }
  };

  // ✅ Total Price Calculation
  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.quantity * Number(item.product.discounted_price),
    0,
  );

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container className="mt-5">
      <ToastContainer position="top-right" autoClose={3000} />

      <h3 className="mb-4">My Cart</h3>

      {cartItems.length === 0 ? (
        <h5>Your cart is empty</h5>
      ) : (
        <>
          {/* ✅ Buy All + Total */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5>Total: ₹{totalPrice}</h5>

            <Button variant="primary" onClick={handleBuyAll}>
              Buy All
            </Button>
          </div>

          {/* ✅ Cart Items */}
          {cartItems.map((item) => (
            <Card className="mb-3 p-3 shadow-sm" key={item.id}>
              <Row className="align-items-center">
                {/* Image */}
                <Col md={3}>
                  <img
                    src={`http://localhost:8000${item.product.product_image}`}
                    alt=""
                    style={{ height: "120px", objectFit: "contain" }}
                  />
                </Col>

                {/* Details */}
                <Col md={4}>
                  <h5>{item.product.title}</h5>
                  <p className="mb-1">Brand: {item.product.brand}</p>
                  <p>Available Stock: {item.product.quantity}</p>
                </Col>

                {/* Price */}
                <Col md={2}>
                  <p style={{ fontSize: "13px", color: "gray" }}>
                    Total: ₹
                    {item.quantity * Number(item.product.discounted_price)}
                  </p>
                  <div className="d-flex align-items-center gap-2">
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      −
                    </Button>

                    <span>{item.quantity}</span>

                    <Button
                      variant="outline-secondary"
                      size="sm"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.quantity}
                    >
                      +
                    </Button>
                  </div>
                </Col>

                {/* Actions */}
                <Col md={3}>
                  <Button
                    variant="success"
                    className="me-2 mb-2"
                    onClick={() => handleBuy(item)}
                  >
                    Buy Now
                  </Button>

                  <Button
                    variant="danger"
                    className="mb-2"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </Button>
                </Col>
              </Row>
            </Card>
          ))}
        </>
      )}
    </Container>
  );
};

export default CartPage;
