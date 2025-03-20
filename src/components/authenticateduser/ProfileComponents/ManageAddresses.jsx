import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Edit, Trash2, MapPin, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import api from "@/axios/axiosInstance"
import extractErrorMessages from "@/components/commoncomponents/errorHandlefunc"
import toast from "react-hot-toast"

export default function ManageAddresses() {
  const [addresses, setAddresses] = useState([])
  const [formData, setFormData] = useState({
    street_address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  })
  const [editMode, setEditMode] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [accordionValue, setAccordionValue] = useState("")
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch addresses on component mount
  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    setIsLoading(true)
    try {
      const response = await api.get("customer/addresses/")
      setAddresses(response.data)
    } catch (error) {
      console.error("Error fetching addresses:", error)
      toast.error("Failed to load addresses")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`customer/addresses/${id}`)
      setAddresses(addresses.filter((address) => address.id !== id))
      toast.success("Address deleted successfully.")
    } catch (error) {
      console.error("Error deleting address:", error)
      toast.error("Failed to delete address")
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear the error for the field when the user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleEditClick = async (id) => {
    try {
      const response = await api.get(`customer/addresses/${id}`)
      setFormData({
        street_address: String(response.data.street_address),
        city: String(response.data.city),
        state: String(response.data.state),
        country: String(response.data.country),
        pincode: String(response.data.pincode),
      })
      setEditMode(true)
      setSelectedAddressId(id)
      setAccordionValue("add-address")
      setErrors({})
    } catch (error) {
      console.error("Error fetching address for edit:", error)
      toast.error("Failed to load address details")
    }
  }

  const validateForm = () => {
    const newErrors = {}
    Object.keys(formData).forEach((key) => {
      const value = String(formData[key] || "").trim()
      if (!value) {
        newErrors[key] = "This field should not be blank."
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      if (editMode) {
        // Update existing address
        const response = await api.put(`customer/addresses/${selectedAddressId}`, formData)
        setAddresses(addresses.map((address) => (address.id === selectedAddressId ? response.data : address)))
        setEditMode(false)
        setSelectedAddressId(null)
        toast.success("Address updated successfully")
      } else {
        // Add new address
        const response = await api.post("customer/addresses/", formData)
        setAddresses([...addresses, response.data])
        toast.success("Address added successfully")
      }
      setFormData({
        street_address: "",
        city: "",
        state: "",
        country: "",
        pincode: "",
      })
      setAccordionValue("")
      setErrors({})
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessage = extractErrorMessages(error.response.data)
        toast.error(errorMessage)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-[#4A5859]/20 shadow-sm">
      <CardHeader className="border-b border-[#4A5859]/10 bg-[#4A5859]/5">
        <CardTitle className="text-[#4A5859] flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Manage Addresses
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="h-12 w-12 mx-auto text-[#4A5859]/30 mb-4" />
            <p className="text-[#4A5859]/70">No addresses found</p>
            <Button
              onClick={() => setAccordionValue("add-address")}
              className="mt-4 bg-[#4A5859] hover:bg-[#3A4849] text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Address
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="p-4 border border-[#4A5859]/20 rounded-md relative group hover:shadow-md transition-shadow bg-white"
              >
                <div className="pr-16">
                  <p className="font-medium text-[#4A5859]">{address.street_address}</p>
                  <p className="text-[#4A5859]/70 text-sm mt-1">
                    {`${address.city}, ${address.state}, ${address.country} ${address.pincode}`}
                  </p>
                </div>
                <div className="absolute top-3 right-3 flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditClick(address.id)}
                    className="h-8 w-8 text-[#4A5859] hover:bg-[#4A5859]/10"
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(address.id)}
                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6">
          <Accordion type="single" collapsible value={accordionValue} onValueChange={setAccordionValue}>
            <AccordionItem value="add-address" className="border border-[#4A5859]/20 rounded-md">
              <AccordionTrigger className="px-4 py-3 text-[#4A5859] hover:text-[#4A5859] hover:no-underline">
                <span className="flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  {editMode ? "Edit Address" : "Add New Address"}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="space-y-2">
                    <label htmlFor="street_address" className="block text-sm font-medium text-[#4A5859]">
                      Street Address
                    </label>
                    <Input
                      id="street_address"
                      placeholder="Street Address"
                      name="street_address"
                      value={formData.street_address}
                      onChange={handleInputChange}
                      className="border-[#4A5859]/30 focus-visible:ring-[#4A5859]"
                    />
                    {errors.street_address && <p className="text-red-500 text-sm">{errors.street_address}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="city" className="block text-sm font-medium text-[#4A5859]">
                        City
                      </label>
                      <Input
                        id="city"
                        placeholder="City"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="border-[#4A5859]/30 focus-visible:ring-[#4A5859]"
                      />
                      {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="state" className="block text-sm font-medium text-[#4A5859]">
                        State
                      </label>
                      <Input
                        id="state"
                        placeholder="State"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="border-[#4A5859]/30 focus-visible:ring-[#4A5859]"
                      />
                      {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label htmlFor="country" className="block text-sm font-medium text-[#4A5859]">
                        Country
                      </label>
                      <Input
                        id="country"
                        placeholder="Country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="border-[#4A5859]/30 focus-visible:ring-[#4A5859]"
                      />
                      {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="pincode" className="block text-sm font-medium text-[#4A5859]">
                        Pincode
                      </label>
                      <Input
                        id="pincode"
                        placeholder="Pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        className="border-[#4A5859]/30 focus-visible:ring-[#4A5859]"
                      />
                      {errors.pincode && <p className="text-red-500 text-sm">{errors.pincode}</p>}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      className="bg-[#4A5859] hover:bg-[#3A4849] text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : editMode ? "Update Address" : "Add Address"}
                    </Button>
                    {editMode && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditMode(false)
                          setSelectedAddressId(null)
                          setFormData({
                            street_address: "",
                            city: "",
                            state: "",
                            country: "",
                            pincode: "",
                          })
                          setAccordionValue("")
                          setErrors({})
                        }}
                        className="border-[#4A5859]/30 text-[#4A5859]"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </form>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {!accordionValue && addresses.length > 0 && (
          <Button
            onClick={() => setAccordionValue("add-address")}
            className="mt-6 bg-[#4A5859] hover:bg-[#3A4849] text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

