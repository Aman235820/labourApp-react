import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Spinner, InputGroup } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { registerUser, requestOTP } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaArrowRight, FaExclamationCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import OTPVerification from './OTPVerification';

const Register = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [step, setStep] = useState('form'); // 'form' or 'otp'
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        mobileNumber: ''
    });
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
        
        // Validate form data
        if (!formData.fullName || formData.fullName.length < 3) {
            setError(t('auth.nameMustBeAtLeast3'));
            return;
        }
        
        if (!formData.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            setError(t('auth.pleaseEnterValidEmail'));
            return;
        }
        
        if (!formData.mobileNumber || !/^[0-9]{10}$/.test(formData.mobileNumber)) {
            setError(t('auth.pleaseEnterValidMobile'));
            return;
        }
        
        setOtpLoading(true);
        setError('');
        
        try {
            await requestOTP(formData.mobileNumber, 'USER');
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
            const response = await registerUser(formData, otpValue);
            if (response.token && response.returnValue) {
                localStorage.setItem('user', JSON.stringify({ ...response.returnValue, token: response.token }));
                navigate('/userHome');
            } else {
                setError(t('auth.registrationFailed'));
            }
        } catch (error) {
            console.error('Registration failed:', error);
            setError(error.message || t('auth.registrationFailed'));
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
            await requestOTP(formData.mobileNumber, 'USER');
            setOtpStatus(t('auth.otpSentSuccessfully'));
        } catch (err) {
            setError(err.message || t('auth.failedToSendOtp'));
        } finally {
            setOtpLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
                mobileNumber={formData.mobileNumber}
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
                                <h2 className="fw-bold text-primary">{t('auth.createAccount')}</h2>
                                <p className="text-muted">{t('auth.joinInstaLab')}</p>
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
                                        <FaUser className="me-2" />
                                        <Form.Label className="fw-bold mb-0">{t('auth.fullName')}</Form.Label>
                                    </div>
                                    <Form.Control
                                        type="text"
                                        placeholder={t('auth.enterFullName')}
                                        className="form-control-lg"
                                        value={formData.fullName}
                                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <div className="d-flex align-items-center">
                                        <FaEnvelope className="me-2" />
                                        <Form.Label className="fw-bold mb-0">{t('auth.emailAddress')}</Form.Label>
                                    </div>
                                    <Form.Control
                                        type="email"
                                        placeholder={t('auth.enterEmail')}
                                        className="form-control-lg"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <div className="d-flex align-items-center">
                                        <FaPhone className="me-2" />
                                        <Form.Label className="fw-bold mb-0">{t('auth.mobileNumber')}</Form.Label>
                                    </div>
                                    <Form.Control
                                        type="tel"
                                        placeholder={t('auth.enterMobileNumber')}
                                        className="form-control-lg"
                                        value={formData.mobileNumber}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            handleInputChange('mobileNumber', value);
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
                                        {t('auth.alreadyHaveAccount')}{' '}
                                        <Button 
                                            variant="link" 
                                            className="p-0 text-decoration-none"
                                            onClick={() => navigate('/login')}
                                        >
                                            {t('auth.loginHere')}
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

export default Register; 