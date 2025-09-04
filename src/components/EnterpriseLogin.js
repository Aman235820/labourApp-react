import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { FaPhone, FaArrowRight, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { enterpriseService } from '../services/enterpriseService';
import OTPVerification from './OTPVerification';
import '../styles/EnterpriseAuth.css';

function EnterpriseLogin() {
  const [step, setStep] = useState('form'); // 'form' or 'otp'
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpStatus, setOtpStatus] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!mobileNumber || !/^[0-9]{10}$/.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    
    setOtpLoading(true);
    setError(null);
    
    try {
      await enterpriseService.requestOTP(mobileNumber, 'ENTERPRISE');
      setStep('otp');
      setOtpStatus('OTP sent successfully');
    } catch (err) {
      setError('Failed to send OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (otpValue) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await enterpriseService.loginEnterprise(mobileNumber, otpValue);
      if (response && response.token && response.returnValue) {
        localStorage.setItem('enterprise', JSON.stringify({ ...response.returnValue, token: response.token }));
        navigate('/enterpriseDashboard');
      } else {
        setError('Invalid OTP');
      }
    } catch (err) {
      setError('Error during login');
      console.error('Enterprise login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToForm = () => {
    setStep('form');
    setError(null);
    setOtpStatus('');
  };

  const handleResendOTP = async () => {
    setOtpLoading(true);
    setError(null);
    setOtpStatus('');
    
    try {
      await enterpriseService.requestOTP(mobileNumber, 'ENTERPRISE');
      setOtpStatus('OTP sent successfully');
    } catch (err) {
      setError('Failed to send OTP');
    } finally {
      setOtpLoading(false);
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

  if (step === 'otp') {
    return (
      <OTPVerification
        onVerify={handleVerifyOTP}
        onBack={handleBackToForm}
        onResend={handleResendOTP}
        isLoading={isLoading}
        error={error}
        success={otpStatus}
        mobileNumber={mobileNumber}
        title="Verify OTP"
        subtitle="Enter the 4-digit code sent to your mobile number"
      />
    );
  }

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
              <Form onSubmit={handleSendOTP}>
                <Form.Group className="mb-4">
                  <Form.Label className="text-muted">
                    <FaPhone className="me-2" />
                    Mobile Number
                  </Form.Label>
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
                </Form.Group>
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 enterprise-auth-btn-lg d-flex align-items-center justify-content-center"
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
                      Sending OTP...
                    </>
                  ) : (
                    <>
                      Send OTP <FaArrowRight className="ms-2" />
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


