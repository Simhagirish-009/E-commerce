import React, { useEffect, useState } from "react";
import { getCustomerData } from "../apis/product_apis";
import { Modal, Button } from "react-bootstrap";
import Products from "./Products";

const Dashboard = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchCustomerData = async () => {
      try {
        const response = await getCustomerData();
        const complete = response.data.is_complete;

        if (!complete) {
          setShowModal(true);
        }
      } catch (error) {
        console.error("Error fetching customer data:", error);
      }
    };

    fetchCustomerData();
  }, []);

  return (
    <div>
      <Modal show={showModal} backdrop="static" keyboard={false} centered>
        <Modal.Header>
          <Modal.Title>Complete Your Profile</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Please complete your profile to continue using the dashboard.
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => (window.location.href = "/complete-profile")}
          >
            Go to Profile
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="main-content">
        <Products />
      </div>
    </div>
  );
};

export default Dashboard;
