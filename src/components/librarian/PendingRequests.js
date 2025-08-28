import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://your-production-domain.com/api' 
        : 'http://localhost:5000/api';
      
      const response = await axios.get(`${API_BASE_URL}/book-requests`, {
        headers: { 'x-auth-token': token }
      });
      
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveRequest = async (requestId, bookId, memberId) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://your-production-domain.com/api' 
        : 'http://localhost:5000/api';
      
      // Calculate due date (2 weeks from now)
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14);
      
      // Issue the book
      await axios.post(`${API_BASE_URL}/issued-books`, {
        book_id: bookId,
        member_id: memberId,
        due_date: dueDate.toISOString().split('T')[0]
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        }
      });
      
      // Update request status
      await axios.put(`${API_BASE_URL}/book-requests/${requestId}`, {
        status: 'approved'
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        }
      });
      
      alert('Book request approved and issued successfully!');
      fetchPendingRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Error approving request: ' + (error.response?.data?.message || error.message));
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://your-production-domain.com/api' 
        : 'http://localhost:5000/api';
      
      // Update request status
      await axios.put(`${API_BASE_URL}/book-requests/${requestId}`, {
        status: 'rejected'
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        }
      });
      
      alert('Book request rejected successfully!');
      fetchPendingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Error rejecting request: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) {
    return <div className="bg-white rounded-lg shadow p-6">Loading pending requests...</div>;
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Pending Book Requests</h2>
      </div>

      <div className="p-6">
        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No pending book requests.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requests.map(request => (
                  <tr key={request.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{request.title}</div>
                      <div className="text-sm text-gray-500">by {request.author}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{request.member_name}</div>
                      <div className="text-sm text-gray-500">{request.member_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.request_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => approveRequest(request.id, request.book_id, request.member_id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => rejectRequest(request.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingRequests;