import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import RegisterUser from "./RegisterUser"
import RegisterVendor from "./RegisterVendor"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import OtpModal from "../commoncomponents/Otp"
import {useNavigate} from 'react-router-dom'



const Register = () => {
  const [isVendor, setIsVendor] = useState(false)
  const [showOtpModal, setShowOtpModal] = useState(false)
  const navigate = useNavigate()

  const handleRegisterSubmit = () => {
    setShowOtpModal(true)
  }

  const handleOtpVerified = () => {
    setShowOtpModal(false)
    // Handle successful verification (e.g., navigate to dashboard)
    navigate('/login')
  }

  const handleOtpAttemptRunOut = ()=>{
    setShowOtpModal(false)

  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#4A5859] p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="flex justify-center mb-8">
            <div className="relative inline-flex text-2xl font-serif">
              <span
                className={`cursor-pointer px-4 py-2 ${!isVendor ? "text-[#4A5859]" : "text-gray-400"}`}
                onClick={() => setIsVendor(false)}
              >
                Register as Customer
              </span>
              <span
                className={`cursor-pointer px-4 py-2 ${isVendor ? "text-[#4A5859]" : "text-gray-400"}`}
                onClick={() => setIsVendor(true)}
              >
                Register as Vendor
              </span>
              <motion.div
                className="absolute bottom-0 h-0.5 bg-[#4A5859]"
                initial={false}
                animate={{
                  left: isVendor ? "50%" : "0%",
                  width: "50%",
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isVendor ? "vendor" : "user"}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {isVendor ? (
                <RegisterVendor onSubmit={handleRegisterSubmit} />
              ) : (
                <RegisterUser onSubmit={handleRegisterSubmit} />
              )}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-600">
              Have an account? <Link to="/login">Login</Link>
            </span>
          </div>
        </CardContent>
      </Card>

      {showOtpModal && <OtpModal onVerified={handleOtpVerified} onClose={() => setShowOtpModal(false)} onAttemptrunOut={()=>handleOtpAttemptRunOut} />}
    </div>
  )
}

export default Register

