import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from 'react-hot-toast'
import api from "@/axios/axiosInstance"
import { setEmailForOtp } from "@/redux/OtpValidation"
import {useDispatch} from "react-redux"




const RegisterUser = ({ onSubmit }) => {
  const dispatch = useDispatch();
  const handleSubmit =async (e) => {
    e.preventDefault()
    if(registerData.password !== registerData.confirm_password){
      toast.error("passwords do not match");
      return;
    }
    try {
      const response = await api.post("/register/customer/", registerData);
      if(response.status === 200){
        console.log(response.data.email)
        dispatch(setEmailForOtp(response.data.email))
        toast.success("OTP sent to your email");
        onSubmit()
      }
    }catch (error){
      if(error.response && error.response.data){
        const errorMessages = Object.values(error.response.data).flat();
        toast.error(errorMessages[0] || "Registration failed");
      }else{
        toast.error("Something went wrong. Please try again.");
      }
    }
  }
  const data = {
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirm_password: '',
  }
  const [registerData, setRegisterData] = useState(data)

  const handleChange = (e)=>{
    const {name, value} = e.target
    setRegisterData((prevData)=>({
      ...prevData,
      [name]: value,
    }))
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName"
                 name = "first_name"
                 value = {registerData.first_name}
                 placeholder="First Name"
                 onChange = {handleChange}
           />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName"
                 name = "last_name"
                 value ={registerData.last_name}
                 placeholder="Last Name"
                 onChange = {handleChange} 
            />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email"
               type="email"
               name = "email" 
               value={registerData.email} 
               placeholder="Email"
               onChange = {handleChange} 
            />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input id="phone" 
               type="tel"
               name = "phone_number" 
               value={registerData.phone_number} 
               placeholder="Phone Number"
               onChange = {handleChange} 
            />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" 
               type="password"
               name = "password" 
               value={registerData.password} 
               placeholder="Password"
               onChange = {handleChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input id="confirmPassword" 
               type="password" 
               name = "confirm_password"
               value={registerData.confirm_password} 
               placeholder="Confirm Password"
               onChange = {handleChange} 
            />
      </div>
      <Button type="submit" className="w-full bg-[#4A5859] hover:bg-[#3A4849] text-white">
        Register
      </Button>
    </form>
  )
}

export default RegisterUser

