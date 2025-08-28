import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    rack_no: '',
    total_copies: 1
  });

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

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/books', formData, {
        headers: { 'x-auth-token': token }
      });
      setShowAddForm(false);
      setFormData({
        title: '',
        author: '',
        isbn: '',
        category: '',
        rack_no: '',
        total_copies: 1
      });
      fetchBooks();
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Book Inventory</h2>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary"
          >
            {showAddForm ? 'Cancel' : 'Add New Book'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="p-6 border-b border-gray-200">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                  value={formData.title}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Author *</label>
                <input
                  type="text"
                  name="author"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                  value={formData.author}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">ISBN *</label>
                <input
                  type="text"
                  name="isbn"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                  value={formData.isbn}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Category *</label>
                <input
                  type="text"
                  name="category"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                  value={formData.category}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rack Number *</label>
                <input
                  type="text"
                  name="rack_no"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                  value={formData.rack_no}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Copies *</label>
                <input
                  type="number"
                  name="total_copies"
                  required
                  min="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
                  value={formData.total_copies}
                  onChange={onChange}
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary"
            >
              Add Book
            </button>
          </form>
        </div>
      )}

      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ISBN</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rack No</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {books.map(book => (
                <tr key={book.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{book.title}</div>
                    <div className="text-sm text-gray-500">{book.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.author}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.isbn}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      book.available_copies > 0 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {book.available_copies} / {book.total_copies}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.rack_no}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookManagement;