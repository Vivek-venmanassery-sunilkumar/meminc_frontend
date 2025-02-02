import Landingpage from "./pages/landingpage";
import LoginPage from "./pages/Loginpage";
import Registerpage from "./pages/Registerpage";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


export default function App(){
  return (
    <Router>
      <Routes>
        <>
          <Route path="/" element={<Landingpage/>}/>
          <Route path="/Register" element={<Registerpage/>}/>
          <Route path="/Login" element={<LoginPage/>}/>
        </>
      </Routes>
    </Router>
  )
}