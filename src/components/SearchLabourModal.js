import React, { useState } from 'react';
import { Modal, Button, Container, Card, Badge, Alert } from 'react-bootstrap';
import { FaStar, FaPhone, FaTools, FaUser, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import BookingModal from './modals/BookingModal';
import '../styles/SearchLabourModal.css';

const SearchLabourModal = ({ 
    show, 
    onHide, 
    searchResults, 
    error, 
    searchCategory,
    onPageChange,
    userId,
    userMobileNumber
}) => {
    const navigate = useNavigate();
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

    const handlePageChange = (page) => {
        onPageChange(page - 1, searchResults.pageSize);
    };

    // Navigate to LabourDetailsPage
    const handleCardClicked = (labour) => {
        navigate(`/labour-details/${labour.labourId}`, {
            state: { searchCategory: searchCategory }
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

    return (
        <>
            <Modal show={show} onHide={onHide} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Search Results for "{searchCategory}"</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {error && (
                        <Alert variant="danger" role="alert">
                            {error}
                        </Alert>
                    )}

                    <div className="search-results-content">
                        {searchResults.content && searchResults.content.length > 0 ? (
                            <>
                                <div className="mb-3">
                                    <small className="text-muted">
                                        Showing {searchResults.content.length} of {searchResults.totalElements} results
                                    </small>
                                </div>
                                <div className="labour-cards-container">
                                    {searchResults.content.map(renderLabourCard)}
                                </div>
                            </>
                        ) : (
                            <div className="empty-results-alert">
                                <div className="empty-results-icon mb-3">
                                    <FaTools className="text-muted" size={48} />
                                </div>
                                <h5 className="text-muted mb-2">No Results Found</h5>
                                <p className="text-muted">Try searching with different keywords or check back later.</p>
                            </div>
                        )}
                    </div>
                </Modal.Body>
            </Modal>

            {/* Booking Modal */}
            {showBookingModal && selectedLabourForBooking && (
                <BookingModal
                    show={showBookingModal}
                    onHide={() => setShowBookingModal(false)}
                    selectedLabour={selectedLabourForBooking}
                    userId={userId}
                    userMobileNumber={userMobileNumber}
                    onBookingSuccess={handleBookingSuccess}
                />
            )}
        </>
    );
};

export default SearchLabourModal; 