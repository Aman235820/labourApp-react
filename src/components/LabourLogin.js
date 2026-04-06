import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaPhone, FaArrowRight, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { labourService } from '../services/labourService';
import { useTranslation } from 'react-i18next';
import OTPVerification from './OTPVerification';
import '../styles/AuthFormShell.css';

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
    if (otpLoading) return;
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
    if (isLoading) return;
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
    <div className="auth-form-shell auth-form-shell--labour">
      <div className="auth-form-shell__scroll">
        <div className="auth-form-shell__inner">
          <header className="auth-form-hero">
            <p className="auth-form-hero__eyebrow mb-0">{t('home.headerTitle')}</p>
            <h1 className="auth-form-hero__title">{t('auth.labourLogin')}</h1>
            <p className="auth-form-hero__subtitle">{t('auth.enterMobileToAccess')}</p>
          </header>

          <div className="auth-form-panel">
            {error && (
              <Alert variant="danger" className="mb-3 d-flex align-items-center">
                <FaExclamationCircle className="me-2 flex-shrink-0" />
                {error}
              </Alert>
            )}
            <Form onSubmit={handleSendOTP}>
              <Form.Group className="mb-3">
                <Form.Label>
                  <FaPhone className="me-2 text-primary" aria-hidden />
                  {t('auth.mobileNumber')}
                </Form.Label>
                <Form.Control
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder={t('auth.enterMobileNumber')}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
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
              <span className="text-muted">{t('auth.dontHaveAccount')}</span>{' '}
              <Button type="button" variant="link" className="p-0 align-baseline" onClick={() => navigate('/labourRegister')}>
                {t('auth.registerHere')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LabourLogin; 