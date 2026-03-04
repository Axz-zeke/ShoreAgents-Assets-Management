"use client"
import Link from "next/link"
import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { FolderOpen, Plus, Edit, Trash2, RefreshCw, MapPin } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Location {
  id: string; name: string; description?: string; site?: string; floor?: string; room?: string; is_active: boolean
}

const emptyForm = { name: "", description: "", site: "", floor: "", room: "" }

export default function LocationsPage() {
  const [locations, setLocations] = React.useState<Location[]>([])
  const [sites, setSites] = React.useState<{ name: string }[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [editingLocation, setEditingLocation] = React.useState<Location | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState(emptyForm)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const fetchAll = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const [locRes, siteRes] = await Promise.all([fetch("/api/setup/locations"), fetch("/api/setup/sites")])
      const [locJson, siteJson] = await Promise.all([locRes.json(), siteRes.json()])
      if (locJson.success) setLocations(locJson.data || [])
      if (siteJson.success) setSites(siteJson.data || [])
    } catch { toast.error("Could not connect to server") }
    finally { setIsLoading(false) }
  }, [])

  React.useEffect(() => { fetchAll() }, [fetchAll])

  const filtered = React.useMemo(() =>
    locations.filter(l => !search || l.name.toLowerCase().includes(search.toLowerCase()) || (l.site || "").toLowerCase().includes(search.toLowerCase())),
    [locations, search])

  const openAdd = () => { setEditingLocation(null); setFormData(emptyForm); setModalOpen(true) }
  const openEdit = (l: Location) => {
    setEditingLocation(l)
    setFormData({ name: l.name, description: l.description || "", site: l.site || "", floor: l.floor || "", room: l.room || "" })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.site) { toast.error("Location name and site are required"); return }
    setIsSubmitting(true)
    try {
      const url = editingLocation ? `/api/setup/locations/${editingLocation.id}` : "/api/setup/locations"
      const method = editingLocation ? "PATCH" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) })
      const json = await res.json()
      if (json.success) { toast.success(editingLocation ? "Location updated!" : "Location added!"); setModalOpen(false); fetchAll() }
      else toast.error(json.error || "Failed to save location")
    } catch { toast.error("Error saving location") }
    finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/setup/locations/${deletingId}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) { toast.success("Location deleted"); setDeleteDialogOpen(false); fetchAll() }
      else toast.error(json.error || "Failed to delete")
    } catch { toast.error("Error deleting location") }
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
              <BreadcrumbItem><BreadcrumbPage>Locations</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase flex items-center gap-3">
                <FolderOpen className="h-8 w-8 text-primary" /> Locations
              </h1>
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest opacity-70 mt-1">Define areas within sites (floors, rooms, storage)</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchAll} className="h-9 font-bold uppercase tracking-wider"><RefreshCw className="h-4 w-4 mr-2" /> Refresh</Button>
              <Button onClick={openAdd} className="h-9 font-bold uppercase tracking-wider gap-2"><Plus className="h-4 w-4" /> Add Location</Button>
            </div>
          </div>

          <Card className="border-border/50 bg-card/50 overflow-hidden">
            <CardHeader className="border-b border-border/40 bg-muted/5 pb-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle className="text-base font-bold">Locations ({filtered.length})</CardTitle>
                <Input placeholder="Search by name or site..." value={search} onChange={e => setSearch(e.target.value)} className="w-64 h-8 text-sm" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-40 gap-3 text-muted-foreground"><RefreshCw className="h-5 w-5 animate-spin" /><span className="text-sm font-bold uppercase tracking-widest">Loading...</span></div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <FolderOpen className="h-10 w-10 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/50">{search ? "No locations match your search" : "No locations yet"}</p>
                  {!search && <Button size="sm" onClick={openAdd} className="font-bold uppercase tracking-wider gap-2"><Plus className="h-4 w-4" /> Add First Location</Button>}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40 bg-muted/10">
                        {["Location Name", "Site", "Floor", "Room", "Status", "Actions"].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {filtered.map(l => (
                        <tr key={l.id} className="hover:bg-muted/20 transition-colors group">
                          <td className="px-4 py-3">
                            <div className="font-bold text-sm">{l.name}</div>
                            {l.description && <div className="text-[10px] text-muted-foreground truncate max-w-[180px]">{l.description}</div>}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-muted-foreground">{l.site || "—"}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{l.floor || "—"}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{l.room || "—"}</td>
                          <td className="px-4 py-3">
                            <Badge className={cn("text-[10px] font-black border px-2 py-0.5", l.is_active ? "bg-emerald-500/10 border-emerald-200 text-emerald-600" : "bg-slate-500/10 border-slate-200 text-slate-500")}>
                              {l.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(l)}><Edit className="h-3.5 w-3.5" /></Button>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-destructive hover:bg-destructive/10" onClick={() => { setDeletingId(l.id); setDeleteDialogOpen(true) }}><Trash2 className="h-3.5 w-3.5" /></Button>
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

        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2"><FolderOpen className="h-5 w-5 text-primary" /> {editingLocation ? "Edit Location" : "Add Location"}</DialogTitle>
              <DialogDescription className="text-[11px] font-bold uppercase tracking-widest">{editingLocation ? "Update location details" : "Add a new location within a site"}</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Location Name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. IT Server Room" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Site <span className="text-destructive">*</span></Label>
                <Select value={formData.site} onValueChange={v => setFormData(p => ({ ...p, site: v }))}>
                  <SelectTrigger className="font-bold"><SelectValue placeholder="Select a site" /></SelectTrigger>
                  <SelectContent>
                    {sites.length === 0
                      ? <SelectItem value="__none__" disabled>No sites configured yet</SelectItem>
                      : sites.map(s => <SelectItem key={s.name} value={s.name}>{s.name}</SelectItem>)
                    }
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest">Floor</Label>
                <Input placeholder="e.g. 1st Floor, Basement" value={formData.floor} onChange={e => setFormData(p => ({ ...p, floor: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest">Room</Label>
                <Input placeholder="e.g. Room 101" value={formData.room} onChange={e => setFormData(p => ({ ...p, room: e.target.value }))} />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest">Description</Label>
                <Textarea placeholder="Describe this location..." value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} className="resize-none min-h-[60px]" />
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="font-bold uppercase tracking-wider">Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="font-bold uppercase tracking-wider gap-2">
                {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                {editingLocation ? "Update Location" : "Save Location"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black uppercase">Delete Location?</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone. The location will be permanently deleted.</AlertDialogDescription>
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
