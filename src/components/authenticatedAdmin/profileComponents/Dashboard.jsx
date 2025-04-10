import { useState, useEffect } from "react";
import api from "@/axios/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Download, Users, Store, IndianRupee, BarChart3, PieChartIcon } from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [orderData, setOrderData] = useState([]);
  const [filter, setFilter] = useState("daily");
  const [chartView, setChartView] = useState("bar");
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [customDatesApplied, setCustomDatesApplied] = useState(false);

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
    
    if (filter !== "custom" || customDatesApplied) {
      fetchAllData();
      setCustomDatesApplied(false);
    }
  }, [filter, customDatesApplied]);

  const fetchData = async (filterType) => {
    try {
      let url = `/admin/dashboard/?filter=${filterType}`;
      if (filterType === "custom" && startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }
      const response = await api.get(url);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  const fetchOrderData = async (filterType) => {
    try {
      let url = `/admin/salesreport/?filter=${filterType}`;
      if (filterType === "custom" && startDate && endDate) {
        url += `&start_date=${startDate}&end_date=${endDate}`;
      }
      const response = await api.get(url);
      setOrderData(response.data);
    } catch (error) {
      console.error("Error fetching order data:", error);
    }
  };

  const handleFilterChange = (value) => {
    setFilter(value);
    if (value !== "custom") {
      setStartDate("");
      setEndDate("");
    }
  };

  const handleApplyCustomDates = () => {
    if (startDate && endDate) {
      setCustomDatesApplied(true);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const formatDateLong = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const formatIndianRupees = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getPeriodText = () => {
    const now = new Date();
    const today = new Date().toISOString().split('T')[0];

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
      case "custom":
        if (startDate && endDate) {
          return `from ${formatDateLong(startDate)} to ${formatDateLong(endDate)}`;
        }
        return "for custom period (select dates)";
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

      // Header
      doc.setFillColor(0, 0, 0);
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text("MEMInc", pageWidth / 2, 20, { align: "center" });
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text("Sales Report", pageWidth / 2, 30, { align: "center" });

      // Report info
      doc.setFontSize(10);
      doc.text(`Date: ${getCurrentDate()}`, 15, 38);
      const reportPeriodText = filter === "custom" 
        ? `Report from ${formatDate(startDate)} to ${formatDate(endDate)}`
        : `Report Period: ${filter.charAt(0).toUpperCase() + filter.slice(1)}`;
      const reportPeriodWidth = doc.getStringUnitWidth(reportPeriodText) * doc.internal.getFontSize() / doc.internal.scaleFactor;
      doc.text(reportPeriodText, pageWidth - 15 - reportPeriodWidth, 38);

      // Summary section
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("Financial Summary", 15, 50);

      const summaryData = [
        ["Total Revenue", `Rs. ${(data.total_revenue || 0).toLocaleString("en-IN")}`],
        ["Total Commission", `Rs. ${(data.total_commission_earned || 0).toLocaleString("en-IN")}`],
        ["Vendor Earnings", `Rs. ${(data.total_vendor_earnings || 0).toLocaleString("en-IN")}`],
        ["Active Customers", (data.total_customers_active || 0).toString()],
        ["Active Vendors", (data.total_vendors_active || 0).toString()],
        ["Pending Orders", (data.pending_orders || 0).toString()],
        ["Pending Payouts", (data.vendor_payouts_pending || 0).toString()],
        ["Top Vendor", data.most_active_vendor || "N/A"],
        ["Discounts Given", (data.discounts_given || 0).toString()],
      ];

      autoTable(doc, {
        startY: 55,
        head: [["Metric", "Value"]],
        body: summaryData,
        theme: "grid",
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 10 },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 60, halign: "right" },
        },
        margin: { left: 15, right: 15 },
      });

      // Order details
      doc.setFontSize(16);
      doc.text("Order Details", 15, doc.lastAutoTable.finalY + 20);

      const orderTableData = orderData.map((order) => [
        order.id?.toString() || "N/A",
        order.vendor || "N/A",
        order.company || "N/A",
        (order.quantity || 0).toString(),
        order.status || "N/A",
        order.vendor_amount_paid ? "Paid" : "Unpaid",
        `Rs. ${(order.vendor_paid_amount || 0).toLocaleString("en-IN")}`,
      ]);

      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 25,
        head: [["ID", "Vendor", "Company", "Qty", "Status", "Payment", "Amount"]],
        body: orderTableData,
        theme: "grid",
        headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
        styles: { fontSize: 9 },
        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 35 },
          2: { cellWidth: 40 },
          3: { cellWidth: 15 },
          4: { cellWidth: 25 },
          5: { cellWidth: 25 },
          6: { cellWidth: 25, halign: "right" },
        },
        margin: { left: 10, right: 10 },
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(
          `MEMInc - Confidential | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: "center" },
        );
      }

      const fileName = filter === "custom" && startDate && endDate 
        ? `MEMInc-Sales-Report-${startDate.replace(/\//g, '-')}-to-${endDate.replace(/\//g, '-')}.pdf`
        : `MEMInc-Sales-Report-${filter}-${new Date().toISOString().split("T")[0]}.pdf`;
      
      doc.save(fileName);
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
    { name: "Revenue", value: data.total_revenue || 0 },
    { name: "Commission", value: data.total_commission_earned || 0 },
    { name: "Vendor Earnings", value: data.total_vendor_earnings || 0 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">MEMInc Dashboard</CardTitle>
              <CardDescription>Sales performance {getPeriodText()}</CardDescription>
            </div>
            <Button onClick={downloadSalesReport} className="bg-primary hover:bg-primary/90">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="daily" value={filter} onValueChange={handleFilterChange} className="mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-4">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
          </Tabs>

          {filter === "custom" && (
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    if (endDate && selectedDate > endDate) setEndDate("");
                    setStartDate(selectedDate);
                  }}
                  max={new Date().toISOString().split('T')[0]}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
                  disabled={!startDate}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm p-2 border"
                />
              </div>
              <Button 
                onClick={handleApplyCustomDates}
                disabled={!startDate || !endDate}
                className="self-end"
              >
                Apply
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <IndianRupee className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">{formatIndianRupees(data.total_revenue)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Commission</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <IndianRupee className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-2xl font-bold">{formatIndianRupees(data.total_commission_earned)}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Vendor Earnings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <IndianRupee className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="text-2xl font-bold">{formatIndianRupees(data.total_vendor_earnings)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold">{data.total_customers_active || 0}</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Vendors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Store className="h-5 w-5 text-purple-500 mr-2" />
                  <span className="text-2xl font-bold">{data.total_vendors_active || 0}</span>
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
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Payment</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-muted/50">
                        <td className="px-4 py-3 text-sm">{order.id || "N/A"}</td>
                        <td className="px-4 py-3 text-sm">{order.vendor || "N/A"}</td>
                        <td className="px-4 py-3 text-sm">{order.company || "N/A"}</td>
                        <td className="px-4 py-3 text-sm">{order.quantity || 0}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.status === "delivered" ? "bg-green-100 text-green-800" :
                            order.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                            "bg-blue-100 text-blue-800"
                          }`}>
                            {order.status || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            order.vendor_amount_paid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
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