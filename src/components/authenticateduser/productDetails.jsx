import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Minus, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { updateCartItem, setCartData } from '../../redux/CartSlice'; // Import setCartData
import api from "@/axios/axiosInstance"; // Import your Axios instance

export default function ProductDetails() {
  const dispatch = useDispatch();
  const product = useSelector((state) => state.product);
  const cart = useSelector((state) => state.cart);

  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const cartItem = cart.items.find((item) => item.variant_id === selectedVariant.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
  };

  const handleQuantityChange = async (action) => {
    setIsLoading(true);

    try {
      // Use the Axios instance to send the request
      const response = await api.post("/cart/", {
        variant_id: selectedVariant.id,
        action, // Send the action ("increase" or "decrease")
      });

      if (response.status === 204) {
        // Item was removed, fetch the entire cart again
        const cartResponse = await api.get("/cart/");
        dispatch(setCartData(cartResponse.data)); // Update Redux store with the full cart data
      } else {
        // Item was updated, update the Redux store with the response data
        dispatch(updateCartItem(response.data));
      }
    } catch (error) {
      console.error("Failed to update cart:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (!product.id) {
    return <div>Loading product details...</div>;
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-8 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-lg p-6 shadow-2xl">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg cursor-zoom-in" onClick={handleImageZoom}>
            <img
              src={selectedImage.url || "/placeholder.svg"}
              alt={product.name}
              className={cn("w-full h-full object-cover transition-transform duration-300", isZoomed && "scale-150")}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {product.images.map((image) => (
              <div
                key={image.id}
                className={cn(
                  "w-20 h-20 rounded-md overflow-hidden cursor-pointer border-2",
                  selectedImage.id === image.id ? "border-[#4A5859]" : "border-transparent",
                )}
                onClick={() => handleImageClick(image)}
              >
                <img
                  src={image.url || "/placeholder.svg"}
                  alt={`${product.name} thumbnail`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6 mt-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500">Premium Meat Market</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Select Variant</h3>
              {product.variants.map((variant) => (
                <Card
                  key={variant.id}
                  className={cn(
                    "p-4 cursor-pointer transition-colors",
                    selectedVariant.id === variant.id ? "bg-[#4A5859] text-white" : "hover:bg-gray-50",
                  )}
                  onClick={() => handleVariantSelect(variant)}
                >
                  <div className="flex justify-between items-center">
                    <span>
                      {variant.quantity} {variant.variant_unit}
                    </span>
                    <span className="font-semibold">₹{variant.price}</span>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {selectedVariant.is_out_of_stock ? (
                <Button
                  className="w-full bg-gray-400 text-white"
                  disabled
                >
                  Out of Stock
                </Button>
              ) : quantityInCart === 0 ? (
                <Button
                  className="w-full bg-[#4A5859] hover:bg-[#3A4849] text-white"
                  onClick={() => handleQuantityChange("increase")}
                  disabled={isLoading}
                >
                  {isLoading ? "Adding..." : "Add to Cart"}
                </Button>
              ) : (
                <div className="flex justify-center items-center gap-4 w-full">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange("decrease")}
                    disabled={isLoading}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-semibold">{quantityInCart}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange("increase")}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button variant="outline" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
            </div>

            {/* Product Details Section */}
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h3>
              <p className="text-gray-700">{product.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}