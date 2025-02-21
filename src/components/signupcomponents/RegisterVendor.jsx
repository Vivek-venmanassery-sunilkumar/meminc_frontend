import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from 'react-hot-toast'
import api from '@/axios/axiosInstance'
import { useDispatch } from "react-redux"
import { setEmailForOtp } from "@/redux/OtpValidation"
import { ClipLoader } from "react-spinners"


const RegisterVendor = ({ onSubmit }) => {
  const [loading,setLoading] = useState(false)
  const dispatch = useDispatch()


  const data = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
    company_name: '',
    street_address: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
  }
  const [registerdata, setRegisterData] = useState(data)

  const validateForm = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard email format
  const nameRegex = /^[A-Za-z]+$/; // Only letters allowed for first name & company name
  const phoneRegex = /^[0-9]{10}$/; // 10-digit phone number
  const pincodeRegex = /^[0-9]{6}$/;
  const companyNameRegex = /^[A-Za-z\s]+$/; 

  if (!registerdata.email.match(emailRegex)) {
    toast.error("Invalid email format");
    return false;
  }

  if (!registerdata.first_name.match(nameRegex)) {
    toast.error("First name should contain only letters");
    return false;
  }

  if (!registerdata.company_name.match(companyNameRegex)) {
    toast.error("Company name should contain only letters");
    return false;
  }

  if (!registerdata.phone_number.match(phoneRegex)) {
    toast.error("Phone number should be 10 digits");
    return false;
  }

  if (!registerdata.pincode.match(pincodeRegex)) {
    toast.error("Pincode should be exactly 6 digits");
    return false;
  }

  if (registerdata.password.length < 6) {
    toast.error("Password must be at least 6 characters long");
    return false;
  }

  if (registerdata.password !== registerdata.confirm_password) {
    toast.error("Passwords do not match");
    return false;
  }

  return true; // If all validations pass
  };


  const handleSubmit = async (e) => {
    e.preventDefault()

    if(validateForm()){
    setLoading(true)
    try{
      const response = await api.post('register/vendor/', registerdata)
      if(response.status == 200){
        console.log("vendor email:",response.data.email)
        dispatch(setEmailForOtp(response.data.email))
        toast.success('Otp Sent to your Email')
        onSubmit()
      }
    }catch(error){
      if(error.response && error.response.data){
        const errorMessages = Object.values(error.response.data).flat()
        toast.error(errorMessages[0] || "Registration Failed");
      }else{
        toast.error("something went wrong.Please try again")
      }
    }finally{
      setLoading(false)
    }   
  }
  }



  
  const handleChange = (e)=>{
   const {name, value} = e.target;
   setRegisterData((prevData)=>({
    ...prevData,
    [name]: value
   })) 
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" 
                 placeholder="First Name"
                 name='first_name'
                 value = {registerdata.first_name}
                 onChange = {handleChange}
                  />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" 
                 placeholder="Last Name" 
                 name ='last_name' 
                 value ={registerdata.last_name}
                 onChange = {handleChange}
                 />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" 
               type="email"
               name = 'email' 
               placeholder="Email" 
               value = {registerdata.email}
               onChange={handleChange}
               />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" 
               type="tel" 
               name = "phone_number"
               placeholder="Phone Number" 
               value = {registerdata.phone_number}
               onChange = {handleChange}
               />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" 
               type="password" 
               name = "password"
               placeholder="Password" 
               value = {registerdata.password}
               onChange = {handleChange}
               />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input id="confirmPassword" 
               type="password" 
               name = "confirm_password"
               placeholder="Confirm Password" 
               value ={registerdata.confirm_password}
               onChange={handleChange}
               />
      </div>
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input id="companyName" 
               placeholder="Company Name" 
               name = "company_name"
               value = {registerdata.company_name}
               onChange = {handleChange}
               />
      </div>
      <div className="space-y-2">
        <Label htmlFor="streetAddress">Street Address</Label>
        <Input id="streetAddress" 
               placeholder="Street Address" 
               name = "street_address"
               value = {registerdata.street_address}
               onChange={handleChange}
               />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" 
                 placeholder="City" 
                 name = "city"
                 value = {registerdata.city}
                 onChange={handleChange}
                 />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" 
                 placeholder="State" 
                 name = "state"
                 value = {registerdata.state}
                 onChange = {handleChange}
                 />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" 
                 placeholder="Country" 
                 name = "country"
                 value ={registerdata.country}
                 onChange = {handleChange}
                 />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pincode">Pincode</Label>
          <Input id="pincode" 
                 placeholder="Pincode" 
                 name = "pincode"
                 value = {registerdata.pincode}
                 onChange = {handleChange}
                 />
        </div>
      </div>
      <Button type="submit" className="w-full bg-[#4A5859] hover:bg-[#3A4849] text-white" disabled = {loading}>
      {loading ? <ClipLoader size = {20} color="F0EAD6"/>:'Register'}
      </Button>
    </form>
  )
}

export default RegisterVendor
