import React from 'react';
import { Card, Button, Badge, Spinner, Form } from 'react-bootstrap';
import {
  FaUser,
  FaTools,
  FaPhone,
  FaStar,
  FaBuilding,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  getSearchResultKind,
  getRowDisplayName,
  getRowMainServiceCategory,
  getRowPhone,
  summarizeEnterpriseServices,
  searchResultItemKey,
} from '../utils/searchCategoryResult';
import { normalizeMongoId } from '../utils/enterpriseSession';
import '../styles/HomeSearchResults.css';

const ENTERPRISE_ID_REGEX = /^[0-9a-fA-F]{24}$/;

/**
 * Card-based search results for Home (replaces DataTable on small screens and improves all sizes).
 */
function HomeSearchResultsList({
  labourers = [],
  searchQuery = '',
  isLoading = false,
  error = null,
  pageIndex = 0,
  totalPages = 0,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onCardClick,
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const goViewProfile = (e, row) => {
    e?.stopPropagation?.();
    if (getSearchResultKind(row) === 'enterprise') {
      const id = normalizeMongoId(row._id);
      if (!id || !ENTERPRISE_ID_REGEX.test(id)) {
        alert(
          t('enterprisePublic.invalidId', {
            defaultValue: 'Enterprise profile is unavailable (invalid ID).',
          })
        );
        return;
      }
      navigate(`/enterprise-profile/${id}`, {
        state: { searchCategory: searchQuery },
      });
    } else {
      navigate(`/labour-details/${row.labourId}`, {
        state: { searchCategory: row.labourSkill || searchQuery },
      });
    }
  };

  const handleCardActivate = (row) => {
    if (typeof onCardClick === 'function') onCardClick(row);
  };

  const phone = (row) => getRowPhone(row);
  const mainCat = (row) => getRowMainServiceCategory(row, searchQuery);

  return (
    <div className="home-search-results-list">
      {error ? (
        <div className="alert alert-danger mb-3" role="alert">
          {error}
        </div>
      ) : null}

      <div className="home-search-results-toolbar d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
        <div className="small text-muted">
          {t('searchLabourModal.showingResultsStatic')}{' '}
          <span className="fw-semibold">{totalElements}</span>
        </div>
        <div className="d-flex flex-wrap align-items-center gap-2">
          <Form.Label className="mb-0 small text-nowrap">{t('searchLabourModal.pageSize')}</Form.Label>
          <Form.Select
            size="sm"
            className="home-search-page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(parseInt(e.target.value, 10) || 10)}
            disabled={isLoading}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </Form.Select>
        </div>
      </div>

      {isLoading && (!labourers || labourers.length === 0) ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" role="status" />
          <p className="text-muted small mt-2 mb-0">{t('common.loading', { defaultValue: 'Loading…' })}</p>
        </div>
      ) : null}

      <div className="home-search-results-cards">
        {labourers.map((row, idx) => {
          const isEnt = getSearchResultKind(row) === 'enterprise';
          const key = searchResultItemKey(row, idx);
          const ph = phone(row);
          const servicesLine = isEnt
            ? summarizeEnterpriseServices(row.servicesOffered, searchQuery)
            : null;

          return (
            <Card
              key={key}
              className={`home-search-result-card mb-3 border shadow-sm ${
                isEnt ? 'home-search-result-card-enterprise' : 'home-search-result-card-labour'
              }`}
              onClick={() => handleCardActivate(row)}
              role="button"
              tabIndex={0}
              onKeyDown={(ev) => {
                if (ev.key === 'Enter' || ev.key === ' ') {
                  ev.preventDefault();
                  handleCardActivate(row);
                }
              }}
            >
              <Card.Body className="p-3">
                <div className="d-flex align-items-start gap-3">
                  <div
                    className={`home-search-result-avatar flex-shrink-0 ${
                      isEnt ? 'bg-info' : 'bg-primary'
                    }`}
                  >
                    {isEnt ? (
                      <FaBuilding className="text-white" size={22} />
                    ) : (
                      <FaUser className="text-white" size={22} />
                    )}
                  </div>
                  <div className="min-w-0 flex-grow-1">
                    <div className="d-flex flex-wrap align-items-start justify-content-between gap-2">
                      <div className="min-w-0">
                        <h3 className="home-search-result-name text-primary mb-1">
                          {getRowDisplayName(row)}
                        </h3>
                        <Badge
                          bg={isEnt ? 'info' : 'primary'}
                          className={isEnt ? 'text-dark' : ''}
                          style={{ fontSize: '0.7rem' }}
                        >
                          {isEnt
                            ? t('searchLabourModal.entityTypeEnterprise')
                            : t('searchLabourModal.entityTypeLabour')}
                        </Badge>
                      </div>
                      <div className="home-search-result-rating flex-shrink-0 text-end">
                        {row.rating && parseFloat(row.rating) > 0 ? (
                          <div className="d-flex align-items-center justify-content-end gap-1">
                            <FaStar className="text-warning" size={14} />
                            <span className="fw-bold">{row.rating}</span>
                            <small className="text-muted">({row.ratingCount || 0})</small>
                          </div>
                        ) : (
                          <Badge bg="secondary" className="fw-normal">
                            {t('common.noRatingsYet')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="home-search-result-service mt-2 pt-2 border-top border-light">
                      <FaTools className="text-success me-2 flex-shrink-0" size={14} />
                      <span className="home-search-service-text">{mainCat}</span>
                    </div>
                    {servicesLine ? (
                      <p className="small text-muted mb-0 mt-1 ms-4 ps-1 home-search-service-sub">
                        {servicesLine}
                      </p>
                    ) : null}

                    <div className="d-flex align-items-start text-muted mt-2 small">
                      <FaMapMarkerAlt className="me-2 text-primary mt-1 flex-shrink-0" size={14} />
                      <span className="home-search-location-text">
                        {isEnt
                          ? row.location || t('searchLabourModal.locationNotSpecified')
                          : row.labourLocation ||
                            row.labourAddress ||
                            t('searchLabourModal.locationNotSpecified')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="home-search-result-actions d-grid gap-2 mt-3 pt-3 border-top">
                  <div className="d-flex flex-column flex-sm-row gap-2">
                    <Button
                      variant="outline-primary"
                      className="flex-sm-fill"
                      disabled={!ph}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (ph) window.location.href = `tel:${ph}`;
                      }}
                    >
                      <FaPhone className="me-2" />
                      {t('common.callNow')}
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-sm-fill"
                      onClick={(e) => goViewProfile(e, row)}
                    >
                      <FaUser className="me-2" />
                      {t('common.viewProfile')}
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          );
        })}
      </div>

      {!isLoading && labourers.length === 0 && !error ? (
        <div className="text-center py-4 text-muted">
          {t('searchLabourModal.noResultsFound')}
        </div>
      ) : null}

      {totalPages > 1 ? (
        <div className="home-search-pagination d-flex flex-wrap align-items-center justify-content-between gap-2 mt-3 pt-3 border-top">
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={isLoading || pageIndex <= 0}
            onClick={() => onPageChange?.(pageIndex - 1)}
          >
            {t('searchLabourModal.prev')}
          </Button>
          <span className="small fw-medium text-muted px-2">
            {t('searchLabourModal.pageOf', {
              current: pageIndex + 1,
              total: totalPages,
            })}
          </span>
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={isLoading || pageIndex >= totalPages - 1}
            onClick={() => onPageChange?.(pageIndex + 1)}
          >
            {t('searchLabourModal.next')}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

export default HomeSearchResultsList;
