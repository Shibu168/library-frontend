import React, { useState, useEffect } from 'react';
import axios from 'axios';

const IssueReturn = () => {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [actionType, setActionType] = useState('issue');
  const [formData, setFormData] = useState({
    book_id: '',
    member_id: '',
    due_date: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching data for Issue/Return...');
      const token = localStorage.getItem('token');
      
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://your-production-domain.com/api' 
        : 'http://localhost:5000/api';

      const [booksRes, membersRes, issuedRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/books`, { 
          headers: { 'x-auth-token': token } 
        }),
        axios.get(`${API_BASE_URL}/users?role=member`, { 
          headers: { 'x-auth-token': token } 
        }),
        axios.get(`${API_BASE_URL}/issued-books`, { 
          headers: { 'x-auth-token': token } 
        })
      ]);

      console.log('Books:', booksRes.data);
      console.log('Members:', membersRes.data);
      console.log('Issued Books:', issuedRes.data);

      setBooks(booksRes.data);
      setMembers(membersRes.data);
      setIssuedBooks(issuedRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      console.error('Error response:', error.response);
    } finally {
      setLoading(false);
    }
  };

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleIssue = async e => {
    e.preventDefault();
    try {
      console.log('Issuing book with data:', formData);
      const token = localStorage.getItem('token');
      
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://your-production-domain.com/api' 
        : 'http://localhost:5000/api';

      const response = await axios.post(`${API_BASE_URL}/issued-books`, formData, {
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        }
      });
      
      console.log('Issue successful:', response.data);
      alert('Book issued successfully!');
      setFormData({ book_id: '', member_id: '', due_date: '' });
      fetchData();
    } catch (error) {
      console.error('Error issuing book:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Error issuing book. Please try again.');
      }
    }
  };

  const handleReturn = async (issueId) => {
    try {
      console.log('Returning book with ID:', issueId);
      const token = localStorage.getItem('token');
      
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://your-production-domain.com/api' 
        : 'http://localhost:5000/api';

      const response = await axios.put(`${API_BASE_URL}/issued-books/${issueId}/return`, {}, {
        headers: { 'x-auth-token': token }
      });
      
      console.log('Return successful:', response.data);
      alert('Book returned successfully!');
      fetchData();
    } catch (error) {
      console.error('Error returning book:', error);
      console.error('Error response:', error.response);
      
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert('Error returning book. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Issue / Return Books</h2>
        <p className="text-sm text-gray-600 mt-1">
          Books: {books.length} | Members: {members.length} | Issued Books: {issuedBooks.filter(b => !b.return_date).length}
        </p>
      </div>

      <div className="p-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActionType('issue')}
            className={`px-4 py-2 rounded ${
              actionType === 'issue' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Issue Book
          </button>
          <button
            onClick={() => setActionType('return')}
            className={`px-4 py-2 rounded ${
              actionType === 'return' 
                ? 'bg-primary text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Return Book
          </button>
        </div>

        {actionType === 'issue' && (
          <form onSubmit={handleIssue} className="space-y-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Book</label>
                <select
                  name="book_id"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                  value={formData.book_id}
                  onChange={onChange}
                >
                  <option value="">Select a book</option>
                  {books.filter(book => book.available_copies > 0).map(book => (
                    <option key={book.id} value={book.id}>
                      {book.title} (Available: {book.available_copies})
                    </option>
                  ))}
                </select>
                {books.filter(book => book.available_copies > 0).length === 0 && (
                  <p className="text-sm text-red-600 mt-1">No available books</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Member</label>
                <select
                  name="member_id"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                  value={formData.member_id}
                  onChange={onChange}
                >
                  <option value="">Select a member</option>
                  {members.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.email})
                    </option>
                  ))}
                </select>
                {members.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">No members found</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  name="due_date"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                  value={formData.due_date}
                  onChange={onChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary disabled:opacity-50"
              disabled={books.filter(book => book.available_copies > 0).length === 0 || members.length === 0}
            >
              Issue Book
            </button>
          </form>
        )}

        <div>
          <h3 className="text-lg font-semibold mb-4">Currently Issued Books</h3>
          {issuedBooks.filter(book => !book.return_date).length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No currently issued books.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {issuedBooks.filter(book => !book.return_date).map(book => (
                    <tr key={book.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{book.title}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book.member_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(book.issue_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(book.due_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleReturn(book.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Return
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueReturn;