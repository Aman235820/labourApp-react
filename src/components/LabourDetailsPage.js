import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Tab, Tabs, Alert, Form, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaUserCircle, FaPhone, FaStar, FaMapMarkerAlt, FaCalendarAlt, 
  FaClock, FaCheckCircle, FaTimesCircle, FaHeart, FaShare, 
  FaTools, FaUser, FaWhatsapp, FaEnvelope, FaArrowLeft,
  FaCamera, FaThumbsUp, FaThumbsDown, FaFlag, FaBookmark,
  FaShield, FaAward, FaCertificate, FaGraduationCap
} from 'react-icons/fa';
import { labourService } from '../services/labourService';
import '../styles/LabourDetailsPage.css';

const LabourDetailsPage = () => {
  const { labourId } = useParams();
  const navigate = useNavigate();
  const [labour, setLabour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFavorited, setIsFavorited] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    description: '',
    urgency: 'normal'
  });

  // Fetch labour details from API
  useEffect(() => {
    const fetchLabourDetails = async () => {
      if (!labourId) return;
      
      console.log('LabourDetailsPage - Received labourId from URL:', labourId);
      
      setLoading(true);
      try {
        const response = await labourService.getLabourById(labourId);
        console.log('LabourDetailsPage - API Response:', response);
        
        // Map API response to component state
        const mappedLabour = {
          id: response.labourId,
          labourName: response.labourName,
          labourSkill: response.labourSkill,
          rating: response.rating ? Number(response.rating) : 0,
          reviewCount: response.ratingCount || 0,
          labourMobileNo: response.labourMobileNo,
          email: response.labourEmail || (response.labourName ? `${response.labourName.toLowerCase().replace(/\s+/g, '.')}@gmail.com` : 'contact@example.com'),
          location: response.labourAddress || 'Location not specified',
          experience: response.labourExperience || 'Experience not specified',
          isVerified: response.isVerified || false,
          isAvailable: response.isAvailable !== false, // Default to true if not specified
          priceRange: response.priceRange || 'Price on request',
          languages: response.languages || ['Hindi', 'English'],
          serviceRadius: response.serviceRadius || '10 km',
          description: response.labourDescription || `Professional ${response.labourSkill || 'worker'} with expertise in various services. Committed to quality work and customer satisfaction.`,
          skills: response.labourSubSkills ? response.labourSubSkills.map(skill => skill.subSkillName) : [],
          certifications: response.certifications || [],
          workImages: response.workImages || (response.labourSkill ? [
            `/images/${response.labourSkill?.toLowerCase().replace(/\s+/g, '')}1.jpg`,
            `/images/${response.labourSkill?.toLowerCase().replace(/\s+/g, '')}2.jpg`,
            `/images/${response.labourSkill?.toLowerCase().replace(/\s+/g, '')}3.webp`
          ] : []),
          availability: response.availability || {
            monday: { available: true, hours: '9:00 AM - 6:00 PM' },
            tuesday: { available: true, hours: '9:00 AM - 6:00 PM' },
            wednesday: { available: true, hours: '9:00 AM - 6:00 PM' },
            thursday: { available: true, hours: '9:00 AM - 6:00 PM' },
            friday: { available: true, hours: '9:00 AM - 6:00 PM' },
            saturday: { available: true, hours: '9:00 AM - 2:00 PM' },
            sunday: { available: false, hours: 'Closed' }
          },
          reviews: [],
          reviewCount: 0,
          ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          stats: {
            totalJobs: response.totalJobs || 0,
            repeatCustomers: response.repeatCustomers || 0,
            onTimeCompletion: response.onTimeCompletion || 0,
            responseTime: response.responseTime || '< 2 hours'
          }
        };
        
        console.log('LabourDetailsPage - Mapped labour data:', mappedLabour);
        setLabour(mappedLabour);
        
        // Fetch reviews separately using the reviews API
        try {
          const reviewsData = await labourService.getReviews(labourId);
          console.log('✅ Reviews loaded successfully:', reviewsData.length, 'reviews found');
          
          if (reviewsData && Array.isArray(reviewsData) && reviewsData.length > 0) {
            // Calculate average rating from reviews
            const totalRating = reviewsData.reduce((sum, review) => sum + review.rating, 0);
            const avgRating = totalRating / reviewsData.length;
            
            // Count ratings for breakdown
            const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            reviewsData.forEach(review => {
              const rating = Math.round(review.rating);
              if (rating >= 1 && rating <= 5) {
                ratingCounts[rating]++;
              }
            });
            
            const processedReviews = reviewsData.map(review => ({
              id: review.id,
              customerName: `User ${review.userId}`,
              rating: review.rating,
              review: review.review,
              reviewTime: review.reviewTime,
              workType: mappedLabour.labourSkill,
              helpful: Math.floor(Math.random() * 10), // Random helpful count for demo
              verified: review.userId % 2 === 0 // Random verification for demo
            }));
            
            setLabour(prev => ({
              ...prev,
              rating: avgRating,
              reviewCount: reviewsData.length,
              ratingBreakdown: ratingCounts,
              reviews: processedReviews
            }));
            
            console.log(`✅ Reviews integrated: ${reviewsData.length} reviews, avg rating: ${avgRating.toFixed(1)}`);
          } else {
            console.log('ℹ️ No reviews found for this labour');
            // Set empty reviews state
            setLabour(prev => ({
              ...prev,
              reviews: [],
              reviewCount: 0,
              ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
            }));
          }
        } catch (reviewError) {
          console.error('❌ Error fetching reviews:', reviewError);
          // Set empty reviews state on error
          setLabour(prev => ({
            ...prev,
            reviews: [],
            reviewCount: 0,
            ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
          }));
        }
      } catch (error) {
        console.error('LabourDetailsPage - Error fetching labour details:', error);
        setLabour(null);
      } finally {
        setLoading(false);
      }
    };

    fetchLabourDetails();
  }, [labourId]);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    // Handle booking logic here
    console.log('Booking submitted:', bookingData);
    setShowBookingModal(false);
    // Show success message or redirect
  };

  const renderStars = (rating) => {
    const numericRating = rating && typeof rating === 'number' && rating > 0 ? rating : 0;
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < numericRating ? 'text-warning' : 'text-muted'}
        size={16}
      />
    ));
  };

  const getDayName = (day) => {
    const days = {
      monday: 'Monday',
      tuesday: 'Tuesday',
      wednesday: 'Wednesday',
      thursday: 'Thursday',
      friday: 'Friday',
      saturday: 'Saturday',
      sunday: 'Sunday'
    };
    return days[day] || day;
  };

  if (loading) {
    return (
      <Container className="labour-details-page py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading labour details...</p>
        </div>
      </Container>
    );
  }

  if (!labour) {
    return (
      <Container className="labour-details-page py-5">
        <Alert variant="danger">
          <h5>Labour not found</h5>
          <p>The requested labour profile could not be found.</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            Go Back Home
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="labour-details-page">
      {/* Header Section */}
      <div className="labour-header">
        <Row className="align-items-center mb-4">
          <Col xs={12} md={8}>
            <Button 
              variant="link" 
              className="back-btn p-0 mb-3"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft className="me-2" />
              Back to Search
            </Button>
            
            <div className="d-flex align-items-center">
              <div className="labour-avatar me-4">
                <FaUserCircle size={80} className="text-primary" />
                {labour.isVerified && (
                  <div className="verified-badge">
                    <FaCheckCircle className="text-success" />
                  </div>
                )}
              </div>
              
              <div>
                <h1 className="labour-name">{labour.labourName}</h1>
                <p className="labour-skill">{labour.labourSkill}</p>
                
                <div className="d-flex align-items-center mb-2">
                  <div className="rating-section me-3">
                    {renderStars(labour.rating)}
                    <span className="ms-2 fw-bold">
                      {labour.rating && typeof labour.rating === 'number' && labour.rating > 0 ? labour.rating.toFixed(1) : 'No rating'}
                    </span>
                    <span className="text-muted">
                      ({labour.reviewCount} review{labour.reviewCount !== 1 ? 's' : ''})
                    </span>
                  </div>
                  
                  <Badge bg={labour.isAvailable ? 'success' : 'danger'}>
                    {labour.isAvailable ? 'Available' : 'Busy'}
                  </Badge>
                </div>
                
                <div className="labour-meta">
                  <span className="me-3">
                    <FaMapMarkerAlt className="me-1" />
                    {labour.location}
                  </span>
                  <span className="me-3">
                    <FaClock className="me-1" />
                    {labour.experience}
                  </span>
                  <span>
                    <FaTools className="me-1" />
                    {labour.priceRange}
                  </span>
                </div>
              </div>
            </div>
          </Col>
          
          <Col xs={12} md={4} className="text-md-end">
            <div className="action-buttons">
              <Button
                variant="outline-secondary"
                className="me-2"
                onClick={() => setIsFavorited(!isFavorited)}
              >
                <FaHeart className={isFavorited ? 'text-danger' : ''} />
              </Button>
              
              <Button variant="outline-secondary" className="me-2">
                <FaShare />
              </Button>
              
              <Button 
                variant="success" 
                size="lg"
                onClick={() => setShowBookingModal(true)}
                disabled={!labour.isAvailable}
              >
                <FaCalendarAlt className="me-2" />
                Book Now
              </Button>
            </div>
          </Col>
        </Row>
      </div>

      {/* Navigation Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="labour-tabs mb-4"
      >
        <Tab eventKey="overview" title="Overview">
          <Row>
            <Col lg={8}>
              {/* Description */}
              <Card className="mb-4">
                <Card.Body>
                  <h5>About {labour.labourName}</h5>
                  <p className={`labour-description ${showFullDescription ? 'expanded' : ''}`}>
                    {labour.description}
                  </p>
                  {labour.description.length > 200 && (
                    <Button
                      variant="link"
                      className="p-0"
                      onClick={() => setShowFullDescription(!showFullDescription)}
                    >
                      {showFullDescription ? 'Show Less' : 'Read More'}
                    </Button>
                  )}
                </Card.Body>
              </Card>

              {/* Skills */}
              <Card className="mb-4">
                <Card.Body>
                  <h5>Skills & Specializations</h5>
                  <div className="skills-grid">
                    {labour.skills && labour.skills.length > 0 ? (
                      labour.skills.map((skill, index) => (
                        <Badge key={index} bg="light" text="dark" className="skill-badge">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted">No specific skills listed. Contact for more information about services offered.</p>
                    )}
                  </div>
                </Card.Body>
              </Card>

              {/* Work Gallery */}
              <Card className="mb-4">
                <Card.Body>
                  <h5>Work Gallery</h5>
                  <div className="work-gallery">
                    {labour.workImages && labour.workImages.length > 0 ? (
                      labour.workImages.map((image, index) => (
                        <div
                          key={index}
                          className={`gallery-item ${selectedImageIndex === index ? 'active' : ''}`}
                          onClick={() => setSelectedImageIndex(index)}
                        >
                          <img src={image} alt={`Work ${index + 1}`} onError={(e) => {
                            e.target.style.display = 'none';
                          }} />
                          <div className="gallery-overlay">
                            <FaCamera />
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">No work samples available yet.</p>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={4}>
              {/* Contact Card */}
              <Card className="mb-4 contact-card">
                <Card.Body>
                  <h5>Contact Information</h5>
                  
                  <div className="contact-item">
                    <FaPhone className="contact-icon" />
                    <div>
                      <p className="mb-1">Phone</p>
                      <a href={`tel:${labour.labourMobileNo}`} className="contact-link">
                        {labour.labourMobileNo}
                      </a>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <FaWhatsapp className="contact-icon text-success" />
                    <div>
                      <p className="mb-1">WhatsApp</p>
                      <a href={`https://wa.me/${labour.labourMobileNo ? labour.labourMobileNo.replace(/\D/g, '') : ''}`} className="contact-link">
                        Chat on WhatsApp
                      </a>
                    </div>
                  </div>
                  
                  <div className="contact-item">
                    <FaEnvelope className="contact-icon" />
                    <div>
                      <p className="mb-1">Email</p>
                      <a href={`mailto:${labour.email}`} className="contact-link">
                        {labour.email}
                      </a>
                    </div>
                  </div>
                  
                  <hr />
                  
                  <div className="mb-3">
                    <p className="mb-1"><strong>Service Radius:</strong></p>
                    <p>{labour.serviceRadius}</p>
                  </div>
                  
                  <div className="mb-3">
                    <p className="mb-1"><strong>Languages:</strong></p>
                    <p>{labour.languages && labour.languages.length > 0 ? labour.languages.join(', ') : 'Not specified'}</p>
                  </div>
                </Card.Body>
              </Card>

              {/* Stats Card */}
              <Card className="mb-4">
                <Card.Body>
                  <h5>Performance Stats</h5>
                  
                  <div className="stat-item">
                    <div className="stat-number">{labour.stats.totalJobs}</div>
                    <div className="stat-label">Total Jobs</div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-number">{labour.stats.repeatCustomers}%</div>
                    <div className="stat-label">Repeat Customers</div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-number">{labour.stats.onTimeCompletion}%</div>
                    <div className="stat-label">On-Time Completion</div>
                  </div>
                  
                  <div className="stat-item">
                    <div className="stat-number">{labour.stats.responseTime}</div>
                    <div className="stat-label">Response Time</div>
                  </div>
                </Card.Body>
              </Card>

              {/* Certifications */}
              <Card className="mb-4">
                <Card.Body>
                  <h5>Certifications</h5>
                  {labour.certifications && labour.certifications.length > 0 ? (
                    labour.certifications.map((cert, index) => (
                      <div key={index} className="certification-item">
                        <FaCertificate className="me-2 text-primary" />
                        <span>{cert}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">No certifications listed.</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="reviews" title={`Reviews (${labour.reviewCount || 0})`}>
          <Card>
            <Card.Body>
              
              <div className="reviews-header mb-4">
                <Row>
                  <Col md={6}>
                    <div className="rating-summary">
                      <div className="big-rating">
                        <span className="rating-number">{labour.rating && typeof labour.rating === 'number' && labour.rating > 0 ? labour.rating.toFixed(1) : 'No rating'}</span>
                        <div className="rating-stars">
                          {renderStars(labour.rating)}
                        </div>
                        <p>{labour.reviewCount} reviews</p>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="rating-breakdown">
                      {[5, 4, 3, 2, 1].map(star => {
                        const count = (labour.ratingBreakdown && labour.ratingBreakdown[star]) || 0;
                        const percentage = (labour.reviewCount && labour.reviewCount > 0) ? (count / labour.reviewCount) * 100 : 0;
                        return (
                          <div key={star} className="rating-bar">
                            <span className="rating-star-number">{star}</span>
                            <FaStar className="text-warning me-2" />
                            <div className="progress flex-fill">
                              <div 
                                className="progress-bar bg-warning" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <span className="count ms-2">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="reviews-list">
                {labour.reviews && labour.reviews.length > 0 ? (
                  labour.reviews.map((review) => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <div className="reviewer-info">
                          <FaUser className="reviewer-avatar" />
                          <div>
                            <div className="reviewer-name">
                              {review.customerName}
                              {review.verified && (
                                <FaCheckCircle className="text-success ms-1" size={14} />
                              )}
                            </div>
                            <div className="review-meta">
                              <span className="work-type">{review.workType}</span>
                              <span className="review-date">
                                {new Date(review.reviewTime).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="review-rating">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      
                      <p className="review-text">{review.review}</p>
                      
                      <div className="review-actions">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="review-action-btn me-2"
                        >
                          <FaThumbsUp className="me-1" />
                          Helpful ({review.helpful})
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          size="sm" 
                          className="review-action-btn me-2"
                        >
                          <FaThumbsDown className="me-1" />
                          Not Helpful
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="review-action-btn"
                          onClick={() => setShowReportModal(true)}
                        >
                          <FaFlag className="me-1" />
                          Report
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-reviews-state">
                    <div className="no-reviews-icon">
                      <FaStar className="text-muted" size={48} />
                    </div>
                    <h5>No Reviews Yet</h5>
                    <p className="text-muted">
                      Be the first to leave a review for {labour.labourName}!
                    </p>
                    <Button 
                      variant="outline-primary" 
                      className="mt-3"
                      onClick={() => setShowBookingModal(true)}
                    >
                      Book & Review
                    </Button>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="availability" title="Availability">
          <Card>
            <Card.Body>
              <h5>Weekly Schedule</h5>
              <div className="availability-grid">
                {Object.entries(labour.availability).map(([day, schedule]) => (
                  <div key={day} className="availability-item">
                    <div className="day-name">{getDayName(day)}</div>
                    <div className={`schedule ${schedule.available ? 'available' : 'unavailable'}`}>
                      {schedule.available ? (
                        <>
                          <FaCheckCircle className="text-success me-2" />
                          {schedule.hours}
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="text-danger me-2" />
                          {schedule.hours}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Alert variant="info" className="mt-4">
                <strong>Note:</strong> Schedule may vary based on workload and emergency requests. 
                Contact directly for urgent requirements.
              </Alert>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Booking Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Book {labour.labourName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleBookingSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Preferred Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Preferred Time</Form.Label>
                  <Form.Control
                    type="time"
                    value={bookingData.time}
                    onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
              <Form.Label>Work Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={bookingData.description}
                onChange={(e) => setBookingData({...bookingData, description: e.target.value})}
                placeholder="Describe the work you need done..."
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Urgency Level</Form.Label>
              <Form.Select
                value={bookingData.urgency}
                onChange={(e) => setBookingData({...bookingData, urgency: e.target.value})}
              >
                <option value="low">Low - Within a week</option>
                <option value="normal">Normal - Within 2-3 days</option>
                <option value="high">High - Within 24 hours</option>
                <option value="urgent">Urgent - ASAP</option>
              </Form.Select>
            </Form.Group>
            
            <div className="d-grid gap-2">
              <Button variant="primary" type="submit" size="lg">
                Send Booking Request
              </Button>
              <Button variant="outline-secondary" onClick={() => setShowBookingModal(false)}>
                Cancel
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Report Modal */}
      <Modal show={showReportModal} onHide={() => setShowReportModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Report Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Why are you reporting this review?</p>
          <Form>
            <Form.Check type="radio" label="Inappropriate content" name="reportReason" />
            <Form.Check type="radio" label="Fake review" name="reportReason" />
            <Form.Check type="radio" label="Spam" name="reportReason" />
            <Form.Check type="radio" label="Other" name="reportReason" />
            <Form.Group className="mt-3">
              <Form.Label>Additional Comments</Form.Label>
              <Form.Control as="textarea" rows={3} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => setShowReportModal(false)}>
            Submit Report
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default LabourDetailsPage; 