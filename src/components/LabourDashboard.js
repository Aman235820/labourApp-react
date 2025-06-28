import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Spinner, Alert } from 'react-bootstrap';
import { FaUser, FaPhone, FaTools, FaStar, FaSignOutAlt, FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle, FaHistory, FaSort, FaEdit } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { labourService } from '../services/labourService';
import axios from 'axios';
import UpdateLabourModal from './UpdateLabourModal';
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
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedDetails = localStorage.getItem('labour');
    if (!storedDetails) {
      navigate('/labourLogin');
      return;
    }
    setLabourDetails(JSON.parse(storedDetails));
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    fetchRequestedServices(true);
  }, [labourDetails]);

  const fetchRequestedServices = async (initial = false) => {
    try {
      if (initial) setIsLoading(true);
      const response = await labourService.getRequestedServices(labourDetails?.labourId);
      
      if (response && response.returnValue) {
        setRequestedServices(response.returnValue);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      if (initial) setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setStatusUpdatingId(bookingId);
      const response = await labourService.updateBookingStatus(
        labourDetails.labourId,
        bookingId,
        newStatus
      );

      if (response && response.returnValue) {
        await fetchRequestedServices(false);
      }
    } catch (error) {
      console.error('Error updating service status:', error);
      setError('Failed to update service status');
    } finally {
      setStatusUpdatingId(null);
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
    localStorage.removeItem('labour');
    navigate('/labourLogin');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      setIsLoading(true);
      await labourService.deleteLabour(labourDetails.labourId);
      localStorage.removeItem('labour');
      alert('Your account has been deleted.');
      navigate('/labourLogin');
    } catch (err) {
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDetails = () => {
    setShowUpdateModal(true);
  };

  const handleUpdateSuccess = (updatedDetails) => {
    setLabourDetails(updatedDetails);
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
        <Col lg={5} className="mb-4">
          <Card className="h-100 shadow-lg profile-card border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-5">
                <div className="profile-avatar mb-4">
                  <div className="avatar-circle">
                    <FaUser className="profile-icon" />
                  </div>
                </div>
                <h2 className="mb-2 fw-bold text-primary">{labourDetails.labourName}</h2>
                <p className="text-muted mb-0 fs-6">Labour ID: {labourDetails.labourId}</p>
              </div>

              <div className="border-top pt-4">
                <div className="info-item mb-4">
                  <div className="d-flex align-items-center p-3 bg-light rounded-3">
                    <div className="info-icon-wrapper me-3">
                      <FaPhone className="info-icon" />
                    </div>
                    <div>
                      <small className="text-muted d-block">Mobile Number</small>
                      <span className="fw-semibold">{labourDetails.labourMobileNo}</span>
                    </div>
                  </div>
                </div>
                
                <div className="info-item mb-4">
                  <div className="d-flex align-items-center p-3 bg-light rounded-3">
                    <div className="info-icon-wrapper me-3">
                      <FaTools className="info-icon" />
                    </div>
                    <div>
                      <small className="text-muted d-block">Primary Skill</small>
                      <span className="fw-semibold">{labourDetails.labourSkill}</span>
                    </div>
                  </div>
                </div>
                
                {Array.isArray(labourDetails.labourSubSkills) && labourDetails.labourSubSkills.length > 0 && (
                  <div className="info-item mb-4">
                    <div className="p-3 bg-light rounded-3">
                      <div className="d-flex align-items-center mb-3">
                        <div className="info-icon-wrapper me-3">
                          <FaTools className="info-icon" />
                        </div>
                        <div>
                          <small className="text-muted d-block">Sub Skills</small>
                          <span className="fw-semibold">Specializations</span>
                        </div>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        {labourDetails.labourSubSkills.map((sub, idx) => (
                          <span key={sub.subSkillId || idx} className="badge bg-primary text-white" style={{ fontSize: '0.9em', padding: '0.6em 1em', borderRadius: '1.5em' }}>
                            {sub.subSkillName}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="info-item mb-4">
                  <div className="d-flex align-items-center p-3 bg-light rounded-3">
                    <div className="info-icon-wrapper me-3">
                      <FaStar className="info-icon text-warning" />
                    </div>
                    <div>
                      <small className="text-muted d-block">Rating</small>
                      <span className="fw-semibold">{labourDetails.rating || 0} ({labourDetails.ratingCount || 0} ratings)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-5">
                <Button
                  variant="primary"
                  size="lg"
                  className="d-flex align-items-center justify-content-center w-100 mb-3 fw-semibold"
                  onClick={handleUpdateDetails}
                >
                  <FaEdit className="me-2" />
                  Update Profile Details
                </Button>
                <Button
                  variant="outline-danger"
                  size="lg"
                  className="d-flex align-items-center justify-content-center w-100 fw-semibold"
                  onClick={handleDeleteAccount}
                  disabled={isLoading}
                >
                  Delete Account
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7}>
          <Card className="h-100 shadow-lg stats-card border-0">
            <Card.Body className="p-5">
              <h4 className="card-title mb-4 fw-bold text-primary">Rating Overview</h4>
              <div className="rating-overview">
                <div className="row">
                  <div className="col-md-6">
                    <div className="rating-number">
                      <h1 className="mb-0">{labourDetails.rating || 0}</h1>
                      <div className="stars">
                        {renderStars(labourDetails.rating || 0)}
                      </div>
                      <small>Overall Rating</small>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="rating-stats">
                      <h6>Performance Summary</h6>
                      <p>Total Ratings: <span className="fw-semibold">{labourDetails.ratingCount || 0}</span></p>
                      <p>Based on <span className="text-dark">{labourDetails.ratingCount || 0}</span> customer reviews</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="booking-stats">
                <h4 className="card-title">Booking Statistics</h4>
                <div className="row g-4">
                  <div className="col-md-6 col-lg-4">
                    <div className="stat-card p-4 bg-primary">
                      <div className="d-flex align-items-center">
                        <div className="stat-icon me-3">
                          <div className="bg-primary text-white rounded-circle p-2">
                            <span>{(requestedServices || []).length}</span>
                          </div>
                        </div>
                        <div>
                          <h6>Total Bookings</h6>
                          <p>All time</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="stat-card p-4 bg-success">
                      <div className="d-flex align-items-center">
                        <div className="stat-icon me-3">
                          <div className="bg-success text-white rounded-circle p-2">
                            <span>{(requestedServices || []).filter(service => service.bookingStatusCode === 2).length}</span>
                          </div>
                        </div>
                        <div>
                          <h6>Accepted</h6>
                          <p>Bookings</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="stat-card p-4 bg-info">
                      <div className="d-flex align-items-center">
                        <div className="stat-icon me-3">
                          <div className="bg-info text-white rounded-circle p-2">
                            <span>{(requestedServices || []).filter(service => service.bookingStatusCode === 3).length}</span>
                          </div>
                        </div>
                        <div>
                          <h6>Completed</h6>
                          <p>Bookings</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="stat-card p-4 bg-danger">
                      <div className="d-flex align-items-center">
                        <div className="stat-icon me-3">
                          <div className="bg-danger text-white rounded-circle p-2">
                            <span>{(requestedServices || []).filter(service => service.bookingStatusCode === -1).length}</span>
                          </div>
                        </div>
                        <div>
                          <h6>Rejected</h6>
                          <p>Bookings</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="stat-card p-4 bg-warning">
                      <div className="d-flex align-items-center">
                        <div className="stat-icon me-3">
                          <div className="bg-warning text-white rounded-circle p-2">
                            <span>{(requestedServices || []).filter(service => service.bookingStatusCode === 1).length}</span>
                          </div>
                        </div>
                        <div>
                          <h6>Pending</h6>
                          <p>Bookings</p>
                        </div>
                      </div>
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
          <Card className="shadow-lg pending-actions-card border-0">
            <Card.Body className="p-5">
              <div className="d-flex justify-content-between align-items-center mb-5">
                <div className="d-flex align-items-center">
                  <div className="section-icon-wrapper me-3">
                    <FaClock className="section-icon" />
                  </div>
                  <div>
                    <h3 className="card-title mb-1 fw-bold text-primary">Pending Actions</h3>
                    <p className="text-muted mb-0">Manage your service requests and bookings</p>
                  </div>
                </div>
                <div className="d-flex align-items-center">
                  <Badge bg="warning" className="pending-count fs-6 px-3 py-2">
                    {(requestedServices || []).filter(service => service.bookingStatusCode !== 3).length} Pending Requests
                  </Badge>
                </div>
              </div>

              {(requestedServices || []).filter(service => service.bookingStatusCode !== 3).length > 0 ? (
                <div className="table-responsive">
                  <Table hover className="align-middle pending-table">
                    <thead>
                      <tr className="table-header">
                        <th className="fw-bold text-primary">Booking ID</th>
                        <th className="fw-bold text-primary">Client Details</th>
                        <th className="fw-bold text-primary">Service Type</th>
                        <th className="fw-bold text-primary">Contact</th>
                        <th className="fw-bold text-primary">Request Date</th>
                        <th className="fw-bold text-primary">Current Status</th>
                        <th className="fw-bold text-primary text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(requestedServices || []).filter(service => service.bookingStatusCode !== 3).map((service) => (
                        <tr key={service.bookingId} className="table-row">
                          <td className="fw-bold fs-6">#{service.bookingId}</td>
                          <td>
                            <div>
                              <div className="fw-semibold">{service.userName || 'Anonymous'}</div>
                              <small className="text-muted">Customer</small>
                            </div>
                          </td>
                          <td>
                            <Badge bg="info" className="px-3 py-2">
                              {service.labourSkill}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <FaPhone className="me-2 text-muted" />
                              <span className="fw-semibold">{service.userMobileNumber}</span>
                            </div>
                          </td>
                          <td>
                            <div>
                              <div className="fw-semibold">{formatDate(service.bookingTime)}</div>
                              <small className="text-muted">Requested</small>
                            </div>
                          </td>
                          <td>{getStatusBadge(service.bookingStatusCode)}</td>
                          <td>
                            <div className="d-flex gap-2 justify-content-center">
                              {service.bookingStatusCode === 1 && (
                                <>
                                  <Button 
                                    variant="success" 
                                    size="sm"
                                    className="action-btn accept-btn"
                                    onClick={() => handleStatusUpdate(service.bookingId, 2)}
                                    disabled={statusUpdatingId === service.bookingId}
                                  >
                                    {statusUpdatingId === service.bookingId ? (
                                      <Spinner as="span" animation="border" size="sm" />
                                    ) : (
                                      <>
                                        <FaCheckCircle className="me-1" />
                                        Accept
                                      </>
                                    )}
                                  </Button>
                                  <Button 
                                    variant="danger" 
                                    size="sm"
                                    className="action-btn reject-btn"
                                    onClick={() => handleStatusUpdate(service.bookingId, -1)}
                                    disabled={statusUpdatingId === service.bookingId}
                                  >
                                    {statusUpdatingId === service.bookingId ? (
                                      <Spinner as="span" animation="border" size="sm" />
                                    ) : (
                                      <>
                                        <FaTimesCircle className="me-1" />
                                        Reject
                                      </>
                                    )}
                                  </Button>
                                </>
                              )}
                              {service.bookingStatusCode === 2 && (
                                <Button 
                                  variant="primary" 
                                  size="sm"
                                  className="action-btn complete-btn"
                                  onClick={() => handleStatusUpdate(service.bookingId, 3)}
                                  disabled={statusUpdatingId === service.bookingId}
                                >
                                  {statusUpdatingId === service.bookingId ? (
                                    <Spinner as="span" animation="border" size="sm" />
                                  ) : (
                                    <>
                                      <FaCheckCircle className="me-1" />
                                      Mark Complete
                                    </>
                                  )}
                                </Button>
                              )}
                              {service.bookingStatusCode === -1 && (
                                <Button 
                                  variant="success" 
                                  size="sm"
                                  className="action-btn accept-again-btn"
                                  onClick={() => handleStatusUpdate(service.bookingId, 2)}
                                  disabled={statusUpdatingId === service.bookingId}
                                >
                                  {statusUpdatingId === service.bookingId ? (
                                    <Spinner as="span" animation="border" size="sm" />
                                  ) : (
                                    <>
                                      <FaCheckCircle className="me-1" />
                                      Accept Again
                                    </>
                                  )}
                                </Button>
                              )}
                              {service.bookingStatusCode === 3 && (
                                <span className="text-success fw-semibold">
                                  <FaCheckCircle className="me-1" />
                                  Completed
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="empty-state">
                    <FaClock className="empty-icon mb-3" />
                    <h5 className="text-muted mb-2">No Pending Actions</h5>
                    <p className="text-muted mb-0">All your service requests have been processed</p>
                  </div>
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

              {(reviews || []).length > 0 ? (
                <div className="reviews-list">
                  {(reviews || []).map((review, index) => (
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
                  onClick={() => fetchRequestedServices(true)}
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

              {(requestedServices || []).length > 0 ? (
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
                      {(requestedServices || []).map((service) => (
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

      <UpdateLabourModal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        labourDetails={labourDetails}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </Container>
  );
};

export default LabourDashboard; 