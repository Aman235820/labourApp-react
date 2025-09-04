import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { FaArrowLeft, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import '../styles/OTPVerification.css';

function OTPVerification({ 
  onVerify, 
  onBack, 
  onResend, 
  isLoading = false, 
  error = '', 
  success = '',
  mobileNumber = '',
  title = 'Verify OTP',
  subtitle = 'Enter the 4-digit code sent to your mobile number'
}) {
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
    <Container className="otp-verification-container">
      <Row className="justify-content-center w-100 m-0">
        <Col xs={12} sm={10} md={8} lg={6} xl={5}>
          <Card className="otp-verification-card">
            <Card.Body>
              <div className="otp-verification-header">
                <h2 className="otp-verification-title">{title}</h2>
                <p className="otp-verification-subtitle">{subtitle}</p>
                {mobileNumber && (
                  <p className="otp-mobile-number">+91 {mobileNumber}</p>
                )}
              </div>

              {error && (
                <Alert variant="danger" className="mb-4 d-flex align-items-center">
                  <FaExclamationCircle className="me-2" />
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="mb-4 d-flex align-items-center">
                  <FaCheckCircle className="me-2" />
                  {success}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <div className="otp-input-container">
                  {otp.map((digit, index) => (
                    <Form.Control
                      key={index}
                      ref={el => inputRefs.current[index] = el}
                      type="text"
                      value={digit}
                      onChange={e => handleChange(index, e.target.value)}
                      onKeyDown={e => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="otp-input"
                      maxLength={1}
                      inputMode="numeric"
                    />
                  ))}
                </div>

                <div className="otp-actions">
                  <Button
                    variant="primary"
                    type="submit"
                    className="otp-verify-btn"
                    disabled={!isOtpComplete || isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Verifying...
                      </>
                    ) : (
                      'Verify OTP'
                    )}
                  </Button>

                  <div className="otp-secondary-actions">
                    <Button
                      variant="outline-secondary"
                      onClick={onBack}
                      className="otp-back-btn"
                      disabled={isLoading}
                    >
                      <FaArrowLeft className="me-2" />
                      Back
                    </Button>

                    <Button
                      variant="link"
                      onClick={handleResend}
                      className="otp-resend-btn"
                      disabled={isLoading}
                    >
                      Resend OTP
                    </Button>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default OTPVerification;
