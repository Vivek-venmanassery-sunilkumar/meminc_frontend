import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import api from "@/axios/axiosInstance"; 

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/vendor/orders/");
        console.log("API Response:", response.data); // Debugging: Log the API response
        // Ensure the response data is an array
        if (Array.isArray(response.data)) {
          setOrders(response.data);
        } else {
          console.error("Expected an array but got:", response.data);
          setOrders([]); // Fallback to an empty array
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = async (orderItemId, newStatus) => {
    try {
      // Assuming you have an endpoint to update the order status
      await api.patch(`/vendor/orders/${orderItemId}/`, { status: newStatus });
      setOrders(
        orders.map((order) =>
          order.order_item_id === orderItemId ? { ...order, status: newStatus } : order
        )
      );
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length > 0 ? (
          orders.map((order) => (
            <div key={order.order_item_id} className="mb-4 p-4 border rounded-md">
              <div className="flex items-center space-x-4">
                {order.image_url && (
                  <img
                    src={order.image_url}
                    alt={order.product}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                )}
                <div>
                  <p>Order Item ID: #{order.order_item_id}</p>
                  <p>Quantity: {order.quantity}</p>
                  <p>Price: ${order.price}</p>
                  <p>Ordered on: {order.created_at}</p>
                </div>
              </div>
              <div className="mt-4">
                <p>Shipping Address:</p>
                <p>{order.shipping_address.name}</p>
                <p>{order.shipping_address.street_address}</p>
                <p>
                  {order.shipping_address.city}, {order.shipping_address.state}{" "}
                  {order.shipping_address.pincode}
                </p>
                <p>{order.shipping_address.country}</p>
                <p>Phone: {order.shipping_address.phone_number}</p>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <p>Status:</p>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.order_item_id, e.target.value)}
                >
                  <option value="Processing">Processing</option>
                  <option value="Dispatched">Dispatched</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          ))
        ) : (
          <p>No orders found.</p>
        )}
      </CardContent>
    </Card>
  );
}