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
import { useNavigate } from "react-router-dom";
import { Modal, Form } from "react-bootstrap";
import { getProductsByCategory } from "../apis/product_apis";
import { addToCart, buyProduct } from "../apis/product_apis";
import { toast, ToastContainer } from "react-toastify"; // Import Toastify
import "react-toastify/dist/ReactToastify.css";
const Products = () => {
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const carouselRefs = useRef({});
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await getProductsByCategory();

        const grouped = res.data.reduce((acc, product) => {
          const category = product.category?.name || "Others";

          if (!acc[category]) acc[category] = [];
          acc[category].push(product);

          return acc;
        }, {});

        setProductsByCategory(grouped);
      } catch (error) {
        console.error("Error fetching products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
        state: {
          product: product,
        },
      }); // Pass the product details to the checkout page
      toast.success("Proceeding to checkout");
    } catch (error) {
      toast.error("Buy error:", error);
      alert("Failed to buy product");
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />
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
                  max={selectedProduct.quantity}
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
      {Object.keys(productsByCategory).map((category) => (
        <div key={category} className="mb-5">
          {/* Header + Navigation */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4>{category}</h4>

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

          <Carousel
            controls={false}
            indicators={false}
            ref={(ref) => (carouselRefs.current[category] = ref)}
          >
            {chunkProducts(productsByCategory[category], 4).map(
              (productChunk, index) => (
                <Carousel.Item key={index}>
                  <Row>
                    {productChunk.map((product) => {
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
                              {!product.quantity ? (
                                <p style={{ color: "red" }}>
                                  The stock is Not Available
                                </p>
                              ) : (
                                " "
                              )}
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

export default Products;
