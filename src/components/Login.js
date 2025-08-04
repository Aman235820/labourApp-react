import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, InputGroup, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { userService, loginUser, requestOTP } from '../services/userService';
import { FaUser, FaEye, FaEyeSlash, FaLock, FaEnvelope, FaSignInAlt, FaArrowLeft, FaExclamationCircle, FaPhone, FaKey, FaArrowRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import '../styles/Login.css';

const Login = () => {
    const { register, handleSubmit, formState: { errors }, getValues } = useForm();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [otpStatus, setOtpStatus] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [showOtp, setShowOtp] = useState(false);

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

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            setError('');
            const response = await loginUser({ mobileNumber: data.mobileNumber, otp: data.otp });
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

    const handleRequestOTP = async () => {
        setOtpStatus('');
        setOtpLoading(true);
        const mobile = getValues('mobileNumber');
        if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
            setOtpStatus(t('auth.pleaseEnterValidMobile'));
            setOtpLoading(false);
            return;
        }
        try {
            await requestOTP(mobile, 'USER');
            setOtpStatus(t('auth.otpSentSuccessfully'));
        } catch (err) {
            setOtpStatus(err.message || t('auth.failedToSendOtp'));
        } finally {
            setOtpLoading(false);
        }
    };

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

                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <Form.Group className="mb-4">
                                    <div className="d-flex align-items-center">
                                        <FaPhone className="me-2" />
                                        <Form.Label className="fw-bold mb-0">{t('auth.mobileNumber')}</Form.Label>
                                    </div>
                                    <InputGroup>
                                        <Form.Control
                                            type="tel"
                                            placeholder={t('auth.enterMobileNumber')}
                                            className={`form-control-lg ${errors.mobileNumber ? 'is-invalid' : ''}`}
                                            {...register('mobileNumber', {
                                                required: t('auth.mobileNumberRequired'),
                                                pattern: {
                                                    value: /^[0-9]{10}$/,
                                                    message: t('auth.pleaseEnterValidMobileNumber')
                                                },
                                                onChange: (e) => {
                                                    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                                                    e.target.value = value;
                                                }
                                            })}
                                            maxLength="10"
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
                                    {errors.mobileNumber && (
                                        <Form.Text className="text-danger">
                                            {errors.mobileNumber.message}
                                        </Form.Text>
                                    )}
                                    {otpStatus && (
                                        <Form.Text className={otpStatus.includes('success') ? 'text-success' : 'text-danger'}>
                                            {otpStatus}
                                        </Form.Text>
                                    )}
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <div className="d-flex align-items-center">
                                        <FaKey className="me-2" />
                                        <Form.Label className="fw-bold mb-0">{t('auth.otp')}</Form.Label>
                                    </div>
                                    <InputGroup>
                                        <Form.Control
                                            type={showOtp ? "text" : "password"}
                                            placeholder={t('auth.enterOtp')}
                                            className={`form-control-lg ${errors.otp ? 'is-invalid' : ''}`}
                                            {...register('otp', {
                                                required: t('auth.otpRequired'),
                                                pattern: {
                                                    value: /^[0-9]{4,6}$/,
                                                    message: t('auth.pleaseEnterValidOtp')
                                                }
                                            })}
                                            maxLength="6"
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
                                    {errors.otp && (
                                        <Form.Text className="text-danger">
                                            {errors.otp.message}
                                        </Form.Text>
                                    )}
                                </Form.Group>

                                <div className="d-grid gap-2">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="btn-lg fw-bold d-flex align-items-center justify-content-center"
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
                                                {t('auth.signingIn')}
                                            </>
                                        ) : (
                                            <>
                                                {t('auth.signIn')} <FaArrowRight className="ms-2" />
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