import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useStore, Role } from '../../store';

interface PrivateRouteProps {
  children: React.ReactNode;
  requiredRoles?: Role[];
}

export function PrivateRoute({ children, requiredRoles }: PrivateRouteProps) {
  const { user, role } = useStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" state={{ from: location, authRequired: true }} replace />;
  }

  if (requiredRoles && requiredRoles.length > 0 && !requiredRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
