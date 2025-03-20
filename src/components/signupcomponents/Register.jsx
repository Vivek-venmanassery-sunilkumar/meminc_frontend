import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import RegisterUser from "./RegisterUser"
import RegisterVendor from "./RegisterVendor"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import OtpModal from "../commoncomponents/Otp"
import { useNavigate } from "react-router-dom"
import { UserRound, Store, ArrowRight } from "lucide-react"

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
    navigate("/login")
  }

  const handleOtpAttemptRunOut = () => {
    setShowOtpModal(false)
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#4A5859] to-[#3a4545] p-4">
      <div className="w-full max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-white">Create Your Account</h1>
          <p className="text-white/80 mt-2">Join our marketplace and start your journey</p>
        </motion.div>

        <Card className="overflow-hidden border-0 shadow-xl">
          <div className="bg-[#4A5859] p-4">
            <div className="flex justify-center bg-white/10 backdrop-blur-sm rounded-lg p-1">
              <button
                onClick={() => setIsVendor(false)}
                className={`relative flex items-center justify-center gap-2 w-1/2 py-3 px-4 rounded-md transition-all duration-300 ${
                  !isVendor ? "bg-white text-[#4A5859] font-medium shadow-md" : "text-white/90 hover:bg-white/10"
                }`}
              >
                <UserRound size={18} />
                <span>Customer</span>
              </button>
              <button
                onClick={() => setIsVendor(true)}
                className={`relative flex items-center justify-center gap-2 w-1/2 py-3 px-4 rounded-md transition-all duration-300 ${
                  isVendor ? "bg-white text-[#4A5859] font-medium shadow-md" : "text-white/90 hover:bg-white/10"
                }`}
              >
                <Store size={18} />
                <span>Vendor</span>
              </button>
            </div>
          </div>

          <CardContent className="p-6 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={isVendor ? "vendor" : "user"}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="py-2"
              >
                {isVendor ? (
                  <RegisterVendor onSubmit={handleRegisterSubmit} />
                ) : (
                  <RegisterUser onSubmit={handleRegisterSubmit} />
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-gray-500">Already have an account?</span>
                </div>
              </div>

              <Link
                to="/login"
                className="mt-4 inline-flex items-center gap-2 text-[#4A5859] font-medium hover:underline transition-all"
              >
                Sign in to your account <ArrowRight size={16} />
              </Link>
            </div>
          </CardContent>
        </Card>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center mt-6"
        >
          <p className="text-white/70 text-sm">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>

      {showOtpModal && (
        <OtpModal
          onVerified={handleOtpVerified}
          onClose={() => setShowOtpModal(false)}
          onAttemptrunOut={handleOtpAttemptRunOut}
        />
      )}
    </div>
  )
}

export default Register

