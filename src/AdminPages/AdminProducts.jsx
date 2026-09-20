import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Modal,
  Form,
  Row,
  Col,
  Spinner,
  Alert,
  Image,
  ListGroup,
} from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import "../App.css";
import axiosInstance from "../apis/axiosInstance";

const API_BASE = "https://e-commerce-zhu2.onrender.com/api";
const MEDIA_BASE = API_BASE.replace(/\/api\/?$/, "");

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
});

const emptyForm = {
  title: "",
  category_id: "",
  selling_price: "",
  discounted_price: "",
  quantity: 1,
  brand: "",
  description: "",
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [categoryDeletingId, setCategoryDeletingId] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        axiosInstance.get(`${API_BASE}/admin/products/`, authHeaders()),
        axiosInstance.get(`${API_BASE}/admin/categories/`, authHeaders()),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not load products. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview(null);
    setFormErrors({});
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    setForm({
      title: product.title,
      category_id: product.category?.id || "",
      selling_price: product.selling_price,
      discounted_price: product.discounted_price,
      quantity: product.quantity,
      brand: product.brand,
      description: product.description,
    });
    setImageFile(null);
    setImagePreview(
      product.product_image ? `${MEDIA_BASE}${product.product_image}` : null,
    );
    setFormErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
  };

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : imagePreview);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormErrors({});

    const data = new FormData();
    data.append("title", form.title);
    data.append("category_id", form.category_id);
    data.append("selling_price", form.selling_price);
    data.append("discounted_price", form.discounted_price);
    data.append("quantity", form.quantity);
    data.append("brand", form.brand);
    data.append("description", form.description);
    if (imageFile) data.append("product_image", imageFile);

    try {
      if (editingId) {
        const res = await axiosInstance.put(
          `${API_BASE}/admin/products/${editingId}/`,
          data,
          authHeaders(),
        );
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? res.data : p)),
        );
        toast.success("Product updated.");
      } else {
        if (!imageFile) {
          setFormErrors({ product_image: ["Product image is required."] });
          setSaving(false);
          return;
        }
        const res = await axiosInstance.post(
          `${API_BASE}/admin/products/`,
          data,
          authHeaders(),
        );
        setProducts((prev) => [res.data, ...prev]);
        toast.success("Product added.");
      }
      setShowModal(false);
    } catch (err) {
      const respData = err.response?.data;
      if (respData && typeof respData === "object") {
        setFormErrors(respData);
      } else {
        toast.error("Could not save product. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (product) => setDeleteTarget(product);
  const cancelDelete = () => {
    if (deleting) return;
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axiosInstance.delete(
        `${API_BASE}/admin/products/${deleteTarget.id}/`,
        authHeaders(),
      );
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      toast.success(`"${deleteTarget.title}" deleted.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || "Could not delete product.");
    } finally {
      setDeleting(false);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    const name = newCategoryName.trim();
    if (!name) return;

    setCategorySaving(true);
    setCategoryError("");
    try {
      const res = await axiosInstance.post(
        `${API_BASE}/admin/categories/`,
        { name },
        authHeaders(),
      );
      setCategories((prev) =>
        [...prev, res.data].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setNewCategoryName("");
      toast.success(`"${res.data.name}" added.`);
    } catch (err) {
      setCategoryError(
        err.response?.data?.name?.[0] ||
          err.response?.data?.detail ||
          "Could not add category.",
      );
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (
      !window.confirm(
        `Delete "${category.name}"? This only works if no products use it.`,
      )
    ) {
      return;
    }
    setCategoryDeletingId(category.id);
    try {
      await axiosInstance.delete(
        `${API_BASE}/admin/categories/${category.id}/`,
        authHeaders(),
      );
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
      toast.success(`"${category.name}" deleted.`);
    } catch (err) {
      toast.error(
        err.response?.data?.detail ||
          "Could not delete category — it may still have products in it.",
      );
    } finally {
      setCategoryDeletingId(null);
    }
  };

  const openCategoryModal = () => {
    setNewCategoryName("");
    setCategoryError("");
    setShowCategoryModal(true);
  };

  return (
    <Container fluid className="py-4 px-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h3 className="mb-0">Products</h3>
        </Col>
        <Col xs="auto" className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={openCategoryModal}>
            Manage categories
          </Button>
          <Button className="btn-theme" onClick={openAddModal}>
            + Add product
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-muted mb-0">
              No products yet. Add your first one above.
            </p>
          ) : (
            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th></th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Selling price</th>
                  <th>Discounted price</th>
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td style={{ width: "56px" }}>
                      {product.product_image ? (
                        <Image
                          src={`${MEDIA_BASE}${product.product_image}`}
                          alt={product.title}
                          rounded
                          style={{
                            width: 44,
                            height: 44,
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          className="bg-light rounded"
                          style={{ width: 44, height: 44 }}
                        />
                      )}
                    </td>
                    <td>{product.title}</td>
                    <td>{product.category?.name || "—"}</td>
                    <td>{product.brand}</td>
                    <td>₹{Number(product.selling_price).toFixed(2)}</td>
                    <td>₹{Number(product.discounted_price).toFixed(2)}</td>
                    <td>{product.quantity}</td>
                    <td className="text-end" style={{ whiteSpace: "nowrap" }}>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        className="me-2"
                        onClick={() => openEditModal(product)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => confirmDelete(product)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Add / Edit modal */}
      <Modal show={showModal} onHide={closeModal} centered>
        <Form onSubmit={handleSave}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editingId ? "Edit product" : "Add product"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                value={form.title}
                onChange={(e) => handleFieldChange("title", e.target.value)}
                isInvalid={!!formErrors.title}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.title?.[0]}
              </Form.Control.Feedback>
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={form.category_id}
                    onChange={(e) =>
                      handleFieldChange("category_id", e.target.value)
                    }
                    isInvalid={!!formErrors.category_id}
                    required
                  >
                    <option value="" disabled>
                      {categories.length
                        ? "Select a category"
                        : "No categories yet"}
                    </option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {formErrors.category_id?.[0]}
                  </Form.Control.Feedback>
                  {categories.length === 0 && (
                    <Form.Text>
                      <a
                        href="#!"
                        onClick={(e) => {
                          e.preventDefault();
                          openCategoryModal();
                        }}
                      >
                        Add a category
                      </a>{" "}
                      first.
                    </Form.Text>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Brand</Form.Label>
                  <Form.Control
                    value={form.brand}
                    onChange={(e) => handleFieldChange("brand", e.target.value)}
                    isInvalid={!!formErrors.brand}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.brand?.[0]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Selling price</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.selling_price}
                    onChange={(e) =>
                      handleFieldChange("selling_price", e.target.value)
                    }
                    isInvalid={!!formErrors.selling_price}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.selling_price?.[0]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Discounted price</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.discounted_price}
                    onChange={(e) =>
                      handleFieldChange("discounted_price", e.target.value)
                    }
                    isInvalid={!!formErrors.discounted_price}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.discounted_price?.[0] ||
                      formErrors.non_field_errors?.[0]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Stock</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    max="1000"
                    value={form.quantity}
                    onChange={(e) =>
                      handleFieldChange("quantity", e.target.value)
                    }
                    isInvalid={!!formErrors.quantity}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.quantity?.[0]}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  handleFieldChange("description", e.target.value)
                }
                isInvalid={!!formErrors.description}
                required
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.description?.[0]}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label>
                Product image {editingId && "(leave blank to keep current)"}
              </Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                isInvalid={!!formErrors.product_image}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.product_image?.[0]}
              </Form.Control.Feedback>
              {imagePreview && (
                <Image
                  src={imagePreview}
                  alt="Preview"
                  rounded
                  className="mt-2"
                  style={{ width: 80, height: 80, objectFit: "cover" }}
                />
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              onClick={closeModal}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" className="btn-theme" disabled={saving}>
              {saving ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Saving...
                </>
              ) : editingId ? (
                "Save changes"
              ) : (
                "Add product"
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Manage categories */}
      <Modal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Manage categories</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddCategory} className="d-flex gap-2 mb-3">
            <Form.Control
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              disabled={categorySaving}
            />
            <Button
              type="submit"
              className="btn-theme"
              disabled={categorySaving || !newCategoryName.trim()}
            >
              {categorySaving ? <Spinner size="sm" /> : "Add"}
            </Button>
          </Form>

          {categoryError && (
            <Alert variant="danger" className="py-2">
              {categoryError}
            </Alert>
          )}

          {categories.length === 0 ? (
            <p className="text-muted mb-0">No categories yet.</p>
          ) : (
            <ListGroup>
              {categories.map((cat) => (
                <ListGroup.Item
                  key={cat.id}
                  className="d-flex justify-content-between align-items-center"
                >
                  {cat.name}
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={() => handleDeleteCategory(cat)}
                    disabled={categoryDeletingId === cat.id}
                  >
                    {categoryDeletingId === cat.id ? (
                      <Spinner size="sm" />
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Modal.Body>
      </Modal>

      {/* Delete confirmation */}
      <Modal show={!!deleteTarget} onHide={cancelDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Delete <strong>{deleteTarget?.title}</strong>? This can't be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={cancelDelete}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Spinner size="sm" /> : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminProducts;
