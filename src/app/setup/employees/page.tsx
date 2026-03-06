"use client"

import Link from "next/link"
import * as React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Users, Plus, Edit, Trash2, RefreshCw, IdCard, Search, Monitor, Network, ChevronRight, X, Package, ShieldCheck, Mail, Briefcase, Image as ImageIcon, MapPin, Building2, UserCircle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Employee {
    id: string
    employee_id: string
    first_name: string
    last_name: string
    email: string | null
    job_title: string | null
    department: string | null
    role: string | null
    status: string | null
    image_url: string | null
}

interface Asset {
    id: string
    asset_tag_id: string
    name: string | null
    category: string | null
    model: string | null
    assigned_to_id: string | null
}

export default function EmployeesPage() {
    const [employees, setEmployees] = React.useState<Employee[]>([])
    const [assets, setAssets] = React.useState<Asset[]>([])
    const [isLoading, setIsLoading] = React.useState(true)
    const [modalOpen, setModalOpen] = React.useState(false)
    const [assignModalOpen, setAssignModalOpen] = React.useState(false)
    const [cardModalOpen, setCardModalOpen] = React.useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
    const [editingEmployee, setEditingEmployee] = React.useState<Employee | null>(null)
    const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null)
    const [deletingId, setDeletingId] = React.useState<string | null>(null)
    const [search, setSearch] = React.useState("")
    const [isSubmitting, setIsSubmitting] = React.useState(false)
    const [isDeleting, setIsDeleting] = React.useState(false)

    const [formData, setFormData] = React.useState({
        employee_id: "",
        first_name: "",
        last_name: "",
        email: "",
        job_title: "",
        department: "",
        role: "Employee"
    })

    const fetchData = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const [empRes, assetRes] = await Promise.all([
                fetch("/api/setup/employees"),
                fetch("/api/assets")
            ])

            const empJson = await empRes.json()
            const assetJson = await assetRes.json()

            if (empJson.success) setEmployees(empJson.data || [])
            if (assetJson.success) setAssets(assetJson.data || [])
        } catch {
            toast.error("Could not connect to server")
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchData()
    }, [fetchData])

    const filtered = employees.filter(e =>
        !search ||
        `${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
        e.employee_id.toLowerCase().includes(search.toLowerCase())
    )

    const openAdd = () => {
        setEditingEmployee(null)
        setFormData({
            employee_id: "",
            first_name: "",
            last_name: "",
            email: "",
            job_title: "",
            department: "",
            role: "Employee"
        })
        setModalOpen(true)
    }

    const openEdit = (e: Employee) => {
        setEditingEmployee(e)
        setFormData({
            employee_id: e.employee_id,
            first_name: e.first_name,
            last_name: e.last_name,
            email: e.email || "",
            job_title: e.job_title || "",
            department: e.department || "",
            role: e.role || "Employee"
        })
        setModalOpen(true)
    }

    const openAssign = (e: Employee) => {
        setSelectedEmployee(e)
        setAssignModalOpen(true)
    }

    const openCard = (e: Employee) => {
        setSelectedEmployee(e)
        setCardModalOpen(true)
    }

    const handleSubmit = async () => {
        if (!formData.employee_id || !formData.first_name || !formData.last_name) {
            toast.error("Required fields are missing")
            return
        }

        setIsSubmitting(true)
        try {
            const url = editingEmployee ? `/api/setup/employees/${editingEmployee.id}` : "/api/setup/employees"
            const method = editingEmployee ? "PATCH" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const json = await res.json()
            if (json.success) {
                toast.success(editingEmployee ? "Employee updated!" : "Employee added!")
                setModalOpen(false)
                fetchData()
            } else {
                console.error('Submission failed:', json)
                toast.error(json.error || "Failed to save")
            }
        } catch (error) {
            console.error("Error saving employee:", error)
            toast.error("Error saving employee")
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingId) return
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/setup/employees/${deletingId}`, { method: "DELETE" })
            const json = await res.json()
            if (json.success) {
                toast.success("Employee deleted")
                setDeleteDialogOpen(false)
                fetchData()
            } else {
                toast.error(json.error || "Failed to delete")
            }
        } catch {
            toast.error("Error deleting")
        } finally {
            setIsDeleting(false)
        }
    }

    const toggleAssetAssignment = async (assetTagId: string, isAssigned: boolean) => {
        if (!selectedEmployee) return

        try {
            const res = await fetch(`/api/assets/${assetTagId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    assigned_to_id: isAssigned ? null : selectedEmployee.id,
                    assigned_to: isAssigned ? "" : `${selectedEmployee.first_name} ${selectedEmployee.last_name}`,
                    status: isAssigned ? "Available" : "Checked out"
                })
            })

            const json = await res.json()
            if (json.success) {
                toast.success(isAssigned ? "Asset unassigned" : "Asset assigned")
                fetchData()
            } else {
                toast.error(json.error || "Assignment failed")
            }
        } catch {
            toast.error("Error during assignment")
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
                            <BreadcrumbItem><BreadcrumbLink asChild><Link href="/setup">Setup</Link></BreadcrumbLink></BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem><BreadcrumbPage>Employees</BreadcrumbPage></BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>

                <main className="flex-1 space-y-6 p-4 md:p-8 pt-6 bg-slate-50/50 dark:bg-slate-950/50">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight uppercase flex items-center gap-3">
                                <Users className="h-8 w-8 text-indigo-600" /> Employees
                            </h1>
                            <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest opacity-70 mt-1">
                                Manage staff members and their assigned equipment
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={fetchData} className="h-9 font-bold uppercase tracking-wider backdrop-blur-sm">
                                <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                            </Button>
                            <Button onClick={openAdd} className="h-9 font-bold uppercase tracking-wider gap-2 bg-primary hover:bg-primary/90 shadow-primary/20 dark:shadow-primary/40 shadow-lg text-primary-foreground">
                                <Plus className="h-4 w-4" /> Add Employee
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or employee ID..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-10 h-10 border-primary/20 dark:border-primary/30 focus-visible:ring-primary"
                            />
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center h-64 gap-3 text-muted-foreground">
                            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                            <span className="text-sm font-black uppercase tracking-widest">Gathering staff files...</span>
                        </div>
                    ) : filtered.length === 0 ? (
                        <Card className="border-dashed border-2 flex flex-col items-center justify-center h-64 gap-4 bg-transparent border-primary/20">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Users className="h-6 w-6" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground/50">
                                    {search ? "No staff members matching your search" : "No employees added yet"}
                                </p>
                                {!search && (
                                    <Button variant="link" onClick={openAdd} className="text-primary font-black uppercase text-xs hover:text-primary/80">
                                        Register your first employee
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filtered.map(emp => {
                                const empAssets = assets.filter(a => a.assigned_to_id === emp.id)
                                return (
                                    <Card key={emp.id} className="group overflow-hidden border-primary/10 dark:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                                        <CardHeader className="pb-3 border-b border-primary/5 dark:border-primary/10 bg-primary/5 dark:bg-primary/5">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter bg-primary/10 text-primary border-primary/20">
                                                        {emp.employee_id}
                                                    </Badge>
                                                    <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">
                                                        {emp.first_name} {emp.last_name}
                                                    </CardTitle>
                                                    <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                                        {emp.job_title || "No Title"} • {emp.department || "General"}
                                                    </CardDescription>
                                                </div>
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary" onClick={() => openEdit(emp)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-destructive" onClick={() => { setDeletingId(emp.id); setDeleteDialogOpen(true) }}>
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-4 pb-4 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Role</p>
                                                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 font-bold uppercase text-[10px]">
                                                        {emp.role || "Employee"}
                                                    </Badge>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Assets</p>
                                                    <p className="text-sm font-bold text-primary">{empAssets.length} Assigned</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-wider border-primary/20 hover:bg-primary/5" onClick={() => openAssign(emp)}>
                                                    Assign Assets
                                                </Button>
                                                <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-wider border-primary/20 hover:bg-primary/5 text-primary" onClick={() => openCard(emp)}>
                                                    <IdCard className="h-3 w-3 mr-1" /> View ID Card
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </main>

                <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                    <DialogContent className="max-w-md sm:max-w-xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                                <Users className="h-6 w-6 text-indigo-600" />
                                {editingEmployee ? "Update Employee" : "Register Employee"}
                            </DialogTitle>
                            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                                Staff personnel management details
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest">Employee ID <span className="text-destructive">*</span></Label>
                                <Input placeholder="e.g. EMP-2024-001" value={formData.employee_id} onChange={e => setFormData(p => ({ ...p, employee_id: e.target.value }))} className="uppercase" />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest">First Name <span className="text-destructive">*</span></Label>
                                <Input placeholder="John" value={formData.first_name} onChange={e => setFormData(p => ({ ...p, first_name: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest">Last Name <span className="text-destructive">*</span></Label>
                                <Input placeholder="Doe" value={formData.last_name} onChange={e => setFormData(p => ({ ...p, last_name: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest">Email Address</Label>
                                <Input placeholder="john.doe@shoreagents.com" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest">Job Title</Label>
                                <Input placeholder="Software Engineer" value={formData.job_title} onChange={e => setFormData(p => ({ ...p, job_title: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest">Department</Label>
                                <Input placeholder="Engineering" value={formData.department} onChange={e => setFormData(p => ({ ...p, department: e.target.value }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase tracking-widest">Role</Label>
                                <Select value={formData.role} onValueChange={val => setFormData(p => ({ ...p, role: val }))}>
                                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                                    <SelectContent>
                                        {["Employee", "Manager", "Admin", "Contractor", "Intern"].map(r => (
                                            <SelectItem key={r} value={r}>{r}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 pt-2 border-t mt-2">
                            <Button variant="outline" onClick={() => setModalOpen(false)} className="font-black uppercase tracking-widest text-xs h-10 px-6">Cancel</Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting} className="font-black uppercase tracking-widest text-xs h-10 px-6 bg-indigo-600 hover:bg-indigo-700">
                                {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : editingEmployee ? "Update Employee" : "Save Employee"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
                    <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
                        <DialogHeader className="p-6 pb-0">
                            <DialogTitle className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                                Assign Assets to {selectedEmployee?.first_name}
                            </DialogTitle>
                            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                                Lending company equipment to staff members
                            </DialogDescription>
                        </DialogHeader>
                        <div className="p-6 flex-1 overflow-auto space-y-4">
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600">Currently Assigned</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {assets.filter(a => a.assigned_to_id === selectedEmployee?.id).length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic bg-slate-100 dark:bg-slate-900 p-4 rounded-lg text-center border border-dashed">
                                            No assets currently assigned to this employee.
                                        </p>
                                    ) : (
                                        assets.filter(a => a.assigned_to_id === selectedEmployee?.id).map(asset => (
                                            <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg border border-indigo-100 bg-indigo-50/20">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-white dark:bg-slate-800 flex items-center justify-center border">
                                                        {asset.category?.includes("NETWORK") ? <Network className="h-4 w-4 text-indigo-600" /> : <Monitor className="h-4 w-4 text-indigo-600" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">{asset.name || asset.asset_tag_id}</p>
                                                        <p className="text-[10px] font-medium text-muted-foreground uppercase">{asset.category} • {asset.model || "Standard Model"}</p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm" className="h-8 text-destructive hover:bg-destructive/10 px-2" onClick={() => toggleAssetAssignment(asset.asset_tag_id, true)}>
                                                    <X className="h-4 w-4 mr-1" /> Unassign
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <Separator />

                                <h3 className="text-xs font-black uppercase tracking-wider text-green-600">Available Equipment</h3>
                                <div className="grid grid-cols-1 gap-2">
                                    {assets.filter(a => !a.assigned_to_id).length === 0 ? (
                                        <p className="text-xs text-muted-foreground bg-slate-50 p-4 rounded-lg text-center border">
                                            No available assets in inventory.
                                        </p>
                                    ) : (
                                        assets.filter(a => !a.assigned_to_id).map(asset => (
                                            <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg border hover:border-indigo-300 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                        {asset.category?.includes("NETWORK") ? <Network className="h-4 w-4 text-slate-500" /> : <Monitor className="h-4 w-4 text-slate-500" />}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold">{asset.name || asset.asset_tag_id}</p>
                                                        <p className="text-[10px] font-medium text-muted-foreground uppercase">{asset.category} • {asset.model || "Standard Model"}</p>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm" className="h-8 border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white" onClick={() => toggleAssetAssignment(asset.asset_tag_id, false)}>
                                                    Assign
                                                </Button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                        <DialogFooter className="p-4 bg-slate-50 dark:bg-slate-900 border-t">
                            <Button onClick={() => setAssignModalOpen(false)} className="w-full font-black uppercase tracking-widest text-xs h-10">
                                Done
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Dialog open={cardModalOpen} onOpenChange={setCardModalOpen}>
                    <DialogContent className="max-w-xl bg-[#020817] border-slate-800 p-0 overflow-hidden shadow-2xl">
                        {selectedEmployee && (
                            <div className="flex flex-col h-full max-h-[90vh]">
                                {/* Dark Header */}
                                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-white">
                                        <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                                            <UserCircle className="h-7 w-7 text-primary" />
                                        </div>
                                        <div>
                                            <DialogTitle className="text-xl font-bold tracking-tight mb-0.5">Personnel Details</DialogTitle>
                                            <DialogDescription className="text-sm font-medium text-slate-400">
                                                {selectedEmployee.employee_id} • {selectedEmployee.first_name} {selectedEmployee.last_name}
                                            </DialogDescription>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => { setCardModalOpen(false); openEdit(selectedEmployee); }}
                                        className="bg-[#00f59b] hover:bg-[#00d185] text-[#020817] font-black uppercase text-xs tracking-widest h-10 px-6 gap-2 border-none shadow-lg shadow-emerald-500/20"
                                    >
                                        <Edit className="h-4 w-4" /> Edit
                                    </Button>
                                </div>

                                {/* Content Area */}
                                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
                                    {/* Personnel Image Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-slate-200">
                                            <ImageIcon className="h-4 w-4 opacity-70" />
                                            <h3 className="text-xs font-black uppercase tracking-widest opacity-70">Personnel Image</h3>
                                        </div>
                                        <div className="w-full h-48 rounded-2xl bg-[#030a1c] border border-slate-800 flex items-center justify-center overflow-hidden group relative">
                                            {selectedEmployee.image_url ? (
                                                <img src={selectedEmployee.image_url} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                            ) : (
                                                <div className="flex flex-col items-center gap-4 text-slate-600">
                                                    <div className="relative">
                                                        <ImageIcon className="h-16 w-16 opacity-20" />
                                                        <UserCircle className="h-8 w-8 absolute bottom-0 right-0 text-slate-400 opacity-30" />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-50">No image data found</p>
                                                        <p className="text-[9px] font-bold opacity-30 mt-1">Upload an image during personnel editing</p>
                                                    </div>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>

                                    {/* Basic Information Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-slate-200">
                                            <Package className="h-4 w-4 opacity-70" />
                                            <h3 className="text-xs font-black uppercase tracking-widest opacity-70">Basic Information</h3>
                                        </div>
                                        <div className="bg-[#030a1c] border border-slate-800 rounded-2xl p-6 grid grid-cols-2 gap-y-6 gap-x-8">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employee ID</p>
                                                <p className="text-sm font-black text-white tracking-wide">{selectedEmployee.employee_id}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Full Name</p>
                                                <p className="text-sm font-black text-white tracking-wide">{selectedEmployee.first_name} {selectedEmployee.last_name}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</p>
                                                <p className="text-sm font-bold text-white/90 truncate">{selectedEmployee.email || "N/A"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Job Title</p>
                                                <p className="text-sm font-black text-white tracking-wide">{selectedEmployee.job_title || "N/A"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge className="bg-[#00f59b]/10 text-[#00f59b] border-none text-[9px] font-black uppercase rounded-full">
                                                        {selectedEmployee.role || "Employee"}
                                                    </Badge>
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employee Status</p>
                                                <Badge className="bg-blue-500/10 text-blue-400 border-none text-[9px] font-black uppercase rounded-full mt-1">
                                                    Active Service
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Work Location Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-slate-200">
                                            <Building2 className="h-4 w-4 opacity-70" />
                                            <h3 className="text-xs font-black uppercase tracking-widest opacity-70">Location & Department</h3>
                                        </div>
                                        <div className="bg-[#030a1c] border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                                                <MapPin className="h-5 w-5 text-primary" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Primary Department</p>
                                                <p className="text-sm font-black text-white uppercase tracking-tight">{selectedEmployee.department || "General Operations"}</p>
                                            </div>
                                            <Badge variant="secondary" className="bg-slate-800 text-slate-400 border-none font-black text-[9px] tracking-widest">HQ OFFICE</Badge>
                                        </div>
                                    </div>

                                    {/* Equipment Section */}
                                    <div className="space-y-3 pb-4">
                                        <div className="flex items-center justify-between text-slate-200">
                                            <div className="flex items-center gap-2">
                                                <Monitor className="h-4 w-4 opacity-70" />
                                                <h3 className="text-xs font-black uppercase tracking-widest opacity-70">Assigned Equipment</h3>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{assets.filter(a => a.assigned_to_id === selectedEmployee.id).length} Items</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {assets.filter(a => a.assigned_to_id === selectedEmployee.id).length === 0 ? (
                                                <div className="py-8 bg-[#030a1c] rounded-2xl border border-dashed border-slate-800 text-center">
                                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">No hardware currently assigned</p>
                                                </div>
                                            ) : (
                                                assets.filter(a => a.assigned_to_id === selectedEmployee.id).map(asset => (
                                                    <div key={asset.id} className="flex items-center justify-between p-3 bg-[#030a1c] border border-slate-800 rounded-xl hover:border-primary/40 transition-all group/item">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 group-hover/item:text-primary transition-colors">
                                                                {asset.category?.toUpperCase().includes("NETWORK") ? <Network className="h-4 w-4" /> : <Monitor className="h-4 w-4" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-black text-white leading-none mb-1 group-hover/item:text-primary transition-colors">{asset.name || asset.asset_tag_id}</p>
                                                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">{asset.category} • {asset.model || "Hardware"}</p>
                                                            </div>
                                                        </div>
                                                        <Badge variant="outline" className="border-slate-800 text-slate-500 text-[9px] font-bold group-hover/item:border-primary/20 transition-colors">ACTIVE</Badge>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>

                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-black uppercase">Remove Employee?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will delete the staff record. Assigned assets will be marked as available.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="font-bold uppercase tracking-wider">Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90 font-bold uppercase tracking-wider gap-2">
                                {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Delete Records
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </SidebarInset>
        </SidebarProvider>
    )
}
