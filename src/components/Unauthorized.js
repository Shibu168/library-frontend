import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Unauthorized Access</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded mr-4"
        >
          Go Back
        </button>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;