import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Button,
  Spinner,
} from 'reactstrap';
import jobService from '../services/jobService';
import DashboardStats from '../components/DashboardStats';
import RecentActivities from '../components/RecentActivities';

function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalJobs: 24,
    activeWorkers: 12,
    completedJobs: 8,
    pendingApplications: 5,
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await jobService.getAllJobs();
      setJobs(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch jobs. Please try again later.');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <Spinner color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="page-container">
        <div className="text-center text-danger">{error}</div>
      </Container>
    );
  }

  return (
    <Container fluid className="page-container">
      <Row>
        <Col xs="12">
          <div className="dashboard-stats mb-4">
            <h2 className="text-white mb-0">Dashboard</h2>
          </div>
        </Col>
      </Row>

      {/* Statistics Cards */}
      <DashboardStats stats={stats} />

      <Row>
        {/* Profile and Recent Activities */}
        <Col xs="12" lg="4">
          <Card className="profile-card mb-4">
            <CardBody>
              <CardTitle tag="h5">Profile Summary</CardTitle>
              <div className="text-center my-4">
                <div className="rounded-circle bg-light p-4 d-inline-block mb-3">
                  <img
                    src="https://via.placeholder.com/80"
                    alt="Profile"
                    className="rounded-circle"
                    width="80"
                    height="80"
                  />
                </div>
                <h4 className="mb-1">John Doe</h4>
                <p className="text-muted">Skilled Labour</p>
              </div>
              <div className="mb-4">
                <p className="mb-2">
                  <strong>Email:</strong> john.doe@example.com
                </p>
                <p className="mb-2">
                  <strong>Location:</strong> Mumbai, Maharashtra
                </p>
                <p className="mb-2">
                  <strong>Skills:</strong> Construction, Plumbing, Electrical
                </p>
              </div>
              <Button color="primary" outline block>
                Edit Profile
              </Button>
            </CardBody>
          </Card>

          {/* Recent Activities */}
          <RecentActivities />
        </Col>

        {/* Available Jobs */}
        <Col xs="12" lg="8">
          <Card className="mb-4">
            <CardBody>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <CardTitle tag="h5">Available Jobs</CardTitle>
                <Button color="primary" outline size="sm">
                  View All Jobs
                </Button>
              </div>
              {jobs.map((job) => (
                <div key={job.id} className="job-card">
                  <h4 className="job-title">{job.title}</h4>
                  <p className="job-location">{job.location}</p>
                  <p className="job-description">{job.description}</p>
                  <p className="text-primary fw-bold mb-3">
                    Wage: {job.wage}
                  </p>
                  <div className="d-flex gap-2">
                    <Button
                      color="primary"
                      onClick={() => jobService.applyForJob(job.id, {})}
                    >
                      Apply Now
                    </Button>
                    <Button
                      color="secondary"
                      outline
                      onClick={() => jobService.getJobById(job.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard; 