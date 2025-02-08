import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Edit, Trash2 } from 'lucide-react';
import Footer from '../commoncomponents/Footer';

export default function UserProfileContent() {
  const [activeTab, setActiveTab] = useState("account");

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center mb-6">
          <Avatar className="w-24 h-24 mb-4">
            <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
            <AvatarFallback>UN</AvatarFallback>
          </Avatar>
          <Button variant="outline">Change Picture</Button>
        </div>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="First Name" />
            <Input placeholder="Last Name" />
          </div>
          <Input type="email" placeholder="Email" />
          <Input type="tel" placeholder="Phone Number" />
          <Button type="submit" className="w-full">Update Profile</Button>
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