import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Alert, Badge, Button } from 'react-bootstrap';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import DataTable from 'react-data-table-component';
import { adminService } from '../services/adminService';
import { FaTimesCircle, FaClock, FaCheckCircle, FaStar, FaTools, FaUpload } from 'react-icons/fa';
import BookingDetailsModal from './BookingDetailsModal';
import AdminStats from './AdminStats';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
  const [labours, setLabours] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoadingLabours, setIsLoadingLabours] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLabour, setSelectedLabour] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [labourModalOpen, setLabourModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  // Pagination and Sorting State for Labours
  const [labourPageNumber, setLabourPageNumber] = useState(0);
  const [labourPageSize, setLabourPageSize] = useState(10);
  const [labourSortBy, setLabourSortBy] = useState('rating');
  const [labourSortOrder, setLabourSortOrder] = useState('asc');
  const [totalLabourElements, setTotalLabourElements] = useState(0);
  const [totalLabourPages, setTotalLabourPages] = useState(0);

  // Pagination and Sorting State for Users
  const [userPageNumber, setUserPageNumber] = useState(0);
  const [userPageSize, setUserPageSize] = useState(5);
  const [userSortBy, setUserSortBy] = useState('fullName');
  const [userSortOrder, setUserSortOrder] = useState('asc');
  const [totalUserElements, setTotalUserElements] = useState(0);
  const [totalUserPages, setTotalUserPages] = useState(0);

  // Pagination and Sorting State for Bookings
  const [bookingPageNumber, setBookingPageNumber] = useState(0);
  const [bookingPageSize, setBookingPageSize] = useState(20);
  const [bookingSortBy, setBookingSortBy] = useState('bookingTime');
  const [bookingSortOrder, setBookingSortOrder] = useState('asc');
  const [totalBookingElements, setTotalBookingElements] = useState(0);
  const [totalBookingPages, setTotalBookingPages] = useState(0);

  // Custom Styles for DataTable
  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #dee2e6',
        fontSize: '1rem',
        fontWeight: 'bold',
      },
    },
    headCells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
        textAlign: 'center !important',
      },
    },
    cells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
        textAlign: 'center !important',
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #dee2e6',
      },
    },
    rows: {
      highlightOnHoverStyle: {
        backgroundColor: '#e9e9e9',
      },
    },
  };

  // Custom styles to specifically target the content div within cells
  customStyles.cells.style['& > div'] = {
    textAlign: 'center !important',
    justifyContent: 'center !important',
    alignItems: 'center !important',
  };

  // Custom styles to force center alignment for header text
  customStyles.headCells.style['& > div'] = {
    textAlign: 'center !important',
    justifyContent: 'center !important',
    alignItems: 'center !important',
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

  // Columns Configuration for Users
  const userColumns = [
    {
      name: 'ID',
      selector: row => row.userId,
      sortable: true,
      sortField: 'userId',
    },
    {
      name: 'Name',
      selector: row => row.fullName,
      sortable: true,
      sortField: 'fullName',
    },
    {
      name: 'Mobile',
      selector: row => row.mobileNumber,
      sortable: true,
      sortField: 'mobileNo',
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2">
          <button onClick={() => handleRemoveUser(row.userId)} className="btn btn-danger btn-sm action-btn-sm">Delete</button>
          <button onClick={() => handleViewUser(row.userId , row.mobileNumber)} className="btn btn-info btn-sm action-btn-sm">View Details</button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '160px',
    },
  ];

  // Columns Configuration for Bookings
  const bookingColumns = [
    {
      name: 'Booking ID',
      selector: row => row.bookingId,
      sortable: true,
      sortField: 'bookingId',
      width: '100px',
      center: true,
    },
    {
      name: 'Status',
      selector: row => row.bookingStatusCode,
      sortable: true,
      sortField: 'bookingStatusCode',
      width: '120px',
      center: true,
      cell: row => getStatusBadge(row.bookingStatusCode),
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2 justify-content-center">
          <button onClick={() => handleViewBooking(row)} className="btn btn-info btn-sm action-btn-sm">View Details</button>
          <button onClick={() => handleDeleteBooking(row.bookingId)} className="btn btn-danger btn-sm action-btn-sm">Delete</button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '180px',
      center: true,
    },
  ];

  // Fetch Labours on component mount or when pagination/sorting changes
  useEffect(() => {
    console.log('Fetching Labours...', { labourPageNumber, labourPageSize, labourSortBy, labourSortOrder });
    const fetchLabours = async () => {
      try {
        setIsLoadingLabours(true);
        // Fetch all labours with current pagination and sorting
        const response = await adminService.getAllLabours(labourPageNumber, labourPageSize, labourSortBy, labourSortOrder); 
        if (response && Array.isArray(response.content)) {
          // Update labours state with fetched data and pagination info
          setLabours(response.content);
          setTotalLabourElements(response.totalElements || 0);
          setTotalLabourPages(response.totalPages || 0);
        } else {
          console.error('API response for labours is not an array:', response);
          setLabours([]); // Ensure it's always an array
          setTotalLabourElements(0);
          setTotalLabourPages(0);
          setError('Unexpected response format for labours');
        }
      } catch (err) {
        console.error('Error fetching labours:', err.response?.data || err.message);
        // Set error state if fetch fails, logging response data if available
        setError(`Failed to fetch labours: ${err.response?.statusText || err.message}`);
        setLabours([]); // Ensure it's always an array on error
        setTotalLabourElements(0);
        setTotalLabourPages(0);
      } finally {
        // Set loading state to false after fetch attempt
        setIsLoadingLabours(false);
      }
    };
    fetchLabours();
  }, [labourPageNumber, labourPageSize, labourSortBy, labourSortOrder]);

  // Fetch Users on component mount or when pagination/sorting changes
  useEffect(() => {
    console.log('Fetching Users...', { userPageNumber, userPageSize, userSortBy, userSortOrder });
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        // Fetch all users with current pagination and sorting
        const response = await adminService.getAllUsers(userPageNumber, userPageSize, userSortBy, userSortOrder); 

        if (response && Array.isArray(response.content)) {
          // Update users state with fetched data and pagination info
          setUsers(response.content);
          setTotalUserElements(response.totalElements || 0);
          setTotalUserPages(response.totalPages || 0);
        } else {
          console.error('API response for users is not an array:', response);
          setUsers([]); // Ensure it's always an array
          setTotalUserElements(0);
          setTotalUserPages(0);
          setError('Unexpected response format for users');
        }
      } catch (err) {
        console.error('Error fetching users:', err.response?.data || err.message);
        // Set error state if fetch fails, logging response data if available
        setError(`Failed to fetch users: ${err.response?.statusText || err.message}`);
        setUsers([]); // Ensure it's always an array on error
        setTotalUserElements(0);
        setTotalUserPages(0);
      } finally {
        // Set loading state to false after fetch attempt
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [userPageNumber, userPageSize, userSortBy, userSortOrder]);

  // Fetch Bookings on component mount or when pagination/sorting changes
  useEffect(() => {
    console.log('Fetching Bookings...', { bookingPageNumber, bookingPageSize, bookingSortBy, bookingSortOrder });
    const fetchBookings = async () => {
      try {
        setIsLoadingBookings(true);
        // Fetch all bookings with current pagination and sorting
        const response = await adminService.getAllBookings(bookingPageNumber, bookingPageSize, bookingSortBy, bookingSortOrder);

        if (response && Array.isArray(response.content)) {
          // Update bookings state with fetched data and pagination info
          setBookings(response.content);
          setTotalBookingElements(response.totalElements || 0);
          setTotalBookingPages(response.totalPages || 0);
        } else {
          console.error('API response for bookings is not an array:', response);
          setBookings([]); // Ensure it's always an array
          setTotalBookingElements(0);
          setTotalBookingPages(0);
          setError('Unexpected response format for bookings');
        }
      } catch (err) {
        console.error('Error fetching bookings:', err.response?.data || err.message);
        // Set error state if fetch fails, logging response data if available
        setError(`Failed to fetch bookings: ${err.response?.statusText || err.message}`);
        setBookings([]); // Ensure it's always an array on error
        setTotalBookingElements(0);
        setTotalBookingPages(0);
      } finally {
        // Set loading state to false after fetch attempt
        setIsLoadingBookings(false);
      }
    };
      fetchBookings();
    }, [bookingPageNumber, bookingPageSize, bookingSortBy, bookingSortOrder]);

  const handleRemoveLabour = async (labourId) => {
    try {
      // Add confirmation dialog later if needed
      await adminService.removeLabour(labourId);
      // Refresh the labour list after successful deletion by re-fetching with current params
      const response = await adminService.getAllLabours(labourPageNumber, labourPageSize, labourSortBy, labourSortOrder);
      if (response && Array.isArray(response.content)) {
        setLabours(response.content);
        setTotalLabourElements(response.totalElements || 0);
        setTotalLabourPages(response.totalPages || 0);
      } else {
        console.error('API response for labours is not an array after deletion:', response);
        setLabours([]); // Ensure it's always an array
        setTotalLabourElements(0);
        setTotalLabourPages(0);
        setError('Unexpected response format after deleting labour');
      }
    } catch (err) {
      console.error('Error removing labour:', err);
      setError('Failed to remove labour');
      setLabours([]); // Ensure it's always an array on error
      setTotalLabourElements(0);
      setTotalLabourPages(0);
    }
  };

  const handleRemoveUser = async (userId) => {
    try {
      // Add confirmation dialog later if needed
      await adminService.removeUser(userId);
      // Refresh the user list after successful deletion by re-fetching with current params
      const response = await adminService.getAllUsers(userPageNumber, userPageSize, userSortBy, userSortOrder);
      if (response && Array.isArray(response.content)) {
        setUsers(response.content);
        setTotalUserElements(response.totalElements || 0);
        setTotalUserPages(response.totalPages || 0);
      } else {
        console.error('API response for users is not an array after deletion:', response);
        setUsers([]); // Ensure it's always an array
        setTotalUserElements(0);
        setTotalUserPages(0);
        setError('Unexpected response format after deleting user');
      }
    } catch (err) {
      console.error('Error removing user:', err);
      setError('Failed to remove user');
      setUsers([]); // Ensure it's always an array on error
      setTotalUserElements(0);
      setTotalUserPages(0);
    }
  };

  const handleViewLabour = async (labourId) => {
    console.log('handleViewLabour called with ID:', labourId);
    try {
      // Fetch specific labour details
      const response = await adminService.getLabourById(labourId);
      console.log('getLabourById response:', response);
      if (response && response.returnValue) {
        // Set selected labour and show details view
        setSelectedLabour(response.returnValue);
        setLabourModalOpen(true);
        console.log('Labour details fetched, modal state set to true');
      } else {
        console.log('getLabourById did not return expected data:', response);
        setError('Failed to fetch labour details: Invalid response');
      }
    } catch (err) {
      console.error('Error fetching labour details:', err.response?.data || err.message);
      setError('Failed to fetch labour details');
    }
  };

  const handleViewUser = (userId , mobileNumber) => {
    // Find user in the already fetched list
    const user = users.find(user => user.userId === userId && user.mobileNumber === mobileNumber);
    if (user) {
      // Set selected user and show details view
      setSelectedUser(user);
      setUserModalOpen(true);
    }
  };

  const labourColumns = [
    {
      name: 'ID',
      selector: row => row.labourId,
      sortable: true,
      sortField: 'labourId',
      width: '5rem'
    },
    {
      name: 'Name',
      selector: row => row.labourName,
      sortable: true,
      sortField: 'labourName',
      width: '20rem'
    },
    {
      name: 'Skill',
      selector: row => row.labourSkill,
      sortable: true,
      sortField: 'labourSkill',
      cell: row => (
        <div className="d-flex align-items-center">
          <FaTools className="text-success me-2" style={{ fontSize: '1.2rem' }} />
          <span className="fw-medium">{row.labourSkill || 'N/A'}</span>
        </div>
      ),
    },
    {
      name: 'Rating',
      selector: row => row.rating,
      sortable: true,
      sortField: 'rating',
      cell: row => (
        <div className="d-flex align-items-center">
          <FaStar className="text-warning me-2" style={{ fontSize: '1.2rem' }} />
          <span className="fw-medium">{row.rating || 'N/A'}</span>
        </div>
      ),
    },
    {
      name: 'Mobile',
      selector: row => row.labourMobileNo,
      sortable: true,
      sortField: 'labourMobileNo',
      width: '110px',
    },
    {
      name: 'Actions',
      width: '160px',
      cell: row => (
        <div className="d-flex gap-2">
          <button onClick={() => handleRemoveLabour(row.labourId)} className="btn btn-danger btn-sm action-btn-sm">Delete</button>
          <button onClick={() => handleViewLabour(row.labourId)} className="btn btn-info btn-sm action-btn-sm">View Details</button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '160px',
    },
  ];

  // Functions to toggle modals
  const toggleLabourModal = () => {
    setLabourModalOpen(!labourModalOpen);
    if (!labourModalOpen) { // If opening, ensure selectedLabour is cleared when closed
      setSelectedLabour(null);
    }
  };

  const toggleUserModal = () => {
    setUserModalOpen(!userModalOpen);
     if (!userModalOpen) { // If opening, ensure selectedUser is cleared when closed
      setSelectedUser(null);
    }
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setBookingModalOpen(true);
  };

  const handleDeleteBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await adminService.deleteBooking(bookingId);
        // Refresh the bookings list
        const response = await adminService.getAllBookings(bookingPageNumber, bookingPageSize, bookingSortBy, bookingSortOrder);
        if (response && Array.isArray(response.content)) {
          setBookings(response.content);
          setTotalBookingElements(response.totalElements || 0);
          setTotalBookingPages(response.totalPages || 0);
        }
      } catch (err) {
        setError(`Failed to delete booking: ${err.message}`);
      }
    }
  };

  const toggleBookingModal = () => {
    setBookingModalOpen(!bookingModalOpen);
    if (!bookingModalOpen) {
      setSelectedBooking(null);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is an Excel file
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      setUploadError('Please upload an Excel file (.xlsx or .xls)');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);
      setUploadSuccess(false);

      const response = await adminService.uploadLabours(file);
      
      if (response && !response.hasError) {
        setUploadSuccess(true);
        // Refresh the labour list using the new API
        const updatedResponse = await adminService.getAllLabours(labourPageNumber, labourPageSize, labourSortBy, labourSortOrder);
        if (updatedResponse) {
          setLabours(updatedResponse.content || []);
          setTotalLabourElements(updatedResponse.totalElements || 0);
          setTotalLabourPages(updatedResponse.totalPages || 0);
        }
      } else {
        setUploadError(response?.message || 'Failed to upload labours');
      }
    } catch (error) {
      setUploadError(error.response?.data?.message || 'Error uploading file');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Container fluid className="admin-dashboard">
      <AdminStats />
      
      {/* Labour Management Section */}
      <Card className="mb-4">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h3 className="mb-0">Labour Management</h3>
          <div className="d-flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
            />
            <Button
              variant="success"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <FaUpload className="me-2" />
                  Bulk Upload
                </>
              )}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {uploadError && (
            <Alert variant="danger" onClose={() => setUploadError(null)} dismissible>
              {uploadError}
            </Alert>
          )}
          {uploadSuccess && (
            <Alert variant="success" onClose={() => setUploadSuccess(false)} dismissible>
              Labours uploaded successfully!
            </Alert>
          )}
          <div className="table-responsive">
            <DataTable
              columns={labourColumns}
              data={Array.isArray(labours) ? labours : []}
              pagination
              paginationServer
              paginationTotalRows={totalLabourElements}
              paginationDefaultPage={labourPageNumber + 1}
              onChangePage={page => setLabourPageNumber(page - 1)}
              onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
                setLabourPageSize(currentRowsPerPage);
                setLabourPageNumber(currentPage - 1);
              }}
              sortServer
              onSort={(column, sortDirection) => {
                setLabourSortBy(column.sortField || 'rating');
                setLabourSortOrder(sortDirection || 'asc');
              }}
              progressPending={isLoadingLabours}
              noDataComponent={'No labours found.'}
              customStyles={customStyles}
              responsive
            />
          </div>
        </Card.Body>
      </Card>

      {/* Users Section */}
      <Card className="mb-4">
        <Card.Header>
          <h3 className="mb-0">User Management</h3>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <DataTable
              columns={userColumns}
              data={Array.isArray(users) ? users : []}
              pagination
              paginationServer
              paginationTotalRows={totalUserElements}
              paginationDefaultPage={userPageNumber + 1}
              onChangePage={page => setUserPageNumber(page - 1)}
              onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
                setUserPageSize(currentRowsPerPage);
                setUserPageNumber(currentPage - 1);
              }}
              sortServer
              onSort={(column, sortDirection) => {
                setUserSortBy(column.sortField || 'fullName');
                setUserSortOrder(sortDirection || 'asc');
              }}
              progressPending={isLoadingUsers}
              noDataComponent={'No users found.'}
              customStyles={customStyles}
              responsive
            />
          </div>
        </Card.Body>
      </Card>

      {/* Bookings Section */}
      <Card className="mb-4">
        <Card.Header>
          <h3 className="mb-0">Booking Management</h3>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <DataTable
              columns={bookingColumns}
              data={Array.isArray(bookings) ? bookings : []}
              pagination
              paginationServer
              paginationTotalRows={totalBookingElements}
              paginationDefaultPage={bookingPageNumber + 1}
              onChangePage={page => setBookingPageNumber(page - 1)}
              onChangeRowsPerPage={(currentRowsPerPage, currentPage) => {
                setBookingPageSize(currentRowsPerPage);
                setBookingPageNumber(currentPage - 1);
              }}
              sortServer
              onSort={(column, sortDirection) => {
                setBookingSortBy(column.sortField || 'bookingTime');
                setBookingSortOrder(sortDirection || 'asc');
              }}
              progressPending={isLoadingBookings}
              noDataComponent={'No bookings found.'}
              customStyles={customStyles}
              responsive
            />
          </div>
        </Card.Body>
      </Card>

      {/* Modals */}
      <Modal isOpen={labourModalOpen} toggle={toggleLabourModal} size="lg">
        <ModalHeader toggle={toggleLabourModal}>Labour Details (ID: {selectedLabour?.labourId})</ModalHeader>
        <ModalBody>
          <p><strong>Name:</strong> {selectedLabour?.labourName}</p>
          <p><strong>Skill:</strong> {selectedLabour?.labourSkill}</p>
          <p><strong>Mobile:</strong> {selectedLabour?.labourMobileNo}</p>
          <p><strong>Rating:</strong> {selectedLabour?.rating}</p>
          <p><strong>Ratings Count:</strong> {selectedLabour?.ratingCount}</p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleLabourModal}>Close</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={userModalOpen} toggle={toggleUserModal} size="lg">
        <ModalHeader toggle={toggleUserModal}>User Details (ID: {selectedUser?.userId})</ModalHeader>
        <ModalBody>
          <p><strong>Name:</strong> {selectedUser?.fullName}</p>
          <p><strong>Mobile:</strong> {selectedUser?.mobileNumber}</p>
          <p><strong>Email:</strong> {selectedUser?.email}</p>
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={toggleUserModal}>Close</Button>
        </ModalFooter>
      </Modal>

      <BookingDetailsModal
        isOpen={bookingModalOpen}
        toggle={toggleBookingModal}
        booking={selectedBooking}
      />
    </Container>
  );
}

export default AdminDashboard; 