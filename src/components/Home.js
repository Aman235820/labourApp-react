import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, InputGroup, Pagination, Card, Button, Modal, Spinner } from 'react-bootstrap';
import { FaSearch, FaUser, FaTools, FaPhone, FaStar, FaUserPlus, FaClipboardList, FaUserCircle, FaTools as FaToolsIcon, FaTimes } from 'react-icons/fa';
import DataTable from 'react-data-table-component';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Home.css';
import '../styles/SearchLabourModal.css';
import { searchLabourByCategory } from '../services/LabourSearchService';
import LabourDetailsModal from './LabourDetailsModal';
import LabourList from './LabourList';
import { useTranslation } from 'react-i18next';

function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
      name: t('table.name'),
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
      name: t('table.services'),
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
      name: t('table.phone'),
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
            {t('common.callNow')}
          </Button>
        </div>
      ),
    },
    {
      name: t('table.rating'),
      selector: row => row.rating,
      sortable: true,
      cell: row => (
        <div className="d-flex align-items-center">
          <FaStar className="text-warning me-2" style={{ fontSize: '1.2rem' }} />
          <span className="fw-medium">{row.rating || t('common.noRatingsYet')}</span>
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
        if(response.content.length === 0){
          alert(`Search results for "${searchTerm}" not found Sorry for the inconvenience. We couldn't find any skilled professionals for this service at the moment.`);
        }
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
        // Navigate to labour list page with the data
        navigate('/labour-list', { 
          state: { 
            labourers: res.content,
            totalElements: res.totalElements || 0,
            totalPages: res.totalPages || 0,
            service: sub,
            currentPage: 0,
            pageSize: pageSize
          }
        });
      } else {
        // Navigate with empty data
        navigate('/labour-list', { 
          state: { 
            labourers: [],
            totalElements: 0,
            totalPages: 0,
            service: sub,
            currentPage: 0,
            pageSize: pageSize
          }
        });
      }
    } catch (err) {
      console.error('Navigation error for', sub, err);
      // Navigate with error state
      navigate('/labour-list', { 
        state: { 
          labourers: [],
          totalElements: 0,
          totalPages: 0,
          service: sub,
          currentPage: 0,
          pageSize: pageSize,
          error: 'Failed to fetch labourers'
        }
      });
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

  const handlePopularServiceClick = async (serviceName) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await searchLabourByCategory(serviceName, 0, pageSize);
      if (res && res.content) {
        // Navigate to labour list page with the data
        navigate('/labour-list', { 
          state: { 
            labourers: res.content,
            totalElements: res.totalElements || 0,
            totalPages: res.totalPages || 0,
            service: serviceName,
            currentPage: 0,
            pageSize: pageSize
          }
        });
      } else {
        // Navigate with empty data
        navigate('/labour-list', { 
          state: { 
            labourers: [],
            totalElements: 0,
            totalPages: 0,
            service: serviceName,
            currentPage: 0,
            pageSize: pageSize
          }
        });
      }
    } catch (err) {
      console.error('Navigation error for', serviceName, err);
      // Navigate with error state
      navigate('/labour-list', { 
        state: { 
          labourers: [],
          totalElements: 0,
          totalPages: 0,
          service: serviceName,
          currentPage: 0,
          pageSize: pageSize,
          error: 'Failed to fetch labourers'
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get translated service name
  const getTranslatedServiceName = (serviceName) => {
    const serviceKeyMap = {
      'Cleaning Services': 'services.cleaningServices',
      'Electrician': 'services.electrician',
      'Plumber': 'services.plumber',
      'Painter': 'services.painter',
      'Pest Control': 'services.pestControl',
      'Logistics': 'services.logistics',
      'Personal Care': 'services.personalCare',
      'Carpenter': 'services.carpenter',
      'Home Appliance Repair': 'services.homeApplianceRepair',
      'Construction & Civil Work': 'services.constructionCivilWork',
      'Vehicle Services': 'services.vehicleServices',
      'Farm & Rural Services': 'services.farmRuralServices',
      'House Help': 'services.houseHelp',
      'Mechanic': 'services.mechanic',
      'Driver': 'services.driver'
    };
    
    const key = serviceKeyMap[serviceName];
    return key ? t(key) : serviceName;
  };

  return (
    <Container fluid className="home-container">
      {/* Search Section */}
      <div className="search-section">
        <Container>
          <Form onSubmit={handleSearch}>
            <Row className="justify-content-center">
              <Col xs={12} md={8} lg={6}>
                <div className="search-input-wrapper">
                  <InputGroup className="search-input-group">
                    <InputGroup.Text className="search-icon">
                      <FaSearch className="text-primary" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder={t('search.placeholder')}
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
                      className="search-input"
                    />
                    <Button 
                      variant="primary" 
                      type="submit"
                      className="search-button"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                      ) : (
                        <>
                          <span className="d-none d-md-inline">{t('search.button')}</span>
                          <span className="d-inline d-md-none">
                            <FaSearch size={16} />
                          </span>
                        </>
                      )}
                    </Button>
                  </InputGroup>
                </div>
              </Col>
            </Row>
          </Form>

          {/* Results Dropdown */}
          {searchTerm && labourers.length > 0 && (
            <>
              {/* Backdrop */}
              <div 
                className="search-backdrop"
                onClick={() => setSearchTerm('')}
              />
              
              {/* Results Container */}
              <div className="search-results-container">
                {/* Header */}
                <div className="search-results-header">
                  <h5 className="mb-0 search-results-title">
                    Search Results
                  </h5>
                  <Button 
                    variant="link" 
                    className="text-muted p-0 close-results-btn"
                    onClick={() => setSearchTerm('')}
                  >
                    <FaTimes size={20} />
                  </Button>
                </div>

                {/* Results Table */}
                <div className="search-results-table">
                  <Card className="border-0">
                    <Card.Body className="search-results-body">
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
      <div className="header-section">
        <div className="header-content">
          <img
            src="/images/instaHelpLogo.jpg"
            alt="InstaHelp Logo"
            className="header-logo"
          />
          <div className="header-text">
            <h1 className="header-title">
              {t('home.headerTitle')}
            </h1>
            <div className="header-tagline">
              {t('home.headerTagline')}
              <span className="wave-emoji">✨</span>
            </div>
          </div>
        </div>
      </div>

      {/* Service Images Section */}
      <div className="service-images-section">
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
              <div 
                className={`service-card ${isSelected ? 'service-card-selected' : ''}`}
                onClick={() => handleServiceClick(service)}
              >
                <img
                  src={getServiceImage(service.name)}
                  alt={service.name}
                  className="service-image"
                />
                <div className={`service-name ${isSelected ? 'service-name-selected' : ''}`}>
                  {getTranslatedServiceName(service.name)}
                </div>
                {isSelected && (
                  <div className="service-close-indicator">
                    <span>{t('common.clickToClose')}</span>
                    <span className="close-arrow">▲</span>
                  </div>
                )}
              </div>

              {/* Subservices Section - Appears right after the selected service */}
              {shouldShowSubservices && (
                <div 
                  id={`subservices-${selectedService.name.replace(/\s+/g, '-').toLowerCase()}`}
                  className="subservices-section"
                >
                  <div className="subservices-header">
                    <h3 className="subservices-title">
                      <span className="subservice-icon">{selectedService.icon}</span>
                      {getTranslatedServiceName(selectedService.name)} {t('home.servicesText')}
                    </h3>
                    <p className="subservices-description">
                      {t('home.chooseSpecialized', { serviceName: getTranslatedServiceName(selectedService.name) })}
                    </p>
                  </div>
                  <div className="subservices-grid">
                    {selectedService.subCategories.map((sub, subIndex) => (
                      <button
                        key={sub}
                        className="subservice-button"
                        style={{ animationDelay: `${subIndex * 0.1}s` }}
                        onClick={() => handleSubserviceClick(sub)}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Explore Popular Services Section */}
      <div className="popular-services-section">
        <Container>
          <div className="section-header text-center mb-5">
            <h2 className="section-title">{t('home.explorePopularServices')}</h2>
            <p className="section-subtitle">{t('home.explorePopularServicesSubtitle')}</p>
          </div>
          
          <Row className="justify-content-center">
            <Col xs={12} sm={6} lg={6} className="mb-5">
              <div 
                className="popular-service-card enhanced-card"
                onClick={() => handlePopularServiceClick('Electrician')}
                style={{ position: 'relative' }}
              >
                <div className="service-image-container">
                  <img
                    src="/images/electrician2.jpg"
                    alt="Electrician"
                    className="popular-service-image"
                  />
                  <div className="service-overlay">
                    <div className="service-icon">
                      <FaTools />
                    </div>
                  </div>
                  <div className="service-badge">
                    <span>{t('common.popular')}</span>
                  </div>
                </div>
                <div className="service-content">
                  <h4 className="service-title">{t('home.electricianTitle')}</h4>
                  <p className="service-description">{t('home.electricianDescription')}</p>
                  <div className="service-features">
                    <span className="feature-tag">{t('common.available24x7')}</span>
                    <span className="feature-tag">{t('common.verified')}</span>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col xs={12} sm={6} lg={6} className="mb-5">
              <div 
                className="popular-service-card enhanced-card"
                onClick={() => handlePopularServiceClick('Plumber')}
                style={{ position: 'relative' }}
              >
                <div className="service-image-container">
                  <img
                    src="/images/plumber1.webp"
                    alt="Plumber"
                    className="popular-service-image"
                  />
                  <div className="service-overlay">
                    <div className="service-icon">
                      <FaTools />
                    </div>
                  </div>
                  <div className="service-badge">
                    <span>{t('common.topRated')}</span>
                  </div>
                </div>
                <div className="service-content">
                  <h4 className="service-title">{t('home.plumberTitle')}</h4>
                  <p className="service-description">{t('home.plumberDescription')}</p>
                  <div className="service-features">
                    <span className="feature-tag">{t('common.emergency')}</span>
                    <span className="feature-tag">{t('common.licensed')}</span>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col xs={12} sm={6} lg={6} className="mb-5">
              <div 
                className="popular-service-card enhanced-card"
                onClick={() => handlePopularServiceClick('Cleaning')}
                style={{ position: 'relative' }}
              >
                <div className="service-image-container">
                  <img
                    src="/images/househelp1.jpg"
                    alt="House Help"
                    className="popular-service-image"
                  />
                  <div className="service-overlay">
                    <div className="service-icon">
                      <FaTools />
                    </div>
                  </div>
                  <div className="service-badge">
                    <span>{t('common.trusted')}</span>
                  </div>
                </div>
                <div className="service-content">
                  <h4 className="service-title">{t('home.houseHelpTitle')}</h4>
                  <p className="service-description">{t('home.houseHelpDescription')}</p>
                  <div className="service-features">
                    <span className="feature-tag">{t('common.backgroundChecked')}</span>
                    <span className="feature-tag">{t('common.experienced')}</span>
                  </div>
                </div>
              </div>
            </Col>
            
            <Col xs={12} sm={6} lg={6} className="mb-5">
              <div 
                className="popular-service-card enhanced-card"
                onClick={() => handlePopularServiceClick('Vehicle Services')}
                style={{ position: 'relative' }}
              >
                <div className="service-image-container">
                  <img
                    src="/images/mechanic1.jpg"
                    alt="Mechanic"
                    className="popular-service-image"
                  />
                  <div className="service-overlay">
                    <div className="service-icon">
                      <FaTools />
                    </div>
                  </div>
                  <div className="service-badge">
                    <span>{t('common.expert')}</span>
                  </div>
                </div>
                <div className="service-content">
                  <h4 className="service-title">{t('home.mechanicTitle')}</h4>
                  <p className="service-description">{t('home.mechanicDescription')}</p>
                  <div className="service-features">
                    <span className="feature-tag">{t('common.mobileService')}</span>
                    <span className="feature-tag">{t('common.warranty')}</span>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Onboarding CTA Section */}
      <Row className="cta-section">
        <Col xs={12} md={6} className="mb-4">
          <Card className="cta-card cta-card-professional h-100">
            <div className="cta-image-container">
              <img
                src="/images/carpenter1.jpg"
                alt="Skilled Professional"
                className="cta-image"
              />
              <div className="cta-overlay" />
            </div>
            <Card.Body className="cta-body">
              <h2 className="cta-title">{t('home.skilledProfessional')}</h2>
              <p className="cta-description">{t('home.skilledProfessionalDescription').split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  {index === 0 && <br />}
                </span>
              ))}</p>
              <Button
                className="cta-button cta-button-professional"
                onClick={() => navigate('/labourRegister')}
              >
                {t('common.joinAsProfessional')}
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12} md={6} className="mb-4">
          <Card className="cta-card cta-card-customer h-100">
            <div className="cta-image-container">
              <img
                src="/images/cleaning1.webp"
                alt="Book Service"
                className="cta-image"
              />
              <div className="cta-overlay" />
            </div>
            <Card.Body className="cta-body">
              <h2 className="cta-title">{t('home.wantHelpForHousehold')}</h2>
              <p className="cta-description">{t('home.wantHelpForHouseholdDescription').split('\n').map((line, index) => (
                <span key={index}>
                  {line}
                  {index === 0 && <br />}
                </span>
              ))}</p>
              <Button
                className="cta-button cta-button-customer"
                onClick={() => navigate('/register')}
              >
                {t('common.joinAsCustomer')}
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
        service={searchTerm}
      />
    </Container>
  );
}

export default Home; 