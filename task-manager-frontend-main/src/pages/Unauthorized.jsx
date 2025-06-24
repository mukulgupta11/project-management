// src/pages/Unauthorized.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1>Unauthorized Access</h1>
      <p>You do not have permission to view this page.</p>
      <button 
        onClick={() => navigate(-1)} 
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Go Back
      </button>
    </div>
  );
};

export default Unauthorized;
