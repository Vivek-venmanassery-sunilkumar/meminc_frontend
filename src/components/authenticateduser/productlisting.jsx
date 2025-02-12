

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function ProductListing({ products, selectedBrand, handleBrandFilter, selectedVariants, setSelectedVariants }) {
    const [cart, setCart] = useState([]);

    // Add product to cart with selected variant
    const addToCart = (product, variant) => {
        setCart([...cart, { ...product, selectedVariant: variant }]);
    };

    // Extract unique brands for filtering dropdown
    const brands = ["All", ...new Set(products.map((product) => product.company_name))];

    // Handle variant selection
    const handleVariantChange = (productId, variantId) => {
        setSelectedVariants((prev) => ({
            ...prev,
            [productId]: variantId, // Store selected variant per product
        }));
    };

    // Format price in INR
    const formatPrice = (price) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(price);

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
                        <Card key={product.id} className="bg-[#F0EAD6] text-[#4A5859]">
                            <CardContent className="p-4">
                                {product.product_image && <img src={product.product_image} alt={product.product_name} className="w-full h-48 object-cover rounded mb-4" />}
                                <p className="text-lg font-bold">{product.product_name}</p>
                                <p className="text-sm text-gray-600">{product.company_name}</p>
                                <select
                                    className="border rounded p-1 w-full mt-2"
                                    value={selectedVariantId}
                                    onChange={(e) => handleVariantChange(product.id, parseInt(e.target.value))}
                                >
                                    {product.variants.map((variant) => (
                                        <option key={variant.id} value={variant.id}>{variant.name}</option>
                                    ))}
                                </select>
                                <p className="text-lg font-bold mt-2">{formatPrice(selectedVariant?.price)}</p>
                            </CardContent>
                            <CardFooter className="flex justify-between items-center p-4 bg-[#E6DCC8]">
                                <Button variant="outline" className="bg-[#4A5859] text-white hover:bg-[#3A4849]" onClick={() => addToCart(product, selectedVariant)}>Add to Cart</Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

