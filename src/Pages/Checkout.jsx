import React, { useEffect, useState } from "react";
import { Container, Card, Button, Form } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { makePayment, buyProduct } from "../apis/product_apis";

const API_URL = "http://localhost:8000/api";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isCartCheckout = location.state?.isCartCheckout;

  const items = isCartCheckout
    ? location.state?.cartItems || []
    : location.state?.product
      ? [
          {
            product: location.state.product,
            quantity: location.state.quantity || 1,
          },
        ]
      : [];

  const token = localStorage.getItem("access_token");

  // STATE
  const [quantity, setQuantity] = useState(items[0]?.quantity || 1);
  const [paymentMode, setPaymentMode] = useState("UPI");
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState("line1");

  // FETCH ADDRESS
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const res = await axios.get(`${API_URL}/customer/address/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAddress(res.data);
      } catch (error) {
        console.error("Failed to fetch address", error);
      }
    };

    if (token) fetchAddress();
  }, [token]);

  // FORMAT ADDRESSES
  const address1 = address
    ? `${address.address_line1}`
    : "";

  const address2 =
    address && address.address_line2?.trim()
      ? `${address.address_line2}`
      : null;

  // GET SELECTED ADDRESS OBJECT
  const getSelectedAddress = () => {
    if (!address) return null;

    return {
      address_line:
        selectedAddress === "line1"
          ? address.address_line1
          : address.address_line2,
    };
  };

  // TOTAL
  const totalAmount = isCartCheckout
    ? items.reduce(
        (acc, item) =>
          acc + item.quantity * Number(item.product.discounted_price),
        0,
      )
    : quantity * Number(items[0]?.product?.discounted_price || 0);

  // PAYMENT HANDLER
  const handlePayment = async () => {
    try {
      setLoading(true);

      const selectedAddressData = getSelectedAddress();

      if (!selectedAddressData) {
        alert("Please select an address");
        return;
      }

      if (isCartCheckout) {
        await axios.post(
          `${API_URL}/cart/buy-all/`,
          { address: selectedAddressData },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        alert("All items ordered successfully");
      } else {
        const product = items[0].product;

        const res = await buyProduct(
          product.id,
          Number(quantity),
          selectedAddressData,
        );

        const orderId = res.data.id;

        await makePayment(orderId, paymentMode);

        alert("Order placed & payment successful");
      }

      navigate("/orders");
    } catch (error) {
      console.error(error);
      alert("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return <h4 className="text-center mt-5">No products selected</h4>;
  }

  return (
    <Container className="mt-5 d-flex justify-content-center">
      <Card style={{ width: "600px" }} className="p-4 shadow">
        <h3 className="mb-3">Checkout</h3>

        {/* CART CHECKOUT */}
        {isCartCheckout ? (
          items.map((item) => (
            <div key={item.id} className="mb-3 border-bottom pb-2">
              <h5>{item.product.title}</h5>
              <p>Qty: {item.quantity}</p>
              <p>₹{item.product.discounted_price}</p>
              <p>
                Subtotal: ₹
                {item.quantity * Number(item.product.discounted_price)}
              </p>
            </div>
          ))
        ) : (
          <>
            <img
              src={`http://localhost:8000${items[0].product.product_image}`}
              alt=""
              style={{ height: "200px", objectFit: "contain" }}
            />

            <h5 className="mt-3">{items[0].product.title}</h5>
            <p>Brand: {items[0].product.brand}</p>
            <p>Available Stock: {items[0].product.quantity}</p>

            <h4 className="text-primary">
              ₹{items[0].product.discounted_price}
            </h4>

            {/* QUANTITY */}
            <Form className="mt-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                min="1"
                max={items[0].product.quantity}
                value={quantity}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  const max = items[0].product.quantity;

                  setQuantity(Math.min(max, Math.max(1, value)));
                }}
              />
            </Form>
          </>
        )}

        {/* TOTAL */}
        <h5 className="mt-3">Total: ₹{totalAmount}</h5>

        {/* ADDRESS */}
        <Form className="mt-3">
          <Form.Label>Choose Address</Form.Label>

          {address && (
            <>
              <Form.Check
                type="radio"
                label={address1}
                value="line1"
                checked={selectedAddress === "line1"}
                onChange={(e) => setSelectedAddress(e.target.value)}
              />

              {address2 && (
                <Form.Check
                  type="radio"
                  label={address2}
                  value="line2"
                  checked={selectedAddress === "line2"}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                />
              )}
            </>
          )}

          {/* PAYMENT */}
          <Form.Group className="mt-3">
            <Form.Label>Payment Mode</Form.Label>
            <Form.Select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="NetBanking">NetBanking</option>
              <option value="Cash">Cash on Delivery</option>
            </Form.Select>
          </Form.Group>
        </Form>

        {/* BUTTON */}
        <Button
          className="mt-4"
          variant="success"
          onClick={handlePayment}
          disabled={loading}
        >
          {loading ? "Processing..." : "Pay Now"}
        </Button>
      </Card>
    </Container>
  );
};

export default Checkout;
