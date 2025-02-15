import React, { useState,useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Footer from '../commoncomponents/Footer';
import api from '@/axios/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '@/redux/AdminAuthSlice';

export default function AdminProfileContent() {
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
            <TabsTrigger value="userManagement" className="w-full text-left">User Management</TabsTrigger>
            <TabsTrigger value="notifications" className="w-full text-left">Notifications</TabsTrigger>
            <TabsTrigger value="bannerManagement" className="w-full text-left">Banner Management</TabsTrigger>
            <TabsTrigger value="orders" className="w-full text-left">Orders</TabsTrigger>
            <TabsTrigger value="coupons" className="w-full text-left">Coupons</TabsTrigger>
            <TabsTrigger value="concerns" className="w-full text-left">Concerns</TabsTrigger>
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
            <TabsContent value="userManagement">
              <UserManagement />
            </TabsContent>
            <TabsContent value="notifications">
              <Notifications />
            </TabsContent>
            <TabsContent value="bannerManagement">
              <BannerManagement />
            </TabsContent>
            <TabsContent value="orders">
              <Orders />
            </TabsContent>
            <TabsContent value="coupons">
              <Coupons />
            </TabsContent>
            <TabsContent value="concerns">
              <Concerns />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      <Footer className="mt-auto" />
    </div>
  );
}

function Dashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <p>$10,000</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <p>$5,000</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Commission</CardTitle>
            </CardHeader>
            <CardContent>
              <p>$1,000</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}

function UserManagement() {
  const [activeTable, setActiveTable] = useState("customers");
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1)

  
  // Fetch paginated data from the backend
  const fetchData = async(page = 1) => {
    const endpoint = activeTable === "customers" ? 'admin/customers/' : 'admin/vendors/';
    const url = `${endpoint}?page=${page}`;
    try{
      const response = await api.get(url);
      if(activeTable === 'customers'){
        setCustomers(response.data.results);
      }else{
        setSellers(response.data.results);
      }
      setTotalPages(response.data.total_pages)
    }catch(error){
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(()=>{
    fetchData(currentPage);
  },[activeTable, currentPage]);

  // Function to handle seller verification
  const handleVerifySeller = async (id) => {
  const seller = sellers.find(seller => seller.user__id === id);
  if (seller && !seller.user__is_verified) {
    try {
      // Use PUT or PATCH to update the seller's verification status
      const response = await api.put(`admin/verify-seller/?id=${id}`);
      if (response.status === 200) {
        setSellers(sellers.map(seller => seller.user__id === id ? { ...seller, user__is_verified: true } : seller));
      }
    } catch (error) {
      console.error("Error verifying seller: ", error);
    }
  }
};
  // Function to handle blocking/unblocking users
  const handleBlockUser = async (id, isCustomer) => {
  const endpoint = `admin/block_user/?id=${id}`;
  try {
    // Use PUT or PATCH to update the user's blocked status
    const response = await api.put(endpoint); // Adjust the payload as needed
    if (response.status === 200) {
      if (isCustomer) {
        setCustomers(customers.map(customer => customer.user__id === id ? { ...customer, user__is_blocked: !customer.user__is_blocked } : customer));
      } else {
        setSellers(sellers.map(seller => seller.user__id === id ? { ...seller, user__is_blocked: !seller.user__is_blocked } : seller));
      }
    }
  } catch (error) {
    console.error("Error blocking/unblocking user: ", error);
  }
};

  //Handle page change
  const handlePageChange = (newPage) => {
    if (newPage>= 1 && newPage <= totalPages){
      setCurrentPage(newPage);
    }
  };


  // Filter customers based on search query
  const filteredCustomers = customers.filter(customer =>
    customer.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.user__user__email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone_number_number.includes(searchQuery)
  );

  // Filter sellers based on search query
  const filteredSellers = sellers.filter(seller =>
    seller.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seller.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seller.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seller.user__user__email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seller.phone_number_number.includes(searchQuery)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-4">
          <Button variant={activeTable === "customers" ? "default" : "outline"} onClick={() => setActiveTable("customers")}>Customers</Button>
          <Button variant={activeTable === "sellers" ? "default" : "outline"} onClick={() => setActiveTable("sellers")}>Sellers</Button>
        </div>
        <Input
          placeholder="Search..."
          className="mb-4"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {activeTable === "customers" ? (
          <>
            <table className="w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Blocked</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, index) =>{ 
                  const sequentialIndex = (currentPage - 1) * 10 + index + 1; 
                  return(
                  <tr key={customer.user__id}>
                    <td className="text-center">{sequentialIndex}</td>
                    <td className="text-center">{customer.first_name}</td>
                    <td className="text-center">{customer.last_name}</td>
                    <td className="text-center">{customer.user__email}</td>
                    <td className="text-center">{customer.phone_number}</td>
                    <td className="text-center">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customer.user__is_blocked}
                          onChange={() => handleBlockUser(customer.user__id, true)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                      </label>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </>
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Company Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Verify</th>
                  <th>Blocked</th>
                </tr>
              </thead>
              <tbody>
                {filteredSellers.map((seller,index) => {
                  const sequentialIndex = (currentPage - 1) * 10 + index + 1; 
                  return (
                  <tr key={seller.user__id}>
                    <td className="text-center">{sequentialIndex}</td>
                    <td className="text-center">{seller.first_name}</td>
                    <td className="text-center">{seller.last_name}</td>
                    <td className="text-center">{seller.company_name}</td>
                    <td className="text-center">{seller.user__email}</td>
                    <td className="text-center">{seller.phone_number}</td>
                    <td className="text-center">
                      <Button variant="ghost" size="icon" onClick={() => handleVerifySeller(seller.user__id)}>
                        {seller.user__is_verified ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                      </Button>
                    </td>
                    <td className="text-center">
                      <div className="flex justify-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={seller.user__is_blocked}
                            onChange={() => handleBlockUser(seller.user__id, false)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                        </label>
                      </div>
                    </td>
                  </tr>
                )})}
              </tbody>
            </table>
          </>
        )}

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="mx-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Notifications() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Notification management functionality to be implemented.</p>
      </CardContent>
    </Card>
  );
}

function BannerManagement() {
  const [banners, setBanners] = useState([
    { id: 1, imageUrl: "/banner1.jpg", expiryDate: "2023-12-31" },
    { id: 2, imageUrl: "/banner2.jpg", expiryDate: "2024-01-31" },
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banner Management</CardTitle>
      </CardHeader>
      <CardContent>
        {banners.map(banner => (
          <div key={banner.id} className="mb-4 p-4 border rounded-md">
            <img src={banner.imageUrl} alt={`Banner ${banner.id}`} className="w-full h-32 object-cover" />
            <p>Expiry Date: {banner.expiryDate}</p>
          </div>
        ))}
        <Accordion type="single" collapsible>
          <AccordionItem value="add-banner">
            <AccordionTrigger>Add New Banner</AccordionTrigger>
            <AccordionContent>
              <form className="space-y-4">
                <Input type="file" />
                <Input type="date" placeholder="Expiry Date" />
                <Button type="submit">Add Banner</Button>
              </form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

function Orders() {
  const [orders, setOrders] = useState([
    { id: 1, date: "2023-05-01", total: 99.99, status: "Processing" },
    { id: 2, date: "2023-06-15", total: 149.99, status: "Out for Delivery" },
  ]);

  const handleStatusChange = (id, newStatus) => {
    setOrders(orders.map(order => order.id === id ? { ...order, status: newStatus } : order));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.map(order => (
          <div key={order.id} className="mb-4 p-4 border rounded-md">
            <p>Order #{order.id}</p>
            <p>Date: {order.date}</p>
            <p>Total: ${order.total}</p>
            <div className="flex items-center space-x-2">
              <p>Status:</p>
              <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                <option value="Processing">Processing</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Coupons() {
  const [coupons, setCoupons] = useState([
    { id: 1, code: "SUMMER10", type: "percentage", minOrderValue: 100, maxDiscountValue: 20 },
    { id: 2, code: "FLAT50", type: "flat", minOrderValue: 200, maxDiscountValue: 50 },
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Coupons</CardTitle>
      </CardHeader>
      <CardContent>
        {coupons.map(coupon => (
          <div key={coupon.id} className="mb-4 p-4 border rounded-md">
            <p>Code: {coupon.code}</p>
            <p>Type: {coupon.type}</p>
            <p>Min Order Value: ${coupon.minOrderValue}</p>
            <p>Max Discount Value: ${coupon.maxDiscountValue}</p>
          </div>
        ))}
        <Accordion type="single" collapsible>
          <AccordionItem value="add-coupon">
            <AccordionTrigger>Add New Coupon</AccordionTrigger>
            <AccordionContent>
              <form className="space-y-4">
                <Input placeholder="Coupon Code" />
                <select className="w-full p-2 border rounded-md">
                  <option value="flat">Flat</option>
                  <option value="percentage">Percentage</option>
                </select>
                <Input type="number" placeholder="Min Order Value" />
                <Input type="number" placeholder="Max Discount Value" />
                <Button type="submit">Add Coupon</Button>
              </form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

function Concerns() {
  const [concerns, setConcerns] = useState([
    { id: 1, message: "Issue with product quality", reply: "" },
    { id: 2, message: "Delivery delay", reply: "" },
  ]);

  const handleReplyChange = (id, reply) => {
    setConcerns(concerns.map(concern => concern.id === id ? { ...concern, reply } : concern));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Concerns</CardTitle>
      </CardHeader>
      <CardContent>
        {concerns.map(concern => (
          <div key={concern.id} className="mb-4 p-4 border rounded-md">
            <p>{concern.message}</p>
            <Input placeholder="Reply..." value={concern.reply} onChange={(e) => handleReplyChange(concern.id, e.target.value)} />
            <Button className="mt-2">Send Reply</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}