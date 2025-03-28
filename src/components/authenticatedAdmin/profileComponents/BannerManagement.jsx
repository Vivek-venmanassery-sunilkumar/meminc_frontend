import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Edit, Search, Image as ImageIcon, Calendar, Clock, Plus, Trash2 } from "lucide-react";
import api from "@/axios/axiosInstance";
import toast from "react-hot-toast";
import extractErrorMessages from "@/components/commoncomponents/errorHandlefunc";

export default function BannerManagement() {
  const [banners, setBanners] = useState([]);
  const [filteredBanners, setFilteredBanners] = useState([]);
  const [editingBannerId, setEditingBannerId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [accordionValue, setAccordionValue] = useState("");
  const itemsPerPage = 5;
  const today = new Date();

  useEffect(() => {
    fetchBanners();
  }, []);

  useEffect(() => {
    setFilteredBanners(banners);
    setCurrentPage(1);
  }, [banners, searchQuery]);

  const fetchBanners = async () => {
    try {
      const response = await api.get("/admin/fetch-banner/");
      setBanners(response.data);
    } catch (error) {
      console.error("Error fetching banners:", error);
      toast.error("Failed to fetch banners");
    }
  };

  const getBannerStatus = (banner) => {
    // First check if the banner is explicitly marked as inactive
    if (banner.is_active === false) {
      return "inactive";
    }

    // Then check if it's expired
    if (!banner.expiry_date) return "inactive";
    const expiryDate = new Date(banner.expiry_date);
    if (expiryDate < today) return "expired";

    // Then check if it's active based on dates and is_active flag
    if (banner.is_active === true) {
      return "active";
    }

    // Default to inactive
    return "inactive";
  };

  const handleEditClick = (bannerId) => {
    setEditingBannerId(bannerId);
    setAccordionValue("edit-banner");
  };

  const handleDeleteBanner = async (bannerId) => {
    try {
      await api.delete(`/admin/banner-remove/${bannerId}/`);
      setBanners(banners.filter(banner => banner.id !== bannerId));
      toast.success("Banner deleted successfully");
    } catch (error) {
      console.error("Error deleting banner:", error);
      toast.error("Failed to delete banner");
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBanners = filteredBanners.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBanners.length / itemsPerPage);

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold">Banner Management</CardTitle>
        <CardDescription>Manage promotional banners for your store</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Accordion
            type="single"
            value={accordionValue}
            onValueChange={setAccordionValue}
            collapsible
            className="border rounded-lg shadow-sm"
          >
            <AccordionItem value="edit-banner" className="border-none">
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>{editingBannerId ? "Edit Banner" : "Add New Banner"}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-4 pb-6 border-t">
                <BannerForm
                  onBannerAdded={() => {
                    fetchBanners();
                    setEditingBannerId(null);
                    setAccordionValue("");
                  }}
                  editingBanner={banners.find(b => b.id === editingBannerId)}
                  onCancel={() => {
                    setAccordionValue("");
                    setEditingBannerId(null);
                  }}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Banners List */}
        <div className="space-y-4">
          {currentBanners.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {banners.length === 0 ? "No banners found. Create a new banner to get started." : "No banners match your search."}
            </div>
          ) : (
            currentBanners.map((banner) => {
              const status = getBannerStatus(banner);
              return (
                <Card key={banner.id} className="overflow-hidden">
                  <div className="p-5 relative">
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(banner.id)}
                        className="h-8 w-8 rounded-full hover:bg-muted"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="h-8 w-8 rounded-full hover:bg-muted"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      <h3 className="font-bold text-lg">Promotional Banner</h3>
                      <Badge variant={
                        status === "active" ? "default" : 
                        status === "expired" ? "destructive" : "secondary"
                      }>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Badge>
                    </div>

                    <div className="mb-4 rounded-md overflow-hidden border">
                      <img 
                        src={banner.image} 
                        alt="Promotional banner" 
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/placeholder-banner.jpg";
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Start:</span>
                        <span className="font-medium">
                          {new Date(banner.start_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Expiry:</span>
                        <span className="font-medium">
                          {new Date(banner.expiry_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="text-sm text-muted-foreground">
                      {status === "expired" ? "This banner has expired" :
                       status === "active" ? "This banner is currently active" : 
                       "This banner is inactive"}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {filteredBanners.length > itemsPerPage && (
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BannerForm({ onBannerAdded, editingBanner, onCancel }) {
  const [formData, setFormData] = useState({
    image: null,
    start_date: "",
    expiry_date: ""
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editingBanner) {
      setFormData({
        image: editingBanner.image,
        start_date: editingBanner.start_date,
        expiry_date: editingBanner.expiry_date
      });
      setImagePreview(editingBanner.image);
    } else {
      setFormData({
        image: null,
        start_date: "",
        expiry_date: ""
      });
      setImagePreview(null);
    }
  }, [editingBanner]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    const formPayload = new FormData();
    if (formData.image && typeof formData.image !== 'string') {
      formPayload.append('image', formData.image);
    }
    formPayload.append('start_date', formData.start_date);
    formPayload.append('expiry_date', formData.expiry_date);

    try {
      if (editingBanner) {
        await api.put(`/admin/banner-update/${editingBanner.id}/`, formPayload);
        toast.success('Banner updated successfully');
      } else {
        await api.post("/admin/banner/", formPayload);
        toast.success('Banner created successfully');
      }
      onBannerAdded();
    } catch (error) {
      console.error("Error saving banner:", error);
      const errors = error.response?.data ? extractErrorMessages(error.response.data).join(", ") : "Failed to save banner";
      toast.error(errors);
    } finally {
      setIsUploading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Banner Image*</label>
          <p className="text-xs text-muted-foreground">Recommended size: 1200x400px</p>
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            required={!editingBanner}
          />
          {imagePreview && (
            <div className="mt-2 rounded-md overflow-hidden border">
              <img 
                src={imagePreview} 
                alt="Banner preview" 
                className="w-full h-32 object-contain"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date*</label>
            <Input
              type="date"
              value={formData.start_date}
              min={today}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Expiry Date*</label>
            <Input
              type="date"
              value={formData.expiry_date}
              min={formData.start_date || today}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              required
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isUploading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isUploading}>
          {isUploading ? "Processing..." : (editingBanner ? "Update Banner" : "Add Banner")}
        </Button>
      </div>
    </form>
  );
}