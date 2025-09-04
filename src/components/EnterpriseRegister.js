import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { enterpriseService } from '../services/enterpriseService';
import LocationService from '../services/LocationService';
import OTPVerification from './OTPVerification';
import '../styles/EnterpriseAuth.css';
import { 
  FaPhone,
  FaKey,
  FaEye,
  FaEyeSlash,
  FaBuilding,
  FaTools,
  FaPlus,
  FaTrash,
  FaMapMarkerAlt,
  FaLocationArrow,
  FaArrowRight,
  FaExclamationCircle,
  FaCheckCircle
} from 'react-icons/fa';

function EnterpriseRegister() {
  const navigate = useNavigate();
  const [step, setStep] = useState('form'); // 'form' or 'otp'

  const [formData, setFormData] = useState({
    ownerContactInfo: '',
    companyName: '',
    location: ''
  });

  const [services, setServices] = useState([]);
  const [serviceSelections, setServiceSelections] = useState([
    { serviceName: '', subServices: [] }
  ]);

  const [otpStatus, setOtpStatus] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [cities, setCities] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/services.json')
      .then(r => r.json())
      .then(data => setServices(data.services || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('/cities.json')
      .then(r => r.json())
      .then(data => setCities(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (error) {
      const t = setTimeout(() => setError(''), 2000);
      return () => clearTimeout(t);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const t = setTimeout(() => setSuccess(''), 2000);
      return () => clearTimeout(t);
    }
  }, [success]);

  useEffect(() => {
    if (otpStatus && otpStatus.toLowerCase().includes('success')) {
      const t = setTimeout(() => setOtpStatus(''), 2000);
      return () => clearTimeout(t);
    }
  }, [otpStatus]);

  const searchCities = (inputValue) => {
    if (!cities || cities.length === 0) return [];
    if (!inputValue || inputValue.length < 1) {
      return cities.slice(0, 5).map(city => ({ value: city.CityName, label: city.CityName }));
    }
    const searchTerm = inputValue.toLowerCase();
    return cities
      .filter(c => c.CityName.toLowerCase().includes(searchTerm) || c.CityName.toLowerCase().startsWith(searchTerm))
      .slice(0, 5)
      .map(c => ({ value: c.CityName, label: c.CityName }));
  };

  const findClosestCity = (detectedCity) => {
    if (!detectedCity) return null;
    const results = searchCities(detectedCity);
    if (results.length > 0) return results[0];
    const words = detectedCity.split(' ');
    for (const word of words) {
      if (word.length > 2) {
        const wordResults = searchCities(word);
        if (wordResults.length > 0) return wordResults[0];
      }
    }
    return null;
  };

  const handleDetectLocation = async () => {
    setLocationLoading(true);
    setError('');
    try {
      const coords = await LocationService.getCurrentLocation();
      const locationData = await LocationService.getLocationFromCoordinates(coords.latitude, coords.longitude);
      const detectedCity = locationData.address?.city || locationData.address?.town || locationData.address?.village || locationData.address?.state_district || locationData.address?.county || 'Unknown';
      const closestCity = findClosestCity(detectedCity);
      if (closestCity) {
        setSelectedCity(closestCity);
        setFormData(prev => ({ ...prev, location: closestCity.value }));
        setSuccess(`Location detected: ${closestCity.value}`);
      } else {
        setError(`Could not find "${detectedCity}" in city list`);
      }
    } catch (e) {
      setError(`Failed to detect location. Please select manually`);
    } finally {
      setLocationLoading(false);
    }
  };

  const setField = (name, value) => setFormData(prev => ({ ...prev, [name]: value }));
  
  const buildServicesOfferedObject = () => {
    const obj = {};
    serviceSelections.forEach((sel) => {
      const key = (sel.serviceName || '').trim();
      const items = (sel.subServices || []).map(i => i.trim()).filter(Boolean);
      if (key && items.length > 0) {
        obj[key] = items;
      }
    });
    return obj;
  };

  const handleAddServiceRow = () => {
    setServiceSelections(prev => ([...prev, { serviceName: '', subServices: [] }]));
  };

  const handleRemoveServiceRow = (idx) => {
    setServiceSelections(prev => prev.filter((_, i) => i !== idx));
  };

  const handleServiceChange = (idx, serviceName) => {
    setServiceSelections(prev => prev.map((row, i) => i === idx ? { serviceName, subServices: [] } : row));
  };

  const handleSubServicesChange = (idx, options) => {
    const values = (options || []).map(o => o.value);
    setServiceSelections(prev => prev.map((row, i) => i === idx ? { ...row, subServices: values } : row));
  };

  const getAvailableServicesForIndex = (idx) => {
    const taken = new Set(serviceSelections.map((r, i) => i !== idx ? r.serviceName : '').filter(Boolean));
    return services.filter(s => !taken.has(s.name));
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    // Validate form before sending OTP
    const locationValue = formData.location?.trim();
    let finalLocation = locationValue;
    if (!finalLocation) {
      try {
        const coords = await LocationService.getCurrentLocation();
        const locationData = await LocationService.getLocationFromCoordinates(coords.latitude, coords.longitude);
        const detectedCity = locationData.address?.city || locationData.address?.town || locationData.address?.village || locationData.address?.state_district || locationData.address?.county || 'Unknown';
        const closestCity = findClosestCity(detectedCity);
        finalLocation = closestCity ? closestCity.value : 'Not Specified';
      } catch (_) {
        finalLocation = 'Not Specified';
      }
    }

    const isValidCity = finalLocation === 'Not Specified' || cities.some(c => c.CityName === finalLocation);
    if (!isValidCity) {
      setError('Please select a valid city');
      return;
    }

    const servicesOffered = buildServicesOfferedObject();
    if (Object.keys(servicesOffered).length === 0) {
      setError('Please add at least one service with subservices');
      return;
    }
    
    for (const row of serviceSelections) {
      if ((row.serviceName && row.subServices.length === 0) || (!row.serviceName && row.subServices.length > 0)) {
        setError('Each service must have at least one subservice');
        return;
      }
    }

    const mobile = formData.ownerContactInfo;
    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    // Update location in formData if auto-detected
    if (finalLocation !== locationValue) {
      setFormData(prev => ({ ...prev, location: finalLocation }));
    }
    
    setOtpLoading(true);
    setError('');
    
    try {
      await enterpriseService.requestOTP(mobile, 'ENTERPRISE');
      setStep('otp');
      setOtpStatus('OTP sent successfully');
    } catch (err) {
      setError('Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (otpValue) => {
    setSubmitting(true);
    setError('');
    
    try {
      const servicesOffered = buildServicesOfferedObject();
      
      const enterpriseData = {
        ownerContactInfo: formData.ownerContactInfo,
        companyName: formData.companyName,
        servicesOffered,
        location: formData.location
      };

      // Store initial registration data and OTP for the details page
      localStorage.setItem('pendingEnterpriseRegistration', JSON.stringify(enterpriseData));
      localStorage.setItem('enterpriseOTP', otpValue);
      
      // Navigate to enterprise details form
      navigate('/enterpriseDetails', { 
        state: { registrationData: enterpriseData } 
      });
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Registration setup failed');
    } finally {
      setSubmitting(false);
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
      await enterpriseService.requestOTP(formData.ownerContactInfo, 'ENTERPRISE');
      setOtpStatus('OTP sent successfully');
    } catch (err) {
      setError('Failed to send OTP');
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
        isLoading={submitting}
        error={error}
        success={otpStatus}
        mobileNumber={formData.ownerContactInfo}
        title="Verify OTP"
        subtitle="Enter the 4-digit code sent to your mobile number"
      />
    );
  }

  return (
    <Container className="enterprise-auth-container">
      <Row className="justify-content-center w-100 m-0">
        <Col xs={12} sm={11} md={10} lg={9}>
          <Card className="enterprise-auth-card">
            <Card.Body>
              <div className="enterprise-auth-header">
                <h2 className="enterprise-auth-title"><FaBuilding className="me-2" /> Enterprise Registration</h2>
                <p className="enterprise-auth-subtitle">Register your business to hire and manage workforce</p>
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

              <Form onSubmit={handleSendOTP}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="enterprise-form-label"><FaPhone className="me-2" />Mobile Number</Form.Label>
                      <Form.Control
                        type="tel"
                        value={formData.ownerContactInfo}
                        onChange={(e) => setField('ownerContactInfo', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="10-digit mobile number"
                        pattern="[0-9]{10}"
                        maxLength={10}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="enterprise-form-label"><FaBuilding className="me-2" />Company Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setField('companyName', e.target.value)}
                        placeholder="Enter company name"
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12} className="mt-3">
                    <Form.Group>
                      <Form.Label className="enterprise-form-label"><FaTools className="me-2" />Services Offered</Form.Label>
                      {serviceSelections.map((row, idx) => {
                        const available = getAvailableServicesForIndex(idx);
                        const currentService = services.find(s => s.name === row.serviceName) || null;
                        const options = (currentService?.subCategories || []).map(sc => ({ value: sc, label: sc }));
                        return (
                          <Card key={`svc-${idx}`} className="mb-3 enterprise-service-card">
                            <Card.Body>
                              <Row className="g-3 align-items-end">
                                <Col md={5}>
                                  <Form.Label className="small">Service</Form.Label>
                                  <Form.Select
                                    value={row.serviceName}
                                    onChange={(e) => handleServiceChange(idx, e.target.value)}
                                  >
                                    <option value="">Select a service</option>
                                    {[...available, ...(row.serviceName ? services.filter(s => s.name === row.serviceName) : [])]
                                      .filter((v, i, arr) => arr.findIndex(x => x.name === v.name) === i)
                                      .map((s) => (
                                        <option key={s.name} value={s.name}>{s.name}</option>
                                      ))}
                                  </Form.Select>
                                </Col>
                                <Col md={6}>
                                  <Form.Label className="small">Subservices</Form.Label>
                                  <Select
                                    isMulti
                                    isDisabled={!row.serviceName}
                                    options={options}
                                    value={row.subServices.map(sc => ({ value: sc, label: sc }))}
                                    onChange={(opts) => handleSubServicesChange(idx, opts)}
                                    classNamePrefix="select"
                                    placeholder={row.serviceName ? 'Select subservices' : 'Select a service first'}
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                  />
                                </Col>
                                <Col md={1} className="d-flex justify-content-end">
                                  {serviceSelections.length > 1 && (
                                    <Button variant="outline-danger" size="sm" type="button" onClick={() => handleRemoveServiceRow(idx)}>
                                      <FaTrash />
                                    </Button>
                                  )}
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        );
                      })}
                      <Button variant="outline-primary" type="button" onClick={handleAddServiceRow}>
                        <FaPlus className="me-1" /> Add Service
                      </Button>
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mt-3">
                    <Form.Group>
                      <Form.Label className="enterprise-form-label"><FaMapMarkerAlt className="me-2" />Location</Form.Label>
                      <InputGroup>
                        <div style={{ flex: 1 }}>
                          <AsyncSelect
                            name="location"
                            loadOptions={(inputValue) => new Promise((resolve) => setTimeout(() => resolve(searchCities(inputValue)), 300))}
                            onChange={(opt) => {
                              setSelectedCity(opt);
                              setField('location', opt ? opt.value : '');
                            }}
                            value={selectedCity}
                            placeholder="Type to search cities"
                            isClearable
                            cacheOptions
                            defaultOptions={cities.length > 0 ? searchCities('') : []}
                            className="basic-single"
                            classNamePrefix="select"
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }), control: base => ({ ...base, minHeight: '46px' }) }}
                            noOptionsMessage={({ inputValue }) => inputValue ? `No cities found for "${inputValue}"` : 'Type to search cities'}
                          />
                        </div>
                        <Button variant="outline-primary" type="button" onClick={handleDetectLocation} disabled={locationLoading} style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                          {locationLoading ? (<><Spinner size="sm" className="me-1" /> Detecting</>) : (<><FaLocationArrow className="me-1" /> Auto Detect</>)}
                        </Button>
                      </InputGroup>
                      <Form.Text className="text-muted">Type to search and select your city</Form.Text>
                    </Form.Group>
                  </Col>


                </Row>

                <div className="enterprise-sticky-footer d-grid gap-2 mt-4">
                  <Button type="submit" variant="primary" className="enterprise-auth-btn-lg fw-bold d-flex align-items-center justify-content-center" disabled={otpLoading}>
                    {otpLoading ? (<><Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" /> Sending OTP...</>) : (<>Send OTP <FaArrowRight className="ms-2" /></>)}
                  </Button>
                </div>
                <div className="text-center mt-4">
                  <p className="mb-0">
                    Already have an enterprise account?{' '}
                    <Button variant="link" className="p-0 text-decoration-none" onClick={() => navigate('/enterpriseLogin')}>
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

export default EnterpriseRegister;


