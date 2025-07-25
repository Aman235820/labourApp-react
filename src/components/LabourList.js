import React from 'react';
import { Modal, Button, Card } from 'react-bootstrap';
import DataTable from 'react-data-table-component';
import { FaUser, FaTools, FaPhone, FaStar } from 'react-icons/fa';

function LabourList({ show, onHide, labourers, onRowClick, totalElements = 0, isLoading = false, onChangeRowsPerPage, onChangePage }) {
  // DataTable columns (copied from Home.js)
  const columns = [
    {
      name: 'Name',
      selector: row => row.labourName,
      sortable: true,
      cell: row => (
        <div className="d-flex align-items-center">
          <FaUser className="text-primary me-2" style={{ fontSize: '1.2rem' }} />
          <span className="fw-medium text-primary">
            {row.labourName}
          </span>
        </div>
      ),
    },
    {
      name: 'Services',
      selector: row => row.labourSkill,
      sortable: true,
      cell: row => (
        <div className="d-flex align-items-center">
          <FaTools className="text-success me-2" style={{ fontSize: '1.2rem' }} />
          <span className="fw-medium">{row.labourSkill}</span>
        </div>
      ),
    },
    {
      name: 'Phone',
      selector: row => row.labourMobileNo,
      cell: row => (
        <div className="d-flex align-items-center">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => window.location.href = `tel:${row.labourMobileNo}`}
            className="d-flex align-items-center"
          >
            <FaPhone className="me-2" />
            Call Now
          </Button>
        </div>
      ),
    },
    {
      name: 'Rating',
      selector: row => row.rating,
      sortable: true,
      cell: row => (
        <div className="d-flex align-items-center">
          <FaStar className="text-warning me-2" style={{ fontSize: '1.2rem' }} />
          <span className="fw-medium">{row.rating || 'No ratings yet'}</span>
        </div>
      ),
    },
  ];

  // DataTable custom styles (copied from Home.js)
  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #dee2e6',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        padding: '1rem',
      },
    },
    headCells: {
      style: {
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        fontSize: '1.1rem',
        fontWeight: 'bold',
        color: '#2c3e50',
      },
    },
    cells: {
      style: {
        paddingLeft: '1.5rem',
        paddingRight: '1.5rem',
        fontSize: '1rem',
        verticalAlign: 'middle',
      },
    },
    rows: {
      style: {
        minHeight: '80px',
        fontSize: '1rem',
        backgroundColor: 'white',
        '&:nth-of-type(odd)': {
          backgroundColor: '#fafbfc',
        },
        '&:hover': {
          backgroundColor: '#e8f4ff !important',
          cursor: 'pointer',
          transform: 'scale(1.01)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
        },
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #dee2e6',
        padding: '1rem 0',
      },
    },
    table: {
      style: {
        marginBottom: '0',
      },
    },
    tableWrapper: {
      style: {
        overflow: 'visible',
      },
    },
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Labourers List</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div style={{ overflow: 'auto', flex: 1 }}>
              <DataTable
                columns={columns}
                data={labourers}
                pagination
                paginationServer={!!onChangePage}
                paginationTotalRows={totalElements}
                onChangeRowsPerPage={onChangeRowsPerPage}
                onChangePage={onChangePage}
                customStyles={customStyles}
                progressPending={isLoading}
                onRowClicked={onRowClick}
                pointerOnHover
                noHeader
                noDataComponent={<div className="text-center py-4">No labourers found for this subservice.</div>}
              />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
}

export default LabourList; 