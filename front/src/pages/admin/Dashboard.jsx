import React from 'react'
import { useSidebar, SidebarInset } from '@/components/ui/sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { AreaChart, BarChart, Bar, XAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts'

export default function Dashboard() {
  const { open } = useSidebar()

  // ← placeholder data; swap in your real data.
  const lowStock = [
    { name: 'Widget A', qty: 3, reorder: 10, last: '2024-06-01' },
    /* … */
  ]
  const salesSummary = {
    today: { revenue: '$1,200', orders: 32, aov: '$37.50' },
    week:  { revenue: '$8,750', orders: 220, aov: '$39.77' },
    month: { revenue: '$32,100', orders: 820, aov: '$39.17' },
  }
  const bestSelling = [
    { product: 'Widget A', sold: 150, revenue: 4500 },
    /* … */
  ]
  const recentOrders = [
    { id: 'A123', time: '10:15 AM', status: 'Paid', total: '$120.00' },
    /* … */
  ]
  const activePromos = [
    { name: 'June Sale', type: '% off', expires: '2024-06-30' },
    /* … */
  ]

  return (
    <SidebarInset className="p-4 transition-all duration-200">
      {/* Sales Summary: 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(salesSummary).map(([period, data]) => (
          <Card key={period}>
            <CardHeader>
              <CardTitle className="capitalize">{period} Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div>Total Revenue: {data.revenue}</div>
              <div>Total Orders: {data.orders}</div>
              <div>Avg Order: {data.aov}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Low on Stock & Best-Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <section>
          <h2 className="text-lg font-semibold mb-2">Low on Stock</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Qty Left</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead>Last Restocked</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lowStock.map((row) => (
                <TableRow key={row.name}>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.qty}</TableCell>
                  <TableCell>{row.reorder}</TableCell>
                  <TableCell>{row.last}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Best-Selling Products</h2>
          <ChartContainer id="best-selling" config={{}}>
            <BarChart data={bestSelling}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product" />
              <RechartsTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="sold" fill="var(--primary)" />
            </BarChart>
          </ChartContainer>
        </section>
      </div>

      {/* Recent Orders & Active Promotions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <section>
          <h2 className="text-lg font-semibold mb-2">Recent Orders</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((o) => (
                <TableRow key={o.id}>
                  <TableCell>{o.id}</TableCell>
                  <TableCell>{o.time}</TableCell>
                  <TableCell>{o.status}</TableCell>
                  <TableCell>{o.total}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-2">Active Promotions</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Expires</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activePromos.map((p) => (
                <TableRow key={p.name}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.type}</TableCell>
                  <TableCell>{p.expires}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      </div>
    </SidebarInset>
  )
}