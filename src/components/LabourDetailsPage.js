import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Image, Spinner, Alert, Form } from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FaStar, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaClock,
  FaCalendarAlt,
  FaCheckCircle,
  FaArrowLeft,
  FaUser,
  FaEnvelope,
  FaCertificate,
  FaTools,
  FaShieldAlt,
  FaUserCircle,
  FaCamera,
  FaHeart,
  FaShare,
  FaWhatsapp,
  FaTimesCircle
} from 'react-icons/fa';
import { labourService } from '../services/labourService';
import { bookLabour } from '../services/BookingService';
import '../styles/LabourDetailsPage.css';

const LabourDetailsPage = () => {
  const { t } = useTranslation();
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
  const [workingHours, setWorkingHours] = useState(null);
  const [existingBookings, setExistingBookings] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    return { currentDate, currentTime, now };
  };

  // Get working hours for a specific date using labour's profile data
  const getWorkingHoursForDate = useCallback((date) => {
    if (!labour || !date) return;
    
    try {
      setLoadingTimeSlots(true);
      
      // Use the helper function from labourService to get working hours
      const workingHoursData = labourService.getWorkingHoursForDate(labour, date);
      setWorkingHours(workingHoursData);
      
      // For now, we don't have existing bookings data from API
      // This can be implemented later when the backend API is available
      setExistingBookings([]);
      
    } catch (error) {
      console.error('Error getting working hours:', error);
      // Fallback to not available
      setWorkingHours({
        available: false,
        startTime: '00:00',
        endTime: '00:00',
        breaks: []
      });
      setExistingBookings([]);
    } finally {
      setLoadingTimeSlots(false);
    }
  }, [labour]);

  // Generate available time slots based on working hours and existing bookings
  const generateTimeSlots = () => {
    if (!workingHours || !workingHours.available) {
      return [];
    }
    
    const slots = [];
    const { currentDate, currentTime, now } = getCurrentDateTime();
    
    // Parse working hours
    const [startHour, startMinute] = workingHours.startTime.split(':').map(Number);
    const [endHour, endMinute] = workingHours.endTime.split(':').map(Number);
    
    // Convert to minutes for easier calculation
    let startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    // If booking for today, ensure we start from at least 1 hour from now
    if (bookingData.date === currentDate) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const minimumStartMinutes = currentMinutes + 60; // 1 hour buffer
      startMinutes = Math.max(startMinutes, minimumStartMinutes);
    }
    
    // Round up to next 30-minute interval
    if (startMinutes % 30 !== 0) {
      startMinutes = Math.ceil(startMinutes / 30) * 30;
    }
    
    // Generate slots every 30 minutes
    for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
      const hour = Math.floor(minutes / 60);
      const minute = minutes % 60;
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      
      // Check if this slot conflicts with existing bookings
      const isBooked = existingBookings.some(booking => {
        const bookingTime = booking.preferredTime || booking.time;
        return bookingTime === timeString;
      });
      
      // Check if this slot conflicts with breaks
      const isBreakTime = workingHours.breaks?.some(breakTime => {
        const [breakStart] = breakTime.start.split(':').map(Number);
        const [breakEnd] = breakTime.end.split(':').map(Number);
        const breakStartMinutes = breakStart * 60;
        const breakEndMinutes = breakEnd * 60;
        return minutes >= breakStartMinutes && minutes < breakEndMinutes;
      });
      
      if (!isBooked && !isBreakTime) {
        slots.push(timeString);
      }
    }
    
    return slots;
  };

  // Get minimum date (today)
  const getMinDate = () => {
    return getCurrentDateTime().currentDate;
  };

  // Validate selected time
  const isValidTime = (selectedTime, selectedDate) => {
    const { currentDate, currentTime } = getCurrentDateTime();
    
    if (selectedDate === currentDate) {
      return selectedTime > currentTime;
    }
    return true;
  };

  // Convert 24-hour format to 12-hour format for display
  const convertTo12Hour = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get searchCategory from location state or URL params, with fallback to labour skill
  const searchCategory = location.state?.searchCategory || (labour?.labourSkill || '');
  
  // Computed service category for display and booking
  const serviceCategory = searchCategory || labour?.labourSkill || 'Service';

  // Fetch labour details from API
  useEffect(() => {
    const fetchLabourDetails = async () => {
      if (!labourId) return;
    
      setLoading(true);
      try {
        const response = await labourService.getLabourById(labourId);
        
        // Map API response to component state
        const mappedLabour = {
          id: response.labourId,
          labourName: response.labourName,
          labourSkill: response.labourSkill,
          rating: response.rating ? Number(response.rating) : 0,
          reviewCount: response.ratingCount || 0,
          labourMobileNo: response.labourMobileNo,
          email: response.labourEmail || (response.labourName ? `${response.labourName.toLowerCase().replace(/\s+/g, '.')}@gmail.com` : 'contact@example.com'),
          location: response.labourLocation || response.labourAddress || 'Location not specified',
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
          testimonialVideos: []
        };
        
        setLabour(mappedLabour);
        
        // Fetch additional labour details (profile settings)
        try {
          const additionalDetails = await labourService.getAdditionalLabourDetails(labourId);
          
          if (additionalDetails && additionalDetails.length > 0) {
            const latestSettings = additionalDetails[0]; // Get the most recent settings
            const profileData = latestSettings.profileSettings;
            
            if (profileData) {
              
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
              
            }
          }
        } catch (additionalError) {
          console.error('LabourDetailsPage - Error fetching additional details:', additionalError);
          // Continue with basic labour data even if additional details fail
        }
        
        // Fetch reviews separately using the reviews API
        try {
          const reviewsData = await labourService.getReviews(labourId);
          
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
            
          } else {
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

  // Get working hours when booking date changes
  useEffect(() => {
    if (bookingData.date && labour) {
      getWorkingHoursForDate(bookingData.date);
    }
  }, [bookingData.date, labour, getWorkingHoursForDate]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!bookingData.date) {
              alert(t('labourDetails.pleaseSelectPreferredDate'));
      return;
    }

    // Only require time slot if labour is available and has slots
    const hasAvailableSlots = workingHours?.available && generateTimeSlots().length > 0;
    if (hasAvailableSlots && !bookingData.time) {
              alert(t('labourDetails.pleaseSelectPreferredTimeSlot'));
      return;
    }



    // Validate date is not in the past
    const { currentDate } = getCurrentDateTime();
    if (bookingData.date < currentDate) {
      alert('Please select a date from today onwards.');
      return;
    }

    // Validate time is not in the past for today's bookings
    if (!isValidTime(bookingData.time, bookingData.date)) {
      alert('Please select a future time slot.');
      return;
    }
    
    try {
      setIsBooking(true);
      setBookingStatus(null);
      
      const userData = JSON.parse(localStorage.getItem('user'));
      
      // Prepare booking data
      const bookingPayload = {
        userId: userData.userId,
        labourId: labour.id,
        labourSkill: serviceCategory,
        preferredDate: bookingData.date,
        preferredTime: bookingData.time || null, // Allow null when no slots available
        workDescription: bookingData.description,
        urgencyLevel: bookingData.urgency
      };
      
      // Make the booking API call
      const response = await bookLabour(bookingPayload);
      
      if (response && !response.hasError) {
        setBookingStatus({
          type: 'success',
          message: 'Labour Successfully booked!'
        });
        
        // Show alert with specific message and redirect on close
        const timeMessage = bookingData.time 
          ? `for ${serviceCategory} at ${bookingData.time}`
          : `for ${serviceCategory} (labour will contact you to arrange timing)`;
        alert(`${labour.labourName} successfully booked ${timeMessage}, you can check your bookings section for more details`);
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
      monday: t('labourDetails.monday'),
      tuesday: t('labourDetails.tuesday'),
      wednesday: t('labourDetails.wednesday'),
      thursday: t('labourDetails.thursday'),
      friday: t('labourDetails.friday'),
      saturday: t('labourDetails.saturday'),
      sunday: t('labourDetails.sunday')
    };
    return days[day] || day;
  };

  if (loading) {
    return (
      <Container className="labour-details-page py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">{t('common.loading')}</span>
          </div>
          <p className="mt-3">{t('labourDetails.loadingLabourDetails')}</p>
        </div>
      </Container>
    );
  }

  if (!labour) {
    return (
      <Container className="labour-details-page py-5">
        <Alert variant="danger">
          <h5>{t('labourDetails.labourNotFound')}</h5>
          <p>{t('labourDetails.labourNotFoundDesc')}</p>
          <Button variant="primary" onClick={() => navigate('/')}>
            {t('labourDetails.goBackHome')}
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
              className="back-btn p-0"
              onClick={() => navigate(-1)}
            >
              <FaArrowLeft className="me-2" />
              {t('labourDetails.backToSearch')}
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
                
                <div className="rating-section">
                  <div className="rating-stars">
                    {renderStars(labour.rating)}
                  </div>
                  <span className="fw-bold">
                    {labour.rating && typeof labour.rating === 'number' && labour.rating > 0 ? labour.rating.toFixed(1) : 'No rating'}
                  </span>
                  <span className="text-muted">
                    ({labour.reviewCount} {labour.reviewCount !== 1 ? t('labourDetails.reviews') : t('labourDetails.review')})
                  </span>
                  <Badge bg={labour.isAvailable ? 'success' : 'danger'}>
                    {labour.isAvailable ? t('labourDetails.available') : t('labourDetails.busy')}
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
                        alert(t('labourDetails.pleaseLoginToBook'));
                        navigate('/register');
                        return;
                      }
                      setShowBookingModal(true);
                    }}
                    disabled={!labour.isAvailable}
                    className="action-btn-primary"
                  >
                    <FaCalendarAlt className="me-2" />
                    {t('labourDetails.bookForLater')}
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
                    {t('labourDetails.viewReviews')} ({labour.reviewCount || 0})
                  </Button>
                  
                  <Button 
                    variant="outline-success" 
                    size="lg"
                    onClick={() => window.location.href = `tel:${labour.labourMobileNo}`}
                    className="action-btn-call"
                  >
                    <FaPhone className="me-2" />
                    {t('labourDetails.callNow')}
                  </Button>
                  
                  <Button 
                    variant="outline-info" 
                    size="lg"
                    onClick={() => window.open(`https://wa.me/${labour.labourMobileNo ? labour.labourMobileNo.replace(/\D/g, '') : ''}`, '_blank')}
                    className="action-btn-whatsapp"
                  >
                    <FaWhatsapp className="me-2" />
                    {t('labourDetails.whatsapp')}
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
              <h5>{t('labourDetails.about')} {labour.labourName}</h5>
              <p className={`labour-description ${showFullDescription ? 'expanded' : ''}`}>
                {labour.description}
              </p>
              {labour.description.length > 200 && (
                <Button
                  variant="link"
                  className="p-0"
                  onClick={() => setShowFullDescription(!showFullDescription)}
                >
                  {showFullDescription ? t('labourDetails.showLess') : t('labourDetails.readMore')}
                </Button>
              )}
            </Card.Body>
          </Card>

          {/* Skills */}
          <Card className="mb-4">
            <Card.Body>
              <h5>{t('labourDetails.skillsAndSpecializations')}</h5>
              <div className="skills-grid">
                {labour.skills && labour.skills.length > 0 ? (
                  labour.skills.map((skill, index) => (
                    <Badge key={index} bg="light" text="dark" className="skill-badge">
                      {skill}
                    </Badge>
                  ))
                ) : (
                  <p className="text-muted">{t('labourDetails.noSpecificSkillsListed')}</p>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Pricing */}
          {labour.hourlyRates && Object.keys(labour.hourlyRates).length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <h5>{t('labourDetails.servicePricing')}</h5>
                <div className="pricing-grid">
                  {Object.entries(labour.hourlyRates).map(([service, rates]) => (
                    <div key={service} className="pricing-item">
                      <div className="service-name">{service}</div>
                      <div className="price-range">
                        ₹{rates.min || '0'} - ₹{rates.max || '0'}
                        <small className="text-muted d-block">{t('labourDetails.perHour')}</small>
                      </div>
                    </div>
                  ))}
                </div>
                {labour.satisfactionGuarantee && (
                  <Alert variant="success" className="mt-3">
                    <FaShieldAlt className="me-2" />
                    <strong>{t('labourDetails.satisfactionGuarantee')}</strong> {t('labourDetails.satisfactionGuaranteeDesc')}
                  </Alert>
                )}
                
                {labour.followUpService && (
                  <Alert variant="info" className="mt-3">
                    <FaCheckCircle className="me-2" />
                    <strong>{t('labourDetails.followUpService')}</strong> {t('labourDetails.followUpServiceDesc')}
                  </Alert>
                )}
                
                {labour.emergencyContact && (
                  <Alert variant="warning" className="mt-3">
                    <FaPhone className="me-2" />
                    <strong>{t('labourDetails.emergencyContact')}</strong> {labour.emergencyContact} ({t('labourDetails.emergencyContactDesc')})
                  </Alert>
                )}
              </Card.Body>
            </Card>
          )}

          {/* Work Gallery */}
          <Card className="mb-4">
            <Card.Body>
              <h5>{t('labourDetails.workGallery')}</h5>
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
                  <p className="text-muted">{t('labourDetails.noWorkSamplesAvailable')}</p>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Testimonial Videos */}
          {labour.testimonialVideos && labour.testimonialVideos.length > 0 && (
            <Card className="mb-4">
              <Card.Body>
                <h5>{t('labourDetails.testimonialVideos')}</h5>
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
                          {t('labourDetails.watchVideo')}
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
              <h5>{t('labourDetails.weeklySchedule')}</h5>
              <div className="availability-grid">
                {Object.entries(labour.workingHours).map(([day, schedule]) => (
                  <div key={day} className="availability-item">
                    <div className="day-name">{getDayName(day)}</div>
                    <div className={`schedule ${schedule.available ? 'available' : 'unavailable'}`}>
                      {schedule.available ? (
                        <>
                          <FaCheckCircle className="text-success me-2" />
                          {schedule.start && schedule.end ? `${schedule.start} - ${schedule.end}` : t('labourDetails.available')}
                        </>
                      ) : (
                        <>
                          <FaTimesCircle className="text-danger me-2" />
                          {t('labourDetails.closed')}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <Alert variant="info" className="mt-4">
                <strong>{t('labourDetails.scheduleNote')}</strong> {t('labourDetails.scheduleNoteDesc')}
              </Alert>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          {/* Contact Card */}
          <Card className="mb-4 contact-card">
            <Card.Body>
              <h5>{t('labourDetails.contactInformation')}</h5>
              
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <div>
                  <p className="mb-1">{t('labourDetails.phone')}</p>
                  <a href={`tel:${labour.labourMobileNo}`} className="contact-link">
                    {labour.labourMobileNo}
                  </a>
                </div>
              </div>
              
              <div className="contact-item">
                <FaWhatsapp className="contact-icon text-success" />
                <div>
                  <p className="mb-1">{t('labourDetails.whatsapp')}</p>
                  <a href={`https://wa.me/${labour.labourMobileNo ? labour.labourMobileNo.replace(/\D/g, '') : ''}`} className="contact-link">
                    {t('labourDetails.chatOnWhatsapp')}
                  </a>
                </div>
              </div>
              
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <div>
                  <p className="mb-1">{t('labourDetails.email')}</p>
                  <a href={`mailto:${labour.email}`} className="contact-link">
                    {labour.email}
                  </a>
                </div>
              </div>
              
              <hr />
              
              <div className="mb-3">
                <p className="mb-1"><strong>{t('labourDetails.serviceRadius')}</strong></p>
                <p>{labour.serviceRadius}</p>
              </div>
              
              <div className="mb-3">
                <p className="mb-1"><strong>{t('labourDetails.languages')}</strong></p>
                <p>{labour.languages && labour.languages.length > 0 ? labour.languages.join(', ') : t('labourDetails.notSpecified')}</p>
              </div>
            </Card.Body>
          </Card>

          {/* Stats Card */}
          <Card className="mb-4">
            <Card.Body>
              <h5>{t('labourDetails.performanceStats')}</h5>
              
              <div className="stat-item">
                <div className="stat-number">{labour.stats.totalJobs}</div>
                <div className="stat-label">{t('labourDetails.totalJobs')}</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-number">{labour.stats.repeatCustomers}%</div>
                <div className="stat-label">{t('labourDetails.repeatCustomers')}</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-number">{labour.stats.onTimeCompletion}%</div>
                <div className="stat-label">{t('labourDetails.onTimeCompletion')}</div>
              </div>
              
              <div className="stat-item">
                <div className="stat-number">{labour.stats.responseTime}</div>
                <div className="stat-label">{t('labourDetails.responseTime')}</div>
              </div>
            </Card.Body>
          </Card>

          {/* Social Media */}
          {labour.socialMedia && (labour.socialMedia.youtube || labour.socialMedia.instagram || labour.socialMedia.facebook) && (
            <Card className="mb-4">
              <Card.Body>
                <h5>{t('labourDetails.socialMedia')}</h5>
                <div className="social-media-links">
                  {labour.socialMedia.youtube && (
                    <a href={labour.socialMedia.youtube} target="_blank" rel="noopener noreferrer" className="social-link youtube">
                      <FaShare className="me-2" />
                      {t('labourDetails.youtube')}
                    </a>
                  )}
                  {labour.socialMedia.instagram && (
                    <a href={labour.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                      <FaShare className="me-2" />
                      {t('labourDetails.instagram')}
                    </a>
                  )}
                  {labour.socialMedia.facebook && (
                    <a href={labour.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                      <FaShare className="me-2" />
                      {t('labourDetails.facebook')}
                    </a>
                  )}
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Certifications */}
          <Card className="mb-4">
            <Card.Body>
              <h5>{t('labourDetails.certifications')}</h5>
              {labour.certifications && labour.certifications.length > 0 ? (
                labour.certifications.map((cert, index) => (
                  <div key={cert.id || index} className="certification-item">
                    <FaCertificate className="me-2 text-primary" />
                    <div>
                      <div className="cert-name">{cert.name}</div>
                      {cert.issueDate && (
                        <small className="text-muted">{t('labourDetails.issued')} {new Date(cert.issueDate).toLocaleDateString()}</small>
                      )}
                      {cert.link && (
                        <a href={cert.link} target="_blank" rel="noopener noreferrer" className="cert-link">
                          {t('labourDetails.viewCertificate')}
                        </a>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted">{t('labourDetails.noCertificationsListed')}</p>
              )}
            </Card.Body>
          </Card>

          {/* Reviews Section - Compact */}
          <Card className="mb-4 reviews-compact-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  <FaStar className="me-2 text-warning" />
                  {t('labourDetails.reviews')} ({labour.reviewCount || 0})
                </h5>
              </div>
              
              {/* Rating Summary */}
              <div className="rating-summary-compact mb-3 p-3 bg-light rounded">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center">
                    <div className="rating-number-compact me-3">
                      {labour.rating && typeof labour.rating === 'number' && labour.rating > 0 ? labour.rating.toFixed(1) : t('labourDetails.noRating')}
                    </div>
                    <div>
                      <div className="rating-stars-compact mb-1">
                        {renderStars(labour.rating)}
                      </div>
                      <small className="text-muted">{labour.reviewCount} {labour.reviewCount !== 1 ? t('labourDetails.reviews') : t('labourDetails.review')}</small>
                    </div>
                  </div>
                  <div className="text-end">
                    <small className="text-muted">{t('labourDetails.overallRating')}</small>
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
                    <p className="text-muted small mb-0">{t('labourDetails.noReviewsYet')}</p>
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
          <Modal.Title>{t('labourDetails.bookLabour')} {labour.labourName}</Modal.Title>
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
              <h5>{t('labourDetails.confirmYourBooking')}</h5>
              <p className="text-muted">
                {t('labourDetails.areYouSureToBook')} <strong>{labour.labourName}</strong> {t('labourDetails.for')} <strong>{serviceCategory}</strong>?
              </p>
              <div className="booking-details bg-light p-3 rounded">
                <div className="row text-start">
                  <div className="col-6">
                    <strong>{t('labourDetails.labour')}:</strong> {labour.labourName}
                  </div>
                  <div className="col-6">
                    <strong>{t('labourDetails.service')}:</strong> {serviceCategory}
                  </div>
                  <div className="col-6">
                    <strong>{t('labourDetails.contact')}:</strong> {labour.labourMobileNo}
                  </div>
                  <div className="col-6">
                    <strong>{t('labourDetails.rating')}:</strong> {labour.rating ? `${labour.rating}/5` : t('labourDetails.noRating')}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <Form onSubmit={handleBookingSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('labourDetails.preferredDate')}</Form.Label>
                  <Form.Control
                    type="date"
                    value={bookingData.date}
                    min={getMinDate()}
                    onChange={(e) => {
                      setBookingData({...bookingData, date: e.target.value, time: ''}); // Reset time when date changes
                      // Working hours will be fetched automatically via useEffect
                    }}
                    required
                  />
                  <Form.Text className="text-muted">
                    Select a date from today onwards
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('labourDetails.preferredTimeSlot')}</Form.Label>
                  <Form.Select
                    value={bookingData.time}
                    onChange={(e) => setBookingData({...bookingData, time: e.target.value})}
                    disabled={!bookingData.date || loadingTimeSlots}
                    required={bookingData.date && !loadingTimeSlots && workingHours?.available && generateTimeSlots().length > 0}
                  >
                    <option value="">
                      {!bookingData.date 
                        ? 'Select date first' 
                        : loadingTimeSlots 
                        ? 'Loading available slots...'
                        : workingHours && !workingHours.available
                        ? 'Labour not available on this day - booking allowed'
                        : generateTimeSlots().length === 0
                        ? 'No available slots for this date - booking allowed'
                        : 'Choose time slot (required)'
                      }
                    </option>
                    {bookingData.date && !loadingTimeSlots && workingHours?.available && generateTimeSlots().map((slot, index) => (
                      <option key={index} value={slot}>
                        {slot} ({convertTo12Hour(slot)})
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    {loadingTimeSlots 
                      ? 'Checking labour availability...'
                      : workingHours && !workingHours.available
                      ? 'Labour is not available on the selected day, but you can still book. Labour will contact you to arrange timing.'
                      : workingHours?.available && generateTimeSlots().length === 0
                      ? 'No available slots for this date, but you can still book. Labour will contact you to arrange timing.'
                      : `Available slots based on labour's working hours (${workingHours?.startTime || '09:00'} - ${workingHours?.endTime || '18:00'})`
                    }
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group className="mb-3">
                              <Form.Label>{t('labourDetails.workDescription')} <span className="text-muted">{t('labourDetails.optional')}</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={bookingData.description}
                onChange={(e) => setBookingData({...bookingData, description: e.target.value})}
                placeholder="Describe the work you need done (optional)..."
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>{t('labourDetails.urgencyLevel')}</Form.Label>
              <Form.Select
                value={bookingData.urgency}
                onChange={(e) => setBookingData({...bookingData, urgency: e.target.value})}
              >
                <option value="low">{t('labourDetails.lowWithinWeek')}</option>
                <option value="normal">{t('labourDetails.normalWithin2To3Days')}</option>
                <option value="high">{t('labourDetails.highWithin24Hours')}</option>
                <option value="urgent">{t('labourDetails.urgentAsap')}</option>
              </Form.Select>
            </Form.Group>
            
            <div className="d-grid gap-2">
              <Button variant="success" type="submit" size="lg" disabled={isBooking}>
                {isBooking ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    {t('labourDetails.sendingBookingRequest')}
                  </>
                ) : (
                  <>
                    <FaCalendarAlt className="me-2" />
                    {t('labourDetails.confirmBooking')}
                  </>
                )}
              </Button>
              <Button variant="outline-secondary" onClick={() => setShowBookingModal(false)}>
                {t('labourDetails.cancel')}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Report Modal */}
      <Modal show={showReportModal} onHide={() => setShowReportModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('labourDetails.reportReview')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Why are you reporting this review?</p>
          <Form>
            <Form.Check type="radio" label={t('labourDetails.inappropriateContent')} name="reportReason" />
            <Form.Check type="radio" label={t('labourDetails.fakeReview')} name="reportReason" />
            <Form.Check type="radio" label={t('labourDetails.spam')} name="reportReason" />
            <Form.Check type="radio" label={t('labourDetails.other')} name="reportReason" />
            <Form.Group className="mt-3">
              <Form.Label>{t('labourDetails.additionalComments')}</Form.Label>
              <Form.Control as="textarea" rows={3} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>
            {t('labourDetails.cancel')}
          </Button>
          <Button variant="danger" onClick={() => setShowReportModal(false)}>
            {t('labourDetails.submitReport')}
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
            aria-label={t('labourDetails.closeModal')}
          >
            <FaTimesCircle size={24} />
          </button>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default LabourDetailsPage; 