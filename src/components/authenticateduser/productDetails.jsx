import { useState } from "react";
import { useSelector } from "react-redux"; // Import useSelector
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Minus, Heart } from "lucide-react";
import { cn } from "@/lib/utils";


export default function ProductDetails() {
  // Fetch product details from the Redux store
  const product = useSelector((state) => state.product);

  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setQuantity(0);
  };

  const handleQuantityChange = (action) => {
    if (action === "increase") {
      setQuantity(quantity + 1);
    } else if (action === "decrease") {
      if (quantity === 1) {
        setQuantity(0);
      } else {
        setQuantity(quantity - 1);
      }
    }
  };

  const handleAddToCart = () => {
    setQuantity(1);
  };

  const handleImageZoom = () => {
    setIsZoomed(!isZoomed);
  };

  // If no product data is available, show a loading state or a message
  if (!product.id) {
    return <div>Loading product details...</div>;
  }

  return (
    <div className="container mx-auto px-4 pt-24 pb-8 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-lg p-6 shadow-2xl"> {/* Increased shadow */}
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
        <div className="space-y-6 mt-8"> {/* Added margin-top to align details below the image */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-sm text-gray-500">Premium Meat Market</p>
          </div>

          <div className="space-y-4">
            <p className="text-gray-700">{product.description}</p>

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
              {quantity === 0 ? (
                <Button className="w-full bg-[#4A5859] hover:bg-[#3A4849] text-white" onClick={handleAddToCart}>
                  Add to Cart
                </Button>
              ) : (
                <div className="flex items-center gap-4 w-full">
                  <Button variant="outline" size="icon" onClick={() => handleQuantityChange("decrease")}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-semibold">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={() => handleQuantityChange("increase")}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Button variant="outline" size="icon">
                <Heart className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Removed product category and stock details */}
        </div>
      </div>
    </div>
  );
}