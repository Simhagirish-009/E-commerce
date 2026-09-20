import React, { useEffect, useState, useRef } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Carousel,
  Button,
} from "react-bootstrap";
import { Modal, Form } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { addToCart } from "../apis/product_apis";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axiosInstance from "../apis/axiosInstance";

const SearchResults = () => {
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);

  const carouselRefs = useRef({});
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const query = new URLSearchParams(useLocation().search).get("q");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/search/?q=${query}`,
        );

        // ✅ Group like Products page
        const grouped = res.data.reduce((acc, product) => {
          const category = product.category?.name || "Others";

          if (!acc[category]) acc[category] = [];
          acc[category].push(product);

          return acc;
        }, {});

        setProductsByCategory(grouped);
      } catch (error) {
        console.error("Search error", error);
        toast.error("Failed to fetch search results");
      } finally {
        setLoading(false);
      }
    };

    if (query) fetchResults();
  }, [query]);

  const handleAddToCart = (product) => {
    setSelectedProduct(product);
    setQuantity(1);
    setShowModal(true);
  };

  const confirmAddToCart = async () => {
    try {
      await addToCart(selectedProduct.id, Number(quantity));

      toast.success("Added to cart");
      setShowModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to add to cart");
    }
  };

  const handleBuyNow = (product) => {
    try {
      navigate("/checkout", {
        state: { product },
      });
      toast.success("Proceeding to checkout");
    } catch (error) {
      toast.error("Buy failed");
    }
  };

  const chunkProducts = (products, size) => {
    const chunks = [];
    for (let i = 0; i < products.length; i += size) {
      chunks.push(products.slice(i, i + size));
    }
    return chunks;
  };

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
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header className="bg-warning" closeButton>
          <Modal.Title>Add to Cart</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedProduct && (
            <>
              <h5>{selectedProduct.title}</h5>
              <p>Available Quantity : {selectedProduct.quantity}</p>
              <p>Price: ₹{selectedProduct.discounted_price * quantity}</p>

              <Form.Group>
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max="100"
                  value={quantity}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    const max = selectedProduct.quantity;

                    setQuantity(Math.min(max, Math.max(1, value)));
                  }}
                />
              </Form.Group>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>

          <Button variant="primary" onClick={confirmAddToCart}>
            Add to Cart
          </Button>
        </Modal.Footer>
      </Modal>
      <h4 className="mb-4">
        Search Results for "<span style={{ color: "#1e40af" }}>{query}</span>"
      </h4>

      {Object.keys(productsByCategory).length === 0 && <p>No products found</p>}

      {Object.keys(productsByCategory).map((category) => (
        <div key={category} className="mb-5">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>{category}</h5>

            <div>
              <Button
                variant="light"
                size="sm"
                className="me-2"
                onClick={() => carouselRefs.current[category]?.prev()}
              >
                ◀
              </Button>

              <Button
                variant="light"
                size="sm"
                onClick={() => carouselRefs.current[category]?.next()}
              >
                ▶
              </Button>
            </div>
          </div>

          {/* Carousel */}
          <Carousel
            controls={false}
            indicators={false}
            ref={(ref) => (carouselRefs.current[category] = ref)}
          >
            {chunkProducts(productsByCategory[category], 4).map(
              (chunk, index) => (
                <Carousel.Item key={index}>
                  <Row>
                    {chunk.map((product) => {
                      const selling = Number(product.selling_price);
                      const discount = Number(product.discounted_price);

                      const discountPercent =
                        selling > discount
                          ? Math.round(((selling - discount) / selling) * 100)
                          : 0;

                      return (
                        <Col md={3} key={product.id}>
                          <Card
                            className="dashboard-card h-100 position-relative animate__animated animate__fadeIn"
                            style={{ fontSize: "14px" }}
                          >
                            {/* Discount Badge */}
                            {selling !== discount && (
                              <span
                                style={{
                                  position: "absolute",
                                  top: "8px",
                                  right: "8px",
                                  background: "#facc15",
                                  padding: "3px 7px",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                }}
                              >
                                {discountPercent}% OFF
                              </span>
                            )}

                            {/* Image */}
                            <Card.Img
                              variant="top"
                              src={`http://localhost:8000${product.product_image}`}
                              style={{
                                height: "150px",
                                objectFit: "contain",
                              }}
                            />

                            <Card.Body className="p-2">
                              <Card.Title style={{ fontSize: "15px" }}>
                                {product.title}
                              </Card.Title>

                              <Card.Text className="mb-1">
                                <small>Brand: {product.brand}</small>
                              </Card.Text>

                              <Card.Text>
                                {selling !== discount && (
                                  <span
                                    style={{
                                      textDecoration: "line-through",
                                      color: "gray",
                                      marginRight: "6px",
                                      fontSize: "13px",
                                    }}
                                  >
                                    ₹{selling}
                                  </span>
                                )}

                                <strong style={{ color: "#1e40af" }}>
                                  ₹{discount}
                                </strong>
                              </Card.Text>

                              {/* Buttons */}
                              <div className="d-flex flex-column justify-content-center align-items-center">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="w-100"
                                  onClick={() => handleAddToCart(product)}
                                  disabled={product.quantity <= 0}
                                >
                                  Add to Cart
                                </Button>
                                <br />
                                <Button
                                  variant="primary"
                                  size="sm"
                                  className="w-100"
                                  onClick={() => handleBuyNow(product)}
                                  disabled={product.quantity <= 0}
                                >
                                  Buy
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </Carousel.Item>
              ),
            )}
          </Carousel>
        </div>
      ))}
    </Container>
  );
};

export default SearchResults;
