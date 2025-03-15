import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import api from "@/axios/axiosInstance";
import extractErrorMessages from "@/components/commoncomponents/errorHandlefunc";
import toast from "react-hot-toast";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 3;

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    orderItemId: null,
    newStatus: "",
  });

  // Cancellation reason dialog state
  const [cancelDialog, setCancelDialog] = useState({
    isOpen: false,
    orderItemId: null,
    reason: "",
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/admin/orders/");
        if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          console.error("Expected an array but got:", response.data);
          setOrders([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Get current orders for pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const handleStatusChangeClick = (orderItemId, newStatus) => {
    if (newStatus === "cancelled") {
      setCancelDialog({
        isOpen: true,
        orderItemId,
        reason: "",
      });
    } else {
      setConfirmDialog({
        isOpen: true,
        orderItemId,
        newStatus,
      });
    }
  };

  const handleStatusChange = async (orderItemId, newStatus, reason = null) => {
    try {
      const payload = { status: newStatus };
      if (reason) {
        payload.cancellation_reason = reason;
      }

      await api.patch(`/admin/order-status-update/${orderItemId}/`, payload);

      setOrders(
        orders.map((order) =>
          order.order_item_id === orderItemId
            ? { ...order, status: newStatus, cancellation_reason: reason || order.cancellation_reason }
            : order,
        ),
      );

      toast.success(`Order status updated to ${newStatus}`);
    } catch (err) {
      if (err.response && err.response.data) {
        const errorMessage = extractErrorMessages(err.response.data).join(", ");
        toast.error(errorMessage);
      } else {
        toast.error("Failed to update order status");
      }
    }
  };

  const confirmStatusChange = () => {
    handleStatusChange(confirmDialog.orderItemId, confirmDialog.newStatus);
    setConfirmDialog({ isOpen: false, orderItemId: null, newStatus: "" });
  };

  const submitCancellation = () => {
    if (!cancelDialog.reason.trim()) {
      toast.error("Please provide a reason for cancellation");
      return;
    }

    handleStatusChange(cancelDialog.orderItemId, "cancelled", cancelDialog.reason);
    setCancelDialog({ isOpen: false, orderItemId: null, reason: "" });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "processing":
        return <Badge className="bg-blue-500">Processing</Badge>;
      case "dispatched":
        return <Badge className="bg-green-500">Dispatched</Badge>;
      case "cancelled":
        return <Badge className="bg-red-500">Cancelled</Badge>;
      case "delivered":
        return <Badge className="bg-purple-500">Delivered</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
    }
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    switch (paymentStatus) {
      case "paid":
        return <Badge className="bg-green-500">Paid</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-500">Failed</Badge>;
      default:
        return <Badge className="bg-gray-500">{paymentStatus}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#4A5859]" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-300">
        <CardContent className="pt-6">
          <div className="text-red-500">Error: {error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-[#4A5859]/20">
        <CardHeader className="bg-[#4A5859] text-white">
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {currentOrders.length > 0 ? (
            currentOrders.map((order) => (
              <div
                key={order.order_item_id}
                className="mb-6 p-5 border border-[#4A5859]/20 rounded-md shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col md:flex-row md:items-start gap-4">
                  {order.image_url && (
                    <div className="flex-shrink-0">
                      <img
                        src={order.image_url || "/placeholder.svg"}
                        alt={order.product}
                        className="w-24 h-24 object-cover rounded-md border border-[#4A5859]/10"
                      />
                    </div>
                  )}
                  <div className="flex-grow space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{order.product}</h3>
                        <p className="text-sm text-gray-600">Order Item ID: #{order.order_item_id}</p>
                      </div>
                      <div>{getStatusBadge(order.status)}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-[#4A5859]">Order Details</p>
                        <div className="text-sm">
                          <p>Quantity: {order.quantity}</p>
                          <p>Price: ₹{order.price}</p>
                          <div>Payment Status: {getPaymentStatusBadge(order.payment_status)}</div>
                          <p>Ordered on: {new Date(order.created_at).toLocaleDateString()}</p>
                          {order.cancellation_reason && (
                            <div className="mt-2">
                              <p className="text-sm font-medium text-red-500">Cancellation Reason:</p>
                              <p className="text-sm italic">{order.cancellation_reason}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-[#4A5859]">Shipping Address</p>
                        <div className="text-sm">
                          <p>{order.shipping_address.name}</p>
                          <p>{order.shipping_address.street_address}</p>
                          <p>
                            {order.shipping_address.city}, {order.shipping_address.state}{" "}
                            {order.shipping_address.pincode}
                          </p>
                          <p>{order.shipping_address.country}</p>
                          <p>Phone: {order.shipping_address.phone_number}</p>
                        </div>
                      </div>
                    </div>

                    {order.status === "Dispatched" && (
                      <div className="pt-3 border-t mt-3">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium">Update Status:</span>
                          <Select
                            value={order.status}
                            onValueChange={(value) => handleStatusChangeClick(order.order_item_id, value)}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="delivered">Delivered</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
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

                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      onClick={() => setCurrentPage(index + 1)}
                      isActive={currentPage === index + 1}
                      className="cursor-pointer"
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

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
    </>
  );
}