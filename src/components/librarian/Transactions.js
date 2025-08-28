import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/issued-books', {
        headers: { 'x-auth-token': token }
      });
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    // Filter by status
    if (filter === 'active' && transaction.return_date) return false;
    if (filter === 'returned' && !transaction.return_date) return false;
    if (filter === 'overdue' && (!transaction.return_date && new Date(transaction.due_date) >= new Date())) return false;
    
    // Filter by date range
    if (startDate && new Date(transaction.issue_date) < new Date(startDate)) return false;
    if (endDate && new Date(transaction.issue_date) > new Date(endDate)) return false;
    
    return true;
  });

  const calculateFine = (dueDate, returnDate) => {
    const returnDateObj = returnDate ? new Date(returnDate) : new Date();
    const due = new Date(dueDate);
    
    if (returnDateObj > due) {
      const diffTime = Math.abs(returnDateObj - due);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays * 2; // $2 per day fine
    }
    return 0;
  };

  const getTotalStats = () => {
    const totalTransactions = transactions.length;
    const activeTransactions = transactions.filter(t => !t.return_date).length;
    const overdueTransactions = transactions.filter(t => 
      !t.return_date && new Date(t.due_date) < new Date()
    ).length;
    const totalFines = transactions.reduce((sum, t) => sum + calculateFine(t.due_date, t.return_date), 0);

    return { totalTransactions, activeTransactions, overdueTransactions, totalFines };
  };

  const stats = getTotalStats();

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
        <h2 className="text-xl font-semibold text-gray-800">Transaction History</h2>
      </div>

      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800">Total Transactions</h3>
            <p className="text-2xl font-bold text-blue-600">{stats.totalTransactions}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800">Active Issues</h3>
            <p className="text-2xl font-bold text-green-600">{stats.activeTransactions}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800">Overdue Books</h3>
            <p className="text-2xl font-bold text-red-600">{stats.overdueTransactions}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-orange-800">Total Fines</h3>
            <p className="text-2xl font-bold text-orange-600">${stats.totalFines.toFixed(2)}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Filter by Status</label>
            <select
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Transactions</option>
              <option value="active">Active Issues</option>
              <option value="returned">Returned Books</option>
              <option value="overdue">Overdue Books</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary focus:border-primary"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
                setFilter('all');
              }}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fine</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransactions.map(transaction => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.title}</div>
                    <div className="text-sm text-gray-500">by {transaction.author}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.member_name}</div>
                    <div className="text-sm text-gray-500">{transaction.member_email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.issue_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.due_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.return_date ? new Date(transaction.return_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      transaction.return_date 
                        ? 'bg-green-100 text-green-800' 
                        : new Date(transaction.due_date) < new Date() 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.return_date ? 'Returned' : new Date(transaction.due_date) < new Date() ? 'Overdue' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    ${calculateFine(transaction.due_date, transaction.return_date).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No transactions found matching your criteria.
          </div>
        )}

        {/* Export Button */}
        <div className="mt-6">
          <button
            onClick={() => {
              // Simple CSV export functionality
              const csvContent = [
                ['Book Title', 'Author', 'Member', 'Issue Date', 'Due Date', 'Return Date', 'Status', 'Fine'],
                ...filteredTransactions.map(t => [
                  t.title,
                  t.author,
                  t.member_name,
                  new Date(t.issue_date).toLocaleDateString(),
                  new Date(t.due_date).toLocaleDateString(),
                  t.return_date ? new Date(t.return_date).toLocaleDateString() : '',
                  t.return_date ? 'Returned' : new Date(t.due_date) < new Date() ? 'Overdue' : 'Active',
                  `$${calculateFine(t.due_date, t.return_date).toFixed(2)}`
                ])
              ].map(row => row.join(',')).join('\n');

              const blob = new Blob([csvContent], { type: 'text/csv' });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'transactions.csv';
              a.click();
              window.URL.revokeObjectURL(url);
            }}
            className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded"
          >
            Export to CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default Transactions;