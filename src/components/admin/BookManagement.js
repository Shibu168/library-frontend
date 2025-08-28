import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    rack_no: '',
    total_copies: 1
  });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    filterBooks();
  }, [books, searchTerm]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/books', {
        headers: { 'x-auth-token': token }
      });
      setBooks(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to fetch books');
      setLoading(false);
    }
  };

  const filterBooks = () => {
    let result = books;
    
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(book => 
        book.title.toLowerCase().includes(lowerSearch) ||
        book.author.toLowerCase().includes(lowerSearch) ||
        book.isbn.toLowerCase().includes(lowerSearch) ||
        book.category.toLowerCase().includes(lowerSearch)
      );
    }
    
    setFilteredBooks(result);
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.author.trim()) errors.author = 'Author is required';
    if (!formData.isbn.trim()) errors.isbn = 'ISBN is required';
    if (!/^\d{10,13}$/.test(formData.isbn.replace(/-/g, ''))) errors.isbn = 'ISBN must be 10-13 digits';
    if (!formData.category.trim()) errors.category = 'Category is required';
    if (!formData.rack_no.trim()) errors.rack_no = 'Rack number is required';
    if (formData.total_copies < 1) errors.total_copies = 'Must have at least 1 copy';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: '' });
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the form errors');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingBook) {
        await axios.put(`/api/books/${editingBook.id}`, formData, {
          headers: { 'x-auth-token': token }
        });
        toast.success('Book updated successfully');
      } else {
        await axios.post('/api/books', formData, {
          headers: { 'x-auth-token': token }
        });
        toast.success('Book added successfully');
      }
      
      resetForm();
      fetchBooks();
    } catch (error) {
      console.error('Error saving book:', error);
      toast.error(error.response?.data?.message || 'Error saving book');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: '',
      rack_no: '',
      total_copies: 1
    });
    setFormErrors({});
    setEditingBook(null);
    setShowAddForm(false);
  };

  const editBook = (book) => {
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      rack_no: book.rack_no,
      total_copies: book.total_copies
    });
    setEditingBook(book);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteBook = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/books/${id}`, {
        headers: { 'x-auth-token': token }
      });
      toast.success('Book deleted successfully');
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    }
  };

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    
    // Sort the books
    const sortedBooks = [...filteredBooks].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'ascending' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    setFilteredBooks(sortedBooks);
  };

  const getHeaderClass = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? 'sort-asc' : 'sort-desc';
    }
    return '';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <h2 className="text-2xl font-bold text-gray-800">Book Management</h2>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search books..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
            </div>
            
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors flex items-center justify-center space-x-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              <span>{showAddForm ? 'Cancel' : 'Add Book'}</span>
            </button>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="p-6 border-b border-gray-200 bg-blue-50">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-800">
              {editingBook ? 'Edit Book' : 'Add New Book'}
            </h3>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  name="title"
                  required
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.title}
                  onChange={onChange}
                />
                {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
                <input
                  type="text"
                  name="author"
                  required
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.author ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.author}
                  onChange={onChange}
                />
                {formErrors.author && <p className="mt-1 text-sm text-red-600">{formErrors.author}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ISBN *</label>
                <input
                  type="text"
                  name="isbn"
                  required
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.isbn ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.isbn}
                  onChange={onChange}
                />
                {formErrors.isbn && <p className="mt-1 text-sm text-red-600">{formErrors.isbn}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                <input
                  type="text"
                  name="category"
                  required
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.category}
                  onChange={onChange}
                />
                {formErrors.category && <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rack Number *</label>
                <input
                  type="text"
                  name="rack_no"
                  required
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.rack_no ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.rack_no}
                  onChange={onChange}
                />
                {formErrors.rack_no && <p className="mt-1 text-sm text-red-600">{formErrors.rack_no}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Copies *</label>
                <input
                  type="number"
                  name="total_copies"
                  required
                  min="1"
                  className={`mt-1 block w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                    formErrors.total_copies ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={formData.total_copies}
                  onChange={onChange}
                />
                {formErrors.total_copies && <p className="mt-1 text-sm text-red-600">{formErrors.total_copies}</p>}
              </div>
            </div>
            
            <div className="flex space-x-3 pt-2">
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
              >
                {editingBook ? 'Update Book' : 'Add Book'}
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="p-6">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No books found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? 'Try adjusting your search term' : 'Get started by adding a new book'}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <button
                  onClick={() => setShowAddForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Add New Book
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${getHeaderClass('title')}`}
                    onClick={() => requestSort('title')}
                  >
                    Title
                  </th>
                  <th 
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${getHeaderClass('author')}`}
                    onClick={() => requestSort('author')}
                  >
                    Author
                  </th>
                  <th 
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${getHeaderClass('isbn')}`}
                    onClick={() => requestSort('isbn')}
                  >
                    ISBN
                  </th>
                  <th 
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${getHeaderClass('category')}`}
                    onClick={() => requestSort('category')}
                  >
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th 
                    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${getHeaderClass('rack_no')}`}
                    onClick={() => requestSort('rack_no')}
                  >
                    Rack No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBooks.map(book => (
                  <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{book.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{book.author}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{book.isbn}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {book.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            book.available_copies === 0 ? 'bg-red-600' : 
                            book.available_copies / book.total_copies < 0.2 ? 'bg-yellow-500' : 'bg-green-600'
                          }`}
                          style={{ width: `${(book.available_copies / book.total_copies) * 100}%` }}
                        ></div>
                      </div>
                      <span className={`text-xs font-medium ${
                        book.available_copies === 0 ? 'text-red-600' : 
                        book.available_copies / book.total_copies < 0.2 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {book.available_copies} / {book.total_copies}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">{book.rack_no}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => editBook(book)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => deleteBook(book.id, book.title)}
                        className="text-red-600 hover:text-red-900 transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {!loading && filteredBooks.length > 0 && (
          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredBooks.length} of {books.length} books
            {searchTerm && <span> for "<strong>{searchTerm}</strong>"</span>}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookManagement;