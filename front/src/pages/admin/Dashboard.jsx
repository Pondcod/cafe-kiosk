import React, { useEffect, useState } from "react"
import axios from "axios"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { SidebarInset } from "@/components/ui/sidebar"
import { toast } from "sonner"
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts"

const timeRanges = [
  { label: "Today", value: "today" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
]

export default function Dashboard() {
  // State
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [lowStock, setLowStock] = useState([])
  const [lowStockSort, setLowStockSort] = useState("quantity")
  const [lowStockPage, setLowStockPage] = useState(1)
  const lowStockPageSize = 5

  const [salesSummary, setSalesSummary] = useState({})
  const [salesRange, setSalesRange] = useState("today")

  const [topItems, setTopItems] = useState([])
  const [topSort, setTopSort] = useState("units")
  const [topRange, setTopRange] = useState("today")

  const [orders, setOrders] = useState([])
  const [orderStatus, setOrderStatus] = useState("all")

  const [promotions, setPromotions] = useState([])

  const [charts, setCharts] = useState({ revenue: [], inventory: [], orders: [] })

  // Fetch all dashboard data
  useEffect(() => {
    setLoading(true)
    axios.get("/api/dashboard")
      .then(res => {
        setLowStock(res.data.lowStock || [])
        setSalesSummary(res.data.salesSummary || {})
        setTopItems(res.data.topItems || [])
        setOrders(res.data.orders || [])
        setPromotions(res.data.promotions || [])
        setCharts(res.data.charts || { revenue: [], inventory: [], orders: [] })
        toast.success("Dashboard loaded")
      })
      .catch(() => {
        setError("Failed to load dashboard data.")
        toast.error("Failed to load dashboard data.")
      })
      .finally(() => setLoading(false))
  }, [])

  // Inventory Warnings: sorting & pagination
  const sortedLowStock = [...lowStock].sort((a, b) => {
    if (lowStockSort === "quantity") return a.quantity - b.quantity
    if (lowStockSort === "reorder") return a.reorderLimit - b.reorderLimit
    if (lowStockSort === "restocked") return new Date(a.lastRestocked) - new Date(b.lastRestocked)
    return 0
  })
  const pagedLowStock = sortedLowStock.slice((lowStockPage - 1) * lowStockPageSize, lowStockPage * lowStockPageSize)
  const lowStockPageCount = Math.ceil(sortedLowStock.length / lowStockPageSize)

  // Top Items: filter & sort
  const filteredTop = [...topItems]
    .filter(i => topRange === "all" || i.period === topRange)
    .sort((a, b) => topSort === "units" ? b.unitsSold - a.unitsSold : b.revenue - a.revenue)
    .slice(0, 5)

  // Orders: filter
  const filteredOrders = orderStatus === "all"
    ? orders.slice(0, 5)
    : orders.filter(o => o.status === orderStatus).slice(0, 5)

  return (
    <SidebarInset className="p-4">
      {/* 💰 Sales Snapshot */}
      <div className="mb-6">
        <Tabs value={salesRange} onValueChange={setSalesRange}>
          <TabsList>
            {timeRanges.map(r => (
              <TabsTrigger key={r.value} value={r.value}>{r.label}</TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={salesRange}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold">
                    {salesSummary[salesRange]?.revenue ?? "-"}
                  </span>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold">
                    {salesSummary[salesRange]?.orders ?? "-"}
                  </span>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Avg Order Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="text-2xl font-bold">
                    {salesSummary[salesRange]?.aov ?? "-"}
                  </span>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* 📊 Analytics & Visual Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={charts.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inventory Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={charts.inventory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="product" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantity" fill="#f59e42" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Order Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={charts.orders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#10b981" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 📦 Inventory Warnings & 🔥 Top-Performing Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Inventory Warnings */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Low Stock Alert</h2>
            <div className="flex gap-2">
              <Button size="sm" variant={lowStockSort === "quantity" ? "default" : "outline"} onClick={() => setLowStockSort("quantity")}>Qty</Button>
              <Button size="sm" variant={lowStockSort === "reorder" ? "default" : "outline"} onClick={() => setLowStockSort("reorder")}>Reorder</Button>
              <Button size="sm" variant={lowStockSort === "restocked" ? "default" : "outline"} onClick={() => setLowStockSort("restocked")}>Restocked</Button>
            </div>
          </div>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead>Reorder Limit</TableHead>
                  <TableHead>Last Restocked</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pagedLowStock.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.quantity}</TableCell>
                    <TableCell>{row.reorderLimit}</TableCell>
                    <TableCell>{row.lastRestocked}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs">
                Page {lowStockPage} of {lowStockPageCount || 1}
              </span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setLowStockPage((p) => Math.max(1, p - 1))} disabled={lowStockPage === 1}>Prev</Button>
                <Button size="sm" variant="outline" onClick={() => setLowStockPage((p) => Math.min(lowStockPageCount, p + 1))} disabled={lowStockPage === lowStockPageCount || lowStockPageCount === 0}>Next</Button>
              </div>
            </div>
          </div>
        </section>
        {/* Top-Performing Items */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Top-Performing Items</h2>
            <div className="flex gap-2">
              <Button size="sm" variant={topSort === "units" ? "default" : "outline"} onClick={() => setTopSort("units")}>Units Sold</Button>
              <Button size="sm" variant={topSort === "revenue" ? "default" : "outline"} onClick={() => setTopSort("revenue")}>Revenue</Button>
              <Tabs value={topRange} onValueChange={setTopRange}>
                <TabsList>
                  <TabsTrigger value="today">Today</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="all">All</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Units Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTop.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.unitsSold}</TableCell>
                    <TableCell>{row.revenue}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>

      {/* 🧾 Latest Orders & 🎯 Current Promotions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Latest Orders */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Latest Orders</h2>
            <Tabs value={orderStatus} onValueChange={setOrderStatus}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="Completed">Completed</TabsTrigger>
                <TabsTrigger value="Pending">Pending</TabsTrigger>
                <TabsTrigger value="In Progress">In Progress</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((o) => (
                  <TableRow key={o.number}>
                    <TableCell>{o.number}</TableCell>
                    <TableCell>{o.time}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{o.status}</Badge>
                    </TableCell>
                    <TableCell>{o.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
        {/* Current Promotions */}
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold">Current Promotions</h2>
            <Button size="sm" variant="outline" asChild>
              <a href="/admin/promotions">View/Edit</a>
            </Button>
          </div>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((p) => (
                  <TableRow key={p.name}>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.type}</TableCell>
                    <TableCell>{p.expires}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </div>

      {/* Loading/Error */}
      {loading && <div className="text-center py-8">Loading...</div>}
      {error && <div className="text-red-600 py-8">{error}</div>}
    </SidebarInset>
  )
}