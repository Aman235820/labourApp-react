import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Tab, Tabs, Alert, Form, Modal, Spinner } from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { 
  FaUserCircle, FaPhone, FaStar, FaMapMarkerAlt, FaCalendarAlt, 
  FaClock, FaCheckCircle, FaTimesCircle, FaHeart, FaShare, 
  FaTools, FaUser, FaWhatsapp, FaEnvelope, FaArrowLeft,
  FaCamera, FaThumbsUp, FaThumbsDown, FaFlag, FaBookmark,
  FaShieldAlt, FaAward, FaCertificate, FaGraduationCap
} from 'react-icons/fa';
import { labourService } from '../services/labourService';
import { bookLabour } from '../services/BookingService';
import '../styles/LabourDetailsPage.css';

const LabourDetailsPage = () => {
  const { labourId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [labour, setLabour] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingStatus, setBookingStatus] = useState(null);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    description: '',
    urgency: 'normal'
  });

  // Get searchCategory from location state or URL params, with fallback to labour skill
  const searchCategory = location.state?.searchCategory || (labour?.labourSkill || '');
  
  // Computed service category for display and booking
  const serviceCategory = searchCategory || labour?.labourSkill || 'Service';

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
          profileImage: response.profileImage || null,
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
          },
          // Initialize additional details
          hourlyRates: {},
          satisfactionGuarantee: false,
          followUpService: false,
          emergencyContact: '',
          workingHours: {
            monday: { start: '09:00', end: '17:00', available: true },
            tuesday: { start: '09:00', end: '17:00', available: true },
            wednesday: { start: '09:00', end: '17:00', available: true },
            thursday: { start: '09:00', end: '17:00', available: true },
            friday: { start: '09:00', end: '17:00', available: true },
            saturday: { start: '09:00', end: '14:00', available: true },
            sunday: { start: '00:00', end: '00:00', available: false }
          },
          socialMedia: {
            youtube: '',
            instagram: '',
            facebook: ''
          },
          certifications: [],
          testimonialVideos: []
        };
        
        console.log('LabourDetailsPage - Mapped labour data:', mappedLabour);
        setLabour(mappedLabour);
        
        // Fetch additional labour details (profile settings)
        try {
          const additionalDetails = await labourService.getAdditionalLabourDetails(labourId);
          console.log('LabourDetailsPage - Additional details API response:', additionalDetails);
          
          if (additionalDetails && additionalDetails.length > 0) {
            const latestSettings = additionalDetails[0]; // Get the most recent settings
            const profileData = latestSettings.profileSettings;
            
            if (profileData) {
              console.log('LabourDetailsPage - Profile settings found:', profileData);
              
              // Update labour with additional details
              setLabour(prev => ({
                ...prev,
                hourlyRates: profileData.hourlyRates || {},
                satisfactionGuarantee: profileData.satisfactionGuarantee || false,
                followUpService: profileData.followUpService || false,
                emergencyContact: profileData.emergencyContact || '',
                workingHours: profileData.workingHours || prev.workingHours,
                socialMedia: profileData.socialMedia || prev.socialMedia,
                certifications: profileData.certifications || [],
                testimonialVideos: profileData.testimonialVideos || []
              }));
              
              console.log('LabourDetailsPage - Additional details integrated successfully');
            }
          } else {
            console.log('LabourDetailsPage - No additional details found');
          }
        } catch (additionalError) {
          console.error('LabourDetailsPage - Error fetching additional details:', additionalError);
          // Continue with basic labour data even if additional details fail
        }
        
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

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsBooking(true);
      setBookingStatus(null);
      
      const userData = JSON.parse(localStorage.getItem('user'));
      
      // Prepare booking data
      const bookingData = {
        userId: userData.userId,
        labourId: labour.id,
        labourSkill: serviceCategory
      };
      
      // Make the booking API call
      const response = await bookLabour(bookingData);
      
      if (response && !response.hasError) {
        setBookingStatus({
          type: 'success',
          message: 'Labour Successfully booked!'
        });
        
        // Show alert with specific message and redirect on close
        alert(`${labour.labourName} successfully booked for ${serviceCategory}, you can check your bookings section for more details`);
        navigate('/');
      } else {
        setBookingStatus({
          type: 'danger',
          message: 'Booking failed. Please try again.'
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingStatus({
        type: 'danger',
        message: 'Booking failed. Please try again.'
      });
    } finally {
      setIsBooking(false);
    }
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
              <div className="labour-avatar">
                {labour.profileImage ? (
                  <div className="profile-image-container">
                    <img 
                      src={labour.profileImage} 
                      alt={labour.labourName}
                      className="profile-image clickable"
                      onClick={() => setShowImageModal(true)}
                      onError={(e) => {
                        // Replace the image with fallback icon
                        e.target.style.display = 'none';
                        const fallbackIcon = document.createElement('div');
                        fallbackIcon.innerHTML = '<svg class="text-primary" width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                        fallbackIcon.className = 'fallback-icon';
                        e.target.parentNode.appendChild(fallbackIcon);
                      }}
                    />
                    <div className="image-click-overlay">
                      <FaCamera size={20} />
                    </div>
                  </div>
                ) : (
                  <div className="profile-placeholder">
                    <FaUserCircle 
                      size={120} 
                      className="text-primary"
                    />
                  </div>
                )}
                {labour.isVerified && (
                  <div className="verified-badge">
                    <FaCheckCircle className="text-success" />
                  </div>
                )}
              </div>
              
              <div className="labour-info">
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
            </div>
          </Col>
        </Row>
      </div>

      {/* Quick Action Buttons */}
      <div className="quick-actions mb-4">
        <Row>
          <Col xs={12}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-3">
                <div className="d-flex flex-wrap justify-content-center gap-3">
                  <Button 
                    variant="primary" 
                    size="lg"
                    onClick={() => {
                      const storedUser = localStorage.getItem('user');
                      if (!storedUser) {
                        alert('Please login to book a service. Redirecting to registration page.');
                        navigate('/register');
                        return;
                      }
                      setShowBookingModal(true);
                    }}
                    disabled={!labour.isAvailable}
                    className="action-btn-primary"
                  >
                    <FaCalendarAlt className="me-2" />
                    Book Now
                  </Button>
                  
                  <Button 
                    variant="outline-primary" 
                    size="lg"
                    onClick={() => {
                      // Scroll to reviews section
                      const reviewsSection = document.querySelector('.reviews-compact-card');
                      if (reviewsSection) {
                        reviewsSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="action-btn-secondary"
                  >
                    <FaStar className="me-2" />
                    View Reviews ({labour.reviewCount || 0})
                  </Button>
                  
                  <Button 
                    variant="outline-success" 
                    size="lg"
                    onClick={() => window.location.href = `tel:${labour.labourMobileNo}`}
                    className="action-btn-call"
                  >
                    <FaPhone className="me-2" />
                    Call Now
                  </Button>
                  
                  <Button 
                    variant="outline-info" 
                    size="lg"
                    onClick={() => window.open(`https://wa.me/${labour.labourMobileNo ? labour.labourMobileNo.replace(/\D/g, '') : ''}`, '_blank')}
                    className="action-btn-whatsapp"
                  >
                    <FaWhatsapp className="me-2" />
                    WhatsApp
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Main Content - Single Page Layout */}
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

          {/* Pricing */}
          {labour.hourlyRates && Object.keys(labour.hourlyRates).length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <h5>Service Pricing</h5>
                <div className="pricing-grid">
                  {Object.entries(labour.hourlyRates).map(([service, rates]) => (
                    <div key={service} className="pricing-item">
                      <div className="service-name">{service}</div>
                      <div className="price-range">
                        ₹{rates.min || '0'} - ₹{rates.max || '0'}
                        <small className="text-muted d-block">per hour</small>
                      </div>
                    </div>
                  ))}
                </div>
                {labour.satisfactionGuarantee && (
                  <Alert variant="success" className="mt-3">
                    <FaShieldAlt className="me-2" />
                    <strong>Satisfaction Guarantee:</strong> We guarantee your satisfaction with our work quality and service.
                  </Alert>
                )}
                
                {labour.followUpService && (
                  <Alert variant="info" className="mt-3">
                    <FaCheckCircle className="me-2" />
                    <strong>Follow-up Service:</strong> We provide follow-up service to ensure your complete satisfaction.
                  </Alert>
                )}
                
                {labour.emergencyContact && (
                  <Alert variant="warning" className="mt-3">
                    <FaPhone className="me-2" />
                    <strong>Emergency Contact:</strong> {labour.emergencyContact} (Available 24/7 for urgent requirements)
                  </Alert>
                )}
              </Card.Body>
            </Card>
          )}

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

          {/* Testimonial Videos */}
          {labour.testimonialVideos && labour.testimonialVideos.length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <h5>Testimonial Videos</h5>
                <div className="testimonial-videos">
                  {labour.testimonialVideos.map((video, index) => (
                    <div key={video.id || index} className="video-item">
                      <div className="video-thumbnail">
                        <FaCamera className="video-icon" />
                      </div>
                      <div className="video-info">
                        <h6>{video.title}</h6>
                        <a 
                          href={video.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="video-link"
                        >
                          Watch Video
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Availability */}
          <Card className="mb-4">
            <Card.Body>
              <h5>Weekly Schedule</h5>
              <div className="availability-grid">
                {Object.entries(labour.workingHours).map(([day, schedule]) => (
                  <div key={day} className="availability-item">
                    <div className="day-name">{getDayName(day)}</div>
                    <div className={`schedule ${schedule.available ? 'available' : 'unavailable'}`}>
                      {schedule.available ? (
                        <>
                          <FaCheckCircle className="text-success me-2" />
                          {schedule.start && schedule.end ? `${schedule.start} - ${schedule.end}` : 'Available'}
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="text-danger me-2" />
                          Closed
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

          {/* Social Media */}
          {labour.socialMedia && (labour.socialMedia.youtube || labour.socialMedia.instagram || labour.socialMedia.facebook) && (
            <Card className="mb-4">
              <Card.Body>
                <h5>Social Media</h5>
                <div className="social-media-links">
                  {labour.socialMedia.youtube && (
                    <a href={labour.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="social-link youtube">
                      <FaShare className="me-2" />
                      YouTube
                    </a>
                  )}
                  {labour.socialMedia.instagram && (
                    <a href={labour.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                      <FaShare className="me-2" />
                      Instagram
                    </a>
                  )}
                  {labour.socialMedia.facebook && (
                    <a href={labour.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                      <FaShare className="me-2" />
                      Facebook
                    </a>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Certifications */}
          <Card className="mb-4">
            <Card.Body>
              <h5>Certifications</h5>
              {labour.certifications && labour.certifications.length > 0 ? (
                labour.certifications.map((cert, index) => (
                  <div key={cert.id || index} className="certification-item">
                    <FaCertificate className="me-2 text-primary" />
                    <div>
                      <div className="cert-name">{cert.name}</div>
                      {cert.issueDate && (
                        <small className="text-muted">Issued: {new Date(cert.issueDate).toLocaleDateString()}</small>
                      )}
                      {cert.link && (
                        <a href={cert.link} target="_blank" rel="noopener noreferrer" className="cert-link">
                          View Certificate
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">No certifications listed.</p>
              )}
            </Card.Body>
          </Card>

          {/* Reviews Section - Compact */}
          <Card className="mb-4 reviews-compact-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  <FaStar className="me-2 text-warning" />
                  Reviews ({labour.reviewCount || 0})
                </h5>
              </div>
              
              {/* Rating Summary */}
              <div className="rating-summary-compact mb-3 p-3 bg-light rounded">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="rating-number-compact me-3">
                      {labour.rating && typeof labour.rating === 'number' && labour.rating > 0 ? labour.rating.toFixed(1) : 'No rating'}
                    </div>
                    <div>
                      <div className="rating-stars-compact mb-1">
                        {renderStars(labour.rating)}
                      </div>
                      <small className="text-muted">{labour.reviewCount} review{labour.reviewCount !== 1 ? 's' : ''}</small>
                    </div>
                  </div>
                  <div className="text-end">
                    <small className="text-muted">Overall Rating</small>
                  </div>
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="recent-reviews">
                {labour.reviews && labour.reviews.length > 0 ? (
                  labour.reviews.slice(0, 3).map((review, index) => (
                    <div key={review.id} className="review-item-compact mb-3 p-3 border rounded">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="d-flex align-items-center">
                          <FaUser className="text-primary me-2" size={16} />
                          <div>
                            <div className="reviewer-name-compact fw-bold small">
                              {review.customerName}
                            </div>
                            <div className="review-rating-compact">
                              {renderStars(review.rating)}
                              <span className="ms-1 small text-muted">{review.rating}/5</span>
                            </div>
                          </div>
                        </div>
                        <small className="text-muted">
                          {new Date(review.reviewTime).toLocaleDateString()}
                        </small>
                      </div>
                      <p className="review-text-compact mb-0 small">
                        {review.review.length > 100 ? review.review.substring(0, 100) + '...' : review.review}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="no-reviews-compact text-center py-3">
                    <FaStar className="text-muted mb-2" size={24} />
                    <p className="text-muted small mb-0">No reviews yet</p>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Booking Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Book {labour.labourName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {bookingStatus && (
            <Alert variant={bookingStatus.type} onClose={() => setBookingStatus(null)} dismissible>
              {bookingStatus.message}
            </Alert>
          )}
          
          <div className="booking-confirmation mb-4">
            <div className="text-center">
              <FaCalendarAlt className="text-primary mb-3" size={48} />
              <h5>Confirm Your Booking</h5>
              <p className="text-muted">
                Are you sure you want to book <strong>{labour.labourName}</strong> for <strong>{serviceCategory}</strong>?
              </p>
              <div className="booking-details bg-light p-3 rounded">
                <div className="row text-start">
                  <div className="col-6">
                    <strong>Labour:</strong> {labour.labourName}
                  </div>
                  <div className="col-6">
                    <strong>Service:</strong> {serviceCategory}
                  </div>
                  <div className="col-6">
                    <strong>Contact:</strong> {labour.labourMobileNo}
                  </div>
                  <div className="col-6">
                    <strong>Rating:</strong> {labour.rating ? `${labour.rating}/5` : 'No rating'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Form onSubmit={handleBookingSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Preferred Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={bookingData.date}
                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
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
              <Button variant="success" type="submit" size="lg" disabled={isBooking}>
                {isBooking ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Sending Booking Request...
                  </>
                ) : (
                  <>
                    <FaCalendarAlt className="me-2" />
                    Confirm Booking
                  </>
                )}
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

      {/* Profile Image Modal */}
      <Modal 
        show={showImageModal} 
        onHide={() => setShowImageModal(false)} 
        centered
        className="image-modal-compact"
        backdrop="static"
        keyboard={true}
      >
        <Modal.Body className="p-0 position-relative">
          {labour.profileImage && (
            <img 
              src={labour.profileImage} 
              alt={`${labour.labourName}'s profile picture`}
              className="modal-profile-image-compact"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          )}
          <div className="fallback-modal-image-compact" style={{ display: 'none' }}>
            <FaUserCircle size={120} className="text-muted" />
          </div>
          
          {/* Close button overlay */}
          <button 
            className="modal-close-overlay"
            onClick={() => setShowImageModal(false)}
            aria-label="Close modal"
          >
            <FaTimesCircle size={24} />
          </button>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default LabourDetailsPage; 