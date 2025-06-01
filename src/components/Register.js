import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { registerUser } from '../services/userService';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaPhone } from 'react-icons/fa';

const Register = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const onSubmit = async (data) => {
        try {
            setIsLoading(true);
            setError('');
            const response = await registerUser(data);
            console.log('Registration successful:', response);
            navigate('/login');
        } catch (error) {
            console.error('Registration failed:', error);
            setError(error.message || 'Registration failed. Please try again.');
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
                                <h2 className="fw-bold text-primary">Create Account</h2>
                                <p className="text-muted">Join InstaLab and connect with skilled professionals</p>
                            </div>
                            
                            {error && (
                                <div className="alert alert-danger" role="alert">
                                    {error}
                                </div>
                            )}

                            <Form onSubmit={handleSubmit(onSubmit)}>
                                <Form.Group className="mb-4">
                                    <div className="d-flex align-items-center">
                                        <FaUser className="me-2" />
                                        <Form.Label className="fw-bold mb-0">Full Name</Form.Label>
                                    </div>
                                    <Form.Control
                                        type="text"
                                        placeholder="Enter your full name"
                                        className={`form-control-lg ${errors.fullName ? 'is-invalid' : ''}`}
                                        {...register('fullName', { 
                                            required: 'Full name is required',
                                            minLength: {
                                                value: 3,
                                                message: 'Name must be at least 3 characters'
                                            }
                                        })}
                                    />
                                    {errors.fullName && (
                                        <Form.Text className="text-danger">
                                            {errors.fullName.message}
                                        </Form.Text>
                                    )}
                                </Form.Group>

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
                                        placeholder="Create a password"
                                        className={`form-control-lg ${errors.password ? 'is-invalid' : ''}`}
                                        {...register('password', {
                                            required: 'Password is required',
                                            minLength: {
                                                value: 3,
                                                message: 'Password must be at least 3 characters'
                                            }
                                        })}
                                    />
                                    {errors.password && (
                                        <Form.Text className="text-danger">
                                            {errors.password.message}
                                        </Form.Text>
                                    )}
                                </Form.Group>

                                <Form.Group className="mb-4">
                                    <div className="d-flex align-items-center">
                                        <FaPhone className="me-2" />
                                        <Form.Label className="fw-bold mb-0">Mobile Number</Form.Label>
                                    </div>
                                    <Form.Control
                                        type="tel"
                                        placeholder="Enter your mobile number"
                                        className={`form-control-lg ${errors.mobileNumber ? 'is-invalid' : ''}`}
                                        {...register('mobileNumber', {
                                            required: 'Mobile number is required',
                                            pattern: {
                                                value: /^[0-9]{10}$/,
                                                message: 'Please enter a valid 10-digit mobile number'
                                            }
                                        })}
                                    />
                                    {errors.mobileNumber && (
                                        <Form.Text className="text-danger">
                                            {errors.mobileNumber.message}
                                        </Form.Text>
                                    )}
                                </Form.Group>

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
                                                Creating Account...
                                            </>
                                        ) : (
                                            'Create Account'
                                        )}
                                    </Button>
                                </div>

                                <div className="text-center mt-4">
                                    <p className="mb-0">
                                        Already have an account?{' '}
                                        <Button 
                                            variant="link" 
                                            className="p-0 text-decoration-none"
                                            onClick={() => navigate('/login')}
                                        >
                                            Login here
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