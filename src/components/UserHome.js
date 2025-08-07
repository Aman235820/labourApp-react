import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Form, InputGroup, Badge, ProgressBar, Tooltip, OverlayTrigger, Modal, Alert, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaTools, FaHistory, FaBell, FaSearch, FaUserTie, FaIdCard, FaPhone, FaEnvelope, FaChartLine, FaBusinessTime, FaCheckCircle, FaTrashAlt, FaCog, FaSync, FaCalendarAlt, FaMapMarkerAlt, FaStar, FaTimesCircle, FaClock, FaEdit, FaEye, FaFilter, FaExclamationTriangle } from 'react-icons/fa';
import { searchLabourByCategory } from '../services/LabourSearchService';
import { getUserBookings, rateLabour } from '../services/BookingService';
import SearchLabourModal from './SearchLabourModal';
import { deleteUser } from '../services/userService';
import { useTranslation } from 'react-i18next';
import '../styles/UserHome.css';

// Reusable Rating Modal Component
const RatingModal = ({ show, onHide, onSubmit, initialRating = 0, initialReview = '' }) => {
    const { t } = useTranslation();
    const [rating, setRating] = useState(initialRating);
    const [review, setReview] = useState(initialReview);

    const handleSubmit = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
        }
        onSubmit(rating, review);
    };

    return (
        <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} centered>
            <Modal.Header closeButton>
                <Modal.Title>{t('userHome.rateService')}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('userHome.rating')}</Form.Label>
                        <div className="d-flex align-items-center">
                            {[1.0, 2.0, 3.0, 4.0, 5.0].map((star) => (
                                <FaStar
                                    key={star}
                                    className="me-1"
                                    style={{ cursor: 'pointer', color: star <= rating ? '#ffc107' : '#e4e5e9' }}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                            <span className="ms-2">{rating}/5</span>
                        </div>
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('userHome.review')}</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder={t('userHome.writeReviewHere')}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>{t('userHome.cancel')}</Button>
                <Button variant="primary" onClick={handleSubmit}>{t('userHome.submitReview')}</Button>
            </Modal.Footer>
        </Modal>
    );
};

// Reusable Booking Card Component
const BookingCard = ({ booking, onRate, onCall }) => {
    const { t } = useTranslation();
    
    const formatDate = (dateString) => {
        if (!dateString) return t('userHome.bookingCard.invalidDate');
        
        const parts = dateString.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/);
        if (parts) {
            const year = parseInt(parts[3], 10);
            const month = parseInt(parts[2], 10) - 1;
            const day = parseInt(parts[1], 10);
            const hours = parseInt(parts[4], 10);
            const minutes = parseInt(parts[5], 10);
            
            const date = new Date(year, month, day, hours, minutes);
            if (!isNaN(date.getTime())) {
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        }
        return t('userHome.bookingCard.invalidDate');
    };

    const getStatusBadge = (statusCode) => {
        switch (statusCode) {
            case -1:
                return <Badge bg="danger" className="px-3 py-2"><FaTimesCircle className="me-1" /> {t('userHome.bookingStats.rejected')}</Badge>;
            case 1:
                return <Badge bg="warning" className="px-3 py-2"><FaClock className="me-1" /> {t('userHome.bookingStats.pending')}</Badge>;
            case 2:
                return <Badge bg="primary" className="px-3 py-2"><FaCheckCircle className="me-1" /> {t('userHome.bookingStats.accepted')}</Badge>;
            case 3:
                return <Badge bg="success" className="px-3 py-2"><FaCheckCircle className="me-1" /> {t('userHome.bookingStats.completed')}</Badge>;
            default:
                return <Badge bg="secondary" className="px-3 py-2"><FaClock className="me-1" /> {t('userHome.bookingStats.unknown')}</Badge>;
        }
    };

    return (
        <Card className="booking-card border-0 shadow-sm mb-3">
            <Card.Body className="p-3 p-md-4">
                <Row className="align-items-center">
                    <Col md={6} className="mb-3 mb-md-0">
                        <div className="d-flex align-items-center mb-3">
                            <div className="service-icon bg-primary bg-opacity-10 rounded-circle p-2 p-md-3 me-2 me-md-3">
                                <FaTools className="text-primary" size={16} />
                            </div>
                            <div>
                                <h5 className="mb-1 fw-semibold small">{booking.labourName || t('userHome.bookingCard.unknownLabour')}</h5>
                                <p className="text-muted mb-0 small">{booking.labourSkill || t('userHome.bookingCard.service')}</p>
                            </div>
                        </div>
                        <div className="d-flex align-items-center text-muted mb-2">
                            <FaCalendarAlt className="me-2" size={12} />
                            <span className="small">{formatDate(booking.bookingTime)}</span>
                        </div>
                        <div className="d-flex align-items-center text-muted">
                            <FaIdCard className="me-2" size={12} />
                            <span className="small">{t('userHome.bookingCard.bookingId')}: {booking.bookingId}</span>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="d-flex flex-column flex-md-row justify-content-end align-items-start align-items-md-center gap-2">
                            <div className="mb-2 mb-md-0">
                                {getStatusBadge(booking.bookingStatusCode)}
                            </div>
                            <div className="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto">
                                {booking.labourMobileNo && (
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => onCall(booking.labourMobileNo)}
                                        className="d-flex align-items-center justify-content-center"
                                    >
                                        <FaPhone className="me-1" size={10} />
                                        <span className="d-none d-md-inline">{t('userHome.bookingCard.call')}</span>
                                        <span className="d-md-none">{t('userHome.bookingCard.call')}</span>
                                    </Button>
                                )}
                                {booking.bookingStatusCode === 3 && (
                                    <Button
                                        variant="outline-success"
                                        size="sm"
                                        onClick={() => onRate(booking)}
                                        className="d-flex align-items-center justify-content-center"
                                    >
                                        <FaEdit className="me-1" size={10} />
                                        <span className="d-none d-md-inline">{t('userHome.bookingCard.review')}</span>
                                        <span className="d-md-none">{t('userHome.bookingCard.review')}</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );
};

const UserHome = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [userData, setUserData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [searchResults, setSearchResults] = useState({
        content: [],
        pageNumber: 0,
        pageSize: 10,
        totalElements: 0,
        totalPages: 0,
        lastPage: false
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchCategory, setSearchCategory] = useState('');
    const [userId, setUserId] = useState(null);
    
    // Booking related state
    const [bookings, setBookings] = useState([]);
    const [isBookingsLoading, setIsBookingsLoading] = useState(false);
    const [bookingsError, setBookingsError] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [bookingFilter, setBookingFilter] = useState('all'); // all, pending, completed, rejected

    useEffect(() => {
        // Try both possible localStorage keys for user data
        const userDataFromStorage = localStorage.getItem('userData') || localStorage.getItem('user');
        
        if (userDataFromStorage) {
            const parsedUserData = JSON.parse(userDataFromStorage);
            setUserData(parsedUserData);
            
            // Handle different possible user data structures
            const userId = parsedUserData.userId || parsedUserData.id;
            setUserId(userId);
            
            // Fetch bookings when component mounts
            if (userId) {
                fetchBookings(userId);
            } else {
                console.error('No userId found in user data:', parsedUserData);
            }
        } else {
            // If no user data found, redirect to login
            navigate('/login');
        }
    }, [navigate]);

    // Fetch user bookings
    const fetchBookings = async (userId) => {
        setIsBookingsLoading(true);
        setBookingsError(null);
        
        try {
            const response = await getUserBookings(userId);
            // The API returns data in response.returnValue, not response.data
            setBookings(response.returnValue || []);
        } catch (error) {
            console.error('Error fetching bookings:', error);
            setBookingsError(t('userHome.failedToLoadBookings'));
        } finally {
            setIsBookingsLoading(false);
        }
    };

    // Handle rating submission
    const handleRatingSubmit = async (rating, review) => {
        if (!selectedBooking) return;
        
        try {
            await rateLabour({
                userId: userId,
                labourId: selectedBooking.labourId || selectedBooking.bookingId, // fallback to bookingId if labourId not available
                labourRating: rating,
                review: review,
                bookingId: selectedBooking.bookingId
            });
            setShowRatingModal(false);
            setSelectedBooking(null);
            // Refresh bookings to update the UI
            fetchBookings(userId);
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert(t('userHome.ratingSubmitFailed'));
        }
    };

    // Handle phone call
    const handleCall = (phoneNumber) => {
        window.open(`tel:${phoneNumber}`, '_self');
    };

    // Handle rating modal
    const handleRateBooking = (booking) => {
        setSelectedBooking(booking);
        setShowRatingModal(true);
    };

    // Filter bookings based on selected filter
    const getFilteredBookings = () => {
        let filteredBookings = bookings;
        
        if (bookingFilter !== 'all') {
            const filterMap = {
                'pending': 1,
                'accepted': 2,
                'completed': 3,
                'rejected': -1
            };
            
            filteredBookings = bookings.filter(booking => booking.bookingStatusCode === filterMap[bookingFilter]);
        }
        
        // Sort bookings by booking time in descending order (latest first)
        return filteredBookings.sort((a, b) => {
            const parseDate = (dateString) => {
                if (!dateString) return new Date(0);
                
                const parts = dateString.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/);
                if (parts) {
                    const year = parseInt(parts[3], 10);
                    const month = parseInt(parts[2], 10) - 1;
                    const day = parseInt(parts[1], 10);
                    const hours = parseInt(parts[4], 10);
                    const minutes = parseInt(parts[5], 10);
                    const seconds = parseInt(parts[6], 10);
                    
                    return new Date(year, month, day, hours, minutes, seconds);
                }
                return new Date(0);
            };
            
            const dateA = parseDate(a.bookingTime);
            const dateB = parseDate(b.bookingTime);
            
            return dateB.getTime() - dateA.getTime(); // Descending order (latest first)
        });
    };

    // Get booking stats for display
    const getBookingStats = () => {
        const total = bookings.length;
        const pending = bookings.filter(b => b.bookingStatusCode === 1).length;
        const completed = bookings.filter(b => b.bookingStatusCode === 3).length;
        const rejected = bookings.filter(b => b.bookingStatusCode === -1).length;
        
        return { total, pending, completed, rejected };
    };

    const handleSearch = async (page = 0, perPage = 10, sortBy = "rating", sortOrder = "desc") => {
        if (!searchCategory.trim()) {
            setError(t('userHome.pleaseEnterCategoryToSearch'));
            return;
        }


        try {
            setIsLoading(true);
            setError('');
            const results = await searchLabourByCategory(searchCategory, page, perPage, sortBy, sortOrder);
            setSearchResults(results);
            setShowModal(true);
        } catch (err) {
            setError(err.message || t('userHome.failedToFetchSearchResults'));
            console.error('Search error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSearchResults({
            content: [],
            pageNumber: 0,
            pageSize: 10,
            totalElements: 0,
            totalPages: 0,
            lastPage: false
        });
        setSearchCategory('');
    };

    const handleLogout = () => {
        // Clear all user-related data from localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('userData');
        localStorage.removeItem('rememberedEmail');
        navigate('/login');
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm(t('userHome.deleteAccountConfirm'))) return;
        try {
            setIsLoading(true);
            await deleteUser(userData.userId);
            localStorage.removeItem('user');
            localStorage.removeItem('userData');
            localStorage.removeItem('rememberedEmail');
            alert(t('userHome.accountDeleted'));
            navigate('/login');
        } catch (err) {
            alert(t('userHome.deleteAccountFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container fluid className="dashboard-container bg-light min-vh-100">
            {/* Professional Header */}
            <div className="dashboard-header bg-gradient-primary shadow-lg border-0">
                <Container>
                    <Row className="py-3 py-md-4">
                        <Col>
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                                <div className="d-flex align-items-center mb-3 mb-md-0">
                                    <div className="profile-badge me-3 me-md-4">
                                        <div className="avatar-professional bg-white shadow-sm">
                                            <FaUserTie className="text-primary" size={28} />
                                        </div>
                                    </div>
                                    <div className="user-info">
                                        <h1 className="h3 mb-2 fw-bold text-white">{t('userHome.welcomeBack')}, {userData?.name || 'User'}!</h1>
                                        <div className="d-flex flex-wrap align-items-center text-white-50 mb-2">
                                            <div className="d-flex align-items-center me-3 me-md-4 mb-1">
                                                <FaIdCard className="me-2" size={14} />
                                                <span className="small">ID: {userData?.userId}</span>
                                            </div>
                                            <div className="d-flex align-items-center me-3 me-md-4 mb-1">
                                                <FaEnvelope className="me-2" size={14} />
                                                <span className="small">{userData?.email || 'user@example.com'}</span>
                                            </div>
                                            <Badge bg="success" className="mb-1 px-2 px-md-3 py-1">
                                                <FaCheckCircle className="me-1" size={12} />
                                                {t('userHome.activeUser')}
                                            </Badge>
                                        </div>
                                        <div className="d-flex align-items-center text-white-50">
                                            <FaCalendarAlt className="me-2" size={12} />
                                            <span className="small">{t('userHome.memberSince')} {new Date().getFullYear()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex flex-column flex-md-row gap-2 w-100 w-md-auto">
                                    <Button 
                                        variant="light" 
                                        className="d-flex align-items-center justify-content-center shadow-sm mb-2 mb-md-0"
                                        onClick={() => {
                                            const bookingsSection = document.querySelector('.my-bookings-section');
                                            if (bookingsSection) {
                                                bookingsSection.scrollIntoView({ 
                                                    behavior: 'smooth', 
                                                    block: 'start' 
                                                });
                                            }
                                        }}
                                    >
                                        <FaHistory className="me-2" size={14} />
                                        {t('userHome.myBookings')}
                                    </Button>
                                    <Button 
                                        variant="outline-light" 
                                        onClick={handleLogout}
                                        className="d-flex align-items-center justify-content-center"
                                    >
                                        <FaSignOutAlt className="me-2" size={14} />
                                        {t('userHome.logout')}
                                    </Button>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            <Container className="py-4">
                {/* Quick Search Section */}
                <Row className="mb-4">
                    <Col>
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-4">
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="mb-0 fw-bold text-dark">
                                        <FaSearch className="me-2 text-primary" />
                                        {t('userHome.findServices')}
                                    </h4>
                                    <Badge bg="primary" className="px-3 py-2">
                                        <FaTools className="me-1" size={12} />
                                        {t('userHome.quickSearch')}
                                    </Badge>
                                </div>
                                
                                <Row className="align-items-center">
                                    <Col lg={8} className="mb-3 mb-lg-0">
                                        <Form.Group>
                                            <Form.Label className="fw-semibold text-dark mb-2">
                                                {t('userHome.whatServiceDoYouNeed')}
                                            </Form.Label>
                                            <InputGroup size="lg">
                                                <InputGroup.Text className="bg-light border-end-0">
                                                    <FaSearch className="text-muted" />
                                                </InputGroup.Text>
                                                <Form.Control
                                                    placeholder={t('userHome.enterCategory')}
                                                    value={searchCategory}
                                                    onChange={(e) => setSearchCategory(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleSearch();
                                                        }
                                                    }}
                                                    className="border-start-0 border-end-0 bg-light"
                                                />
                                                <Button 
                                                    variant="primary"
                                                    onClick={() => handleSearch()}
                                                    disabled={isLoading}
                                                    className="px-3 px-md-4"
                                                >
                                                    {isLoading ? (
                                                        <>
                                                            <Spinner
                                                                as="span"
                                                                animation="border"
                                                                size="sm"
                                                                role="status"
                                                                aria-hidden="true"
                                                                className="me-2"
                                                            />
                                                            <span className="d-none d-md-inline">{t('userHome.searching')}</span>
                                                            <span className="d-md-none">{t('userHome.searching')}</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaSearch className="me-2" />
                                                            <span className="d-none d-md-inline">{t('userHome.searchNow')}</span>
                                                            <span className="d-md-none">{t('userHome.searchNow')}</span>
                                                        </>
                                                    )}
                                                </Button>
                                            </InputGroup>
                                            {error && (
                                                <div className="text-danger small mt-2">
                                                    <FaBell className="me-1" />
                                                    {error}
                                                </div>
                                            )}
                                        </Form.Group>
                                    </Col>
                                    <Col lg={4}>
                                        <div className="text-center text-lg-start">
                                            <div className="d-flex flex-column align-items-center align-items-lg-start">
                                                <div className="text-muted small mb-2">{t('userHome.popularCategories')}</div>
                                                <div className="d-flex flex-wrap gap-1 gap-md-2 justify-content-center justify-content-lg-start">
                                                    {['Plumber', 'Electrician', 'Cleaner', 'Carpenter'].map((category) => (
                                                        <Badge 
                                                            key={category}
                                                            bg="light" 
                                                            text="dark" 
                                                            className="px-2 px-md-3 py-1 py-md-2 cursor-pointer"
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={() => {
                                                                setSearchCategory(category);
                                                                handleSearch();
                                                            }}
                                                        >
                                                            {category}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Quick Actions */}
                <Row className="mb-4">
                    <Col sm={6} className="mb-3">
                        <Card className="action-card border-0 shadow-sm h-100">
                            <Card.Body className="p-3 p-md-4 text-center">
                                <div className="action-icon bg-success bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                    <FaCalendarAlt className="text-success" size={20} />
                                </div>
                                <h5 className="fw-semibold mb-2 small">{t('userHome.trackBookings')}</h5>
                                <p className="text-muted small mb-3 d-none d-md-block">{t('userHome.monitorServiceRequests')}</p>
                                <Button 
                                    variant="success" 
                                    className="w-100"
                                    size="sm"
                                    onClick={() => {
                                        const bookingsSection = document.querySelector('.my-bookings-section');
                                        if (bookingsSection) {
                                            bookingsSection.scrollIntoView({ 
                                                behavior: 'smooth', 
                                                block: 'start' 
                                            });
                                        }
                                    }}
                                >
                                    <FaCalendarAlt className="me-2" />
                                    <span className="d-none d-md-inline">{t('userHome.viewBookings')}</span>
                                    <span className="d-md-none">{t('userHome.viewBookings')}</span>
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col sm={6} className="mb-3">
                        <Card className="action-card border-0 shadow-sm h-100">
                            <Card.Body className="p-3 p-md-4 text-center">
                                <div className="action-icon bg-warning bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                    <FaBell className="text-warning" size={20} />
                                </div>
                                <h5 className="fw-semibold mb-2 small">{t('userHome.notifications')}</h5>
                                <p className="text-muted small mb-3 d-none d-md-block">{t('userHome.stayUpdatedWithAlerts')}</p>
                                <Button 
                                    variant="outline-warning" 
                                    className="w-100"
                                    size="sm"
                                    disabled
                                >
                                    <FaBell className="me-2" />
                                    <span className="d-none d-md-inline">{t('userHome.comingSoon')}</span>
                                    <span className="d-md-none">{t('userHome.comingSoon')}</span>
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Recent Activity Section */}
                <Row className="mb-4">
                    <Col>
                        <Card className="border-0 shadow-sm my-bookings-section">
                            <Card.Header className="bg-white border-0 py-3 py-md-4">
                                <Row className="align-items-center">
                                    <Col xs={12} md={6} className="mb-3 mb-md-0">
                                        <h5 className="mb-0 fw-semibold d-flex align-items-center">
                                            <FaHistory className="me-2 text-primary" />
                                            <span className="small">{t('userHome.myBookingsTitle')}</span>
                                            {bookings.length > 0 && (
                                                <Badge bg="primary" className="ms-2">{getBookingStats().total}</Badge>
                                            )}
                                        </h5>
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <div className="d-flex flex-column flex-md-row gap-2 align-items-stretch align-items-md-center">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => fetchBookings(userId)}
                                                disabled={isBookingsLoading}
                                                className="d-flex align-items-center justify-content-center"
                                            >
                                                <FaSync className={`me-1 ${isBookingsLoading ? 'fa-spin' : ''}`} size={10} />
                                                <span className="d-none d-md-inline">{t('userHome.refresh')}</span>
                                                <span className="d-md-none">{t('userHome.refresh')}</span>
                                            </Button>
                                            <Dropdown>
                                                <Dropdown.Toggle variant="outline-secondary" size="sm" className="d-flex align-items-center justify-content-center w-100 w-md-auto">
                                                    <FaFilter className="me-1" size={10} />
                                                    <span className="d-none d-md-inline">{t('userHome.filter')}</span>
                                                    <span className="d-md-none">{t('userHome.filter')}</span>
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item 
                                                        active={bookingFilter === 'all'} 
                                                        onClick={() => setBookingFilter('all')}
                                                    >
                                                        {t('userHome.allBookings')} ({getBookingStats().total})
                                                    </Dropdown.Item>
                                                    <Dropdown.Item 
                                                        active={bookingFilter === 'pending'} 
                                                        onClick={() => setBookingFilter('pending')}
                                                    >
                                                        {t('userHome.pending')} ({getBookingStats().pending})
                                                    </Dropdown.Item>
                                                    <Dropdown.Item 
                                                        active={bookingFilter === 'completed'} 
                                                        onClick={() => setBookingFilter('completed')}
                                                    >
                                                        {t('userHome.completed')} ({getBookingStats().completed})
                                                    </Dropdown.Item>
                                                    <Dropdown.Item 
                                                        active={bookingFilter === 'rejected'} 
                                                        onClick={() => setBookingFilter('rejected')}
                                                    >
                                                        {t('userHome.rejected')} ({getBookingStats().rejected})
                                                    </Dropdown.Item>
                                                </Dropdown.Menu>
                                            </Dropdown>
                                        </div>
                                    </Col>
                                </Row>
                            </Card.Header>
                            <Card.Body className="p-4">
                                {isBookingsLoading ? (
                                    <div className="text-center py-5">
                                        <Spinner animation="border" variant="primary" />
                                        <p className="mt-3 text-muted">{t('userHome.loadingBookings')}</p>
                                    </div>
                                ) : bookingsError ? (
                                    <Alert variant="danger" className="d-flex align-items-center">
                                        <FaExclamationTriangle className="me-2" />
                                        {t('userHome.failedToLoadBookings')}
                                    </Alert>
                                ) : getFilteredBookings().length === 0 ? (
                                    <div className="text-center py-4 py-md-5">
                                        <div className="empty-state-icon bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                            <FaCalendarAlt className="text-muted" size={24} />
                                        </div>
                                        <h6 className="text-muted mb-2 small">
                                            {bookingFilter === 'all' ? t('userHome.noBookingsYet') : t('userHome.noFilteredBookings')}
                                        </h6>
                                        <p className="text-muted small mb-3 d-none d-md-block">
                                            {bookingFilter === 'all' 
                                                ? t('userHome.noBookingsDesc') 
                                                : t('userHome.noFilteredBookingsDesc')
                                            }
                                        </p>
                                        {bookingFilter === 'all' && (
                                            <Button 
                                                variant="primary" 
                                                size="sm"
                                                onClick={() => setShowModal(true)}
                                                className="d-flex align-items-center justify-content-center mx-auto"
                                            >
                                                <FaSearch className="me-2" size={10} />
                                                <span className="d-none d-md-inline">{t('userHome.findServicesBtn')}</span>
                                                <span className="d-md-none">{t('userHome.findServicesBtn')}</span>
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bookings-list">
                                        {getFilteredBookings().map((booking) => (
                                            <BookingCard
                                                key={booking.bookingId}
                                                booking={booking}
                                                onRate={handleRateBooking}
                                                onCall={handleCall}
                                            />
                                        ))}
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Account Management Section - Less Prominent */}
                <Row className="mb-4">
                    <Col>
                        <Card className="account-management-card border-0 shadow-sm">
                            <Card.Body className="p-3 p-md-4">
                                <h6 className="text-muted mb-3 small">{t('userHome.accountManagement')}</h6>
                                <p className="text-muted small mb-3 d-none d-md-block">{t('userHome.accountManagementDesc')}</p>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>{t('userHome.actionCannotBeUndone')}</Tooltip>}
                                >
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        className="delete-profile-btn w-100 w-md-auto"
                                        onClick={() => {
                                            if (window.confirm(t('userHome.deleteAccountConfirm'))) {
                                                handleDeleteAccount();
                                            }
                                        }}
                                    >
                                        <FaTrashAlt className="me-2" size={10} />
                                        <span className="d-none d-md-inline">{t('userHome.deleteAccount')}</span>
                                        <span className="d-md-none">{t('userHome.deleteAccount')}</span>
                                    </Button>
                                </OverlayTrigger>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Search Modal */}
            <SearchLabourModal
                show={showModal}
                onHide={() => setShowModal(false)}
                searchResults={searchResults}
                error={error}
                searchCategory={searchCategory}
                onPageChange={handleSearch}
                userId={userId}
            />

            {/* Rating Modal */}
            <RatingModal
                show={showRatingModal}
                onHide={() => {
                    setShowRatingModal(false);
                    setSelectedBooking(null);
                }}
                onSubmit={handleRatingSubmit}
                initialRating={0}
                initialReview=""
            />
        </Container>
    );
};

export default UserHome; 