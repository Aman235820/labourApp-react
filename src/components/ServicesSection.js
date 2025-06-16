import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ServicesSection.css';

function ServicesSection() {
  const [services, setServices] = useState([]);
  const [activeIndex, setActiveIndex] = useState(null); // None selected by default
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        // You can replace this URL with your actual endpoint or local JSON file
        const response = await axios.get('/services.json');
        setServices(response.data.services || []);
      } catch (err) {
        setError('Failed to load services.');
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) {
    return <div className="services-section"><div className="text-center">Loading services...</div></div>;
  }
  if (error) {
    return <div className="services-section"><div className="text-danger text-center">{error}</div></div>;
  }

  return (
    <div className="services-section">
      <div className="services-categories">
        {services.map((service, idx) => (
          <div
            key={service.name}
            className={`service-category${activeIndex === idx ? ' active' : ''}`}
            onClick={() => setActiveIndex(idx)}
          >
            <div className="service-icon">{service.icon || '🔧'}</div>
            <div className="service-name">{service.name}</div>
          </div>
        ))}
      </div>
      {activeIndex !== null && services[activeIndex] && (
        <div className="services-subcategories">
          {services[activeIndex].subCategories.map((sub, i) => (
            <div className="service-subcategory" key={i}>{sub}</div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ServicesSection; 