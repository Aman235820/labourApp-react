import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, Form, Spinner, Alert, ProgressBar, Tooltip, OverlayTrigger, Modal } from 'react-bootstrap';
import { 
  FaUser, FaPhone, FaTools, FaStar, FaSignOutAlt, FaCalendarAlt, 
  FaCheckCircle, FaClock, FaTimesCircle, FaHistory, FaSort, FaEdit, 
  FaIdCard, FaSync, FaChartLine, FaChartBar, FaAward, FaEye, 
  FaQuoteLeft, FaThumbsUp, FaUserTie, FaBusinessTime, FaHandshake, 
  FaTrashAlt, FaCog, FaList, FaInstagram, FaFacebook, FaYoutube, 
  FaCertificate, FaShieldAlt, FaHeadset, FaRupeeSign 
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { labourService } from '../services/labourService';
import axios from 'axios';
import UpdateLabourModal from './UpdateLabourModal';
import '../styles/LabourDashboard.css';

const LabourDashboard = () => {
  const location = useLocation();
  const [labourDetails, setLabourDetails] = useState(null);
  const [requestedServices, setRequestedServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [overallRating, setOverallRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isReviewsLoading, setIsReviewsLoading] = useState(false);
  const [isRatingsLoading, setIsRatingsLoading] = useState(false);
  const [isServicesRefreshing, setIsServicesRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    sortBy: 'reviewTime',
    sortOrder: 'desc'
  });
  const [bookingSortConfig, setBookingSortConfig] = useState({
    sortBy: 'bookingTime',
    sortOrder: 'desc'
  });
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const navigate = useNavigate();

  // Profile Settings State
  const [profileSettings, setProfileSettings] = useState({
    // Pricing & Payment
    pricingInfoEnabled: true, // Master switch for pricing section
    hourlyRates: {},
    pricingEnabled: {}, // Track which subservices have pricing enabled
    
    // Customer Experience
    satisfactionGuarantee: false,
    warrantyOnWork: false,
    warrantyDuration: '',
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
    
    // Social Proof
    socialMedia: {
      instagram: '',
      facebook: '',
      youtube: ''
    },
    socialMediaEnabled: false,
    certifications: [],
    certificationsEnabled: false,
    testimonialVideos: [],
    testimonialVideosEnabled: false
  });

  useEffect(() => {
    const storedDetails = localStorage.getItem('labour');
    if (!storedDetails) {
      navigate('/labourLogin');
      return;
    }
    
    const parsedDetails = JSON.parse(storedDetails);
    setLabourDetails(parsedDetails);
    setIsLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (labourDetails) {
      fetchRequestedServices(true);
      fetchReviews();
      fetchOverallRatings();
      
      // Set default pricing enabled for all subservices with default rates
      if (labourDetails.labourSubSkills && labourDetails.labourSubSkills.length > 0) {
        const defaultPricingEnabled = {};
        const defaultHourlyRates = {};
        
        labourDetails.labourSubSkills.forEach(subSkill => {
          const skillName = typeof subSkill === 'string' ? subSkill : subSkill.subSkillName || subSkill.name || subSkill;
          defaultPricingEnabled[skillName] = true;
          defaultHourlyRates[skillName] = {
            min: '100',
            max: '200'
          };
        });
        
        setProfileSettings(prev => ({
          ...prev,
          pricingEnabled: defaultPricingEnabled,
          hourlyRates: defaultHourlyRates
        }));
      }
    }
  }, [labourDetails]);

  useEffect(() => {
    if (labourDetails) {
      fetchReviews();
    }
  }, [sortConfig, labourDetails]);



  const fetchRequestedServices = async (initial = false) => {
    try {
      if (initial) {
        setIsLoading(true);
      } else {
        setIsServicesRefreshing(true);
      }
      
      const response = await labourService.getRequestedServices(labourDetails?.labourId);
      
      if (response && response.returnValue) {
        setRequestedServices(response.returnValue);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      if (initial) {
        setIsLoading(false);
      } else {
        setIsServicesRefreshing(false);
      }
    }
  };

  const fetchReviews = async () => {
    try {
      setIsReviewsLoading(true);
      const response = await labourService.getReviews(
        labourDetails?.labourId,
        sortConfig.sortBy,
        sortConfig.sortOrder
      );
      
      if (response && response.returnValue) {
        setReviews(response.returnValue);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setIsReviewsLoading(false);
    }
  };

  const fetchOverallRatings = async () => {
    try {
      setIsRatingsLoading(true);
      const response = await labourService.getOverallRatings(labourDetails?.labourId);
      
      if (response && response.returnValue && !response.hasError) {
        const rating = parseFloat(response.returnValue.overallRating) || 0;
        const count = parseInt(response.returnValue.ratingCount) || 0;
        
        setOverallRating(rating);
        setRatingCount(count);
      } else {
        setOverallRating(0);
        setRatingCount(0);
      }
    } catch (error) {
      console.error('Error fetching overall ratings:', error);
      setOverallRating(0);
      setRatingCount(0);
    } finally {
      setIsRatingsLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      setStatusUpdatingId(bookingId);
      const response = await labourService.updateBookingStatus(
        labourDetails.labourId,
        bookingId,
        newStatus
      );

      if (response && response.returnValue) {
        await fetchRequestedServices(false);
      }
    } catch (error) {
      console.error('Error updating service status:', error);
      setError('Failed to update service status');
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleSortChange = (e) => {
    const { name, value } = e.target;
    setSortConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBookingSortChange = (e) => {
    const { name, value } = e.target;
    setBookingSortConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('labour');
    navigate('/labourLogin');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    try {
      setIsLoading(true);
      await labourService.deleteLabour(labourDetails.labourId);
      localStorage.removeItem('labour');
      alert('Your account has been deleted.');
      navigate('/labourLogin');
    } catch (err) {
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDetails = () => {
    setShowUpdateModal(true);
  };

  const handleUpdateSuccess = (updatedDetails) => {
    setLabourDetails(updatedDetails);
  };

  const handleAadhaarVerification = () => {
    navigate('/aadhar');
  };

  // Profile Settings Handlers
  const handleProfileSettingsChange = (section, field, value) => {
    setProfileSettings(prev => {
      if (field === null) {
        // Handle direct boolean values (for checkboxes)
        return {
          ...prev,
          [section]: value
        };
      } else {
        // Handle nested object updates
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: value
          }
        };
      }
    });
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setProfileSettings(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: {
          ...prev.workingHours[day],
          [field]: value
        }
      }
    }));
  };

  const handleHourlyRateChange = (subSkill, field, value) => {
    setProfileSettings(prev => ({
      ...prev,
      hourlyRates: {
        ...prev.hourlyRates,
        [subSkill]: {
          ...prev.hourlyRates[subSkill],
          [field]: value
        }
      }
    }));
  };

  const handlePricingEnabledChange = (subSkill, enabled) => {
    setProfileSettings(prev => ({
      ...prev,
      pricingEnabled: {
        ...prev.pricingEnabled,
        [subSkill]: enabled
      },
      // Set default values when enabled, clear when disabled
      hourlyRates: {
        ...prev.hourlyRates,
        [subSkill]: enabled ? { min: '100', max: '200' } : { min: '', max: '' }
      }
    }));
  };

  const handleMasterPricingToggle = (enabled) => {
    if (!labourDetails?.labourSubSkills) return;
    
    // Create new pricing enabled state for all subservices
    const newPricingEnabled = {};
    const newHourlyRates = {};
    
    labourDetails.labourSubSkills.forEach(subSkill => {
      const skillName = typeof subSkill === 'string' ? subSkill : subSkill.subSkillName || subSkill.name || subSkill;
      newPricingEnabled[skillName] = enabled;
      
      if (enabled) {
        // Set default values when enabling
        newHourlyRates[skillName] = {
          min: '100',
          max: '200'
        };
      } else {
        // Clear values when disabling
        newHourlyRates[skillName] = { min: '', max: '' };
      }
    });

    setProfileSettings(prev => ({
      ...prev,
      pricingInfoEnabled: enabled,
      pricingEnabled: newPricingEnabled,
      hourlyRates: newHourlyRates
    }));
  };

  const handleCertificationAdd = () => {
    setProfileSettings(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { name: '', link: '', issueDate: '', id: Date.now() }
      ]
    }));
  };

  const handleCertificationChange = (index, field, value) => {
    setProfileSettings(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => 
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const handleCertificationRemove = (index) => {
    setProfileSettings(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleVideoAdd = () => {
    setProfileSettings(prev => ({
      ...prev,
      testimonialVideos: [
        ...prev.testimonialVideos,
        { title: '', url: '', id: Date.now() }
      ]
    }));
  };

  const handleVideoChange = (index, field, value) => {
    setProfileSettings(prev => ({
      ...prev,
      testimonialVideos: prev.testimonialVideos.map((video, i) => 
        i === index ? { ...video, [field]: value } : video
      )
    }));
  };

  const handleVideoRemove = (index) => {
    setProfileSettings(prev => ({
      ...prev,
      testimonialVideos: prev.testimonialVideos.filter((_, i) => i !== index)
    }));
  };

  const handleSocialMediaChange = (platform, value) => {
    setProfileSettings(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }));
  };

  // Validation functions
  const validatePricing = () => {
    const errors = [];
    
    // Only validate pricing if master pricing is enabled
    if (profileSettings.pricingInfoEnabled) {
      Object.entries(profileSettings.pricingEnabled).forEach(([subSkill, enabled]) => {
        if (enabled) {
          const rates = profileSettings.hourlyRates[subSkill];
          
          if (!rates || !rates.min || !rates.max || rates.min.trim() === '' || rates.max.trim() === '') {
            errors.push(`Please fill both min and max rates for ${subSkill}`);
          } else {
            const minRate = parseFloat(rates.min);
            const maxRate = parseFloat(rates.max);
            
            if (isNaN(minRate) || isNaN(maxRate) || minRate <= 0 || maxRate <= 0) {
              errors.push(`Please enter valid positive numbers for ${subSkill} rates`);
            } else if (minRate >= maxRate) {
              errors.push(`Min rate must be less than max rate for ${subSkill}`);
            }
          }
        }
      });
    }
    
    return errors;
  };

  const validateWorkingHours = () => {
    const errors = [];
    
    Object.entries(profileSettings.workingHours).forEach(([day, hours]) => {
      if (hours.available) {
        if (!hours.start || !hours.end) {
          errors.push(`Please set both start and end time for ${day.charAt(0).toUpperCase() + day.slice(1)}`);
        } else {
          // Convert time strings to minutes for comparison
          const startMinutes = timeToMinutes(hours.start);
          const endMinutes = timeToMinutes(hours.end);
          
          if (startMinutes >= endMinutes) {
            errors.push(`Start time must be earlier than end time for ${day.charAt(0).toUpperCase() + day.slice(1)}`);
          }
        }
      }
    });
    
    return errors;
  };

  const timeToMinutes = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const validateCustomerExperience = () => {
    const errors = [];
    
    // Validate warranty duration if warranty is enabled
    if (profileSettings.warrantyOnWork) {
      if (!profileSettings.warrantyDuration || profileSettings.warrantyDuration.trim() === '') {
        errors.push('Please provide warranty duration details when warranty is enabled');
      }
    }
    
    // Validate emergency contact if provided
    if (profileSettings.emergencyContact && profileSettings.emergencyContact.trim() !== '') {
      // Basic phone number validation (should contain numbers)
      const phoneRegex = /\d/;
      if (!phoneRegex.test(profileSettings.emergencyContact)) {
        errors.push('Emergency contact should contain valid contact information');
      }
    }
    
    return errors;
  };

  const validateSocialMedia = () => {
    const errors = [];
    
    if (profileSettings.socialMediaEnabled) {
      const hasAnyValidUrl = Object.values(profileSettings.socialMedia).some(url => 
        url && url.trim() !== '' && url.startsWith('http')
      );
      
      if (!hasAnyValidUrl) {
        errors.push('Please provide at least one valid social media URL when social media is enabled');
      }
      
      // Validate individual URLs if provided
      Object.entries(profileSettings.socialMedia).forEach(([platform, url]) => {
        if (url && url.trim() !== '') {
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            errors.push(`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL must start with http:// or https://`);
          }
        }
      });
    }
    
    return errors;
  };

  const validateCertifications = () => {
    const errors = [];
    
    if (profileSettings.certificationsEnabled) {
      if (profileSettings.certifications.length === 0) {
        errors.push('Please add at least one certification when certifications are enabled');
      } else {
        profileSettings.certifications.forEach((cert, index) => {
          if (!cert.name || cert.name.trim() === '') {
            errors.push(`Please provide a name for certification #${index + 1}`);
          }
          if (cert.link && cert.link.trim() !== '' && !cert.link.startsWith('http')) {
            errors.push(`Certification #${index + 1} link must start with http:// or https://`);
          }
        });
      }
    }
    
    return errors;
  };

  const validateTestimonialVideos = () => {
    const errors = [];
    
    if (profileSettings.testimonialVideosEnabled) {
      if (profileSettings.testimonialVideos.length === 0) {
        errors.push('Please add at least one testimonial video when testimonial videos are enabled');
      } else {
        profileSettings.testimonialVideos.forEach((video, index) => {
          if (!video.title || video.title.trim() === '') {
            errors.push(`Please provide a title for testimonial video #${index + 1}`);
          }
          if (!video.url || video.url.trim() === '') {
            errors.push(`Please provide a URL for testimonial video #${index + 1}`);
          } else if (!video.url.startsWith('http')) {
            errors.push(`Testimonial video #${index + 1} URL must start with http:// or https://`);
          }
        });
      }
    }
    
    return errors;
  };

  const getAllValidationErrors = useMemo(() => {
    return {
      pricing: validatePricing(),
      workingHours: validateWorkingHours(),
      customerExperience: validateCustomerExperience(),
      socialMedia: validateSocialMedia(),
      certifications: validateCertifications(),
      videos: validateTestimonialVideos()
    };
  }, [profileSettings]);

  const hasValidationErrors = useMemo(() => {
    return Object.values(getAllValidationErrors).some(errorArray => errorArray.length > 0);
  }, [getAllValidationErrors]);

  const hasAnySettingsEnabled = () => {
    // Check if pricing master switch is enabled (regardless of individual subservices)
    const hasPricingEnabled = profileSettings.pricingInfoEnabled;
    
    // Check if any customer experience features are enabled
    const hasCustomerFeatures = profileSettings.satisfactionGuarantee || 
                                profileSettings.warrantyOnWork || 
                                profileSettings.followUpService || 
                                (profileSettings.emergencyContact && profileSettings.emergencyContact.trim());
    
    // Check if working hours are enabled (any day is available)
    const hasWorkingHours = Object.values(profileSettings.workingHours).some(day => day.available);
    
    // Check if social media master switch is enabled
    const hasSocialMedia = profileSettings.socialMediaEnabled;
    
    // Check if certifications master switch is enabled
    const hasCertifications = profileSettings.certificationsEnabled;
    
    // Check if testimonial videos master switch is enabled
    const hasVideos = profileSettings.testimonialVideosEnabled;
    
    return hasPricingEnabled || hasCustomerFeatures || hasWorkingHours || hasSocialMedia || hasCertifications || hasVideos;
  };

  const handleSaveProfileSettings = async () => {
    try {
      setIsSavingProfile(true);
      
      // Validate all sections before saving
      const allErrors = Object.values(getAllValidationErrors).flat();
      
      if (allErrors.length > 0) {
        alert('Validation Errors:\n\n' + allErrors.map((error, index) => `${index + 1}. ${error}`).join('\n'));
        return;
      }
      
      // Prepare the base data object for the API
      const apiData = {
        labourId: labourDetails.labourId,
        timestamp: new Date().toISOString(),
        profileSettings: {}
      };

      // Only include hourly rates if master pricing is enabled
      if (profileSettings.pricingInfoEnabled) {
        const enabledRates = {};
        Object.entries(profileSettings.pricingEnabled).forEach(([skill, enabled]) => {
          if (enabled && profileSettings.hourlyRates[skill]) {
            const rates = profileSettings.hourlyRates[skill];
            if (rates.min && rates.max) {
              enabledRates[skill] = rates;
            }
          }
        });
        
        if (Object.keys(enabledRates).length > 0) {
          apiData.profileSettings.hourlyRates = enabledRates;
        }
      }

      // Customer Experience Features - only include if enabled/set
      if (profileSettings.satisfactionGuarantee) {
        apiData.profileSettings.satisfactionGuarantee = true;
      }
      
      if (profileSettings.warrantyOnWork) {
        apiData.profileSettings.warrantyOnWork = true;
        if (profileSettings.warrantyDuration && profileSettings.warrantyDuration.trim()) {
          apiData.profileSettings.warrantyDuration = profileSettings.warrantyDuration.trim();
        }
      }
      
      if (profileSettings.followUpService) {
        apiData.profileSettings.followUpService = true;
      }
      
      if (profileSettings.emergencyContact && profileSettings.emergencyContact.trim()) {
        apiData.profileSettings.emergencyContact = profileSettings.emergencyContact.trim();
      }

      // Working Hours - always include as it's core functionality
      apiData.profileSettings.workingHours = profileSettings.workingHours;

      // Social Media - only include if enabled and has valid data
      if (profileSettings.socialMediaEnabled) {
        const socialMediaData = {};
        Object.entries(profileSettings.socialMedia).forEach(([platform, url]) => {
          if (url && url.trim()) {
            socialMediaData[platform] = url.trim();
          }
        });
        if (Object.keys(socialMediaData).length > 0) {
          apiData.profileSettings.socialMedia = socialMediaData;
        }
      }
      
      // Certifications - only include if enabled and has valid data
      if (profileSettings.certificationsEnabled && profileSettings.certifications.length > 0) {
        const validCertifications = profileSettings.certifications.filter(cert => 
          cert.name && cert.name.trim()
        );
        if (validCertifications.length > 0) {
          apiData.profileSettings.certifications = validCertifications;
        }
      }
      
      // Testimonial Videos - only include if enabled and has valid data
      if (profileSettings.testimonialVideosEnabled && profileSettings.testimonialVideos.length > 0) {
        const validVideos = profileSettings.testimonialVideos.filter(video => 
          video.title && video.title.trim() && video.url && video.url.trim()
        );
        if (validVideos.length > 0) {
          apiData.profileSettings.testimonialVideos = validVideos;
        }
      }

      console.log('Saving profile settings at:', new Date().toLocaleString());
      console.log('API Data:', apiData);

      // Make the API call using PATCH method
      const response = await axios.patch(
        'http://localhost:4000/labourapp/labour/updateAdditionalLabourData',
        apiData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data && (response.data.success || response.status === 200)) {
        alert('Profile settings saved successfully!');
        console.log('API Response:', response.data);
      } else {
        throw new Error('Failed to save profile settings');
      }
    } catch (error) {
      console.error('Error saving profile settings:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        alert(`Failed to save profile settings: ${error.response.data.message || 'Server error'}`);
      } else {
        alert('Failed to save profile settings. Please try again.');
      }
    } finally {
      setIsSavingProfile(false);
    }
  };

  const getStatusBadge = (statusCode) => {
    switch (statusCode) {
      case -1:
        return <Badge bg="danger" className="px-3 py-2"><FaTimesCircle className="me-1" /> Rejected</Badge>;
      case 1:
        return <Badge bg="warning" className="px-3 py-2"><FaClock className="me-1" /> Pending</Badge>;
      case 2:
        return <Badge bg="primary" className="px-3 py-2"><FaCheckCircle className="me-1" /> Accepted</Badge>;
      case 3:
        return <Badge bg="success" className="px-3 py-2"><FaClock className="me-1" /> Completed</Badge>;
      default:
        return <Badge bg="secondary" className="px-3 py-2"><FaClock className="me-1" /> Unknown</Badge>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      let date;
      
      // Handle DD-MM-YYYY format (convert to YYYY-MM-DD for proper parsing)
      if (dateString.match(/^\d{2}-\d{2}-\d{4}/)) {
        const parts = dateString.split(' ');
        const datePart = parts[0]; // "06-07-2025"
        const timePart = parts[1] || '00:00:00'; // "13:25:19" or default
        
        const [day, month, year] = datePart.split('-');
        const isoString = `${year}-${month}-${day}T${timePart}`;
        date = new Date(isoString);
      } else {
        // Handle YYYY-MM-DD format or other standard formats
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      // Format: DD MMM YY
      const day = date.getDate().toString().padStart(2, '0');
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[date.getMonth()];
      const year = date.getFullYear().toString().slice(-2);
      
      return `${day} ${month} ${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        className={index < rating ? 'star-filled' : 'star-empty'}
      />
    ));
  };

  const getSortedServices = () => {
    if (!requestedServices || requestedServices.length === 0) return [];
    
    const sorted = [...requestedServices].sort((a, b) => {
      const { sortBy, sortOrder } = bookingSortConfig;
      
      if (sortBy === 'bookingTime') {
        const dateA = new Date(a.bookingTime);
        const dateB = new Date(b.bookingTime);
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
      
      return 0;
    });
    
    return sorted;
  };

  // Analytics helper functions
  const getAnalytics = () => {
    const services = requestedServices || [];
    const total = services.length;
    const completed = services.filter(s => s.bookingStatusCode === 3).length;
    const accepted = services.filter(s => s.bookingStatusCode === 2).length;
    const pending = services.filter(s => s.bookingStatusCode === 1).length;
    const rejected = services.filter(s => s.bookingStatusCode === -1).length;
    
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    const acceptanceRate = total > 0 ? ((accepted + completed) / total) * 100 : 0;
    const responseRate = total > 0 ? ((total - pending) / total) * 100 : 0;
    const rejectionRate = total > 0 ? (rejected / total) * 100 : 0;
    
    return {
      total,
      completed,
      accepted,
      pending,
      rejected,
      completionRate,
      acceptanceRate,
      responseRate,
      rejectionRate
    };
  };

  const getRatingDistribution = () => {
    const reviewsList = reviews || [];
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    
    reviewsList.forEach(review => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating]++;
      }
    });
    
    return distribution;
  };

  const getRecentActivityData = () => {
    const services = requestedServices || [];
    const last30Days = services.filter(service => {
      const serviceDate = new Date(service.bookingTime);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return serviceDate >= thirtyDaysAgo;
    });
    
    return {
      recentBookings: last30Days.length,
      recentCompleted: last30Days.filter(s => s.bookingStatusCode === 3).length,
      recentRating: reviews && reviews.length > 0 ? 
        reviews.slice(0, 5).reduce((sum, r) => sum + r.rating, 0) / Math.min(5, reviews.length) : 0
    };
  };

  if (isLoading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!labourDetails) {
    return <Alert variant="warning">No labour details found</Alert>;
  }

  return (
    <Container fluid className="dashboard-container bg-light min-vh-100">
      {/* Professional Header */}
      <div className="dashboard-header bg-white shadow-sm border-bottom">
        <Container>
          <Row className="py-3 py-md-4">
            <Col>
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                <div className="d-flex align-items-center mb-3 mb-md-0 w-100 w-md-auto">
                  <div className="profile-badge me-3 me-md-4">
                    <div className="avatar-professional">
                      <FaUserTie className="text-primary" size={24} />
                    </div>
                  </div>
                  <div className="flex-grow-1">
                    <h1 className="h4 h-md-3 mb-1 fw-bold text-dark">{labourDetails.labourName}</h1>
                    <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center text-muted mb-2 gap-2 gap-sm-3">
                      <span className="small">ID: {labourDetails.labourId}</span>
                      <Badge bg="primary" className="me-0 me-sm-3">{labourDetails.labourSkill}</Badge>
                      <div className="d-flex align-items-center">
                        <FaStar className="text-warning me-1" size={14} />
                        <span className="fw-semibold">{overallRating.toFixed(1)}</span>
                        <span className="text-muted ms-1">({ratingCount})</span>
                      </div>
                    </div>
                    {/* Subskills Section */}
                    {labourDetails.labourSubSkills && labourDetails.labourSubSkills.length > 0 && (
                      <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center">
                        <div className="d-flex align-items-center mb-1 mb-sm-0">
                          <FaList className="text-muted me-2" size={12} />
                          <span className="text-muted small me-2">Specializations:</span>
                        </div>
                        <div className="d-flex flex-wrap gap-1">
                          {labourDetails.labourSubSkills.map((subSkill, index) => (
                            <Badge 
                              key={index} 
                              bg="light" 
                              text="dark" 
                              className="px-2 py-1 small"
                              style={{ fontSize: '0.7rem' }}
                            >
                              {typeof subSkill === 'string' ? subSkill : subSkill.subSkillName || subSkill.name || subSkill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="d-flex gap-2 align-self-stretch align-self-md-auto">
                  <Button 
                    variant="outline-primary" 
                    onClick={handleUpdateDetails}
                    className="d-flex align-items-center justify-content-center flex-grow-1 flex-md-grow-0"
                    size="sm"
                  >
                    <FaEdit className="me-1 me-md-2" size={14} />
                    <span className="d-none d-sm-inline">Edit Profile</span>
                    <span className="d-inline d-sm-none">Edit</span>
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    onClick={handleLogout}
                    className="d-flex align-items-center justify-content-center flex-grow-1 flex-md-grow-0"
                    size="sm"
                  >
                    <FaSignOutAlt className="me-1 me-md-2" size={14} />
                    <span className="d-none d-sm-inline">Logout</span>
                    <span className="d-inline d-sm-none">Exit</span>
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-2 py-md-4">
        {/* Analytics Dashboard */}
        <Row className="mb-3 mb-md-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-3 p-md-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="mb-0 fw-bold text-dark">
                    <FaChartLine className="me-2 text-primary" />
                    Performance Analytics
                  </h4>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => {
                      fetchRequestedServices(false);
                      fetchOverallRatings();
                    }}
                    disabled={isServicesRefreshing || isRatingsLoading}
                  >
                    {(isServicesRefreshing || isRatingsLoading) ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <FaSync className="me-2" />
                        Refresh Data
                      </>
                    )}
                  </Button>
                </div>
                
                {isRatingsLoading || isServicesRefreshing ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" className="text-primary mb-3" />
                    <p className="text-muted">Loading analytics...</p>
                  </div>
                ) : (
                  <Row>
                    <Col lg={12}>
                      <Row className="g-3">
                        {(() => {
                          const analytics = getAnalytics();
                          const activity = getRecentActivityData();
                          return (
                            <>
                              <Col xs={6} md={2}>
                                <div className="metric-card h-100 p-2 p-md-3 bg-primary bg-opacity-10 rounded">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                      <div className="metric-value text-primary fw-bold h5 h-md-4 mb-1">
                                        {analytics.total}
                                      </div>
                                      <div className="metric-label text-muted small">Total Bookings</div>
                                    </div>
                                    <FaBusinessTime className="text-primary opacity-75 d-none d-md-block" size={20} />
                                    <FaBusinessTime className="text-primary opacity-75 d-block d-md-none" size={16} />
                                  </div>
                                </div>
                              </Col>
                              <Col xs={6} md={2}>
                                <div className="metric-card h-100 p-2 p-md-3 bg-success bg-opacity-10 rounded">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                      <div className="metric-value text-success fw-bold h5 h-md-4 mb-1">
                                        {analytics.completionRate.toFixed(1)}%
                                      </div>
                                      <div className="metric-label text-muted small">Completion Rate</div>
                                    </div>
                                    <FaCheckCircle className="text-success opacity-75 d-none d-md-block" size={20} />
                                    <FaCheckCircle className="text-success opacity-75 d-block d-md-none" size={16} />
                                  </div>
                                  <ProgressBar 
                                    variant="success" 
                                    now={analytics.completionRate} 
                                    className="mt-2" 
                                    style={{ height: '3px' }}
                                  />
                                </div>
                              </Col>
                              <Col xs={6} md={2}>
                                <div className="metric-card h-100 p-2 p-md-3 bg-info bg-opacity-10 rounded">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                      <div className="metric-value text-info fw-bold h5 h-md-4 mb-1">
                                        {analytics.acceptanceRate.toFixed(1)}%
                                      </div>
                                      <div className="metric-label text-muted small">Acceptance Rate</div>
                                    </div>
                                    <FaHandshake className="text-info opacity-75 d-none d-md-block" size={20} />
                                    <FaHandshake className="text-info opacity-75 d-block d-md-none" size={16} />
                                  </div>
                                  <ProgressBar 
                                    variant="info" 
                                    now={analytics.acceptanceRate} 
                                    className="mt-2" 
                                    style={{ height: '3px' }}
                                  />
                                </div>
                              </Col>
                              <Col xs={6} md={3}>
                                <div className="metric-card h-100 p-2 p-md-3 bg-danger bg-opacity-10 rounded">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                      <div className="metric-value text-danger fw-bold h5 h-md-4 mb-1">
                                        {analytics.rejectionRate.toFixed(1)}%
                                      </div>
                                      <div className="metric-label text-muted small">Rejection Rate</div>
                                    </div>
                                    <FaTimesCircle className="text-danger opacity-75 d-none d-md-block" size={20} />
                                    <FaTimesCircle className="text-danger opacity-75 d-block d-md-none" size={16} />
                                  </div>
                                  <ProgressBar 
                                    variant="danger" 
                                    now={analytics.rejectionRate} 
                                    className="mt-2" 
                                    style={{ height: '3px' }}
                                  />
                                </div>
                              </Col>
                              <Col xs={12} md={3}>
                                <div className="metric-card h-100 p-2 p-md-3 bg-warning bg-opacity-10 rounded">
                                  <div className="d-flex align-items-center justify-content-between">
                                    <div>
                                      <div className="metric-value text-warning fw-bold h5 h-md-4 mb-1">
                                        {activity.recentBookings}
                                      </div>
                                      <div className="metric-label text-muted small">Recent Bookings</div>
                                      <div className="metric-sublabel text-muted" style={{ fontSize: '0.7rem' }}>
                                        Last 30 Days
                                      </div>
                                    </div>
                                    <FaChartBar className="text-warning opacity-75 d-none d-md-block" size={20} />
                                    <FaChartBar className="text-warning opacity-75 d-block d-md-none" size={16} />
                                  </div>
                                </div>
                              </Col>
                            </>
                          );
                        })()}
                      </Row>
                    </Col>
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Pending Actions - Professional Table */}
        <Row className="mb-3 mb-md-4">
          <Col>
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-3 p-md-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                  <h4 className="mb-0 fw-bold text-dark">
                    <FaClock className="me-2 text-primary" />
                    Service Requests
                  </h4>
                  <div className="d-flex align-items-center gap-2 gap-md-3">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => fetchRequestedServices(false)}
                      disabled={isServicesRefreshing}
                      className="d-flex align-items-center"
                    >
                      {isServicesRefreshing ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-1 me-md-2" />
                          <span className="d-none d-sm-inline">Refreshing...</span>
                          <span className="d-inline d-sm-none">...</span>
                        </>
                      ) : (
                        <>
                          <FaSync className="me-1 me-md-2" />
                          <span className="d-none d-sm-inline">Refresh</span>
                          <span className="d-inline d-sm-none">Sync</span>
                        </>
                      )}
                    </Button>
                    <Badge bg="warning" className="px-2 px-md-3 py-1 py-md-2">
                      {(requestedServices || []).filter(service => service.bookingStatusCode === 1).length} Pending
                    </Badge>
                  </div>
                </div>

                {error && (
                  <Alert variant="danger" className="mb-4">
                    <FaTimesCircle className="me-2" />
                    {error}
                  </Alert>
                )}

                {(requestedServices || []).length > 0 ? (
                  <>
                    {/* Desktop Table */}
                    <div className="table-responsive d-none d-lg-block">
                      <Table className="table-modern">
                        <thead>
                          <tr>
                            <th className="border-0 bg-light fw-semibold text-dark">Booking</th>
                            <th className="border-0 bg-light fw-semibold text-dark">Client</th>
                            <th className="border-0 bg-light fw-semibold text-dark">Service</th>
                            <th className="border-0 bg-light fw-semibold text-dark">Date</th>
                            <th className="border-0 bg-light fw-semibold text-dark">Status</th>
                            <th className="border-0 bg-light fw-semibold text-dark text-center">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(requestedServices || []).map((service) => (
                            <tr key={service.bookingId} className="border-bottom">
                              <td className="py-3">
                                <div className="fw-bold text-primary">#{service.bookingId}</div>
                                <small className="text-muted">ID</small>
                              </td>
                              <td className="py-3">
                                <div className="d-flex align-items-center">
                                  <div className="avatar-sm bg-light rounded-circle me-3 d-flex align-items-center justify-content-center">
                                    <FaUser className="text-muted" size={14} />
                                  </div>
                                  <div>
                                    <div className="fw-semibold">{service.userName || 'Anonymous'}</div>
                                    <small className="text-muted">{service.userMobileNumber}</small>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3">
                                <Badge bg="primary" className="px-3 py-2">
                                  {service.labourSkill}
                                </Badge>
                              </td>
                              <td className="py-3">
                                <div className="fw-semibold">{formatDate(service.bookingTime)}</div>
                                <small className="text-muted">Requested</small>
                              </td>
                              <td className="py-3">
                                {getStatusBadge(service.bookingStatusCode)}
                              </td>
                              <td className="py-3 text-center">
                                <div className="d-flex gap-2 justify-content-center">
                                  {service.bookingStatusCode === 1 && (
                                    <>
                                      <Button 
                                        variant="success" 
                                        size="sm"
                                        onClick={() => handleStatusUpdate(service.bookingId, 2)}
                                        disabled={statusUpdatingId === service.bookingId}
                                        className="px-3"
                                      >
                                        {statusUpdatingId === service.bookingId ? (
                                          <Spinner as="span" animation="border" size="sm" />
                                        ) : (
                                          <>
                                            <FaCheckCircle className="me-1" size={12} />
                                            Accept
                                          </>
                                        )}
                                      </Button>
                                      <Button 
                                        variant="outline-danger" 
                                        size="sm"
                                        onClick={() => handleStatusUpdate(service.bookingId, -1)}
                                        disabled={statusUpdatingId === service.bookingId}
                                        className="px-3"
                                      >
                                        {statusUpdatingId === service.bookingId ? (
                                          <Spinner as="span" animation="border" size="sm" />
                                        ) : (
                                          <>
                                            <FaTimesCircle className="me-1" size={12} />
                                            Decline
                                          </>
                                        )}
                                      </Button>
                                    </>
                                  )}
                                  {service.bookingStatusCode === 2 && (
                                    <Button 
                                      variant="primary" 
                                      size="sm"
                                      onClick={() => handleStatusUpdate(service.bookingId, 3)}
                                      disabled={statusUpdatingId === service.bookingId}
                                      className="px-3"
                                    >
                                      {statusUpdatingId === service.bookingId ? (
                                        <Spinner as="span" animation="border" size="sm" />
                                      ) : (
                                        <>
                                          <FaCheckCircle className="me-1" size={12} />
                                          Complete
                                        </>
                                      )}
                                    </Button>
                                  )}
                                  {service.bookingStatusCode === 3 && (
                                    <Badge bg="success" className="px-3 py-2">
                                      <FaCheckCircle className="me-1" size={12} />
                                      Completed
                                    </Badge>
                                  )}
                                  {service.bookingStatusCode === -1 && (
                                    <Button 
                                      variant="outline-success" 
                                      size="sm"
                                      onClick={() => handleStatusUpdate(service.bookingId, 2)}
                                      disabled={statusUpdatingId === service.bookingId}
                                      className="px-3"
                                    >
                                      {statusUpdatingId === service.bookingId ? (
                                        <Spinner as="span" animation="border" size="sm" />
                                      ) : (
                                        <>
                                          <FaCheckCircle className="me-1" size={12} />
                                          Reconsider
                                        </>
                                      )}
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                    
                    {/* Mobile Card Layout */}
                    <div className="d-block d-lg-none">
                      <div className="mobile-services-list">
                        {(requestedServices || []).map((service) => (
                          <div key={service.bookingId} className="mobile-service-card p-3 mb-3 border rounded bg-white">
                            <div className="d-flex justify-content-between align-items-start mb-3">
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm bg-light rounded-circle me-3 d-flex align-items-center justify-content-center">
                                  <FaUser className="text-muted" size={14} />
                                </div>
                                <div>
                                  <div className="fw-bold text-primary small">#{service.bookingId}</div>
                                  <div className="fw-semibold small">{service.userName || 'Anonymous'}</div>
                                  <small className="text-muted">{service.userMobileNumber}</small>
                                </div>
                              </div>
                              {getStatusBadge(service.bookingStatusCode)}
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center mb-3">
                              <Badge bg="primary" className="px-2 py-1">
                                {service.labourSkill}
                              </Badge>
                              <div className="text-end">
                                <div className="fw-semibold small">{formatDate(service.bookingTime)}</div>
                                <small className="text-muted">Requested</small>
                              </div>
                            </div>
                            
                            <div className="d-flex gap-2 justify-content-center">
                              {service.bookingStatusCode === 1 && (
                                <>
                                  <Button 
                                    variant="success" 
                                    size="sm"
                                    onClick={() => handleStatusUpdate(service.bookingId, 2)}
                                    disabled={statusUpdatingId === service.bookingId}
                                    className="flex-grow-1"
                                  >
                                    {statusUpdatingId === service.bookingId ? (
                                      <Spinner as="span" animation="border" size="sm" />
                                    ) : (
                                      <>
                                        <FaCheckCircle className="me-1" size={12} />
                                        Accept
                                      </>
                                    )}
                                  </Button>
                                  <Button 
                                    variant="outline-danger" 
                                    size="sm"
                                    onClick={() => handleStatusUpdate(service.bookingId, -1)}
                                    disabled={statusUpdatingId === service.bookingId}
                                    className="flex-grow-1"
                                  >
                                    {statusUpdatingId === service.bookingId ? (
                                      <Spinner as="span" animation="border" size="sm" />
                                    ) : (
                                      <>
                                        <FaTimesCircle className="me-1" size={12} />
                                        Decline
                                      </>
                                    )}
                                  </Button>
                                </>
                              )}
                              {service.bookingStatusCode === 2 && (
                                <Button 
                                  variant="primary" 
                                  size="sm"
                                  onClick={() => handleStatusUpdate(service.bookingId, 3)}
                                  disabled={statusUpdatingId === service.bookingId}
                                  className="w-100"
                                >
                                  {statusUpdatingId === service.bookingId ? (
                                    <Spinner as="span" animation="border" size="sm" />
                                  ) : (
                                    <>
                                      <FaCheckCircle className="me-1" size={12} />
                                      Mark as Complete
                                    </>
                                  )}
                                </Button>
                              )}
                              {service.bookingStatusCode === 3 && (
                                <div className="w-100 text-center">
                                  <Badge bg="success" className="px-3 py-2">
                                    <FaCheckCircle className="me-1" size={12} />
                                    Completed
                                  </Badge>
                                </div>
                              )}
                              {service.bookingStatusCode === -1 && (
                                <Button 
                                  variant="outline-success" 
                                  size="sm"
                                  onClick={() => handleStatusUpdate(service.bookingId, 2)}
                                  disabled={statusUpdatingId === service.bookingId}
                                  className="w-100"
                                >
                                  {statusUpdatingId === service.bookingId ? (
                                    <Spinner as="span" animation="border" size="sm" />
                                  ) : (
                                    <>
                                      <FaCheckCircle className="me-1" size={12} />
                                      Reconsider
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-5">
                    <FaClock className="text-muted mb-3" size={48} />
                    <h5 className="text-muted mb-2">No Service Requests</h5>
                    <p className="text-muted">You'll see new booking requests here</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Reviews and Booking History */}
        <Row>
          <Col lg={8} className="mb-3 mb-md-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3 p-md-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                  <h4 className="mb-0 fw-bold text-dark">
                    <FaStar className="me-2 text-warning" />
                    Customer Reviews
                  </h4>
                  <div className="d-flex gap-2 w-100 w-md-auto">
                    <Form.Select
                      name="sortBy"
                      value={sortConfig.sortBy}
                      onChange={handleSortChange}
                      size="sm"
                      className="border-0 bg-light flex-grow-1"
                    >
                      <option value="reviewTime">Latest First</option>
                      <option value="rating">By Rating</option>
                    </Form.Select>
                    <Form.Select
                      name="sortOrder"
                      value={sortConfig.sortOrder}
                      onChange={handleSortChange}
                      size="sm"
                      className="border-0 bg-light flex-grow-1"
                    >
                      <option value="desc">High to Low</option>
                      <option value="asc">Low to High</option>
                    </Form.Select>
                  </div>
                </div>

                {/* Rating Distribution */}
                {(reviews || []).length > 0 && (
                  <div className="mb-4 p-3 bg-light rounded">
                    <h6 className="mb-3 fw-semibold">Rating Distribution</h6>
                    <Row className="g-2">
                      {(() => {
                        const distribution = getRatingDistribution();
                        const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
                        return [5, 4, 3, 2, 1].map(rating => (
                          <Col key={rating} xs={12}>
                            <div className="d-flex align-items-center gap-2">
                              <div className="d-flex align-items-center" style={{ minWidth: '50px' }}>
                                <span className="me-1 small">{rating}</span>
                                <FaStar className="text-warning" size={12} />
                              </div>
                              <div className="flex-grow-1">
                                <ProgressBar
                                  variant={rating >= 4 ? 'success' : rating >= 3 ? 'warning' : 'danger'}
                                  now={total > 0 ? (distribution[rating] / total) * 100 : 0}
                                  style={{ height: '6px' }}
                                />
                              </div>
                              <span className="text-muted small" style={{ minWidth: '25px', textAlign: 'right' }}>
                                {distribution[rating]}
                              </span>
                            </div>
                          </Col>
                        ));
                      })()}
                    </Row>
                  </div>
                )}

                {/* Reviews List */}
                <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                  {(reviews || []).length > 0 ? (
                    <div className="reviews-list">
                      {(reviews || []).map((review, index) => (
                        <div key={index} className="review-card mb-3 p-3 p-md-4 bg-white border rounded shadow-sm">
                          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-3 gap-2">
                            <div className="d-flex align-items-center w-100">
                              <div className="avatar-lg bg-primary bg-opacity-10 rounded-circle me-3 d-flex align-items-center justify-content-center">
                                <FaUser className="text-primary" size={16} />
                              </div>
                              <div className="flex-grow-1">
                                <h6 className="mb-1 fw-semibold small">
                                  {review.userName || 'Anonymous Customer'}
                                </h6>
                                <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-1 gap-sm-2">
                                  <div className="rating-stars">
                                    {[...Array(5)].map((_, i) => (
                                      <FaStar
                                        key={i}
                                        className={i < review.rating ? 'text-warning' : 'text-muted'}
                                        size={12}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-muted small">
                                    {formatDate(review.reviewTime)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Badge 
                              bg={review.rating >= 4 ? 'success' : review.rating >= 3 ? 'warning' : 'danger'}
                              className="px-2 py-1 align-self-end align-self-md-start"
                            >
                              {review.rating}/5
                            </Badge>
                          </div>
                          
                          {review.review && (
                            <div className="review-content">
                              <div className="position-relative">
                                <FaQuoteLeft className="text-muted position-absolute d-none d-md-block" 
                                  style={{ top: '-5px', left: '-5px', fontSize: '20px', opacity: 0.3 }} />
                                <p className="mb-0 ps-0 ps-md-3" style={{ 
                                  fontSize: '0.9rem',
                                  lineHeight: '1.5',
                                  color: '#555'
                                }}>
                                  {review.review}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : isReviewsLoading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" className="text-primary mb-3" />
                      <p className="text-muted">Loading reviews...</p>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <FaStar className="text-muted mb-3" size={48} />
                      <h5 className="text-muted mb-2">No Reviews Yet</h5>
                      <p className="text-muted">Customer reviews will appear here</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4} className="mb-3 mb-md-4">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-3 p-md-4">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
                  <h4 className="mb-0 fw-bold text-dark">
                    <FaHistory className="me-2 text-primary" />
                    Recent Activity
                  </h4>
                  <div className="d-flex gap-2 w-100 w-md-auto">
                    <Form.Select
                      name="sortOrder"
                      value={bookingSortConfig.sortOrder}
                      onChange={handleBookingSortChange}
                      size="sm"
                      className="border-0 bg-light flex-grow-1"
                    >
                      <option value="desc">Latest First</option>
                      <option value="asc">Oldest First</option>
                    </Form.Select>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => fetchRequestedServices(false)}
                      disabled={isServicesRefreshing}
                      className="flex-shrink-0"
                    >
                      {isServicesRefreshing ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <FaSync size={12} />
                      )}
                    </Button>
                  </div>
                </div>

                <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  {(requestedServices || []).length > 0 ? (
                    <div className="activity-list">
                      {getSortedServices().slice(0, 10).map((service) => (
                        <div key={service.bookingId} className="activity-item p-3 mb-3 border rounded bg-white">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center">
                              <div className="activity-icon me-3">
                                <div className={`rounded-circle p-2 ${
                                  service.bookingStatusCode === 3 ? 'bg-success bg-opacity-10' :
                                  service.bookingStatusCode === 2 ? 'bg-primary bg-opacity-10' :
                                  service.bookingStatusCode === 1 ? 'bg-warning bg-opacity-10' :
                                  'bg-danger bg-opacity-10'
                                }`}>
                                  {service.bookingStatusCode === 3 ? <FaCheckCircle className="text-success" size={16} /> :
                                   service.bookingStatusCode === 2 ? <FaHandshake className="text-primary" size={16} /> :
                                   service.bookingStatusCode === 1 ? <FaClock className="text-warning" size={16} /> :
                                   <FaTimesCircle className="text-danger" size={16} />}
                                </div>
                              </div>
                              <div className="flex-grow-1">
                                <div className="fw-semibold small">#{service.bookingId}</div>
                                <div className="text-muted small">{service.userName || 'Anonymous'}</div>
                              </div>
                            </div>
                            {getStatusBadge(service.bookingStatusCode)}
                          </div>
                          
                          <div className="activity-details">
                            <div className="d-flex justify-content-between align-items-center">
                              <Badge bg="light" text="dark" className="px-2 py-1">
                                {service.labourSkill}
                              </Badge>
                              <small className="text-muted">
                                {formatDate(service.bookingTime)}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <FaHistory className="text-muted mb-3" size={48} />
                      <h5 className="text-muted mb-2">No Activity</h5>
                      <p className="text-muted">Booking history will appear here</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Account Management Section - Less Prominent */}
        <Row className="mt-4">
          <Col>
            <Card className="border-0 bg-light">
              <Card.Body className="p-3">
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
                  <div>
                    <h6 className="mb-1 text-muted">
                      <FaCog className="me-2" size={14} />
                      Account Management
                    </h6>
                    <p className="mb-0 small text-muted">
                      Manage your account settings and preferences
                    </p>
                  </div>
                  <div className="d-flex gap-2">
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>This action cannot be undone</Tooltip>}
                    >
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={handleDeleteAccount}
                        className="d-flex align-items-center opacity-75"
                        style={{ fontSize: '0.8rem' }}
                      >
                        <FaTrashAlt className="me-1 me-md-2" size={12} />
                        <span className="d-none d-sm-inline">Delete Profile</span>
                        <span className="d-inline d-sm-none">Delete</span>
                      </Button>
                    </OverlayTrigger>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Profile Settings Section - Independent Section */}
        <Row className="mt-5">
          <Col>
            <div className="profile-settings-section">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h3 className="fw-bold text-dark mb-2">
                    <FaCog className="me-3 text-primary" />
                    Profile Settings
                  </h3>
                  <p className="text-muted mb-0">Configure your business profile and service details</p>
                  {hasAnySettingsEnabled() && (
                    <div className="mt-2">
                      {hasValidationErrors ? (
                        <Badge bg="danger" className="me-2">
                          <FaTimesCircle className="me-1" size={12} />
                          Validation Errors Found
                        </Badge>
                      ) : (
                        <Badge bg="success" className="me-2">
                          <FaCheckCircle className="me-1" size={12} />
                          Settings Ready to Save
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleSaveProfileSettings}
                  disabled={isSavingProfile || !hasAnySettingsEnabled() || hasValidationErrors}
                  className="save-settings-btn"
                >
                  {isSavingProfile ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : !hasAnySettingsEnabled() ? (
                    <>
                      <FaCog className="me-2" />
                      No Settings Enabled
                    </>
                  ) : hasValidationErrors ? (
                    <>
                      <FaTimesCircle className="me-2" />
                      Fix Validation Errors
                    </>
                  ) : (
                    <>
                      <FaCheckCircle className="me-2" />
                      Save Settings
                    </>
                  )}
                </Button>
              </div>

              {/* Pricing & Payment Information */}
              <Row className="mb-4">
                <Col>
                  <Card className="border-0 shadow-sm settings-card">
                    <Card.Header className="bg-primary bg-opacity-10 border-0">
                      <h5 className="mb-0 fw-bold">
                        <FaRupeeSign className="me-2 text-primary" />
                        Pricing & Payment Information
                      </h5>
                    </Card.Header>
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-center justify-content-between mb-4">
                        <h6 className="mb-0">Hourly Rates for Subservices</h6>
                        <div className="d-flex align-items-center">
                          <Form.Check
                            type="checkbox"
                            id="master-pricing-toggle"
                            checked={profileSettings.pricingInfoEnabled}
                            onChange={(e) => handleMasterPricingToggle(e.target.checked)}
                            className="me-2"
                          />
                          <Form.Label htmlFor="master-pricing-toggle" className="mb-0 fw-semibold text-primary">
                            Enable Pricing Info
                          </Form.Label>
                        </div>
                      </div>
                      
                                             {labourDetails?.labourSubSkills && labourDetails.labourSubSkills.length > 0 ? (
                        <>
                          {!profileSettings.pricingInfoEnabled && (
                            <div className="alert alert-info mb-4 d-flex align-items-center">
                              <FaRupeeSign className="me-2 text-info" size={20} />
                              <div>
                                <strong>Pricing Information Disabled</strong>
                                <div className="small">Enable the "Enable Pricing Info" checkbox above to activate pricing for your services</div>
                              </div>
                            </div>
                          )}
                          
                          <Row className="g-3">
                            {labourDetails.labourSubSkills.map((subSkill, index) => {
                              const skillName = typeof subSkill === 'string' ? subSkill : subSkill.subSkillName || subSkill.name || subSkill;
                              const isPricingEnabled = profileSettings.pricingEnabled[skillName] || false;
                              const isCardActive = isPricingEnabled && profileSettings.pricingInfoEnabled;
                              
                              return (
                                <Col key={index} xs={12} md={6} lg={4}>
                                  <div className={`pricing-card p-3 border rounded ${
                                    !profileSettings.pricingInfoEnabled ? 'pricing-card-disabled' : 
                                    isCardActive ? 'border-primary' : ''
                                  }`}>
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                      <h6 className={`mb-0 ${!profileSettings.pricingInfoEnabled ? 'text-muted' : 'text-primary'}`}>
                                        {skillName}
                                      </h6>
                                      <Form.Check
                                        type="checkbox"
                                        checked={isPricingEnabled}
                                        onChange={(e) => handlePricingEnabledChange(skillName, e.target.checked)}
                                        disabled={!profileSettings.pricingInfoEnabled}
                                        label=""
                                      />
                                    </div>
                                    
                                    <Row className="g-2">
                                      <Col xs={6}>
                                        <Form.Label className="small fw-semibold">Min Rate (₹/hr)</Form.Label>
                                                                              <Form.Control
                                        type="number"
                                        placeholder="100"
                                        value={profileSettings.hourlyRates[skillName]?.min || ''}
                                        onChange={(e) => handleHourlyRateChange(skillName, 'min', e.target.value)}
                                        size="sm"
                                        required
                                        min="1"
                                        disabled={!profileSettings.pricingInfoEnabled || !isPricingEnabled}
                                      />
                                    </Col>
                                    <Col xs={6}>
                                      <Form.Label className="small fw-semibold">Max Rate (₹/hr)</Form.Label>
                                      <Form.Control
                                        type="number"
                                        placeholder="200"
                                        value={profileSettings.hourlyRates[skillName]?.max || ''}
                                        onChange={(e) => handleHourlyRateChange(skillName, 'max', e.target.value)}
                                        size="sm"
                                        required
                                        min="1"
                                        disabled={!profileSettings.pricingInfoEnabled || !isPricingEnabled}
                                      />
                                      </Col>
                                    </Row>
                                    
                                    {!profileSettings.pricingInfoEnabled && (
                                      <div className="text-center py-2 mt-2">
                                        <small className="text-muted">
                                          <FaRupeeSign className="me-1" />
                                          Enable "Pricing Info" above to activate pricing
                                        </small>
                                      </div>
                                    )}
                                    
                                    {profileSettings.pricingInfoEnabled && !isPricingEnabled && (
                                      <div className="text-center py-2 mt-2">
                                        <small className="text-muted">
                                          <FaRupeeSign className="me-1" />
                                          Enable checkbox to set pricing for this service
                                        </small>
                                      </div>
                                    )}
                                  </div>
                                </Col>
                              );
                            })}
                          </Row>
                        </>
                      ) : (
                        <div className="text-center py-4">
                          <FaTools className="text-muted mb-3" size={48} />
                          <h6 className="text-muted">No subskills available</h6>
                          <p className="text-muted small">Add subskills in your profile first to set pricing</p>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Customer Experience Features */}
              <Row className="mb-4">
                <Col>
                  <Card className="border-0 shadow-sm settings-card">
                    <Card.Header className="bg-success bg-opacity-10 border-0">
                      <h5 className="mb-0 fw-bold">
                        <FaShieldAlt className="me-2 text-success" />
                        Customer Experience Features
                      </h5>
                    </Card.Header>
                    <Card.Body className="p-4">
                      <Row className="g-3">
                        <Col xs={12} md={6}>
                          <div className="experience-feature p-3 border rounded">
                            <Form.Check
                              type="checkbox"
                              label="Satisfaction Guarantee"
                              checked={profileSettings.satisfactionGuarantee}
                              onChange={(e) => handleProfileSettingsChange('satisfactionGuarantee', null, e.target.checked)}
                              className="mb-2"
                            />
                            <small className="text-muted">Money-back guarantee for customer satisfaction</small>
                          </div>
                        </Col>
                        
                        <Col xs={12} md={6}>
                          <div className="experience-feature p-3 border rounded">
                            <Form.Check
                              type="checkbox"
                              label="Warranty on Work"
                              checked={profileSettings.warrantyOnWork}
                              onChange={(e) => handleProfileSettingsChange('warrantyOnWork', null, e.target.checked)}
                              className="mb-2"
                            />
                            <small className="text-muted">Provide warranty for your services</small>
                            {profileSettings.warrantyOnWork && (
                              <Form.Control
                                as="textarea"
                                rows={2}
                                placeholder="Describe your warranty terms (e.g., 6 months warranty on electrical work)"
                                value={profileSettings.warrantyDuration}
                                onChange={(e) => handleProfileSettingsChange('warrantyDuration', null, e.target.value)}
                                className={`mt-2 ${
                                  profileSettings.warrantyOnWork && 
                                  (!profileSettings.warrantyDuration || profileSettings.warrantyDuration.trim() === '') 
                                    ? 'is-invalid' : ''
                                }`}
                                required
                              />
                            )}
                          </div>
                        </Col>
                        
                        <Col xs={12} md={6}>
                          <div className="experience-feature p-3 border rounded">
                            <Form.Check
                              type="checkbox"
                              label="Follow-up Service"
                              checked={profileSettings.followUpService}
                              onChange={(e) => handleProfileSettingsChange('followUpService', null, e.target.checked)}
                              className="mb-2"
                            />
                            <small className="text-muted">Post-completion support for customers</small>
                          </div>
                        </Col>
                        
                        <Col xs={12} md={6}>
                          <div className="experience-feature p-3 border rounded">
                            <Form.Label className="fw-semibold">Emergency Contact</Form.Label>
                            <Form.Control
                              type="text"
                              placeholder="Emergency contact number or name"
                              value={profileSettings.emergencyContact}
                              onChange={(e) => handleProfileSettingsChange('emergencyContact', null, e.target.value)}
                              className={
                                profileSettings.emergencyContact && 
                                profileSettings.emergencyContact.trim() !== '' &&
                                !/\d/.test(profileSettings.emergencyContact)
                                  ? 'is-invalid' : ''
                              }
                            />
                            <small className="text-muted">Alternative contact for urgent issues</small>
                          </div>
                        </Col>
                      </Row>

                      {/* Working Hours */}
                      <hr className="my-4" />
                      <h6 className="mb-3">Working Hours</h6>
                      <Row className="g-3">
                        {Object.entries(profileSettings.workingHours).map(([day, hours]) => {
                          const hasTimeError = hours.available && hours.start && hours.end && 
                                              timeToMinutes(hours.start) >= timeToMinutes(hours.end);
                          const hasEmptyFields = hours.available && (!hours.start || !hours.end);
                          const hasError = hasTimeError || hasEmptyFields;
                          
                          return (
                            <Col key={day} xs={12} sm={6} md={4}>
                              <div className={`working-hours-card p-3 border rounded ${hasError ? 'border-danger' : hours.available ? 'border-success' : ''}`}>
                                <div className="d-flex align-items-center justify-content-between mb-3">
                                  <h6 className="mb-0 text-capitalize fw-semibold">{day}</h6>
                                  <Form.Check
                                    type="checkbox"
                                    checked={hours.available}
                                    onChange={(e) => handleWorkingHoursChange(day, 'available', e.target.checked)}
                                  />
                                </div>
                                {hours.available && (
                                  <>
                                    <Row className="g-2">
                                      <Col xs={6}>
                                        <Form.Label className="small fw-semibold">Start</Form.Label>
                                        <Form.Control
                                          type="time"
                                          value={hours.start}
                                          onChange={(e) => handleWorkingHoursChange(day, 'start', e.target.value)}
                                          size="sm"
                                          required
                                          className={hasEmptyFields && !hours.start ? 'is-invalid' : hasTimeError ? 'is-invalid' : ''}
                                        />
                                      </Col>
                                      <Col xs={6}>
                                        <Form.Label className="small fw-semibold">End</Form.Label>
                                        <Form.Control
                                          type="time"
                                          value={hours.end}
                                          onChange={(e) => handleWorkingHoursChange(day, 'end', e.target.value)}
                                          size="sm"
                                          required
                                          className={hasEmptyFields && !hours.end ? 'is-invalid' : hasTimeError ? 'is-invalid' : ''}
                                        />
                                      </Col>
                                    </Row>
                                    {hasTimeError && (
                                      <div className="mt-2">
                                        <small className="text-danger">
                                          <FaTimesCircle className="me-1" />
                                          Start time must be earlier than end time
                                        </small>
                                      </div>
                                    )}
                                    {hasEmptyFields && (
                                      <div className="mt-2">
                                        <small className="text-danger">
                                          <FaTimesCircle className="me-1" />
                                          Please set both start and end time
                                        </small>
                                      </div>
                                    )}
                                  </>
                                )}
                                {!hours.available && (
                                  <div className="text-center py-2">
                                    <small className="text-muted">
                                      <FaClock className="me-1" />
                                      Day off
                                    </small>
                                  </div>
                                )}
                              </div>
                            </Col>
                          );
                        })}
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Social Proof & Community */}
              <Row className="mb-4">
                <Col>
                  <Card className="border-0 shadow-sm settings-card">
                    <Card.Header className="bg-info bg-opacity-10 border-0">
                      <h5 className="mb-0 fw-bold">
                        <FaAward className="me-2 text-info" />
                        Social Proof & Community
                      </h5>
                    </Card.Header>
                    <Card.Body className="p-4">
                      {/* Social Media Links */}
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <h6 className="mb-0">Social Media Presence</h6>
                        <Form.Check
                          type="checkbox"
                          label="Enable Social Media"
                          checked={profileSettings.socialMediaEnabled}
                          onChange={(e) => handleProfileSettingsChange('socialMediaEnabled', null, e.target.checked)}
                        />
                      </div>
                      {profileSettings.socialMediaEnabled && (
                        <Row className="g-3 mb-4">
                          <Col xs={12} md={4}>
                            <div className="social-media-card p-3 border rounded text-center">
                              <FaInstagram className="text-danger mb-2" size={24} />
                              <Form.Label className="fw-semibold">Instagram Profile</Form.Label>
                              <Form.Control
                                type="url"
                                placeholder="https://instagram.com/yourprofile"
                                value={profileSettings.socialMedia.instagram}
                                onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                                className={
                                  profileSettings.socialMediaEnabled && 
                                  profileSettings.socialMedia.instagram &&
                                  profileSettings.socialMedia.instagram.trim() !== '' &&
                                  !profileSettings.socialMedia.instagram.startsWith('http') 
                                    ? 'is-invalid' : ''
                                }
                              />
                            </div>
                          </Col>
                          <Col xs={12} md={4}>
                            <div className="social-media-card p-3 border rounded text-center">
                              <FaFacebook className="text-primary mb-2" size={24} />
                              <Form.Label className="fw-semibold">Facebook Profile</Form.Label>
                              <Form.Control
                                type="url"
                                placeholder="https://facebook.com/yourprofile"
                                value={profileSettings.socialMedia.facebook}
                                onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                                className={
                                  profileSettings.socialMediaEnabled && 
                                  profileSettings.socialMedia.facebook &&
                                  profileSettings.socialMedia.facebook.trim() !== '' &&
                                  !profileSettings.socialMedia.facebook.startsWith('http') 
                                    ? 'is-invalid' : ''
                                }
                              />
                            </div>
                          </Col>
                          <Col xs={12} md={4}>
                            <div className="social-media-card p-3 border rounded text-center">
                              <FaYoutube className="text-danger mb-2" size={24} />
                              <Form.Label className="fw-semibold">YouTube Channel</Form.Label>
                              <Form.Control
                                type="url"
                                placeholder="https://youtube.com/yourchannel"
                                value={profileSettings.socialMedia.youtube}
                                onChange={(e) => handleSocialMediaChange('youtube', e.target.value)}
                                className={
                                  profileSettings.socialMediaEnabled && 
                                  profileSettings.socialMedia.youtube &&
                                  profileSettings.socialMedia.youtube.trim() !== '' &&
                                  !profileSettings.socialMedia.youtube.startsWith('http') 
                                    ? 'is-invalid' : ''
                                }
                              />
                            </div>
                          </Col>
                        </Row>
                      )}

                      {/* Certifications */}
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <h6 className="mb-0">
                          <FaCertificate className="me-2 text-warning" />
                          Certifications
                        </h6>
                        <Form.Check
                          type="checkbox"
                          label="Enable Certifications"
                          checked={profileSettings.certificationsEnabled}
                          onChange={(e) => handleProfileSettingsChange('certificationsEnabled', null, e.target.checked)}
                        />
                      </div>
                      {profileSettings.certificationsEnabled && (
                        <div className="mb-3">
                        {profileSettings.certifications.map((cert, index) => (
                          <div key={cert.id} className="certification-item p-3 border rounded mb-3">
                            <Row className="g-2">
                              <Col xs={12} md={4}>
                                <Form.Label className="small fw-semibold">Certification Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="e.g., Electrician License"
                                  value={cert.name}
                                  onChange={(e) => handleCertificationChange(index, 'name', e.target.value)}
                                  size="sm"
                                  className={
                                    profileSettings.certificationsEnabled && 
                                    (!cert.name || cert.name.trim() === '') 
                                      ? 'is-invalid' : ''
                                  }
                                  required
                                />
                              </Col>
                              <Col xs={12} md={4}>
                                <Form.Label className="small fw-semibold">Certificate Link</Form.Label>
                                <Form.Control
                                  type="url"
                                  placeholder="https://..."
                                  value={cert.link}
                                  onChange={(e) => handleCertificationChange(index, 'link', e.target.value)}
                                  size="sm"
                                />
                              </Col>
                              <Col xs={12} md={3}>
                                <Form.Label className="small fw-semibold">Issue Date</Form.Label>
                                <Form.Control
                                  type="date"
                                  value={cert.issueDate}
                                  onChange={(e) => handleCertificationChange(index, 'issueDate', e.target.value)}
                                  size="sm"
                                />
                              </Col>
                              <Col xs={12} md={1} className="d-flex align-items-end">
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleCertificationRemove(index)}
                                  className="remove-btn"
                                >
                                  ×
                                </Button>
                              </Col>
                            </Row>
                          </div>
                        ))}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={handleCertificationAdd}
                          className="add-btn"
                        >
                          <FaCertificate className="me-2" />
                          Add Certification
                        </Button>
                      </div>
                      )}

                      {/* Testimonial Videos */}
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <h6 className="mb-0">
                          <FaYoutube className="me-2 text-danger" />
                          Testimonial Videos
                        </h6>
                        <Form.Check
                          type="checkbox"
                          label="Enable Testimonial Videos"
                          checked={profileSettings.testimonialVideosEnabled}
                          onChange={(e) => handleProfileSettingsChange('testimonialVideosEnabled', null, e.target.checked)}
                        />
                      </div>
                      {profileSettings.testimonialVideosEnabled && (
                        <div className="mb-3">
                        {profileSettings.testimonialVideos.map((video, index) => (
                          <div key={video.id} className="video-item p-3 border rounded mb-3">
                            <Row className="g-2">
                              <Col xs={12} md={5}>
                                <Form.Label className="small fw-semibold">Video Title</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="e.g., Customer Testimonial"
                                  value={video.title}
                                  onChange={(e) => handleVideoChange(index, 'title', e.target.value)}
                                  size="sm"
                                  className={
                                    profileSettings.testimonialVideosEnabled && 
                                    (!video.title || video.title.trim() === '') 
                                      ? 'is-invalid' : ''
                                  }
                                  required
                                />
                              </Col>
                              <Col xs={12} md={6}>
                                <Form.Label className="small fw-semibold">YouTube Video URL</Form.Label>
                                <Form.Control
                                  type="url"
                                  placeholder="https://youtube.com/watch?v=..."
                                  value={video.url}
                                  onChange={(e) => handleVideoChange(index, 'url', e.target.value)}
                                  size="sm"
                                  className={
                                    profileSettings.testimonialVideosEnabled && 
                                    ((!video.url || video.url.trim() === '') ||
                                    (video.url && video.url.trim() !== '' && !video.url.startsWith('http')))
                                      ? 'is-invalid' : ''
                                  }
                                  required
                                />
                              </Col>
                              <Col xs={12} md={1} className="d-flex align-items-end">
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={() => handleVideoRemove(index)}
                                  className="remove-btn"
                                >
                                  ×
                                </Button>
                              </Col>
                            </Row>
                          </div>
                        ))}
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={handleVideoAdd}
                          className="add-btn"
                        >
                          <FaYoutube className="me-2" />
                          Add Video
                        </Button>
                      </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Container>

      <UpdateLabourModal
        show={showUpdateModal}
        onHide={() => setShowUpdateModal(false)}
        labourDetails={labourDetails}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </Container>
  );
};

export default LabourDashboard; 