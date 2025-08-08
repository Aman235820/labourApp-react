import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { bookLabour } from '../../services/BookingService';
import { labourService } from '../../services/labourService';
import { useTranslation } from 'react-i18next';

const BookingModal = ({ 
  show = false, 
  onHide = () => {}, 
  labour = null, 
  serviceCategory = '', 
  onBookingSuccess = () => {} 
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
  const [loadingWorkingHours, setLoadingWorkingHours] = useState(false);
  const [additionalLabourDetails, setAdditionalLabourDetails] = useState(null);
  const [loadingAdditionalDetails, setLoadingAdditionalDetails] = useState(false);
  const [hasWorkingHours, setHasWorkingHours] = useState(false);

  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD format
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    return { currentDate, currentTime, now };
  };

  // Fetch additional labour details including working hours
  const fetchAdditionalLabourDetails = async () => {
    if (!labour?.labourId && !labour?.id) return;
    
    try {
      setLoadingAdditionalDetails(true);
      const labourId = labour.labourId || labour.id;
      const additionalDetails = await labourService.getAdditionalLabourDetails(labourId);
      
      console.log('BookingModal - Additional details API response:', additionalDetails);
      
      if (additionalDetails && additionalDetails.length > 0) {
        const latestSettings = additionalDetails[0];
        const profileData = latestSettings.profileSettings;
        
        if (profileData && profileData.workingHours) {
          console.log('BookingModal - Working hours found:', profileData.workingHours);
          setAdditionalLabourDetails(profileData);
          setHasWorkingHours(true);
        } else {
          console.log('BookingModal - No working hours found in profile settings');
          setAdditionalLabourDetails(null);
          setHasWorkingHours(false);
        }
      } else {
        console.log('BookingModal - No additional details found');
        setAdditionalLabourDetails(null);
        setHasWorkingHours(false);
      }
    } catch (error) {
      console.error('BookingModal - Error fetching additional details:', error);
      setAdditionalLabourDetails(null);
      setHasWorkingHours(false);
    } finally {
      setLoadingAdditionalDetails(false);
    }
  };

  // Get working hours for a specific date using the fetched profile data
  const getWorkingHoursForDate = (date) => {
    if (!date) return;
    
    try {
      setLoadingWorkingHours(true);
      
      // If we have working hours from additional details, use them
      if (hasWorkingHours && additionalLabourDetails?.workingHours) {
        const dayOfWeek = new Date(date).toLocaleDateString('en', { weekday: 'long' }).toLowerCase();
        const daySchedule = additionalLabourDetails.workingHours[dayOfWeek];
        
        if (daySchedule) {
          setWorkingHours({
            available: daySchedule.available,
            startTime: daySchedule.start,
            endTime: daySchedule.end,
            breaks: []
          });
        } else {
          setWorkingHours({
            available: false,
            startTime: '00:00',
            endTime: '00:00',
            breaks: []
          });
        }
      } else {
        // No working hours available, set to null to hide date/time fields
        setWorkingHours(null);
      }
      
      setExistingBookings([]);
      
    } catch (error) {
      console.error('Error getting working hours:', error);
      setWorkingHours(null);
      setExistingBookings([]);
    } finally {
      setLoadingWorkingHours(false);
    }
  };

  // Default working hours fallback
  const getDefaultWorkingHours = () => ({
    monday: { start: "09:00", end: "17:00", available: true },
    tuesday: { start: "09:00", end: "17:00", available: true },
    wednesday: { start: "09:00", end: "17:00", available: true },
    thursday: { start: "09:00", end: "17:00", available: true },
    friday: { start: "09:00", end: "17:00", available: true },
    saturday: { start: "09:00", end: "17:00", available: true },
    sunday: { start: "00:00", end: "00:00", available: false }
  });

  // Get day name from date
  const getDayNameFromDate = (dateString) => {
    const date = new Date(dateString);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  };

  // Generate available time slots (30-minute intervals)
  const generateTimeSlots = () => {
    if (!workingHours || !workingHours.available || !bookingData.date) return [];
    
    const slots = [];
    const { currentDate, currentTime, now } = getCurrentDateTime();
    
    // Parse working hours
    const [startHour, startMinute] = workingHours.startTime.split(':').map(Number);
    const [endHour, endMinute] = workingHours.endTime.split(':').map(Number);
    
    // Calculate actual start time
    let actualStartHour = startHour;
    let actualStartMinute = startMinute;
    
    // If booking for today, apply 1-hour advance booking rule
    if (bookingData.date === currentDate) {
      const currentHour = now.getHours();
      const currentMinutes = now.getMinutes();
      
      // Calculate minimum start time (current time + 1 hour)
      let minStartHour, minStartMinute;
      if (currentMinutes >= 30) {
        minStartHour = currentHour + 2;
        minStartMinute = 0;
      } else {
        minStartHour = currentHour + 1;
        minStartMinute = 30;
      }
      
      // Use the later of working hours start or minimum booking time
      const workingStartTime = startHour * 60 + startMinute;
      const minBookingTime = minStartHour * 60 + minStartMinute;
      
      if (minBookingTime > workingStartTime) {
        actualStartHour = minStartHour;
        actualStartMinute = minStartMinute;
      }
    }
    
    // Generate slots within working hours
    const endTime = endHour * 60 + endMinute;
    let currentSlotTime = actualStartHour * 60 + actualStartMinute;
    
    while (currentSlotTime <= endTime) {
      const hour = Math.floor(currentSlotTime / 60);
      const minute = currentSlotTime % 60;
      
      // Don't exceed end time
      if (hour > endHour || (hour === endHour && minute > endMinute)) {
        break;
      }
      
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
        const currentMinutes = hour * 60 + minute;
        return currentMinutes >= breakStartMinutes && currentMinutes < breakEndMinutes;
      });
      
      if (!isBooked && !isBreakTime) {
        slots.push(timeString);
      }
      
      currentSlotTime += 30; // Add 30 minutes
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

  // Determine if there are selectable slots for the chosen date
  const hasAvailableSlots =
    Boolean(bookingData.date) && Boolean(workingHours?.available) && generateTimeSlots().length > 0;

  // Auto-dismiss success message after 3 seconds
  useEffect(() => {
    if (bookingStatus && bookingStatus.type === 'success') {
      const timer = setTimeout(() => setBookingStatus(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [bookingStatus]);

  // Reset form when modal opens and fetch additional details
  useEffect(() => {
    if (show && labour) {
      setBookingData({
        date: '',
        time: '',
        description: '',
        urgency: 'normal'
      });
      setBookingStatus(null);
      setWorkingHours(null);
      setHasWorkingHours(false);
      
      // Fetch additional labour details including working hours
      fetchAdditionalLabourDetails();
    }
  }, [show, labour]);

  // Get working hours when booking date changes (only if we have working hours available)
  useEffect(() => {
    if (bookingData.date && hasWorkingHours) {
      getWorkingHoursForDate(bookingData.date);
    } else if (bookingData.date && !hasWorkingHours) {
      // If no working hours available, clear the working hours state
      setWorkingHours(null);
    }
  }, [bookingData.date, hasWorkingHours, additionalLabourDetails]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      alert(t('bookingModal.pleaseLoginToBook'));
      navigate('/register');
      return;
    }

    // Validate form data
    if (!bookingData.date) {
      alert(t('bookingModal.pleaseSelectPreferredDate'));
      return;
    }

    // Time slot is required only when available
    if (hasAvailableSlots && !bookingData.time) {
      alert(t('bookingModal.pleaseSelectPreferredTimeSlot'));
      return;
    }



    // Validate date is not in the past
    const { currentDate } = getCurrentDateTime();
    if (bookingData.date < currentDate) {
      alert(t('bookingModal.pleaseSelectDateFromToday'));
      return;
    }

    // Validate time is not in the past for today's bookings
    if (bookingData.time && !isValidTime(bookingData.time, bookingData.date)) {
      alert(t('bookingModal.pleaseSelectFutureTimeSlot'));
      return;
    }

    try {
      setIsBooking(true);
      setBookingStatus(null);
      
      const userData = JSON.parse(storedUser);
      
      // Prepare booking data
      const bookingPayload = {
        userId: userData.userId,
        labourId: labour.labourId || labour.id,
        labourSkill: serviceCategory,
        preferredDate: bookingData.date,
        preferredTime: bookingData.time || null,
        workDescription: bookingData.description,
        urgencyLevel: bookingData.urgency
      };
      
      // Make the booking API call
      const response = await bookLabour(bookingPayload);
      
      if (response && !response.hasError) {
        setBookingStatus({
          type: 'success',
          message: t('bookingModal.labourSuccessfullyBooked')
        });
        
        // Show alert with generic success message
        alert(t('bookingModal.labourSuccessfullyBooked'));
        
        // Call success callback if provided
        if (onBookingSuccess) {
          onBookingSuccess(response);
        }
        
        // Close modal and navigate
        setTimeout(() => {
          onHide();
          navigate('/');
        }, 1000);
      } else {
        setBookingStatus({
          type: 'danger',
          message: t('bookingModal.bookingFailed')
        });
      }
    } catch (error) {
      console.error('Booking error:', error);
      setBookingStatus({
        type: 'danger',
        message: error.message || t('bookingModal.bookingFailedTryAgain')
      });
    } finally {
      setIsBooking(false);
    }
  };

  if (!show || !labour) {
    return null;
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('bookingModal.bookLabourTitle')} {labour.labourName}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {bookingStatus && (
          <Alert 
            variant={bookingStatus.type} 
            onClose={() => setBookingStatus(null)} 
            dismissible
          >
            {bookingStatus.message}
          </Alert>
        )}
        
        <div className="booking-confirmation mb-4">
          <div className="text-center">
            <FaCalendarAlt className="text-primary mb-3" size={48} />
            <h5>{t('bookingModal.confirmYourBooking')}</h5>
            <p className="text-muted">
              {t('bookingModal.areYouSureToBookPrefix')} <strong>{labour.labourName}</strong> {t('bookingModal.for')} <strong>{serviceCategory}</strong>?
            </p>
            <div className="booking-details bg-light p-3 rounded">
              <div className="row text-start">
                <div className="col-6">
                  <strong>{t('bookingModal.labour')}:</strong> {labour.labourName}
                </div>
                <div className="col-6">
                  <strong>{t('bookingModal.service')}:</strong> {serviceCategory}
                </div>
                <div className="col-6">
                  <strong>{t('bookingModal.contact')}:</strong> {labour.labourMobileNo}
                </div>
                <div className="col-6">
                  <strong>{t('bookingModal.rating')}:</strong> {labour.rating ? `${labour.rating} rating` : t('bookingModal.noRating')}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Form onSubmit={handleBookingSubmit}>
          {loadingAdditionalDetails && (
            <div className="mb-3 text-center">
              <Spinner animation="border" size="sm" className="me-2" />
              {t('bookingModal.loadingLabourAvailability')}
            </div>
          )}

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t('bookingModal.preferredDate')}</Form.Label>
                <Form.Control
                  type="date"
                  value={bookingData.date}
                  min={getMinDate()}
                  onChange={(e) => {
                    setBookingData({ ...bookingData, date: e.target.value, time: '' });
                  }}
                  required
                />
                <Form.Text className="text-muted">
                  {t('bookingModal.selectDateFromToday')}
                </Form.Text>
              </Form.Group>
            </Col>

            {hasAvailableSlots && (
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('bookingModal.preferredTimeSlot')}</Form.Label>
                  <Form.Select
                    value={bookingData.time}
                    onChange={(e) => setBookingData({ ...bookingData, time: e.target.value })}
                    disabled={!bookingData.date || loadingWorkingHours}
                    required={hasAvailableSlots}
                  >
                    <option value="">
                      {!bookingData.date
                        ? t('bookingModal.selectDateFirst')
                        : loadingWorkingHours
                        ? t('bookingModal.loadingAvailableSlots')
                        : t('bookingModal.chooseTimeSlot')}
                    </option>
                    {bookingData.date && !loadingWorkingHours && workingHours?.available &&
                      generateTimeSlots().map((slot, index) => (
                        <option key={index} value={slot}>
                          {slot} ({convertTo12Hour(slot)})
                        </option>
                      ))}
                  </Form.Select>
                  <Form.Text className="text-muted">
                    {t('bookingModal.availableSlotsBasedOnWorkingHours')}
                  </Form.Text>
                </Form.Group>
              </Col>
            )}
          </Row>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('bookingModal.workDescription')} <span className="text-muted">({t('bookingModal.workDescriptionOptional')})</span></Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={bookingData.description}
              onChange={(e) => setBookingData({...bookingData, description: e.target.value})}
              placeholder={t('bookingModal.describeWorkYouNeed')}
            />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>{t('bookingModal.urgencyLevel')}</Form.Label>
            <Form.Select
              value={bookingData.urgency}
              onChange={(e) => setBookingData({...bookingData, urgency: e.target.value})}
            >
              <option value="low">{t('bookingModal.lowWithinWeek')}</option>
              <option value="normal">{t('bookingModal.normalWithin2To3Days')}</option>
              <option value="high">{t('bookingModal.highWithin24Hours')}</option>
              <option value="urgent">{t('bookingModal.urgentAsap')}</option>
            </Form.Select>
          </Form.Group>
          
          <div className="d-grid gap-2">
            <Button
              variant="success"
              type="submit"
              size="lg"
              disabled={isBooking}
            >
              {isBooking ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {t('bookingModal.booking')}
                </>
              ) : (
                <>
                  <FaCalendarAlt className="me-2" />
                  {t('bookingModal.bookLabourButton')}
                </>
              )}
            </Button>
            {hasAvailableSlots && (
              <Button variant="outline-secondary" onClick={onHide}>
                {t('bookingModal.cancel')}
              </Button>
            )}
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

BookingModal.displayName = 'BookingModal';

export default BookingModal;