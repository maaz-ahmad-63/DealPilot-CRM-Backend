import React from 'react';
import { motion } from 'framer-motion';

export function ProtectedRoute({ children, isAuthenticated }) {
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">Please log in to access this page.</p>
        </div>
      </motion.div>
    );
  }

  return <>{children}</>;
}

export function PublicRoute({ children, isAuthenticated, redirectTo }) {
  if (isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }

  return <>{children}</>;
}
