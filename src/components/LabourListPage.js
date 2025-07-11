import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import { FaArrowLeft, FaUser, FaTools, FaPhone, FaStar } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { searchLabourByCategory } from '../services/LabourSearchService';
import LabourDetailsModal from './LabourDetailsModal';
import '../styles/LabourListPage.css';

function LabourListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMounted = useRef(true);
  
  // Get data from navigation state
  const {
    labourers: initialLabourers = [],
    totalElements: initialTotalElements = 0,
    totalPages: initialTotalPages = 0,
    service = '',
    currentPage: initialCurrentPage = 0,
    pageSize: initialPageSize = 10,
    error: initialError = null
  } = location.state || {};
  
  const [labourers, setLabourers] = useState(initialLabourers);
  const [isLoading, setIsLoading] = useState(false); // Start with false since data is already loaded
  const [error, setError] = useState(initialError);
  const [currentPage, setCurrentPage] = useState(initialCurrentPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalElements, setTotalElements] = useState(initialTotalElements);
  const [selectedLabour, setSelectedLabour] = useState(null);
  const [showLabourModal, setShowLabourModal] = useState(false);

  const columns = [
    {
      name: 'Name',
      selector: row => row.labourName,
      sortable: true,
      cell: row => (
        <div className="d-flex align-items-center">
          <FaUser className="text-primary me-2" style={{ fontSize: '1.2rem' }} />
          <span className="fw-medium text-primary">
            {row.labourName}
          </span>
        </div>
      ),
    },
    {
      name: 'Services',
      selector: row => row.labourSkill,
      sortable: true,
      cell: row => (
        <div className="d-flex align-items-center">
          <FaTools className="text-success me-2" style={{ fontSize: '1.2rem' }} />
          <span className="fw-medium">{row.labourSkill}</span>
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
      name: 'Rating',
      selector: row => row.rating,
      sortable: true,
      cell: row => (
        <div className="d-flex align-items-center">
          <FaStar className="text-warning me-2" style={{ fontSize: '1.2rem' }} />
          <span className="fw-medium">{row.rating || 'No ratings yet'}</span>
        </div>
      ),
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #dee2e6',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        padding: '1rem',
      },
    },
    headCells: {
      style: {
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#2c3e50',
      },
    },
    cells: {
      style: {
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        fontSize: '1rem',
        verticalAlign: 'middle',
      },
    },
    rows: {
      style: {
        minHeight: '80px',
        fontSize: '1rem',
        backgroundColor: 'white',
        '&:nth-of-type(odd)': {
          backgroundColor: '#fafbfc',
        },
        '&:hover': {
          backgroundColor: '#e8f4ff !important',
          cursor: 'pointer',
          transform: 'scale(1.01)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
        },
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #dee2e6',
        padding: '1rem 0',
      },
    },
    table: {
      style: {
        marginBottom: '0',
      },
    },
    tableWrapper: {
      style: {
        overflow: 'visible',
      },
    },
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchLabourers = async (pageNumber, size) => {
    if (!isMounted.current || !service) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await searchLabourByCategory(service, pageNumber, size);
      
      if (isMounted.current && response) {
        setLabourers(response.content || []);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
        setCurrentPage(pageNumber);
        setPageSize(size);
      }
    } catch (error) {
      if (isMounted.current) {
        setError('Failed to fetch labourers. Please try again.');
        console.error('Search error:', error);
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  const handlePageChange = (page) => {
    fetchLabourers(page - 1, pageSize);
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    fetchLabourers(page - 1, newPerPage);
  };

  const handleLabourModalClose = () => {
    setShowLabourModal(false);
    setSelectedLabour(null);
  };

  const handleLabourModalShow = (labour) => {
    setSelectedLabour(labour);
    setShowLabourModal(true);
  };

  const handleBackClick = () => {
    navigate('/');
  };

  if (!service) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <h3>No service specified</h3>
          <p className="text-muted">Please go back and select a service.</p>
          <Button onClick={handleBackClick} className="mt-3">
            <FaArrowLeft className="me-2" />
            Back to Home
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <div className="labour-list-page">
      <Container fluid>
        {/* Header */}
        <div className="labour-list-header">
          <div className="d-flex align-items-center">
            <Button
              variant="outline-secondary"
              onClick={handleBackClick}
              className="me-3"
            >
              <FaArrowLeft />
            </Button>
            <h3 className="labour-list-title mb-0">
              {service} Professionals ({totalElements} found)
            </h3>
          </div>
        </div>
        
        <div className="labour-list-content">
          {isLoading ? (
            <div className="labour-table-container" style={{ minHeight: '400px' }}>
              <div className="text-center py-5">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3">Loading {service} professionals...</p>
              </div>
              {/* Skeleton table structure to prevent layout shift */}
              <div className="skeleton-table" style={{ opacity: 0.3 }}>
                <div className="skeleton-header" style={{ height: '50px', background: '#f0f0f0', marginBottom: '10px', borderRadius: '8px' }}></div>
                <div className="skeleton-row" style={{ height: '60px', background: '#f8f9fa', marginBottom: '8px', borderRadius: '6px' }}></div>
                <div className="skeleton-row" style={{ height: '60px', background: '#f8f9fa', marginBottom: '8px', borderRadius: '6px' }}></div>
                <div className="skeleton-row" style={{ height: '60px', background: '#f8f9fa', marginBottom: '8px', borderRadius: '6px' }}></div>
                <div className="skeleton-row" style={{ height: '60px', background: '#f8f9fa', marginBottom: '8px', borderRadius: '6px' }}></div>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <p className="text-danger">{error}</p>
              <Button onClick={() => fetchLabourers(0, pageSize)}>
                Try Again
              </Button>
            </div>
          ) : labourers.length === 0 ? (
            <div className="text-center py-5">
              <h4>No {service} professionals found</h4>
              <p className="text-muted">Try searching for a different service or check back later.</p>
              <Button onClick={handleBackClick}>
                Back to Home
              </Button>
            </div>
          ) : (
            <div className="labour-table-container" style={{ minHeight: '400px' }}>
              <DataTable
                columns={columns}
                data={labourers}
                pagination
                paginationServer
                paginationTotalRows={totalElements}
                onChangePage={handlePageChange}
                onChangeRowsPerPage={handlePerRowsChange}
                progressPending={isLoading}
                responsive
                customStyles={customStyles}
                onRowClicked={handleLabourModalShow}
                noDataComponent={
                  <div className="text-center py-4">
                    <p>No labourers found for this service.</p>
                  </div>
                }
              />
            </div>
          )}
        </div>
      </Container>

      {/* Labour Details Modal */}
      <LabourDetailsModal
        show={showLabourModal}
        onHide={handleLabourModalClose}
        selectedLabour={selectedLabour}
      />
    </div>
  );
}

export default LabourListPage; 