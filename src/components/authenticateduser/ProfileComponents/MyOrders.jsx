import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";




export default function MyOrders() {
  const orders = [
    { id: 1, date: "2023-05-01", total: 99.99, status: "Delivered" },
    { id: 2, date: "2023-06-15", total: 149.99, status: "Processing" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.map((order) => (
          <div key={order.id} className="mb-4 p-4 border rounded-md">
            <p>Order #{order.id}</p>
            <p>Date: {order.date}</p>
            <p>Total: ${order.total}</p>
            <p>Status: {order.status}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}