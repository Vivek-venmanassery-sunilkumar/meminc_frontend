import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Menu, X, Bell, Heart, ShoppingCart, User } from 'lucide-react'
import Logo from "../commoncomponents/logo"

const categories = [
  "Eggs",
  "Fish & Seafood",
  "Marinades",
  "Mutton & Lamb",
  "Pork & other Meats",
  "Poultry",
  "Sausage,Bacon & salami",
]

export default function LoggedInUserHeader() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    console.log(`Searching for: ${searchTerm}`)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-[#4A5859] py-2 font-gentium fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/5 flex items-center justify-between lg:justify-start mb-4 lg:mb-0">
          <Logo />
          {isMobile && (
            <Button variant="ghost" onClick={toggleMobileMenu} className="text-white lg:hidden">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          )}
        </div>
        <div className={`w-full lg:w-4/5 flex flex-col ${isMobile && !isMobileMenuOpen ? "hidden" : "flex"}`}>
          <div className="flex flex-col lg:flex-row items-center justify-between mb-2 p-2 bg-[#3A4849] rounded-lg">
            <div className="w-full lg:flex-grow lg:mr-4 mb-2 lg:mb-0">
              <form onSubmit={handleSearch} className="flex items-center">
                <Input
                  type="search"
                  placeholder="Search..."
                  className="w-full bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="submit" variant="ghost" className="ml-2 text-white">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" className="text-white">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" className="text-white">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" className="text-white">
                <ShoppingCart className="h-5 w-5" />
              </Button>
              <Button variant="ghost" className="text-white" onClick={() => window.location.href = '/account-overview'}>
                <User className="h-5 w-5" />
              </Button>
            </div>
          </div>
          <nav>
            <ul className="flex flex-col lg:flex-row flex-wrap justify-start -mx-2">
              {categories.map((category, index) => (
                <li key={index} className="px-2 py-1">
                  <a href="#" className="text-white hover:text-[#F0EAD6] text-sm whitespace-nowrap">
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}

