import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Card, Alert, Spinner } from 'react-bootstrap';
import DataTable from "react-data-table-component";
import { FaStar, FaPhone, FaTools } from 'react-icons/fa';
import { bookLabour } from '../services/BookingService';
import { labourService } from '../services/labourService';
import LabourDetailsModal from './LabourDetailsModal';

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
    const [bookingStatus, setBookingStatus] = useState(null);
    const [isBooking, setIsBooking] = useState(false);
    const [selectedLabourDetails, setSelectedLabourDetails] = useState(null);
    const [showLabourDetails, setShowLabourDetails] = useState(false);
    const [loadingLabourDetails, setLoadingLabourDetails] = useState(false);
    const [labourDetailsError, setLabourDetailsError] = useState('');

    // Auto-dismiss success message after 3 seconds
    useEffect(() => {
        if (bookingStatus && bookingStatus.type === 'success') {
            const timer = setTimeout(() => setBookingStatus(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [bookingStatus]);

    const handleBookLabour = async (labour) => {
        try {
            setIsBooking(true);
            setBookingStatus(null);
            const storedUser = localStorage.getItem('user');
            if (!storedUser) {
                throw new Error('User data not found. Please login again.');
            }
            const userData = JSON.parse(storedUser);
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

    // Use external LabourDetailsModal
    const handleRowClicked = async (row) => {
        setLoadingLabourDetails(true);
        setLabourDetailsError('');
        setSelectedLabourDetails(null);
        try {
            const data = await labourService.getLabourById(row.labourId);
            setSelectedLabourDetails(data);
            setShowLabourDetails(true);
        } catch (err) {
            setLabourDetailsError(err.message || 'Failed to fetch labour details.');
            setShowLabourDetails(true);
        } finally {
            setLoadingLabourDetails(false);
        }
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
                    {row.rating && parseFloat(row.rating) > 0
                        ? `${row.rating} (${row.ratingCount} reviews)`
                        : 'No Ratings Yet'}
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
            name: 'Actions',
            cell: row => (
                <div>
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
                borderRadius: '8px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                transition: 'background 0.2s, box-shadow 0.2s, font-weight 0.2s',
            },
            highlightOnHoverStyle: {
                backgroundColor: '#cce3ff',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(0,123,255,0.18)',
                fontWeight: 'bold',
            },
        },
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
                        onRowClicked={handleRowClicked}
                    />
                </ModalBody>
                <ModalFooter>
                    <Button variant="secondary" onClick={onHide}>
                        Close
                    </Button>
                </ModalFooter>
            </Modal>

            <LabourDetailsModal
                show={showLabourDetails}
                onHide={() => setShowLabourDetails(false)}
                selectedLabour={selectedLabourDetails}
            />
        </>
    );
};

export default SearchLabourModal; 