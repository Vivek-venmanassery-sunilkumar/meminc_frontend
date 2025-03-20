import { useState, useEffect } from "react";
import { useSelector } from "react-redux"; // Import useSelector
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, Bell, Heart, ShoppingCart, User } from 'lucide-react';
import Logo from "../commoncomponents/logo";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function LoggedInUserHeader() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Access the cart state
  const cartItems = useSelector((state) => state.cart.items);
  const cartItemCount = cartItems.length;
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const wishlistItemCount = wishlistItems.length;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log(`Searching for: ${searchTerm}`);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-[#4A5859] py-2 font-gentium fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/5 flex items-center justify-between lg:justify-start mb-4 lg:mb-0">
          <Link to='/customer'>
            <Logo />
          </Link>
        
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
              <Button
                variant="ghost"
                className="text-white relative" // Add relative positioning here
                onClick={() => { navigate('/customer/wishlist') }}
              >
                <Heart className="h-5 w-5" />
                {wishlistItemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {wishlistItemCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                className="text-white relative" // Add relative positioning here
                onClick={() => { navigate('/customer/cart') }}
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {cartItemCount}
                  </span>
                )}
              </Button>
              <Link to={'/customer-profile/account-overview'}>
                <Button variant="ghost" className="text-white">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}