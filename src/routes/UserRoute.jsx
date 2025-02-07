import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const UserRoute = ({ children }) => {
  const { isAuthenticated, role } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (role !== 'customer') {
    // Redirect to forbidden page if not a user
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

export default UserRoute;