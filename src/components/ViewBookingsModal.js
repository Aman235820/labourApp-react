import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Card, Alert, Spinner, Form, Badge } from 'react-bootstrap';
import DataTable from "react-data-table-component";
import { FaTools, FaCalendar, FaPhone, FaUser, FaStar, FaTimesCircle, FaClock, FaCheckCircle } from 'react-icons/fa';
import { getUserBookings, rateLabour } from '../services/BookingService';
import axios from 'axios';

const RatingModal = ({ show, onHide, onSubmit, initialRating = 0, initialReview = '' }) => {
    const [rating, setRating] = useState(initialRating);
    const [review, setReview] = useState(initialReview);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(rating, review);
    };

    return (
        <Modal 
            show={show} 
            onHide={onHide}
            backdrop="static"
            keyboard={false}
            centered
        >
            <ModalHeader closeButton>
                <Modal.Title>Rate Service</Modal.Title>
            </ModalHeader>
            <ModalBody>
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
            </ModalBody>
            <ModalFooter>
                <Button variant="secondary" onClick={onHide}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Submit Review
                </Button>
            </ModalFooter>
        </Modal>
    );
};

const ViewBookingsModal = ({ show, onHide, userId }) => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);

    useEffect(() => {
        if (show && userId) {
            fetchBookings();
        }
    }, [show, userId]);

    const fetchBookings = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await getUserBookings(userId);
            console.log('Bookings API Response:', response);
            setBookings(response.returnValue || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch bookings');
        } finally {
            setIsLoading(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        try {
            const userDetailsStr = localStorage.getItem('user');
            if (!userDetailsStr) {
                alert('User details not found. Please login again.');
                return;
            }

            const userDetails = JSON.parse(userDetailsStr);
            if (!userDetails || !userDetails.userId) {
                alert('Invalid user details. Please login again.');
                return;
            }

            if (!selectedBooking || !selectedBooking.labourId || !selectedBooking.bookingId) {
                alert('Booking information is missing. Please try again.');
                return;
            }

            // Convert rating to decimal number
            const ratingDecimal = Number(e.target.elements.rating.value).toFixed(1);

            // Close the popup immediately
            setShowRatingModal(false);

            console.log('Submitting review with data:', {
                userId: userDetails.userId,
                labourId: selectedBooking.labourId,
                labourRating: Number(ratingDecimal).toFixed(1),
                review: e.target.elements.review.value,
                bookingId: selectedBooking.bookingId
            });

            const response = await rateLabour({
                userId: userDetails.userId,
                labourId: selectedBooking.labourId,
                labourRating: Number(ratingDecimal).toFixed(1),
                review: e.target.elements.review.value,
                bookingId: selectedBooking.bookingId
            });

            console.log('API Response:', response.data);

            if (response.data && response.data.success) {
                alert('Review submitted successfully!');
                fetchBookings();
            } else {
                throw new Error(response.data?.message || 'Failed to submit review');
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert(error.response?.data?.message || error.message || 'Failed to submit review. Please try again.');
        }
    };

    const getStatusBadge = (statusCode) => {
        switch (statusCode) {
            case -1:
                return <Badge bg="danger" className="status-badge"><FaTimesCircle className="me-1" /> Rejected</Badge>;
            case 1:
                return <Badge bg="warning" className="status-badge"><FaClock className="me-1" /> Pending</Badge>;
            case 2:
                return <Badge bg="primary" className="status-badge"><FaCheckCircle className="me-1" /> Accepted</Badge>;
            case 3:
                return <Badge bg="success" className="status-badge"><FaClock className="me-1" /> Completed</Badge>;
            default:
                return <Badge bg="secondary" className="status-badge"><FaClock className="me-1" /> Unknown</Badge>;
        }
    };

    const columns = [
        {
            name: 'Labour Name',
            selector: row => row.labourName,
            sortable: true,
            cell: row => (
                <div className="d-flex align-items-center">
                    <FaUser className="text-primary me-2" />
                    {row.labourName || 'N/A'}
                </div>
            ),
        },
        {
            name: 'Service',
            selector: row => row.labourSkill,
            sortable: true,
            cell: row => (
                <div className="d-flex align-items-center">
                    <FaTools className="text-primary me-2" />
                    {row.labourSkill || 'N/A'}
                </div>
            ),
        },
        {
            name: 'Phone',
            selector: row => row.labourMobileNo,
            cell: row => (
                <div className="d-flex align-items-center">
                    <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => window.location.href = `tel:${row.labourMobileNo}`}
                        className="d-flex align-items-center"
                    >
                        <FaPhone className="me-2" />
                        Call Now
                    </Button>
                </div>
            ),
        },
        {
            name: 'Booking Date',
            selector: row => row.bookingTime,
            sortable: true,
            cell: row => {
                const dateString = row.bookingTime;
                let formattedDate = 'Invalid Date';

                if (dateString) {
                    // Assuming format is "DD-MM-YYYY HH:mm:ss"
                    const parts = dateString.match(/(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})/);
                    if (parts) {
                        // parts[1] is day, parts[2] is month (1-indexed), parts[3] is year
                        // parts[4] is hour, parts[5] is minute, parts[6] is second
                        const year = parseInt(parts[3], 10);
                        const month = parseInt(parts[2], 10) - 1; // Month is 0-indexed
                        const day = parseInt(parts[1], 10);
                        const hours = parseInt(parts[4], 10);
                        const minutes = parseInt(parts[5], 10);
                        const seconds = parseInt(parts[6], 10);

                        const date = new Date(year, month, day, hours, minutes, seconds);

                        if (!isNaN(date.getTime())) {
                            formattedDate = date.toLocaleString('en-US', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: false
                            });
                        }
                    }
                }

                return (
                    <div className="d-flex align-items-center">
                        <FaCalendar className="text-primary me-2" />
                        {formattedDate}
                    </div>
                );
            },
        },
        {
            name: 'Status',
            selector: row => row.bookingStatusCode,
            sortable: true,
            cell: row => {
                let statusText = 'N/A';
                let statusColor = 'secondary';

                switch (row.bookingStatusCode) {
                    case 1:
                        statusText = 'Confirmation Pending';
                        statusColor = 'warning';
                        break;
                    case 2:
                        statusText = 'Booking Accepted';
                        statusColor = 'success';
                        break;
                    case 3:
                        statusText = 'Task Completed';
                        statusColor = 'info';
                        break;
                    case -1:
                        statusText = 'Booking Rejected';
                        statusColor = 'danger';
                        break;
                    default:
                        statusText = 'Unknown Status';
                        statusColor = 'secondary';
                }

                return (
                    <div className="d-flex align-items-center gap-2">
                        <span className={`badge bg-${statusColor}`}>
                            {statusText}
                        </span>
                        {row.bookingStatusCode === 3 && (
                            <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => {
                                    setSelectedBooking(row);
                                    setShowRatingModal(true);
                                }}
                            >
                                Review Service
                            </Button>
                        )}
                    </div>
                );
            },
        },
    ];

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #dee2e6',
            },
        },
        rows: {
            style: {
                minHeight: '72px',
            },
        },
    };

    return (
        <>
            <Modal show={show} onHide={onHide} size="xl">
                <ModalHeader closeButton>
                    <Modal.Title>My Bookings</Modal.Title>
                </ModalHeader>
                <ModalBody>
                    {error && (
                        <Alert variant="danger" role="alert">
                            {error}
                        </Alert>
                    )}
                    {isLoading ? (
                        <div className="text-center py-4">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </Spinner>
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={bookings}
                            pagination
                            customStyles={customStyles}
                            highlightOnHover
                            pointerOnHover
                            noDataComponent={
                                <div className="text-center py-4">
                                    <p className="text-muted mb-0">No bookings found</p>
                                </div>
                            }
                        />
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
            <RatingModal
                show={showRatingModal}
                onHide={() => setShowRatingModal(false)}
                onSubmit={handleReviewSubmit}
            />
        </>
    );
};

export default ViewBookingsModal; 