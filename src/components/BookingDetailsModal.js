import React from 'react';
import { Modal, Button, Badge, Card, Row, Col } from 'react-bootstrap';
import { 
  FaTimesCircle, 
  FaClock, 
  FaCheckCircle, 
  FaUser, 
  FaUserTie, 
  FaPhone, 
  FaCalendarAlt, 
  FaTools, 
  FaClipboardList, 
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaFileAlt,
  FaCog,
  FaCheck
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

const BookingDetailsModal = ({ isOpen, toggle, booking }) => {
  const { t } = useTranslation();
  
  const getStatusBadge = (statusCode) => {
    switch (statusCode) {
      case -1:
        return <Badge bg="danger" className="px-3 py-2"><FaTimesCircle className="me-1" /> {t('bookingDetailsModal.rejected')}</Badge>;
      case 0:
        return <Badge bg="secondary" className="px-3 py-2"><FaClock className="me-1" /> {t('bookingDetailsModal.unknown')}</Badge>;
      case 1:
        return <Badge bg="warning" className="px-3 py-2"><FaClock className="me-1" /> {t('bookingDetailsModal.pending')}</Badge>;
      case 2:
        return <Badge bg="primary" className="px-3 py-2"><FaCheckCircle className="me-1" /> {t('bookingDetailsModal.accepted')}</Badge>;
      case 3:
        return <Badge bg="success" className="px-3 py-2"><FaCheck className="me-1" /> {t('bookingDetailsModal.completed')}</Badge>;
      default:
        return <Badge bg="secondary" className="px-3 py-2"><FaClock className="me-1" /> {t('bookingDetailsModal.unknown')}</Badge>;
    }
  };

  const getUrgencyBadge = (urgencyLevel) => {
    switch (urgencyLevel?.toLowerCase()) {
      case 'urgent':
        return <Badge bg="danger" className="px-2 py-1"><FaExclamationTriangle className="me-1" /> {t('bookingDetailsModal.urgent')}</Badge>;
      case 'high':
        return <Badge bg="warning" className="px-2 py-1"><FaExclamationTriangle className="me-1" /> {t('bookingDetailsModal.high')}</Badge>;
      case 'normal':
        return <Badge bg="info" className="px-2 py-1"><FaCog className="me-1" /> {t('bookingDetailsModal.normal')}</Badge>;
      case 'low':
        return <Badge bg="secondary" className="px-2 py-1"><FaClock className="me-1" /> {t('bookingDetailsModal.low')}</Badge>;
      default:
        return <Badge bg="secondary" className="px-2 py-1"><FaCog className="me-1" /> {t('bookingDetailsModal.notSpecified')}</Badge>;
    }
  };

  if (!booking) return null;

  return (
    <Modal show={isOpen} onHide={toggle} size="xl" centered className="booking-details-modal">
      <Modal.Header closeButton className="bg-light border-bottom">
        <div className="d-flex align-items-center">
          <div className="booking-icon me-3">
            <FaClipboardList className="text-primary" size={24} />
          </div>
          <div>
            <Modal.Title className="mb-0">{t('bookingDetailsModal.bookingDetails')}</Modal.Title>
            <small className="text-muted">ID: #{booking.bookingId}</small>
          </div>
        </div>
      </Modal.Header>
      <Modal.Body className="p-4">
        {/* Status and Overview Section */}
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0 text-primary">
                <FaClipboardList className="me-2" />
                {t('bookingDetailsModal.bookingOverview')}
              </h5>
              <div className="d-flex gap-2">
                {getStatusBadge(booking.bookingStatusCode)}
                {booking.urgencyLevel && getUrgencyBadge(booking.urgencyLevel)}
              </div>
            </div>
            <Row className="g-3">
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label text-muted">
                    <FaCalendarAlt className="me-2" />
                    {t('bookingDetailsModal.bookingTime')}
                  </label>
                  <div className="detail-value fw-medium">
                    {booking.bookingTime ? new Date(booking.bookingTime).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className="detail-item">
                  <label className="detail-label text-muted">
                    <FaTools className="me-2" />
                    {t('bookingDetailsModal.serviceType')}
                  </label>
                  <div className="detail-value">
                    <Badge bg="info" className="fs-6 px-3 py-2">
                      {booking.serviceName || booking.labourSkill || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </Col>
              {booking.preferredDate && (
                <Col md={6}>
                  <div className="detail-item">
                                      <label className="detail-label text-muted">
                    <FaCalendarAlt className="me-2" />
                    {t('bookingDetailsModal.preferredDate')}
                  </label>
                    <div className="detail-value fw-medium">{booking.preferredDate}</div>
                  </div>
                </Col>
              )}
              {booking.preferredTime && (
                <Col md={6}>
                  <div className="detail-item">
                                      <label className="detail-label text-muted">
                    <FaClock className="me-2" />
                    {t('bookingDetailsModal.preferredTime')}
                  </label>
                    <div className="detail-value fw-medium">{booking.preferredTime}</div>
                  </div>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>

        <Row className="g-4">
          {/* Customer Information */}
          <Col md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <h5 className="mb-3 text-primary border-bottom pb-2">
                  <FaUser className="me-2" />
                  {t('bookingDetailsModal.customerInformation')}
                </h5>
                <div className="detail-item mb-3">
                  <label className="detail-label text-muted">{t('bookingDetailsModal.customerName')}</label>
                  <div className="detail-value fw-bold">{booking.userName || 'N/A'}</div>
                </div>
                <div className="detail-item mb-3">
                  <label className="detail-label text-muted">
                    <FaPhone className="me-2" />
                    {t('bookingDetailsModal.mobileNumber')}
                  </label>
                  <div className="detail-value">
                    <Badge bg="info" className="px-3 py-2">
                      {booking.userMobileNumber || 'N/A'}
                    </Badge>
                  </div>
                </div>
                <div className="detail-item mb-3">
                  <label className="detail-label text-muted">{t('bookingDetailsModal.customerId')}</label>
                  <div className="detail-value">
                    <Badge bg="secondary" className="px-3 py-2">
                      #{booking.userId || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Service Provider Information */}
          <Col md={6}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <h5 className="mb-3 text-primary border-bottom pb-2">
                  <FaUserTie className="me-2" />
                  {t('bookingDetailsModal.serviceProviderInformation')}
                </h5>
                <div className="detail-item mb-3">
                  <label className="detail-label text-muted">{t('bookingDetailsModal.providerName')}</label>
                  <div className="detail-value fw-bold">{booking.labourName || 'N/A'}</div>
                </div>
                <div className="detail-item mb-3">
                  <label className="detail-label text-muted">
                    <FaPhone className="me-2" />
                    {t('bookingDetailsModal.mobileNumber')}
                  </label>
                  <div className="detail-value">
                    <Badge bg="info" className="px-3 py-2">
                      {booking.labourMobileNo || 'N/A'}
                    </Badge>
                  </div>
                </div>
                <div className="detail-item mb-3">
                  <label className="detail-label text-muted">{t('bookingDetailsModal.providerId')}</label>
                  <div className="detail-value">
                    <Badge bg="secondary" className="px-3 py-2">
                      #{booking.labourId || 'N/A'}
                    </Badge>
                  </div>
                </div>
                <div className="detail-item mb-3">
                  <label className="detail-label text-muted">
                    <FaTools className="me-2" />
                    {t('bookingDetailsModal.skillCategory')}
                  </label>
                  <div className="detail-value">
                    <Badge bg="success" className="px-3 py-2">
                      {booking.labourSkill || 'N/A'}
                    </Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Additional Details Section */}
        {(booking.workDescription || booking.urgencyLevel) && (
          <Card className="mt-4 border-0 shadow-sm">
            <Card.Body>
                              <h5 className="mb-3 text-primary border-bottom pb-2">
                  <FaFileAlt className="me-2" />
                  {t('bookingDetailsModal.additionalDetails')}
                </h5>
              <Row className="g-3">
                {booking.workDescription && (
                  <Col md={12}>
                    <div className="detail-item">
                      <label className="detail-label text-muted">{t('bookingDetailsModal.workDescription')}</label>
                      <div className="detail-value bg-light p-3 rounded border">
                        {booking.workDescription}
                      </div>
                    </div>
                  </Col>
                )}
                {booking.urgencyLevel && (
                  <Col md={6}>
                    <div className="detail-item">
                      <label className="detail-label text-muted">{t('bookingDetailsModal.urgencyLevel')}</label>
                      <div className="detail-value">
                        {getUrgencyBadge(booking.urgencyLevel)}
                      </div>
                    </div>
                  </Col>
                )}
                {booking.amount && (
                  <Col md={6}>
                    <div className="detail-item">
                      <label className="detail-label text-muted">{t('bookingDetailsModal.amount')}</label>
                      <div className="detail-value fw-bold text-success">
                        ₹{booking.amount}
                      </div>
                    </div>
                  </Col>
                )}
              </Row>
            </Card.Body>
          </Card>
        )}
      </Modal.Body>
      <Modal.Footer className="bg-light border-top">
        <Button variant="secondary" onClick={toggle} className="px-4">
          {t('bookingDetailsModal.close')}
        </Button>
      </Modal.Footer>
      <style>{`
        .booking-details-modal .modal-content {
          border-radius: 15px;
          border: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        .booking-details-modal .detail-item {
          margin-bottom: 1rem;
        }
        .booking-details-modal .detail-label {
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          display: block;
        }
        .booking-details-modal .detail-value {
          font-size: 0.95rem;
          color: #374151;
        }
        .booking-details-modal .booking-icon {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .booking-details-modal .modal-header {
          border-radius: 15px 15px 0 0;
        }
        .booking-details-modal .modal-footer {
          border-radius: 0 0 15px 15px;
        }
        .booking-details-modal .card {
          transition: all 0.2s ease;
        }
        .booking-details-modal .card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        .booking-details-modal .badge {
          font-weight: 500;
          letter-spacing: 0.5px;
        }
      `}</style>
    </Modal>
  );
};

export default BookingDetailsModal; 