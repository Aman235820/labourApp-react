import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Modal, Button, Form, Alert, Spinner, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import { FaUserPlus, FaCheckCircle, FaTimesCircle, FaTools } from 'react-icons/fa';
import { enterpriseService } from '../services/enterpriseService';
import {
  getStoredEnterpriseSession,
  readEnterpriseServicesOfferedFromStorage,
  flattenSubServiceLabelsFromServicesOffered,
} from '../utils/enterpriseSession';
import '../styles/EnterpriseLabourOnboardModal.css';
import { useTranslation } from 'react-i18next';

function formatDashboardDateTime(d = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const day = pad(d.getDate());
  const month = pad(d.getMonth() + 1);
  const year = d.getFullYear();
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${day}-${month}-${year} ${h}:${m}:${s}`;
}

const ENTERPRISE_MONGO_ID = /^[0-9a-fA-F]{24}$/;
const MOBILE_10_DIGITS = /^\d{10}$/;
/** Letters only; allows spaces, hyphen, apostrophe, period for names like O'Brien, Anne-Marie. */
const FULL_NAME_PATTERN = /^[a-zA-Z\s\-'.]+$/;

function sanitizeMobileDigits(value) {
  return String(value ?? '').replace(/\D/g, '').slice(0, 10);
}

function sanitizeFullNameLetters(value) {
  return String(value ?? '').replace(/[^a-zA-Z\s\-'.]/g, '');
}

const emptyForm = () => ({
  fullName: '',
  mobile: '',
  alternateMobile: '',
  email: '',
  role: 'SUPERVISOR',
  primarySkills: [],
  location: '',
  emergencyContactMobile: '',
  profileImageUrl: '',
  idDocumentUrl: '',
  notes: '',
  status: 'ACTIVE',
  verificationStatus: 'PENDING',
  adminComments: '',
});

/**
 * enterpriseId / token: optional props; if missing, both are read from
 * localStorage `enterprise` via getStoredEnterpriseSession().
 */
function EnterpriseLabourOnboardModal({
  show,
  onHide,
  enterpriseId: enterpriseIdProp,
  token: tokenProp,
  onSuccess,
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const errorAlertRef = useRef(null);

  const servicesOfferedMap = useMemo(
    () => (show ? readEnterpriseServicesOfferedFromStorage() : {}),
    [show]
  );

  const subServiceOptions = useMemo(() => {
    const labels = flattenSubServiceLabelsFromServicesOffered(servicesOfferedMap);
    return labels.map((s) => ({ value: s, label: s }));
  }, [servicesOfferedMap]);

  const primarySkillSelectOptions = useMemo(
    () => [
      { value: 'all', label: t('enterpriseLabourOnboard.selectAllLabel') },
      ...subServiceOptions,
    ],
    [subServiceOptions, t]
  );

  useEffect(() => {
    if (show) {
      setError('');
      setSuccess('');
      setForm(emptyForm());
    }
  }, [show, enterpriseIdProp]);

  useEffect(() => {
    if (!error || !errorAlertRef.current) return;
    const rafId = requestAnimationFrame(() => {
      errorAlertRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    });
    return () => cancelAnimationFrame(rafId);
  }, [error]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleMobileChange = (field, value) => {
    handleChange(field, sanitizeMobileDigits(value));
  };

  const handleFullNameChange = (value) => {
    handleChange('fullName', sanitizeFullNameLetters(value));
  };

  const handlePrimarySkillsChange = (selected) => {
    setError('');
    if (!selected || selected.length === 0) {
      setForm((prev) => ({ ...prev, primarySkills: [] }));
      return;
    }
    if (selected.some((o) => o.value === 'all')) {
      const allVals = subServiceOptions.map((o) => o.value);
      setForm((prev) => ({ ...prev, primarySkills: allVals }));
      return;
    }
    setForm((prev) => ({
      ...prev,
      primarySkills: selected.map((o) => o.value).filter((v) => v && v !== 'all'),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const stored = getStoredEnterpriseSession();
    const effectiveEnterpriseId =
      enterpriseIdProp && ENTERPRISE_MONGO_ID.test(String(enterpriseIdProp).trim())
        ? String(enterpriseIdProp).trim()
        : stored.enterpriseId;
    const effectiveToken =
      (tokenProp && String(tokenProp).trim()) || stored.token;

    if (!effectiveEnterpriseId) {
      setError(t('enterpriseLabourOnboard.errEnterpriseId'));
      return;
    }
    if (!effectiveToken) {
      setError(t('enterpriseLabourOnboard.errSession'));
      return;
    }
    const fullName = String(form.fullName || '').trim();
    const mobile = sanitizeMobileDigits(form.mobile);
    const primarySkills = Array.isArray(form.primarySkills)
      ? form.primarySkills.map((s) => String(s || '').trim()).filter(Boolean)
      : [];
    const location = String(form.location || '').trim();
    const alternateMobile = sanitizeMobileDigits(form.alternateMobile);
    const emergencyContactMobile = sanitizeMobileDigits(form.emergencyContactMobile);

    if (!fullName) {
      setError(t('enterpriseLabourOnboard.errFullNameRequired'));
      return;
    }
    if (!FULL_NAME_PATTERN.test(fullName) || !/[a-zA-Z]/.test(fullName)) {
      setError(t('enterpriseLabourOnboard.errFullNamePattern'));
      return;
    }
    if (!MOBILE_10_DIGITS.test(mobile)) {
      setError(t('enterpriseLabourOnboard.errMobile'));
      return;
    }
    if (alternateMobile && !MOBILE_10_DIGITS.test(alternateMobile)) {
      setError(t('enterpriseLabourOnboard.errAlternateMobile'));
      return;
    }
    if (emergencyContactMobile && !MOBILE_10_DIGITS.test(emergencyContactMobile)) {
      setError(t('enterpriseLabourOnboard.errEmergencyMobile'));
      return;
    }
    if (primarySkills.length === 0) {
      setError(t('enterpriseLabourOnboard.errPrimarySkills'));
      return;
    }
    if (!location) {
      setError(t('enterpriseLabourOnboard.errLocation'));
      return;
    }

    const nowStamp = formatDashboardDateTime();

    const payload = {
      enterpriseLabourId: null,
      enterpriseId: String(effectiveEnterpriseId),
      fullName,
      mobile,
      alternateMobile: alternateMobile,
      email: String(form.email || '').trim(),
      role: form.role || 'SUPERVISOR',
      primarySkill: JSON.stringify(primarySkills),
      location,
      emergencyContactMobile: emergencyContactMobile,
      profileImageUrl: String(form.profileImageUrl || '').trim(),
      idDocumentUrl: String(form.idDocumentUrl || '').trim(),
      notes: String(form.notes || '').trim(),
      status: form.status || 'ACTIVE',
      verificationStatus: form.verificationStatus || 'PENDING',
      joinedAt: nowStamp,
      adminComments: String(form.adminComments || '').trim(),
      registrationTime: nowStamp,
    };

    setSubmitting(true);
    try {
      const data = await enterpriseService.enterpriseLabourOnboarding(
        payload,
        effectiveToken
      );
      const rv = data?.returnValue;
      setSuccess(data?.message || t('enterpriseLabourOnboard.successDefault'));
      if (typeof onSuccess === 'function') {
        const merged =
          rv && typeof rv === 'object' ? { ...payload, ...rv } : { ...payload };
        onSuccess(merged);
      }
      setTimeout(() => {
        onHide();
      }, 900);
    } catch (err) {
      const msg =
        err?.message ||
        err?.response?.data?.message ||
        (err?.hasError && err?.message) ||
        t('enterpriseLabourOnboard.errOnboardFailed');
      setError(typeof msg === 'string' ? msg : String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      backdrop="static"
      className="enterprise-labour-onboard-modal"
      dialogClassName="enterprise-labour-onboard-dialog"
      contentClassName="enterprise-labour-onboard-content"
      enforceFocus={false}
    >
      <Modal.Header closeButton className="enterprise-labour-onboard-header border-bottom">
        <Modal.Title className="d-flex align-items-center gap-2 fs-5">
          <FaUserPlus className="text-success flex-shrink-0" />
          <span>{t('enterpriseLabourOnboard.title')}</span>
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit} className="enterprise-labour-onboard-form d-flex flex-column flex-grow-1">
        <Modal.Body className="enterprise-labour-onboard-body">
          <p className="text-muted enterprise-labour-onboard-lead mb-3 mb-md-4">
            {t('enterpriseLabourOnboard.lead')}
          </p>

          {error ? (
            <div ref={errorAlertRef} className="enterprise-labour-onboard-error-anchor">
              <Alert variant="danger" className="py-3 enterprise-labour-onboard-alert mb-0">
                <FaTimesCircle className="me-2 flex-shrink-0" />
                {error}
              </Alert>
            </div>
          ) : null}
          {success ? (
            <Alert variant="success" className="py-3 enterprise-labour-onboard-alert">
              <FaCheckCircle className="me-2 flex-shrink-0" />
              {success}
            </Alert>
          ) : null}

          <Row className="g-3 g-md-4 enterprise-labour-onboard-fields">
            <Col xs={12} md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold enterprise-labour-onboard-label">{t('enterpriseLabourOnboard.fullName')}</Form.Label>
                <Form.Control
                  className="enterprise-labour-onboard-input"
                  value={form.fullName}
                  onChange={(e) => handleFullNameChange(e.target.value)}
                  placeholder={t('enterpriseLabourOnboard.fullNamePh')}
                  autoComplete="name"
                />
                <Form.Text className="text-muted">{t('enterpriseLabourOnboard.fullNameHint')}</Form.Text>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold enterprise-labour-onboard-label">{t('enterpriseLabourOnboard.mobile')}</Form.Label>
                <Form.Control
                  className="enterprise-labour-onboard-input"
                  value={form.mobile}
                  onChange={(e) => handleMobileChange('mobile', e.target.value)}
                  placeholder="9876543210"
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                />
                <Form.Text className="text-muted">{t('enterpriseLabourOnboard.mobileHint')}</Form.Text>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold enterprise-labour-onboard-label">{t('enterpriseLabourOnboard.alternateMobile')}</Form.Label>
                <Form.Control
                  className="enterprise-labour-onboard-input"
                  value={form.alternateMobile}
                  onChange={(e) => handleMobileChange('alternateMobile', e.target.value)}
                  placeholder={t('enterpriseLabourOnboard.alternatePh')}
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={10}
                />
                <Form.Text className="text-muted">{t('enterpriseLabourOnboard.alternateHint')}</Form.Text>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold enterprise-labour-onboard-label">{t('enterpriseLabourOnboard.email')}</Form.Label>
                <Form.Control
                  className="enterprise-labour-onboard-input"
                  type="email"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="ravi@example.com"
                  autoComplete="email"
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold enterprise-labour-onboard-label">{t('enterpriseLabourOnboard.role')}</Form.Label>
                <Form.Select
                  className="enterprise-labour-onboard-input"
                  value={form.role}
                  onChange={(e) => handleChange('role', e.target.value)}
                >
                  <option value="SUPERVISOR">SUPERVISOR</option>
                  <option value="FIELD_STAFF">FIELD_STAFF</option>
                  <option value="LABOUR">LABOUR</option>
                  <option value="TECHNICIAN">TECHNICIAN</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group className="mb-0 enterprise-labour-onboard-primary-skills">
                <Form.Label className="fw-semibold enterprise-labour-onboard-label d-flex align-items-center gap-2">
                  <FaTools className="text-success flex-shrink-0" aria-hidden />
                  {t('enterpriseLabourOnboard.primarySkills')}
                </Form.Label>
                {subServiceOptions.length === 0 ? (
                  <Alert variant="warning" className="py-2 small mb-2 mb-md-3">
                    {t('enterpriseLabourOnboard.noServicesWarning')}
                  </Alert>
                ) : (
                  <Select
                    isMulti
                    inputId="enterprise-onboard-primary-skills"
                    options={primarySkillSelectOptions}
                    value={form.primarySkills.map((s) => ({ value: s, label: s }))}
                    onChange={handlePrimarySkillsChange}
                    classNamePrefix="select"
                    placeholder={t('enterpriseLabourOnboard.selectPlaceholder')}
                    className="enterprise-labour-onboard-primary-skills-select"
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      control: (base) => ({
                        ...base,
                        minHeight: '3rem',
                        borderRadius: '0.5rem',
                      }),
                    }}
                    closeMenuOnSelect={false}
                  />
                )}
                <Form.Text className="text-muted d-block mt-1">
                  {t('enterpriseLabourOnboard.skillsHint')}
                </Form.Text>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold enterprise-labour-onboard-label">{t('enterpriseLabourOnboard.location')}</Form.Label>
                <Form.Control
                  className="enterprise-labour-onboard-input"
                  value={form.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder={t('enterpriseLabourOnboard.locationPh')}
                  required
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold enterprise-labour-onboard-label">{t('enterpriseLabourOnboard.emergencyMobile')}</Form.Label>
                <Form.Control
                  className="enterprise-labour-onboard-input"
                  value={form.emergencyContactMobile}
                  onChange={(e) => handleMobileChange('emergencyContactMobile', e.target.value)}
                  placeholder={t('enterpriseLabourOnboard.alternatePh')}
                  inputMode="numeric"
                  maxLength={10}
                />
                <Form.Text className="text-muted">{t('enterpriseLabourOnboard.alternateHint')}</Form.Text>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold enterprise-labour-onboard-label">{t('enterpriseLabourOnboard.profileImageUrl')}</Form.Label>
                <Form.Control
                  className="enterprise-labour-onboard-input"
                  value={form.profileImageUrl}
                  onChange={(e) => handleChange('profileImageUrl', e.target.value)}
                  placeholder="https://..."
                  inputMode="url"
                />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold enterprise-labour-onboard-label">{t('enterpriseLabourOnboard.idDocumentUrl')}</Form.Label>
                <Form.Control
                  className="enterprise-labour-onboard-input"
                  value={form.idDocumentUrl}
                  onChange={(e) => handleChange('idDocumentUrl', e.target.value)}
                  placeholder="https://.../id.pdf"
                  inputMode="url"
                />
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold enterprise-labour-onboard-label">{t('enterpriseLabourOnboard.notes')}</Form.Label>
                <Form.Control
                  className="enterprise-labour-onboard-input enterprise-labour-onboard-textarea"
                  as="textarea"
                  rows={3}
                  value={form.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder={t('enterpriseLabourOnboard.notesPh')}
                />
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold enterprise-labour-onboard-label">{t('enterpriseLabourOnboard.status')}</Form.Label>
                <Form.Select
                  className="enterprise-labour-onboard-input"
                  value={form.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12} md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold enterprise-labour-onboard-label">{t('enterpriseLabourOnboard.verification')}</Form.Label>
                <Form.Select
                  className="enterprise-labour-onboard-input"
                  value={form.verificationStatus}
                  onChange={(e) => handleChange('verificationStatus', e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="REJECTED">REJECTED</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col xs={12}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-semibold enterprise-labour-onboard-label">{t('enterpriseLabourOnboard.adminComments')}</Form.Label>
                <Form.Control
                  className="enterprise-labour-onboard-input"
                  value={form.adminComments}
                  onChange={(e) => handleChange('adminComments', e.target.value)}
                  placeholder={t('enterpriseLabourOnboard.optionalPh')}
                />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="enterprise-labour-onboard-footer border-top flex-column flex-sm-row gap-2 gap-sm-3">
          <Button
            variant="outline-secondary"
            className="enterprise-labour-onboard-footer-btn order-2 order-sm-1"
            onClick={onHide}
            disabled={submitting}
          >
            {t('enterpriseLabourOnboard.cancel')}
          </Button>
          <Button
            variant="success"
            type="submit"
            className="enterprise-labour-onboard-footer-btn order-1 order-sm-2 flex-sm-grow-0 flex-grow-1"
            disabled={submitting || subServiceOptions.length === 0}
          >
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {t('enterpriseLabourOnboard.submitting')}
              </>
            ) : (
              <>
                <FaUserPlus className="me-2" />
                {t('enterpriseLabourOnboard.submitOnboarding')}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default EnterpriseLabourOnboardModal;
