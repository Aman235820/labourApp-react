import React from 'react';
import EnterpriseDetailsForm from './EnterpriseDetailsForm';

// Demo component to showcase the enterprise details form with sample data
function EnterpriseDetailsDemo() {
  const sampleData = {
    ownername: "Rajesh Kumar",
    ownerContactInfo: "9876543123", 
    companyName: "Kumar Electrical Works",
    gstNumber: "27AABCU9603R123",
    otherContactNumbers: ["9876543211"],
    registrationCertificateLink: "https://example.com/certificate1.pdf",
    workforceSize: 15,
    servicesOffered: {
      "Electrician": [
        "AC Repair & Servicing",
        "Geyser Installation & Repair", 
        "Fan Repair / Installation",
        "Switchboard & Wiring",
        "Inverter Installation / Repair"
      ],
      "Home Appliance Repair": [
        "Refrigerator Repair",
        "Washing Machine Repair",
        "TV / LED Repair"
      ]
    },
    otherDocumentLinks: {
      license: "https://example.com/license1.pdf",
      insurance: "https://example.com/insurance1.pdf"
    },
    location: "Delhi"
  };

  const handleSubmit = (data) => {
    console.log('Enterprise registration data:', data);
    alert('Registration completed successfully! Check console for data.');
  };

  return (
    <EnterpriseDetailsForm
      initialData={sampleData}
      onSubmit={handleSubmit}
      isLoading={false}
    />
  );
}

export default EnterpriseDetailsDemo;
