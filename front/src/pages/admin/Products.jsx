import React, { useState, useEffect } from 'react'
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
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerTrigger,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { Toggle } from '@/components/ui/toggle'

export default function Products() {
  const { open } = useSidebar()
  // placeholder product data
  const initial = [
    { id: 1, name: 'Widget A', category: 'Gadgets', price: 9.99, status: true, image: '/img/a.jpg' },
    { id: 2, name: 'Gizmo B', category: 'Gadgets', price: 14.99, status: false, image: '/img/b.jpg' },
    { id: 3, name: 'Tool C',  category: 'Tools',   price: 29.99, status: true, image: '/img/c.jpg' },
    // … more
  ]

  const [products, setProducts] = useState(initial)
  const [filterCat, setFilterCat] = useState('all')
  const [query, setQuery] = useState('')
  const [filtered, setFiltered] = useState(initial)
  const [selected, setSelected] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    status: true,
    image: null,
  })

  // compute categories
  const categories = Array.from(new Set(products.map(p => p.category)))

  useEffect(() => {
    let f = products
      .filter(p => (filterCat === 'all' || p.category === filterCat))
      .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
    setFiltered(f)
    // clear selection if items removed
    setSelected(sel => sel.filter(id => f.some(p => p.id === id)))
  }, [products, filterCat, query])

  function toggleSelectAll(val) {
    setSelected(val ? filtered.map(p => p.id) : [])
  }
  function toggleSelect(id, val) {
    setSelected(sel =>
      val ? [...sel, id] : sel.filter(x => x !== id)
    )
  }

  function openForm(prod = null) {
    if (prod) {
      setEditing(prod.id)
      setForm({ ...prod })
    } else {
      setEditing(null)
      setForm({ name:'', description:'', price:'', category:'', status:true, image:null })
    }
    setDrawerOpen(true)
  }

  function save() {
    if (editing) {
      setProducts(ps => ps.map(p => p.id === editing ? { ...p, ...form } : p))
    } else {
      const id = Date.now()
      setProducts(ps => [...ps, { id, ...form }])
    }
    setDrawerOpen(false)
  }

  function bulkDelete() {
    setProducts(ps => ps.filter(p => !selected.includes(p.id)))
    setSelected([])
  }
  function bulkToggle() {
    setProducts(ps =>
      ps.map(p =>
        selected.includes(p.id)
          ? { ...p, status: !p.status }
          : p
      )
    )
    setSelected([])
  }

  // summary counts
  const total = products.length
  const active = products.filter(p => p.status).length
  const inactive = total - active

  return (
    <SidebarInset className="p-4">
      {/* Status summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader><CardTitle>Total Products</CardTitle></CardHeader>
          <CardContent>{total}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Active</CardTitle></CardHeader>
          <CardContent>{active}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Inactive</CardTitle></CardHeader>
          <CardContent>{inactive}</CardContent>
        </Card>
        {categories.map(cat => (
          <Card key={cat}>
            <CardHeader><CardTitle>{cat}</CardTitle></CardHeader>
            <CardContent>
              {products.filter(p => p.category === cat).length}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters & Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <Input
          placeholder="Search product..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1"
        />
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selected.length > 0 && (
          <div className="flex gap-2">
            <Button variant="destructive" onClick={bulkDelete}>
              Delete ({selected.length})
            </Button>
            <Button variant="outline" onClick={bulkToggle}>
              Toggle Status
            </Button>
          </div>
        )}

        {/* Add / Edit form trigger */}
        <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
          <DrawerTrigger asChild>
            <Button onClick={() => openForm(null)}>New Product</Button>
          </DrawerTrigger>
          <DrawerOverlay />
          <DrawerContent className="w-[400px]">
            <DrawerHeader>
              <DrawerTitle>{editing ? 'Edit' : 'New'} Product</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 grid gap-4">
              <div className="grid gap-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="desc">Description</Label>
                <Input
                  id="desc"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={v => setForm(f => ({ ...f, category: v }))}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label>Status</Label>
                <Toggle
                  pressed={form.status}
                  onPressedChange={v => setForm(f => ({ ...f, status: v }))}
                >{form.status ? 'Active' : 'Inactive'}</Toggle>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  onChange={e => setForm(f => ({ ...f, image: e.target.files?.[0] }))}
                />
              </div>
            </div>
            <DrawerFooter className="flex justify-end">
              <Button onClick={save}>Save</Button>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Product list */}
      <div className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Checkbox
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(p => (
              <TableRow key={p.id}>
                <TableCell>
                  <Checkbox
                    checked={selected.includes(p.id)}
                    onCheckedChange={v => toggleSelect(p.id, v)}
                  />
                </TableCell>
                <TableCell>
                  <img src={p.image} alt={p.name} className="h-8 w-8 rounded" />
                </TableCell>
                <TableCell>{p.name}</TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell className="text-right">${p.price.toFixed(2)}</TableCell>
                <TableCell>{p.status ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>
                  <Button size="icon" variant="outline" onClick={() => openForm(p)}>
                    Edit
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => setProducts(ps => ps.filter(x => x.id !== p.id))}
                    className="ml-2"
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </SidebarInset>
  )
}