import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { labourService } from '../services/labourService';
import LocationService from '../services/LocationService';
import { FaUser, FaTools, FaPhone, FaKey, FaEye, FaEyeSlash, FaArrowRight, FaExclamationCircle, FaMapMarkerAlt, FaLocationArrow, FaCheckCircle } from 'react-icons/fa';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import '../styles/LabourRegister.css';

function LabourRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    labourName: '',
    labourSkill: '',
    labourSubSkill: [],
    labourMobileNo: '',
    labourLocation: ''
  });
  const [otp, setOtp] = useState('');
  const [otpStatus, setOtpStatus] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [showOtp, setShowOtp] = useState(false);
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
        setSuccess(`Location detected: ${closestCity.value}`);
      } else {
        setError(`Could not find "${detectedCity}" in our city list. Please select manually.`);
      }
    } catch (error) {
      setError(`Failed to detect location: ${error.message}. Please select manually.`);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleRequestOTP = async () => {
    setOtpStatus('');
    setOtpLoading(true);
    const mobile = formData.labourMobileNo;
    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      setOtpStatus('Please enter a valid 10-digit mobile number before requesting OTP.');
      setOtpLoading(false);
      return;
    }
    try {
      await labourService.requestOTP(mobile, 'LABOUR');
      setOtpStatus('OTP sent successfully!');
    } catch (err) {
      setOtpStatus(err.message || 'Failed to send OTP.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);
    
    if (selectedService && formData.labourSubSkill.length === 0) {
      setError('Please select at least one sub skill.');
      setIsLoading(false);
      return;
    }
    try {
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
          finalLocation = closestCity ? closestCity.value : 'Not specified';
        } catch (locationError) {
          finalLocation = 'Not specified';
        }
      }
      
      // Validate that the selected city is from our list
      const isValidCity = cities.some(city => city.CityName === finalLocation);
      
      if (finalLocation !== 'Not specified' && !isValidCity) {
        setError('Please select a valid city from the dropdown.');
        setIsLoading(false);
        return;
      }
      
      // Prepare subSkills array for API
      const labourData = {
        labourName: formData.labourName,
        labourSkill: formData.labourSkill,
        labourSubSkills: formData.labourSubSkill.map(subSkill => ({ subSkillName: subSkill })),
        labourMobileNo: formData.labourMobileNo,
        labourLocation: finalLocation
      };
      
      const response = await labourService.registerLabour(labourData, otp);
      
      if (response.token && response.returnValue) {
        // Filter out reviews data before storing in localStorage
        const { reviews, ...labourDataWithoutReviews } = response.returnValue;
        localStorage.setItem('labour', JSON.stringify({ ...labourDataWithoutReviews, token: response.token }));
        navigate('/labourDashboard');
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="mt-5 mb-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold text-primary">Labour Registration</h2>
                <p className="text-muted">Join InstaLab as a skilled professional</p>
              </div>
              {error && (
                <div className="alert alert-danger d-flex align-items-center" role="alert">
                  <FaExclamationCircle className="me-2" />
                  {error}
                </div>
              )}
              {success && (
                <div className="alert alert-success d-flex align-items-center" role="alert">
                  <FaCheckCircle className="me-2" />
                  {success}
                </div>
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <div className="d-flex align-items-center">
                    <FaUser className="me-2" />
                    <Form.Label className="fw-bold mb-0">Full Name</Form.Label>
                  </div>
                  <Form.Control
                    type="text"
                    name="labourName"
                    value={formData.labourName}
                    onChange={handleChange}
                    required
                    className="form-control-lg"
                    placeholder="Enter your full name"
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <div className="d-flex align-items-center">
                    <FaTools className="me-2" />
                    <Form.Label className="fw-bold mb-0">Main Skill</Form.Label>
                  </div>
                  <Form.Select
                    name="labourSkill"
                    value={formData.labourSkill}
                    onChange={handleChange}
                    required
                    className="form-control-lg"
                  >
                    <option value="">Select your main skill</option>
                    {services.map((service, index) => (
                      <option key={index} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                {selectedService && (
                  <Form.Group className="mb-4">
                    <div className="d-flex align-items-center">
                      <FaTools className="me-2" />
                      <Form.Label className="fw-bold mb-0">Sub Skill</Form.Label>
                    </div>
                    <Select
                      name="labourSubSkill"
                      isMulti
                      options={[
                        { value: 'all', label: 'Select All' },
                        ...selectedService.subCategories.map(subCategory => ({
                          value: subCategory,
                          label: subCategory
                        }))
                      ]}
                      onChange={handleSubSkillChange}
                      value={formData.labourSubSkill.map(subCategory => ({
                        value: subCategory,
                        label: subCategory
                      }))}
                      className="basic-multi-select"
                      classNamePrefix="select"
                      placeholder="Select your sub skills"
                      menuPortalTarget={document.body}
                      styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                    />
                  </Form.Group>
                )}
                <Form.Group className="mb-4">
                  <div className="d-flex align-items-center">
                    <FaPhone className="me-2" />
                    <Form.Label className="fw-bold mb-0">Mobile Number</Form.Label>
                  </div>
                  <InputGroup>
                    <Form.Control
                      type="tel"
                      name="labourMobileNo"
                      value={formData.labourMobileNo}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({
                          ...formData,
                          labourMobileNo: value
                        });
                      }}
                      required
                      pattern="[0-9]{10}"
                      className="form-control-lg"
                      placeholder="Enter 10-digit mobile number"
                      maxLength="10"
                    />
                    <Button
                      variant="outline-primary"
                      type="button"
                      onClick={handleRequestOTP}
                      disabled={otpLoading}
                    >
                      {otpLoading ? 'Sending OTP...' : 'Request OTP'}
                    </Button>
                  </InputGroup>
                  {otpStatus && (
                    <Form.Text className={otpStatus.includes('success') ? 'text-success' : 'text-danger'}>
                      {otpStatus}
                    </Form.Text>
                  )}
                </Form.Group>
                <Form.Group className="mb-4">
                  <div className="d-flex align-items-center">
                    <FaKey className="me-2" />
                    <Form.Label className="fw-bold mb-0">OTP</Form.Label>
                  </div>
                  <InputGroup>
                    <Form.Control
                      type={showOtp ? "text" : "password"}
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="form-control-lg"
                      maxLength="6"
                      required
                    />
                    <Button
                      variant="outline-secondary"
                      type="button"
                      onClick={() => setShowOtp(v => !v)}
                      tabIndex={-1}
                    >
                      {showOtp ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>
                <Form.Group className="mb-4">
                  <div className="d-flex align-items-center">
                    <FaMapMarkerAlt className="me-2" />
                    <Form.Label className="fw-bold mb-0">Location (Optional)</Form.Label>
                  </div>
                  <InputGroup>
                    <div style={{ flex: 1 }}>
                      <AsyncSelect
                        name="labourLocation"
                        loadOptions={(inputValue) => {
                          return new Promise((resolve) => {
                            setTimeout(() => {
                              resolve(searchCities(inputValue));
                            }, 300);
                          });
                        }}
                        onChange={(selectedOption) => {
                          setSelectedCity(selectedOption);
                          setFormData(prev => ({
                            ...prev,
                            labourLocation: selectedOption ? selectedOption.value : ''
                          }));
                        }}
                        value={selectedCity}
                        placeholder="Type to search cities..."
                        isClearable
                        cacheOptions
                        defaultOptions={cities.length > 0 ? searchCities('') : []}
                        className="basic-single"
                        classNamePrefix="select"
                        menuPortalTarget={document.body}
                        styles={{ 
                          menuPortal: base => ({ ...base, zIndex: 9999 }),
                          control: base => ({ ...base, minHeight: '46px' })
                        }}
                        noOptionsMessage={({ inputValue }) => 
                          inputValue ? `No cities found matching "${inputValue}"` : 'Type to search cities'
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
                          Detecting...
                        </>
                      ) : (
                        <>
                          <FaLocationArrow className="me-1" />
                          Auto-detect
                        </>
                      )}
                    </Button>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Type to search and select from available cities. Auto-detection will find the closest match.
                  </Form.Text>
                </Form.Group>
                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="btn-lg fw-bold d-flex align-items-center justify-content-center"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account <FaArrowRight className="ms-2" />
                      </>
                    )}
                  </Button>
                </div>
                <div className="text-center mt-4">
                  <p className="mb-0">
                    Already have an account?{' '}
                    <Button 
                      variant="link" 
                      className="p-0 text-decoration-none"
                      onClick={() => navigate('/labourLogin')}
                    >
                      Login here
                    </Button>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LabourRegister; 