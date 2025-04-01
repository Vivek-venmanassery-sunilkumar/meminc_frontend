import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Filter, ShoppingCart, X, ChevronDown, ChevronUp } from "lucide-react";
import api from "@/axios/axiosInstance";
import extractErrorMessages from "../commoncomponents/errorHandlefunc";
import { clearProductDetails, setProductDetails } from "@/redux/ProductDetailsSlice";
import { updateCartItem } from "@/redux/CartSlice";
import toast from "react-hot-toast";

export default function ProductListing({
    products: initialProducts,
    selectedBrand,
    handleBrandFilter,
    selectedVariants,
    setSelectedVariants
}) {
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState("");
    const [cartStatus, setCartStatus] = useState({});
    const [products, setProducts] = useState(initialProducts);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [maxPrice, setMaxPrice] = useState(10000);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState(selectedBrand !== "All" ? [selectedBrand] : []);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        brands: true,
        price: true,
    });
    const [pagination, setPagination] = useState({
        count: initialProducts.length,
        totalPages: 1,
        next: null,
        previous: null,
    });

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cartItems = useSelector((state) => state.cart.items);

    // Format price in INR
    const formatPrice = (price) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(price);
    };

    // Fetch filter options on component mount
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                // Fetch categories
                const categoriesResponse = await api.get("admin/categories/");
                const enabledCategories = categoriesResponse.data.filter(category => category.is_enabled);
                setCategories(enabledCategories);

                // Fetch brands
                const brandsResponse = await api.get("vendor/brands/");
                setBrands(brandsResponse.data.brands);

                // Find max price from products
                const highestPrice = Math.max(
                    ...initialProducts.flatMap((product) => product.variants.map((variant) => variant.price)),
                    10000
                );
                setMaxPrice(highestPrice);
                setPriceRange([0, highestPrice]);
            } catch (error) {
                console.error("Failed to fetch filter options:", error);
                toast.error("Failed to load filter options");
            }
        };

        fetchFilterOptions();
    }, [initialProducts]);

    // Initialize search term from navigation state
    useEffect(() => {
        if (location.state?.searchQuery) {
            setSearchTerm(location.state.searchQuery);
            // Clear the navigation state after using it
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, location.pathname, navigate]);

    // Initialize filters from URL on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        
        const urlCategories = params.get('categories');
        if (urlCategories) {
            setSelectedCategories(urlCategories.split(',').map(Number));
        }

        const urlBrands = params.get('brands');
        if (urlBrands) {
            setSelectedBrands(urlBrands.split(','));
        }

        const urlMinPrice = params.get('min_price');
        const urlMaxPrice = params.get('max_price');
        if (urlMinPrice || urlMaxPrice) {
            setPriceRange([
                Number(urlMinPrice || 0),
                Number(urlMaxPrice || maxPrice)
            ]);
        }
    }, [maxPrice]);

    // Apply filters
    const applyFilters = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();

            if (searchTerm) {
                params.set('search', searchTerm);
            }
            
            if (selectedCategories.length > 0) {
                params.set('categories', selectedCategories.join(','));
            }

            if (selectedBrands.length > 0) {
                params.set('brands', selectedBrands.join(','));
            }

            if (priceRange[0] > 0 || priceRange[1] < maxPrice) {
                params.set('min_price', priceRange[0]);
                params.set('max_price', priceRange[1]);
            }

            // Update URL first
            navigate(`?${params.toString()}`, { replace: true });

            const response = await api.get(`/customer/filter/?${params.toString()}`);
            setProducts(response.data.results);
            setPagination({
                count: response.data.count,
                totalPages: response.data.total_pages,
                next: response.data.next,
                previous: response.data.previous,
            });
        } catch (error) {
            console.error("Failed to apply filters:", error);
            if (error.response && error.response.data) {
                const errors = extractErrorMessages(error.response.data);
                toast.error(errors.join(", "));
            } else {
                toast.error("Failed to apply filters");
            }
            setProducts(initialProducts);
            setPagination({
                count: initialProducts.length,
                totalPages: 1,
                next: null,
                previous: null,
            });
        } finally {
            setLoading(false);
        }
    }, [searchTerm, selectedCategories, selectedBrands, priceRange, maxPrice, navigate, initialProducts]);

    // Apply filters when filter selections change
    useEffect(() => {
        const hasActiveFilters = searchTerm ||
                               selectedCategories.length > 0 || 
                               selectedBrands.length > 0 || 
                               priceRange[0] > 0 || 
                               priceRange[1] < maxPrice;
        
        if (hasActiveFilters) {
            applyFilters();
        } else {
            setProducts(initialProducts);
            setPagination({
                count: initialProducts.length,
                totalPages: 1,
                next: null,
                previous: null,
            });
        }
    }, [searchTerm, selectedCategories, selectedBrands, priceRange, applyFilters, initialProducts, maxPrice]);

    // Reset filters
    const resetFilters = () => {
        setSearchTerm('');
        setSelectedCategories([]);
        setSelectedBrands([]);
        setPriceRange([0, maxPrice]);
        navigate('?', { replace: true });
        setProducts(initialProducts);
        setPagination({
            count: initialProducts.length,
            totalPages: 1,
            next: null,
            previous: null,
        });
    };

    // Handle category selection
    const handleCategoryChange = (category) => {
        setSelectedCategories((prev) =>
            prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
        );
    };

    // Handle brand selection
    const handleBrandChange = (brand) => {
        setSelectedBrands((prev) => (prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]));
    };

    // Toggle section expansion
    const toggleSection = (section) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    // Add product to cart with selected variant
    const addToCart = async (product, variant) => {
        try {
            const response = await api.post("/cart/", { variant_id: variant.id });
            if (response.status === 200) {
                dispatch(updateCartItem(response.data));
                setCartStatus((prev) => ({ ...prev, [product.id]: true }));
                toast.success("Added to cart successfully!");
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const errors = extractErrorMessages(error.response.data);
                toast.error(errors.join(", "));
            } else {
                toast.error("Failed to add to cart.");
            }
        }
    };

    // Check if a variant is already in the cart
    const isVariantInCart = (variantId) => {
        return cartItems.some((item) => item.variant_id === variantId);
    };

    // Handle variant selection
    const handleVariantChange = (productId, variantId) => {
        setSelectedVariants((prev) => ({
            ...prev,
            [productId]: variantId,
        }));
    };

    // Navigate to product details
    const handleCardClick = async (productId) => {
        try {
            const response = await api.get(`vendor/products/${productId}`);
            if (response.status === 200) {
                dispatch(clearProductDetails());
                dispatch(setProductDetails({ ...response.data }));
                navigate("product-view");
            }
        } catch (error) {
            if (error.response && error.response.data) {
                const errors = extractErrorMessages(error.response.data);
                toast.error(errors.join(", "));
            } else {
                toast.error("Failed to fetch product details.");
            }
        }
    };

    return (
        <div className="container mx-auto py-8 px-4 mt-16">
            {/* Mobile filter toggle */}
            <div className="lg:hidden flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Products</h2>
                <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                >
                    <Filter size={16} />
                    Filters
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Filter sidebar - desktop */}
                <div className={`lg:block lg:w-1/4 ${showMobileFilters ? "block" : "hidden"}`}>
                    <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Filters</h3>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={resetFilters} className="text-sm">
                                    Reset
                                </Button>
                                {searchTerm && (
                                    <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => setSearchTerm('')}
                                        className="text-sm"
                                    >
                                        Clear Search
                                    </Button>
                                )}
                                <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setShowMobileFilters(false)}>
                                    <X size={16} />
                                </Button>
                            </div>
                        </div>

                        {/* Search input */}
                        <div className="mb-4">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search products..."
                                className="w-full p-2 border rounded-md text-sm"
                            />
                        </div>

                        {/* Categories filter */}
                        <div className="mb-4">
                            <div
                                className="flex justify-between items-center cursor-pointer mb-2"
                                onClick={() => toggleSection("categories")}
                            >
                                <h4 className="font-medium">Categories</h4>
                                {expandedSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                            {expandedSections.categories && (
                                <div className="space-y-2 ml-1">
                                    {categories.map((category) => (
                                        <div key={category.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`category-${category.id}`}
                                                checked={selectedCategories.includes(category.id)}
                                                onCheckedChange={() => handleCategoryChange(category.id)}
                                            />
                                            <Label htmlFor={`category-${category.id}`} className="text-sm cursor-pointer">
                                                {category.category}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Separator className="my-4" />

                        {/* Brands filter */}
                        <div className="mb-4">
                            <div
                                className="flex justify-between items-center cursor-pointer mb-2"
                                onClick={() => toggleSection("brands")}
                            >
                                <h4 className="font-medium">Brands</h4>
                                {expandedSections.brands ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                            {expandedSections.brands && (
                                <div className="space-y-2 ml-1">
                                    {brands.map((brand) => (
                                        <div key={brand} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`brand-${brand}`}
                                                checked={selectedBrands.includes(brand)}
                                                onCheckedChange={() => handleBrandChange(brand)}
                                            />
                                            <Label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">
                                                {brand}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <Separator className="my-4" />

                        {/* Price range filter */}
                        <div className="mb-4">
                            <div
                                className="flex justify-between items-center cursor-pointer mb-2"
                                onClick={() => toggleSection("price")}
                            >
                                <h4 className="font-medium">Price Range</h4>
                                {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            </div>
                            {expandedSections.price && (
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <span className="text-sm">{formatPrice(priceRange[0])}</span>
                                        <span className="text-sm">{formatPrice(priceRange[1])}</span>
                                    </div>
                                    <Slider
                                        defaultValue={[0, maxPrice]}
                                        value={priceRange}
                                        max={maxPrice}
                                        step={100}
                                        onValueChange={setPriceRange}
                                        className="my-4"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <Button className="w-full bg-[#4A5859] hover:bg-[#3A4849] text-white" onClick={applyFilters}>
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Product grid */}
                <div className="lg:w-3/4">
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <h2 className="text-2xl font-bold hidden lg:block">Products</h2>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{pagination.count} products</span>
                                {selectedCategories.length > 0 ||
                                selectedBrands.length > 0 ||
                                priceRange[0] > 0 ||
                                priceRange[1] < maxPrice ||
                                searchTerm ? (
                                    <Badge variant="outline" className="ml-2 cursor-pointer" onClick={resetFilters}>
                                        Filtered <X size={14} className="ml-1" />
                                    </Badge>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, index) => (
                                <Card key={index} className="bg-white shadow-md animate-pulse">
                                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                                    <CardContent className="p-4">
                                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                        <div className="h-8 bg-gray-200 rounded mb-2"></div>
                                        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                                    </CardContent>
                                    <CardFooter className="p-4 border-t">
                                        <div className="h-10 bg-gray-200 rounded w-full"></div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {products.map((product) => {
                                const selectedVariantId = selectedVariants[product.id] || product.variants[0]?.id;
                                const selectedVariant =
                                    product.variants.find((variant) => variant.id === selectedVariantId) || product.variants[0];
                                const isOutOfStock = selectedVariant?.is_out_of_stock;

                                return (
                                    <Card
                                        key={product.id}
                                        className="bg-white shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
                                    >
                                        <div className="cursor-pointer flex-grow" onClick={() => handleCardClick(product.id)}>
                                            <div className="relative">
                                                <img
                                                    src={product.product_image || "/placeholder.svg?height=192&width=384"}
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
                                                <div className="mt-4">
                                                    <select
                                                        className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#4A5859]"
                                                        value={selectedVariantId}
                                                        onClick={(e) => e.stopPropagation()}
                                                        onChange={(e) => handleVariantChange(product.id, Number.parseInt(e.target.value))}
                                                    >
                                                        {product.variants.map((variant) => (
                                                            <option key={variant.id} value={variant.id}>
                                                                {variant.name} {variant.is_out_of_stock ? "(Out of Stock)" : ""}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="mt-3 text-xl font-bold text-[#4A5859]">
                                                    {formatPrice(selectedVariant?.price)}
                                                </div>
                                            </CardContent>
                                        </div>
                                        <CardFooter className="p-4 border-t mt-auto">
                                            <Button
                                                className={`w-full flex items-center justify-center gap-2 ${
                                                    isVariantInCart(selectedVariantId)
                                                        ? "bg-green-600 hover:bg-green-700"
                                                        : isOutOfStock
                                                            ? "bg-gray-400 cursor-not-allowed"
                                                            : "bg-[#4A5859] hover:bg-[#3A4849]"
                                                }`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!isOutOfStock && !isVariantInCart(selectedVariantId)) {
                                                        addToCart(product, selectedVariant);
                                                    }
                                                }}
                                                disabled={isVariantInCart(selectedVariantId) || isOutOfStock}
                                            >
                                                {isVariantInCart(selectedVariantId) ? (
                                                    <>
                                                        Added to Cart <ShoppingCart size={16} />
                                                    </>
                                                ) : (
                                                    <>
                                                        Add to Cart <ShoppingCart size={16} />
                                                    </>
                                                )}
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                            <h3 className="text-xl font-semibold mb-2">No products found</h3>
                            <p className="text-gray-500 mb-4">Try adjusting your filters to find what you're looking for.</p>
                            <Button onClick={resetFilters}>Reset Filters</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}