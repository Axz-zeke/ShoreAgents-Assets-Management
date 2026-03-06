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
import { Users, Plus, Edit, Trash2, RefreshCw, IdCard, Search, Monitor, Network, ChevronRight, X, Package, ShieldCheck, Mail, Briefcase, Image as ImageIcon, MapPin, Building2, UserCircle, Upload, ImagePlus, Camera, QrCode } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { createClient } from "@/lib/supabase/client"
import { parseAssetQrCode } from "@/lib/qr-parser"
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode"

interface Employee {
    id: string
    employee_id: string
    first_name: string
    middle_name: string | null
    last_name: string
    email: string | null
    job_title: string | null
    department: string | null
    role: string | null
    status: string | null
    image_url: string | null
    site: string | null
    location: string | null
    employment_type: string | null
    date_hired: string | null
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
        middle_name: "",
        last_name: "",
        email: "",
        job_title: "",
        department: "",
        role: "Employee",
        site: "",
        location: "",
        employment_type: "Regular",
        date_hired: new Date().toISOString().split('T')[0],
        image_url: "",
        assignedAssets: [] as string[]
    })

    const [deptList, setDeptList] = React.useState<any[]>([])
    const [siteList, setSiteList] = React.useState<any[]>([])
    const [locList, setLocList] = React.useState<any[]>([])
    const [assetSearch, setAssetSearch] = React.useState("")
    const [uploadingImage, setUploadingImage] = React.useState(false)
    const [scannerOpen, setScannerOpen] = React.useState(false)
    const [scannerView, setScannerView] = React.useState<'choice' | 'camera'>('choice')
    const [scannerError, setScannerError] = React.useState<string | null>(null)

    const supabase = createClient()

    const fetchData = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const [empRes, assetRes, deptRes, siteRes, locRes] = await Promise.all([
                fetch("/api/setup/employees"),
                fetch("/api/assets"),
                fetch("/api/setup/departments"),
                fetch("/api/setup/sites"),
                fetch("/api/setup/locations")
            ])

            const [empJson, assetJson, deptJson, siteJson, locJson] = await Promise.all([
                empRes.json(),
                assetRes.json(),
                deptRes.json(),
                siteRes.json(),
                locRes.json()
            ])

            if (empJson.success) setEmployees(empJson.data || [])
            if (assetJson.success) setAssets(assetJson.data || [])
            if (deptJson.success) setDeptList(deptJson.data || [])
            if (siteJson.success) setSiteList(siteJson.data || [])
            if (locJson.success) setLocList(locJson.data || [])
        } catch {
            toast.error("Could not connect to server")
        } finally {
            setIsLoading(false)
        }
    }, [])

    React.useEffect(() => {
        fetchData()
    }, [fetchData])

    React.useEffect(() => {
        let scanner: Html5Qrcode | null = null;
        let timeoutId: any = null;

        if (scannerOpen && scannerView === 'camera') {
            setScannerError(null);
            timeoutId = setTimeout(async () => {
                const element = document.getElementById("qr-reader");
                if (!element) return;

                try {
                    const cameras = await Html5Qrcode.getCameras().catch(() => []);

                    if (!cameras || cameras.length === 0) {
                        setScannerError("No camera hardware detected. Use 'Choose QR Image' below.");
                        return;
                    }

                    scanner = new Html5Qrcode("qr-reader");

                    const backCamera = cameras.find(c =>
                        c.label.toLowerCase().includes('back') ||
                        c.label.toLowerCase().includes('environment') ||
                        c.label.toLowerCase().includes('rear')
                    );

                    const cameraId = backCamera ? backCamera.id : cameras[0].id;
                    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

                    try {
                        await scanner.start(cameraId, config,
                            (text) => {
                                const tagId = parseAssetQrCode(text);
                                if (tagId) {
                                    const asset = assets.find(a => a.asset_tag_id === tagId || a.id === tagId);
                                    if (asset) {
                                        if (!formData.assignedAssets.includes(asset.asset_tag_id)) {
                                            setFormData(p => ({ ...p, assignedAssets: [...p.assignedAssets, asset.asset_tag_id] }));
                                            toast.success(`Allocated: ${asset.name || asset.asset_tag_id}`);
                                        }
                                        setScannerOpen(false);
                                        setScannerView('choice'); // Reset view for next time
                                    } else {
                                        toast.error("Asset not recognized");
                                    }
                                }
                            },
                            () => { }
                        );
                    } catch (startErr) {
                        console.warn("Camera start failed, trying generic constraints...", startErr);
                        // Final fallback: Let the library decide based on facingMode
                        await scanner.start({ facingMode: "user" }, config,
                            (text) => {
                                const tagId = parseAssetQrCode(text);
                                if (tagId) {
                                    const asset = assets.find(a => a.asset_tag_id === tagId || a.id === tagId);
                                    if (asset && !formData.assignedAssets.includes(asset.asset_tag_id)) {
                                        setFormData(p => ({ ...p, assignedAssets: [...p.assignedAssets, asset.asset_tag_id] }));
                                        toast.success(`Allocated: ${asset.name || asset.asset_tag_id}`);
                                        setScannerOpen(false);
                                        setScannerView('choice'); // Reset
                                    }
                                }
                            },
                            () => { }
                        );
                    }
                } catch (err: any) {
                    console.error("Critical Scanner Error:", err);
                    setScannerError("Could not start camera. This device might not have a camera or permissions are blocked.");
                }
            }, 500);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            if (scanner?.isScanning) {
                scanner.stop().catch(console.error);
            }
        };
    }, [scannerOpen, scannerView, assets, formData.assignedAssets]);

    const handleQrUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return false;

        const scanner = new Html5Qrcode("qr-reader-hidden");
        try {
            const decodedText = await scanner.scanFile(file, true);
            const tagId = parseAssetQrCode(decodedText);
            if (tagId) {
                const asset = assets.find(a => a.asset_tag_id === tagId || a.id === tagId);
                if (asset) {
                    if (!formData.assignedAssets.includes(asset.asset_tag_id)) {
                        setFormData(p => ({ ...p, assignedAssets: [...p.assignedAssets, asset.asset_tag_id] }));
                        toast.success(`Detected: ${asset.name || asset.asset_tag_id}`);
                    } else {
                        toast.info(`${asset.name || asset.asset_tag_id} already selected`);
                    }
                    return true;
                } else {
                    toast.error("Asset not found");
                }
            } else {
                toast.error("Hmm, that pattern doesn't look like a valid asset tag. Please try again! 🔍");
            }
        } catch (err) {
            toast.error("Whoops! No QR code detected in that image. Try a clearer shot! 📸");
        }
        return false;
    };

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
            middle_name: "",
            last_name: "",
            email: "",
            job_title: "",
            department: "",
            role: "Employee",
            site: "",
            location: "",
            employment_type: "Regular",
            date_hired: new Date().toISOString().split('T')[0],
            image_url: "",
            assignedAssets: [] as string[]
        })
        setModalOpen(true)
    }

    const openEdit = (e: Employee) => {
        setEditingEmployee(e)
        // Find assets already assigned to this employee
        const currentlyAssigned = assets.filter(a => a.assigned_to_id === e.id).map(a => a.asset_tag_id)

        setFormData({
            employee_id: e.employee_id,
            first_name: e.first_name,
            middle_name: e.middle_name || "",
            last_name: e.last_name,
            email: e.email || "",
            job_title: e.job_title || "",
            department: e.department || "",
            role: e.role || "Employee",
            site: e.site || "",
            location: e.location || "",
            employment_type: e.employment_type || "Regular",
            date_hired: e.date_hired || new Date().toISOString().split('T')[0],
            image_url: e.image_url || "",
            assignedAssets: currentlyAssigned
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
                const targetEmployeeId = json.data.id
                const employeeName = `${formData.first_name} ${formData.last_name}`

                // Asset Assignment Handling
                // 1. Get current assignments if editing
                const previousAssignments = editingEmployee
                    ? assets.filter(a => a.assigned_to_id === editingEmployee.id).map(a => a.asset_tag_id)
                    : []

                // 2. Identify assets to unassign
                const toUnassign = previousAssignments.filter(id => !formData.assignedAssets.includes(id))

                // 3. Identify assets to assign
                const toAssign = formData.assignedAssets.filter(id => !previousAssignments.includes(id))

                // 4. Batch Updates
                const updatePromises = []

                for (const assetTagId of toUnassign) {
                    updatePromises.push(fetch(`/api/assets/${assetTagId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ assigned_to_id: null, assigned_to: "", status: "Available" })
                    }))
                }

                for (const assetTagId of toAssign) {
                    updatePromises.push(fetch(`/api/assets/${assetTagId}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ assigned_to_id: targetEmployeeId, assigned_to: employeeName, status: "Checked out" })
                    }))
                }

                if (updatePromises.length > 0) {
                    await Promise.all(updatePromises)
                }

                toast.success(editingEmployee ? "Employee and assets updated!" : "Employee registered with assets!")
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

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error("Please upload an image file")
            return
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image size must be less than 2MB")
            return
        }

        setUploadingImage(true)
        try {
            const fileExt = file.name.split('.').pop()
            const fileName = `${formData.employee_id || 'new'}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `employees/${fileName}`

            const { data, error } = await supabase.storage
                .from('employee-photos')
                .upload(filePath, file)

            if (error) throw error

            const { data: { publicUrl } } = supabase.storage
                .from('employee-photos')
                .getPublicUrl(filePath)

            setFormData(p => ({ ...p, image_url: publicUrl }))
            toast.success("Profile photo uploaded")
        } catch (error: any) {
            console.error('Error uploading image:', error)
            toast.error("Failed to upload image. Please ensure 'employee-photos' bucket exists in Supabase Storage.")
        } finally {
            setUploadingImage(false)
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
                                        <CardHeader className="pb-3 border-b border-white/5 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/10">
                                            <div className="flex gap-4">
                                                {/* Profile Image */}
                                                <div className="relative h-16 w-16 md:h-20 md:w-20 flex-shrink-0 group/img">
                                                    <div className="h-full w-full rounded-2xl border-2 border-slate-100 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950 shadow-sm flex items-center justify-center transition-all group-hover/img:border-primary/50">
                                                        {emp.image_url ? (
                                                            <img
                                                                src={emp.image_url}
                                                                alt={`${emp.first_name} ${emp.last_name}`}
                                                                className="h-full w-full object-cover transition-transform duration-500 group-hover/img:scale-110"
                                                            />
                                                        ) : (
                                                            <UserCircle className="h-10 w-10 text-slate-200 dark:text-slate-800" />
                                                        )}
                                                    </div>
                                                    <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-sm">
                                                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                                    </div>
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0 space-y-2">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <Badge variant="outline" className="text-[10px] font-black uppercase tracking-tighter bg-primary/10 text-primary border-primary/20">
                                                                {emp.employee_id}
                                                            </Badge>
                                                            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors truncate">
                                                                {emp.first_name} {emp.middle_name ? `${emp.middle_name} ` : ""}{emp.last_name}
                                                            </CardTitle>
                                                            <CardDescription className="text-xs font-medium uppercase tracking-wider text-slate-500 truncate">
                                                                {emp.job_title || "No Title"}
                                                            </CardDescription>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{emp.department || "General"}</p>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-primary" onClick={() => openEdit(emp)}>
                                                                <Edit className="h-3.5 w-3.5" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-destructive" onClick={() => { setDeletingId(emp.id); setDeleteDialogOpen(true) }}>
                                                                <Trash2 className="h-3.5 w-3.5" />
                                                            </Button>
                                                        </div>
                                                    </div>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 max-h-[70vh] overflow-y-auto px-1 custom-scrollbar">
                            <div className="space-y-4 sm:col-span-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Personnel Identification</Label>
                                <div className="flex flex-col sm:flex-row gap-6">
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="relative group">
                                            <div className="w-24 h-24 rounded-2xl bg-slate-200 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary">
                                                {formData.image_url ? (
                                                    <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="flex flex-col items-center text-slate-400 group-hover:text-primary transition-colors">
                                                        <ImagePlus className="h-8 w-8 mb-1" />
                                                        <span className="text-[8px] font-black uppercase">Photo</span>
                                                    </div>
                                                )}
                                                {uploadingImage && (
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                        <RefreshCw className="h-6 w-6 text-white animate-spin" />
                                                    </div>
                                                )}
                                            </div>
                                            <Label htmlFor="image-upload" className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform">
                                                <Upload className="h-4 w-4" />
                                            </Label>
                                            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploadingImage} />
                                        </div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Profile Photo</p>
                                    </div>

                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-3">
                                        <div className="space-y-1.5 sm:col-span-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Employee ID <span className="text-destructive">*</span></Label>
                                            <Input placeholder="e.g. EMP-2024-001" value={formData.employee_id} onChange={e => setFormData(p => ({ ...p, employee_id: e.target.value }))} className="uppercase font-bold" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">First Name <span className="text-destructive">*</span></Label>
                                            <Input placeholder="John" value={formData.first_name} onChange={e => setFormData(p => ({ ...p, first_name: e.target.value }))} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Middle Name</Label>
                                            <Input placeholder="Quincy" value={formData.middle_name || ""} onChange={e => setFormData(p => ({ ...p, middle_name: e.target.value }))} />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest opacity-70">Last Name <span className="text-destructive">*</span></Label>
                                            <Input placeholder="Doe" value={formData.last_name} onChange={e => setFormData(p => ({ ...p, last_name: e.target.value }))} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 sm:col-span-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Employment Details</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest">Email Address</Label>
                                        <Input placeholder="john.doe@shoreagents.com" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest">Position / Job Title</Label>
                                        <Input placeholder="Lead Software Engineer" value={formData.job_title} onChange={e => setFormData(p => ({ ...p, job_title: e.target.value }))} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest">Department</Label>
                                        <Select value={formData.department} onValueChange={val => setFormData(p => ({ ...p, department: val }))}>
                                            <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                                            <SelectContent>
                                                {deptList.map(d => (
                                                    <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                            </div>

                            <div className="space-y-4 sm:col-span-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Work Location & Registry</Label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest">Assigned Site</Label>
                                        <Select value={formData.site} onValueChange={val => setFormData(p => ({ ...p, site: val }))}>
                                            <SelectTrigger><SelectValue placeholder="Select site" /></SelectTrigger>
                                            <SelectContent>
                                                {siteList.map(s => (
                                                    <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest">Office Location</Label>
                                        <Select value={formData.location} onValueChange={val => setFormData(p => ({ ...p, location: val }))}>
                                            <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                                            <SelectContent>
                                                {locList.map(l => (
                                                    <SelectItem key={l.id} value={l.name}>{l.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest">Employment Type</Label>
                                        <Select value={formData.employment_type} onValueChange={val => setFormData(p => ({ ...p, employment_type: val }))}>
                                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                            <SelectContent>
                                                {["Regular", "Contractual", "Probationary", "Part-time"].map(t => (
                                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase tracking-widest">Date Hired</Label>
                                        <Input type="date" value={formData.date_hired} onChange={e => setFormData(p => ({ ...p, date_hired: e.target.value }))} />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 sm:col-span-2 border-t pt-4 border-slate-100 dark:border-slate-800/50">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Equipment Allocation</Label>
                                        <p className="text-[10px] text-slate-400 font-medium">Assign assets to this employee</p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] font-bold bg-slate-100 dark:bg-slate-900 border-none">
                                        {formData.assignedAssets.length} Selected
                                    </Badge>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                                            <Input
                                                placeholder="Search or scan assets..."
                                                className="pl-9 pr-10 h-9 text-xs bg-slate-50/50 dark:bg-slate-900/30"
                                                value={assetSearch}
                                                onChange={(e) => setAssetSearch(e.target.value)}
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setScannerOpen(true)}
                                                className="absolute right-0 top-0 h-9 w-9 text-indigo-600 hover:bg-transparent"
                                            >
                                                <Camera className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                        {assets.filter(a =>
                                            (!assetSearch ||
                                                a.name?.toLowerCase().includes(assetSearch.toLowerCase()) ||
                                                a.asset_tag_id.toLowerCase().includes(assetSearch.toLowerCase()) ||
                                                a.category?.toLowerCase().includes(assetSearch.toLowerCase())) &&
                                            (a.assigned_to_id === null || a.assigned_to_id === editingEmployee?.id)
                                        ).map(asset => {
                                            const isSelected = formData.assignedAssets.includes(asset.asset_tag_id)
                                            return (
                                                <div
                                                    key={asset.id}
                                                    onClick={() => {
                                                        setFormData(p => ({
                                                            ...p,
                                                            assignedAssets: isSelected
                                                                ? p.assignedAssets.filter(id => id !== asset.asset_tag_id)
                                                                : [...p.assignedAssets, asset.asset_tag_id]
                                                        }))
                                                    }}
                                                    className={cn(
                                                        "p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-3 group",
                                                        isSelected
                                                            ? "bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-500/50 ring-1 ring-indigo-500/20"
                                                            : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-lg flex items-center justify-center transition-colors shadow-sm",
                                                        isSelected ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-900 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-800"
                                                    )}>
                                                        {asset.category?.toUpperCase().includes('MONITOR') ? <Monitor className="h-5 w-5" /> :
                                                            asset.category?.toUpperCase().includes('NETWORK') ? <Network className="h-5 w-5" /> :
                                                                <Package className="h-5 w-5" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-sm truncate">{asset.name || "Unnamed Asset"}</span>
                                                            <Badge variant="outline" className="text-[9px] h-4 font-bold border-slate-200 dark:border-slate-800">
                                                                {asset.asset_tag_id}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
                                                            {asset.category || "General"} • {asset.model || "Standard Model"}
                                                        </p>
                                                    </div>
                                                    <div className={cn(
                                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all shadow-sm",
                                                        isSelected ? "bg-indigo-600 border-indigo-600" : "border-slate-300 dark:border-slate-700"
                                                    )}>
                                                        {isSelected && <Plus className="h-3 w-3 text-white rotate-45" />}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
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
                        <div className="p-6 flex-1 overflow-auto space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600">Currently Assigned</h3>
                                    <Badge variant="secondary" className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 font-bold">
                                        {assets.filter(a => a.assigned_to_id === selectedEmployee?.id).length} Items
                                    </Badge>
                                </div>
                                <div className="grid grid-cols-1 gap-2">
                                    {assets.filter(a => a.assigned_to_id === selectedEmployee?.id).length === 0 ? (
                                        <p className="text-xs text-muted-foreground italic bg-slate-100 dark:bg-slate-900 p-4 rounded-lg text-center border border-dashed">
                                            No assets currently assigned.
                                        </p>
                                    ) : (
                                        assets.filter(a => a.assigned_to_id === selectedEmployee?.id).map(asset => (
                                            <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg border border-indigo-100 bg-indigo-50/20">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded bg-white dark:bg-slate-800 flex items-center justify-center border shadow-sm">
                                                        {asset.category?.toUpperCase().includes("NETWORK") ? <Network className="h-4 w-4 text-indigo-600" /> : <Monitor className="h-4 w-4 text-indigo-600" />}
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

                                <Separator className="opacity-50" />

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-wider text-emerald-600">Available Equipment</h3>
                                        <div className="relative w-48">
                                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400" />
                                            <Input
                                                placeholder="Quick search..."
                                                value={assetSearch}
                                                onChange={e => setAssetSearch(e.target.value)}
                                                className="h-7 text-[10px] pl-7 rounded-full border-emerald-100"
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                                        {assets.filter(a =>
                                            !a.assigned_to_id &&
                                            (!assetSearch ||
                                                a.name?.toLowerCase().includes(assetSearch.toLowerCase()) ||
                                                a.asset_tag_id.toLowerCase().includes(assetSearch.toLowerCase()) ||
                                                a.category?.toLowerCase().includes(assetSearch.toLowerCase())
                                            )
                                        ).length === 0 ? (
                                            <p className="text-xs text-muted-foreground bg-slate-50 p-4 rounded-lg text-center border">
                                                {assetSearch ? "No matching available assets." : "No available assets in inventory."}
                                            </p>
                                        ) : (
                                            assets.filter(a =>
                                                !a.assigned_to_id &&
                                                (!assetSearch ||
                                                    a.name?.toLowerCase().includes(assetSearch.toLowerCase()) ||
                                                    a.asset_tag_id.toLowerCase().includes(assetSearch.toLowerCase()) ||
                                                    a.category?.toLowerCase().includes(assetSearch.toLowerCase())
                                                )
                                            ).map(asset => (
                                                <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg border hover:border-emerald-300 transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-50 transition-colors">
                                                            {asset.category?.toUpperCase().includes("NETWORK") ? <Network className="h-4 w-4 text-slate-500 group-hover:text-emerald-600" /> : <Monitor className="h-4 w-4 text-slate-500 group-hover:text-emerald-600" />}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold group-hover:text-emerald-700 transition-colors">{asset.name || asset.asset_tag_id}</p>
                                                            <p className="text-[10px] font-medium text-muted-foreground uppercase">{asset.category} • {asset.model || "Standard Model"}</p>
                                                        </div>
                                                    </div>
                                                    <Button variant="outline" size="sm" className="h-8 border-emerald-100 text-emerald-600 hover:bg-emerald-600 hover:text-white" onClick={() => toggleAssetAssignment(asset.asset_tag_id, false)}>
                                                        Assign
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
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
                                                {selectedEmployee.employee_id} • {selectedEmployee.first_name} {selectedEmployee.middle_name ? `${selectedEmployee.middle_name} ` : ""}{selectedEmployee.last_name}
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
                                        <div className="w-72 h-72 mx-auto rounded-3xl bg-[#030a1c] border-2 border-slate-800/50 flex items-center justify-center overflow-hidden group relative shadow-2xl">
                                            {selectedEmployee.image_url ? (
                                                <img src={selectedEmployee.image_url} alt="Profile" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
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
                                            <h3 className="text-xs font-black uppercase tracking-widest opacity-70">Employment Information</h3>
                                        </div>
                                        <div className="bg-[#030a1c] border border-slate-800 rounded-2xl p-6 grid grid-cols-2 gap-y-6 gap-x-8">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employee ID</p>
                                                <p className="text-sm font-black text-white tracking-wide">{selectedEmployee.employee_id}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employment Type</p>
                                                <p className="text-sm font-black text-[#00f59b] tracking-wide">{selectedEmployee.employment_type || "Regular"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Position / Title</p>
                                                <p className="text-sm font-black text-white tracking-wide">{selectedEmployee.job_title || "N/A"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date Hired</p>
                                                <p className="text-sm font-bold text-white/90">{selectedEmployee.date_hired || "N/A"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Email Address</p>
                                                <p className="text-sm font-bold text-white/90 truncate">{selectedEmployee.email || "N/A"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Registry Status</p>
                                                <Badge className="bg-blue-500/10 text-blue-400 border-none text-[9px] font-black uppercase rounded-full mt-1">
                                                    Active Personnel
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-slate-200">
                                            <Building2 className="h-4 w-4 opacity-70" />
                                            <h3 className="text-xs font-black uppercase tracking-widest opacity-70">Location & Department</h3>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            <div className="bg-[#030a1c] border border-slate-800 rounded-2xl p-4 flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                                                    <MapPin className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Primary Department</p>
                                                    <p className="text-sm font-black text-white uppercase tracking-tight">{selectedEmployee.department || "General Operations"}</p>
                                                </div>
                                                <Badge variant="secondary" className="bg-slate-800 text-slate-400 border-none font-black text-[9px] tracking-widest">{selectedEmployee.role?.toUpperCase() || "STAFF"}</Badge>
                                            </div>
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="bg-[#030a1c] border border-slate-800 rounded-2xl p-4 flex flex-col gap-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                                                        <Building2 className="h-3 w-3 opacity-50" /> Site
                                                    </p>
                                                    <p className="text-xs font-black text-white truncate">{selectedEmployee.site || "N/A"}</p>
                                                </div>
                                                <div className="bg-[#030a1c] border border-slate-800 rounded-2xl p-4 flex flex-col gap-1">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-bold">
                                                        <MapPin className="h-3 w-3 opacity-50" /> Location
                                                    </p>
                                                    <p className="text-xs font-black text-white truncate">{selectedEmployee.location || "N/A"}</p>
                                                </div>
                                            </div>
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

                <Dialog open={scannerOpen} onOpenChange={(v) => { setScannerOpen(v); if (!v) setScannerView('choice'); }}>
                    <DialogContent className="max-w-2xl bg-white dark:bg-[#020817] border-slate-200 dark:border-slate-800 p-0 overflow-hidden shadow-2xl">
                        {scannerView === 'choice' ? (
                            <div className="p-8 space-y-8">
                                <DialogHeader className="p-0 border-none space-y-2">
                                    <DialogTitle className="text-3xl font-black tracking-tighter text-[#10b981] dark:text-[#10b981] uppercase leading-none">
                                        SCAN ASSET QR CODE
                                    </DialogTitle>
                                    <DialogDescription className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                                        Select your preferred method to identify an asset.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setScannerView('camera')}
                                        className="group bg-slate-50 dark:bg-[#030a1c] border-2 border-dashed border-[#10b981] rounded-3xl p-8 flex flex-col items-center justify-center gap-6 transition-all hover:bg-[#10b981]/5 hover:scale-[1.02] active:scale-[0.98]"
                                    >
                                        <div className="w-16 h-16 rounded-full bg-[#10b981]/10 flex items-center justify-center transition-colors group-hover:bg-[#10b981]/20">
                                            <Camera className="h-8 w-8 text-[#10b981]" />
                                        </div>
                                        <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-widest group-hover:text-[#10b981] transition-colors">
                                            USE LIVE CAMERA
                                        </span>
                                    </button>

                                    <div className="relative">
                                        <label
                                            className="group bg-slate-50 dark:bg-[#030a1c] border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center gap-6 transition-all hover:bg-slate-100 dark:hover:bg-slate-800/20 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800/50 flex items-center justify-center transition-colors group-hover:bg-slate-300 dark:group-hover:bg-slate-800">
                                                <ImageIcon className="h-8 w-8 text-slate-500 dark:text-slate-400 group-hover:text-[#10b981]" />
                                            </div>
                                            <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                UPLOAD QR IMAGE
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const ok = await handleQrUpload(e);
                                                    if (ok) setScannerOpen(false);
                                                }}
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-[500px]">
                                <DialogHeader className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-slate-950/50">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-[#10b981]/10">
                                                <Camera className="h-5 w-5 text-[#10b981]" />
                                            </div>
                                            <div>
                                                <DialogTitle className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Lens Active</DialogTitle>
                                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Scanning for valid asset tags...</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setScannerView('choice')}
                                            className="text-slate-400 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase font-black text-[10px] tracking-widest"
                                        >
                                            Go Back
                                        </Button>
                                    </div>
                                </DialogHeader>
                                <div className="flex-1 p-6 flex items-center justify-center bg-slate-900 dark:bg-black relative">
                                    <div id="qr-reader" className="w-full max-w-[400px] aspect-square overflow-hidden rounded-3xl border-2 border-[#10b981]/30 bg-slate-800 dark:bg-slate-900 group shadow-2xl shadow-[#10b981]/5">
                                        {scannerError ? (
                                            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                                                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center ring-4 ring-red-500/5">
                                                    <Camera className="h-8 w-8 text-red-500" />
                                                </div>
                                                <p className="text-xs text-slate-300 dark:text-slate-400 font-bold uppercase leading-relaxed max-w-[240px]">
                                                    {scannerError}
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setScannerView('choice')}
                                                    className="border-slate-700 bg-transparent text-white text-[10px] font-black uppercase hover:bg-slate-700"
                                                >
                                                    Try Upload Instead
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center gap-4 text-slate-600">
                                                <RefreshCw className="h-10 w-10 animate-spin text-[#10b981] opacity-50" />
                                                <span className="text-[10px] font-black uppercase tracking-widest opacity-40 text-slate-300">Connecting to Device...</span>
                                            </div>
                                        )}
                                    </div>
                                    {/* UI Overlays for scanning feel */}
                                    {!scannerError && (
                                        <div className="absolute inset-0 pointer-events-none border-[40px] border-slate-900/20 dark:border-black/20 backdrop-blur-[2px]" />
                                    )}
                                </div>
                            </div>
                        )}
                        <div id="qr-reader-hidden" className="hidden"></div>
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
