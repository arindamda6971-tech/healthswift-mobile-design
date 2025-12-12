import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bell,
  ShoppingBag,
  FileText,
  Gift,
  Info,
  Check,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MobileLayout from "@/components/layout/MobileLayout";
import ScreenHeader from "@/components/layout/ScreenHeader";
import { useNotifications, Notification } from "@/contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";

const NotificationsScreen = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, clearNotifications, unreadCount } =
    useNotifications();

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "order":
        return ShoppingBag;
      case "report":
        return FileText;
      case "promo":
        return Gift;
      default:
        return Info;
    }
  };

  const getIconColor = (type: Notification["type"]) => {
    switch (type) {
      case "order":
        return "text-primary bg-primary/10";
      case "report":
        return "text-success bg-success/10";
      case "promo":
        return "text-warning bg-warning/10";
      default:
        return "text-muted-foreground bg-muted";
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);

    if (notification.type === "order" && notification.data?.orderId) {
      navigate("/tracking", { state: { orderId: notification.data.orderId } });
    } else if (notification.type === "report" && notification.data?.reportId) {
      navigate("/report-detail", { state: { reportId: notification.data.reportId } });
    }
  };

  return (
    <MobileLayout showNav={false}>
      <ScreenHeader
        title="Notifications"
        rightAction={
          unreadCount > 0 ? (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <Check className="w-4 h-4 mr-1" />
              Mark all read
            </Button>
          ) : undefined
        }
      />

      <div className="px-4 pb-6">
        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-20 text-center"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
              <Bell className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground">No notifications yet</h2>
            <p className="text-muted-foreground mt-2">
              When you book tests or receive reports, notifications will appear here.
            </p>
            <Button variant="outline" className="mt-6" onClick={() => navigate("/home")}>
              Book a Test
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Clear all button */}
            <div className="flex justify-end mt-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNotifications}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Clear all
              </Button>
            </div>

            {/* Notification list */}
            <div className="space-y-3">
              {notifications.map((notification, index) => {
                const Icon = getIcon(notification.type);
                return (
                  <motion.button
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full soft-card flex items-start gap-4 text-left transition-all ${
                      !notification.read ? "border-l-4 border-l-primary" : ""
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconColor(
                        notification.type
                      )}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`font-medium ${
                          !notification.read ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </MobileLayout>
  );
};

export default NotificationsScreen;
