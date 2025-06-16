import React, { useState } from 'react';
import { Container, Row, Col, Form, InputGroup, Pagination, Card, Button } from 'react-bootstrap';
import { FaSearch, FaUser, FaTools, FaPhone, FaStar, FaUserPlus, FaClipboardList, FaUserCircle, FaTools as FaToolsIcon } from 'react-icons/fa';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import { searchLabourByCategory } from '../services/LabourSearchService';
import LabourDetailsModal from './LabourDetailsModal';

function Home() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [labourers, setLabourers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedLabour, setSelectedLabour] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;
    await fetchLabourers(0, pageSize);
  };

  const fetchLabourers = async (pageNumber, size) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await searchLabourByCategory(searchTerm, pageNumber, size);
      if (response) {
        setLabourers(response.content || []);
        setTotalPages(response.totalPages || 0);
        setTotalElements(response.totalElements || 0);
        setCurrentPage(pageNumber);
        setPageSize(size);
      }
    } catch (error) {
      setError('Failed to fetch labourers. Please try again.');
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePageChange = (page) => {
    fetchLabourers(page - 1, pageSize); // Subtract 1 because DataTable uses 1-based indexing
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    fetchLabourers(page - 1, newPerPage);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const items = [];
    for (let number = 0; number < totalPages; number++) {
      items.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number + 1)}
        >
          {number + 1}
        </Pagination.Item>
      );
    }

    return (
      <div className="d-flex justify-content-center mt-3">
        <Pagination>
          <Pagination.Prev
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 0}
          />
          {items}
          <Pagination.Next
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
          />
        </Pagination>
      </div>
    );
  };

  return (
    <Container fluid className="home-container">
      {/* Hero Section */}
      <Row className="hero-section">
        <Col>
          <div className="hero-content">
            <h1 className="display-4 mb-4">
              Welcome to InstaLab
            </h1>
            <h2 className="text-muted mb-5">
              Connect with skilled labourers and get services at your Doorstep :)
            </h2>
          </div>
        </Col>
      </Row>

      {/* Navigation Cards Section */}
      <Row className="navigation-cards mb-5">
        <Col md={3} className="mb-4">
          <Card className="nav-card h-100">
            <Card.Body className="text-center">
              <FaUserPlus className="nav-icon mb-3" />
              <h3>Register</h3>
              <p className="text-muted">Create your account to book services</p>
              <Button
                variant="primary"
                className="w-100"
                onClick={() => navigate('/register')}
              >
                Register as User
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-4">
          <Card className="nav-card h-100">
            <Card.Body className="text-center">
              <FaClipboardList className="nav-icon mb-3" />
              <h3>Labour Register</h3>
              <p className="text-muted">Join as a service provider</p>
              <Button
                variant="success"
                className="w-100"
                onClick={() => navigate('/labourRegister')}
              >
                Register as Labour
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-4">
          <Card className="nav-card h-100">
            <Card.Body className="text-center">
              <FaUserCircle className="nav-icon mb-3" />
              <h3>User Login</h3>
              <p className="text-muted">Access your account</p>
              <Button
                variant="info"
                className="w-100"
                onClick={() => navigate('/login')}
              >
                Login as User
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-4">
          <Card className="nav-card h-100">
            <Card.Body className="text-center">
              <FaToolsIcon className="nav-icon mb-3" />
              <h3>Labour Login</h3>
              <p className="text-muted">Access your labour account</p>
              <Button
                variant="warning"
                className="w-100"
                onClick={() => navigate('/labourLogin')}
              >
                Login as Labour
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Search Section */}
      <Row className="search-section mb-5">
        <Col md={8} className="mx-auto">
          <Card className="search-card">
            <Card.Body>
              <h3 className="text-center mb-4">Find Skilled Labourers</h3>
              <Form onSubmit={handleSearch}>
                <InputGroup className="mb-3">
                  <Form.Control
                    type="text"
                    placeholder="Search for labourers by category (e.g., sweeper, plumber)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="py-3"
                  />
                  <Button
                    variant="primary"
                    type="submit"
                    className="px-4"
                  >
                    <FaSearch className="me-2" />
                    Search
                  </Button>
                </InputGroup>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Results Section */}
      {error && (
        <Row className="justify-content-center mb-4">
          <Col md={8}>
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          </Col>
        </Row>
      )}

      <Row className="results-section">
        <Col md={12} lg={11} className="mx-auto">
          <Card className="results-card">
            <Card.Body>
              <DataTable
                columns={columns}
                data={labourers}
                pagination
                paginationServer
                paginationTotalRows={totalElements}
                onChangeRowsPerPage={handlePerRowsChange}
                onChangePage={handlePageChange}
                customStyles={customStyles}
                progressPending={isLoading}
                onRowClicked={(row) => {
                  setSelectedLabour(row);
                  setShowModal(true);
                }}
                pointerOnHover
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add the modal */}
      <LabourDetailsModal
        show={showModal}
        handleClose={() => {
          setShowModal(false);
          setSelectedLabour(null);
        }}
        labour={selectedLabour}
      />
    </Container>
  );
}

export default Home; 