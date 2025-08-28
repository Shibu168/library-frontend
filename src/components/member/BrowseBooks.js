import React, { useState, useEffect } from 'react';
import axios from 'axios';
const requestBook = async (bookId) => {
  try {
    console.log('Requesting book with ID:', bookId);
    const token = localStorage.getItem('token');
    console.log('Token available:', !!token);
    
    const API_BASE_URL = process.env.NODE_ENV === 'production' 
      ? 'https://your-production-domain.com/api' 
      : 'http://localhost:5000/api';

    const response = await axios.post(`${API_BASE_URL}/book-requests`, 
      { book_id: bookId }, 
      {
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        }
      }
    );
    
    console.log('Request successful:', response.data);
    alert('Book request submitted successfully! The librarian will process your request.');
    
  } catch (error) {
    console.error('Error requesting book:', error);
    console.error('Error response:', error.response);
    
    if (error.response?.data?.message) {
      alert(`Error: ${error.response.data.message}`);
    } else if (error.response?.status === 404) {
      alert('Error: API endpoint not found. Please check if the server is running.');
    } else if (error.response?.status === 500) {
      alert('Error: Server error. Please check the server logs.');
    } else {
      alert('Error requesting book. Please try again.');
    }
  }
};

const BrowseBooks = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/books', {
        headers: { 'x-auth-token': token }
      });
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(books.map(book => book.category))];

  const requestBook = async (bookId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/book-requests', { book_id: bookId }, {
        headers: { 'x-auth-token': token }
      });
      alert('Book request submitted successfully!');
    } catch (error) {
      console.error('Error requesting book:', error);
      alert('Error requesting book');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Browse Books</h2>
      </div>

      <div className="p-6">
        {/* Search and Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Search Books</label>
            <input
              type="text"
              placeholder="Search by title or author..."
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Filter by Category</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map(book => (
            <div key={book.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <h3 className="font-semibold text-lg mb-2">{book.title}</h3>
              <p className="text-gray-600 mb-2">by {book.author}</p>
              <p className="text-sm text-gray-500 mb-2">Category: {book.category}</p>
              <p className="text-sm text-gray-500 mb-2">ISBN: {book.isbn}</p>
              <p className="text-sm text-gray-500 mb-4">Rack: {book.rack_no}</p>
              
              <div className="flex justify-between items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  book.available_copies > 0 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {book.available_copies > 0 ? 'Available' : 'Out of Stock'}
                </span>
                
                <button
                  onClick={() => requestBook(book.id)}
                  disabled={book.available_copies === 0}
                  className={`px-3 py-1 rounded text-sm ${
                    book.available_copies > 0
                      ? 'bg-primary text-white hover:bg-secondary'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Request Book
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredBooks.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No books found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseBooks;