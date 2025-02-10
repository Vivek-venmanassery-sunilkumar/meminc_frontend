import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, role } = useSelector((state) => state.adminAuth);

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (role !== 'admin') {
    // Redirect to forbidden page if not an admin
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

export default AdminRoute;