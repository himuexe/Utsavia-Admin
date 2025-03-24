import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/authContext';

interface RoleBasedRouteProps {
  allowedRoles: string[];
  children?: React.ReactNode;
}

const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles, children }) => {
  const { user, loading } = useAuth();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has the required role
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Render children or outlet
  return children ? <>{children}</> : <Outlet />;
};

export default RoleBasedRoute;