import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import '../styles/AuthFormShell.css';
import '../styles/OTPVerification.css';

function OTPVerification({ 
  onVerify, 
  onBack, 
  onResend, 
  isLoading = false, 
  error = '', 
  success = '',
  mobileNumber = '',
  title,
  subtitle
}) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t('auth.verifyOtp');
  const resolvedSubtitle = subtitle ?? t('auth.enterOtpSentToMobile');
  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Only allow single digit
    if (value.length > 1) return;
    
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Enter') {
      const otpString = otp.join('');
      if (otpString.length === 4 && !isLoading) {
        e.preventDefault();
        onVerify(otpString);
      }
      return;
    }

    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    const newOtp = [...otp];
    
    for (let i = 0; i < 4; i++) {
      newOtp[i] = pastedData[i] || '';
    }
    
    setOtp(newOtp);
    
    // Focus the next empty input or last input
    const nextEmptyIndex = newOtp.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex === -1 ? 3 : nextEmptyIndex;
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length === 4) {
      onVerify(otpString);
    }
  };

  const handleResend = () => {
    setOtp(['', '', '', '']);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    onResend();
  };

  const isOtpComplete = otp.every(digit => digit !== '');

  return (
    <div className="auth-form-shell auth-form-shell--otp">
      <div className="auth-form-shell__scroll">
        <div className="auth-form-shell__inner">
          <header className="auth-form-hero">
            <p className="auth-form-hero__eyebrow mb-0">{t('auth.otpStepEyebrow')}</p>
            <h1 className="auth-form-hero__title">{resolvedTitle}</h1>
            <p className="auth-form-hero__subtitle">{resolvedSubtitle}</p>
            {mobileNumber ? (
              <p className="otp-mobile-number mb-0 mt-2">+91 {mobileNumber}</p>
            ) : null}
          </header>

          <div className="auth-form-panel otp-verification-panel">
            {error && (
              <Alert variant="danger" className="mb-3 d-flex align-items-center">
                <FaExclamationCircle className="me-2 flex-shrink-0" />
                {error}
              </Alert>
            )}

            {success && (
              <Alert variant="success" className="mb-3 d-flex align-items-center">
                <FaCheckCircle className="me-2 flex-shrink-0" />
                {success}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <div className="otp-input-container">
                {otp.map((digit, index) => (
                  <Form.Control
                    key={index}
                    ref={(el) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="otp-input"
                    maxLength={1}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              <div className="otp-actions">
                <Button
                  variant="primary"
                  type="submit"
                  className="otp-verify-btn w-100"
                  disabled={!isOtpComplete || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="me-2" />
                      {t('auth.verifying')}
                    </>
                  ) : (
                    t('auth.verifyOtp')
                  )}
                </Button>

                <div className="otp-secondary-actions">
                  <Button
                    variant="outline-secondary"
                    onClick={onBack}
                    className="otp-back-btn"
                    disabled={isLoading}
                    type="button"
                  >
                    <FaArrowLeft className="me-2" />
                    {t('auth.back')}
                  </Button>

                  <Button
                    variant="link"
                    onClick={handleResend}
                    className="otp-resend-btn"
                    disabled={isLoading}
                    type="button"
                  >
                    {t('auth.resendOtp')}
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OTPVerification;
