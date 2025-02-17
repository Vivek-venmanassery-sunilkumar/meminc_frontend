import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Footer from '../commoncomponents/Footer';
import api from '@/axios/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/AuthSlice';
import AccountOverview from './ProfileComponents/Accountoverview';
import ManageAddresses from './ProfileComponents/ManageAddresses';
import MyOrders from './ProfileComponents/MyOrders';
import Wallet from './ProfileComponents/Wallet';

export default function UserProfileContent() {
  const [activeTab, setActiveTab] = useState("account");
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const handleLogout = async ()=>{
    const response = await api.post('register/logout/')
    if(response.status === 200){
      dispatch(logout())
      navigate('/')
    }
    
  }

  return (
<div className="min-h-screen flex flex-col"> {/* Use flex-col for proper layout */}
<div className="container mx-auto px-4 py-8 flex-1"> {/* flex-1 ensures it takes up remaining space */}
  <Tabs defaultValue="account" className="w-full flex" onValueChange={setActiveTab}>
    {/* TabsList (Menu) on the left with fixed height */}
    <TabsList className="w-1/4 flex flex-col items-start space-y-2 pt-20 h-[calc(100vh-250px)] bg-gray-100 overflow-y-auto"> {/* Set height and background */}
      <TabsTrigger value="account" className="w-full text-left">Account Overview</TabsTrigger>
      <TabsTrigger value="addresses" className="w-full text-left">Manage Addresses</TabsTrigger>
      <TabsTrigger value="orders" className="w-full text-left">My Orders</TabsTrigger>
      <TabsTrigger value="wallet" className="w-full text-left">Wallet</TabsTrigger>
      <Button
            onClick={handleLogout}
            className="w-full mt-4 text-left justify-center" // Adjust styling as needed
            variant="ghost" // Use the variant that matches your design
          >
            Logout
      </Button>
    </TabsList>

    {/* TabsContent on the right */}
    <div className="w-3/4 pl-8">
      <TabsContent value="account">
        <AccountOverview />
      </TabsContent>
      <TabsContent value="addresses">
        <ManageAddresses />
      </TabsContent>
      <TabsContent value="orders">
        <MyOrders />
      </TabsContent>
      <TabsContent value="wallet">
        <Wallet />
      </TabsContent>
    </div>
  </Tabs>
</div>

{/* Footer at the bottom */}
<Footer className="mt-auto" /> {/* mt-auto ensures the footer sticks to the bottom */}
</div>
);
}