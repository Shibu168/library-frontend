import React, { useState } from 'react';
import axios from 'axios';

const CreateMember = ({ onMemberCreated }) => { // Accept onMemberCreated prop
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com/api' 
    : 'http://localhost:5000/api';

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(`${API_BASE_URL}/users/member`, formData, {
        headers: { 'x-auth-token': token }
      });
      
      setFormData({ name: '', email: '', password: '' });
      alert('Member created successfully!');
      
      // Call the callback function if provided
      if (onMemberCreated) {
        onMemberCreated();
      }
    } catch (error) {
      console.error('Error creating member:', error);
      alert('Error creating member: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Member</h2>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Name *</label>
            <input
              type="text"
              name="name"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.name}
              onChange={onChange}
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email *</label>
            <input
              type="email"
              name="email"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.email}
              onChange={onChange}
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password *</label>
            <input
              type="password"
              name="password"
              required
              minLength="6"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
              value={formData.password}
              onChange={onChange}
              placeholder="Enter password"
            />
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Member'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateMember;