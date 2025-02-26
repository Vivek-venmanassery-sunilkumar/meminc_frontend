
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/axios/axiosInstance";
import extractErrorMessages from "../commoncomponents/errorHandlefunc";
import { useDispatch, useSelector } from "react-redux"; // Import useSelector
import { clearProductDetails, setProductDetails } from "@/redux/ProductDetailsSlice";
import toast from "react-hot-toast";
import { updateCartItem } from "@/redux/cartSlice"; // Import the action

export default function ProductListing({ products, selectedBrand, handleBrandFilter, selectedVariants, setSelectedVariants }) {
    const [cartStatus, setCartStatus] = useState({});
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.items); // Get cart items from Redux store

    // Add product to cart with selected variant
    const addToCart = async (product, variant) => {
        try {
            const response = await api.post('/cart/', { variant_id: variant.id });
            if (response.status === 200) {
                dispatch(updateCartItem(response.data)); // Dispatch updated cart item to Redux
                setCartStatus(prev => ({ ...prev, [product.id]: true })); // Update local cart status
                toast.success("Added to cart successfully!");
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const errors = extractErrorMessages(error.response.data);
                const errorMessage = errors.join(", ");
                toast.error(errorMessage);
            } else {
                toast.error("Failed to add to cart.");
            }
        }
    };

    // Check if a variant is already in the cart
    const isVariantInCart = (variantId) => {
        return cartItems.some((item) => item.variant_id === variantId);
    };

    // Extract unique brands for filtering dropdown
    const brands = ["All", ...new Set(products.map((product) => product.company_name))];

    // Handle variant selection
    const handleVariantChange = (productId, variantId) => {
        setSelectedVariants((prev) => ({
            ...prev,
            [productId]: variantId,
        }));
    };

    // Format price in INR
    const formatPrice = (price) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price);

    const handleCardClick = async (productId) => {
        try {
            const response = await api.get(`vendor/products/${productId}`);
            if (response.status === 200) {
                dispatch(clearProductDetails());
                dispatch(setProductDetails({ ...response.data }));
                navigate('product-view');
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const errors = extractErrorMessages(error.response.data);
                const errorMessage = errors.join(", ");
                toast.error(errorMessage);
            } else {
                toast.error("Failed to fetch product details.");
            }
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 font-gentium">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <h2 className="text-2xl font-bold mb-2 sm:mb-0">Featured Products</h2>
                <div className="flex items-center space-x-2">
                    <span>Filter by Brand:</span>
                    <select className="border rounded p-1" value={selectedBrand} onChange={(e) => handleBrandFilter(e.target.value)}>
                        {brands.map((brand) => (
                            <option key={brand} value={brand}>{brand}</option>
                        ))}
                    </select>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => {
                    const selectedVariantId = selectedVariants[product.id] || product.variants[0]?.id;
                    const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId) || product.variants[0];

                    return (
                        <div key={product.id} onClick={() => handleCardClick(product.id)}>
                            <Card className="bg-[#F0EAD6] text-[#4A5859] cursor-pointer">
                                <CardContent className="p-4">
                                    {product.product_image && <img src={product.product_image} alt={product.product_name} className="w-full h-48 object-cover rounded mb-4" />}
                                    <p className="text-lg font-bold">{product.product_name}</p>
                                    <p className="text-sm text-gray-600">{product.company_name}</p>
                                    <select
                                        className="border rounded p-1 w-full mt-2"
                                        value={selectedVariantId}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => handleVariantChange(product.id, parseInt(e.target.value))}
                                    >
                                        {product.variants.map((variant) => (
                                            <option key={variant.id} value={variant.id}>{variant.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-lg font-bold mt-2">{formatPrice(selectedVariant?.price)}</p>
                                </CardContent>
                                <CardFooter className="flex justify-between items-center p-4 bg-[#E6DCC8]">
                                    <Button
                                        variant="outline"
                                        className="bg-[#4A5859] text-white hover:bg-[#3A4849]"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            addToCart(product, selectedVariant);
                                        }}
                                        disabled={isVariantInCart(selectedVariantId)} // Disable if variant is in cart
                                    >
                                        {isVariantInCart(selectedVariantId) ? "Added to Cart" : "Add to Cart"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}