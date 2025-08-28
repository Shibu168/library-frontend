import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BrowseBooks from './member/BrowseBooks';
import MyBooks from './member/MyBooks';
import Sidebar from './Sidebar';
import PaymentModal from './PaymentModal';
import axios from 'axios';

const MemberDashboard = () => {
  const [activeTab, setActiveTab] = useState('browse');
  const { user, logout } = useAuth();
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [fines, setFines] = useState([]);
  const [totalFine, setTotalFine] = useState(0);

  // Fetch fines data when component mounts or when activeTab changes
  useEffect(() => {
    if (activeTab === 'my-books' || activeTab === 'fines') {
      fetchFines();
    }
  }, [activeTab]);

  const fetchFines = async () => {
    try {
      const response = await axios.get(`/api/members/${user.id}/fines`);
      setFines(response.data.fines);
      setTotalFine(response.data.totalFine);
    } catch (error) {
      console.error('Error fetching fines:', error);
    }
  };

  const handlePayFine = (book) => {
    setSelectedBook(book);
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    // Refresh fines data after successful payment
    fetchFines();
    alert('Payment successful!');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'browse':
        return <BrowseBooks />;
      case 'my-books':
        return <MyBooks onPayFine={handlePayFine} />;
      case 'fines':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">My Fines</h2>
            
            {fines.length === 0 ? (
              <div className="text-center py-8">
                <i className="fas fa-receipt text-4xl text-gray-300 mb-4"></i>
                <p className="text-gray-500">You don't have any fines at the moment.</p>
              </div>
            ) : (
              <>
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Total Outstanding Balance</h3>
                      <p className="text-2xl font-bold text-blue-700">${totalFine.toFixed(2)}</p>
                    </div>
                    <button 
                      onClick={() => handlePayFine(null)} 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
                      disabled={totalFine === 0}
                    >
                      Pay All Fines
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Book</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Overdue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fine Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {fines.map((fine) => (
                        <tr key={fine._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img className="h-10 w-10 rounded-md object-cover" src={fine.bookCover} alt={fine.bookTitle} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{fine.bookTitle}</div>
                                <div className="text-sm text-gray-500">by {fine.bookAuthor}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(fine.dueDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {fine.daysOverdue}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ${fine.amount.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${fine.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {fine.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {fine.status !== 'paid' && (
                              <button
                                onClick={() => handlePayFine(fine)}
                                className="text-blue-600 hover:text-blue-900 mr-3"
                              >
                                Pay Now
                              </button>
                            )}
                            <button className="text-gray-500 hover:text-gray-700">
                              <i className="fas fa-receipt"></i> Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2 text-gray-800">Fine Policy</h3>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    <li>Fines are calculated at $0.25 per day for each overdue book</li>
                    <li>Maximum fine per book is $10.00</li>
                    <li>Fines must be paid in full to borrow new materials</li>
                    <li>Payment receipts are available for download after payment</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        );
      default:
        return <BrowseBooks />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        role="member" 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={logout}
        showFinesTab={true} // Add this prop to show fines tab in sidebar
      />
      
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Member Dashboard</h1>
            <div className="text-right">
              <p className="text-gray-600">Welcome, <span className="font-semibold">{user?.name}</span></p>
              <p className="text-sm text-gray-500">Role: Member</p>
              {totalFine > 0 && (
                <div className="mt-2 p-2 bg-red-50 rounded-md">
                  <p className="text-sm text-red-600">
                    <i className="fas fa-exclamation-circle mr-1"></i> 
                    You have ${totalFine.toFixed(2)} in outstanding fines
                  </p>
                </div>
              )}
            </div>
          </div>
          {renderContent()}
        </div>
      </div>

      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        fine={selectedBook}
        totalAmount={selectedBook ? selectedBook.amount : totalFine}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default MemberDashboard;