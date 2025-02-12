import { useState, useEffect } from "react";
import LoggedInUserHeader from "@/components/authenticateduser/loggedInUserHeader";
import ProductListing from "@/components/authenticateduser/productlisting";
import Footer from "@/components/commoncomponents/Footer";
import api from "@/axios/axiosInstance";

export default function LoggedInUserHomepage() {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({ count: 0, totalPages: 0, next: null, previous: null });
    const [selectedBrand, setSelectedBrand] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedVariants, setSelectedVariants] = useState({}); // Maintain selected variants across pages

    // Fetch products from API
    const fetchProducts = async (page = 1, brand = "All") => {
        let url = `customer/home/?page=${page}`;
        if (brand !== "All") {
            url += `&brand=${brand}`;
        }

        try {
            const response = await api.get(url);
            setProducts(response.data.results);
            setPagination({
                count: response.data.count,
                totalPages: response.data.total_pages,
                next: response.data.next,
                previous: response.data.previous,
            });
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    // Fetch products when page or filter changes
    useEffect(() => {
        fetchProducts(currentPage, selectedBrand);
    }, [currentPage, selectedBrand]);

    // Handle next/previous page
    const handleNextPage = () => pagination.next && setCurrentPage((prev) => prev + 1);
    const handlePreviousPage = () => pagination.previous && setCurrentPage((prev) => prev - 1);

    // Handle brand filter change
    const handleBrandFilter = (brand) => {
        setSelectedBrand(brand);
        setCurrentPage(1); // Reset to first page when filtering
    };

    return (
        <>
            <LoggedInUserHeader />
            <main className="mt-20">
                <ProductListing
                    products={products}
                    selectedBrand={selectedBrand}
                    handleBrandFilter={handleBrandFilter}
                    selectedVariants={selectedVariants}
                    setSelectedVariants={setSelectedVariants} // Pass selected variants state
                />
                <div className="flex justify-center mt-4 space-x-4">
                    <button onClick={handlePreviousPage} disabled={!pagination.previous} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Previous</button>
                    <span>Page {currentPage}</span>
                    <button onClick={handleNextPage} disabled={!pagination.next} className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50">Next</button>
                </div>
            </main>
            <Footer />
        </>
    );
}

