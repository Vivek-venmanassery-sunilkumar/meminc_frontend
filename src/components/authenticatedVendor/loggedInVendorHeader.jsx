import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, User } from "lucide-react";
import Logo from "../commoncomponents/logo";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import api from "@/axios/axiosInstance";

export default function LoggedInSellerHeader() {
  const [notifications, setNotifications] = useState([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

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
    <header className="bg-[#4A5859] py-2 font-gentium fixed w-full z-50">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <Logo />
        </div>
        <div className="flex items-center space-x-2">
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

          <Link to={'/vendor-profile/account-overview'}>
            <Button variant="ghost" className="text-white">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}