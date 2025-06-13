import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { FaUser, FaPhone, FaCalendarAlt, FaTools, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/LabourProfile.css';
import { labourService } from '../services/labourService';

function LabourProfile() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { labourId } = useParams();

  useEffect(() => {
    fetchBookings();
  }, [labourId]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const response = await labourService.showRequestedServices(labourId);
      
      if (response.data && response.data.returnValue) {
        setBookings(response.data.returnValue);
      }
    } catch (error) {
      setError('Failed to fetch booking history');
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
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

  if (isLoading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h2 className="display-6 mb-4">Booking History</h2>
        </Col>
      </Row>

      <Row>
        {bookings.map((booking) => (
          <Col key={booking.bookingId} md={6} lg={4} className="mb-4">
            <Card className="h-100 shadow-sm hover-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <h5 className="card-title mb-0">Booking #{booking.bookingId}</h5>
                  {getStatusBadge(booking.bookingStatusCode)}
                </div>

                <div className="booking-details">
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <FaUser className="text-primary me-2" />
                      <span className="fw-medium">Client: {booking.userName || 'Anonymous'}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <FaPhone className="text-primary me-2" />
                      <span className="fw-medium">Phone: {booking.userMobileNumber}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <FaTools className="text-primary me-2" />
                      <span className="fw-medium">Service: {booking.labourSkill}</span>
                    </div>
                    <div className="d-flex align-items-center">
                      <FaCalendarAlt className="text-primary me-2" />
                      <span className="fw-medium">Date: {formatDate(booking.bookingTime)}</span>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {bookings.length === 0 && (
        <Row>
          <Col>
            <div className="text-center py-5">
              <p className="text-muted fs-5">No booking history found.</p>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
}

export default LabourProfile; 