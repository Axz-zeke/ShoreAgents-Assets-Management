"use client"

import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import {
  ShieldCheck, Plus, Search, RefreshCw, AlertTriangle,
  CheckCircle2, XCircle, Edit, Trash2, Eye, Calendar,
  Building2, Phone, FileText, Tag, DollarSign,
} from "lucide-react"
import { toast } from "sonner"
import { format, differenceInDays, parseISO } from "date-fns"
import { cn } from "@/lib/utils"

interface Warranty {
  id: string
  asset_id: string
  warranty_type: string
  provider: string
  contact_info?: string
  reference_number?: string
  coverage_details?: string
  start_date: string
  end_date: string
  warranty_cost?: number
  status: string
  notes?: string
  created_at: string
  asset?: { name: string; category: string; brand: string; model: string }
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  active: { label: "Active", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10 border-emerald-200 dark:border-emerald-800", icon: CheckCircle2 },
  expiring_soon: { label: "Expiring Soon", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10 border-amber-200 dark:border-amber-800", icon: AlertTriangle },
  expired: { label: "Expired", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10 border-rose-200 dark:border-rose-800", icon: XCircle },
}

const WARRANTY_TYPES = ["Manufacturer", "Extended", "Service Contract", "Limited", "Accidental Damage", "On-Site", "Other"]

const emptyForm = {
  asset_id: "", warranty_type: "", provider: "", contact_info: "",
  reference_number: "", coverage_details: "", start_date: "", end_date: "",
  warranty_cost: "", status: "active", notes: ""
}

export default function WarrantiesListPage() {
  const [warranties, setWarranties] = React.useState<Warranty[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [search, setSearch] = React.useState("")
  const [filterStatus, setFilterStatus] = React.useState("all")
  const [modalOpen, setModalOpen] = React.useState(false)
  const [viewModalOpen, setViewModalOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [editingWarranty, setEditingWarranty] = React.useState<Warranty | null>(null)
  const [viewingWarranty, setViewingWarranty] = React.useState<Warranty | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState(emptyForm)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)

  const fetchWarranties = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/warranties")
      const json = await res.json()
      if (json.success) setWarranties(json.data || [])
      else toast.error("Failed to load warranties")
    } catch {
      toast.error("Could not connect to server")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => { fetchWarranties() }, [fetchWarranties])

  const enrichedWarranties = React.useMemo(() => {
    const now = new Date()
    return warranties.map(w => {
      const end = parseISO(w.end_date)
      const days = differenceInDays(end, now)
      let status = "active"
      if (days < 0) status = "expired"
      else if (days <= 30) status = "expiring_soon"
      return { ...w, status, daysLeft: days }
    })
  }, [warranties])

  const filtered = React.useMemo(() => {
    return enrichedWarranties.filter(w => {
      const q = search.toLowerCase()
      const matchSearch = !q || w.asset_id.toLowerCase().includes(q)
        || w.provider.toLowerCase().includes(q)
        || (w.asset?.name || "").toLowerCase().includes(q)
        || (w.reference_number || "").toLowerCase().includes(q)
      const matchStatus = filterStatus === "all" || w.status === filterStatus
      return matchSearch && matchStatus
    })
  }, [enrichedWarranties, search, filterStatus])

  const stats = React.useMemo(() => ({
    total: enrichedWarranties.length,
    active: enrichedWarranties.filter(w => w.status === "active").length,
    expiring: enrichedWarranties.filter(w => w.status === "expiring_soon").length,
    expired: enrichedWarranties.filter(w => w.status === "expired").length,
  }), [enrichedWarranties])

  const openAdd = () => {
    setEditingWarranty(null)
    setFormData(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (w: Warranty) => {
    setEditingWarranty(w)
    setFormData({
      asset_id: w.asset_id,
      warranty_type: w.warranty_type,
      provider: w.provider,
      contact_info: w.contact_info || "",
      reference_number: w.reference_number || "",
      coverage_details: w.coverage_details || "",
      start_date: w.start_date?.split("T")[0] || "",
      end_date: w.end_date?.split("T")[0] || "",
      warranty_cost: w.warranty_cost?.toString() || "",
      status: w.status,
      notes: w.notes || "",
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.asset_id || !formData.provider || !formData.start_date || !formData.end_date || !formData.warranty_type) {
      toast.error("Please fill in all required fields (Asset ID, Type, Provider, Start & End Date)")
      return
    }
    setIsSubmitting(true)
    try {
      const url = editingWarranty ? `/api/warranties/${editingWarranty.id}` : "/api/warranties"
      const method = editingWarranty ? "PATCH" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      const json = await res.json()
      if (json.success) {
        toast.success(editingWarranty ? "Warranty updated successfully!" : "Warranty added successfully!")
        setModalOpen(false)
        fetchWarranties()
      } else {
        toast.error(json.error || "Failed to save warranty")
      }
    } catch {
      toast.error("Error saving warranty")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/warranties/${deletingId}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) {
        toast.success("Warranty deleted successfully")
        setDeleteDialogOpen(false)
        fetchWarranties()
      } else toast.error(json.error || "Failed to delete")
    } catch {
      toast.error("Error deleting warranty")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem><BreadcrumbLink href="/assets">Assets</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Warranties</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
          {/* Page Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase flex items-center gap-3">
                <ShieldCheck className="h-8 w-8 text-primary" />
                Asset Warranties
              </h1>
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest opacity-70 mt-1">
                Manage and monitor all asset warranty records
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchWarranties} className="h-9 font-bold uppercase tracking-wider">
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
              <Button onClick={openAdd} className="h-9 font-bold uppercase tracking-wider gap-2">
                <Plus className="h-4 w-4" /> Add Warranty
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total", value: stats.total, color: "text-primary", bg: "bg-primary/10", icon: ShieldCheck },
              { label: "Active", value: stats.active, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/10", icon: CheckCircle2 },
              { label: "Expiring Soon", value: stats.expiring, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/10", icon: AlertTriangle },
              { label: "Expired", value: stats.expired, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10", icon: XCircle },
            ].map(stat => (
              <Card key={stat.label} className="border-border/50 bg-card/50 hover:shadow-md transition-all">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{stat.label}</p>
                    <div className={cn("p-1.5 rounded-lg", stat.bg, stat.color)}>
                      <stat.icon className="h-3.5 w-3.5" />
                    </div>
                  </div>
                  <p className={cn("text-2xl font-black", stat.color)}>{isLoading ? "—" : stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <Card className="border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by asset ID, name, or provider..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="pl-9 font-medium"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full sm:w-48 font-bold">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="border-border/50 bg-card/50 overflow-hidden">
            <CardHeader className="border-b border-border/40 bg-muted/5 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">Warranty Records</CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">{filtered.length} records</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-48">
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    <span className="text-sm font-bold uppercase tracking-widest">Loading warranties...</span>
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <ShieldCheck className="h-10 w-10 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/50">
                    {search || filterStatus !== "all" ? "No warranties match your filters" : "No warranties recorded yet"}
                  </p>
                  {!search && filterStatus === "all" && (
                    <Button size="sm" onClick={openAdd} className="font-bold uppercase tracking-wider gap-2">
                      <Plus className="h-4 w-4" /> Add First Warranty
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40 bg-muted/10">
                        {["Asset", "Type", "Provider", "Reference #", "Start Date", "End Date", "Days Left", "Status", "Actions"].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {filtered.map(w => {
                        const cfg = STATUS_CONFIG[w.status] ?? STATUS_CONFIG.active
                        const daysLeft = (w as any).daysLeft as number
                        return (
                          <tr key={w.id} className="hover:bg-muted/20 transition-colors group">
                            <td className="px-4 py-3">
                              <div className="font-bold text-sm">{w.asset?.name || w.asset_id}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">{w.asset_id}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">{w.warranty_type}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-sm">{w.provider}</div>
                              {w.contact_info && <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">{w.contact_info}</div>}
                            </td>
                            <td className="px-4 py-3 text-[10px] font-mono text-muted-foreground">
                              {w.reference_number || "—"}
                            </td>
                            <td className="px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                              {w.start_date ? format(parseISO(w.start_date), "MMM d, yyyy") : "—"}
                            </td>
                            <td className="px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">
                              {w.end_date ? format(parseISO(w.end_date), "MMM d, yyyy") : "—"}
                            </td>
                            <td className="px-4 py-3">
                              <span className={cn("text-xs font-black whitespace-nowrap", cfg.color)}>
                                {daysLeft < 0 ? `${Math.abs(daysLeft)}d ago` : daysLeft === 0 ? "Today" : `${daysLeft}d left`}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <Badge className={cn("text-[10px] font-black border px-2 py-0.5 whitespace-nowrap", cfg.bg, cfg.color)}>
                                <cfg.icon className="h-3 w-3 mr-1" />
                                {cfg.label}
                              </Badge>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="View details"
                                  onClick={() => { setViewingWarranty(w); setViewModalOpen(true) }}>
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" title="Edit" onClick={() => openEdit(w)}>
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-destructive hover:bg-destructive/10" title="Delete"
                                  onClick={() => { setDeletingId(w.id); setDeleteDialogOpen(true) }}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Add / Edit Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                {editingWarranty ? "Edit Warranty" : "Add Warranty"}
              </DialogTitle>
              <DialogDescription className="text-[11px] font-bold uppercase tracking-widest">
                {editingWarranty ? "Update warranty record details" : "Add a new warranty record for an asset"}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest">Asset Tag ID <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. AST-001" value={formData.asset_id}
                  onChange={e => setFormData(p => ({ ...p, asset_id: e.target.value }))} className="font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest">Warranty Type <span className="text-destructive">*</span></Label>
                <Select value={formData.warranty_type} onValueChange={v => setFormData(p => ({ ...p, warranty_type: v }))}>
                  <SelectTrigger className="font-bold"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {WARRANTY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest">Provider / Vendor <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. Apple Inc." value={formData.provider}
                  onChange={e => setFormData(p => ({ ...p, provider: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest">Contact Info</Label>
                <Input placeholder="Email or phone" value={formData.contact_info}
                  onChange={e => setFormData(p => ({ ...p, contact_info: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest">Reference Number</Label>
                <Input placeholder="Warranty reference #" value={formData.reference_number}
                  onChange={e => setFormData(p => ({ ...p, reference_number: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest">Warranty Cost (₱)</Label>
                <Input type="number" min="0" step="0.01" placeholder="0.00" value={formData.warranty_cost}
                  onChange={e => setFormData(p => ({ ...p, warranty_cost: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest">Start Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={formData.start_date}
                  onChange={e => setFormData(p => ({ ...p, start_date: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest">End Date <span className="text-destructive">*</span></Label>
                <Input type="date" value={formData.end_date}
                  onChange={e => setFormData(p => ({ ...p, end_date: e.target.value }))} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Coverage Details</Label>
                <Textarea placeholder="Describe what is covered under this warranty..." value={formData.coverage_details}
                  onChange={e => setFormData(p => ({ ...p, coverage_details: e.target.value }))}
                  className="resize-none min-h-[80px]" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Notes</Label>
                <Textarea placeholder="Additional notes..." value={formData.notes}
                  onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))}
                  className="resize-none min-h-[60px]" />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="font-bold uppercase tracking-wider">Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="font-bold uppercase tracking-wider gap-2">
                {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                {editingWarranty ? "Update Warranty" : "Save Warranty"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        {viewingWarranty && (
          <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Warranty Details
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {(() => {
                  const cfg = STATUS_CONFIG[viewingWarranty.status] ?? STATUS_CONFIG.active
                  const end = parseISO(viewingWarranty.end_date)
                  const days = differenceInDays(end, new Date())
                  return (
                    <>
                      <div className={cn("flex items-center gap-3 px-4 py-3 rounded-xl border", cfg.bg)}>
                        <cfg.icon className={cn("h-5 w-5 flex-shrink-0", cfg.color)} />
                        <div>
                          <p className={cn("font-black text-sm", cfg.color)}>{cfg.label}</p>
                          <p className="text-[10px] text-muted-foreground font-bold">
                            {days < 0 ? `Expired ${Math.abs(days)} days ago` : days === 0 ? "Expires today" : `${days} days remaining`}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {[
                          { icon: Tag, label: "Asset ID", value: viewingWarranty.asset_id },
                          { icon: ShieldCheck, label: "Type", value: viewingWarranty.warranty_type },
                          { icon: Building2, label: "Provider", value: viewingWarranty.provider },
                          { icon: Phone, label: "Contact", value: viewingWarranty.contact_info || "—" },
                          { icon: FileText, label: "Reference #", value: viewingWarranty.reference_number || "—" },
                          { icon: DollarSign, label: "Cost", value: viewingWarranty.warranty_cost ? `₱${Number(viewingWarranty.warranty_cost).toLocaleString()}` : "—" },
                          { icon: Calendar, label: "Start Date", value: viewingWarranty.start_date ? format(parseISO(viewingWarranty.start_date), "MMM d, yyyy") : "—" },
                          { icon: Calendar, label: "End Date", value: viewingWarranty.end_date ? format(parseISO(viewingWarranty.end_date), "MMM d, yyyy") : "—" },
                        ].map(item => (
                          <div key={item.label} className="flex items-start gap-2 p-2 rounded-lg bg-muted/20">
                            <item.icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">{item.label}</p>
                              <p className="font-bold text-xs break-all">{item.value}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      {viewingWarranty.coverage_details && (
                        <div className="p-3 rounded-xl bg-muted/20 border border-border/40">
                          <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-muted-foreground/60">Coverage</p>
                          <p className="text-sm">{viewingWarranty.coverage_details}</p>
                        </div>
                      )}
                      {viewingWarranty.notes && (
                        <div className="p-3 rounded-xl bg-muted/20 border border-border/40">
                          <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-muted-foreground/60">Notes</p>
                          <p className="text-sm">{viewingWarranty.notes}</p>
                        </div>
                      )}
                    </>
                  )
                })()}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setViewModalOpen(false)} className="font-bold uppercase tracking-wider">Close</Button>
                <Button onClick={() => { setViewModalOpen(false); openEdit(viewingWarranty) }} className="font-bold uppercase tracking-wider gap-2">
                  <Edit className="h-4 w-4" /> Edit
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Delete Confirmation */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black uppercase">Delete Warranty?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The warranty record will be permanently deleted from the database.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-bold uppercase tracking-wider">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive hover:bg-destructive/90 font-bold uppercase tracking-wider gap-2"
              >
                {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
