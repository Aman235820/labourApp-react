import React, { useState, useEffect, useRef } from 'react';
import { Container, Button, Spinner, Card, Badge } from 'react-bootstrap';
import { FaArrowLeft, FaUser, FaTools, FaPhone, FaStar, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { searchLabourByCategory } from '../services/LabourSearchService';
import LabourDetailsModal from './LabourDetailsModal';
import BookingModal from './modals/BookingModal';
import '../styles/LabourListPage.css';

function LabourListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMounted = useRef(true);
  
  // Get data from navigation state
  const {
    labourers: initialLabourers = [],
    totalElements: initialTotalElements = 0,
    totalPages: initialTotalPages = 0,
    service = '',
    currentPage: initialCurrentPage = 0,
    pageSize: initialPageSize = 10,
    error: initialError = null
  } = location.state || {};
  
  const [labourers, setLabourers] = useState(initialLabourers);
  const [isLoading, setIsLoading] = useState(false); // Start with false since data is already loaded
  const [error, setError] = useState(initialError);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalElements, setTotalElements] = useState(initialTotalElements);
  const [selectedLabour, setSelectedLabour] = useState(null);
  const [showLabourModal, setShowLabourModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedLabourForBooking, setSelectedLabourForBooking] = useState(null);

  const handleBookLabour = (labour) => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert('Please login to book a service. Redirecting to registration page.');
      navigate('/register');
      return;
    }

    // Open booking modal
    setSelectedLabourForBooking(labour);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    setShowBookingModal(false);
    setSelectedLabourForBooking(null);
  };

  // Navigate to LabourDetailsPage
  const handleCardClicked = (labour) => {
    navigate(`/labour-details/${labour.labourId}`, {
      state: { searchCategory: service }
    });
  };

  const renderLabourCard = (labour) => (
    <Card 
      key={labour.labourId} 
      className="labour-card mb-3 mobile-card"
      onClick={() => handleCardClicked(labour)}
    >
      <Card.Body className="p-3">
        {/* Top Row - Avatar and Rating */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="labour-avatar">
            <FaUser className="text-white" size={20} />
          </div>
          <div className="rating-section">
            {labour.rating && parseFloat(labour.rating) > 0 ? (
              <div className="d-flex align-items-center">
                <FaStar className="text-warning me-1" size={14} />
                <span className="fw-bold text-dark">{labour.rating}</span>
                <small className="text-muted ms-1">({labour.ratingCount || 0})</small>
              </div>
            ) : (
              <Badge bg="secondary">No Ratings</Badge>
            )}
          </div>
        </div>

        {/* Name and Service */}
        <div className="mb-3">
          <h5 className="mb-1 fw-bold text-primary labour-name">{labour.labourName}</h5>
          <div className="d-flex align-items-center text-muted mb-2">
            <FaTools className="me-2" size={14} />
            <span className="service-type">{labour.labourSkill}</span>
          </div>
        </div>
        
        {/* Location and Rating Information */}
        <div className="contact-info mb-3">
          <div className="d-flex align-items-start text-muted mb-2">
            <FaMapMarkerAlt className="me-2 text-primary mt-1" size={14} />
            <span className="location-detail">{labour.labourLocation || labour.labourAddress || 'Location not specified'}</span>
          </div>
          <div className="d-flex align-items-center text-muted">
            <FaStar className="me-2 text-warning" size={14} />
            <span className="rating-detail">
              {labour.rating && parseFloat(labour.rating) > 0 
                ? `${labour.rating} rating (${labour.ratingCount || 0} reviews)`
                : 'No ratings yet'
              }
            </span>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="action-buttons d-grid gap-2">
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              className="flex-fill call-btn"
              onClick={(e) => {
                e.stopPropagation();
                window.location.href = `tel:${labour.labourMobileNo}`;
              }}
            >
              <FaPhone className="me-2" />
              Call Now
            </Button>
            <Button 
              variant="success" 
              className="flex-fill book-btn"
              onClick={(e) => {
                e.stopPropagation();
                handleBookLabour(labour);
              }}
            >
              <FaCalendarAlt className="me-2" />
              Book for Later
            </Button>
          </div>
        </div>
      </Card.Body>
    </Card>
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchLabourers = async (pageNumber, size) => {
    if (!isMounted.current || !service) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await searchLabourByCategory(service, pageNumber, size);
      
      if (isMounted.current && response) {
        setLabourers(response.content || []);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
        setCurrentPage(pageNumber);
        setPageSize(size);
      }
    } catch (error) {
      if (isMounted.current) {
        setError('Failed to fetch labourers. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const handlePageChange = (page) => {
    fetchLabourers(page - 1, pageSize);
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    fetchLabourers(page - 1, newPerPage);
  };

  const handleLabourModalClose = () => {
    setShowLabourModal(false);
    setSelectedLabour(null);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  if (!service) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <h3>No service specified</h3>
          <p className="text-muted">Please go back and select a service.</p>
          <Button onClick={handleBackClick} className="mt-3">
            <FaArrowLeft className="me-2" />
            Back to Home
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="labour-list-page">
      <Container fluid>
        {/* Header */}
        <div className="labour-list-header">
          <div className="d-flex align-items-center">
            <Button
              variant="outline-secondary"
              onClick={handleBackClick}
              className="me-3"
            >
              <FaArrowLeft />
            </Button>
            <h3 className="labour-list-title mb-0">
              {service} Professionals ({totalElements} found)
            </h3>
          </div>
        </div>
        
        <div className="labour-list-content">
          {isLoading ? (
            <div className="labour-table-container" style={{ minHeight: '400px' }}>
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading {service} professionals...</p>
              </div>
              {/* Skeleton table structure to prevent layout shift */}
              <div className="skeleton-table" style={{ opacity: 0.3 }}>
                <div className="skeleton-header" style={{ height: '50px', background: '#f0f0f0', marginBottom: '10px', borderRadius: '8px' }}></div>
                <div className="skeleton-row" style={{ height: '60px', background: '#f8f9fa', marginBottom: '8px', borderRadius: '6px' }}></div>
                <div className="skeleton-row" style={{ height: '60px', background: '#f8f9fa', marginBottom: '8px', borderRadius: '6px' }}></div>
                <div className="skeleton-row" style={{ height: '60px', background: '#f8f9fa', marginBottom: '8px', borderRadius: '6px' }}></div>
                <div className="skeleton-row" style={{ height: '60px', background: '#f8f9fa', marginBottom: '8px', borderRadius: '6px' }}></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <p className="text-danger">{error}</p>
              <Button onClick={() => fetchLabourers(0, pageSize)}>
                Try Again
              </Button>
            </div>
          ) : labourers.length === 0 ? (
            <div className="text-center py-5">
              <h4>No {service} professionals found</h4>
              <p className="text-muted">Try searching for a different service or check back later.</p>
              <Button onClick={handleBackClick}>
                Back to Home
              </Button>
            </div>
          ) : (
            <div className="labour-cards-container" style={{ minHeight: '400px' }}>
              <div className="mb-3">
                <small className="text-muted">
                  Showing {labourers.length} of {totalElements} professionals
                  {totalPages > 1 && ` | Page ${currentPage + 1} of ${totalPages} | Page Size: ${pageSize}`}
                </small>
              </div>
              <div className="labour-cards-grid">
                {labourers.map(renderLabourCard)}
              </div>
              
              {/* Pagination - Always show if we have data */}
              {(totalElements > 0 || labourers.length > 0) && (
                <div className="d-flex justify-content-center mt-4">
                  <div className="pagination-container">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={currentPage === 0}
                      onClick={() => handlePageChange(currentPage)}
                      className="pagination-btn"
                    >
                      ← Previous
                    </Button>
                    <span className="mx-3 align-self-center pagination-info">
                      Page {currentPage + 1} {totalPages > 0 ? `of ${totalPages}` : ''}
                    </span>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={labourers.length < pageSize || (totalPages > 0 && currentPage >= totalPages - 1)}
                      onClick={() => handlePageChange(currentPage + 2)}
                      className="pagination-btn"
                    >
                      Next →
                    </Button>
                  </div>
                </div>
              )}
              

              
              {/* Page Size Selector for better UX */}
              {totalElements > 10 && (
                <div className="d-flex justify-content-center mt-2">
                  <div className="page-size-container">
                    <small className="text-muted me-2">Items per page:</small>
                    <select 
                      value={pageSize} 
                      onChange={(e) => handlePerRowsChange(parseInt(e.target.value), 1)}
                      className="form-select form-select-sm"
                      style={{ width: 'auto', display: 'inline-block' }}
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>

      {/* Labour Details Modal */}
      <LabourDetailsModal
        show={showLabourModal}
        onHide={handleLabourModalClose}
        selectedLabour={selectedLabour}
        service={service}
      />

      {/* Booking Modal */}
      <BookingModal
        show={showBookingModal}
        onHide={() => setShowBookingModal(false)}
        labour={selectedLabourForBooking}
        serviceCategory={service}
        onBookingSuccess={handleBookingSuccess}
      />
    </div>
  );
}

export default LabourListPage; 