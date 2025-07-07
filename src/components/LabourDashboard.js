import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Spinner, Alert, ProgressBar, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { FaUser, FaPhone, FaTools, FaStar, FaSignOutAlt, FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle, FaHistory, FaSort, FaEdit, FaIdCard, FaSync, FaChartLine, FaChartBar, FaAward, FaEye, FaQuoteLeft, FaThumbsUp, FaUserTie, FaBusinessTime, FaHandshake, FaTrashAlt, FaCog, FaList } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { labourService } from '../services/labourService';
import axios from 'axios';
import UpdateLabourModal from './UpdateLabourModal';
import '../styles/LabourDashboard.css';

const LabourDashboard = () => {
  const location = useLocation();
  const [labourDetails, setLabourDetails] = useState(null);
  const [requestedServices, setRequestedServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [overallRating, setOverallRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [isRatingsLoading, setIsRatingsLoading] = useState(false);
  const [isServicesRefreshing, setIsServicesRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    sortBy: 'reviewTime',
    sortOrder: 'desc'
  });
  const [bookingSortConfig, setBookingSortConfig] = useState({
    sortBy: 'bookingTime',
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
    
    const parsedDetails = JSON.parse(storedDetails);
    setLabourDetails(parsedDetails);
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (labourDetails) {
      fetchRequestedServices(true);
      fetchReviews();
      fetchOverallRatings();
    }
  }, [labourDetails]);

  useEffect(() => {
    if (labourDetails) {
      fetchReviews();
    }
  }, [sortConfig, labourDetails]);

  const fetchRequestedServices = async (initial = false) => {
    try {
      if (initial) {
        setIsLoading(true);
      } else {
        setIsServicesRefreshing(true);
      }
      
      const response = await labourService.getRequestedServices(labourDetails?.labourId);
      
      if (response && response.returnValue) {
        setRequestedServices(response.returnValue);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      if (initial) {
        setIsLoading(false);
      } else {
        setIsServicesRefreshing(false);
      }
    }
  };

  const fetchReviews = async () => {
    try {
      setIsReviewsLoading(true);
      const response = await labourService.getReviews(
        labourDetails?.labourId,
        sortConfig.sortBy,
        sortConfig.sortOrder
      );
      
      if (response && response.returnValue) {
        setReviews(response.returnValue);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setIsReviewsLoading(false);
    }
  };

  const fetchOverallRatings = async () => {
    try {
      setIsRatingsLoading(true);
      const response = await labourService.getOverallRatings(labourDetails?.labourId);
      
      if (response && response.returnValue && !response.hasError) {
        const rating = parseFloat(response.returnValue.overallRating) || 0;
        const count = parseInt(response.returnValue.ratingCount) || 0;
        
        setOverallRating(rating);
        setRatingCount(count);
      } else {
        setOverallRating(0);
        setRatingCount(0);
      }
    } catch (error) {
      console.error('Error fetching overall ratings:', error);
      setOverallRating(0);
      setRatingCount(0);
    } finally {
      setIsRatingsLoading(false);
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

  const handleBookingSortChange = (e) => {
    const { name, value } = e.target;
    setBookingSortConfig(prev => ({
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

  const handleAadhaarVerification = () => {
    navigate('/aadhar');
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
    if (!dateString) return 'N/A';
    
    try {
      let date;
      
      // Handle DD-MM-YYYY format (convert to YYYY-MM-DD for proper parsing)
      if (dateString.match(/^\d{2}-\d{2}-\d{4}/)) {
        const parts = dateString.split(' ');
        const datePart = parts[0]; // "06-07-2025"
        const timePart = parts[1] || '00:00:00'; // "13:25:19" or default
        
        const [day, month, year] = datePart.split('-');
        const isoString = `${year}-${month}-${day}T${timePart}`;
        date = new Date(isoString);
      } else {
        // Handle YYYY-MM-DD format or other standard formats
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      // Format: DD MMM YY
      const day = date.getDate().toString().padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const year = date.getFullYear().toString().slice(-2);
      
      return `${day} ${month} ${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  const getSortedServices = () => {
    if (!requestedServices || requestedServices.length === 0) return [];
    
    const sorted = [...requestedServices].sort((a, b) => {
      const { sortBy, sortOrder } = bookingSortConfig;
      
      if (sortBy === 'bookingTime') {
        const dateA = new Date(a.bookingTime);
        const dateB = new Date(b.bookingTime);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
      
      return 0;
    });
    
    return sorted;
  };

  // Analytics helper functions
  const getAnalytics = () => {
    const services = requestedServices || [];
    const total = services.length;
    const completed = services.filter(s => s.bookingStatusCode === 3).length;
    const accepted = services.filter(s => s.bookingStatusCode === 2).length;
    const pending = services.filter(s => s.bookingStatusCode === 1).length;
    const rejected = services.filter(s => s.bookingStatusCode === -1).length;
    
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const acceptanceRate = total > 0 ? ((accepted + completed) / total) * 100 : 0;
    const responseRate = total > 0 ? ((total - pending) / total) * 100 : 0;
    const rejectionRate = total > 0 ? (rejected / total) * 100 : 0;
    
    return {
      total,
      completed,
      accepted,
      pending,
      rejected,
      completionRate,
      acceptanceRate,
      responseRate,
      rejectionRate
    };
  };

  const getRatingDistribution = () => {
    const reviewsList = reviews || [];
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    reviewsList.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
      }
    });
    
    return distribution;
  };

  const getRecentActivityData = () => {
    const services = requestedServices || [];
    const last30Days = services.filter(service => {
      const serviceDate = new Date(service.bookingTime);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return serviceDate >= thirtyDaysAgo;
    });
    
    return {
      recentBookings: last30Days.length,
      recentCompleted: last30Days.filter(s => s.bookingStatusCode === 3).length,
      recentRating: reviews && reviews.length > 0 ? 
        reviews.slice(0, 5).reduce((sum, r) => sum + r.rating, 0) / Math.min(5, reviews.length) : 0
    };
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
    <Container fluid className="dashboard-container bg-light min-vh-100">
      {/* Professional Header */}
      <div className="dashboard-header bg-white shadow-sm border-bottom">
        <Container>
          <Row className="py-3 py-md-4">
            <Col>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                <div className="d-flex align-items-center mb-3 mb-md-0 w-100 w-md-auto">
                  <div className="profile-badge me-3 me-md-4">
                    <div className="avatar-professional">
                      <FaUserTie className="text-primary" size={24} />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h1 className="h4 h-md-3 mb-1 fw-bold text-dark">{labourDetails.labourName}</h1>
                    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center text-muted mb-2 gap-2 gap-sm-3">
                      <span className="small">ID: {labourDetails.labourId}</span>
                      <Badge bg="primary" className="me-0 me-sm-3">{labourDetails.labourSkill}</Badge>
                      <div className="d-flex align-items-center">
                        <FaStar className="text-warning me-1" size={14} />
                        <span className="fw-semibold">{overallRating.toFixed(1)}</span>
                        <span className="text-muted ms-1">({ratingCount})</span>
                      </div>
                    </div>
                    {/* Subskills Section */}
                    {labourDetails.labourSubSkills && labourDetails.labourSubSkills.length > 0 && (
                      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center">
                        <div className="d-flex align-items-center mb-1 mb-sm-0">
                          <FaList className="text-muted me-2" size={12} />
                          <span className="text-muted small me-2">Specializations:</span>
                        </div>
                        <div className="d-flex flex-wrap gap-1">
                          {labourDetails.labourSubSkills.map((subSkill, index) => (
                            <Badge 
                              key={index} 
                              bg="light" 
                              text="dark" 
                              className="px-2 py-1 small"
                              style={{ fontSize: '0.7rem' }}
                            >
                              {typeof subSkill === 'string' ? subSkill : subSkill.subSkillName || subSkill.name || subSkill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="d-flex gap-2 align-self-stretch align-self-md-auto">
                  <Button 
                    variant="outline-primary" 
                    onClick={handleUpdateDetails}
                    className="d-flex align-items-center justify-content-center flex-grow-1 flex-md-grow-0"
                    size="sm"
                  >
                    <FaEdit className="me-1 me-md-2" size={14} />
                    <span className="d-none d-sm-inline">Edit Profile</span>
                    <span className="d-inline d-sm-none">Edit</span>
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    onClick={handleLogout}
                    className="d-flex align-items-center justify-content-center flex-grow-1 flex-md-grow-0"
                    size="sm"
                  >
                    <FaSignOutAlt className="me-1 me-md-2" size={14} />
                    <span className="d-none d-sm-inline">Logout</span>
                    <span className="d-inline d-sm-none">Exit</span>
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-2 py-md-4">
        {/* Analytics Dashboard */}
        <Row className="mb-3 mb-md-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0 fw-bold text-dark">
                    <FaChartLine className="me-2 text-primary" />
                    Performance Analytics
                  </h4>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      fetchRequestedServices(false);
                      fetchOverallRatings();
                    }}
                    disabled={isServicesRefreshing || isRatingsLoading}
                  >
                    {(isServicesRefreshing || isRatingsLoading) ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <FaSync className="me-2" />
                        Refresh Data
                      </>
                    )}
                  </Button>
                </div>
                
                {isRatingsLoading || isServicesRefreshing ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" className="text-primary mb-3" />
                    <p className="text-muted">Loading analytics...</p>
                  </div>
                ) : (
                  <Row>
                    <Col lg={12}>
                      <Row className="g-3">
                        {(() => {
                          const analytics = getAnalytics();
                          const activity = getRecentActivityData();
                          return (
                            <>
                              <Col xs={6} md={2}>
                                <div className="metric-card h-100 p-2 p-md-3 bg-primary bg-opacity-10 rounded">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                      <div className="metric-value text-primary fw-bold h5 h-md-4 mb-1">
                                        {analytics.total}
                                      </div>
                                      <div className="metric-label text-muted small">Total Bookings</div>
                                    </div>
                                    <FaBusinessTime className="text-primary opacity-75 d-none d-md-block" size={20} />
                                    <FaBusinessTime className="text-primary opacity-75 d-block d-md-none" size={16} />
                                  </div>
                                </div>
                              </Col>
                              <Col xs={6} md={2}>
                                <div className="metric-card h-100 p-2 p-md-3 bg-success bg-opacity-10 rounded">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                      <div className="metric-value text-success fw-bold h5 h-md-4 mb-1">
                                        {analytics.completionRate.toFixed(1)}%
                                      </div>
                                      <div className="metric-label text-muted small">Completion Rate</div>
                                    </div>
                                    <FaCheckCircle className="text-success opacity-75 d-none d-md-block" size={20} />
                                    <FaCheckCircle className="text-success opacity-75 d-block d-md-none" size={16} />
                                  </div>
                                  <ProgressBar 
                                    variant="success" 
                                    now={analytics.completionRate} 
                                    className="mt-2" 
                                    style={{ height: '3px' }}
                                  />
                                </div>
                              </Col>
                              <Col xs={6} md={2}>
                                <div className="metric-card h-100 p-2 p-md-3 bg-info bg-opacity-10 rounded">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                      <div className="metric-value text-info fw-bold h5 h-md-4 mb-1">
                                        {analytics.acceptanceRate.toFixed(1)}%
                                      </div>
                                      <div className="metric-label text-muted small">Acceptance Rate</div>
                                    </div>
                                    <FaHandshake className="text-info opacity-75 d-none d-md-block" size={20} />
                                    <FaHandshake className="text-info opacity-75 d-block d-md-none" size={16} />
                                  </div>
                                  <ProgressBar 
                                    variant="info" 
                                    now={analytics.acceptanceRate} 
                                    className="mt-2" 
                                    style={{ height: '3px' }}
                                  />
                                </div>
                              </Col>
                              <Col xs={6} md={3}>
                                <div className="metric-card h-100 p-2 p-md-3 bg-danger bg-opacity-10 rounded">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                      <div className="metric-value text-danger fw-bold h5 h-md-4 mb-1">
                                        {analytics.rejectionRate.toFixed(1)}%
                                      </div>
                                      <div className="metric-label text-muted small">Rejection Rate</div>
                                    </div>
                                    <FaTimesCircle className="text-danger opacity-75 d-none d-md-block" size={20} />
                                    <FaTimesCircle className="text-danger opacity-75 d-block d-md-none" size={16} />
                                  </div>
                                  <ProgressBar 
                                    variant="danger" 
                                    now={analytics.rejectionRate} 
                                    className="mt-2" 
                                    style={{ height: '3px' }}
                                  />
                                </div>
                              </Col>
                              <Col xs={12} md={3}>
                                <div className="metric-card h-100 p-2 p-md-3 bg-warning bg-opacity-10 rounded">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                      <div className="metric-value text-warning fw-bold h5 h-md-4 mb-1">
                                        {activity.recentBookings}
                                      </div>
                                      <div className="metric-label text-muted small">Recent Bookings</div>
                                      <div className="metric-sublabel text-muted" style={{ fontSize: '0.7rem' }}>
                                        Last 30 Days
                                      </div>
                                    </div>
                                    <FaChartBar className="text-warning opacity-75 d-none d-md-block" size={20} />
                                    <FaChartBar className="text-warning opacity-75 d-block d-md-none" size={16} />
                                  </div>
                                </div>
                              </Col>
                            </>
                          );
                        })()}
                      </Row>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Pending Actions - Professional Table */}
        <Row className="mb-3 mb-md-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-3 p-md-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                  <h4 className="mb-0 fw-bold text-dark">
                    <FaClock className="me-2 text-primary" />
                    Service Requests
                  </h4>
                  <div className="d-flex align-items-center gap-2 gap-md-3">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => fetchRequestedServices(false)}
                      disabled={isServicesRefreshing}
                      className="d-flex align-items-center"
                    >
                      {isServicesRefreshing ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-1 me-md-2" />
                          <span className="d-none d-sm-inline">Refreshing...</span>
                          <span className="d-inline d-sm-none">...</span>
                        </>
                      ) : (
                        <>
                          <FaSync className="me-1 me-md-2" />
                          <span className="d-none d-sm-inline">Refresh</span>
                          <span className="d-inline d-sm-none">Sync</span>
                        </>
                      )}
                    </Button>
                    <Badge bg="warning" className="px-2 px-md-3 py-1 py-md-2">
                      {(requestedServices || []).filter(service => service.bookingStatusCode === 1).length} Pending
                    </Badge>
                  </div>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    <FaTimesCircle className="me-2" />
                    {error}
                  </Alert>
                )}

                {(requestedServices || []).length > 0 ? (
                  <>
                    {/* Desktop Table */}
                    <div className="table-responsive d-none d-lg-block">
                      <Table className="table-modern">
                        <thead>
                          <tr>
                            <th className="border-0 bg-light fw-semibold text-dark">Booking</th>
                            <th className="border-0 bg-light fw-semibold text-dark">Client</th>
                            <th className="border-0 bg-light fw-semibold text-dark">Service</th>
                            <th className="border-0 bg-light fw-semibold text-dark">Date</th>
                            <th className="border-0 bg-light fw-semibold text-dark">Status</th>
                            <th className="border-0 bg-light fw-semibold text-dark text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(requestedServices || []).map((service) => (
                            <tr key={service.bookingId} className="border-bottom">
                              <td className="py-3">
                                <div className="fw-bold text-primary">#{service.bookingId}</div>
                                <small className="text-muted">ID</small>
                              </td>
                              <td className="py-3">
                                <div className="d-flex align-items-center">
                                  <div className="avatar-sm bg-light rounded-circle me-3 d-flex align-items-center justify-content-center">
                                    <FaUser className="text-muted" size={14} />
                                  </div>
                                  <div>
                                    <div className="fw-semibold">{service.userName || 'Anonymous'}</div>
                                    <small className="text-muted">{service.userMobileNumber}</small>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3">
                                <Badge bg="primary" className="px-3 py-2">
                                  {service.labourSkill}
                                </Badge>
                              </td>
                              <td className="py-3">
                                <div className="fw-semibold">{formatDate(service.bookingTime)}</div>
                                <small className="text-muted">Requested</small>
                              </td>
                              <td className="py-3">
                                {getStatusBadge(service.bookingStatusCode)}
                              </td>
                              <td className="py-3 text-center">
                                <div className="d-flex gap-2 justify-content-center">
                                  {service.bookingStatusCode === 1 && (
                                    <>
                                      <Button 
                                        variant="success" 
                                        size="sm"
                                        onClick={() => handleStatusUpdate(service.bookingId, 2)}
                                        disabled={statusUpdatingId === service.bookingId}
                                        className="px-3"
                                      >
                                        {statusUpdatingId === service.bookingId ? (
                                          <Spinner as="span" animation="border" size="sm" />
                                        ) : (
                                          <>
                                            <FaCheckCircle className="me-1" size={12} />
                                            Accept
                                          </>
                                        )}
                                      </Button>
                                      <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={() => handleStatusUpdate(service.bookingId, -1)}
                                        disabled={statusUpdatingId === service.bookingId}
                                        className="px-3"
                                      >
                                        {statusUpdatingId === service.bookingId ? (
                                          <Spinner as="span" animation="border" size="sm" />
                                        ) : (
                                          <>
                                            <FaTimesCircle className="me-1" size={12} />
                                            Decline
                                          </>
                                        )}
                                      </Button>
                                    </>
                                  )}
                                  {service.bookingStatusCode === 2 && (
                                    <Button 
                                      variant="primary" 
                                      size="sm"
                                      onClick={() => handleStatusUpdate(service.bookingId, 3)}
                                      disabled={statusUpdatingId === service.bookingId}
                                      className="px-3"
                                    >
                                      {statusUpdatingId === service.bookingId ? (
                                        <Spinner as="span" animation="border" size="sm" />
                                      ) : (
                                        <>
                                          <FaCheckCircle className="me-1" size={12} />
                                          Complete
                                        </>
                                      )}
                                    </Button>
                                  )}
                                  {service.bookingStatusCode === 3 && (
                                    <Badge bg="success" className="px-3 py-2">
                                      <FaCheckCircle className="me-1" size={12} />
                                      Completed
                                    </Badge>
                                  )}
                                  {service.bookingStatusCode === -1 && (
                                    <Button 
                                      variant="outline-success" 
                                      size="sm"
                                      onClick={() => handleStatusUpdate(service.bookingId, 2)}
                                      disabled={statusUpdatingId === service.bookingId}
                                      className="px-3"
                                    >
                                      {statusUpdatingId === service.bookingId ? (
                                        <Spinner as="span" animation="border" size="sm" />
                                      ) : (
                                        <>
                                          <FaCheckCircle className="me-1" size={12} />
                                          Reconsider
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                    
                    {/* Mobile Card Layout */}
                    <div className="d-block d-lg-none">
                      <div className="mobile-services-list">
                        {(requestedServices || []).map((service) => (
                          <div key={service.bookingId} className="mobile-service-card p-3 mb-3 border rounded bg-white">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm bg-light rounded-circle me-3 d-flex align-items-center justify-content-center">
                                  <FaUser className="text-muted" size={14} />
                                </div>
                                <div>
                                  <div className="fw-bold text-primary small">#{service.bookingId}</div>
                                  <div className="fw-semibold small">{service.userName || 'Anonymous'}</div>
                                  <small className="text-muted">{service.userMobileNumber}</small>
                                </div>
                              </div>
                              {getStatusBadge(service.bookingStatusCode)}
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <Badge bg="primary" className="px-2 py-1">
                                {service.labourSkill}
                              </Badge>
                              <div className="text-end">
                                <div className="fw-semibold small">{formatDate(service.bookingTime)}</div>
                                <small className="text-muted">Requested</small>
                              </div>
                            </div>
                            
                            <div className="d-flex gap-2 justify-content-center">
                              {service.bookingStatusCode === 1 && (
                                <>
                                  <Button 
                                    variant="success" 
                                    size="sm"
                                    onClick={() => handleStatusUpdate(service.bookingId, 2)}
                                    disabled={statusUpdatingId === service.bookingId}
                                    className="flex-grow-1"
                                  >
                                    {statusUpdatingId === service.bookingId ? (
                                      <Spinner as="span" animation="border" size="sm" />
                                    ) : (
                                      <>
                                        <FaCheckCircle className="me-1" size={12} />
                                        Accept
                                      </>
                                    )}
                                  </Button>
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => handleStatusUpdate(service.bookingId, -1)}
                                    disabled={statusUpdatingId === service.bookingId}
                                    className="flex-grow-1"
                                  >
                                    {statusUpdatingId === service.bookingId ? (
                                      <Spinner as="span" animation="border" size="sm" />
                                    ) : (
                                      <>
                                        <FaTimesCircle className="me-1" size={12} />
                                        Decline
                                      </>
                                    )}
                                  </Button>
                                </>
                              )}
                              {service.bookingStatusCode === 2 && (
                                <Button 
                                  variant="primary" 
                                  size="sm"
                                  onClick={() => handleStatusUpdate(service.bookingId, 3)}
                                  disabled={statusUpdatingId === service.bookingId}
                                  className="w-100"
                                >
                                  {statusUpdatingId === service.bookingId ? (
                                    <Spinner as="span" animation="border" size="sm" />
                                  ) : (
                                    <>
                                      <FaCheckCircle className="me-1" size={12} />
                                      Mark as Complete
                                    </>
                                  )}
                                </Button>
                              )}
                              {service.bookingStatusCode === 3 && (
                                <div className="w-100 text-center">
                                  <Badge bg="success" className="px-3 py-2">
                                    <FaCheckCircle className="me-1" size={12} />
                                    Completed
                                  </Badge>
                                </div>
                              )}
                              {service.bookingStatusCode === -1 && (
                                <Button 
                                  variant="outline-success" 
                                  size="sm"
                                  onClick={() => handleStatusUpdate(service.bookingId, 2)}
                                  disabled={statusUpdatingId === service.bookingId}
                                  className="w-100"
                                >
                                  {statusUpdatingId === service.bookingId ? (
                                    <Spinner as="span" animation="border" size="sm" />
                                  ) : (
                                    <>
                                      <FaCheckCircle className="me-1" size={12} />
                                      Reconsider
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-5">
                    <FaClock className="text-muted mb-3" size={48} />
                    <h5 className="text-muted mb-2">No Service Requests</h5>
                    <p className="text-muted">You'll see new booking requests here</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Reviews and Booking History */}
        <Row>
          <Col lg={8} className="mb-3 mb-md-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3 p-md-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                  <h4 className="mb-0 fw-bold text-dark">
                    <FaStar className="me-2 text-warning" />
                    Customer Reviews
                  </h4>
                  <div className="d-flex gap-2 w-100 w-md-auto">
                    <Form.Select
                      name="sortBy"
                      value={sortConfig.sortBy}
                      onChange={handleSortChange}
                      size="sm"
                      className="border-0 bg-light flex-grow-1"
                    >
                      <option value="reviewTime">Latest First</option>
                      <option value="rating">By Rating</option>
                    </Form.Select>
                    <Form.Select
                      name="sortOrder"
                      value={sortConfig.sortOrder}
                      onChange={handleSortChange}
                      size="sm"
                      className="border-0 bg-light flex-grow-1"
                    >
                      <option value="desc">High to Low</option>
                      <option value="asc">Low to High</option>
                    </Form.Select>
                  </div>
                </div>

                {/* Rating Distribution */}
                {(reviews || []).length > 0 && (
                  <div className="mb-4 p-3 bg-light rounded">
                    <h6 className="mb-3 fw-semibold">Rating Distribution</h6>
                    <Row className="g-2">
                      {(() => {
                        const distribution = getRatingDistribution();
                        const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
                        return [5, 4, 3, 2, 1].map(rating => (
                          <Col key={rating} xs={12}>
                            <div className="d-flex align-items-center gap-2">
                              <div className="d-flex align-items-center" style={{ minWidth: '50px' }}>
                                <span className="me-1 small">{rating}</span>
                                <FaStar className="text-warning" size={12} />
                              </div>
                              <div className="flex-grow-1">
                                <ProgressBar
                                  variant={rating >= 4 ? 'success' : rating >= 3 ? 'warning' : 'danger'}
                                  now={total > 0 ? (distribution[rating] / total) * 100 : 0}
                                  style={{ height: '6px' }}
                                />
                              </div>
                              <span className="text-muted small" style={{ minWidth: '25px', textAlign: 'right' }}>
                                {distribution[rating]}
                              </span>
                            </div>
                          </Col>
                        ));
                      })()}
                    </Row>
                  </div>
                )}

                {/* Reviews List */}
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {(reviews || []).length > 0 ? (
                    <div className="reviews-list">
                      {(reviews || []).map((review, index) => (
                        <div key={index} className="review-card mb-3 p-3 p-md-4 bg-white border rounded shadow-sm">
                          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-3 gap-2">
                            <div className="d-flex align-items-center w-100">
                              <div className="avatar-lg bg-primary bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center">
                                <FaUser className="text-primary" size={16} />
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="mb-1 fw-semibold small">
                                  {review.userName || 'Anonymous Customer'}
                                </h6>
                                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-1 gap-sm-2">
                                  <div className="rating-stars">
                                    {[...Array(5)].map((_, i) => (
                                      <FaStar
                                        key={i}
                                        className={i < review.rating ? 'text-warning' : 'text-muted'}
                                        size={12}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-muted small">
                                    {formatDate(review.reviewTime)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge 
                              bg={review.rating >= 4 ? 'success' : review.rating >= 3 ? 'warning' : 'danger'}
                              className="px-2 py-1 align-self-end align-self-md-start"
                            >
                              {review.rating}/5
                            </Badge>
                          </div>
                          
                          {review.review && (
                            <div className="review-content">
                              <div className="position-relative">
                                <FaQuoteLeft className="text-muted position-absolute d-none d-md-block" 
                                  style={{ top: '-5px', left: '-5px', fontSize: '20px', opacity: 0.3 }} />
                                <p className="mb-0 ps-0 ps-md-3" style={{ 
                                  fontSize: '0.9rem',
                                  lineHeight: '1.5',
                                  color: '#555'
                                }}>
                                  {review.review}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : isReviewsLoading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" className="text-primary mb-3" />
                      <p className="text-muted">Loading reviews...</p>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <FaStar className="text-muted mb-3" size={48} />
                      <h5 className="text-muted mb-2">No Reviews Yet</h5>
                      <p className="text-muted">Customer reviews will appear here</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} className="mb-3 mb-md-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3 p-md-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                  <h4 className="mb-0 fw-bold text-dark">
                    <FaHistory className="me-2 text-primary" />
                    Recent Activity
                  </h4>
                  <div className="d-flex gap-2 w-100 w-md-auto">
                    <Form.Select
                      name="sortOrder"
                      value={bookingSortConfig.sortOrder}
                      onChange={handleBookingSortChange}
                      size="sm"
                      className="border-0 bg-light flex-grow-1"
                    >
                      <option value="desc">Latest First</option>
                      <option value="asc">Oldest First</option>
                    </Form.Select>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => fetchRequestedServices(false)}
                      disabled={isServicesRefreshing}
                      className="flex-shrink-0"
                    >
                      {isServicesRefreshing ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <FaSync size={12} />
                      )}
                    </Button>
                  </div>
                </div>

                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {(requestedServices || []).length > 0 ? (
                    <div className="activity-list">
                      {getSortedServices().slice(0, 10).map((service) => (
                        <div key={service.bookingId} className="activity-item p-3 mb-3 border rounded bg-white">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center">
                              <div className="activity-icon me-3">
                                <div className={`rounded-circle p-2 ${
                                  service.bookingStatusCode === 3 ? 'bg-success bg-opacity-10' :
                                  service.bookingStatusCode === 2 ? 'bg-primary bg-opacity-10' :
                                  service.bookingStatusCode === 1 ? 'bg-warning bg-opacity-10' :
                                  'bg-danger bg-opacity-10'
                                }`}>
                                  {service.bookingStatusCode === 3 ? <FaCheckCircle className="text-success" size={16} /> :
                                   service.bookingStatusCode === 2 ? <FaHandshake className="text-primary" size={16} /> :
                                   service.bookingStatusCode === 1 ? <FaClock className="text-warning" size={16} /> :
                                   <FaTimesCircle className="text-danger" size={16} />}
                                </div>
                              </div>
                              <div className="flex-grow-1">
                                <div className="fw-semibold small">#{service.bookingId}</div>
                                <div className="text-muted small">{service.userName || 'Anonymous'}</div>
                              </div>
                            </div>
                            {getStatusBadge(service.bookingStatusCode)}
                          </div>
                          
                          <div className="activity-details">
                            <div className="d-flex justify-content-between align-items-center">
                              <Badge bg="light" text="dark" className="px-2 py-1">
                                {service.labourSkill}
                              </Badge>
                              <small className="text-muted">
                                {formatDate(service.bookingTime)}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <FaHistory className="text-muted mb-3" size={48} />
                      <h5 className="text-muted mb-2">No Activity</h5>
                      <p className="text-muted">Booking history will appear here</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Account Management Section - Less Prominent */}
        <Row className="mt-4">
          <Col>
            <Card className="border-0 bg-light">
              <Card.Body className="p-3">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                  <div>
                    <h6 className="mb-1 text-muted">
                      <FaCog className="me-2" size={14} />
                      Account Management
                    </h6>
                    <p className="mb-0 small text-muted">
                      Manage your account settings and preferences
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>This action cannot be undone</Tooltip>}
                    >
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={handleDeleteAccount}
                        className="d-flex align-items-center opacity-75"
                        style={{ fontSize: '0.8rem' }}
                      >
                        <FaTrashAlt className="me-1 me-md-2" size={12} />
                        <span className="d-none d-sm-inline">Delete Profile</span>
                        <span className="d-inline d-sm-none">Delete</span>
                      </Button>
                    </OverlayTrigger>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

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