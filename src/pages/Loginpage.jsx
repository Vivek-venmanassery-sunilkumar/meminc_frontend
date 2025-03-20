import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import Logo from "@/components/commoncomponents/logo"
import { Link } from "react-router-dom"
import { useState } from "react"
import api from "@/axios/axiosInstance"
import { toast } from "react-hot-toast"
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { loginSuccess } from "@/redux/AuthSlice"
import { loginSuccessAdmin } from "@/redux/AdminAuthSlice"
import { loginSuccessVendor } from "@/redux/VendorAuthSlice"
import GoogleAuth from "@/components/commoncomponents/GoogleAuth"
import { ClipLoader } from "react-spinners"
import extractErrorMessages from "@/components/commoncomponents/errorHandlefunc"
import ForgotPasswordModal from "@/components/commoncomponents/ForgotPasswordModal"
import { Eye, EyeOff, Mail, Lock } from "lucide-react"

const LoginPage = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [logindata, setLoginData] = useState({
    email: "",
    password: "",
  })
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post("/register/login/", logindata)
      if (response.status === 200) {
        if (response.data.role === "admin") {
          const role = response.data.role
          dispatch(loginSuccessAdmin({ role: role }))
          toast.success("Welcome Admin")
          navigate("/admin-profile/dashboard")
        } else if (response.data.role === "customer") {
          const { role, email, first_name, last_name, phone_number, profile_picture } = response.data
          dispatch(
            loginSuccess({
              email: email,
              role: role,
              first_name: first_name,
              last_name: last_name,
              phone_number: phone_number,
              profile_picture: profile_picture,
            }),
          )
          toast.success("Login Successful")
          navigate("/customer")
        } else if (response.data.role === "vendor") {
          const {
            role,
            email,
            first_name,
            last_name,
            phone_number,
            profile_picture,
            company_name,
            street_address,
            city,
            state,
            country,
            pincode,
          } = response.data
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
            }),
          )
          toast.success("Login Successful")
          navigate("/vendor-profile/account-overview")
        }
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errors = extractErrorMessages(error.response.data)
        const errorMessage = errors.join(", ")
        toast.error(errorMessage)
      } else {
        toast.error("Invalid Credentials.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setLoginData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A5859] to-[#3A4849] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all duration-300 ease-in-out">
        {/* Left side - Logo section */}
        <div className="w-full md:w-5/12 bg-[#4A5859] p-8 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-[#F0EAD6] opacity-5 transform rotate-45 translate-y-[-50%]"></div>
            <div className="absolute bottom-0 right-0 w-full h-full bg-[#F0EAD6] opacity-5 transform rotate-45 translate-y-[50%]"></div>
          </div>
          <div className="relative z-10 scale-100 md:scale-110 transition-transform duration-300">
            <Logo />
          </div>
          <div className="mt-8 text-white text-center relative z-10">
            <h2 className="text-xl md:text-2xl font-semibold mb-2">Welcome Back</h2>
            <p className="text-sm md:text-base text-white/80">Log in to continue to your account</p>
          </div>
        </div>

        {/* Right side - Form section */}
        <div className="w-full md:w-7/12 p-6 sm:p-8 md:p-12 flex items-center">
          <Card className="w-full bg-transparent border-0 shadow-none">
            <CardHeader className="px-0 pt-0 pb-4">
              <CardTitle className="text-2xl md:text-3xl font-bold text-[#4A5859]">Login</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-[#4A5859]">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4A5859]/60" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      name="email"
                      value={logindata.email}
                      onChange={handleChange}
                      className="pl-10 bg-white border-[#4A5859]/20 focus:border-[#4A5859] text-[#4A5859] placeholder-[#4A5859]/50 transition-all duration-200"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-[#4A5859]">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#4A5859]/60" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={logindata.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 bg-white border-[#4A5859]/20 focus:border-[#4A5859] text-[#4A5859] placeholder-[#4A5859]/50 transition-all duration-200"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#4A5859]/60 hover:text-[#4A5859] transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full h-11 bg-[#4A5859] text-[#F0EAD6] hover:bg-[#3A4849] transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                    disabled={loading}
                  >
                    {loading ? <ClipLoader size={20} color="#F0EAD6" /> : "Log In"}
                  </Button>
                </div>
              </form>

              <div className="mt-4 text-center">
                <span
                  className="text-sm text-[#4A5859] cursor-pointer hover:underline transition-all duration-200"
                  onClick={() => setShowForgotPasswordModal(true)}
                >
                  Forgot Password?
                </span>
              </div>

              <div className="mt-6 relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#4A5859]/10"></div>
                </div>
                <div className="relative px-4 bg-white">
                  <span className="text-sm text-[#4A5859]/60">Or continue with</span>
                </div>
              </div>

              <div className="mt-6">
                <GoogleAuth />
              </div>

              <div className="mt-8 text-center">
                <span className="text-sm text-[#4A5859]/80">
                  Don't have an account?{" "}
                  <Link
                    to="/Register"
                    className="font-medium text-[#4A5859] hover:underline transition-all duration-200"
                  >
                    Register
                  </Link>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <ForgotPasswordModal isOpen={showForgotPasswordModal} onClose={() => setShowForgotPasswordModal(false)} />
    </div>
  )
}

export default LoginPage

