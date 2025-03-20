import LoggedInUserHeader from "@/components/authenticateduser/loggedInUserHeader"
import UserProfileContent from "@/components/authenticateduser/userProfileContent"

export default function UserProfile() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <LoggedInUserHeader />
      <div className="flex-1 pt-16 sm:pt-20 min-h-[calc(100vh-80px)]">
        <UserProfileContent />
      </div>
    </div>
  )
}