import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'ascending' });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'member'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com/api' 
    : 'http://localhost:5000/api';

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/users`, {
        headers: { 'x-auth-token': token }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Error fetching users: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Check if user is trying to create a librarian (only admin can do this)
      const user = JSON.parse(localStorage.getItem('user'));
      if (formData.role === 'librarian' && user.role !== 'admin') {
        alert('Only admins can create librarian accounts');
        return;
      }

      await axios.post(`${API_BASE_URL}/users`, formData, {
        headers: { 'x-auth-token': token }
      });
      
      setShowForm(false);
      setFormData({ name: '', email: '', password: '', role: 'member' });
      fetchUsers();
      
      // Show success notification
      showNotification('User created successfully!', 'success');
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/users/${id}`, {
        headers: { 'x-auth-token': token }
      });
      fetchUsers();
      showNotification('User deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Error deleting user: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handlePasswordReset = async (userId, userRole, userName) => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Check permissions
    if (user.role === 'librarian' && userRole !== 'member') {
      showNotification('Librarians can only reset member passwords', 'error');
      return;
    }

    const newPassword = prompt(`Enter new password for ${userName} (min 6 characters):`);
    if (newPassword && newPassword.length >= 6) {
      try {
        const token = localStorage.getItem('token');
        
        const response = await axios.put(`${API_BASE_URL}/users/${userId}/password`, {
          new_password: newPassword
        }, {
          headers: { 
            'Content-Type': 'application/json',
            'x-auth-token': token 
          }
        });
        
        showNotification('Password reset successfully', 'success');
        console.log('Password reset response:', response.data);
      } catch (error) {
        console.error('Error resetting password:', error);
        showNotification('Error resetting password: ' + (error.response?.data?.message || error.message), 'error');
      }
    } else if (newPassword) {
      showNotification('Password must be at least 6 characters long', 'error');
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role
    });
    setShowForm(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Don't allow role escalation unless admin
      const currentUser = JSON.parse(localStorage.getItem('user'));
      if (formData.role === 'librarian' && currentUser.role !== 'admin') {
        showNotification('Only admins can create librarian accounts', 'error');
        return;
      }

      await axios.put(`${API_BASE_URL}/users/${editingUser.id}`, formData, {
        headers: { 'x-auth-token': token }
      });
      
      setShowForm(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'member' });
      fetchUsers();
      showNotification('User updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('Error updating user: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilter = (e) => {
    setFilterRole(e.target.value);
  };

  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = filterRole === 'all' || user.role === filterRole;
      return matchesSearch && matchesRole;
    })
    .sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });

  const isAdmin = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.role === 'admin';
  };

  const showNotification = (message, type) => {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg text-white transform transition-transform duration-300 ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.add('translate-x-0');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('translate-x-0');
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const RoleBadge = ({ role }) => {
    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      librarian: 'bg-blue-100 text-blue-800',
      member: 'bg-green-100 text-green-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${roleColors[role]}`}>
        {role}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg mb-8 overflow-hidden transition-all duration-300">
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
          <button 
            onClick={() => {
              setShowForm(!showForm);
              setEditingUser(null);
              setFormData({ name: '', email: '', password: '', role: 'member' });
            }}
            className="bg-gradient-to-r from-primary to-secondary text-white px-4 py-2 rounded-lg hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 flex items-center"
          >
            <span className="mr-2">{showForm ? '✕ Cancel' : '+'}</span>
            {showForm ? '' : 'Add New User'}
          </button>
        </div>
        
        <div className="mt-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            value={filterRole}
            onChange={handleFilter}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="librarian">Librarian</option>
            <option value="member">Member</option>
          </select>
        </div>
      </div>

      {showForm && (
        <div className="p-6 border-b border-gray-200 bg-blue-50 animate-fadeIn">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">
            {editingUser ? `Edit ${editingUser.name}` : 'Create New User'}
          </h3>
          <form onSubmit={editingUser ? handleUpdateUser : onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300"
                  value={formData.name}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300"
                  value={formData.email}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {editingUser ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  name="password"
                  minLength="6"
                  required={!editingUser}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300"
                  value={formData.password}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role *</label>
                <select
                  name="role"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors duration-300"
                  value={formData.role}
                  onChange={onChange}
                  disabled={!isAdmin() || (editingUser && editingUser.role === 'admin')}
                >
                  <option value="member">Member</option>
                  <option value="librarian">Librarian</option>
                  {isAdmin() && <option value="admin">Admin</option>}
                </select>
                {!isAdmin() && (
                  <p className="text-sm text-gray-500 mt-1">Only admins can create librarians</p>
                )}
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors duration-300 transform hover:-translate-y-1"
              >
                {editingUser ? 'Update User' : 'Create User'}
              </button>
              {editingUser && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingUser(null);
                    setFormData({ name: '', email: '', password: '', role: 'member' });
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-300"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      <div className="p-6">
        {filteredAndSortedUsers.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['name', 'email', 'role', 'joined'].map((key) => (
                    <th 
                      key={key}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors duration-150"
                      onClick={() => handleSort(key === 'joined' ? 'created_at' : key)}
                    >
                      <div className="flex items-center">
                        {key === 'joined' ? 'Joined Date' : key.charAt(0).toUpperCase() + key.slice(1)}
                        <svg className={`h-4 w-4 ml-1 ${sortConfig.key === (key === 'joined' ? 'created_at' : key) ? 'text-gray-700' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          {sortConfig.direction === 'ascending' ? (
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          ) : (
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          )}
                        </svg>
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-150 transform hover:scale-110"
                          title="Edit User"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handlePasswordReset(user.id, user.role, user.name)}
                          className="text-indigo-600 hover:text-indigo-800 transition-colors duration-150 transform hover:scale-110"
                          title="Reset Password"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => deleteUser(user.id, user.name)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-150 transform hover:scale-110"
                          title="Delete User"
                          disabled={user.role === 'admin' && !isAdmin()}
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{filteredAndSortedUsers.length}</span> of <span className="font-medium">{users.length}</span> users
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default UserManagement;