import React, { useState } from 'react';
import { Modal, Button, Row, Col } from 'react-bootstrap';
import { FaUserCircle, FaPhone, FaStar, FaChevronDown, FaChevronUp, FaUser } from 'react-icons/fa';

const LabourDetailsModal = ({ show, onHide, selectedLabour }) => {
  const [showReviews, setShowReviews] = useState(false);

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title>Labour Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {selectedLabour && (
          <div>
            <div className="text-center mb-4">
              <FaUserCircle size={80} className="text-primary mb-3" />
              <h3>{selectedLabour.labourName}</h3>
              <p className="text-muted">{selectedLabour.labourSkill}</p>
            </div>
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <h5>Rating</h5>
                  <p><FaStar className="text-warning me-2" /> {selectedLabour.rating || 'No ratings yet'}</p>
                </div>
              </Col>
            </Row>
            <div className="mt-4">
              <Button
                variant="primary"
                className="w-100"
                onClick={() => window.location.href = `tel:${selectedLabour.labourMobileNo}`}
              >
                <FaPhone className="me-2" />
                Call Now
              </Button>
            </div>

            {/* Reviews Section */}
            <div className="mt-4">
              <Button
                variant="outline-primary"
                className="w-100 d-flex justify-content-between align-items-center"
                onClick={() => setShowReviews(!showReviews)}
              >
                <span>See all Reviews</span>
                {showReviews ? <FaChevronUp /> : <FaChevronDown />}
              </Button>

              {showReviews && (
                <div className="mt-3">
                  {(!selectedLabour.reviews || selectedLabour.reviews.length === 0) ? (
                    <div className="text-center text-muted">
                      <p>No reviews available yet.</p>
                      <small>Be the first to review this labour!</small>
                    </div>
                  ) : (
                    <div className="reviews-container">
                      {selectedLabour.reviews.map((review, index) => (
                        <div key={index} className="border-bottom py-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex align-items-center">
                              <FaUser className="me-2 text-primary" />
                              <span className="fw-bold">{review.customerName || 'Anonymous'}</span>
                            </div>
                            <div className="d-flex align-items-center">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={i < review.rating ? 'text-warning' : 'text-muted'}
                                  size={14}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="mb-1">{review.review}</p>
                          <small className="text-muted">
                            {new Date(review.reviewTime).toLocaleDateString()}
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default LabourDetailsModal; 