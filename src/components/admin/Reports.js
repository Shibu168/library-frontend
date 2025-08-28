import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Reports = () => {
  const [issuedBooks, setIssuedBooks] = useState([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalMembers: 0,
    issuedBooks: 0,
    overdueBooks: 0
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch issued books with date range
      const issuedResponse = await axios.get(`/api/issued-books?start=${dateRange.start}&end=${dateRange.end}`, {
        headers: { 'x-auth-token': token }
      });
      setIssuedBooks(issuedResponse.data);

      // Fetch statistics
      const booksResponse = await axios.get('/api/books', {
        headers: { 'x-auth-token': token }
      });
      
      const usersResponse = await axios.get('/api/users', {
        headers: { 'x-auth-token': token }
      });

      const overdueCount = issuedResponse.data.filter(book => 
        new Date(book.due_date) < new Date() && !book.return_date
      ).length;

      setStats({
        totalBooks: booksResponse.data.length,
        totalMembers: usersResponse.data.filter(u => u.role === 'member').length,
        issuedBooks: issuedResponse.data.length,
        overdueBooks: overdueCount
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleQuickDateRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    
    setDateRange({
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0]
    });
    setIsDatePickerOpen(false);
  };

  const exportToCSV = () => {
    // Simple CSV export functionality
    const headers = ['Book Title', 'Author', 'Member', 'Issue Date', 'Due Date', 'Return Date', 'Status'];
    const csvData = filteredAndSortedBooks.map(book => [
      `"${book.title}"`,
      `"${book.author}"`,
      `"${book.member_name}"`,
      new Date(book.issue_date).toLocaleDateString(),
      new Date(book.due_date).toLocaleDateString(),
      book.return_date ? new Date(book.return_date).toLocaleDateString() : 'Not Returned',
      book.return_date ? 'Returned' : new Date(book.due_date) < new Date() ? 'Overdue' : 'Issued'
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `library-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Report exported successfully');
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      returned: { color: 'bg-green-100 text-green-800', text: 'Returned' },
      overdue: { color: 'bg-red-100 text-red-800', text: 'Overdue' },
      issued: { color: 'bg-yellow-100 text-yellow-800', text: 'Issued' }
    };
    
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig[status].color}`}>
        {statusConfig[status].text}
      </span>
    );
  };

  const StatCard = ({ title, value, color, icon, onClick }) => (
    <div 
      className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${color} bg-opacity-20`}>
          {icon}
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  // Filter and sort books based on user input
  const filteredAndSortedBooks = useMemo(() => {
    let filtered = issuedBooks.filter(book => {
      const matchesSearch = 
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.member_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        selectedStatus === 'all' ||
        (selectedStatus === 'returned' && book.return_date) ||
        (selectedStatus === 'overdue' && new Date(book.due_date) < new Date() && !book.return_date) ||
        (selectedStatus === 'issued' && !book.return_date && new Date(book.due_date) >= new Date());
      
      return matchesSearch && matchesStatus;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [issuedBooks, searchQuery, selectedStatus, sortConfig]);

  const getHeaderClass = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? 'sort-asc' : 'sort-desc';
    }
    return '';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Library Reports</h2>
            <p className="text-gray-600">Track library activities and statistics</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full md:w-auto">
            <div className="relative flex gap-2">
              <button 
                className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-300 flex items-center"
                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Quick Select
              </button>
              
              {isDatePickerOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-200">
                  <div className="py-1">
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleQuickDateRange(7)}
                    >
                      Last 7 days
                    </button>
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleQuickDateRange(30)}
                    >
                      Last 30 days
                    </button>
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => handleQuickDateRange(90)}
                    >
                      Last 90 days
                    </button>
                    <button 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => {
                        const start = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
                        setDateRange({
                          start: start.toISOString().split('T')[0],
                          end: new Date().toISOString().split('T')[0]
                        });
                        setIsDatePickerOpen(false);
                      }}
                    >
                      This month
                    </button>
                  </div>
                </div>
              )}
              
              <input
                type="date"
                name="start"
                value={dateRange.start}
                onChange={handleDateChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <span className="self-center text-gray-500">to</span>
              <input
                type="date"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            <button
              onClick={exportToCSV}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors duration-300 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {['overview', 'issued-books', 'overdue-books', 'popular-books'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 text-sm font-medium whitespace-nowrap ${
                activeTab === tab
                  ? 'border-b-2 border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Books"
            value={stats.totalBooks}
            color="text-blue-500"
            icon={
              <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            onClick={() => {
              setActiveTab('overview');
              document.getElementById('stats-cards').scrollIntoView({ behavior: 'smooth' });
            }}
          />
          <StatCard
            title="Total Members"
            value={stats.totalMembers}
            color="text-green-500"
            icon={
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            }
            onClick={() => {
              setActiveTab('overview');
              document.getElementById('stats-cards').scrollIntoView({ behavior: 'smooth' });
            }}
          />
          <StatCard
            title="Issued Books"
            value={stats.issuedBooks}
            color="text-yellow-500"
            icon={
              <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
            onClick={() => setActiveTab('issued-books')}
          />
          <StatCard
            title="Overdue Books"
            value={stats.overdueBooks}
            color="text-red-500"
            icon={
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            onClick={() => setActiveTab('overdue-books')}
          />
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow-md flex flex-col sm:flex-row gap-4 items-center mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search books, authors, or members..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <select 
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">All</option>
              <option value="issued">Issued</option>
              <option value="overdue">Overdue</option>
              <option value="returned">Returned</option>
            </select>
          </div>
          
          <button 
            className="text-gray-600 hover:text-gray-800 flex items-center"
            onClick={() => {
              setSearchQuery('');
              setSelectedStatus('all');
              setSortConfig({ key: null, direction: 'ascending' });
            }}
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset Filters
          </button>
        </div>

        {/* Issued Books Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Issued Books</h2>
            <span className="text-sm text-gray-500">
              {filteredAndSortedBooks.length} records found
              {filteredAndSortedBooks.length !== issuedBooks.length && ` (filtered from ${issuedBooks.length} total)`}
            </span>
          </div>
          <div className="p-6">
            {filteredAndSortedBooks.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No books match your search</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search terms.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto rounded-lg shadow">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {['title', 'member_name', 'issue_date', 'due_date', 'status'].map((key) => {
                          const columnNames = {
                            title: 'Book',
                            member_name: 'Member',
                            issue_date: 'Issue Date',
                            due_date: 'Due Date',
                            status: 'Status'
                          };
                          
                          return (
                            <th 
                              key={key}
                              className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${getHeaderClass(key)}`}
                              onClick={() => handleSort(key)}
                            >
                              <div className="flex items-center">
                                {columnNames[key]}
                                {sortConfig.key === key && (
                                  <svg 
                                    className={`h-4 w-4 ml-1 ${sortConfig.direction === 'ascending' ? '' : 'transform rotate-180'}`} 
                                    fill="currentColor" 
                                    viewBox="0 0 20 20"
                                  >
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAndSortedBooks.slice(0, 10).map(book => (
                        <tr key={book.id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-sm flex items-center justify-center text-blue-800 font-bold">
                                {book.title.charAt(0)}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{book.title}</div>
                                <div className="text-sm text-gray-500">by {book.author}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{book.member_name}</div>
                            <div className="text-sm text-gray-500">{book.member_email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(book.issue_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(book.due_date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={
                              book.return_date 
                                ? 'returned' 
                                : new Date(book.due_date) < new Date() 
                                  ? 'overdue' 
                                  : 'issued'
                            } />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {filteredAndSortedBooks.length > 10 && (
                  <div className="mt-4 flex justify-between items-center">
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">10</span> of <span className="font-medium">{filteredAndSortedBooks.length}</span> results
                    </p>
                    <button className="text-primary hover:text-secondary font-medium flex items-center">
                      View All Results
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Additional Charts/Graphs Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Books Issued by Day</h3>
              <button className="text-sm text-primary hover:text-secondary">View details</button>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="animate-pulse flex space-x-2">
                <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Popular Categories</h3>
              <button className="text-sm text-primary hover:text-secondary">View details</button>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="animate-pulse flex space-x-2">
                <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
                <div className="h-3 w-3 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;