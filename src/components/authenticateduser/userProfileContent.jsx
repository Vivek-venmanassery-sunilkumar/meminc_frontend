import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Footer from "../commoncomponents/Footer"
import api from "@/axios/axiosInstance"
import { useNavigate, useParams } from "react-router-dom"
import { useDispatch } from "react-redux"
import { logout } from "@/redux/AuthSlice"
import AccountOverview from "./ProfileComponents/Accountoverview"
import ManageAddresses from "./ProfileComponents/ManageAddresses"
import MyOrders from "./ProfileComponents/MyOrders"
import Wallet from "./ProfileComponents/Wallet"
import { LogOut, User, MapPin, ShoppingBag, WalletIcon } from "lucide-react"

export default function UserProfileContent() {
  const { tab } = useParams() // Get the active tab from the URL
  const [activeTab, setActiveTab] = useState(tab || "account-overview")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Update the active tab when the URL changes
  useEffect(() => {
    if (tab) {
      setActiveTab(tab)
    }
  }, [tab])

  const handleLogout = async () => {
    const response = await api.post("register/logout/")
    if (response.status === 200) {
      dispatch(logout())
      navigate("/")
    }
  }

  // Update the URL when the tab changes
  const handleTabChange = (newTab) => {
    setActiveTab(newTab)
    navigate(`/customer-profile/${newTab}`)
    setIsMobileMenuOpen(false) // Close mobile menu when tab changes
  }

  const tabs = [
    { id: "account-overview", label: "Account Overview", icon: <User className="h-4 w-4 mr-2" /> },
    { id: "addresses", label: "Manage Addresses", icon: <MapPin className="h-4 w-4 mr-2" /> },
    { id: "orders", label: "My Orders", icon: <ShoppingBag className="h-4 w-4 mr-2" /> },
    { id: "wallet", label: "Wallet", icon: <WalletIcon className="h-4 w-4 mr-2" /> },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-6 flex-1">
        {/* Mobile Tab Selector */}
        <div className="md:hidden mb-6">
          <Button
            variant="outline"
            className="w-full flex items-center justify-between border-[#4A5859]/30 text-[#4A5859]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="flex items-center">
              {tabs.find((t) => t.id === activeTab)?.icon}
              {tabs.find((t) => t.id === activeTab)?.label}
            </span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`h-4 w-4 transition-transform ${isMobileMenuOpen ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </Button>

          {isMobileMenuOpen && (
            <div className="mt-2 bg-white rounded-md shadow-lg border border-[#4A5859]/10 overflow-hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`w-full text-left px-4 py-3 flex items-center ${
                    activeTab === tab.id ? "bg-[#4A5859]/10 text-[#4A5859] font-medium" : "hover:bg-gray-50"
                  }`}
                  onClick={() => handleTabChange(tab.id)}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
              <button
                className="w-full text-left px-4 py-3 flex items-center text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} className="w-full flex flex-col md:flex-row" onValueChange={handleTabChange}>
          {/* TabsList (Menu) on the left - sticky on desktop */}
          <div className="hidden md:block md:w-1/4 lg:w-1/5 sticky top-6 h-fit">
            <TabsList className="flex flex-col items-start space-y-1 h-auto bg-transparent">
              <div className="w-full bg-white rounded-lg shadow-sm border border-[#4A5859]/10 overflow-hidden">
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="w-full text-left px-4 py-3 justify-start border-l-2 border-transparent data-[state=active]:border-l-[#4A5859] data-[state=active]:bg-[#4A5859]/5 data-[state=active]:text-[#4A5859]"
                  >
                    {tab.icon}
                    {tab.label}
                  </TabsTrigger>
                ))}
                <Button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 h-auto justify-start text-red-600 hover:bg-red-50 hover:text-red-700 rounded-none"
                  variant="ghost"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </TabsList>
          </div>

          {/* TabsContent on the right */}
          <div className="w-full md:w-3/4 lg:w-4/5 md:pl-6">
            <TabsContent value="account-overview" className="mt-0">
              <AccountOverview />
            </TabsContent>
            <TabsContent value="addresses" className="mt-0">
              <ManageAddresses />
            </TabsContent>
            <TabsContent value="orders" className="mt-0">
              <MyOrders />
            </TabsContent>
            <TabsContent value="wallet" className="mt-0">
              <Wallet />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      <Footer className="mt-auto" />
    </div>
  )
}