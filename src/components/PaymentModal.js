import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentModal = ({ isOpen, onClose, issuedBook, onPaymentSuccess }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    upiId: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    accountNumber: '',
    ifscCode: ''
  });

  useEffect(() => {
    if (issuedBook) {
      const calculatedFine = calculateFine();
      setAmount(calculatedFine.toFixed(2));
    }
  }, [issuedBook]);

  if (!isOpen) return null;

  const calculateFine = () => {
    if (!issuedBook.return_date && new Date(issuedBook.due_date) < new Date()) {
      const diffTime = Math.abs(new Date() - new Date(issuedBook.due_date));
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays * 2; // $2 per day fine
    }
    return issuedBook.fine || 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const API_BASE_URL = process.env.NODE_ENV === 'production' 
        ? 'https://your-production-domain.com/api' 
        : 'http://localhost:5000/api';

      await axios.post(`${API_BASE_URL}/payments`, {
        amount: parseFloat(amount),
        member_id: issuedBook.member_id,
        issued_book_id: issuedBook.id,
        payment_method: paymentMethod,
        payment_details: paymentDetails,
        description: `Fine payment for ${issuedBook.title}`
      }, {
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        }
      });

      onPaymentSuccess();
      onClose();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Payment failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'upi':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">UPI ID</label>
            <input
              type="text"
              name="upiId"
              value={paymentDetails.upiId}
              onChange={handleInputChange}
              placeholder="yourname@upi"
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              required
            />
          </div>
        );
      case 'card':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
              <input
                type="text"
                name="cardNumber"
                value={paymentDetails.cardNumber}
                onChange={handleInputChange}
                placeholder="1234 5678 9012 3456"
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="text"
                  name="cardExpiry"
                  value={paymentDetails.cardExpiry}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                <input
                  type="text"
                  name="cardCvv"
                  value={paymentDetails.cardCvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>
          </>
        );
      case 'netbanking':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={paymentDetails.accountNumber}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
              <input
                type="text"
                name="ifscCode"
                value={paymentDetails.ifscCode}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>
          </>
        );
      case 'wallet':
        return (
          <div className="mb-4 p-3 bg-yellow-50 rounded-md">
            <p className="text-sm text-yellow-700">You will be redirected to your wallet app to complete the payment.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
        <div className="bg-primary text-white p-4">
          <h2 className="text-xl font-semibold">Pay Fine</h2>
        </div>
        
        <div className="p-4">
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <p className="font-semibold">{issuedBook.title}</p>
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>Due Date: {new Date(issuedBook.due_date).toLocaleDateString()}</span>
              <span className="font-medium text-red-600">Fine: ${calculateFine().toFixed(2)}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-2 border rounded-md flex items-center justify-center ${paymentMethod === 'upi' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                  <i className="fas fa-mobile-alt mr-2 text-blue-500"></i>
                  <span>UPI</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2 border rounded-md flex items-center justify-center ${paymentMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                  <i className="far fa-credit-card mr-2 text-blue-500"></i>
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-2 border rounded-md flex items-center justify-center ${paymentMethod === 'netbanking' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                  <i className="fas fa-university mr-2 text-blue-500"></i>
                  <span>Net Banking</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('wallet')}
                  className={`p-2 border rounded-md flex items-center justify-center ${paymentMethod === 'wallet' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
                >
                  <i className="fas fa-wallet mr-2 text-blue-500"></i>
                  <span>Wallet</span>
                </button>
              </div>
            </div>

            {renderPaymentForm()}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount to Pay ($)</label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
                min="0.01"
                max={calculateFine()}
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                {loading && <i className="fas fa-spinner fa-spin mr-2"></i>}
                {loading ? 'Processing...' : 'Pay Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;