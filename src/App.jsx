import Landingpage from "./pages/landingpage";
import LoginPage from "./pages/Loginpage";
import Registerpage from "./pages/Registerpage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoggedInUserHomepage from "./pages/User/AuthenticatedUserhome";
import LoggedInVendorhome from "./pages/Vendor/AuthenticatedVendorhome";
import { AdminRoute, Forbidden, UserRoute, VendorRoute } from '@/routes/Index'
import UserProfile from "./pages/User/UserProfile";
import AdminProfile from "./pages/Admin/AdminProfile";
import VendorProfile from "./pages/Vendor/VendorProfile";



export default function App(){
  return (
    <Router>
   <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landingpage />} />
        <Route path="/register" element={<Registerpage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/adminprofile" element={<AdminProfile/>}/>
       
        {/* Protected Routes */}
{/* 
        customer routes */}
        <Route
          path="/customer"
          element={
            <UserRoute>
              <LoggedInUserHomepage />
            </UserRoute>
          }/>
        <Route 
          path="/customer/account-overview"
          element = {
            <UserRoute>
              <UserProfile/>
            </UserRoute>
          }/>


        {/* Admin Routes */}
        <Route
          path="/admin/account-overview"
          element = {
            <AdminRoute>
              <AdminProfile/>
            </AdminRoute>
          }
        />


        {/* Vendor Routes */}
        <Route
          path="/vendor"
          element={
            <VendorRoute>
              <LoggedInVendorhome />
            </VendorRoute>
          }
        />
       <Route 
          path="/vendor/account-overview" 
          element={
            <VendorRoute>
                <VendorProfile/>
            </VendorRoute>
          }
        />

      </Routes>
    </Router>
  )
}