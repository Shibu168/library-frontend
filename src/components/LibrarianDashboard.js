import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BookManagement from './librarian/BookManagement';
import IssueReturn from './librarian/IssueReturn';
import Transactions from './librarian/Transactions';
import MemberManagement from './librarian/MemberManagement';
import Sidebar from './Sidebar';
import PendingRequests from './librarian/PendingRequests';

const LibrarianDashboard = () => {
  const [activeTab, setActiveTab] = useState('books');
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'books':
        return <BookManagement />;
      case 'issue-return':
        return <IssueReturn />;
      case 'transactions':
        return <Transactions />;
      case 'members':
        return <MemberManagement />;
      case 'pending-requests':
        return <PendingRequests />;
      default:
        return <BookManagement />;
    }
  };

  // Tab change with loading indicator
  const handleTabChange = (tab) => {
    setIsLoading(true);
    setActiveTab(tab);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Sidebar 
        role="librarian" 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        onLogout={logout}
      />
      
      <div className="flex-1 overflow-auto transition-all duration-300">
        <div className="p-6 md:p-8">
          {/* Enhanced Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 p-4 bg-white rounded-xl shadow-sm transition-all hover:shadow-md">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
                <span className="mr-2">📚</span> Librarian Dashboard
                <span className="ml-3 text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
                  {activeTab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              </h1>
              <p className="text-gray-600 mt-1">Manage library resources and operations</p>
            </div>
            <div className="mt-4 md:mt-0 text-right bg-blue-50 p-3 rounded-lg">
              <p className="text-gray-700 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                Welcome, <span className="font-semibold ml-1">{user?.name}</span>
              </p>
              <p className="text-sm text-gray-500 flex items-center">
                <span className="mr-1">👤</span> Role: Librarian
              </p>
            </div>
          </div>
          
          {/* Loading indicator */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-200 rounded-full mb-4"></div>
                <div className="h-4 bg-blue-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-blue-200 rounded w-24"></div>
              </div>
            </div>
          ) : (
            <div className="transition-opacity duration-300 opacity-100">
              {renderContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibrarianDashboard;