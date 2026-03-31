import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  Alert,
  Modal,
} from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  FaArrowLeft,
  FaBuilding,
  FaPhone,
  FaMapMarkerAlt,
  FaStar,
  FaUser,
  FaIdCard,
  FaFileAlt,
  FaShieldAlt,
  FaLink,
  FaClock,
  FaCheckCircle,
  FaWhatsapp,
  FaUsers,
  FaCommentAlt,
} from 'react-icons/fa';
import { enterpriseService } from '../services/enterpriseService';
import { getRowMainServiceCategory } from '../utils/searchCategoryResult';
import '../styles/EnterprisePublicProfilePage.css';

const mongoIdPattern = /^[0-9a-fA-F]{24}$/;

const verificationBadgeProps = (status) => {
  const s = String(status || '').toUpperCase();
  if (s === 'VERIFIED' || s === 'APPROVED') return { bg: 'success', label: s };
  if (s === 'PENDING') return { bg: 'warning', className: 'text-dark', label: s };
  if (s === 'REJECTED' || s === 'DECLINED') return { bg: 'danger', label: s };
  return { bg: 'secondary', label: s || '—' };
};

const digitsOnly = (s) => String(s ?? '').replace(/\D/g, '');

/** WhatsApp click-to-chat; 10-digit IN numbers default to +91 */
const waMeUrl = (phone) => {
  const d = digitsOnly(phone);
  if (!d) return '';
  const intl = d.length === 10 ? `91${d}` : d;
  return `https://wa.me/${intl}`;
};

const formatUpdatedAt = (ms) => {
  if (ms == null || ms === '') return '';
  const n = Number(ms);
  if (!Number.isFinite(n)) return '';
  try {
    return new Date(n).toLocaleString();
  } catch {
    return '';
  }
};

const ExternalDoc = ({ href, children }) => {
  const u = String(href || '').trim();
  if (!u) {
    return <span className="text-muted">—</span>;
  }
  return (
    <a href={u} target="_blank" rel="noopener noreferrer" className="text-break">
      {children || u}
    </a>
  );
};

const ContactPhoneRow = ({ label, phone, t }) => {
  const trimmed = String(phone || '').trim();
  const wa = waMeUrl(trimmed);

  return (
    <div className="epp-contact-row">
      <div className="epp-contact-row-main">
        <div className="small text-muted mb-1">{label}</div>
        {trimmed ? (
          <span className="fw-semibold text-break d-block">{trimmed}</span>
        ) : (
          <span className="text-muted">—</span>
        )}
      </div>
      {trimmed ? (
        <div className="epp-contact-actions flex-shrink-0">
          <Button
            size="sm"
            variant="success"
            className="epp-action-chip"
            href={`tel:${trimmed}`}
          >
            <FaPhone className="me-1" />
            {t('common.callNow', { defaultValue: 'Call now' })}
          </Button>
          <Button
            size="sm"
            className="epp-action-chip epp-whatsapp-btn"
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaWhatsapp className="me-1" />
            {t('enterprisePublic.whatsapp', { defaultValue: 'WhatsApp' })}
          </Button>
        </div>
      ) : null}
    </div>
  );
};

const normalizeReviewItem = (r, index) => {
  if (!r || typeof r !== 'object') return null;
  const rating = Number(r.rating);
  const text = r.review ?? r.comment ?? r.reviewText ?? '';
  const time = r.reviewTime ?? r.createdAt ?? r.time ?? '';
  const name =
    r.customerName ??
    r.userName ??
    r.reviewerName ??
    (r.userId != null ? `User ${r.userId}` : null) ??
    `Review ${index + 1}`;
  return {
    id: r.id ?? r._id ?? index,
    name: String(name),
    rating: Number.isFinite(rating) ? rating : 0,
    text: String(text || ''),
    time: String(time || ''),
  };
};

const EnterprisePublicProfilePage = () => {
  const { enterpriseId: enterpriseIdParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [enterprise, setEnterprise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const searchCategory = location.state?.searchCategory || '';

  const resolvedUrlId = useMemo(
    () => (enterpriseIdParam ? String(enterpriseIdParam).trim() : ''),
    [enterpriseIdParam]
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!resolvedUrlId || !mongoIdPattern.test(resolvedUrlId)) {
        setError(
          t('enterprisePublic.invalidId', {
            defaultValue: 'Invalid or missing enterprise profile link.',
          })
        );
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await enterpriseService.findEnterpriseById(resolvedUrlId);
        const rv = data?.returnValue;
        if (cancelled) return;
        if (!rv || typeof rv !== 'object') {
          setError(
            data?.message ||
              t('enterprisePublic.notFound', { defaultValue: 'Enterprise not found.' })
          );
          setEnterprise(null);
        } else {
          setEnterprise(rv);
        }
      } catch (err) {
        if (cancelled) return;
        const msg =
          err?.message ||
          err?.response?.data?.message ||
          t('enterprisePublic.loadFailed', {
            defaultValue: 'Could not load this profile. Please try again later.',
          });
        setError(typeof msg === 'string' ? msg : String(msg));
        setEnterprise(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [resolvedUrlId, t]);

  const loadReviews = useCallback(async () => {
    if (!resolvedUrlId || !mongoIdPattern.test(resolvedUrlId)) return;
    setReviewsLoading(true);
    try {
      const raw = await enterpriseService.getEnterpriseReviews(resolvedUrlId);
      const list = Array.isArray(raw)
        ? raw.map(normalizeReviewItem).filter(Boolean)
        : [];
      setReviews(list);
    } finally {
      setReviewsLoading(false);
    }
  }, [resolvedUrlId]);

  useEffect(() => {
    if (showReviewsModal) {
      loadReviews();
    }
  }, [showReviewsModal, loadReviews]);

  const mainCategory = enterprise
    ? getRowMainServiceCategory(enterprise, searchCategory)
    : '';

  const servicesEntries = useMemo(() => {
    const so = enterprise?.servicesOffered;
    if (!so || typeof so !== 'object') return [];
    return Object.entries(so).filter(([, subs]) => Array.isArray(subs) && subs.length);
  }, [enterprise]);

  const otherDocs = enterprise?.otherDocumentLinks;
  const otherPhones = Array.isArray(enterprise?.otherContactNumbers)
    ? enterprise.otherContactNumbers.filter((x) => String(x || '').trim())
    : [];

  const vProps = verificationBadgeProps(enterprise?.verificationStatus);
  const ratingNum = enterprise?.rating != null ? parseFloat(String(enterprise.rating)) : 0;
  const ratingDisplay = Number.isFinite(ratingNum) ? ratingNum.toFixed(1) : '0.0';

  const workforce =
    enterprise?.workforceSize != null && enterprise.workforceSize !== ''
      ? Number(enterprise.workforceSize)
      : null;
  const workforceDisplay =
    workforce != null && Number.isFinite(workforce) ? Math.round(workforce) : null;

  const updatedLabel = formatUpdatedAt(enterprise?.updatedAt);

  const renderStars = (rating) => {
    const n = Math.round(Math.min(5, Math.max(0, Number(rating) || 0)));
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} className={i < n ? 'text-warning' : 'text-muted'} size={14} />
    ));
  };

  if (loading) {
    return (
      <div className="enterprise-public-profile d-flex align-items-center justify-content-center py-5">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading…</span>
        </Spinner>
      </div>
    );
  }

  if (error || !enterprise) {
    return (
      <Container className="enterprise-public-profile py-4">
        <Button
          variant="outline-secondary"
          className="epp-back-btn mb-3"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="me-2" />
          {t('common.back', { defaultValue: 'Back' })}
        </Button>
        <Alert variant="danger">{error || t('enterprisePublic.notFound')}</Alert>
      </Container>
    );
  }

  const gstVal = (enterprise.gstNumber || '').trim();
  const gstHeroDisplay = gstVal || 'NA';

  return (
    <div className="enterprise-public-profile">
      <Container fluid="lg" className="px-3 px-md-4">
        <Button
          variant="light"
          className="epp-back-btn mb-3 shadow-sm border"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft className="me-2" />
          {t('common.back', { defaultValue: 'Back' })}
        </Button>

        <div className="epp-hero mb-4">
          <div className="epp-hero-inner">
            <Row className="align-items-center g-3">
              <Col xs="auto">
                <div className="epp-icon-wrap">
                  <FaBuilding size={28} className="text-white" />
                </div>
              </Col>
              <Col>
                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <Badge bg="light" className="text-dark fw-semibold">
                    {t('searchLabourModal.entityTypeEnterprise')}
                  </Badge>
                  <Badge bg={vProps.bg} className={vProps.className || ''}>
                    {vProps.label}
                  </Badge>
                  {workforceDisplay != null ? (
                    <Badge bg="dark" className="bg-opacity-25 text-white border border-white border-opacity-25">
                      <FaUsers className="me-1" />
                      {t('enterprisePublic.workforceSize', { defaultValue: 'Team' })}:{' '}
                      {workforceDisplay}
                    </Badge>
                  ) : null}
                </div>
                <h1 className="h3 fw-bold mb-1 text-white text-break">
                  {enterprise.companyName || '—'}
                </h1>
                <p className="mb-0 text-white-50 small text-break">
                  {mainCategory && mainCategory !== '—' ? mainCategory : null}
                  {mainCategory && mainCategory !== '—' ? ' · ' : null}
                  <span className="opacity-75 font-monospace">
                    {t('enterprisePublic.gstNumber', { defaultValue: 'GST number' })}: {gstHeroDisplay}
                  </span>
                </p>
              </Col>
              <Col xs={12} md="auto" className="text-md-end">
                <div className="d-flex flex-column flex-md-column align-items-stretch align-items-md-end gap-2">
                  <div className="d-inline-flex align-items-center gap-2 bg-white bg-opacity-10 rounded-3 px-3 py-2">
                    <FaStar className="text-warning" />
                    <div className="text-start text-md-end">
                      <div className="fw-bold fs-5 text-white">{ratingDisplay}</div>
                      <small className="text-white-50">
                        {enterprise.ratingCount || 0}{' '}
                        {t('enterprisePublic.reviews', { defaultValue: 'reviews' })}
                      </small>
                    </div>
                  </div>
                  <Button
                    variant="light"
                    size="sm"
                    className="fw-semibold shadow-sm"
                    onClick={() => setShowReviewsModal(true)}
                  >
                    <FaCommentAlt className="me-2 text-primary" />
                    {t('enterprisePublic.viewReviews', { defaultValue: 'View & read reviews' })}
                  </Button>
                </div>
              </Col>
            </Row>
          </div>
        </div>

        <Row className="g-3 mb-3">
          <Col md={6}>
            <Card className="epp-card h-100">
              <Card.Body>
                <div className="epp-section-title">
                  <FaUser className="me-1 opacity-75" />
                  {t('enterprisePublic.contact', { defaultValue: 'Contact' })}
                </div>
                {(enterprise.ownername || '').trim() ? (
                  <p className="mb-3 fw-medium text-break">{enterprise.ownername}</p>
                ) : null}

                <ContactPhoneRow
                  label={t('enterprisePublic.primaryPhone', { defaultValue: 'Primary contact' })}
                  phone={enterprise.ownerContactInfo}
                  t={t}
                />

                {otherPhones.map((num, idx) => (
                  <ContactPhoneRow
                    key={`${num}-${idx}`}
                    label={
                      otherPhones.length > 1
                        ? t('enterprisePublic.otherContactN', {
                            defaultValue: 'Other contact {{n}}',
                            n: idx + 1,
                          })
                        : t('enterprisePublic.secondaryPhone', {
                            defaultValue: 'Secondary contact',
                          })
                    }
                    phone={num}
                    t={t}
                  />
                ))}
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="epp-card h-100">
              <Card.Body>
                <div className="epp-section-title">
                  <FaMapMarkerAlt className="me-1 opacity-75" />
                  {t('enterprisePublic.location', { defaultValue: 'Location' })}
                </div>
                <p className="fw-medium mb-3 text-break">
                  {enterprise.location || <span className="text-muted fw-normal">—</span>}
                </p>

                {workforceDisplay != null ? (
                  <>
                    <div className="epp-section-title">
                      <FaUsers className="me-1 opacity-75" />
                      {t('enterprisePublic.workforceSize', { defaultValue: 'Workforce size' })}
                    </div>
                    <p className="mb-3 fw-semibold">{workforceDisplay}</p>
                  </>
                ) : null}

                <div className="epp-section-title">
                  <FaIdCard className="me-1 opacity-75" />
                  {t('enterprisePublic.gstNumber', { defaultValue: 'GST number' })}
                </div>
                <p className="mb-3 text-break font-monospace small">
                  {gstVal || (
                    <span className="text-muted font-sans-serif">{gstHeroDisplay}</span>
                  )}
                </p>

                <div className="d-flex align-items-center gap-2 text-muted small mb-1">
                  <FaClock />
                  <span>
                    {t('enterprisePublic.registered', { defaultValue: 'Registered' })}:{' '}
                    {enterprise.registrationTime || '—'}
                  </span>
                </div>
                {updatedLabel ? (
                  <div className="d-flex align-items-center gap-2 text-muted small">
                    <FaClock />
                    <span>
                      {t('enterprisePublic.lastUpdated', { defaultValue: 'Last updated' })}:{' '}
                      {updatedLabel}
                    </span>
                  </div>
                ) : null}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Card className="epp-card mb-3">
          <Card.Body>
            <div className="epp-section-title mb-3">
              <FaFileAlt className="me-1 opacity-75" />
              {t('searchLabourModal.servicesOffered')}
            </div>
            {servicesEntries.length === 0 ? (
              <p className="text-muted mb-0">—</p>
            ) : (
              <div className="epp-services-visible">
                {servicesEntries.map(([category, subs]) => (
                  <div key={category} className="epp-service-block mb-4">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                      <h3 className="h6 fw-bold text-primary mb-0">{category}</h3>
                      <Badge bg="primary" className="fw-normal">
                        {subs.length}{' '}
                        {t('enterprisePublic.subServices', { defaultValue: 'sub-services' })}
                      </Badge>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      {subs.map((s) => (
                        <span key={s} className="epp-pill">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>

        <Row className="g-3">
          <Col md={6}>
            <Card className="epp-card h-100">
              <Card.Body>
                <div className="epp-section-title mb-2">
                  <FaLink className="me-1 opacity-75" />
                  {t('enterprisePublic.registrationDoc', {
                    defaultValue: 'Registration certificate',
                  })}
                </div>
                <ExternalDoc href={enterprise.registrationCertificateLink}>
                  <FaLink className="me-1" />
                  {t('enterprisePublic.openLink', { defaultValue: 'Open link' })}
                </ExternalDoc>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="epp-card h-100">
              <Card.Body>
                <div className="epp-section-title mb-2">
                  <FaShieldAlt className="me-1 opacity-75" />
                  {t('enterprisePublic.otherDocuments', { defaultValue: 'Other documents' })}
                </div>
                <ul className="list-unstyled mb-0 small">
                  <li className="mb-2">
                    <span className="text-muted me-1">
                      {t('enterprisePublic.license', { defaultValue: 'License' })}:
                    </span>
                    <ExternalDoc href={otherDocs?.license} />
                  </li>
                  <li>
                    <span className="text-muted me-1">
                      {t('enterprisePublic.insurance', { defaultValue: 'Insurance' })}:
                    </span>
                    <ExternalDoc href={otherDocs?.insurance} />
                  </li>
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="text-center mt-4 pt-2">
          <FaCheckCircle className="text-success me-1 opacity-75" />
          <small className="text-muted">
            {t('enterprisePublic.readOnlyNotice', {
              defaultValue: 'This is a read-only business profile.',
            })}
          </small>
        </div>
      </Container>

      <Modal
        show={showReviewsModal}
        onHide={() => setShowReviewsModal(false)}
        centered
        scrollable
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaStar className="text-warning" />
            {t('enterprisePublic.reviewsTitle', {
              defaultValue: 'Customer reviews',
            })}
            <Badge bg="secondary" className="fw-normal">
              {enterprise.companyName}
            </Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reviewsLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" size="sm" />
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-muted mb-0 text-center py-3">
              {t('enterprisePublic.noReviewsYet', {
                defaultValue: 'No reviews yet, or reviews could not be loaded.',
              })}
            </p>
          ) : (
            <ul className="list-unstyled mb-0 epp-reviews-list">
              {reviews.map((rev) => (
                <li key={rev.id} className="epp-review-item border rounded-3 p-3 mb-3">
                  <div className="d-flex flex-wrap justify-content-between gap-2 mb-2">
                    <span className="fw-semibold">{rev.name}</span>
                    <div className="d-flex align-items-center gap-1">{renderStars(rev.rating)}</div>
                  </div>
                  {rev.time ? (
                    <div className="small text-muted mb-2">{rev.time}</div>
                  ) : null}
                  {rev.text ? (
                    <p className="mb-0 small text-break">{rev.text}</p>
                  ) : (
                    <p className="mb-0 small text-muted fst-italic">
                      {t('enterprisePublic.noReviewText', { defaultValue: 'No written feedback.' })}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReviewsModal(false)}>
            {t('labourList.close', { defaultValue: 'Close' })}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EnterprisePublicProfilePage;
