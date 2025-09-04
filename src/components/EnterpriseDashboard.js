import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button } from 'react-bootstrap';
import { FaBuilding, FaUserTie, FaPhone, FaIdCard, FaUsers, FaMapMarkerAlt, FaShieldAlt, FaSignOutAlt, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

function EnterpriseDashboard() {
  const [enterprise, setEnterprise] = useState(null);
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
                    <h4 className="mb-1">{companyName}</h4>
                    <div className="d-flex align-items-center gap-3 text-muted">
                      <span className="d-inline-flex align-items-center"><FaUserTie className="me-1" />{ownername}</span>
                      <span className="d-inline-flex align-items-center"><FaMapMarkerAlt className="me-1" />{location}</span>
                    </div>
                  </div>
                </div>
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


