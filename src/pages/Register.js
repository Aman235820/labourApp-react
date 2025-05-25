import React from 'react';
import { useFormik } from 'formik';
import * as yup from 'yup';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert,
} from 'reactstrap';
import { Link } from 'react-router-dom';

const validationSchema = yup.object({
  name: yup
    .string('Enter your name')
    .required('Name is required'),
  email: yup
    .string('Enter your email')
    .email('Enter a valid email')
    .required('Email is required'),
  password: yup
    .string('Enter your password')
    .min(6, 'Password should be of minimum 6 characters length')
    .required('Password is required'),
  userType: yup
    .string('Select user type')
    .required('User type is required'),
});

function Register() {
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      userType: '',
    },
    validationSchema: validationSchema,
    onSubmit: (values) => {
      // TODO: Implement registration functionality
      console.log('Registration values:', values);
    },
  });

  return (
    <Container className="page-container">
      <Row className="justify-content-center">
        <Col xs="12" sm="10" md="8" lg="6">
          <Card className="shadow-sm">
            <CardBody className="p-4">
              <div className="text-center mb-4">
                <h2 className="section-title">Create Account</h2>
                <p className="text-muted">Join Labour App today</p>
              </div>

              <Form onSubmit={formik.handleSubmit}>
                <FormGroup>
                  <Label for="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your full name"
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    invalid={formik.touched.name && Boolean(formik.errors.name)}
                  />
                  {formik.touched.name && formik.errors.name && (
                    <Alert color="danger" className="mt-2 p-2">
                      {formik.errors.name}
                    </Alert>
                  )}
                </FormGroup>

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
                    placeholder="Create a password"
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

                <FormGroup>
                  <Label for="userType">I am a</Label>
                  <Input
                    id="userType"
                    name="userType"
                    type="select"
                    value={formik.values.userType}
                    onChange={formik.handleChange}
                    invalid={formik.touched.userType && Boolean(formik.errors.userType)}
                  >
                    <option value="">Select your role</option>
                    <option value="LABOUR">Labour</option>
                    <option value="CONTRACTOR">Contractor</option>
                  </Input>
                  {formik.touched.userType && formik.errors.userType && (
                    <Alert color="danger" className="mt-2 p-2">
                      {formik.errors.userType}
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
                  Create Account
                </Button>

                <div className="text-center mt-4">
                  <p className="text-muted">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary">
                      Sign In
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

export default Register; 