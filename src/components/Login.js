import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios'; // Add this import

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      
      if (success) {
        // Get the updated user from localStorage
        const userData = JSON.parse(localStorage.getItem('user'));
        console.log('Login successful, user data:', userData);
        
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          // Redirect based on role
          switch(userData.role) {
            case 'admin':
              navigate('/admin', { replace: true });
              break;
            case 'librarian':
              navigate('/librarian', { replace: true });
              break;
            case 'member':
              navigate('/member', { replace: true });
              break;
            default:
              navigate('/dashboard', { replace: true });
          }
        }, 100);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    try {
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://your-production-domain.com/api' 
        : 'http://localhost:5000/api';
      
      const response = await axios.get(`${API_BASE_URL}/health`);
      alert(`Server connection: ${response.data.message}`);
    } catch (err) {
      alert('Server is not responding. Please start the backend server.');
    }
  };

  // Test function to check if navigation works
  const testNavigation = () => {
    console.log('Testing navigation to /dashboard');
    navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Library Management System</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
              id="email"
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              required
              placeholder="admin@library.com"
              disabled={isLoading}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
              id="password"
              type="password"
              name="password"
              value={password}
              onChange={onChange}
              required
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-primary w-full disabled:opacity-50"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </div>
        </form>

        {/* <div className="mt-6 text-center space-y-2">
          <button
            onClick={testConnection}
            className="text-info hover:text-blue-800 text-sm block w-full"
            type="button"
          >
            Test Server Connection
          </button>
          <button
            onClick={testNavigation}
            className="text-warning hover:text-orange-800 text-sm block w-full"
            type="button"
          >
            Test Navigation
          </button>
        </div> */}
      </div>
    </div>
  );
};  
export default Login;