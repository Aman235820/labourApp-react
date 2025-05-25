import React from 'react';
import { Card, CardBody, CardTitle, ListGroup, ListGroupItem } from 'reactstrap';
import { FaCircle } from 'react-icons/fa';

function RecentActivities({ activities = [] }) {
  const defaultActivities = activities.length > 0 ? activities : [
    {
      id: 1,
      type: 'application',
      message: 'Your application for Construction Worker position was received',
      time: '2 hours ago',
      status: 'pending',
    },
    {
      id: 2,
      type: 'job',
      message: 'New job posted: Plumber needed for residential project',
      time: '4 hours ago',
      status: 'new',
    },
    {
      id: 3,
      type: 'profile',
      message: 'Your profile was viewed by 5 contractors',
      time: '1 day ago',
      status: 'info',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'new':
        return 'success';
      case 'info':
        return 'info';
      default:
        return 'secondary';
    }
  };

  return (
    <Card className="shadow-sm">
      <CardBody>
        <CardTitle tag="h5" className="mb-4">Recent Activities</CardTitle>
        <ListGroup flush>
          {defaultActivities.map((activity) => (
            <ListGroupItem key={activity.id} className="px-0 py-3 border-bottom">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <FaCircle className={`text-${getStatusColor(activity.status)}`} size={10} />
                </div>
                <div className="flex-grow-1">
                  <p className="mb-1">{activity.message}</p>
                  <small className="text-muted">{activity.time}</small>
                </div>
              </div>
            </ListGroupItem>
          ))}
        </ListGroup>
      </CardBody>
    </Card>
  );
}

export default RecentActivities; 