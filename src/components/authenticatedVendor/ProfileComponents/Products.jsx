import React, { useState,useEffect,useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { X, Edit, Trash2 } from "lucide-react";
import api from "@/axios/axiosInstance";
import toast from "react-hot-toast";
import ReactCrop,{centerCrop, makeAspectCrop} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import CategoryDropdown from "./CategoryDropDown";


export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // New state for all products
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const ITEMS_PER_PAGE = 10; // Define items per page

  // Image cropping states
  const [showCropModal, setShowCropModal] = useState(false);
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    category: "",
    description: "",
    images: [], // Changed to support multiple images
    variants: [],
  });

  // Modified fetch products to get paginated data from backend
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

  // Initial fetch
  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  // Initialize selected variants
  useEffect(() => {
    const initialSelectedVariants = {};
    products.forEach((product, index) => {
      if (product.variants.length > 0 && !selectedVariants[index]) {
        initialSelectedVariants[index] = product.variants[0].id;
      }
    });
    setSelectedVariants((prev) => ({ ...prev, ...initialSelectedVariants }));
  }, [products]);

  // Handle variant selection
  const handleVariantSelect = (productIndex, variantId) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productIndex]: Number.parseInt(variantId),
    }));
  };

  // Get the selected variant for a product
  const getSelectedVariant = (productIndex) => {
    const selectedVariantId = selectedVariants[productIndex];
    return products[productIndex].variants.find(
      (v) => v.id === selectedVariantId
    );
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  // Image cropping functions
  function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight
      ),
      mediaWidth,
      mediaHeight
    );
  }

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
    setCrop(centerAspectCrop(width, height, 1));
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
      setNewProduct(prev => ({
        ...prev,
        images: [...prev.images, croppedImage]
      }));
      setShowCropModal(false);
    }, 'image/jpeg');
  }

  // Add product functions
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
      return; // Prevent negative values
    }
    updatedVariants[index][field] = value;
    setNewProduct({ ...newProduct, variants: updatedVariants });
  };

  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    formData.append('name', newProduct.name);
    formData.append('category', newProduct.category);
    formData.append('description', newProduct.description);

    newProduct.images.forEach((image, index) => {
      if (image instanceof File) {
        formData.append(`images`, image);
      }
    });

    const variants = newProduct.variants.map((variant) => ({
      quantity: Number(variant.quantity),
      price: Number(variant.price),
      stock: Number(variant.stock),
      variant_unit: variant.variant_unit,
    }));
    formData.append("variants", JSON.stringify(variants));

    try {
      const response = await api.post('/vendor/add-product/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.status === 201) {
        setIsAddProductOpen(false);
        toast.success("Product added successfully");
        fetchProducts(currentPage); // Refresh the product list
      }
    } catch (error) {
      if (error.response && error.response.data) {
        const errorMessages = Object.values(error.response.data).flat().join(", ");
        toast.error(errorMessages);
      } else {
        toast.error("Product could not be added due to an error! Please try again later.");
      }
    }
  };

  // Edit product function
  const handleEditProduct = (productIndex) => {
    const productToEdit = products[productIndex];
    setNewProduct({
      name: productToEdit.product_name,
      category: productToEdit.category,
      description: productToEdit.description || "",
      images: productToEdit.product_images || [],
      variants: productToEdit.variants,
    });
    setIsAddProductOpen(true);
  };

  // Delete product function
  const handleDeleteProduct = async (productIndex) => {
    const productToDelete = products[productIndex];
    try {
      const response = await api.delete(`/vendor/products/${productToDelete.id}/`);
      if (response.status === 204) {
        toast.success("Product deleted successfully");
        fetchProducts(currentPage); // This will now fetch all products again
      }
    } catch (error) {
      toast.error("Failed to delete product. Please try again later.");
    }
  };
 

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <Input
            placeholder="Search products..."
            className="w-1/2"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button onClick={() => setIsAddProductOpen(!isAddProductOpen)}>
            {isAddProductOpen ? "Cancel" : "Add Product"}
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

        {/* Add Product Accordion */}
        {isAddProductOpen && (
          <Accordion type="single" collapsible className="mb-6">
            <AccordionItem value="add-product">
              <AccordionTrigger>Add New Product</AccordionTrigger>
              <AccordionContent>
                <form onSubmit={handleSubmitProduct} className="space-y-4">
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

                  <div>
                      <CategoryDropdown 
                          value={newProduct.category}
                          onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      />
                  </div>

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

                  <div>
                    <label className="block text-sm font-medium mb-1">Product Images</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={onSelectFile}
                      required
                    />
                    {newProduct.images.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">{newProduct.images.length} images selected</p>
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

                  <Button type="submit" className="w-full">
                    Submit Product
                  </Button>
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
              console.log(product)
              return (
                <tr key={index}>
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
              <td className="text-center">{selectedVariant ? `$${selectedVariant.price.toFixed(2)}` : "N/A"}</td>
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

