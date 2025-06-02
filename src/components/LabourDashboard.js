import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge } from 'react-bootstrap';
import { FaUser, FaPhone, FaTools, FaStar, FaSignOutAlt, FaCalendarAlt, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/LabourDashboard.css';

function LabourDashboard() {
  const [labourDetails, setLabourDetails] = useState(null);
  const [requestedServices, setRequestedServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedDetails = localStorage.getItem('labourDetails');
    if (!storedDetails) {
      navigate('/labourLogin');
      return;
    }
    setLabourDetails(JSON.parse(storedDetails));
    fetchRequestedServices();
  }, [navigate]);

  const fetchRequestedServices = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:4000/labourapp/labour/showRequestedServices/${labourDetails?.labourId}`);
      
      if (response.data && response.data.returnValue) {
        setRequestedServices(response.data.returnValue);
      }
    } catch (error) {
      setError('Failed to fetch requested services');
      console.error('Error fetching services:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('labourDetails');
    localStorage.removeItem('isLabourLoggedIn');
    navigate('/labourLogin');
  };

  const getStatusBadge = (statusCode) => {
    switch (statusCode) {
      case 1:
        return <Badge bg="warning" className="px-3 py-2"><FaClock className="me-1" /> Pending</Badge>;
      case 2:
        return <Badge bg="success" className="px-3 py-2"><FaCheckCircle className="me-1" /> Accepted</Badge>;
      case 3:
        return <Badge bg="danger" className="px-3 py-2"><FaTimesCircle className="me-1" /> Rejected</Badge>;
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
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2 className="display-6 mb-0">Welcome, {labourDetails.labourName}</h2>
            <Button 
              variant="outline-danger" 
              onClick={handleLogout}
              className="d-flex align-items-center"
            >
              <FaSignOutAlt className="me-2" />
              Logout
            </Button>
          </div>
        </Col>
      </Row>

      <Row className="mb-5">
        <Col md={4} className="mb-4">
          <Card className="h-100 shadow-sm dashboard-card">
            <Card.Body>
              <div className="text-center mb-4">
                <div className="rounded-circle profile-icon d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: '80px', height: '80px' }}>
                  <FaUser className="text-white" style={{ fontSize: '2rem' }} />
                </div>
                <h3 className="mb-1">{labourDetails.labourName}</h3>
                <p className="text-muted mb-0">Labour ID: {labourDetails.labourId}</p>
              </div>

              <div className="border-top pt-3">
                <div className="d-flex align-items-center mb-2">
                  <FaPhone className="text-primary me-2" />
                  <span>{labourDetails.labourMobileNo}</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <FaTools className="text-primary me-2" />
                  <span>{labourDetails.labourSkill}</span>
                </div>
                <div className="d-flex align-items-center">
                  <FaStar className="rating-star me-2" />
                  <span>{labourDetails.rating} ({labourDetails.ratingCount} ratings)</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Row>
            <Col md={6} className="mb-4">
              <Card className="h-100 shadow-sm stats-card">
                <Card.Body>
                  <h5 className="card-title mb-3">Quick Stats</h5>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h3 className="mb-0">{labourDetails.ratingCount}</h3>
                      <p className="text-muted mb-0">Total Ratings</p>
                    </div>
                    <div className="text-warning">
                      <FaStar style={{ fontSize: '2rem' }} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card className="h-100 shadow-sm dashboard-card">
                <Card.Body>
                  <h5 className="card-title mb-3">View Profile</h5>
                  <p className="text-muted mb-3">Check your public profile and booking history</p>
                  <Button 
                    variant="primary" 
                    onClick={() => navigate(`/labour/${labourDetails.labourId}`)}
                    className="w-100"
                  >
                    View Profile
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm dashboard-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="mb-0">Requested Services</h3>
                <Button 
                  variant="outline-primary" 
                  onClick={fetchRequestedServices}
                  disabled={isLoading}
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
                  <Table hover className="align-middle">
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
                          <td>#{service.bookingId}</td>
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