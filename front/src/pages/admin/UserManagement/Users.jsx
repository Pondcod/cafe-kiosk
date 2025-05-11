import React, { useState, useEffect } from "react"
import { SidebarInset } from "@/components/ui/sidebar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter } from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Toggle } from "@/components/ui/toggle"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { toast } from "sonner"

const ROLES = ["admin", "manager", "staff"]
const PERMISSIONS = {
  admin: ["Can view orders", "Can edit menu", "Can manage users", "Can view reports"],
  manager: ["Can view orders", "Can edit menu", "Can view reports"],
  staff: ["Can view orders"],
}

const initialUsers = [
  {
    id: 1,
    name: "Alice Smith",
    email: "alice@cafe.com",
    role: "admin",
    status: true,
    lastLogin: "2024-06-25 09:12",
    permissions: PERMISSIONS.admin,
  },
  {
    id: 2,
    name: "Bob Jones",
    email: "bob@cafe.com",
    role: "manager",
    status: true,
    lastLogin: "2024-06-24 17:45",
    permissions: PERMISSIONS.manager,
  },
  {
    id: 3,
    name: "Charlie Brown",
    email: "charlie@cafe.com",
    role: "staff",
    status: false,
    lastLogin: "2024-06-20 14:10",
    permissions: PERMISSIONS.staff,
  },
]

const initialActivity = [
  { id: 1, user: "Alice Smith", action: "Logged in", datetime: "2024-06-25 09:12" },
  { id: 2, user: "Bob Jones", action: "Updated menu item", datetime: "2024-06-24 17:50" },
  { id: 3, user: "Charlie Brown", action: "Changed password", datetime: "2024-06-20 14:15" },
]

export default function Users() {
  // Simulate logged-in user permissions
  const currentUser = { role: "admin", permissions: PERMISSIONS.admin }

  const [users, setUsers] = useState(initialUsers)
  const [activity, setActivity] = useState(initialActivity)
  const [roleFilter, setRoleFilter] = useState("all")
  const [selected, setSelected] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "staff",
    password: "",
    status: true,
    permissions: PERMISSIONS.staff,
  })
  const [formError, setFormError] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [tab, setTab] = useState("users")
  const [activityFilter, setActivityFilter] = useState("")
  const [activityPage, setActivityPage] = useState(1)

  // Role summary
  const summary = ROLES.map(role => ({
    role,
    count: users.filter(u => u.role === role).length,
  }))
  const totalUsers = users.length

  // Filtered users
  const filteredUsers = users.filter(
    u =>
      (roleFilter === "all" || u.role === roleFilter) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()))
  )

  // Activity log pagination/filter
  const filteredActivity = activity
    .filter(a =>
      (!activityFilter || a.action.includes(activityFilter))
    )
    .slice((activityPage - 1) * 10, activityPage * 10)

  // Permission-based UI
  const canEdit = currentUser.permissions.includes("Can manage users")
  const canDelete = currentUser.permissions.includes("Can manage users")
  const canViewActivity = currentUser.permissions.includes("Can view reports")

  // Form logic
  function openForm(user = null) {
    setEditing(user ? user.id : null)
    setForm(
      user
        ? { ...user, password: "" }
        : { name: "", email: "", role: "staff", password: "", status: true, permissions: PERMISSIONS.staff }
    )
    setFormError("")
    setDrawerOpen(true)
  }

  function handleFormChange(field, value) {
    setForm(f => {
      const updated = { ...f, [field]: value }
      if (field === "role") updated.permissions = PERMISSIONS[value]
      return updated
    })
  }

  function saveUser() {
    setLoading(true)
    setTimeout(() => {
      // Validation
      if (!form.name || !form.email) {
        setFormError("Name and email are required.")
        setLoading(false)
        return
      }
      if (!/\S+@\S+\.\S+/.test(form.email)) {
        setFormError("Invalid email format.")
        setLoading(false)
        return
      }
      if (!editing && users.some(u => u.email === form.email)) {
        setFormError("Email must be unique.")
        setLoading(false)
        return
      }
      if (!editing && !form.password) {
        setFormError("Password is required for new users.")
        setLoading(false)
        return
      }
      setUsers(us =>
        editing
          ? us.map(u => (u.id === editing ? { ...u, ...form } : u))
          : [...us, { ...form, id: Date.now(), lastLogin: "-", permissions: form.permissions }]
      )
      setDrawerOpen(false)
      setLoading(false)
      toast.success(editing ? "User updated!" : "User created!")
    }, 800)
  }

  function deleteUser(id) {
    if (!window.confirm("Are you sure you want to delete this user?")) return
    setUsers(us => us.filter(u => u.id !== id))
    toast.success("User deleted!")
  }

  function toggleStatus(id) {
    setUsers(us =>
      us.map(u => (u.id === id ? { ...u, status: !u.status } : u))
    )
    toast.success("Status updated!")
  }

  function bulkDelete() {
    if (!window.confirm("Delete selected users?")) return
    setUsers(us => us.filter(u => !selected.includes(u.id)))
    setSelected([])
    toast.success("Users deleted!")
  }

  function bulkToggleStatus() {
    setUsers(us =>
      us.map(u =>
        selected.includes(u.id) ? { ...u, status: !u.status } : u
      )
    )
    setSelected([])
    toast.success("Status updated!")
  }

  function handleSelectAll(val) {
    setSelected(val ? filteredUsers.map(u => u.id) : [])
  }
  function handleSelect(id, val) {
    setSelected(sel =>
      val ? [...sel, id] : sel.filter(x => x !== id)
    )
  }

  // Responsive: show cards on mobile, table on desktop
  return (
    <SidebarInset className="p-4">
      {/* User Role Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>{totalUsers}</CardContent>
        </Card>
        {summary.map(s => (
          <Card key={s.role}>
            <CardHeader>
              <CardTitle className="capitalize">{s.role}</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge variant="outline">{s.count}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Bulk Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
        <Input
          placeholder="Search user..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ROLES.map(role => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selected.length > 0 && (
          <div className="flex gap-2">
            {canDelete && (
              <Button variant="destructive" onClick={bulkDelete}>
                Delete ({selected.length})
              </Button>
            )}
            {canEdit && (
              <Button variant="outline" onClick={bulkToggleStatus}>
                Toggle Status
              </Button>
            )}
          </div>
        )}
        {canEdit && (
          <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
            <DrawerTrigger asChild>
              <Button onClick={() => openForm(null)}>New User</Button>
            </DrawerTrigger>
            <DrawerContent className="w-[400px]">
              <DrawerHeader>
                <DrawerTitle>{editing ? "Edit" : "New"} User</DrawerTitle>
              </DrawerHeader>
              <div className="p-4 grid gap-4">
                <div className="grid gap-1">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={e => handleFormChange("name", e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={form.email}
                    onChange={e => handleFormChange("email", e.target.value)}
                  />
                </div>
                <div className="grid gap-1">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={form.role}
                    onValueChange={v => handleFormChange("role", v)}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {!editing && (
                  <div className="grid gap-1">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={form.password}
                      onChange={e => handleFormChange("password", e.target.value)}
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Label>Status</Label>
                  <Toggle
                    pressed={form.status}
                    onPressedChange={v => handleFormChange("status", v)}
                  >{form.status ? "Active" : "Inactive"}</Toggle>
                </div>
                <div className="grid gap-1">
                  <Label>Permissions</Label>
                  <div className="flex flex-col gap-1">
                    {PERMISSIONS[form.role].map(perm => (
                      <label key={perm} className="flex items-center gap-2">
                        <Checkbox
                          checked={form.permissions.includes(perm)}
                          onCheckedChange={checked =>
                            handleFormChange(
                              "permissions",
                              checked
                                ? [...form.permissions, perm]
                                : form.permissions.filter(p => p !== perm)
                            )
                          }
                        />
                        {perm}
                      </label>
                    ))}
                  </div>
                </div>
                {formError && <div className="text-red-600">{formError}</div>}
              </div>
              <DrawerFooter className="flex justify-end">
                <Button onClick={saveUser} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Button variant="outline" onClick={() => setDrawerOpen(false)}>
                  Cancel
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        )}
      </div>

      {/* Tabs for Users and Activity Log */}
      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="users">User List</TabsTrigger>
          {canViewActivity && <TabsTrigger value="activity">Activity Log</TabsTrigger>}
        </TabsList>
      </Tabs>

      {/* User List Table */}
      {tab === "users" && (
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Checkbox
                    checked={selected.length === filteredUsers.length && filteredUsers.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map(u => (
                <TableRow key={u.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.includes(u.id)}
                      onCheckedChange={v => handleSelect(u.id, v)}
                    />
                  </TableCell>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="capitalize">{u.role}</TableCell>
                  <TableCell>
                    <Toggle
                      pressed={u.status}
                      onPressedChange={() => canEdit && toggleStatus(u.id)}
                      disabled={!canEdit}
                    >
                      {u.status ? "Active" : "Inactive"}
                    </Toggle>
                  </TableCell>
                  <TableCell>{u.lastLogin}</TableCell>
                  <TableCell>
                    {canEdit && (
                      <Button size="sm" variant="outline" onClick={() => openForm(u)}>
                        Edit
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteUser(u.id)}
                        className="ml-2"
                      >
                        Delete
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Activity Log Table */}
      {tab === "activity" && canViewActivity && (
        <div className="overflow-auto">
          <div className="flex flex-col sm:flex-row gap-2 mb-2">
            <Input
              placeholder="Filter by action..."
              value={activityFilter}
              onChange={e => setActivityFilter(e.target.value)}
              className="flex-1"
            />
            {/* Pagination controls */}
            <div className="flex gap-2 items-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                disabled={activityPage === 1}
              >
                Prev
              </Button>
              <span>Page {activityPage}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setActivityPage(p => p + 1)}
                disabled={filteredActivity.length < 10}
              >
                Next
              </Button>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User Name</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredActivity.map(a => (
                <TableRow key={a.id}>
                  <TableCell>{a.user}</TableCell>
                  <TableCell>{a.action}</TableCell>
                  <TableCell>{a.datetime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </SidebarInset>
  )
}