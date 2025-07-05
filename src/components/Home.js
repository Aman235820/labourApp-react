import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Pagination, Card, Button, Modal } from 'react-bootstrap';
import { FaSearch, FaUser, FaTools, FaPhone, FaStar, FaUserPlus, FaClipboardList, FaUserCircle, FaTools as FaToolsIcon, FaTimes } from 'react-icons/fa';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import { searchLabourByCategory } from '../services/LabourSearchService';
import LabourDetailsModal from './LabourDetailsModal';
import LabourList from './LabourList';

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
  const [showLabourModal, setShowLabourModal] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showLabourListModal, setShowLabourListModal] = useState(false);

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

  useEffect(() => {
    fetch('/services.json')
      .then(res => res.json())
      .then(data => setServices(data.services))
      .catch(err => console.error('Failed to load services.json', err));
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    // Always clear previous results before searching
    setLabourers([]);
    setTotalPages(0);
    setTotalElements(0);
    setCurrentPage(0);
    if (!searchTerm.trim()) return;
    await fetchLabourers(0, pageSize);
    // Only clear the search bar if results are set (labourers is not empty)
    // We'll use a setTimeout to ensure state is updated after fetchLabourers
    setTimeout(() => {
      if (labourers.length > 0) setSearchTerm('');
    }, 0);
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

  const handleLabourModalClose = () => {
    setShowLabourModal(false);
    setSelectedLabour(null);
  };

  const handleLabourModalShow = (labour) => {
    setSelectedLabour(labour);
    setShowLabourModal(true);
  };

  const handleServiceClick = (service) => {
    if (selectedService && selectedService.name === service.name) {
      setSelectedService(null); // Close if already open
    } else {
      setSelectedService(service); // Open if not open
      // Smooth scroll to subservices section after a short delay to allow rendering
      setTimeout(() => {
        const subservicesElement = document.getElementById(`subservices-${service.name.replace(/\s+/g, '-').toLowerCase()}`);
        if (subservicesElement) {
          subservicesElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest'
          });
        }
      }, 100);
    }
  };

  const handleSubserviceClick = async (sub) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await searchLabourByCategory(sub, 0, pageSize);
      if (res && res.content) {
        setLabourers(res.content);
        setTotalPages(res.totalPages || 0);
        setTotalElements(res.totalElements || 0);
        setCurrentPage(0);
        setShowLabourListModal(true);
      } else {
        setLabourers([]);
        setTotalPages(0);
        setTotalElements(0);
        setCurrentPage(0);
        setShowLabourListModal(true);
        alert('No labourers found for this subservice.');
      }
    } catch (err) {
      setLabourers([]);
      setTotalPages(0);
      setTotalElements(0);
      setCurrentPage(0);
      setShowLabourListModal(true);
      alert('API error for ' + sub);
      console.error('API error for', sub, err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for clicking a row in LabourList
  const handleLabourListRowClick = (labour) => {
    setSelectedLabour(labour);
    setShowLabourModal(true);
  };

  // Handler for closing LabourList modal
  const handleLabourListClose = () => {
    setShowLabourListModal(false);
    setLabourers([]);
    setTotalPages(0);
    setTotalElements(0);
    setCurrentPage(0);
  };

  return (
    <Container fluid className="home-container">
      {/* Search Section */}
      <div style={{
        padding: '1rem 1rem',
        marginBottom: '1rem',
        position: 'relative'
      }}>
        <Container>
          <Form onSubmit={handleSearch}>
            <Row className="justify-content-center">
              <Col md={8} lg={6}>
                <InputGroup className="mb-3">
                  <InputGroup.Text style={{ 
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    borderRight: 'none'
                  }}>
                    <FaSearch className="text-primary" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Search for skilled labourers..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (e.target.value === '') {
                        setLabourers([]);
                        setTotalPages(0);
                        setTotalElements(0);
                        setCurrentPage(0);
                      }
                    }}
                    style={{
                      border: '1px solid #e2e8f0',
                      padding: '0.75rem 1rem',
                      fontSize: '1.1rem',
                      boxShadow: 'none'
                    }}
                  />
                  <Button 
                    variant="primary" 
                    type="submit"
                    style={{
                      padding: '0.75rem 2rem',
                      fontSize: '1.1rem',
                      fontWeight: 600
                    }}
                  >
                    Search
                  </Button>
                </InputGroup>
              </Col>
            </Row>
          </Form>

          {/* Results Dropdown */}
          {searchTerm && labourers.length > 0 && (
            <>
              {/* Backdrop */}
              <div 
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 999
                }}
                onClick={() => setSearchTerm('')}
              />
              
              {/* Results Container */}
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '800px',
                zIndex: 1000,
                background: 'white',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                marginTop: '0.5rem',
                maxHeight: '80vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {/* Header */}
                <div style={{
                  padding: '1rem',
                  borderBottom: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h5 className="mb-0" style={{ color: '#2d3748', fontWeight: 600 }}>
                    Search Results
                  </h5>
                  <Button 
                    variant="link" 
                    className="text-muted p-0"
                    onClick={() => setSearchTerm('')}
                  >
                    <FaTimes size={20} />
                  </Button>
                </div>

                {/* Results Table */}
                <div style={{ overflow: 'auto', flex: 1 }}>
                  <Card className="border-0">
                    <Card.Body style={{ padding: '1rem' }}>
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
                        onRowClicked={(row) => handleLabourModalShow(row)}
                        pointerOnHover
                        noHeader
                      />
                    </Card.Body>
                  </Card>
                </div>
              </div>
            </>
          )}
        </Container>
      </div>

      {/* Header Section */}
      <div className="header-section" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1rem 1rem',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
        borderRadius: '1rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
        marginBottom: '2rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          marginBottom: '1rem'
        }}>
          <img
            src="/images/instaHelpLogo.jpg"
            alt="InstaHelp Logo"
            style={{
              height: 80,
              width: 'auto',
              borderRadius: '8px',
              transition: 'transform 0.3s ease',
              cursor: 'pointer',
              objectFit: 'contain'
            }}
            onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
          />
          <div>
            <h1 className="display-4 mb-2" style={{
              fontWeight: 800,
              color: '#1a202c',
              letterSpacing: '-0.5px',
              background: 'linear-gradient(45deg, #2d3748, #4a5568)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              InstaHelp
            </h1>
            <div className="tagline" style={{
              fontSize: '1.2rem',
              color: '#4a5568',
              fontWeight: 500,
              maxWidth: '600px',
              lineHeight: '1.5'
            }}>
              Connect with skilled labourers and get services at your doorstep
              <span style={{
                display: 'inline-block',
                marginLeft: '0.5rem',
                animation: 'wave 1.5s infinite',
                transformOrigin: '70% 70%'
              }}>✨</span>
            </div>
          </div>
        </div>
        <style>
          {`
            @keyframes wave {
              0% { transform: rotate(0deg); }
              10% { transform: rotate(14deg); }
              20% { transform: rotate(-8deg); }
              30% { transform: rotate(14deg); }
              40% { transform: rotate(-4deg); }
              50% { transform: rotate(10deg); }
              60% { transform: rotate(0deg); }
              100% { transform: rotate(0deg); }
            }
          `}
        </style>
      </div>

      {/* Service Images Section */}
      <div className="service-images-section" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '2rem',
        margin: '2rem 0',
        maxWidth: '1200px',
        marginLeft: 'auto',
        marginRight: 'auto',
        padding: '0 1rem'
      }}>
        {services.map((service, index) => {
          // Map service names to image paths
          const getServiceImage = (serviceName) => {
            const imageMap = {
              'Cleaning Services': '/images/cleaning1.webp',
              'Electrician': '/images/electrician1.jpg',
              'Plumber': '/images/plumber1.webp',
              'Painter': '/images/painter1.webp',
              'Pest Control': '/images/pestcontrol1.jpeg',
              'Logistics': '/images/logistics1.webp',
              'Personal Care': '/images/personalcare1.jpg',
              'Carpenter': '/images/carpenter1.jpg',
              'Home Appliance Repair': '/images/homeappliance1.jpg',
              'Construction & Civil Work': '/images/construction1.jpg',
              'Vehicle Services': '/images/mechanic1.jpg',
              'Farm & Rural Services': '/images/farm1.jpg',
              'House Help': '/images/househelp1.jpg',
              'Mechanic': '/images/mechanic1.jpg',
              'Driver': '/images/driver1.jpg',
            };
            return imageMap[serviceName] || '/images/default-service.jpg';
          };

          const isSelected = selectedService && selectedService.name === service.name;
          const servicesPerRow = Math.floor(1200 / 220); // Approximate services per row
          const currentRow = Math.floor(index / servicesPerRow);
          const selectedServiceRow = selectedService ? Math.floor(services.findIndex(s => s.name === selectedService.name) / servicesPerRow) : -1;
          const shouldShowSubservices = isSelected;

          return (
            <React.Fragment key={service.name}>
              <div style={{
                width: '100%',
                textAlign: 'center',
                background: isSelected ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : '#fff',
                borderRadius: '1rem',
                boxShadow: isSelected ? '0 8px 25px rgba(37,99,235,0.15)' : '0 2px 8px rgba(0,0,0,0.07)',
                padding: '1rem',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: isSelected ? '2px solid #2563eb' : '2px solid transparent',
                transform: isSelected ? 'translateY(-2px)' : 'translateY(0)',
              }}
              onMouseOver={e => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
                }
              }}
              onMouseOut={e => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.07)';
                }
              }}
              onClick={() => handleServiceClick(service)}
              >
                <img
                  src={getServiceImage(service.name)}
                  alt={service.name}
                  style={{
                    width: '100%',
                    height: 110,
                    objectFit: 'cover',
                    borderRadius: '0.7rem',
                    marginBottom: '0.7rem',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease'
                  }}
                />
                <div style={{ 
                  fontWeight: 600, 
                  fontSize: 18, 
                  color: isSelected ? '#2563eb' : '#222',
                  transition: 'color 0.3s ease'
                }}>
                  {service.name}
                </div>
                {isSelected && (
                  <div style={{
                    marginTop: '0.5rem',
                    fontSize: '0.9rem',
                    color: '#4f46e5',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.3rem'
                  }}>
                    <span>Click to close</span>
                    <span style={{ fontSize: '0.7rem' }}>▲</span>
                  </div>
                )}
              </div>

              {/* Subservices Section - Appears right after the selected service */}
              {shouldShowSubservices && (
                <div 
                  id={`subservices-${selectedService.name.replace(/\s+/g, '-').toLowerCase()}`}
                  style={{
                    gridColumn: '1 / -1',
                    margin: '1rem 0',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                    borderRadius: '1rem',
                    padding: '2rem 1rem',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid #e2e8f0',
                    animation: 'slideDown 0.4s ease-out',
                    transformOrigin: 'top center',
                    scrollMarginTop: '2rem'
                  }}>
                  <style>
                    {`
                      @keyframes slideDown {
                        from {
                          opacity: 0;
                          transform: translateY(-20px) scaleY(0.8);
                        }
                        to {
                          opacity: 1;
                          transform: translateY(0) scaleY(1);
                        }
                      }
                    `}
                  </style>
                  <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ 
                      color: '#1e293b', 
                      fontWeight: 700, 
                      marginBottom: '0.5rem',
                      fontSize: '1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}>
                      <span style={{ fontSize: '1.8rem' }}>{selectedService.icon}</span>
                      {selectedService.name} Services
                    </h3>
                    <p style={{ 
                      color: '#64748b', 
                      fontSize: '1rem',
                      margin: '0 auto',
                      maxWidth: '500px'
                    }}>
                      Choose from our specialized {selectedService.name.toLowerCase()} services
                    </p>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    justifyContent: 'center', 
                    gap: '1rem',
                    maxWidth: '800px',
                    margin: '0 auto'
                  }}>
                    {selectedService.subCategories.map((sub, subIndex) => (
                      <button
                        key={sub}
                        style={{
                          border: '2px solid #cbd5e1',
                          borderRadius: '2rem',
                          padding: '0.8rem 1.6rem',
                          fontSize: '1rem',
                          fontWeight: 600,
                          background: 'white',
                          color: '#374151',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          outline: 'none',
                          minWidth: '140px',
                          position: 'relative',
                          overflow: 'hidden',
                          animation: `fadeInUp 0.4s ease-out ${subIndex * 0.1}s both`
                        }}
                        onClick={() => handleSubserviceClick(sub)}
                        onMouseOver={e => {
                          e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #e0e7ff 100%)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(37,99,235,0.15)';
                          e.currentTarget.style.borderColor = '#3b82f6';
                          e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)';
                          e.currentTarget.style.color = '#1e40af';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.background = 'white';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.transform = 'translateY(0) scale(1)';
                          e.currentTarget.style.color = '#374151';
                        }}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                  <style>
                    {`
                      @keyframes fadeInUp {
                        from {
                          opacity: 0;
                          transform: translateY(20px);
                        }
                        to {
                          opacity: 1;
                          transform: translateY(0);
                        }
                      }
                    `}
                  </style>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Modal Results Table for Subservice Clicks */}
      <LabourList
        show={showLabourListModal}
        onHide={handleLabourListClose}
        labourers={labourers}
        onRowClick={handleLabourListRowClick}
      />

      {/* Onboarding CTA Section */}
      <Row className="cta-section my-5" style={{ gap: '2rem', justifyContent: 'center' }}>
        <Col md={5} className="mb-4">
          <Card className="cta-card h-100 shadow" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: 220 }}>
              <img
                src="/images/carpenter1.jpg"
                alt="Skilled Professional"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'linear-gradient(90deg, rgba(0,0,0,0.5) 40%, transparent 100%)'
              }} />
            </div>
            <Card.Body>
              <h2 className="fw-bold mb-2">Skilled Professional?</h2>
              <p className="mb-3">Join us to grow your business.<br />Register as a service provider and reach more customers.</p>
              <Button
                style={{
                  background: 'linear-gradient(90deg, #16a34a 0%, #22d3ee 100%)',
                  border: 'none',
                  borderRadius: '2rem',
                  boxShadow: '0 2px 8px rgba(34,211,238,0.15)',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  padding: '0.85rem 2.2rem',
                  transition: 'background 0.2s, transform 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #22d3ee 0%, #16a34a 100%)'}
                onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #16a34a 0%, #22d3ee 100%)'}
                variant="success"
                size="lg"
                onClick={() => navigate('/labourRegister')}
              >
                Join as Professional
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={5} className="mb-4">
          <Card className="cta-card h-100 shadow" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: 220 }}>
              <img
                src="/images/cleaning1.webp"
                alt="Book Service"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: 'linear-gradient(90deg, rgba(0,0,0,0.5) 40%, transparent 100%)'
              }} />
            </div>
            <Card.Body>
              <h2 className="fw-bold mb-2">Want help for household tasks?</h2>
              <p className="mb-3">Book your service today.<br />Create your account and get instant access to trusted professionals.</p>
              <Button
                style={{
                  background: 'linear-gradient(90deg, #2563eb 0%, #38bdf8 100%)',
                  border: 'none',
                  borderRadius: '2rem',
                  boxShadow: '0 2px 8px rgba(56,189,248,0.15)',
                  fontWeight: 700,
                  fontSize: '1.2rem',
                  padding: '0.85rem 2.2rem',
                  transition: 'background 0.2s, transform 0.2s',
                }}
                onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #38bdf8 0%, #2563eb 100%)'}
                onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg, #2563eb 0%, #38bdf8 100%)'}
                variant="primary"
                size="lg"
                onClick={() => navigate('/register')}
              >
                Join as Customer
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Labour Details Modal */}
      <LabourDetailsModal
        show={showLabourModal}
        onHide={handleLabourModalClose}
        selectedLabour={selectedLabour}
      />
    </Container>
  );
}

export default Home; 