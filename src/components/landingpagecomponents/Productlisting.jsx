import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

const initialProducts = [
  {
    id: 1,
    companyName: "FreshMeat Co.",
    productName: "Premium Chicken Breast",
    category: "Poultry",
    rating: 4.5,
    availableQuantity: 50,
    price: 9.99,
  },
  {
    id: 2,
    companyName: "SeaDelight",
    productName: "Atlantic Salmon Fillet",
    category: "Fish & Seafood",
    rating: 4.7,
    availableQuantity: 30,
    price: 14.99,
  },
  {
    id: 3,
    companyName: "Farm Fresh",
    productName: "Organic Eggs",
    category: "Eggs",
    rating: 4.8,
    availableQuantity: 100,
    price: 5.99,
  },
  // Add more product objects here...
]

export default function ProductListing() {
  const [products, setProducts] = useState(initialProducts)

  return (
    <div className="container mx-auto py-8 px-4 font-gentium">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h2 className="text-2xl font-bold mb-2 sm:mb-0">Featured Products</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="bg-[#F0EAD6] text-[#4A5859]">
            <CardContent className="p-4">
              <h3 className="font-semibold">{product.companyName}</h3>
              <p className="text-lg font-bold mt-2">{product.productName}</p>
              <div className="flex items-center mt-2">
                <Star className="w-4 h-4 fill-current text-[#D4AF37]" />
                <span className="ml-1">{product.rating}</span>
              </div>
              <p className="mt-2">Available: {product.availableQuantity}</p>
            </CardContent>
            <CardFooter className="flex justify-between items-center p-4 bg-[#E6DCC8]">
              <span className="text-lg font-bold">₹{product.price.toFixed(2)}</span>
              <Button variant="outline" className="bg-[#4A5859] text-white hover:bg-[#3A4849]">
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}