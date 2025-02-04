import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const OtpModal = ({ onVerified, onClose }) => {
  const [otp, setOtp] = useState("")
  const [timer, setTimer] = useState(60)
  const [isTimerRunning, setIsTimerRunning] = useState(true)

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

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle OTP verification logic here
    console.log("Verifying OTP:", otp)
    onVerified()
  }

  const handleResend = () => {
    // Handle resend OTP logic here
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

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter OTP</DialogTitle>
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
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
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


