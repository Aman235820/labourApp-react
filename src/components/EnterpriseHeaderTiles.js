import React, { useMemo, useState } from 'react';
import { Card, Form, Spinner, Modal, Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { enterpriseService } from '../services/enterpriseService';
import LocationModal from './LocationModal';
import { mergeEnterpriseSession } from '../utils/enterpriseSession';
import '../styles/EnterpriseHeaderTiles.css';

function EnterpriseHeaderTiles({ enterprise, onUpdated }) {
  const { t } = useTranslation();
  const [editingKey, setEditingKey] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [originalValue, setOriginalValue] = useState('');
  const [saving, setSaving] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);

  const enterpriseId = enterprise?._id || enterprise?.id || enterprise?.returnValue?._id || enterprise?.returnValue?.id;
  const token = enterprise?.token || enterprise?.returnValue?.token || '';

  const values = useMemo(() => {
    const ev = enterprise || {};
    
    // Safely extract location as a string
    let location = ev.location || ev.returnValue?.location || '';
    if (typeof location === 'object' && location !== null) {
      location = location.city || location.suburb || location.neighbourhood || location.state || t('enterpriseHeaderTiles.unknownValue');
    }
    
    return {
      ownername: ev.ownername || ev.returnValue?.ownername || '',
      companyName: ev.companyName || ev.returnValue?.companyName || '',
      workforceSize: ev.workforceSize || ev.returnValue?.workforceSize || 0,
      location: String(location)
    };
  }, [enterprise, t]);

  const startEdit = (key) => {
    // Prevent editing if field is currently being saved
    if (saving === key) {
      return;
    }
    
    if (key === 'location') {
      setShowLocationModal(true);
      return;
    }
    
    setEditingKey(key);
    const currentValue = String(values[key] || '');
    setTempValue(currentValue);
    setOriginalValue(currentValue);
  };

  const handleChange = (e) => {
    setTempValue(e.target.value);
  };

  const normalize = (key, val) => {
    if (key === 'workforceSize') {
      const n = parseInt(String(val || 0), 10);
      return isNaN(n) || n < 0 ? 0 : n;
    }
    return val;
  };

  const persist = async (fieldKey, value) => {
    if (!enterpriseId || !token) return;
    setSaving(fieldKey);
    
    // Clear editing state immediately for better UX
    setEditingKey(null);
    setTempValue('');
    setOriginalValue('');
    setPendingUpdate(null);
    
    try {
      const resp = await enterpriseService.updateEnterpriseField(enterpriseId, fieldKey, value, token);
      const next = mergeEnterpriseSession(enterprise || {}, resp?.returnValue || {});
      localStorage.setItem('enterprise', JSON.stringify(next));
      onUpdated && onUpdated(next);
    } catch (error) {
      console.error('Failed to update field:', error);
      // Optionally show error toast here
    } finally {
      setSaving(null);
    }
  };

  const checkForChangesAndConfirm = () => {
    if (!editingKey) return;
    
    const normalizedTemp = normalize(editingKey, tempValue);
    const normalizedOriginal = normalize(editingKey, originalValue);
    
    // Check if value actually changed
    if (String(normalizedTemp) === String(normalizedOriginal)) {
      // No change, just exit edit mode
      setEditingKey(null);
      setTempValue('');
      setOriginalValue('');
      return;
    }
    
    // Value changed, show confirmation
    setPendingUpdate({
      fieldKey: editingKey,
      value: normalizedTemp,
      displayValue: tempValue
    });
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = () => {
    if (pendingUpdate) {
      // Close modal instantly
      setShowConfirmModal(false);
      
      // Start background update
      persist(pendingUpdate.fieldKey, pendingUpdate.value);
    }
  };

  const handleCancelUpdate = () => {
    setShowConfirmModal(false);
    setPendingUpdate(null);
    setEditingKey(null);
    setTempValue('');
    setOriginalValue('');
  };

  const handleBlur = () => {
    checkForChangesAndConfirm();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkForChangesAndConfirm();
    } else if (e.key === 'Escape') {
      setEditingKey(null);
      setTempValue('');
      setOriginalValue('');
    }
  };

  const handleLocationSelect = (locationData) => {
    // LocationModal now returns clean city names in displayName
    const newLocation = locationData?.displayName || t('enterpriseHeaderTiles.unknownValue');
    const currentLocation = String(values.location || '');
    
    if (newLocation !== currentLocation) {
      setOriginalValue(currentLocation);
      setPendingUpdate({
        fieldKey: 'location',
        value: newLocation,
        displayValue: newLocation
      });
      setShowConfirmModal(true);
    }
    setShowLocationModal(false);
  };


  const Tile = ({ label, value, keyName, inputType = 'text' }) => (
    <Card className="eh-tile">
      <Card.Body className="eh-tile-body">
        <div className="eh-label">{label}</div>
        <div className="eh-value">
          {editingKey === keyName ? (
            <Form.Control
              type={inputType}
              value={tempValue}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="eh-editor-input"
            />
          ) : (
            <div 
              className={`eh-value-display ${saving === keyName ? 'eh-saving' : ''}`}
              onClick={() => startEdit(keyName)}
              title={saving === keyName ? t('enterpriseHeaderTiles.updatingTitle') : t('enterpriseHeaderTiles.clickToEdit')}
            >
              <span className="eh-value-text">{value}</span>
              {saving === keyName && <Spinner animation="border" size="sm" className="ms-2" />}
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="eh-wrapper">
      <div className="eh-row">
        <Tile label={t('enterpriseHeaderTiles.ownerName')} value={values.ownername || '—'} keyName="ownername" />
        <Tile label={t('enterpriseHeaderTiles.company')} value={values.companyName || '—'} keyName="companyName" />
        <Tile
          label={t('enterpriseHeaderTiles.workforceSize')}
          value={t('enterpriseHeaderTiles.employees', { count: values.workforceSize || 0 })}
          keyName="workforceSize"
          inputType="number"
        />
        <Tile label={t('enterpriseHeaderTiles.location')} value={values.location || '—'} keyName="location" />
      </div>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={handleCancelUpdate} centered>
        <Modal.Header closeButton>
          <Modal.Title>{t('enterpriseHeaderTiles.confirmTitle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t('enterpriseHeaderTiles.confirmBody')}</p>
          {pendingUpdate && (
            <div className="bg-light p-3 rounded">
              <div className="mb-2">
                <strong>{t('enterpriseHeaderTiles.oldValue')}</strong> {String(originalValue || '—')}
              </div>
              <div>
                <strong>{t('enterpriseHeaderTiles.newValue')}</strong> {String(pendingUpdate.displayValue || '—')}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelUpdate}>
            {t('enterpriseHeaderTiles.cancel')}
          </Button>
          <Button variant="primary" onClick={handleConfirmUpdate} disabled={saving}>
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {t('enterpriseHeaderTiles.updating')}
              </>
            ) : (
              t('enterpriseHeaderTiles.yesUpdate')
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Location Modal */}
      <LocationModal
        show={showLocationModal}
        onHide={() => setShowLocationModal(false)}
        onLocationSelect={handleLocationSelect}
      />
    </div>
  );
}

export default EnterpriseHeaderTiles;


