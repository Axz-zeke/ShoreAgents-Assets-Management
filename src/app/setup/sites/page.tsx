"use client"
import Link from "next/link"
import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { MapPin, Plus, Edit, Trash2, RefreshCw, Building2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Site {
  id: string
  name: string
  description?: string
  address?: string
  apt_suite?: string
  city?: string
  state?: string
  zip?: string
  country?: string
  is_active: boolean
  created_at?: string
}

const COUNTRIES = ["Philippines", "United States", "Australia", "United Kingdom", "Canada", "Singapore", "Japan", "Other"]

const emptyForm = { name: "", description: "", address: "", apt_suite: "", city: "", state: "", zip: "", country: "" }

export default function SitesPage() {
  const [sites, setSites] = React.useState<Site[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [editingSite, setEditingSite] = React.useState<Site | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState(emptyForm)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const fetchSites = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/setup/sites")
      const json = await res.json()
      if (json.success) setSites(json.data || [])
      else toast.error("Failed to load sites")
    } catch { toast.error("Could not connect to server") }
    finally { setIsLoading(false) }
  }, [])

  React.useEffect(() => { fetchSites() }, [fetchSites])

  const filtered = React.useMemo(() =>
    sites.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()) || (s.city || "").toLowerCase().includes(search.toLowerCase())),
    [sites, search])

  const openAdd = () => { setEditingSite(null); setFormData(emptyForm); setModalOpen(true) }
  const openEdit = (s: Site) => {
    setEditingSite(s)
    setFormData({ name: s.name, description: s.description || "", address: s.address || "", apt_suite: s.apt_suite || "", city: s.city || "", state: s.state || "", zip: s.zip || "", country: s.country || "" })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) { toast.error("Site name is required"); return }
    setIsSubmitting(true)
    try {
      const url = editingSite ? `/api/setup/sites/${editingSite.id}` : "/api/setup/sites"
      const method = editingSite ? "PATCH" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) })
      const json = await res.json()
      if (json.success) {
        toast.success(editingSite ? "Site updated!" : "Site added!")
        setModalOpen(false)
        fetchSites()
      } else toast.error(json.error || "Failed to save site")
    } catch { toast.error("Error saving site") }
    finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/setup/sites/${deletingId}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) { toast.success("Site deleted"); setDeleteDialogOpen(false); fetchSites() }
      else toast.error(json.error || "Failed to delete")
    } catch { toast.error("Error deleting site") }
    finally { setIsDeleting(false) }
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
              <BreadcrumbItem><BreadcrumbLink asChild><Link href="/setup">Setup</Link></BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem><BreadcrumbPage>Sites</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase flex items-center gap-3">
                <MapPin className="h-8 w-8 text-primary" /> Sites
              </h1>
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest opacity-70 mt-1">Define physical company sites and branches</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchSites} className="h-9 font-bold uppercase tracking-wider">
                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
              </Button>
              <Button onClick={openAdd} className="h-9 font-bold uppercase tracking-wider gap-2">
                <Plus className="h-4 w-4" /> Add Site
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: "Total Sites", value: sites.length, color: "text-primary", bg: "bg-primary/10", icon: MapPin },
              { label: "Active", value: sites.filter(s => s.is_active).length, color: "text-emerald-600", bg: "bg-emerald-500/10", icon: Building2 },
              { label: "Inactive", value: sites.filter(s => !s.is_active).length, color: "text-rose-600", bg: "bg-rose-500/10", icon: MapPin },
            ].map(stat => (
              <Card key={stat.label} className="border-border/50 bg-card/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/70">{stat.label}</p>
                    <div className={cn("p-1.5 rounded-lg", stat.bg, stat.color)}><stat.icon className="h-3.5 w-3.5" /></div>
                  </div>
                  <p className={cn("text-2xl font-black", stat.color)}>{isLoading ? "—" : stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Search + Table */}
          <Card className="border-border/50 bg-card/50 overflow-hidden">
            <CardHeader className="border-b border-border/40 bg-muted/5 pb-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle className="text-base font-bold">Sites ({filtered.length})</CardTitle>
                <Input placeholder="Search by name or city..." value={search} onChange={e => setSearch(e.target.value)} className="w-64 h-8 text-sm" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-40 gap-3 text-muted-foreground">
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-bold uppercase tracking-widest">Loading...</span>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <MapPin className="h-10 w-10 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/50">{search ? "No sites match your search" : "No sites yet"}</p>
                  {!search && <Button size="sm" onClick={openAdd} className="font-bold uppercase tracking-wider gap-2"><Plus className="h-4 w-4" /> Add First Site</Button>}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40 bg-muted/10">
                        {["Site Name", "City", "State", "Country", "Status", "Actions"].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {filtered.map(s => (
                        <tr key={s.id} className="hover:bg-muted/20 transition-colors group">
                          <td className="px-4 py-3">
                            <div className="font-bold text-sm">{s.name}</div>
                            {s.description && <div className="text-[10px] text-muted-foreground truncate max-w-[200px]">{s.description}</div>}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{s.city || "—"}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{s.state || "—"}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{s.country || "—"}</td>
                          <td className="px-4 py-3">
                            <Badge className={cn("text-[10px] font-black border px-2 py-0.5", s.is_active ? "bg-emerald-500/10 border-emerald-200 text-emerald-600" : "bg-slate-500/10 border-slate-200 text-slate-500")}>
                              {s.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(s)}><Edit className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-destructive hover:bg-destructive/10" onClick={() => { setDeletingId(s.id); setDeleteDialogOpen(true) }}><Trash2 className="h-3.5 w-3.5" /></Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Add/Edit Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" /> {editingSite ? "Edit Site" : "Add Site"}
              </DialogTitle>
              <DialogDescription className="text-[11px] font-bold uppercase tracking-widest">
                {editingSite ? "Update site details" : "Add a new physical site or branch"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Site Name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. Main Office" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Description</Label>
                <Textarea placeholder="Describe this site..." value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="resize-none min-h-[60px]" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Address</Label>
                <Input placeholder="Street address" value={formData.address} onChange={e => setFormData(p => ({ ...p, address: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest">City</Label>
                <Input placeholder="City" value={formData.city} onChange={e => setFormData(p => ({ ...p, city: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest">State / Province</Label>
                <Input placeholder="State" value={formData.state} onChange={e => setFormData(p => ({ ...p, state: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest">Postal Code</Label>
                <Input placeholder="ZIP" value={formData.zip} onChange={e => setFormData(p => ({ ...p, zip: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest">Country</Label>
                <Select value={formData.country} onValueChange={v => setFormData(p => ({ ...p, country: v }))}>
                  <SelectTrigger className="font-bold"><SelectValue placeholder="Select country" /></SelectTrigger>
                  <SelectContent>{COUNTRIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="font-bold uppercase tracking-wider">Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="font-bold uppercase tracking-wider gap-2">
                {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                {editingSite ? "Update Site" : "Save Site"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black uppercase">Delete Site?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. The site will be permanently deleted.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-bold uppercase tracking-wider">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 font-bold uppercase tracking-wider gap-2">
                {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
