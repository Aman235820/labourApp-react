import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { FaUser, FaPhone } from 'react-icons/fa';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/LabourLogin.css';

function LabourLogin() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mobileNumber.trim()) {
      setError('Please enter your mobile number');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get(`http://localhost:4000/labourapp/labour/labourLogin?mobileNumber=${mobileNumber}`);
      
      if (response.data && response.data.returnValue) {
        // Store labour details in localStorage (excluding reviews)
        const { reviews, ...labourDetails } = response.data.returnValue;
        localStorage.setItem('labourDetails', JSON.stringify(labourDetails));
        localStorage.setItem('isLabourLoggedIn', 'true');
        
        // Redirect to labour dashboard
        navigate('/labourDashboard');
      }
    } catch (error) {
      setError('Invalid mobile number or network error');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm login-card">
            <Card.Body className="p-4">
              <div className="text-center mb-4">
                <h2 className="display-6 mb-3">Labour Login</h2>
                <p className="text-muted">Enter your mobile number to access your account</p>
              </div>

              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="text-muted">
                    <FaPhone className="me-2" />
                    Mobile Number
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Enter your mobile number"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="py-2"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    required
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  type="submit"
                  className="w-100 py-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Logging in...
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default LabourLogin; 