

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, MapPin, CreditCard, Loader2, AlertCircle, CheckCircle, Tag, Wallet } from "lucide-react";
import api from "@/axios/axiosInstance";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDispatch } from "react-redux";
import { clearCart } from "@/redux/CartSlice";
import toast from "react-hot-toast";
import extractErrorMessages from "../commoncomponents/errorHandlefunc";

export default function Checkout() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [coupons, setCoupons] = useState([]);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [discountedTotal, setDiscountedTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paymentMode, setPaymentMode] = useState("cash_on_delivery"); // Track payment mode
  const [walletBalance, setWalletBalance] = useState(0); // Wallet balance state
  const [isWalletEnabled, setIsWalletEnabled] = useState(false); // Enable/disable wallet option

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Access the cart state
  const cart = useSelector((state) => state.cart);
  const { items, totalPrice } = cart;

  // Fetch wallet balance on component mount
  useEffect(() => {
    const fetchWalletBalance = async () => {
      try {
        const response = await api.get("wallet/customer/wallet-balance/");
        setWalletBalance(response.data.wallet_balance || 0);
      } catch (err) {
        console.error("Failed to fetch wallet balance:", err);
      }
    };

    fetchWalletBalance();
  }, []);

  // Check if wallet balance is sufficient whenever discountedTotal changes
  useEffect(() => {
    setIsWalletEnabled(walletBalance >= discountedTotal);
  }, [walletBalance, discountedTotal]);

  // Load Razorpay SDK
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      console.log("Razorpay SDK loaded successfully");
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Update discountedTotal when totalPrice changes
  useEffect(() => {
    setDiscountedTotal(Number(totalPrice) || 0);
  }, [totalPrice]);

  // Redirect if cart is empty
  useEffect(() => {
    if (Number(totalPrice) === 0) {
      navigate("/customer");
    }
  }, []);

  // Fetch customer addresses and available coupons
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await api.get("customer/addresses/");
        setAddresses(response.data);
        if (response.data.length > 0) {
          setSelectedAddress(response.data[0].id);
        }
      } catch (err) {
        setError(err.message || "Failed to fetch addresses");
      } finally {
        setIsLoading(false);
      }
    };

    const fetchCoupons = async () => {
      try {
        const response = await api.get("customer/coupons/", {
          params: {
            total_price: totalPrice,
          },
        });
        if (response.data && response.data.length > 0) {
          setCoupons(response.data);
        } else {
          console.log("No available coupons");
        }
      } catch (err) {
        console.error("Failed to fetch coupons:", err);
        toast.error("Failed to fetch coupons");
      }
    };

    fetchAddresses();
    fetchCoupons();
  }, [totalPrice]);

  // Handle coupon selection
  const handleCouponChange = (couponId) => {
    const id = Number(couponId);
    const coupon = coupons.find((c) => c.id === id);
    if (!coupon) {
      setSelectedCoupon(null);
      setDiscount(0);
      setDiscountedTotal(Number(totalPrice) || 0);
      return;
    }

    if (totalPrice < coupon.min_order_value) {
      toast.error(`This coupon requires a minimum order of ₹${coupon.min_order_value}`);
      setSelectedCoupon(null);
      setDiscount(0);
      setDiscountedTotal(Number(totalPrice) || 0);
      return;
    }

    let calculatedDiscount = 0;

    if (coupon.coupon_type === "flat") {
      calculatedDiscount = Number(coupon.discount_value);
    } else if (coupon.coupon_type === "percentage") {
      calculatedDiscount = (totalPrice * Number(coupon.discount_value)) / 100;
      if (coupon.max_discount && calculatedDiscount > Number(coupon.max_discount)) {
        calculatedDiscount = Number(coupon.max_discount);
        toast.success(`Maximum discount of ₹${coupon.max_discount} applied for this coupon.`);
      }
    }

    setSelectedCoupon(coupon);
    setDiscount(calculatedDiscount);
    setDiscountedTotal(Number(totalPrice) - calculatedDiscount);
  };

  // Handle Razorpay payment
  const handleRazorpayPayment = async () => {
    try {
      const orderData = {
        address_id: selectedAddress,
        payment_mode: "card",
        items: items.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
        total_price: discountedTotal,
        coupon_id: selectedCoupon ? selectedCoupon.id : null,
      };

      const response = await api.post("cart/checkout/", orderData);
      const { razorpay_order_id, amount, currency, key } = response.data;

      const options = {
        key: key,
        amount: amount,
        currency: currency,
        order_id: razorpay_order_id,
        handler: async function (response) {
          try {
            const result = await api.post("cart/razorpay-callback/", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (result.data.success) {
              toast.success("Payment successful! Order placed.");
              dispatch(clearCart());
              navigate("/customer-profile/orders");
            } else {
              toast.error("Payment failed. Please try again.");
              navigate("/customer-profile/orders/");
            }
          } catch (err) {
            console.error("Error verifying payment:", err);
            toast.error("Payment verification failed. Please contact support.");
            navigate("/customer-profile/orders/");
          }
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#4A5859",
        },
        modal: {
          ondismiss: function () {
            dispatch(clearCart());
            navigate("/customer-profile/orders");
          },
        },
      };

      if (!window.Razorpay) {
        toast.error("Payment gateway is not available. Please try again later.");
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Error processing Razorpay payment:", err);
      if (err.response && err.response.data) {
        const errorMessage = extractErrorMessages(err.response.data).join(",");
        toast.error(errorMessage);
      } else {
        toast.error("Failed to process payment. Please try again.");
      }
      navigate("/customer-profile/orders/");
    }
  };

  // Handle wallet payment
  const handleWalletPayment = async () => {
    setIsPlacingOrder(true);
    try {
      const orderData = {
        address_id: selectedAddress,
        payment_mode: "wallet",
        items: items.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
        total_price: discountedTotal,
        coupon_id: selectedCoupon ? selectedCoupon.id : null,
      };

      const response = await api.post("cart/checkout/", orderData);
      console.log("Order placed using wallet:", response.data);

      setOrderSuccess(true);
      toast.success("Order placed successfully using wallet");
      navigate("/customer-profile/orders");
      dispatch(clearCart());
    } catch (err) {
      setError(err.message || "Failed to place order using wallet");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Handle place order
  const handlePlaceOrder = () => {
    if (!selectedAddress) {
      toast.error("Please select a shipping address");
      return;
    }

    if (paymentMode === "card") {
      handleRazorpayPayment();
    } else if (paymentMode === "wallet") {
      handleWalletPayment();
    } else {
      setShowConfirmDialog(true);
    }
  };

  // Confirm order for Cash on Delivery
  const confirmOrder = async () => {
    setIsPlacingOrder(true);
    try {
      const orderData = {
        address_id: selectedAddress,
        payment_mode: "cash_on_delivery",
        items: items.map((item) => ({
          variant_id: item.variant_id,
          quantity: item.quantity,
        })),
        total_price: discountedTotal,
        coupon_id: selectedCoupon ? selectedCoupon.id : null,
      };

      const response = await api.post("cart/checkout/", orderData);
      console.log("Order placed:", response.data);

      setOrderSuccess(true);
      toast.success("Order placed successfully");
      navigate("/customer-profile/orders");
      dispatch(clearCart());
    } catch (err) {
      setError(err.message || "Failed to place order");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-[#4A5859] animate-spin" />
        <span className="ml-2 text-[#4A5859]">Loading addresses...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        <AlertCircle className="h-6 w-6 mr-2" />
        {error}
      </div>
    );
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

        {/* Coupon Selection */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Tag className="h-5 w-5 text-[#4A5859] mr-2" />
            <h3 className="text-xl font-semibold text-[#4A5859]">Apply Coupon</h3>
          </div>
          <Card className="border-[#4A5859]/10">
            <CardContent className="p-4">
              <select
                className="w-full p-2 border border-[#4A5859]/10 rounded-lg"
                onChange={(e) => handleCouponChange(e.target.value)}
              >
                <option value="">Select a coupon</option>
                {coupons.map((coupon) => (
                  <option key={coupon.id} value={coupon.id}>
                    {coupon.code} - {coupon.coupon_type === "flat"
                      ? `₹${coupon.discount_value} off`
                      : `${coupon.discount_value}% off (up to ₹${coupon.max_discount})`}
                  </option>
                ))}
              </select>
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
              <RadioGroup value={paymentMode} onValueChange={setPaymentMode}>
                <div className="space-y-4">
                  {/* Cash on Delivery Option */}
                  <div className="border border-[#4A5859] bg-[#4A5859]/5 rounded-lg p-4 cursor-pointer">
                    <div className="flex items-center">
                      <RadioGroupItem value="cash_on_delivery" id="cash_on_delivery" />
                      <Label htmlFor="cash_on_delivery" className="ml-2 cursor-pointer">
                        <div className="text-[#4A5859] font-medium">Cash on Delivery</div>
                        <div className="text-[#4A5859]/70 text-sm mt-1">
                          Pay when you receive your order
                        </div>
                      </Label>
                    </div>
                  </div>

                  {/* Card Payment Option */}
                  <div className="border border-[#4A5859] bg-[#4A5859]/5 rounded-lg p-4 cursor-pointer">
                    <div className="flex items-center">
                      <RadioGroupItem value="card" id="card" />
                      <Label htmlFor="card" className="ml-2 cursor-pointer">
                        <div className="text-[#4A5859] font-medium">Card Payment</div>
                        <div className="text-[#4A5859]/70 text-sm mt-1">
                          Pay securely with your card
                        </div>
                      </Label>
                    </div>
                  </div>

                  {/* Wallet Payment Option */}
                  <div
                    className={`border border-[#4A5859] bg-[#4A5859]/5 rounded-lg p-4 ${
                      isWalletEnabled ? "cursor-pointer" : "cursor-not-allowed opacity-50"
                    }`}
                    onClick={() => isWalletEnabled && setPaymentMode("wallet")}
                  >
                    <div className="flex items-center">
                      <RadioGroupItem
                        value="wallet"
                        id="wallet"
                        disabled={!isWalletEnabled}
                      />
                      <Label htmlFor="wallet" className="ml-2 cursor-pointer">
                        <div className="text-[#4A5859] font-medium">Wallet Payment</div>
                        <div className="text-[#4A5859]/70 text-sm mt-1">
                          Pay using your wallet balance (₹{walletBalance.toFixed(2)} available)
                        </div>
                      </Label>
                    </div>
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
              {selectedCoupon && (
                <div className="flex justify-between">
                  <span className="text-[#4A5859]/70">Discount</span>
                  <span className="text-[#4A5859]">
                    -₹{discount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#4A5859]/70">Shipping</span>
                <span className="text-[#4A5859]">Free</span>
              </div>
              <Separator className="my-2 bg-[#4A5859]/10" />
              <div className="flex justify-between font-semibold">
                <span className="text-[#4A5859]">Total</span>
                <span className="text-[#4A5859]">₹{discountedTotal.toFixed(2)}</span>
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

      {/* Order Confirmation Dialog */}
      <AlertDialog
        open={showConfirmDialog}
        onOpenChange={(open) => {
          if (!orderSuccess) {
            setShowConfirmDialog(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{orderSuccess ? "Order Placed Successfully!" : "Confirm Your Order"}</AlertDialogTitle>
            <AlertDialogDescription>
              {orderSuccess ? (
                <div className="flex flex-col items-center justify-center py-4">
                  <CheckCircle className="h-16 w-16 text-green-500 mb-2" />
                  <div>Your order has been placed successfully!</div>
                  <div className="text-sm text-muted-foreground mt-1">Redirecting to your orders...</div>
                </div>
              ) : (
                "Are you sure you want to place this order? This action cannot be undone."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {!orderSuccess && (
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPlacingOrder}>No, Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmOrder}
                disabled={isPlacingOrder}
                className="bg-[#4A5859] hover:bg-[#3A4849]"
              >
                {isPlacingOrder ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Yes, Place Order"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}