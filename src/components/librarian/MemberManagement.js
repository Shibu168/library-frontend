import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PasswordEditModal from '../PasswordEditModal';
import CreateMember from './CreateMember';

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [activeTab, setActiveTab] = useState('manage'); // 'create' or 'manage'

  const API_BASE_URL = process.env.NODE_ENV === 'production' 
    ? 'https://your-production-domain.com/api' 
    : 'http://localhost:5000/api';

  useEffect(() => {
    if (activeTab === 'manage') {
      fetchMembers();
    }
  }, [activeTab]);

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/users?role=member`, {
        headers: { 'x-auth-token': token }
      });
      setMembers(response.data);
    } catch (error) {
      console.error('Error fetching members:', error);
      alert('Error fetching members: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEditPassword = (member) => {
    setSelectedMember(member);
    setEditModalOpen(true);
  };

  const handlePasswordUpdated = () => {
    fetchMembers(); // Refresh the list
  };

  const handleMemberCreated = () => {
    setActiveTab('manage'); // Switch to manage tab after creation
    fetchMembers(); // Refresh the member list
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'create':
        return <CreateMember onMemberCreated={handleMemberCreated} />;
      case 'manage':
        return renderMemberList();
      default:
        return renderMemberList();
    }
  };

  const renderMemberList = () => {
    if (loading) {
      return (
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      );
    }

    return (
      <>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {members.map(member => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      onClick={() => handleEditPassword(member)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                      title="Edit Password"
                    >
                      <i className="fas fa-edit"></i> Edit Password
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {members.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No members found. <button 
              onClick={() => setActiveTab('create')}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Create your first member
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Member Management</h2>
          
          {/* Tab Navigation */}
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('manage')}
              className={`px-4 py-2 rounded ${
                activeTab === 'manage' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Manage Members
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-2 rounded ${
                activeTab === 'create' 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Create Member
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {renderContent()}
      </div>

      <PasswordEditModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={selectedMember}
        onPasswordUpdated={handlePasswordUpdated}
      />
    </div>
  );
};

export default MemberManagement;