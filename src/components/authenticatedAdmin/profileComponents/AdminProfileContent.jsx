import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Footer from '../../commoncomponents/Footer';
import api from '@/axios/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/AdminAuthSlice';
import Dashboard from './Dashboard';
import UserManagement from './UserManagement';
import BannerManagement from './BannerManagement';
import Orders from './Orders';
import Coupons from './Coupons';
import CategoryManagement from './CategoryManagement';
import AdminWallet from './AdminWallet';
import AdminProducts from './AdminProducts';
import NotificationManagement from './NotificationManagement';

export default function AdminProfileContent() {
  const { tab } = useParams(); // Get the active tab from the URL
  const [activeTab, setActiveTab] = useState(tab || "dashboard");
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
    navigate(`/admin-profile/${newTab}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        <Tabs value={activeTab} className="w-full flex" onValueChange={handleTabChange}>
          {/* TabsList (Menu) on the left with fixed height */}
          <TabsList className="w-1/4 flex flex-col items-start space-y-2 pt-20 h-[calc(100vh-250px)] bg-gray-100 overflow-y-auto">
            <TabsTrigger value="dashboard" className="w-full text-left">Dashboard</TabsTrigger>
            <TabsTrigger value="categoryManagement" className="w-full text-left">Category Management</TabsTrigger>
            <TabsTrigger value="userManagement" className="w-full text-left">User Management</TabsTrigger>
            <TabsTrigger value="bannerManagement" className="w-full text-left">Banner Management</TabsTrigger>
            <TabsTrigger value ='adminproducts' className="w-full text-left">Product Management</TabsTrigger>
            <TabsTrigger value='notification' className='w-full text-left'>Notification Management</TabsTrigger>
            <TabsTrigger value="orders" className="w-full text-left">Orders</TabsTrigger>
            <TabsTrigger value="coupons" className="w-full text-left">Coupons</TabsTrigger>
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
            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>
            <TabsContent value="categoryManagement">
              <CategoryManagement />
            </TabsContent>
            <TabsContent value="userManagement">
              <UserManagement />
            </TabsContent>
            <TabsContent value='notification'>
              <NotificationManagement/>
            </TabsContent>
            <TabsContent value="bannerManagement">
              <BannerManagement />
            </TabsContent>
            <TabsContent value='adminproducts'>
              <AdminProducts/>
            </TabsContent>
            <TabsContent value="orders">
              <Orders />
            </TabsContent>
            <TabsContent value="coupons">
              <Coupons />
            </TabsContent>
            <TabsContent value="wallet">
              <AdminWallet /> {/* Add AdminWallet Component */}
            </TabsContent>
          </div>
        </Tabs>
      </div>
      <Footer className="mt-auto" />
    </div>
  );
}