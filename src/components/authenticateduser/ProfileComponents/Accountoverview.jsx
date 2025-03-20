import toast from "react-hot-toast"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import api from "@/axios/axiosInstance"
import { loginSuccess } from "@/redux/AuthSlice"
import { useDispatch, useSelector } from "react-redux"
import { Camera, User } from "lucide-react"

export default function AccountOverview() {
  const dispatch = useDispatch()
  const authState = useSelector((state) => state.auth)
  const [formData, setFormData] = useState({
    firstName: authState.first_name,
    lastName: authState.last_name,
    email: authState.email,
    phoneNumber: authState.phone_number,
  })
  const [profilePicture, setProfilePicture] = useState(authState.profile_picture)
  const [tempProfilePictureUrl, setTempProfilePictureUrl] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setProfilePicture(file)
      setTempProfilePictureUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    const formDataToSend = new FormData()
    formDataToSend.append("first_name", formData.firstName)
    formDataToSend.append("last_name", formData.lastName)
    formDataToSend.append("email", formData.email)
    formDataToSend.append("phone_number", formData.phoneNumber)
    if (tempProfilePictureUrl) {
      formDataToSend.append("profile_picture", profilePicture)
    }

    try {
      const response = await api.patch("/customer/update-profile/", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.status === 200) {
        dispatch(
          loginSuccess({
            role: response.data.role,
            first_name: response.data.first_name,
            last_name: response.data.last_name,
            email: response.data.email,
            phone_number: response.data.phone_number,
            profile_picture: response.data.profile_picture,
          }),
        )
        toast.success("Profile updated successfully")
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessages = Object.values(error.response.data).flat()
        toast.error(errorMessages[0] || "Update Failed")
      } else {
        toast.error("Update Failed.")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-[#4A5859]/20 shadow-sm">
      <CardHeader className="border-b border-[#4A5859]/10 bg-[#4A5859]/5">
        <CardTitle className="text-[#4A5859] flex items-center gap-2">
          <User className="h-5 w-5" />
          Account Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <Avatar className="w-24 h-24 border-4 border-white shadow-md">
              <AvatarImage
                src={tempProfilePictureUrl || profilePicture || "/placeholder-avatar.jpg"}
                alt="User"
                className="object-cover"
              />
              <AvatarFallback className="bg-[#4A5859] text-white text-xl">
                {formData.firstName && formData.lastName ? `${formData.firstName[0]}${formData.lastName[0]}` : "UN"}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <label htmlFor="profilePicture" className="cursor-pointer">
                <Camera className="h-6 w-6 text-white" />
              </label>
            </div>
          </div>
          <input type="file" id="profilePicture" accept="image/*" onChange={handleFileChange} className="hidden" />
          <label htmlFor="profilePicture" className="cursor-pointer mt-4">
            <Button
              variant="outline"
              size="sm"
              className="text-[#4A5859] border-[#4A5859]/30 hover:bg-[#4A5859]/10"
              asChild
            >
              <span>Change Picture</span>
            </Button>
          </label>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-sm font-medium text-[#4A5859]">
                First Name
              </label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                className="border-[#4A5859]/30 focus-visible:ring-[#4A5859]"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="lastName" className="block text-sm font-medium text-[#4A5859]">
                Last Name
              </label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                className="border-[#4A5859]/30 focus-visible:ring-[#4A5859]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-[#4A5859]">
              Email
            </label>
            <Input
              id="email"
              type="email"
              name="email"
              required
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="border-[#4A5859]/30 focus-visible:ring-[#4A5859]"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-[#4A5859]">
              Phone Number
            </label>
            <Input
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              required
              pattern="^[1-9][0-9]{9}$"
              placeholder="Phone Number"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="border-[#4A5859]/30 focus-visible:ring-[#4A5859]"
            />
            <p className="text-xs text-gray-500">10-digit number without country code</p>
          </div>
          <Button type="submit" className="w-full bg-[#4A5859] hover:bg-[#3A4849] text-white" disabled={isSubmitting}>
            {isSubmitting ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

