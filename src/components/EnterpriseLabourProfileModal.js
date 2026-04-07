import React from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { FaUsers, FaMapMarkerAlt, FaShieldAlt, FaIdCard } from 'react-icons/fa';
import '../styles/EnterpriseLabourProfileModal.css';
import { formatLabourPrimarySkillsDisplay } from '../utils/enterpriseSession';

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
  if (!labour) return null;

  const imgUrl = String(labour.profileImageUrl || '').trim();

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
          {labour.fullName || 'Labour profile'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="enterprise-labour-profile-modal-body pt-0">
        <div className="d-flex gap-3 mb-3 align-items-start">
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
            <p className="small text-muted mb-0 d-flex align-items-center gap-1">
              <FaIdCard className="flex-shrink-0" />
              {formatLabourPrimarySkillsDisplay(labour)}
            </p>
          </div>
        </div>

        <dl className="enterprise-labour-profile-dl mb-0">
          <DetailRow label="Mobile">
            {labour.mobile || '—'}
            {labour.alternateMobile ? (
              <span className="d-block text-muted small mt-1">
                Alt: {labour.alternateMobile}
              </span>
            ) : null}
          </DetailRow>
          <DetailRow label="Email" empty>
            {labour.email}
          </DetailRow>
          <DetailRow label="Location">
            <span className="d-inline-flex align-items-start gap-1">
              <FaMapMarkerAlt className="text-primary mt-1 flex-shrink-0" />
              {labour.location || '—'}
            </span>
          </DetailRow>
          <DetailRow label="Emergency contact" empty>
            {labour.emergencyContactMobile ? (
              <span className="d-inline-flex align-items-center gap-1">
                <FaShieldAlt className="text-warning" />
                {labour.emergencyContactMobile}
              </span>
            ) : null}
          </DetailRow>
          <DetailRow label="Enterprise labour ID">
            {labour.enterpriseLabourId != null ? String(labour.enterpriseLabourId) : '—'}
          </DetailRow>
          <DetailRow label="Enterprise ID" empty>
            {labour.enterpriseId}
          </DetailRow>
          <DetailRow label="Joined">{labour.joinedAt || '—'}</DetailRow>
          <DetailRow label="Registered">{labour.registrationTime || '—'}</DetailRow>
          <DetailRow label="Notes" empty>
            {labour.notes ? (
              <span className="fst-italic text-muted">{labour.notes}</span>
            ) : null}
          </DetailRow>
          <DetailRow label="Admin comments" empty>
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
                Open profile image
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
                Open ID document
              </Button>
            ) : null}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0 enterprise-labour-profile-modal-footer">
        <Button variant="primary" className="w-100" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default EnterpriseLabourProfileModal;
