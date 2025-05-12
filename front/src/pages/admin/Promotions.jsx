import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { DatePicker } from "@/component/admin/DatePicker";
import {
  Card, CardHeader, CardTitle, CardContent,
} from "@/components/ui/card";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { SidebarInset } from "@/components/ui/sidebar";
import { toast } from "sonner";

const PROMO_TYPES = [
  { value: "percent", label: "Percentage" },
  { value: "fixed", label: "Fixed Amount" },
  { value: "bogo", label: "BOGO" },
];

const PROMO_STATUSES = ["Active", "Upcoming", "Expired"];

const currentUser = {
  role: "admin",
  permissions: ["promotions:view", "promotions:edit", "promotions:delete"],
};

function canEdit() {
  return currentUser.permissions.includes("promotions:edit");
}
function canDelete() {
  return currentUser.permissions.includes("promotions:delete");
}

export default function Promotions() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState({ status: "All", type: "All", search: "", dateFrom: null, dateTo: null });
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [editPromo, setEditPromo] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState({});
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Fetch promotions
  useEffect(() => {
    setLoading(true);
    axios.get("/promotions", { params: filter })
      .then(res => setPromos(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError("Failed to fetch promotions"))
      .finally(() => setLoading(false));
  }, [filter, page]);

  // Fetch products/categories for multi-select
  useEffect(() => {
    axios.get("/products").then(res => setProducts(Array.isArray(res.data) ? res.data : []));
    axios.get("/categories").then(res => setCategories(Array.isArray(res.data) ? res.data : []));
  }, []);

  // Filtering and pagination
  const filtered = promos.filter(p => {
    if (filter.status !== "All" && p.status !== filter.status) return false;
    if (filter.type !== "All" && p.type !== filter.type) return false;
    if (filter.search && !p.name.toLowerCase().includes(filter.search.toLowerCase())) return false;
    if (filter.dateFrom && dayjs(p.start).isBefore(dayjs(filter.dateFrom))) return false;
    if (filter.dateTo && dayjs(p.end).isAfter(dayjs(filter.dateTo))) return false;
    return true;
  });
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);
  const pageCount = Math.ceil(filtered.length / pageSize);

  // Status toggle
  async function toggleStatus(promo) {
    try {
      await axios.patch(`/promotions/${promo.id}`, { active: !promo.active });
      setPromos(promos =>
        promos.map(p => p.id === promo.id ? { ...p, active: !promo.active, status: !promo.active ? "Active" : "Expired" } : p)
      );
      toast.success("Promotion status updated");
    } catch {
      toast.error("Failed to update status");
    }
  }

  // Delete
  async function deletePromo(promo) {
    try {
      await axios.delete(`/promotions/${promo.id}`);
      setPromos(promos => promos.filter(p => p.id !== promo.id));
      toast.success("Promotion deleted");
    } catch {
      toast.error("Failed to delete promotion");
    }
  }

  // Edit/Create
  function openEdit(promo = null) {
    setEditPromo(
      promo || {
        name: "",
        type: "percent",
        targets: [],
        targetType: "products",
        rule: "",
        start: "",
        end: "",
        usageLimit: "",
        active: true,
        description: "",
      }
    );
    setFormError({});
    setEditOpen(true);
  }
  function closeEdit() {
    setEditOpen(false);
    setEditPromo(null);
    setFormError({});
  }
  async function savePromo() {
    setSaving(true);
    setFormError({});
    // Basic validation
    const err = {};
    if (!editPromo.name) err.name = "Required";
    if (!editPromo.start) err.start = "Required";
    if (!editPromo.end) err.end = "Required";
    if (!Array.isArray(editPromo.targets) || editPromo.targets.length === 0) err.targets = "Select at least one";
    if (!editPromo.rule) err.rule = "Required";
    if (Object.keys(err).length) {
      setFormError(err);
      setSaving(false);
      return;
    }
    try {
      if (editPromo.id) {
        await axios.patch(`/promotions/${editPromo.id}`, editPromo);
        toast.success("Promotion updated");
      } else {
        await axios.post("/promotions", editPromo);
        toast.success("Promotion created");
      }
      closeEdit();
      setLoading(true);
      axios.get("/promotions", { params: filter }).then(res => setPromos(Array.isArray(res.data) ? res.data : []));
    } catch {
      toast.error("Failed to save promotion");
    } finally {
      setSaving(false);
    }
  }

  // Render
  return (
    <SidebarInset className="p-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Select value={filter.status} onValueChange={val => setFilter(f => ({ ...f, status: val }))}>
          <SelectTrigger className="w-32">Status</SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            {PROMO_STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filter.type} onValueChange={val => setFilter(f => ({ ...f, type: val }))}>
          <SelectTrigger className="w-40">Type</SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All</SelectItem>
            {PROMO_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input
          placeholder="Search by name"
          value={filter.search}
          onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
          className="w-48"
        />
        <DatePicker
          value={filter.dateFrom}
          onChange={date => setFilter(f => ({ ...f, dateFrom: date ? dayjs(date).format("YYYY-MM-DD") : null }))}
          placeholder="Start date"
        />
        <DatePicker
          value={filter.dateTo}
          onChange={date => setFilter(f => ({ ...f, dateTo: date ? dayjs(date).format("YYYY-MM-DD") : null }))}
          placeholder="End date"
        />
        {canEdit() && (
          <Button size="sm" className="ml-auto" onClick={() => openEdit()}>+ New Promotion</Button>
        )}
      </div>

      {/* Promotion Table */}
      <div className="overflow-auto">
        {loading ? (
          <div className="text-center py-8">Loading...</div>
        ) : error ? (
          <div className="text-red-600 py-8">{error}</div>
        ) : paged.length === 0 ? (
          <div className="text-center py-8">No promotions found.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Promotion Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Applies To</TableHead>
                <TableHead>Start / End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Redemption Limit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paged.map(promo => (
                <TableRow key={promo.id}>
                  <TableCell>{promo.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{PROMO_TYPES.find(t => t.value === promo.type)?.label || promo.type}</Badge>
                  </TableCell>
                  <TableCell>
                    {promo.targetType === "products"
                      ? (Array.isArray(promo.targets) && Array.isArray(products)
                        ? promo.targets.map(id => products.find(p => p.id === id)?.name).filter(Boolean).join(", ")
                        : "")
                      : (Array.isArray(promo.targets) && Array.isArray(categories)
                        ? promo.targets.map(id => categories.find(c => c.id === id)?.name).filter(Boolean).join(", ")
                        : "")
                    }
                  </TableCell>
                  <TableCell>
                    <span title={dayjs(promo.start).format("DD MMM YYYY HH:mm")}>
                      {dayjs(promo.start).format("DD MMM YY HH:mm")}
                    </span>
                    {" - "}
                    <span title={dayjs(promo.end).format("DD MMM YYYY HH:mm")}>
                      {dayjs(promo.end).format("DD MMM YY HH:mm")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={promo.status === "Active" ? "default" : "outline"}>
                      {promo.status}
                    </Badge>
                    {canEdit() && (
                      <Switch
                        checked={promo.active}
                        onCheckedChange={() => toggleStatus(promo)}
                        className="ml-2"
                        aria-label="Toggle Active"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {promo.usageLimit
                      ? `${promo.redemptions || 0} / ${promo.usageLimit}`
                      : "Unlimited"}
                  </TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => openEdit(promo)}>Edit</Button>
                    {canDelete() && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="ml-1"
                        onClick={() => deletePromo(promo)}
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
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage(p => Math.min(pageCount, p + 1))}
            disabled={page === pageCount || pageCount === 0}
          >
            Next
          </Button>
        </div>
      </div>

      {/* Create/Edit Promotion Modal */}
      <Dialog open={editOpen} onOpenChange={open => { if (!open) closeEdit(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editPromo?.id ? "Edit Promotion" : "New Promotion"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input
              placeholder="Promotion Name"
              value={editPromo?.name || ""}
              onChange={e => setEditPromo(p => ({ ...p, name: e.target.value }))}
              aria-invalid={!!formError.name}
            />
            <Select
              value={editPromo?.type}
              onValueChange={val => setEditPromo(p => ({ ...p, type: val }))}
            >
              <SelectTrigger>Type</SelectTrigger>
              <SelectContent>
                {PROMO_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select
              value={editPromo?.targetType}
              onValueChange={val => setEditPromo(p => ({ ...p, targetType: val, targets: [] }))}
            >
              <SelectTrigger>Target</SelectTrigger>
              <SelectContent>
                <SelectItem value="products">Products</SelectItem>
                <SelectItem value="categories">Categories</SelectItem>
              </SelectContent>
            </Select>
            <Select
              multiple
              value={editPromo?.targets}
              onValueChange={vals => setEditPromo(p => ({ ...p, targets: vals }))}
            >
              <SelectTrigger>
                {editPromo?.targetType === "products" ? "Products" : "Categories"}
              </SelectTrigger>
              <SelectContent>
                {(editPromo?.targetType === "products" ? products : categories).map(item =>
                  <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                )}
              </SelectContent>
            </Select>
            {/* Discount Rule */}
            {editPromo?.type === "percent" && (
              <Input
                placeholder="Discount (%)"
                type="number"
                value={editPromo?.rule || ""}
                onChange={e => setEditPromo(p => ({ ...p, rule: e.target.value }))}
                aria-invalid={!!formError.rule}
              />
            )}
            {editPromo?.type === "fixed" && (
              <Input
                placeholder="Discount Amount"
                type="number"
                value={editPromo?.rule || ""}
                onChange={e => setEditPromo(p => ({ ...p, rule: e.target.value }))}
                aria-invalid={!!formError.rule}
              />
            )}
            {editPromo?.type === "bogo" && (
              <Input
                placeholder="BOGO Rule (e.g. Buy 2 Get 1)"
                value={editPromo?.rule || ""}
                onChange={e => setEditPromo(p => ({ ...p, rule: e.target.value }))}
                aria-invalid={!!formError.rule}
              />
            )}
            <div className="flex gap-2">
              <DatePicker
                value={editPromo?.start}
                onChange={date => setEditPromo(p => ({ ...p, start: date ? dayjs(date).toISOString() : "" }))}
                placeholder="Start date"
              />
              <DatePicker
                value={editPromo?.end}
                onChange={date => setEditPromo(p => ({ ...p, end: date ? dayjs(date).toISOString() : "" }))}
                placeholder="End date"
              />
            </div>
            <Input
              placeholder="Redemption Limit (optional)"
              type="number"
              value={editPromo?.usageLimit || ""}
              onChange={e => setEditPromo(p => ({ ...p, usageLimit: e.target.value }))}
              aria-invalid={!!formError.usageLimit}
            />
            <Switch
              checked={!!editPromo?.active}
              onCheckedChange={val => setEditPromo(p => ({ ...p, active: val }))}
            >
              Active
            </Switch>
            <Input
              placeholder="Description (optional)"
              value={editPromo?.description || ""}
              onChange={e => setEditPromo(p => ({ ...p, description: e.target.value }))}
            />
            {/* Preview Card */}
            <Card className="mt-2">
              <CardHeader>
                <CardTitle>{editPromo?.name || "Promotion Preview"}</CardTitle>
              </CardHeader>
              <CardContent>
                <div>{PROMO_TYPES.find(t => t.value === editPromo?.type)?.label}</div>
                <div>
                  Applies to: {(editPromo?.targetType === "products"
                    ? (Array.isArray(editPromo?.targets) && Array.isArray(products)
                      ? editPromo?.targets.map(id => products.find(p => p.id === id)?.name).filter(Boolean).join(", ")
                      : "")
                    : (Array.isArray(editPromo?.targets) && Array.isArray(categories)
                      ? editPromo?.targets.map(id => categories.find(c => c.id === id)?.name).filter(Boolean).join(", ")
                      : "")
                  ) || "-"}
                </div>
                <div>
                  {editPromo?.type === "percent" && `Discount: ${editPromo?.rule || "-"}%`}
                  {editPromo?.type === "fixed" && `Discount: ฿${editPromo?.rule || "-"}`}
                  {editPromo?.type === "bogo" && `Rule: ${editPromo?.rule || "-"}`}
                </div>
                <div>
                  {editPromo?.start && `Start: ${dayjs(editPromo?.start).format("DD MMM YY HH:mm")}`}
                  {editPromo?.end && `End: ${dayjs(editPromo?.end).format("DD MMM YY HH:mm")}`}
                </div>
                <div>
                  Redemption Limit: {editPromo?.usageLimit || "Unlimited"}
                </div>
                <div>
                  Status: {editPromo?.active ? "Active" : "Inactive"}
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button onClick={savePromo} disabled={saving}>
              {editPromo?.id ? "Save Changes" : "Create Promotion"}
            </Button>
            <Button variant="outline" onClick={closeEdit} disabled={saving}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarInset>
  );
}