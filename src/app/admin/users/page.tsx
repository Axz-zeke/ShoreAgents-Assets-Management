"use client"
import Link from "next/link"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSystemSettings } from "@/contexts/system-settings-context"
import { Shield, Users, AlertCircle, CheckCircle, UserPlus, Trash2, Mail, Calendar, RefreshCw } from "lucide-react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useUserProfile } from "@/hooks/use-user-profile"
import { getAllUsers, updateUserType, deleteUserProfile, type UserProfile, type UserType } from "@/lib/user-management"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"

export default function AdminUsersPage() {
  const { formatDate } = useSystemSettings()
  const { isAdmin, loading: profileLoading, profile: currentUserProfile } = useUserProfile()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [authUsers, setAuthUsers] = useState<Map<string, { email: string }>>(new Map())
  const [loading, setLoading] = useState(true)
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [newUserEmail, setNewUserEmail] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [newUserType, setNewUserType] = useState<UserType>("user")
  const [isCreatingUser, setIsCreatingUser] = useState(false)

  // Clear form when dialog opens
  const handleOpenDialog = (open: boolean) => {
    setAddUserOpen(open)
    if (open) {
      // Clear form fields when opening
      setNewUserEmail("")
      setNewUserPassword("")
      setNewUserType("user")
    }
  }
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (!profileLoading && !isAdmin) {
      router.push('/dashboard')
      toast.error('Access denied. Admin privileges required.')
    }
  }, [isAdmin, profileLoading, router])

  useEffect(() => {
    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin])

  const loadUsers = async () => {
    try {
      setLoading(true)
      
      // Get all user profiles
      const profiles = await getAllUsers()
      setUsers(profiles)

      // Get current auth user for reference
      const { data: { user } } = await supabase.auth.getUser()
      
      // For now, we'll only show the user ID
      // To get email addresses, you'd need to create a server-side API endpoint
      // that joins auth.users with public.users (requires service role key)
      const authUserMap = new Map<string, { email: string }>()
      
      // At least show the current user's email
      if (user) {
        authUserMap.set(user.id, { email: user.email || 'No email' })
      }
      
      setAuthUsers(authUserMap)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUserType = async (userId: string, newType: UserType) => {
    // Prevent changing own user type
    if (userId === currentUserProfile?.id) {
      toast.error("You cannot change your own user type")
      return
    }

    try {
      const success = await updateUserType(userId, newType)
      if (success) {
        toast.success(`User type updated to ${newType}`)
        loadUsers() // Reload the list
      } else {
        toast.error('Failed to update user type')
      }
    } catch (error) {
      console.error('Error updating user type:', error)
      toast.error('Failed to update user type')
    }
  }

  const handleAddUser = async () => {
    if (!newUserEmail || !newUserPassword) {
      toast.error("Please fill in all fields")
      return
    }

    if (newUserPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    try {
      setIsCreatingUser(true)

      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserEmail,
        password: newUserPassword,
        options: {
          data: {
            user_type: newUserType
          }
        }
      })

      if (authError) {
        toast.error(authError.message)
        return
      }

      if (!authData.user) {
        toast.error("Failed to create user")
        return
      }

      // The trigger should auto-create the user profile, but let's verify
      // Wait a moment for the trigger to execute
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Update the user type if it's not the default
      if (newUserType !== 'user') {
        await updateUserType(authData.user.id, newUserType)
      }

      toast.success(`User created successfully! ${authData.user.identities?.length === 0 ? '(Email confirmation required)' : ''}`)
      
      handleOpenDialog(false)
      
      loadUsers() // Reload the list
    } catch (error) {
      console.error('Error creating user:', error)
      toast.error('Failed to create user')
    } finally {
      setIsCreatingUser(false)
    }
  }

  const handleDeleteUser = async (userId: string, userEmail?: string) => {
    // Prevent deleting own account
    if (userId === currentUserProfile?.id) {
      toast.error("You cannot delete your own account")
      return
    }

    try {
      const success = await deleteUserProfile(userId)
      if (success) {
        toast.success(`User ${userEmail || userId} deleted successfully`)
        loadUsers() // Reload the list
      } else {
        toast.error('Failed to delete user')
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  if (profileLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2 text-muted-foreground">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild ><Link href="/dashboard">
                    ShoreAgents Assets
                  </Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink asChild ><Link href="/admin/users">
                    Admin
                  </Link></BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>User Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
        <Separator className="mt-0 mb-1" />

        <div className="flex flex-1 flex-col gap-4 p-2 sm:p-4 pt-2">
          {/* Page Header */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-6 w-6" />
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">User Management</h1>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage user roles and permissions
              </p>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Admin Access</AlertTitle>
            <AlertDescription>
              You are viewing this page with administrator privileges. Changes made here affect all users.
            </AlertDescription>
          </Alert>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                All Users ({users.length})
              </CardTitle>
              <CardDescription>
                View and manage user roles
              </CardDescription>
            </div>
            
            {/* Add User Button */}
            <Dialog open={addUserOpen} onOpenChange={handleOpenDialog}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Add New User
                  </DialogTitle>
                  <DialogDescription>
                    Create a new user account. They will receive an email confirmation.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">
                      <Mail className="h-4 w-4 inline mr-1" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@example.com"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      disabled={isCreatingUser}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={newUserPassword}
                      onChange={(e) => setNewUserPassword(e.target.value)}
                      disabled={isCreatingUser}
                      autoComplete="new-password"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="userType">
                      <Shield className="h-4 w-4 inline mr-1" />
                      User Type
                    </Label>
                    <Select
                      value={newUserType}
                      onValueChange={(value: UserType) => setNewUserType(value)}
                      disabled={isCreatingUser}
                    >
                      <SelectTrigger id="userType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => handleOpenDialog(false)}
                    disabled={isCreatingUser}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddUser}
                    disabled={isCreatingUser}
                  >
                    {isCreatingUser ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Change Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs">
                      {user.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>
                      {authUsers.get(user.id)?.email || <span className="text-muted-foreground text-xs">User ID: {user.id.substring(0, 13)}...</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.user_type === 'admin' ? 'default' : 'secondary'}>
                        {user.user_type === 'admin' ? (
                          <><Shield className="h-3 w-3 mr-1" /> Admin</>
                        ) : (
                          <><CheckCircle className="h-3 w-3 mr-1" /> User</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(user.created_at)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={user.user_type}
                        onValueChange={(value: UserType) => handleUpdateUserType(user.id, value)}
                        disabled={user.id === currentUserProfile?.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={user.id === currentUserProfile?.id}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the user <strong>{authUsers.get(user.id)?.email || user.id}</strong>.
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id, authUsers.get(user.id)?.email)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete User
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}


