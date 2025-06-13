import React from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';
import { FaUser, FaTools, FaPhone, FaStar, FaMapMarkerAlt, FaRupeeSign, FaUserCircle } from 'react-icons/fa';
import '../styles/LabourDetailsModal.css';

function LabourDetailsModal({ show, handleClose, labour }) {
  if (!labour) return null;

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Labour Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col md={4} className="text-center mb-4">
            <div className="profile-container">
              {labour.profileImage ? (
                <img
                  src={labour.profileImage}
                  alt={labour.labourName}
                  className="profile-image"
                />
              ) : (
                <FaUserCircle className="profile-icon" />
              )}
            </div>
          </Col>
          <Col md={8}>
            <div className="details-container">
              <h2 className="mb-4">{labour.labourName}</h2>
              
              <div className="detail-item">
                <FaTools className="icon" />
                <span className="label">Skill:</span>
                <span className="value">{labour.labourSkill}</span>
              </div>

              <div className="detail-item">
                <FaPhone className="icon" />
                <span className="label">Phone:</span>
                <span className="value">{labour.labourMobileNo}</span>
              </div>

              <div className="detail-item">
                <FaStar className="icon" />
                <span className="label">Rating:</span>
                <span className="value">{labour.rating || 'No ratings yet'}</span>
              </div>

              <div className="detail-item">
                <FaMapMarkerAlt className="icon" />
                <span className="label">Location:</span>
                <span className="value">{labour.location || 'Not specified'}</span>
              </div>

              <div className="detail-item">
                <FaRupeeSign className="icon" />
                <span className="label">Rate:</span>
                <span className="value">{labour.rate || 'Not specified'}</span>
              </div>

              {labour.description && (
                <div className="description-section mt-4">
                  <h4>About</h4>
                  <p>{labour.description}</p>
                </div>
              )}
            </div>
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={() => window.location.href = `tel:${labour.labourMobileNo}`}>
          Contact Now
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LabourDetailsModal; 