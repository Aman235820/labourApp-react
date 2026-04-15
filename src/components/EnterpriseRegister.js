import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import AsyncSelect from 'react-select/async';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { enterpriseService } from '../services/enterpriseService';
import LocationService from '../services/LocationService';
import OTPVerification from './OTPVerification';
import '../styles/AuthFormShell.css';
import '../styles/EnterpriseAuth.css';
import {
  FaPhone,
  FaBuilding,
  FaTools,
  FaPlus,
  FaTrash,
  FaMapMarkerAlt,
  FaLocationArrow,
  FaArrowRight,
  FaExclamationCircle,
  FaCheckCircle,
} from 'react-icons/fa';

function EnterpriseRegister() {
  const { t } = useTranslation();
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
        setSuccess(t('enterpriseAuth.locationDetected', { city: closestCity.value }));
      } else {
        setError(t('enterpriseAuth.cityNotInList', { city: detectedCity }));
      }
    } catch (e) {
      setError(t('enterpriseAuth.detectLocationFailed'));
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
    if (options && options.some(option => option.value === 'all')) {
      // Select All option was chosen - select all subcategories for this service
      const currentService = services.find(s => s.name === serviceSelections[idx].serviceName);
      const allSubServices = currentService?.subCategories || [];
      setServiceSelections(prev => prev.map((row, i) => i === idx ? { ...row, subServices: allSubServices } : row));
    } else {
      // Normal selection - filter out 'all' option if present
      const values = (options || []).map(o => o.value).filter(value => value !== 'all');
      setServiceSelections(prev => prev.map((row, i) => i === idx ? { ...row, subServices: values } : row));
    }
  };

  const getAvailableServicesForIndex = (idx) => {
    const taken = new Set(serviceSelections.map((r, i) => i !== idx ? r.serviceName : '').filter(Boolean));
    return services.filter(s => !taken.has(s.name));
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (otpLoading) return;

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
      setError(t('enterpriseAuth.errors.selectValidCity'));
      return;
    }

    const servicesOffered = buildServicesOfferedObject();
    if (Object.keys(servicesOffered).length === 0) {
      setError(t('enterpriseAuth.errors.addServiceWithSubs'));
      return;
    }
    
    for (const row of serviceSelections) {
      if ((row.serviceName && row.subServices.length === 0) || (!row.serviceName && row.subServices.length > 0)) {
        setError(t('enterpriseAuth.errors.eachServiceNeedsSub'));
        return;
      }
    }

    const mobile = formData.ownerContactInfo;
    if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
      setError(t('enterpriseAuth.errors.invalidMobile'));
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
      setOtpStatus(t('auth.otpSentSuccessfully'));
    } catch (err) {
      setError(t('auth.failedToSendOtp'));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (otpValue) => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    
    try {
      const servicesOffered = buildServicesOfferedObject();
      
      const enterpriseData = {
        ownerContactInfo: formData.ownerContactInfo,
        companyName: formData.companyName,
        servicesOffered,
        location: formData.location,
        ownername: '', // Initialize as empty to trigger popup
        otherContactNumbers: [],
        workforceSize: '',
        registrationCertificateLink: '',
        otherDocumentLinks: {
          license: '',
          insurance: ''
        }
      };

      // Complete registration directly
      const response = await enterpriseService.registerEnterprise(enterpriseData, otpValue);
      
      if (response && response.token && response.returnValue) {
        const mongoIdPattern = /^[0-9a-fA-F]{24}$/;
        const enterpriseId = String(response.returnValue.id || '').trim();
        if (!mongoIdPattern.test(enterpriseId)) {
          setError(t('enterpriseAuth.errors.registrationInvalidId'));
          return;
        }

        const enterpriseData = {
          ...response.returnValue,
          token: response.token,
          enterpriseId,
        };
        localStorage.setItem('enterprise', JSON.stringify(enterpriseData));
        
        // Navigate directly to dashboard
        navigate('/enterpriseDashboard');
      } else {
        setError(t('enterpriseAuth.errors.registrationFailed'));
      }
    } catch (err) {
      setError(typeof err === 'string' ? err : t('enterpriseAuth.errors.registrationFailed'));
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
      setOtpStatus(t('auth.otpSentSuccessfully'));
    } catch (err) {
      setError(t('auth.failedToSendOtp'));
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
        title={t('auth.verifyOtp')}
        subtitle={t('auth.enterOtpSentToMobile')}
      />
    );
  }

  return (
    <div className="auth-form-shell auth-form-shell--enterprise auth-form-shell--wide">
      <div className="auth-form-shell__scroll">
        <div className="auth-form-shell__inner">
          <header className="auth-form-hero">
            <p className="auth-form-hero__eyebrow mb-0">{t('enterpriseAuth.eyebrow')}</p>
            <h1 className="auth-form-hero__title">
              <FaBuilding className="text-primary" aria-hidden />
              {t('enterpriseAuth.registerTitle')}
            </h1>
            <p className="auth-form-hero__subtitle">
              {t('enterpriseAuth.registerSubtitle')}
            </p>
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
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="enterprise-form-label"><FaPhone className="me-2" />{t('enterpriseAuth.mobileNumber')}</Form.Label>
                      <Form.Control
                        type="tel"
                        value={formData.ownerContactInfo}
                        onChange={(e) => setField('ownerContactInfo', e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder={t('enterpriseAuth.mobilePlaceholder')}
                        pattern="[0-9]{10}"
                        maxLength={10}
                        required
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="enterprise-form-label"><FaBuilding className="me-2" />{t('enterpriseAuth.companyName')}</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.companyName}
                        onChange={(e) => setField('companyName', e.target.value)}
                        placeholder={t('enterpriseAuth.companyNamePlaceholder')}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12} className="mt-3">
                    <Form.Group>
                      <Form.Label className="enterprise-form-label"><FaTools className="me-2" />{t('enterpriseAuth.servicesOffered')}</Form.Label>
                      {serviceSelections.map((row, idx) => {
                        const available = getAvailableServicesForIndex(idx);
                        const currentService = services.find(s => s.name === row.serviceName) || null;
                        const subCategories = currentService?.subCategories || [];
                        const options = [
                          { value: 'all', label: t('enterpriseAuth.selectAll') },
                          ...subCategories.map(sc => ({ value: sc, label: sc }))
                        ];
                        return (
                          <Card key={`svc-${idx}`} className="mb-3 enterprise-service-card">
                            <Card.Body>
                              <Row className="g-3 align-items-end">
                                <Col md={5}>
                                  <Form.Label className="small">{t('enterpriseAuth.service')}</Form.Label>
                                  <Form.Select
                                    value={row.serviceName}
                                    onChange={(e) => handleServiceChange(idx, e.target.value)}
                                  >
                                    <option value="">{t('enterpriseAuth.selectService')}</option>
                                    {[...available, ...(row.serviceName ? services.filter(s => s.name === row.serviceName) : [])]
                                      .filter((v, i, arr) => arr.findIndex(x => x.name === v.name) === i)
                                      .map((s) => (
                                        <option key={s.name} value={s.name}>{s.name}</option>
                                      ))}
                                  </Form.Select>
                                </Col>
                                <Col md={6}>
                                  <Form.Label className="small">{t('enterpriseAuth.subservices')}</Form.Label>
                                  <Select
                                    isMulti
                                    isDisabled={!row.serviceName}
                                    options={options}
                                    value={row.subServices.map(sc => ({ value: sc, label: sc }))}
                                    onChange={(opts) => handleSubServicesChange(idx, opts)}
                                    classNamePrefix="select"
                                    placeholder={row.serviceName ? t('enterpriseAuth.selectSubservices') : t('enterpriseAuth.selectServiceFirst')}
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
                        <FaPlus className="me-1" /> {t('enterpriseAuth.addService')}
                      </Button>
                    </Form.Group>
                  </Col>

                  <Col md={12} className="mt-3">
                    <Form.Group>
                      <Form.Label className="enterprise-form-label"><FaMapMarkerAlt className="me-2" />{t('enterpriseAuth.location')}</Form.Label>
                      <InputGroup className="auth-form-input-group--stack">
                        <div className="auth-form-async-select-wrap">
                          <AsyncSelect
                            name="location"
                            loadOptions={(inputValue) => new Promise((resolve) => setTimeout(() => resolve(searchCities(inputValue)), 300))}
                            onChange={(opt) => {
                              setSelectedCity(opt);
                              setField('location', opt ? opt.value : '');
                            }}
                            value={selectedCity}
                            placeholder={t('auth.typeToSearchCities')}
                            isClearable
                            cacheOptions
                            defaultOptions={cities.length > 0 ? searchCities('') : []}
                            className="basic-single"
                            classNamePrefix="select"
                            menuPortalTarget={document.body}
                            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }), control: base => ({ ...base, minHeight: '46px' }) }}
                            noOptionsMessage={({ inputValue }) =>
                              inputValue ? t('enterpriseAuth.noCitiesFor', { query: inputValue }) : t('auth.typeToSearchCities')
                            }
                          />
                        </div>
                        <Button variant="outline-primary" type="button" onClick={handleDetectLocation} disabled={locationLoading} style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}>
                          {locationLoading ? (<><Spinner size="sm" className="me-1" /> {t('enterpriseAuth.detecting')}</>) : (<><FaLocationArrow className="me-1" /> {t('enterpriseAuth.autoDetect')}</>)}
                        </Button>
                      </InputGroup>
                      <Form.Text className="text-muted">{t('enterpriseAuth.locationHint')}</Form.Text>
                    </Form.Group>
                  </Col>


                </Row>

                <div className="enterprise-sticky-footer auth-form-sticky-cta d-grid gap-2 mt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="fw-bold d-flex align-items-center justify-content-center"
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
                        {t('enterpriseAuth.sendingOtp')}
                      </>
                    ) : (
                      <>
                        {t('auth.sendOtp')} <FaArrowRight className="ms-2" />
                      </>
                    )}
                  </Button>
                </div>
                <div className="auth-form-alt-action">
                  <span className="text-muted">{t('enterpriseAuth.alreadyRegistered')}</span>{' '}
                  <Button type="button" variant="link" className="p-0 align-baseline" onClick={() => navigate('/enterpriseLogin')}>
                    {t('enterpriseAuth.signIn')}
                  </Button>
                </div>
              </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnterpriseRegister;


