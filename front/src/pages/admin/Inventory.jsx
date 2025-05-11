import React, { useState } from 'react'
import { useSidebar, SidebarInset } from '@/components/ui/sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

export default function Inventory() {
  const { open } = useSidebar()

  // Placeholder data
  const summary = {
    totalItems: 1240,
    lowStockCount: 18,
    totalValue: '$36,750',
  }
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const stockItems = [
    { name: 'Widget A', sku: 'WID-A', qty: 5, reorder: 10, cost: '$3.50', updated: '2024-06-10' },
    /* … more rows … */
  ]
  const activityLog = [
    { name: 'Widget A', type: 'Restock', qty: 20, date: '2024-06-09', staff: 'Alice' },
    /* … */
  ]
  const restockSuggestions = stockItems.filter(i => i.qty < i.reorder)
  const consumptionReport = [
    { name: 'Widget B', used: 120 },
    /* … */
  ]

  return (
    <SidebarInset className="p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle>Total Items</CardTitle></CardHeader>
          <CardContent>{summary.totalItems}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Low Stock Items</CardTitle></CardHeader>
          <CardContent>{summary.lowStockCount}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Total Inventory Value</CardTitle></CardHeader>
          <CardContent>{summary.totalValue}</CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input
          placeholder="Search product..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1"
        />
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="electronics">Snacks</SelectItem>
            <SelectItem value="food">Food</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stock Table */}
      <div className="overflow-auto mb-8">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Reorder</TableHead>
              <TableHead>Unit Cost</TableHead>
              <TableHead>Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stockItems
              .filter(i =>
                (category === 'all' || i.category === category) &&
                i.name.toLowerCase().includes(query.toLowerCase())
              )
              .map(item => (
                <TableRow key={item.sku}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>{item.reorder}</TableCell>
                  <TableCell>{item.cost}</TableCell>
                  <TableCell>{item.updated}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>

      {/* Activity Log */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Inventory Activity Log</h2>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Staff</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityLog.map((log, i) => (
                <TableRow key={i}>
                  <TableCell>{log.name}</TableCell>
                  <TableCell>{log.type}</TableCell>
                  <TableCell>{log.qty}</TableCell>
                  <TableCell>{log.date}</TableCell>
                  <TableCell>{log.staff}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Restock & Consumption Tabs */}
      <Tabs defaultValue="restock">
        <TabsList>
          <TabsTrigger value="restock">Restock Suggestions</TabsTrigger>
          <TabsTrigger value="consumption">Consumption Report</TabsTrigger>
        </TabsList>

        <TabsContent value="restock" className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Qty Left</TableHead>
                <TableHead>Reorder Level</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {restockSuggestions.map(item => (
                <TableRow key={item.sku}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.qty}</TableCell>
                  <TableCell>{item.reorder}</TableCell>
                  <TableCell>
                    <button className="text-primary hover:underline">
                      Create Restock Entry
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="consumption" className="mt-4">
          {/* Simple bar chart or table; placeholder table below */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Used This Month</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {consumptionReport.map((c, i) => (
                <TableRow key={i}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.used}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </SidebarInset>
  )
}