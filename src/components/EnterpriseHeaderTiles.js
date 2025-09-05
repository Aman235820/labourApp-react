import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Card, Form, Spinner, Modal, Button } from 'react-bootstrap';
import { enterpriseService } from '../services/enterpriseService';
import LocationModal from './LocationModal';
import '../styles/EnterpriseHeaderTiles.css';

function EnterpriseHeaderTiles({ enterprise, onUpdated }) {
  const [editingKey, setEditingKey] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [originalValue, setOriginalValue] = useState('');
  const [saving, setSaving] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const wrapperRef = useRef(null);
  const editInputRef = useRef(null);

  const enterpriseId = enterprise?._id || enterprise?.id || enterprise?.returnValue?._id || enterprise?.returnValue?.id;
  const token = enterprise?.token || enterprise?.returnValue?.token || '';

  // Mobile keyboard detection and handling
  useEffect(() => {
    const handleResize = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.clientHeight;
      const heightDifference = Math.abs(windowHeight - documentHeight);
      
      // Detect if keyboard is open (height difference > 150px is usually keyboard)
      if (heightDifference > 150) {
        setIsKeyboardOpen(true);
        document.body.classList.add('enterprise-keyboard-open');
      } else {
        setIsKeyboardOpen(false);
        document.body.classList.remove('enterprise-keyboard-open');
      }
    };

    const handleTouchStart = (e) => {
      // If touching outside of input fields and not in editing mode, blur the active input
      if (!e.target.matches('input, textarea') && editingKey) {
        const activeElement = document.activeElement;
        if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
          // Only blur if not clicking on the input itself
          if (!activeElement.contains(e.target)) {
            activeElement.blur();
          }
        }
      }
    };

    const handleClickOutside = (e) => {
      // If clicking outside the wrapper and editing, cancel edit
      if (wrapperRef.current && !wrapperRef.current.contains(e.target) && editingKey) {
        setTimeout(() => {
          checkForChangesAndConfirm();
        }, 100);
      }
    };

    window.addEventListener('resize', handleResize);
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('click', handleClickOutside);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('click', handleClickOutside);
      document.body.classList.remove('enterprise-keyboard-open');
    };
  }, [editingKey]);

  const values = useMemo(() => {
    const ev = enterprise || {};
    
    // Safely extract location as a string
    let location = ev.location || ev.returnValue?.location || '';
    if (typeof location === 'object' && location !== null) {
      location = location.city || location.suburb || location.neighbourhood || location.state || 'Unknown';
    }
    
    return {
      ownername: ev.ownername || ev.returnValue?.ownername || '',
      companyName: ev.companyName || ev.returnValue?.companyName || '',
      workforceSize: ev.workforceSize || ev.returnValue?.workforceSize || 0,
      location: String(location)
    };
  }, [enterprise]);

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
    
    // Focus input after state update
    setTimeout(() => {
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }, 100);
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
      const next = { ...(enterprise || {}), ...(resp?.returnValue || {}) };
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
    // Add small delay to prevent blur conflicts with touch events
    setTimeout(() => {
      checkForChangesAndConfirm();
      // Close keyboard
      setIsKeyboardOpen(false);
    }, 150);
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
    const newLocation = locationData?.displayName || 'Unknown';
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
              ref={editInputRef}
              type={inputType}
              value={tempValue}
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              className="eh-editor-input"
              style={{ fontSize: '16px' }} // Prevent zoom on iOS
              onFocus={() => {
                // Small delay to detect keyboard
                setTimeout(() => setIsKeyboardOpen(true), 300);
              }}
            />
          ) : (
            <div 
              className={`eh-value-display ${saving === keyName ? 'eh-saving' : ''}`}
              onClick={() => startEdit(keyName)}
              title={saving === keyName ? "Updating..." : "Click to edit"}
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
    <div ref={wrapperRef} className={`eh-wrapper ${isKeyboardOpen ? 'keyboard-open' : ''}`}>
      <div className="eh-row">
        <Tile label="Owner name" value={values.ownername || '—'} keyName="ownername" />
        <Tile label="Company" value={values.companyName || '—'} keyName="companyName" />
        <Tile label="Workforce size" value={`${values.workforceSize || 0} Employees`} keyName="workforceSize" inputType="number" />
        <Tile label="Location" value={values.location || '—'} keyName="location" />
      </div>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={handleCancelUpdate} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to update this field?</p>
          {pendingUpdate && (
            <div className="bg-light p-3 rounded">
              <div className="mb-2">
                <strong>Old Value:</strong> {String(originalValue || '—')}
              </div>
              <div>
                <strong>New Value:</strong> {String(pendingUpdate.displayValue || '—')}
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCancelUpdate}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmUpdate} disabled={saving}>
            {saving ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              'Yes, Update'
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


