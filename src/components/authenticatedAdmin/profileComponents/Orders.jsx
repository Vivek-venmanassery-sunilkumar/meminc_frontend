import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Loader2, Eye } from "lucide-react"
import api from "@/axios/axiosInstance"
import extractErrorMessages from "@/components/commoncomponents/errorHandlefunc"
import toast from "react-hot-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [viewDetailsDialog, setViewDetailsDialog] = useState({
    isOpen: false,
    order: null,
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const ordersPerPage = 10

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    orderItemId: null,
    newStatus: "",
  })

  // Cancellation reason dialog state
  const [cancelDialog, setCancelDialog] = useState({
    isOpen: false,
    orderItemId: null,
    reason: "",
  })

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await api.get("/admin/orders/")
      if (Array.isArray(response.data)) {
        setOrders(response.data)
      } else {
        console.error("Expected an array but got:", response.data)
        setOrders([])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // Get current orders for pagination
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder)
  const totalPages = Math.ceil(orders.length / ordersPerPage)

  const handleStatusChangeClick = (orderItemId, newStatus) => {
    if (newStatus === "cancelled") {
      setCancelDialog({
        isOpen: true,
        orderItemId,
        reason: "",
      })
    } else {
      setConfirmDialog({
        isOpen: true,
        orderItemId,
        newStatus,
      })
    }
  }

  const handleStatusChange = async (orderItemId, newStatus, reason = null) => {
    try {
      const payload = { status: newStatus }
      if (reason) {
        payload.cancellation_reason = reason
      }

      await api.patch(`/admin/order-status-update/${orderItemId}/`, payload)
      
      // Fetch updated orders after status change
      await fetchOrders()
      
      toast.success(`Order status updated to ${newStatus}`)
      
      // If we're viewing details of this order, update that as well
      if (viewDetailsDialog.order?.order_item_id === orderItemId) {
        const updatedOrder = orders.find(order => order.order_item_id === orderItemId)
        if (updatedOrder) {
          setViewDetailsDialog(prev => ({
            ...prev,
            order: updatedOrder
          }))
        }
      }
    } catch (err) {
      if (err.response && err.response.data) {
        const errorMessage = extractErrorMessages(err.response.data).join(", ")
        toast.error(errorMessage)
      } else {
        toast.error("Failed to update order status")
      }
    }
  }

  const confirmStatusChange = () => {
    handleStatusChange(confirmDialog.orderItemId, confirmDialog.newStatus)
    setConfirmDialog({ isOpen: false, orderItemId: null, newStatus: "" })
  }

  const submitCancellation = () => {
    if (!cancelDialog.reason.trim()) {
      toast.error("Please provide a reason for cancellation")
      return
    }

    handleStatusChange(cancelDialog.orderItemId, "cancelled", cancelDialog.reason)
    setCancelDialog({ isOpen: false, orderItemId: null, reason: "" })
  }

  const openViewDetailsDialog = (e, order) => {
    e.stopPropagation()
    setViewDetailsDialog({
      isOpen: true,
      order,
    })
  }

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>
      case "dispatched":
        return <Badge className="bg-indigo-500">Dispatched</Badge>
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>
      case "delivered":
        return <Badge className="bg-green-400">Delivered</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (paymentStatus) => {
    switch (paymentStatus) {
      case "completed":
        return <Badge className="bg-[#4A5859]">completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>
      default:
        return <Badge className="bg-blue-300">{paymentStatus}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#4A5859]" />
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-red-300">
        <CardContent className="pt-6">
          <div className="text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-[#4A5859]/20">
        <CardHeader className="bg-[#4A5859] text-white">
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {currentOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Ordered Date</TableHead>
                    <TableHead>Order Status</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentOrders.map((order) => (
                    <TableRow key={order.order_item_id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          {order.image_url && (
                            <img
                              src={order.image_url || "/placeholder.svg"}
                              alt={order.product}
                              className="w-10 h-10 object-cover rounded-md border border-[#4A5859]/10"
                            />
                          )}
                          <div className="font-medium">{order.product}</div>
                        </div>
                      </TableCell>
                      <TableCell>#{order.order_item_id}</TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          {getStatusBadge(order.status)}
                          {order.status.toLowerCase() === "dispatched" && (
                            <Select onValueChange={(value) => handleStatusChangeClick(order.order_item_id, value)}>
                              <SelectTrigger className="w-[140px] h-8 mt-1">
                                <SelectValue placeholder="Update Status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={(e) => openViewDetailsDialog(e, order)}
                        >
                          <Eye className="h-4 w-4" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No orders found.</p>
            </div>
          )}
        </CardContent>

        {orders.length > ordersPerPage && (
          <CardFooter className="flex justify-center border-t p-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>

                {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                  // Show first page, last page, current page, and pages around current
                  let pageToShow
                  if (totalPages <= 5) {
                    pageToShow = index + 1
                  } else if (currentPage <= 3) {
                    pageToShow = index + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageToShow = totalPages - 4 + index
                  } else {
                    pageToShow = currentPage - 2 + index
                  }

                  return (
                    <PaginationItem key={index}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageToShow)}
                        isActive={currentPage === pageToShow}
                        className="cursor-pointer"
                      >
                        {pageToShow}
                      </PaginationLink>
                    </PaginationItem>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </CardFooter>
        )}
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog
        open={confirmDialog.isOpen}
        onOpenChange={(isOpen) => !isOpen && setConfirmDialog({ ...confirmDialog, isOpen })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Status Change</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to change the order status to {confirmDialog.newStatus}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmStatusChange}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancellation Reason Dialog */}
      <Dialog
        open={cancelDialog.isOpen}
        onOpenChange={(isOpen) => !isOpen && setCancelDialog({ ...cancelDialog, isOpen })}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reason for Cancellation</DialogTitle>
            <DialogDescription>Please provide a reason for cancelling this order.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Enter cancellation reason..."
              value={cancelDialog.reason}
              onChange={(e) => setCancelDialog({ ...cancelDialog, reason: e.target.value })}
              className="min-h-[100px]"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialog({ isOpen: false, orderItemId: null, reason: "" })}>
              Cancel
            </Button>
            <Button onClick={submitCancellation}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog
        open={viewDetailsDialog.isOpen}
        onOpenChange={(isOpen) => !isOpen && setViewDetailsDialog({ ...viewDetailsDialog, isOpen })}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {viewDetailsDialog.order && (
            <div className="grid md:grid-cols-2 gap-4 py-4">
              <div>
                <h4 className="font-semibold mb-2 text-[#4A5859]">Order Information</h4>
                <div className="space-y-2 text-sm">
                  <p>Product: {viewDetailsDialog.order.product}</p>
                  <p>Order ID: #{viewDetailsDialog.order.order_item_id}</p>
                  <p>Date: {new Date(viewDetailsDialog.order.created_at).toLocaleDateString()}</p>
                  <p>Quantity: {viewDetailsDialog.order.quantity}</p>
                  <p>Price: ₹{viewDetailsDialog.order.price}</p>
                  <div>Status: {getStatusBadge(viewDetailsDialog.order.status)}</div>
                  <div>Payment Status: {getPaymentStatusBadge(viewDetailsDialog.order.payment_status)}</div>
                  {viewDetailsDialog.order.cancellation_reason && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-red-500">Cancellation Reason:</p>
                      <p className="text-sm italic">{viewDetailsDialog.order.cancellation_reason}</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-[#4A5859]">Shipping Address</h4>
                <div className="space-y-1 text-sm">
                  <p>{viewDetailsDialog.order.shipping_address.name}</p>
                  <p>{viewDetailsDialog.order.shipping_address.street_address}</p>
                  <p>
                    {viewDetailsDialog.order.shipping_address.city}, {viewDetailsDialog.order.shipping_address.state}{" "}
                    {viewDetailsDialog.order.shipping_address.pincode}
                  </p>
                  <p>{viewDetailsDialog.order.shipping_address.country}</p>
                  <p>Phone: {viewDetailsDialog.order.shipping_address.phone_number}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDetailsDialog({ isOpen: false, order: null })}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}