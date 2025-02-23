import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Edit, Trash2 } from 'lucide-react';
import { Input } from "@/components/ui/input";
import api from "@/axios/axiosInstance";
import extractErrorMessages from "@/components/commoncomponents/errorHandlefunc";
import toast from "react-hot-toast";

export default function ManageAddresses() {
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    street_address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [accordionValue, setAccordionValue] = useState("");
  const [errors, setErrors] = useState({}); // State to track validation errors

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get("customer/addresses/");
      setAddresses(response.data);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`customer/addresses/${id}`);
      setAddresses(addresses.filter(address => address.id !== id));
      toast.success('Address deleted successfully.');
    } catch (error) {
      console.error("Error deleting address:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value, // Ensure value is treated as a string
    });
    // Clear the error for the field when the user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleEditClick = async (id) => {
    try {
      const response = await api.get(`customer/addresses/${id}`);
      setFormData({
        street_address: String(response.data.street_address),
        city: String(response.data.city),
        state: String(response.data.state),
        country: String(response.data.country),
        pincode: String(response.data.pincode), // Convert to string
      });
      setEditMode(true);
      setSelectedAddressId(id);
      setAccordionValue("add-address");
      setErrors({}); // Clear any previous errors when editing
    } catch (error) {
      console.error("Error fetching address for edit:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const value = String(formData[key] || "").trim(); // Convert to string and trim
      if (!value) {
        newErrors[key] = "This field should not be blank.";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }
    try {
      if (editMode) {
        // Update existing address
        const response = await api.put(`customer/addresses/${selectedAddressId}`, formData);
        setAddresses(addresses.map(address => address.id === selectedAddressId ? response.data : address));
        setEditMode(false);
        setSelectedAddressId(null);
        toast.success('Address updated successfully');
      } else {
        // Add new address
        const response = await api.post("customer/addresses/", formData);
        setAddresses([...addresses, response.data]);
        toast.success('Address added successfully');
      }
      setFormData({
        street_address: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
      });
      setAccordionValue(""); // Close the accordion after submission
      setErrors({}); // Clear errors after successful submission
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = extractErrorMessages(error.response.data);
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Addresses</CardTitle>
      </CardHeader>
      <CardContent>
        {addresses.map((address) => (
          <div key={address.id} className="mb-4 p-4 border rounded-md relative group">
            <p>{address.street_address}</p>
            <p>{`${address.city}, ${address.state}, ${address.country} ${address.pincode}`}</p>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" onClick={() => handleEditClick(address.id)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(address.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
        <Accordion type="single" collapsible value={accordionValue} onValueChange={setAccordionValue}>
          <AccordionItem value="add-address">
            <AccordionTrigger>{editMode ? "Edit Address" : "Add New Address"}</AccordionTrigger>
            <AccordionContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <Input
                  placeholder="Street Address"
                  name="street_address"
                  value={formData.street_address}
                  onChange={handleInputChange}
                />
                {errors.street_address && <p className="text-red-500 text-sm">{errors.street_address}</p>}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="City"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                  />
                  {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                  <Input
                    placeholder="State"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                  />
                  {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                  />
                  {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
                  <Input
                    placeholder="Pincode"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                  />
                  {errors.pincode && <p className="text-red-500 text-sm">{errors.pincode}</p>}
                </div>
                <Button type="submit">{editMode ? "Update Address" : "Add Address"}</Button>
                {editMode && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditMode(false);
                      setSelectedAddressId(null);
                      setFormData({
                        street_address: "",
                        city: "",
                        state: "",
                        country: "",
                        pincode: "",
                      });
                      setAccordionValue(""); // Close the accordion on cancel
                      setErrors({}); // Clear errors on cancel
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </form>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}