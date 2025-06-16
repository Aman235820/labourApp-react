import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Spinner, Alert } from 'react-bootstrap';
import { FaUser, FaPhone, FaTools, FaStar, FaSignOutAlt, FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle, FaHistory, FaSort } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { labourService } from '../services/labourService';
import axios from 'axios';
import '../styles/LabourDashboard.css';

const LabourDashboard = () => {
  const location = useLocation();
  const { reviews } = location.state || {};
  const [labourDetails, setLabourDetails] = useState(null);
  const [requestedServices, setRequestedServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    sortBy: 'reviewTime',
    sortOrder: 'desc'
  });
  const navigate = useNavigate();

  useEffect(() => {
    const storedDetails = localStorage.getItem('labourDetails');
    if (!storedDetails) {
      navigate('/labourLogin');
      return;
    }
    setLabourDetails(JSON.parse(storedDetails));
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    fetchRequestedServices();
  }, [labourDetails]);

  const fetchRequestedServices = async () => {
    try {
      setIsLoading(true);
      const response = await labourService.getRequestedServices(labourDetails?.labourId);
      
      if (response && response.returnValue) {
        setRequestedServices(response.returnValue);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const response = await labourService.updateBookingStatus(
        labourDetails.labourId,
        bookingId,
        newStatus
      );

      if (response && response.returnValue) {
        // Refresh the services list after successful update
        await fetchRequestedServices();
      }
    } catch (error) {
      console.error('Error updating service status:', error);
      setError('Failed to update service status');
    }
  };

  const handleSortChange = (e) => {
    const { name, value } = e.target;
    setSortConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('labourDetails');
    navigate('/labourLogin');
  };

  const getStatusBadge = (statusCode) => {
    switch (statusCode) {
      case -1:
        return <Badge bg="danger" className="px-3 py-2"><FaTimesCircle className="me-1" /> Rejected</Badge>;
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!labourDetails) {
    return <Alert variant="warning">No labour details found</Alert>;
  }

  return (
    <Container className="dashboard-container">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center dashboard-header">
            <div>
              <h2 className="display-6 mb-1">Welcome back,</h2>
              <h1 className="display-5 fw-bold text-primary">{labourDetails.labourName}</h1>
            </div>
            <Button 
              variant="outline-danger" 
              onClick={handleLogout}
              className="d-flex align-items-center logout-btn"
            >
              <FaSignOutAlt className="me-2" />
              Logout
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm profile-card">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <div className="profile-avatar mb-3">
                  <FaUser className="profile-icon" />
                </div>
                <h3 className="mb-1">{labourDetails.labourName}</h3>
                <p className="text-muted mb-0">ID: {labourDetails.labourId}</p>
              </div>

              <div className="border-top pt-4">
                <div className="info-item mb-3">
                  <FaPhone className="info-icon" />
                  <span>{labourDetails.labourMobileNo}</span>
                </div>
                <div className="info-item mb-3">
                  <FaTools className="info-icon" />
                  <span>{labourDetails.labourSkill}</span>
                </div>
                <div className="info-item">
                  <FaStar className="rating-star" />
                  <span>{labourDetails.rating || 0} ({labourDetails.ratingCount || 0} ratings)</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="h-100 shadow-sm stats-card">
            <Card.Body className="p-4">
              <h5 className="card-title mb-4">Rating Overview</h5>
              <div className="rating-overview">
                <div className="d-flex align-items-center mb-3">
                  <div className="rating-number me-3">
                    <h2 className="mb-0 fw-bold">{labourDetails.rating || 0}</h2>
                    <div className="stars">
                      {renderStars(labourDetails.rating || 0)}
                    </div>
                  </div>
                  <div className="rating-stats">
                    <p className="mb-1">Total Ratings: {labourDetails.ratingCount || 0}</p>
                    <p className="mb-0 review-count">Based on {labourDetails.ratingCount || 0} reviews</p>
                  </div>
                </div>
              </div>

              <div className="booking-stats mt-4">
                <h5 className="card-title mb-4">Booking Statistics</h5>
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="stat-card p-3 bg-light rounded shadow-sm">
                      <h6 className="text-dark mb-2 fw-bold">Total Bookings</h6>
                      <h4 className="mb-0 text-primary fw-bold">{requestedServices.length}</h4>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-card p-3 bg-light rounded shadow-sm">
                      <h6 className="text-dark mb-2 fw-bold">Accepted Bookings</h6>
                      <h4 className="mb-0 text-success fw-bold">{requestedServices.filter(service => service.bookingStatusCode === 2).length}</h4>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-card p-3 bg-light rounded shadow-sm">
                      <h6 className="text-dark mb-2 fw-bold">Completed Bookings</h6>
                      <h4 className="mb-0 text-info fw-bold">{requestedServices.filter(service => service.bookingStatusCode === 3).length}</h4>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-card p-3 bg-light rounded shadow-sm">
                      <h6 className="text-dark mb-2 fw-bold">Rejected Bookings</h6>
                      <h4 className="mb-0 text-danger fw-bold">{requestedServices.filter(service => service.bookingStatusCode === -1).length}</h4>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="stat-card p-3 bg-light rounded shadow-sm">
                      <h6 className="text-dark mb-2 fw-bold">Pending Bookings</h6>
                      <h4 className="mb-0 text-warning fw-bold">{requestedServices.filter(service => service.bookingStatusCode === 1).length}</h4>
                    </div>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm pending-actions-card">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <FaClock className="me-2 text-warning" style={{ fontSize: '1.5rem' }} />
                  <h5 className="card-title mb-0">Pending Actions</h5>
                </div>
                <Badge bg="warning" className="pending-count">
                  {requestedServices.filter(service => service.bookingStatusCode !== 3).length} Pending
                </Badge>
              </div>

              {requestedServices.filter(service => service.bookingStatusCode !== 3).length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="align-middle pending-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Client</th>
                        <th>Service</th>
                        <th>Phone</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requestedServices
                        .filter(service => service.bookingStatusCode !== 3)
                        .map((service) => (
                          <tr key={service.bookingId}>
                            <td className="fw-bold">#{service.bookingId}</td>
                            <td>{service.userName || 'Anonymous'}</td>
                            <td>{service.labourSkill}</td>
                            <td>{service.userMobileNumber}</td>
                            <td>{formatDate(service.bookingTime)}</td>
                            <td>{getStatusBadge(service.bookingStatusCode)}</td>
                            <td>
                              {service.bookingStatusCode === 1 && (
                                <div className="d-flex gap-2">
                                  <Button 
                                    variant="success" 
                                    size="sm"
                                    onClick={() => handleStatusUpdate(service.bookingId, 2)}
                                  >
                                    Accept
                                  </Button>
                                  <Button 
                                    variant="danger" 
                                    size="sm"
                                    onClick={() => handleStatusUpdate(service.bookingId, -1)}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                              {service.bookingStatusCode === 2 && (
                                <Button 
                                  variant="primary" 
                                  size="sm"
                                  onClick={() => handleStatusUpdate(service.bookingId, 3)}
                                >
                                  Mark Complete
                                </Button>
                              )}
                              {service.bookingStatusCode === -1 && (
                                <Button 
                                  variant="success" 
                                  size="sm"
                                  onClick={() => handleStatusUpdate(service.bookingId, 2)}
                                >
                                  Accept Again
                                </Button>
                              )}
                              {service.bookingStatusCode === 3 && (
                                <span className="text-muted">Completed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No pending actions</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm reviews-card">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <FaStar className="me-2 text-warning" style={{ fontSize: '1.5rem' }} />
                  <h5 className="card-title mb-0">Recent Reviews</h5>
                </div>
                <div className="d-flex gap-2">
                  <Form.Select
                    name="sortBy"
                    value={sortConfig.sortBy}
                    onChange={handleSortChange}
                    className="sort-select"
                    size="sm"
                  >
                    <option value="reviewTime">Sort by Date</option>
                    <option value="rating">Sort by Rating</option>
                  </Form.Select>
                  <Form.Select
                    name="sortOrder"
                    value={sortConfig.sortOrder}
                    onChange={handleSortChange}
                    className="sort-select"
                    size="sm"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </Form.Select>
                </div>
              </div>

              {reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.map((review, index) => (
                    <div key={index} className="review-item p-3 mb-3 bg-light rounded shadow-sm">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center">
                          <div className="reviewer-avatar me-3">
                            <FaUser className="text-primary" style={{ fontSize: '2rem' }} />
                          </div>
                          <div>
                            <div className="stars mb-1">
                              {renderStars(review.rating)}
                            </div>
                            <h6 className="mb-0 fw-bold">
                              {review.userName || <span className="text-muted">Anonymous</span>}
                            </h6>
                          </div>
                        </div>
                        <div className="review-date text-end">
                          <small className="text-muted d-block">
                            {new Date(review.reviewTime).toLocaleDateString()}
                          </small>
                        </div>
                      </div>
                      {review.review && (
                        <div className="review-content mt-3">
                          <div className="review-text-container p-3 bg-white rounded">
                            <p className="mb-0 review-text" style={{ 
                              fontSize: '0.95rem',
                              lineHeight: '1.6',
                              color: '#444',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word'
                            }}>
                              {review.review}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-5">
                  <FaStar className="text-muted mb-3" style={{ fontSize: '3rem' }} />
                  <p className="text-muted mb-0">No reviews yet</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm booking-card">
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center">
                  <FaHistory className="me-2 text-primary" style={{ fontSize: '1.5rem' }} />
                  <h5 className="card-title mb-0">Booking History</h5>
                </div>
                <Button 
                  variant="outline-primary" 
                  onClick={fetchRequestedServices}
                  disabled={isLoading}
                  className="refresh-btn"
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Refreshing...
                    </>
                  ) : (
                    'Refresh'
                  )}
                </Button>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {requestedServices.length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="align-middle booking-table">
                    <thead>
                      <tr>
                        <th>Booking ID</th>
                        <th>Client</th>
                        <th>Service</th>
                        <th>Phone</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {requestedServices.map((service) => (
                        <tr key={service.bookingId}>
                          <td className="fw-bold">#{service.bookingId}</td>
                          <td>{service.userName || 'Anonymous'}</td>
                          <td>{service.labourSkill}</td>
                          <td>{service.userMobileNumber}</td>
                          <td>{formatDate(service.bookingTime)}</td>
                          <td>{getStatusBadge(service.bookingStatusCode)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted mb-0">No service requests found.</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LabourDashboard; 