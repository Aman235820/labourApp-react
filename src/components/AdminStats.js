import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner } from 'react-bootstrap';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import axios from 'axios';
import '../styles/AdminStats.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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
        setError('Failed to fetch statistics');
      }
    } catch (err) {
      setError('Error fetching statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const bookingData = {
    labels: Object.keys(stats?.bookingStatusStats || {}),
    datasets: [
      {
        label: 'Booking Status',
        data: Object.values(stats?.bookingStatusStats || {}),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const ratingData = {
    labels: Object.keys(stats?.labourRatingStats || {}).map(key => `Rating ${key.split('_')[1]}`),
    datasets: [
      {
        data: Object.values(stats?.labourRatingStats || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 205, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 205, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: 'Booking Status',
        font: {
          size: 14,
          weight: 'bold'
        },
        padding: {
          bottom: 10
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            size: 10
          },
          stepSize: 1,
          precision: 0
        }
      },
      x: {
        ticks: {
          font: {
            size: 10
          }
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 10,
          font: {
            size: 11
          }
        }
      },
      title: {
        display: true,
        text: 'Labour Ratings',
        font: {
          size: 14,
          weight: 'bold'
        },
        padding: {
          bottom: 10
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="stats-loading">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <div className="stats-error">{error}</div>;
  }

  return (
    <div className="admin-stats">
      <Row className="g-4">
        <Col md={6}>
          <Card className="stats-card">
            <Card.Body>
              <Bar data={bookingData} options={chartOptions} />
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="stats-card">
            <Card.Body>
              <Doughnut data={ratingData} options={doughnutOptions} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminStats; 