import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { setCartData, updateCartItem } from "../../redux/CartSlice"
import api from "@/axios/axiosInstance"
import { Button } from "@/components/ui/button"
import { Minus, Plus, Trash, ShoppingCart, ShoppingBag, ArrowRight } from "lucide-react"
import extractErrorMessages from "../commoncomponents/errorHandlefunc"
import toast from "react-hot-toast"
import { useNavigate } from "react-router-dom"

const Cart = () => {
  const dispatch = useDispatch()
  const cart = useSelector((state) => state.cart)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchCartDetails()
  }, [])

  const fetchCartDetails = async () => {
    setLoading(true)
    try {
      const response = await api.get("/cart/")
      dispatch(setCartData(response.data))
      console.log(response.data.total_price)
    } catch (error) {
      console.error("Error fetching cart details:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleQuantityChange = async (variantId, action) => {
    setLoading(true)
    try {
      const response = await api.post("/cart/", { variant_id: variantId, action })

      if (response.status === 204) {
        fetchCartDetails()
      } else {
        dispatch(updateCartItem(response.data))
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = extractErrorMessages(error.response.data)
        toast.error(errorMessage.join(","))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (variantId) => {
    setLoading(true)
    try {
      await api.delete(`/cart/${variantId}`)
      fetchCartDetails()
    } catch (error) {
      if (error && error.response.data) {
        const errorMessage = extractErrorMessages(error.response.data)
        toast.error(errorMessage.join(","))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleProceedToCheckout = () => {
    navigate("/customer/checkout")
  }

  const handleContinueShopping = () => {
    navigate("/customer")
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-20 max-w-4xl">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
          <ShoppingCart className="h-6 w-6 text-[#4A5859]" />
          <h1 className="text-2xl font-bold text-[#4A5859]">Your Cart</h1>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
              <div className="absolute inset-0 rounded-full border-4 border-[#4A5859] border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-[#4A5859] font-medium">Loading your cart...</p>
          </div>
        ) : cart.items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="bg-gray-50 p-6 rounded-full mb-4">
              <ShoppingBag className="h-16 w-16 text-[#4A5859] opacity-70" />
            </div>
            <h2 className="text-xl font-semibold text-[#4A5859] mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-6 max-w-md">Looks like you haven't added any items to your cart yet.</p>
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
            {cart.items.map((item) => (
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
                    <p className="text-[#4A5859] font-medium mt-1">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 self-end sm:self-auto">
                  <div className="flex items-center border border-gray-200 rounded-md">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(item.variant_id, "decrease")}
                      disabled={item.quantity <= 1}
                      className="text-[#4A5859] h-8 px-2"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(item.variant_id, "increase")}
                      className="text-[#4A5859] h-8 px-2"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
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

            <div className="mt-6 border-t border-gray-100 pt-4">
              <div className="flex justify-between items-center mb-6">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-lg font-semibold text-[#4A5859]">₹{cart.totalPrice}</span>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={handleProceedToCheckout}
                  className="bg-[#4A5859] hover:bg-[#3a4647] text-white px-6 py-2 flex items-center gap-2"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart

