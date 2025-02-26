import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCartData, updateCartItem } from "../../redux/CartSlice"
import api from "@/axios/axiosInstance";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash } from "lucide-react";
import extractErrorMessages from "../commoncomponents/errorHandlefunc";
import toast from "react-hot-toast";

const Cart = () => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart);

  useEffect(() => {
    // Fetch cart details when the component mounts
    fetchCartDetails();
  }, []);

  const fetchCartDetails = async () => {
    try {
      const response = await api.get("/cart/");
      dispatch(setCartData(response.data));
    } catch (error) {
      console.error("Error fetching cart details:", error);
    }
  };

  const handleQuantityChange = async (variantId, action) => {
    try {
      const response = await api.post("/cart/", { variant_id: variantId, action });

      if (response.status === 204) {
        // If the item is removed (quantity reached 0), fetch the updated cart details
        fetchCartDetails();
      } else {
        // Update the specific item in the Redux store
        dispatch(updateCartItem(response.data));
      }
    } catch (error) {
      if(error.response && error.response.data){
        const errorMessage = extractErrorMessages(error.response.data)
        toast.error(errorMessage.join(','))
      }
    }
  };

  const handleRemoveItem = async (variantId) => {
    try {
      await api.delete(`/cart/${variantId}`);
      fetchCartDetails(); // Fetch updated cart details after removal
    } catch (error) {
      if(error && error.response.data){
        const errorMessage = extractErrorMessages(error.response.data)
        toast.error(errorMessage.join(','))
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <h1 className="text-2xl font-bold mb-6">Your Cart</h1>
      {cart.items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="space-y-6">
          {cart.items.map((item) => (
            <div key={item.variant_id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-4">
                <img src={item.product_image} alt={item.product_name} className="w-16 h-16 object-cover rounded" />
                <div>
                  <h2 className="font-semibold">{item.product_name}</h2>
                  <p className="text-sm text-gray-500">{item.variant_name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(item.variant_id, 'decrease')}
                  disabled={item.quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span>{item.quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuantityChange(item.variant_id, 'increase')}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemoveItem(item.variant_id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          <div className="text-right">
            <p className="text-lg font-semibold">Total: ${cart.totalPrice}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;