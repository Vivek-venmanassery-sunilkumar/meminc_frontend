import { useState, useEffect } from "react";
import api from "@/axios/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, Users, Store, IndianRupee, BarChart3, PieChartIcon } from "lucide-react";

export default function VendorDashboard() {
  const [data, setData] = useState(null);
  const [orderData, setOrderData] = useState([]);
  const [filter, setFilter] = useState("daily");
  const [chartView, setChartView] = useState("bar");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await fetchData(filter);
        await fetchOrderData(filter);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, [filter]);

  const fetchData = async (filter) => {
    try {
      const response = await api.get(`/vendor/dashboard/?filter=${filter}`);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const fetchOrderData = async (filter) => {
    try {
      const response = await api.get(`/vendor/salesreport/?filter=${filter}`);
      setOrderData(response.data);
    } catch (error) {
      console.error("Error fetching order data:", error);
    }
  };

  // Function to format numbers as Indian Rupees
  const formatIndianRupees = (amount) => {
    // Handle null or undefined values
    if (amount === null || amount === undefined) {
      return "Rs. 0";
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get current date in a formatted string
  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Function to get period text based on filter
  const getPeriodText = () => {
    const now = new Date();

    switch (filter) {
      case "daily":
        return `for ${now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`;
      case "weekly":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(now);
        weekEnd.setDate(now.getDate() + (6 - now.getDay()));
        return `for ${weekStart.toLocaleDateString("en-IN", { day: "numeric", month: "long" })} - ${weekEnd.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`;
      case "monthly":
        return `for ${now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}`;
      default:
        return "";
    }
  };

  const downloadSalesReport = () => {
    if (isLoading || !data || !orderData) {
      alert("Data is still loading. Please wait.");
      return;
    }

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Add company header
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, pageWidth, 40, "F");

      // Add company name and report title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(`${data.company_name}'s Sales Report`, pageWidth / 2, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Sales Report", pageWidth / 2, 30, { align: "center" });

      // Add date and report period in the header
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);

      // Date on the left
      doc.text(`Date: ${getCurrentDate()}`, 15, 38);

      // Report period on the right
      const reportPeriodText = `Report Period: ${filter.charAt(0).toUpperCase() + filter.slice(1)}`;
      const reportPeriodWidth = doc.getStringUnitWidth(reportPeriodText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      doc.text(reportPeriodText, pageWidth - 15 - reportPeriodWidth, 38);

      // Add summary section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Financial Summary", 15, 50);

      // Create a summary table with Rs. prefix
      const summaryData = [
        ["Company Name", data.company_name],
        ["Total Sales", `Rs. ${data.total_sales.toLocaleString("en-IN")}`],
        ["Payout Received", `Rs. ${data.payout_recieved.toLocaleString("en-IN")}`],
        ["Payout Pending", data.payout_pending.toString()],
        ["Total Orders Received", data.total_order_recieved.toString()],
        ["Completed Orders", data.completed_orders.toString()],
        ["Cancelled Orders", data.cancelled_orders.toString()],
        ["Pending Orders", data.pending_orders.toString()],
        ["Top Selling Product", data.top_selling_product || "N/A"],
      ];

      autoTable(doc, {
        startY: 55,
        head: [["Metric", "Value"]],
        body: summaryData,
        theme: "grid",
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 10, cellWidth: "wrap" },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 60, halign: "right" },
        },
        margin: { left: 15, right: 15 },
      });

      // Add order details section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Order Details", 15, doc.lastAutoTable.finalY + 20);

      // Create order details table with Rs. prefix, handling null values
      const orderTableData = orderData.map((order) => [
        order.id.toString(),
        order.vendor,
        order.company,
        order.quantity.toString(),
        order.status,
        order.vendor_amount_paid ? "Paid" : "Unpaid",
        // Handle null vendor_paid_amount
        order.vendor_paid_amount !== null ? `Rs. ${order.vendor_paid_amount.toLocaleString("en-IN")}` : "Rs. 0",
      ]);

      // Add order details table with adjusted column widths to fit page
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 25,
        head: [["ID", "Vendor", "Company", "Qty", "Status", "Payment", "Amount"]],
        body: orderTableData,
        theme: "grid",
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 8 }, // Reduced font size
        columnStyles: {
          0: { cellWidth: 15 },      // ID
          1: { cellWidth: 30 },      // Vendor - reduced width
          2: { cellWidth: 30 },      // Company - reduced width
          3: { cellWidth: 15 },      // Qty
          4: { cellWidth: 20 },      // Status
          5: { cellWidth: 20 },      // Payment Status - shortened name
          6: { cellWidth: 20, halign: "right" }, // Amount - reduced width
        },
        margin: { left: 10, right: 10 },
        didDrawPage: function (data) {
          // Add footer on each page
          doc.setFontSize(8);
          doc.setTextColor(0, 0, 0);
          doc.text(
            `${data.company_name} - Confidential | Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${doc.internal.getNumberOfPages()}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: "center" },
          );
        }
      });

      // Save the PDF
      doc.save(`${data.company_name}-Sales-Report-${filter}-${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Failed to generate the sales report. Please try again.");
    }
  };

  if (isLoading || !data || !orderData) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const chartData = [
    { name: "Total Sales", value: data.total_sales },
    { name: "Payout Received", value: data.payout_recieved },
    { name: "Payout Pending", value: data.payout_pending },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">{data.company_name}'s Dashboard</CardTitle>
              <CardDescription>Sales performance {getPeriodText()}</CardDescription>
            </div>
            <Button onClick={downloadSalesReport} className="bg-primary hover:bg-primary/90" disabled={isLoading}>
              <Download className="mr-2 h-4 w-4" />
              Download Sales Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily" value={filter} onValueChange={setFilter} className="mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <IndianRupee className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">{formatIndianRupees(data.total_sales)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Payout Received</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <IndianRupee className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-2xl font-bold">{formatIndianRupees(data.payout_recieved)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Payout Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <IndianRupee className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="text-2xl font-bold">{formatIndianRupees(data.payout_pending)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders Received</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold">{data.total_order_recieved}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Top Selling Product</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Store className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-2xl font-bold">{data.top_selling_product || "N/A"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Financial Overview</CardTitle>
                <div className="flex space-x-2">
                  <Button
                    variant={chartView === "bar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartView("bar")}
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Bar
                  </Button>
                  <Button
                    variant={chartView === "pie" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartView("pie")}
                  >
                    <PieChartIcon className="h-4 w-4 mr-1" />
                    Pie
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {chartView === "bar" ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatIndianRupees(value)} />
                      <Legend />
                      <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatIndianRupees(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>
                {orderData.length} orders {getPeriodText()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Order ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Vendor</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Company</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Quantity</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Payment Status</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm">{order.id}</td>
                        <td className="px-4 py-3 text-sm">{order.vendor}</td>
                        <td className="px-4 py-3 text-sm">{order.company}</td>
                        <td className="px-4 py-3 text-sm">{order.quantity}</td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-800"
                                : order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.status === "cancelled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.vendor_amount_paid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.vendor_amount_paid ? "Paid" : "Unpaid"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-medium">
                          {formatIndianRupees(order.vendor_paid_amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}