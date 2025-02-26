
import { useState, useEffect } from "react"
import { useSelector } from "react-redux"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, MapPin, CreditCard, Loader2, AlertCircle } from "lucide-react"
import api from "@/axios/axiosInstance"

export default function Checkout() {
  const [addresses, setAddresses] = useState([])
  const [selectedAddress, setSelectedAddress] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Access the cart state
  const cart = useSelector((state) => state.cart)
  const { items, totalPrice } = cart

  // Fetch customer addresses using the Axios instance
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await api.get("customer/addresses/")
        setAddresses(response.data)
        if (response.data.length > 0) {
          setSelectedAddress(response.data[0].id)
        }
      } catch (err) {
        setError(err.message || "Failed to fetch addresses")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAddresses()
  }, [])

  const handlePlaceOrder = () => {
    console.log("Selected Address:", selectedAddress)
    console.log("Payment Mode: Cash on Delivery")
    alert("Order placed successfully!")
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-[#4A5859] animate-spin" />
        <span className="ml-2 text-[#4A5859]">Loading addresses...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-6 w-6 mr-2" />
        {error}
      </div>
    )
  }

  return (
    <div className="bg-white max-w-4xl mx-auto my-8 rounded-xl shadow-lg overflow-hidden">
      <div className="bg-[#4A5859] p-6 text-white">
        <h2 className="text-2xl font-bold">Complete Your Purchase</h2>
        <p className="text-white/80 mt-1">Review your order and shipping details</p>
      </div>

      <div className="p-6 md:p-8">
        {/* Cart Items */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <ShoppingBag className="h-5 w-5 text-[#4A5859] mr-2" />
            <h3 className="text-xl font-semibold text-[#4A5859]">Your Cart</h3>
          </div>
          <Card className="border-[#4A5859]/10">
            <CardContent className="p-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.variant_id}
                    className="flex justify-between items-center p-4 bg-[#4A5859]/5 rounded-lg hover:bg-[#4A5859]/10 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0 border border-[#4A5859]/10">
                        <img
                          src={item.product_image || "/placeholder.svg"}
                          alt={item.variant_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-semibold text-[#4A5859]">{item.variant_name}</p>
                        <p className="text-sm text-[#4A5859]/70">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-[#4A5859] font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <Separator className="my-4 bg-[#4A5859]/10" />
              <div className="flex justify-between items-center">
                <p className="text-[#4A5859] font-medium">Subtotal</p>
                <p className="text-lg font-semibold text-[#4A5859]">₹{totalPrice}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Address Selection */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <MapPin className="h-5 w-5 text-[#4A5859] mr-2" />
            <h3 className="text-xl font-semibold text-[#4A5859]">Shipping Address</h3>
          </div>
          <Card className="border-[#4A5859]/10">
            <CardContent className="p-4">
              <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                <div className="grid gap-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedAddress === address.id
                          ? "border-[#4A5859] bg-[#4A5859]/5"
                          : "border-[#4A5859]/10 hover:border-[#4A5859]/30"
                      }`}
                      onClick={() => setSelectedAddress(address.id)}
                    >
                      <div className="flex items-start">
                        <RadioGroupItem value={address.id} id={address.id} className="mt-1" />
                        <Label htmlFor={address.id} className="ml-2 cursor-pointer">
                          <div className="text-[#4A5859] font-medium">{address.street_address}</div>
                          <div className="text-[#4A5859]/70 text-sm mt-1">
                            {address.city}, {address.state}, {address.country} - {address.pincode}
                          </div>
                        </Label>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Payment Mode Selection */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <CreditCard className="h-5 w-5 text-[#4A5859] mr-2" />
            <h3 className="text-xl font-semibold text-[#4A5859]">Payment Method</h3>
          </div>
          <Card className="border-[#4A5859]/10">
            <CardContent className="p-4">
              <RadioGroup value="cash_on_delivery" onValueChange={() => {}}>
                <div className="border border-[#4A5859] bg-[#4A5859]/5 rounded-lg p-4 cursor-pointer">
                  <div className="flex items-center">
                    <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                    <Label htmlFor="cash_on_delivery" className="ml-2 cursor-pointer">
                      <div className="text-[#4A5859] font-medium">Cash on Delivery</div>
                      <div className="text-[#4A5859]/70 text-sm mt-1">Pay when you receive your order</div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <Card className="border-[#4A5859]/10 mb-8">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-[#4A5859] mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-[#4A5859]/70">Subtotal</span>
                <span className="text-[#4A5859]">₹{totalPrice}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4A5859]/70">Shipping</span>
                <span className="text-[#4A5859]">Free</span>
              </div>
              <Separator className="my-2 bg-[#4A5859]/10" />
              <div className="flex justify-between font-semibold">
                <span className="text-[#4A5859]">Total</span>
                <span className="text-[#4A5859]">₹{totalPrice}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Place Order Button */}
        <div className="text-center">
          <Button
            onClick={handlePlaceOrder}
            className="bg-[#4A5859] hover:bg-[#3A4849] text-white font-bold py-6 px-8 rounded-lg w-full md:w-auto transition-colors"
            size="lg"
          >
            Place Order
          </Button>
        </div>
      </div>
    </div>
  )
}

