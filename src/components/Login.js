import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Spinner, InputGroup } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { loginUser, requestOTP } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { FaPhone, FaKey, FaEye, FaEyeSlash, FaArrowRight, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';

const Login = () => {
    const { register, handleSubmit, formState: { errors }, getValues } = useForm();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [otpStatus, setOtpStatus] = useState('');
    const [otpLoading, setOtpLoading] = useState(false);
    const [showOtp, setShowOtp] = useState(false);

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
                setError('Login failed. Please try again.');
            }
        } catch (error) {
            setError(error.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRequestOTP = async () => {
        setOtpStatus('');
        setOtpLoading(true);
        const mobile = getValues('mobileNumber');
        if (!mobile || !/^[0-9]{10}$/.test(mobile)) {
            setOtpStatus('Please enter a valid 10-digit mobile number before requesting OTP.');
            setOtpLoading(false);
            return;
        }
        try {
            await requestOTP(mobile, 'USER');
            setOtpStatus('OTP sent successfully!');
        } catch (err) {
            setOtpStatus(err.message || 'Failed to send OTP.');
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
                                <h2 className="fw-bold text-primary">Welcome Back</h2>
                                <p className="text-muted">Sign in to continue to InstaLab</p>
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
                                        <Form.Label className="fw-bold mb-0">Mobile Number</Form.Label>
                                    </div>
                                    <InputGroup>
                                        <Form.Control
                                            type="tel"
                                            placeholder="Enter your mobile number"
                                            className={`form-control-lg ${errors.mobileNumber ? 'is-invalid' : ''}`}
                                            {...register('mobileNumber', {
                                                required: 'Mobile number is required',
                                                pattern: {
                                                    value: /^[0-9]{10}$/,
                                                    message: 'Please enter a valid 10-digit mobile number'
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
                                            {otpLoading ? 'Sending OTP...' : 'Request OTP'}
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
                                        <Form.Label className="fw-bold mb-0">OTP</Form.Label>
                                    </div>
                                    <InputGroup>
                                        <Form.Control
                                            type={showOtp ? "text" : "password"}
                                            placeholder="Enter OTP"
                                            className={`form-control-lg ${errors.otp ? 'is-invalid' : ''}`}
                                            {...register('otp', {
                                                required: 'OTP is required',
                                                pattern: {
                                                    value: /^[0-9]{4,6}$/,
                                                    message: 'Please enter a valid 4 to 6-digit OTP'
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
                                                Signing In...
                                            </>
                                        ) : (
                                            <>
                                                Sign In <FaArrowRight className="ms-2" />
                                            </>
                                        )}
                                    </Button>
                                </div>

                                <div className="text-center mt-4">
                                    <p className="mb-0">
                                        Don't have an account?{' '}
                                        <Button
                                            variant="link"
                                            className="p-0 text-decoration-none"
                                            onClick={() => navigate('/register')}
                                        >
                                            Register here
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