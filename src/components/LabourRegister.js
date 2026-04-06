import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { labourService } from '../services/labourService';
import LocationService from '../services/LocationService';
import { FaUser, FaTools, FaPhone, FaArrowRight, FaExclamationCircle, FaMapMarkerAlt, FaLocationArrow, FaCheckCircle } from 'react-icons/fa';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { useTranslation } from 'react-i18next';
import OTPVerification from './OTPVerification';
import '../styles/AuthFormShell.css';

function LabourRegister() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [step, setStep] = useState('form'); // 'form' or 'otp'
  const [formData, setFormData] = useState({
    labourName: '',
    labourSkill: '',
    labourSubSkill: [],
    labourMobileNo: '',
    labourLocation: ''
  });
  const [otpStatus, setOtpStatus] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);

  // Search cities with exact text matching only
  const searchCities = (inputValue) => {
    if (!cities || cities.length === 0) {
      return [];
    }
    
    if (!inputValue || inputValue.length < 1) {
      // Return first 5 cities when no input
      return cities.slice(0, 5).map(city => ({
        value: city.CityName,
        label: city.CityName
      }));
    }
    
    const searchTerm = inputValue.toLowerCase();
    
    return cities
      .filter(city => {
        const cityName = city.CityName.toLowerCase();
        
        // Exact start match (highest priority)
        if (cityName.startsWith(searchTerm)) return true;
        
        // Contains match
        if (cityName.includes(searchTerm)) return true;
        
        return false;
      })
      .slice(0, 5) // Limit to 5 results
      .map(city => ({
        value: city.CityName,
        label: city.CityName
      }));
  };

  // Find closest city match for auto-detection
  const findClosestCity = (detectedCity) => {
    if (!detectedCity) {
      return null;
    }
    
    const searchResults = searchCities(detectedCity);
    
    if (searchResults.length > 0) {
      return searchResults[0]; // Return the best match
    }
    
    // If no match found, try with individual words
    const words = detectedCity.split(' ');
    
    for (const word of words) {
      if (word.length > 2) { // Only try words longer than 2 characters
        const wordResults = searchCities(word);
        if (wordResults.length > 0) {
          return wordResults[0];
        }
      }
    }
    
    return null;
  };

  useEffect(() => {
    // Fetch services data
    fetch('/services.json')
      .then(response => response.json())
      .then(data => setServices(data.services))
      .catch(error => console.error('Error loading services:', error));

    // Fetch cities data
    fetch('/cities.json')
      .then(response => response.json())
      .then(data => setCities(data))
      .catch(error => console.error('Error loading cities:', error));
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (otpStatus && otpStatus.toLowerCase().includes('success')) {
      const timer = setTimeout(() => setOtpStatus(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [otpStatus]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (name === 'labourSkill') {
      const service = services.find(s => s.name === value);
      setSelectedService(service);
      setFormData(prev => ({
        ...prev,
        labourSubSkill: []
      }));
    }
  };

  const handleSubSkillChange = (selectedOptions) => {
    if (selectedOptions && selectedOptions.some(option => option.value === 'all')) {
      setFormData(prev => ({
        ...prev,
        labourSubSkill: selectedService.subCategories
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        labourSubSkill: selectedOptions ? selectedOptions.map(option => option.value) : []
      }));
    }
  };

  const handleDetectLocation = async () => {
    setLocationLoading(true);
    setError(''); // Clear previous errors
    
    try {
      const coords = await LocationService.getCurrentLocation();
      const locationData = await LocationService.getLocationFromCoordinates(coords.latitude, coords.longitude);
      
      // Extract city name from the location data
      const detectedCity = locationData.address?.city || 
                          locationData.address?.town || 
                          locationData.address?.village || 
                          locationData.address?.state_district || 
                          locationData.address?.county || 
                          'Unknown';
      
      // Find the closest matching city from our list
      const closestCity = findClosestCity(detectedCity);
      
      if (closestCity) {
        setSelectedCity(closestCity);
        setFormData(prev => ({
          ...prev,
          labourLocation: closestCity.value
        }));
        setSuccess(`${t('auth.locationDetected')} ${closestCity.value}`);
      } else {
        setError(`${t('auth.couldNotFindCity')} "${detectedCity}" ${t('auth.inCityList')}`);
      }
    } catch (error) {
      setError(`${t('auth.failedToDetectLocation')} ${error.message}. ${t('auth.pleaseSelectManually')}`);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (otpLoading) return;

    // Validate form before sending OTP
    if (selectedService && formData.labourSubSkill.length === 0) {
      setError(t('auth.pleaseSelectAtLeastOneSubSkill'));
      return;
    }
    
    let finalLocation = formData.labourLocation;
    
    // If no location provided, auto-detect it
    if (!finalLocation || finalLocation.trim() === '') {
      try {
        const coords = await LocationService.getCurrentLocation();
        const locationData = await LocationService.getLocationFromCoordinates(coords.latitude, coords.longitude);
        
        // Extract city name from the location data
        const detectedCity = locationData.address?.city || 
                            locationData.address?.town || 
                            locationData.address?.village || 
                            locationData.address?.state_district || 
                            locationData.address?.county || 
                            'Unknown';
        
        // Find the closest matching city from our list
        const closestCity = findClosestCity(detectedCity);
        finalLocation = closestCity ? closestCity.value : t('auth.notSpecified');
      } catch (locationError) {
        finalLocation = t('auth.notSpecified');
      }
    }
    
    // Validate that the selected city is from our list
    const isValidCity = cities.some(city => city.CityName === finalLocation);
    
    if (finalLocation !== t('auth.notSpecified') && !isValidCity) {
      setError(t('auth.pleaseSelectValidCity'));
      return;
    }

    const mobile = formData.labourMobileNo;
    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      setError(t('auth.pleaseEnterValidMobile'));
      return;
    }

    // Update location in formData if auto-detected
    if (finalLocation !== formData.labourLocation) {
      setFormData(prev => ({ ...prev, labourLocation: finalLocation }));
    }
    
    setOtpLoading(true);
    setError('');
    
    try {
      await labourService.requestOTP(mobile, 'LABOUR');
      setStep('otp');
      setOtpStatus(t('auth.otpSentSuccessfully'));
    } catch (err) {
      setError(err.message || t('auth.failedToSendOtp'));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (otpValue) => {
    if (isLoading) return;
    setIsLoading(true);
    setError('');
    
    try {
      // Prepare subSkills array for API
      const labourData = {
        labourName: formData.labourName,
        labourSkill: formData.labourSkill,
        labourSubSkills: formData.labourSubSkill.map(subSkill => ({ subSkillName: subSkill })),
        labourMobileNo: formData.labourMobileNo,
        labourLocation: formData.labourLocation
      };
      
      const response = await labourService.registerLabour(labourData, otpValue);
      
      if (response.token && response.returnValue) {
        // Filter out reviews data before storing in localStorage
        const { reviews, ...labourDataWithoutReviews } = response.returnValue;
        localStorage.setItem('labour', JSON.stringify({ ...labourDataWithoutReviews, token: response.token }));
        navigate('/labourDashboard');
      } else {
        setError(t('auth.registrationFailed'));
      }
    } catch (error) {
      setError(t('auth.registrationFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setStep('form');
    setError('');
    setOtpStatus('');
  };

  const handleResendOTP = async () => {
    setOtpLoading(true);
    setError('');
    setOtpStatus('');
    
    try {
      await labourService.requestOTP(formData.labourMobileNo, 'LABOUR');
      setOtpStatus(t('auth.otpSentSuccessfully'));
    } catch (err) {
      setError(err.message || t('auth.failedToSendOtp'));
    } finally {
      setOtpLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <OTPVerification
        onVerify={handleVerifyOTP}
        onBack={handleBackToForm}
        onResend={handleResendOTP}
        isLoading={isLoading}
        error={error}
        success={otpStatus}
        mobileNumber={formData.labourMobileNo}
        title={t('auth.verifyOtp')}
        subtitle={t('auth.enterOtpSentToMobile')}
      />
    );
  }

  return (
    <div className="auth-form-shell auth-form-shell--labour auth-form-shell--wide">
      <div className="auth-form-shell__scroll">
        <div className="auth-form-shell__inner">
          <header className="auth-form-hero">
            <p className="auth-form-hero__eyebrow mb-0">{t('home.headerTitle')}</p>
            <h1 className="auth-form-hero__title">{t('auth.labourRegistration')}</h1>
            <p className="auth-form-hero__subtitle">{t('auth.joinAsSkilledProfessional')}</p>
          </header>

          <div className="auth-form-panel">
            {error && (
              <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                <FaExclamationCircle className="me-2 flex-shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success d-flex align-items-center mb-3" role="alert">
                <FaCheckCircle className="me-2 flex-shrink-0" />
                {success}
              </div>
            )}
            <Form onSubmit={handleSendOTP}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaUser className="me-2 text-primary" aria-hidden />
                  {t('auth.fullName')}
                </Form.Label>
                <Form.Control
                  type="text"
                  name="labourName"
                  value={formData.labourName}
                  onChange={handleChange}
                  required
                  autoComplete="name"
                  placeholder={t('auth.enterFullName')}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaTools className="me-2 text-primary" aria-hidden />
                  {t('auth.mainSkill')}
                </Form.Label>
                <Form.Select
                  name="labourSkill"
                  value={formData.labourSkill}
                  onChange={handleChange}
                  required
                >
                  <option value="">{t('auth.selectMainSkill')}</option>
                  {services.map((service, index) => (
                    <option key={index} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              {selectedService && (
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaTools className="me-2 text-primary" aria-hidden />
                    {t('auth.subSkill')}
                  </Form.Label>
                  <Select
                    name="labourSubSkill"
                    isMulti
                    options={[
                      { value: 'all', label: t('auth.selectAll') },
                      ...selectedService.subCategories.map((subCategory) => ({
                        value: subCategory,
                        label: subCategory,
                      })),
                    ]}
                    onChange={handleSubSkillChange}
                    value={formData.labourSubSkill.map((subCategory) => ({
                      value: subCategory,
                      label: subCategory,
                    }))}
                    className="basic-multi-select"
                    classNamePrefix="select"
                    placeholder={t('auth.selectSubSkills')}
                    menuPortalTarget={document.body}
                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                  />
                </Form.Group>
              )}
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaPhone className="me-2 text-primary" aria-hidden />
                  {t('auth.mobileNumber')}
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="labourMobileNo"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={formData.labourMobileNo}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setFormData({
                      ...formData,
                      labourMobileNo: value,
                    });
                  }}
                  required
                  pattern="[0-9]{10}"
                  placeholder={t('auth.enterMobileNumber')}
                  maxLength={10}
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaMapMarkerAlt className="me-2 text-primary" aria-hidden />
                  {t('auth.location')}
                </Form.Label>
                <InputGroup className="auth-form-input-group--stack">
                  <div className="auth-form-async-select-wrap">
                    <AsyncSelect
                      name="labourLocation"
                      loadOptions={(inputValue) =>
                        new Promise((resolve) => {
                          setTimeout(() => {
                            resolve(searchCities(inputValue));
                          }, 300);
                        })
                      }
                      onChange={(selectedOption) => {
                        setSelectedCity(selectedOption);
                        setFormData((prev) => ({
                          ...prev,
                          labourLocation: selectedOption ? selectedOption.value : '',
                        }));
                      }}
                      value={selectedCity}
                      placeholder={t('auth.typeToSearchCities')}
                      isClearable
                      cacheOptions
                      defaultOptions={cities.length > 0 ? searchCities('') : []}
                      className="basic-single"
                      classNamePrefix="select"
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        control: (base) => ({ ...base, minHeight: '48px' }),
                      }}
                      noOptionsMessage={({ inputValue }) =>
                        inputValue
                          ? `${t('auth.noCitiesFoundMatching')} "${inputValue}"`
                          : t('auth.typeToSearchCities')
                      }
                    />
                  </div>
                  <Button
                    variant="outline-primary"
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={locationLoading}
                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                  >
                    {locationLoading ? (
                      <>
                        <Spinner size="sm" className="me-1" />
                        {t('auth.detecting')}
                      </>
                    ) : (
                      <>
                        <FaLocationArrow className="me-1" />
                        {t('auth.autoDetect')}
                      </>
                    )}
                  </Button>
                </InputGroup>
                <Form.Text className="text-muted">{t('auth.typeToSearchAndSelect')}</Form.Text>
              </Form.Group>
              <div className="auth-form-sticky-cta d-grid gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  className="d-flex align-items-center justify-content-center"
                  disabled={otpLoading}
                >
                  {otpLoading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      {t('auth.sendingOtp')}
                    </>
                  ) : (
                    <>
                      {t('auth.sendOtp')} <FaArrowRight className="ms-2" />
                    </>
                  )}
                </Button>
              </div>
            </Form>
            <div className="auth-form-alt-action">
              <span className="text-muted">{t('auth.alreadyHaveAccount')}</span>{' '}
              <Button type="button" variant="link" className="p-0 align-baseline" onClick={() => navigate('/labourLogin')}>
                {t('auth.loginHere')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LabourRegister; 