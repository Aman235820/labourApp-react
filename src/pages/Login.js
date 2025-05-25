import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
} from 'reactstrap';
import { Link } from 'react-router-dom';

const validationSchema = yup.object({
  email: yup
    .string('Enter your email')
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string('Enter your password')
    .min(6, 'Password should be of minimum 6 characters length')
    .required('Password is required'),
});

function Login() {
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      
      


      console.log('Login values:', values);
    },
  });

  return (
    <Container className="page-container">
      <Row className="justify-content-center">
        <Col xs="12" sm="10" md="8" lg="6">
          <Card className="shadow-sm">
            <CardBody className="p-4">
              <div className="text-center mb-4">
                <h2 className="section-title">Welcome Back</h2>
                <p className="text-muted">Sign in to continue to Labour App</p>
              </div>
              
              <Form onSubmit={formik.handleSubmit}>
                <FormGroup>
                  <Label for="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    invalid={formik.touched.email && Boolean(formik.errors.email)}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <Alert color="danger" className="mt-2 p-2">
                      {formik.errors.email}
                    </Alert>
                  )}
                </FormGroup>

                <FormGroup>
                  <Label for="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    invalid={formik.touched.password && Boolean(formik.errors.password)}
                  />
                  {formik.touched.password && formik.errors.password && (
                    <Alert color="danger" className="mt-2 p-2">
                      {formik.errors.password}
                    </Alert>
                  )}
                </FormGroup>

                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  block
                  className="mt-4"
                >
                  Sign In
                </Button>

                <div className="text-center mt-4">
                  <p className="text-muted">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary">
                      Sign Up
                    </Link>
                  </p>
                </div>
              </Form>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login; 