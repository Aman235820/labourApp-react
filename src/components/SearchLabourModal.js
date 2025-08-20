import React, { useState } from 'react';
import { Modal, Button, Container, Card, Badge, Alert, Form } from 'react-bootstrap';
import { FaStar, FaPhone, FaTools, FaUser, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import BookingModal from './modals/BookingModal';
import { useTranslation } from 'react-i18next';
import '../styles/SearchLabourModal.css';

const SearchLabourModal = ({ 
    show, 
    onHide, 
    searchResults = {}, 
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
    const [pageSize, setPageSize] = useState(searchResults.pageSize || 10);
    const [sortBy, setSortBy] = useState('rating');
    const [sortOrder, setSortOrder] = useState('desc');

    const pageNumber = typeof searchResults.pageNumber === 'number' ? searchResults.pageNumber : 0;
    const totalPages = typeof searchResults.totalPages === 'number' ? searchResults.totalPages : 0;
    const totalElements = typeof searchResults.totalElements === 'number' ? searchResults.totalElements : (searchResults.content ? searchResults.content.length : 0);

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

    const handlePageChange = (pageDisplayOneBased) => {
        const zeroBased = Math.max(0, pageDisplayOneBased - 1);
        onPageChange(zeroBased, pageSize, sortBy, sortOrder);
    };

    const goPrev = () => {
        if (pageNumber > 0) onPageChange(pageNumber - 1, pageSize, sortBy, sortOrder);
    };

    const goNext = () => {
        if (pageNumber < totalPages - 1) onPageChange(pageNumber + 1, pageSize, sortBy, sortOrder);
    };

    const handlePageSizeChange = (e) => {
        const newSize = parseInt(e.target.value, 10) || 10;
        setPageSize(newSize);
        onPageChange(0, newSize, sortBy, sortOrder);
    };

    const handleSortByChange = (e) => {
        const value = e.target.value;
        setSortBy(value);
        onPageChange(0, pageSize, value, sortOrder);
    };

    const handleSortOrderChange = (e) => {
        const value = e.target.value;
        setSortOrder(value);
        onPageChange(0, pageSize, sortBy, value);
    };

    // Navigate to LabourDetailsPage
    const handleCardClicked = (labour) => {
        navigate(`/labour-details/${labour.labourId}`, {
            state: { searchCategory: searchCategory }
        });
    };

    const handleViewProfile = (labour) => {
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
                            variant="secondary"
                            className="flex-fill view-profile-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewProfile(labour);
                            }}
                        >
                            {t('common.viewProfile') || 'View Profile'}
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
            <Modal
                show={show}
                onHide={onHide}
                size="xl"
                centered
                scrollable
                fullscreen
                className="search-modal"
                dialogClassName="search-modal-dialog"
                contentClassName="search-modal-content"
            >
                <Modal.Header closeButton>
                    <Modal.Title>{t('searchLabourModal.searchResultsForStatic')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Controls Bar */}
                    <div className="pagination-container mb-3 d-flex flex-wrap align-items-center justify-content-between">
                        <div className="d-flex align-items-center gap-2">
                            <Form.Label className="mb-0 small">{t('searchLabourModal.sortBy')}</Form.Label>
                            <Form.Select size="sm" value={sortBy} onChange={handleSortByChange} style={{ width: 140 }}>
                                <option value="rating">Rating</option>
                                <option value="labourName">Name</option>
                            </Form.Select>
                            <Form.Select size="sm" value={sortOrder} onChange={handleSortOrderChange} style={{ width: 120 }}>
                                <option value="desc">{t('searchLabourModal.sortOrderDesc')}</option>
                                <option value="asc">{t('searchLabourModal.sortOrderAsc')}</option>
                            </Form.Select>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <Form.Label className="mb-0 small">{t('searchLabourModal.pageSize')}</Form.Label>
                            <Form.Select size="sm" value={pageSize} onChange={handlePageSizeChange} style={{ width: 90 }}>
                                <option value={2}>2</option>
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                            </Form.Select>
                            <div className="d-flex align-items-center gap-2">
                                <Button variant="outline-primary" size="sm" onClick={goPrev} disabled={pageNumber <= 0}>{t('searchLabourModal.prev')}</Button>
                                <span className="small">{t('searchLabourModal.pageOf', { current: totalPages > 0 ? pageNumber + 1 : 0, total: totalPages || 0 })}</span>
                                <Button variant="outline-primary" size="sm" onClick={goNext} disabled={pageNumber >= totalPages - 1}>{t('searchLabourModal.next')}</Button>
                            </div>
                        </div>
                    </div>
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
                                        {t('searchLabourModal.showingResultsStatic')}
                                    </small>
                                </div>
                                <div className="labour-cards-container">
                                    {searchResults.content.map(renderLabourCard)}
                                </div>
                                {/* Bottom Pagination (mobile-friendly) */}
                                <div className="pagination-container mt-3 d-flex align-items-center justify-content-between">
                                    <div className="small text-muted">{t('common.search')}: {totalElements || 0}</div>
                                    <div className="d-flex align-items-center gap-2">
                                        <Button variant="outline-primary" size="sm" onClick={goPrev} disabled={pageNumber <= 0}>{t('searchLabourModal.prev')}</Button>
                                        <span className="small">{t('searchLabourModal.pageOf', { current: totalPages > 0 ? pageNumber + 1 : 0, total: totalPages || 0 })}</span>
                                        <Button variant="outline-primary" size="sm" onClick={goNext} disabled={pageNumber >= totalPages - 1}>{t('searchLabourModal.next')}</Button>
                                    </div>
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