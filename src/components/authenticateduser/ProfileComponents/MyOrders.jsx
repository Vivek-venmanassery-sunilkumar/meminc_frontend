import { useEffect, useState } from "react"
import api from "@/axios/axiosInstance"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, CreditCard, MapPin, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 3

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/cart/checkout/")
        const data = Array.isArray(response.data) ? response.data : [response.data]
        setOrders(data)
        setError(null)
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch orders")
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Helper function for item status colors
  const getItemStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-500"
      case "shipped":
        return "bg-blue-500"
      case "processing":
        return "bg-yellow-500"
      case "cancelled":
        return "bg-red-500"
      default:
        return "bg-[#4A5859]"
    }
  }

  // Handle cancellation of an order item
  const handleCancelItem = async (orderId, item) => {
    if (!window.confirm(`Are you sure you want to cancel ${item.name}?`)) {
      return
    }

    try {
      // Call the API to cancel the item
      await api.patch(`/cart/checkout/${orderId}/items/${item.id}/cancel`)

      // Update the local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.order_id === orderId
            ? {
                ...order,
                order_items: order.order_items.map((orderItem) =>
                  orderItem.id === item.id ? { ...orderItem, order_item_status: "cancelled" } : orderItem,
                ),
              }
            : order,
        ),
      )

      // Show success feedback
      alert(`${item.name} has been cancelled successfully.`)
    } catch (err) {
      // Show error feedback
      alert(err.response?.data?.message || "Failed to cancel the item. Please try again.")
    }
  }

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(orders.length / ordersPerPage)

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  return (
    <Card className="border-[#4A5859]/20 shadow-md">
      <CardHeader className="border-b border-[#4A5859]/10 bg-[#4A5859] text-white">
        <CardTitle className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          My Orders
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4 rounded-md bg-red-100 text-red-700">{error}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-16 w-16 text-[#4A5859]/50 mb-4" />
            <p className="text-[#4A5859]/70 text-lg">No orders found</p>
            <Button
              variant="outline"
              className="mt-4 border-[#4A5859] text-[#4A5859] hover:bg-[#4A5859] hover:text-white"
              onClick={() => (window.location.href = "/shop")}
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {currentOrders.map((order) => (
              <Card key={order.order_id} className="overflow-hidden border-[#4A5859]/20 transition-all hover:shadow-lg">
                <div className="bg-[#4A5859]/5 p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h3 className="font-semibold text-lg text-[#4A5859]">Order #{order.order_id}</h3>
                      <p className="text-[#4A5859]/70 text-sm">
                        {new Date(order.order_creation_time).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-5">
                  {/* Order Items */}
                  <div className="mb-6">
                    <h4 className="font-medium text-sm text-[#4A5859]/70 mb-4 uppercase tracking-wider">Order Items</h4>
                    <div className="space-y-5">
                      {order.order_items?.map((item) => (
                        <div
                          key={`${item.name}-${item.variant}`}
                          className="flex gap-4 bg-white p-3 rounded-lg border border-[#4A5859]/10 hover:border-[#4A5859]/30 transition-all"
                        >
                          <div className="h-24 w-24 rounded-md overflow-hidden flex-shrink-0 border border-[#4A5859]/10">
                            <img
                              src={item.product_image_url || "/placeholder.svg?height=96&width=96"}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-[#4A5859]">{item.name}</p>
                              <div className="flex items-center gap-2">
                                <Badge className={`text-white ${getItemStatusColor(item.order_item_status)}`}>
                                  {item.order_item_status}
                                </Badge>
                                {["processing", "pending"].includes(item.order_item_status?.toLowerCase()) && (
                                  <button
                                    onClick={() => handleCancelItem(order.order_id, item)}
                                    className="text-sm text-red-600 hover:text-red-700 hover:underline"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-sm text-[#4A5859]/70">
                              <p>
                                Quantity: <span className="text-[#4A5859]">{item.quantity}</span>
                              </p>
                              <p>
                                Price: <span className="text-[#4A5859]">₹{item.price?.toFixed(2)}</span>
                              </p>
                              <p>
                                Variant: <span className="text-[#4A5859]">{item.variant}</span>
                              </p>
                              <p>
                                Brand: <span className="text-[#4A5859]">{item.brand}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-5 bg-[#4A5859]/10" />

                  {/* Shipping and Payment Info */}
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Shipping Information */}
                    <div>
                      <h4 className="font-medium text-sm text-[#4A5859]/70 mb-3 flex items-center gap-2 uppercase tracking-wider">
                        <MapPin className="h-4 w-4" /> Shipping Address
                      </h4>
                      <div className="bg-[#4A5859]/5 p-4 rounded-md text-sm border border-[#4A5859]/10">
                        <p className="font-medium text-[#4A5859]">{order.shipping_address?.name}</p>
                        <p className="text-[#4A5859]/80">{order.shipping_address?.street_address}</p>
                        <p className="text-[#4A5859]/80">
                          {order.shipping_address?.city}, {order.shipping_address?.state}{" "}
                          {order.shipping_address?.pincode}
                        </p>
                        <p className="text-[#4A5859]/80">{order.shipping_address?.country}</p>
                        <p className="mt-1 text-[#4A5859]">Phone: {order.shipping_address?.phone_number}</p>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div>
                      <h4 className="font-medium text-sm text-[#4A5859]/70 mb-3 flex items-center gap-2 uppercase tracking-wider">
                        <CreditCard className="h-4 w-4" /> Payment Details
                      </h4>
                      <div className="bg-[#4A5859]/5 p-4 rounded-md text-sm border border-[#4A5859]/10">
                        <div className="flex justify-between mb-1">
                          <p className="text-[#4A5859]/80">Payment Method:</p>
                          <p className="font-medium text-[#4A5859]">
                            {order.payment_details?.payment_method?.toUpperCase()}
                          </p>
                        </div>
                        <div className="flex justify-between mb-1">
                          <p className="text-[#4A5859]/80">Payment Status:</p>
                          <p className="font-medium text-[#4A5859]">{order.payment_details?.payment_status}</p>
                        </div>
                        <Separator className="my-3 bg-[#4A5859]/10" />
                        <div className="flex justify-between mb-1">
                          <p className="text-[#4A5859]/80">Subtotal:</p>
                          <p className="text-[#4A5859]">₹{(order.subtotal ?? 0).toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between mb-1">
                          <p className="text-[#4A5859]/80">Discount:</p>
                          <p className="text-[#4A5859]">₹{(order.discount ?? 0).toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between font-medium">
                          <p className="text-[#4A5859]">Total:</p>
                          <p className="text-[#4A5859]">₹{(order.final_price ?? 0).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Pagination */}
            {orders.length > ordersPerPage && (
              <Pagination className="mt-8">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => paginate(currentPage - 1)}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer text-[#4A5859] hover:bg-[#4A5859]/10"
                      }
                    />
                  </PaginationItem>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i + 1}>
                      <PaginationLink
                        onClick={() => paginate(i + 1)}
                        isActive={currentPage === i + 1}
                        className={
                          currentPage === i + 1 ? "bg-[#4A5859] text-white" : "text-[#4A5859] hover:bg-[#4A5859]/10"
                        }
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => paginate(currentPage + 1)}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer text-[#4A5859] hover:bg-[#4A5859]/10"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

