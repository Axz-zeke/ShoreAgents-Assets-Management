"use client"

import * as React from "react"
import Link from "next/link"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  Search, 
  Mail, 
  Lock, 
  BadgeCheck, 
  AlertCircle,
  Loader2,
  RefreshCw,
  UserCheck
} from "lucide-react"
import { toast } from "sonner"
import { useUserProfile } from "@/hooks/use-user-profile"
import { createClient } from "@/lib/supabase/client"

interface AdminUser {
  id: string
  email: string
  first_name?: string
  last_name?: string
  user_type: string
  created_at: string
}

export default function AdministratorsPage() {
  const { isAdmin, loading: profileLoading } = useUserProfile()
  const [admins, setAdmins] = React.useState<AdminUser[]>([])
  const [employees, setEmployees] = React.useState<any[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [addDialogOpen, setAddDialogOpen] = React.useState(false)
  const [deleteId, setDeleteId] = React.useState<string | null>(null)
  
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    employeeId: ""
  })

  const supabase = createClient()

  const fetchAdmins = React.useCallback(async () => {
    setIsLoading(true)
    try {
      // 1. Fetch employees for the dropdown
      const empRes = await fetch('/api/setup/employees')
      const empJson = await empRes.json()
      if (empJson.success) setEmployees(empJson.data || [])

      // 2. Fetch admin accounts from our new secure API
      const response = await fetch('/api/admin/list-admins')
      const result = await response.json()

      if (response.ok && result.success) {
        setAdmins(result.data || [])
      } else {
        throw new Error(result.error || "Failed to fetch admins")
      }
    } catch (error) {
      console.error('Error fetching admins:', error)
      toast.error("Failed to load administrators")
    } finally {
      setIsLoading(false)
    }
  }, [])

  React.useEffect(() => {
    if (isAdmin) {
      fetchAdmins()
    }
  }, [isAdmin, fetchAdmins])

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.firstName,
          last_name: formData.lastName,
          employee_id: formData.employeeId
        })
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("Administrator created successfully")
        setAddDialogOpen(false)
        setFormData({ email: "", password: "", firstName: "", lastName: "", employeeId: "" })
        fetchAdmins()
      } else {
        toast.error(result.error || "Failed to create administrator")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteAdmin = async () => {
    if (!deleteId) return
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: deleteId })
      })

      if (response.ok) {
        toast.success("Administrator removed")
        setDeleteId(null)
        fetchAdmins()
      } else {
        toast.error("Failed to remove administrator")
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (profileLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to access this page.</p>
        <Button asChild>
          <Link href="/dashboard">Return to Dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/setup">Setup</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Administrators</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <main className="flex-1 space-y-6 p-4 md:p-8 pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl md:text-3xl font-black tracking-tight uppercase flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-primary" /> Administrators
              </h1>
              <p className="text-muted-foreground text-[10px] md:text-sm font-bold uppercase tracking-widest opacity-70 mt-1">
                Manage system access and roles for administrative staff
              </p>
            </div>
            
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Administrator
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleCreateAdmin}>
                  <DialogHeader>
                    <DialogTitle>New Administrator</DialogTitle>
                    <DialogDescription>
                      Create a new admin account. The user will be required to change their password on first login.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input 
                          id="firstName" 
                          placeholder="John" 
                          required 
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input 
                          id="lastName" 
                          placeholder="Doe" 
                          required 
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="relative">
                        <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email" 
                          type="email" 
                          placeholder="admin@shoreagents.com" 
                          className="pl-9"
                          required 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Temporary Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="password" 
                          type="password" 
                          placeholder="Minimum 8 characters" 
                          className="pl-9"
                          required 
                          minLength={8}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employeeSync">Link to Employee (Optional)</Label>
                      <Select 
                        onValueChange={(val) => {
                          const emp = employees.find(e => e.id === val)
                          if (emp) {
                            setFormData({
                              ...formData,
                              employeeId: emp.employee_id,
                              firstName: emp.first_name,
                              lastName: emp.last_name,
                              email: emp.email || ""
                            })
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an employee" />
                        </SelectTrigger>
                        <SelectContent>
                          {employees.map((emp) => (
                            <SelectItem key={emp.id} value={emp.id}>
                              {emp.first_name} {emp.last_name} ({emp.employee_id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">System Administrators</CardTitle>
              <CardDescription>
                Staff listed here have full control over assets, settings, and users.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Administrator</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Added On</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">
                          <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : admins.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                          No administrators found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      admins.map((admin) => (
                        <TableRow key={admin.id}>
                          <TableCell className="font-medium">
                            {admin.first_name || admin.last_name 
                              ? `${admin.first_name} ${admin.last_name}`.trim()
                              : "System Admin"
                            }
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {admin.email}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <ShieldCheck className="h-4 w-4 text-primary" />
                              <span className="capitalize">{admin.user_type}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(admin.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-muted-foreground hover:text-destructive"
                              onClick={() => setDeleteId(admin.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Administrator?</AlertDialogTitle>
              <AlertDialogDescription>
                This will revoke all administrative access for this user. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteAdmin}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isSubmitting ? "Removing..." : "Remove Access"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SidebarInset>
    </SidebarProvider>
  )
}
