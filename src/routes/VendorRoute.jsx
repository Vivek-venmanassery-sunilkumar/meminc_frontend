import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const VendorRoute = ({ children }) => {
  const { isAuthenticated, role } = useSelector((state) => state.VendorAuth);

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  if (role !== 'vendor') {
    // Redirect to forbidden page if not a vendor
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

export default VendorRoute;