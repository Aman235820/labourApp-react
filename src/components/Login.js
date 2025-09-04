import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { userService, loginUser, requestOTP } from '../services/userService';
import { FaPhone, FaArrowRight, FaExclamationCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import OTPVerification from './OTPVerification';
import '../styles/Login.css';

const Login = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [step, setStep] = useState('form'); // 'form' or 'otp'
    const [mobileNumber, setMobileNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [otpStatus, setOtpStatus] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    useEffect(() => {
        if (otpStatus && otpStatus.toLowerCase().includes('success')) {
            const timer = setTimeout(() => setOtpStatus(''), 2000);
            return () => clearTimeout(timer);
        }
    }, [otpStatus]);

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!mobileNumber || !/^[0-9]{10}$/.test(mobileNumber)) {
            setError(t('auth.pleaseEnterValidMobile'));
            return;
        }
        
        setOtpLoading(true);
        setError('');
        
        try {
            await requestOTP(mobileNumber, 'USER');
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
        setError('');
        
        try {
            const response = await loginUser({ mobileNumber, otp: otpValue });
            if (response.token && response.returnValue) {
                localStorage.setItem('user', JSON.stringify({ ...response.returnValue, token: response.token }));
                
                // Dispatch custom event to notify sidebar about login status change
                window.dispatchEvent(new Event('userLoginStatusChanged'));
                
                navigate('/userHome');
            } else {
                setError(t('auth.loginFailed'));
            }
        } catch (error) {
            setError(error.message || t('auth.loginFailed'));
        } finally {
            setIsLoading(false);
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
            await requestOTP(mobileNumber, 'USER');
            setOtpStatus(t('auth.otpSentSuccessfully'));
        } catch (err) {
            setError(err.message || t('auth.failedToSendOtp'));
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
        <Container className="mt-5 mb-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow-lg border-0">
                        <Card.Body className="p-5">
                            <div className="text-center mb-4">
                                <h2 className="fw-bold text-primary">{t('auth.welcomeBack')}</h2>
                                <p className="text-muted">{t('auth.signInToContinue')}</p>
                            </div>

                            {error && (
                                <div className="alert alert-danger d-flex align-items-center" role="alert">
                                    <FaExclamationCircle className="me-2" />
                                    {error}
                                </div>
                            )}

                            <Form onSubmit={handleSendOTP}>
                                <Form.Group className="mb-4">
                                    <div className="d-flex align-items-center">
                                        <FaPhone className="me-2" />
                                        <Form.Label className="fw-bold mb-0">{t('auth.mobileNumber')}</Form.Label>
                                    </div>
                                    <Form.Control
                                        type="tel"
                                        placeholder={t('auth.enterMobileNumber')}
                                        className="form-control-lg"
                                        value={mobileNumber}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setMobileNumber(value);
                                        }}
                                        maxLength="10"
                                        required
                                    />
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="btn-lg fw-bold d-flex align-items-center justify-content-center"
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

                                <div className="text-center mt-4">
                                    <p className="mb-0">
                                        {t('auth.dontHaveAccount')}{' '}
                                        <Button
                                            variant="link"
                                            className="p-0 text-decoration-none"
                                            onClick={() => navigate('/register')}
                                        >
                                            {t('auth.registerHere')}
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
};

export default Login; 