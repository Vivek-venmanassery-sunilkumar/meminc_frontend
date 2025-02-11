import React, { useState,useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { X, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import Footer from "../commoncomponents/Footer";

export default function VendorProfileContent() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-1">
        <Tabs defaultValue="dashboard" className="w-full flex" onValueChange={setActiveTab}>
          {/* TabsList (Menu) on the left with fixed height */}
          <TabsList className="w-1/4 flex flex-col items-start space-y-2 pt-20 h-[calc(100vh-250px)] bg-gray-100 overflow-y-auto">
            <TabsTrigger value="dashboard" className="w-full text-left">Dashboard</TabsTrigger>
            <TabsTrigger value="products" className="w-full text-left">Products</TabsTrigger>
            <TabsTrigger value="orders" className="w-full text-left">Orders</TabsTrigger>
            <TabsTrigger value="wallet" className="w-full text-left">Wallet</TabsTrigger>
          </TabsList>

          {/* TabsContent on the right */}
          <div className="w-3/4 pl-8">
            <TabsContent value="dashboard">
              <Dashboard />
            </TabsContent>
            <TabsContent value="products">
              <Products />
            </TabsContent>
            <TabsContent value="orders">
              <Orders />
            </TabsContent>
            <TabsContent value="wallet">
              <Wallet />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      <Footer className="mt-auto" />
    </div>
  );
}

function Dashboard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Total Items Sold</CardTitle>
            </CardHeader>
            <CardContent>
              <p>1,234</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <p>$50,000</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Yearly Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <p>+15%</p>
            </CardContent>
          </Card>
        </div>
        {/* Placeholder for a graph */}
        <div className="mt-8 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Yearly Growth Graph</p>
        </div>
      </CardContent>
    </Card>
  );
}

function Products() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddProductOpen, setIsAddProductOpen] = useState(false);
    const [selectedVariants, setSelectedVariants] = useState({});
    const [products, setProducts] = useState([
      {
        id: 1,
        name: "Organic Apples",
        category: "Fruits",
        image: "/placeholder-product.jpg",
        variants: [
          { id: 1, name: "1 kg", price: 5.99, stock: 100 },
          { id: 2, name: "2 kg", price: 10.99, stock: 50 },
        ],
      },
      {
        id: 2,
        name: "Whole Wheat Bread",
        category: "Bakery",
        image: "/placeholder-product.jpg",
        variants: [
          { id: 1, name: "500g", price: 3.99, stock: 200 },
          { id: 2, name: "1 kg", price: 6.99, stock: 150 },
        ],
      },
    ]);
  
    useEffect(() => {
      const initialSelectedVariants = {};
      products.forEach(product => {
        if (product.variants.length > 0 && !selectedVariants[product.id]) {
          initialSelectedVariants[product.id] = product.variants[0].id;
        }
      });
      setSelectedVariants(prev => ({...prev, ...initialSelectedVariants}));
    }, [products]);
  
    const [newProduct, setNewProduct] = useState({
      name: "",
      category: "",
      description: "",
      image: "",
      variantUnit: "",
      variants: [],
    });
  
    const handleVariantSelect = (productId, variantId) => {
      setSelectedVariants(prev => ({
        ...prev,
        [productId]: parseInt(variantId)
      }));
    };
  
    const getSelectedVariant = (product) => {
      const selectedVariantId = selectedVariants[product.id];
      return product.variants.find(v => v.id === selectedVariantId) || product.variants[0];
    };
  
    // ... (keeping all the existing handlers)
    const handleDeleteVariant = (productId, variantId) => {
      setProducts(
        products.map((product) =>
          product.id === productId
            ? {
                ...product,
                variants: product.variants.filter((variant) => variant.id !== variantId),
              }
            : product
        )
      );
    };
  
    const handleAddVariant = () => {
      setNewProduct({
        ...newProduct,
        variants: [
          ...newProduct.variants,
          { id: Date.now(), quantity: "", price: 0, stock: 0 },
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
  
    const handleSubmitProduct = (e) => {
      e.preventDefault();
      setProducts([...products, { ...newProduct, id: Date.now() }]);
      setNewProduct({
        name: "",
        category: "",
        description: "",
        image: "",
        variantUnit: "",
        variants: [],
      });
      setIsAddProductOpen(false);
    };
  
    const filteredProducts = products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  
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
  
          {/* Add Product Accordion */}
         {isAddProductOpen && (
            <Accordion type="single" collapsible className="mb-6">
              <AccordionItem value="add-product">
                <AccordionTrigger>Add New Product</AccordionTrigger>
                <AccordionContent>
                  <form onSubmit={handleSubmitProduct} className="space-y-4">
                    {/* ... (keeping all the existing form fields) */}
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
                      <label className="block text-sm font-medium mb-1">Category</label>
                          <select
                            value={newProduct.category}
                            onChange={(e) =>
                              setNewProduct({ ...newProduct, category: e.target.value })
                            }
                            className="block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="" disabled>Select a category</option>
                            <option value="Eggs">Eggs</option>
                            <option value="Fish & Seafood">Fish & Seafood</option>
                            <option value="Marinades">Marinades</option>
                            <option value="Mutton & Lamb">Mutton & Lamb</option>
                            <option value="Pork & Other Meats">Pork & Other Meats</option>
                            <option value="Poultry">Poultry</option>
                            <option value="Sausage">Sausage</option>
                            <option value="Bacon & Salami">Bacon & Salami</option>
                          </select>
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
                      <label className="block text-sm font-medium mb-1">Product Image</label>
                      <Input
                        type="file"
                        onChange={(e) =>
                          setNewProduct({ ...newProduct, image: e.target.files[0] })
                        }
                        required
                      />
                    </div>
  
                    <div>
                      <label className="block text-sm font-medium mb-1">Variant Unit</label>
                            <select value={newProduct.variantUnit} 
                                onChange={(e) =>
                                setNewProduct({ ...newProduct, variantUnit: e.target.value })
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
                                type = 'number'
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
  
          {/* Updated Products Table */}
          <table className="w-full">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Variants</th>
                <th>Price</th>
                <th>Available Qty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => {
                const selectedVariant = getSelectedVariant(product);
                return (
                  <tr key={product.id}>
                    <td className="text-center">
                      <img src={product.image} alt={product.name} className="w-16 h-16 object-cover" />
                    </td>
                    <td className="text-center">{product.name}</td>
                    <td className="text-center">{product.category}</td>
                    <td className="text-center">
                      <select 
                        className="w-full p-2 border rounded-md"
                        value={selectedVariants[product.id]}
                        onChange={(e) => handleVariantSelect(product.id, e.target.value)}
                      >
                        {product.variants.map((variant) => (
                          <option key={variant.id} value={variant.id}>
                            {variant.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="text-center">${selectedVariant.price.toFixed(2)}</td>
                    <td className="text-center">{selectedVariant.stock}</td>
                    <td className="text-center">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteVariant(product.id, selectedVariant.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    );
  }

function Orders() {
  const [orders, setOrders] = useState([
    { id: 1, product: "Organic Apples", status: "Processing" },
    { id: 2, product: "Whole Wheat Bread", status: "Dispatched" },
  ]);

  const handleStatusChange = (id, newStatus) => {
    setOrders(
      orders.map((order) => (order.id === id ? { ...order, status: newStatus } : order))
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.map((order) => (
          <div key={order.id} className="mb-4 p-4 border rounded-md">
            <p>Order #{order.id}</p>
            <p>Product: {order.product}</p>
            <div className="flex items-center space-x-2">
              <p>Status:</p>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
              >
                <option value="Processing">Processing</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function Wallet() {
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleWithdraw = () => {
    alert(`Withdrawing $${withdrawAmount}`);
    setWithdrawAmount("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Total Earnings: $10,000</p>
        <div className="mt-4">
          <Input
            type="number"
            placeholder="Enter amount to withdraw"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
          />
          <Button className="mt-2" onClick={handleWithdraw}>
            Withdraw
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}