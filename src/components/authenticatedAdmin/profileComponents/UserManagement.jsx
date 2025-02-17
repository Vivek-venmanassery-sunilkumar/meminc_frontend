import { Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState,useEffect } from 'react';
import api from '@/axios/axiosInstance';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';




export default function UserManagement() {
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