import Landingpage from "./pages/landingpage";
import LoginPage from "./pages/Loginpage";
import Registerpage from "./pages/Registerpage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoggedInUserHomepage from "./pages/User/AuthenticatedUserhome";
import LoggedInVendorhome from "./pages/Vendor/AuthenticatedVendorhome";
import LoggedInAdminHomepage from "./pages/Admin/AuthenticatedAdminhome";



export default function App(){
  return (
    <Router>
      <Routes>
        <>
          <Route path="/vendor" element={<LoggedInVendorhome/>}/>
          <Route path="/" element={<Landingpage/>}/>
          <Route path="/register" element={<Registerpage/>}/>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path='/customer' element={<LoggedInUserHomepage/>}/>
          <Route path="/admin" element={<LoggedInAdminHomepage/>}/>
        </>
      </Routes>
    </Router>
  )
}