import React from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { FaTimesCircle, FaClock, FaCheckCircle } from 'react-icons/fa';

const BookingDetailsModal = ({ isOpen, toggle, booking }) => {
  const getStatusBadge = (statusCode) => {
    switch (statusCode) {
      case -1:
        return <Badge bg="danger" className="px-3 py-2"><FaTimesCircle className="me-1" /> Rejected</Badge>;
      case 0:
        return <Badge bg="secondary" className="px-3 py-2"><FaClock className="me-1" /> Unknown</Badge>;
      case 1:
        return <Badge bg="warning" className="px-3 py-2"><FaClock className="me-1" /> Pending</Badge>;
      case 2:
        return <Badge bg="primary" className="px-3 py-2"><FaCheckCircle className="me-1" /> Accepted</Badge>;
      case 3:
        return <Badge bg="success" className="px-3 py-2"><FaClock className="me-1" /> Completed</Badge>;
      default:
        return <Badge bg="secondary" className="px-3 py-2"><FaClock className="me-1" /> Unknown</Badge>;
    }
  };

  if (!booking) return null;

  return (
    <Modal show={isOpen} onHide={toggle} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Booking Details (ID: {booking.bookingId})</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-md-6">
            <h5 className="mb-3">User Information</h5>
            <p><strong>Name:</strong> {booking.userName}</p>
            <p><strong>Mobile:</strong> {booking.userMobileNumber}</p>
            <p><strong>User ID:</strong> {booking.userId}</p>
          </div>
          <div className="col-md-6">
            <h5 className="mb-3">Labour Information</h5>
            <p><strong>Name:</strong> {booking.labourName}</p>
            <p><strong>Mobile:</strong> {booking.labourMobileNo}</p>
            <p><strong>Labour ID:</strong> {booking.labourId}</p>
            <p><strong>Skill:</strong> {booking.labourSkill}</p>
          </div>
        </div>
        <hr />
        <div className="row mt-3">
          <div className="col-12">
            <h5 className="mb-3">Booking Information</h5>
            <p><strong>Booking Time:</strong> {booking.bookingTime ? new Date(booking.bookingTime).toLocaleString() : 'N/A'}</p>
            <p><strong>Status:</strong> {getStatusBadge(booking.bookingStatusCode)}</p>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={toggle}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingDetailsModal; 