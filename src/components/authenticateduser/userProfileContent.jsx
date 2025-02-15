import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Edit, Trash2 } from 'lucide-react';
import Footer from '../commoncomponents/Footer';
import api from '@/axios/axiosInstance';
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/AuthSlice';

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






function AccountOverview() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
  });
  const [profilePicture, setProfilePicture] = useState(null); // State for the profile picture file

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('first_name', formData.firstName);
    formDataToSend.append('last_name', formData.lastName);
    formDataToSend.append('email', formData.email);
    formDataToSend.append('phone_number', formData.phoneNumber);
    if (profilePicture) {
      formDataToSend.append('profilePicture', profilePicture);
    }

    try{
      const response = await api.post("/customer/update-profile/", formDataToSend)
      if(response.status === 200){
        console.log(response.data)
        toast.success("Profile updation successfull")
      }
    }catch(error){
      if(error.response && error.response.data){
        const errorMessages = Object.values(error.response.data).flat();
        toast.error(errorMessages[0] || "Updation Failed");
      }else{
        toast.error("Updation Failed.");
      }
    }
  }


  return (
    <Card>
    <CardHeader>
      <CardTitle>Account Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="flex flex-col items-center mb-6">
        <Avatar className="w-24 h-24 mb-4">
          <AvatarImage
            src={profilePicture ? URL.createObjectURL(profilePicture) : '/placeholder-avatar.jpg'}
            alt="User"
          />
          <AvatarFallback>UN</AvatarFallback>
        </Avatar>
        <input
          type="file"
          id="profilePicture"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <label htmlFor="profilePicture" className="cursor-pointer">
          <Button variant="outline" asChild>
            <span>Change Picture</span>
          </Button>
        </label>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <Input
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
          />
          <Input
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />
        <Input
          type="tel"
          name="phoneNumber"
          pattern="^[1-9][0-9]{9}$"
          placeholder="Phone Number"
          value={formData.phoneNumber}
          onChange={handleChange}
        />
        <Button type="submit" className="w-full">
          Update Profile
        </Button>
      </form>
    </CardContent>
  </Card>
  );
}






function ManageAddresses() {
  const [addresses, setAddresses] = useState([
    { id: 1, street: "123 Main St", city: "Anytown", state: "State", country: "Country", pincode: "12345" },
    { id: 2, street: "456 Elm St", city: "Othertown", state: "State", country: "Country", pincode: "67890" },
  ]);

  const handleDelete = (id) => {
    setAddresses(addresses.filter(address => address.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Addresses</CardTitle>
      </CardHeader>
      <CardContent>
        {addresses.map((address) => (
          <div key={address.id} className="mb-4 p-4 border rounded-md relative group">
            <p>{address.street}</p>
            <p>{`${address.city}, ${address.state}, ${address.country} ${address.pincode}`}</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(address.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
        <Accordion type="single" collapsible>
          <AccordionItem value="add-address">
            <AccordionTrigger>Add New Address</AccordionTrigger>
            <AccordionContent>
              <form className="space-y-4">
                <Input placeholder="Street Address" />
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="City" />
                  <Input placeholder="State" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input placeholder="Country" />
                  <Input placeholder="Pincode" />
                </div>
                <Button type="submit">Add Address</Button>
              </form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}






function MyOrders() {
  const orders = [
    { id: 1, date: "2023-05-01", total: 99.99, status: "Delivered" },
    { id: 2, date: "2023-06-15", total: 149.99, status: "Processing" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.map((order) => (
          <div key={order.id} className="mb-4 p-4 border rounded-md">
            <p>Order #{order.id}</p>
            <p>Date: {order.date}</p>
            <p>Total: ${order.total}</p>
            <p>Status: {order.status}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}






function Wallet() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Wallet functionality to be implemented.</p>
      </CardContent>
    </Card>
  );
}