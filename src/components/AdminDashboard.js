import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Table, Spinner, Alert, Badge, Button, Nav, Tab, ProgressBar } from 'react-bootstrap';
import { Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import DataTable from 'react-data-table-component';
import { adminService } from '../services/adminService';
import { 
  FaTimesCircle, 
  FaClock, 
  FaCheckCircle, 
  FaStar, 
  FaTools, 
  FaUpload, 
  FaUsers, 
  FaUserTie, 
  FaClipboardList,
  FaChartLine,
  FaDownload,
  FaEye,
  FaTrash,
  FaEdit,
  FaFilter,
  FaSearch,
  FaPlus,
  FaExclamationTriangle,
  FaCheck,
  FaTimes,
  FaUser,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaShieldAlt
} from 'react-icons/fa';
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
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const fileInputRef = useRef(null);

  // Pagination and Sorting State for Labours
  const [labourPageNumber, setLabourPageNumber] = useState(0);
  const [labourPageSize, setLabourPageSize] = useState(10);
  const [labourSortBy, setLabourSortBy] = useState('labourId');
  const [labourSortOrder, setLabourSortOrder] = useState('desc');
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
  const [bookingSortOrder, setBookingSortOrder] = useState('desc');
  const [totalBookingElements, setTotalBookingElements] = useState(0);
  const [totalBookingPages, setTotalBookingPages] = useState(0);

  // Enhanced Custom Styles for DataTable
  const customStyles = {
    table: {
      style: {
        backgroundColor: 'transparent',
        minWidth: '100%',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f8fafc',
        borderBottom: '2px solid #e2e8f0',
        borderRadius: '12px 12px 0 0',
        minHeight: '60px',
      },
    },
    headCells: {
      style: {
        paddingLeft: '32px',
        paddingRight: '32px',
        paddingTop: '20px',
        paddingBottom: '20px',
        fontSize: '0.875rem',
        fontWeight: '700',
        color: '#374151',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        borderRight: '1px solid #e2e8f0',
        '&:last-child': {
          borderRight: 'none',
        },
      },
    },
    rows: {
      style: {
        minHeight: '80px',
        fontSize: '0.875rem',
        backgroundColor: 'white',
        borderBottom: '1px solid #f3f4f6',
        '&:hover': {
          backgroundColor: '#f9fafb',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease',
        },
      },
    },
    cells: {
      style: {
        paddingLeft: '32px',
        paddingRight: '32px',
        paddingTop: '20px',
        paddingBottom: '20px',
        color: '#374151',
        fontWeight: '500',
        borderRight: '1px solid #f3f4f6',
        '&:last-child': {
          borderRight: 'none',
        },
      },
    },
    pagination: {
      style: {
        backgroundColor: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        borderRadius: '0 0 12px 12px',
        padding: '20px 32px',
      },
    },
  };

  // Responsive configuration for DataTables
  const responsiveConfig = {
    breakpoints: {
      mobile: 768,
      tablet: 1024,
      desktop: 1200,
    },
    table: {
      style: {
        minWidth: '100%',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f8fafc',
        borderBottom: '2px solid #e2e8f0',
        borderRadius: '12px 12px 0 0',
        minHeight: '60px',
      },
    },
    headCells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '16px',
        paddingBottom: '16px',
        fontSize: '0.75rem',
        fontWeight: '700',
        color: '#374151',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      },
    },
    rows: {
      style: {
        minHeight: '60px',
        fontSize: '0.8rem',
        backgroundColor: 'white',
        borderBottom: '1px solid #f3f4f6',
        '&:hover': {
          backgroundColor: '#f9fafb',
        },
      },
    },
    cells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
        paddingTop: '12px',
        paddingBottom: '12px',
        color: '#374151',
        fontWeight: '500',
      },
    },
  };

  const [deletingLabourId, setDeletingLabourId] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [viewingLabourId, setViewingLabourId] = useState(null);
  const [viewingUserId, setViewingUserId] = useState(null);
  const [deletingBookingId, setDeletingBookingId] = useState(null);
  const [viewingBookingId, setViewingBookingId] = useState(null);

  const getStatusBadge = (statusCode) => {
    switch (statusCode) {
      case -1:
        return <Badge bg="danger" className="status-badge"><FaTimesCircle className="me-1" /> Rejected</Badge>;
      case 1:
        return <Badge bg="warning" className="status-badge"><FaClock className="me-1" /> Pending</Badge>;
      case 2:
        return <Badge bg="primary" className="status-badge"><FaCheckCircle className="me-1" /> Accepted</Badge>;
      case 3:
        return <Badge bg="success" className="status-badge"><FaCheck className="me-1" /> Completed</Badge>;
      default:
        return <Badge bg="secondary" className="status-badge"><FaExclamationTriangle className="me-1" /> Unknown</Badge>;
    }
  };

  // Enhanced Columns Configuration for Labours
  const labourColumns = [
    {
      name: 'Labour',
      selector: row => row.labourName,
      sortable: true,
      sortField: 'labourName',
      cell: row => (
        <div className="d-flex align-items-center">
          <div className="labour-avatar me-3">
            <FaUser className="text-white" size={16} />
          </div>
          <div>
            <div className="fw-bold text-primary">{row.labourName}</div>
            <small className="text-muted">{row.labourMobileNo}</small>
          </div>
        </div>
      ),
      width: '280px',
      minWidth: '280px',
    },
    {
      name: 'Skill',
      selector: row => row.labourSkill,
      sortable: true,
      sortField: 'labourSkill',
      cell: row => (
        <Badge bg="info" className="skill-badge">
          <FaTools className="me-1" />
          {row.labourSkill}
        </Badge>
      ),
      width: '180px',
      minWidth: '180px',
    },
    {
      name: 'Rating',
      selector: row => parseFloat(row.rating),
      sortable: true,
      sortField: 'rating',
      cell: row => (
        <div className="d-flex align-items-center">
          <FaStar className="text-warning me-1" />
          <span className="fw-bold">{row.rating || '0'}</span>
          <small className="text-muted ms-1">({row.ratingCount || 0})</small>
        </div>
      ),
      width: '160px',
      minWidth: '160px',
    },
    {
      name: 'Status',
      selector: row => row.status,
      sortable: true,
      sortField: 'status',
      cell: row => (
        <Badge bg={row.status === 'active' ? 'success' : 'secondary'} className="status-badge">
          {row.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      ),
      width: '140px',
      minWidth: '140px',
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2">
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => handleViewLabour(row.labourId)}
            disabled={viewingLabourId === row.labourId}
            className="action-btn"
          >
            {viewingLabourId === row.labourId ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              <FaEye />
            )}
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleRemoveLabour(row.labourId)}
            disabled={deletingLabourId === row.labourId}
            className="action-btn"
          >
            {deletingLabourId === row.labourId ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              <FaTrash />
            )}
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '160px',
      minWidth: '160px',
    },
  ];

  // Enhanced Columns Configuration for Users
  const userColumns = [
    {
      name: 'User',
      selector: row => row.fullName,
      sortable: true,
      sortField: 'fullName',
      cell: row => (
        <div className="d-flex align-items-center">
          <div className="user-avatar me-3">
            <FaUser className="text-white" size={16} />
          </div>
          <div>
            <div className="fw-bold text-primary">{row.fullName}</div>
            <small className="text-muted">{row.email}</small>
          </div>
        </div>
      ),
      width: '280px',
      minWidth: '280px',
    },
    {
      name: 'Contact',
      selector: row => row.mobileNumber,
      sortable: true,
      sortField: 'mobileNo',
      cell: row => (
        <div className="d-flex align-items-center">
          <FaPhone className="text-muted me-2" />
          <span>{row.mobileNumber}</span>
        </div>
      ),
      width: '200px',
      minWidth: '200px',
    },
    {
      name: 'Status',
      selector: row => row.status,
      sortable: true,
      sortField: 'status',
      cell: row => (
        <Badge bg={row.status === 'active' ? 'success' : 'secondary'} className="status-badge">
          {row.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      ),
      width: '140px',
      minWidth: '140px',
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2">
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => handleViewUser(row.userId, row.mobileNumber)}
            disabled={viewingUserId === row.userId}
            className="action-btn"
          >
            {viewingUserId === row.userId ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              <FaEye />
            )}
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleRemoveUser(row.userId)}
            disabled={deletingUserId === row.userId}
            className="action-btn"
          >
            {deletingUserId === row.userId ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              <FaTrash />
            )}
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '160px',
      minWidth: '160px',
    },
  ];

  // Enhanced Columns Configuration for Bookings
  const bookingColumns = [
    {
      name: 'Booking ID',
      selector: row => row.bookingId,
      sortable: true,
      sortField: 'bookingId',
      cell: row => (
        <div className="fw-bold text-primary">#{row.bookingId}</div>
      ),
      width: '140px',
      minWidth: '140px',
    },
    {
      name: 'Customer',
      selector: row => row.userName,
      sortable: true,
      sortField: 'userName',
      cell: row => (
        <div className="d-flex align-items-center">
          <div className="user-avatar me-2">
            <FaUser className="text-white" size={12} />
          </div>
          <span className="fw-medium">{row.userName}</span>
        </div>
      ),
      width: '180px',
      minWidth: '180px',
    },
    {
      name: 'Labour',
      selector: row => row.labourName,
      sortable: true,
      sortField: 'labourName',
      cell: row => (
        <div className="d-flex align-items-center">
          <div className="labour-avatar me-2">
            <FaUserTie className="text-white" size={12} />
          </div>
          <span className="fw-medium">{row.labourName}</span>
        </div>
      ),
      width: '180px',
      minWidth: '180px',
    },
    {
      name: 'Service',
      selector: row => row.serviceName,
      sortable: true,
      sortField: 'serviceName',
      cell: row => (
        <Badge bg="info" className="service-badge">
          <FaTools className="me-1" />
          {row.serviceName}
        </Badge>
      ),
      width: '160px',
      minWidth: '160px',
    },
    {
      name: 'Status',
      selector: row => row.bookingStatusCode,
      sortable: true,
      sortField: 'bookingStatusCode',
      cell: row => getStatusBadge(row.bookingStatusCode),
      width: '160px',
      minWidth: '160px',
    },
    {
      name: 'Date',
      selector: row => row.bookingTime,
      sortable: true,
      sortField: 'bookingTime',
      cell: row => (
        <div className="d-flex align-items-center">
          <FaCalendarAlt className="text-muted me-2" />
          <small>{new Date(row.bookingTime).toLocaleDateString()}</small>
        </div>
      ),
      width: '140px',
      minWidth: '140px',
    },
    {
      name: 'Actions',
      cell: row => (
        <div className="d-flex gap-2">
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => handleViewBooking(row)}
            disabled={viewingBookingId === row.bookingId}
            className="action-btn"
          >
            {viewingBookingId === row.bookingId ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              <FaEye />
            )}
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleDeleteBooking(row.bookingId)}
            disabled={deletingBookingId === row.bookingId}
            className="action-btn"
          >
            {deletingBookingId === row.bookingId ? (
              <Spinner as="span" animation="border" size="sm" />
            ) : (
              <FaTrash />
            )}
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '160px',
      minWidth: '160px',
    },
  ];

  // Fetch data functions
  const fetchLabours = async () => {
    try {
      setIsLoadingLabours(true);
      const response = await adminService.getAllLabours(labourPageNumber, labourPageSize, labourSortBy, labourSortOrder);
      if (response && !response.hasError) {
        setLabours(response.content || []);
        setTotalLabourElements(response.totalElements || 0);
        setTotalLabourPages(response.totalPages || 0);
      } else {
        setError('Failed to fetch labours');
      }
    } catch (err) {
      setError('Error fetching labours');
      console.error('Error fetching labours:', err);
    } finally {
      setIsLoadingLabours(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await adminService.getAllUsers(userPageNumber, userPageSize, userSortBy, userSortOrder);
      if (response && !response.hasError) {
        setUsers(response.content || []);
        setTotalUserElements(response.totalElements || 0);
        setTotalUserPages(response.totalPages || 0);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Error fetching users');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setIsLoadingBookings(true);
      const response = await adminService.getAllBookings(bookingPageNumber, bookingPageSize, bookingSortBy, bookingSortOrder);
      if (response && !response.hasError) {
        setBookings(response.content || []);
        setTotalBookingElements(response.totalElements || 0);
        setTotalBookingPages(response.totalPages || 0);
      } else {
        setError('Failed to fetch bookings');
      }
    } catch (err) {
      setError('Error fetching bookings');
      console.error('Error fetching bookings:', err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleRemoveLabour = async (labourId) => {
    if (!window.confirm('Are you sure you want to remove this labour?')) return;
    
    try {
      setDeletingLabourId(labourId);
      const response = await adminService.removeLabour(labourId);
      if (response && !response.hasError) {
        fetchLabours();
      } else {
        setError('Failed to remove labour');
      }
    } catch (err) {
      setError('Error removing labour');
      console.error('Error removing labour:', err);
    } finally {
      setDeletingLabourId(null);
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user?')) return;
    
    try {
      setDeletingUserId(userId);
      const response = await adminService.removeUser(userId);
      if (response && !response.hasError) {
        fetchUsers();
      } else {
        setError('Failed to remove user');
      }
    } catch (err) {
      setError('Error removing user');
      console.error('Error removing user:', err);
    } finally {
      setDeletingUserId(null);
    }
  };

  const handleViewLabour = async (labourId) => {
    try {
      setViewingLabourId(labourId);
      const response = await adminService.getLabourById(labourId);
      if (response && !response.hasError) {
        setSelectedLabour(response.returnValue);
        setLabourModalOpen(true);
      } else {
        setError('Failed to fetch labour details');
      }
    } catch (err) {
      setError('Error fetching labour details');
      console.error('Error fetching labour details:', err);
    } finally {
      setViewingLabourId(null);
    }
  };

  const handleViewUser = (userId, mobileNumber) => {
    setSelectedUser({ userId, mobileNumber });
    setUserModalOpen(true);
  };

  const handleViewBooking = (booking) => {
    setSelectedBooking(booking);
    setBookingModalOpen(true);
  };

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;
    
    try {
      setDeletingBookingId(bookingId);
      const response = await adminService.removeBooking(bookingId);
      if (response && !response.hasError) {
        fetchBookings();
      } else {
        setError('Failed to delete booking');
      }
    } catch (err) {
      setError('Error deleting booking');
      console.error('Error deleting booking:', err);
    } finally {
      setDeletingBookingId(null);
    }
  };

  const toggleLabourModal = () => {
    setLabourModalOpen(!labourModalOpen);
    if (!labourModalOpen) {
      setSelectedLabour(null);
    }
  };

  const toggleUserModal = () => {
    setUserModalOpen(!userModalOpen);
    if (!userModalOpen) {
      setSelectedUser(null);
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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  useEffect(() => {
    if (uploadSuccess) {
      const timer = setTimeout(() => setUploadSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [uploadSuccess]);

  useEffect(() => {
    if (uploadError) {
      const timer = setTimeout(() => setUploadError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadError]);

  useEffect(() => {
    fetchLabours();
  }, [labourPageNumber, labourPageSize, labourSortBy, labourSortOrder]);

  useEffect(() => {
    fetchUsers();
  }, [userPageNumber, userPageSize, userSortBy, userSortOrder]);

  useEffect(() => {
    fetchBookings();
  }, [bookingPageNumber, bookingPageSize, bookingSortBy, bookingSortOrder]);

  return (
    <Container fluid className="admin-dashboard">
      {/* Header Section */}
      <div className="admin-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="admin-title mb-2">
              <FaShieldAlt className="me-3 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted mb-0">Manage your labour services platform</p>
          </div>
          <div className="admin-actions">
            <Button variant="outline-primary" className="me-2">
              <FaDownload className="me-2" />
              Export Data
            </Button>
            <Button variant="primary">
              <FaPlus className="me-2" />
              Add New
            </Button>
          </div>
        </div>
      </div>

      {/* Analytics Overview */}
      <AdminStats />

      {/* Main Content Tabs */}
      <Card className="admin-content-card">
        <Card.Header className="admin-card-header">
          <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
            <Nav.Item>
              <Nav.Link eventKey="overview" className="admin-tab">
                <FaChartLine className="me-2" />
                Overview
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="labours" className="admin-tab">
                <FaUserTie className="me-2" />
                Labour Management
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="users" className="admin-tab">
                <FaUsers className="me-2" />
                User Management
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="bookings" className="admin-tab">
                <FaClipboardList className="me-2" />
                Booking Management
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body className="admin-card-body">
          <Tab.Content>
            <Tab.Pane eventKey="overview" active={activeTab === 'overview'}>
              <div className="overview-section">
                <Row className="g-4">
                  <Col md={6}>
                    <Card className="h-100 overview-card">
                      <Card.Body>
                        <h5 className="card-title">
                          <FaUserTie className="me-2 text-primary" />
                          Recent Labours
                        </h5>
                        <div className="recent-list">
                          {isLoadingLabours ? (
                            <div className="text-center py-4">
                              <Spinner animation="border" role="status" variant="primary" size="sm">
                                <span className="visually-hidden">Loading...</span>
                              </Spinner>
                              <p className="text-muted mt-2 mb-0">Loading recent labours...</p>
                            </div>
                          ) : labours.length > 0 ? (
                            // Use the same data as the main table, showing top 5 most recent labours
                            labours.slice(0, 5).map((labour, index) => (
                              <div 
                                key={labour.labourId} 
                                className="recent-item clickable-item"
                                onClick={() => handleViewLabour(labour.labourId)}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="d-flex align-items-center">
                                  <div className="labour-avatar me-3">
                                    <FaUser className="text-white" size={14} />
                                  </div>
                                  <div className="flex-grow-1">
                                    <div className="fw-bold">{labour.labourName}</div>
                                    <small className="text-muted">{labour.labourSkill}</small>
                                  </div>
                                  <div className="d-flex align-items-center">
                                    <Badge bg="success" className="status-badge me-2">
                                      Active
                                    </Badge>
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="view-btn-recent"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewLabour(labour.labourId);
                                      }}
                                    >
                                      <FaEye className="me-1" />
                                      View
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4">
                              <FaUserTie className="text-muted mb-3" size={32} />
                              <p className="text-muted mb-0">No recent labours</p>
                            </div>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="h-100 overview-card">
                      <Card.Body>
                        <h5 className="card-title">
                          <FaClipboardList className="me-2 text-primary" />
                          Recent Bookings
                        </h5>
                        <div className="recent-list">
                          {isLoadingBookings ? (
                            <div className="text-center py-4">
                              <Spinner animation="border" role="status" variant="primary" size="sm">
                                <span className="visually-hidden">Loading...</span>
                              </Spinner>
                              <p className="text-muted mt-2 mb-0">Loading recent bookings...</p>
                            </div>
                          ) : bookings.length > 0 ? (
                            // Use the same data as the main table, showing top 5 most recent bookings
                            bookings.slice(0, 5).map((booking, index) => (
                              <div 
                                key={booking.bookingId} 
                                className="recent-item clickable-item"
                                onClick={() => handleViewBooking(booking)}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="d-flex align-items-center">
                                  <div className="booking-avatar me-3">
                                    <FaCalendarAlt className="text-white" size={14} />
                                  </div>
                                  <div className="flex-grow-1">
                                    <div className="fw-bold">#{booking.bookingId}</div>
                                    <small className="text-muted">{booking.userName}</small>
                                  </div>
                                  <div className="d-flex align-items-center">
                                    {getStatusBadge(booking.bookingStatusCode)}
                                    <Button
                                      variant="outline-primary"
                                      size="sm"
                                      className="view-btn-recent ms-2"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleViewBooking(booking);
                                      }}
                                    >
                                      <FaEye className="me-1" />
                                      View
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4">
                              <FaClipboardList className="text-muted mb-3" size={32} />
                              <p className="text-muted mb-0">No recent bookings</p>
                            </div>
                          )}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </div>
            </Tab.Pane>

            <Tab.Pane eventKey="labours" active={activeTab === 'labours'}>
              <div className="labour-management-section">
                <div className="section-header mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="section-title">
                        <FaUserTie className="me-2" />
                        Labour Management
                      </h4>
                      <p className="text-muted mb-0">Manage service providers and their details</p>
                    </div>
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
                        className="upload-btn"
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
                  </div>
                </div>

                {uploadError && (
                  <Alert variant="danger" onClose={() => setUploadError(null)} dismissible className="mb-3">
                    <FaExclamationTriangle className="me-2" />
                    {uploadError}
                  </Alert>
                )}
                {uploadSuccess && (
                  <Alert variant="success" onClose={() => setUploadSuccess(false)} dismissible className="mb-3">
                    <FaCheck className="me-2" />
                    Labours uploaded successfully!
                  </Alert>
                )}

                <div className="data-table-container labour-table">
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
                      setLabourSortBy(column.sortField || 'labourId');
                      setLabourSortOrder(sortDirection || 'desc');
                    }}
                    progressPending={isLoadingLabours}
                    noDataComponent={
                      <div className="text-center py-4">
                        <FaUserTie className="text-muted mb-3" size={48} />
                        <p className="text-muted mb-0">No labours found</p>
                      </div>
                    }
                    customStyles={customStyles}
                    responsive={responsiveConfig}
                    highlightOnHover
                    pointerOnHover
                  />
                </div>
              </div>
            </Tab.Pane>

            <Tab.Pane eventKey="users" active={activeTab === 'users'}>
              <div className="user-management-section">
                <div className="section-header mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="section-title">
                        <FaUsers className="me-2" />
                        User Management
                      </h4>
                      <p className="text-muted mb-0">Manage customer accounts and information</p>
                    </div>
                  </div>
                </div>

                <div className="data-table-container user-table">
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
                    noDataComponent={
                      <div className="text-center py-4">
                        <FaUsers className="text-muted mb-3" size={48} />
                        <p className="text-muted mb-0">No users found</p>
                      </div>
                    }
                    customStyles={customStyles}
                    responsive={responsiveConfig}
                    highlightOnHover
                    pointerOnHover
                  />
                </div>
              </div>
            </Tab.Pane>

            <Tab.Pane eventKey="bookings" active={activeTab === 'bookings'}>
              <div className="booking-management-section">
                <div className="section-header mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h4 className="section-title">
                        <FaClipboardList className="me-2" />
                        Booking Management
                      </h4>
                      <p className="text-muted mb-0">Monitor and manage service bookings</p>
                    </div>
                    <div className="d-flex gap-2">
                      <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                          type="text"
                          placeholder="Search bookings..."
                          className="search-input"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                      <select
                        className="form-select filter-select"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="accepted">Accepted</option>
                        <option value="completed">Completed</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="data-table-container booking-table">
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
                      setBookingSortOrder(sortDirection || 'desc');
                    }}
                    progressPending={isLoadingBookings}
                    noDataComponent={
                      <div className="text-center py-4">
                        <FaClipboardList className="text-muted mb-3" size={48} />
                        <p className="text-muted mb-0">No bookings found</p>
                      </div>
                    }
                    customStyles={customStyles}
                    responsive={responsiveConfig}
                    highlightOnHover
                    pointerOnHover
                  />
                </div>
              </div>
            </Tab.Pane>
          </Tab.Content>
        </Card.Body>
      </Card>

      {/* Enhanced Modals */}
      <Modal isOpen={labourModalOpen} toggle={toggleLabourModal} size="lg" className="admin-modal">
        <ModalHeader toggle={toggleLabourModal} className="admin-modal-header">
          <div className="d-flex align-items-center">
            <FaUserTie className="me-2 text-primary" />
            Labour Details
          </div>
        </ModalHeader>
        <ModalBody className="admin-modal-body">
          {selectedLabour && (
            <div className="labour-details">
              <div className="detail-header mb-4">
                <div className="d-flex align-items-center">
                  <div className="labour-avatar-large me-3">
                    <FaUser className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="mb-1">{selectedLabour.labourName}</h4>
                    <Badge bg="info" className="skill-badge-large">
                      <FaTools className="me-1" />
                      {selectedLabour.labourSkill}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Row className="g-3">
                <Col md={6}>
                  <div className="detail-item">
                    <label className="detail-label">
                      <FaPhone className="me-2" />
                      Mobile Number
                    </label>
                    <div className="detail-value">{selectedLabour.labourMobileNo}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <label className="detail-label">
                      <FaStar className="me-2" />
                      Rating
                    </label>
                    <div className="detail-value">
                      {selectedLabour.rating && Number(selectedLabour.rating) > 0 
                        ? `${selectedLabour.rating} (${selectedLabour.ratingCount || 0} reviews)`
                        : 'No ratings yet'
                      }
                    </div>
                  </div>
                </Col>
                {Array.isArray(selectedLabour?.labourSubSkills) && selectedLabour.labourSubSkills.length > 0 && (
                  <Col md={12}>
                    <div className="detail-item">
                      <label className="detail-label">
                        <FaTools className="me-2" />
                        Sub Skills
                      </label>
                      <div className="detail-value">
                        <div className="d-flex flex-wrap gap-2">
                          {selectedLabour.labourSubSkills.map((sub, idx) => (
                            <Badge key={sub.subSkillId || idx} bg="secondary" className="sub-skill-badge">
                              {sub.subSkillName}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="admin-modal-footer">
          <Button color="secondary" onClick={toggleLabourModal}>Close</Button>
        </ModalFooter>
      </Modal>

      <Modal isOpen={userModalOpen} toggle={toggleUserModal} size="lg" className="admin-modal">
        <ModalHeader toggle={toggleUserModal} className="admin-modal-header">
          <div className="d-flex align-items-center">
            <FaUser className="me-2 text-primary" />
            User Details
          </div>
        </ModalHeader>
        <ModalBody className="admin-modal-body">
          {selectedUser && (
            <div className="user-details">
              <div className="detail-header mb-4">
                <div className="d-flex align-items-center">
                  <div className="user-avatar-large me-3">
                    <FaUser className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="mb-1">User #{selectedUser.userId}</h4>
                    <Badge bg="success" className="status-badge-large">Active</Badge>
                  </div>
                </div>
              </div>
              
              <Row className="g-3">
                <Col md={6}>
                  <div className="detail-item">
                    <label className="detail-label">
                      <FaPhone className="me-2" />
                      Mobile Number
                    </label>
                    <div className="detail-value">{selectedUser.mobileNumber}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="detail-item">
                    <label className="detail-label">
                      <FaEnvelope className="me-2" />
                      Email
                    </label>
                    <div className="detail-value">{selectedUser.email || 'Not provided'}</div>
                  </div>
                </Col>
              </Row>
            </div>
          )}
        </ModalBody>
        <ModalFooter className="admin-modal-footer">
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