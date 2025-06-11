import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert, Table } from 'react-bootstrap';
import { Bar, Doughnut } from 'react-chartjs-2';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import '../styles/AdminStats.css';

const AdminStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:4000/labourapp/admin/getAppStats');
      if (response.data && !response.data.hasError) {
        setStats(response.data.returnValue);
      } else {
        setError('Failed to fetch stats');
      }
    } catch (err) {
      setError('Error fetching stats');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  const bookingStatusData = {
    labels: Object.keys(stats.bookingStatusStats),
    datasets: [{
      data: Object.values(stats.bookingStatusStats),
      backgroundColor: ['#28a745', '#dc3545', '#ffc107', '#17a2b8'],
      borderWidth: 1
    }]
  };

  const ratingData = {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [{
      data: [
        stats.labourRatingStats.rating_1,
        stats.labourRatingStats.rating_2,
        stats.labourRatingStats.rating_3,
        stats.labourRatingStats.rating_4,
        stats.labourRatingStats.rating_5
      ],
      backgroundColor: ['#dc3545', '#ffc107', '#17a2b8', '#28a745', '#007bff'],
      borderWidth: 1
    }]
  };

  const skillData = {
    labels: Object.keys(stats.availableSkillStats),
    datasets: [{
      label: 'Available Labourers',
      data: Object.values(stats.availableSkillStats),
      backgroundColor: '#007bff',
      borderWidth: 1
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  };

  return (
    <div className="admin-stats">
      <Row className="g-4">
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <h5 className="card-title mb-4">Booking Status Distribution</h5>
              <div style={{ height: '300px' }}>
                <Doughnut data={bookingStatusData} options={doughnutOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Body>
              <h5 className="card-title mb-4">Rating Distribution</h5>
              <Table hover responsive className="rating-table">
                <thead>
                  <tr>
                    <th>Rating</th>
                    <th>Count</th>
                  </tr>
                </thead>
                <tbody>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <tr key={rating}>
                      <td>
                        <div className="d-flex align-items-center">
                          {[...Array(rating)].map((_, i) => (
                            <FaStar key={i} className="text-warning me-1" />
                          ))}
                          {[...Array(5 - rating)].map((_, i) => (
                            <FaStar key={i} className="text-muted me-1" />
                          ))}
                        </div>
                      </td>
                      <td className="fw-bold">
                        {stats.labourRatingStats[`rating_${rating}`] || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        <Col md={12}>
          <Card>
            <Card.Body>
              <h5 className="card-title mb-4">Available Labourers by Skill</h5>
              <div style={{ height: '400px' }}>
                <Bar 
                  data={skillData} 
                  options={{
                    ...chartOptions,
                    indexAxis: 'y',
                    plugins: {
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      x: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    }
                  }} 
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminStats; 