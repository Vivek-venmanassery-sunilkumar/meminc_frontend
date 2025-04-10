import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, Bell, Heart, ShoppingCart, User } from "lucide-react";
import Logo from "../commoncomponents/logo";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/axios/axiosInstance";

export default function LoggedInUserHeader() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const navigate = useNavigate();

  // Access cart and wishlist state
  const cartItems = useSelector((state) => state.cart.items);
  const cartItemCount = cartItems.length;
  const wishlistItems = useSelector((state) => state.wishlist.items);
  const wishlistItemCount = wishlistItems.length;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Check mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch notifications with proper error handling
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get("admin/notification-fetch/");
        console.log("Notification API response:", data); // Debug log
        
        // Ensure data is always treated as an array
        if (Array.isArray(data)) {
          setNotifications(data);
        } else if (data && Array.isArray(data.notifications)) {
          // Handle case where response is { notifications: [...] }
          setNotifications(data.notifications);
        } else {
          console.error("Unexpected notification format:", data);
          setNotifications([]);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
        setNotifications([]);
      }
    };

    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (debouncedSearchTerm.trim()) {
      navigate("/customer", {
        state: {
          searchQuery: debouncedSearchTerm,
          clearFilters: true,
        },
      });
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const markAsRead = async (notificationId) => {
    try {
      await api.post(`admin/notification-read/${notificationId}/`);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Safe rendering of notifications
  const renderNotifications = () => {
    if (!Array.isArray(notifications)) {
      return (
        <DropdownMenuItem className="text-center py-4 text-gray-500">
          Error loading notifications
        </DropdownMenuItem>
      );
    }

    return notifications.length > 0 ? (
      notifications.map((notification) => (
        <DropdownMenuItem
          key={notification?.id || Math.random()}
          className="flex justify-between items-start p-3 hover:bg-gray-50"
        >
          <div className="flex-1">
            <p className="text-sm text-gray-800">
              {notification?.message || "New notification"}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-6 mt-2 text-blue-600 hover:text-blue-800"
              onClick={(e) => {
                e.stopPropagation();
                if (notification?.id) markAsRead(notification.id);
              }}
            >
              Mark as read
            </Button>
          </div>
        </DropdownMenuItem>
      ))
    ) : (
      <DropdownMenuItem className="text-center py-4 text-gray-500">
        No unread notifications
      </DropdownMenuItem>
    );
  };

  return (
    <header className="bg-[#4A5859] py-2 font-gentium fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/5 flex items-center justify-between lg:justify-start mb-4 lg:mb-0">
          <Link to="/customer">
            <Logo />
          </Link>

          {isMobile && (
            <Button
              variant="ghost"
              onClick={toggleMobileMenu}
              className="text-white lg:hidden"
              aria-label="Toggle menu"
            >
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
                  placeholder="Search products..."
                  className="w-full bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  aria-label="Search products"
                />
                <Button
                  type="submit"
                  variant="ghost"
                  className="ml-2 text-white"
                  disabled={!debouncedSearchTerm.trim()}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                className="text-white relative"
                onClick={() => navigate("/customer/wishlist")}
                aria-label="Wishlist"
              >
                <Heart className="h-5 w-5" />
                {wishlistItemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {wishlistItemCount}
                  </span>
                )}
              </Button>

              {/* Notification Dropdown */}
              <DropdownMenu
                open={isNotificationOpen}
                onOpenChange={setIsNotificationOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-white relative"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.length > 0 && (
                      <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-72 max-h-96 overflow-y-auto bg-white"
                  align="end"
                >
                  {renderNotifications()}
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                className="text-white relative"
                onClick={() => navigate("/customer/cart")}
                aria-label="Shopping cart"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {cartItemCount}
                  </span>
                )}
              </Button>
              <Link to={"/customer-profile/account-overview"}>
                <Button variant="ghost" className="text-white" aria-label="User profile">
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