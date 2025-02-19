import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import api from '@/axios/axiosInstance'; // Assuming you have an API utility
import CategoryDropdown from './CategoryDropDown'; // Import the CategoryDropdown component

export default function Products() {
  // ==================== State Management ====================
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // State for all products
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const ITEMS_PER_PAGE = 10; // Define items per page

  // ==================== Edit Mode States ====================
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [imagesToDelete, setImagesToDelete] = useState([]); // Track images to delete during edit mode

  // ==================== Image Cropping States ====================
  const [showCropModal, setShowCropModal] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // ==================== Product Form State ====================
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    description: "",
    images: [], // Stores images - either File objects for new uploads or {id, url} for existing images
    variants: [],
  });

  // ==================== Data Fetching Functions ====================

  // Fetch paginated products from backend
  const fetchProducts = async (page = 1) => {
    try {
      const response = await api.get('/vendor/product-listing/', {
        params: {
          page: page,
          page_size: ITEMS_PER_PAGE,
        },
      });
      if (response.data) {
        setProducts(response.data.results);
        setTotalProducts(response.data.count);
        setTotalPages(Math.ceil(response.data.count / ITEMS_PER_PAGE));
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  // Fetch specific product data for editing using the product ID
  const fetchProductForEdit = async (productId) => {
    try {
      const response = await api.get(`/vendor/products/${productId}/`);
      if (response.data) {
        const { name, description, category, variants, images } = response.data;
        
        // Format images to have consistent structure {id, url} for existing images
        const formattedImages = images.map(img => ({ 
          id: img.id, 
          url: img.url,
          isExisting: true // Flag to identify existing images
        }));
        
        setNewProduct({
          name,
          description,
          category,
          variants,
          images: formattedImages,
        });
        setImagesToDelete([]); // Reset images to delete when starting a new edit
      }
    } catch (error) {
      console.error("Failed to fetch product for editing:", error);
      toast.error("Could not load product details. Please try again.");
    }
  };

  // ==================== Effect Hooks ====================
  
  // Initial product fetch on page change
  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  // Initialize selected variants when products change
  useEffect(() => {
    const initialSelectedVariants = {};
    products.forEach((product, index) => {
      if (product.variants.length > 0 && !selectedVariants[index]) {
        initialSelectedVariants[index] = product.variants[0].id;
      }
    });
    setSelectedVariants((prev) => ({ ...prev, ...initialSelectedVariants }));
  }, [products]);

  // ==================== Variant Handling Functions ====================
  
  // Handle variant selection in product list
  const handleVariantSelect = (productIndex, variantId) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productIndex]: Number.parseInt(variantId),
    }));
  };

  // Get the selected variant for a product in the list
  const getSelectedVariant = (productIndex) => {
    const selectedVariantId = selectedVariants[productIndex];
    return products[productIndex].variants.find(
      (v) => v.id === selectedVariantId
    );
  };

  // Add new variant to form
  const handleAddVariant = () => {
    setNewProduct({
      ...newProduct,
      variants: [
        ...newProduct.variants,
        { id: Date.now(), quantity: 0, price: 0, stock: 0, variant_unit: "" },
      ],
    });
  };

  // Remove variant from form
  const handleRemoveVariant = (variantIdToRemove) => {
    setNewProduct({
      ...newProduct,
      variants: newProduct.variants.filter(variant => variant.id !== variantIdToRemove)
    });
  };

  // Update variant field values in form
  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...newProduct.variants];
    if ((field === 'price' || field === 'stock' || field === 'quantity') && value < 0) {
      return; // Prevent negative values
    }
    updatedVariants[index][field] = value;
    setNewProduct({ ...newProduct, variants: updatedVariants });
  };

  // ==================== Image Handling Functions ====================
  
  // Handle file selection for image upload
  function onSelectFile(e) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImgSrc(reader.result.toString());
        setShowCropModal(true);
      });
      reader.readAsDataURL(file);
    }
  }

  // Handle image load for cropping
  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    // Calculate a centered crop
    const aspect = 1; // Square aspect ratio
    const cropWidth = width * 0.9; // 90% of the image width
    const cropHeight = cropWidth / aspect;
    const cropX = (width - cropWidth) / 2;
    const cropY = (height - cropHeight) / 2;

    setCrop({
      unit: 'px',
      x: cropX,
      y: cropY,
      width: cropWidth,
      height: cropHeight,
    });
  }

  // Process completed crop and add to product images
  async function handleCropComplete() {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const croppedImage = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
      // Add a unique ID and temporary URL for display 
      const imageWithId = { 
        id: Date.now(), 
        file: croppedImage,
        url: URL.createObjectURL(croppedImage),
        isExisting: false // Flag to identify as a new image
      };
      
      setNewProduct(prev => ({
        ...prev,
        images: [...prev.images, imageWithId]
      }));
      setShowCropModal(false);
    }, 'image/jpeg');
  }

  // Handle image deletion
  const handleDeleteImage = (imageId) => {
    // First, get the image to be deleted
    const imageToDelete = newProduct.images.find(img => img.id === imageId);
    
    // If in edit mode and it's an existing image (has isExisting flag), add to delete list
    if (isEditMode && imageToDelete && imageToDelete.isExisting) {
      setImagesToDelete(prev => [...prev, imageId]);
    }
    
    // Remove image from the display list regardless of type
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  // ==================== Form Handling Functions ====================
  
  // Clear form and reset states
  const clearForm = () => {
    setNewProduct({
      name: "",
      category: "",
      description: "",
      images: [],
      variants: [],
    });
    setIsEditMode(false);
    setEditingProductId(null);
    setImagesToDelete([]);
  };

  // Handle form submission (both add and edit)
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    // Common form data
    formData.append('name', newProduct.name);
    formData.append('category', newProduct.category);
    formData.append('description', newProduct.description);

    // Handle images differently based on add/edit mode
    if (isEditMode) {
      // For edit mode: 
      // 1. New images (with file property) need to be uploaded
      newProduct.images
        .filter(image => image.file)
        .forEach(image => {
          formData.append('images', image.file);
        });
      
      // 2. Existing images to delete need to be identified
      if (imagesToDelete.length > 0) {
        formData.append('images_to_delete', JSON.stringify(imagesToDelete));
      }
    } else {
      // For add mode: All images should be uploaded
      newProduct.images.forEach(image => {
        formData.append('images', image.file);
      });
    }

    // Process variants
    const variants = newProduct.variants.map((variant) => ({
      quantity: Number(variant.quantity),
      price: Number(variant.price),
      stock: Number(variant.stock),
      variant_unit: variant.variant_unit,
    }));
    formData.append('variants', JSON.stringify(variants));

    try {
      let response;
      
      // Different API endpoints for add vs edit
      if (isEditMode && editingProductId) {
        response = await api.put(`/vendor/products/${editingProductId}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        response = await api.post('/vendor/add-product/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      if (response.status === 201 || response.status === 200) {
        setIsAddProductOpen(false);
        clearForm();
        toast.success(`Product ${isEditMode ? 'updated' : 'added'} successfully`);
        fetchProducts(currentPage); // Refresh the product list
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessages = Object.values(error.response.data).flat().join(", ");
        toast.error(errorMessages);
      } else {
        toast.error(`Product could not be ${isEditMode ? 'updated' : 'added'} due to an error! Please try again later.`);
      }
    }
  };

  // Cancel form submission
  const handleCancel = () => {
    clearForm();
    setIsAddProductOpen(false);
  };

  // Handle edit product action
  const handleEditProduct = async (productIndex) => {
    // Get the product from the products array
    const productToEdit = products[productIndex];
    
    // Important: Use the product ID from the API response
    // This is the key change - ensuring we're using the actual product_id that came from the backend
    const productId = productToEdit.id;
    
    // Set edit mode flags and store the ID
    setEditingProductId(productId);
    setIsEditMode(true);
    setIsAddProductOpen(true);
    
    // Fetch the product details for editing using the product ID
    await fetchProductForEdit(productId);
  };

  // Handle product deletion
  const handleDeleteProduct = async (productIndex) => {
    const productToDelete = products[productIndex];
    const productId = productToDelete.id;
    
    try {
      const response = await api.delete(`/vendor/products/${productId}/`);
      if (response.status === 204 || response.status === 200) {
        toast.success("Product deleted successfully");
        fetchProducts(currentPage);
      }
    } catch (error) {
      toast.error("Failed to delete product. Please try again.");
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // ==================== Render Component ====================
  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Add Button */}
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Search products..."
            className="w-1/2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button onClick={() => {
            if (isAddProductOpen) {
              // If already open, just close it
              clearForm();
              setIsAddProductOpen(false);
            } else {
              // If opening, ensure we're in add mode, not edit mode
              clearForm();
              setIsEditMode(false);
              setIsAddProductOpen(true);
            }
          }}>
            {isAddProductOpen ? "Close" : "Add Product"}
          </Button>
        </div>

        {/* Image Cropping Modal */}
        <Dialog open={showCropModal} onOpenChange={setShowCropModal}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Crop Image</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {imgSrc && (
                <div className="flex flex-col items-center gap-4">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                  >
                    <img
                      ref={imgRef}
                      alt="Crop me"
                      src={imgSrc}
                      onLoad={onImageLoad}
                      className="max-h-96"
                    />
                  </ReactCrop>
                  <div className="hidden">
                    <canvas
                      ref={previewCanvasRef}
                      className="hidden"
                    />
                  </div>
                  <Button onClick={handleCropComplete}>
                    Complete Crop
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Product Form (Add/Edit) */}
        {isAddProductOpen && (
          <Accordion type="single" collapsible className="mb-6" value="add-product">
            <AccordionItem value="add-product">
              <AccordionTrigger>{isEditMode ? "Edit Product" : "Add New Product"}</AccordionTrigger>
              <AccordionContent>
                <form onSubmit={handleSubmitProduct} className="space-y-4">
                  {/* Basic Product Information */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Product Name</label>
                    <Input
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Category Dropdown */}
                  <CategoryDropdown
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                  />

                  <div>
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <Input
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, description: e.target.value })
                      }
                      required
                    />
                  </div>

                  {/* Image Upload & Management */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Product Images</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={onSelectFile}
                    />
                    {newProduct.images.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">{newProduct.images.length} images selected</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {newProduct.images.map((image) => (
                            <div key={image.id} className="relative">
                              <img
                                src={image.url}
                                alt="Product"
                                className="w-16 h-16 object-cover rounded-md"
                              />
                              <button
                                type="button"
                                onClick={() => handleDeleteImage(image.id)}
                                className="absolute top-0 right-0 p-1 hover:bg-gray-100 rounded-full"
                              >
                                <X className="h-4 w-4 text-gray-500" />
                              </button>
                            </div>
                          ))} 
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Variants Section */}
                  <div className="space-y-4">
                    {newProduct.variants.map((variant, index) => (
                      <div key={variant.id} className="border p-4 rounded-md relative">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(variant.id)}
                          className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded-full"
                        >
                          <X className="h-4 w-4 text-gray-500" />
                        </button>
                        
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Variant Quantity
                            </label>
                            <Input
                              type="number"
                              placeholder="e.g., 1, 500 (No need to write the unit)"
                              value={variant.quantity}
                              onChange={(e) =>
                                handleVariantChange(index, "quantity", e.target.value)
                              }
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Price (₹)
                            </label>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0.00"
                              value={variant.price}
                              onChange={(e) =>
                                handleVariantChange(index, "price", parseFloat(e.target.value))
                              }
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Stock
                            </label>
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              placeholder="0"
                              value={variant.stock}
                              onChange={(e) =>
                                handleVariantChange(index, "stock", parseInt(e.target.value))
                              }
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Variant Unit
                            </label>
                            <select
                              value={variant.variant_unit}
                              onChange={(e) =>
                                handleVariantChange(index, "variant_unit", e.target.value)
                              }
                              className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                            >
                              <option value="" disabled>Select a unit</option>
                              <option value="kg">kg</option>
                              <option value="g">g</option>
                              <option value="packet of">packet of</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button type="button" onClick={handleAddVariant}>
                      Add Variant
                    </Button>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex gap-2">
                    <Button type="submit" className="w-full">
                      {isEditMode ? "Update Product" : "Submit Product"}
                    </Button>
                    <Button type="button" onClick={handleCancel} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </form>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Products Table */}
        <table className="w-full">
          <thead>
            <tr>
              <th>#</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Variant</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => {
              const selectedVariant = getSelectedVariant(index);
              return (
                <tr key={product.id}>
                  <td className="text-center">{index + 1}</td>
                  <td className="text-center">
                    <img
                      src={product.product_image}
                      alt={product.product_name}
                      className="w-16 h-16 object-cover"
                    />
                  </td>
                  <td className="text-center">{product.product_name}</td>
                  <td className="text-center">{product.category}</td>
                  <td className="text-center">
                    {product.variants && product.variants.length > 0 ? (
                      <select
                        className="w-full p-2 border rounded-md"
                        value={selectedVariants[index] || ""}
                        onChange={(e) => handleVariantSelect(index, e.target.value)}
                      >
                        {product.variants.map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            {variant.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span>No variants</span>
                    )}
                  </td>
                  <td className="text-center">{selectedVariant ? `₹${selectedVariant.price.toFixed(2)}` : "N/A"}</td>
                  <td className="text-center">{selectedVariant ? selectedVariant.stock : "N/A"}</td>
                  <td className="text-center">
                    <Button variant="ghost" size="icon" onClick={() => handleEditProduct(index)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteProduct(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-600">
            Showing page {currentPage} of {totalPages} (Total products: {totalProducts})
          </div>
          <div className="flex gap-2">
            <Button
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}