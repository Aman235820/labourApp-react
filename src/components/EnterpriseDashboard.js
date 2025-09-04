import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Form, Spinner } from 'react-bootstrap';
import { FaBuilding, FaUserTie, FaPhone, FaIdCard, FaUsers, FaMapMarkerAlt, FaShieldAlt, FaSignOutAlt, FaStar, FaEdit, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { enterpriseService } from '../services/enterpriseService';

function EnterpriseDashboard() {
  const [enterprise, setEnterprise] = useState(null);
  const [editingField, setEditingField] = useState(null); // 'companyName' | 'ownername' | 'location' | 'workforceSize' | 'servicesOffered'
  const [tempValues, setTempValues] = useState({});
  const [dirtyFields, setDirtyFields] = useState({});
  const [savingField, setSavingField] = useState(null);
  const [savingAll, setSavingAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = localStorage.getItem('enterprise');
      if (stored) {
        setEnterprise(JSON.parse(stored));
      }
    } catch (_) {}
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('enterprise');
    navigate('/');
  };

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
  const rating = ev.rating || ev.returnValue?.rating || '0.0';
  const ratingCount = ev.ratingCount || ev.returnValue?.ratingCount || '0';
  const verificationStatus = ev.verificationStatus || ev.returnValue?.verificationStatus || 'PENDING';
  const companyName = ev.companyName || ev.returnValue?.companyName || '';
  const ownername = ev.ownername || ev.returnValue?.ownername || '';
  const location = ev.location || ev.returnValue?.location || '';
  const workforceSize = ev.workforceSize || ev.returnValue?.workforceSize || 0;
  const gstNumber = ev.gstNumber || ev.returnValue?.gstNumber || '';
  const ownerContactInfo = ev.ownerContactInfo || ev.returnValue?.ownerContactInfo || '';
  const servicesOffered = ev.servicesOffered || ev.returnValue?.servicesOffered || {};
  const enterpriseId = ev._id || ev.id || ev.returnValue?._id || ev.returnValue?.id;
  const token = ev.token || ev.returnValue?.token || '';

  const getServicesSummary = () => {
    const keys = Object.keys(servicesOffered || {});
    if (keys.length === 0) return 'No services configured';
    const total = Object.values(servicesOffered).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0);
    return `${keys.length} categories, ${total} services`;
  };

  const startEdit = (fieldKey, initialValue) => {
    setEditingField(fieldKey);
    setTempValues(prev => ({ ...prev, [fieldKey]: initialValue }));
  };

  const handleTempChange = (fieldKey, value) => {
    setTempValues(prev => ({ ...prev, [fieldKey]: value }));
    setDirtyFields(prev => ({ ...prev, [fieldKey]: true }));
  };

  const persistField = async (fieldKey, value) => {
    if (!enterpriseId || !token) {
      // If not authenticated, send user to login
      navigate('/enterpriseLogin');
      return;
    }
    setSavingField(fieldKey);
    try {
      await enterpriseService.updateEnterpriseField(enterpriseId, fieldKey, value, token);
      const updatedEnterprise = { ...enterprise, [fieldKey]: value };
      setEnterprise(updatedEnterprise);
      localStorage.setItem('enterprise', JSON.stringify(updatedEnterprise));
      setDirtyFields(prev => ({ ...prev, [fieldKey]: false }));
    } catch (_) {
      // keep UI state; you can add toast here if desired
    } finally {
      setSavingField(null);
      setEditingField(null);
    }
  };

  const handleBlur = (fieldKey) => {
    if (tempValues[fieldKey] === undefined) return setEditingField(null);
    persistField(fieldKey, normalizeValue(fieldKey, tempValues[fieldKey]));
  };

  const handleKeyDown = (e, fieldKey) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      persistField(fieldKey, normalizeValue(fieldKey, tempValues[fieldKey]));
    } else if (e.key === 'Escape') {
      setEditingField(null);
    }
  };

  const normalizeValue = (fieldKey, value) => {
    if (fieldKey === 'workforceSize') {
      const n = parseInt(String(value || 0), 10);
      return isNaN(n) || n < 0 ? 0 : n;
    }
    if (fieldKey === 'servicesOffered') {
      // Accept JSON string -> object
      try {
        if (typeof value === 'string') return JSON.parse(value);
      } catch (_) {
        return servicesOffered; // ignore invalid
      }
    }
    return value;
  };

  const saveAll = async () => {
    if (!enterpriseId || !token) return navigate('/enterpriseLogin');
    const fields = Object.keys(dirtyFields).filter(k => dirtyFields[k]);
    if (fields.length === 0) return;
    setSavingAll(true);
    try {
      for (const f of fields) {
        const val = normalizeValue(f, tempValues[f]);
        await enterpriseService.updateEnterpriseField(enterpriseId, f, val, token);
        Object.assign(enterprise, { [f]: val });
      }
      setEnterprise({ ...enterprise });
      localStorage.setItem('enterprise', JSON.stringify({ ...enterprise }));
      setDirtyFields({});
      setEditingField(null);
    } finally {
      setSavingAll(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="g-3">
        <Col xs={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3">
                <div className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-primary d-flex align-items-center justify-content-center" style={{ width: 64, height: 64 }}>
                    <FaBuilding className="text-white" size={28} />
                  </div>
                  <div>
                    {/* Company Name */}
                    <div className="d-flex align-items-center gap-2">
                      {editingField === 'companyName' ? (
                        <Form.Control
                          size="sm"
                          type="text"
                          autoFocus
                          defaultValue={companyName}
                          onChange={(e) => handleTempChange('companyName', e.target.value)}
                          onBlur={() => handleBlur('companyName')}
                          onKeyDown={(e) => handleKeyDown(e, 'companyName')}
                          style={{ maxWidth: 320 }}
                        />
                      ) : (
                        <h4 className="mb-0">{companyName || 'Company Name'}</h4>
                      )}
                      {savingField === 'companyName' && <Spinner animation="border" size="sm" />}
                      <Button variant="link" className="p-0" onClick={() => startEdit('companyName', companyName)}>
                        <FaEdit />
                      </Button>
                    </div>

                    {/* Row of owner, location, workforce, services */}
                    <div className="d-flex align-items-center gap-3 text-muted mt-1 flex-wrap">
                      {/* Owner */}
                      <span className="d-inline-flex align-items-center">
                        <FaUserTie className="me-1" />
                        {editingField === 'ownername' ? (
                          <Form.Control
                            size="sm"
                            type="text"
                            defaultValue={ownername}
                            autoFocus
                            onChange={(e) => handleTempChange('ownername', e.target.value)}
                            onBlur={() => handleBlur('ownername')}
                            onKeyDown={(e) => handleKeyDown(e, 'ownername')}
                            style={{ width: 200 }}
                          />
                        ) : (
                          <span>{ownername || 'Owner name'}</span>
                        )}
                        <Button variant="link" className="p-0 ms-1" onClick={() => startEdit('ownername', ownername)}>
                          <FaEdit />
                        </Button>
                        {savingField === 'ownername' && <Spinner animation="border" size="sm" className="ms-1" />}
                      </span>

                      {/* Location */}
                      <span className="d-inline-flex align-items-center">
                        <FaMapMarkerAlt className="me-1" />
                        {editingField === 'location' ? (
                          <Form.Control
                            size="sm"
                            type="text"
                            defaultValue={location}
                            autoFocus
                            onChange={(e) => handleTempChange('location', e.target.value)}
                            onBlur={() => handleBlur('location')}
                            onKeyDown={(e) => handleKeyDown(e, 'location')}
                            style={{ width: 180 }}
                          />
                        ) : (
                          <span>{location || 'Location'}</span>
                        )}
                        <Button variant="link" className="p-0 ms-1" onClick={() => startEdit('location', location)}>
                          <FaEdit />
                        </Button>
                        {savingField === 'location' && <Spinner animation="border" size="sm" className="ms-1" />}
                      </span>

                      {/* Workforce Size */}
                      <span className="d-inline-flex align-items-center">
                        <FaUsers className="me-1" />
                        {editingField === 'workforceSize' ? (
                          <Form.Control
                            size="sm"
                            type="number"
                            min={0}
                            defaultValue={workforceSize}
                            autoFocus
                            onChange={(e) => handleTempChange('workforceSize', e.target.value)}
                            onBlur={() => handleBlur('workforceSize')}
                            onKeyDown={(e) => handleKeyDown(e, 'workforceSize')}
                            style={{ width: 120 }}
                          />
                        ) : (
                          <span>Workforce: {workforceSize}</span>
                        )}
                        <Button variant="link" className="p-0 ms-1" onClick={() => startEdit('workforceSize', workforceSize)}>
                          <FaEdit />
                        </Button>
                        {savingField === 'workforceSize' && <Spinner animation="border" size="sm" className="ms-1" />}
                      </span>

                      {/* Services summary (json edit in textarea) */}
                      <span className="d-inline-flex align-items-center">
                        <FaUsers className="me-1" style={{ visibility: 'hidden' }} />
                        {editingField === 'servicesOffered' ? (
                          <Form.Control
                            as="textarea"
                            rows={2}
                            defaultValue={JSON.stringify(servicesOffered, null, 0)}
                            autoFocus
                            onChange={(e) => handleTempChange('servicesOffered', e.target.value)}
                            onBlur={() => handleBlur('servicesOffered')}
                            onKeyDown={(e) => handleKeyDown(e, 'servicesOffered')}
                            style={{ width: 260 }}
                          />
                        ) : (
                          <span>{getServicesSummary()}</span>
                        )}
                        <Button variant="link" className="p-0 ms-1" onClick={() => startEdit('servicesOffered', JSON.stringify(servicesOffered))}>
                          <FaEdit />
                        </Button>
                        {savingField === 'servicesOffered' && <Spinner animation="border" size="sm" className="ms-1" />}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Save all button when there are unsaved changes */}
                {Object.values(dirtyFields).some(Boolean) && (
                  <div className="ms-auto">
                    <Button size="sm" variant="success" onClick={saveAll} disabled={savingAll}>
                      {savingAll ? <Spinner animation="border" size="sm" className="me-2" /> : <FaSave className="me-2" />}Save changes
                    </Button>
                  </div>
                )}
                <div className="d-flex align-items-center gap-2">
                  <Badge bg={verificationStatus === 'VERIFIED' ? 'success' : verificationStatus === 'REJECTED' ? 'danger' : 'warning'}>
                    <FaShieldAlt className="me-1" /> {verificationStatus}
                  </Badge>
                  <Badge bg="info" text="dark">
                    <FaStar className="me-1" /> {rating} ({ratingCount})
                  </Badge>
                  <Button variant="outline-danger" size="sm" onClick={handleLogout}>
                    <FaSignOutAlt className="me-1" /> Logout
                  </Button>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-3">Company Details</h5>
              <div className="mb-2 text-muted"><FaPhone className="me-2" />{ownerContactInfo}</div>
              <div className="mb-2 text-muted"><FaUsers className="me-2" />Workforce Size: {workforceSize}</div>
              <div className="mb-2 text-muted"><FaIdCard className="me-2" />GST: {gstNumber || 'N/A'}</div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <h5 className="mb-3">Services Offered</h5>
              {Object.keys(servicesOffered).length === 0 && (
                <p className="text-muted mb-0">No services configured.</p>
              )}
              {Object.entries(servicesOffered).map(([category, items]) => (
                <div key={category} className="mb-3">
                  <div className="fw-semibold">{category}</div>
                  <ul className="mb-0 ms-3">
                    {items.map((it, idx) => (
                      <li key={`${category}-${idx}`} className="text-muted">{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default EnterpriseDashboard;


