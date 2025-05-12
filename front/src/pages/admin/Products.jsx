import React, { useEffect, useState } from "react"
import axios from "axios"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Toggle } from "@/components/ui/toggle"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { toast } from "sonner"

const mockUser = { role: "admin", canEdit: true, canDelete: true }

export default function Products() {
  // State
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    price: "",
    stock: "",
    image: null,
    status: true,
  })
  const [formError, setFormError] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Fetch products and categories
  useEffect(() => {
    setLoading(true)
    Promise.all([
      axios.get("/api/products"),
      axios.get("/api/categories"),
    ])
      .then(([prodRes, catRes]) => {
        setProducts(Array.isArray(prodRes.data) ? prodRes.data : [])
        setCategories(Array.isArray(catRes.data) ? catRes.data : [])
      })
      .catch(() => setError("Failed to fetch products or categories"))
      .finally(() => setLoading(false))
  }, [])

  // Summary counts
  const activeCount = products.filter((p) => p.status).length
  const inactiveCount = products.length - activeCount

  // Filtered and paginated products
  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)
  const pageCount = Math.ceil(filtered.length / pageSize)

  // Form logic
  function openForm(prod = null) {
    setEditing(prod ? prod.id : null)
    setForm(
      prod
        ? { ...prod, image: null }
        : { name: "", category: "", description: "", price: "", stock: "", image: null, status: true }
    )
    setFormError("")
    setDrawerOpen(true)
  }

  function handleFormChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function saveProduct() {
    setFormError("")
    if (!form.name.trim() || !form.category || !form.price || !form.stock) {
      setFormError("Name, category, price, and stock are required.")
      return
    }
    if (isNaN(Number(form.price)) || isNaN(Number(form.stock))) {
      setFormError("Price and stock must be numbers.")
      return
    }
    setLoading(true)
    try {
      let payload = { ...form }
      // handle image upload if needed
      if (form.image && typeof form.image !== "string") {
        // You may need to handle file upload to Supabase Storage here
        // For now, just omit image upload logic
        payload = { ...payload, image: "uploaded-image-url" }
      }
      if (editing) {
        await axios.put(`/api/products/${editing}`, payload)
        setProducts((ps) =>
          ps.map((p) => (p.id === editing ? { ...p, ...payload } : p))
        )
        toast.success("Product updated!")
      } else {
        const res = await axios.post("/api/products", payload)
        setProducts((ps) => [...ps, res.data])
        toast.success("Product created!")
      }
      setDrawerOpen(false)
    } catch (e) {
      setFormError(
        e?.response?.data?.message || "Failed to save product. Try again."
      )
    } finally {
      setLoading(false)
    }
  }

  async function deleteProduct(id) {
    if (!window.confirm("Delete this product?")) return
    setLoading(true)
    try {
      await axios.delete(`/api/products/${id}`)
      setProducts((ps) => ps.filter((p) => p.id !== id))
      toast.success("Product deleted!")
    } catch {
      toast.error("Failed to delete product.")
    } finally {
      setLoading(false)
    }
  }

  async function toggleStatus(id) {
    setLoading(true)
    try {
      const prod = products.find((p) => p.id === id)
      await axios.patch(`/api/products/${id}`, { status: !prod.status })
      setProducts((ps) =>
        ps.map((p) => (p.id === id ? { ...p, status: !p.status } : p))
      )
      toast.success("Status updated!")
    } catch {
      toast.error("Failed to update status.")
    } finally {
      setLoading(false)
    }
  }

  // Permission checks
  const canEdit = mockUser.canEdit
  const canDelete = mockUser.canDelete

  return (
    <SidebarInset className="p-4">
      {/* Product Count Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Active</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{activeCount}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inactive</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{inactiveCount}</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline">{products.length}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <Input
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        {canEdit && (
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <Button onClick={() => openForm(null)}>New Product</Button>
            </DrawerTrigger>
            <DrawerContent className="w-[400px]">
              <DrawerHeader>
                <DrawerTitle>{editing ? "Edit" : "New"} Product</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 grid gap-4">
                <div className="grid gap-1">
                  <Label htmlFor="name">Product Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => handleFormChange("category", v)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.name}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="desc">Description</Label>
                  <Input
                    id="desc"
                    value={form.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={form.price}
                    onChange={(e) => handleFormChange("price", e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={form.stock}
                    onChange={(e) => handleFormChange("stock", e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="image">Product Image</Label>
                  <Input
                    id="image"
                    type="file"
                    onChange={(e) =>
                      handleFormChange("image", e.target.files?.[0])
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Label>Status</Label>
                  <Toggle
                    pressed={form.status}
                    onPressedChange={(v) => handleFormChange("status", v)}
                  >
                    {form.status ? "Active" : "Inactive"}
                  </Toggle>
                </div>
                {formError && <div className="text-red-600">{formError}</div>}
              </div>
              <DrawerFooter className="flex justify-end">
                <Button onClick={saveProduct} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDrawerOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
      </div>

      {/* Product List Table */}
      <div className="overflow-auto">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-red-600 py-8">{error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((prod) => (
                <TableRow key={prod.id}>
                  <TableCell>{prod.name}</TableCell>
                  <TableCell>{prod.category}</TableCell>
                  <TableCell>${Number(prod.price).toFixed(2)}</TableCell>
                  <TableCell>{prod.stock}</TableCell>
                  <TableCell>
                    <Toggle
                      pressed={prod.status}
                      onPressedChange={() => canEdit && toggleStatus(prod.id)}
                      disabled={!canEdit}
                    >
                      {prod.status ? "Active" : "Inactive"}
                    </Toggle>
                  </TableCell>
                  <TableCell>
                    {canEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openForm(prod)}
                        className="mr-2"
                      >
                        Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteProduct(prod.id)}
                      >
                        Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
    </SidebarInset>
  )
}