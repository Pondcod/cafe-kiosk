import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { Bell, CheckCircle2, AlertTriangle, User, ShoppingCart, Tag, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Card, CardContent } from "@/components/ui/card";

const ICONS = {
  low_stock: <AlertTriangle className="text-yellow-500" />,
  login: <User className="text-blue-500" />,
  logout: <User className="text-gray-500" />,
  order: <ShoppingCart className="text-green-500" />,
  promotion: <Tag className="text-pink-500" />,
  default: <CheckCircle2 className="text-muted-foreground" />,
};

export default function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from backend
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await axios.get("/api/notifications");
      setNotifications(res.data || []);
      setUnread((res.data || []).filter(n => !n.read).length);
    } catch (e) {
      setNotifications([]);
      setUnread(0);
    }
    setLoading(false);
  }

  async function markAllRead() {
    await axios.post("/api/notifications/mark-all-read");
    fetchNotifications();
  }

  async function clearAll() {
    await axios.delete("/api/notifications/clear-all");
    fetchNotifications();
  }

  async function markRead(id) {
    await axios.post(`/api/notifications/${id}/mark-read`);
    fetchNotifications();
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-6 h-6" />
          {unread > 0 && (
            <span className="absolute top-0 right-0">
              <Badge className="bg-red-500 text-white rounded-full px-1 text-xs">{unread}</Badge>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-2 border-b">
              <span className="font-semibold">Notifications</span>
              <div className="flex gap-2">
                <Button size="xs" variant="ghost" onClick={markAllRead}>Mark all read</Button>
                <Button size="xs" variant="ghost" onClick={clearAll}><Trash2 className="w-4 h-4" /></Button>
              </div>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-muted-foreground text-sm">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground text-sm">No notifications</div>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 border-b last:border-b-0 cursor-pointer ${!n.read ? "bg-accent" : ""}`}
                    onClick={() => markRead(n.id)}
                  >
                    <div className="mt-1">{ICONS[n.type] || ICONS.default}</div>
                    <div className="flex-1">
                      <div className="font-medium">{n.message}</div>
                      <div className="text-xs text-muted-foreground">{dayjs(n.created_at).format("MMM D, HH:mm")}</div>
                    </div>
                    {!n.read && <span className="ml-2 mt-1 w-2 h-2 rounded-full bg-primary" />}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}