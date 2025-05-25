import React from 'react';
import { Row, Col, Card, CardBody } from 'reactstrap';
import { 
  FaToolbox, 
  FaHardHat, 
  FaFileContract, 
  FaCheckCircle 
} from 'react-icons/fa';
import { motion } from 'framer-motion';

function DashboardStats({ stats = {} }) {
  const defaultStats = {
    totalJobs: stats.totalJobs || 0,
    activeWorkers: stats.activeWorkers || 0,
    completedJobs: stats.completedJobs || 0,
    pendingApplications: stats.pendingApplications || 0,
  };

  const statCards = [
    {
      title: 'Total Jobs',
      value: defaultStats.totalJobs,
      icon: <FaToolbox size={24} />,
      color: 'primary',
    },
    {
      title: 'Active Workers',
      value: defaultStats.activeWorkers,
      icon: <FaHardHat size={24} />,
      color: 'success',
    },
    {
      title: 'Completed Jobs',
      value: defaultStats.completedJobs,
      icon: <FaCheckCircle size={24} />,
      color: 'info',
    },
    {
      title: 'Pending Applications',
      value: defaultStats.pendingApplications,
      icon: <FaFileContract size={24} />,
      color: 'warning',
    },
  ];

  return (
    <Row>
      {statCards.map((stat, index) => (
        <Col key={index} xs="12" sm="6" lg="3" className="mb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card 
              className={`border-${stat.color} shadow-sm hover-card`}
            >
              <CardBody>
                <motion.div 
                  className="d-flex align-items-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div 
                    className={`rounded-circle p-3 bg-${stat.color} bg-opacity-10 me-3`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    {React.cloneElement(stat.icon, { className: `text-${stat.color}` })}
                  </motion.div>
                  <div>
                    <motion.h6 
                      className="mb-1 text-muted"
                      whileHover={{ scale: 1.05 }}
                    >
                      {stat.title}
                    </motion.h6>
                    <motion.h3 
                      className="mb-0 fw-bold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 100 }}
                    >
                      {stat.value}
                    </motion.h3>
                  </div>
                </motion.div>
              </CardBody>
            </Card>
          </motion.div>
        </Col>
      ))}
    </Row>
  );
}

export default DashboardStats; 