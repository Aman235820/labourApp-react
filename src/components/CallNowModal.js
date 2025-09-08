import React from 'react';
import { Modal, Button, ListGroup, Badge } from 'react-bootstrap';
import { FaPhone, FaTimes, FaCopy, FaCheck } from 'react-icons/fa';
import { useState } from 'react';
import '../styles/CallNowModal.css';

function CallNowModal({ show, onHide, primaryNumber, alternateNumbers = [] }) {
  const [copiedNumber, setCopiedNumber] = useState(null);

  const handleCopyNumber = (number) => {
    navigator.clipboard.writeText(number).then(() => {
      setCopiedNumber(number);
      setTimeout(() => setCopiedNumber(null), 2000);
    });
  };

  const handleCall = (number) => {
    window.open(`tel:${number}`, '_self');
  };

  const formatPhoneNumber = (number) => {
    if (!number) return '';
    // Format as +91 XXXXX XXXXX for Indian numbers
    if (number.length === 10) {
      return `+91 ${number.slice(0, 5)} ${number.slice(5)}`;
    }
    return number;
  };

  return (
    <Modal show={show} onHide={onHide} centered size="md" className="call-now-modal">
      <Modal.Header className="bg-primary text-white">
        <Modal.Title className="d-flex align-items-center">
          <FaPhone className="me-2" />
          Contact Information
        </Modal.Title>
        <Button
          variant="link"
          onClick={onHide}
          className="text-white p-0 ms-auto"
          style={{ fontSize: '1.5rem' }}
        >
          <FaTimes />
        </Button>
      </Modal.Header>
      
      <Modal.Body className="p-4">
        <div className="text-center mb-4">
          <h5 className="text-muted">Choose a number to call</h5>
        </div>

        {/* Primary Number */}
        {primaryNumber && (
          <div className="mb-4">
            <div className="section-title">
              <Badge className="badge-primary">Primary</Badge>
              Primary Contact
            </div>
            <div className="primary-contact-card p-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="contact-number text-dark">{formatPhoneNumber(primaryNumber)}</div>
                  <div className="contact-label">Main contact number</div>
                </div>
                <div className="action-buttons">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => handleCopyNumber(primaryNumber)}
                    className={`btn-copy ${copiedNumber === primaryNumber ? 'copy-success' : ''}`}
                  >
                    {copiedNumber === primaryNumber ? (
                      <FaCheck className="text-success" />
                    ) : (
                      <FaCopy />
                    )}
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleCall(primaryNumber)}
                    className="btn-call"
                  >
                    <FaPhone className="me-1" />
                    Call
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alternate Numbers */}
        {alternateNumbers && alternateNumbers.length > 0 && (
          <div>
            <div className="section-title">
              <Badge className="badge-secondary">Alt</Badge>
              Alternate Numbers
            </div>
            <ListGroup variant="flush">
              {alternateNumbers.map((number, index) => (
                <ListGroup.Item key={index} className="border-0 px-0">
                  <div className="alternate-contact-card p-3 mb-2">
                    <div className="d-flex align-items-center justify-content-between">
                      <div>
                        <div className="contact-number text-dark">{formatPhoneNumber(number)}</div>
                        <div className="contact-label">Alternate contact {index + 1}</div>
                      </div>
                      <div className="action-buttons">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleCopyNumber(number)}
                          className={`btn-copy ${copiedNumber === number ? 'copy-success' : ''}`}
                        >
                          {copiedNumber === number ? (
                            <FaCheck className="text-success" />
                          ) : (
                            <FaCopy />
                          )}
                        </Button>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleCall(number)}
                          className="btn-call"
                        >
                          <FaPhone className="me-1" />
                          Call
                        </Button>
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}

        {/* No numbers available */}
        {!primaryNumber && (!alternateNumbers || alternateNumbers.length === 0) && (
          <div className="no-numbers-state">
            <FaPhone className="icon" style={{ fontSize: '3rem' }} />
            <p className="text-muted">No contact numbers available</p>
          </div>
        )}
      </Modal.Body>
      
      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default CallNowModal;
