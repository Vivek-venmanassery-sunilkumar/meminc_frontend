import { Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from 'react';
import api from '@/axios/axiosInstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function UserManagement() {
  const [activeTable, setActiveTable] = useState("customers");
  const [searchQuery, setSearchQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [customerPage, setCustomerPage] = useState(1);
  const [sellerPage, setSellerPage] = useState(1);
  const [customerTotalPages, setCustomerTotalPages] = useState(1);
  const [sellerTotalPages, setSellerTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Fetch paginated data from the backend with search
  const fetchData = async(page = 1, search = "") => {
    setLoading(true);
    const endpoint = activeTable === "customers" ? 'admin/customers/' : 'admin/vendors/';
    const url = `${endpoint}?page=${page}&search=${search}`;
    try {
      const response = await api.get(url);
      if(activeTable === 'customers') {
        setCustomers(response.data.results);
        setCustomerTotalPages(response.data.total_pages);
      } else {
        setSellers(response.data.results);
        setSellerTotalPages(response.data.total_pages);
      }
    } catch(error) {
      console.error("Error fetching data: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset to page 1 when switching tabs or search query changes
    const timer = setTimeout(() => {
      if (activeTable === "customers") {
        setCustomerPage(1);
        fetchData(1, searchQuery);
      } else {
        setSellerPage(1);
        fetchData(1, searchQuery);
      }
    }, 500); // Debounce delay

    return () => clearTimeout(timer);
  }, [activeTable, searchQuery]);

  // Handle page changes
  useEffect(() => {
    fetchData(activeTable === "customers" ? customerPage : sellerPage, searchQuery);
  }, [customerPage, sellerPage]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTable(tab);
    setSearchQuery("");
  };

  // Function to handle seller verification
  const handleVerifySeller = async (id) => {
    const seller = sellers.find(seller => seller.user__id === id);
    if (seller && !seller.user__is_verified) {
      try {
        const response = await api.put(`admin/verify-seller/?id=${id}`);
        if (response.status === 200) {
          setSellers(sellers.map(seller => 
            seller.user__id === id ? { ...seller, user__is_verified: true } : seller
          ));
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
      const response = await api.put(endpoint);
      if (response.status === 200) {
        if (isCustomer) {
          setCustomers(customers.map(customer => 
            customer.user__id === id ? { ...customer, user__is_blocked: !customer.user__is_blocked } : customer
          ));
        } else {
          setSellers(sellers.map(seller => 
            seller.user__id === id ? { ...seller, user__is_blocked: !seller.user__is_blocked } : seller
          ));
        }
      }
    } catch (error) {
      console.error("Error blocking/unblocking user: ", error);
    }
  };

  // Handle page change for customers
  const handleCustomerPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= customerTotalPages) {
      setCustomerPage(newPage);
    }
  };

  // Handle page change for sellers
  const handleSellerPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= sellerTotalPages) {
      setSellerPage(newPage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-4">
          <Button 
            variant={activeTable === "customers" ? "default" : "outline"} 
            onClick={() => handleTabChange("customers")}
          >
            Customers
          </Button>
          <Button 
            variant={activeTable === "sellers" ? "default" : "outline"} 
            onClick={() => handleTabChange("sellers")}
          >
            Sellers
          </Button>
        </div>
        
        <Input
          placeholder="Search by name, email, or phone..."
          className="mb-4"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : activeTable === "customers" ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">First Name</th>
                    <th className="p-3 text-left">Last Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.length > 0 ? (
                    customers.map((customer, index) => (
                      <tr key={customer.user__id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3">{(customerPage - 1) * 10 + index + 1}</td>
                        <td className="p-3">{customer.first_name || '-'}</td>
                        <td className="p-3">{customer.last_name || '-'}</td>
                        <td className="p-3">{customer.user__email}</td>
                        <td className="p-3">{customer.phone_number || '-'}</td>
                        <td className="p-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={customer.user__is_blocked}
                              onChange={() => handleBlockUser(customer.user__id, true)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                            <span className="ml-2 text-sm font-medium">
                              {customer.user__is_blocked ? 'Blocked' : 'Active'}
                            </span>
                          </label>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="p-4 text-center text-gray-500">
                        No customers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Customer pagination */}
            <div className="flex justify-between items-center mt-4">
              <div>
                <span className="text-sm text-gray-600">
                  Showing {(customerPage - 1) * 10 + 1} to {Math.min(customerPage * 10, customers.length)} of {customers.length} entries
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleCustomerPageChange(customerPage - 1)}
                  disabled={customerPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleCustomerPageChange(customerPage + 1)}
                  disabled={customerPage === customerTotalPages || customers.length === 0}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">First Name</th>
                    <th className="p-3 text-left">Last Name</th>
                    <th className="p-3 text-left">Company</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Verified</th>
                    <th className="p-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sellers.length > 0 ? (
                    sellers.map((seller, index) => (
                      <tr key={seller.user__id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="p-3">{(sellerPage - 1) * 10 + index + 1}</td>
                        <td className="p-3">{seller.first_name || '-'}</td>
                        <td className="p-3">{seller.last_name || '-'}</td>
                        <td className="p-3">{seller.company_name || '-'}</td>
                        <td className="p-3">{seller.user__email}</td>
                        <td className="p-3">{seller.phone_number || '-'}</td>
                        <td className="p-3">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleVerifySeller(seller.user__id)}
                            disabled={seller.user__is_verified}
                          >
                            {seller.user__is_verified ? 
                              <CheckCircle className="h-5 w-5 text-green-500" /> : 
                              <XCircle className="h-5 w-5 text-red-500" />}
                          </Button>
                        </td>
                        <td className="p-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={seller.user__is_blocked}
                              onChange={() => handleBlockUser(seller.user__id, false)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                            <span className="ml-2 text-sm font-medium">
                              {seller.user__is_blocked ? 'Blocked' : 'Active'}
                            </span>
                          </label>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="p-4 text-center text-gray-500">
                        No sellers found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {/* Seller pagination */}
            <div className="flex justify-between items-center mt-4">
              <div>
                <span className="text-sm text-gray-600">
                  Showing {(sellerPage - 1) * 10 + 1} to {Math.min(sellerPage * 10, sellers.length)} of {sellers.length} entries
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleSellerPageChange(sellerPage - 1)}
                  disabled={sellerPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleSellerPageChange(sellerPage + 1)}
                  disabled={sellerPage === sellerTotalPages || sellers.length === 0}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}