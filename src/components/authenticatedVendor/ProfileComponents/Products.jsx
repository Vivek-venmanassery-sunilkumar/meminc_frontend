import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit, Trash2, X, Check, Ban } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import api from '@/axios/axiosInstance';
import CategoryDropdown from './CategoryDropDown';
import extractErrorMessages from '@/components/commoncomponents/errorHandlefunc';

export default function Products() {
  // State Management
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const ITEMS_PER_PAGE = 10;

  // Edit Mode States
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [imagesToDelete, setImagesToDelete] = useState([]);

  // Image Cropping States
  const [showCropModal, setShowCropModal] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState({ aspect: 1 });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  // Product Form State
  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    description: "",
    images: [],
    variants: [],
  });

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

  // Fetch specific product data for editing
  const fetchProductForEdit = async (productId) => {
    try {
      const response = await api.get(`/vendor/products/${productId}/`);
      if (response.data) {
        const { name, description, category, variants, images } = response.data;
        
        const formattedImages = images.map(img => ({ 
          id: img.id, 
          url: img.url,
          isExisting: true
        }));
        
        const formattedVariants = variants.map(variant => ({
          id: variant.id,
          quantity: variant.quantity,
          price: variant.price,
          stock: variant.stock,
          variant_unit: variant.variant_unit,
        }));
        
        setNewProduct({
          name,
          description,
          category,
          variants: formattedVariants,
          images: formattedImages,
        });
        setImagesToDelete([]);
      }
    } catch (error) {
      console.error("Failed to fetch product for editing:", error);
      toast.error("Could not load product details. Please try again.");
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  useEffect(() => {
    const initialSelectedVariants = {};
    products.forEach((product, index) => {
      if (product.variants.length > 0 && !selectedVariants[index]) {
        initialSelectedVariants[index] = product.variants[0].id;
      }
    });
    setSelectedVariants((prev) => ({ ...prev, ...initialSelectedVariants }));
  }, [products]);

  // Variant Handling Functions
  const handleVariantSelect = (productIndex, variantId) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productIndex]: Number.parseInt(variantId),
    }));
  };

  const getSelectedVariant = (productIndex) => {
    const selectedVariantId = selectedVariants[productIndex];
    return products[productIndex].variants.find(
      (v) => v.id === selectedVariantId
    );
  };

  const handleAddVariant = () => {
    setNewProduct({
      ...newProduct,
      variants: [
        ...newProduct.variants,
        { id: Date.now(), quantity: 0, price: 0, stock: 0, variant_unit: "" },
      ],
    });
  };

  const handleRemoveVariant = (variantIdToRemove) => {
    setNewProduct({
      ...newProduct,
      variants: newProduct.variants.filter(variant => variant.id !== variantIdToRemove)
    });
  };

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...newProduct.variants];
    if ((field === 'price' || field === 'stock' || field === 'quantity') && value < 0) {
      return;
    }
    updatedVariants[index][field] = value;
    setNewProduct({ ...newProduct, variants: updatedVariants });
  };

  // Image Handling Functions
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

  function onImageLoad(e) {
    const { width, height } = e.currentTarget;
    const aspect = 1;
    const cropWidth = width * 0.9;
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
      const imageWithId = { 
        id: Date.now(), 
        file: croppedImage,
        url: URL.createObjectURL(croppedImage),
        isExisting: false
      };
      
      setNewProduct(prev => ({
        ...prev,
        images: [...prev.images, imageWithId]
      }));
      setShowCropModal(false);
    }, 'image/jpeg');
  }

  const handleDeleteImage = (imageId) => {
    const imageToDelete = newProduct.images.find(img => img.id === imageId);
    
    if (isEditMode && imageToDelete && imageToDelete.isExisting) {
      setImagesToDelete(prev => [...prev, imageId]);
    }
    
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  // Form Handling Functions
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

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append('name', newProduct.name);
    formData.append('category', newProduct.category);
    formData.append('description', newProduct.description);

    if (isEditMode) {
      newProduct.images
        .filter(image => image.file)
        .forEach(image => {
          formData.append('images', image.file);
        });
      
      if (imagesToDelete.length > 0) {
        formData.append('images_to_delete', JSON.stringify(imagesToDelete));
      }
    } else {
      newProduct.images.forEach(image => {
        formData.append('images', image.file);
      });
    }

    const variants = newProduct.variants.map((variant) => ({
      id: variant.id,
      quantity: Number(variant.quantity),
      price: Number(variant.price),
      stock: Number(variant.stock),
      variant_unit: variant.variant_unit,
    }));
    formData.append('variants', JSON.stringify(variants));

    try {
      let response;
      
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
        fetchProducts(currentPage);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errors = extractErrorMessages(error.response.data);
        const errorMessage = errors.join(", ");
        toast.error(errorMessage);
      } else {
        toast.error(`Product could not be ${isEditMode ? 'updated' : 'added'} due to an error! Please try again later.`);
      }
    }
  };

  const handleCancel = () => {
    clearForm();
    setIsAddProductOpen(false);
  };

  const handleEditProduct = async (productIndex) => {
    const productToEdit = products[productIndex];
    const productId = productToEdit.id;
    
    setEditingProductId(productId);
    setIsEditMode(true);
    setIsAddProductOpen(true);
    
    await fetchProductForEdit(productId);
  };

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

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

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
              clearForm();
              setIsAddProductOpen(false);
            } else {
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
          <DialogContent className="max-w-4xl h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Crop Image</DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
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
                      className="max-h-[60vh]"
                    />
                  </ReactCrop>
                  <div className="hidden">
                    <canvas
                      ref={previewCanvasRef}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
            </div>
            <div className="bottom-0 bg-background py-4 border-t">
              <Button onClick={handleCropComplete} className="w-full">
                Complete Crop
              </Button>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3">#</th>
                <th className="text-left p-3">Image</th>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Category</th>
                <th className="text-left p-3">Variant</th>
                <th className="text-left p-3">Price</th>
                <th className="text-left p-3">Stock</th>
                <th className="text-left p-3">Blocked by Admin</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const selectedVariant = getSelectedVariant(index);
                return (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{index + 1}</td>
                    <td className="p-3">
                      <img
                        src={product.product_image}
                        alt={product.product_name}
                        className="w-16 h-16 object-cover"
                      />
                    </td>
                    <td className="p-3">{product.product_name}</td>
                    <td className="p-3">{product.category}</td>
                    <td className="p-3">
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
                    <td className="p-3">{selectedVariant ? `₹${selectedVariant.price.toFixed(2)}` : "N/A"}</td>
                    <td className="p-3">{selectedVariant ? selectedVariant.stock : "N/A"}</td>
                    <td className="p-3 items-center">
                      <div className="flex justify-center items-center h-full">
                      {product.is_blocked ? (
                        <Ban className="h-5 w-5 text-red-500" />
                      ) : (
                        <Check className="h-5 w-5 text-green-500" />
                      )}
                      </div>
                    </td>
                    <td className="p-3 gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleEditProduct(index)}
                        disabled={product.is_blocked}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteProduct(index)}
                        disabled={product.is_blocked}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

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