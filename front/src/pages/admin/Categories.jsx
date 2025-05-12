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
import { toast } from "sonner"

const mockUser = { role: "admin", canEdit: true, canDelete: true }

export default function Categories() {
  // State
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: "", status: true, description: "" })
  const [formError, setFormError] = useState("")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 10

  // Fetch categories from Supabase (replace with your endpoint)
  useEffect(() => {
    setLoading(true)
    axios
      .get("/api/categories")
      .then((res) => {
        // Adjust this line based on your API response shape:
        setCategories(Array.isArray(res.data) ? res.data : res.data.categories || [])
      })
      .catch(() => setError("Failed to fetch categories"))
      .finally(() => setLoading(false))
  }, [])

  // Summary counts
  const activeCount = categories.filter((c) => c.status).length
  const inactiveCount = categories.length - activeCount

  // Filtered and paginated categories
  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)
  const pageCount = Math.ceil(filtered.length / pageSize)

  // Form logic
  function openForm(cat = null) {
    setEditing(cat ? cat.id : null)
    setForm(cat ? { ...cat } : { name: "", status: true, description: "" })
    setFormError("")
    setDrawerOpen(true)
  }

  function handleFormChange(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function saveCategory() {
    setFormError("")
    if (!form.name.trim()) {
      setFormError("Category name is required.")
      return
    }
    setLoading(true)
    try {
      if (editing) {
        // Update
        await axios.put(`/api/categories/${editing}`, form)
        setCategories((cats) =>
          cats.map((c) => (c.id === editing ? { ...c, ...form } : c))
        )
        toast.success("Category updated!")
      } else {
        // Create
        const res = await axios.post("/api/categories", form)
        setCategories((cats) => [...cats, res.data])
        toast.success("Category created!")
      }
      setDrawerOpen(false)
    } catch (e) {
      setFormError(
        e?.response?.data?.message || "Failed to save category. Try again."
      )
    } finally {
      setLoading(false)
    }
  }

  async function deleteCategory(id) {
    if (!window.confirm("Delete this category?")) return
    setLoading(true)
    try {
      await axios.delete(`/api/categories/${id}`)
      setCategories((cats) => cats.filter((c) => c.id !== id))
      toast.success("Category deleted!")
    } catch {
      toast.error("Failed to delete category.")
    } finally {
      setLoading(false)
    }
  }

  async function toggleStatus(id) {
    setLoading(true)
    try {
      const cat = categories.find((c) => c.id === id)
      await axios.patch(`/api/categories/${id}`, { status: !cat.status })
      setCategories((cats) =>
        cats.map((c) => (c.id === id ? { ...c, status: !c.status } : c))
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
      {/* Category Count Summary */}
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
            <Badge variant="outline">{categories.length}</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <Input
          placeholder="Search category..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        {canEdit && (
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <Button onClick={() => openForm(null)}>New Category</Button>
            </DrawerTrigger>
            <DrawerContent className="w-[400px]">
              <DrawerHeader>
                <DrawerTitle>{editing ? "Edit" : "New"} Category</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 grid gap-4">
                <div className="grid gap-1">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                  />
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
                <Button onClick={saveCategory} disabled={loading}>
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

      {/* Category List Table */}
      <div className="overflow-auto">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-red-600 py-8">{error}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category Name</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>{cat.productCount ?? 0}</TableCell>
                  <TableCell>
                    <Toggle
                      pressed={cat.status}
                      onPressedChange={() => canEdit && toggleStatus(cat.id)}
                      disabled={!canEdit}
                    >
                      {cat.status ? "Active" : "Inactive"}
                    </Toggle>
                  </TableCell>
                  <TableCell>
                    {canEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openForm(cat)}
                        className="mr-2"
                      >
                        Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteCategory(cat.id)}
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