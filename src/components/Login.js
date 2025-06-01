import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { loginUser } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Check for remembered email on component mount
    useEffect(() => {
        const rememberedEmail = localStorage.getItem('rememberedEmail');
        if (rememberedEmail) {
            setValue('email', rememberedEmail);
            setValue('rememberMe', true);
        }
    }, [setValue]);

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            setError('');
            const response = await loginUser(data);

            if (response.message === "success") {
                console.log('Login successful:', response);
                // Store user data in localStorage
                localStorage.setItem('user', JSON.stringify(response.returnValue));
                navigate('/userHome'); // Redirect to user home page after successful login
            }

            // Handle remember me
            if (data.rememberMe) {
                localStorage.setItem('rememberedEmail', data.email);
            } else {
                localStorage.removeItem('rememberedEmail');
            }
        } catch (error) {
            console.error('Login failed:', error);
            setError(error.message || 'Login failed. Please try again.');
        } finally {
            setIsLoading(false);
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
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <Form.Group className="mb-4">
                                    <div className="d-flex align-items-center">
                                        <FaEnvelope className="me-2" />
                                        <Form.Label className="fw-bold mb-0">Email Address</Form.Label>
                                    </div>
                                    <Form.Control
                                        type="email"
                                        placeholder="Enter your email"
                                        className={`form-control-lg ${errors.email ? 'is-invalid' : ''}`}
                                        {...register('email', {
                                            required: 'Email is required',
                                            pattern: {
                                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                                message: 'Please enter a valid email address'
                                            }
                                        })}
                                    />
                                    {errors.email && (
                                        <Form.Text className="text-danger">
                                            {errors.email.message}
                                        </Form.Text>
                                    )}
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <div className="d-flex align-items-center">
                                        <FaLock className="me-2" />
                                        <Form.Label className="fw-bold mb-0">Password</Form.Label>
                                    </div>
                                    <Form.Control
                                        type="password"
                                        placeholder="Enter your password"
                                        className={`form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                                        {...register('password', {
                                            required: 'Password is required'
                                        })}
                                    />
                                    {errors.password && (
                                        <Form.Text className="text-danger">
                                            {errors.password.message}
                                        </Form.Text>
                                    )}
                                </Form.Group>

                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <Form.Check
                                        type="checkbox"
                                        id="rememberMe"
                                        label="Remember me"
                                        {...register('rememberMe')}
                                    />
                                    <Button
                                        variant="link"
                                        className="text-decoration-none p-0"
                                        onClick={() => navigate('/forgot-password')}
                                    >
                                        Forgot Password?
                                    </Button>
                                </div>

                                <div className="d-grid gap-2">
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        className="btn-lg fw-bold"
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
                                            'Sign In'
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