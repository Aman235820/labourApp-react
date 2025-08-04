import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { FaEye, FaEyeSlash, FaLock, FaEnvelope, FaSignInAlt, FaArrowLeft, FaPhone, FaKey, FaArrowRight, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { labourService } from '../services/labourService';
import { useTranslation } from 'react-i18next';
import '../styles/LabourLogin.css';

function LabourLogin() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStatus, setOtpStatus] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleRequestOTP = async () => {
    setOtpStatus('');
    setOtpLoading(true);
    if (!mobileNumber || !/^[0-9]{10}$/.test(mobileNumber)) {
      setOtpStatus(t('auth.pleaseEnterValidMobile'));
      setOtpLoading(false);
      return;
    }
    try {
      await labourService.requestOTP(mobileNumber, 'LABOUR');
      setOtpStatus(t('auth.otpSentSuccessfully'));
    } catch (err) {
      setOtpStatus(err.message || t('auth.failedToSendOtp'));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mobileNumber.trim()) {
      setError(t('auth.pleaseEnterMobileNumber'));
      return;
    }
    if (!otp.trim()) {
      setError(t('auth.pleaseEnterOtp'));
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      const response = await labourService.loginLabour(mobileNumber, otp);
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
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="text-muted">
                    <FaPhone className="me-2" />
                    {t('auth.mobileNumber')}
                  </Form.Label>
                  <InputGroup>
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
                    <Button
                      variant="outline-primary"
                      type="button"
                      onClick={handleRequestOTP}
                      disabled={otpLoading}
                    >
                      {otpLoading ? t('auth.sendingOtp') : t('auth.requestOtp')}
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
                    {t('auth.otp')}
                  </Form.Label>
                  <InputGroup>
                    <Form.Control
                      type={showOtp ? "text" : "password"}
                      placeholder={t('auth.enterOtp')}
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
                  className="w-100 py-2 d-flex align-items-center justify-content-center"
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
                      {t('auth.loggingIn')}
                    </>
                  ) : (
                    <>
                      {t('auth.login')} <FaArrowRight className="ms-2" />
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