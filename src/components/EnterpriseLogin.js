import React, { useEffect, useState } from 'react';
import { Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaPhone, FaArrowRight, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { enterpriseService } from '../services/enterpriseService';
import OTPVerification from './OTPVerification';
import '../styles/AuthFormShell.css';
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
    if (otpLoading) return;
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
    if (isLoading) return;
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await enterpriseService.loginEnterprise(mobileNumber, otpValue);
      if (response && response.token && response.returnValue) {
        const id = String(response.returnValue.id || '').trim();
        const mongoOk = /^[0-9a-fA-F]{24}$/.test(id);
        if (!mongoOk) {
          setError('Login succeeded but enterprise id is missing or invalid. Please try again or contact support.');
          return;
        }
        const toStore = {
          ...response.returnValue,
          token: response.token,
          enterpriseId: id,
        };
        localStorage.setItem('enterprise', JSON.stringify(toStore));
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
    <div className="auth-form-shell auth-form-shell--enterprise">
      <div className="auth-form-shell__scroll">
        <div className="auth-form-shell__inner">
          <header className="auth-form-hero">
            <p className="auth-form-hero__eyebrow mb-0">Enterprise</p>
            <h1 className="auth-form-hero__title">Enterprise Login</h1>
            <p className="auth-form-hero__subtitle">
              Enter your mobile number to sign in to your business account
            </p>
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
                  Mobile number
                </Form.Label>
                <Form.Control
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="10-digit mobile number"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  pattern="[0-9]{10}"
                  maxLength={10}
                  required
                />
              </Form.Group>
              <div className="auth-form-sticky-cta">
                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 d-flex align-items-center justify-content-center"
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
                      Sending OTP…
                    </>
                  ) : (
                    <>
                      Send OTP <FaArrowRight className="ms-2" />
                    </>
                  )}
                </Button>
              </div>
            </Form>
            <div className="auth-form-alt-action">
              <span className="text-muted">No enterprise account yet?</span>{' '}
              <Button
                type="button"
                variant="link"
                className="p-0 align-baseline"
                onClick={() => navigate('/enterpriseRegister')}
              >
                Register
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnterpriseLogin;


