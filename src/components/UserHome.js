import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Form, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaTools, FaHistory, FaBell, FaSearch } from 'react-icons/fa';
import { searchLabourByCategory } from '../services/LabourSearchService';
import SearchLabourModal from './SearchLabourModal';
import ViewBookingsModal from './ViewBookingsModal';

const UserHome = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showBookingsModal, setShowBookingsModal] = useState(false);
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

    useEffect(() => {
        // Get user data from localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUserData(userData);
            setUserId(userData.userId);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleSearch = async (page = 0, perPage = 10, sortBy = "rating", sortOrder = "desc") => {
        if (!searchCategory.trim()) {
            setError('Please enter a category to search');
            return;
        }

        console.log(`Searching for category: ${searchCategory}`);

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
        localStorage.removeItem('rememberedEmail');
        navigate('/login');
    };

    return (
        <Container fluid className="px-4 py-3">
            {/* Header Section */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <h2 className="mb-0">Welcome to InstaLab</h2>
                        <div className="d-flex align-items-center">
                            <span className="me-3">
                                <FaUser className="me-2" />
                                {userData?.email}
                            </span>
                            <Button 
                                variant="outline-danger" 
                                onClick={handleLogout}
                                className="d-flex align-items-center"
                            >
                                <FaSignOutAlt className="me-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Quick Actions Section */}
            <Row className="mb-4">
                <Col>
                    <h3 className="mb-3">Quick Actions</h3>
                    <Row>
                        <Col md={4} className="mb-3">
                            <Card className="h-100 shadow-sm">
                                <Card.Body>
                                    <div className="d-flex align-items-center mb-3">
                                        <FaTools className="text-primary me-2" size={24} />
                                        <h5 className="mb-0">Find Services</h5>
                                    </div>
                                    <p className="text-muted">Search for skilled laborers and services in your area</p>
                                    <InputGroup className="mb-3">
                                        <Form.Control
                                            placeholder="Enter category (e.g., sweeper, plumber)"
                                            value={searchCategory}
                                            onChange={(e) => setSearchCategory(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleSearch();
                                                }
                                            }}
                                        />
                                        <Button 
                                            variant="primary"
                                            onClick={() => handleSearch()}
                                            disabled={isLoading}
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
                                                    Search
                                                </>
                                            )}
                                        </Button>
                                    </InputGroup>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-3">
                            <Card className="h-100 shadow-sm">
                                <Card.Body>
                                    <div className="d-flex align-items-center mb-3">
                                        <FaHistory className="text-primary me-2" size={24} />
                                        <h5 className="mb-0">My Bookings</h5>
                                    </div>
                                    <p className="text-muted">View and manage your service bookings</p>
                                    <Button 
                                        variant="primary" 
                                        className="w-100"
                                        onClick={() => setShowBookingsModal(true)}
                                    >
                                        View Bookings
                                    </Button>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col md={4} className="mb-3">
                            <Card className="h-100 shadow-sm">
                                <Card.Body>
                                    <div className="d-flex align-items-center mb-3">
                                        <FaBell className="text-primary me-2" size={24} />
                                        <h5 className="mb-0">Notifications</h5>
                                    </div>
                                    <p className="text-muted">Check your notifications and updates</p>
                                    <Button variant="primary" className="w-100">View Notifications</Button>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>

            {/* Search Results Modal */}
            <SearchLabourModal
                show={showModal}
                onHide={handleCloseModal}
                searchResults={searchResults}
                error={error}
                searchCategory={searchCategory}
                onPageChange={handleSearch}
                userId={userId}
            />

            {/* Bookings Modal */}
            <ViewBookingsModal
                show={showBookingsModal}
                onHide={() => setShowBookingsModal(false)}
                userId={userId}
            />

            {/* Recent Activity Section */}
            <Row>
                <Col>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <h3 className="mb-3">Recent Activity</h3>
                            <div className="text-center py-4">
                                <p className="text-muted mb-0">No recent activity to show</p>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default UserHome; 