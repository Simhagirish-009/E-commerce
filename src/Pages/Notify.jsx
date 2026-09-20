import React, { useEffect, useState } from "react";
import axiosInstance from "../apis/axiosInstance";
import {
  Container,
  Card,
  ListGroup,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import { PackageCheck, Bell } from "lucide-react";
import axios from "axios";
import "../App.css";

const API_BASE = "https://e-commerce-zhu2.onrender.com/api";

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
});

const NOTIFICATION_ICON = {
  order_delivered: PackageCheck,
};

const Notify = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.get(`${API_BASE}/notifications/`, authHeaders());
      setNotifications(res.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not load notifications. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    const previous = notifications;

    // Optimistic update.
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );

    try {
      await axiosInstance.patch(
        `${API_BASE}/notifications/${id}/read/`,
        {},
        authHeaders(),
      );
    } catch (err) {
      // Roll back on failure.
      setNotifications(previous);
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Container fluid className="py-4 px-4">
      <div className="d-flex align-items-center gap-2 mb-4">
        <Bell size={22} className="accent-icon" />
        <h3 className="mb-0">Notifications</h3>
        {unreadCount > 0 && <Badge bg="danger">{unreadCount} new</Badge>}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body className="p-0">
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" />
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-muted mb-0 p-4">
              You don't have any notifications yet.
            </p>
          ) : (
            <ListGroup variant="flush">
              {notifications.map((n) => {
                const Icon = NOTIFICATION_ICON[n.notification_type] || Bell;

                return (
                  <ListGroup.Item
                    key={n.id}
                    action
                    onClick={() => !n.is_read && markAsRead(n.id)}
                    className={`d-flex align-items-start gap-3 py-3 ${
                      n.is_read ? "" : "bg-light"
                    }`}
                  >
                    <Icon
                      size={20}
                      className="accent-icon mt-1 flex-shrink-0"
                    />
                    <div className="flex-grow-1">
                      <div className={n.is_read ? "" : "fw-semibold"}>
                        {n.message}
                      </div>
                      <div className="text-muted small">
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                    {!n.is_read && <Badge bg="primary">New</Badge>}
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Notify;
