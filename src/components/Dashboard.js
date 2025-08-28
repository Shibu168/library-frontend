import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    // Add password change logic here
    console.log('Changing password:', passwordData);
    alert('Password change functionality will be implemented here');
    setShowChangePassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  // If no user is found
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please login to access the dashboard.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">User Information</h2>
          <p><strong>Name:</strong> {user?.name}</p>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Role:</strong> <span className="capitalize">{user?.role}</span></p>
        </div>

        {/* Admin-specific actions */}
        {user.role === 'admin' && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Admin Actions:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => navigate('/admin')}
                className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded"
              >
                Admin Dashboard
              </button>
              <button 
                onClick={() => navigate('/admin?tab=books')}
                className="bg-green-500 hover:bg-green-600 text-white p-4 rounded"
              >
                Manage Books
              </button>
              <button 
                onClick={() => navigate('/admin?tab=users')}
                className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded"
              >
                Manage Users
              </button>
              <button 
                onClick={() => navigate('/admin?tab=reports')}
                className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded"
              >
                View Reports
              </button>
            </div>
          </div>
        )}

        {/* Member-specific actions (hidden for admin) */}
        {user.role === 'member' && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Member Actions:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded">
                Browse Books
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white p-4 rounded">
                My Borrowed Books
              </button>
              <button className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded">
                Book History
              </button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded">
                Request New Book
              </button>
            </div>
          </div>
        )}

        {/* Librarian-specific actions */}
        {user.role === 'librarian' && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Librarian Actions:</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded">
                Manage Books
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white p-4 rounded">
                Issue Books
              </button>
              <button className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded">
                Return Books
              </button>
              <button className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded">
                View Transactions
              </button>
            </div>
          </div>
        )}

        {/* Change Password Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">My Profile</h2>
          
          {!showChangePassword ? (
            <button
              onClick={() => setShowChangePassword(true)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Change Password
            </button>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-3">Change Password</h3>
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                    required
                    minLength="6"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                    required
                    minLength="6"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    type="submit"
                    className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded"
                  >
                    Update Password
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowChangePassword(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;