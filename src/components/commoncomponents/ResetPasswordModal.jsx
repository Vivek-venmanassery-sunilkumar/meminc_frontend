import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/axios/axiosInstance";
import { toast } from "react-hot-toast";
import { ClipLoader } from "react-spinners";
import extractErrorMessages from "./errorHandlefunc";
import { useNavigate, useSearchParams } from "react-router-dom";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // Hook to access search params
  const token = searchParams.get("token"); // Extract the token from the query string
  const [newPassword, setNewPassword] = useState(""); // State for new password
  const [confirmPassword, setConfirmPassword] = useState(""); // State for confirm password
  const [loading, setLoading] = useState(false); // State for loading spinner

  // Handle password reset submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!token) {
      toast.error("Invalid token. Please check your reset link.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/register/password-reset/confirm/", {
        token,
        password: newPassword,
      });
      if (response.status === 200) {
        toast.success("Password has been reset successfully.");
        navigate("/login"); // Navigate to the login page after successful reset
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = extractErrorMessages(error.response.data);
        toast.error(errorMessage);
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0EAD6] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold text-[#4A5859] mb-4">Reset Password</h2>
        <p className="text-sm text-[#4A5859] mb-6">
          Enter your new password and confirm it.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="bg-white border-[#4A5859] text-[#4A5859] placeholder-[#4A5859]/50"
          />
          <Input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-white border-[#4A5859] text-[#4A5859] placeholder-[#4A5859]/50"
          />
          <div className="flex justify-end gap-4">
            <Button
              type="submit"
              className="bg-[#4A5859] text-[#F0EAD6] hover:bg-[#3A4849]"
              disabled={loading}
            >
              {loading ? <ClipLoader size={20} color="#F0EAD6" /> : "Reset Password"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;