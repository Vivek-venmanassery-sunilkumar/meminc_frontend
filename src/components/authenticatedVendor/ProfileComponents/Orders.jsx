import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";






export default function Orders() {
  const [orders, setOrders] = useState([
    { id: 1, product: "Organic Apples", status: "Processing" },
    { id: 2, product: "Whole Wheat Bread", status: "Dispatched" },
  ]);

  const handleStatusChange = (id, newStatus) => {
    setOrders(
      orders.map((order) => (order.id === id ? { ...order, status: newStatus } : order))
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.map((order) => (
          <div key={order.id} className="mb-4 p-4 border rounded-md">
            <p>Order #{order.id}</p>
            <p>Product: {order.product}</p>
            <div className="flex items-center space-x-2">
              <p>Status:</p>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
              >
                <option value="Processing">Processing</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}