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
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Users, Plus, Edit, Trash2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Department { id: string; name: string; description?: string; manager?: string; budget_code?: string; is_active: boolean }

const empty = { name: "", description: "", manager: "", budget_code: "" }

export default function DepartmentsPage() {
  const [departments, setDepartments] = React.useState<Department[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [modalOpen, setModalOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [editingDept, setEditingDept] = React.useState<Department | null>(null)
  const [deletingId, setDeletingId] = React.useState<string | null>(null)
  const [formData, setFormData] = React.useState(empty)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const fetchDepts = React.useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/setup/departments")
      const json = await res.json()
      if (json.success) setDepartments(json.data || [])
      else toast.error("Failed to load departments")
    } catch { toast.error("Could not connect to server") }
    finally { setIsLoading(false) }
  }, [])

  React.useEffect(() => { fetchDepts() }, [fetchDepts])

  const filtered = departments.filter(d => !search || d.name.toLowerCase().includes(search.toLowerCase()) || (d.manager || "").toLowerCase().includes(search.toLowerCase()))

  const openAdd = () => { setEditingDept(null); setFormData(empty); setModalOpen(true) }
  const openEdit = (d: Department) => { setEditingDept(d); setFormData({ name: d.name, description: d.description || "", manager: d.manager || "", budget_code: d.budget_code || "" }); setModalOpen(true) }

  const handleSubmit = async () => {
    if (!formData.name.trim()) { toast.error("Department name is required"); return }
    setIsSubmitting(true)
    try {
      const url = editingDept ? `/api/setup/departments/${editingDept.id}` : "/api/setup/departments"
      const method = editingDept ? "PATCH" : "POST"
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) })
      const json = await res.json()
      if (json.success) { toast.success(editingDept ? "Department updated!" : "Department added!"); setModalOpen(false); fetchDepts() }
      else toast.error(json.error || "Failed to save")
    } catch { toast.error("Error saving department") }
    finally { setIsSubmitting(false) }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    setIsDeleting(true)
    try {
      const res = await fetch(`/api/setup/departments/${deletingId}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) { toast.success("Department deleted"); setDeleteDialogOpen(false); fetchDepts() }
      else toast.error(json.error || "Failed to delete")
    } catch { toast.error("Error deleting") }
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
              <BreadcrumbItem><BreadcrumbPage>Departments</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" /> Departments
              </h1>
              <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest opacity-70 mt-1">Organize assets by company department</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={fetchDepts} className="h-9 font-bold uppercase tracking-wider"><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
              <Button onClick={openAdd} className="h-9 font-bold uppercase tracking-wider gap-2"><Plus className="h-4 w-4" />Add Department</Button>
            </div>
          </div>
          <Card className="border-border/50 bg-card/50 overflow-hidden">
            <CardHeader className="border-b border-border/40 bg-muted/5 pb-3">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <CardTitle className="text-base font-bold">Departments ({filtered.length})</CardTitle>
                <Input placeholder="Search departments..." value={search} onChange={e => setSearch(e.target.value)} className="w-64 h-8 text-sm" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-40 gap-3 text-muted-foreground"><RefreshCw className="h-5 w-5 animate-spin" /><span className="text-sm font-bold uppercase tracking-widest">Loading...</span></div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <Users className="h-10 w-10 opacity-20" />
                  <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/50">{search ? "No departments match" : "No departments yet"}</p>
                  {!search && <Button size="sm" onClick={openAdd} className="gap-2"><Plus className="h-4 w-4" />Add First Department</Button>}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b border-border/40 bg-muted/10">{["Department Name", "Description", "Manager", "Status", "Actions"].map(h => <th key={h} className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-border/20">
                      {filtered.map(d => (
                        <tr key={d.id} className="hover:bg-muted/20 transition-colors group">
                          <td className="px-4 py-3 font-bold text-sm">{d.name}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px] truncate">{d.description || "—"}</td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{d.manager || "—"}</td>
                          <td className="px-4 py-3"><Badge className={cn("text-[10px] font-black border px-2 py-0.5", d.is_active ? "bg-emerald-500/10 border-emerald-200 text-emerald-600" : "bg-slate-500/10 border-slate-200 text-slate-500")}>{d.is_active ? "Active" : "Inactive"}</Badge></td>
                          <td className="px-4 py-3"><div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(d)}><Edit className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 hover:text-destructive hover:bg-destructive/10" onClick={() => { setDeletingId(d.id); setDeleteDialogOpen(true) }}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div></td>
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tight flex items-center gap-2"><Users className="h-5 w-5 text-primary" />{editingDept ? "Edit Department" : "Add Department"}</DialogTitle>
              <DialogDescription className="text-[11px] font-bold uppercase tracking-widest">{editingDept ? "Update department details" : "Add a new department"}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest">Department Name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. SHORE AGENTS" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest">Description</Label>
                <Input placeholder="Brief description" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest">Manager</Label>
                <Input placeholder="Manager name" value={formData.manager} onChange={e => setFormData(p => ({ ...p, manager: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black uppercase tracking-widest">Budget Code</Label>
                <Input placeholder="e.g. SAG-2025" value={formData.budget_code} onChange={e => setFormData(p => ({ ...p, budget_code: e.target.value }))} />
              </div>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="font-bold uppercase tracking-wider">Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="font-bold uppercase tracking-wider gap-2">
                {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}{editingDept ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle className="text-xl font-black uppercase">Delete Department?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the department.</AlertDialogDescription></AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="font-bold uppercase tracking-wider">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 font-bold uppercase tracking-wider gap-2">
                {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
