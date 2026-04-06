import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { registerUser, requestOTP } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaArrowRight, FaExclamationCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import OTPVerification from './OTPVerification';
import '../styles/AuthFormShell.css';

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
        if (otpLoading) return;

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
        if (isLoading) return;
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
        <div className="auth-form-shell auth-form-shell--user auth-form-shell--wide">
            <div className="auth-form-shell__scroll">
                <div className="auth-form-shell__inner">
                    <header className="auth-form-hero">
                        <p className="auth-form-hero__eyebrow mb-0">{t('home.headerTitle')}</p>
                        <h1 className="auth-form-hero__title">{t('auth.createAccount')}</h1>
                        <p className="auth-form-hero__subtitle">{t('auth.joinInstaLab')}</p>
                    </header>

                    <div className="auth-form-panel">
                        {error && (
                            <div className="alert alert-danger d-flex align-items-center mb-3" role="alert">
                                <FaExclamationCircle className="me-2 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <Form onSubmit={handleSendOTP}>
                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <FaUser className="me-2 text-primary" aria-hidden />
                                    {t('auth.fullName')}
                                </Form.Label>
                                <Form.Control
                                    type="text"
                                    autoComplete="name"
                                    placeholder={t('auth.enterFullName')}
                                    value={formData.fullName}
                                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                                    required
                                />
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>
                                    <FaEnvelope className="me-2 text-primary" aria-hidden />
                                    {t('auth.emailAddress')}
                                </Form.Label>
                                <Form.Control
                                    type="email"
                                    autoComplete="email"
                                    placeholder={t('auth.enterEmail')}
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    required
                                />
                            </Form.Group>

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
                                    value={formData.mobileNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        handleInputChange('mobileNumber', value);
                                    }}
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
                            <span className="text-muted">{t('auth.alreadyHaveAccount')}</span>{' '}
                            <Button type="button" variant="link" className="p-0 align-baseline" onClick={() => navigate('/login')}>
                                {t('auth.loginHere')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register; 