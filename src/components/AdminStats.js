import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { 
  FaStar, 
  FaUsers, 
  FaUserTie, 
  FaClipboardList, 
  FaChartLine,
  FaArrowUp,
  FaClock,
  FaTimesCircle
} from 'react-icons/fa';
import { adminService } from '../services/adminService';
import '../styles/AdminStats.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
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
      const response = await adminService.getAppStats();
      if (response && !response.hasError) {
        console.log('Admin Stats Data:', response.returnValue);
        setStats(response.returnValue);
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
      <div className="stats-loading">
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="stats-error">
        <FaTimesCircle className="me-2" />
        {error}
      </Alert>
    );
  }

  if (!stats) {
    return (
      <Alert variant="warning" className="stats-error">
        <FaClock className="me-2" />
        No statistics available
      </Alert>
    );
  }

  // Calculate total counts
  const totalUsers = stats.totalUsers || 0;
  const totalLabours = stats.totalLabours || 0;
  const totalBookings = stats.totalBookings || 0;
  const totalRevenue = stats.totalRevenue || 0;

  // Calculate growth percentages (mock data for now)
  const userGrowth = 12.5;
  const labourGrowth = 8.3;
  const bookingGrowth = 15.7;
  const revenueGrowth = 22.1;

  // Booking Status Data
  const bookingStatusData = {
    labels: ['Completed', 'Pending', 'Accepted', 'Rejected'],
    datasets: [{
      data: [
        stats.bookingStatusStats?.completed || 0,
        stats.bookingStatusStats?.pending || 0,
        stats.bookingStatusStats?.accepted || 0,
        stats.bookingStatusStats?.rejected || 0
      ],
      backgroundColor: [
        '#10b981', // Green
        '#f59e0b', // Yellow
        '#3b82f6', // Blue
        '#ef4444'  // Red
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverBorderWidth: 3,
    }]
  };

  // Ensure we have at least some data for the chart
  const totalBookingStatus = Object.values(stats.bookingStatusStats || {}).reduce((a, b) => a + b, 0);
  const hasBookingData = totalBookingStatus > 0;
  
  // Fallback data for testing (remove this in production)
  const fallbackBookingData = {
    labels: ['Completed', 'Pending', 'Accepted', 'Rejected'],
    datasets: [{
      data: [15, 8, 12, 3],
      backgroundColor: [
        '#10b981', // Green
        '#f59e0b', // Yellow
        '#3b82f6', // Blue
        '#ef4444'  // Red
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
      hoverBorderWidth: 3,
    }]
  };
  
  console.log('Booking Status Stats:', stats.bookingStatusStats);
  console.log('Total Booking Status:', totalBookingStatus);
  console.log('Has Booking Data:', hasBookingData);

  // Rating Distribution Data
  const ratingData = {
    labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
    datasets: [{
      data: [
        stats.labourRatingStats?.rating_5 || 0,
        stats.labourRatingStats?.rating_4 || 0,
        stats.labourRatingStats?.rating_3 || 0,
        stats.labourRatingStats?.rating_2 || 0,
        stats.labourRatingStats?.rating_1 || 0
      ],
      backgroundColor: [
        '#10b981', // Green
        '#3b82f6', // Blue
        '#f59e0b', // Yellow
        '#f97316', // Orange
        '#ef4444'  // Red
      ],
      borderWidth: 2,
      borderColor: '#ffffff',
    }]
  };

  // Ensure we have at least some data for the rating chart
  const totalRatings = Object.values(stats.labourRatingStats || {}).reduce((a, b) => a + b, 0);
  const hasRatingData = totalRatings > 0;

  // Skill Distribution Data
  const skillData = {
    labels: Object.keys(stats.availableSkillStats || {}),
    datasets: [{
      label: 'Available Labourers',
      data: Object.values(stats.availableSkillStats || {}),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: '#3b82f6',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  // Revenue Trend Data (mock data)
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue',
      data: [12000, 15000, 18000, 22000, 25000, 28000],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#64748b'
        },
        grid: {
          color: '#e2e8f0'
        }
      },
      x: {
        ticks: {
          color: '#64748b'
        },
        grid: {
          color: '#e2e8f0'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12
          },
          color: '#64748b'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        cornerRadius: 8,
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#10b981',
        borderWidth: 1,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#64748b',
          callback: function(value) {
            return '₹' + value.toLocaleString();
          }
        },
        grid: {
          color: '#e2e8f0'
        }
      },
      x: {
        ticks: {
          color: '#64748b'
        },
        grid: {
          color: '#e2e8f0'
        }
      }
    }
  };

  return (
    <div className="admin-stats">
      {/* Key Metrics Cards */}
      <Row className="g-4 mb-4">
        <Col lg={3} md={6}>
          <Card className="metric-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="metric-label">Total Users</h6>
                  <h3 className="metric-value">{totalUsers.toLocaleString()}</h3>
                  <div className="d-flex align-items-center">
                    <FaArrowUp className="text-success me-1" />
                    <small className="text-success">+{userGrowth}%</small>
                  </div>
                </div>
                <div className="metric-icon users-icon">
                  <FaUsers />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6}>
          <Card className="metric-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="metric-label">Total Labourers</h6>
                  <h3 className="metric-value">{totalLabours.toLocaleString()}</h3>
                  <div className="d-flex align-items-center">
                    <FaArrowUp className="text-success me-1" />
                    <small className="text-success">+{labourGrowth}%</small>
                  </div>
                </div>
                <div className="metric-icon labourers-icon">
                  <FaUserTie />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6}>
          <Card className="metric-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="metric-label">Total Bookings</h6>
                  <h3 className="metric-value">{totalBookings.toLocaleString()}</h3>
                  <div className="d-flex align-items-center">
                    <FaArrowUp className="text-success me-1" />
                    <small className="text-success">+{bookingGrowth}%</small>
                  </div>
                </div>
                <div className="metric-icon bookings-icon">
                  <FaClipboardList />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6}>
          <Card className="metric-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="metric-label">Total Revenue</h6>
                  <h3 className="metric-value">₹{totalRevenue.toLocaleString()}</h3>
                  <div className="d-flex align-items-center">
                    <FaArrowUp className="text-success me-1" />
                    <small className="text-success">+{revenueGrowth}%</small>
                  </div>
                </div>
                <div className="metric-icon revenue-icon">
                  <FaChartLine />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row className="g-4">
        <Col lg={6} md={12}>
          <Card className="chart-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="chart-title">
                  <FaClipboardList className="me-2" />
                  Booking Status Distribution
                </h5>
                <Badge bg="info" className="chart-badge">
                  {hasBookingData ? totalBookingStatus : 38} Total
                </Badge>
              </div>
              <div className="chart-container">
                {hasBookingData ? (
                  <Doughnut data={bookingStatusData} options={doughnutOptions} />
                ) : (
                  <Doughnut data={fallbackBookingData} options={doughnutOptions} />
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} md={12}>
          <Card className="chart-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="chart-title">
                  <FaStar className="me-2" />
                  Rating Distribution
                </h5>
                <Badge bg="warning" className="chart-badge">
                  {totalRatings} Ratings
                </Badge>
              </div>
              <div className="chart-container">
                {hasRatingData ? (
                  <Doughnut data={ratingData} options={doughnutOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <div className="text-center text-muted">
                      <FaStar className="mb-3" style={{ fontSize: '3rem', opacity: 0.5 }} />
                      <p className="mb-0">No rating data available</p>
                      <small>Ratings will appear here once labourers receive reviews</small>
                    </div>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={8} md={12}>
          <Card className="chart-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="chart-title">
                  <FaUserTie className="me-2" />
                  Available Labourers by Skill
                </h5>
                <Badge bg="primary" className="chart-badge">
                  {Object.values(stats.availableSkillStats || {}).reduce((a, b) => a + b, 0)} Available
                </Badge>
              </div>
              <div className="chart-container">
                <Bar 
                  data={skillData} 
                  options={{
                    ...chartOptions,
                    indexAxis: 'y',
                    plugins: {
                      ...chartOptions.plugins,
                      legend: {
                        display: false
                      }
                    },
                    scales: {
                      x: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1,
                          color: '#64748b'
                        },
                        grid: {
                          color: '#e2e8f0'
                        }
                      },
                      y: {
                        ticks: {
                          color: '#64748b'
                        },
                        grid: {
                          color: '#e2e8f0'
                        }
                      }
                    }
                  }} 
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4} md={12}>
          <Card className="chart-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="chart-title">
                  <FaChartLine className="me-2" />
                  Revenue Trend
                </h5>
                <Badge bg="success" className="chart-badge">
                  +{revenueGrowth}%
                </Badge>
              </div>
              <div className="chart-container">
                <Line data={revenueData} options={lineOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminStats; 