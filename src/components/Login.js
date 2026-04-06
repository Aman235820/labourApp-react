import React, { useState, useEffect } from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { loginUser, requestOTP } from '../services/userService';
import { FaPhone, FaArrowRight, FaExclamationCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import OTPVerification from './OTPVerification';
import '../styles/AuthFormShell.css';

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
        if (otpLoading) return;
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
        if (isLoading) return;
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
        <div className="auth-form-shell auth-form-shell--user">
            <div className="auth-form-shell__scroll">
                <div className="auth-form-shell__inner">
                    <header className="auth-form-hero">
                        <p className="auth-form-hero__eyebrow mb-0">{t('home.headerTitle')}</p>
                        <h1 className="auth-form-hero__title">{t('auth.welcomeBack')}</h1>
                        <p className="auth-form-hero__subtitle">{t('auth.signInToContinue')}</p>
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
                                    <FaPhone className="me-2 text-primary" aria-hidden />
                                    {t('auth.mobileNumber')}
                                </Form.Label>
                                <Form.Control
                                    type="tel"
                                    inputMode="numeric"
                                    autoComplete="tel"
                                    placeholder={t('auth.enterMobileNumber')}
                                    value={mobileNumber}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        setMobileNumber(value);
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
                            <span className="text-muted">{t('auth.dontHaveAccount')}</span>{' '}
                            <Button type="button" variant="link" className="p-0 align-baseline" onClick={() => navigate('/register')}>
                                {t('auth.registerHere')}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login; 