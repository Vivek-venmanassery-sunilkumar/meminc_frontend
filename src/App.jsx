import Landingpage from "./pages/landingpage";
import LoginPage from "./pages/Loginpage";
import Registerpage from "./pages/Registerpage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoggedInUserHomepage from "./pages/User/AuthenticatedUserhome";
import LoggedInVendorhome from "./pages/Vendor/AuthenticatedVendorhome";
import LoggedInAdminHomepage from "./pages/Admin/AuthenticatedAdminhome";
import { AdminRoute, Forbidden, UserRoute, VendorRoute } from '@/routes/Index'
import AccountInformation from "./pages/User/AccountInformation";



export default function App(){
  return (
    <Router>
   <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landingpage />} />
        <Route path="/register" element={<Registerpage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/userprofile" element={<AccountInformation/>}/>

        {/* Protected Routes */}
        <Route
          path="/customer"
          element={
            <UserRoute>
              <LoggedInUserHomepage />
            </UserRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <LoggedInAdminHomepage />
            </AdminRoute>
          }
        />
        <Route
          path="/vendor"
          element={
            <VendorRoute>
              <LoggedInVendorhome />
            </VendorRoute>
          }
        />
      </Routes>
    </Router>
  )
}