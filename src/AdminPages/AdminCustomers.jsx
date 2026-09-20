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
import "../App.css";
import axiosInstance from "../apis/axiosInstance";

const API_BASE = "https://e-commerce-zhu2.onrender.com/api";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
});

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axiosInstance.get(
          `${API_BASE}/admin/customers/`,
          authHeaders()
        );
        setCustomers(res.data);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Could not load customers. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.user_name?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone_number?.includes(q) ||
        c.city?.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const isProfileIncomplete = (c) =>
    !c.phone_number ||
    c.phone_number === "0000000000" ||
    !c.address_line1 ||
    c.address_line1 === "xxxxx";

  return (
    <Container fluid className="py-4 px-4">
      <Row className="align-items-center mb-4">
        <Col>
          <h3 className="mb-0">Customers</h3>
        </Col>
        <Col xs="auto">
          <Form.Control
            type="search"
            placeholder="Search name, email, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "280px" }}
          />
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" />
            </div>
          ) : filteredCustomers.length === 0 ? (
            <p className="text-muted mb-0">No customers match this search.</p>
          ) : (
            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Orders</th>
                  <th>Account</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => (
                  <tr key={c.id}>
                    <td>{c.user_name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone_number}</td>
                    <td>
                      {isProfileIncomplete(c) ? (
                        <span className="text-muted">Incomplete profile</span>
                      ) : (
                        `${c.city}, ${c.state} - ${c.zip_code}`
                      )}
                    </td>
                    <td>{c.order_count}</td>
                    <td>
                      <Badge bg={c.is_active ? "success" : "secondary"}>
                        {c.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td>
                      {c.date_joined
                        ? new Date(c.date_joined).toLocaleDateString()
                        : "—"}
                    </td>
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

export default AdminCustomers;
