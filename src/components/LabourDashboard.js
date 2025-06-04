import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form } from 'react-bootstrap';
import { FaUser, FaPhone, FaTools, FaStar, FaSignOutAlt, FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle, FaHistory, FaSort } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { labourService } from '../services/labourService';
import '../styles/LabourDashboard.css';

function LabourDashboard() {
  const [labourDetails, setLabourDetails] = useState(null);
  const [requestedServices, setRequestedServices] = useState([]);
  const [reviews, setReviews] = useState([]);
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
    const parsedDetails = JSON.parse(storedDetails);
    setLabourDetails(parsedDetails);
    fetchRequestedServices();
  }, [navigate]);

  // Separate useEffect for fetching reviews when labourDetails changes
  useEffect(() => {
    if (labourDetails?.labourId) {
      fetchReviews();
    }
  }, [labourDetails, sortConfig]);

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

  const fetchReviews = async () => {
    try {
      setIsReviewsLoading(true);
      const response = await labourService.getReviews(
        labourDetails.labourId,
        sortConfig.sortBy,
        sortConfig.sortOrder
      );
      
      if (response && response.returnValue) {
        setReviews(response.returnValue);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('Failed to fetch reviews');
    } finally {
      setIsReviewsLoading(false);
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
    localStorage.removeItem('isLabourLoggedIn');
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

  if (!labourDetails) {
    return null;
  }

  return (
    <Container className="py-5 dashboard-container">
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
                      {[...Array(5)].map((_, index) => (
                        <FaStar 
                          key={index} 
                          className={index < Math.floor(labourDetails.rating || 0) ? "text-warning" : "text-muted"}
                          style={{ fontSize: '1.2rem' }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="rating-stats">
                    <p className="mb-1">Total Ratings: {labourDetails.ratingCount || 0}</p>
                    <p className="mb-0 review-count">Based on {labourDetails.ratingCount || 0} reviews</p>
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
                <h5 className="card-title mb-0">Recent Reviews</h5>
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

              {isReviewsLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : reviews.length > 0 ? (
                <div className="reviews-list">
                  {reviews.map((review, index) => (
                    <div key={index} className="review-item mb-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div>
                          <div className="stars mb-1">
                            {[...Array(5)].map((_, i) => (
                              <FaStar 
                                key={i} 
                                className={i < review.rating ? "text-warning" : "text-muted"}
                                style={{ fontSize: '0.9rem' }}
                              />
                            ))}
                          </div>
                          <p className="mb-0 fw-bold">
                            {review.userName || <span className="anonymous-text">Anonymous</span>}
                          </p>
                        </div>
                        <small className="text-muted">
                          {new Date(review.reviewTime).toLocaleDateString()}
                        </small>
                      </div>
                      {review.review && (
                        <p className="review-text mb-0 mt-2">{review.review}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-3">
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
}

export default LabourDashboard; 