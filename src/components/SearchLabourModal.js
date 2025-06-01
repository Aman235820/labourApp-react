import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Card, Alert } from 'react-bootstrap';
import DataTable from "react-data-table-component";
import { FaStar, FaPhone, FaTools, FaComments } from 'react-icons/fa';
import { bookLabour } from '../services/BookingService';

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
    const [selectedLabour, setSelectedLabour] = useState(null);
    const [showReviews, setShowReviews] = useState(false);
    const [bookingStatus, setBookingStatus] = useState(null);
    const [isBooking, setIsBooking] = useState(false);

    const handleViewReviews = (labour) => {
        setSelectedLabour(labour);
        setShowReviews(true);
    };

    const handleBookLabour = async (labour) => {
        try {
            setIsBooking(true);
            setBookingStatus(null);

            // Get user data from localStorage
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                throw new Error('User data not found. Please login again.');
            }
            const userData = JSON.parse(storedUser);

            // Prepare booking data with only userId and labourId
            const bookingData = {
                userId: userData.userId,
                labourId: labour.labourId,
            };

            const response = await bookLabour(bookingData);
            setBookingStatus({
                type: 'success',
                message: 'Labour booked successfully!'
            });
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

    const columns = [
        {
            name: 'Name',
            selector: row => row.labourName,
            sortable: true,
        },
        {
            name: 'Skill',
            selector: row => row.labourSkill,
            sortable: true,
            cell: row => (
                <div className="d-flex align-items-center">
                    <FaTools className="text-primary me-2" />
                    {row.labourSkill}
                </div>
            ),
        },
        {
            name: 'Rating',
            selector: row => parseFloat(row.rating),
            sortable: true,
            cell: row => (
                <div className="d-flex align-items-center">
                    <FaStar className="text-warning me-2" />
                    {row.rating} ({row.ratingCount} reviews)
                </div>
            ),
        },
        {
            name: 'Phone',
            selector: row => row.labourMobileNo,
            cell: row => (
                <div className="d-flex align-items-center">
                    <FaPhone className="text-primary me-2" />
                    {row.labourMobileNo}
                </div>
            ),
        },
        {
            name: 'Actions',
            cell: row => (
                <div>
                    <Button 
                        variant="primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleViewReviews(row)}
                    >
                        <FaComments className="me-1" />
                        Reviews
                    </Button>
                    <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handleBookLabour(row)}
                        disabled={isBooking}
                    >
                        {isBooking ? 'Booking...' : 'Book Now'}
                    </Button>
                </div>
            ),
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

    const ReviewsModal = ({ show, onHide, labour }) => {
        if (!labour) return null;

        return (
            <Modal show={show} onHide={onHide} size="lg">
                <ModalHeader closeButton>
                    <Modal.Title>Reviews for {labour.labourName}</Modal.Title>
                </ModalHeader>
                <ModalBody>
                    <div className="mb-4">
                        <h5>Overall Rating</h5>
                        <div className="d-flex align-items-center">
                            <FaStar className="text-warning me-2" size={24} />
                            <span className="h4 mb-0">{labour.rating}</span>
                            <span className="text-muted ms-2">({labour.ratingCount} reviews)</span>
                        </div>
                    </div>
                    <div className="reviews-list">
                        {labour.reviews.map((review, index) => (
                            <Card key={index} className="mb-3">
                                <Card.Body>
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <div className="d-flex align-items-center">
                                            <FaStar className="text-warning me-2" />
                                            <span>{review.rating}</span>
                                        </div>
                                        {review.reviewTime && (
                                            <small className="text-muted">
                                                {new Date(review.reviewTime).toLocaleDateString()}
                                            </small>
                                        )}
                                    </div>
                                    <p className="mb-0">{review.review}</p>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                </ModalBody>
                <ModalFooter>
                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>
        );
    };

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
                    <DataTable
                        columns={columns}
                        data={searchResults.content || []}
                        pagination
                        paginationServer
                        paginationTotalRows={searchResults.totalElements || 0}
                        paginationPerPage={searchResults.pageSize || 10}
                        paginationDefaultPage={searchResults.pageNumber + 1}
                        onChangePage={handlePageChange}
                        onChangeRowsPerPage={handlePerRowsChange}
                        onSort={handleSort}
                        sortServer
                        customStyles={customStyles}
                        highlightOnHover
                        pointerOnHover
                        noDataComponent={
                            <div className="text-center py-4">
                                <p className="text-muted mb-0">No results found</p>
                            </div>
                        }
                    />
                </ModalBody>
                <ModalFooter>
                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>

            <ReviewsModal 
                show={showReviews} 
                onHide={() => setShowReviews(false)} 
                labour={selectedLabour}
            />
        </>
    );
};

export default SearchLabourModal; 