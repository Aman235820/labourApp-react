import React, { useState } from 'react';
import { Button, Modal, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { FaUser, FaTools, FaPhone, FaStar, FaBuilding } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import '../styles/LabourList.css';
import {
  getSearchResultKind,
  getRowDisplayName,
  getRowMainServiceCategory,
  getRowPhone,
  summarizeEnterpriseServices,
} from '../utils/searchCategoryResult';

function LabourList({ show, onHide, labourers, onRowClick, totalElements = 0, isLoading = false, onChangeRowsPerPage, onChangePage, searchQuery = '' }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [enterprisePreview, setEnterprisePreview] = useState(null);
  
  const columns = [
    {
      name: t('labourList.name'),
      selector: (row) => getRowDisplayName(row),
      sortable: true,
      cell: (row) => {
        const isEnt = getSearchResultKind(row) === 'enterprise';
        return (
          <div className="d-flex align-items-center flex-wrap gap-2">
            {isEnt ? (
              <FaBuilding className="text-info me-1" style={{ fontSize: '1.2rem' }} />
            ) : (
              <FaUser className="text-primary me-1" style={{ fontSize: '1.2rem' }} />
            )}
            <div className="d-flex flex-column">
              <span className="fw-medium text-primary">{getRowDisplayName(row)}</span>
              <Badge bg={isEnt ? 'info' : 'primary'} className={isEnt ? 'text-dark' : ''} style={{ width: 'fit-content', fontSize: '0.7rem' }}>
                {isEnt ? t('searchLabourModal.entityTypeEnterprise') : t('searchLabourModal.entityTypeLabour')}
              </Badge>
            </div>
          </div>
        );
      },
    },
    {
      name: t('labourList.services'),
      selector: (row) => getRowMainServiceCategory(row, searchQuery),
      sortable: true,
      cell: (row) => (
        <div className="d-flex align-items-center">
          <FaTools className="text-success me-2" style={{ fontSize: '1.2rem' }} />
          <span className="fw-medium">{getRowMainServiceCategory(row, searchQuery)}</span>
        </div>
      ),
    },
    {
      name: t('labourList.phone'),
      selector: (row) => getRowPhone(row),
      cell: (row) => {
        const phone = getRowPhone(row);
        return (
          <div className="d-flex align-items-center">
            <Button
              variant="outline-primary"
              size="sm"
              disabled={!phone}
              onClick={() => {
                if (phone) window.location.href = `tel:${phone}`;
              }}
              className="d-flex align-items-center"
            >
              <FaPhone className="me-2" />
              {t('labourList.callNow')}
            </Button>
          </div>
        );
      },
    },
    {
      name: t('labourList.rating'),
      selector: row => row.rating,
      sortable: true,
      cell: row => (
        <div className="d-flex align-items-center">
          <FaStar className="text-warning me-2" style={{ fontSize: '1.2rem' }} />
          <span className="fw-medium">{row.rating || t('labourList.noRatingsYet')}</span>
        </div>
      ),
    },
    {
      name: t('labourList.actions') || 'Actions',
      button: true,
      cell: (row) => (
        <div className="d-flex gap-2 align-items-center">
          <Button
            variant="outline-primary"
            size="sm"
            className="search-result-view-profile-btn d-inline-flex align-items-center justify-content-center text-nowrap"
            onClick={(e) => {
              e.stopPropagation();
              if (getSearchResultKind(row) === 'enterprise') {
                setEnterprisePreview(row);
              } else {
                navigate(`/labour-details/${row.labourId}`, {
                  state: { searchCategory: getRowMainServiceCategory(row, searchQuery) },
                });
              }
            }}
          >
            <FaUser className="me-2 flex-shrink-0" />
            {t('common.viewProfile')}
          </Button>
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      minWidth: '140px'
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
    <>
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('labourList.labourersList')}</Modal.Title>
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
              onRowClicked={(row) => {
                if (getSearchResultKind(row) === 'enterprise') {
                  setEnterprisePreview(row);
                } else if (onRowClick) {
                  onRowClick(row);
                }
              }}
              pointerOnHover
              noHeader
              noDataComponent={<div className="text-center py-4">{t('labourList.noLabourersFound')}</div>}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>{t('labourList.close')}</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={!!enterprisePreview} onHide={() => setEnterprisePreview(null)} centered size="md">
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaBuilding className="text-info" />
            {enterprisePreview?.companyName}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {enterprisePreview && (
            <>
              <p className="text-muted small mb-2">
                <Badge bg="info" className="text-dark me-2">{t('searchLabourModal.entityTypeEnterprise')}</Badge>
                {getRowMainServiceCategory(enterprisePreview, searchQuery)}
              </p>
              <p className="mb-2">
                <strong>{t('searchLabourModal.servicesOffered')}:</strong>{' '}
                {summarizeEnterpriseServices(enterprisePreview.servicesOffered, searchQuery) || '—'}
              </p>
              <p className="mb-0">
                <strong>{t('labourList.callNow')}:</strong>{' '}
                {enterprisePreview.ownerContactInfo || '—'}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEnterprisePreview(null)}>{t('labourList.close')}</Button>
          {enterprisePreview?.ownerContactInfo ? (
            <Button variant="primary" onClick={() => { window.location.href = `tel:${enterprisePreview.ownerContactInfo}`; }}>
              <FaPhone className="me-2" />
              {t('labourList.callNow')}
            </Button>
          ) : null}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default LabourList; 