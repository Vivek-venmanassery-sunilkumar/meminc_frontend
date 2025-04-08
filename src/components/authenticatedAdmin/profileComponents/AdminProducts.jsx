import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import api from '@/axios/axiosInstance';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';

export default function AdminProducts() {
  // ==================== State Management ====================
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const ITEMS_PER_PAGE = 10; // Define items per page

  // ==================== Data Fetching Functions ====================

  // Fetch paginated products from backend
  const fetchProducts = async (page = 1) => {
    try {
      const response = await api.get('/admin/products-fetch/', {
        params: {
          page: page,
          page_size: ITEMS_PER_PAGE,
        },
      });
      if (response.data) {
        setProducts(response.data.results);
        setTotalProducts(response.data.count);
        setTotalPages(Math.ceil(response.data.count / ITEMS_PER_PAGE));
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products. Please try again.");
    }
  };

  // Handle product block/unblock
  const handleBlockProduct = async (productId, isCurrentlyBlocked) => {
    try {
      const response = await api.post(`/admin/block-product/${productId}/`);
      if (response.status === 200) {
        toast.success(`Product ${isCurrentlyBlocked ? 'unblocked' : 'blocked'} successfully`);
        // Update local state to reflect the change
        setProducts(products.map(product => 
          product.id === productId 
            ? { ...product, is_blocked: !isCurrentlyBlocked } 
            : product
        ));
      }
    } catch (error) {
      console.error("Failed to update product status:", error);
      toast.error("Failed to update product status. Please try again.");
    }
  };

  // ==================== Effect Hooks ====================
  
  // Initial product fetch on page change
  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ==================== Render Component ====================
  return (
    <Card>
      <CardHeader>
        <CardTitle>Products Management</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search */}
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Search products by name, brand or category..."
            className="w-1/2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Image</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Brand</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Variants</th>
                <th className="text-left p-3">Price Range</th>
                <th className="text-left p-3">Stock Status</th>
                <th className="text-left p-3">Block</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => {
                // Calculate price range
                const prices = product.variants.map(v => v.price);
                const minPrice = Math.min(...prices);
                const maxPrice = Math.max(...prices);
                const priceRange = minPrice === maxPrice 
                  ? `₹${minPrice.toFixed(2)}` 
                  : `₹${minPrice.toFixed(2)} - ₹${maxPrice.toFixed(2)}`;
                
                // Calculate total stock
                const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
                const stockStatus = totalStock > 0 ? 'In Stock' : 'Out of Stock';

                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                    <td className="p-3">
                      <img
                        src={product.product_image}
                        alt={product.product_name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    </td>
                    <td className="p-3 font-medium">{product.product_name}</td>
                    <td className="p-3">{product.brand}</td>
                    <td className="p-3">{product.category}</td>
                    <td className="p-3">
                      <div className="space-y-1">
                        {product.variants.map(variant => (
                          <div key={variant.id} className="text-sm">
                            <span className="font-medium">{variant.name}</span>
                            <span className="text-gray-500 ml-2">(₹{variant.price.toFixed(2)}, Stock: {variant.stock})</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3">{priceRange}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        totalStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {stockStatus}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={product.is_blocked}
                          onCheckedChange={() => handleBlockProduct(product.id, product.is_blocked)}
                          id={`product-status-${product.id}`}
                        />
                        <label htmlFor={`product-status-${product.id}`} className="text-sm">
                          {product.is_blocked ? 'Blocked' : 'Active'}
                        </label>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing page {currentPage} of {totalPages} (Total products: {totalProducts})
          </div>
          <div className="flex gap-2">
            <Button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              variant="outline"
            >
              Previous
            </Button>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
              variant="outline"
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}