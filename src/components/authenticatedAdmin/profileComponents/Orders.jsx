import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";




export default function Orders() {
  const [orders, setOrders] = useState([
    { id: 1, date: "2023-05-01", total: 99.99, status: "Processing" },
    { id: 2, date: "2023-06-15", total: 149.99, status: "Out for Delivery" },
  ]);

  const handleStatusChange = (id, newStatus) => {
    setOrders(orders.map(order => order.id === id ? { ...order, status: newStatus } : order));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.map(order => (
          <div key={order.id} className="mb-4 p-4 border rounded-md">
            <p>Order #{order.id}</p>
            <p>Date: {order.date}</p>
            <p>Total: ${order.total}</p>
            <div className="flex items-center space-x-2">
              <p>Status:</p>
              <select value={order.status} onChange={(e) => handleStatusChange(order.id, e.target.value)}>
                <option value="Processing">Processing</option>
                <option value="Out for Delivery">Out for Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}