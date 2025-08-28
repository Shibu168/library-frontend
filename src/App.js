import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import LibrarianDashboard from './components/LibrarianDashboard';
import MemberDashboard from './components/MemberDashboard';
import Unauthorized from './components/Unauthorized';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Role-specific dashboards - only accessible to users with specific roles */}
            <Route path="/admin/*" element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/librarian/*" element={
              <PrivateRoute allowedRoles={['librarian']}>
                <LibrarianDashboard />
              </PrivateRoute>
            } />
            
            <Route path="/member/*" element={
              <PrivateRoute allowedRoles={['member']}>
                <MemberDashboard />
              </PrivateRoute>
            } />
            
            {/* Default route - redirects to appropriate dashboard based on role */}
            <Route path="/" element={<RoleBasedRedirect />} />
            
            {/* Catch all route - redirect to role-specific dashboard */}
            <Route path="*" element={<RoleBasedRedirect />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Component to handle role-based redirection
const RoleBasedRedirect = () => {
  // Check if user is authenticated
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Redirect based on role
  if (user) {
    switch (user.role) {
      case 'admin':
        return <Navigate to="/admin" replace />;
      case 'librarian':
        return <Navigate to="/librarian" replace />;
      case 'member':
        return <Navigate to="/member" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }
  
  return <Navigate to="/login" replace />;
};

export default App;