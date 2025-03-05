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
import ProductDetailsPage from "./pages/User/productDetailsPage";
import ResetPasswordModal from "./components/commoncomponents/ResetPasswordModal";
import CartPage from "./pages/User/CartPage";
import CheckoutPage from "./pages/User/CheckoutPage";



export default function App(){
  return (
    <Router>
   <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landingpage />} />
        <Route path="/register" element={<Registerpage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/adminprofile" element={<AdminProfile/>}/>
        <Route path='/reset-password' element = {<ResetPasswordModal/>}/>
       
        {/* Protected Routes */}
      
        {/*customer routes */}
        <Route
          path="/customer"
          element={
            <UserRoute>
              <LoggedInUserHomepage />
            </UserRoute>
          }/>
        <Route 
          path="/customer-profile/:tab"
          element = {
            <UserRoute>
              <UserProfile/>
            </UserRoute>
          }/>
        <Route
          path="/customer/product-view"
          element={
            <UserRoute>
              <ProductDetailsPage/>
            </UserRoute>
          }/>
        <Route
          path="/customer/cart"
          element={
            <UserRoute>
              <CartPage/>
            </UserRoute>
          }/>
        <Route
          path="/customer/checkout"
          element={
            <UserRoute>
              <CheckoutPage/>
            </UserRoute>
          }/>


        {/* Admin Routes */}
        <Route
          path="/admin-profile/:tab"
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
          path="/vendor-profile/:tab" 
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