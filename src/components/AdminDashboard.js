import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import BookManagement from './admin/BookManagement';
import UserManagement from './admin/UserManagement';
import Reports from './admin/Reports';
import SystemSettings from './admin/SystemSettings';
import Sidebar from './Sidebar';
import axios from 'axios';

// Define StatCard component outside the main component to make it reusable
const StatCard = ({ title, value, icon, color, onClick, trend }) => (
  <div 
    className={`relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 cursor-pointer group overflow-hidden`}
    onClick={onClick}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100 dark:from-gray-800 dark:to-gray-900 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    <div className="relative z-10 flex items-center">
      <div className={`p-4 rounded-2xl ${color} bg-opacity-10 mr-5 transform group-hover:scale-110 transition-transform duration-500`}>
        <i className={`${icon} text-2xl ${color}`}></i>
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors duration-300">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{value}</h3>
        {trend && (
          <div className={`flex items-center mt-2 text-xs ${trend.value > 0 ? 'text-green-500' : 'text-red-500'}`}>
            <i className={`fas ${trend.value > 0 ? 'fa-arrow-up' : 'fa-arrow-down'} mr-1`}></i>
            <span>{Math.abs(trend.value)}% {trend.period}</span>
          </div>
        )}
      </div>
    </div>
    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
  </div>
);

// Dashboard Overview Component
const DashboardOverview = ({ stats, recentActivity, setActiveTab }) => {
  return (
    <div className="p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Total Books" 
          value={stats.totalBooks} 
          icon="fas fa-book" 
          color="text-blue-500"
          trend={{ value: stats.booksTrend, period: 'this month' }}
          onClick={() => setActiveTab('books')}
        />
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers} 
          icon="fas fa-users" 
          color="text-green-500"
          trend={{ value: stats.usersTrend, period: 'this month' }}
          onClick={() => setActiveTab('users')}
        />
        <StatCard 
          title="Books Borrowed" 
          value={stats.totalBorrowed} 
          icon="fas fa-book-open" 
          color="text-purple-500"
          trend={{ value: stats.borrowedTrend, period: 'today' }}
        />
        <StatCard 
          title="Overdue Books" 
          value={stats.overdueBooks} 
          icon="fas fa-exclamation-triangle" 
          color="text-red-500"
          trend={{ value: stats.overdueTrend, period: 'this week' }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 rounded-2xl shadow-md p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <i className="fas fa-history text-blue-500 mr-2"></i>
            Recent Activity
          </h2>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-96">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <div className={`p-3 rounded-xl mr-3 shadow-sm ${
                    activity.type === 'issue' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' :
                    activity.type === 'return' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' :
                    'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300'
                  }`}>
                    <i className={`fas ${
                      activity.type === 'issue' ? 'fa-arrow-right' :
                      activity.type === 'return' ? 'fa-arrow-left' :
                      'fa-user-plus'
                    }`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">{activity.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 flex flex-col items-center justify-center h-full">
                <i className="fas fa-inbox text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
                <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - Enhanced with equal height and more interactivity */}
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 rounded-2xl shadow-md p-6 flex flex-col">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
            <i className="fas fa-bolt text-yellow-500 mr-2"></i>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
            <button 
              className="p-4 bg-blue-50 dark:bg-blue-900 hover:bg-blue-100 dark:hover:bg-blue-800 rounded-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center group h-full"
              onClick={() => setActiveTab('books')}
            >
              <div className="p-3 bg-blue-500 rounded-xl text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-plus"></i>
              </div>
              <span className="font-medium text-blue-700 dark:text-blue-300 text-center">Add New Book</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Manage library inventory</p>
            </button>
            
            <button 
              className="p-4 bg-green-50 dark:bg-green-900 hover:bg-green-100 dark:hover:bg-green-800 rounded-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center group h-full"
              onClick={() => setActiveTab('users')}
            >
              <div className="p-3 bg-green-500 rounded-xl text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-user-plus"></i>
              </div>
              <span className="font-medium text-green-700 dark:text-green-300 text-center">Add New User</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Create member accounts</p>
            </button>
            
            <button 
              className="p-4 bg-purple-50 dark:bg-purple-900 hover:bg-purple-100 dark:hover:bg-purple-800 rounded-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center group h-full"
              onClick={() => setActiveTab('reports')}
            >
              <div className="p-3 bg-purple-500 rounded-xl text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-chart-bar"></i>
              </div>
              <span className="font-medium text-purple-700 dark:text-purple-300 text-center">Generate Report</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">View analytics & insights</p>
            </button>
            
            <button 
              className="p-4 bg-orange-50 dark:bg-orange-900 hover:bg-orange-100 dark:hover:bg-orange-800 rounded-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center group h-full"
              onClick={() => setActiveTab('settings')}
            >
              <div className="p-3 bg-orange-500 rounded-xl text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                <i className="fas fa-cog"></i>
              </div>
              <span className="font-medium text-orange-700 dark:text-orange-300 text-center">System Settings</span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">Configure preferences</p>
            </button>
          </div>
          
          {/* Additional quick stats */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="font-semibold text-blue-600 dark:text-blue-400">{stats.totalBooks}</div>
                <div className="text-gray-500 dark:text-gray-400">Total Books</div>
              </div>
              <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="font-semibold text-green-600 dark:text-green-400">{stats.totalUsers}</div>
                <div className="text-gray-500 dark:text-gray-400">Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Library Health Status */}
      <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 rounded-2xl shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <i className="fas fa-heartbeat text-red-500 mr-2"></i>
          Library Health Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Book Availability</span>
              <span className="text-sm font-bold text-green-500">{stats.availabilityRate}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats.availabilityRate}%` }}></div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Member Satisfaction</span>
              <span className="text-sm font-bold text-blue-500">{stats.satisfactionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.satisfactionRate}%` }}></div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">System Uptime</span>
              <span className="text-sm font-bold text-purple-500">{stats.uptime}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${stats.uptime}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalUsers: 0,
    totalBorrowed: 0,
    overdueBooks: 0,
    booksTrend: 0,
    usersTrend: 0,
    borrowedTrend: 0,
    overdueTrend: 0,
    availabilityRate: 0,
    satisfactionRate: 0,
    uptime: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/dashboard-stats', {
        headers: { 'x-auth-token': token }
      });
      setStats(response.data.stats);
      setRecentActivity(response.data.recentActivity);
      setNotifications(response.data.notifications);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to fetching data from individual endpoints if the dashboard endpoint fails
      fetchIndividualStats();
    }
  };

  const fetchIndividualStats = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch books data
      const booksResponse = await axios.get('/api/books/count', {
        headers: { 'x-auth-token': token }
      });
      
      // Fetch users data
      const usersResponse = await axios.get('/api/users/count', {
        headers: { 'x-auth-token': token }
      });
      
      // Fetch borrowed books data
      const borrowedResponse = await axios.get('/api/transactions/borrowed-count', {
        headers: { 'x-auth-token': token }
      });
      
      // Fetch overdue books data
      const overdueResponse = await axios.get('/api/transactions/overdue-count', {
        headers: { 'x-auth-token': token }
      });
      
      // Update stats with real data
      setStats(prev => ({
        ...prev,
        totalBooks: booksResponse.data.count || 0,
        totalUsers: usersResponse.data.count || 0,
        totalBorrowed: borrowedResponse.data.count || 0,
        overdueBooks: overdueResponse.data.count || 0
      }));
      
    } catch (error) {
      console.error('Error fetching individual stats:', error);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'books':
        return <BookManagement />;
      case 'users':
        return <UserManagement />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <SystemSettings />;
      default:
        return <DashboardOverview stats={stats} recentActivity={recentActivity} setActiveTab={setActiveTab} />;
    }
  };

  const NotificationBell = () => (
    <div className="relative" ref={notificationRef}>
      <button 
        className="relative p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
        onClick={() => setShowNotifications(!showNotifications)}
      >
        <i className="fas fa-bell text-gray-600 dark:text-gray-300"></i>
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
            {notifications.length}
          </span>
        )}
      </button>
      
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-2xl shadow-xl z-50 border border-gray-200 dark:border-gray-700 transform origin-top-right transition-all duration-300 scale-95 opacity-0 animate-fadeIn">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white">Notifications</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <div 
                  key={index} 
                  className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-200"
                >
                  <div className="flex items-start">
                    <div className={`p-2 rounded-full mr-3 ${
                      notification.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' :
                      notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300' :
                      notification.type === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' :
                      'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                    }`}>
                      <i className={`fas ${notification.icon}`}></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{notification.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.message}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">{new Date(notification.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center">
                <i className="fas fa-bell-slash text-3xl text-gray-300 dark:text-gray-600 mb-2"></i>
                <p className="text-gray-500 dark:text-gray-400">No notifications</p>
              </div>
            )}
          </div>
          <div className="p-3 border-t border-gray-100 dark:border-gray-700 text-center">
            <button className="text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
              Mark all as read
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <Sidebar 
        role="admin" 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={logout}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400">
                Admin Dashboard
              </h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                {activeTab === 'dashboard' ? 'Manage your library system efficiently' : 
                 activeTab === 'books' ? 'Manage books and inventory' :
                 activeTab === 'users' ? 'Manage users and permissions' :
                 activeTab === 'reports' ? 'View reports and analytics' :
                 'Configure system settings'}
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {/* Search Bar */}
              <div className={`relative ${isSearchFocused ? 'w-64' : 'w-48'} transition-all duration-500`}>
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 ${isSearchFocused ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}>
                  <i className="fas fa-search"></i>
                </div>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                />
                {searchTerm && (
                  <button 
                    className="absolute right-3 top-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-3 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-300"
              >
                {darkMode ? (
                  <i className="fas fa-sun text-yellow-500"></i>
                ) : (
                  <i className="fas fa-moon text-gray-600"></i>
                )}
              </button>
              
              {/* Notifications */}
              <NotificationBell />
              
              {/* User Profile */}
              <div className="flex items-center space-x-3 bg-white dark:bg-gray-800 rounded-2xl py-2 px-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 flex items-center justify-center text-white font-bold shadow-md">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;