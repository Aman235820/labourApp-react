import React, { useState } from 'react';
import '../styles/SearchLabourModal.css';
import { Modal, Button, Container, Card, Badge, Alert, Form } from 'react-bootstrap';
import { FaStar, FaPhone, FaTools, FaUser, FaMapMarkerAlt, FaCalendarAlt, FaBuilding } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import BookingModal from './modals/BookingModal';
import { useTranslation } from 'react-i18next';
import {
    getSearchResultKind,
    searchResultItemKey,
    summarizeEnterpriseServices,
    getRowMainServiceCategory,
} from '../utils/searchCategoryResult';
import { normalizeMongoId } from '../utils/enterpriseSession';

const ENTERPRISE_ID_REGEX = /^[0-9a-fA-F]{24}$/;

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

    const renderRatingBlock = (rating, ratingCount) => (
        <div className="search-result-rating flex-shrink-0 text-end">
            {rating && parseFloat(rating) > 0 ? (
                <div className="d-flex align-items-center justify-content-end">
                    <FaStar className="text-warning me-1" size={14} />
                    <span className="fw-bold text-dark">{rating}</span>
                    <small className="text-muted ms-1">({ratingCount || 0})</small>
                </div>
            ) : (
                <Badge bg="secondary" className="fw-normal">{t('common.noRatingsYet')}</Badge>
            )}
        </div>
    );

    const renderEnterpriseCard = (ent, reactKey) => {
        const phone = ent.ownerContactInfo || '';
        const mainCategory = getRowMainServiceCategory(ent, searchCategory || '');
        const servicesLine = summarizeEnterpriseServices(ent.servicesOffered, searchCategory);
        return (
            <Card
                key={reactKey}
                className="labour-card mb-3 mobile-card enterprise-search-card border border-info border-opacity-25"
            >
                <Card.Body className="p-3 search-result-card-body">
                    <div className="search-result-card-top d-flex align-items-start gap-3">
                        <div className="labour-avatar bg-info flex-shrink-0 enterprise-avatar">
                            <FaBuilding className="text-white" size={20} />
                        </div>
                        <div className="flex-grow-1 min-w-0">
                            <div className="d-flex align-items-start justify-content-between gap-2">
                                <div className="min-w-0">
                                    <h5 className="mb-1 fw-bold text-primary labour-name text-break">{ent.companyName || '—'}</h5>
                                    <Badge bg="info" className="text-dark fw-semibold entity-type-badge">
                                        {t('searchLabourModal.entityTypeEnterprise')}
                                    </Badge>
                                    {(ent.ownername || '').trim() ? (
                                        <div className="text-muted small mt-1">{ent.ownername}</div>
                                    ) : null}
                                </div>
                                {renderRatingBlock(ent.rating, ent.ratingCount)}
                            </div>
                            <div className="d-flex align-items-center text-muted mt-2 pt-1 border-top border-light">
                                <FaTools className="me-2 flex-shrink-0 text-success" size={14} />
                                <span className="service-type fw-medium text-dark">{mainCategory}</span>
                            </div>
                            {servicesLine ? (
                                <div className="small text-muted mt-1 ms-4 ps-1">{servicesLine}</div>
                            ) : null}
                        </div>
                    </div>

                    <div className="contact-info">
                        <div className="d-flex align-items-start text-muted">
                            <FaMapMarkerAlt className="me-2 text-primary mt-1 flex-shrink-0" size={14} />
                            <span className="location-detail">{ent.location || t('searchLabourModal.locationNotSpecified')}</span>
                        </div>
                    </div>

                    <div className="action-buttons search-result-actions">
                        <div className="d-flex flex-wrap gap-2">
                            <Button
                                variant="outline-primary"
                                className="search-action-btn flex-fill"
                                disabled={!phone}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (phone) window.location.href = `tel:${phone}`;
                                }}
                            >
                                <FaPhone className="me-2" />
                                {t('searchLabourModal.callNow')}
                            </Button>
                            <Button
                                variant="outline-primary"
                                className="search-action-btn flex-fill search-result-view-profile-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const id = normalizeMongoId(ent._id);
                                    if (!id || !ENTERPRISE_ID_REGEX.test(id)) {
                                        alert(
                                            t('enterprisePublic.invalidId', {
                                                defaultValue: 'Enterprise profile is unavailable (invalid ID).',
                                            })
                                        );
                                        return;
                                    }
                                    onHide();
                                    navigate(`/enterprise-profile/${id}`, {
                                        state: { searchCategory: searchCategory || '' },
                                    });
                                }}
                            >
                                <FaUser className="me-2" />
                                {t('common.viewProfile')}
                            </Button>
                            <Button
                                variant="outline-secondary"
                                className="search-action-btn flex-fill"
                                disabled
                                title={t('searchLabourModal.bookingNotAvailableForEnterprise')}
                            >
                                <FaCalendarAlt className="me-2" />
                                {t('searchLabourModal.bookForLater')}
                            </Button>
                        </div>
                        <small className="text-muted d-block mt-2">{t('searchLabourModal.bookingNotAvailableForEnterprise')}</small>
                    </div>
                </Card.Body>
            </Card>
        );
    };

    const renderLabourCard = (labour, reactKey) => (
        <Card 
            key={reactKey} 
            className="labour-card mb-3 mobile-card labour-search-card"
            onClick={() => handleCardClicked(labour)}
        >
            <Card.Body className="p-3 search-result-card-body">
                <div className="search-result-card-top d-flex align-items-start gap-3">
                    <div className="labour-avatar flex-shrink-0">
                        <FaUser className="text-white" size={20} />
                    </div>
                    <div className="flex-grow-1 min-w-0">
                        <div className="d-flex align-items-start justify-content-between gap-2">
                            <div className="min-w-0">
                                <h5 className="mb-1 fw-bold text-primary labour-name text-break">{labour.labourName}</h5>
                                <Badge bg="primary" className="fw-semibold entity-type-badge">
                                    {t('searchLabourModal.entityTypeLabour')}
                                </Badge>
                            </div>
                            {renderRatingBlock(labour.rating, labour.ratingCount)}
                        </div>
                        <div className="d-flex align-items-center text-muted mt-2 pt-1 border-top border-light">
                            <FaTools className="me-2 flex-shrink-0 text-success" size={14} />
                            <span className="service-type fw-medium text-dark">{labour.labourSkill}</span>
                        </div>
                    </div>
                </div>

                <div className="contact-info">
                    <div className="d-flex align-items-start text-muted">
                        <FaMapMarkerAlt className="me-2 text-primary mt-1 flex-shrink-0" size={14} />
                        <span className="location-detail">{labour.labourLocation || labour.labourAddress || t('searchLabourModal.locationNotSpecified')}</span>
                    </div>
                </div>

                <div className="action-buttons search-result-actions">
                    <div className="d-flex flex-wrap gap-2">
                        <Button 
                            variant="outline-primary" 
                            className="search-action-btn flex-fill call-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `tel:${labour.labourMobileNo}`;
                            }}
                        >
                            <FaPhone className="me-2" />
                            {t('searchLabourModal.callNow')}
                        </Button>
                        <Button
                            variant="outline-primary"
                            className="search-action-btn flex-fill search-result-view-profile-btn"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleViewProfile(labour);
                            }}
                        >
                            <FaUser className="me-2" />
                            {t('common.viewProfile')}
                        </Button>
                        <Button 
                            variant="success" 
                            className="search-action-btn flex-fill book-btn"
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
                <Modal.Header closeButton className="search-modal-header border-bottom">
                    <Modal.Title className="h5 mb-0 fw-bold">
                        {t('searchLabourModal.searchResultsForStatic')}
                        {searchCategory ? (
                            <span className="d-block small fw-normal text-muted mt-1">
                                {searchCategory}
                            </span>
                        ) : null}
                    </Modal.Title>
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
                                    {searchResults.content.map((item, idx) => {
                                        const k = searchResultItemKey(item, idx);
                                        return getSearchResultKind(item) === 'enterprise'
                                            ? renderEnterpriseCard(item, k)
                                            : renderLabourCard(item, k);
                                    })}
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
                    labour={selectedLabourForBooking}
                    serviceCategory={searchCategory || ''}
                    onBookingSuccess={handleBookingSuccess}
                />
            )}
        </>
    );
};

export default SearchLabourModal; 