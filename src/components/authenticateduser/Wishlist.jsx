import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import api from "@/axios/axiosInstance";
import { Button } from "@/components/ui/button";
import { Trash, ShoppingBag, ArrowRight } from "lucide-react";
import extractErrorMessages from "../commoncomponents/errorHandlefunc";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  fetchWishlistStart,
  fetchWishlistSuccess,
  fetchWishlistFailure,
  removeWishlistItem,
} from '../../redux/WishListSlice'; // Import Redux actions

const Wishlist = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.wishlist); // Access wishlist data from Redux store
  const navigate = useNavigate();
  console.log(items)

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    dispatch(fetchWishlistStart()); // Dispatch action to indicate loading
    try {
      const response = await api.get("/cart/wishlist/");
      dispatch(fetchWishlistSuccess(response.data.wishlist_items)); // Dispatch action to update wishlist data
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      if (error.response && error.response.data) {
        const errorMessage = extractErrorMessages(error.response.data);
        toast.error(errorMessage.join(","));
      }
      dispatch(fetchWishlistFailure(error.message)); // Dispatch action to handle errors
    }
  };

  const handleRemoveItem = async (variantId) => {
    try {
      await api.delete(`/cart/wishlist/${variantId}/`);
      dispatch(removeWishlistItem(variantId)); // Dispatch action to remove item from wishlist
      toast.success('Item removed from wishlist')
    } catch (error) {
      if (error && error.response.data) {
        const errorMessage = extractErrorMessages(error.response.data);
        toast.error(errorMessage.join(","));
      }
    }
  };

  const handleContinueShopping = () => {
    navigate("/customer");
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-20 max-w-4xl">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <ShoppingBag className="h-6 w-6 text-[#4A5859]" />
          <h1 className="text-2xl font-bold text-[#4A5859]">Your Wishlist</h1>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-[#4A5859] border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-[#4A5859] font-medium">Loading your wishlist...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <ShoppingBag className="h-16 w-16 text-[#4A5859] opacity-70" />
            </div>
            <h2 className="text-xl font-semibold text-[#4A5859] mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6 max-w-md">Looks like you haven't added any items to your wishlist yet.</p>
            <Button
              onClick={handleContinueShopping}
              className="bg-[#4A5859] hover:bg-[#3a4647] text-white flex items-center gap-2"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div
                key={item.variant_id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-100 rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                  <div className="bg-gray-50 p-2 rounded-md">
                    <img
                      src={item.product_image || "/placeholder.svg"}
                      alt={item.product_name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </div>
                  <div>
                    <h2 className="font-semibold text-[#4A5859]">{item.product_name}</h2>
                    <p className="text-sm text-gray-500">{item.variant_name}</p>
                    <p className="text-[#4A5859] font-medium mt-1">₹{item.price}</p>
                    <p className="text-sm text-gray-500">Brand: {item.brand}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 self-end sm:self-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveItem(item.variant_id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;