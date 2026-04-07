import React, { useCallback, useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Spinner, Alert, Table } from 'react-bootstrap';
import Select from 'react-select';
import { FaBuilding, FaPhone, FaIdCard, FaUsers, FaMapMarkerAlt, FaShieldAlt, FaSignOutAlt, FaStar, FaEdit, FaTools, FaCheckCircle, FaTimesCircle, FaEye, FaAward, FaPlus, FaTrash, FaUserPlus, FaSyncAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import EnterpriseHeaderTiles from './EnterpriseHeaderTiles';
import CallNowModal from './CallNowModal';
import EnterpriseDetailsModal from './EnterpriseDetailsModal';
import EnterpriseLabourOnboardModal from './EnterpriseLabourOnboardModal';
import EnterpriseLabourProfileModal from './EnterpriseLabourProfileModal';
import { enterpriseService } from '../services/enterpriseService';
import {
  withEnterpriseId,
  resolveEnterpriseMongoId,
  getStoredEnterpriseSession,
  mergeEnterpriseSession,
  formatLabourPrimarySkillsDisplay,
} from '../utils/enterpriseSession';
import '../styles/EnterpriseDashboard.css';

/** Read persisted enterprise before first paint so refresh does not flash the login card. */
function readEnterpriseFromStorageSync() {
  try {
    const raw = localStorage.getItem('enterprise');
    if (!raw) return { enterprise: null, enterpriseId: null };
    const parsed = JSON.parse(raw);
    const enterpriseData = withEnterpriseId(parsed);
    const extracted =
      resolveEnterpriseMongoId(enterpriseData) ||
      String(enterpriseData?.enterpriseId || '').trim() ||
      '';
    const idOk = /^[0-9a-fA-F]{24}$/.test(extracted) ? extracted : null;
    return { enterprise: enterpriseData, enterpriseId: idOk };
  } catch {
    return { enterprise: null, enterpriseId: null };
  }
}

function EnterpriseDashboard() {
  const [enterprise, setEnterprise] = useState(() => readEnterpriseFromStorageSync().enterprise);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [services, setServices] = useState([]);
  const [isEditingServices, setIsEditingServices] = useState(false);
  const [serviceSelections, setServiceSelections] = useState([]);
  const [isSavingServices, setIsSavingServices] = useState(false);
  const [servicesError, setServicesError] = useState('');
  const [servicesSuccess, setServicesSuccess] = useState('');
  const [showCallModal, setShowCallModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showOnboardLabourModal, setShowOnboardLabourModal] = useState(false);
  const [labourProfileLab, setLabourProfileLab] = useState(null);
  const [enterpriseLabourers, setEnterpriseLabourers] = useState([]);
  const [labourListLoading, setLabourListLoading] = useState(false);
  const [labourListError, setLabourListError] = useState('');
  const [enterpriseId, setEnterpriseId] = useState(() => readEnterpriseFromStorageSync().enterpriseId);
  const navigate = useNavigate();

  useEffect(() => {
    const loadEnterpriseData = async () => {
      try {
        const stored = localStorage.getItem('enterprise');
        if (stored) {
          const parsed = JSON.parse(stored);
          const enterpriseData = withEnterpriseId(parsed);
          if (enterpriseData?.enterpriseId && enterpriseData?.enterpriseId !== parsed?.enterpriseId) {
            localStorage.setItem('enterprise', JSON.stringify(enterpriseData));
          }

          const extractedId =
            resolveEnterpriseMongoId(enterpriseData) || enterpriseData?.enterpriseId || '';
          const idOk = /^[0-9a-fA-F]{24}$/.test(String(extractedId).trim())
            ? String(extractedId).trim()
            : '';
          setEnterpriseId(idOk || null);

          const token = enterpriseData.token || '';

          if (idOk && token) {
            const freshData = await enterpriseService.findEnterpriseById(idOk, token);
            if (freshData && freshData.returnValue) {
              const updatedEnterprise = mergeEnterpriseSession(
                enterpriseData,
                freshData.returnValue,
                { token }
              );
              setEnterprise(updatedEnterprise);
              localStorage.setItem('enterprise', JSON.stringify(updatedEnterprise));
              const freshHex =
                resolveEnterpriseMongoId(updatedEnterprise) || updatedEnterprise?.enterpriseId;
              if (freshHex && /^[0-9a-fA-F]{24}$/.test(String(freshHex))) {
                setEnterpriseId(String(freshHex));
              }

              // Check if owner name is blank or null
              const ownerName = updatedEnterprise.ownername || '';
              if (!ownerName || ownerName.trim() === '') {
                setShowDetailsModal(true);
              }
            } else {
              // Fallback to stored data if API fails
              setEnterprise(enterpriseData);
              const ownerName = enterpriseData.ownername || '';
              if (!ownerName || ownerName.trim() === '') {
                setShowDetailsModal(true);
              }
            }
          } else {
            // No valid enterprise ID or token, use stored data
            setEnterprise(enterpriseData);
            const ownerName = enterpriseData.ownername || '';
            if (!ownerName || ownerName.trim() === '') {
              setShowDetailsModal(true);
            }
          }
        }
      } catch (error) {
        console.error('Error loading enterprise data:', error);
        // Fallback to stored data if API fails
        try {
          const stored = localStorage.getItem('enterprise');
          if (stored) {
            const enterpriseData = withEnterpriseId(JSON.parse(stored));
            setEnterprise(enterpriseData);
            const hid =
              resolveEnterpriseMongoId(enterpriseData) || enterpriseData?.enterpriseId;
            if (hid && /^[0-9a-fA-F]{24}$/.test(String(hid))) {
              setEnterpriseId(String(hid));
            }
            const ownerName = enterpriseData.ownername || '';
            if (!ownerName || ownerName.trim() === '') {
              setShowDetailsModal(true);
            }
          }
        } catch (_) {}
      } finally {
        setIsBootstrapping(false);
      }
    };

    loadEnterpriseData();
  }, []);

  // Load services data
  useEffect(() => {
    fetch('/services.json')
      .then(response => response.json())
      .then(data => setServices(data.services || []))
      .catch(error => console.error('Error loading services:', error));
  }, []);

  // Initialize service selections when enterprise data loads
  useEffect(() => {
    if (enterprise && services.length > 0) {
      const servicesOffered = enterprise.servicesOffered || enterprise.returnValue?.servicesOffered || {};
      const selections = Object.entries(servicesOffered).map(([serviceName, subServices]) => ({
        serviceName,
        subServices: subServices || []
      }));
      setServiceSelections(selections.length > 0 ? selections : [{ serviceName: '', subServices: [] }]);
    }
  }, [enterprise, services]);

  // Clear messages
  useEffect(() => {
    if (servicesError) {
      const timer = setTimeout(() => setServicesError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [servicesError]);

  useEffect(() => {
    if (servicesSuccess) {
      const timer = setTimeout(() => setServicesSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [servicesSuccess]);

  const handleLogout = () => {
    localStorage.removeItem('enterprise');
    navigate('/');
  };

  const getDashboardEnterpriseContext = () => {
    const normalized = withEnterpriseId(enterprise || {});
    const fromStorage = getStoredEnterpriseSession();
    // Prefer persisted session id; React state can omit id after API merges if we ever regress.
    const idCandidates = [
      fromStorage.enterpriseId,
      enterpriseId,
      resolveEnterpriseMongoId(normalized),
      typeof enterprise?.id === 'string' ? enterprise.id : '',
      typeof enterprise?.returnValue?.id === 'string' ? enterprise.returnValue.id : '',
    ];
    let idStr = '';
    for (const c of idCandidates) {
      const s = c != null ? String(c).trim() : '';
      if (/^[0-9a-fA-F]{24}$/.test(s)) {
        idStr = s;
        break;
      }
    }
    const mongoOk = /^[0-9a-fA-F]{24}$/.test(idStr);
    let token =
      enterprise?.token || enterprise?.returnValue?.token || fromStorage.token || '';
    if (!token) {
      try {
        token = JSON.parse(localStorage.getItem('enterprise') || '{}')?.token || '';
      } catch {
        token = '';
      }
    }
    return { id: mongoOk ? idStr : '', token: String(token || '').trim() };
  };

  const fetchEnterpriseLabours = useCallback(async () => {
    const { id, token } = getDashboardEnterpriseContext();
    if (!id || !token) {
      setEnterpriseLabourers([]);
      if (enterprise) {
        setLabourListError(
          !id
            ? 'Cannot load labours: enterprise ID is missing. Log in again from the enterprise login page.'
            : 'Cannot load labours: session token is missing. Log in again.'
        );
      } else {
        setLabourListError('');
      }
      setLabourListLoading(false);
      return;
    }
    setLabourListLoading(true);
    setLabourListError('');
    try {
      const res = await enterpriseService.findLabourByEnterpriseId(id, token);
      const raw = res?.returnValue;
      const list = Array.isArray(raw)
        ? raw
        : raw != null && typeof raw === 'object'
          ? [raw]
          : [];
      setEnterpriseLabourers(list);
    } catch (e) {
      const msg =
        (e && typeof e === 'object' && e.message) ||
        (e && typeof e === 'object' && e.response?.data?.message) ||
        'Failed to load registered labours.';
      setLabourListError(String(msg));
      setEnterpriseLabourers([]);
    } finally {
      setLabourListLoading(false);
    }
  }, [enterpriseId, enterprise]);

  useEffect(() => {
    if (!enterprise) return;
    fetchEnterpriseLabours();
  }, [enterprise, fetchEnterpriseLabours]);

  const handleEnterpriseLabourOnboardSuccess = async () => {
    await fetchEnterpriseLabours();
  };

  const handleEnterpriseUpdate = async (updatedEnterprise) => {
    try {
      // Update local state immediately
      const updated = withEnterpriseId(updatedEnterprise);
      setEnterprise(updated);
      localStorage.setItem('enterprise', JSON.stringify(updated));
      
      // Use the stored enterpriseId
      const effectiveEnterpriseId = updated?.enterpriseId || enterpriseId;
      if (effectiveEnterpriseId) {
        const token = updated.token || '';
        const freshData = await enterpriseService.findEnterpriseById(effectiveEnterpriseId, token);
        if (freshData && freshData.returnValue) {
          const freshEnterprise = mergeEnterpriseSession(
            updated,
            freshData.returnValue,
            { token }
          );
          setEnterprise(freshEnterprise);
          localStorage.setItem('enterprise', JSON.stringify(freshEnterprise));
        }
      }
    } catch (error) {
      console.error('Error refreshing enterprise data:', error);
      // Keep the updated enterprise data even if refresh fails
    }
  };

  // Services Portfolio Handlers
  const handleEditServices = () => {
    setIsEditingServices(true);
    setServicesError('');
    setServicesSuccess('');
  };

  const handleCancelEditServices = () => {
    setIsEditingServices(false);
    // Reset to original selections
    if (enterprise) {
      const servicesOffered = enterprise.servicesOffered || enterprise.returnValue?.servicesOffered || {};
      const selections = Object.entries(servicesOffered).map(([serviceName, subServices]) => ({
        serviceName,
        subServices: subServices || []
      }));
      setServiceSelections(selections.length > 0 ? selections : [{ serviceName: '', subServices: [] }]);
    }
    setServicesError('');
    setServicesSuccess('');
  };

  const handleAddServiceRow = () => {
    setServiceSelections(prev => ([...prev, { serviceName: '', subServices: [] }]));
  };

  const handleRemoveServiceRow = (idx) => {
    setServiceSelections(prev => prev.filter((_, i) => i !== idx));
  };

  const handleServiceChange = (idx, serviceName) => {
    setServiceSelections(prev => prev.map((row, i) => i === idx ? { serviceName, subServices: [] } : row));
  };

  const handleSubServicesChange = (idx, options) => {
    if (options && options.some(option => option.value === 'all')) {
      // Select All option was chosen - select all subcategories for this service
      const currentService = services.find(s => s.name === serviceSelections[idx].serviceName);
      const allSubServices = currentService?.subCategories || [];
      setServiceSelections(prev => prev.map((row, i) => i === idx ? { ...row, subServices: allSubServices } : row));
    } else {
      // Normal selection - filter out 'all' option if present
      const values = (options || []).map(o => o.value).filter(value => value !== 'all');
      setServiceSelections(prev => prev.map((row, i) => i === idx ? { ...row, subServices: values } : row));
    }
  };

  const getAvailableServicesForIndex = (idx) => {
    const taken = new Set(serviceSelections.map((r, i) => i !== idx ? r.serviceName : '').filter(Boolean));
    return services.filter(s => !taken.has(s.name));
  };

  const buildServicesOfferedObject = () => {
    const obj = {};
    serviceSelections.forEach((sel) => {
      const key = (sel.serviceName || '').trim();
      const items = (sel.subServices || []).map(i => i.trim()).filter(Boolean);
      if (key && items.length > 0) {
        obj[key] = items;
      }
    });
    return obj;
  };

  const validateServicesData = () => {
    const servicesOffered = buildServicesOfferedObject();
    if (Object.keys(servicesOffered).length === 0) {
      return 'Please add at least one service with subservices';
    }
    
    for (const row of serviceSelections) {
      if ((row.serviceName && row.subServices.length === 0) || (!row.serviceName && row.subServices.length > 0)) {
        return 'Each service must have at least one subservice';
      }
    }
    
    return null;
  };

  const handleSaveServices = async () => {
    const validationError = validateServicesData();
    if (validationError) {
      setServicesError(validationError);
      return;
    }

    setIsSavingServices(true);
    setServicesError('');
    
    try {
      const servicesOffered = buildServicesOfferedObject();
      const normalizedEnterprise = withEnterpriseId(enterprise || {});
      const effectiveEnterpriseId =
        resolveEnterpriseMongoId(normalizedEnterprise) ||
        enterpriseId ||
        resolveEnterpriseMongoId(enterprise || {});

      const token =
        enterprise?.token ||
        enterprise?.returnValue?.token ||
        (() => {
          try {
            return JSON.parse(localStorage.getItem('enterprise') || '{}')?.token || '';
          } catch {
            return '';
          }
        })();
      
      if (
        !effectiveEnterpriseId ||
        !/^[0-9a-fA-F]{24}$/.test(String(effectiveEnterpriseId).trim())
      ) {
        throw new Error('Enterprise ID not found. Please refresh and try again.');
      }
      
      const response = await enterpriseService.updateEnterpriseFields(
        effectiveEnterpriseId,
        { servicesOffered },
        token
      );
      
      if (response && !response.hasError) {
        const tokenNext = token || enterprise?.token || enterprise?.returnValue?.token;
        const updatedEnterprise = mergeEnterpriseSession(
          enterprise || {},
          response?.returnValue || {},
          { servicesOffered, token: tokenNext }
        );

        if (enterprise.returnValue) {
          updatedEnterprise.returnValue = {
            ...enterprise.returnValue,
            ...(response?.returnValue || {}),
            servicesOffered,
          };
        }
        
        setEnterprise(updatedEnterprise);
        setEnterpriseId(updatedEnterprise.enterpriseId || effectiveEnterpriseId);
        localStorage.setItem('enterprise', JSON.stringify(updatedEnterprise));
        
        setServicesSuccess('Services updated successfully!');
        setIsEditingServices(false);
      } else {
        throw new Error(response?.message || 'Failed to update services');
      }
    } catch (error) {
      console.error('Error updating services:', error);
      setServicesError(typeof error === 'string' ? error : error.message || 'Failed to update services. Please try again.');
    } finally {
      setIsSavingServices(false);
    }
  };

  if (!enterprise && isBootstrapping) {
    return (
      <Container className="py-5 enterprise-dashboard-loading">
        <div className="d-flex flex-column justify-content-center align-items-center py-5 my-3">
          <Spinner animation="border" variant="primary" role="status" className="mb-3">
            <span className="visually-hidden">Loading dashboard</span>
          </Spinner>
          <p className="text-muted mb-0">Loading your enterprise dashboard…</p>
        </div>
      </Container>
    );
  }

  if (!enterprise) {
    return (
      <Container className="py-5">
        <Card className="shadow-sm">
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Enterprise Dashboard</h4>
              <Button variant="primary" onClick={() => navigate('/enterpriseLogin')}>Login</Button>
            </div>
            <p className="text-muted mt-3 mb-0">No enterprise session found.</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  const ev = enterprise; // token + returnValue stored as we saved
  const rating = ev.returnValue?.rating || ev.rating || '0.0';
  const ratingCount = ev.returnValue?.ratingCount || ev.ratingCount || '0';
  const verificationStatus = ev.returnValue?.verificationStatus || ev.verificationStatus || 'PENDING';
  const companyName = ev.returnValue?.companyName || ev.companyName || '';
  const ownername = ev.returnValue?.ownername || ev.ownername || '';
  const gstNumber = ev.returnValue?.gstNumber || ev.gstNumber || '';
  const ownerContactInfo = ev.returnValue?.ownerContactInfo || ev.ownerContactInfo || '';
  const otherContactNumbers = ev.returnValue?.otherContactNumbers || ev.otherContactNumbers || [];
  const servicesOffered = ev.returnValue?.servicesOffered || ev.servicesOffered || {};

  const { id: dashboardEnterpriseId, token: dashboardEnterpriseToken } =
    getDashboardEnterpriseContext();

  // Extract contact numbers for Call Now modal
  const primaryNumber = ownerContactInfo;
  const alternateNumbers = Array.isArray(otherContactNumbers) ? otherContactNumbers.filter(num => num && num.trim()) : [];

  return (
    <Container className="py-4">
      
      {/* Header Tiles */}
      <EnterpriseHeaderTiles enterprise={enterprise} />

      {/* Main Dashboard Content */}
      <Row className="mt-4">
        {/* Enterprise Details Card */}
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <FaBuilding className="me-2" />
                Enterprise Details
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaBuilding className="text-primary me-2" />
                  <strong>Company:</strong>
                  <span className="ms-2">{companyName || 'Not provided'}</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <FaIdCard className="text-primary me-2" />
                  <strong>Owner:</strong>
                  <span className="ms-2">{ownername || 'Not provided'}</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <FaPhone className="text-primary me-2" />
                  <strong>Contact:</strong>
                  <span className="ms-2">{ownerContactInfo || 'Not provided'}</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <FaIdCard className="text-primary me-2" />
                  <strong>GST:</strong>
                  <span className="ms-2">{gstNumber || 'Not provided'}</span>
                </div>
                <div className="d-flex align-items-center mb-2">
                  <FaShieldAlt className="text-primary me-2" />
                  <strong>Status:</strong>
                  <Badge 
                    bg={verificationStatus === 'APPROVED' ? 'success' : verificationStatus === 'REJECTED' ? 'danger' : 'warning'}
                    className="ms-2"
                  >
                    {verificationStatus}
                  </Badge>
                </div>
                <div className="d-flex align-items-center">
                  <FaStar className="text-warning me-2" />
                  <strong>Rating:</strong>
                  <span className="ms-2">{rating} ({ratingCount} reviews)</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions Card */}
        <Col md={6} className="mb-4">
          <Card className="h-100 shadow-sm">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">
                <FaUsers className="me-2" />
                Quick Actions
              </h5>
            </Card.Header>
            <Card.Body className="d-flex flex-column">
              <Button 
                variant="outline-primary" 
                className="mb-3 d-flex align-items-center"
                onClick={() => setShowCallModal(true)}
              >
                <FaPhone className="me-2" />
                Call Now
              </Button>
              <Button variant="outline-primary" className="mb-3 d-flex align-items-center">
                <FaEye className="me-2" />
                View All Bookings
              </Button>
              <Button
                variant="outline-success"
                className="mb-3 d-flex align-items-center"
                onClick={() => setShowDetailsModal(true)}
              >
                <FaMapMarkerAlt className="me-2" />
                Update Details
              </Button>
              <Button
                variant="outline-primary"
                className="mb-3 d-flex align-items-center"
                onClick={() => setShowOnboardLabourModal(true)}
              >
                <FaUserPlus className="me-2" />
                Onboard labour
              </Button>
              <Button
                variant="outline-warning"
                className="mb-3 d-flex align-items-center"
                onClick={() => setShowDetailsModal(true)}
              >
                <FaAward className="me-2" />
                Documents / Certificates
              </Button>
              <div className="mt-auto">
                <Button 
                  variant="outline-danger" 
                  onClick={handleLogout}
                  className="w-100 d-flex align-items-center justify-content-center"
                >
                  <FaSignOutAlt className="me-2" />
                  Logout
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Registered labours (server) */}
      <Row className="mt-4 enterprise-labour-registry-row">
        <Col xs={12}>
          <Card className="shadow-sm border-0 enterprise-labour-registry-card">
            <Card.Header className="enterprise-labour-registry-header border-0 py-3">
              <div className="d-flex flex-column flex-md-row align-items-stretch align-items-md-center justify-content-between gap-3">
                <div className="min-w-0">
                  <h4 className="mb-0 fw-bold text-dark d-flex align-items-center flex-wrap gap-2">
                    <FaUsers className="text-primary flex-shrink-0" />
                    <span>Registered labours</span>
                    {!labourListLoading && enterpriseLabourers.length > 0 ? (
                      <Badge bg="primary" pill className="ms-md-1">
                        {enterpriseLabourers.length}
                      </Badge>
                    ) : null}
                  </h4>
                  <p className="text-muted small mb-0 mt-2">
                    Compact list for large teams. Use <strong>View profile</strong> for full details.
                  </p>
                </div>
                <div className="d-flex flex-column flex-sm-row gap-2 flex-shrink-0">
                  <Button
                    variant="outline-primary"
                    className="d-flex align-items-center justify-content-center gap-2"
                    onClick={() => fetchEnterpriseLabours()}
                    disabled={labourListLoading}
                  >
                    {labourListLoading ? (
                      <>
                        <Spinner animation="border" size="sm" role="status" />
                        <span>Loading…</span>
                      </>
                    ) : (
                      <>
                        <FaSyncAlt />
                        <span>Refresh</span>
                      </>
                    )}
                  </Button>
                  <Button
                    variant="success"
                    className="d-flex align-items-center justify-content-center gap-2"
                    onClick={() => setShowOnboardLabourModal(true)}
                  >
                    <FaUserPlus />
                    <span>Onboard labour</span>
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="pt-0">
              {labourListError ? (
                <Alert
                  variant="danger"
                  className="mb-3"
                  dismissible
                  onClose={() => setLabourListError('')}
                >
                  {labourListError}
                </Alert>
              ) : null}

              {labourListLoading && enterpriseLabourers.length === 0 ? (
                <div className="enterprise-labour-loading text-center py-5">
                  <Spinner animation="border" variant="primary" role="status" />
                  <p className="text-muted small mt-3 mb-0">Fetching your team…</p>
                </div>
              ) : enterpriseLabourers.length === 0 ? (
                <div className="enterprise-labour-empty text-center py-5 px-2">
                  <FaUserPlus className="mb-3 text-muted opacity-50 enterprise-labour-empty-icon" />
                  <p className="text-muted mb-2 fw-semibold">No registered labours yet</p>
                  <p className="text-muted small mb-0">
                    Use <strong>Onboard labour</strong> to add team members. They will appear here after the server saves them.
                  </p>
                </div>
              ) : (
                <div className="enterprise-labour-list-wrap border rounded-3 overflow-hidden">
                  <div className="enterprise-labour-list-scroll">
                    <Table hover responsive className="enterprise-labour-table mb-0 align-middle">
                      <thead className="table-light">
                        <tr>
                          <th scope="col" className="enterprise-labour-th-name">
                            Name
                          </th>
                          <th scope="col" className="d-none d-md-table-cell">
                            Role
                          </th>
                          <th scope="col" className="d-none d-lg-table-cell">
                            Skill
                          </th>
                          <th scope="col" className="d-none d-sm-table-cell">
                            Mobile
                          </th>
                          <th scope="col" className="d-none d-md-table-cell text-nowrap">
                            Status
                          </th>
                          <th scope="col" className="text-end text-nowrap">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {enterpriseLabourers.map((lab, idx) => {
                          const rowKey =
                            lab.enterpriseLabourId != null
                              ? `el-${lab.enterpriseLabourId}`
                              : lab.id != null
                                ? `id-${lab.id}`
                                : `lab-${idx}-${lab.mobile || ''}`;
                          const skillsLine = formatLabourPrimarySkillsDisplay(lab);
                          return (
                            <tr key={rowKey}>
                              <td className="min-w-0">
                                <div className="fw-semibold text-break">{lab.fullName || '—'}</div>
                                <div className="d-md-none small text-muted text-break">
                                  <Badge bg="dark" className="text-uppercase me-1 mt-1">
                                    {lab.role || '—'}
                                  </Badge>
                                  {skillsLine !== '—' ? (
                                    <span className="d-inline-flex align-items-center gap-1">
                                      <FaIdCard className="flex-shrink-0" aria-hidden />
                                      {skillsLine}
                                    </span>
                                  ) : null}
                                </div>
                                <div className="d-sm-none small text-muted mt-1">
                                  <FaPhone className="me-1 text-primary" aria-hidden />
                                  {lab.mobile || '—'}
                                </div>
                                <div className="d-md-none d-flex flex-wrap gap-1 mt-2">
                                  <Badge bg={lab.status === 'ACTIVE' ? 'success' : 'secondary'}>
                                    {lab.status || '—'}
                                  </Badge>
                                  <Badge
                                    bg={
                                      lab.verificationStatus === 'VERIFIED'
                                        ? 'success'
                                        : lab.verificationStatus === 'REJECTED'
                                          ? 'danger'
                                          : 'warning'
                                    }
                                    className={
                                      lab.verificationStatus === 'PENDING' ? 'text-dark' : ''
                                    }
                                  >
                                    {lab.verificationStatus || '—'}
                                  </Badge>
                                </div>
                              </td>
                              <td className="d-none d-md-table-cell text-nowrap">
                                <Badge bg="secondary" className="text-uppercase">
                                  {lab.role || '—'}
                                </Badge>
                              </td>
                              <td className="d-none d-lg-table-cell small text-break">
                                {skillsLine}
                              </td>
                              <td className="d-none d-sm-table-cell small text-nowrap">
                                {lab.mobile || '—'}
                              </td>
                              <td className="d-none d-md-table-cell">
                                <div className="d-flex flex-wrap gap-1">
                                  <Badge bg={lab.status === 'ACTIVE' ? 'success' : 'secondary'}>
                                    {lab.status || '—'}
                                  </Badge>
                                  <Badge
                                    bg={
                                      lab.verificationStatus === 'VERIFIED'
                                        ? 'success'
                                        : lab.verificationStatus === 'REJECTED'
                                          ? 'danger'
                                          : 'warning'
                                    }
                                    className={
                                      lab.verificationStatus === 'PENDING' ? 'text-dark' : ''
                                    }
                                  >
                                    {lab.verificationStatus || '—'}
                                  </Badge>
                                </div>
                              </td>
                              <td className="text-end">
                                <Button
                                  type="button"
                                  variant="outline-primary"
                                  size="sm"
                                  className="text-nowrap"
                                  onClick={() => setLabourProfileLab(lab)}
                                >
                                  <FaEye className="me-1 d-none d-sm-inline" aria-hidden />
                                  View profile
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Services Portfolio Section */}
      <Row className="mt-4">
        <Col xs={12}>
          <Card className="shadow-sm enterprise-services-card">
            <Card.Header className="bg-primary bg-opacity-10 border-0">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className="mb-0 fw-bold">
                    <FaTools className="me-3 text-primary" />
                    <span className="d-none d-sm-inline">Services Portfolio</span>
                    <span className="d-inline d-sm-none">Services</span>
                  </h4>
                  <p className="text-muted mb-0 mt-2 d-none d-md-block">
                    Manage your service categories and specializations
                  </p>
                </div>
                
                {!isEditingServices && (
                  <Button
                    variant="outline-primary"
                    onClick={handleEditServices}
                    className="d-flex align-items-center justify-content-center"
                  >
                    <FaEdit className="me-2" />
                    <span className="d-none d-sm-inline">Edit Services</span>
                    <span className="d-inline d-sm-none">Edit</span>
                  </Button>
                )}
              </div>
            </Card.Header>

            <Card.Body>
              {/* Error and Success Messages */}
              {servicesSuccess && (
                <Alert variant="success" className="mb-3">
                  <FaCheckCircle className="me-2" />
                  {servicesSuccess}
                </Alert>
              )}

              {!isEditingServices ? (
                /* Display Mode */
                <div className="services-display">
                  {Object.keys(servicesOffered).length === 0 ? (
                    <div className="text-center py-5">
                      <FaTools className="text-muted mb-3" style={{ fontSize: '3rem' }} />
                      <p className="text-muted mb-3">No services configured yet</p>
                      <Button variant="primary" onClick={handleEditServices}>
                        <FaPlus className="me-2" />
                        Add Services
                      </Button>
                    </div>
                  ) : (
                    <Row>
                      {Object.entries(servicesOffered).map(([category, items]) => (
                        <Col lg={6} xl={4} key={category} className="mb-4">
                          <div className="enterprise-service-category-card h-100 p-4">
                            <div className="d-flex align-items-center mb-3">
                              <div className="enterprise-service-icon-large text-primary me-3">
                                <FaTools />
                              </div>
                              <div>
                                <h5 className="fw-bold mb-1 text-primary">{category}</h5>
                                <small className="text-muted">{items.length} specialization{items.length !== 1 ? 's' : ''}</small>
                              </div>
                            </div>
                            
                            <div className="enterprise-service-subservices">
                              {items.map((item, idx) => (
                                <Badge 
                                  key={idx} 
                                  bg="light" 
                                  text="dark" 
                                  className="enterprise-service-badge me-2 mb-2"
                                >
                                  {item}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              ) : (
                /* Edit Mode */
                <div className="enterprise-services-edit">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="mb-0">Edit Services Portfolio</h5>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={handleAddServiceRow}
                      className="d-flex align-items-center"
                    >
                      <FaPlus className="me-1" />
                      Add Service
                    </Button>
                  </div>

                  {serviceSelections.map((row, idx) => {
                    const availableServices = getAvailableServicesForIndex(idx);
                    const selectedService = services.find(s => s.name === row.serviceName);
                    const availableSubServices = selectedService?.subCategories || [];

                    return (
                      <div key={idx} className="enterprise-service-edit-row mb-4 p-3 border rounded">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h6 className="mb-0">Service Category {idx + 1}</h6>
                          {serviceSelections.length > 1 && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleRemoveServiceRow(idx)}
                            >
                              <FaTrash />
                            </Button>
                          )}
                        </div>

                        <Row>
                          <Col md={6} className="mb-3">
                            <Form.Group>
                              <Form.Label className="fw-semibold">Service Category *</Form.Label>
                              <Select
                                value={row.serviceName ? { value: row.serviceName, label: row.serviceName } : null}
                                onChange={(option) => handleServiceChange(idx, option?.value || '')}
                                options={availableServices.map(s => ({ value: s.name, label: s.name }))}
                                placeholder="Select a service category..."
                                isClearable
                                className="enterprise-service-select"
                                classNamePrefix="select"
                              />
                            </Form.Group>
                          </Col>
                          
                          <Col md={6} className="mb-3">
                            <Form.Group>
                              <Form.Label className="fw-semibold">Specializations *</Form.Label>
                              <Select
                                isMulti
                                value={row.subServices.map(ss => ({ value: ss, label: ss }))}
                                onChange={(options) => handleSubServicesChange(idx, options)}
                                options={[
                                  { value: 'all', label: 'Select All' },
                                  ...availableSubServices.map(ss => ({ value: ss, label: ss }))
                                ]}
                                placeholder={row.serviceName ? "Select specializations..." : "First select a service category"}
                                isDisabled={!row.serviceName}
                                className="enterprise-service-select"
                                classNamePrefix="select"
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </div>
                    );
                  })}

                  {/* Action Buttons */}
                  <div className="mt-4">
                    {servicesError && (
                      <Alert variant="danger" className="mb-3">
                        <FaTimesCircle className="me-2" />
                        {servicesError}
                      </Alert>
                    )}

                    <div className="d-flex justify-content-end gap-3">
                    <Button
                      variant="outline-secondary"
                      onClick={handleCancelEditServices}
                      disabled={isSavingServices}
                      className="d-flex align-items-center justify-content-center"
                    >
                      <FaTimesCircle className="me-2" />
                      Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSaveServices}
                      disabled={isSavingServices || serviceSelections.every(row => !row.serviceName || row.subServices.length === 0)}
                      className="d-flex align-items-center justify-content-center"
                    >
                      {isSavingServices ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <FaCheckCircle className="me-2" />
                          Save Services
                        </>
                      )}
                    </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Call Now Modal */}
      <CallNowModal
        show={showCallModal}
        onHide={() => setShowCallModal(false)}
        primaryNumber={primaryNumber}
        alternateNumbers={alternateNumbers}
      />

      {/* Enterprise Details Modal */}
      <EnterpriseDetailsModal
        show={showDetailsModal}
        onHide={() => setShowDetailsModal(false)}
        enterprise={enterprise}
        enterpriseId={enterpriseId}
        onUpdate={handleEnterpriseUpdate}
      />

      <EnterpriseLabourOnboardModal
        show={showOnboardLabourModal}
        onHide={() => setShowOnboardLabourModal(false)}
        enterpriseId={dashboardEnterpriseId}
        token={dashboardEnterpriseToken}
        onSuccess={handleEnterpriseLabourOnboardSuccess}
      />

      <EnterpriseLabourProfileModal
        show={Boolean(labourProfileLab)}
        labour={labourProfileLab}
        onHide={() => setLabourProfileLab(null)}
      />
    </Container>
  );
}

export default EnterpriseDashboard;