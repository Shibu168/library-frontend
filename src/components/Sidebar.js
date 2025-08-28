import React from 'react';

const Sidebar = ({ role, activeTab, setActiveTab, onLogout }) => {
  const getMenuItems = () => {
    switch (role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
          { id: 'books', label: 'Book Management', icon: 'fas fa-book' },
          { id: 'users', label: 'User Management', icon: 'fas fa-users-cog' },
          { id: 'reports', label: 'Reports & Analytics', icon: 'fas fa-chart-bar' },
          { id: 'settings', label: 'System Settings', icon: 'fas fa-cog' },
        ];
      case 'librarian':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
          { id: 'books', label: 'Books Inventory', icon: 'fas fa-book' },
          { id: 'issue-return', label: 'Issue/Return', icon: 'fas fa-exchange-alt' },
          { id: 'pending-requests', label: 'Pending Requests', icon: 'fas fa-clock' },
          { id: 'transactions', label: 'Transactions', icon: 'fas fa-history' },
          { id: 'members', label: 'Member Management', icon: 'fas fa-user-friends' },
          { id: 'fines', label: 'Fine Collection', icon: 'fas fa-money-bill-wave' },
        ];
      case 'member':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
          { id: 'browse', label: 'Browse Books', icon: 'fas fa-book-open' },
          { id: 'my-books', label: 'My Books', icon: 'fas fa-book' },
          { id: 'fines', label: 'My Fines', icon: 'fas fa-money-bill-alt' },
          { id: 'history', label: 'History', icon: 'fas fa-history' },
          { id: 'profile', label: 'My Profile', icon: 'fas fa-user' },
        ];
      default:
        return [];
    }
  };

  return (
    <div className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white h-screen shadow-xl flex flex-col">
      <div className="p-5 bg-gray-900 border-b border-gray-700">
        <h1 className="text-xl font-bold flex items-center">
          <i className="fas fa-book-reader mr-2 text-blue-400"></i>
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            LibrarySystem
          </span>
        </h1>
        <div className="text-xs text-gray-400 mt-1 capitalize">{role} Portal</div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-5">
        <ul className="space-y-1 px-3">
          {getMenuItems().map(item => (
            <li key={item.id}>
              <button
                className={`w-full text-left p-4 rounded-xl flex items-center transition-all duration-300 ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white transform hover:translate-x-1'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <i className={`${item.icon} w-5 mr-3 ${activeTab === item.id ? 'text-white' : 'text-gray-400'}`}></i>
                <span className="font-medium">{item.label}</span>
                {activeTab === item.id && (
                  <i className="fas fa-chevron-right ml-auto text-xs"></i>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <button
          className="w-full text-left p-4 rounded-xl flex items-center text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-300 transform hover:translate-x-1"
          onClick={onLogout}
        >
          <i className="fas fa-sign-out-alt w-5 mr-3"></i>
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;