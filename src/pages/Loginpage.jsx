import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Logo from "@/components/commoncomponents/logo";
import { Link } from "react-router-dom";
import { useState } from "react";
import api from "@/axios/axiosInstance";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginSuccess } from "@/redux/AuthSlice";
import { loginSuccessAdmin } from "@/redux/AdminAuthSlice";
import { loginSuccessVendor } from "@/redux/VendorAuthSlice";
import GoogleAuth from "@/components/commoncomponents/GoogleAuth";
import { ClipLoader } from "react-spinners";
import extractErrorMessages from "@/components/commoncomponents/errorHandlefunc";
import ForgotPasswordModal from "@/components/commoncomponents/ForgotPasswordModal";

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logindata, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post("/register/login/", logindata);
      if (response.status === 200) {
        if (response.data.role === "admin") {
          const role = response.data.role;
          dispatch(loginSuccessAdmin({ role: role }));
          toast.success("Welcome Admin");
          navigate("/admin/account-overview");
        } else if (response.data.role === "customer") {
          const { role, email, first_name, last_name, phone_number, profile_picture } = response.data;
          dispatch(
            loginSuccess({
              email: email,
              role: role,
              first_name: first_name,
              last_name: last_name,
              phone_number: phone_number,
              profile_picture: profile_picture,
            })
          );
          toast.success("Login Successful");
          navigate("/customer");
        } else if (response.data.role === "vendor") {
          const { role, email, first_name, last_name, phone_number, profile_picture, company_name, street_address, city, state, country, pincode } = response.data;
          dispatch(
            loginSuccessVendor({
              email: email,
              role: role,
              first_name: first_name,
              last_name: last_name,
              phone_number: phone_number,
              profile_picture: profile_picture,
              company_name: company_name,
              street_address: street_address,
              city: city,
              state: state,
              country: country,
              pincode: pincode,
            })
          );
          toast.success("Login Successful");
          navigate("/vendor/account-overview");
        }
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errors = extractErrorMessages(error.response.data);
        const errorMessage = errors.join(", ");
        toast.error(errorMessage);
      } else {
        toast.error("Invalid Credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-[#4A5859] flex background-filter backdrop-blur-md items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg flex overflow-hidden">
        <div className="w-1/2 bg-[#4A5859] p-12 flex items-center justify-center">
          <Logo />
        </div>
        <div className="w-1/2 p-12">
          <Card className="bg-transparent border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-3xl font-bold text-[#4A5859]">Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-[#4A5859]">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    name="email"
                    value={logindata.email}
                    onChange={handleChange}
                    className="bg-white border-[#4A5859] text-[#4A5859] placeholder-[#4A5859]/50"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-[#4A5859]">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    name="password"
                    value={logindata.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="bg-white border-[#4A5859] text-[#4A5859] placeholder-[#4A5859]/50"
                  />
                </div>
                <Button type="submit" className="w-full bg-[#4A5859] text-[#F0EAD6] hover:bg-[#3A4849]" disabled={loading}>
                  {loading ? <ClipLoader size={20} color="#F0EAD6" /> : "Log In"}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <span
                  className="text-sm text-[#4A5859] cursor-pointer hover:underline"
                  onClick={() => setShowForgotPasswordModal(true)}
                >
                  Forgot Password?
                </span>
              </div>
              <div className="mt-6 text-center">
                <span className="text-sm text-gray-600">
                  Don't have an account? <Link to="/Register">Register</Link>
                </span>
              </div>
              <div className="mt-6">
                <GoogleAuth />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <ForgotPasswordModal
        isOpen={showForgotPasswordModal}
        onClose={() => setShowForgotPasswordModal(false)}
      />
    </div>
  );
};

export default LoginPage;