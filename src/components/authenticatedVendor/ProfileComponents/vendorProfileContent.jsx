import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Footer from "../../commoncomponents/Footer";
import api from "@/axios/axiosInstance";
import 'react-image-crop/dist/ReactCrop.css';
import { useDispatch } from "react-redux";
import { logout } from "@/redux/AuthSlice";
import { useNavigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import Orders from './Orders'
import Wallet from "./Wallet";
import Products from "./Products";


export default function VendorProfileContent() {
  const [activeTab, setActiveTab] = useState("dashboard");
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
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        <Tabs defaultValue="dashboard" className="w-full flex" onValueChange={setActiveTab}>
          {/* TabsList (Menu) on the left with fixed height */}
          <TabsList className="w-1/4 flex flex-col items-start space-y-2 pt-20 h-[calc(100vh-250px)] bg-gray-100 overflow-y-auto">
            <TabsTrigger value="dashboard" className="w-full text-left">Dashboard</TabsTrigger>
            <TabsTrigger value="products" className="w-full text-left">Products</TabsTrigger>
            <TabsTrigger value="orders" className="w-full text-left">Orders</TabsTrigger>
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
            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>
            <TabsContent value="products">
              <Products />
            </TabsContent>
            <TabsContent value="orders">
              <Orders />
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






