

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Footer from '../commoncomponents/Footer';
import api from '@/axios/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/AuthSlice';
import AccountOverview from './ProfileComponents/Accountoverview';
import ManageAddresses from './ProfileComponents/ManageAddresses';
import MyOrders from './ProfileComponents/MyOrders';
import Wallet from './ProfileComponents/Wallet';

export default function UserProfileContent() {
  const { tab } = useParams(); // Get the active tab from the URL
  const [activeTab, setActiveTab] = useState(tab || "account");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Update the active tab when the URL changes
  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  const handleLogout = async () => {
    const response = await api.post('register/logout/');
    if (response.status === 200) {
      dispatch(logout());
      navigate('/');
    }
  };

  // Update the URL when the tab changes
  const handleTabChange = (newTab) => {
    setActiveTab(newTab);
    navigate(`/customer-profile/${newTab}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        <Tabs value={activeTab} className="w-full flex" onValueChange={handleTabChange}>
          {/* TabsList (Menu) on the left with fixed height */}
          <TabsList className="w-1/4 flex flex-col items-start space-y-2 pt-20 h-[calc(100vh-250px)] bg-gray-100 overflow-y-auto">
            <TabsTrigger value="account-overview" className="w-full text-left">Account Overview</TabsTrigger>
            <TabsTrigger value="addresses" className="w-full text-left">Manage Addresses</TabsTrigger>
            <TabsTrigger value="orders" className="w-full text-left">My Orders</TabsTrigger>
            <TabsTrigger value="wallet" className="w-full text-left">Wallet</TabsTrigger>
            <Button
              onClick={handleLogout}
              className="w-full mt-4 text-left justify-center"
              variant="ghost"
            >
              Logout
            </Button>
          </TabsList>

          {/* TabsContent on the right */}
          <div className="w-3/4 pl-8">
            <TabsContent value="account-overview">
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
      <Footer className="mt-auto" />
    </div>
  );
}