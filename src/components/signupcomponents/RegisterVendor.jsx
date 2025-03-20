import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "react-hot-toast"
import api from "@/axios/axiosInstance"
import { useDispatch } from "react-redux"
import { setEmailForOtp } from "@/redux/OtpValidation"
import { ClipLoader } from "react-spinners"
import { Mail, User, Phone, Lock, KeyRound, Building2, MapPin, Home, Globe } from "lucide-react"

const RegisterVendor = ({ onSubmit }) => {
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  const data = {
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
    company_name: "",
    street_address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  }

  const [registerdata, setRegisterData] = useState(data)

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Standard email format
    const nameRegex = /^[A-Za-z]+$/ // Only letters allowed for first name & company name
    const phoneRegex = /^[0-9]{10}$/ // 10-digit phone number
    const pincodeRegex = /^[0-9]{6}$/
    const companyNameRegex = /^[A-Za-z\s]+$/

    if (!registerdata.email.match(emailRegex)) {
      toast.error("Invalid email format")
      return false
    }

    if (!registerdata.first_name.match(nameRegex)) {
      toast.error("First name should contain only letters")
      return false
    }

    if (!registerdata.company_name.match(companyNameRegex)) {
      toast.error("Company name should contain only letters")
      return false
    }

    if (!registerdata.phone_number.match(phoneRegex)) {
      toast.error("Phone number should be 10 digits")
      return false
    }

    if (!registerdata.pincode.match(pincodeRegex)) {
      toast.error("Pincode should be exactly 6 digits")
      return false
    }

    if (registerdata.password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return false
    }

    if (registerdata.password !== registerdata.confirm_password) {
      toast.error("Passwords do not match")
      return false
    }

    return true // If all validations pass
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (validateForm()) {
      setLoading(true)
      try {
        const response = await api.post("register/vendor/", registerdata)
        if (response.status == 200) {
          console.log("vendor email:", response.data.email)
          dispatch(setEmailForOtp(response.data.email))
          toast.success("Otp Sent to your Email")
          onSubmit()
        }
      } catch (error) {
        if (error.response && error.response.data) {
          const errorMessages = Object.values(error.response.data).flat()
          toast.error(errorMessages[0] || "Registration Failed")
        } else {
          toast.error("something went wrong. Please try again")
        }
      } finally {
        setLoading(false)
      }
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setRegisterData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="firstName" className="text-sm font-medium">
            First Name
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <User size={16} />
            </div>
            <Input
              id="firstName"
              name="first_name"
              value={registerdata.first_name}
              placeholder="First Name"
              onChange={handleChange}
              className="pl-10 h-11 border-gray-200 focus:border-[#4A5859] focus:ring-[#4A5859]/20"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName" className="text-sm font-medium">
            Last Name
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <User size={16} />
            </div>
            <Input
              id="lastName"
              name="last_name"
              value={registerdata.last_name}
              placeholder="Last Name"
              onChange={handleChange}
              className="pl-10 h-11 border-gray-200 focus:border-[#4A5859] focus:ring-[#4A5859]/20"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Mail size={16} />
          </div>
          <Input
            id="email"
            type="email"
            name="email"
            value={registerdata.email}
            placeholder="Email"
            onChange={handleChange}
            className="pl-10 h-11 border-gray-200 focus:border-[#4A5859] focus:ring-[#4A5859]/20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium">
          Phone Number
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Phone size={16} />
          </div>
          <Input
            id="phone"
            type="tel"
            name="phone_number"
            value={registerdata.phone_number}
            placeholder="Phone Number"
            onChange={handleChange}
            className="pl-10 h-11 border-gray-200 focus:border-[#4A5859] focus:ring-[#4A5859]/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-sm font-medium">
            Password
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={16} />
            </div>
            <Input
              id="password"
              type="password"
              name="password"
              value={registerdata.password}
              placeholder="Password"
              onChange={handleChange}
              className="pl-10 h-11 border-gray-200 focus:border-[#4A5859] focus:ring-[#4A5859]/20"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-sm font-medium">
            Confirm Password
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <KeyRound size={16} />
            </div>
            <Input
              id="confirmPassword"
              type="password"
              name="confirm_password"
              value={registerdata.confirm_password}
              placeholder="Confirm Password"
              onChange={handleChange}
              className="pl-10 h-11 border-gray-200 focus:border-[#4A5859] focus:ring-[#4A5859]/20"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="companyName" className="text-sm font-medium">
          Company Name
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Building2 size={16} />
          </div>
          <Input
            id="companyName"
            name="company_name"
            value={registerdata.company_name}
            placeholder="Company Name"
            onChange={handleChange}
            className="pl-10 h-11 border-gray-200 focus:border-[#4A5859] focus:ring-[#4A5859]/20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="streetAddress" className="text-sm font-medium">
          Street Address
        </Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <Home size={16} />
          </div>
          <Input
            id="streetAddress"
            name="street_address"
            value={registerdata.street_address}
            placeholder="Street Address"
            onChange={handleChange}
            className="pl-10 h-11 border-gray-200 focus:border-[#4A5859] focus:ring-[#4A5859]/20"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium">
            City
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <MapPin size={16} />
            </div>
            <Input
              id="city"
              name="city"
              value={registerdata.city}
              placeholder="City"
              onChange={handleChange}
              className="pl-10 h-11 border-gray-200 focus:border-[#4A5859] focus:ring-[#4A5859]/20"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="state" className="text-sm font-medium">
            State
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <MapPin size={16} />
            </div>
            <Input
              id="state"
              name="state"
              value={registerdata.state}
              placeholder="State"
              onChange={handleChange}
              className="pl-10 h-11 border-gray-200 focus:border-[#4A5859] focus:ring-[#4A5859]/20"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="country" className="text-sm font-medium">
            Country
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Globe size={16} />
            </div>
            <Input
              id="country"
              name="country"
              value={registerdata.country}
              placeholder="Country"
              onChange={handleChange}
              className="pl-10 h-11 border-gray-200 focus:border-[#4A5859] focus:ring-[#4A5859]/20"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pincode" className="text-sm font-medium">
            Pincode
          </Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <MapPin size={16} />
            </div>
            <Input
              id="pincode"
              name="pincode"
              value={registerdata.pincode}
              placeholder="Pincode"
              onChange={handleChange}
              className="pl-10 h-11 border-gray-200 focus:border-[#4A5859] focus:ring-[#4A5859]/20"
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full h-11 mt-2 bg-[#4A5859] hover:bg-[#3A4849] text-white transition-all duration-200 shadow-md hover:shadow-lg"
        disabled={loading}
      >
        {loading ? <ClipLoader size={20} color="F0EAD6" /> : "Create Vendor Account"}
      </Button>
    </form>
  )
}

export default RegisterVendor

