import React from 'react';
import { Modal, Button, Table } from 'react-bootstrap';

function LabourList({ show, onHide, labourers, onRowClick }) {
  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Labourers List</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {labourers && labourers.length > 0 ? (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Name</th>
                <th>Skill</th>
                <th>Mobile No</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {labourers.map((labour, idx) => (
                <tr key={labour.id || idx} style={{ cursor: 'pointer' }} onClick={() => onRowClick(labour)}>
                  <td>{labour.labourName}</td>
                  <td>{labour.labourSkill}</td>
                  <td>{labour.labourMobileNo}</td>
                  <td>{labour.rating || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div>No labourers found for this subservice.</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LabourList; 