import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/axios/axiosInstance";
import { toast } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import extractErrorMessages from "./errorHandlefunc";

const ForgotPasswordModal = ({ isOpen, onClose }) => {
  const [email, setEmailState] = useState(""); // State for email input
  const [loading, setLoading] = useState(false); // State for loading spinner

  // Handle email submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/register/password-reset/", { email });
      if (response.status === 200) {
        toast.success("Password reset instructions have been sent to your email.");
        onClose(); // Close the modal after successful submission
      }
    } catch (error) {
      if(error.response && error.response.data){
        const errorMessage = extractErrorMessages(error.response.data);
        toast.error(errorMessage)
      }else{
      toast.error("Failed to send reset instructions. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything if the modal is not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-[#4A5859] mb-4">Forgot Password?</h2>
        <p className="text-sm text-[#4A5859] mb-6">
          Enter your email address to reset your password.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmailState(e.target.value)}
            className="bg-white border-[#4A5859] text-[#4A5859] placeholder-[#4A5859]/50"
          />
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              onClick={onClose}
              className="bg-transparent text-[#4A5859] hover:bg-[#F0EAD6]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#4A5859] text-[#F0EAD6] hover:bg-[#3A4849]"
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color="#F0EAD6" /> : "Submit"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;