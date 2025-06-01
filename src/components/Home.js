import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

function Home() {
  return (
    <Container>
      <Row className="mt-4 text-center">
        <Col>
          <h1 className="display-4 mb-4">
            Welcome to InstaLab
          </h1>
          <h2 className="text-muted mb-4">
            Connect with skilled labourers and get services at your Doorstep :)
          </h2>
        </Col>
      </Row>
    </Container>
  );
}

export default Home; 