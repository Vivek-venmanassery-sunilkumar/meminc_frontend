import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Search, Tag, Calendar, Percent, ShoppingBag, Clock, Plus } from "lucide-react";
import api from "@/axios/axiosInstance";
import toast from "react-hot-toast";
import extractErrorMessages from "@/components/commoncomponents/errorHandlefunc";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);
  const [editingCouponId, setEditingCouponId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [accordionValue, setAccordionValue] = useState("");
  const itemsPerPage = 10;
  const today = new Date();

  useEffect(() => {
    fetchCoupons();
  }, []);

  useEffect(() => {
    const filtered = coupons.filter((coupon) =>
      coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCoupons(filtered);
    setCurrentPage(1);
  }, [coupons, searchQuery]);

  const fetchCoupons = async () => {
    try {
      const response = await api.get("/admin/coupons/");
      setCoupons(response.data);
    } catch (error) {
      console.error("Error fetching coupons:", error);
    }
  };

  const handleToggleEnabled = async (couponId, currentStatus) => {
    try {
      // Optimistically update the UI
      setCoupons((prevCoupons) =>
        prevCoupons.map((coupon) =>
          coupon.id === couponId
            ? { ...coupon, is_active_admin: !currentStatus }
            : coupon
        )
      );

      // Send the request to the server
      await api.post(`/admin/coupons/${couponId}/toggle/`, {
        is_active_admin: !currentStatus,
      });

      // Show success toast
      toast.success("Coupon status updated successfully!");
    } catch (error) {
      // Revert the UI change if the request fails
      setCoupons((prevCoupons) =>
        prevCoupons.map((coupon) =>
          coupon.id === couponId
            ? { ...coupon, is_active_admin: currentStatus }
            : coupon
        )
      );

      // Show error message
      if (error.response && error.response.data) {
        const errors = extractErrorMessages(error.response.data).join(",");
        toast.error(errors);
      }
    }
  };

  const getCouponStatus = (coupon) => {
    const expiryDate = new Date(coupon.expiry_date);
    if (!coupon.is_active && expiryDate < today) return "expired";
    if (!coupon.is_active && expiryDate >= today) return "yet-to-activate";
    return "active";
  };

  const handleEditClick = (couponId) => {
    setEditingCouponId(couponId);
    setAccordionValue("edit-coupon");
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCoupons = filteredCoupons.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCoupons.length / itemsPerPage);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold">Coupons</CardTitle>
        <CardDescription>Manage discount coupons for your store</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search and Add/Edit Form */}
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search coupons by code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Accordion
            type="single"
            value={accordionValue}
            onValueChange={setAccordionValue}
            collapsible
            className="border rounded-lg shadow-sm"
          >
            <AccordionItem value="edit-coupon" className="border-none">
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>{editingCouponId ? "Edit Coupon" : "Add New Coupon"}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-4 pb-6 border-t">
                <AddCouponForm
                  onCouponAdded={() => {
                    fetchCoupons();
                    setEditingCouponId(null);
                    setAccordionValue("");
                  }}
                  editingCoupon={coupons.find((c) => c.id === editingCouponId)}
                  onCancel={() => {
                    setAccordionValue("");
                    setEditingCouponId(null);
                  }}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Coupons List */}
        <div className="space-y-4">
          {currentCoupons.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No coupons found. Create a new coupon to get started.
            </div>
          ) : (
            currentCoupons.map((coupon) => {
              const status = getCouponStatus(coupon);
              return (
                <Card key={coupon.id} className="overflow-hidden">
                  <div className="p-5 relative">
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(coupon.id)}
                        className="h-8 w-8 rounded-full hover:bg-muted"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-lg">{coupon.code}</h3>
                      {status === "active" && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
                      )}
                      {status === "expired" && (
                        <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
                          Expired
                        </Badge>
                      )}
                      {status === "yet-to-activate" && (
                        <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                          Scheduled
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          {coupon.discount_type === "percentage" ? (
                            <Percent className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <span className="text-muted-foreground">₹</span>
                          )}
                          <span className="text-muted-foreground">Discount:</span>
                          <span className="font-medium">
                            {coupon.discount_value}
                            {coupon.discount_type === "percentage" ? "%" : ""}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Min Order:</span>
                          <span className="font-medium">₹{coupon.min_order_value}</span>
                        </div>

                        {coupon.discount_type === "percentage" && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">₹</span>
                            <span className="text-muted-foreground">Max Discount:</span>
                            <span className="font-medium">₹{coupon.max_discount}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Start Date:</span>
                          <span className="font-medium">{new Date(coupon.start_date).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Expiry Date:</span>
                          <span className="font-medium">{new Date(coupon.expiry_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {status === "expired" ? (
                          <span>This coupon has expired</span>
                        ) : status === "yet-to-activate" ? (
                          <span>This coupon is scheduled for future use</span>
                        ) : (
                          <span>This coupon is currently active</span>
                        )}
                      </div>

                      {status !== "expired" && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Enabled</span>
                          <Switch
                            checked={coupon.is_active_admin}
                            onCheckedChange={() => handleToggleEnabled(coupon.id, coupon.is_active_admin)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {filteredCoupons.length > itemsPerPage && (
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages} ({filteredCoupons.length} coupons)
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AddCouponForm({ onCouponAdded, editingCoupon, onCancel }) {
  const [formData, setFormData] = useState({
    code: "",
    discount_type: "flat",
    discount_value: 0,
    min_order_value: 0,
    max_discount: 0,
    start_date: "",
    expiry_date: "",
  });

  useEffect(() => {
    if (editingCoupon) {
      setFormData({
        code: editingCoupon.code,
        discount_type: editingCoupon.discount_type,
        discount_value: editingCoupon.discount_value,
        min_order_value: editingCoupon.min_order_value,
        max_discount: editingCoupon.max_discount,
        start_date: editingCoupon.start_date,
        expiry_date: editingCoupon.expiry_date,
      });
    }
  }, [editingCoupon]);

  const handleDiscountValueChange = (value) => {
    let newValue = Number(value);

    // Ensure the value is not negative
    newValue = Math.max(0, newValue);

    // If discount type is percentage, clamp the value between 0 and 100
    if (formData.discount_type === "percentage") {
      newValue = Math.min(100, newValue);
    }

    setFormData((prev) => ({
      ...prev,
      discount_value: newValue,
      // If discount type is flat, set max_discount to the same value
      max_discount: prev.discount_type === "flat" ? newValue : prev.max_discount,
    }));
  };

  const handleMinOrderValueChange = (value) => {
    let newValue = Number(value);
    // Ensure the value is not negative
    newValue = Math.max(0, newValue);
    setFormData((prev) => ({
      ...prev,
      min_order_value: newValue,
    }));
  };

  const handleMaxDiscountChange = (value) => {
    let newValue = Number(value);
    // Ensure the value is not negative
    newValue = Math.max(0, newValue);
    setFormData((prev) => ({
      ...prev,
      max_discount: newValue,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Additional validation for percentage discount
    if (formData.discount_type === "percentage" && formData.discount_value > 100) {
      alert("Percentage discount cannot be greater than 100%");
      return;
    }

    try {
      if (editingCoupon) {
        const response = await api.put(`/admin/coupons/${editingCoupon.id}/`, formData);  
        if(response.status === 200){
          toast.success('Coupon updated successfully')
        }
      } else {
        const response = await api.post("/admin/coupons/", formData);
        if(response.status === 201){
          toast.success('Coupon created successfully')
        }
      }
      onCouponAdded();
      resetForm();
    } catch (error) {
      if (error.response && error.response.data) {
        const errors = extractErrorMessages(error.response.data).join(",");
        toast.error(errors);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: "",
      discount_type: "flat",
      discount_value: 0,
      min_order_value: 0,
      max_discount: 0,
      start_date: "",
      expiry_date: "",
    });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Coupon Code</label>
          <Input
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            placeholder="e.g. SUMMER2023"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Discount Type</label>
          <select
            value={formData.discount_type}
            onChange={(e) => {
              const newDiscountType = e.target.value;
              setFormData((prev) => ({
                ...prev,
                discount_type: newDiscountType,
                // Reset max_discount if switching to percentage
                max_discount: newDiscountType === "flat" ? prev.discount_value : 0,
              }));
            }}
            className="w-full h-10 px-3 py-2 border rounded-md bg-background"
          >
            <option value="flat">Flat Amount (₹)</option>
            <option value="percentage">Percentage (%)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Discount Value {formData.discount_type === "percentage" ? "(%)" : "(₹)"}
          </label>
          <Input
            type="number"
            value={formData.discount_value}
            onChange={(e) => handleDiscountValueChange(e.target.value)}
            max={formData.discount_type === "percentage" ? 100 : undefined}
            required
          />
          {formData.discount_type === "percentage" && (
            <p className="text-xs text-muted-foreground mt-1">Percentage must be between 0 and 100</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Minimum Order Value (₹)</label>
          <Input
            type="number"
            value={formData.min_order_value}
            onChange={(e) => handleMinOrderValueChange(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Maximum Discount (₹)</label>
          <Input
            type="number"
            value={formData.max_discount}
            onChange={(e) => handleMaxDiscountChange(e.target.value)}
            disabled={formData.discount_type === "flat"}
            required
          />
          {formData.discount_type === "percentage" && (
            <p className="text-xs text-muted-foreground mt-1">Maximum amount that can be discounted</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Start Date</label>
          <Input
            type="date"
            value={formData.start_date}
            min={today}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Expiry Date</label>
          <Input
            type="date"
            value={formData.expiry_date}
            min={formData.start_date || today}
            onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetForm();
            onCancel();
          }}
        >
          Cancel
        </Button>
        <Button type="submit">{editingCoupon ? "Update Coupon" : "Add Coupon"}</Button>
      </div>
    </form>
  );
}
// function AddCouponForm({ onCouponAdded, editingCoupon, onCancel }) {
//   const [formData, setFormData] = useState({
//     code: "",
//     discount_type: "flat",
//     discount_value: 0,
//     min_order_value: 0,
//     max_discount: 0,
//     start_date: "",
//     expiry_date: "",
//   });

//   useEffect(() => {
//     if (editingCoupon) {
//       setFormData({
//         code: editingCoupon.code,
//         discount_type: editingCoupon.discount_type,
//         discount_value: editingCoupon.discount_value,
//         min_order_value: editingCoupon.min_order_value,
//         max_discount: editingCoupon.max_discount,
//         start_date: editingCoupon.start_date,
//         expiry_date: editingCoupon.expiry_date,
//       });
//     }
//   }, [editingCoupon]);

//   const handleDiscountValueChange = (value) => {
//     let newValue = Number(value);

//     // If discount type is percentage, clamp the value between 0 and 100
//     if (formData.discount_type === "percentage") {
//       newValue = Math.min(100, Math.max(0, newValue));
//     }

//     setFormData((prev) => ({
//       ...prev,
//       discount_value: newValue,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // Additional validation for percentage discount
//     if (formData.discount_type === "percentage" && formData.discount_value > 100) {
//       alert("Percentage discount cannot be greater than 100%");
//       return;
//     }

//     try {
//       if (editingCoupon) {
//         const response = await api.put(`/admin/coupons/${editingCoupon.id}/`, formData);  
//         if(response.status === 200){
//           toast.success('Coupon updated successfully')
//         }
//       } else {
//         const response = await api.post("/admin/coupons/", formData);
//         if(response.status === 201){
//           toast.success('Coupon created successfully')
//         }
//       }
//       onCouponAdded();
//       resetForm();
//     } catch (error) {
//       if (error.response && error.response.data) {
//         const errors = extractErrorMessages(error.response.data).join(",");
//         toast.error(errors);
//       }
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       code: "",
//       discount_type: "flat",
//       discount_value: 0,
//       min_order_value: 0,
//       max_discount: 0,
//       start_date: "",
//       expiry_date: "",
//     });
//   };

//   const today = new Date().toISOString().split("T")[0];

//   return (
//     <form className="space-y-6" onSubmit={handleSubmit}>
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="space-y-2">
//           <label className="text-sm font-medium">Coupon Code</label>
//           <Input
//             value={formData.code}
//             onChange={(e) => setFormData({ ...formData, code: e.target.value })}
//             placeholder="e.g. SUMMER2023"
//             required
//           />
//         </div>

//         <div className="space-y-2">
//           <label className="text-sm font-medium">Discount Type</label>
//           <select
//             value={formData.discount_type}
//             onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
//             className="w-full h-10 px-3 py-2 border rounded-md bg-background"
//           >
//             <option value="flat">Flat Amount (₹)</option>
//             <option value="percentage">Percentage (%)</option>
//           </select>
//         </div>

//         <div className="space-y-2">
//           <label className="text-sm font-medium">
//             Discount Value {formData.discount_type === "percentage" ? "(%)" : "(₹)"}
//           </label>
//           <Input
//             type="number"
//             value={formData.discount_value}
//             onChange={(e) => handleDiscountValueChange(e.target.value)}
//             max={formData.discount_type === "percentage" ? 100 : undefined}
//             required
//           />
//           {formData.discount_type === "percentage" && (
//             <p className="text-xs text-muted-foreground mt-1">Percentage must be between 0 and 100</p>
//           )}
//         </div>

//         <div className="space-y-2">
//           <label className="text-sm font-medium">Minimum Order Value (₹)</label>
//           <Input
//             type="number"
//             value={formData.min_order_value}
//             onChange={(e) => setFormData({ ...formData, min_order_value: Number(e.target.value) })}
//             required
//           />
//         </div>

//         <div className="space-y-2">
//           <label className="text-sm font-medium">Maximum Discount (₹)</label>
//           <Input
//             type="number"
//             value={formData.max_discount}
//             onChange={(e) => setFormData({ ...formData, max_discount: Number(e.target.value) })}
//             disabled={formData.discount_type === "flat"}
//             required
//           />
//           {formData.discount_type === "percentage" && (
//             <p className="text-xs text-muted-foreground mt-1">Maximum amount that can be discounted</p>
//           )}
//         </div>

//         <div className="space-y-2">
//           <label className="text-sm font-medium">Start Date</label>
//           <Input
//             type="date"
//             value={formData.start_date}
//             min={today}
//             onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
//             required
//           />
//         </div>

//         <div className="space-y-2">
//           <label className="text-sm font-medium">Expiry Date</label>
//           <Input
//             type="date"
//             value={formData.expiry_date}
//             min={formData.start_date || today}
//             onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
//             required
//           />
//         </div>
//       </div>

//       <div className="flex gap-3 justify-end pt-2">
//         <Button
//           type="button"
//           variant="outline"
//           onClick={() => {
//             resetForm();
//             onCancel();
//           }}
//         >
//           Cancel
//         </Button>
//         <Button type="submit">{editingCoupon ? "Update Coupon" : "Add Coupon"}</Button>
//       </div>
//     </form>
//   );
// }