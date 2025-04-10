import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plus, Bell, User, Users, Store } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/axios/axiosInstance";
import toast from "react-hot-toast";
import extractErrorMessages from "@/components/commoncomponents/errorHandlefunc";

export default function NotificationManagement() {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [accordionValue, setAccordionValue] = useState("");
  const itemsPerPage = 5;

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    setFilteredNotifications(notifications);
    setCurrentPage(1);
  }, [notifications, searchQuery]);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/admin/fetch-notifications/");
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to fetch notifications");
    }
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentNotifications = filteredNotifications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);

  const getDirectedToIcon = (directedTo) => {
    switch (directedTo.toLowerCase()) {
      case 'customer':
        return <User className="h-4 w-4" />;
      case 'vendor':
        return <Store className="h-4 w-4" />;
      case 'all':
        return <Users className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getBadgeVariant = (directedTo) => {
    switch (directedTo.toLowerCase()) {
      case 'customer':
        return 'default';
      case 'vendor':
        return 'secondary';
      case 'all':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-2xl font-bold">Notification Management</CardTitle>
        <CardDescription>Manage and send notifications to users</CardDescription>
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
            <AccordionItem value="add-notification" className="border-none">
              <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Add New Notification</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pt-4 pb-6 border-t">
                <NotificationForm
                  onNotificationAdded={() => {
                    fetchNotifications();
                    setAccordionValue("");
                  }}
                  onCancel={() => {
                    setAccordionValue("");
                  }}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {currentNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {notifications.length === 0 ? "No notifications found. Create a new notification to get started." : "No notifications match your search."}
            </div>
          ) : (
            currentNotifications.map((notification) => (
              <Card key={notification.id} className="overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Bell className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-lg">Notification</h3>
                    <Badge variant={getBadgeVariant(notification.directed_towards)}>
                      <div className="flex items-center gap-1">
                        {getDirectedToIcon(notification.directed_towards)}
                        {notification.directed_towards.charAt(0).toUpperCase() + notification.directed_towards.slice(1)}
                      </div>
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <p className="text-muted-foreground">{notification.message}</p>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Sent on: {new Date(notification.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {filteredNotifications.length > itemsPerPage && (
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

function NotificationForm({ onNotificationAdded, onCancel }) {
  const [formData, setFormData] = useState({
    message: "",
    directed_to: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await api.post("/admin/notification-add/", formData);
      toast.success('Notification sent successfully');
      onNotificationAdded();
    } catch (error) {
      console.error("Error sending notification:", error);
      const errors = error.response?.data ? extractErrorMessages(error.response.data).join(", ") : "Failed to send notification";
      toast.error(errors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Message*</label>
          <Input
            type="text"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            placeholder="Enter notification message"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Send To*</label>
          <Select
            value={formData.directed_to}
            onValueChange={(value) => setFormData({ ...formData, directed_to: value })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select recipient type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="customer">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Customers Only
                </div>
              </SelectItem>
              <SelectItem value="vendor">
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  Vendors Only
                </div>
              </SelectItem>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Both Customers and Vendors
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Notification"}
        </Button>
      </div>
    </form>
  );
}