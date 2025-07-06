import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Alert, Row, Col, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { labourService } from '../services/labourService';
import { FaUser, FaTools, FaPhone, FaKey, FaEye, FaEyeSlash, FaArrowRight, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import Select from 'react-select';
import '../styles/LabourRegister.css';

function LabourRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    labourName: '',
    labourSkill: '',
    labourSubSkill: [],
    labourMobileNo: ''
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

  useEffect(() => {
    // Fetch services data
    fetch('/services.json')
      .then(response => response.json())
      .then(data => setServices(data.services))
      .catch(error => console.error('Error loading services:', error));
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
      // Prepare subSkills array for API
      const labourData = {
        labourName: formData.labourName,
        labourSkill: formData.labourSkill,
        labourSubSkills: formData.labourSubSkill.map(subSkill => ({ subSkillName: subSkill })),
        labourMobileNo: formData.labourMobileNo
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