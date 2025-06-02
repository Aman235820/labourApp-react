import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Card, Alert, Spinner } from 'react-bootstrap';
import DataTable from "react-data-table-component";
import { FaTools, FaCalendar, FaPhone, FaUser } from 'react-icons/fa';
import { getUserBookings } from '../services/BookingService';

const ViewBookingsModal = ({ show, onHide, userId }) => {
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

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
                    <FaPhone className="text-primary me-2" />
                    {row.labourMobileNo || 'N/A'}
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
                             formattedDate = date.toLocaleDateString(); // Or use toLocaleString() for date and time
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
                    case 0:
                        statusText = 'Confirmation Pending';
                        statusColor = 'warning';
                        break;
                    case 1:
                        statusText = 'Booking Accepted';
                        statusColor = 'success';
                        break;
                    case 2:
                        statusText = 'Work Done';
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
                    <span className={`badge bg-${statusColor}`}>
                        {statusText}
                    </span>
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
    );
};

export default ViewBookingsModal; 