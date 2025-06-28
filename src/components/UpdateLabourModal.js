import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { FaEdit } from 'react-icons/fa';
import { labourService } from '../services/labourService';
import Select from 'react-select';

const UpdateLabourModal = ({ show, onHide, labourDetails, onUpdateSuccess }) => {
  const [formData, setFormData] = useState({
    labourId: '',
    labourName: '',
    labourSkill: '',
    labourMobileNo: '',
    labourSubSkills: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [originalSkill, setOriginalSkill] = useState('');
  const [servicesData, setServicesData] = useState({ services: [] });

  // Function to get sub-skills for a selected skill
  const getSubSkillsForSkill = (skillName) => {
    if (!skillName || !servicesData.services) return [];
    
    const service = servicesData.services.find(s => s.name === skillName);
    return service ? service.subCategories : [];
  };

  useEffect(() => {
    if (labourDetails && show) {
      console.log('Labour Details:', labourDetails);
      console.log('Labour Sub Skills:', labourDetails.labourSubSkills);
      
      // Convert existing sub-skills from objects to strings
      let existingSubSkills = [];
      
      if (labourDetails.labourSubSkills && Array.isArray(labourDetails.labourSubSkills)) {
        existingSubSkills = labourDetails.labourSubSkills.map(sub => {
          // Handle different possible structures
          if (typeof sub === 'string') {
            return sub;
          } else if (sub && typeof sub === 'object') {
            return sub.subSkillName || sub.name || sub.value || '';
          }
          return '';
        }).filter(sub => sub.trim() !== '');
      }
      
      console.log('Converted Sub Skills:', existingSubSkills);
      
      setFormData({
        labourId: labourDetails.labourId || '',
        labourName: labourDetails.labourName || '',
        labourSkill: labourDetails.labourSkill || '',
        labourMobileNo: labourDetails.labourMobileNo || '',
        labourSubSkills: existingSubSkills
      });
      setError(null);
      setOriginalSkill(labourDetails.labourSkill || '');
    }
  }, [labourDetails, show]);

  // Load services data
  useEffect(() => {
    fetch('/services.json')
      .then(response => response.json())
      .then(data => {
        setServicesData(data);
      })
      .catch(error => console.error('Error loading services data:', error));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // If labour skill changes, clear sub-skills
      if (name === 'labourSkill' && value !== prev.labourSkill) {
        newData.labourSubSkills = [];
      }
      
      return newData;
    });
  };

  const handleSubSkillChange = (selectedOptions) => {
    if (selectedOptions && selectedOptions.some(option => option.value === 'all')) {
      // If "Select All" is selected, select all sub-skills
      const allSubSkills = getSubSkillsForSkill(formData.labourSkill);
      setFormData(prev => ({
        ...prev,
        labourSubSkills: allSubSkills
      }));
    } else {
      // Otherwise, use the selected options
      setFormData(prev => ({
        ...prev,
        labourSubSkills: selectedOptions ? selectedOptions.map(option => option.value) : []
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: Check if at least 1 sub-skill is selected
    if (formData.labourSubSkills.length === 0) {
      setError('Please select at least one sub-skill.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Filter out empty sub-skills and format for API
      const filteredSubSkills = formData.labourSubSkills
        .filter(sub => sub.trim() !== '')
        .map(subSkill => ({ subSkillName: subSkill }));
      
      const updateData = {
        labourId: parseInt(formData.labourId),
        labourName: formData.labourName,
        labourSkill: formData.labourSkill,
        labourSubSkills: filteredSubSkills
      };

      const response = await labourService.updateLabourDetails(updateData);
      
      if (response && !response.hasError) {
        // Update the local storage with new data
        const updatedLabourDetails = {
          ...labourDetails,
          labourName: formData.labourName,
          labourSkill: formData.labourSkill,
          labourSubSkills: filteredSubSkills
        };
        localStorage.setItem('labour', JSON.stringify(updatedLabourDetails));
        
        // Call the callback to refresh parent component
        if (onUpdateSuccess) {
          onUpdateSuccess(updatedLabourDetails);
        }
        
        // Close modal and show alert
        onHide();
        alert('Labour details updated successfully!');
      } else {
        setError(response.message || 'Failed to update labour details');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while updating labour details');
    } finally {
      setIsLoading(false);
    }
  };

  // Check if skill has changed
  const hasSkillChanged = formData.labourSkill !== originalSkill;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaEdit className="me-2" />
          Update Labour Details
        </Modal.Title>
      </Modal.Header>
      
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" onClose={() => setError(null)} dismissible>
              {error}
            </Alert>
          )}

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Labour ID</Form.Label>
                <Form.Control
                  type="text"
                  name="labourId"
                  value={formData.labourId}
                  disabled
                  className="bg-light"
                />
                <Form.Text className="text-muted">
                  Labour ID cannot be changed
                </Form.Text>
              </Form.Group>
            </div>
            
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Labour Name</Form.Label>
                <Form.Control
                  type="text"
                  name="labourName"
                  value={formData.labourName}
                  onChange={handleInputChange}
                  required
                />
                <Form.Text className="text-muted">
                  Enter your full name
                </Form.Text>
              </Form.Group>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Mobile Number</Form.Label>
                <Form.Control
                  type="text"
                  name="labourMobileNo"
                  value={formData.labourMobileNo}
                  disabled
                  className="bg-light"
                />
                <Form.Text className="text-muted">
                  Mobile number cannot be changed
                </Form.Text>
              </Form.Group>
            </div>
            
            <div className="col-md-6">
              <Form.Group className="mb-3">
                <Form.Label>Labour Skill *</Form.Label>
                <Form.Select
                  name="labourSkill"
                  value={formData.labourSkill}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a skill</option>
                  {servicesData.services && servicesData.services.map((service, index) => (
                    <option key={index} value={service.name}>
                      {service.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label>
              Sub Skills
              {hasSkillChanged && (
                <span className="text-danger ms-2">* Required (skill changed)</span>
              )}
            </Form.Label>
            
            {formData.labourSkill ? (
              <Select
                isMulti
                name="labourSubSkills"
                options={[
                  { value: 'all', label: 'Select All' },
                  ...getSubSkillsForSkill(formData.labourSkill).map(subCategory => ({
                    value: subCategory,
                    label: subCategory
                  }))
                ]}
                onChange={handleSubSkillChange}
                value={formData.labourSubSkills.map(subCategory => ({
                  value: subCategory,
                  label: subCategory
                }))}
                className="basic-multi-select"
                classNamePrefix="select"
                placeholder="Select your sub skills"
                menuPortalTarget={document.body}
                styles={{
                  menuPortal: base => ({ 
                    ...base, 
                    zIndex: 9999 
                  }),
                  menu: base => ({
                    ...base,
                    zIndex: 9999,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px'
                  }),
                  control: base => ({
                    ...base,
                    minHeight: '38px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    '&:hover': {
                      borderColor: '#9ca3af'
                    }
                  }),
                  option: base => ({
                    ...base,
                    padding: '8px 12px',
                    '&:hover': {
                      backgroundColor: '#f3f4f6'
                    }
                  }),
                  multiValue: base => ({
                    ...base,
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px'
                  }),
                  multiValueLabel: base => ({
                    ...base,
                    color: '#374151',
                    fontWeight: '500'
                  }),
                  multiValueRemove: base => ({
                    ...base,
                    color: '#6b7280',
                    '&:hover': {
                      backgroundColor: '#d1d5db',
                      color: '#374151'
                    }
                  })
                }}
              />
            ) : (
              <div className="text-center py-3 bg-light rounded">
                <p className="text-muted mb-0">Please select a main skill first</p>
              </div>
            )}
            
            <Form.Text className="text-muted">
              {hasSkillChanged 
                ? 'Please select sub-skills for your new skill'
                : 'Select sub-skills related to your main skill'
              }
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            type="submit" 
            disabled={isLoading || !formData.labourSkill || !formData.labourName || (hasSkillChanged && formData.labourSubSkills.length === 0)}
          >
            {isLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Updating...
              </>
            ) : (
              <>
                <FaEdit className="me-2" />
                Update Details
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default UpdateLabourModal; 