import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { FaPhone, FaKey, FaEye, FaEyeSlash, FaArrowRight, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { enterpriseService } from '../services/enterpriseService';
import '../styles/EnterpriseAuth.css';

function EnterpriseLogin() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStatus, setOtpStatus] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const navigate = useNavigate();

  const handleRequestOTP = async () => {
    setOtpStatus('');
    setOtpLoading(true);
    if (!mobileNumber || !/^[0-9]{10}$/.test(mobileNumber)) {
      setOtpStatus('Please enter a valid 10-digit mobile number');
      setOtpLoading(false);
      return;
    }
    try {
      await enterpriseService.requestOTP(mobileNumber, 'ENTERPRISE');
      setOtpStatus('OTP sent successfully');
    } catch (err) {
      setOtpStatus('Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mobileNumber.trim()) {
      setError('Please enter mobile number');
      return;
    }
    if (!otp.trim()) {
      setError('Please enter OTP');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await enterpriseService.loginEnterprise(mobileNumber, otp);
      if (response && response.token && response.returnValue) {
        localStorage.setItem('enterprise', JSON.stringify({ ...response.returnValue, token: response.token }));
        navigate('/enterpriseDashboard');
      } else {
        setError('Invalid mobile or OTP');
      }
    } catch (err) {
      setError('Error during login');
      console.error('Enterprise login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (otpStatus && otpStatus.toLowerCase().includes('success')) {
      const timer = setTimeout(() => setOtpStatus(''), 2000);
      return () => clearTimeout(timer);
    }
  }, [otpStatus]);

  return (
    <Container className="enterprise-auth-container">
      <Row className="justify-content-center w-100 m-0">
        <Col xs={12} sm={11} md={9} lg={6} xl={5}>
          <Card className="enterprise-auth-card">
            <Card.Body>
              <div className="enterprise-auth-header">
                <h2 className="enterprise-auth-title">Enterprise Login</h2>
                <p className="enterprise-auth-subtitle">Enter mobile to access your enterprise account</p>
              </div>
              {error && (
                <Alert variant="danger" className="mb-4 d-flex align-items-center">
                  <FaExclamationCircle className="me-2" />
                  {error}
                </Alert>
              )}
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="text-muted">
                    <FaPhone className="me-2" />
                    Mobile Number
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="tel"
                      placeholder="Enter mobile number"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className="py-2"
                      pattern="[0-9]{10}"
                      maxLength="10"
                      required
                    />
                    <Button
                      variant="outline-primary"
                      type="button"
                      onClick={handleRequestOTP}
                      disabled={otpLoading}
                    >
                      {otpLoading ? 'Sending...' : 'Request OTP'}
                    </Button>
                  </InputGroup>
                  {otpStatus && (
                    <Form.Text className={otpStatus.includes('success') ? 'text-success' : 'text-danger'}>
                      {otpStatus}
                    </Form.Text>
                  )}
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="text-muted">
                    <FaKey className="me-2" />
                    OTP
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showOtp ? "text" : "password"}
                      placeholder="Enter OTP"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="py-2"
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
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 enterprise-auth-btn-lg d-flex align-items-center justify-content-center"
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
                      Logging in
                    </>
                  ) : (
                    <>
                      Login <FaArrowRight className="ms-2" />
                    </>
                  )}
                </Button>
              </Form>
              <div className="text-center mt-4">
                <p className="mb-0">
                  Don't have an enterprise account?{' '}
                  <Button
                    variant="link"
                    className="p-0 text-decoration-none"
                    onClick={() => navigate('/enterpriseRegister')}
                  >
                    Register here
                  </Button>
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default EnterpriseLogin;


