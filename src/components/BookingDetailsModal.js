import React from 'react';
import { Modal, Button, Badge, Card } from 'react-bootstrap';
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
        <div className="row g-4">
          <div className="col-md-6">
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <h5 className="mb-3 text-primary">User Information</h5>
                <div className="mb-2"><strong>Name: </strong>{booking.userName}</div>
                <div className="mb-2"><strong>Mobile: </strong><span className="badge bg-info text-dark">{booking.userMobileNumber}</span></div>
                <div className="mb-2"><strong>User ID: </strong><span className="badge bg-secondary">{booking.userId}</span></div>
              </Card.Body>
            </Card>
          </div>
          <div className="col-md-6">
            <Card className="shadow-sm border-0 h-100">
              <Card.Body>
                <h5 className="mb-3 text-primary">Labour Information</h5>
                <div className="mb-2"><strong>Name: </strong>{booking.labourName}</div>
                <div className="mb-2"><strong>Mobile: </strong><span className="badge bg-info text-dark">{booking.labourMobileNo}</span></div>
                <div className="mb-2"><strong>Labour ID: </strong><span className="badge bg-secondary">{booking.labourId}</span></div>
                <div className="mb-2"><strong>Service: </strong><span className="badge bg-info text-dark">{booking.labourSkill}</span></div>
              </Card.Body>
            </Card>
          </div>
        </div>
        <hr />
        <Card className="shadow-sm border-0 mt-3">
          <Card.Body>
            <h5 className="mb-3 text-primary">Booking Information</h5>
            <div className="mb-2"><strong>Booking Time: </strong>{booking.bookingTime ? new Date(booking.bookingTime).toLocaleString() : 'N/A'}</div>
            <div className="mb-2"><strong>Status: </strong>{getStatusBadge(booking.bookingStatusCode)}</div>
          </Card.Body>
        </Card>
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