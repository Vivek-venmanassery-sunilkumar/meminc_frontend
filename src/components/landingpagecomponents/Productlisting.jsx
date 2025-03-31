import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/axios/axiosInstance";
import toast from "react-hot-toast";

export default function ProductListing() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariants, setSelectedVariants] = useState({});

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/customer/products/");
        setProducts(response.data.results || []);
        
        // Initialize selected variants with the first variant of each product
        const initialVariants = {};
        response.data.results?.forEach(product => {
          if (product.variants?.length > 0) {
            initialVariants[product.id] = product.variants[0].id;
          }
        });
        setSelectedVariants(initialVariants);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast.error("Failed to load products");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Format price in INR
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Handle variant selection
  const handleVariantChange = (productId, variantId) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variantId,
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 mt-16 font-gentium">
        <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="bg-white shadow-md animate-pulse">
              <div className="h-48 bg-gray-200 rounded-t-lg"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-full mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
              <CardFooter className="p-4 border-t">
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 mt-16 font-gentium">
      <h2 className="text-2xl font-bold mb-6">Featured Products</h2>
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            const selectedVariantId = selectedVariants[product.id] || product.variants[0]?.id;
            const selectedVariant = product.variants?.find(v => v.id === selectedVariantId) || product.variants?.[0];
            const isOutOfStock = selectedVariant?.is_out_of_stock;

            return (
              <Card key={product.id} className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full">
                <Link to="/login" className="flex-grow">
                  <div className="relative">
                    <img
                      src={selectedVariant?.variant_image || product.product_image || "/placeholder.svg"}
                      alt={product.product_name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {isOutOfStock && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="destructive">Out of Stock</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="mb-1 text-sm text-gray-500">{product.company_name}</div>
                    <h3 className="text-lg font-semibold line-clamp-2 h-12">{product.product_name}</h3>
                    {product.variants?.length > 1 && (
                      <div className="mt-4">
                        <select
                          className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5859]"
                          value={selectedVariantId}
                          onChange={(e) => handleVariantChange(product.id, Number(e.target.value))}
                        >
                          {product.variants.map((variant) => (
                            <option key={variant.id} value={variant.id}>
                              {variant.name} {variant.is_out_of_stock ? "(Out of Stock)" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    <div className="mt-3 text-xl font-bold text-[#4A5859]">
                      {selectedVariant ? formatPrice(selectedVariant.price) : "N/A"}
                    </div>
                  </CardContent>
                </Link>
                <CardFooter className="p-4 border-t mt-auto">
                  <Button 
                    className="w-full bg-[#4A5859] hover:bg-[#3A4849] text-white"
                    asChild
                  >
                    <Link to="/login">View Details</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No products available at the moment</p>
        </div>
      )}
    </div>
  );
}