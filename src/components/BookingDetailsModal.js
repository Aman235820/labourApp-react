import React from 'react';
import { Modal, Button, Badge, Card, Row, Col } from 'react-bootstrap';
import { 
  FaTimesCircle, 
  FaClock, 
  FaCheckCircle, 
  FaUser, 
  FaUserTie, 
  FaPhone, 
  FaCalendarAlt, 
  FaTools, 
  FaClipboardList, 
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaFileAlt,
  FaCog,
  FaCheck
} from 'react-icons/fa';

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
        return <Badge bg="success" className="px-3 py-2"><FaCheck className="me-1" /> Completed</Badge>;
      default:
        return <Badge bg="secondary" className="px-3 py-2"><FaClock className="me-1" /> Unknown</Badge>;
    }
  };

  const getUrgencyBadge = (urgencyLevel) => {
    switch (urgencyLevel?.toLowerCase()) {
      case 'urgent':
        return <Badge bg="danger" className="px-2 py-1"><FaExclamationTriangle className="me-1" /> Urgent</Badge>;
      case 'high':
        return <Badge bg="warning" className="px-2 py-1"><FaExclamationTriangle className="me-1" /> High</Badge>;
      case 'normal':
        return <Badge bg="info" className="px-2 py-1"><FaCog className="me-1" /> Normal</Badge>;
      case 'low':
        return <Badge bg="secondary" className="px-2 py-1"><FaClock className="me-1" /> Low</Badge>;
      default:
        return <Badge bg="secondary" className="px-2 py-1"><FaCog className="me-1" /> Not Specified</Badge>;
    }
  };

  if (!booking) return null;

  return (
    <Modal show={isOpen} onHide={toggle} size="xl" centered className="booking-details-modal">
      <Modal.Header closeButton className="bg-light border-bottom">
        <div className="d-flex align-items-center">
          <div className="booking-icon me-3">
            <FaClipboardList className="text-primary" size={24} />
          </div>
          <div>
            <Modal.Title className="mb-0">Booking Details</Modal.Title>
            <small className="text-muted">ID: #{booking.bookingId}</small>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className="p-4">
        {/* Status and Overview Section */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 text-primary">
                <FaClipboardList className="me-2" />
                Booking Overview
              </h5>
              <div className="d-flex gap-2">
                {getStatusBadge(booking.bookingStatusCode)}
                {booking.urgencyLevel && getUrgencyBadge(booking.urgencyLevel)}
              </div>
            </div>
            <Row className="g-3">
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label text-muted">
                    <FaCalendarAlt className="me-2" />
                    Booking Time
                  </label>
                  <div className="detail-value fw-medium">
                    {booking.bookingTime ? new Date(booking.bookingTime).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label text-muted">
                    <FaTools className="me-2" />
                    Service Type
                  </label>
                  <div className="detail-value">
                    <Badge bg="info" className="fs-6 px-3 py-2">
                      {booking.serviceName || booking.labourSkill || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </Col>
              {booking.preferredDate && (
                <Col md={6}>
                  <div className="detail-item">
                    <label className="detail-label text-muted">
                      <FaCalendarAlt className="me-2" />
                      Preferred Date
                    </label>
                    <div className="detail-value fw-medium">{booking.preferredDate}</div>
                  </div>
                </Col>
              )}
              {booking.preferredTime && (
                <Col md={6}>
                  <div className="detail-item">
                    <label className="detail-label text-muted">
                      <FaClock className="me-2" />
                      Preferred Time
                    </label>
                    <div className="detail-value fw-medium">{booking.preferredTime}</div>
                  </div>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>

        <Row className="g-4">
          {/* Customer Information */}
          <Col md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <h5 className="mb-3 text-primary border-bottom pb-2">
                  <FaUser className="me-2" />
                  Customer Information
                </h5>
                <div className="detail-item mb-3">
                  <label className="detail-label text-muted">Customer Name</label>
                  <div className="detail-value fw-bold">{booking.userName || 'N/A'}</div>
                </div>
                <div className="detail-item mb-3">
                  <label className="detail-label text-muted">
                    <FaPhone className="me-2" />
                    Mobile Number
                  </label>
                  <div className="detail-value">
                    <Badge bg="info" className="px-3 py-2">
                      {booking.userMobileNumber || 'N/A'}
                    </Badge>
                  </div>
                </div>
                <div className="detail-item mb-3">
                  <label className="detail-label text-muted">Customer ID</label>
                  <div className="detail-value">
                    <Badge bg="secondary" className="px-3 py-2">
                      #{booking.userId || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Service Provider Information */}
          <Col md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <h5 className="mb-3 text-primary border-bottom pb-2">
                  <FaUserTie className="me-2" />
                  Service Provider Information
                </h5>
                <div className="detail-item mb-3">
                  <label className="detail-label text-muted">Provider Name</label>
                  <div className="detail-value fw-bold">{booking.labourName || 'N/A'}</div>
                </div>
                <div className="detail-item mb-3">
                  <label className="detail-label text-muted">
                    <FaPhone className="me-2" />
                    Mobile Number
                  </label>
                  <div className="detail-value">
                    <Badge bg="info" className="px-3 py-2">
                      {booking.labourMobileNo || 'N/A'}
                    </Badge>
                  </div>
                </div>
                <div className="detail-item mb-3">
                  <label className="detail-label text-muted">Provider ID</label>
                  <div className="detail-value">
                    <Badge bg="secondary" className="px-3 py-2">
                      #{booking.labourId || 'N/A'}
                    </Badge>
                  </div>
                </div>
                <div className="detail-item mb-3">
                  <label className="detail-label text-muted">
                    <FaTools className="me-2" />
                    Skill Category
                  </label>
                  <div className="detail-value">
                    <Badge bg="success" className="px-3 py-2">
                      {booking.labourSkill || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Additional Details Section */}
        {(booking.workDescription || booking.urgencyLevel) && (
          <Card className="mt-4 border-0 shadow-sm">
            <Card.Body>
              <h5 className="mb-3 text-primary border-bottom pb-2">
                <FaFileAlt className="me-2" />
                Additional Details
              </h5>
              <Row className="g-3">
                {booking.workDescription && (
                  <Col md={12}>
                    <div className="detail-item">
                      <label className="detail-label text-muted">Work Description</label>
                      <div className="detail-value bg-light p-3 rounded border">
                        {booking.workDescription}
                      </div>
                    </div>
                  </Col>
                )}
                {booking.urgencyLevel && (
                  <Col md={6}>
                    <div className="detail-item">
                      <label className="detail-label text-muted">Urgency Level</label>
                      <div className="detail-value">
                        {getUrgencyBadge(booking.urgencyLevel)}
                      </div>
                    </div>
                  </Col>
                )}
                {booking.amount && (
                  <Col md={6}>
                    <div className="detail-item">
                      <label className="detail-label text-muted">Amount</label>
                      <div className="detail-value fw-bold text-success">
                        ₹{booking.amount}
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-light border-top">
        <Button variant="secondary" onClick={toggle} className="px-4">
          Close
        </Button>
      </Modal.Footer>
      <style>{`
        .booking-details-modal .modal-content {
          border-radius: 15px;
          border: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        .booking-details-modal .detail-item {
          margin-bottom: 1rem;
        }
        .booking-details-modal .detail-label {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          display: block;
        }
        .booking-details-modal .detail-value {
          font-size: 0.95rem;
          color: #374151;
        }
        .booking-details-modal .booking-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .booking-details-modal .modal-header {
          border-radius: 15px 15px 0 0;
        }
        .booking-details-modal .modal-footer {
          border-radius: 0 0 15px 15px;
        }
        .booking-details-modal .card {
          transition: all 0.2s ease;
        }
        .booking-details-modal .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        .booking-details-modal .badge {
          font-weight: 500;
          letter-spacing: 0.5px;
        }
      `}</style>
    </Modal>
  );
};

export default BookingDetailsModal; 