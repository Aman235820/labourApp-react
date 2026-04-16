import React from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { FaUsers, FaMapMarkerAlt, FaShieldAlt, FaIdCard } from 'react-icons/fa';
import '../styles/EnterpriseLabourProfileModal.css';
import { parseLabourPrimarySkillsArray } from '../utils/enterpriseSession';
import { useTranslation } from 'react-i18next';

function DetailRow({ label, children, empty }) {
  if (empty && (children == null || children === '')) return null;
  return (
    <div className="enterprise-labour-profile-row">
      <dt className="enterprise-labour-profile-label">{label}</dt>
      <dd className="enterprise-labour-profile-value text-break">{children ?? '—'}</dd>
    </div>
  );
}

/**
 * Full labour profile for enterprise dashboard (opened from compact list rows).
 */
function EnterpriseLabourProfileModal({ show, onHide, labour }) {
  const { t } = useTranslation();
  if (!labour) return null;

  const imgUrl = String(labour.profileImageUrl || '').trim();
  const primarySkillLabels = parseLabourPrimarySkillsArray(labour);

  return (
    <Modal
      show={show}
      onHide={onHide}
      centered
      scrollable
      fullscreen="sm-down"
      className="enterprise-labour-profile-modal"
      contentClassName="enterprise-labour-profile-modal-content"
    >
      <Modal.Header closeButton className="enterprise-labour-profile-modal-header border-0">
        <Modal.Title className="h5 mb-0 text-break pe-2">
          {labour.fullName || t('enterpriseLabourProfile.titleFallback')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="enterprise-labour-profile-modal-body pt-0">
        <div className="d-flex flex-wrap gap-3 mb-3 align-items-start enterprise-labour-profile-hero">
          <div className="enterprise-labour-profile-avatar flex-shrink-0">
            {imgUrl ? (
              <img
                src={imgUrl}
                alt=""
                className="enterprise-labour-profile-avatar-img"
                loading="lazy"
                decoding="async"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="enterprise-labour-profile-avatar-placeholder" aria-hidden>
                <FaUsers />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-grow-1">
            <div className="d-flex flex-wrap gap-2 mb-2">
              <Badge bg="dark" className="text-uppercase">
                {labour.role || '—'}
              </Badge>
              <Badge bg={labour.status === 'ACTIVE' ? 'success' : 'secondary'}>
                {labour.status || '—'}
              </Badge>
              <Badge
                bg={
                  labour.verificationStatus === 'VERIFIED'
                    ? 'success'
                    : labour.verificationStatus === 'REJECTED'
                      ? 'danger'
                      : 'warning'
                }
                className={labour.verificationStatus === 'PENDING' ? 'text-dark' : ''}
              >
                {labour.verificationStatus || '—'}
              </Badge>
            </div>
          </div>
        </div>

        <section
          className="enterprise-labour-profile-primary-skills mb-3"
          aria-labelledby="enterprise-labour-profile-skills-heading"
        >
          <h3
            id="enterprise-labour-profile-skills-heading"
            className="enterprise-labour-profile-primary-skills-heading"
          >
            <FaIdCard className="enterprise-labour-profile-primary-skills-heading-icon" aria-hidden />
            {t('enterpriseLabourProfile.primarySkills')}
          </h3>
          {primarySkillLabels.length > 0 ? (
            <ul
              className="enterprise-labour-profile-primary-skills-list list-unstyled mb-0"
              role="list"
            >
              {primarySkillLabels.map((skill, idx) => (
                <li key={`${idx}-${skill}`} className="enterprise-labour-profile-primary-skills-item">
                  <Badge
                    pill
                    bg="light"
                    text="dark"
                    className="enterprise-labour-profile-skill-pill"
                  >
                    {skill}
                  </Badge>
                </li>
              ))}
            </ul>
          ) : (
            <p className="enterprise-labour-profile-primary-skills-empty text-muted small mb-0">—</p>
          )}
        </section>

        <dl className="enterprise-labour-profile-dl mb-0">
          <DetailRow label={t('enterpriseLabourProfile.mobile')}>
            {labour.mobile || '—'}
            {labour.alternateMobile ? (
              <span className="d-block text-muted small mt-1">
                {t('enterpriseLabourProfile.altPrefix')} {labour.alternateMobile}
              </span>
            ) : null}
          </DetailRow>
          <DetailRow label={t('enterpriseLabourProfile.email')} empty>
            {labour.email}
          </DetailRow>
          <DetailRow label={t('enterpriseLabourProfile.location')}>
            <span className="d-inline-flex align-items-start gap-1">
              <FaMapMarkerAlt className="text-primary mt-1 flex-shrink-0" />
              {labour.location || '—'}
            </span>
          </DetailRow>
          <DetailRow label={t('enterpriseLabourProfile.emergencyContact')} empty>
            {labour.emergencyContactMobile ? (
              <span className="d-inline-flex align-items-center gap-1">
                <FaShieldAlt className="text-warning" />
                {labour.emergencyContactMobile}
              </span>
            ) : null}
          </DetailRow>
          <DetailRow label={t('enterpriseLabourProfile.enterpriseLabourId')}>
            {labour.enterpriseLabourId != null ? String(labour.enterpriseLabourId) : '—'}
          </DetailRow>
          <DetailRow label={t('enterpriseLabourProfile.enterpriseId')} empty>
            {labour.enterpriseId}
          </DetailRow>
          <DetailRow label={t('enterpriseLabourProfile.joined')}>{labour.joinedAt || '—'}</DetailRow>
          <DetailRow label={t('enterpriseLabourProfile.registered')}>{labour.registrationTime || '—'}</DetailRow>
          <DetailRow label={t('enterpriseLabourProfile.notes')} empty>
            {labour.notes ? (
              <span className="fst-italic text-muted">{labour.notes}</span>
            ) : null}
          </DetailRow>
          <DetailRow label={t('enterpriseLabourProfile.adminComments')} empty>
            {labour.adminComments}
          </DetailRow>
        </dl>

        {(labour.profileImageUrl || labour.idDocumentUrl) && (
          <div className="d-flex flex-wrap gap-2 mt-3 pt-3 border-top">
            {labour.profileImageUrl ? (
              <Button
                size="sm"
                variant="outline-primary"
                href={labour.profileImageUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('enterpriseLabourProfile.openProfileImage')}
              </Button>
            ) : null}
            {labour.idDocumentUrl ? (
              <Button
                size="sm"
                variant="outline-secondary"
                href={labour.idDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t('enterpriseLabourProfile.openIdDocument')}
              </Button>
            ) : null}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0 enterprise-labour-profile-modal-footer">
        <Button variant="primary" className="w-100" onClick={onHide}>
          {t('enterpriseLabourProfile.close')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EnterpriseLabourProfileModal;
