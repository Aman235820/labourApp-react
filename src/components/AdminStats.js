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
  FaArrowDown,
  FaClock,
  FaTimesCircle,
  FaSync
} from 'react-icons/fa';
import { useStats } from '../context/StatsContext';
import { formatDate } from '../utils/statsUtils';
import '../styles/AdminStats.css';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  const { statsData, refreshStats } = useStats();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (statsData) {
      // Create stats object with data from context
      const statsDataObj = {
        totalLabours: statsData.current.labours,
        totalUsers: statsData.current.users,
        totalBookings: statsData.current.bookings,
        totalRevenue: statsData.current.bookings * 500, // Average revenue per booking
        bookingStatusStats: {
          completed: Math.floor(statsData.current.bookings * 0.4), // Mock distribution
          pending: Math.floor(statsData.current.bookings * 0.3),
          accepted: Math.floor(statsData.current.bookings * 0.2),
          rejected: Math.floor(statsData.current.bookings * 0.1)
        },
        labourRatingStats: {
          rating_5: Math.floor(statsData.current.labours * 0.4), // Mock distribution
          rating_4: Math.floor(statsData.current.labours * 0.3),
          rating_3: Math.floor(statsData.current.labours * 0.2),
          rating_2: Math.floor(statsData.current.labours * 0.08),
          rating_1: Math.floor(statsData.current.labours * 0.02)
        },
        availableSkillStats: {
          'Electrician': Math.floor(statsData.current.labours * 0.25),
          'Plumber': Math.floor(statsData.current.labours * 0.2),
          'House Help': Math.floor(statsData.current.labours * 0.3),
          'Mechanic': Math.floor(statsData.current.labours * 0.15),
          'Carpenter': Math.floor(statsData.current.labours * 0.1)
        }
      };

      setStats(statsDataObj);
      setLoading(false);
      setError(null);
    }
  }, [statsData]);

  // Handle loading state from context
  useEffect(() => {
    if (statsData.isLoading) {
      setLoading(true);
    } else if (statsData.error) {
      setError(statsData.error);
      setLoading(false);
    }
  }, [statsData.isLoading, statsData.error]);

  if (loading) {
    return (
      <div className="stats-loading">
        <div className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">{t('adminStats.loading')}</span>
          </Spinner>
          <p className="mt-3 text-muted">{t('adminStats.loadingAnalytics')}</p>
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
        {t('adminStats.noStatsAvailable')}
      </Alert>
    );
  }

  // Calculate total counts
  const totalUsers = stats.totalUsers || 0;
  const totalLabours = stats.totalLabours || 0;
  const totalBookings = stats.totalBookings || 0;
  const totalRevenue = stats.totalRevenue || 0;

  // Get growth percentages from context
  const userGrowth = statsData.growth.users;
  const labourGrowth = statsData.growth.labours;
  const bookingGrowth = statsData.growth.bookings;

  // Helper function to render growth indicator
  const renderGrowthIndicator = (growth) => {
    if (growth > 0) {
      return (
        <div className="d-flex align-items-center">
          <FaArrowUp className="text-success me-1" />
          <small className="text-success">+{growth}%</small>
        </div>
      );
    } else if (growth < 0) {
      return (
        <div className="d-flex align-items-center">
          <FaArrowDown className="text-danger me-1" />
          <small className="text-danger">{growth}%</small>
        </div>
      );
    } else {
      return (
        <div className="d-flex align-items-center">
          <FaClock className="text-muted me-1" />
          <small className="text-muted">0%</small>
        </div>
      );
    }
  };

  // Booking Status Data
  const bookingStatusData = {
    labels: [
      t('adminStats.statusCompleted'),
      t('adminStats.statusPending'),
      t('adminStats.statusAccepted'),
      t('adminStats.statusRejected'),
    ],
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
    labels: [
      t('adminStats.statusCompleted'),
      t('adminStats.statusPending'),
      t('adminStats.statusAccepted'),
      t('adminStats.statusRejected'),
    ],
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

  // Rating Distribution Data - Bar Chart
  const ratingData = {
    labels: [
      t('adminStats.chartStar5'),
      t('adminStats.chartStar4'),
      t('adminStats.chartStar3'),
      t('adminStats.chartStar2'),
      t('adminStats.chartStar1'),
    ],
    datasets: [{
      label: t('adminStats.chartLabelLabourers'),
      data: [
        stats.labourRatingStats?.rating_5 || 0,
        stats.labourRatingStats?.rating_4 || 0,
        stats.labourRatingStats?.rating_3 || 0,
        stats.labourRatingStats?.rating_2 || 0,
        stats.labourRatingStats?.rating_1 || 0
      ],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)', // Green for 5 stars
        'rgba(59, 130, 246, 0.8)', // Blue for 4 stars
        'rgba(245, 158, 11, 0.8)', // Yellow for 3 stars
        'rgba(249, 115, 22, 0.8)', // Orange for 2 stars
        'rgba(239, 68, 68, 0.8)'   // Red for 1 star
      ],
      borderColor: [
        '#10b981',
        '#3b82f6',
        '#f59e0b',
        '#f97316',
        '#ef4444'
      ],
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
    }]
  };

  // Ensure we have at least some data for the rating chart
  const totalRatings = Object.values(stats.labourRatingStats || {}).reduce((a, b) => a + b, 0);
  const hasRatingData = totalRatings > 0;

  // Bar chart options for rating distribution
  const ratingBarOptions = {
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
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed.y;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return t('adminStats.tooltipLabourersLine', { label, value, pct: percentage });
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#64748b',
          font: {
            size: 12
          }
        },
        grid: {
          color: '#e2e8f0'
        },
        title: {
          display: true,
          text: t('adminStats.chartLabelLabourers'),
          color: '#64748b',
          font: {
            size: 14,
            weight: '600'
          }
        }
      },
      x: {
        ticks: {
          color: '#64748b',
          font: {
            size: 12
          }
        },
        grid: {
          color: '#e2e8f0'
        },
        title: {
          display: true,
          text: t('adminStats.chartAxisRating'),
          color: '#64748b',
          font: {
            size: 14,
            weight: '600'
          }
        }
      }
    }
  };

  // Skill Distribution Data
  const skillData = {
    labels: Object.keys(stats.availableSkillStats || {}),
    datasets: [{
      label: t('adminStats.chartLabelAvailable'),
      data: Object.values(stats.availableSkillStats || {}),
      backgroundColor: 'rgba(59, 130, 246, 0.8)',
      borderColor: '#3b82f6',
      borderWidth: 2,
      borderRadius: 8,
      borderSkipped: false,
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

  return (
    <div className="admin-stats">
      {/* Header with refresh button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="stats-title mb-1">{t('adminStats.analyticsOverview')}</h4>
          <p className="text-muted mb-0">
            {t('adminStats.lastUpdated', { date: formatDate(statsData.lastUpdated) })}
          </p>
        </div>
        <button 
          className="btn btn-outline-primary btn-sm"
          onClick={refreshStats}
          disabled={statsData.isLoading}
        >
          <FaSync className={`me-1 ${statsData.isLoading ? 'fa-spin' : ''}`} />
          {t('adminStats.refresh')}
        </button>
      </div>

      {/* Key Metrics Cards */}
      <Row className="g-4 mb-4">
        <Col lg={3} md={6}>
          <Card className="metric-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="metric-label">{t('adminStats.totalUsers')}</h6>
                  <h3 className="metric-value">{totalUsers.toLocaleString()}</h3>
                  {renderGrowthIndicator(userGrowth)}
                  <small className="text-muted">{t('adminStats.vsLastWeek')}</small>
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
                  <h6 className="metric-label">{t('adminStats.totalLabourers')}</h6>
                  <h3 className="metric-value">{totalLabours.toLocaleString()}</h3>
                  {renderGrowthIndicator(labourGrowth)}
                  <small className="text-muted">{t('adminStats.vsLastWeek')}</small>
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
                  <h6 className="metric-label">{t('adminStats.totalBookings')}</h6>
                  <h3 className="metric-value">{totalBookings.toLocaleString()}</h3>
                  {renderGrowthIndicator(bookingGrowth)}
                  <small className="text-muted">{t('adminStats.vsLastWeek')}</small>
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
                  <h6 className="metric-label">{t('adminStats.previousWeek')}</h6>
                  <div className="previous-stats">
                    <small className="text-muted d-block">{t('adminStats.prevUsers', { n: statsData.previous.users })}</small>
                    <small className="text-muted d-block">{t('adminStats.prevLabourers', { n: statsData.previous.labours })}</small>
                    <small className="text-muted d-block">{t('adminStats.prevBookings', { n: statsData.previous.bookings })}</small>
                  </div>
                </div>
                <div className="metric-icon history-icon">
                  <FaClock />
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
                  {t('adminStats.chartBookingsTitle')}
                </h5>
                <Badge bg="info" className="chart-badge">
                  {t('adminStats.bookingTotalBadge', { n: hasBookingData ? totalBookingStatus : 38 })}
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
                  {t('adminStats.chartRatingsTitle')}
                </h5>
                <Badge bg="warning" className="chart-badge">
                  {t('adminStats.labourersRatedBadge', { n: totalRatings })}
                </Badge>
              </div>
              <div className="chart-container">
                {hasRatingData ? (
                  <Bar data={ratingData} options={ratingBarOptions} />
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <div className="text-center text-muted">
                      <FaStar className="mb-3" style={{ fontSize: '3rem', opacity: 0.5 }} />
                      <p className="mb-0">{t('adminStats.noRatingData')}</p>
                      <small>{t('adminStats.ratingsEmptySub')}</small>
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
                  {t('adminStats.chartSkillsHeading')}
                </h5>
                <Badge bg="primary" className="chart-badge">
                  {t('adminStats.availableBadge', { n: Object.values(stats.availableSkillStats || {}).reduce((a, b) => a + b, 0) })}
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
      </Row>
    </div>
  );
};

export default AdminStats; 