import React, { useEffect, useState, useMemo } from "react"
import axios from "axios"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import isBetween from "dayjs/plugin/isBetween"
import {
  Card, CardHeader, CardTitle, CardContent,
} from "@/components/ui/card"
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { SidebarInset } from "@/components/ui/sidebar"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { DatePicker } from "@/component/admin/DatePicker"

dayjs.extend(relativeTime)
dayjs.extend(isBetween)

const ORDER_STATUSES = [
  "Pending", "In Progress", "Ready", "Completed", "Cancelled", "Refunded"
]

const currentUser = {
  role: "admin",
  permissions: ["orders:view", "orders:edit", "orders:refund", "orders:delete"],
}

function canEdit(order) {
  if (!order) return false;
  return (
    currentUser.permissions.includes("orders:edit") &&
    ["Pending", "In Progress", "Ready"].includes(order.status)
  );
}
function canRefund(order) {
  if (!order) return false;
  return (
    currentUser.permissions.includes("orders:refund") &&
    ["Completed"].includes(order.status)
  );
}
function canDelete(order) {
  if (!order) return false;
  return currentUser.permissions.includes("orders:delete");
}

function formatOrderDate(date) {
  if (!date) return "-"
  const d = dayjs(date)
  return (
    <span title={d.format("DD MMM YYYY HH:mm")}>
      {d.fromNow()}
    </span>
  )
}

export default function Orders() {
  const [orders, setOrders] = useState([]) // all orders from API
  const [filteredOrders, setFilteredOrders] = useState([]) // filtered orders
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selected, setSelected] = useState([])
  const [filter, setFilter] = useState({
    status: "All",
    search: "",
    dateFrom: null,
    dateTo: null,
  })
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [detailsOrder, setDetailsOrder] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [bulkAction, setBulkAction] = useState("")
  const [bulkDialog, setBulkDialog] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState({ open: false, action: null, order: null })
  const [orderDate, setOrderDate] = useState(null)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)

  // Fetch orders
  useEffect(() => {
    setLoading(true)
    axios
      .get("/orders", {
        params: {
          status: filter.status !== "All" ? filter.status : undefined,
          search: filter.search || undefined,
          dateFrom: filter.dateFrom || undefined,
          dateTo: filter.dateTo || undefined,
          page,
          pageSize,
        },
      })
      .then((res) => setOrders(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Failed to fetch orders"))
      .finally(() => setLoading(false))
  }, [filter, page])

  // Filter orders by date range
  useEffect(() => {
    setLoading(true);
    let filtered = orders;
    if (startDate) {
      filtered = filtered.filter(order =>
        dayjs(order.placed_at).isSameOrAfter(dayjs(startDate), "day")
      );
    }
    if (endDate) {
      filtered = filtered.filter(order =>
        dayjs(order.placed_at).isSameOrBefore(dayjs(endDate), "day")
      );
    }
    setFilteredOrders(filtered);
    setLoading(false);
  }, [orders, startDate, endDate]);

  // Disable logic for pickers
  const disableStartDate = date =>
    endDate ? dayjs(date).isAfter(dayjs(endDate), "day") : false;
  const disableEndDate = date =>
    startDate ? dayjs(date).isBefore(dayjs(startDate), "day") : false;

  // Responsive layout classes
  const datePickerLayout =
    "flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-4 mb-4";

  // Insights
  const today = dayjs().format("YYYY-MM-DD")
  const todayOrders = orders.filter((o) => dayjs(o.placed_at).isSame(today, "day"))
  const revenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0)
  const avgOrderValue = todayOrders.length ? (revenue / todayOrders.length).toFixed(2) : "0.00"
  const cancelled = todayOrders.filter((o) => o.status === "Cancelled").length

  // Filtering and pagination
  const filtered = orders.filter((o) => {
    if (filter.status !== "All" && o.status !== filter.status) return false
    if (
      filter.search &&
      !(
        o.id.toString().includes(filter.search) ||
        o.customer?.toLowerCase().includes(filter.search.toLowerCase())
      )
    )
      return false
    if (filter.dateFrom && !dayjs(o.placed_at).isAfter(dayjs(filter.dateFrom).subtract(1, "day"))) return false
    if (filter.dateTo && !dayjs(o.placed_at).isBefore(dayjs(filter.dateTo).add(1, "day"))) return false
    if (startDate && dayjs(o.placed_at).isBefore(dayjs(startDate), "day")) return false
    if (endDate && dayjs(o.placed_at).isAfter(dayjs(endDate), "day")) return false
    return true
  })
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)
  const pageCount = Math.ceil(filtered.length / pageSize)

  // Status update
  async function updateStatus(order, status) {
    try {
      await axios.patch(`/orders/${order.id}`, { status })
      toast.success("Order status updated")
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status } : o))
      )
    } catch {
      toast.error("Failed to update status")
    }
  }

  // Refund
  async function refundOrder(order) {
    try {
      await axios.patch(`/orders/${order.id}`, { status: "Refunded" })
      toast.success("Order refunded")
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "Refunded" } : o))
      )
    } catch {
      toast.error("Failed to refund order")
    }
  }

  // Delete
  async function deleteOrder(order) {
    try {
      await axios.delete(`/orders/${order.id}`)
      toast.success("Order deleted")
      setOrders((prev) => prev.filter((o) => o.id !== order.id))
    } catch {
      toast.error("Failed to delete order")
    }
  }

  // Bulk actions
  async function handleBulkAction() {
    if (!bulkAction || selected.length === 0) return
    setBulkDialog(false)
    try {
      if (bulkAction === "complete") {
        await Promise.all(
          selected.map((id) =>
            axios.patch(`/orders/${id}`, { status: "Completed" })
          )
        )
        toast.success("Orders marked as completed")
      } else if (bulkAction === "cancel") {
        await Promise.all(
          selected.map((id) =>
            axios.patch(`/orders/${id}`, { status: "Cancelled" })
          )
        )
        toast.success("Orders cancelled")
      }
      setSelected([])
    } catch {
      toast.error("Bulk action failed")
    }
  }

  // Order details
  async function openOrderDetails(orderId) {
    setDetailsLoading(true)
    try {
      const res = await axios.get(`/orders/${orderId}`)
      setDetailsOrder(res.data)
    } catch {
      toast.error("Failed to fetch order details")
    } finally {
      setDetailsLoading(false)
    }
  }
  function closeOrderDetails() {
    setDetailsOrder(null)
  }

  // Selection logic
  function toggleSelect(id) {
    setSelected((sel) =>
      sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]
    )
  }

  // Render
  return (
    <SidebarInset className="p-4">
      {/* Order Insights Panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Today's Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayOrders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{revenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Avg. Order Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">฿{avgOrderValue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Select
          value={filter.status}
          onValueChange={(val) => setFilter((f) => ({ ...f, status: val }))}
        >
          <SelectTrigger className="w-32">Status</SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Search by ID or customer"
          value={filter.search}
          onChange={(e) => setFilter((f) => ({ ...f, search: e.target.value }))}
          className="w-48"
        />
        <DatePicker
          value={orderDate}
          onChange={setOrderDate}
          placeholder="Order date"
        />
      </div>

      {/* Date Range Filters */}
      <div className={datePickerLayout}>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium mb-1">Start Date</label>
          <DatePicker
            value={startDate}
            onChange={date => setStartDate(date)}
            placeholder="Start date"
            extraProps={{
              disabled: endDate
                ? date => dayjs(date).isAfter(dayjs(endDate), "day")
                : undefined,
            }}
          />
        </div>
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium mb-1">End Date</label>
          <DatePicker
            value={endDate}
            onChange={date => setEndDate(date)}
            placeholder="End date"
            extraProps={{
              disabled: startDate
                ? date => dayjs(date).isBefore(dayjs(startDate), "day")
                : undefined,
            }}
          />
        </div>
      </div>

      {/* Bulk Actions */}
      <div className="flex flex-wrap gap-2 items-center mb-2">
        <Select value={bulkAction} onValueChange={setBulkAction}>
          <SelectTrigger className="w-40">Batch Action</SelectTrigger>
          <SelectContent>
            <SelectItem value="complete">Mark as Completed</SelectItem>
            <SelectItem value="cancel">Cancel Orders</SelectItem>
          </SelectContent>
        </Select>
        <Button
          size="sm"
          onClick={() => setBulkDialog(true)}
          disabled={!bulkAction || selected.length === 0}
        >
          Apply
        </Button>
        <span className="ml-2 text-xs text-muted-foreground">
          {selected.length} selected
        </span>
      </div>

      {/* Orders Table */}
      <div className="overflow-auto">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-red-600 py-8">{error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-8">No orders found for the selected date range.</div>
        ) : (
          <OrdersTable orders={filteredOrders} />
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm">
          Page {page} of {pageCount || 1}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
            disabled={page === pageCount || pageCount === 0}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Order Details Drawer */}
      <Drawer open={!!detailsOrder} onOpenChange={closeOrderDetails}>
        <DrawerContent className="max-w-lg w-full">
          <DrawerHeader>
            <DrawerTitle>
              Order #{detailsOrder?.id}
            </DrawerTitle>
          </DrawerHeader>
          <div className="p-4 grid gap-2">
            <div>
              <b>Customer:</b> {detailsOrder?.customer || "Guest"}
            </div>
            <div>
              <b>Status:</b> {detailsOrder?.status}
            </div>
            <div>
              <b>Payment:</b> {detailsOrder?.payment_method || "-"}
            </div>
            <div>
              <b>Transaction ID:</b> {detailsOrder?.transaction_id || "-"}
            </div>
            <div>
              <b>Placed:</b> {detailsOrder?.placed_at && formatOrderDate(detailsOrder.placed_at)}
            </div>
            <div>
              <b>Updated:</b> {detailsOrder?.updated_at && formatOrderDate(detailsOrder.updated_at)}
            </div>
            <div>
              <b>Completed:</b> {detailsOrder?.completed_at && formatOrderDate(detailsOrder.completed_at)}
            </div>
            <div>
              <b>Notes:</b> {detailsOrder?.notes || "-"}
            </div>
            <div>
              <b>Items:</b>
              <ul className="ml-4 list-disc">
                {detailsOrder?.items?.map((item, i) => (
                  <li key={i}>
                    {item.name} x{item.qty} @ ฿{item.price.toFixed(2)} = ฿
                    {(item.qty * item.price).toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <b>Total:</b> <span className="font-bold">฿{detailsOrder?.total?.toFixed(2) ?? "-"}</span>
            </div>
          </div>
          <DrawerFooter>
            {detailsOrder && canEdit(detailsOrder) && (
              <Button onClick={() => updateStatus(detailsOrder, "Completed")}>Mark as Completed</Button>
            )}
            {canRefund(detailsOrder) && (
              <Button onClick={() => refundOrder(detailsOrder)}>Refund</Button>
            )}
            <Button variant="outline" onClick={closeOrderDetails}>
              Close
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Bulk Action Confirmation Dialog */}
      <Dialog open={bulkDialog} onOpenChange={setBulkDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Action</DialogTitle>
          </DialogHeader>
          <div>
            Are you sure you want to {bulkAction === "complete" ? "mark as completed" : "cancel"} {selected.length} orders?
          </div>
          <DialogFooter>
            <Button onClick={handleBulkAction}>Yes</Button>
            <Button variant="outline" onClick={() => setBulkDialog(false)}>No</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Single Order Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onOpenChange={open => setConfirmDialog(c => ({ ...c, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
          </DialogHeader>
          <div>
            {confirmDialog.action === "complete" && "Mark this order as completed?"}
            {confirmDialog.action === "refund" && "Refund this order?"}
            {confirmDialog.action === "delete" && "Delete this order? This cannot be undone."}
          </div>
          <DialogFooter>
            {confirmDialog.action === "complete" && (
              <Button onClick={() => { updateStatus(confirmDialog.order, "Completed"); setConfirmDialog({ open: false, action: null, order: null }) }}>Yes</Button>
            )}
            {confirmDialog.action === "refund" && (
              <Button onClick={() => { refundOrder(confirmDialog.order); setConfirmDialog({ open: false, action: null, order: null }) }}>Yes</Button>
            )}
            {confirmDialog.action === "delete" && (
              <Button variant="destructive" onClick={() => { deleteOrder(confirmDialog.order); setConfirmDialog({ open: false, action: null, order: null }) }}>Delete</Button>
            )}
            <Button variant="outline" onClick={() => setConfirmDialog({ open: false, action: null, order: null })}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  )
}

// Example OrdersTable component (replace with your real table)
function OrdersTable({ orders }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Order #</th>
          <th>Date</th>
          {/* ...other columns... */}
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id}>
            <td>{order.id}</td>
            <td>{dayjs(order.placed_at).format("MMM D, YYYY")}</td>
            {/* ...other cells... */}
          </tr>
        ))}
      </tbody>
    </table>
  );
}