import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyBooks = ({ onPayFine }) => { // Add onPayFine prop
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyBooks();
  }, []);

  const fetchMyBooks = async () => {
    try {
      setError('');
      const token = localStorage.getItem('token');
      
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://your-production-domain.com/api' 
        : 'http://localhost:5000/api';
      
      const response = await axios.get(`${API_BASE_URL}/my-books`, {
        headers: { 'x-auth-token': token }
      });
      
      setIssuedBooks(response.data);
    } catch (error) {
      console.error('Error fetching my books:', error);
      setError('Failed to load your books. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateFine = (dueDate, returnDate) => {
    const today = returnDate ? new Date(returnDate) : new Date();
    const due = new Date(dueDate);
    
    if (today > due) {
      const diffTime = Math.abs(today - due);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays * 2; // $2 per day fine
    }
    return 0;
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

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchMyBooks}
          className="bg-primary text-white px-4 py-2 rounded hover:bg-secondary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">My Borrowed Books</h2>
      </div>

      <div className="p-6">
        {issuedBooks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg mb-2">You haven't borrowed any books yet.</p>
            <p className="text-sm">Go to the Browse Books section to request books.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fine</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issuedBooks.map(book => (
                  <tr key={book.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{book.title}</div>
                      <div className="text-sm text-gray-500">{book.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(book.issue_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(book.due_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        book.return_date 
                          ? 'bg-green-100 text-green-800' 
                          : new Date(book.due_date) < new Date() 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {book.return_date ? 'Returned' : new Date(book.due_date) < new Date() ? 'Overdue' : 'Borrowed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      ${calculateFine(book.due_date, book.return_date).toFixed(2)}
                      {book.fine_paid && <span className="text-green-600 ml-1">(Paid)</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {!book.return_date && new Date(book.due_date) < new Date() && !book.fine_paid && (
                        <button
                          onClick={() => onPayFine(book)}
                          className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                        >
                          Pay Fine
                        </button>
                      )}
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

export default MyBooks;