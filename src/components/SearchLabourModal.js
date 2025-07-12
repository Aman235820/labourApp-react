import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Card, Alert, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { FaStar, FaPhone, FaTools, FaUser, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { bookLabour } from '../services/BookingService';
import { labourService } from '../services/labourService';
import { useNavigate } from 'react-router-dom';

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
    const [bookingStatus, setBookingStatus] = useState(null);
    const [isBooking, setIsBooking] = useState(false);

    // Auto-dismiss success message after 3 seconds
    useEffect(() => {
        if (bookingStatus && bookingStatus.type === 'success') {
            const timer = setTimeout(() => setBookingStatus(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [bookingStatus]);

    const handleBookLabour = async (labour) => {
        // Check if user is logged in
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            alert('Please login to book a service. Redirecting to registration page.');
            navigate('/register');
            return;
        }

        // Show confirmation alert
        const isConfirmed = window.confirm(
            `Are you sure you want to book ${labour.labourName} for ${searchCategory}?`
        );

        if (!isConfirmed) {
            return;
        }

        try {
            setIsBooking(true);
            setBookingStatus(null);
            
            const userData = JSON.parse(storedUser);
            const bookingData = {
                userId: userData.userId,
                labourId: labour.labourId,
                labourSkill: searchCategory
            };
            
            const response = await bookLabour(bookingData);
            
            if (response && !response.hasError) {
                alert('Labour Successfully booked!');
                navigate('/');
            } else {
                setBookingStatus({
                    type: 'danger',
                    message: 'Failed to book labour. Please try again.'
                });
            }
        } catch (err) {
            setBookingStatus({
                type: 'danger',
                message: err.message || 'Failed to book labour. Please try again.'
            });
        } finally {
            setIsBooking(false);
        }
    };

    const handlePageChange = (page) => {
        onPageChange(page - 1, searchResults.pageSize);
    };

    const handlePerRowsChange = (newPerPage, page) => {
        onPageChange(page - 1, newPerPage);
    };

    const handleSort = (column, direction) => {
        onPageChange(
            searchResults.pageNumber,
            searchResults.pageSize,
            column.selector,
            direction
        );
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
            className="labour-card mb-3"
            onClick={() => handleCardClicked(labour)}
        >
            <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex align-items-center">
                        <div className="labour-avatar me-3">
                            <FaUser className="text-primary" size={24} />
                        </div>
                        <div>
                            <h6 className="mb-1 fw-bold text-primary">{labour.labourName}</h6>
                            <div className="d-flex align-items-center text-muted">
                                <FaTools className="me-1" size={12} />
                                <small>{labour.labourSkill}</small>
                            </div>
                        </div>
                    </div>
                    <div className="text-end">
                        {labour.rating && parseFloat(labour.rating) > 0 ? (
                            <div className="d-flex align-items-center justify-content-end mb-1">
                                <FaStar className="text-warning me-1" size={14} />
                                <span className="fw-bold">{labour.rating}</span>
                                <small className="text-muted ms-1">({labour.ratingCount || 0})</small>
                            </div>
                        ) : (
                            <Badge bg="secondary" className="mb-1">No Ratings</Badge>
                        )}
                    </div>
                </div>
                
                <div className="row g-2 mb-3">
                    <div className="col-6">
                        <div className="d-flex align-items-center text-muted">
                            <FaPhone className="me-2" size={12} />
                            <small>{labour.labourMobileNo}</small>
                        </div>
                    </div>
                    <div className="col-6">
                        <div className="d-flex align-items-center text-muted">
                            <FaMapMarkerAlt className="me-2" size={12} />
                            <small>{labour.labourAddress || 'Location not specified'}</small>
                        </div>
                    </div>
                </div>
                
                <div className="d-flex justify-content-between align-items-center">
                    <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `tel:${labour.labourMobileNo}`;
                        }}
                        className="d-flex align-items-center"
                    >
                        <FaPhone className="me-1" />
                        Call Now
                    </Button>
                    <Button 
                        variant="success" 
                        size="sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleBookLabour(labour);
                        }}
                        disabled={isBooking}
                        className="d-flex align-items-center"
                    >
                        {isBooking ? (
                            <>
                                <Spinner animation="border" size="sm" className="me-1" />
                                Booking...
                            </>
                        ) : (
                            <>
                                <FaCalendarAlt className="me-1" />
                                Book Now
                            </>
                        )}
                    </Button>
                </div>
            </Card.Body>
        </Card>
    );

    return (
        <>
            <Modal show={show} onHide={onHide} size="xl">
                <ModalHeader closeButton>
                    <Modal.Title>Search Results for "{searchCategory}"</Modal.Title>
                </ModalHeader>
                <ModalBody>
                    {error && (
                        <Alert variant="danger" role="alert">
                            {error}
                        </Alert>
                    )}
                    {bookingStatus && (
                        <Alert 
                            variant={bookingStatus.type} 
                            onClose={() => setBookingStatus(null)} 
                            dismissible
                        >
                            {bookingStatus.message}
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
                                
                                {/* Pagination */}
                                {searchResults.totalPages > 1 && (
                                    <div className="d-flex justify-content-center mt-4">
                                        <div className="pagination-container">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                disabled={searchResults.pageNumber === 0}
                                                onClick={() => handlePageChange(searchResults.pageNumber)}
                                            >
                                                Previous
                                            </Button>
                                            <span className="mx-3 align-self-center">
                                                Page {searchResults.pageNumber + 1} of {searchResults.totalPages}
                                            </span>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                disabled={searchResults.pageNumber >= searchResults.totalPages - 1}
                                                onClick={() => handlePageChange(searchResults.pageNumber + 2)}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-5">
                                <div className="empty-results-alert">
                                    <div className="empty-results-icon mb-3">
                                        <FaTools className="text-muted" size={48} />
                                    </div>
                                    <h5 className="text-muted mb-2">
                                        Requested services for <span className="text-primary fw-bold">"{searchCategory}"</span> not available
                                    </h5>
                                    <p className="text-muted mb-3">
                                        We apologize, but we couldn't find any skilled professionals for this service in your area at the moment.
                                    </p>
                                    <div className="empty-results-suggestions">
                                        <p className="text-muted small mb-2">You can try:</p>
                                        <ul className="text-muted small text-start">
                                            <li>Checking back later for new professionals</li>
                                            <li>Searching for a different service category</li>
                                            <li>Expanding your search area</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        </>
    );
};

export default SearchLabourModal; 