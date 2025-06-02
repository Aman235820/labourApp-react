import React, { useState } from 'react';
import { Container, Row, Col, Form, InputGroup, Pagination } from 'react-bootstrap';
import { FaSearch, FaUser, FaTools, FaPhone, FaStar } from 'react-icons/fa';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [labourers, setLabourers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const columns = [
    {
      name: 'Name',
      selector: row => row.labourName,
      sortable: true,
      cell: row => (
        <div className="d-flex align-items-center">
          <FaUser className="text-primary me-2" style={{ fontSize: '1.2rem' }} />
          <Link to={`/labour/${row.labourId}`} className="text-decoration-none">
            <span className="fw-medium text-primary">{row.labourName}</span>
          </Link>
        </div>
      ),
    },
    {
      name: 'Skill',
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
          <FaPhone className="text-info me-2" style={{ fontSize: '1.2rem' }} />
          <span className="fw-medium">{row.labourMobileNo}</span>
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
      const response = await axios.post(
        `http://localhost:4000/labourapp/labourReq/findByCategory?category=${searchTerm}`,
        {
          pageNumber: pageNumber,
          pageSize: size,
          sortBy: "rating",
          sortOrder: "desc"
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setLabourers(response.data.content || []);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
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
    <Container>
      <Row className="mt-4 text-center">
        <Col>
          <h1 className="display-4 mb-4">
            Welcome to InstaLab
          </h1>
          <h2 className="text-muted mb-4">
            Connect with skilled labourers and get services at your Doorstep :)
          </h2>
        </Col>
      </Row>

      <Row className="justify-content-center mb-4">
        <Col md={8}>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search for labourers by category (e.g., sweeper, plumber)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="py-2"
              />
              <InputGroup.Text 
                onClick={handleSearch}
                style={{ cursor: 'pointer' }}
              >
                <FaSearch />
              </InputGroup.Text>
            </InputGroup>
          </Form>
        </Col>
      </Row>

      {error && (
        <Row className="justify-content-center">
          <Col md={8}>
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          </Col>
        </Row>
      )}

      <Row className="justify-content-center">
        <Col md={12} lg={11}>
          <div className="shadow-sm rounded">
            <DataTable
              columns={columns}
              data={labourers}
              pagination
              paginationServer
              paginationTotalRows={totalElements}
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
              paginationPerPage={pageSize}
              paginationRowsPerPageOptions={[10, 20, 30, 50]}
              progressPending={isLoading}
              progressComponent={
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              }
              customStyles={customStyles}
              highlightOnHover
              pointerOnHover
              striped
              noDataComponent={
                <div className="text-center py-5">
                  <p className="text-muted mb-0 fs-5">
                    {searchTerm ? 'No labourers found matching your search.' : 'Enter a category to search for labourers.'}
                  </p>
                </div>
              }
              className="border rounded"
            />
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Home; 