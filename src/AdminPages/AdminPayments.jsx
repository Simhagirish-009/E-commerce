import React, { useEffect, useMemo, useState } from "react";
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
import axiosInstance from "../apis/axiosInstance";

import "../App.css";

const API_BASE = "https://e-commerce-zhu2.onrender.com/api";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
});

const MODE_VARIANT = {
  UPI: "primary",
  Card: "info",
  NetBanking: "warning",
  Cash: "success",
};

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modeFilter, setModeFilter] = useState("All");

  useEffect(() => {
    const fetchPayments = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.get(
          `${API_BASE}/admin/payments/`,
          authHeaders()
        );
        setPayments(res.data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Could not load payments. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filteredPayments = useMemo(
    () =>
      modeFilter === "All"
        ? payments
        : payments.filter((p) => p.payment_mode === modeFilter),
    [payments, modeFilter]
  );

  const totalAmount = filteredPayments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  return (
    <Container fluid className="py-4 px-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h3 className="mb-0">Payments</h3>
        </Col>
        <Col xs="auto">
          <Form.Select
            size="sm"
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            style={{ width: "auto" }}
          >
            <option value="All">All payment modes</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="NetBanking">NetBanking</option>
            <option value="Cash">Cash</option>
          </Form.Select>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="g-3 mb-4">
        <Col xs={12} sm={6} lg={3}>
          <Card className="admin-stat-card h-100">
            <Card.Body>
              <div className="text-muted small">
                {modeFilter === "All" ? "Total revenue" : `${modeFilter} revenue`}
              </div>
              <div className="fs-3 fw-semibold">₹{totalAmount.toFixed(2)}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} sm={6} lg={3}>
          <Card className="admin-stat-card h-100">
            <Card.Body>
              <div className="text-muted small">Payments</div>
              <div className="fs-3 fw-semibold">{filteredPayments.length}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <p className="text-muted mb-0">No payments match this filter.</p>
          ) : (
            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>Payment #</th>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p.id}>
                    <td>#{p.id}</td>
                    <td>#{p.order?.id}</td>
                    <td>
                      {p.order?.customer?.user_name || "—"}
                      <div className="text-muted small">
                        {p.order?.customer?.email}
                      </div>
                    </td>
                    <td>{p.order?.product?.title || "—"}</td>
                    <td>₹{Number(p.amount).toFixed(2)}</td>
                    <td>
                      <Badge bg={MODE_VARIANT[p.payment_mode] || "secondary"}>
                        {p.payment_mode}
                      </Badge>
                    </td>
                    <td>{new Date(p.payment_date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminPayments;
