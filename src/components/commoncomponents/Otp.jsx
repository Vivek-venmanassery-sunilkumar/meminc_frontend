import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {useSelector, useDispatch} from 'react-redux'
import { clearOtpValidation } from "@/redux/OtpValidation"
import api from "@/axios/axiosInstance"
import {toast} from 'react-hot-toast'
import { useNavigate } from "react-router-dom"





const OtpModal = ({ onVerified, onClose,onAttemptrunOut }) => {
  const navigate = useNavigate()
  const email = useSelector((state)=> state.otpValidation.email)

  const [otpdata, setOtpData] = useState({
    otp: '',
    email:email
  })
  const [timer, setTimer] = useState(60)
  const [isTimerRunning, setIsTimerRunning] = useState(true)
  const dispatch = useDispatch();
  useEffect(() => {
    let interval

    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1)
      }, 1000)
    } else if (timer === 0) {
      setIsTimerRunning(false)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timer, isTimerRunning])

  const handleSubmit = async (e) => {
    e.preventDefault()
    // otp validation logic
    console.log("Sending OTP data:", {
      otp: otpdata.otp,
      otpType: typeof otpdata.otp,
      otpLength: otpdata.otp.length
  });
    try{
      console.log(otpdata)
      const response = await api.post('/register/verifyotp/', otpdata);
      if (response.status === 201){
        dispatch(clearOtpValidation())
        toast.success('Registration successfull')
        onVerified()
      }
    }catch(error){
      if(error.response && error.response.data){
        const errorMessages = Object.values(error.response.data).flat()
        console.log(errorMessages)
        toast.error(errorMessages[0] || "Registration Failed");
      }else{
        toast.error("something went wrong.Please try again")
      }
    }
  }

  const handleResend = async () => {
    // Handle resend OTP logic here
    try{
      console.log('data',otpdata)
      const response = await api.post('/register/resendotp/', {'email':otpdata.email})
      if (response.status === 200){
        console.log(response.data.registered_email)
        toast.success('Otp sent to your Email')
      }

    }catch(error){
      if(error.response && error.response.data){
        const errorMessages = Object.values(error.response.data).flat();
        if (error.response.data.registration_timeout){
          console.log(error.response.data.registration_timeout)
          toast.error(errorMessages[0])
          onAttemptrunOut()
          navigate('/')
        }
        toast.error(errorMessages[0])
      }else{
        toast.error("something went wrong")
      }
    }
    setTimer(60)
    setIsTimerRunning(true)
    console.log("Resending OTP")
  }

  const handleButtonClick = (e) => {
    if (!isTimerRunning) {
      e.preventDefault() // Prevent form submission
      handleResend()
    }
    // If timer is running, let the form submit normally
  }

  const handleChange = (e)=>{
    const {name, value} = e.target
    setOtpData((prevData)=>({
      ...prevData,
      [name]: value
    }))
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter OTP</DialogTitle>
          <DialogDescription>Enter the otp sent to your registered mail.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">Enter OTP</Label>
            <Input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              name = "otp"
              placeholder="Enter 6-digit OTP"
              value={otpdata.otp}
              onChange={handleChange}
              className="text-center text-2xl tracking-widest"
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{isTimerRunning ? `Resend in ${timer}s` : "OTP expired"}</span>
            <Button
              type="submit"
              onClick={handleButtonClick}
              className={`w-32 transition-all duration-300 ease-in-out ${
                isTimerRunning
                  ? "bg-[#4A5859] hover:bg-[#3A4849] text-white"
                  : "bg-[#3A4849] hover:bg-[#4A5859] text-white"
              }`}
            >
              <span className={`transition-opacity duration-300 ${isTimerRunning ? "opacity-100" : "opacity-0"}`}>
                Verify
              </span>
              <span
                className={`absolute transition-opacity duration-300 ${isTimerRunning ? "opacity-0" : "opacity-100"}`}
              >
                Resend OTP
              </span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default OtpModal


