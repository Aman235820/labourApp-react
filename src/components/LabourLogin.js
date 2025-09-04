import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { FaPhone, FaArrowRight, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { labourService } from '../services/labourService';
import { useTranslation } from 'react-i18next';
import OTPVerification from './OTPVerification';
import '../styles/LabourLogin.css';

function LabourLogin() {
  const [step, setStep] = useState('form'); // 'form' or 'otp'
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpStatus, setOtpStatus] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!mobileNumber || !/^[0-9]{10}$/.test(mobileNumber)) {
      setError(t('auth.pleaseEnterValidMobile'));
      return;
    }
    
    setOtpLoading(true);
    setError(null);
    
    try {
      await labourService.requestOTP(mobileNumber, 'LABOUR');
      setStep('otp');
      setOtpStatus(t('auth.otpSentSuccessfully'));
    } catch (err) {
      setError(err.message || t('auth.failedToSendOtp'));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (otpValue) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await labourService.loginLabour(mobileNumber, otpValue);
      if (response && response.token && response.returnValue) {
        // Filter out reviews data before storing in localStorage
        const { reviews, ...labourDataWithoutReviews } = response.returnValue;
        localStorage.setItem('labour', JSON.stringify({ ...labourDataWithoutReviews, token: response.token }));
        navigate('/labourDashboard');
      } else {
        setError(t('auth.invalidMobileOrOtp'));
      }
    } catch (err) {
      setError(t('auth.errorDuringLogin'));
      console.error('Login error:', err);
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
      await labourService.requestOTP(mobileNumber, 'LABOUR');
      setOtpStatus(t('auth.otpSentSuccessfully'));
    } catch (err) {
      setError(err.message || t('auth.failedToSendOtp'));
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
        title={t('auth.verifyOtp')}
        subtitle={t('auth.enterOtpSentToMobile')}
      />
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm login-card">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="display-6 mb-3">{t('auth.labourLogin')}</h2>
                <p className="text-muted">{t('auth.enterMobileToAccess')}</p>
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
                    {t('auth.mobileNumber')}
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder={t('auth.enterMobileNumber')}
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
                  className="w-100 py-2 d-flex align-items-center justify-content-center"
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
              </Form>
              <div className="text-center mt-4">
                <p className="mb-0">
                  {t('auth.dontHaveAccount')}{' '}
                  <Button
                    variant="link"
                    className="p-0 text-decoration-none"
                    onClick={() => navigate('/labourRegister')}
                  >
                    {t('auth.registerHere')}
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

export default LabourLogin; 