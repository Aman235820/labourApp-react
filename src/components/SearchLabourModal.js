import React, { useState } from 'react';
import { Modal, Button, Container, Card, Badge, Alert } from 'react-bootstrap';
import { FaStar, FaPhone, FaTools, FaUser, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import BookingModal from './modals/BookingModal';
import { useTranslation } from 'react-i18next';
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
    const { t } = useTranslation();
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [selectedLabourForBooking, setSelectedLabourForBooking] = useState(null);

    const handleBookLabour = (labour) => {
        // Check if user is logged in
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            alert(t('searchLabourModal.pleaseLoginToBookService'));
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
                            <Badge bg="secondary">{t('common.noRatingsYet')}</Badge>
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
                        <span className="location-detail">{labour.labourLocation || labour.labourAddress || t('common.locationNotSpecified')}</span>
                    </div>
                    <div className="d-flex align-items-center text-muted">
                        <FaStar className="me-2 text-warning" size={14} />
                        <span className="rating-detail">
                            {labour.rating && parseFloat(labour.rating) > 0 
                                ? `${labour.rating} rating (${labour.ratingCount || 0} reviews)`
                                : t('common.noRatingsYet')
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
                            {t('searchLabourModal.callNow')}
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
                            {t('searchLabourModal.bookForLater')}
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
                    <Modal.Title>{t('searchLabourModal.searchResultsFor', { searchCategory: searchCategory })}</Modal.Title>
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
                                        {t('searchLabourModal.showingResults', { count: searchResults.content.length, total: searchResults.totalElements })}
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
                                <h5 className="text-muted mb-2">{t('searchLabourModal.noResultsFound')}</h5>
                                <p className="text-muted">{t('searchLabourModal.trySearchingWithDifferentKeywords')}</p>
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