import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Form, InputGroup, Badge, ProgressBar, Tooltip, OverlayTrigger, Modal, Alert, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaTools, FaHistory, FaBell, FaSearch, FaUserTie, FaIdCard, FaPhone, FaEnvelope, FaChartLine, FaBusinessTime, FaCheckCircle, FaTrashAlt, FaCog, FaSync, FaCalendarAlt, FaMapMarkerAlt, FaStar, FaTimesCircle, FaClock, FaEdit, FaEye, FaFilter, FaExclamationTriangle } from 'react-icons/fa';
import { searchLabourByCategory } from '../services/LabourSearchService';
import { getUserBookings, rateLabour } from '../services/BookingService';
import SearchLabourModal from './SearchLabourModal';
import { deleteUser } from '../services/userService';
import '../styles/UserHome.css';

// Reusable Rating Modal Component
const RatingModal = ({ show, onHide, onSubmit, initialRating = 0, initialReview = '' }) => {
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
                <Modal.Title>Rate Service</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Rating</Form.Label>
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
                        <Form.Label>Review</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={review}
                            onChange={(e) => setReview(e.target.value)}
                            placeholder="Write your review here..."
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancel</Button>
                <Button variant="primary" onClick={handleSubmit}>Submit Review</Button>
            </Modal.Footer>
        </Modal>
    );
};

// Reusable Booking Card Component
const BookingCard = ({ booking, onRate, onCall }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'Invalid Date';
        
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
        return 'Invalid Date';
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
                return <Badge bg="success" className="px-3 py-2"><FaCheckCircle className="me-1" /> Completed</Badge>;
            default:
                return <Badge bg="secondary" className="px-3 py-2"><FaClock className="me-1" /> Unknown</Badge>;
        }
    };

    return (
        <Card className="booking-card border-0 shadow-sm mb-3">
            <Card.Body className="p-4">
                <Row className="align-items-center">
                    <Col md={6}>
                        <div className="d-flex align-items-center mb-3">
                            <div className="service-icon bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                                <FaTools className="text-primary" size={20} />
                            </div>
                            <div>
                                <h5 className="mb-1 fw-semibold">{booking.labourName || 'Unknown Labour'}</h5>
                                <p className="text-muted mb-0">{booking.labourSkill || 'Service'}</p>
                            </div>
                        </div>
                        <div className="d-flex align-items-center text-muted mb-2">
                            <FaCalendarAlt className="me-2" size={14} />
                            <span className="small">{formatDate(booking.bookingTime)}</span>
                        </div>
                        <div className="d-flex align-items-center text-muted">
                            <FaIdCard className="me-2" size={14} />
                            <span className="small">Booking ID: {booking.bookingId}</span>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="d-flex justify-content-end align-items-center flex-wrap gap-2">
                            {getStatusBadge(booking.bookingStatusCode)}
                            <div className="d-flex gap-2">
                                {booking.labourMobileNo && (
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => onCall(booking.labourMobileNo)}
                                        className="d-flex align-items-center"
                                    >
                                        <FaPhone className="me-1" size={12} />
                                        Call
                                    </Button>
                                )}
                                {booking.bookingStatusCode === 3 && (
                                    <Button
                                        variant="outline-success"
                                        size="sm"
                                        onClick={() => onRate(booking)}
                                        className="d-flex align-items-center"
                                    >
                                        <FaEdit className="me-1" size={12} />
                                        Review
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
            setBookingsError('Failed to load bookings. Please try again.');
        } finally {
            setIsBookingsLoading(false);
        }
    };

    // Handle rating submission
    const handleRatingSubmit = async (rating, review) => {
        if (!selectedBooking) return;
        
        try {
            await rateLabour(selectedBooking.bookingId, rating, review);
            setShowRatingModal(false);
            setSelectedBooking(null);
            // Refresh bookings to update the UI
            fetchBookings(userId);
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Failed to submit rating. Please try again.');
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
            setError('Please enter a category to search');
            return;
        }


        try {
            setIsLoading(true);
            setError('');
            const results = await searchLabourByCategory(searchCategory, page, perPage, sortBy, sortOrder);
            setSearchResults(results);
            setShowModal(true);
        } catch (err) {
            setError(err.message || 'Failed to fetch search results. Please try again.');
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
        if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
        try {
            setIsLoading(true);
            await deleteUser(userData.userId);
            localStorage.removeItem('user');
            localStorage.removeItem('userData');
            localStorage.removeItem('rememberedEmail');
            alert('Your account has been deleted.');
            navigate('/login');
        } catch (err) {
            alert('Failed to delete account. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Container fluid className="dashboard-container bg-light min-vh-100">
            {/* Professional Header */}
            <div className="dashboard-header bg-gradient-primary shadow-lg border-0">
                <Container>
                    <Row className="py-4">
                        <Col>
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <div className="profile-badge me-4">
                                        <div className="avatar-professional bg-white shadow-sm">
                                            <FaUserTie className="text-primary" size={28} />
                                        </div>
                                    </div>
                                    <div className="user-info">
                                        <h1 className="h3 mb-2 fw-bold text-white">Welcome back, {userData?.name || 'User'}!</h1>
                                        <div className="d-flex flex-wrap align-items-center text-white-50 mb-2">
                                            <div className="d-flex align-items-center me-4 mb-1">
                                                <FaIdCard className="me-2" size={14} />
                                                <span className="small">ID: {userData?.userId}</span>
                                            </div>
                                            <div className="d-flex align-items-center me-4 mb-1">
                                                <FaEnvelope className="me-2" size={14} />
                                                <span className="small">{userData?.email || 'user@example.com'}</span>
                                            </div>
                                            <Badge bg="success" className="mb-1 px-3 py-1">
                                                <FaCheckCircle className="me-1" size={12} />
                                                Active User
                                            </Badge>
                                        </div>
                                        <div className="d-flex align-items-center text-white-50">
                                            <FaCalendarAlt className="me-2" size={12} />
                                            <span className="small">Member since {new Date().getFullYear()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex gap-2 flex-wrap">
                                    <Button 
                                        variant="light" 
                                        className="d-flex align-items-center shadow-sm"
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
                                        My Bookings
                                    </Button>
                                    <Button 
                                        variant="outline-light" 
                                        onClick={handleLogout}
                                        className="d-flex align-items-center"
                                    >
                                        <FaSignOutAlt className="me-2" size={14} />
                                        Logout
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
                                        Find Services
                                    </h4>
                                    <Badge bg="primary" className="px-3 py-2">
                                        <FaTools className="me-1" size={12} />
                                        Quick Search
                                    </Badge>
                                </div>
                                
                                <Row className="align-items-center">
                                    <Col lg={8}>
                                        <Form.Group className="mb-3 mb-lg-0">
                                            <Form.Label className="fw-semibold text-dark mb-2">
                                                What service do you need?
                                            </Form.Label>
                                            <InputGroup size="lg">
                                                <InputGroup.Text className="bg-light border-end-0">
                                                    <FaSearch className="text-muted" />
                                                </InputGroup.Text>
                                                <Form.Control
                                                    placeholder="Enter category (e.g., plumber, electrician, cleaner)"
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
                                                    className="px-4"
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
                                                            Searching...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FaSearch className="me-2" />
                                                            Search Now
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
                                                <div className="text-muted small mb-2">Popular Categories</div>
                                                <div className="d-flex flex-wrap gap-2">
                                                    {['Plumber', 'Electrician', 'Cleaner', 'Carpenter'].map((category) => (
                                                        <Badge 
                                                            key={category}
                                                            bg="light" 
                                                            text="dark" 
                                                            className="px-3 py-2 cursor-pointer"
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
                    <Col md={6} className="mb-3">
                        <Card className="action-card border-0 shadow-sm h-100">
                            <Card.Body className="p-4 text-center">
                                <div className="action-icon bg-success bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                    <FaCalendarAlt className="text-success" size={24} />
                                </div>
                                <h5 className="fw-semibold mb-2">Track Bookings</h5>
                                <p className="text-muted small mb-3">Monitor your service requests and appointments</p>
                                <Button 
                                    variant="success" 
                                    className="w-100"
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
                                    View Bookings
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={6} className="mb-3">
                        <Card className="action-card border-0 shadow-sm h-100">
                            <Card.Body className="p-4 text-center">
                                <div className="action-icon bg-warning bg-opacity-10 rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                    <FaBell className="text-warning" size={24} />
                                </div>
                                <h5 className="fw-semibold mb-2">Notifications</h5>
                                <p className="text-muted small mb-3">Stay updated with service alerts and messages</p>
                                <Button 
                                    variant="outline-warning" 
                                    className="w-100"
                                    disabled
                                >
                                    <FaBell className="me-2" />
                                    Coming Soon
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Recent Activity Section */}
                <Row className="mb-4">
                    <Col>
                        <Card className="border-0 shadow-sm my-bookings-section">
                            <Card.Header className="bg-white border-0 py-4">
                                <Row className="align-items-center">
                                    <Col>
                                        <h5 className="mb-0 fw-semibold d-flex align-items-center">
                                            <FaHistory className="me-2 text-primary" />
                                            My Bookings
                                            {bookings.length > 0 && (
                                                <Badge bg="primary" className="ms-2">{getBookingStats().total}</Badge>
                                            )}
                                        </h5>
                                    </Col>
                                    <Col xs="auto">
                                        <div className="d-flex gap-2 align-items-center">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => fetchBookings(userId)}
                                                disabled={isBookingsLoading}
                                                className="d-flex align-items-center"
                                            >
                                                <FaSync className={`me-1 ${isBookingsLoading ? 'fa-spin' : ''}`} size={12} />
                                                Refresh
                                            </Button>
                                            <Dropdown>
                                                <Dropdown.Toggle variant="outline-secondary" size="sm" className="d-flex align-items-center">
                                                    <FaFilter className="me-1" size={12} />
                                                    Filter
                                                </Dropdown.Toggle>
                                                <Dropdown.Menu>
                                                    <Dropdown.Item 
                                                        active={bookingFilter === 'all'} 
                                                        onClick={() => setBookingFilter('all')}
                                                    >
                                                        All Bookings ({getBookingStats().total})
                                                    </Dropdown.Item>
                                                    <Dropdown.Item 
                                                        active={bookingFilter === 'pending'} 
                                                        onClick={() => setBookingFilter('pending')}
                                                    >
                                                        Pending ({getBookingStats().pending})
                                                    </Dropdown.Item>
                                                    <Dropdown.Item 
                                                        active={bookingFilter === 'completed'} 
                                                        onClick={() => setBookingFilter('completed')}
                                                    >
                                                        Completed ({getBookingStats().completed})
                                                    </Dropdown.Item>
                                                    <Dropdown.Item 
                                                        active={bookingFilter === 'rejected'} 
                                                        onClick={() => setBookingFilter('rejected')}
                                                    >
                                                        Rejected ({getBookingStats().rejected})
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
                                        <p className="mt-3 text-muted">Loading your bookings...</p>
                                    </div>
                                ) : bookingsError ? (
                                    <Alert variant="danger" className="d-flex align-items-center">
                                        <FaExclamationTriangle className="me-2" />
                                        {bookingsError}
                                    </Alert>
                                ) : getFilteredBookings().length === 0 ? (
                                    <div className="text-center py-5">
                                        <div className="empty-state-icon bg-light rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                                            <FaCalendarAlt className="text-muted" size={32} />
                                        </div>
                                        <h6 className="text-muted mb-2">
                                            {bookingFilter === 'all' ? 'No bookings yet' : `No ${bookingFilter} bookings`}
                                        </h6>
                                        <p className="text-muted small mb-3">
                                            {bookingFilter === 'all' 
                                                ? 'Start by searching for services in your area' 
                                                : `You don't have any ${bookingFilter} bookings at the moment`
                                            }
                                        </p>
                                        {bookingFilter === 'all' && (
                                            <Button 
                                                variant="primary" 
                                                size="sm"
                                                onClick={() => setShowModal(true)}
                                                className="d-flex align-items-center mx-auto"
                                            >
                                                <FaSearch className="me-2" size={12} />
                                                Find Services
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
                            <Card.Body className="p-4">
                                <h6 className="text-muted mb-3">Account Management</h6>
                                <p className="text-muted small mb-3">Manage your account settings and preferences</p>
                                <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>This action cannot be undone</Tooltip>}
                                >
                                    <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        className="delete-profile-btn"
                                        onClick={() => {
                                            if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                                                handleDeleteAccount();
                                            }
                                        }}
                                    >
                                        <FaTrashAlt className="me-2" size={12} />
                                        Delete Account
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