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
      
      // Only include changed values in the update data
      const updateData = {
        labourId: parseInt(formData.labourId)
      };
      
      // Only add labourName if it changed
      if (formData.labourName.trim() !== labourDetails.labourName) {
        updateData.labourName = formData.labourName;
      }
      
      // Only add labourSkill if it changed
      if (formData.labourSkill !== labourDetails.labourSkill) {
        updateData.labourSkill = formData.labourSkill;
      }
      
      // Only add labourSubSkills if they changed
      const originalSubSkills = labourDetails.labourSubSkills || [];
      const originalSubSkillNames = originalSubSkills.map(sub => 
        typeof sub === 'string' ? sub : (sub.subSkillName || sub.name || '')
      ).filter(name => name.trim() !== '');
      
      const newSubSkillNames = filteredSubSkills.map(sub => sub.subSkillName);
      
      // Check if sub-skills actually changed
      const subSkillsChanged = originalSubSkillNames.length !== newSubSkillNames.length ||
        !originalSubSkillNames.every((skill, index) => skill === newSubSkillNames[index]);
      
      if (subSkillsChanged) {
        updateData.labourSubSkills = filteredSubSkills;
      }

      console.log('Update Data:', updateData);

      const response = await labourService.updateLabourDetails(updateData);
      
      if (response && !response.hasError) {
        // Update the local storage with new data
        const updatedLabourDetails = {
          ...labourDetails,
          ...updateData
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
        setError('Failed to update labour details. Please try again.');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('An error occurred while updating labour details. Please try again.');
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
            <Form.Label className="fw-bold">
              Sub Skills
              {hasSkillChanged && (
                <span className="text-danger ms-2">* Required (skill changed)</span>
              )}
            </Form.Label>
            
            {formData.labourSkill ? (
              <div className="sub-skills-container">
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
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '8px 0',
                      maxHeight: '300px'
                    }),
                    control: base => ({
                      ...base,
                      minHeight: '44px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      boxShadow: 'none',
                      '&:hover': {
                        borderColor: '#9ca3af'
                      },
                      '&:focus-within': {
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                      }
                    }),
                    option: base => ({
                      ...base,
                      padding: '12px 16px',
                      fontSize: '14px',
                      '&:hover': {
                        backgroundColor: '#f3f4f6'
                      },
                      '&:active': {
                        backgroundColor: '#e5e7eb'
                      }
                    }),
                    multiValue: base => ({
                      ...base,
                      backgroundColor: '#3b82f6',
                      borderRadius: '6px',
                      margin: '2px'
                    }),
                    multiValueLabel: base => ({
                      ...base,
                      color: '#ffffff',
                      fontWeight: '500',
                      fontSize: '13px',
                      padding: '4px 8px'
                    }),
                    multiValueRemove: base => ({
                      ...base,
                      color: '#ffffff',
                      '&:hover': {
                        backgroundColor: '#2563eb',
                        color: '#ffffff'
                      }
                    }),
                    placeholder: base => ({
                      ...base,
                      color: '#9ca3af',
                      fontSize: '14px'
                    }),
                    singleValue: base => ({
                      ...base,
                      fontSize: '14px',
                      color: '#374151'
                    }),
                    input: base => ({
                      ...base,
                      fontSize: '14px'
                    }),
                    valueContainer: base => ({
                      ...base,
                      padding: '8px 12px'
                    }),
                    indicatorsContainer: base => ({
                      ...base,
                      paddingRight: '8px'
                    })
                  }}
                />
              </div>
            ) : (
              <div className="text-center py-4 bg-light rounded border">
                <p className="text-muted mb-0">
                  <i className="fas fa-info-circle me-2"></i>
                  Please select a main skill first
                </p>
              </div>
            )}
            
            <Form.Text className="text-muted mt-2">
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