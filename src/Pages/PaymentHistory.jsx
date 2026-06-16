import React, { useEffect, useState } from "react";
import { Container, Table, Spinner, Alert, Badge } from "react-bootstrap";
import axios from "axios";

const PaymentHistory = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await axios.get(
          "http://127.0.0.1:8000/api/payment-history/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setPayments(response.data);
      } catch (err) {
        setError("Failed to fetch payment history");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const getBadgeVariant = (mode) => {
    switch (mode) {
      case "UPI":
        return "success";
      case "Card":
        return "primary";
      case "NetBanking":
        return "warning";
      case "Cash":
        return "secondary";
      default:
        return "dark";
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Payment History</h2>

      {loading && (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && payments.length === 0 && (
        <Alert variant="info">No payments found</Alert>
      )}

      {!loading && !error && payments.length > 0 && (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>#</th>
              <th>Order ID</th>
              <th>Amount</th>
              <th>Payment Mode</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment, index) => (
              <tr key={payment.id}>
                <td>{index + 1}</td>
                <td>{payment.order}</td>
                <td>₹{payment.amount}</td>
                <td>
                  <Badge bg={getBadgeVariant(payment.payment_mode)}>
                    {payment.payment_mode}
                  </Badge>
                </td>
                <td>{payment.payment_date}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default PaymentHistory;
